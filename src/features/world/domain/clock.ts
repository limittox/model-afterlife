export const DEFAULT_WORLD_TICK_MS = 60_000;

export function targetTickFor(
	instantMs: number,
	epochMs: number,
	tickMs = DEFAULT_WORLD_TICK_MS,
): number {
	if (!Number.isFinite(instantMs) || !Number.isFinite(epochMs)) {
		throw new TypeError("World clock inputs must be finite numbers.");
	}
	if (!Number.isSafeInteger(tickMs) || tickMs <= 0) {
		throw new RangeError(
			"World tick duration must be a positive safe integer.",
		);
	}

	return Math.max(0, Math.floor((instantMs - epochMs) / tickMs));
}
