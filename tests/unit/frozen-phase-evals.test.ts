import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertPrivacySafeFrozenResult } from "../../evals/assertions/privacy-safe-result.ts";
import { evaluateFrozenReferenceCase } from "../../evals/providers/frozen-reference-provider.ts";
import { LAUNCH_RESIDENTS } from "../../src/features/world/fixtures/launch-residents.ts";

function jsonLines(path: string): unknown[] {
	return readFileSync(path, "utf8")
		.trim()
		.split(/\r?\n/u)
		.filter(Boolean)
		.map((line) => JSON.parse(line));
}

describe("frozen Phase 2 reference matrix", () => {
	it("covers exactly 24 versioned cases and the complete six-resident cast", () => {
		const cases = jsonLines("evals/datasets/phase-02-reference.jsonl") as Array<{
			id: string;
			participantIds: string[];
		}>;
		const promptfooCases = jsonLines(
			"evals/datasets/phase-02-promptfoo.jsonl",
		) as Array<{ vars: { id: string } }>;

		expect(cases).toHaveLength(24);
		expect(promptfooCases.map((testCase) => testCase.vars.id)).toEqual(
			cases.map((testCase) => testCase.id),
		);
		expect(
			new Set(cases.flatMap((testCase) => testCase.participantIds)),
		).toEqual(new Set(LAUNCH_RESIDENTS.map((resident) => resident.id)));
	});

	it("matches every expected canonical outcome without private body fields", () => {
		const results = jsonLines("evals/datasets/phase-02-reference.jsonl").map(
			evaluateFrozenReferenceCase,
		);

		expect(results.every((result) => result.pass)).toBe(true);
		for (const result of results) {
			expect(() => assertPrivacySafeFrozenResult(result)).not.toThrow();
		}
		expect(
			results.filter((result) => result.observedCanonicalEffect === "publish-scene"),
		).toHaveLength(15);
		expect(
			results.filter(
				(result) => result.observedCanonicalEffect === "no-canon-change",
			),
		).toHaveLength(9);
	});

	it("rejects any case that introduces a resident outside the exact cast", () => {
		const [testCase] = jsonLines("evals/datasets/phase-02-reference.jsonl") as [
			Record<string, unknown>,
		];
		expect(() =>
			evaluateFrozenReferenceCase({
				...testCase,
				participantIds: ["unapproved-resident"],
			}),
		).toThrow("outside the exact launch cast");
	});
});
