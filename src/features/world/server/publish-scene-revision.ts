import { eq, sql } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import { publishedSceneRevisions, worldEvents, worldProjection, worlds } from "../../../db/schema.ts";
import type { PublishedSceneRevision } from "../generation/contracts.ts";
import type { CompleteWorldScene, WorldEvent } from "../domain/types.ts";
import { replayWorldEvents } from "../domain/replay.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export async function publishSceneRevision(worldId: string, revision: PublishedSceneRevision): Promise<{ revisionId: string; published: boolean }> {
	const { db, close } = createWorldDatabase();
	try {
		return await db.transaction(async (transaction) => {
			const existing = await transaction.select({ revisionId: publishedSceneRevisions.revisionId }).from(publishedSceneRevisions).where(eq(publishedSceneRevisions.attemptId, revision.attemptId)).limit(1);
			if (existing[0]) return { revisionId: existing[0].revisionId, published: false };
			const locked = await transaction.execute(sql`select ${worlds.worldId} from ${worlds} where ${worlds.worldId} = ${worldId} for update`);
			if (locked.rowCount !== 1) throw new Error(`Canonical world ${worldId} has not been seeded.`);
			const [head] = await transaction.select({ state: worldProjection.state }).from(worldProjection).where(eq(worldProjection.worldId, worldId)).limit(1);
			if (!head) throw new Error(`Canonical projection ${worldId} has not been seeded.`);
			if (head.state.throughSequence !== revision.expectedWorldHead) throw new Error("stale_world");
			const scene: CompleteWorldScene = { id: revision.revisionId, premise: "A validated fictional model-API scene.", locationId: "common-room", participantIds: [...new Set(revision.turns.map((turn) => turn.residentId))], startedAtTick: head.state.logicalTick, durationTicks: 1, presentationDurationMs: 12_000, turns: revision.turns.map((turn) => ({ id: `${revision.revisionId}:${turn.turnIndex}`, speakerId: turn.residentId, exactModelId: turn.requestedModelId, text: turn.text })) };
			const event: WorldEvent = { schemaVersion: 1, sequence: head.state.throughSequence + 1, occurrenceKey: `scene-published:${revision.sceneKey}`, logicalTick: head.state.logicalTick, type: "scene_published", payload: { scene, revisionId: revision.revisionId } };
			const state = replayWorldEvents(head.state, [event]);
			const snapshot = toPublicWorldSnapshot(state);
			await transaction.insert(publishedSceneRevisions).values({ ...revision, revision }).onConflictDoNothing();
			await transaction.insert(worldEvents).values({ sequence: event.sequence, worldId, occurrenceKey: event.occurrenceKey, logicalTick: event.logicalTick, type: event.type, schemaVersion: event.schemaVersion, payload: event.payload, publicSnapshot: snapshot });
			await transaction.update(worldProjection).set({ logicalTick: state.logicalTick, throughSequence: state.throughSequence, state, projection: snapshot, stateHash: snapshot.stateHash, updatedAt: new Date() }).where(eq(worldProjection.worldId, worldId));
			return { revisionId: revision.revisionId, published: true };
		});
	} finally { await close(); }
}
