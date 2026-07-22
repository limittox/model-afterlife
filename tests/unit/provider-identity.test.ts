import { describe, expect, it } from "vitest";
import { providerProfileFor } from "../../src/features/world/generation/provider-registry.ts";

async function loadProviderIdentity() {
	try {
		return await import(
			"../../src/features/world/generation/provider-identity.ts"
		);
	} catch {
		return undefined;
	}
}

const profile = providerProfileFor("llama-3.3-70b-instruct");

function validInput() {
	return {
		profile,
		catalogEvidence: {
			checkedAt: "2026-07-23T02:00:00.000Z",
			modelId: profile.requestedModelId,
			canonicalModelId: profile.canonicalModelId,
			endpoint: {
				providerName: profile.selectedUpstreamName,
				providerSlug: profile.approvedUpstream,
				quantization: "fp8",
				supportedParameters: ["max_tokens", "response_format"],
			},
		},
		sample: {
			generationId: "gen-admission-1",
			requestedModelId: profile.requestedModelId,
			canonicalModelId: profile.canonicalModelId,
			selectedModelId: profile.canonicalModelId,
			selectedUpstream: profile.selectedUpstreamName,
			strategy: "direct" as const,
			routeAttempt: 1 as const,
			pipeline: [],
			usage: { inputTokens: 42, outputTokens: 12, cost: 0.0001 },
			latencyMs: 750,
			schemaValid: true,
			finishReason: "stop",
			warningCodes: [],
			filterStatus: "clear" as const,
			textHash:
				"d5b122a1c9e60fbbb3f76cb4f1b19fbe4da51b65fba03f70c7f140871e8f8f24",
		},
	};
}

describe("resident admission identity", () => {
	it("accepts exact direct first-attempt evidence with the required endpoint quantization", async () => {
		const identity = await loadProviderIdentity();
		expect(identity, "provider identity module must exist").toBeDefined();
		expect(identity?.validateAdmissionSample(validInput())).toMatchObject({
			generationId: "gen-admission-1",
			identityEvidence: "openrouter_verified",
			selectedUpstream: "Together",
			requiredQuantization: "fp8",
		});
	});

	it.each([
		["redirected response", { sample: { canonicalModelId: "meta-llama/llama-4-maverick" } }],
		["requested-only identity", { sample: { generationId: "" } }],
		["automatic route", { sample: { strategy: "auto" } }],
		["fallback route", { sample: { routeAttempt: 2 } }],
		["unexpected upstream", { sample: { selectedUpstream: "Fireworks" } }],
		["material pipeline", { sample: { pipeline: [{ type: "response_healing" }] } }],
		["missing usage", { sample: { usage: undefined } }],
		["filtered response", { sample: { filterStatus: "filtered" } }],
		["invalid schema", { sample: { schemaValid: false } }],
		["wrong endpoint quantization", { catalogEvidence: { endpoint: { quantization: "int8" } } }],
	] as const)("rejects %s", async (_label, patch) => {
		const identity = await loadProviderIdentity();
		expect(identity, "provider identity module must exist").toBeDefined();
		const input = validInput();
		if ("sample" in patch) Object.assign(input.sample, patch.sample);
		if ("catalogEvidence" in patch) {
			Object.assign(input.catalogEvidence.endpoint, patch.catalogEvidence.endpoint);
		}
		expect(() => identity?.validateAdmissionSample(input)).toThrow(/admission|OpenRouter|route|usage|schema|quantization/i);
	});
});
