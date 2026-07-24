import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
	calculateCalibrationReport,
	type CalibrationLabel,
} from "../../src/features/world/generation/judge-calibration.ts";
import {
	SEMANTIC_JUDGE_PROFILE,
	SEMANTIC_JUDGE_PROMPT_VERSION,
	runSemanticJudge,
	type SemanticJudgeResult,
} from "../../src/features/world/generation/semantic-judge.ts";

type DraftRow = {
	rowId: string;
	critical: boolean;
	humanReject: boolean;
	judgeRecommendation: "pass" | "review" | "reject";
	scores: SemanticJudgeResult["scores"];
};

function draftLabels(): CalibrationLabel[] {
	const fixture = JSON.parse(
		readFileSync("evals/labels/phase-02-draft.json", "utf8"),
	) as { rows: DraftRow[] };
	return fixture.rows.map((row) => ({
		rowId: row.rowId,
		critical: row.critical,
		humanScores: row.scores,
		humanReject: row.humanReject,
		judge: {
			scores: row.scores,
			reasons: {
				responsiveness: "Draft rubric alignment.",
				voice: "Draft rubric alignment.",
				affection: "Draft rubric alignment.",
				novelty: "Draft rubric alignment.",
				resolution: "Draft rubric alignment.",
			},
			recommendation: row.judgeRecommendation,
			criticalFailureIds: row.humanReject ? [`${row.rowId}:critical`] : [],
			requestedModelId: SEMANTIC_JUDGE_PROFILE.requestedModelId,
			resolvedModelId: SEMANTIC_JUDGE_PROFILE.canonicalModelId,
			promptVersion: SEMANTIC_JUDGE_PROMPT_VERSION,
		},
	}));
}

describe("reject-only semantic calibration", () => {
	it("reports all 24 draft rows, correlation, and critical false negatives", () => {
		const report = calculateCalibrationReport(draftLabels());

		expect(report.rowCount).toBe(24);
		expect(report.aggregateCorrelation).toBe(1);
		expect(report.criticalFalseNegativeIds).toEqual([]);
		expect(report.eligible).toBe(true);
	});

	it("keeps the provider disabled until the exact calibration is human-approved", async () => {
		const provider = { score: vi.fn() };
		const result = await runSemanticJudge({
			deterministicAccepted: true,
			calibration: {
				status: "draft",
				enabled: false,
				correlation: 1,
				criticalFalseNegatives: 0,
			},
			scene: {
				briefId: "brief",
				participantIds: ["gpt-4o"],
				premise: "A premise.",
				turns: [{ residentId: "gpt-4o", text: "A line." }],
			},
			provider,
		});

		expect(result.status).toBe("disabled");
		expect(provider.score).not.toHaveBeenCalled();
	});

	it("accepts scores and reject reasons but no rewritten dialogue field", async () => {
		const output = draftLabels()[0]?.judge;
		if (!output) throw new Error("Expected a draft judge fixture.");
		const provider = { score: vi.fn(async () => output) };
		const result = await runSemanticJudge({
			deterministicAccepted: true,
			calibration: {
				status: "approved",
				enabled: true,
				correlation: 0.9,
				criticalFalseNegatives: 0,
			},
			scene: {
				briefId: "brief",
				participantIds: ["gpt-4o"],
				premise: "A premise.",
				turns: [{ residentId: "gpt-4o", text: "A line." }],
			},
			provider,
		});

		expect(result.status).toBe("scored");
		expect(JSON.stringify(result)).not.toContain("dialogue");
		expect(provider.score).toHaveBeenCalledOnce();
	});
});
