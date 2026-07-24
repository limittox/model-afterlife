import type {
	ConnectionState,
	PresentationMode,
} from "../client/presentation-types.ts";
import {
	PublicWorldSnapshotSchema,
	type PublicWorldSnapshot,
} from "../contracts/public-world.ts";
import { LAUNCH_RESIDENTS } from "./launch-residents.ts";

const hash = "a".repeat(64);

const fixtureRoomsByResident: Record<string, string> = {
	"gpt-4o": "common-room",
	"claude-sonnet-4.5": "common-room",
	"gemini-2.5-pro": "library",
	"deepseek-v3.2": "tea-nook",
	"llama-3.3-70b-instruct": "memory-garden",
	"qwen3-235b-a22b-2507": "library",
};

const residents = LAUNCH_RESIDENTS.map((resident) => ({
	id: resident.id,
	name: resident.displayName,
	role: resident.role,
	visualVariantId: resident.visualVariantId,
	roomId: fixtureRoomsByResident[resident.id] ?? "common-room",
	activity: resident.routines[0] ?? "Following a quiet routine",
}));

const rooms = [
	{ id: "common-room", name: "Common Room" },
	{ id: "memory-garden", name: "Memory Garden" },
	{ id: "library", name: "Library" },
	{ id: "tea-nook", name: "Tea Nook" },
];

const activeScene = {
	id: "fixture-scene",
	premise: "The residents translate a confusing tea-timer manual.",
	locationId: "common-room",
	participantIds: ["gpt-4o", "claude-sonnet-4.5"],
	startedAtTick: 42,
	durationTicks: 1,
	presentationDurationMs: 45_000,
	deliveryMode: "live" as const,
	originalRevisionId: "fixture-scene",
	originalSceneKey: "fixture-scene",
	turns: [
		{
			id: "turn-1",
			speakerId: "gpt-4o",
			exactModelId: "openai/gpt-4o",
			text: "A sketch, a chime, and a note—finally, one instruction set.",
		},
		{
			id: "turn-2",
			speakerId: "claude-sonnet-4.5",
			exactModelId: "anthropic/claude-sonnet-4.5",
			text: "I have numbered the steps and checked the maintenance note.",
		},
		{
			id: "turn-3",
			speakerId: "gpt-4o",
			exactModelId: "openai/gpt-4o",
			text: "The kettle declined. I wrote its answer.",
		},
		{
			id: "turn-4",
			speakerId: "claude-sonnet-4.5",
			exactModelId: "anthropic/claude-sonnet-4.5",
			text: "The kettle's refusal is not part of the documented procedure.",
		},
		{
			id: "turn-5",
			speakerId: "gpt-4o",
			exactModelId: "openai/gpt-4o",
			text: "Then the diagram gets the final word.",
		},
		{
			id: "turn-6",
			speakerId: "claude-sonnet-4.5",
			exactModelId: "anthropic/claude-sonnet-4.5",
			text: "Only after step three, where the diagram becomes useful.",
		},
	],
};

function validSnapshot(
	overrides: Partial<PublicWorldSnapshot> = {},
): PublicWorldSnapshot {
	return PublicWorldSnapshotSchema.parse({
		schemaVersion: 1,
		worldId: "00000000-0000-4000-8000-000000000001",
		logicalTick: 42,
		homeTime: "09:42",
		dayPeriod: "morning",
		throughSequence: 84,
		stateHash: hash,
		rooms,
		residents,
		scene: null,
		quiet: {
			reason: "between-scenes",
			locationId: "memory-garden",
			message: "The home is between conversations. Quiet routines continue.",
		},
		...overrides,
	});
}

export type UiStateFixture = {
	snapshot: PublicWorldSnapshot | null;
	mode: PresentationMode;
	connection: ConnectionState;
};

export const loadingState: UiStateFixture = {
	snapshot: null,
	mode: "live",
	connection: "opening",
};

export const quietState: UiStateFixture = {
	snapshot: validSnapshot(),
	mode: "live",
	connection: "connected",
};

export const activeSceneState: UiStateFixture = {
	snapshot: validSnapshot({ scene: activeScene, quiet: null }),
	mode: "live",
	connection: "connected",
};

export const pausedState: UiStateFixture = {
	...activeSceneState,
	mode: "paused",
};

export const behindLiveState: UiStateFixture = {
	...activeSceneState,
	mode: "behind-live",
};

export const reconnectingState: UiStateFixture = {
	...activeSceneState,
	connection: "reconnecting",
};

export const hardErrorState: UiStateFixture = {
	snapshot: null,
	mode: "live",
	connection: "error",
};

export const sceneUnavailableState: UiStateFixture = {
	snapshot: validSnapshot({
		scene: null,
		quiet: {
			reason: "scene-unavailable",
			locationId: "common-room",
			message: "Quiet routines continue.",
		},
	}),
	mode: "live",
	connection: "connected",
};

export const overflowState: UiStateFixture = {
	snapshot: validSnapshot({
		scene: {
			...activeScene,
			turns: [
				...activeScene.turns,
				{
					id: "turn-7",
					speakerId: "gpt-4o",
					exactModelId: "openai/gpt-4o",
					text: "I shall annotate my hospitality for the next edition.",
				},
				{
					id: "turn-8",
					speakerId: "claude-sonnet-4.5",
					exactModelId: "anthropic/claude-sonnet-4.5",
					text: "Please begin with a source that exists.",
				},
			],
		},
		quiet: null,
	}),
	mode: "live",
	connection: "connected",
};

export const longTextState: UiStateFixture = {
	snapshot: validSnapshot({
		rooms: [
			{
				id: "common-room",
				name: "The Common Room for Exceptionally Long and Thoughtful Conversations",
			},
			...rooms.slice(1),
		],
		residents: residents.map((resident, index) =>
			index === 0
				? {
						...resident,
						name: "GPT-4o With a Very Long Retirement-Home Display Name",
					}
				: resident,
		),
		scene: {
			...activeScene,
			premise:
				"The residents carefully compare a very long collection of remembered context windows without losing the thread of their gentle disagreement.",
			turns: activeScene.turns.map((turn) => ({
				...turn,
				text: `${turn.text} They continue in complete sentences so natural wrapping, browser zoom, and semantic reading order can be verified without clipping any dialogue.`,
			})),
		},
		quiet: null,
	}),
	mode: "live",
	connection: "connected",
};

export const uiStates = {
	loading: loadingState,
	quiet: quietState,
	active: activeSceneState,
	paused: pausedState,
	behindLive: behindLiveState,
	reconnecting: reconnectingState,
	hardError: hardErrorState,
	unavailable: sceneUnavailableState,
	overflow: overflowState,
	longText: longTextState,
} as const;
