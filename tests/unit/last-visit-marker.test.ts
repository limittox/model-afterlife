import { describe, expect, it } from "vitest";
import {
	baselineMarker,
	LAST_VISIT_STORAGE_KEY,
	markerDisposition,
	parseLastVisitMarker,
	readLastVisitMarker,
	writeLastVisitMarker,
} from "../../src/features/return-loop/client/last-visit-marker.ts";

const WORLD_ID = "00000000-0000-4000-8000-000000000001";

function memoryStorage(initial: string | null = null) {
	let value = initial;
	let writes = 0;
	return {
		storage: {
			getItem: () => value,
			setItem: (key: string, next: string) => {
				expect(key).toBe(LAST_VISIT_STORAGE_KEY);
				value = next;
				writes += 1;
			},
		},
		value: () => value,
		writes: () => writes,
	};
}

describe("anonymous last-visit marker", () => {
	it("accepts only the exact version-one world and positive sequence shape", () => {
		const marker = {
			version: 1 as const,
			worldId: WORLD_ID,
			throughSequence: 8,
		};
		expect(parseLastVisitMarker(JSON.stringify(marker))).toEqual(marker);
		for (const invalid of [
			"",
			"null",
			"{}",
			JSON.stringify({ ...marker, version: 2 }),
			JSON.stringify({ ...marker, worldId: "not-a-world" }),
			JSON.stringify({ ...marker, throughSequence: 0 }),
			JSON.stringify({ ...marker, throughSequence: Number.MAX_SAFE_INTEGER + 1 }),
			JSON.stringify({ ...marker, accountId: "visitor" }),
		]) {
			expect(parseLastVisitMarker(invalid)).toBeNull();
		}
	});

	it("waits for a valid observed home before establishing or resetting a baseline", () => {
		expect(baselineMarker({ worldId: WORLD_ID, throughSequence: 0 })).toBeNull();
		expect(
			baselineMarker({ worldId: "invalid", throughSequence: 9 }),
		).toBeNull();
		const observed = { worldId: WORLD_ID, throughSequence: 9 };
		const baseline = baselineMarker(observed);
		expect(baseline).toEqual({ version: 1, ...observed });
		expect(
			markerDisposition(
				{ version: 1, worldId: WORLD_ID, throughSequence: 8 },
				observed,
			),
		).toBe("returning");
		expect(
			markerDisposition(
				{ version: 1, worldId: WORLD_ID, throughSequence: 10 },
				observed,
			),
		).toBe("reset");
		expect(
			markerDisposition(
				{
					version: 1,
					worldId: "00000000-0000-4000-8000-000000000002",
					throughSequence: 8,
				},
				observed,
			),
		).toBe("reset");
	});

	it("reads and writes idempotent anonymous JSON while storage denial fails closed", () => {
		const memory = memoryStorage();
		expect(readLastVisitMarker(memory.storage)).toEqual({ kind: "absent" });
		const marker = { version: 1 as const, worldId: WORLD_ID, throughSequence: 8 };
		expect(writeLastVisitMarker(memory.storage, marker)).toBe(true);
		expect(readLastVisitMarker(memory.storage)).toEqual({
			kind: "present",
			marker,
		});
		expect(JSON.parse(memory.value() ?? "{}")).toEqual(marker);
		expect(memory.writes()).toBe(1);

		const denied = {
			getItem: () => {
				throw new DOMException("denied");
			},
			setItem: () => {
				throw new DOMException("denied");
			},
		};
		expect(readLastVisitMarker(denied)).toEqual({ kind: "unavailable" });
		expect(writeLastVisitMarker(denied, marker)).toBe(false);
	});
});
