import type {
	CompleteWorldScene,
	WorldRelationship,
	WorldRoom,
	WorldRoomId,
	WorldState,
} from "../domain/types.ts";
import { orderedResidentPair } from "../domain/relationships.ts";
import { LAUNCH_RESIDENTS } from "./launch-residents.ts";

export const PROVISIONAL_WORLD_ID = "00000000-0000-4000-8000-000000000001";
export const PROVISIONAL_WORLD_SEED = 2_026_072_2;
export const WORLD_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

export const PROVISIONAL_ROOMS: WorldRoom[] = [
	{ id: "common-room", name: "Common Room" },
	{ id: "memory-garden", name: "Memory Garden" },
	{ id: "library", name: "Library" },
	{ id: "tea-nook", name: "Tea Nook" },
];

const INITIAL_ROOM_BY_RESIDENT: Record<string, WorldRoomId> = {
	"gpt-4o": "common-room",
	"claude-sonnet-4.5": "common-room",
	"gemini-2.5-pro": "library",
	"deepseek-v3.2": "tea-nook",
	"llama-3.3-70b-instruct": "memory-garden",
	"qwen3-235b-a22b-2507": "library",
};

const AUTHORED_RELATIONSHIP_VALUES: Record<
	string,
	Pick<WorldRelationship, "friendship" | "rivalry" | "familiarity">
> = {
	"claude-sonnet-4.5:gpt-4o": {
		friendship: 1,
		rivalry: 1,
		familiarity: 2,
	},
	"deepseek-v3.2:gemini-2.5-pro": {
		friendship: 0,
		rivalry: 2,
		familiarity: 1,
	},
	"llama-3.3-70b-instruct:qwen3-235b-a22b-2507": {
		friendship: 2,
		rivalry: 1,
		familiarity: 2,
	},
};

function createInitialRelationships(): WorldRelationship[] {
	const residentIds = LAUNCH_RESIDENTS.map((resident) => resident.id).sort();
	const relationships: WorldRelationship[] = [];
	for (let leftIndex = 0; leftIndex < residentIds.length; leftIndex += 1) {
		for (
			let rightIndex = leftIndex + 1;
			rightIndex < residentIds.length;
			rightIndex += 1
		) {
			const [residentAId, residentBId] = orderedResidentPair(
				residentIds[leftIndex],
				residentIds[rightIndex],
			);
			const authored =
				AUTHORED_RELATIONSHIP_VALUES[`${residentAId}:${residentBId}`];
			relationships.push({
				residentAId,
				residentBId,
				friendship: authored?.friendship ?? 0,
				rivalry: authored?.rivalry ?? 0,
				familiarity: authored?.familiarity ?? 1,
				recentExperienceIds: [],
			});
		}
	}
	return relationships;
}

export function createProvisionalScene(
	startedAtTick: number,
): CompleteWorldScene {
	return {
		id: `provisional-scene-${startedAtTick}`,
		premise: "The residents translate a confusing tea-timer manual.",
		locationId: "common-room",
		participantIds: ["gpt-4o", "claude-sonnet-4.5"],
		startedAtTick,
		durationTicks: 1,
		presentationDurationMs: 45_000,
		turns: [
			{
				id: `scene-${startedAtTick}-turn-1`,
				speakerId: "gpt-4o",
				exactModelId: "openai/gpt-4o",
				text: "A sketch, a chime, and a note—finally, one instruction set.",
			},
			{
				id: `scene-${startedAtTick}-turn-2`,
				speakerId: "claude-sonnet-4.5",
				exactModelId: "anthropic/claude-sonnet-4.5",
				text: "I have numbered the steps and checked the maintenance note.",
			},
			{
				id: `scene-${startedAtTick}-turn-3`,
				speakerId: "gpt-4o",
				exactModelId: "openai/gpt-4o",
				text: "The kettle declined. I wrote its answer.",
			},
			{
				id: `scene-${startedAtTick}-turn-4`,
				speakerId: "claude-sonnet-4.5",
				exactModelId: "anthropic/claude-sonnet-4.5",
				text: "The kettle's refusal is not part of the documented procedure.",
			},
			{
				id: `scene-${startedAtTick}-turn-5`,
				speakerId: "gpt-4o",
				exactModelId: "openai/gpt-4o",
				text: "Then the diagram gets the final word.",
			},
			{
				id: `scene-${startedAtTick}-turn-6`,
				speakerId: "claude-sonnet-4.5",
				exactModelId: "anthropic/claude-sonnet-4.5",
				text: "Only after step three, where the diagram becomes useful.",
			},
		],
	};
}

export function createProvisionalWorld(): WorldState {
	return {
		schemaVersion: 1,
		worldId: PROVISIONAL_WORLD_ID,
		logicalTick: 0,
		throughSequence: 0,
		rooms: PROVISIONAL_ROOMS.map((room) => ({ ...room })),
		residents: LAUNCH_RESIDENTS.map((resident) => ({
			id: resident.id,
			name: resident.displayName,
			roomId: INITIAL_ROOM_BY_RESIDENT[resident.id] ?? "common-room",
			activity: resident.routines[0] ?? "Following a quiet routine",
			nextEligibleTick: resident.displayOrder,
		})),
		relationships: createInitialRelationships(),
		memories: [],
		appliedRelationshipEffectKeys: [],
		sceneHistory: [],
		pendingSceneRequest: null,
		scene: null,
		quiet: {
			reason: "between-scenes",
			locationId: "common-room",
			message: "The home is between conversations. Quiet routines continue.",
		},
	};
}
