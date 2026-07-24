import { eq, sql } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import {
	worldEvents,
	worldProjection,
	worlds,
} from "../../../db/schema.ts";
import { replayWorldEvents } from "../domain/replay.ts";
import type { CompleteWorldScene, WorldEvent } from "../domain/types.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export async function resolveGenerationContinuity(input: {
	worldId: string;
	sceneKey: string;
	disposition: "quiet" | "cached" | "stale_world" | "duplicate";
	cachedScene?: CompleteWorldScene;
}): Promise<{
	resolved: boolean;
	mode: "quiet" | "cached";
	stateHash: string;
}> {
	const { db, close } = createWorldDatabase();
	try {
		return await db.transaction(async (transaction) => {
			const locked = await transaction.execute(
				sql`select ${worlds.worldId} from ${worlds} where ${worlds.worldId} = ${input.worldId} for update`,
			);
			if (locked.rowCount !== 1) {
				throw new Error(`Canonical world ${input.worldId} has not been seeded.`);
			}
			const [head] = await transaction
				.select({ state: worldProjection.state })
				.from(worldProjection)
				.where(eq(worldProjection.worldId, input.worldId))
				.limit(1);
			if (!head) {
				throw new Error(
					`Canonical projection ${input.worldId} has not been seeded.`,
				);
			}
			const currentSnapshot = toPublicWorldSnapshot(head.state);
			if (head.state.pendingSceneRequest?.sceneKey !== input.sceneKey) {
				return {
					resolved: false,
					mode:
						head.state.scene?.deliveryMode === "cached" ? "cached" : "quiet",
					stateHash: currentSnapshot.stateHash,
				};
			}
			const mode = input.cachedScene ? "cached" : "quiet";
			const event: WorldEvent = {
				schemaVersion: 1,
				sequence: head.state.throughSequence + 1,
				occurrenceKey: `scene-generation-resolved:${input.sceneKey}`,
				logicalTick: head.state.logicalTick,
				type: "scene_generation_resolved",
				payload: {
					sceneKey: input.sceneKey,
					disposition: mode === "cached" ? "cached" : input.disposition,
					...(input.cachedScene ? { cachedScene: input.cachedScene } : {}),
				},
			};
			const state = replayWorldEvents(head.state, [event]);
			const snapshot = toPublicWorldSnapshot(state);
			const inserted = await transaction
				.insert(worldEvents)
				.values({
					sequence: event.sequence,
					worldId: input.worldId,
					occurrenceKey: event.occurrenceKey,
					logicalTick: event.logicalTick,
					type: event.type,
					schemaVersion: event.schemaVersion,
					payload: event.payload,
					publicSnapshot: snapshot,
				})
				.onConflictDoNothing({
					target: [worldEvents.worldId, worldEvents.occurrenceKey],
				})
				.returning({ sequence: worldEvents.sequence });
			if (inserted.length !== 1) {
				return { resolved: false, mode, stateHash: currentSnapshot.stateHash };
			}
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
				.where(eq(worldProjection.worldId, input.worldId));
			return { resolved: true, mode, stateHash: snapshot.stateHash };
		});
	} finally {
		await close();
	}
}
