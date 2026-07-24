import { describe, expect, it, vi } from "vitest";
import type { ResidentProviderProfile } from "../../src/features/world/generation/provider-registry.ts";
import {
	ResidentAdmissionError,
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

function sample(profile: ResidentProviderProfile, ordinal: number) {
	return {
		generationId: `gen-${profile.residentId}-${ordinal}`,
		requestedModelId: profile.requestedModelId,
		canonicalModelId: profile.canonicalModelId,
		selectedModelId: profile.canonicalModelId,
		selectedUpstream: profile.selectedUpstreamName,
		strategy: "direct" as const,
		routeAttempt: 1 as const,
		pipeline: [],
		usage: { inputTokens: 10, outputTokens: 5, cost: 0.00001 },
		latencyMs: 100,
		schemaValid: true,
		finishReason: "stop",
		warningCodes: [],
		filterStatus: "clear" as const,
		textHash: "a".repeat(64),
	};
}

describe("admission generation accounting hook", () => {
	it("records a durable reservation and settlement around every generation", async () => {
		const events: Array<{
			residentId: string;
			ordinal: number;
			callsConsumed: number;
			status: string;
		}> = [];

		await runAdmissionCanaries(
			{
				samples: 5,
				onGenerationEvent: (event) => {
					events.push(event);
				},
			},
			{
				checkCatalog: async (profile) => catalogEvidence(profile),
				generateSample: async (profile, ordinal) => sample(profile, ordinal),
			},
		);

		expect(events).toHaveLength(60);
		for (let index = 0; index < 30; index += 1) {
			expect(events[index * 2]).toMatchObject({
				callsConsumed: index + 1,
				status: "reserved",
			});
			expect(events[index * 2 + 1]).toMatchObject({
				callsConsumed: index + 1,
				status: "passed",
			});
		}
	});

	it("settles the reserved generation as failed with a sanitized code", async () => {
		const events: Array<{ status: string; code?: string }> = [];
		const generateSample = vi.fn(async (profile, ordinal) => {
			if (profile.residentId === "gpt-4o") {
				throw new Error("secret provider detail");
			}
			return sample(profile, ordinal);
		});

		await expect(
			runAdmissionCanaries(
				{
					samples: 5,
					onGenerationEvent: (event) => {
						events.push(event);
					},
				},
				{
					checkCatalog: async (profile) => catalogEvidence(profile),
					generateSample,
				},
			),
		).rejects.toBeInstanceOf(ResidentAdmissionError);

		expect(events).toEqual([
			{ residentId: "gpt-4o", ordinal: 1, callsConsumed: 1, status: "reserved" },
			{
				residentId: "gpt-4o",
				ordinal: 1,
				callsConsumed: 1,
				status: "failed",
				code: "generation-check-failed",
			},
		]);
		expect(JSON.stringify(events)).not.toContain("secret provider detail");
	});
});
