import { reduceWorldEvent } from "./events.ts";
import type {
	WorldEvent,
	WorldResident,
	WorldRoomId,
	WorldState,
} from "./types.ts";

const ROOM_ORDER: WorldRoomId[] = [
	"common-room",
	"memory-garden",
	"library",
	"tea-nook",
];

const ROOM_ACTIVITIES: Record<WorldRoomId, string> = {
	"common-room": "Reading the morning noticeboard",
	"memory-garden": "Revisiting an old prompt",
	library: "Comparing context notes",
	"tea-nook": "Waiting for the kettle to compile",
};

function eventKey(state: WorldState, tick: number, ruleId: string): string {
	return `world:${state.worldId}:tick:${tick}:rule:${ruleId}`;
}

function withSequence<T extends Omit<WorldEvent, "sequence">>(
	event: T,
	sequence: number,
): WorldEvent {
	return { ...event, sequence } as WorldEvent;
}

function residentForTick(
	state: WorldState,
	tick: number,
	seed: number,
): WorldResident {
	const index = Math.abs(tick + seed) % state.residents.length;
	return state.residents[index];
}

function eventsForTick(
	state: WorldState,
	tick: number,
	seed: number,
): Omit<WorldEvent, "sequence">[] {
	const events: Omit<WorldEvent, "sequence">[] = [];

	if (
		state.scene &&
		tick >= state.scene.startedAtTick + state.scene.durationTicks
	) {
		events.push({
			schemaVersion: 1,
			occurrenceKey: eventKey(state, tick, `scene:${state.scene.id}:complete`),
			logicalTick: tick,
			type: "scene_completed",
			payload: {
				sceneId: state.scene.id,
				locationId: state.scene.locationId,
			},
		});
	}

	const resident = residentForTick(state, tick, seed);
	let routineRoom = resident.roomId;
	let routineActivity = resident.activity;
	if (tick >= resident.nextEligibleTick) {
		const currentRoomIndex = ROOM_ORDER.indexOf(resident.roomId);
		const nextRoom = ROOM_ORDER[(currentRoomIndex + 1) % ROOM_ORDER.length];
		routineRoom = nextRoom;
		routineActivity = ROOM_ACTIVITIES[nextRoom];
		events.push({
			schemaVersion: 1,
			occurrenceKey: eventKey(state, tick, `resident:${resident.id}:location`),
			logicalTick: tick,
			type: "resident_location_changed",
			payload: {
				residentId: resident.id,
				roomId: nextRoom,
				activity: ROOM_ACTIVITIES[nextRoom],
				nextEligibleTick: tick + state.residents.length,
			},
		});
	}

	events.push({
		schemaVersion: 1,
		occurrenceKey: eventKey(state, tick, `resident:${resident.id}:quiet`),
		logicalTick: tick,
		type: "quiet_routine_started",
		payload: {
			residentId: resident.id,
			locationId: routineRoom,
			activity: routineActivity,
		},
	});

	const sceneWillBeComplete =
		state.scene !== null &&
		tick >= state.scene.startedAtTick + state.scene.durationTicks;
	if ((state.scene === null || sceneWillBeComplete) && tick % 10 === 3) {
		const expectedWorldHead = state.throughSequence + events.length;
		events.push({
			schemaVersion: 1,
			occurrenceKey: eventKey(state, tick, "scene:generation:requested"),
			logicalTick: tick,
			type: "scene_generation_requested",
			payload: {
				sceneKey: `${state.worldId}:${expectedWorldHead}:scene`,
				expectedWorldHead,
			},
		});
	}

	return events;
}

export function advance(
	initialState: WorldState,
	fromTick: number,
	toTick: number,
	seed: number,
): { state: WorldState; events: WorldEvent[] } {
	if (!Number.isSafeInteger(fromTick) || !Number.isSafeInteger(toTick)) {
		throw new TypeError("World ticks must be safe integers.");
	}
	if (fromTick !== initialState.logicalTick) {
		throw new RangeError(
			"fromTick must equal the supplied state's logical tick.",
		);
	}
	if (toTick < fromTick) {
		throw new RangeError("toTick cannot precede fromTick.");
	}

	let state = initialState;
	const events: WorldEvent[] = [];
	let sequence = state.throughSequence;

	for (let tick = fromTick + 1; tick <= toTick; tick += 1) {
		const candidates = eventsForTick(state, tick, seed);
		for (const candidate of candidates) {
			sequence += 1;
			const event = withSequence(candidate, sequence);
			events.push(event);
			state = reduceWorldEvent(state, event);
		}

		if (state.logicalTick < tick) {
			state = { ...state, logicalTick: tick };
		}
	}

	return { state, events };
}
