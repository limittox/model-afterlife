import type { WorldInitializedEvent, WorldState } from "../domain/types.ts";
import { createProvisionalWorld } from "../fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export const CANONICAL_WORLD_ID = "00000000-0000-4000-8000-000000000001";
export const SEED_OCCURRENCE_KEY = "world-initialized:v1";

export function createSeedState(throughSequence = 1): WorldState {
	return { ...createProvisionalWorld(), throughSequence };
}

export function createSeedSnapshot(throughSequence = 1) {
	return toPublicWorldSnapshot(createSeedState(throughSequence));
}

export function createWorldInitializedEvent(
	sequence = 1,
): WorldInitializedEvent {
	const state = createSeedState(sequence);
	return {
		schemaVersion: 1,
		sequence,
		occurrenceKey: SEED_OCCURRENCE_KEY,
		logicalTick: 0,
		type: "world_initialized",
		payload: { state },
	};
}
