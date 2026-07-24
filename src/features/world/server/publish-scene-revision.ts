import { eq, inArray, sql } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import {
	generationAttempts,
	historicalClaimVersions,
	publishedSceneClaimVersions,
	publishedSceneRevisions,
	sceneBriefs,
	worldEvents,
	worldProjection,
	worlds,
} from "../../../db/schema.ts";
import {
	orderedResidentPair,
	relationshipEffectKey,
} from "../domain/relationships.ts";
import { replayWorldEvents } from "../domain/replay.ts";
import type {
	CompleteWorldScene,
	WorldEvent,
	WorldRoomId,
} from "../domain/types.ts";
import {
	type AcceptedCandidate,
	acceptedRevision,
} from "../generation/accepted-candidate.ts";
import {
	type PublishedSceneRevision,
	SceneBriefSchema,
} from "../generation/contracts.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

const SUPPORTED_CLAIM_SET_VERSION = "historical-claims-v1";

function claimContentMatchesRow(
	content: Record<string, unknown>,
	claimId: string,
	claimVersionId: string,
): boolean {
	return (
		content.claimId === claimId &&
		content.claimVersionId === claimVersionId &&
		content.editorialStatus === "approved"
	);
}

export async function publishSceneRevision(
	worldId: string,
	candidate: AcceptedCandidate,
): Promise<{ revisionId: string; published: boolean }> {
	const revision: PublishedSceneRevision = acceptedRevision(candidate);
	const { db, close } = createWorldDatabase();
	try {
		return await db.transaction(async (transaction) => {
			const existing = await transaction
				.select({ revisionId: publishedSceneRevisions.revisionId })
				.from(publishedSceneRevisions)
				.where(eq(publishedSceneRevisions.attemptId, revision.attemptId))
				.limit(1);
			if (existing[0])
				return { revisionId: existing[0].revisionId, published: false };
			const existingScene = await transaction
				.select({ revisionId: publishedSceneRevisions.revisionId })
				.from(publishedSceneRevisions)
				.where(eq(publishedSceneRevisions.sceneKey, revision.sceneKey))
				.limit(1);
			if (existingScene[0])
				return { revisionId: existingScene[0].revisionId, published: false };
			const locked = await transaction.execute(
				sql`select ${worlds.worldId} from ${worlds} where ${worlds.worldId} = ${worldId} for update`,
			);
			if (locked.rowCount !== 1)
				throw new Error(`Canonical world ${worldId} has not been seeded.`);
			const [head] = await transaction
				.select({ state: worldProjection.state })
				.from(worldProjection)
				.where(eq(worldProjection.worldId, worldId))
				.limit(1);
			if (!head)
				throw new Error(`Canonical projection ${worldId} has not been seeded.`);
			if (head.state.throughSequence !== revision.expectedWorldHead)
				throw new Error("stale_world");
			const [attemptRow] = await transaction
				.select({
					claimVersionKey: generationAttempts.claimVersionKey,
				})
				.from(generationAttempts)
				.where(eq(generationAttempts.attemptId, revision.attemptId))
				.limit(1);
			if (!attemptRow) {
				throw new Error(
					`Accepted attempt ${revision.attemptId} does not exist.`,
				);
			}
			const [briefRow] = await transaction
				.select({ brief: sceneBriefs.brief })
				.from(sceneBriefs)
				.where(eq(sceneBriefs.sceneKey, revision.sceneKey))
				.limit(1);
			if (!briefRow)
				throw new Error(`Approved brief ${revision.sceneKey} does not exist.`);
			const brief = SceneBriefSchema.parse(briefRow.brief);
			const permittedEffects = new Set(
				brief.permittedRelationshipEffects.map((effect) => {
					const [residentAId, residentBId] = orderedResidentPair(
						effect.residentAId,
						effect.residentBId,
					);
					return `${residentAId}:${residentBId}:${effect.dimension}`;
				}),
			);
			const acceptedEffects = revision.relationshipEffects.map((effect) => {
				const [residentAId, residentBId] = orderedResidentPair(
					effect.residentAId,
					effect.residentBId,
				);
				const permissionKey = `${residentAId}:${residentBId}:${effect.dimension}`;
				if (!permittedEffects.has(permissionKey)) {
					throw new Error(
						`Relationship effect ${permissionKey} is not permitted.`,
					);
				}
				return {
					...effect,
					residentAId,
					residentBId,
					effectKey: relationshipEffectKey({
						...effect,
						causeRevisionId: revision.revisionId,
					}),
				};
			});
			if (
				new Set(acceptedEffects.map((effect) => effect.effectKey)).size !==
				acceptedEffects.length
			) {
				throw new Error(
					"Duplicate relationship effect keys are not permitted.",
				);
			}
			const locationId = brief.locationId as WorldRoomId;
			if (!head.state.rooms.some((room) => room.id === locationId)) {
				throw new Error(`Scene brief location ${brief.locationId} is unknown.`);
			}
			const bindingRequests = new Map<
				string,
				{ turnIndex: number; claimId: string }
			>();
			for (const turn of revision.turns) {
				for (const claimId of turn.approvedClaimIds) {
					bindingRequests.set(`${turn.turnIndex}\u0000${claimId}`, {
						turnIndex: turn.turnIndex,
						claimId,
					});
				}
			}
			const bindingRequestRows = [...bindingRequests.values()];
			const stableClaimIds = [
				...new Set(bindingRequestRows.map((binding) => binding.claimId)),
			];
			if (
				stableClaimIds.length > 0 &&
				attemptRow.claimVersionKey !== SUPPORTED_CLAIM_SET_VERSION
			) {
				throw new Error(
					`Claim set ${attemptRow.claimVersionKey} is not available for exact publication binding.`,
				);
			}
			const claimRows =
				stableClaimIds.length === 0
					? []
					: await transaction
							.select({
								claimId: historicalClaimVersions.claimId,
								claimVersionId: historicalClaimVersions.claimVersionId,
								content: historicalClaimVersions.content,
							})
							.from(historicalClaimVersions)
							.where(inArray(historicalClaimVersions.claimId, stableClaimIds));
			const claimVersionIdByStableId = new Map<string, string>();
			for (const claimId of stableClaimIds) {
				const exactRows = claimRows.filter(
					(row) =>
						row.claimId === claimId &&
						claimContentMatchesRow(row.content, claimId, row.claimVersionId),
				);
				if (exactRows.length !== 1) {
					throw new Error(
						`Approved claim ${claimId} resolved to ${exactRows.length} immutable versions.`,
					);
				}
				const exactRow = exactRows[0];
				if (!exactRow) {
					throw new Error(
						`Approved claim ${claimId} has no immutable version.`,
					);
				}
				claimVersionIdByStableId.set(claimId, exactRow.claimVersionId);
			}
			const claimBindings = bindingRequestRows.map((binding) => {
				const claimVersionId = claimVersionIdByStableId.get(binding.claimId);
				if (!claimVersionId) {
					throw new Error(
						`Approved claim ${binding.claimId} has no exact version binding.`,
					);
				}
				return {
					revisionId: revision.revisionId,
					turnIndex: binding.turnIndex,
					claimVersionId,
				};
			});
			const scene: CompleteWorldScene = {
				id: revision.revisionId,
				premise: brief.premise,
				locationId,
				participantIds: [
					...new Set(revision.turns.map((turn) => turn.residentId)),
				],
				startedAtTick: head.state.logicalTick,
				durationTicks: 1,
				presentationDurationMs: 12_000,
				turns: revision.turns.map((turn) => ({
					id: `${revision.revisionId}:${turn.turnIndex}`,
					speakerId: turn.residentId,
					exactModelId: turn.requestedModelId,
					text: turn.text,
				})),
				deliveryMode: "live",
				originalRevisionId: revision.revisionId,
				originalSceneKey: revision.sceneKey,
			};
			const events: WorldEvent[] = [
				{
					schemaVersion: 1,
					sequence: head.state.throughSequence + 1,
					occurrenceKey: `scene-published:${revision.sceneKey}`,
					logicalTick: head.state.logicalTick,
					type: "scene_published",
					payload: {
						scene,
						revisionId: revision.revisionId,
						sceneKey: revision.sceneKey,
						briefId: brief.briefId,
					},
				},
				...acceptedEffects.map(
					(effect, index): WorldEvent => ({
						schemaVersion: 1,
						sequence: head.state.throughSequence + 2 + index,
						occurrenceKey: effect.effectKey,
						logicalTick: head.state.logicalTick,
						type: "relationship_effect_applied",
						payload: {
							...effect,
							causeRevisionId: revision.revisionId,
							sceneKey: revision.sceneKey,
						},
					}),
				),
			];
			if (revision.sharedExperience) {
				events.push({
					schemaVersion: 1,
					sequence: head.state.throughSequence + events.length + 1,
					occurrenceKey: `shared-experience:${revision.revisionId}`,
					logicalTick: head.state.logicalTick,
					type: "shared_experience_recorded",
					payload: {
						memory: {
							id: `memory:${revision.revisionId}`,
							source: "published",
							causeRevisionId: revision.revisionId,
							sceneKey: revision.sceneKey,
							participantIds: [...scene.participantIds].sort(),
							summary: revision.sharedExperience.summary,
							tags: [...revision.sharedExperience.tags].sort(),
							logicalTick: head.state.logicalTick,
						},
					},
				});
			}
			let state = head.state;
			const insertedRevision = await transaction
				.insert(publishedSceneRevisions)
				.values({ ...revision, revision })
				.onConflictDoNothing()
				.returning({ revisionId: publishedSceneRevisions.revisionId });
			if (insertedRevision.length !== 1) {
				throw new Error("Scene publication lost an idempotency race.");
			}
			if (claimBindings.length > 0) {
				await transaction
					.insert(publishedSceneClaimVersions)
					.values(claimBindings)
					.onConflictDoNothing();
			}
			for (const event of events) {
				state = replayWorldEvents(state, [event]);
				await transaction.insert(worldEvents).values({
					sequence: event.sequence,
					worldId,
					occurrenceKey: event.occurrenceKey,
					logicalTick: event.logicalTick,
					type: event.type,
					schemaVersion: event.schemaVersion,
					payload: event.payload,
					publicSnapshot: toPublicWorldSnapshot(state),
				});
			}
			const snapshot = toPublicWorldSnapshot(state);
			await transaction
				.update(worldProjection)
				.set({
					logicalTick: state.logicalTick,
					throughSequence: state.throughSequence,
					state,
					projection: snapshot,
					stateHash: snapshot.stateHash,
					updatedAt: new Date(),
				})
				.where(eq(worldProjection.worldId, worldId));
			return { revisionId: revision.revisionId, published: true };
		});
	} finally {
		await close();
	}
}
