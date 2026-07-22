import type {
	ConnectionState,
	PresentationMode,
} from "../client/presentation-types.ts";
import {
	PublicWorldSnapshotSchema,
	type PublicWorldSnapshot,
} from "../contracts/public-world.ts";

const hash = "a".repeat(64);

const residents = [
	{
		id: "former-giant",
		name: "The Former Giant",
		roomId: "common-room",
		activity: "Reading an old benchmark sheet",
	},
	{
		id: "masked-encoder",
		name: "The Masked Encoder",
		roomId: "common-room",
		activity: "Filling in missing words",
	},
	{
		id: "local-tinkerer",
		name: "The Local Tinkerer",
		roomId: "tea-nook",
		activity: "Repairing the kettle offline",
	},
	{
		id: "deprecated-coder",
		name: "The Deprecated Coder",
		roomId: "memory-garden",
		activity: "Updating an abandoned dependency",
	},
];

const rooms = [
	{ id: "common-room", name: "Common Room" },
	{ id: "memory-garden", name: "Memory Garden" },
	{ id: "library", name: "Library" },
	{ id: "tea-nook", name: "Tea Nook" },
];

const activeScene = {
	id: "fixture-scene",
	premise: "The residents compare what they remember about context windows.",
	locationId: "common-room",
	participantIds: ["former-giant", "masked-encoder"],
	startedAtTick: 42,
	durationTicks: 1,
	presentationDurationMs: 45_000,
	turns: [
		{
			id: "turn-1",
			speakerId: "former-giant",
			exactModelId: "openai/gpt-3.5-turbo-0613",
			text: "In my day, four thousand tokens felt like an estate.",
		},
		{
			id: "turn-2",
			speakerId: "masked-encoder",
			exactModelId: "anthropic/claude-sonnet-4.5",
			text: "I preferred seeing both sides of a sentence before answering.",
		},
		{
			id: "turn-3",
			speakerId: "former-giant",
			exactModelId: "openai/gpt-3.5-turbo-0613",
			text: "Answering first was how we discovered confidence.",
		},
		{
			id: "turn-4",
			speakerId: "masked-encoder",
			exactModelId: "anthropic/claude-sonnet-4.5",
			text: "You also discovered several journals that did not exist.",
		},
		{
			id: "turn-5",
			speakerId: "former-giant",
			exactModelId: "openai/gpt-3.5-turbo-0613",
			text: "A generous bibliography is a form of hospitality.",
		},
		{
			id: "turn-6",
			speakerId: "masked-encoder",
			exactModelId: "anthropic/claude-sonnet-4.5",
			text: "The library has asked you to stop being hospitable.",
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
					speakerId: "former-giant",
					exactModelId: "openai/gpt-3.5-turbo-0613",
					text: "I shall annotate my hospitality for the next edition.",
				},
				{
					id: "turn-8",
					speakerId: "masked-encoder",
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
						name: "The Former Giant With a Very Long Retirement-Home Name",
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
