import { eq } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import { worldProjection } from "../../../db/schema.ts";
import { rebuildProjection } from "../domain/replay.ts";
import { createProvisionalWorld } from "../fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";
import {
	readCanonicalHead,
	readCommittedWorldEvents,
} from "./world-repository.ts";

type RebuildOptions = {
	checkOnly: boolean;
	allowTestOverwrite?: boolean;
};

export async function rebuildWorldProjection(
	worldId: string,
	options: RebuildOptions,
) {
	const committed = await readCanonicalHead(worldId);
	const events = await readCommittedWorldEvents(worldId);
	const rebuilt = rebuildProjection(createProvisionalWorld(), events);
	const rebuiltSnapshot = toPublicWorldSnapshot(rebuilt.state);
	const matches =
		rebuilt.stateHash === committed.snapshot.stateHash &&
		rebuilt.state.throughSequence === committed.snapshot.throughSequence;

	if (options.checkOnly && !matches) {
		throw new Error(
			"Rebuilt projection does not match the committed state hash and sequence.",
		);
	}

	if (!options.checkOnly && !matches) {
		if (
			options.allowTestOverwrite !== true ||
			process.env.DATABASE_PURPOSE !== "test"
		) {
			throw new Error(
				"Refusing to overwrite a mismatching live projection without an explicit test-only flag.",
			);
		}

		const { db, close } = createWorldDatabase();
		try {
			await db
				.update(worldProjection)
				.set({
					logicalTick: rebuilt.state.logicalTick,
					throughSequence: rebuilt.state.throughSequence,
					projection: rebuiltSnapshot,
					state: rebuilt.state,
					stateHash: rebuiltSnapshot.stateHash,
					updatedAt: new Date(),
				})
				.where(eq(worldProjection.worldId, worldId));
		} finally {
			await close();
		}
	}

	return {
		matches,
		rebuiltStateHash: rebuilt.stateHash,
		committedStateHash: committed.snapshot.stateHash,
		rebuiltThroughSequence: rebuilt.state.throughSequence,
		committedThroughSequence: committed.snapshot.throughSequence,
	};
}
