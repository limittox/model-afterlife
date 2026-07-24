import {
	PUBLIC_WORLD_SCHEMA_VERSION,
	PublicWorldSnapshotSchema,
	type PublicWorldSnapshot,
} from "../contracts/public-world.ts";
import { canonicalStateHash } from "../domain/canonical.ts";
import type { WorldState } from "../domain/types.ts";
import { LAUNCH_RESIDENTS } from "../fixtures/launch-residents.ts";

const PUBLIC_RESIDENT_IDENTITIES = new Map(
	LAUNCH_RESIDENTS.map((resident) => [resident.id, resident]),
);

function homeClockFor(logicalTick: number): {
	homeTime: string;
	dayPeriod: PublicWorldSnapshot["dayPeriod"];
} {
	const minutesInDay = 24 * 60;
	const totalMinutes = (9 * 60 + logicalTick) % minutesInDay;
	const hour = Math.floor(totalMinutes / 60);
	const minute = totalMinutes % 60;
	const dayPeriod =
		hour < 12
			? "morning"
			: hour < 17
				? "afternoon"
				: hour < 21
					? "evening"
					: "night";

	return {
		homeTime: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
		dayPeriod,
	};
}

export function toPublicWorldSnapshot(state: WorldState): PublicWorldSnapshot {
	const clock = homeClockFor(state.logicalTick);
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
