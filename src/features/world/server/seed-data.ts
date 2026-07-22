import type { WorldInitializedEvent, WorldState } from "../domain/types.ts";
import { createProvisionalWorld } from "../fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export const CANONICAL_WORLD_ID = "00000000-0000-4000-8000-000000000001";
export const SEED_OCCURRENCE_KEY = "world-initialized:v1";

export function createSeedState(
	throughSequence = 1,
	logicalTick = 0,
): WorldState {
	return { ...createProvisionalWorld(), logicalTick, throughSequence };
}

export function createSeedSnapshot(throughSequence = 1, logicalTick = 0) {
	return toPublicWorldSnapshot(createSeedState(throughSequence, logicalTick));
}

export function createWorldInitializedEvent(
	sequence = 1,
	logicalTick = 0,
): WorldInitializedEvent {
	const state = createSeedState(sequence, logicalTick);
	return {
		schemaVersion: 1,
		sequence,
		occurrenceKey: SEED_OCCURRENCE_KEY,
		logicalTick,
		type: "world_initialized",
		payload: { state },
	};
}
