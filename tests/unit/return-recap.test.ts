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
		outcome: {
			summary: "The timer works again.",
			sharedExperience: "They now share a memory of the repaired timer.",
			relationshipChanges: [],
		},
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
});
