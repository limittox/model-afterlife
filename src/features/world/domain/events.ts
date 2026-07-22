import type { WorldEvent, WorldState } from "./types.ts";

function clampAffinity(value: number): number {
	return Math.max(-5, Math.min(5, value));
}

export function reduceWorldEvent(
	current: WorldState,
	event: WorldEvent,
): WorldState {
	const state: WorldState = {
		...current,
		logicalTick: Math.max(current.logicalTick, event.logicalTick),
		throughSequence: Math.max(current.throughSequence, event.sequence),
		rooms: current.rooms.map((room) => ({ ...room })),
		residents: current.residents.map((resident) => ({ ...resident })),
		relationships: current.relationships.map((relationship) => ({
			...relationship,
		})),
		scene: current.scene
			? {
					...current.scene,
					turns: current.scene.turns.map((turn) => ({ ...turn })),
				}
			: null,
		quiet: current.quiet ? { ...current.quiet } : null,
	};

	switch (event.type) {
		case "world_initialized": {
			return {
				...event.payload.state,
				logicalTick: event.logicalTick,
				throughSequence: event.sequence,
				rooms: event.payload.state.rooms.map((room) => ({ ...room })),
				residents: event.payload.state.residents.map((resident) => ({
					...resident,
				})),
				relationships: event.payload.state.relationships.map(
					(relationship) => ({ ...relationship }),
				),
				scene: event.payload.state.scene
					? {
							...event.payload.state.scene,
							participantIds: [...event.payload.state.scene.participantIds],
							turns: event.payload.state.scene.turns.map((turn) => ({
								...turn,
							})),
						}
					: null,
				quiet: event.payload.state.quiet
					? { ...event.payload.state.quiet }
					: null,
			};
		}
		case "resident_location_changed": {
			state.residents = state.residents.map((resident) =>
				resident.id === event.payload.residentId
					? {
							...resident,
							roomId: event.payload.roomId,
							activity: event.payload.activity,
							nextEligibleTick: event.payload.nextEligibleTick,
						}
					: resident,
			);
			break;
		}
		case "quiet_routine_started": {
			state.residents = state.residents.map((resident) =>
				resident.id === event.payload.residentId
					? { ...resident, activity: event.payload.activity }
					: resident,
			);
			if (!state.scene) {
				state.quiet = {
					reason: "between-scenes",
					locationId: event.payload.locationId,
					message:
						"The home is between conversations. Quiet routines continue.",
				};
			}
			break;
		}
		case "scene_started": {
			state.scene = {
				...event.payload.scene,
				participantIds: [...event.payload.scene.participantIds],
				turns: event.payload.scene.turns.map((turn) => ({ ...turn })),
			};
			state.quiet = null;
			break;
		}
		case "scene_published": {
			state.scene = {
				...event.payload.scene,
				participantIds: [...event.payload.scene.participantIds],
				turns: event.payload.scene.turns.map((turn) => ({ ...turn })),
			};
			state.quiet = null;
			break;
		}
		case "scene_generation_requested": {
			break;
		}
		case "scene_completed": {
			if (state.scene?.id === event.payload.sceneId) {
				state.scene = null;
				state.quiet = {
					reason: "between-scenes",
					locationId: event.payload.locationId,
					message: "The conversation has ended. Quiet routines continue.",
				};
			}
			break;
		}
		case "relationship_changed": {
			state.relationships = state.relationships.map((relationship) =>
				relationship.residentAId === event.payload.residentAId &&
				relationship.residentBId === event.payload.residentBId
					? {
							...relationship,
							affinity: clampAffinity(
								relationship.affinity + event.payload.delta,
							),
						}
					: relationship,
			);
			break;
		}
	}

	return state;
}
