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
	participantIds: ["gpt-4o", "claude-sonnet-4.5"],
	speakerOrder: [
		"gpt-4o",
		"claude-sonnet-4.5",
		"gpt-4o",
		"claude-sonnet-4.5",
	],
	locationId: "common-room",
	premise: "A strict transport check.",
	allowedFactIds: ["gpt4o-native-multimodal"],
	tone: "warm",
	turnBudget: 4,
	permittedOutcome: "quiet ending",
});

const validModelOutput = {
	text: "A schema-compatible reply.",
	approvedClaimIds: [],
	proposedRelationshipEffects: [],
	endsScene: false,
};

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

	it("emits a structural-only provider schema", async () => {
		const providerModule = await loadProvider();

		expect(providerModule, "OpenRouter provider module must exist").toBeDefined();
		if (!providerModule) throw new Error("OpenRouter provider module is missing.");
		const model = Symbol("schema-model");
		let capturedOutput: unknown;
		const generateText = vi.fn(async (options: Record<string, unknown>) => {
			capturedOutput = options.output;
			return {
				output: validModelOutput,
				response: {
					id: "gen-schema-1",
					modelId: "openai/gpt-4o",
					body: {
						openrouter_metadata: {
							requested: "openai/gpt-4o",
							strategy: "direct",
							attempt: 1,
							endpoints: {
								total: 1,
								available: [
									{
										provider: "OpenAI",
										model: "openai/gpt-4o",
										selected: true,
									},
								],
							},
							attempts: [
								{
									provider: "OpenAI",
									model: "openai/gpt-4o",
									status: 200,
								},
							],
							pipeline: [],
						},
					},
				},
				providerMetadata: { openrouter: { provider: "OpenAI" } },
				finishReason: "stop",
				usage: { inputTokens: 20, outputTokens: 8 },
			};
		});
		const provider = new providerModule.OpenRouterResidentTurnProvider({
			apiKey: "test-key",
			createRouter: vi.fn(() => vi.fn(() => model)),
			generateText,
		});

		await provider.generateTurn({
			brief,
			turnIndex: 0,
			residentId: "gpt-4o",
			requestedModelId: "openai/gpt-4o",
			priorTurns: [],
		});

		expect(capturedOutput).toBeDefined();
		const structuredOutput = capturedOutput as {
			responseFormat: PromiseLike<{
				schema?: {
					properties?: Record<string, unknown>;
				};
			}>;
			parseCompleteOutput(
				options: { text: string },
				context: Record<string, unknown>,
			): Promise<unknown>;
		};
		const responseFormat = await structuredOutput.responseFormat;
		expect(responseFormat.schema).toMatchObject({
			type: "object",
			additionalProperties: false,
			properties: {
				text: { type: "string" },
				approvedClaimIds: {
					type: "array",
					items: { type: "string" },
				},
				proposedRelationshipEffects: {
					type: "array",
					items: { type: "string" },
				},
				endsScene: { type: "boolean" },
			},
		});
		const serializedSchema = JSON.stringify(responseFormat.schema);
		for (const unsupportedKeyword of [
			'"not"',
			'"minLength"',
			'"maxLength"',
			'"minItems"',
			'"maxItems"',
		]) {
			expect(serializedSchema).not.toContain(unsupportedKeyword);
		}

		const structurallyValidOutput = {
			...validModelOutput,
			proposedRelationshipEffects: ["local validation must reject this"],
		};
		await expect(
			structuredOutput.parseCompleteOutput(
				{ text: JSON.stringify(structurallyValidOutput) },
				{},
			),
		).resolves.toEqual(structurallyValidOutput);
	});

	it.each([
		{
			boundary: "blank text",
			output: { ...validModelOutput, text: " " },
		},
		{
			boundary: "241-character text",
			output: { ...validModelOutput, text: "x".repeat(241) },
		},
		{
			boundary: "four approved claim IDs",
			output: {
				...validModelOutput,
				approvedClaimIds: ["claim-1", "claim-2", "claim-3", "claim-4"],
			},
		},
		{
			boundary: "one relationship effect",
			output: {
				...validModelOutput,
				proposedRelationshipEffects: ["not permitted"],
			},
		},
	])("rejects $boundary after provider generation", async ({ output }) => {
		const providerModule = await loadProvider();

		expect(providerModule, "OpenRouter provider module must exist").toBeDefined();
		if (!providerModule) throw new Error("OpenRouter provider module is missing.");
		const provider = new providerModule.OpenRouterResidentTurnProvider({
			apiKey: "test-key",
			createRouter: vi.fn(() => vi.fn(() => Symbol("local-validation-model"))),
			generateText: vi.fn(async () => ({
				output,
				response: { modelId: "openai/gpt-4o" },
				finishReason: "stop",
				usage: {},
			})),
		});

		await expect(
			provider.generateTurn({
				brief,
				turnIndex: 0,
				residentId: "gpt-4o",
				requestedModelId: "openai/gpt-4o",
				priorTurns: [],
			}),
		).rejects.toMatchObject({ name: "ZodError" });
	});

	it("sends one bounded non-streaming call with strict routing and validates evidence", async () => {
		const providerModule = await loadProvider();

		expect(providerModule, "OpenRouter provider module must exist").toBeDefined();
		if (!providerModule) throw new Error("OpenRouter provider module is missing.");
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
				modelId: "openai/gpt-4o",
				body: {
					openrouter_metadata: {
						requested: "openai/gpt-4o",
						strategy: "direct",
						attempt: 1,
						endpoints: {
							total: 1,
							available: [
								{
									provider: "OpenAI",
									model: "openai/gpt-4o",
									selected: true,
								},
							],
						},
						attempts: [
							{
								provider: "OpenAI",
								model: "openai/gpt-4o",
								status: 200,
							},
						],
						pipeline: [],
					},
				},
			},
			providerMetadata: { openrouter: { provider: "OpenAI" } },
			finishReason: "stop",
			usage: { inputTokens: 20, outputTokens: 8 },
		}));
		const provider = new providerModule.OpenRouterResidentTurnProvider({
			apiKey: "test-key",
			createRouter,
			generateText,
		});

		const result = await provider.generateTurn({
			brief,
			turnIndex: 0,
			residentId: "gpt-4o",
			requestedModelId: "openai/gpt-4o",
			priorTurns: [],
		});

		expect(modelFactory).toHaveBeenCalledWith(
			"openai/gpt-4o",
			{
				extraBody: {
					provider: {
						only: ["openai"],
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
			observedModelId: "openai/gpt-4o",
			identityEvidence: "openrouter_verified",
		});
	});

	it("uses the immutable reasoning-aware DeepSeek budget without exposing reasoning", async () => {
		const providerModule = await loadProvider();
		expect(providerModule, "OpenRouter provider module must exist").toBeDefined();
		if (!providerModule) throw new Error("OpenRouter provider module is missing.");

		const model = Symbol("deepseek-model");
		const modelFactory = vi.fn(() => model);
		const generateText = vi.fn(async (_options: Record<string, unknown>) => ({
			output: {
				text: "The answer can be shorter than the thinking.",
				approvedClaimIds: [],
				proposedRelationshipEffects: [],
				endsScene: false,
			},
			response: {
				id: "gen-deepseek-1",
				modelId: "deepseek/deepseek-r1-0528",
				body: {
					openrouter_metadata: {
						requested: "deepseek/deepseek-r1-0528",
						strategy: "direct",
						attempt: 1,
						endpoints: {
							total: 1,
							available: [
								{
									provider: "DeepInfra",
									model: "deepseek/deepseek-r1-0528",
									selected: true,
								},
							],
						},
						attempts: [
							{
								provider: "DeepInfra",
								model: "deepseek/deepseek-r1-0528",
								status: 200,
							},
						],
						pipeline: [],
					},
				},
			},
			providerMetadata: { openrouter: { provider: "DeepInfra" } },
			finishReason: "stop",
			usage: { inputTokens: 20, outputTokens: 100 },
		}));
		const provider = new providerModule.OpenRouterResidentTurnProvider({
			apiKey: "test-key",
			createRouter: vi.fn(() => modelFactory),
			generateText,
		});

		await provider.generateTurn({
			brief: SceneBriefSchema.parse({
				...brief,
				sceneKey: "deepseek-policy",
				participantIds: ["deepseek-r1-0528", "claude-sonnet-4.5"],
				speakerOrder: [
					"deepseek-r1-0528",
					"claude-sonnet-4.5",
					"deepseek-r1-0528",
					"claude-sonnet-4.5",
				],
				allowedFactIds: ["deepseek-r1-0528-reasoning"],
			}),
			turnIndex: 0,
			residentId: "deepseek-r1-0528",
			requestedModelId: "deepseek/deepseek-r1-0528",
			priorTurns: [],
		});

		expect(modelFactory).toHaveBeenCalledWith(
			"deepseek/deepseek-r1-0528",
			{
				extraBody: {
					provider: {
						only: ["deepinfra/fp4"],
						allow_fallbacks: false,
						require_parameters: true,
						data_collection: "deny",
						quantizations: ["fp4"],
					},
				},
				reasoning: { effort: "minimal", exclude: true },
			},
		);
		expect(generateText.mock.calls[0]?.[0]).toMatchObject({
			maxOutputTokens: 1024,
			experimental_telemetry: {
				recordInputs: false,
				recordOutputs: false,
			},
		});
	});
});
