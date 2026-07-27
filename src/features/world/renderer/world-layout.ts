import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import {
	RESIDENT_VISUAL_STYLES,
	type RenderResident,
	type RenderRoom,
	type ResidentVisualVariant,
	type WorldPoint,
} from "./renderer-types.ts";
import { ESTABLISHING_VIEW } from "./world-geometry.ts";

export const ROOM_LAYOUT = {
	"common-room": {
		x: 144,
		y: 96,
		width: 224,
		height: 224,
		structuralCue: "hearth",
	},
	"memory-garden": {
		x: 0,
		y: 96,
		width: 144,
		height: 224,
		structuralCue: "garden",
	},
	library: {
		x: 368,
		y: 0,
		width: 144,
		height: 160,
		structuralCue: "bookshelves",
	},
	"tea-nook": {
		x: 368,
		y: 160,
		width: 144,
		height: 160,
		structuralCue: "counter",
	},
} as const;

const ROOM_ANCHORS: Record<string, readonly { x: number; y: number }[]> = {
	"common-room": [
		{ x: 192, y: 160 },
		{ x: 240, y: 160 },
		{ x: 288, y: 160 },
		{ x: 336, y: 160 },
		{ x: 192, y: 240 },
		{ x: 240, y: 240 },
		{ x: 288, y: 240 },
		{ x: 336, y: 240 },
	],
	"memory-garden": [
		{ x: 32, y: 144 },
		{ x: 80, y: 144 },
		{ x: 112, y: 192 },
		{ x: 32, y: 256 },
		{ x: 80, y: 272 },
		{ x: 112, y: 288 },
	],
	library: [
		{ x: 400, y: 64 },
		{ x: 448, y: 64 },
		{ x: 400, y: 112 },
		{ x: 464, y: 112 },
	],
	"tea-nook": [
		{ x: 400, y: 208 },
		{ x: 464, y: 208 },
		{ x: 400, y: 272 },
		{ x: 464, y: 272 },
	],
};

const ROOM_WAYPOINTS: Record<string, readonly WorldPoint[]> = {
	"memory-garden": [
		{ x: 32, y: 176 },
		{ x: 112, y: 176 },
		{ x: 112, y: 272 },
		{ x: 48, y: 288 },
	],
	"common-room": [
		{ x: 176, y: 208 },
		{ x: 336, y: 208 },
		{ x: 336, y: 288 },
		{ x: 176, y: 288 },
	],
	library: [
		{ x: 400, y: 48 },
		{ x: 480, y: 48 },
		{ x: 480, y: 128 },
		{ x: 400, y: 128 },
	],
	"tea-nook": [
		{ x: 400, y: 192 },
		{ x: 480, y: 192 },
		{ x: 480, y: 288 },
		{ x: 400, y: 288 },
	],
};

const RESIDENT_PRESENTATION_INTENTS = {
	"gpt-4o": { pose: "seated", facing: "right", movementIntent: "settled" },
	"claude-sonnet-4.5": {
		pose: "seated",
		facing: "left",
		movementIntent: "settled",
	},
	"gemini-2.5-pro": {
		pose: "listen",
		facing: "left",
		movementIntent: "listening",
	},
	"deepseek-v3.2": { pose: "walk", facing: "right", movementIntent: "walking" },
	"llama-3.3-70b-instruct": {
		pose: "neutral",
		facing: "right",
		movementIntent: "idle",
	},
	"qwen3-235b-a22b-2507": {
		pose: "listen",
		facing: "left",
		movementIntent: "listening",
	},
} as const;

export function projectRooms(
	rooms: PublicWorldSnapshot["rooms"],
): RenderRoom[] {
	return rooms.flatMap((room) => {
		const layout = ROOM_LAYOUT[room.id as keyof typeof ROOM_LAYOUT];
		return layout ? [{ ...room, label: room.name, ...layout }] : [];
	});
}

export function projectResidents(
	residents: PublicWorldSnapshot["residents"],
): RenderResident[] {
	const usedByRoom = new Map<string, number>();
	return residents.map((resident) => {
		const roomIndex = usedByRoom.get(resident.roomId) ?? 0;
		usedByRoom.set(resident.roomId, roomIndex + 1);
		const anchors = ROOM_ANCHORS[resident.roomId] ?? [
			{
				x: ESTABLISHING_VIEW.centerX,
				y: ESTABLISHING_VIEW.centerY,
			},
		];
		const anchor = anchors[roomIndex % anchors.length];
		if (!(resident.visualVariantId in RESIDENT_VISUAL_STYLES)) {
			throw new TypeError(
				`Unknown resident visual variant: ${resident.visualVariantId}`,
			);
		}
		return {
			...resident,
			renderId: `resident:${resident.id}` as const,
			x: anchor.x,
			y: anchor.y,
			waypoints: ROOM_WAYPOINTS[resident.roomId] ?? [anchor],
			variant: resident.visualVariantId as ResidentVisualVariant,
			...RESIDENT_PRESENTATION_INTENTS[
				resident.id as keyof typeof RESIDENT_PRESENTATION_INTENTS
			],
		};
	});
}
