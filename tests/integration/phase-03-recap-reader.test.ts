import { describe, expect, it } from "vitest";
import type { CanonicalScene } from "../../src/features/publication/contracts/public-publication.ts";
import {
	assembleReturnRecap,
	ReturnRecapMarkerError,
	type ReturnRecapHead,
} from "../../src/features/publication/server/read-return-recap.ts";
import { quietState } from "../../src/features/world/fixtures/ui-states.ts";

function head(): ReturnRecapHead {
	const snapshot = quietState.snapshot;
	if (!snapshot) throw new Error("Quiet fixture is required.");
	return {
		worldId: snapshot.worldId,
		throughSequence: 84,
		snapshot,
	};
}

function scene(): CanonicalScene {
	return {
		revisionId: "reader-scene",
		canonicalPath: "/scenes/reader-scene",
		publicationSequence: 82,
		premise: "A complete canonical scene becomes a return beat.",
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
		location: { id: "common-room", name: "Common Room" },
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
			text: `Turn ${turnIndex + 1}`,
			claimVersionIds: [],
		})),
		outcome: {
			summary: "The scene reaches its reviewed outcome.",
			sharedExperience: null,
			relationshipChanges: [],
		},
		historicalContext: [],
		disclosures: {
			stagedFiction: "Staged.",
			aiAuthorship: "Generated.",
			exactModelIds: ["openai/gpt-4o", "anthropic/claude-sonnet-4.5"],
			nonAffiliation: "Independent.",
		},
	};
}

describe("Phase 3 recap reader boundary", () => {
	it("keeps canonical publication identity and omits incomplete rows", async () => {
		const complete = scene();
		const result = await assembleReturnRecap(
			head(),
			80,
			[
				{ sequence: 83, payload: { revisionId: "missing-scene" } },
				{ sequence: 82, payload: { revisionId: complete.revisionId } },
			],
			async (revisionId) =>
				revisionId === complete.revisionId
					? { kind: "complete", scene: complete }
					: { kind: "not-found" },
		);
		expect(result.partial).toBe(true);
		expect(result.beats.map((beat) => beat.revisionId)).toEqual([
			"reader-scene",
		]);
		expect(JSON.stringify(result)).not.toContain("missing-scene");
	});

	it("rejects a future cursor rather than reading by wall-clock order", async () => {
		await expect(
			assembleReturnRecap(head(), 85, [], async () => ({ kind: "not-found" })),
		).rejects.toEqual(new ReturnRecapMarkerError("future-sequence"));
	});
});
