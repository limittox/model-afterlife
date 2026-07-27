import {
	VIEWPORT_HEIGHT,
	VIEWPORT_WIDTH,
} from "./world-geometry.ts";

export function calculateIntegerDisplayScale(
	availableWidth: number,
	availableHeight: number,
	baseWidth = VIEWPORT_WIDTH,
	baseHeight = VIEWPORT_HEIGHT,
): number {
	const widthScale = Math.floor(availableWidth / baseWidth);
	const heightScale = Math.floor(availableHeight / baseHeight);
	return Math.max(1, Math.min(4, widthScale, heightScale));
}

export function sizeCanvasAtIntegerScale(
	canvas: HTMLCanvasElement,
	availableWidth: number,
	availableHeight: number,
): number {
	const scale = calculateIntegerDisplayScale(
		availableWidth,
		availableHeight,
		canvas.width,
		canvas.height,
	);
	canvas.style.width = `${canvas.width * scale}px`;
	canvas.style.height = `${canvas.height * scale}px`;
	canvas.style.margin = "0";
	canvas.dataset.displayScale = String(scale);
	return scale;
}
