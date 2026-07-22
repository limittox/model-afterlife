import { HOME_HEIGHT, HOME_WIDTH } from "./world-layout.ts";

export function calculateIntegerDisplayScale(
	availableWidth: number,
	availableHeight: number,
	baseWidth = HOME_WIDTH,
	baseHeight = HOME_HEIGHT,
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
