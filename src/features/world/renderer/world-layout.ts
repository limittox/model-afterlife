import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import type { RenderResident, RenderRoom } from "./renderer-types.ts";

export const HOME_WIDTH = 352;
export const HOME_HEIGHT = 256;

const ROOM_LAYOUT = {
	"common-room": {
		x: 88,
		y: 72,
		width: 176,
		height: 160,
		structuralCue: "hearth",
	},
	"memory-garden": {
		x: 8,
		y: 8,
		width: 112,
		height: 80,
		structuralCue: "garden",
	},
	library: {
		x: 232,
		y: 8,
		width: 112,
		height: 80,
		structuralCue: "bookshelves",
	},
	"tea-nook": {
		x: 264,
		y: 152,
		width: 80,
		height: 80,
		structuralCue: "counter",
	},
} as const;

const ROOM_ANCHORS: Record<string, readonly { x: number; y: number }[]> = {
	"common-room": [
		{ x: 136, y: 144 },
		{ x: 208, y: 144 },
		{ x: 144, y: 192 },
		{ x: 208, y: 192 },
	],
	"memory-garden": [
		{ x: 40, y: 56 },
		{ x: 88, y: 56 },
	],
	library: [
		{ x: 264, y: 56 },
		{ x: 312, y: 56 },
	],
	"tea-nook": [
		{ x: 288, y: 200 },
		{ x: 320, y: 200 },
	],
};

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
	return residents.map((resident, index) => {
		const roomIndex = usedByRoom.get(resident.roomId) ?? 0;
		usedByRoom.set(resident.roomId, roomIndex + 1);
		const anchors = ROOM_ANCHORS[resident.roomId] ?? [
			{ x: HOME_WIDTH / 2, y: HOME_HEIGHT / 2 },
		];
		const anchor = anchors[roomIndex % anchors.length];
		return {
			...resident,
			renderId: `resident:${resident.id}` as const,
			x: anchor.x,
			y: anchor.y,
			variant: index % 4,
		};
	});
}

