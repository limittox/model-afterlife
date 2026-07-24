import { desc, eq } from "drizzle-orm";
import { task } from "@trigger.dev/sdk";
import { ZodError } from "zod";
import { createWorldDatabase } from "../db/client.ts";
import {
	generationAttempts,
	sceneBriefs,
	sceneValidationResults,
} from "../db/schema.ts";
import { conductSceneAttempt } from "../features/world/generation/conduct-scene.ts";
import {
	GenerationAttemptSchema,
	SceneBriefSchema,
	ValidationResultSchema,
} from "../features/world/generation/contracts.ts";
import { OpenRouterResidentTurnProvider } from "../features/world/generation/openrouter-resident-turn-provider.ts";
import { providerProfileFor } from "../features/world/generation/provider-registry.ts";
import {
	runGenerationRequest,
	type GenerationRequestDependencies,
} from "../features/world/generation/run-generation-request.ts";
import { validateSceneCandidate } from "../features/world/generation/validate-scene-candidate.ts";
import type { ResidentTurnProvider } from "../features/world/generation/resident-turn-provider.ts";
import type { CommittedGenerationRequest } from "../features/world/server/advance-world-to.ts";
import { persistGenerationAttempt } from "../features/world/server/persist-generation-attempt.ts";
import { publishSceneRevision } from "../features/world/server/publish-scene-revision.ts";
import { readCachedScene } from "../features/world/server/read-cached-scene.ts";
import { readCanonicalHead } from "../features/world/server/world-repository.ts";
import { resolveGenerationContinuity } from "../features/world/server/resolve-generation-continuity.ts";
import { CANONICAL_WORLD_ID } from "../features/world/server/seed-data.ts";
import type { GenerationTelemetry } from "../observability/redaction.ts";
import type { SemanticGateEvidence } from "../features/world/generation/semantic-judge.ts";

export const GENERATE_SCENE_TASK_ID = "model-afterlife-generate-scene";
export const GENERATE_SCENE_MAX_DURATION = 240;
export const GENERATE_SCENE_RETRY = {
	maxAttempts: 3,
	minTimeoutInMs: 1_000,
	maxTimeoutInMs: 10_000,
	factor: 2,
	randomize: false,
} as const;

type PersistAttempt = typeof persistGenerationAttempt;

type ProductionOverrides = {
	loadBrief?: GenerationRequestDependencies["loadBrief"];
	provider?: ResidentTurnProvider;
	persistAttempt?: PersistAttempt;
	publish?: GenerationRequestDependencies["publish"];
	resolveContinuity?: GenerationRequestDependencies["resolveContinuity"];
	telemetry?: { record: (event: GenerationTelemetry) => void };
	semanticGateEvidence?: SemanticGateEvidence;
};

function validationDisposition(code: string) {
	if (code.startsWith("identity.")) return "identity_rejected" as const;
	if (code.startsWith("claims.")) return "fact_rejected" as const;
	if (
		code.startsWith("instruction-boundary.") ||
		code.startsWith("public-safety.")
	) {
		return "safety_rejected" as const;
	}
	return "schema_rejected" as const;
}

async function loadPersistedBrief(request: CommittedGenerationRequest) {
	const { db, close } = createWorldDatabase();
	try {
		const [row] = await db
			.select({ brief: sceneBriefs.brief })
			.from(sceneBriefs)
			.where(eq(sceneBriefs.sceneKey, request.sceneKey))
			.limit(1);
		if (!row) {
			throw new Error(`No approved immutable brief exists for ${request.sceneKey}.`);
		}
		return SceneBriefSchema.parse(row.brief);
	} finally {
		await close();
	}
}

export function classifyProviderFailure(
	error: unknown,
):
	| "timed_out"
	| "refused"
	| "provider_outage"
	| "provider_failed" {
	const message =
		error instanceof Error
			? `${error.name} ${error.message}`.toLowerCase()
			: String(error).toLowerCase();
	if (/timeout|timed out|aborterror/.test(message)) return "timed_out";
	if (/refus|filtered|content filter|safety block/.test(message)) {
		return "refused";
	}
	if (
		/\b(?:429|500|502|503|504)\b|outage|unavailable|connection reset|econnreset/.test(
			message,
		)
	) {
		return "provider_outage";
	}
	return "provider_failed";
}

async function recordPersistentContinuity(
	input: Parameters<
		GenerationRequestDependencies["resolveContinuity"]
	>[0],
) {
	const { db, close } = createWorldDatabase();
	try {
		const [latest] = await db
			.select({ attemptId: generationAttempts.attemptId })
			.from(generationAttempts)
			.where(eq(generationAttempts.sceneKey, input.sceneKey))
			.orderBy(desc(generationAttempts.attemptOrdinal))
			.limit(1);
		if (!latest) {
			throw new Error("A quiet generation disposition requires a persisted attempt.");
		}
		await db
			.insert(sceneValidationResults)
			.values({
				validationId: `${latest.attemptId}:${input.terminalDisposition}`,
				attemptId: latest.attemptId,
				validatorId: "continuity",
				validatorVersion: "phase-02-continuity-v1",
				accepted: false,
				code: input.terminalDisposition,
				detail: `Attempt dispositions: ${input.attemptDispositions.join(", ")}.`,
			})
			.onConflictDoNothing();
	} finally {
		await close();
	}
	const head = await readCanonicalHead(CANONICAL_WORLD_ID);
	const cachedScene =
		input.terminalDisposition === "stale_world"
			? null
			: await readCachedScene({
					worldId: CANONICAL_WORLD_ID,
					failedBrief: input.brief,
					startedAtTick: head.state.logicalTick,
				});
	const resolved = await resolveGenerationContinuity({
		worldId: CANONICAL_WORLD_ID,
		sceneKey: input.sceneKey,
		disposition:
			input.terminalDisposition === "stale_world"
				? "stale_world"
				: cachedScene
					? "cached"
					: "quiet",
		...(cachedScene ? { cachedScene } : {}),
	});
	return {
		mode: resolved.mode,
		...(cachedScene
			? { cachedRevisionId: cachedScene.originalRevisionId }
			: {}),
	};
}

export function createProductionGenerationDependencies(
	overrides: ProductionOverrides = {},
): GenerationRequestDependencies {
	const persistAttempt = overrides.persistAttempt ?? persistGenerationAttempt;
	const telemetry = overrides.telemetry;
	let provider = overrides.provider;
	const residentProvider = () => {
		provider ??= new OpenRouterResidentTurnProvider();
		return provider;
	};

	return {
		loadBrief: overrides.loadBrief ?? loadPersistedBrief,
		runAttempt: async ({ brief, attemptOrdinal }) => {
			const attemptId = `${brief.sceneKey}:attempt:${attemptOrdinal}`;
			try {
				const conducted = await conductSceneAttempt({
					brief,
					attemptId,
					attemptOrdinal,
					provider: residentProvider(),
					modelForResident: (residentId) =>
						providerProfileFor(residentId).requestedModelId,
				});
				const validation = validateSceneCandidate({
					brief,
					attempt: conducted.attempt,
					turns: conducted.turns,
					revisionId: `${brief.sceneKey}:revision:${attemptOrdinal}`,
					semanticGateEvidence: overrides.semanticGateEvidence,
				});
				conducted.attempt.disposition = validation.result.accepted
					? "accepted"
					: validationDisposition(validation.result.code);
				await persistAttempt({
					worldId: CANONICAL_WORLD_ID,
					brief,
					attempt: conducted.attempt,
					turns: conducted.turns,
					result: validation.result,
					validatorResults: validation.manifest.results,
				});
				for (const turn of conducted.turns) {
					const profile = providerProfileFor(turn.residentId);
					telemetry?.record({
						attemptId: conducted.attempt.attemptId,
						sceneKey: brief.sceneKey,
						residentId: turn.residentId,
						requestedModelId: turn.requestedModelId,
						resolvedModelId: turn.provenance?.selectedModelId,
						provider: "openrouter",
						upstream: profile.selectedUpstreamName,
						promptVersion: conducted.attempt.promptVersion,
						disposition: conducted.attempt.disposition,
						latencyMs: 0,
						inputTokens: turn.provenance?.usage.inputTokens ?? 0,
						outputTokens: turn.provenance?.usage.outputTokens ?? 0,
						costUsd: turn.provenance?.usage.cost,
					});
				}
				if (!validation.acceptedCandidate) {
					return {
						status: "rejected" as const,
					disposition: conducted.attempt.disposition as
							| "schema_rejected"
							| "identity_rejected"
							| "fact_rejected"
							| "safety_rejected",
					};
				}
				return {
					status: "accepted" as const,
					candidate: validation.acceptedCandidate,
				};
			} catch (error) {
				const disposition =
					error instanceof ZodError
						? ("schema_rejected" as const)
						: classifyProviderFailure(error);
				const attempt = GenerationAttemptSchema.parse({
					attemptId,
					sceneKey: brief.sceneKey,
					attemptOrdinal,
					disposition,
					identityEvidence: "requested_only",
					adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
					configurationVersion: "strict-openrouter-v1",
					promptVersion: "resident-turn-v1",
					bibleVersionKey: "phase-02-tracer-v1",
					claimVersionKey: "phase-02-tracer-v1",
					finishReason: disposition,
					usage: { inputTokens: 0, outputTokens: 0 },
				});
				const result = ValidationResultSchema.parse({
					attemptId,
					accepted: false,
					code: disposition,
					detail: "The resident provider call failed before a complete candidate existed.",
				});
				await persistAttempt({
					worldId: CANONICAL_WORLD_ID,
					brief,
					attempt,
					turns: [],
					result,
				});
				telemetry?.record({
					attemptId,
					sceneKey: brief.sceneKey,
					provider: "openrouter",
					promptVersion: attempt.promptVersion,
					disposition,
					latencyMs: 0,
					inputTokens: 0,
					outputTokens: 0,
				});
				return { status: "rejected" as const, disposition };
			}
		},
		publish:
			overrides.publish ??
			((revision) => publishSceneRevision(CANONICAL_WORLD_ID, revision)),
		resolveContinuity:
			overrides.resolveContinuity ?? recordPersistentContinuity,
	};
}

export async function runGenerateScene(
	payload: CommittedGenerationRequest,
	dependencies: GenerationRequestDependencies =
		createProductionGenerationDependencies(),
) {
	return runGenerationRequest(payload, dependencies);
}

export const generateScene = task({
	id: GENERATE_SCENE_TASK_ID,
	maxDuration: GENERATE_SCENE_MAX_DURATION,
	retry: GENERATE_SCENE_RETRY,
	queue: {
		name: "resident-scene-generation",
		concurrencyLimit: 1,
	},
	run: async (payload: CommittedGenerationRequest) => runGenerateScene(payload),
});
