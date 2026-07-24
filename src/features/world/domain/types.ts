export const WORLD_SCHEMA_VERSION = 1 as const;

export const HISTORICAL_CLAIM_CATEGORIES = [
	"documented",
	"reported",
	"exaggeration",
] as const;

export type HistoricalClaimCategory =
	(typeof HISTORICAL_CLAIM_CATEGORIES)[number];

export type HistoricalClaimVersion = {
	claimVersionId: string;
	claimId: string;
	versionKey: string;
	residentId: string;
	stableOrder: number;
	category: HistoricalClaimCategory;
	statement: string;
	scope: {
		residentId: string;
		exactModelIds: string[];
	};
	source: {
		title: string;
		url: string;
		accessedOn: string;
	};
	confidence: "high" | "medium";
	editorialStatus: "approved" | "rejected";
};

export type CharacterTrait = {
	id: string;
	stableOrder: number;
	active: boolean;
	label: string;
	guidance: string;
	approvedClaimIds: string[];
};

export type CharacterBibleVersion = {
	bibleVersionId: string;
	versionKey: string;
	residentId: string;
	role: string;
	routines: string[];
	traits: CharacterTrait[];
	dignityNotes: string;
	avoidanceNotes: string;
	promptSubset: string;
};

export type LaunchResident = {
	id: string;
	displayOrder: number;
	displayName: string;
	role: string;
	routines: string[];
	visualVariantId: string;
	requestedModelId: string;
	canonicalModelId: string;
	approvedUpstream: string;
	requiredQuantization?: "fp4" | "fp8";
	maxOutputTokens: 180 | 1024;
	reasoning?: Readonly<
		| { max_tokens: 128; exclude: true }
		| { enabled: false; effort: "none"; exclude: true }
	>;
	transport: "openrouter";
	adapterVersion: "@openrouter/ai-sdk-provider@3.0.0";
	routingPolicyVersion: "strict-openrouter-v1";
	modelVersionId: string;
	modelVersionKey: string;
	bibleVersionKey: string;
	claimSetVersion: string;
};

export type WorldRoomId =
	| "common-room"
	| "memory-garden"
	| "library"
	| "tea-nook";

export type WorldRoom = {
	id: WorldRoomId;
	name: string;
};

export type WorldResident = {
	id: string;
	name: string;
	roomId: WorldRoomId;
	activity: string;
	nextEligibleTick: number;
};

export type WorldRelationship = {
	residentAId: string;
	residentBId: string;
	affinity: number;
};

export type WorldDialogueTurn = {
	id: string;
	speakerId: string;
	exactModelId?: string;
	text: string;
};

export type CompleteWorldScene = {
	id: string;
	premise: string;
	locationId: WorldRoomId;
	participantIds: string[];
	startedAtTick: number;
	durationTicks: number;
	presentationDurationMs: number;
	turns: WorldDialogueTurn[];
};

export type QuietWorldStatus = {
	reason: "between-scenes" | "scene-unavailable";
	locationId: WorldRoomId;
	message: string;
};

export type WorldState = {
	schemaVersion: typeof WORLD_SCHEMA_VERSION;
	worldId: string;
	logicalTick: number;
	throughSequence: number;
	rooms: WorldRoom[];
	residents: WorldResident[];
	relationships: WorldRelationship[];
	scene: CompleteWorldScene | null;
	quiet: QuietWorldStatus | null;
};

type WorldEventBase<TType extends string, TPayload> = {
	schemaVersion: typeof WORLD_SCHEMA_VERSION;
	sequence: number;
	occurrenceKey: string;
	logicalTick: number;
	type: TType;
	payload: TPayload;
};

export type ResidentLocationChangedEvent = WorldEventBase<
	"resident_location_changed",
	{
		residentId: string;
		roomId: WorldRoomId;
		activity: string;
		nextEligibleTick: number;
	}
>;

export type QuietRoutineStartedEvent = WorldEventBase<
	"quiet_routine_started",
	{
		residentId: string;
		locationId: WorldRoomId;
		activity: string;
	}
>;

export type SceneStartedEvent = WorldEventBase<
	"scene_started",
	{ scene: CompleteWorldScene }
>;

export type SceneGenerationRequestedEvent = WorldEventBase<
	"scene_generation_requested",
	{
		sceneKey: string;
		expectedWorldHead: number;
	}
>;

export type ScenePublishedEvent = WorldEventBase<
	"scene_published",
	{ scene: CompleteWorldScene; revisionId: string }
>;

export type SceneCompletedEvent = WorldEventBase<
	"scene_completed",
	{ sceneId: string; locationId: WorldRoomId }
>;

export type RelationshipChangedEvent = WorldEventBase<
	"relationship_changed",
	{
		residentAId: string;
		residentBId: string;
		delta: number;
	}
>;

export type WorldInitializedEvent = WorldEventBase<
	"world_initialized",
	{ state: WorldState }
>;

export type WorldEvent =
	| WorldInitializedEvent
	| ResidentLocationChangedEvent
	| QuietRoutineStartedEvent
	| SceneStartedEvent
	| SceneGenerationRequestedEvent
	| ScenePublishedEvent
	| SceneCompletedEvent
	| RelationshipChangedEvent;

export type WorldRule = {
	id: string;
	evaluate: (
		state: WorldState,
		logicalTick: number,
		seed: number,
	) => WorldEvent[];
};
