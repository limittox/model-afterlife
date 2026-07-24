import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
	PAIR_COOLDOWN_TICKS,
	RESIDENT_COOLDOWN_TICKS,
	selectEligibleSceneBrief,
} from "../../src/features/world/domain/scene-eligibility.ts";
import type {
	ApprovedSceneBrief,
	PublishedSceneRecord,
} from "../../src/features/world/domain/types.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { APPROVED_SCENE_BRIEFS } from "../../src/features/world/fixtures/scene-briefs.ts";

function record(
	participantIds: string[],
	publishedAtTick: number,
	index = 0,
): PublishedSceneRecord {
	return {
		revisionId: `revision-${index}`,
		sceneKey: `scene-${index}`,
		briefId: `brief-${index}`,
		participantIds: [...participantIds].sort(),
		publishedAtTick,
	};
}

function briefFor(leftId: string, rightId: string): ApprovedSceneBrief {
	const brief = APPROVED_SCENE_BRIEFS.find(
		(candidate) =>
			candidate.participantIds.includes(leftId) &&
			candidate.participantIds.includes(rightId),
	);
	if (!brief) throw new Error(`Missing brief for ${leftId}/${rightId}.`);
	return brief;
}

describe("deterministic scene eligibility", () => {
	it("selects byte-identically for the same state, tick, seed, and registry", () => {
		const state = createProvisionalWorld();
		const first = selectEligibleSceneBrief({
			state,
			briefs: APPROVED_SCENE_BRIEFS,
			logicalTick: 1,
			seed: 42,
		});
		const second = selectEligibleSceneBrief({
			state,
			briefs: [...APPROVED_SCENE_BRIEFS].reverse(),
			logicalTick: 1,
			seed: 42,
		});

		expect(second).toEqual(first);
		expect(first.kind).toBe("selected");
	});

	it("keeps one primary scene and one pending generation request exclusive", () => {
		const active = createProvisionalWorld();
		active.scene = {
			id: "active",
			premise: "active",
			locationId: "common-room",
			participantIds: ["gpt-4o", "claude-sonnet-4.5"],
			startedAtTick: 1,
			durationTicks: 2,
			presentationDurationMs: 1_000,
			turns: [],
			deliveryMode: "live",
			originalRevisionId: "active",
			originalSceneKey: "active",
		};
		expect(
			selectEligibleSceneBrief({
				state: active,
				briefs: APPROVED_SCENE_BRIEFS,
				logicalTick: 2,
				seed: 1,
			}),
		).toMatchObject({ kind: "quiet", reason: "active-scene" });

		const pending = createProvisionalWorld();
		pending.pendingSceneRequest = {
			sceneKey: "pending",
			briefId: "pending-brief",
			participantIds: ["claude-sonnet-4.5", "gpt-4o"],
			requestedAtTick: 1,
			expectedWorldHead: 3,
		};
		expect(
			selectEligibleSceneBrief({
				state: pending,
				briefs: APPROVED_SCENE_BRIEFS,
				logicalTick: 2,
				seed: 1,
			}),
		).toMatchObject({ kind: "quiet", reason: "pending-generation" });
	});

	it("requires a complete quiet interval after a published scene", () => {
		const state = createProvisionalWorld();
		state.sceneHistory = [
			record(["gpt-4o", "claude-sonnet-4.5"], 10),
		];

		expect(
			selectEligibleSceneBrief({
				state,
				briefs: [
					briefFor("gemini-2.5-pro", "deepseek-v3.2"),
				],
				logicalTick: 11,
				seed: 1,
			}),
		).toMatchObject({ kind: "quiet", reason: "quiet-interval" });
		expect(
			selectEligibleSceneBrief({
				state,
				briefs: [
					briefFor("gemini-2.5-pro", "deepseek-v3.2"),
				],
				logicalTick: 12,
				seed: 1,
			}).kind,
		).toBe("selected");
	});

	it("enforces resident and pair cooldowns at their exact boundaries", () => {
		const residentState = createProvisionalWorld();
		residentState.sceneHistory = [
			record(["gpt-4o", "gemini-2.5-pro"], 10),
		];
		const residentCandidate = briefFor(
			"gpt-4o",
			"claude-sonnet-4.5",
		);
		expect(
			selectEligibleSceneBrief({
				state: residentState,
				briefs: [residentCandidate],
				logicalTick: 10 + RESIDENT_COOLDOWN_TICKS - 1,
				seed: 1,
			}),
		).toMatchObject({ kind: "quiet", reason: "cooldown" });
		expect(
			selectEligibleSceneBrief({
				state: residentState,
				briefs: [residentCandidate],
				logicalTick: 10 + RESIDENT_COOLDOWN_TICKS,
				seed: 1,
			}).kind,
		).toBe("selected");

		const pairState = createProvisionalWorld();
		pairState.sceneHistory = [
			record(["gpt-4o", "claude-sonnet-4.5"], 10),
		];
		expect(
			selectEligibleSceneBrief({
				state: pairState,
				briefs: [residentCandidate],
				logicalTick: 10 + PAIR_COOLDOWN_TICKS - 1,
				seed: 1,
			}),
		).toMatchObject({ kind: "quiet", reason: "cooldown" });
		expect(
			selectEligibleSceneBrief({
				state: pairState,
				briefs: [residentCandidate],
				logicalTick: 10 + PAIR_COOLDOWN_TICKS,
				seed: 1,
			}).kind,
		).toBe("selected");
	});

	it("allows only a versioned, in-window authored cooldown override", () => {
		const state = createProvisionalWorld();
		state.sceneHistory = [
			record(["gpt-4o", "claude-sonnet-4.5"], 10),
		];
		const base = briefFor("gpt-4o", "claude-sonnet-4.5");
		const overridden: ApprovedSceneBrief = {
			...base,
			override: {
				id: "arc-house-ledger",
				version: "arc-house-ledger-v1",
				startsAtTick: 20,
				endsAtTick: 25,
				bypass: "pair-cooldown",
			},
		};

		expect(
			selectEligibleSceneBrief({
				state,
				briefs: [overridden],
				logicalTick: 22,
				seed: 1,
			}).kind,
		).toBe("selected");
		expect(
			selectEligibleSceneBrief({
				state,
				briefs: [overridden],
				logicalTick: 26,
				seed: 1,
			}),
		).toMatchObject({ kind: "quiet", reason: "cooldown" });
	});

	it("has no dependency on viewers, analytics, or provider transport", () => {
		const source = readFileSync(
			"src/features/world/domain/scene-eligibility.ts",
			"utf8",
		);
		expect(source).not.toMatch(
			/from ["'][^"']*(?:client|analytics|provider|observer)[^"']*["']/,
		);
		expect(source).not.toMatch(/popularity|camera|votes|latency/i);
	});
});
