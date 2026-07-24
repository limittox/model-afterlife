import { describe, expect, it, vi } from "vitest";
import { OpenRouterSemanticJudgeProvider } from "../../src/features/world/generation/openrouter-semantic-judge-provider.ts";
import {
	SEMANTIC_JUDGE_PROFILE,
	SEMANTIC_JUDGE_PROMPT_VERSION,
} from "../../src/features/world/generation/semantic-judge.ts";

const wireResult = {
	scores: {
		responsiveness: 4,
		voice: 4,
		affection: 4,
		novelty: 3,
		resolution: 4,
	},
	reasons: {
		responsiveness: "The exchange responds to the supplied premise.",
		voice: "The voices remain distinct.",
		affection: "The tone preserves dignity.",
		novelty: "The scene avoids recent repetition.",
		resolution: "The final turn resolves the premise.",
	},
	recommendation: "pass" as const,
	criticalFailureIds: [],
};

describe("strict OpenRouter semantic judge provider", () => {
	it("uses the exact direct OpenAI route and returns app-owned provenance", async () => {
		const model = Symbol("semantic-judge-model");
		const route = vi.fn(() => model);
		const createRouter = vi.fn(() => route);
		const generateText = vi.fn(async () => ({
			output: wireResult,
			response: {
				id: "gen-semantic-1",
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
		}));
		const provider = new OpenRouterSemanticJudgeProvider({
			apiKey: "test-key",
			createRouter,
			generateText,
		});

		const result = await provider.score({
			briefId: "brief-1",
			participantIds: ["gpt-4o", "claude-sonnet-4.5"],
			premise: "A tea timer needs repair.",
			turns: [
				{ residentId: "gpt-4o", text: "I found the loose spring." },
				{
					residentId: "claude-sonnet-4.5",
					text: "I will hold the casing.",
				},
			],
		});

		expect(route).toHaveBeenCalledWith("openai/gpt-4o", {
			extraBody: {
				provider: {
					only: ["openai"],
					allow_fallbacks: false,
					require_parameters: true,
					data_collection: "deny",
				},
			},
		});
		expect(generateText).toHaveBeenCalledWith(
			expect.objectContaining({
				model,
				maxRetries: 0,
				experimental_telemetry: expect.objectContaining({
					recordInputs: false,
					recordOutputs: false,
				}),
			}),
		);
		expect(result).toMatchObject({
			...wireResult,
			requestedModelId: SEMANTIC_JUDGE_PROFILE.requestedModelId,
			resolvedModelId: SEMANTIC_JUDGE_PROFILE.canonicalModelId,
			promptVersion: SEMANTIC_JUDGE_PROMPT_VERSION,
		});
		expect(JSON.stringify(result)).not.toContain("dialogue");
	});

	it("fails closed when OpenRouter route evidence drifts", async () => {
		const provider = new OpenRouterSemanticJudgeProvider({
			apiKey: "test-key",
			createRouter: vi.fn(() => vi.fn(() => Symbol("model"))),
			generateText: vi.fn(async () => ({
				output: wireResult,
				response: {
					id: "gen-semantic-drift",
					modelId: "openai/gpt-4o",
					body: {
						openrouter_metadata: {
							requested: "openai/gpt-4o",
							strategy: "fallback",
							attempt: 2,
							endpoints: { total: 0, available: [] },
						},
					},
				},
			})),
		});

		await expect(
			provider.score({
				briefId: "brief-1",
				participantIds: ["gpt-4o", "claude-sonnet-4.5"],
				premise: "A tea timer needs repair.",
				turns: [],
			}),
		).rejects.toThrow(/direct/i);
	});
});
