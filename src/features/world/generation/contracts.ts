import { z } from "zod";

export const GENERATION_SCHEMA_VERSION = 1 as const;

const nonBlank = z.string().trim().min(1);
const strictObject = <T extends z.ZodRawShape>(shape: T) => z.object(shape).strict();

export const RelationshipDimensionSchema = z.enum([
	"friendship",
	"rivalry",
	"familiarity",
]);

export const PermittedRelationshipEffectSchema = strictObject({
	residentAId: nonBlank,
	residentBId: nonBlank,
	dimension: RelationshipDimensionSchema,
});

export const AcceptedRelationshipEffectSchema = strictObject({
	effectOrdinal: z.number().int().nonnegative(),
	residentAId: nonBlank,
	residentBId: nonBlank,
	dimension: RelationshipDimensionSchema,
	delta: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export const TurnProvenanceSchema = strictObject({
	generationId: nonBlank,
	requestedModelId: nonBlank,
	canonicalModelId: nonBlank,
	selectedModelId: nonBlank,
	selectedUpstream: nonBlank,
	strategy: z.literal("direct"),
	routeAttempt: z.literal(1),
	pipeline: z.tuple([]),
	usage: strictObject({
		inputTokens: z.number().int().nonnegative(),
		outputTokens: z.number().int().nonnegative(),
		cost: z.number().nonnegative().optional(),
	}),
	warningCodes: z.array(nonBlank).max(20),
	filterStatus: z.enum(["clear", "filtered"]),
});

export const SceneBriefSchema = strictObject({
	schemaVersion: z.literal(GENERATION_SCHEMA_VERSION),
	briefId: nonBlank.default("legacy-tracer"),
	sceneKey: nonBlank,
	expectedWorldHead: z.number().int().positive(),
	participantIds: z.array(nonBlank).min(2).max(3).refine((ids) => new Set(ids).size === ids.length),
	speakerOrder: z.array(nonBlank).min(4).max(10),
	locationId: nonBlank,
	premise: nonBlank,
	allowedFactIds: z.array(nonBlank).max(24),
	tone: nonBlank,
	turnBudget: z.number().int().min(4).max(10),
	permittedOutcome: nonBlank,
	permittedRelationshipEffects: z
		.array(PermittedRelationshipEffectSchema)
		.max(4)
		.default([]),
}).superRefine((brief, context) => {
	if (brief.speakerOrder.length !== brief.turnBudget) context.addIssue({ code: "custom", message: "speakerOrder must match turnBudget", path: ["speakerOrder"] });
	for (const residentId of brief.speakerOrder) if (!brief.participantIds.includes(residentId)) context.addIssue({ code: "custom", message: "speakerOrder may name only participants", path: ["speakerOrder"] });
});

export const ResidentTurnSchema = strictObject({
	turnIndex: z.number().int().nonnegative(),
	residentId: nonBlank,
	requestedModelId: nonBlank,
	text: nonBlank.max(960),
	approvedClaimIds: z.array(nonBlank).max(3).default([]),
	provenance: TurnProvenanceSchema.optional(),
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
	disposition: z.enum([
		"pending",
		"accepted",
		"schema_rejected",
		"identity_rejected",
		"fact_rejected",
		"safety_rejected",
		"refused",
		"provider_outage",
		"provider_failed",
		"publication_failed",
		"timed_out",
		"stale_world",
		"duplicate",
	]),
	identityEvidence: z.enum([
		"openrouter_verified",
		"provider_response",
		"provider_model_lookup",
		"requested_only",
	]),
	providerResponseId: nonBlank.optional(),
	adapterVersion: nonBlank,
	configurationVersion: nonBlank,
	promptVersion: nonBlank,
	bibleVersionKey: nonBlank,
	claimVersionKey: nonBlank,
	finishReason: nonBlank,
	usage: strictObject({ inputTokens: z.number().int().nonnegative(), outputTokens: z.number().int().nonnegative() }),
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
	relationshipEffects: z
		.array(AcceptedRelationshipEffectSchema)
		.max(4)
		.default([]),
	sharedExperience: strictObject({
		summary: nonBlank.max(240),
		tags: z.array(nonBlank.max(40)).max(8),
	}).optional(),
});

export type SceneBrief = z.infer<typeof SceneBriefSchema>;
export type ResidentTurn = z.infer<typeof ResidentTurnSchema>;
export type TurnProvenance = z.infer<typeof TurnProvenanceSchema>;
export type GenerationAttempt = z.infer<typeof GenerationAttemptSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;
export type PublishedSceneRevision = z.infer<typeof PublishedSceneRevisionSchema>;
