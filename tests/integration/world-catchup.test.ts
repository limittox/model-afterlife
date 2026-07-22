import { describe, expect, it } from "vitest";
import { advance } from "../../src/features/world/domain/advance.ts";
import {
	PROVISIONAL_WORLD_SEED,
	WORLD_EPOCH_MS,
} from "../../src/features/world/fixtures/provisional-world.ts";
import { rebuildWorldProjection } from "../../src/features/world/server/rebuild-world-projection.ts";
import {
	readCanonicalHead,
	readCommittedWorldEvents,
} from "../../src/features/world/server/world-repository.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";
import {
	runWorldClockAt,
	WORLD_CLOCK_CRON,
	worldClockIdempotencyKey,
	WORLD_CLOCK_RETRY,
	WORLD_CLOCK_TTL,
} from "../../src/trigger/world-clock.ts";

describe("scheduled world catch-up", () => {
	it("turns one late wake into every missing deterministic tick", async () => {
		const before = await readCanonicalHead(CANONICAL_WORLD_ID);
		const targetTick = before.state.logicalTick + 12;
		const expected = advance(
			before.state,
			before.state.logicalTick,
			targetTick,
			PROVISIONAL_WORLD_SEED,
		);

		const result = await runWorldClockAt(
			new Date(WORLD_EPOCH_MS + targetTick * 60_000),
		);
		const after = await readCanonicalHead(CANONICAL_WORLD_ID);

		expect(result.targetTick).toBe(targetTick);
		expect(after.state).toEqual(expected.state);
		expect(after.snapshot.stateHash).toBe(result.advance.stateHash);
	});

	it("makes repeated and concurrent delivery of one wake harmless", async () => {
		const before = await readCanonicalHead(CANONICAL_WORLD_ID);
		const targetTick = before.state.logicalTick + 10;
		const timestamp = new Date(WORLD_EPOCH_MS + targetTick * 60_000);

		await runWorldClockAt(timestamp);
		const afterFirst = await readCanonicalHead(CANONICAL_WORLD_ID);
		const eventsAfterFirst = await readCommittedWorldEvents(CANONICAL_WORLD_ID);
		const duplicates = await Promise.all(
			Array.from({ length: 8 }, () => runWorldClockAt(timestamp)),
		);
		const afterDuplicates = await readCanonicalHead(CANONICAL_WORLD_ID);
		const eventsAfterDuplicates =
			await readCommittedWorldEvents(CANONICAL_WORLD_ID);

		expect(
			duplicates.every((result) => result.advance.insertedEvents === 0),
		).toBe(true);
		expect(afterDuplicates).toEqual(afterFirst);
		expect(eventsAfterDuplicates).toEqual(eventsAfterFirst);
	});

	it("derives one target and invokes the canonical writer exactly once", async () => {
		let calls = 0;
		const scheduledTick = 42;
		const result = await runWorldClockAt(
			new Date(WORLD_EPOCH_MS + scheduledTick * 60_000),
			async (_worldId, targetTick) => {
				calls += 1;
				return {
					logicalTick: targetTick,
					throughSequence: 99,
					insertedEvents: 1,
					stateHash: "a".repeat(64),
				};
			},
		);

		expect(calls).toBe(1);
		expect(result.targetTick).toBe(scheduledTick);
		expect(result.idempotencyKey).toBe(
			worldClockIdempotencyKey(CANONICAL_WORLD_ID, scheduledTick),
		);
	});

	it("declares a bounded one-minute UTC schedule", () => {
		expect(WORLD_CLOCK_CRON).toBe("* * * * *");
		expect(WORLD_CLOCK_TTL).toBe("2m");
		expect(WORLD_CLOCK_RETRY).toMatchObject({
			maxAttempts: 3,
			minTimeoutInMs: 1_000,
			maxTimeoutInMs: 10_000,
		});
	});

	it("checks that journal replay matches the live projection", async () => {
		const result = await rebuildWorldProjection(CANONICAL_WORLD_ID, {
			checkOnly: true,
		});

		expect(result.matches).toBe(true);
		expect(result.rebuiltStateHash).toBe(result.committedStateHash);
		expect(result.rebuiltThroughSequence).toBe(result.committedThroughSequence);
	});
});
