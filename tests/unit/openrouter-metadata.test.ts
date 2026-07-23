import { describe, expect, it } from "vitest";
import { providerProfileFor } from "../../src/features/world/generation/provider-registry.ts";

async function loadMetadataValidator() {
	try {
		return await import(
			"../../src/features/world/generation/openrouter-metadata.ts"
		);
	} catch {
		return undefined;
	}
}

const profile = providerProfileFor("gpt-4o");
const approvedAttempt = {
	provider: "OpenAI",
	model: profile.canonicalModelId,
	status: 200,
};

function directMetadata() {
	return {
		requested: profile.requestedModelId,
		strategy: "direct",
		attempt: 1,
		endpoints: {
			total: 1,
			available: [
				{
					provider: "OpenAI",
					model: profile.canonicalModelId,
					selected: true,
				},
			],
		},
		attempts: [{ ...approvedAttempt }],
		pipeline: [],
		future_additive_field: { remains: "permitted" },
	};
}

describe("OpenRouter authorship evidence", () => {
	it("accepts only a direct first-attempt route with exact selected evidence", async () => {
		const validatorModule = await loadMetadataValidator();

		expect(validatorModule, "metadata validator module must exist").toBeDefined();
		expect(
			validatorModule?.validateOpenRouterMetadata({
				profile,
				generationId: "gen-direct-1",
				responseModelId: profile.canonicalModelId,
				metadata: directMetadata(),
			}),
		).toMatchObject({
			evidenceKind: "openrouter_verified",
			generationId: "gen-direct-1",
			strategy: "direct",
			routeAttempt: 1,
			selectedModelId: profile.canonicalModelId,
			selectedUpstream: "OpenAI",
		});
	});

	it("accepts an omitted optional attempts array after stable direct-route evidence passes", async () => {
		const validatorModule = await loadMetadataValidator();
		const metadata: Record<string, unknown> = { ...directMetadata() };
		delete metadata.attempts;

		expect(validatorModule, "metadata validator module must exist").toBeDefined();
		expect(
			validatorModule?.validateOpenRouterMetadata({
				profile,
				generationId: "gen-direct-without-attempt-details",
				responseModelId: profile.canonicalModelId,
				metadata,
			}),
		).toMatchObject({
			evidenceKind: "openrouter_verified",
			generationId: "gen-direct-without-attempt-details",
			strategy: "direct",
			routeAttempt: 1,
			selectedModelId: profile.canonicalModelId,
			selectedUpstream: "OpenAI",
		});
	});

	it.each([
		["empty", []],
		["multiple", [{ ...approvedAttempt }, { ...approvedAttempt }]],
		["wrong provider", [{ ...approvedAttempt, provider: "Azure" }]],
		[
			"wrong model",
			[{ ...approvedAttempt, model: "openai/gpt-4o-mini" }],
		],
		["non-200 status", [{ ...approvedAttempt, status: 503 }]],
	] as const)("rejects a present %s attempts array", async (_label, attempts) => {
		const validatorModule = await loadMetadataValidator();

		expect(validatorModule, "metadata validator module must exist").toBeDefined();
		expect(() =>
			validatorModule?.validateOpenRouterMetadata({
				profile,
				generationId: "gen-invalid-attempt-details",
				responseModelId: profile.canonicalModelId,
				metadata: { ...directMetadata(), attempts },
			}),
		).toThrowError(
			expect.objectContaining({ code: "route-attempt-mismatch" }),
		);
	});

	it.each([
		["missing metadata", undefined],
		["automatic strategy", { ...directMetadata(), strategy: "auto" }],
		["fallback attempt", { ...directMetadata(), attempt: 2 }],
		[
			"mutable requested alias",
			{ ...directMetadata(), requested: "openai/gpt-4o-mini" },
		],
		[
			"unexpected selected upstream",
			{
				...directMetadata(),
				endpoints: {
					total: 1,
					available: [
						{
							provider: "Azure",
							model: profile.canonicalModelId,
							selected: true,
						},
					],
				},
			},
		],
		[
			"unexpected selected model",
			{
				...directMetadata(),
				endpoints: {
					total: 1,
					available: [
						{
							provider: "OpenAI",
							model: "openai/gpt-4o-mini",
							selected: true,
						},
					],
				},
			},
		],
		[
			"material pipeline transformation",
			{
				...directMetadata(),
				pipeline: [
					{ type: "response_healing", name: "response-healing", data: {} },
				],
			},
		],
	] as const)("rejects %s evidence", async (_label, metadata) => {
		const validatorModule = await loadMetadataValidator();

		expect(validatorModule, "metadata validator module must exist").toBeDefined();
		expect(() =>
			validatorModule?.validateOpenRouterMetadata({
				profile,
				generationId: "gen-rejected",
				responseModelId: profile.canonicalModelId,
				metadata,
			}),
		).toThrow(/OpenRouter/i);
	});

	it("rejects missing generation identity and metadata-free cache evidence", async () => {
		const validatorModule = await loadMetadataValidator();

		expect(validatorModule, "metadata validator module must exist").toBeDefined();
		expect(() =>
			validatorModule?.validateOpenRouterMetadata({
				profile,
				generationId: undefined,
				responseModelId: profile.canonicalModelId,
				metadata: directMetadata(),
			}),
		).toThrow(/generation/i);
		expect(() =>
			validatorModule?.validateOpenRouterMetadata({
				profile,
				generationId: "cached-generation",
				responseModelId: profile.canonicalModelId,
				metadata: undefined,
			}),
		).toThrow(/OpenRouter/i);
	});
});
