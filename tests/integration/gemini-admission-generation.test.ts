import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResidentProviderProfile } from "../../src/features/world/generation/provider-registry.ts";

const generateTextFixture = vi.hoisted(() => vi.fn());

vi.mock("@openrouter/ai-sdk-provider", () => ({
	createOpenRouter: vi.fn(() => vi.fn(() => Symbol("offline-gemini-model"))),
}));

vi.mock("ai", async (importOriginal) => {
	const actual = await importOriginal<typeof import("ai")>();
	return {
		...actual,
		generateText: generateTextFixture,
	};
});

import {
	createLiveAdmissionDependencies,
	runAdmissionCanaries,
} from "../../src/features/world/generation/run-admission-canaries.ts";

function catalogEvidence(profile: ResidentProviderProfile) {
	return {
		checkedAt: "2026-07-24T00:00:00.000Z",
		modelId: profile.requestedModelId,
		canonicalModelId: profile.canonicalModelId,
		endpoint: {
			providerName: profile.selectedUpstreamName,
			providerSlug: profile.approvedUpstream,
			quantization: profile.requiredQuantization ?? "unknown",
			supportedParameters: ["max_tokens", "response_format"],
		},
	};
}

function admittedSample(profile: ResidentProviderProfile, ordinal: number) {
	return {
		generationId: `gen-${profile.residentId}-${ordinal}`,
		requestedModelId: profile.requestedModelId,
		canonicalModelId: profile.canonicalModelId,
		selectedModelId: profile.canonicalModelId,
		selectedUpstream: profile.selectedUpstreamName,
		strategy: "direct" as const,
		routeAttempt: 1 as const,
		pipeline: [],
		usage: { inputTokens: 20, outputTokens: 8, cost: 0.00001 },
		latencyMs: 100,
		schemaValid: true,
		finishReason: "stop",
		warningCodes: [],
		filterStatus: "clear" as const,
		textHash: "a".repeat(64),
	};
}

describe("Gemini admission generation", () => {
	beforeEach(() => {
		generateTextFixture.mockReset();
		generateTextFixture.mockResolvedValue({
			output: {
				text: "Even the tea seems to prefer a moment of reflection.",
				approvedClaimIds: ["gemini25-deliberative-reputation"],
				proposedRelationshipEffects: [],
				endsScene: false,
			},
			response: {
				id: "gen-gemini-offline-fixture",
				modelId: "google/gemini-2.5-pro",
				body: {
					openrouter_metadata: {
						requested: "google/gemini-2.5-pro",
						strategy: "direct",
						attempt: 1,
						endpoints: {
							total: 1,
							available: [
								{
									provider: "Google AI Studio",
									model: "google/gemini-2.5-pro",
									selected: true,
								},
							],
						},
						attempts: [
							{
								provider: "Google AI Studio",
								model: "google/gemini-2.5-pro",
								status: 200,
							},
						],
						pipeline: [],
					},
				},
			},
			providerMetadata: {
				openrouter: {
					provider: "Google AI Studio",
					usage: { cost: 0.00001 },
				},
			},
			finishReason: "stop",
			usage: { inputTokens: 20, outputTokens: 8 },
			warnings: [],
		});
	});

	it("admits an exact-version approved Gemini claim from its bounded canary context", async () => {
		const live = createLiveAdmissionDependencies({ apiKey: "offline-fixture" });

		const result = await runAdmissionCanaries(
			{ samples: 5, checkedAt: "2026-07-24T00:00:00.000Z" },
			{
				checkCatalog: async (profile) => catalogEvidence(profile),
				generateSample: async (profile, ordinal, evidence) =>
					profile.residentId === "gemini-2.5-pro"
						? live.generateSample(profile, ordinal, evidence)
						: admittedSample(profile, ordinal),
			},
		);

		expect(
			result.residents.find(
				(resident) => resident.residentId === "gemini-2.5-pro",
			)?.samples,
		).toHaveLength(5);
		expect(generateTextFixture).toHaveBeenCalledTimes(5);
		const prompt = generateTextFixture.mock.calls[0]?.[0]?.prompt;
		expect(prompt).toContain("gemini25-thinking-and-multimodal");
		expect(prompt).toContain("gemini25-deliberative-reputation");
		expect(prompt).toContain("gemini25-blueprint-exaggeration");
	});
});
