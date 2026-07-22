import { eq } from "drizzle-orm";
import { createWorldDatabase } from "../src/db/client.ts";
import { worldEvents, worldProjection, worlds } from "../src/db/schema.ts";
import {
	CANONICAL_WORLD_ID,
	createWorldInitializedEvent,
	SEED_OCCURRENCE_KEY,
} from "../src/features/world/server/seed-data.ts";
import { toPublicWorldSnapshot } from "../src/features/world/server/to-public-snapshot.ts";

export async function seedWorld(): Promise<void> {
	const { db, close } = createWorldDatabase();

	try {
		await db.transaction(async (transaction) => {
			await transaction
				.insert(worlds)
				.values({ worldId: CANONICAL_WORLD_ID })
				.onConflictDoNothing();

			const initialEvent = createWorldInitializedEvent(1);
			const initialSnapshot = toPublicWorldSnapshot(initialEvent.payload.state);
			const inserted = await transaction
				.insert(worldEvents)
				.values({
					sequence: initialEvent.sequence,
					worldId: CANONICAL_WORLD_ID,
					occurrenceKey: SEED_OCCURRENCE_KEY,
					logicalTick: 0,
					type: initialEvent.type,
					schemaVersion: initialEvent.schemaVersion,
					payload: initialEvent.payload,
					publicSnapshot: initialSnapshot,
				})
				.onConflictDoNothing()
				.returning({ sequence: worldEvents.sequence });

			const [existing] =
				inserted.length > 0
					? inserted
					: await transaction
							.select({ sequence: worldEvents.sequence })
							.from(worldEvents)
							.where(eq(worldEvents.occurrenceKey, SEED_OCCURRENCE_KEY))
							.limit(1);

			if (!existing) {
				throw new Error("The immutable seed occurrence could not be read.");
			}

			const seededEvent = createWorldInitializedEvent(existing.sequence);
			const snapshot = toPublicWorldSnapshot(seededEvent.payload.state);
			await transaction
				.insert(worldProjection)
				.values({
					worldId: CANONICAL_WORLD_ID,
					logicalTick: snapshot.logicalTick,
					throughSequence: snapshot.throughSequence,
					projection: snapshot,
					state: seededEvent.payload.state,
					stateHash: snapshot.stateHash,
				})
				.onConflictDoNothing({ target: worldProjection.worldId });
		});
	} finally {
		await close();
	}
}

await seedWorld();
