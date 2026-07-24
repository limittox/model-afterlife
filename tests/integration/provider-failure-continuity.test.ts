import { describe, expect, it, vi } from "vitest";
import { reduceWorldEvent } from "../../src/features/world/domain/events.ts";
import type {
	CompleteWorldScene,
	SceneGenerationResolvedEvent,
} from "../../src/features/world/domain/types.ts";
import {
	PublishedSceneRevisionSchema,
	SceneBriefSchema,
} from "../../src/features/world/generation/contracts.ts";
import { runGenerationRequest } from "../../src/features/world/generation/run-generation-request.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { cachedSceneFromPublishedRevision } from "../../src/features/world/server/read-cached-scene.ts";
import { classifyProviderFailure } from "../../src/trigger/generate-scene.ts";
import { acceptedCandidateFixture } from "../fixtures/accepted-candidate.ts";

const request = {
	sceneKey: "failed-scene",
	briefId: "failed-brief",
	expectedWorldHead: 7,
	occurrenceKey: "failed-scene-request",
};

const failedBrief = SceneBriefSchema.parse({
	schemaVersion: 1,
	briefId: "failed-brief",
	sceneKey: request.sceneKey,
	expectedWorldHead: request.expectedWorldHead,
	participantIds: ["gpt-4o", "claude-sonnet-4.5"],
	speakerOrder: [
		"gpt-4o",
		"claude-sonnet-4.5",
		"gpt-4o",
		"claude-sonnet-4.5",
	],
	locationId: "common-room",
	premise: "The live scene that could not be generated.",
	allowedFactIds: [],
	tone: "warm",
	turnBudget: 4,
	permittedOutcome: "quiet ending",
});

const originalBrief = SceneBriefSchema.parse({
	...failedBrief,
	briefId: "original-brief",
	sceneKey: "original-scene",
	expectedWorldHead: 2,
	premise: "An earlier accepted scene.",
});

const originalRevision = PublishedSceneRevisionSchema.parse({
	revisionId: "original-revision",
	attemptId: "original-attempt",
	sceneKey: originalBrief.sceneKey,
	expectedWorldHead: originalBrief.expectedWorldHead,
	turns: originalBrief.speakerOrder.map((residentId, turnIndex) => ({
		turnIndex,
		residentId,
		requestedModelId:
			residentId === "gpt-4o"
				? "openai/gpt-4o"
				: "anthropic/claude-sonnet-4.5",
		text: `Original immutable turn ${turnIndex + 1}.`,
		ending: turnIndex === originalBrief.turnBudget - 1,
		effects: [],
	})),
});
const acceptedCandidate = acceptedCandidateFixture(failedBrief, originalRevision);

function cachedScene(): CompleteWorldScene {
	const scene = cachedSceneFromPublishedRevision({
		failedBrief,
		originalBrief,
		revision: originalRevision,
		startedAtTick: 20,
	});
	if (!scene) throw new Error("Expected a compatible cached scene.");
	return scene;
}

describe("provider failure continuity", () => {
	it.each([
		["schema_rejected"],
		["identity_rejected"],
		["fact_rejected"],
		["safety_rejected"],
		["refused"],
		["timed_out"],
		["provider_outage"],
		["provider_failed"],
	] as const)(
		"keeps two rejected %s attempts private and resolves to cached continuity",
		async (disposition) => {
			const runAttempt = vi.fn(
				async (_input: {
					brief: typeof failedBrief;
					attemptOrdinal: 1 | 2;
				}) => ({
					status: "rejected" as const,
					disposition,
				}),
			);
			const publish = vi.fn(async () => ({
				revisionId: "never",
				published: true,
			}));
			const resolveContinuity = vi.fn(async () => ({
				mode: "cached" as const,
				cachedRevisionId: originalRevision.revisionId,
			}));

			const result = await runGenerationRequest(request, {
				loadBrief: async () => failedBrief,
				runAttempt,
				publish,
				resolveContinuity,
			});

			expect(runAttempt).toHaveBeenCalledTimes(2);
			expect(runAttempt.mock.calls.map((call) => call[0])).toEqual([
				{ brief: failedBrief, attemptOrdinal: 1 },
				{ brief: failedBrief, attemptOrdinal: 2 },
			]);
			expect(publish).not.toHaveBeenCalled();
			expect(resolveContinuity).toHaveBeenCalledWith({
				brief: failedBrief,
				sceneKey: request.sceneKey,
				terminalDisposition: "generation_failed_after_two_attempts",
				attemptDispositions: [disposition, disposition],
			});
			expect(result).toMatchObject({
				status: "cached",
				cachedRevisionId: originalRevision.revisionId,
			});
		},
	);

	it("records stale completion once and does not spend a second attempt", async () => {
		const runAttempt = vi.fn(async () => ({
			status: "accepted" as const,
			candidate: acceptedCandidate,
		}));
		const resolveContinuity = vi.fn(async () => ({
			mode: "quiet" as const,
		}));

		const result = await runGenerationRequest(request, {
			loadBrief: async () => failedBrief,
			runAttempt,
			publish: async () => {
				throw new Error("stale_world");
			},
			resolveContinuity,
		});

		expect(runAttempt).toHaveBeenCalledOnce();
		expect(resolveContinuity).toHaveBeenCalledWith({
			brief: failedBrief,
			sceneKey: request.sceneKey,
			terminalDisposition: "stale_world",
			attemptDispositions: ["stale_world"],
		});
		expect(result).toMatchObject({
			status: "quiet",
			disposition: "stale_world",
		});
	});

	it("converges duplicate delivery on the existing revision without fallback", async () => {
		const resolveContinuity = vi.fn(async () => ({
			mode: "quiet" as const,
		}));
		const result = await runGenerationRequest(request, {
			loadBrief: async () => failedBrief,
			runAttempt: async () => ({
				status: "accepted",
				candidate: acceptedCandidate,
			}),
			publish: async () => ({
				revisionId: originalRevision.revisionId,
				published: false,
			}),
			resolveContinuity,
		});

		expect(result).toMatchObject({
			status: "duplicate",
			revisionId: originalRevision.revisionId,
		});
		expect(resolveContinuity).not.toHaveBeenCalled();
	});

	it("reuses only a compatible published revision with explicit original provenance", () => {
		const scene = cachedScene();

		expect(scene).toMatchObject({
			deliveryMode: "cached",
			originalRevisionId: originalRevision.revisionId,
			originalSceneKey: originalRevision.sceneKey,
			participantIds: failedBrief.participantIds,
		});
		expect(scene.turns.map((turn) => turn.text)).toEqual(
			originalRevision.turns.map((turn) => turn.text),
		);
		expect(
			cachedSceneFromPublishedRevision({
				failedBrief: {
					...failedBrief,
					locationId: "library",
				},
				originalBrief,
				revision: originalRevision,
				startedAtTick: 20,
			}),
		).toBeNull();
	});

	it.each([
		[new Error("request timed out"), "timed_out"],
		[new Error("provider content filter refusal"), "refused"],
		[new Error("upstream 503 unavailable"), "provider_outage"],
		[new Error("unexpected socket failure"), "provider_failed"],
	] as const)("classifies %s without exposing provider content", (error, expected) => {
		expect(classifyProviderFailure(error)).toBe(expected);
	});

	it("changes only availability when resolving quiet or cached continuity", () => {
		const initial = createProvisionalWorld();
		initial.pendingSceneRequest = {
			sceneKey: request.sceneKey,
			briefId: request.briefId,
			participantIds: [...failedBrief.participantIds],
			requestedAtTick: 10,
			expectedWorldHead: request.expectedWorldHead,
		};
		const relationships = structuredClone(initial.relationships);
		const memories = structuredClone(initial.memories);
		const sceneHistory = structuredClone(initial.sceneHistory);
		const event: SceneGenerationResolvedEvent = {
			schemaVersion: 1,
			sequence: 8,
			occurrenceKey: "continuity:cached",
			logicalTick: 20,
			type: "scene_generation_resolved",
			payload: {
				sceneKey: request.sceneKey,
				disposition: "cached",
				cachedScene: cachedScene(),
			},
		};

		const resolved = reduceWorldEvent(initial, event);

		expect(resolved.pendingSceneRequest).toBeNull();
		expect(resolved.scene?.deliveryMode).toBe("cached");
		expect(resolved.relationships).toEqual(relationships);
		expect(resolved.memories).toEqual(memories);
		expect(resolved.sceneHistory).toEqual(sceneHistory);
	});
});
