import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";
import { buildResidentPrompt } from "./build-resident-prompt.ts";
import { validateOpenRouterMetadata } from "./openrouter-metadata.ts";
import { providerProfileFor } from "./provider-registry.ts";
import type {
	ProviderTurnResponse,
	ResidentTurnProvider,
} from "./resident-turn-provider.ts";

const ModelTurnOutputSchema = z
	.object({
		text: z.string().trim().min(1).max(240),
		approvedClaimIds: z.array(z.string().trim().min(1)).max(3),
		proposedRelationshipEffects: z.array(z.never()).max(0),
		endsScene: z.boolean(),
	})
	.strict();

type RouterFactory = (
	configuration: {
		apiKey: string;
		headers: { "X-OpenRouter-Metadata": "enabled" };
	},
) => (modelId: string, settings: Record<string, unknown>) => unknown;

type GenerateResult = {
	output: unknown;
	response: { id?: string; modelId: string; body?: unknown };
	providerMetadata?: unknown;
	finishReason: unknown;
	usage: { inputTokens: number; outputTokens: number };
};

type Generate = (options: Record<string, unknown>) => Promise<GenerateResult>;

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
			throw new Error("OPENROUTER_API_KEY is required for live resident generation.");
		}
		const routerFactory =
			options?.createRouter ?? (createOpenRouter as unknown as RouterFactory);
		this.router = routerFactory({
			apiKey,
			headers: { "X-OpenRouter-Metadata": "enabled" },
		});
		this.generate = options?.generateText ?? (generateText as unknown as Generate);
	}

	async generateTurn(
		input: Parameters<ResidentTurnProvider["generateTurn"]>[0],
	): Promise<ProviderTurnResponse> {
		const profile = providerProfileFor(input.residentId);
		if (input.requestedModelId !== profile.requestedModelId) {
			throw new Error("Requested model does not match the approved resident profile.");
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
		});
		const prompts = buildResidentPrompt({
			brief: input.brief,
			residentId: input.residentId,
			residentGuidance:
				input.residentGuidance ?? "Write one brief, grounded dialogue turn.",
			allowedClaims: input.allowedClaims ?? [],
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
			output: Output.object({ schema: ModelTurnOutputSchema }),
			maxOutputTokens: 180,
			maxRetries: 0,
			timeout: { totalMs: 30_000 },
			include: { responseBody: true },
			experimental_telemetry: {
				isEnabled: true,
				functionId: "resident-turn",
				recordInputs: false,
				recordOutputs: false,
				metadata: { residentId: input.residentId },
			},
		});
		const output = ModelTurnOutputSchema.parse(result.output);
		const responseBody = result.response.body as
			| { openrouter_metadata?: unknown }
			| undefined;
		const evidence = validateOpenRouterMetadata({
			profile,
			generationId: result.response.id,
			responseModelId: result.response.modelId,
			metadata: responseBody?.openrouter_metadata,
		});

		return {
			text: output.text,
			providerResponseId: evidence.generationId,
			observedModelId: evidence.selectedModelId,
			identityEvidence: evidence.evidenceKind,
			finishReason:
				typeof result.finishReason === "string"
					? result.finishReason
					: JSON.stringify(result.finishReason),
			usage: result.usage,
		};
	}
}
