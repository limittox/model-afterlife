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
	roomId: string;
	activity: string;
	x: number;
	y: number;
	variant: number;
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
	  };

