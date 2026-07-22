import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { SceneBriefSchema } from "../../src/features/world/generation/contracts.ts";

async function loadProvider() {
	try {
		return await import(
			"../../src/features/world/generation/openrouter-resident-turn-provider.ts"
		);
	} catch {
		return undefined;
	}
}

const brief = SceneBriefSchema.parse({
	schemaVersion: 1,
	sceneKey: "openrouter-provider",
	expectedWorldHead: 1,
	participantIds: ["gpt-3.5-turbo-0613", "claude-sonnet-4.5"],
	speakerOrder: [
		"gpt-3.5-turbo-0613",
		"claude-sonnet-4.5",
		"gpt-3.5-turbo-0613",
		"claude-sonnet-4.5",
	],
	locationId: "common-room",
	premise: "A strict transport check.",
	allowedFactIds: ["claim-transport"],
	tone: "warm",
	turnBudget: 4,
	permittedOutcome: "quiet ending",
});

describe("strict OpenRouter resident provider", () => {
	it("uses the one approved SDK dependency and credential", async () => {
		const packageJson = JSON.parse(await readFile("package.json", "utf8"));
		const envExample = await readFile(".env.example", "utf8");

		expect(packageJson.dependencies["@openrouter/ai-sdk-provider"]).toBe(
			"3.0.0",
		);
		for (const removed of [
			"@ai-sdk/anthropic",
			"@ai-sdk/cohere",
			"@ai-sdk/google",
			"@ai-sdk/openai",
			"@ai-sdk/togetherai",
		]) {
			expect(packageJson.dependencies).not.toHaveProperty(removed);
		}
		expect(envExample).toContain("OPENROUTER_API_KEY=");
		for (const forbidden of ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_GENERATIVE_AI_API_KEY", "COHERE_API_KEY", "TOGETHER_API_KEY"]) {
			expect(envExample).not.toContain(forbidden);
		}
	});

	it("sends one bounded non-streaming call with strict routing and validates evidence", async () => {
		const providerModule = await loadProvider();

		expect(providerModule, "OpenRouter provider module must exist").toBeDefined();
		const model = Symbol("strict-openrouter-model");
		const modelFactory = vi.fn(() => model);
		const createRouter = vi.fn((configuration: unknown) => {
			expect(configuration).toEqual({
				apiKey: "test-key",
				headers: { "X-OpenRouter-Metadata": "enabled" },
			});
			return modelFactory;
		});
		const generateText = vi.fn(async (_options: Record<string, unknown>) => ({
			output: {
				text: "A short model-authored reply.",
				approvedClaimIds: [],
				proposedRelationshipEffects: [],
				endsScene: false,
			},
			response: {
				id: "gen-provider-1",
				modelId: "openai/gpt-3.5-turbo-0613",
				body: {
					openrouter_metadata: {
						requested: "openai/gpt-3.5-turbo-0613",
						strategy: "direct",
						attempt: 1,
						endpoints: {
							total: 1,
							available: [
								{
									provider: "Azure",
									model: "openai/gpt-3.5-turbo-0613",
									selected: true,
								},
							],
						},
						attempts: [
							{
								provider: "Azure",
								model: "openai/gpt-3.5-turbo-0613",
								status: 200,
							},
						],
						pipeline: [],
					},
				},
			},
			providerMetadata: { openrouter: { provider: "Azure" } },
			finishReason: "stop",
			usage: { inputTokens: 20, outputTokens: 8 },
		}));
		const provider = new providerModule!.OpenRouterResidentTurnProvider({
			apiKey: "test-key",
			createRouter,
			generateText,
		});

		const result = await provider.generateTurn({
			brief,
			turnIndex: 0,
			residentId: "gpt-3.5-turbo-0613",
			requestedModelId: "openai/gpt-3.5-turbo-0613",
			priorTurns: [],
		});

		expect(modelFactory).toHaveBeenCalledWith(
			"openai/gpt-3.5-turbo-0613",
			{
				extraBody: {
					provider: {
						only: ["azure"],
						allow_fallbacks: false,
						require_parameters: true,
						data_collection: "deny",
					},
				},
			},
		);
		const options = generateText.mock.calls[0]?.[0];
		expect(options).toBeDefined();
		expect(options).toMatchObject({
			model,
			maxOutputTokens: 180,
			maxRetries: 0,
			timeout: { totalMs: 30_000 },
			include: { responseBody: true },
		});
		expect(options).not.toHaveProperty("tools");
		expect(options).not.toHaveProperty("toolChoice");
		expect(options).not.toHaveProperty("stream");
		expect(result).toMatchObject({
			text: "A short model-authored reply.",
			providerResponseId: "gen-provider-1",
			observedModelId: "openai/gpt-3.5-turbo-0613",
			identityEvidence: "openrouter_verified",
		});
	});
});
