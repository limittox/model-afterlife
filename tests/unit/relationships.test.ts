import { describe, expect, it } from "vitest";
import { reduceWorldEvent } from "../../src/features/world/domain/events.ts";
import {
	applyRelationshipEffects,
	relationshipEffectKey,
	validateRelationshipGraph,
} from "../../src/features/world/domain/relationships.ts";
import type {
	RelationshipEffectAppliedEvent,
	SharedExperienceRecordedEvent,
} from "../../src/features/world/domain/types.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";

describe("typed relationship graph", () => {
	it("seeds every unordered pair with bounded typed dimensions and no affinity", () => {
		const state = createProvisionalWorld();

		expect(state.relationships).toHaveLength(15);
		validateRelationshipGraph(
			state.relationships,
			state.residents.map((resident) => resident.id),
		);
		for (const relationship of state.relationships) {
			expect(relationship).not.toHaveProperty("affinity");
			expect(relationship.residentAId < relationship.residentBId).toBe(true);
			expect(relationship).toMatchObject({
				friendship: expect.any(Number),
				rivalry: expect.any(Number),
				familiarity: expect.any(Number),
				recentExperienceIds: [],
			});
		}
	});

	it("applies a unique cause-backed effect and clamps its permitted dimension", () => {
		const state = createProvisionalWorld();
		const input = {
			causeRevisionId: "revision-accepted",
			sceneKey: "scene-accepted",
			effectOrdinal: 0,
			residentAId: "gpt-4o",
			residentBId: "claude-sonnet-4.5",
			dimension: "friendship" as const,
			delta: 1 as const,
		};
		const effect = {
			...input,
			effectKey: relationshipEffectKey(input),
		};

		const applied = applyRelationshipEffects(state.relationships, [effect]);
		const pair = applied.relationships.find(
			(relationship) =>
				relationship.residentAId === "claude-sonnet-4.5" &&
				relationship.residentBId === "gpt-4o",
		);

		expect(pair?.friendship).toBe(2);
		expect(pair?.rivalry).toBe(1);
		expect(applied.appliedEffectKeys).toEqual([effect.effectKey]);
		expect(() =>
			applyRelationshipEffects(
				applied.relationships,
				[effect],
				applied.appliedEffectKeys,
			),
		).toThrow(/Duplicate relationship effect/);
	});

	it.each([
		{
			name: "missing cause",
			override: { causeRevisionId: "" },
		},
		{
			name: "wrong effect key",
			override: { effectKey: "relationship-effect:forged" },
		},
		{
			name: "unknown pair",
			override: { residentBId: "unknown-resident" },
		},
	])("rejects $name atomically", ({ override }) => {
		const state = createProvisionalWorld();
		const input = {
			causeRevisionId: "revision-accepted",
			sceneKey: "scene-accepted",
			effectOrdinal: 0,
			residentAId: "gpt-4o",
			residentBId: "claude-sonnet-4.5",
			dimension: "rivalry" as const,
			delta: 1 as const,
		};
		const effect = {
			...input,
			effectKey: relationshipEffectKey(input),
			...override,
		};
		const before = structuredClone(state.relationships);

		expect(() => applyRelationshipEffects(state.relationships, [effect])).toThrow();
		expect(state.relationships).toEqual(before);
	});

	it("replays an accepted effect and its structured memory in cause order", () => {
		const initial = createProvisionalWorld();
		const input = {
			causeRevisionId: "revision-replay",
			sceneKey: "scene-replay",
			effectOrdinal: 0,
			residentAId: "gpt-4o",
			residentBId: "claude-sonnet-4.5",
			dimension: "familiarity" as const,
			delta: 1 as const,
		};
		const relationshipEvent: RelationshipEffectAppliedEvent = {
			schemaVersion: 1,
			sequence: 1,
			occurrenceKey: relationshipEffectKey(input),
			logicalTick: 10,
			type: "relationship_effect_applied",
			payload: {
				...input,
				effectKey: relationshipEffectKey(input),
			},
		};
		const memoryEvent: SharedExperienceRecordedEvent = {
			schemaVersion: 1,
			sequence: 2,
			occurrenceKey: "shared-experience:revision-replay",
			logicalTick: 10,
			type: "shared_experience_recorded",
			payload: {
				memory: {
					id: "memory:revision-replay",
					source: "published",
					causeRevisionId: "revision-replay",
					sceneKey: "scene-replay",
					participantIds: ["claude-sonnet-4.5", "gpt-4o"],
					summary: "The pair completed an accepted structured outcome.",
					tags: ["common-room"],
					logicalTick: 10,
				},
			},
		};

		const afterEffect = reduceWorldEvent(initial, relationshipEvent);
		const afterMemory = reduceWorldEvent(afterEffect, memoryEvent);

		expect(afterMemory.appliedRelationshipEffectKeys).toEqual([
			relationshipEvent.payload.effectKey,
		]);
		expect(afterMemory.memories).toEqual([memoryEvent.payload.memory]);
		expect(
			afterMemory.relationships.find(
				(relationship) =>
					relationship.residentAId === "claude-sonnet-4.5" &&
					relationship.residentBId === "gpt-4o",
			)?.recentExperienceIds,
		).toEqual(["memory:revision-replay"]);
	});
});
