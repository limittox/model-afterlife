import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { RecentSceneArchive } from "../../src/features/publication/components/RecentSceneArchive.tsx";
import type { CanonicalScene } from "../../src/features/publication/contracts/public-publication.ts";
import { canonicalSceneHref } from "../../src/features/publication/server/canonical-scene-href.ts";
import {
	assembleRecentSceneArchive,
	type RecentPublicationCandidate,
} from "../../src/features/publication/server/read-recent-scenes.ts";

function sceneFor(
	revisionId: string,
	publicationSequence: number,
	homeDay = 1,
): CanonicalScene {
	return {
		revisionId,
		canonicalPath: `/scenes/${revisionId}`,
		publicationSequence,
		premise: "Equal title at an equal home time",
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
			logicalTick: 1,
			homeDay,
			homeTime: "09:01",
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
			text: `Complete turn ${turnIndex}`,
			claimVersionIds: [],
		})),
		outcome: {
			summary: "The timer is repaired without inventing private data.",
			sharedExperience: null,
			relationshipChanges: [],
		},
		historicalContext: [],
		disclosures: {
			stagedFiction: "Staged fiction.",
			aiAuthorship: "AI-authored dialogue.",
			exactModelIds: ["openai/gpt-4o", "anthropic/claude-sonnet-4.5"],
			nonAffiliation: "Not affiliated.",
		},
	};
}

function candidate(
	revisionId: string,
	sequence: number,
	originalRevisionId = revisionId,
): RecentPublicationCandidate {
	return {
		sequence,
		payload: {
			revisionId,
			scene: { originalRevisionId },
		},
	};
}

describe("Phase 3 recent canonical scenes", () => {
	it("normalizes cached identity and rejects unsafe canonical identifiers", () => {
		expect(
			canonicalSceneHref({
				revisionId: "cached:presentation",
				originalRevisionId: "revision:original",
			}),
		).toBe("/scenes/revision%3Aoriginal");
		expect(canonicalSceneHref({ revisionId: "cached:presentation" })).toBeNull();
		expect(canonicalSceneHref({ revisionId: "../private" })).toBeNull();
	});

	it("keeps equal-content revisions distinct and orders a permuted overflow", async () => {
		const scenes = new Map(
			Array.from({ length: 32 }, (_, index) => {
				const revisionId = `revision-${String(index + 1).padStart(2, "0")}`;
				return [revisionId, sceneFor(revisionId, index + 1, index < 16 ? 1 : 2)];
			}),
		);
		const candidates = [...scenes.values()]
			.map((scene) => candidate(scene.revisionId, scene.publicationSequence))
			.sort((left, right) =>
				left.sequence % 2 === 0 ? -1 : right.sequence % 2 === 0 ? 1 : 0,
			);
		const result = await assembleRecentSceneArchive(candidates, async (id) => {
			const scene = scenes.get(id);
			return scene ? { kind: "complete", scene } : { kind: "not-found" };
		});
		expect(result.kind).toBe("ready");
		if (result.kind !== "ready") return;
		expect(result.partial).toBe(false);
		expect(result.scenes).toHaveLength(30);
		expect(result.scenes.map((scene) => scene.revisionId)).toEqual(
			Array.from({ length: 30 }, (_, index) =>
				`revision-${String(32 - index).padStart(2, "0")}`,
			),
		);
		expect(new Set(result.scenes.map((scene) => scene.revisionId)).size).toBe(30);
		expect(result.scenes.every((scene) => scene.title === result.scenes[0]?.title)).toBe(
			true,
		);
	});

	it("withholds incomplete rows and renders honest loading, failure, empty, and partial states", async () => {
		const result = await assembleRecentSceneArchive(
			[candidate("complete", 2), candidate("incomplete", 1)],
			async (id) =>
				id === "complete"
					? { kind: "complete", scene: sceneFor("complete", 2) }
					: {
							kind: "known-unavailable",
							revisionId: "incomplete",
							reason: "canonical-record-incomplete",
						},
		);
		expect(result).toMatchObject({
			kind: "ready",
			partial: true,
			scenes: [{ revisionId: "complete" }],
		});
		const loading = renderToStaticMarkup(
			createElement(RecentSceneArchive, { result: { kind: "loading" } }),
		);
		const error = renderToStaticMarkup(
			createElement(RecentSceneArchive, { result: { kind: "error" } }),
		);
		const empty = renderToStaticMarkup(
			createElement(RecentSceneArchive, {
				result: { kind: "ready", scenes: [], partial: false },
			}),
		);
		const partial = renderToStaticMarkup(
			createElement(RecentSceneArchive, { result }),
		);
		expect(loading).toContain("Opening the recent scene archive");
		expect(error).toContain("The recent scenes could not be loaded");
		expect(error).toContain("Open archive again");
		expect(empty).toContain("The archive is quiet");
		expect(partial).toContain("Some recent scenes could not be loaded");
		expect(partial).not.toContain("incomplete");
	});

	it("projects only public allowlisted archive fields", async () => {
		const result = await assembleRecentSceneArchive(
			[candidate("allowlisted", 1)],
			async () => ({
				kind: "complete",
				scene: sceneFor("allowlisted", 1),
			}),
		);
		expect(result.kind).toBe("ready");
		const serialized = JSON.stringify(result);
		for (const forbidden of [
			"prompt",
			"providerResponse",
			"usage",
			"cost",
			"rawRelationship",
			"calibration",
			"hiddenReasoning",
		]) {
			expect(serialized).not.toContain(forbidden);
		}
	});
});
