import type { PresentationMode } from "../client/presentation-types.ts";

export type PresentationTokens = {
	colors: {
		dominant: string;
		secondary: string;
		accent: string;
		text: string;
		muted: string;
		border: string;
	};
	tileSize: 16;
};

export const PRESENTATION_TOKENS: PresentationTokens = {
	colors: {
		dominant: "#171b26",
		secondary: "#272f40",
		accent: "#e4b65a",
		text: "#f4ecd8",
		muted: "#b9b5aa",
		border: "#465066",
	},
	tileSize: 16,
};

export const RESIDENT_VISUAL_STYLES = {
	"amber-waistcoat-short-stack": {
		bodyColor: 0xb7793f,
		accentColor: 0xf2c66d,
		headWidth: 12,
		shoulderWidth: 16,
		bodyHeight: 15,
		accessory: "waistcoat",
	},
	"navy-cardigan-tall-bookish": {
		bodyColor: 0x536987,
		accentColor: 0xb8c5d9,
		headWidth: 10,
		shoulderWidth: 14,
		bodyHeight: 17,
		accessory: "cardigan",
	},
	"violet-shawl-round-satchel": {
		bodyColor: 0x816b96,
		accentColor: 0xd1b9df,
		headWidth: 14,
		shoulderWidth: 18,
		bodyHeight: 13,
		accessory: "shawl",
	},
	"teal-apron-square-glasses": {
		bodyColor: 0x4d8581,
		accentColor: 0x9dd0c8,
		headWidth: 12,
		shoulderWidth: 14,
		bodyHeight: 14,
		accessory: "apron",
	},
	"rust-overalls-broad-brim": {
		bodyColor: 0x9a6247,
		accentColor: 0xd5a36f,
		headWidth: 10,
		shoulderWidth: 18,
		bodyHeight: 15,
		accessory: "broad-brim",
	},
	"jade-coat-many-tabbed-satchel": {
		bodyColor: 0x4f806c,
		accentColor: 0xa8d6b6,
		headWidth: 14,
		shoulderWidth: 16,
		bodyHeight: 17,
		accessory: "tabbed-satchel",
	},
} as const;

export type ResidentVisualVariant = keyof typeof RESIDENT_VISUAL_STYLES;

export type WorldPoint = {
	x: number;
	y: number;
};

export type RenderRoom = {
	id: string;
	label: string;
	x: number;
	y: number;
	width: number;
	height: number;
	structuralCue: "garden" | "bookshelves" | "hearth" | "counter";
};

export type RenderResident = {
	id: string;
	renderId: `resident:${string}`;
	name: string;
	role: string;
	roomId: string;
	activity: string;
	x: number;
	y: number;
	waypoints: readonly WorldPoint[];
	variant: ResidentVisualVariant;
	pose: "neutral" | "seated" | "listen" | "speak" | "walk";
	facing: "left" | "right";
	movementIntent: "idle" | "settled" | "listening" | "walking";
};

export type RenderActiveTurn = {
	id: string;
	speakerId: string;
	speakerRenderId: `resident:${string}`;
	text: string;
};

export type RenderScene = {
	id: string;
	locationId: string;
	participantIds: string[];
	activeTurn: RenderActiveTurn | null;
};

export type RenderWorldState = {
	worldId: string;
	logicalTick: number;
	throughSequence: number;
	stateHash: string;
	mode: PresentationMode;
	reducedMotion: boolean;
	followedResidentId: string | null;
	manualPan: boolean;
	showSpeechBubble: boolean;
	rooms: RenderRoom[];
	residents: RenderResident[];
	scene: RenderScene | null;
};

export type RendererIntent =
	| { type: "residentSelected"; residentId: string; residentName: string }
	| { type: "manualPanStarted" }
	| {
			type: "cameraSettled";
			x: number;
			y: number;
			zoom: number;
			reason: "manual" | "automatic" | "reset";
	  };

export type RendererControl =
	| { type: "zoomBy"; delta: -1 | 1 }
	| { type: "panBy"; dx: number; dy: number }
	| { type: "resetView" };

export type RendererControlEnvelope = {
	sequence: number;
	control: RendererControl;
};
