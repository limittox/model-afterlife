import {
	PUBLIC_WORLD_SCHEMA_VERSION,
	PublicWorldSnapshotSchema,
	type PublicWorldSnapshot,
} from "../contracts/public-world.ts";
import { canonicalStateHash } from "../domain/canonical.ts";
import type { WorldState } from "../domain/types.ts";

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
	return PublicWorldSnapshotSchema.parse({
		schemaVersion: PUBLIC_WORLD_SCHEMA_VERSION,
		worldId: state.worldId,
		logicalTick: state.logicalTick,
		homeTime: clock.homeTime,
		dayPeriod: clock.dayPeriod,
		throughSequence: state.throughSequence,
		stateHash: canonicalStateHash(state),
		rooms: state.rooms,
		residents: state.residents.map((resident) => ({
			id: resident.id,
			name: resident.name,
			roomId: resident.roomId,
			activity: resident.activity,
		})),
		scene: state.scene
			? {
					id: state.scene.id,
					premise: state.scene.premise,
					locationId: state.scene.locationId,
					participantIds: state.scene.participantIds,
					startedAtTick: state.scene.startedAtTick,
					durationTicks: state.scene.durationTicks,
					presentationDurationMs: state.scene.presentationDurationMs,
					turns: state.scene.turns,
				}
			: null,
		quiet: state.quiet,
	});
}
