import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";
import {
	buildLaunchResidentPrompt,
	RESIDENT_TURN_PROMPT_VERSION,
} from "./build-resident-prompt.ts";
import { validateOpenRouterMetadata } from "./openrouter-metadata.ts";
import { providerProfileFor } from "./provider-registry.ts";
import type {
	ProviderTurnResponse,
	ResidentTurnProvider,
} from "./resident-turn-provider.ts";

const graphemeSegmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

const ModelTurnOutputSchema = z
	.object({
		text: z
			.string()
			.trim()
			.min(1)
			.max(960)
			.refine(
				(text) => [...graphemeSegmenter.segment(text)].length <= 240,
				"Turn text must contain at most 240 Unicode graphemes.",
			),
		approvedClaimIds: z.array(z.string().trim().min(1)).max(3),
		proposedRelationshipEffects: z.array(z.string()).max(0),
		endsScene: z.boolean(),
	})
	.strict();

const ModelTurnWireOutputSchema = z
	.object({
		text: z.string(),
		approvedClaimIds: z.array(z.string()),
		endsScene: z.boolean(),
	})
	.strict();

type RouterFactory = (configuration: {
	apiKey: string;
	headers: { "X-OpenRouter-Metadata": "enabled" };
}) => (modelId: string, settings: Record<string, unknown>) => unknown;

type GenerateResult = {
	output: unknown;
	response: { id?: string; modelId: string; body?: unknown };
	providerMetadata?: unknown;
	finishReason: unknown;
	usage: { inputTokens?: number; outputTokens?: number };
	warnings?: unknown[];
};

type Generate = (options: Record<string, unknown>) => Promise<GenerateResult>;

function finishReasonFor(value: unknown): string {
	if (typeof value === "string") return value;
	if (value && typeof value === "object") {
		const record = value as Record<string, unknown>;
		if (typeof record.unified === "string") return record.unified;
		if (typeof record.raw === "string") return record.raw;
	}
	return JSON.stringify(value);
}

function warningCodesFor(warnings: unknown[] | undefined): string[] {
	return (warnings ?? []).map((warning) => {
		if (warning && typeof warning === "object") {
			const type = (warning as Record<string, unknown>).type;
			if (typeof type === "string" && type.trim()) return type;
		}
		return "provider-warning";
	});
}

function costFromProviderMetadata(metadata: unknown): number | undefined {
	if (!metadata || typeof metadata !== "object") return undefined;
	const openrouter = (metadata as Record<string, unknown>).openrouter;
	if (!openrouter || typeof openrouter !== "object") return undefined;
	const usage = (openrouter as Record<string, unknown>).usage;
	if (!usage || typeof usage !== "object") return undefined;
	const cost = (usage as Record<string, unknown>).cost;
	return typeof cost === "number" && Number.isFinite(cost) ? cost : undefined;
}

export class OpenRouterResidentTurnProvider implements ResidentTurnProvider {
	private readonly router: ReturnType<RouterFactory>;
	private readonly generate: Generate;

	constructor(options?: {
		apiKey?: string;
		createRouter?: RouterFactory;
		generateText?: Generate;
	}) {
		const apiKey = options?.apiKey ?? process.env.OPENROUTER_API_KEY;
		if (!apiKey) {
			throw new Error(
				"OPENROUTER_API_KEY is required for live resident generation.",
			);
		}
		const routerFactory =
			options?.createRouter ?? (createOpenRouter as unknown as RouterFactory);
		this.router = routerFactory({
			apiKey,
			headers: { "X-OpenRouter-Metadata": "enabled" },
		});
		this.generate =
			options?.generateText ?? (generateText as unknown as Generate);
	}

	async generateTurn(
		input: Parameters<ResidentTurnProvider["generateTurn"]>[0],
	): Promise<ProviderTurnResponse> {
		const profile = providerProfileFor(input.residentId);
		if (input.requestedModelId !== profile.requestedModelId) {
			throw new Error(
				"Requested model does not match the approved resident profile.",
			);
		}

		const provider = {
			only: [profile.approvedUpstream],
			allow_fallbacks: false,
			require_parameters: true,
			data_collection: "deny",
			...(profile.requiredQuantization
				? { quantizations: [profile.requiredQuantization] }
				: {}),
		};
		const model = this.router(profile.requestedModelId, {
			extraBody: { provider },
			...(profile.reasoning ? { reasoning: profile.reasoning } : {}),
		});
		const prompts = buildLaunchResidentPrompt({
			brief: input.brief,
			residentId: input.residentId,
			relationships: input.relationships ?? [],
			memories: input.memories ?? [],
			priorTurns: input.priorTurns.map((text, index) => ({
				residentId: input.brief.speakerOrder[index] ?? "unknown",
				text,
			})),
		});

		const result = await this.generate({
			model,
			system: prompts.system,
			prompt: prompts.prompt,
			output: Output.object({ schema: ModelTurnWireOutputSchema }),
			maxOutputTokens: profile.maxOutputTokens,
			maxRetries: 0,
			timeout: { totalMs: 30_000 },
			include: { responseBody: true },
			experimental_telemetry: {
				isEnabled: true,
				functionId: "resident-turn",
				recordInputs: false,
				recordOutputs: false,
				metadata: {
					residentId: input.residentId,
					promptVersion: RESIDENT_TURN_PROMPT_VERSION,
				},
			},
		});
		const wireOutput = ModelTurnWireOutputSchema.parse(result.output);
		const output = ModelTurnOutputSchema.parse({
			...wireOutput,
			proposedRelationshipEffects: [],
		});
		if (
			output.approvedClaimIds.some(
				(claimId) => !prompts.approvedClaimIds.includes(claimId),
			)
		) {
			throw new Error(
				"Resident turn referenced a claim outside its active approved context.",
			);
		}
		const responseBody = result.response.body as
			| { openrouter_metadata?: unknown }
			| undefined;
		const evidence = validateOpenRouterMetadata({
			profile,
			generationId: result.response.id,
			responseModelId: result.response.modelId,
			metadata: responseBody?.openrouter_metadata,
		});

		const finishReason = finishReasonFor(result.finishReason);
		const usage = {
			inputTokens: result.usage.inputTokens ?? 0,
			outputTokens: result.usage.outputTokens ?? 0,
		};
		const cost = costFromProviderMetadata(result.providerMetadata);
		return {
			text: output.text,
			approvedClaimIds: output.approvedClaimIds,
			providerResponseId: evidence.generationId,
			observedModelId: evidence.selectedModelId,
			identityEvidence: evidence.evidenceKind,
			finishReason,
			usage,
			provenance: {
				generationId: evidence.generationId,
				requestedModelId: evidence.requestedModelId,
				canonicalModelId: evidence.canonicalModelId,
				selectedModelId: evidence.selectedModelId,
				selectedUpstream: evidence.selectedUpstream,
				strategy: evidence.strategy,
				routeAttempt: evidence.routeAttempt,
				pipeline: [],
				usage: { ...usage, ...(cost === undefined ? {} : { cost }) },
				warningCodes: warningCodesFor(result.warnings),
				filterStatus:
					finishReason === "content-filter" || finishReason === "content_filter"
						? "filtered"
						: "clear",
			},
		};
	}
}
