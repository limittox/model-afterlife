import { eq } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import { worldProjection } from "../../../db/schema.ts";
import { PublicWorldSnapshotSchema } from "../contracts/public-world.ts";
import { CANONICAL_WORLD_ID } from "./seed-data.ts";

export async function readCurrentSnapshot() {
	const { db, close } = createWorldDatabase();

	try {
		const [row] = await db
			.select({ projection: worldProjection.projection })
			.from(worldProjection)
			.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID))
			.limit(1);

		if (!row) {
			throw new Error("The canonical world has not been seeded.");
		}

		return PublicWorldSnapshotSchema.parse(row.projection);
	} finally {
		await close();
	}
}

export async function readCurrentStateHash(): Promise<string> {
	const { db, close } = createWorldDatabase();

	try {
		const [row] = await db
			.select({ stateHash: worldProjection.stateHash })
			.from(worldProjection)
			.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID))
			.limit(1);

		if (!row) {
			throw new Error("The canonical world has not been seeded.");
		}

		return row.stateHash;
	} finally {
		await close();
	}
}
