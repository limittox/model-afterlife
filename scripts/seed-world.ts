import { eq } from "drizzle-orm";
import { createWorldDatabase } from "../src/db/client.ts";
import { worldEvents, worldProjection, worlds } from "../src/db/schema.ts";
import {
	CANONICAL_WORLD_ID,
	createSeedSnapshot,
	SEED_OCCURRENCE_KEY,
} from "../src/features/world/server/seed-data.ts";

export async function seedWorld(): Promise<void> {
	const { db, close } = createWorldDatabase();

	try {
		await db.transaction(async (transaction) => {
			await transaction
				.insert(worlds)
				.values({ worldId: CANONICAL_WORLD_ID })
				.onConflictDoNothing();

			const inserted = await transaction
				.insert(worldEvents)
				.values({
					worldId: CANONICAL_WORLD_ID,
					occurrenceKey: SEED_OCCURRENCE_KEY,
					logicalTick: 0,
					kind: "world.opened",
					payload: { source: "deterministic-seed", schemaVersion: 1 },
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

			const snapshot = createSeedSnapshot(existing.sequence);
			await transaction
				.insert(worldProjection)
				.values({
					worldId: CANONICAL_WORLD_ID,
					logicalTick: snapshot.logicalTick,
					throughSequence: snapshot.throughSequence,
					projection: snapshot,
					stateHash: snapshot.stateHash,
				})
				.onConflictDoUpdate({
					target: worldProjection.worldId,
					set: {
						logicalTick: snapshot.logicalTick,
						throughSequence: snapshot.throughSequence,
						projection: snapshot,
						stateHash: snapshot.stateHash,
						updatedAt: new Date(),
					},
				});
		});
	} finally {
		await close();
	}
}

await seedWorld();
