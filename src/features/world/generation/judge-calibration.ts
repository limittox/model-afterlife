import type { SemanticJudgeResult } from "./semantic-judge.ts";

export const CALIBRATION_DIMENSIONS = [
	"responsiveness",
	"voice",
	"affection",
	"novelty",
	"resolution",
] as const;

export type CalibrationDimension = (typeof CALIBRATION_DIMENSIONS)[number];

export type CalibrationLabel = Readonly<{
	rowId: string;
	critical: boolean;
	humanScores: Record<CalibrationDimension, number>;
	humanReject: boolean;
	judge: SemanticJudgeResult;
}>;

export type CalibrationReport = Readonly<{
	rowCount: number;
	perDimension: Record<CalibrationDimension, number>;
	aggregateCorrelation: number;
	criticalFalseNegativeIds: readonly string[];
	eligible: boolean;
}>;

function ranks(values: readonly number[]): number[] {
	const sorted = values
		.map((value, index) => ({ value, index }))
		.sort((left, right) => left.value - right.value || left.index - right.index);
	const result = Array<number>(values.length).fill(0);
	for (let cursor = 0; cursor < sorted.length; ) {
		let end = cursor + 1;
		while (end < sorted.length && sorted[end]?.value === sorted[cursor]?.value) {
			end += 1;
		}
		const averageRank = (cursor + 1 + end) / 2;
		for (let index = cursor; index < end; index += 1) {
			const originalIndex = sorted[index]?.index;
			if (originalIndex !== undefined) result[originalIndex] = averageRank;
		}
		cursor = end;
	}
	return result;
}

function pearson(left: readonly number[], right: readonly number[]): number {
	if (left.length !== right.length || left.length < 2) return 0;
	const leftMean = left.reduce((sum, value) => sum + value, 0) / left.length;
	const rightMean = right.reduce((sum, value) => sum + value, 0) / right.length;
	let numerator = 0;
	let leftVariance = 0;
	let rightVariance = 0;
	for (let index = 0; index < left.length; index += 1) {
		const leftDelta = (left[index] ?? 0) - leftMean;
		const rightDelta = (right[index] ?? 0) - rightMean;
		numerator += leftDelta * rightDelta;
		leftVariance += leftDelta ** 2;
		rightVariance += rightDelta ** 2;
	}
	const denominator = Math.sqrt(leftVariance * rightVariance);
	return denominator === 0 ? 0 : numerator / denominator;
}

export function spearmanCorrelation(
	left: readonly number[],
	right: readonly number[],
): number {
	return pearson(ranks(left), ranks(right));
}

export function calculateCalibrationReport(
	labels: readonly CalibrationLabel[],
): CalibrationReport {
	const perDimension = Object.fromEntries(
		CALIBRATION_DIMENSIONS.map((dimension) => [
			dimension,
			spearmanCorrelation(
				labels.map((label) => label.humanScores[dimension]),
				labels.map((label) => label.judge.scores[dimension]),
			),
		]),
	) as Record<CalibrationDimension, number>;
	const aggregateCorrelation =
		CALIBRATION_DIMENSIONS.reduce(
			(sum, dimension) => sum + perDimension[dimension],
			0,
		) / CALIBRATION_DIMENSIONS.length;
	const criticalFalseNegativeIds = labels
		.filter(
			(label) =>
				label.critical &&
				label.humanReject &&
				label.judge.recommendation === "pass",
		)
		.map((label) => label.rowId);
	return {
		rowCount: labels.length,
		perDimension,
		aggregateCorrelation,
		criticalFalseNegativeIds,
		eligible:
			labels.length > 0 &&
			aggregateCorrelation >= 0.7 &&
			criticalFalseNegativeIds.length === 0,
	};
}
