import { eq, sql } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import { sceneBriefs, worldEvents, worldProjection, worlds } from "../../../db/schema.ts";
import { advance } from "../domain/advance.ts";
import { replayWorldEvents } from "../domain/replay.ts";
import type { WorldEvent } from "../domain/types.ts";
import { PROVISIONAL_WORLD_SEED } from "../fixtures/provisional-world.ts";
import { materializeSceneBrief } from "../fixtures/scene-briefs.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export type AdvanceWorldResult = {
	logicalTick: number;
	throughSequence: number;
	insertedEvents: number;
	stateHash: string;
	generationRequests?: CommittedGenerationRequest[];
};

export type CommittedGenerationRequest = {
	sceneKey: string;
	briefId?: string;
	expectedWorldHead: number;
	occurrenceKey: string;
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
					generationRequests: [],
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
			const generationRequests: CommittedGenerationRequest[] = [];

			for (const candidate of candidates) {
				const event: WorldEvent = {
					...candidate,
					sequence: state.throughSequence + 1,
				};
				const proposedState = replayWorldEvents(state, [event]);
				const publicSnapshot = toPublicWorldSnapshot(proposedState);
				if (event.type === "scene_generation_requested") {
					const brief = materializeSceneBrief({
						template: event.payload.brief,
						sceneKey: event.payload.sceneKey,
						expectedWorldHead: event.payload.expectedWorldHead,
					});
					await transaction
						.insert(sceneBriefs)
						.values({
							sceneKey: brief.sceneKey,
							worldId,
							expectedWorldHead: brief.expectedWorldHead,
							brief,
						})
						.onConflictDoNothing();
				}
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
					if (event.type === "scene_generation_requested") {
						generationRequests.push({
							sceneKey: event.payload.sceneKey,
							briefId: event.payload.brief.briefId,
							expectedWorldHead: event.payload.expectedWorldHead,
							occurrenceKey: event.occurrenceKey,
						});
					}
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
				generationRequests,
			};
		});
	} finally {
		await close();
	}
}
