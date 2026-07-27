import type { RenderResident, WorldPoint } from "./renderer-types.ts";

const SEGMENT_DURATION_MS = 1_200;

export function resolveResidentPosition(
	resident: Pick<
		RenderResident,
		"x" | "y" | "movementIntent" | "waypoints"
	>,
	elapsedMs: number,
	reducedMotion: boolean,
): WorldPoint {
	if (
		reducedMotion ||
		resident.movementIntent !== "walking" ||
		resident.waypoints.length < 2
	) {
		return { x: resident.x, y: resident.y };
	}

	const finalIndex = resident.waypoints.length - 1;
	const phaseCount = finalIndex * 2;
	const elapsedSegments = Math.max(0, elapsedMs) / SEGMENT_DURATION_MS;
	const phase = Math.floor(elapsedSegments) % phaseCount;
	const forward = phase < finalIndex;
	const fromIndex = forward ? phase : phaseCount - phase;
	const toIndex = forward ? fromIndex + 1 : fromIndex - 1;
	const progress = elapsedSegments - Math.floor(elapsedSegments);
	const from = resident.waypoints[fromIndex] ?? {
		x: resident.x,
		y: resident.y,
	};
	const to = resident.waypoints[toIndex] ?? from;

	return {
		x: Math.round(from.x + (to.x - from.x) * progress),
		y: Math.round(from.y + (to.y - from.y) * progress),
	};
}
