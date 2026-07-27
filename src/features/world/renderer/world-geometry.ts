export const WORLD_WIDTH = 512;
export const WORLD_HEIGHT = 384;
export const VIEWPORT_WIDTH = 352;
export const VIEWPORT_HEIGHT = 256;
export const TILE_SIZE = 16;

export const ESTABLISHING_VIEW = {
	centerX: 256,
	centerY: 192,
	zoom: 1,
} as const;

export const WORLD_BOUNDS = {
	x: 0,
	y: 0,
	width: WORLD_WIDTH,
	height: WORLD_HEIGHT,
} as const;
