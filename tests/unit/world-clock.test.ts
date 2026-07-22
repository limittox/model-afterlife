import { describe, expect, it } from "vitest";
import { advance } from "../../src/features/world/domain/advance.ts";
import { replayWorldEvents } from "../../src/features/world/domain/replay.ts";
import { targetTickFor } from "../../src/features/world/domain/clock.ts";
import {
	PROVISIONAL_WORLD_SEED,
	WORLD_EPOCH_MS,
	createProvisionalWorld,
} from "../../src/features/world/fixtures/provisional-world.ts";
import { createWorldInitializedEvent } from "../../src/features/world/server/seed-data.ts";

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

describe("deployment-sized first wake", () => {
	it("starts the durable world at deployment time instead of replaying the epoch gap", () => {
		const deploymentTick = targetTickFor(
			Date.UTC(2026, 6, 22, 0, 0, 0),
			WORLD_EPOCH_MS,
		);
		const initialized = createWorldInitializedEvent(1, deploymentTick);
		const initialState = replayWorldEvents(createProvisionalWorld(), [initialized]);
		const firstWake = advance(
			initialState,
			deploymentTick,
			deploymentTick + 1,
			PROVISIONAL_WORLD_SEED,
		);

		expect(initialized.logicalTick).toBe(deploymentTick);
		expect(initialized.payload.state.logicalTick).toBe(deploymentTick);
		expect(firstWake.state.logicalTick).toBe(deploymentTick + 1);
		expect(firstWake.events.length).toBeLessThanOrEqual(4);
	});
});
