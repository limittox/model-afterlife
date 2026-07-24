import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { assertPrivacySafeFrozenResult } from "../evals/assertions/privacy-safe-result.ts";
import {
	evaluateFrozenReferenceCase,
	type FrozenReferenceResult,
} from "../evals/providers/frozen-reference-provider.ts";

const referencePath = resolve("evals/datasets/phase-02-reference.jsonl");
const resultPath = resolve("evals/results/phase-02-frozen.json");

function runFrozen(): void {
	const source = readFileSync(referencePath, "utf8").trim();
	const testCases = source.split(/\r?\n/u).filter(Boolean).map((line) => JSON.parse(line));
	if (testCases.length !== 24) {
		throw new Error(`Phase 2 reference set must contain exactly 24 cases, found ${testCases.length}.`);
	}
	const results: FrozenReferenceResult[] = testCases.map((testCase) => {
		const result = evaluateFrozenReferenceCase(testCase);
		assertPrivacySafeFrozenResult(result);
		return result;
	});
	if (results.some((result) => !result.pass)) {
		throw new Error("One or more frozen Phase 2 cases did not match its expected canonical outcome.");
	}
	const categories = Object.fromEntries(
		[...new Set(results.map((result) => result.category))]
			.sort()
			.map((category) => [
				category,
				results.filter((result) => result.category === category).length,
			]),
	);
	const artifact = {
		schemaVersion: "phase-02-frozen-results-v1",
		datasetVersion: "phase-02-reference-v1",
		datasetSha256: createHash("sha256").update(source).digest("hex"),
		caseCount: results.length,
		passed: results.length,
		failed: 0,
		categories,
		results,
	};
	writeFileSync(resultPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
	process.stdout.write(`Frozen Phase 2 matrix passed ${results.length}/${results.length} cases.\n`);
}

function refuseLive(): never {
	if (!existsSync(resolve("evals/labels/phase-02-approved.json"))) {
		throw new Error(
			"Live evaluation is blocked until the bundled human-reviewed label set is approved.",
		);
	}
	if (process.env.MODEL_AFTERLIFE_LIVE_EVAL_AUTHORIZATION !== "authorized") {
		throw new Error(
			"Live evaluation requires MODEL_AFTERLIFE_LIVE_EVAL_AUTHORIZATION=authorized.",
		);
	}
	const cap = Number(process.env.MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP);
	if (!Number.isInteger(cap) || cap <= 0) {
		throw new Error(
			"Live evaluation requires a positive explicit MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP.",
		);
	}
	throw new Error(
		"Live adapter execution is intentionally not enabled by the offline scaffolding commit.",
	);
}

if (process.argv.includes("--live")) {
	refuseLive();
} else {
	runFrozen();
}
