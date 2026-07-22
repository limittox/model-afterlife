import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { RESIDENT_PROVIDER_PROFILES } from "../../src/features/world/generation/provider-registry.ts";

async function loadAdmissionRunner() {
	try {
		return await import(
			"../../src/features/world/generation/run-admission-canaries.ts"
		);
	} catch {
		return undefined;
	}
}

function catalogEvidence(profile: (typeof RESIDENT_PROVIDER_PROFILES)[number]) {
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

function sample(profile: (typeof RESIDENT_PROVIDER_PROFILES)[number], ordinal: number) {
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
		expect(result.residents.every((resident) => resident.samples.length === 5)).toBe(true);
		for (const resident of result.residents) {
			expect(resident.p50LatencyMs).toBeGreaterThan(0);
			expect(resident.p95LatencyMs).toBeGreaterThanOrEqual(resident.p50LatencyMs);
			expect(resident.totalCost).toBeGreaterThan(0);
		}
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
		});
		expect(generateSample.mock.calls.length).toBeLessThan(30);
	});

	it("provides an explicit secret-gated live command", async () => {
		const packageJson = JSON.parse(await readFile("package.json", "utf8"));
		const script = await readFile("scripts/check-resident-admission.ts", "utf8").catch(() => "");

		expect(packageJson.scripts["check:resident-admission"]).toContain(
			"scripts/check-resident-admission.ts",
		);
		expect(script).toContain("--live");
		expect(script).toContain("--samples=5");
		expect(script).not.toMatch(/console\.(log|error)\([^)]*OPENROUTER_API_KEY/u);
	});
});
