import { z } from "zod";

export const GENERATION_SCHEMA_VERSION = 1 as const;

const nonBlank = z.string().trim().min(1);
const strictObject = <T extends z.ZodRawShape>(shape: T) => z.object(shape).strict();

export const SceneBriefSchema = strictObject({
	schemaVersion: z.literal(GENERATION_SCHEMA_VERSION),
	sceneKey: nonBlank,
	expectedWorldHead: z.number().int().positive(),
	participantIds: z.array(nonBlank).min(2).max(3).refine((ids) => new Set(ids).size === ids.length),
	speakerOrder: z.array(nonBlank).min(4).max(10),
	locationId: nonBlank,
	premise: nonBlank,
	allowedFactIds: z.array(nonBlank).min(1),
	tone: nonBlank,
	turnBudget: z.number().int().min(4).max(10),
	permittedOutcome: nonBlank,
});

export const ResidentTurnSchema = strictObject({
	turnIndex: z.number().int().nonnegative(),
	residentId: nonBlank,
	requestedModelId: nonBlank,
	text: nonBlank.max(240),
	ending: z.boolean(),
	effects: z.array(strictObject({
		occurrenceKey: nonBlank,
		residentAId: nonBlank,
		residentBId: nonBlank,
		delta: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
	})),
});

export const GenerationAttemptSchema = strictObject({
	attemptId: nonBlank,
	sceneKey: nonBlank,
	attemptOrdinal: z.number().int().positive(),
	disposition: z.enum(["pending", "accepted", "schema_rejected", "identity_rejected", "timed_out", "stale_world", "duplicate"]),
	identityEvidence: z.enum(["provider_response", "provider_model_lookup", "requested_only"]),
	providerResponseId: nonBlank.optional(),
});

export const ValidationResultSchema = strictObject({
	attemptId: nonBlank,
	accepted: z.boolean(),
	code: nonBlank,
	detail: nonBlank,
});

export const PublishedSceneRevisionSchema = strictObject({
	revisionId: nonBlank,
	attemptId: nonBlank,
	sceneKey: nonBlank,
	expectedWorldHead: z.number().int().positive(),
	turns: z.array(ResidentTurnSchema).min(4).max(10),
});

export type SceneBrief = z.infer<typeof SceneBriefSchema>;
export type ResidentTurn = z.infer<typeof ResidentTurnSchema>;
export type GenerationAttempt = z.infer<typeof GenerationAttemptSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type PublishedSceneRevision = z.infer<typeof PublishedSceneRevisionSchema>;
