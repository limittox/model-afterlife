import { eq, sql } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import { worldEvents, worldProjection, worlds } from "../../../db/schema.ts";
import { advance } from "../domain/advance.ts";
import { replayWorldEvents } from "../domain/replay.ts";
import type { WorldEvent } from "../domain/types.ts";
import { PROVISIONAL_WORLD_SEED } from "../fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export type AdvanceWorldResult = {
	logicalTick: number;
	throughSequence: number;
	insertedEvents: number;
	stateHash: string;
};

export async function advanceWorldTo(
	worldId: string,
	targetTick: number,
): Promise<AdvanceWorldResult> {
	if (!Number.isSafeInteger(targetTick) || targetTick < 0) {
		throw new RangeError("targetTick must be a non-negative safe integer.");
	}

	const { db, close } = createWorldDatabase();
	try {
		return await db.transaction(async (transaction) => {
			const locked = await transaction.execute(
				sql`select ${worlds.worldId} from ${worlds} where ${worlds.worldId} = ${worldId} for update`,
			);
			if (locked.rowCount !== 1) {
				throw new Error(`Canonical world ${worldId} has not been seeded.`);
			}

			const [head] = await transaction
				.select({ state: worldProjection.state })
				.from(worldProjection)
				.where(eq(worldProjection.worldId, worldId))
				.limit(1);
			if (!head) {
				throw new Error(`Canonical projection ${worldId} has not been seeded.`);
			}

			if (targetTick <= head.state.logicalTick) {
				const snapshot = toPublicWorldSnapshot(head.state);
				return {
					logicalTick: head.state.logicalTick,
					throughSequence: head.state.throughSequence,
					insertedEvents: 0,
					stateHash: snapshot.stateHash,
				};
			}

			const candidates = advance(
				head.state,
				head.state.logicalTick,
				targetTick,
				PROVISIONAL_WORLD_SEED,
			).events;
			let state = head.state;
			let insertedEvents = 0;

			for (const candidate of candidates) {
				const event: WorldEvent = {
					...candidate,
					sequence: state.throughSequence + 1,
				};
				const proposedState = replayWorldEvents(state, [event]);
				const publicSnapshot = toPublicWorldSnapshot(proposedState);
				const inserted = await transaction
					.insert(worldEvents)
					.values({
						sequence: event.sequence,
						worldId,
						occurrenceKey: event.occurrenceKey,
						logicalTick: event.logicalTick,
						type: event.type,
						schemaVersion: event.schemaVersion,
						payload: event.payload,
						publicSnapshot,
					})
					.onConflictDoNothing({
						target: [worldEvents.worldId, worldEvents.occurrenceKey],
					})
					.returning({ sequence: worldEvents.sequence });

				if (inserted.length === 1) {
					state = proposedState;
					insertedEvents += 1;
				}
			}

			const snapshot = toPublicWorldSnapshot(state);
			await transaction
				.update(worldProjection)
				.set({
					logicalTick: state.logicalTick,
					throughSequence: state.throughSequence,
					projection: snapshot,
					state,
					stateHash: snapshot.stateHash,
					updatedAt: new Date(),
				})
				.where(eq(worldProjection.worldId, worldId));

			return {
				logicalTick: state.logicalTick,
				throughSequence: state.throughSequence,
				insertedEvents,
				stateHash: snapshot.stateHash,
			};
		});
	} finally {
		await close();
	}
}
