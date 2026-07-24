import { and, eq, or, sql } from "drizzle-orm";
import { z } from "zod";
import { createWorldDatabase } from "../../../db/client.ts";
import {
	historicalClaimVersions,
	publishedSceneClaimVersions,
	publishedSceneRevisions,
	sceneBriefs,
	worldEvents,
} from "../../../db/schema.ts";
import {
	NON_AFFILIATION_DISCLOSURE,
	STAGED_FICTION_DISCLOSURE,
} from "../../world/components/TransparencyNotice.tsx";
import { LAUNCH_RESIDENTS } from "../../world/fixtures/launch-residents.ts";
import { PROVISIONAL_ROOMS } from "../../world/fixtures/provisional-world.ts";
import {
	PublishedSceneRevisionSchema,
	SceneBriefSchema,
} from "../../world/generation/contracts.ts";
import {
	CanonicalRevisionIdSchema,
	type CanonicalScene,
	type CanonicalSceneReadResult,
	CanonicalSceneReadResultSchema,
	CanonicalSceneSchema,
	canonicalScenePath,
	residentProfilePath,
} from "../contracts/public-publication.ts";
import { homeClockForLogicalTick } from "../domain/home-clock.ts";

const nonBlank = z.string().trim().min(1);

const StoredClaimSchema = z
	.object({
		claimVersionId: nonBlank,
		claimId: nonBlank,
		versionKey: nonBlank,
		residentId: nonBlank,
		stableOrder: z.number().int().positive(),
		category: z.enum(["documented", "reported", "exaggeration"]),
		statement: nonBlank,
		scope: z
			.object({
				residentId: nonBlank,
				exactModelIds: z.array(nonBlank).min(1),
			})
			.strict(),
		source: z
			.object({
				title: nonBlank,
				url: z.string().url(),
				accessedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
			})
			.strict(),
		confidence: z.enum(["high", "medium"]),
		editorialStatus: z.literal("approved"),
	})
	.strict();

const PublishedSceneEventPayloadSchema = z
	.object({
		scene: z
			.object({
				id: nonBlank,
				premise: nonBlank,
				locationId: nonBlank,
				participantIds: z.array(nonBlank).min(2).max(3),
				startedAtTick: z.number().int().nonnegative(),
				durationTicks: z.number().int().positive(),
				presentationDurationMs: z.number().int().positive(),
				turns: z
					.array(
						z
							.object({
								id: nonBlank,
								speakerId: nonBlank,
								exactModelId: nonBlank,
								text: nonBlank,
							})
							.strict(),
					)
					.min(4)
					.max(10),
				deliveryMode: z.literal("live"),
				originalRevisionId: nonBlank,
				originalSceneKey: nonBlank,
			})
			.strict(),
		revisionId: nonBlank,
		sceneKey: nonBlank,
		briefId: nonBlank,
	})
	.strict();

const RelationshipEventPayloadSchema = z
	.object({
		effectKey: nonBlank,
		causeRevisionId: nonBlank,
		sceneKey: nonBlank,
		effectOrdinal: z.number().int().nonnegative(),
		residentAId: nonBlank,
		residentBId: nonBlank,
		dimension: z.enum(["friendship", "rivalry", "familiarity"]),
		delta: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
	})
	.strict();

const SharedExperienceEventPayloadSchema = z
	.object({
		memory: z
			.object({
				id: nonBlank,
				source: z.literal("published"),
				causeRevisionId: nonBlank,
				sceneKey: nonBlank,
				participantIds: z.array(nonBlank).min(2).max(3),
				summary: nonBlank,
				tags: z.array(nonBlank).max(8),
				logicalTick: z.number().int().nonnegative(),
			})
			.strict(),
	})
	.strict();

const CATEGORY_LABELS = {
	documented: "Documented",
	reported: "Reported or reputation-based",
	exaggeration: "Fictional exaggeration",
} as const;

const RESIDENTS_BY_ID = new Map(
	LAUNCH_RESIDENTS.map((resident) => [resident.id, resident]),
);
const ROOM_NAMES_BY_ID = new Map<string, string>(
	PROVISIONAL_ROOMS.map((room) => [room.id, room.name]),
);

type PublicationEventRow = {
	sequence: number;
	logicalTick: number;
	payload: Record<string, unknown>;
};

type ClaimBindingRow = {
	turnIndex: number;
	claimVersionId: string;
	content: Record<string, unknown>;
};

type CauseEventRow = {
	type: string;
	payload: Record<string, unknown>;
};

export type CanonicalSceneRows = {
	revisionId: string;
	revision: Record<string, unknown>;
	brief: Record<string, unknown>;
	publicationEvents: readonly PublicationEventRow[];
	claimBindings: readonly ClaimBindingRow[];
	causeEvents: readonly CauseEventRow[];
};

function unavailable(revisionId: string): CanonicalSceneReadResult {
	return CanonicalSceneReadResultSchema.parse({
		kind: "known-unavailable",
		revisionId,
		reason: "canonical-record-incomplete",
	});
}

function sameStringSet(
	left: readonly string[],
	right: readonly string[],
): boolean {
	if (left.length !== right.length) return false;
	const rightSet = new Set(right);
	return (
		new Set(left).size === left.length &&
		left.every((item) => rightSet.has(item))
	);
}

function relationshipDescription(
	dimension: "friendship" | "rivalry" | "familiarity",
	delta: -1 | 1,
): string {
	if (dimension === "friendship") {
		return delta > 0 ? "Their friendship grew." : "Their friendship eased.";
	}
	if (dimension === "rivalry") {
		return delta > 0 ? "Their rivalry sharpened." : "Their rivalry softened.";
	}
	return delta > 0
		? "They became more familiar with one another."
		: "Their familiarity receded.";
}

function eventSceneMatchesRevision(input: {
	event: z.infer<typeof PublishedSceneEventPayloadSchema>;
	revision: z.infer<typeof PublishedSceneRevisionSchema>;
	brief: z.infer<typeof SceneBriefSchema>;
}): boolean {
	const { event, revision, brief } = input;
	return (
		event.revisionId === revision.revisionId &&
		event.sceneKey === revision.sceneKey &&
		event.briefId === brief.briefId &&
		event.scene.id === revision.revisionId &&
		event.scene.originalRevisionId === revision.revisionId &&
		event.scene.originalSceneKey === revision.sceneKey &&
		event.scene.premise === brief.premise &&
		event.scene.locationId === brief.locationId &&
		sameStringSet(event.scene.participantIds, brief.participantIds) &&
		event.scene.turns.length === revision.turns.length &&
		event.scene.turns.every((eventTurn, index) => {
			const revisionTurn = revision.turns[index];
			return (
				revisionTurn !== undefined &&
				eventTurn.speakerId === revisionTurn.residentId &&
				eventTurn.exactModelId === revisionTurn.requestedModelId &&
				eventTurn.text === revisionTurn.text
			);
		})
	);
}

export function assembleCanonicalScene(
	input: CanonicalSceneRows,
): CanonicalSceneReadResult {
	const revisionId = CanonicalRevisionIdSchema.parse(input.revisionId);
	const revision = PublishedSceneRevisionSchema.safeParse(input.revision);
	const brief = SceneBriefSchema.safeParse(input.brief);
	if (!revision.success || !brief.success) return unavailable(revisionId);
	if (
		revision.data.revisionId !== revisionId ||
		revision.data.sceneKey !== brief.data.sceneKey ||
		revision.data.expectedWorldHead !== brief.data.expectedWorldHead
	) {
		return unavailable(revisionId);
	}

	if (input.publicationEvents.length !== 1) return unavailable(revisionId);
	const publication = input.publicationEvents[0];
	if (!publication) return unavailable(revisionId);
	const publicationPayload = PublishedSceneEventPayloadSchema.safeParse(
		publication.payload,
	);
	if (
		!publicationPayload.success ||
		!eventSceneMatchesRevision({
			event: publicationPayload.data,
			revision: revision.data,
			brief: brief.data,
		})
	) {
		return unavailable(revisionId);
	}

	const cast = brief.data.participantIds.map((residentId) => {
		const resident = RESIDENTS_BY_ID.get(residentId);
		if (!resident) return null;
		return {
			residentId,
			displayName: resident.displayName,
			profilePath: residentProfilePath(residentId),
			exactModelId: resident.requestedModelId,
		};
	});
	if (cast.some((resident) => resident === null))
		return unavailable(revisionId);
	const completeCast = cast.filter((resident) => resident !== null);
	const castByResident = new Map(
		completeCast.map((resident) => [resident.residentId, resident]),
	);

	const bindingsByTurn = new Map<number, ClaimBindingRow[]>();
	for (const binding of input.claimBindings) {
		bindingsByTurn.set(binding.turnIndex, [
			...(bindingsByTurn.get(binding.turnIndex) ?? []),
			binding,
		]);
	}

	const historicalContext: CanonicalScene["historicalContext"] = [];
	const turns: CanonicalScene["turns"] = [];
	for (const [turnIndex, turn] of revision.data.turns.entries()) {
		const resident = castByResident.get(turn.residentId);
		if (
			!resident ||
			turn.turnIndex !== turnIndex ||
			turn.requestedModelId !== resident.exactModelId
		) {
			return unavailable(revisionId);
		}

		const bindingRows = bindingsByTurn.get(turnIndex) ?? [];
		const approvedClaimIds = [...new Set(turn.approvedClaimIds)];
		if (bindingRows.length !== approvedClaimIds.length) {
			return unavailable(revisionId);
		}
		const claimVersionIds: string[] = [];
		for (const binding of bindingRows) {
			const claim = StoredClaimSchema.safeParse(binding.content);
			if (
				!claim.success ||
				claim.data.claimVersionId !== binding.claimVersionId ||
				claim.data.residentId !== turn.residentId ||
				claim.data.scope.residentId !== turn.residentId ||
				!claim.data.scope.exactModelIds.includes(turn.requestedModelId) ||
				!approvedClaimIds.includes(claim.data.claimId)
			) {
				return unavailable(revisionId);
			}
			claimVersionIds.push(claim.data.claimVersionId);
			historicalContext.push({
				turnIndex,
				residentId: resident.residentId,
				residentName: resident.displayName,
				residentProfilePath: resident.profilePath,
				claimId: claim.data.claimId,
				claimVersionId: claim.data.claimVersionId,
				stableOrder: claim.data.stableOrder,
				category: claim.data.category,
				categoryLabel: CATEGORY_LABELS[claim.data.category],
				statement: claim.data.statement,
				confidence: claim.data.confidence,
				source: claim.data.source,
			});
		}
		if (new Set(claimVersionIds).size !== claimVersionIds.length) {
			return unavailable(revisionId);
		}
		turns.push({
			turnIndex,
			speakerId: resident.residentId,
			speakerName: resident.displayName,
			speakerProfilePath: resident.profilePath,
			exactModelId: resident.exactModelId,
			text: turn.text,
			claimVersionIds: claimVersionIds.sort(),
		});
	}
	if (
		[...bindingsByTurn.keys()].some(
			(turnIndex) => turnIndex < 0 || turnIndex >= turns.length,
		)
	) {
		return unavailable(revisionId);
	}
	historicalContext.sort(
		(left, right) =>
			left.turnIndex - right.turnIndex ||
			left.stableOrder - right.stableOrder ||
			left.claimVersionId.localeCompare(right.claimVersionId),
	);

	const relationshipRows = input.causeEvents.filter(
		(row) => row.type === "relationship_effect_applied",
	);
	if (relationshipRows.length !== revision.data.relationshipEffects.length) {
		return unavailable(revisionId);
	}
	const relationshipPayloads = relationshipRows.map((row) =>
		RelationshipEventPayloadSchema.safeParse(row.payload),
	);
	if (relationshipPayloads.some((payload) => !payload.success)) {
		return unavailable(revisionId);
	}
	const relationshipByOrdinal = new Map(
		relationshipPayloads
			.filter((payload) => payload.success)
			.map((payload) => [payload.data.effectOrdinal, payload.data]),
	);
	if (relationshipByOrdinal.size !== revision.data.relationshipEffects.length) {
		return unavailable(revisionId);
	}
	const relationshipChanges: CanonicalScene["outcome"]["relationshipChanges"] =
		[];
	for (const effect of revision.data.relationshipEffects) {
		const event = relationshipByOrdinal.get(effect.effectOrdinal);
		const residentA = RESIDENTS_BY_ID.get(effect.residentAId);
		const residentB = RESIDENTS_BY_ID.get(effect.residentBId);
		if (
			!event ||
			!residentA ||
			!residentB ||
			event.causeRevisionId !== revisionId ||
			event.sceneKey !== revision.data.sceneKey ||
			event.residentAId !== effect.residentAId ||
			event.residentBId !== effect.residentBId ||
			event.dimension !== effect.dimension ||
			event.delta !== effect.delta
		) {
			return unavailable(revisionId);
		}
		if (effect.delta !== 0) {
			relationshipChanges.push({
				residentAId: residentA.id,
				residentAName: residentA.displayName,
				residentAProfilePath: residentProfilePath(residentA.id),
				residentBId: residentB.id,
				residentBName: residentB.displayName,
				residentBProfilePath: residentProfilePath(residentB.id),
				dimension: effect.dimension,
				description: relationshipDescription(effect.dimension, effect.delta),
			});
		}
	}

	const sharedRows = input.causeEvents.filter(
		(row) => row.type === "shared_experience_recorded",
	);
	let sharedExperience: string | null = null;
	if (revision.data.sharedExperience) {
		if (sharedRows.length !== 1) return unavailable(revisionId);
		const sharedPayload = SharedExperienceEventPayloadSchema.safeParse(
			sharedRows[0]?.payload,
		);
		if (
			!sharedPayload.success ||
			sharedPayload.data.memory.causeRevisionId !== revisionId ||
			sharedPayload.data.memory.sceneKey !== revision.data.sceneKey ||
			sharedPayload.data.memory.summary !==
				revision.data.sharedExperience.summary ||
			!sameStringSet(
				sharedPayload.data.memory.participantIds,
				brief.data.participantIds,
			)
		) {
			return unavailable(revisionId);
		}
		sharedExperience = sharedPayload.data.memory.summary;
	} else if (sharedRows.length > 0) {
		return unavailable(revisionId);
	}

	const locationName = ROOM_NAMES_BY_ID.get(brief.data.locationId);
	const path = canonicalScenePath(revisionId);
	if (!locationName || !path) return unavailable(revisionId);
	const exactModelIds = [
		...new Set(completeCast.map((resident) => resident.exactModelId)),
	];
	const home = homeClockForLogicalTick(publication.logicalTick);
	const scene = CanonicalSceneSchema.safeParse({
		revisionId,
		canonicalPath: path,
		publicationSequence: publication.sequence,
		premise: brief.data.premise,
		cast: completeCast,
		home,
		location: {
			id: brief.data.locationId,
			name: locationName,
		},
		turns,
		outcome: {
			summary: brief.data.permittedOutcome,
			sharedExperience,
			relationshipChanges,
		},
		historicalContext,
		disclosures: {
			stagedFiction: STAGED_FICTION_DISCLOSURE,
			aiAuthorship: `Dialogue was generated turn by turn by the designated model APIs: ${exactModelIds.join(", ")}.`,
			exactModelIds,
			nonAffiliation: NON_AFFILIATION_DISCLOSURE,
		},
	});
	return scene.success
		? CanonicalSceneReadResultSchema.parse({
				kind: "complete",
				scene: scene.data,
			})
		: unavailable(revisionId);
}

export async function readCanonicalScene(
	revisionId: string,
): Promise<CanonicalSceneReadResult> {
	const parsedRevisionId = CanonicalRevisionIdSchema.safeParse(revisionId);
	if (!parsedRevisionId.success) {
		return CanonicalSceneReadResultSchema.parse({ kind: "not-found" });
	}

	const { db, close } = createWorldDatabase();
	try {
		const [revisionRow] = await db
			.select({
				revision: publishedSceneRevisions.revision,
				sceneKey: publishedSceneRevisions.sceneKey,
			})
			.from(publishedSceneRevisions)
			.where(eq(publishedSceneRevisions.revisionId, parsedRevisionId.data))
			.limit(1);
		if (!revisionRow) {
			return CanonicalSceneReadResultSchema.parse({ kind: "not-found" });
		}

		const [briefRow, publicationEvents, claimBindings, causeEvents] =
			await Promise.all([
				db
					.select({ brief: sceneBriefs.brief })
					.from(sceneBriefs)
					.where(eq(sceneBriefs.sceneKey, revisionRow.sceneKey))
					.limit(1),
				db
					.select({
						sequence: worldEvents.sequence,
						logicalTick: worldEvents.logicalTick,
						payload: worldEvents.payload,
					})
					.from(worldEvents)
					.where(
						and(
							eq(worldEvents.type, "scene_published"),
							sql`${worldEvents.payload}->>'revisionId' = ${parsedRevisionId.data}`,
						),
					),
				db
					.select({
						turnIndex: publishedSceneClaimVersions.turnIndex,
						claimVersionId: publishedSceneClaimVersions.claimVersionId,
						content: historicalClaimVersions.content,
					})
					.from(publishedSceneClaimVersions)
					.innerJoin(
						historicalClaimVersions,
						eq(
							publishedSceneClaimVersions.claimVersionId,
							historicalClaimVersions.claimVersionId,
						),
					)
					.where(
						eq(publishedSceneClaimVersions.revisionId, parsedRevisionId.data),
					),
				db
					.select({
						type: worldEvents.type,
						payload: worldEvents.payload,
					})
					.from(worldEvents)
					.where(
						or(
							and(
								eq(worldEvents.type, "relationship_effect_applied"),
								sql`${worldEvents.payload}->>'causeRevisionId' = ${parsedRevisionId.data}`,
							),
							and(
								eq(worldEvents.type, "shared_experience_recorded"),
								sql`${worldEvents.payload}->'memory'->>'causeRevisionId' = ${parsedRevisionId.data}`,
							),
						),
					),
			]);
		const brief = briefRow[0]?.brief;
		if (!brief) return unavailable(parsedRevisionId.data);
		return assembleCanonicalScene({
			revisionId: parsedRevisionId.data,
			revision: revisionRow.revision,
			brief,
			publicationEvents,
			claimBindings,
			causeEvents,
		});
	} finally {
		await close();
	}
}
