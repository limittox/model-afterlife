import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
	MATURE_BALANCE_SCENES,
	MAX_PAIR_SCENE_SHARE,
	MAX_RESIDENT_SLOT_SHARE,
	MIN_RESIDENT_SLOT_SHARE,
	selectEligibleSceneBrief,
} from "../../src/features/world/domain/scene-eligibility.ts";
import type {
	PublishedSceneRecord,
	WorldState,
} from "../../src/features/world/domain/types.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { APPROVED_SCENE_BRIEFS } from "../../src/features/world/fixtures/scene-briefs.ts";

function pairKey(participantIds: readonly string[]): string {
	return [...participantIds].sort().join(":");
}

function appendPublished(
	state: WorldState,
	input: {
		briefId: string;
		participantIds: string[];
		logicalTick: number;
		sceneNumber: number;
	},
): WorldState {
	const record: PublishedSceneRecord = {
		revisionId: `simulated-revision-${input.sceneNumber}`,
		sceneKey: `simulated-scene-${input.sceneNumber}`,
		briefId: input.briefId,
		participantIds: [...input.participantIds].sort(),
		publishedAtTick: input.logicalTick,
	};
	return {
		...state,
		logicalTick: input.logicalTick,
		sceneHistory: [
			...state.sceneHistory,
			record,
		].slice(-MATURE_BALANCE_SCENES),
		scene: null,
		pendingSceneRequest: null,
		quiet: {
			reason: "between-scenes",
			locationId: "common-room",
			message: "Simulation quiet interval.",
		},
	};
}

function simulate(seed: number, targetScenes = MATURE_BALANCE_SCENES) {
	let state = createProvisionalWorld();
	let tick = 0;
	let sceneNumber = 0;
	let quietTicks = 0;
	while (sceneNumber < targetScenes && tick < 10_000) {
		tick += 1;
		const result = selectEligibleSceneBrief({
			state,
			briefs: APPROVED_SCENE_BRIEFS,
			logicalTick: tick,
			seed,
		});
		if (result.kind === "quiet") {
			quietTicks += 1;
			continue;
		}
		sceneNumber += 1;
		state = appendPublished(state, {
			briefId: result.brief.briefId,
			participantIds: result.brief.participantIds,
			logicalTick: tick,
			sceneNumber,
		});
	}
	if (sceneNumber !== targetScenes) {
		throw new Error(
			`Impossible-cast diagnostic: generated ${sceneNumber}/${targetScenes} scenes by tick ${tick}.`,
		);
	}
	return { state, quietTicks };
}

function distribution(state: WorldState) {
	const history = state.sceneHistory.slice(-MATURE_BALANCE_SCENES);
	const totalSlots = history.reduce(
		(total, scene) => total + scene.participantIds.length,
		0,
	);
	const residentShares = new Map(
		state.residents.map((resident) => [
			resident.id,
			history.reduce(
				(total, scene) =>
					total + (scene.participantIds.includes(resident.id) ? 1 : 0),
				0,
			) / totalSlots,
		]),
	);
	const pairCounts = new Map<string, number>();
	for (const scene of history) {
		const key = pairKey(scene.participantIds);
		pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
	}
	return {
		residentShares,
		pairShares: new Map(
			[...pairCounts].map(([key, count]) => [key, count / history.length]),
		),
	};
}

describe("six-resident ensemble balance", () => {
	it("keeps mature resident and pair shares inside policy for 100 deterministic runs", () => {
		fc.assert(
			fc.property(fc.integer(), (seed) => {
				const { state, quietTicks } = simulate(seed);
				const { residentShares, pairShares } = distribution(state);

				expect(quietTicks).toBeGreaterThan(0);
				expect(state.sceneHistory).toHaveLength(MATURE_BALANCE_SCENES);
				for (const share of residentShares.values()) {
					expect(share).toBeGreaterThanOrEqual(MIN_RESIDENT_SLOT_SHARE);
					expect(share).toBeLessThanOrEqual(MAX_RESIDENT_SLOT_SHARE);
				}
				for (const share of pairShares.values()) {
					expect(share).toBeLessThanOrEqual(MAX_PAIR_SCENE_SHARE);
				}
			}),
			{ numRuns: 100 },
		);
	});

	it("replays an identical 60-scene schedule for the same seed", () => {
		fc.assert(
			fc.property(fc.integer(), (seed) => {
				const first = simulate(seed).state.sceneHistory;
				const second = simulate(seed).state.sceneHistory;

				expect(second).toEqual(first);
			}),
			{ numRuns: 25 },
		);
	});

	it("does not starve any resident during the rolling warm-up window", () => {
		const { state } = simulate(7, 30);
		const appearances = new Map(
			state.residents.map((resident) => [resident.id, 0]),
		);
		for (const scene of state.sceneHistory) {
			for (const residentId of scene.participantIds) {
				appearances.set(residentId, (appearances.get(residentId) ?? 0) + 1);
			}
		}

		for (const count of appearances.values()) {
			expect(count).toBeGreaterThan(0);
		}
	});
});
