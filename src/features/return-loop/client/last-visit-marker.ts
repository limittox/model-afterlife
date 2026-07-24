import { z } from "zod";

export const LAST_VISIT_STORAGE_KEY = "model-afterlife:last-visit:v1";

export const LastVisitMarkerSchema = z
	.object({
		version: z.literal(1),
		worldId: z.string().uuid(),
		throughSequence: z.number().int().positive(),
	})
	.strict();

export type LastVisitMarker = z.infer<typeof LastVisitMarkerSchema>;

export type MarkerStorage = Pick<Storage, "getItem" | "setItem">;

export type LastVisitReadResult =
	| { kind: "present"; marker: LastVisitMarker }
	| { kind: "absent" }
	| { kind: "invalid" }
	| { kind: "unavailable" };

export function parseLastVisitMarker(raw: string): LastVisitMarker | null {
	try {
		const parsed = LastVisitMarkerSchema.safeParse(JSON.parse(raw));
		return parsed.success ? parsed.data : null;
	} catch {
		return null;
	}
}

export function readLastVisitMarker(
	storage: MarkerStorage,
): LastVisitReadResult {
	try {
		const raw = storage.getItem(LAST_VISIT_STORAGE_KEY);
		if (raw === null) return { kind: "absent" };
		const marker = parseLastVisitMarker(raw);
		return marker ? { kind: "present", marker } : { kind: "invalid" };
	} catch {
		return { kind: "unavailable" };
	}
}

export function writeLastVisitMarker(
	storage: MarkerStorage,
	marker: LastVisitMarker,
): boolean {
	const parsed = LastVisitMarkerSchema.safeParse(marker);
	if (!parsed.success) return false;
	try {
		storage.setItem(LAST_VISIT_STORAGE_KEY, JSON.stringify(parsed.data));
		return true;
	} catch {
		return false;
	}
}

export function baselineMarker(observedHome: {
	worldId: string;
	throughSequence: number;
}): LastVisitMarker | null {
	const parsed = LastVisitMarkerSchema.safeParse({
		version: 1,
		worldId: observedHome.worldId,
		throughSequence: observedHome.throughSequence,
	});
	return parsed.success ? parsed.data : null;
}

export function markerDisposition(
	marker: LastVisitMarker,
	observedHome: { worldId: string; throughSequence: number },
): "reset" | "current" | "returning" {
	if (
		marker.worldId !== observedHome.worldId ||
		marker.throughSequence > observedHome.throughSequence
	) {
		return "reset";
	}
	return marker.throughSequence === observedHome.throughSequence
		? "current"
		: "returning";
}
