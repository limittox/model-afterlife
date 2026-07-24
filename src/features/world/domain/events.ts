import type { WorldEvent, WorldState } from "./types.ts";
import { recordSharedExperience } from "./memories.ts";
import {
	applyRelationshipEffects,
	relationshipEffectFromEvent,
} from "./relationships.ts";

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
			recentExperienceIds: [...relationship.recentExperienceIds],
		})),
		memories: current.memories.map((memory) => ({
			...memory,
			participantIds: [...memory.participantIds],
			tags: [...memory.tags],
		})),
		appliedRelationshipEffectKeys: [
			...current.appliedRelationshipEffectKeys,
		],
		sceneHistory: current.sceneHistory.map((record) => ({
			...record,
			participantIds: [...record.participantIds],
		})),
		pendingSceneRequest: current.pendingSceneRequest
			? {
					...current.pendingSceneRequest,
					participantIds: [...current.pendingSceneRequest.participantIds],
				}
			: null,
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
					(relationship) => ({
						...relationship,
						recentExperienceIds: [...relationship.recentExperienceIds],
					}),
				),
				memories: event.payload.state.memories.map((memory) => ({
					...memory,
					participantIds: [...memory.participantIds],
					tags: [...memory.tags],
				})),
				appliedRelationshipEffectKeys: [
					...event.payload.state.appliedRelationshipEffectKeys,
				],
				sceneHistory: event.payload.state.sceneHistory.map((record) => ({
					...record,
					participantIds: [...record.participantIds],
				})),
				pendingSceneRequest: event.payload.state.pendingSceneRequest
					? {
							...event.payload.state.pendingSceneRequest,
							participantIds: [
								...event.payload.state.pendingSceneRequest.participantIds,
							],
						}
					: null,
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
			state.sceneHistory = [
				...state.sceneHistory,
				{
					revisionId: event.payload.revisionId,
					sceneKey: event.payload.sceneKey,
					briefId: event.payload.briefId,
					participantIds: [...event.payload.scene.participantIds].sort(),
					publishedAtTick: event.logicalTick,
				},
			].slice(-60);
			state.pendingSceneRequest = null;
			state.quiet = null;
			break;
		}
		case "scene_generation_requested": {
			state.pendingSceneRequest = {
				sceneKey: event.payload.sceneKey,
				briefId: event.payload.brief.briefId,
				participantIds: [...event.payload.brief.participantIds].sort(),
				requestedAtTick: event.logicalTick,
				expectedWorldHead: event.payload.expectedWorldHead,
			};
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
		case "relationship_effect_applied": {
			const applied = applyRelationshipEffects(
				state.relationships,
				[relationshipEffectFromEvent(event)],
				state.appliedRelationshipEffectKeys,
			);
			state.relationships = applied.relationships;
			state.appliedRelationshipEffectKeys = applied.appliedEffectKeys;
			break;
		}
		case "shared_experience_recorded": {
			const recorded = recordSharedExperience(
				state.memories,
				state.relationships,
				event.payload.memory,
			);
			state.memories = recorded.memories;
			state.relationships = recorded.relationships;
			break;
		}
	}

	return state;
}
