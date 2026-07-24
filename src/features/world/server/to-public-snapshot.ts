import { homeClockForLogicalTick } from "../../publication/domain/home-clock.ts";
import {
	PUBLIC_WORLD_SCHEMA_VERSION,
	type PublicWorldSnapshot,
	PublicWorldSnapshotSchema,
} from "../contracts/public-world.ts";
import { canonicalStateHash } from "../domain/canonical.ts";
import type { WorldState } from "../domain/types.ts";
import { LAUNCH_RESIDENTS } from "../fixtures/launch-residents.ts";

const PUBLIC_RESIDENT_IDENTITIES = new Map(
	LAUNCH_RESIDENTS.map((resident) => [resident.id, resident]),
);

export function toPublicWorldSnapshot(state: WorldState): PublicWorldSnapshot {
	const clock = homeClockForLogicalTick(state.logicalTick);
	const residents = state.residents.map((resident) => {
		const identity = PUBLIC_RESIDENT_IDENTITIES.get(resident.id);
		if (!identity) {
			throw new TypeError(
				`World resident ${resident.id} is not in the approved launch registry.`,
			);
		}
		return {
			id: resident.id,
			name: identity.displayName,
			role: identity.role,
			visualVariantId: identity.visualVariantId,
			roomId: resident.roomId,
			activity: resident.activity,
		};
	});
	return PublicWorldSnapshotSchema.parse({
		schemaVersion: PUBLIC_WORLD_SCHEMA_VERSION,
		worldId: state.worldId,
		logicalTick: state.logicalTick,
		homeTime: clock.homeTime,
		dayPeriod: clock.dayPeriod,
		throughSequence: state.throughSequence,
		stateHash: canonicalStateHash(state),
		rooms: state.rooms,
		residents,
		scene: state.scene
			? {
					id: state.scene.id,
					premise: state.scene.premise,
					locationId: state.scene.locationId,
					participantIds: state.scene.participantIds,
					startedAtTick: state.scene.startedAtTick,
					durationTicks: state.scene.durationTicks,
					presentationDurationMs: state.scene.presentationDurationMs,
					turns: state.scene.turns.map((turn) => ({
						id: turn.id,
						speakerId: turn.speakerId,
						exactModelId: turn.exactModelId,
						text: turn.text,
					})),
					deliveryMode: state.scene.deliveryMode,
					originalRevisionId: state.scene.originalRevisionId,
					originalSceneKey: state.scene.originalSceneKey,
				}
			: null,
		quiet: state.quiet,
	});
}
