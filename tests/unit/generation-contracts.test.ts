import { describe, expect, it } from "vitest";
import { PublicWorldSnapshotSchema } from "../../src/features/world/contracts/public-world.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "../../src/features/world/server/to-public-snapshot.ts";
import { conductSceneAttempt } from "../../src/features/world/generation/conduct-scene.ts";
import { SceneBriefSchema } from "../../src/features/world/generation/contracts.ts";
import { validateTracerCandidate } from "../../src/features/world/generation/validate-tracer-candidate.ts";

describe("Phase 2 public scene contract", () => {
	it("accepts an accepted scene with the maximum ten complete turns", () => {
		const world = createProvisionalWorld();
		world.throughSequence = 1;
		world.scene = {
			id: "scene-phase-2-tracer",
			premise: "A quiet retrospective becomes a finished conversation.",
			locationId: "common-room",
			participantIds: ["atlas", "ember"],
			startedAtTick: 3,
			durationTicks: 4,
			presentationDurationMs: 12_000,
			turns: Array.from({ length: 10 }, (_, index) => ({
				id: `turn-${index}`,
				speakerId: index % 2 === 0 ? "atlas" : "ember",
				exactModelId:
					index % 2 === 0
						? "openai/gpt-4o"
						: "anthropic/claude-sonnet-4.5",
				text: `Validated tracer turn ${index + 1}.`,
			})),
		};
		world.quiet = null;

		expect(() =>
			PublicWorldSnapshotSchema.parse(toPublicWorldSnapshot(world)),
		).not.toThrow();
	});
});

describe("strict resident identity evidence", () => {
	const brief = SceneBriefSchema.parse({
		schemaVersion: 1,
		sceneKey: "identity-contract",
		expectedWorldHead: 1,
		participantIds: ["resident-a", "resident-b"],
		speakerOrder: ["resident-a", "resident-b", "resident-a", "resident-b"],
		locationId: "common-room",
		premise: "Identity evidence must remain fail closed.",
		allowedFactIds: ["claim-1"],
		tone: "warm",
		turnBudget: 4,
		permittedOutcome: "quiet ending",
	});

	it("carries verified OpenRouter evidence into the private attempt", async () => {
		const { attempt } = await conductSceneAttempt({
			brief,
			attemptId: "verified-attempt",
			provider: {
				generateTurn: async (input) => ({
					text: `Verified turn ${input.turnIndex + 1}.`,
					providerResponseId: `gen-${input.turnIndex}`,
					observedModelId: input.requestedModelId,
					identityEvidence: "openrouter_verified",
					finishReason: "stop",
					usage: { inputTokens: 2, outputTokens: 2 },
				}),
			},
			modelForResident: (residentId) => `model/${residentId}`,
		});

		expect(attempt.identityEvidence).toBe("openrouter_verified");
	});

	it("records the application-selected editorial attempt ordinal", async () => {
		const { attempt } = await conductSceneAttempt({
			brief,
			attemptId: "verified-attempt-2",
			attemptOrdinal: 2,
			provider: {
				generateTurn: async (input) => ({
					text: `Fresh turn ${input.turnIndex + 1}.`,
					providerResponseId: `fresh-${input.turnIndex}`,
					observedModelId: input.requestedModelId,
					identityEvidence: "openrouter_verified",
					finishReason: "stop",
					usage: { inputTokens: 2, outputTokens: 2 },
				}),
			},
			modelForResident: (residentId) => `model/${residentId}`,
		});

		expect(attempt.attemptOrdinal).toBe(2);
	});

	it("rejects requested-only and generic provider response evidence", async () => {
		for (const identityEvidence of ["requested_only", "provider_response"] as const) {
			const { attempt, turns } = await conductSceneAttempt({
				brief,
				attemptId: `unverified-${identityEvidence}`,
				provider: {
					generateTurn: async (input) => ({
						text: `Unverified turn ${input.turnIndex + 1}.`,
						providerResponseId: `response-${input.turnIndex}`,
						observedModelId: input.requestedModelId,
						identityEvidence,
						finishReason: "stop",
						usage: { inputTokens: 2, outputTokens: 2 },
					}),
				},
				modelForResident: (residentId) => `model/${residentId}`,
			});
			const validation = validateTracerCandidate({
				brief,
				attempt,
				turns,
				revisionId: `revision-${identityEvidence}`,
			});

			expect(validation.result).toMatchObject({
				accepted: false,
				code: "identity",
			});
		}
	});
});
