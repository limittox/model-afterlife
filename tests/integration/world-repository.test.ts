import { describe, expect, it } from "vitest";
import { canonicalStateHash } from "../../src/features/world/domain/canonical.ts";
import { rebuildProjection } from "../../src/features/world/domain/replay.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { advanceWorldTo } from "../../src/features/world/server/advance-world-to.ts";
import {
	readCanonicalHead,
	readCommittedWorldEvents,
} from "../../src/features/world/server/world-repository.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";

describe("canonical world repository", () => {
	it("serializes twenty overlapping catch-up calls into one contiguous canon", async () => {
		const before = await readCanonicalHead(CANONICAL_WORLD_ID);
		const targetTick = before.state.logicalTick + 20;

		await Promise.all(
			Array.from({ length: 20 }, () =>
				advanceWorldTo(CANONICAL_WORLD_ID, targetTick),
			),
		);

		const after = await readCanonicalHead(CANONICAL_WORLD_ID);
		const events = await readCommittedWorldEvents(CANONICAL_WORLD_ID);
		const sequences = events.map((event) => event.sequence);
		const occurrenceKeys = events.map((event) => event.occurrenceKey);

		expect(after.state.logicalTick).toBe(targetTick);
		expect(sequences).toEqual(
			Array.from({ length: sequences.length }, (_, index) => index + 1),
		);
		expect(new Set(occurrenceKeys).size).toBe(occurrenceKeys.length);
		expect(after.snapshot.throughSequence).toBe(sequences.at(-1));
		expect(after.snapshot.stateHash).toBe(canonicalStateHash(after.state));
	});

	it("rebuilds the committed projection exactly from the append-only journal", async () => {
		const committed = await readCanonicalHead(CANONICAL_WORLD_ID);
		const events = await readCommittedWorldEvents(CANONICAL_WORLD_ID);
		const rebuilt = rebuildProjection(createProvisionalWorld(), events);

		expect(rebuilt.state).toEqual(committed.state);
		expect(rebuilt.stateHash).toBe(committed.snapshot.stateHash);
		expect(rebuilt.state.throughSequence).toBe(
			committed.snapshot.throughSequence,
		);
	});
});
