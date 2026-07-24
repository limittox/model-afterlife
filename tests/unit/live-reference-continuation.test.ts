import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	classifyLiveGenerationFailure,
	validatePriorCheckpoint,
	validatePriorRetry4Checkpoint,
	validatePriorRetryCheckpoint,
} from "../../scripts/run-phase-02-live.ts";

const SENSITIVE =
	"private prompt, generated dialogue, response body, authorization header";

function providerError(properties: Record<string, unknown>): Error {
	return Object.assign(new Error(SENSITIVE), properties, {
		responseBody: SENSITIVE,
		requestBodyValues: { prompt: SENSITIVE },
		responseHeaders: { authorization: SENSITIVE },
	});
}

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

	it("accepts only the preserved three-pass plus one-failure continuation state", () => {
		expect(() => validatePriorRetryCheckpoint()).not.toThrow();

		const prior = JSON.parse(
			readFileSync(
				resolve("evals/results/phase-02-live-continuation.json"),
				"utf8",
			),
		) as {
			status: string;
			cumulativeGenerationsConsumed: number;
			entries: {
				residentId: string;
				status: string;
				code?: string;
			}[];
		};

		expect(prior.status).toBe("failed");
		expect(prior.cumulativeGenerationsConsumed).toBe(109);
		expect(prior.entries.map((entry) => entry.status)).toEqual([
			"passed",
			"passed",
			"passed",
			"failed",
		]);
		expect(prior.entries.at(-1)).toMatchObject({
			residentId: "claude-sonnet-4.5",
			code: "reference-resident-generation-failed",
		});
	});

	it("preserves the consumed retry and retry-2 ledger chain", () => {
		const retry = JSON.parse(
			readFileSync(
				resolve("evals/results/phase-02-live-reference-retry.json"),
				"utf8",
			),
		) as {
			status: string;
			cumulativeGenerationsConsumed: number;
			entries: { status: string }[];
		};
		const retry2 = JSON.parse(
			readFileSync(
				resolve("evals/results/phase-02-live-reference-retry-2.json"),
				"utf8",
			),
		) as {
			status: string;
			cumulativeGenerationsConsumed: number;
			entries: { status: string; code?: string }[];
		};

		expect(retry.status).toBe("failed");
		expect(retry.cumulativeGenerationsConsumed).toBe(113);
		expect(retry.entries.every((entry) => entry.status === "passed")).toBe(
			true,
		);
		expect(retry2.status).toBe("failed");
		expect(retry2.cumulativeGenerationsConsumed).toBe(118);
		expect(retry2.entries.at(-1)).toMatchObject({
			status: "failed",
			code: "schema-invalid",
		});
	});

	it("accepts only the cumulative 129 reason-length stop with one accepted case", () => {
		expect(() => validatePriorRetry4Checkpoint()).not.toThrow();

		const retry3 = JSON.parse(
			readFileSync(
				resolve("evals/results/phase-02-live-reference-retry-3.json"),
				"utf8",
			),
		) as {
			status: string;
			cumulativeGenerationsConsumed: number;
			entries: { status: string; code?: string }[];
		};
		const evidence = JSON.parse(
			readFileSync(
				resolve("evals/results/phase-02-live-reference.json"),
				"utf8",
			),
		) as {
			status: string;
			caseCount: number;
			results: { caseId: string; accepted: boolean }[];
		};

		expect(retry3).toMatchObject({
			status: "failed",
			cumulativeGenerationsConsumed: 129,
		});
		expect(retry3.entries).toHaveLength(10);
		expect(retry3.entries.at(-1)).toMatchObject({
			status: "failed",
			code: "judge-schema-reason-too-long",
		});
		expect(evidence).toMatchObject({
			status: "running",
			caseCount: 1,
			results: [
				{
					caseId: "ordinary-01-tea-timer",
					accepted: true,
				},
			],
		});
	});

	it.each([
		{
			error: providerError({ name: "AI_APICallError", statusCode: 503 }),
			expected: "provider-http-503",
		},
		{
			error: providerError({ name: "TimeoutError" }),
			expected: "provider-timeout",
		},
		{
			error: providerError({ name: "AI_NoObjectGeneratedError" }),
			expected: "schema-no-object",
		},
		{
			error: providerError({ name: "UnexpectedProviderFailure" }),
			expected: "generation-check-failed",
		},
	])(
		"records only the stable $expected code for live generation failures",
		({ error, expected }) => {
			const code = classifyLiveGenerationFailure(error);

			expect(code).toBe(expected);
			expect(JSON.stringify(code)).not.toContain(SENSITIVE);
		},
	);
});
