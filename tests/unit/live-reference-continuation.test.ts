import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
	classifyLiveGenerationFailure,
	validatePriorCheckpoint,
	validatePriorRetry2Checkpoint,
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

	it("accepts only the four-pass identity-gate rejection at cumulative 113", () => {
		expect(() => validatePriorRetry2Checkpoint()).not.toThrow();

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
		const evidence = JSON.parse(
			readFileSync(
				resolve("evals/results/phase-02-live-reference.json"),
				"utf8",
			),
		) as {
			failure: {
				validatorCodes: { id: string; code: string }[];
			};
		};

		expect(retry.status).toBe("failed");
		expect(retry.cumulativeGenerationsConsumed).toBe(113);
		expect(retry.entries.every((entry) => entry.status === "passed")).toBe(
			true,
		);
		expect(
			evidence.failure.validatorCodes.find(
				(result) => result.id === "identity",
			),
		).toMatchObject({ code: "identity.unverified" });
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
