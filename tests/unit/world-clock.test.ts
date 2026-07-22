import { describe, expect, it } from "vitest";
import { vi } from "vitest";
import { advance } from "../../src/features/world/domain/advance.ts";
import { replayWorldEvents } from "../../src/features/world/domain/replay.ts";
import { targetTickFor } from "../../src/features/world/domain/clock.ts";
import {
	PROVISIONAL_WORLD_SEED,
	WORLD_EPOCH_MS,
	createProvisionalWorld,
} from "../../src/features/world/fixtures/provisional-world.ts";
import { createWorldInitializedEvent } from "../../src/features/world/server/seed-data.ts";

async function loadWorldClock() {
	return import("../../src/trigger/world-clock.ts");
}

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

describe("committed generation dispatch", () => {
	it("dispatches only requests returned after the world transaction completes", async () => {
		const { runWorldClockAt } = await loadWorldClock();
		const order: string[] = [];
		const request = {
			sceneKey: "world:tick:scene",
			expectedWorldHead: 17,
			occurrenceKey: "world:tick:rule:scene:generation:requested",
		};
		const writer = vi.fn(async () => {
			order.push("committed");
			return {
				logicalTick: 3,
				throughSequence: 18,
				insertedEvents: 1,
				stateHash: "a".repeat(64),
				generationRequests: [request],
			};
		});
		const dispatcher = vi.fn(async () => {
			order.push("dispatched");
		});

		const result = await runWorldClockAt(new Date(WORLD_EPOCH_MS + 3 * 60_000), writer, dispatcher);

		expect(order).toEqual(["committed", "dispatched"]);
		expect(dispatcher).toHaveBeenCalledWith(request);
		expect(result.dispatchedGenerationRequests).toBe(1);
	});

	it("creates a global Trigger idempotency key from the stable scene key", async () => {
		const { dispatchCommittedGenerationRequest } = await loadWorldClock();
		expect(
			dispatchCommittedGenerationRequest,
			"world clock must expose its committed-request dispatcher",
		).toBeTypeOf("function");
		const request = {
			sceneKey: "world:stable-scene",
			expectedWorldHead: 22,
			occurrenceKey: "world:tick:rule:scene:generation:requested",
		};
		const createKey = vi.fn(async () => "hashed-global-key");
		const trigger = vi.fn(async () => ({ id: "run-1" }));

		await dispatchCommittedGenerationRequest?.(request, { createKey, trigger });

		expect(createKey).toHaveBeenCalledWith(request.sceneKey, { scope: "global" });
		expect(trigger).toHaveBeenCalledWith(
			"model-afterlife-generate-scene",
			request,
			{ idempotencyKey: "hashed-global-key" },
		);
	});
});
