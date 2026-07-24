import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import type { ResidentProviderProfile } from "../../src/features/world/generation/provider-registry.ts";

const EXPECTED_RESIDENT_ORDER = [
	"gpt-4o",
	"claude-sonnet-4.5",
	"gemini-2.5-pro",
	"deepseek-r1-0528",
	"llama-3.3-70b-instruct",
	"qwen-2.5-7b-instruct",
] as const;

async function loadAdmissionRunner() {
	try {
		return await import(
			"../../src/features/world/generation/run-admission-canaries.ts"
		);
	} catch {
		return undefined;
	}
}

function catalogEvidence(profile: ResidentProviderProfile) {
	return {
		checkedAt: "2026-07-23T02:00:00.000Z",
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
		usage: { inputTokens: 20, outputTokens: 8, cost: 0.00001 },
		latencyMs: 100 + ordinal,
		schemaValid: true,
		finishReason: "stop",
		warningCodes: [],
		filterStatus: "clear" as const,
		textHash: "a".repeat(64),
	};
}

describe("resident admission canaries", () => {
	it("records exactly five sanitized samples for every exact resident", async () => {
		const admission = await loadAdmissionRunner();
		expect(admission, "admission runner module must exist").toBeDefined();
		if (!admission) return;

		const generateSample = vi.fn(async (profile, ordinal) => sample(profile, ordinal));
		const result = await admission.runAdmissionCanaries(
			{ samples: 5, checkedAt: "2026-07-23T02:00:00.000Z" },
			{
				checkCatalog: async (profile) => catalogEvidence(profile),
				generateSample,
			},
		);

		expect(generateSample).toHaveBeenCalledTimes(30);
		expect(result).toMatchObject({
			schemaVersion: 1,
			status: "admitted",
			sampleCount: 30,
		});
		expect(result.residents).toHaveLength(6);
		expect(result.residents.map((resident) => resident.residentId)).toEqual(
			EXPECTED_RESIDENT_ORDER,
		);
		expect(
			generateSample.mock.calls.map(([profile, ordinal]) => [
				profile.residentId,
				ordinal,
			]),
		).toEqual(
			Array.from({ length: 5 }, (_, index) =>
				EXPECTED_RESIDENT_ORDER.map((residentId) => [residentId, index + 1]),
			).flat(),
		);
		expect(result.residents.every((resident) => resident.samples.length === 5)).toBe(true);
		for (const resident of result.residents) {
			expect(resident.p50LatencyMs).toBeGreaterThan(0);
			expect(resident.p95LatencyMs).toBeGreaterThanOrEqual(resident.p50LatencyMs);
			expect(resident.totalCost).toBeGreaterThan(0);
		}
		expect(
			result.residents.find(
				(resident) => resident.residentId === "deepseek-r1-0528",
			),
		).toMatchObject({
			approvedUpstream: "deepinfra/fp4",
			maxOutputTokens: 1024,
			reasoning: { effort: "minimal", exclude: true },
		});
		expect(
			result.residents.find(
				(resident) => resident.residentId === "gemini-2.5-pro",
			),
		).toMatchObject({
			approvedUpstream: "google-ai-studio",
			maxOutputTokens: 1024,
			reasoning: { max_tokens: 128, exclude: true },
		});
		expect(
			result.residents
				.filter(
					(resident) =>
						resident.residentId !== "deepseek-r1-0528" &&
						resident.residentId !== "gemini-2.5-pro",
				)
				.every(
					(resident) =>
						resident.maxOutputTokens === 180 &&
						resident.reasoning === undefined,
				),
		).toBe(true);
		const serialized = JSON.stringify(result);
		for (const forbidden of ["rawText", "prompt", "authorization", "test-secret", "Bearer "]) {
			expect(serialized).not.toContain(forbidden);
		}
	});

	it("pauses the exact resident and exposes only a sanitized route reason on failure", async () => {
		const admission = await loadAdmissionRunner();
		expect(admission, "admission runner module must exist").toBeDefined();
		if (!admission) return;

		const generateSample = vi.fn(async (profile, ordinal) => {
			const result = sample(profile, ordinal);
			if (profile.residentId === "gemini-2.5-pro") result.strategy = "auto" as never;
			return result;
		});
		await expect(
			admission.runAdmissionCanaries(
				{ samples: 5, checkedAt: "2026-07-23T02:00:00.000Z" },
				{
					checkCatalog: async (profile) => catalogEvidence(profile),
					generateSample,
				},
			),
		).rejects.toMatchObject({
			name: "ResidentAdmissionError",
			residentId: "gemini-2.5-pro",
			approvedUpstream: "google-ai-studio",
			code: expect.stringMatching(/^[a-z0-9-]+$/u),
			callsConsumed: 3,
		});
		expect(generateSample).toHaveBeenCalledTimes(3);
		expect(
			generateSample.mock.calls.map(([profile, ordinal]) => [
				profile.residentId,
				ordinal,
			]),
		).toEqual([
			["gpt-4o", 1],
			["claude-sonnet-4.5", 1],
			["gemini-2.5-pro", 1],
		]);
	});

	it("provides an explicit secret-gated live command", async () => {
		const packageJson = JSON.parse(await readFile("package.json", "utf8"));
		const script = await readFile("scripts/check-resident-admission.ts", "utf8").catch(() => "");

		expect(packageJson.scripts["check:resident-admission"]).toContain(
			"scripts/check-resident-admission.ts",
		);
		expect(script).toContain("--live");
		expect(script).toContain("--samples=5");
		expect(script).toContain("callsConsumed");
		expect(script).not.toMatch(/console\.(log|error)\([^)]*OPENROUTER_API_KEY/u);
	});
});
