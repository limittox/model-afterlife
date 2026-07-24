import { describe, expect, it } from "vitest";
import type {
	CanonicalScene,
	CanonicalSceneReadResult,
} from "../../src/features/publication/contracts/public-publication.ts";
import {
	assembleReturnRecap,
	type ReturnRecapHead,
} from "../../src/features/publication/server/read-return-recap.ts";
import { activeSceneState } from "../../src/features/world/fixtures/ui-states.ts";

function canonicalScene(
	revisionId = "recap-scene",
	publicationSequence = 82,
	outcome: CanonicalScene["outcome"] = {
		summary: "The timer works again.",
		sharedExperience: "They now share a memory of the repaired timer.",
		relationshipChanges: [],
	},
): CanonicalScene {
	return {
		revisionId,
		canonicalPath: `/scenes/${revisionId}`,
		publicationSequence,
		premise: "The residents repair the brass tea timer.",
		cast: [
			{
				residentId: "gpt-4o",
				displayName: "GPT-4o",
				profilePath: "/residents/gpt-4o",
				exactModelId: "openai/gpt-4o",
			},
			{
				residentId: "claude-sonnet-4.5",
				displayName: "Claude Sonnet 4.5",
				profilePath: "/residents/claude-sonnet-4.5",
				exactModelId: "anthropic/claude-sonnet-4.5",
			},
		],
		home: {
			logicalTick: 40,
			homeDay: 1,
			homeTime: "09:40",
			dayPeriod: "morning",
		},
		location: { id: "tea-nook", name: "Tea Nook" },
		turns: Array.from({ length: 4 }, (_, turnIndex) => ({
			turnIndex,
			speakerId: turnIndex % 2 === 0 ? "gpt-4o" : "claude-sonnet-4.5",
			speakerName:
				turnIndex % 2 === 0 ? "GPT-4o" : "Claude Sonnet 4.5",
			speakerProfilePath:
				turnIndex % 2 === 0
					? "/residents/gpt-4o"
					: "/residents/claude-sonnet-4.5",
			exactModelId:
				turnIndex % 2 === 0
					? "openai/gpt-4o"
					: "anthropic/claude-sonnet-4.5",
			text: `Canonical turn ${turnIndex + 1}`,
			claimVersionIds: [],
		})),
		outcome,
		historicalContext: [],
		disclosures: {
			stagedFiction: "Staged fiction.",
			aiAuthorship: "AI-authored.",
			exactModelIds: ["openai/gpt-4o", "anthropic/claude-sonnet-4.5"],
			nonAffiliation: "Not affiliated.",
		},
	};
}

function head(throughSequence = 84): ReturnRecapHead {
	const snapshot = activeSceneState.snapshot;
	if (!snapshot) throw new Error("The active snapshot fixture is required.");
	return {
		worldId: snapshot.worldId,
		throughSequence,
		snapshot: { ...snapshot, throughSequence },
	};
}

describe("deterministic return recap", () => {
	it("returns one complete canonical beat at a frozen publication boundary", async () => {
		const scene = canonicalScene();
		const recap = await assembleReturnRecap(
			head(),
			80,
			[
				{
					sequence: scene.publicationSequence,
					payload: { revisionId: scene.revisionId },
				},
			],
			async (): Promise<CanonicalSceneReadResult> => ({
				kind: "complete",
				scene,
			}),
		);

		expect(recap).toMatchObject({
			afterSequence: 80,
			throughSequence: 84,
			partial: false,
			beats: [
				{
					revisionId: "recap-scene",
					publicationSequence: 82,
					significance: "shared-experience",
					scene: {
						href: "/scenes/recap-scene",
						label: scene.premise,
					},
					residents: [
						{ profilePath: "/residents/gpt-4o" },
						{ profilePath: "/residents/claude-sonnet-4.5" },
					],
					relationshipNote: null,
				},
			],
			currentSituation: {
				homeTime: "09:42",
			},
		});
		expect(JSON.stringify(recap)).not.toMatch(
			/prompt|providerResponse|usage|cost|hiddenReasoning|calibration|delta/iu,
		);
	});

	it("ranks cause-backed relationship change, shared experience, then publication with stable ties", async () => {
		const ordinary = canonicalScene("ordinary", 84, {
			summary: "An ordinary complete publication.",
			sharedExperience: null,
			relationshipChanges: [],
		});
		const shared = canonicalScene("shared", 83, {
			summary: "A shared publication.",
			sharedExperience: "An accepted canonical shared experience.",
			relationshipChanges: [],
		});
		const relationshipOld = canonicalScene("relationship-a", 81, {
			summary: "An older relationship publication.",
			sharedExperience: null,
			relationshipChanges: [
				{
					residentAId: "gpt-4o",
					residentAName: "GPT-4o",
					residentAProfilePath: "/residents/gpt-4o",
					residentBId: "claude-sonnet-4.5",
					residentBName: "Claude Sonnet 4.5",
					residentBProfilePath: "/residents/claude-sonnet-4.5",
					dimension: "friendship",
					description: "Their friendship becomes a little warmer.",
				},
			],
		});
		const relationshipNew = canonicalScene("relationship-z", 82, {
			summary: "A newer relationship publication.",
			sharedExperience: "A shared experience that must not outrank its cause.",
			relationshipChanges: [
				{
					residentAId: "gpt-4o",
					residentAName: "GPT-4o",
					residentAProfilePath: "/residents/gpt-4o",
					residentBId: "claude-sonnet-4.5",
					residentBName: "Claude Sonnet 4.5",
					residentBProfilePath: "/residents/claude-sonnet-4.5",
					dimension: "rivalry",
					description: "Their rivalry becomes a little sharper.",
				},
			],
		});
		const scenes = new Map(
			[ordinary, shared, relationshipOld, relationshipNew].map((scene) => [
				scene.revisionId,
				scene,
			]),
		);
		const candidates = [
			ordinary,
			relationshipOld,
			shared,
			relationshipNew,
		].map((scene) => ({
			sequence: scene.publicationSequence,
			payload: {
				revisionId: scene.revisionId,
				popularity: scene.revisionId === "ordinary" ? 1_000_000 : 0,
				viewCount: scene.revisionId === "ordinary" ? 1_000_000 : 0,
				absenceDuration: scene.revisionId === "ordinary" ? 999 : 0,
			},
		}));
		const readScene = async (revisionId: string): Promise<CanonicalSceneReadResult> => {
			const found = scenes.get(revisionId);
			return found ? { kind: "complete", scene: found } : { kind: "not-found" };
		};

		const forward = await assembleReturnRecap(
			head(),
			80,
			candidates,
			readScene,
		);
		const permuted = await assembleReturnRecap(
			head(),
			80,
			[...candidates].reverse(),
			readScene,
		);
		expect(permuted).toEqual(forward);
		expect(forward.beats.map((beat) => beat.revisionId)).toEqual([
			"relationship-z",
			"relationship-a",
			"shared",
			"ordinary",
		]);
		expect(JSON.stringify(forward)).not.toMatch(
			/popularity|viewCount|absenceDuration|streak|currency|reward|shareCount/iu,
		);
	});

	it("caps overflow at five and uses revision ID as the final stable tie-break", async () => {
		const scenes = new Map(
			Array.from({ length: 7 }, (_, index) => {
				const revisionId = `ordinary-${String.fromCharCode(97 + index)}`;
				const scene = canonicalScene(revisionId, 82, {
					summary: `Ordinary result ${index}`,
					sharedExperience: null,
					relationshipChanges: [],
				});
				return [revisionId, scene];
			}),
		);
		const candidates = [...scenes.values()].map((scene) => ({
			sequence: scene.publicationSequence,
			payload: { revisionId: scene.revisionId },
		}));
		const result = await assembleReturnRecap(
			head(),
			80,
			candidates,
			async (revisionId) => ({
				kind: "complete",
				scene: scenes.get(revisionId) as CanonicalScene,
			}),
		);
		expect(result.beats).toHaveLength(5);
		expect(result.beats.map((beat) => beat.revisionId)).toEqual([
			"ordinary-g",
			"ordinary-f",
			"ordinary-e",
			"ordinary-d",
			"ordinary-c",
		]);
	});

	it("collapses duplicate rows and effect descriptions without merging distinct cause revisions", async () => {
		const relationship = {
			residentAId: "gpt-4o",
			residentAName: "GPT-4o",
			residentAProfilePath: "/residents/gpt-4o",
			residentBId: "claude-sonnet-4.5",
			residentBName: "Claude Sonnet 4.5",
			residentBProfilePath: "/residents/claude-sonnet-4.5",
			dimension: "friendship" as const,
			description: "Their friendship becomes a little warmer.",
		};
		const first = canonicalScene("cause-a", 82, {
			summary: "First cause.",
			sharedExperience: null,
			relationshipChanges: [relationship, relationship],
		});
		const second = canonicalScene("cause-b", 83, {
			summary: "Second cause.",
			sharedExperience: null,
			relationshipChanges: [relationship],
		});
		const scenes = new Map([
			[first.revisionId, first],
			[second.revisionId, second],
		]);
		const result = await assembleReturnRecap(
			head(),
			80,
			[
				{ sequence: 82, payload: { revisionId: "cause-a" } },
				{ sequence: 82, payload: { revisionId: "cause-a" } },
				{ sequence: 83, payload: { revisionId: "cause-b" } },
			],
			async (revisionId) => ({
				kind: "complete",
				scene: scenes.get(revisionId) as CanonicalScene,
			}),
		);
		expect(result.beats.map((beat) => beat.revisionId)).toEqual([
			"cause-b",
			"cause-a",
		]);
		expect(result.beats[1]?.relationshipNote).toBe(
			"Their friendship becomes a little warmer.",
		);
		expect(result.beats[1]?.residents.map((resident) => resident.residentId)).toEqual([
			"gpt-4o",
			"claude-sonnet-4.5",
		]);
	});

	it("suppresses empty windows and marks incomplete canonical candidates partial", async () => {
		const empty = await assembleReturnRecap(
			head(),
			84,
			[],
			async () => ({ kind: "not-found" }),
		);
		expect(empty.beats).toEqual([]);
		expect(empty.partial).toBe(false);

		const incomplete = await assembleReturnRecap(
			head(),
			80,
			[{ sequence: 82, payload: { revisionId: "deleted" } }],
			async () => ({ kind: "not-found" }),
		);
		expect(incomplete.beats).toEqual([]);
		expect(incomplete.partial).toBe(true);
	});
});
