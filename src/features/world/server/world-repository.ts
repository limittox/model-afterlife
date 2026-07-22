import { and, asc, eq, gt, lte } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import { worldEvents, worldProjection } from "../../../db/schema.ts";
import {
	PUBLIC_WORLD_SCHEMA_VERSION,
	PublicWorldSnapshotSchema,
	PublicWorldUpdatesSchema,
	type PublicWorldUpdates,
} from "../contracts/public-world.ts";
import type { WorldEvent, WorldState } from "../domain/types.ts";

export type CanonicalHead = {
	state: WorldState;
	snapshot: ReturnType<typeof PublicWorldSnapshotSchema.parse>;
};

export async function readCanonicalHead(
	worldId: string,
): Promise<CanonicalHead> {
	const { db, close } = createWorldDatabase();
	try {
		const [row] = await db
			.select({
				state: worldProjection.state,
				projection: worldProjection.projection,
			})
			.from(worldProjection)
			.where(eq(worldProjection.worldId, worldId))
			.limit(1);

		if (!row) {
			throw new Error(`Canonical world ${worldId} has not been seeded.`);
		}

		return {
			state: row.state,
			snapshot: PublicWorldSnapshotSchema.parse(row.projection),
		};
	} finally {
		await close();
	}
}

export async function readCommittedWorldEvents(
	worldId: string,
): Promise<WorldEvent[]> {
	const { db, close } = createWorldDatabase();
	try {
		const rows = await db
			.select({
				sequence: worldEvents.sequence,
				occurrenceKey: worldEvents.occurrenceKey,
				logicalTick: worldEvents.logicalTick,
				type: worldEvents.type,
				schemaVersion: worldEvents.schemaVersion,
				payload: worldEvents.payload,
			})
			.from(worldEvents)
			.where(eq(worldEvents.worldId, worldId))
			.orderBy(asc(worldEvents.sequence));

		return rows.map((row) => row as unknown as WorldEvent);
	} finally {
		await close();
	}
}

export async function readOrderedUpdates(
	worldId: string,
	after: number,
	limit = 100,
): Promise<PublicWorldUpdates> {
	const { db, close } = createWorldDatabase();
	try {
		const [head] = await db
			.select({ throughSequence: worldProjection.throughSequence })
			.from(worldProjection)
			.where(eq(worldProjection.worldId, worldId))
			.limit(1);

		if (!head) {
			throw new Error(`Canonical world ${worldId} has not been seeded.`);
		}
		if (after > head.throughSequence) {
			return PublicWorldUpdatesSchema.parse({
				schemaVersion: PUBLIC_WORLD_SCHEMA_VERSION,
				fromSequence: after,
				throughSequence: head.throughSequence,
				hasMore: false,
				requiresSnapshot: true,
				updates: [],
			});
		}

		const rows = await db
			.select({
				sequence: worldEvents.sequence,
				logicalTick: worldEvents.logicalTick,
				publicSnapshot: worldEvents.publicSnapshot,
			})
			.from(worldEvents)
			.where(
				and(
					eq(worldEvents.worldId, worldId),
					gt(worldEvents.sequence, after),
					lte(worldEvents.sequence, head.throughSequence),
				),
			)
			.orderBy(asc(worldEvents.sequence))
			.limit(limit + 1);

		if (rows.length > 0 && rows[0].sequence !== after + 1) {
			return PublicWorldUpdatesSchema.parse({
				schemaVersion: PUBLIC_WORLD_SCHEMA_VERSION,
				fromSequence: after,
				throughSequence: head.throughSequence,
				hasMore: false,
				requiresSnapshot: true,
				updates: [],
			});
		}

		const selectedRows = rows.slice(0, limit);
		const updates = selectedRows.map((row) => {
			const snapshot = PublicWorldSnapshotSchema.parse(row.publicSnapshot);
			return {
				schemaVersion: PUBLIC_WORLD_SCHEMA_VERSION,
				sequence: row.sequence,
				logicalTick: row.logicalTick,
				stateHash: snapshot.stateHash,
				snapshot,
			};
		});

		return PublicWorldUpdatesSchema.parse({
			schemaVersion: PUBLIC_WORLD_SCHEMA_VERSION,
			fromSequence: after,
			throughSequence: updates.at(-1)?.sequence ?? after,
			hasMore: rows.length > limit,
			requiresSnapshot: false,
			updates,
		});
	} finally {
		await close();
	}
}
