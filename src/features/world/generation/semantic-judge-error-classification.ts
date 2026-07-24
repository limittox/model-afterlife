import { ZodError } from "zod";
import { classifyAdmissionFailure } from "./run-admission-canaries.ts";

export function classifySemanticJudgeFailure(error: unknown): string[] {
	if (!(error instanceof ZodError)) {
		return [classifyAdmissionFailure(error)];
	}
	const codes = error.issues.map((issue) => {
		const root = issue.path[0];
		if (root === "scores") return "judge-schema-score-invalid";
		if (root === "reasons") {
			if (issue.code === "too_big") return "judge-schema-reason-too-long";
			if (issue.code === "too_small") return "judge-schema-reason-empty";
			return "judge-schema-reason-invalid";
		}
		if (root === "criticalFailureIds") {
			if (issue.path.length === 1 && issue.code === "too_big") {
				return "judge-schema-critical-id-count";
			}
			return "judge-schema-critical-id-invalid";
		}
		return "judge-schema-invalid";
	});
	return [...new Set(codes)].sort();
}
