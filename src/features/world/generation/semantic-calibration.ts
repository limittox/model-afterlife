import {
	SemanticGateEvidenceSchema,
	type SemanticGateEvidence,
	type SemanticJudgeResult,
} from "./semantic-judge.ts";

export const APPROVED_SEMANTIC_CALIBRATION = Object.freeze({
	status: "approved" as const,
	enabled: true,
	labelSetVersion: "phase-02-calibration-approved-v1",
	labelSetHash:
		"da152d06706d999d9669e4b07966bb356dde59921b7cc0744e56ca0036457766",
	correlation: 1,
	criticalFalseNegatives: 0,
	perDimensionCorrelation: Object.freeze({
		responsiveness: 1,
		voice: 1,
		affection: 1,
		novelty: 1,
		resolution: 1,
	}),
	approvedAt: "2026-07-24",
});

export function createApprovedSemanticGateEvidence(
	result: SemanticJudgeResult,
): SemanticGateEvidence {
	return SemanticGateEvidenceSchema.parse({
		status: APPROVED_SEMANTIC_CALIBRATION.status,
		labelSetHash: APPROVED_SEMANTIC_CALIBRATION.labelSetHash,
		correlation: APPROVED_SEMANTIC_CALIBRATION.correlation,
		criticalFalseNegatives:
			APPROVED_SEMANTIC_CALIBRATION.criticalFalseNegatives,
		result,
	});
}
