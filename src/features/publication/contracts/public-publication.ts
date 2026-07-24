import { z } from "zod";

const nonBlank = z.string().trim().min(1);
const strictObject = <T extends z.ZodRawShape>(shape: T) =>
	z.object(shape).strict();

export const CanonicalRevisionIdSchema = z
	.string()
	.trim()
	.min(1)
	.max(160)
	.regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/u)
	.refine((revisionId) => !revisionId.startsWith("cached:"), {
		message: "Synthetic cached presentation IDs are not canonical revisions.",
	});

export function canonicalScenePath(revisionId: string): string | null {
	const parsed = CanonicalRevisionIdSchema.safeParse(revisionId);
	return parsed.success ? `/scenes/${encodeURIComponent(parsed.data)}` : null;
}

export function residentProfilePath(residentId: string): string {
	return `/residents/${encodeURIComponent(residentId)}`;
}

export const CanonicalSceneCastMemberSchema = strictObject({
	residentId: nonBlank,
	displayName: nonBlank,
	profilePath: z.string().startsWith("/residents/"),
	exactModelId: nonBlank,
});

export const CanonicalSceneTurnSchema = strictObject({
	turnIndex: z.number().int().nonnegative(),
	speakerId: nonBlank,
	speakerName: nonBlank,
	speakerProfilePath: z.string().startsWith("/residents/"),
	exactModelId: nonBlank,
	text: nonBlank.max(960),
	claimVersionIds: z.array(nonBlank).max(3),
});

export const CanonicalHistoricalContextSchema = strictObject({
	turnIndex: z.number().int().nonnegative(),
	residentId: nonBlank,
	residentName: nonBlank,
	residentProfilePath: z.string().startsWith("/residents/"),
	claimId: nonBlank,
	claimVersionId: nonBlank,
	stableOrder: z.number().int().positive(),
	category: z.enum(["documented", "reported", "exaggeration"]),
	categoryLabel: z.enum([
		"Documented",
		"Reported or reputation-based",
		"Fictional exaggeration",
	]),
	statement: nonBlank,
	confidence: z.enum(["high", "medium"]),
	source: strictObject({
		title: nonBlank,
		url: z
			.string()
			.url()
			.refine((url) => url.startsWith("https://"), {
				message: "Historical sources must use HTTPS.",
			}),
		accessedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
	}),
});

export const CanonicalRelationshipChangeSchema = strictObject({
	residentAId: nonBlank,
	residentAName: nonBlank,
	residentAProfilePath: z.string().startsWith("/residents/"),
	residentBId: nonBlank,
	residentBName: nonBlank,
	residentBProfilePath: z.string().startsWith("/residents/"),
	dimension: z.enum(["friendship", "rivalry", "familiarity"]),
	description: nonBlank,
});

export const CanonicalSceneSchema = strictObject({
	revisionId: CanonicalRevisionIdSchema,
	canonicalPath: z.string().startsWith("/scenes/"),
	publicationSequence: z.number().int().positive(),
	premise: nonBlank,
	cast: z.array(CanonicalSceneCastMemberSchema).min(2).max(3),
	home: strictObject({
		logicalTick: z.number().int().nonnegative(),
		homeDay: z.number().int().positive(),
		homeTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/u),
		dayPeriod: z.enum(["morning", "afternoon", "evening", "night"]),
	}),
	location: strictObject({
		id: nonBlank,
		name: nonBlank,
	}),
	turns: z.array(CanonicalSceneTurnSchema).min(4).max(10),
	outcome: strictObject({
		summary: nonBlank,
		sharedExperience: nonBlank.nullable(),
		relationshipChanges: z.array(CanonicalRelationshipChangeSchema).max(4),
	}),
	historicalContext: z.array(CanonicalHistoricalContextSchema),
	disclosures: strictObject({
		stagedFiction: nonBlank,
		aiAuthorship: nonBlank,
		exactModelIds: z.array(nonBlank).min(1).max(3),
		nonAffiliation: nonBlank,
	}),
}).superRefine((scene, context) => {
	if (scene.canonicalPath !== canonicalScenePath(scene.revisionId)) {
		context.addIssue({
			code: "custom",
			path: ["canonicalPath"],
			message: "Canonical path must derive from the immutable revision ID.",
		});
	}

	const castByResident = new Map(
		scene.cast.map((resident) => [resident.residentId, resident]),
	);
	if (castByResident.size !== scene.cast.length) {
		context.addIssue({
			code: "custom",
			path: ["cast"],
			message: "Canonical cast residents must be unique.",
		});
	}

	for (const [index, turn] of scene.turns.entries()) {
		const resident = castByResident.get(turn.speakerId);
		if (turn.turnIndex !== index) {
			context.addIssue({
				code: "custom",
				path: ["turns", index, "turnIndex"],
				message: "Canonical turns must be complete and contiguous.",
			});
		}
		if (
			!resident ||
			resident.displayName !== turn.speakerName ||
			resident.profilePath !== turn.speakerProfilePath ||
			resident.exactModelId !== turn.exactModelId
		) {
			context.addIssue({
				code: "custom",
				path: ["turns", index],
				message: "Every turn must match one exact canonical cast identity.",
			});
		}
		if (new Set(turn.claimVersionIds).size !== turn.claimVersionIds.length) {
			context.addIssue({
				code: "custom",
				path: ["turns", index, "claimVersionIds"],
				message: "Turn claim-version bindings must be unique.",
			});
		}
	}

	let previousContextKey = "";
	for (const [index, item] of scene.historicalContext.entries()) {
		const resident = castByResident.get(item.residentId);
		const turn = scene.turns[item.turnIndex];
		const currentContextKey = [
			String(item.turnIndex).padStart(8, "0"),
			String(item.stableOrder).padStart(8, "0"),
			item.claimVersionId,
		].join(":");
		if (
			!resident ||
			!turn ||
			turn.speakerId !== item.residentId ||
			!turn.claimVersionIds.includes(item.claimVersionId) ||
			resident.displayName !== item.residentName ||
			resident.profilePath !== item.residentProfilePath
		) {
			context.addIssue({
				code: "custom",
				path: ["historicalContext", index],
				message: "Historical context must bind to its exact turn and resident.",
			});
		}
		if (previousContextKey && currentContextKey < previousContextKey) {
			context.addIssue({
				code: "custom",
				path: ["historicalContext", index],
				message:
					"Historical context must use stable turn, claim, and version ordering.",
			});
		}
		previousContextKey = currentContextKey;
	}

	const contextTuples = new Set(
		scene.historicalContext.map(
			(item) => `${item.turnIndex}\u0000${item.claimVersionId}`,
		),
	);
	const turnTuples = new Set(
		scene.turns.flatMap((turn) =>
			turn.claimVersionIds.map(
				(claimVersionId) => `${turn.turnIndex}\u0000${claimVersionId}`,
			),
		),
	);
	if (
		contextTuples.size !== scene.historicalContext.length ||
		contextTuples.size !== turnTuples.size ||
		[...turnTuples].some((tuple) => !contextTuples.has(tuple))
	) {
		context.addIssue({
			code: "custom",
			path: ["historicalContext"],
			message:
				"Every exact turn claim-version binding must have one context entry.",
		});
	}

	const exactModelIds = [
		...new Set(scene.cast.map((resident) => resident.exactModelId)),
	];
	if (
		exactModelIds.length !== scene.disclosures.exactModelIds.length ||
		exactModelIds.some(
			(modelId, index) => scene.disclosures.exactModelIds[index] !== modelId,
		)
	) {
		context.addIssue({
			code: "custom",
			path: ["disclosures", "exactModelIds"],
			message:
				"Disclosure provenance must list the exact models in canonical cast order.",
		});
	}
});

export const CanonicalSceneReadResultSchema = z.discriminatedUnion("kind", [
	strictObject({
		kind: z.literal("complete"),
		scene: CanonicalSceneSchema,
	}),
	strictObject({
		kind: z.literal("known-unavailable"),
		revisionId: CanonicalRevisionIdSchema,
		reason: z.literal("canonical-record-incomplete"),
	}),
	strictObject({
		kind: z.literal("not-found"),
	}),
]);

export type CanonicalScene = z.infer<typeof CanonicalSceneSchema>;
export type CanonicalSceneReadResult = z.infer<
	typeof CanonicalSceneReadResultSchema
>;
