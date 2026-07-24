import { eq, sql } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import { publishedSceneRevisions, sceneBriefs, worldEvents, worldProjection, worlds } from "../../../db/schema.ts";
import { SceneBriefSchema, type PublishedSceneRevision } from "../generation/contracts.ts";
import type { CompleteWorldScene, WorldEvent } from "../domain/types.ts";
import { replayWorldEvents } from "../domain/replay.ts";
import {
	orderedResidentPair,
	relationshipEffectKey,
} from "../domain/relationships.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export async function publishSceneRevision(worldId: string, revision: PublishedSceneRevision): Promise<{ revisionId: string; published: boolean }> {
	const { db, close } = createWorldDatabase();
	try {
		return await db.transaction(async (transaction) => {
			const existing = await transaction.select({ revisionId: publishedSceneRevisions.revisionId }).from(publishedSceneRevisions).where(eq(publishedSceneRevisions.attemptId, revision.attemptId)).limit(1);
			if (existing[0]) return { revisionId: existing[0].revisionId, published: false };
			const existingScene = await transaction.select({ revisionId: publishedSceneRevisions.revisionId }).from(publishedSceneRevisions).where(eq(publishedSceneRevisions.sceneKey, revision.sceneKey)).limit(1);
			if (existingScene[0]) return { revisionId: existingScene[0].revisionId, published: false };
			const locked = await transaction.execute(sql`select ${worlds.worldId} from ${worlds} where ${worlds.worldId} = ${worldId} for update`);
			if (locked.rowCount !== 1) throw new Error(`Canonical world ${worldId} has not been seeded.`);
			const [head] = await transaction.select({ state: worldProjection.state }).from(worldProjection).where(eq(worldProjection.worldId, worldId)).limit(1);
			if (!head) throw new Error(`Canonical projection ${worldId} has not been seeded.`);
			if (head.state.throughSequence !== revision.expectedWorldHead) throw new Error("stale_world");
			const [briefRow] = await transaction
				.select({ brief: sceneBriefs.brief })
				.from(sceneBriefs)
				.where(eq(sceneBriefs.sceneKey, revision.sceneKey))
				.limit(1);
			if (!briefRow) throw new Error(`Approved brief ${revision.sceneKey} does not exist.`);
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
					throw new Error(`Relationship effect ${permissionKey} is not permitted.`);
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
				throw new Error("Duplicate relationship effect keys are not permitted.");
			}
			const scene: CompleteWorldScene = { id: revision.revisionId, premise: "A validated fictional model-API scene.", locationId: "common-room", participantIds: [...new Set(revision.turns.map((turn) => turn.residentId))], startedAtTick: head.state.logicalTick, durationTicks: 1, presentationDurationMs: 12_000, turns: revision.turns.map((turn) => ({ id: `${revision.revisionId}:${turn.turnIndex}`, speakerId: turn.residentId, exactModelId: turn.requestedModelId, text: turn.text })) };
			const events: WorldEvent[] = [
				{ schemaVersion: 1, sequence: head.state.throughSequence + 1, occurrenceKey: `scene-published:${revision.sceneKey}`, logicalTick: head.state.logicalTick, type: "scene_published", payload: { scene, revisionId: revision.revisionId, sceneKey: revision.sceneKey, briefId: brief.briefId } },
				...acceptedEffects.map((effect, index): WorldEvent => ({
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
				})),
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
			for (const event of events) {
				state = replayWorldEvents(state, [event]);
				await transaction.insert(worldEvents).values({ sequence: event.sequence, worldId, occurrenceKey: event.occurrenceKey, logicalTick: event.logicalTick, type: event.type, schemaVersion: event.schemaVersion, payload: event.payload, publicSnapshot: toPublicWorldSnapshot(state) });
			}
			const snapshot = toPublicWorldSnapshot(state);
			await transaction.update(worldProjection).set({ logicalTick: state.logicalTick, throughSequence: state.throughSequence, state, projection: snapshot, stateHash: snapshot.stateHash, updatedAt: new Date() }).where(eq(worldProjection.worldId, worldId));
			return { revisionId: revision.revisionId, published: true };
		});
	} finally { await close(); }
}
