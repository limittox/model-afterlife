import { canonicalStateHash } from "./canonical.ts";
import { reduceWorldEvent } from "./events.ts";
import type { WorldEvent, WorldState } from "./types.ts";

function compareEvents(left: WorldEvent, right: WorldEvent): number {
	return left.logicalTick - right.logicalTick || left.sequence - right.sequence;
}

export function replayWorldEvents(
	initialState: WorldState,
	events: WorldEvent[],
): WorldState {
	const seenOccurrences = new Set<string>();
	let state = initialState;

	for (const event of [...events].sort(compareEvents)) {
		if (seenOccurrences.has(event.occurrenceKey)) {
			continue;
		}
		seenOccurrences.add(event.occurrenceKey);
		state = reduceWorldEvent(state, event);
	}

	return state;
}

export function rebuildProjection(
	initialState: WorldState,
	events: WorldEvent[],
): { state: WorldState; stateHash: string } {
	const state = replayWorldEvents(initialState, events);
	return { state, stateHash: canonicalStateHash(state) };
}
