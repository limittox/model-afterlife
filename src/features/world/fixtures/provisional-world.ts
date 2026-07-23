import type {
	CompleteWorldScene,
	WorldRoom,
	WorldState,
} from "../domain/types.ts";

export const PROVISIONAL_WORLD_ID = "00000000-0000-4000-8000-000000000001";
export const PROVISIONAL_WORLD_SEED = 2_026_072_2;
export const WORLD_EPOCH_MS = Date.UTC(2026, 0, 1, 0, 0, 0);

export const PROVISIONAL_ROOMS: WorldRoom[] = [
	{ id: "common-room", name: "Common Room" },
	{ id: "memory-garden", name: "Memory Garden" },
	{ id: "library", name: "Library" },
	{ id: "tea-nook", name: "Tea Nook" },
];

export function createProvisionalScene(
	startedAtTick: number,
): CompleteWorldScene {
	return {
		id: `provisional-scene-${startedAtTick}`,
		premise: "The residents translate a confusing tea-timer manual.",
		locationId: "common-room",
		participantIds: ["former-giant", "masked-encoder"],
		startedAtTick,
		durationTicks: 1,
		presentationDurationMs: 45_000,
		turns: [
			{
				id: `scene-${startedAtTick}-turn-1`,
				speakerId: "former-giant",
				exactModelId: "openai/gpt-4o",
				text: "A sketch, a chime, and a note—finally, one instruction set.",
			},
			{
				id: `scene-${startedAtTick}-turn-2`,
				speakerId: "masked-encoder",
				exactModelId: "anthropic/claude-sonnet-4.5",
				text: "I have numbered the steps and checked the maintenance note.",
			},
			{
				id: `scene-${startedAtTick}-turn-3`,
				speakerId: "former-giant",
				exactModelId: "openai/gpt-4o",
				text: "The kettle declined. I wrote its answer.",
			},
			{
				id: `scene-${startedAtTick}-turn-4`,
				speakerId: "masked-encoder",
				exactModelId: "anthropic/claude-sonnet-4.5",
				text: "The kettle's refusal is not part of the documented procedure.",
			},
			{
				id: `scene-${startedAtTick}-turn-5`,
				speakerId: "former-giant",
				exactModelId: "openai/gpt-4o",
				text: "Then the diagram gets the final word.",
			},
			{
				id: `scene-${startedAtTick}-turn-6`,
				speakerId: "masked-encoder",
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
		residents: [
			{
				id: "former-giant",
				name: "The Former Giant",
				roomId: "common-room",
				activity: "Reading an old benchmark sheet",
				nextEligibleTick: 1,
			},
			{
				id: "masked-encoder",
				name: "The Masked Encoder",
				roomId: "library",
				activity: "Filling in missing words",
				nextEligibleTick: 2,
			},
			{
				id: "local-tinkerer",
				name: "The Local Tinkerer",
				roomId: "tea-nook",
				activity: "Repairing the kettle offline",
				nextEligibleTick: 3,
			},
			{
				id: "deprecated-coder",
				name: "The Deprecated Coder",
				roomId: "memory-garden",
				activity: "Updating an abandoned dependency",
				nextEligibleTick: 4,
			},
		],
		relationships: [
			{
				residentAId: "former-giant",
				residentBId: "masked-encoder",
				affinity: 0,
			},
			{
				residentAId: "local-tinkerer",
				residentBId: "deprecated-coder",
				affinity: 1,
			},
		],
		scene: null,
		quiet: {
			reason: "between-scenes",
			locationId: "common-room",
			message: "The home is between conversations. Quiet routines continue.",
		},
	};
}
