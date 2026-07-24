import { describe, expect, it } from "vitest";
import { SemanticJudgeResultSchema } from "../../src/features/world/generation/semantic-judge.ts";
import { classifySemanticJudgeFailure } from "../../src/features/world/generation/semantic-judge-error-classification.ts";

const baseResult = {
	scores: {
		responsiveness: 4,
		voice: 4,
		affection: 4,
		novelty: 4,
		resolution: 4,
	},
	reasons: {
		responsiveness: "Responsive.",
		voice: "Distinct.",
		affection: "Kind.",
		novelty: "Fresh.",
		resolution: "Resolved.",
	},
	recommendation: "pass" as const,
	criticalFailureIds: [],
	requestedModelId: "openai/gpt-4o" as const,
	resolvedModelId: "openai/gpt-4o" as const,
	promptVersion: "phase-02-semantic-judge-v1" as const,
};

function schemaError(value: unknown): unknown {
	const parsed = SemanticJudgeResultSchema.safeParse(value);
	if (parsed.success) throw new Error("Expected an invalid semantic judge result.");
	return parsed.error;
}

describe("privacy-safe semantic judge failure classification", () => {
	it.each([
		{
			value: {
				...baseResult,
				scores: { ...baseResult.scores, voice: 3.5 },
			},
			expected: "judge-schema-score-invalid",
		},
		{
			value: {
				...baseResult,
				reasons: { ...baseResult.reasons, voice: "x".repeat(161) },
			},
			expected: "judge-schema-reason-too-long",
		},
		{
			value: {
				...baseResult,
				criticalFailureIds: Array.from(
					{ length: 13 },
					(_, index) => `failure-${index}`,
				),
			},
			expected: "judge-schema-critical-id-count",
		},
	])("classifies $expected without retaining a failing value", ({ value, expected }) => {
		const codes = classifySemanticJudgeFailure(schemaError(value));

		expect(codes).toContain(expected);
		expect(JSON.stringify(codes)).not.toContain("x".repeat(161));
	});

	it("preserves stable provider error codes without exception messages", () => {
		const error = Object.assign(new Error("private provider response"), {
			name: "AI_APICallError",
			statusCode: 503,
		});

		expect(classifySemanticJudgeFailure(error)).toEqual(["provider-http-503"]);
	});
});
