import type { WorldInitializedEvent, WorldState } from "../domain/types.ts";
import { CHARACTER_BIBLES } from "../fixtures/character-bibles.ts";
import { HISTORICAL_CLAIMS } from "../fixtures/historical-claims.ts";
import {
	LAUNCH_RESIDENTS,
	validateLaunchResidentRegistry,
} from "../fixtures/launch-residents.ts";
import { createProvisionalWorld } from "../fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "./to-public-snapshot.ts";

export const CANONICAL_WORLD_ID = "00000000-0000-4000-8000-000000000001";
export const SEED_OCCURRENCE_KEY = "world-initialized:v1";
export const GROUNDED_ENSEMBLE_OCCURRENCE_KEY =
	"world-initialized:grounded-ensemble:v1";

export function createEditorialSeedData() {
	validateLaunchResidentRegistry({
		residents: LAUNCH_RESIDENTS,
		bibles: CHARACTER_BIBLES,
		claims: HISTORICAL_CLAIMS,
	});

	return {
		residentModelVersions: LAUNCH_RESIDENTS.map((resident) => ({
			modelVersionId: resident.modelVersionId,
			residentId: resident.id,
			exactModelId: resident.requestedModelId,
			versionKey: resident.modelVersionKey,
		})),
		characterBibleVersions: CHARACTER_BIBLES.map((bible) => ({
			bibleVersionId: bible.bibleVersionId,
			residentId: bible.residentId,
			versionKey: bible.versionKey,
			content: bible,
		})),
		historicalClaimVersions: HISTORICAL_CLAIMS.map((claim) => ({
			claimVersionId: claim.claimVersionId,
			claimId: claim.claimId,
			versionKey: claim.versionKey,
			content: claim,
		})),
	};
}

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

export function createGroundedEnsembleInitializedEvent(
	sequence: number,
	logicalTick: number,
): WorldInitializedEvent {
	return {
		...createWorldInitializedEvent(sequence, logicalTick),
		occurrenceKey: GROUNDED_ENSEMBLE_OCCURRENCE_KEY,
	};
}
