import { describe, expect, it } from "vitest";
import { targetTickFor } from "../../src/features/world/domain/clock.ts";

describe("targetTickFor", () => {
	it("derives a logical tick only from injected epoch and instant values", () => {
		const epochMs = Date.UTC(2026, 0, 1, 0, 0, 0);

		expect(targetTickFor(epochMs, epochMs)).toBe(0);
		expect(targetTickFor(epochMs + 10 * 60_000, epochMs)).toBe(10);
		expect(targetTickFor(epochMs + 10 * 5_000, epochMs, 5_000)).toBe(10);
	});

	it("clamps instants before the world epoch to tick zero", () => {
		expect(targetTickFor(999, 1_000)).toBe(0);
	});

	it("rejects invalid clock inputs instead of consulting wall time", () => {
		expect(() => targetTickFor(Number.NaN, 0)).toThrow(/finite/i);
		expect(() => targetTickFor(1, 0, 0)).toThrow(/positive/i);
	});
});
