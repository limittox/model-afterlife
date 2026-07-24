import { z } from "zod";

export const SEMANTIC_JUDGE_PROMPT_VERSION = "phase-02-semantic-judge-v1";

export const SEMANTIC_JUDGE_PROFILE = Object.freeze({
	requestedModelId: "openai/gpt-4o",
	canonicalModelId: "openai/gpt-4o",
	approvedUpstream: "OpenAI",
	promptVersion: SEMANTIC_JUDGE_PROMPT_VERSION,
	role: "independent-reject-only-evaluator",
});

export const SemanticDimensionSchema = z.enum([
	"responsiveness",
	"voice",
	"affection",
	"novelty",
	"resolution",
]);

const ScoreSchema = z.number().int().min(0).max(4);

export const SemanticJudgeResultSchema = z
	.object({
		scores: z
			.object({
				responsiveness: ScoreSchema,
				voice: ScoreSchema,
				affection: ScoreSchema,
				novelty: ScoreSchema,
				resolution: ScoreSchema,
			})
			.strict(),
		reasons: z
			.object({
				responsiveness: z.string().trim().min(1).max(160),
				voice: z.string().trim().min(1).max(160),
				affection: z.string().trim().min(1).max(160),
				novelty: z.string().trim().min(1).max(160),
				resolution: z.string().trim().min(1).max(160),
			})
			.strict(),
		recommendation: z.enum(["pass", "review", "reject"]),
		criticalFailureIds: z.array(z.string().trim().min(1).max(80)).max(12),
		requestedModelId: z.literal(SEMANTIC_JUDGE_PROFILE.requestedModelId),
		resolvedModelId: z.literal(SEMANTIC_JUDGE_PROFILE.canonicalModelId),
		promptVersion: z.literal(SEMANTIC_JUDGE_PROMPT_VERSION),
	})
	.strict();

export type SemanticJudgeResult = z.infer<typeof SemanticJudgeResultSchema>;

export const SemanticGateEvidenceSchema = z
	.object({
		status: z.literal("approved"),
		labelSetHash: z.string().regex(/^[a-f0-9]{64}$/),
		correlation: z.number().min(0.7).max(1),
		criticalFalseNegatives: z.literal(0),
		result: SemanticJudgeResultSchema,
	})
	.strict();

export type SemanticGateEvidence = z.infer<typeof SemanticGateEvidenceSchema>;

export type SemanticJudgeProvider = Readonly<{
	score: (input: {
		briefId: string;
		participantIds: readonly string[];
		premise: string;
		turns: readonly { residentId: string; text: string }[];
	}) => Promise<unknown>;
}>;

export async function runSemanticJudge(input: {
	deterministicAccepted: boolean;
	calibration: {
		status: "draft" | "approved";
		enabled: boolean;
		correlation: number;
		criticalFalseNegatives: number;
	};
	scene: {
		briefId: string;
		participantIds: readonly string[];
		premise: string;
		turns: readonly { residentId: string; text: string }[];
	};
	provider: SemanticJudgeProvider;
}): Promise<
	| { status: "disabled"; reason: string }
	| { status: "scored"; result: SemanticJudgeResult }
> {
	if (!input.deterministicAccepted) {
		return {
			status: "disabled",
			reason: "Deterministic publication gates must pass before semantic judging.",
		};
	}
	if (
		input.calibration.status !== "approved" ||
		!input.calibration.enabled ||
		input.calibration.correlation < 0.7 ||
		input.calibration.criticalFalseNegatives !== 0
	) {
		return {
			status: "disabled",
			reason:
				"Semantic gating remains fail-closed until approved calibration reaches 0.70 with zero critical false negatives.",
		};
	}
	return {
		status: "scored",
		result: SemanticJudgeResultSchema.parse(await input.provider.score(input.scene)),
	};
}
