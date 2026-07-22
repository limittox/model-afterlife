import { desc, eq } from "drizzle-orm";
import { task } from "@trigger.dev/sdk";
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
import { validateTracerCandidate } from "../features/world/generation/validate-tracer-candidate.ts";
import type { ResidentTurnProvider } from "../features/world/generation/resident-turn-provider.ts";
import type { CommittedGenerationRequest } from "../features/world/server/advance-world-to.ts";
import { persistGenerationAttempt } from "../features/world/server/persist-generation-attempt.ts";
import { publishSceneRevision } from "../features/world/server/publish-scene-revision.ts";
import { CANONICAL_WORLD_ID } from "../features/world/server/seed-data.ts";

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
	recordQuiet?: GenerationRequestDependencies["recordQuiet"];
};

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

async function recordPersistentQuiet(input: Parameters<GenerationRequestDependencies["recordQuiet"]>[0]) {
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
				validationId: `${latest.attemptId}:${input.disposition}`,
				attemptId: latest.attemptId,
				accepted: false,
				code: input.disposition,
				detail: `Attempt dispositions: ${input.attemptDispositions.join(", ")}.`,
			})
			.onConflictDoNothing();
	} finally {
		await close();
	}
}

export function createProductionGenerationDependencies(
	overrides: ProductionOverrides = {},
): GenerationRequestDependencies {
	const persistAttempt = overrides.persistAttempt ?? persistGenerationAttempt;
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
				const validation = validateTracerCandidate({
					brief,
					attempt: conducted.attempt,
					turns: conducted.turns,
					revisionId: `${brief.sceneKey}:revision:${attemptOrdinal}`,
				});
				conducted.attempt.disposition = validation.result.accepted
					? "accepted"
					: validation.result.code === "identity"
						? "identity_rejected"
						: "schema_rejected";
				await persistAttempt({
					worldId: CANONICAL_WORLD_ID,
					brief,
					attempt: conducted.attempt,
					turns: conducted.turns,
					result: validation.result,
				});
				if (!validation.revision) {
					return {
						status: "rejected" as const,
						disposition: conducted.attempt.disposition as
							| "schema_rejected"
							| "identity_rejected",
					};
				}
				return { status: "accepted" as const, revision: validation.revision };
			} catch {
				const attempt = GenerationAttemptSchema.parse({
					attemptId,
					sceneKey: brief.sceneKey,
					attemptOrdinal,
					disposition: "provider_failed",
					identityEvidence: "requested_only",
					adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
					configurationVersion: "strict-openrouter-v1",
					promptVersion: "resident-turn-v1",
					bibleVersionKey: "phase-02-tracer-v1",
					claimVersionKey: "phase-02-tracer-v1",
					finishReason: "provider_error",
					usage: { inputTokens: 0, outputTokens: 0 },
				});
				const result = ValidationResultSchema.parse({
					attemptId,
					accepted: false,
					code: "provider_failed",
					detail: "The resident provider call failed before a complete candidate existed.",
				});
				await persistAttempt({
					worldId: CANONICAL_WORLD_ID,
					brief,
					attempt,
					turns: [],
					result,
				});
				return { status: "rejected" as const, disposition: "provider_failed" as const };
			}
		},
		publish:
			overrides.publish ??
			((revision) => publishSceneRevision(CANONICAL_WORLD_ID, revision)),
		recordQuiet: overrides.recordQuiet ?? recordPersistentQuiet,
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
