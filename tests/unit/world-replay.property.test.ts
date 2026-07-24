import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { advance } from "../../src/features/world/domain/advance.ts";
import {
	canonicalSerialize,
	canonicalStateHash,
} from "../../src/features/world/domain/canonical.ts";
import {
	rebuildProjection,
	replayWorldEvents,
} from "../../src/features/world/domain/replay.ts";
import type { WorldEvent } from "../../src/features/world/domain/types.ts";
import {
	createProvisionalWorld,
	PROVISIONAL_WORLD_SEED,
} from "../../src/features/world/fixtures/provisional-world.ts";
import { createGroundedEnsembleInitializedEvent } from "../../src/features/world/server/seed-data.ts";

describe("deterministic world replay", () => {
	it("serializes logically equal objects byte-identically", () => {
		const first = { z: 3, nested: { b: 2, a: 1 }, list: [3, 2, 1] };
		const second = { list: [3, 2, 1], nested: { a: 1, b: 2 }, z: 3 };

		expect(canonicalSerialize(first)).toBe(canonicalSerialize(second));
		expect(canonicalStateHash(first)).toBe(canonicalStateHash(second));
	});

	it("produces identical events and state for identical inputs", () => {
		const initial = createProvisionalWorld();
		const first = advance(initial, 0, 24, PROVISIONAL_WORLD_SEED);
		const second = advance(initial, 0, 24, PROVISIONAL_WORLD_SEED);

		expect(first).toEqual(second);
		expect(canonicalStateHash(first.state)).toBe(
			canonicalStateHash(second.state),
		);
	});

	it("keeps direct and arbitrarily chunked catch-up equivalent for 100 paths", () => {
		fc.assert(
			fc.property(
				fc.integer({ min: 1, max: 60 }),
				fc.integer({ min: 0, max: 60 }),
				(targetTick, proposedSplit) => {
					const split = Math.min(targetTick, proposedSplit);
					const initial = createProvisionalWorld();
					const direct = advance(
						initial,
						0,
						targetTick,
						PROVISIONAL_WORLD_SEED,
					);
					const firstChunk = advance(initial, 0, split, PROVISIONAL_WORLD_SEED);
					const secondChunk = advance(
						firstChunk.state,
						split,
						targetTick,
						PROVISIONAL_WORLD_SEED,
					);

					expect([...firstChunk.events, ...secondChunk.events]).toEqual(
						direct.events,
					);
					expect(secondChunk.state).toEqual(direct.state);
					expect(canonicalStateHash(secondChunk.state)).toBe(
						canonicalStateHash(direct.state),
					);
				},
			),
			{ numRuns: 100 },
		);
	});

	it("deduplicates occurrence keys and replays same-tick events by sequence", () => {
		const initial = createProvisionalWorld();
		const eventOne: WorldEvent = {
			schemaVersion: 1,
			sequence: 2,
			occurrenceKey: "test:second",
			logicalTick: 1,
			type: "resident_location_changed",
			payload: {
				residentId: "gpt-4o",
				roomId: "library",
				activity: "Reading",
				nextEligibleTick: 2,
			},
		};
		const eventTwo: WorldEvent = {
			...eventOne,
			sequence: 1,
			occurrenceKey: "test:first",
			payload: {
				residentId: "gpt-4o",
				roomId: "tea-nook",
				activity: "Brewing tea",
				nextEligibleTick: 2,
			},
		};

		const replayed = replayWorldEvents(initial, [eventOne, eventTwo, eventTwo]);

		expect(
			replayed.residents.find((resident) => resident.id === "gpt-4o")?.roomId,
		).toBe("library");
		expect(replayed.throughSequence).toBe(2);
	});

	it("replays only the latest initialized epoch when an older roster is incompatible", () => {
		const legacyInitialization = {
			schemaVersion: 1,
			sequence: 1,
			occurrenceKey: "world-initialized:v1",
			logicalTick: 1,
			type: "world_initialized",
			payload: {
				state: {
					schemaVersion: 1,
					worldId: createProvisionalWorld().worldId,
					logicalTick: 1,
					throughSequence: 1,
					rooms: [],
					residents: [],
				},
			},
		} as unknown as WorldEvent;
		const staleRoutine = {
			schemaVersion: 1,
			sequence: 2,
			occurrenceKey: "legacy:routine",
			logicalTick: 2,
			type: "quiet_routine_started",
			payload: {
				residentId: "former-giant",
				locationId: "common-room",
				activity: "Remembering an older roster",
			},
		} as WorldEvent;
		const groundedInitialization = createGroundedEnsembleInitializedEvent(3, 2);

		const replayed = replayWorldEvents(createProvisionalWorld(), [
			staleRoutine,
			groundedInitialization,
			legacyInitialization,
		]);

		expect(replayed).toEqual(groundedInitialization.payload.state);
		expect(replayed.residents).toHaveLength(6);
		expect(replayed.throughSequence).toBe(3);
	});

	it("rebuilds the exact projection hash and publishes scenes only whole", () => {
		fc.assert(
			fc.property(fc.integer({ min: 1, max: 50 }), (targetTick) => {
				const initial = createProvisionalWorld();
				const advanced = advance(
					initial,
					0,
					targetTick,
					PROVISIONAL_WORLD_SEED,
				);
				const rebuilt = rebuildProjection(initial, advanced.events);

				expect(rebuilt.state).toEqual(advanced.state);
				expect(rebuilt.stateHash).toBe(canonicalStateHash(advanced.state));
				for (const event of advanced.events) {
					if (event.type === "scene_started") {
						expect(event.payload.scene.turns).toHaveLength(6);
						expect(event.payload.scene.presentationDurationMs).toBe(45_000);
					}
				}
				if (rebuilt.state.scene) {
					expect(rebuilt.state.scene.turns).toHaveLength(6);
				} else {
					expect(rebuilt.state.quiet).not.toBeNull();
				}
			}),
			{ numRuns: 100 },
		);
	});
});
