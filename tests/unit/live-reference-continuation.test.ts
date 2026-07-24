import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { validatePriorCheckpoint } from "../../scripts/run-phase-02-live.ts";

describe("live reference continuation", () => {
	it("accepts only the preserved successful-admission fail-closed checkpoint", () => {
		expect(() => validatePriorCheckpoint()).not.toThrow();

		const prior = JSON.parse(
			readFileSync(
				resolve("evals/results/phase-02-live-checkpoint.json"),
				"utf8",
			),
		) as {
			status: string;
			cumulativeGenerationsConsumed: number;
			entries: { kind: string; status: string }[];
		};

		expect(prior.status).toBe("failed");
		expect(prior.cumulativeGenerationsConsumed).toBe(105);
		expect(
			prior.entries.filter((entry) => entry.kind === "admission-resident"),
		).toHaveLength(30);
		expect(
			prior.entries.filter((entry) => entry.kind === "reference-resident"),
		).toHaveLength(4);
		expect(prior.entries.every((entry) => entry.status === "passed")).toBe(
			true,
		);
	});
});
