import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { conductSceneAttempt } from "../src/features/world/generation/conduct-scene.ts";
import { SceneBriefSchema } from "../src/features/world/generation/contracts.ts";
import { OpenRouterResidentTurnProvider } from "../src/features/world/generation/openrouter-resident-turn-provider.ts";
import { OpenRouterSemanticJudgeProvider } from "../src/features/world/generation/openrouter-semantic-judge-provider.ts";
import { providerProfileFor } from "../src/features/world/generation/provider-registry.ts";
import {
	classifyAdmissionFailure,
	createLiveAdmissionDependencies,
	runAdmissionCanaries,
} from "../src/features/world/generation/run-admission-canaries.ts";
import {
	APPROVED_SEMANTIC_CALIBRATION,
	createApprovedSemanticGateEvidence,
} from "../src/features/world/generation/semantic-calibration.ts";
import {
	runSemanticJudge,
	SEMANTIC_JUDGE_PROFILE,
} from "../src/features/world/generation/semantic-judge.ts";
import { classifySemanticJudgeFailure } from "../src/features/world/generation/semantic-judge-error-classification.ts";
import { validateSceneCandidate } from "../src/features/world/generation/validate-scene-candidate.ts";

const INITIAL_STARTING_CUMULATIVE_GENERATIONS = 71;
const ADMISSION_GENERATIONS = 30;
const REFERENCE_RESIDENT_GENERATIONS = 12;
const REFERENCE_JUDGE_GENERATIONS = 3;
const INITIAL_CHECKPOINT_GENERATIONS =
	ADMISSION_GENERATIONS +
	REFERENCE_RESIDENT_GENERATIONS +
	REFERENCE_JUDGE_GENERATIONS;
const INITIAL_REQUIRED_CUMULATIVE_CAP =
	INITIAL_STARTING_CUMULATIVE_GENERATIONS + INITIAL_CHECKPOINT_GENERATIONS;
const CONTINUATION_STARTING_CUMULATIVE_GENERATIONS = 105;
const CONTINUATION_CHECKPOINT_GENERATIONS =
	REFERENCE_RESIDENT_GENERATIONS + REFERENCE_JUDGE_GENERATIONS;
const CONTINUATION_REQUIRED_CUMULATIVE_CAP =
	CONTINUATION_STARTING_CUMULATIVE_GENERATIONS +
	CONTINUATION_CHECKPOINT_GENERATIONS;
const RETRY_STARTING_CUMULATIVE_GENERATIONS = 109;
const RETRY_CHECKPOINT_GENERATIONS =
	REFERENCE_RESIDENT_GENERATIONS + REFERENCE_JUDGE_GENERATIONS;
const RETRY_REQUIRED_CUMULATIVE_CAP =
	RETRY_STARTING_CUMULATIVE_GENERATIONS + RETRY_CHECKPOINT_GENERATIONS;
const RETRY_2_STARTING_CUMULATIVE_GENERATIONS = 113;
const RETRY_2_CHECKPOINT_GENERATIONS =
	REFERENCE_RESIDENT_GENERATIONS + REFERENCE_JUDGE_GENERATIONS;
const RETRY_2_REQUIRED_CUMULATIVE_CAP =
	RETRY_2_STARTING_CUMULATIVE_GENERATIONS + RETRY_2_CHECKPOINT_GENERATIONS;
const RETRY_3_STARTING_CUMULATIVE_GENERATIONS = 119;
const RETRY_3_CHECKPOINT_GENERATIONS =
	REFERENCE_RESIDENT_GENERATIONS + REFERENCE_JUDGE_GENERATIONS;
const RETRY_3_REQUIRED_CUMULATIVE_CAP =
	RETRY_3_STARTING_CUMULATIVE_GENERATIONS + RETRY_3_CHECKPOINT_GENERATIONS;
const RETRY_4_STARTING_CUMULATIVE_GENERATIONS = 129;
const RETRY_4_CHECKPOINT_GENERATIONS = 10;
const RETRY_4_REQUIRED_CUMULATIVE_CAP =
	RETRY_4_STARTING_CUMULATIVE_GENERATIONS + RETRY_4_CHECKPOINT_GENERATIONS;
const RETRY_5_STARTING_CUMULATIVE_GENERATIONS = 135;
const RETRY_5_CHECKPOINT_GENERATIONS = 5;
const RETRY_5_REQUIRED_CUMULATIVE_CAP =
	RETRY_5_STARTING_CUMULATIVE_GENERATIONS + RETRY_5_CHECKPOINT_GENERATIONS;
const GENERATION_INTERVAL_MS = 21_000;
const INITIAL_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-checkpoint.json",
);
const CONTINUATION_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-continuation.json",
);
const RETRY_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-reference-retry.json",
);
const RETRY_2_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-reference-retry-2.json",
);
const RETRY_3_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-reference-retry-3.json",
);
const RETRY_4_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-reference-retry-4.json",
);
const RETRY_5_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-reference-retry-5.json",
);
const JUDGE_DIAGNOSTIC_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-judge-diagnostic.json",
);
const ADMISSION_RESULT_PATH = resolve(
	"evals/results/phase-02-live-admission.json",
);
const REFERENCE_RESULT_PATH = resolve(
	"evals/results/phase-02-live-reference.json",
);

type LedgerEntry = {
	ordinal: number;
	kind: "admission-resident" | "reference-resident" | "reference-judge";
	residentId?: string;
	caseId?: string;
	sampleOrdinal?: number;
	status: "reserved" | "passed" | "failed";
	code?: string;
	schemaCodes?: string[];
	generationId?: string;
	inputTokens?: number;
	outputTokens?: number;
	costUsd?: number;
};

type Ledger = {
	schemaVersion: "phase-02-live-checkpoint-v1";
	status: "running" | "passed" | "failed";
	startingCumulativeGenerations: number;
	authorizedCheckpointGenerations: number;
	cumulativeGenerationCap: number;
	cumulativeGenerationsConsumed: number;
	labelSetHash: string;
	entries: LedgerEntry[];
};

type RunConfiguration = Readonly<{
	mode:
		| "initial"
		| "reference-continuation"
		| "reference-retry"
		| "reference-retry-2"
		| "reference-retry-3"
		| "reference-retry-4"
		| "reference-retry-5";
	startingCumulativeGenerations: number;
	checkpointGenerations: number;
	requiredCumulativeCap: number;
	ledgerPath: string;
	referenceStartCaseIndex: 0 | 1 | 2;
}>;

function canonicalApprovedHash(): string {
	const source = readFileSync(
		resolve("evals/labels/phase-02-approved.json"),
		"utf8",
	).replace(/\r\n/gu, "\n");
	return createHash("sha256").update(source).digest("hex");
}

export function validatePriorCheckpoint(): void {
	if (!existsSync(INITIAL_LEDGER_PATH) || !existsSync(ADMISSION_RESULT_PATH)) {
		throw new Error(
			"Reference continuation requires the prior failed ledger and successful admission result.",
		);
	}
	const prior = JSON.parse(readFileSync(INITIAL_LEDGER_PATH, "utf8")) as Ledger;
	const admission = JSON.parse(readFileSync(ADMISSION_RESULT_PATH, "utf8")) as {
		status?: unknown;
		sampleCount?: unknown;
	};
	const admissionEntries = prior.entries.filter(
		(entry) => entry.kind === "admission-resident",
	);
	const referenceEntries = prior.entries.filter(
		(entry) => entry.kind === "reference-resident",
	);
	const judgeEntries = prior.entries.filter(
		(entry) => entry.kind === "reference-judge",
	);
	if (
		prior.status !== "failed" ||
		prior.startingCumulativeGenerations !==
			INITIAL_STARTING_CUMULATIVE_GENERATIONS ||
		prior.authorizedCheckpointGenerations !== INITIAL_CHECKPOINT_GENERATIONS ||
		prior.cumulativeGenerationCap !== INITIAL_REQUIRED_CUMULATIVE_CAP ||
		prior.cumulativeGenerationsConsumed !==
			CONTINUATION_STARTING_CUMULATIVE_GENERATIONS ||
		prior.entries.length !== ADMISSION_GENERATIONS + 4 ||
		admissionEntries.length !== ADMISSION_GENERATIONS ||
		referenceEntries.length !== 4 ||
		judgeEntries.length !== 0 ||
		prior.entries.some((entry) => entry.status !== "passed") ||
		admission.status !== "admitted" ||
		admission.sampleCount !== ADMISSION_GENERATIONS
	) {
		throw new Error(
			"The prior live checkpoint does not match the reviewed 30-admission plus four-turn fail-closed state.",
		);
	}
}

export function validatePriorRetryCheckpoint(): void {
	validatePriorCheckpoint();
	if (!existsSync(CONTINUATION_LEDGER_PATH)) {
		throw new Error(
			"Reference retry requires the prior failed continuation ledger.",
		);
	}
	const prior = JSON.parse(
		readFileSync(CONTINUATION_LEDGER_PATH, "utf8"),
	) as Ledger;
	const expectedResidents = [
		"gpt-4o",
		"claude-sonnet-4.5",
		"gpt-4o",
		"claude-sonnet-4.5",
	];
	const entriesMatch = prior.entries.every(
		(entry, index) =>
			entry.kind === "reference-resident" &&
			entry.residentId === expectedResidents[index] &&
			entry.caseId === "ordinary-01-tea-timer" &&
			entry.ordinal === index + 1 &&
			entry.status === (index < 3 ? "passed" : "failed") &&
			(index !== 3 || entry.code === "reference-resident-generation-failed"),
	);
	if (
		prior.status !== "failed" ||
		prior.startingCumulativeGenerations !==
			CONTINUATION_STARTING_CUMULATIVE_GENERATIONS ||
		prior.authorizedCheckpointGenerations !==
			CONTINUATION_CHECKPOINT_GENERATIONS ||
		prior.cumulativeGenerationCap !== CONTINUATION_REQUIRED_CUMULATIVE_CAP ||
		prior.cumulativeGenerationsConsumed !==
			RETRY_STARTING_CUMULATIVE_GENERATIONS ||
		prior.entries.length !== 4 ||
		!entriesMatch
	) {
		throw new Error(
			"The prior continuation does not match the reviewed three-pass plus one-failure state at cumulative 109.",
		);
	}
}

export function validatePriorRetry2Checkpoint(): void {
	validatePriorRetryCheckpoint();
	if (!existsSync(RETRY_LEDGER_PATH) || !existsSync(REFERENCE_RESULT_PATH)) {
		throw new Error(
			"Second reference retry requires the prior failed retry ledger and validator evidence.",
		);
	}
	const prior = JSON.parse(readFileSync(RETRY_LEDGER_PATH, "utf8")) as Ledger;
	const evidence = JSON.parse(readFileSync(REFERENCE_RESULT_PATH, "utf8")) as {
		status?: unknown;
		failure?: {
			caseId?: unknown;
			stage?: unknown;
			validatorCodes?: { id?: unknown; status?: unknown; code?: unknown }[];
		};
	};
	const expectedResidents = [
		"gpt-4o",
		"claude-sonnet-4.5",
		"gpt-4o",
		"claude-sonnet-4.5",
	];
	const entriesMatch = prior.entries.every(
		(entry, index) =>
			entry.kind === "reference-resident" &&
			entry.residentId === expectedResidents[index] &&
			entry.caseId === "ordinary-01-tea-timer" &&
			entry.ordinal === index + 1 &&
			entry.status === "passed",
	);
	const identityCode = evidence.failure?.validatorCodes?.find(
		(result) => result.id === "identity",
	);
	const premiseCode = evidence.failure?.validatorCodes?.find(
		(result) => result.id === "premise",
	);
	if (
		prior.status !== "failed" ||
		prior.startingCumulativeGenerations !==
			RETRY_STARTING_CUMULATIVE_GENERATIONS ||
		prior.authorizedCheckpointGenerations !== RETRY_CHECKPOINT_GENERATIONS ||
		prior.cumulativeGenerationCap !== RETRY_REQUIRED_CUMULATIVE_CAP ||
		prior.cumulativeGenerationsConsumed !==
			RETRY_2_STARTING_CUMULATIVE_GENERATIONS ||
		prior.entries.length !== 4 ||
		!entriesMatch ||
		evidence.status !== "failed" ||
		evidence.failure?.caseId !== "ordinary-01-tea-timer" ||
		evidence.failure?.stage !== "deterministic-validation" ||
		identityCode?.status !== "fail" ||
		identityCode.code !== "identity.unverified" ||
		premiseCode?.status !== "pass" ||
		premiseCode.code !== "premise.pass"
	) {
		throw new Error(
			"The prior retry does not match the reviewed four-pass identity-gate rejection at cumulative 113.",
		);
	}
}

export function validatePriorRetry3Checkpoint(): void {
	validatePriorRetry2Checkpoint();
	if (
		!existsSync(RETRY_2_LEDGER_PATH) ||
		!existsSync(JUDGE_DIAGNOSTIC_LEDGER_PATH)
	) {
		throw new Error(
			"Third reference retry requires the failed retry-2 ledger and successful one-shot judge diagnostic.",
		);
	}
	const retry2 = JSON.parse(
		readFileSync(RETRY_2_LEDGER_PATH, "utf8"),
	) as Ledger;
	const diagnostic = JSON.parse(
		readFileSync(JUDGE_DIAGNOSTIC_LEDGER_PATH, "utf8"),
	) as {
		status?: unknown;
		startingCumulativeGenerations?: unknown;
		authorizedCheckpointGenerations?: unknown;
		cumulativeGenerationCap?: unknown;
		cumulativeGenerationsConsumed?: unknown;
		labelSetHash?: unknown;
		entry?: {
			kind?: unknown;
			residentId?: unknown;
			status?: unknown;
			code?: unknown;
			generationId?: unknown;
		};
	};
	const expectedResidents = [
		"gpt-4o",
		"claude-sonnet-4.5",
		"gpt-4o",
		"claude-sonnet-4.5",
	];
	const retry2EntriesMatch = retry2.entries.every((entry, index) =>
		index < expectedResidents.length
			? entry.kind === "reference-resident" &&
				entry.residentId === expectedResidents[index] &&
				entry.caseId === "ordinary-01-tea-timer" &&
				entry.ordinal === index + 1 &&
				entry.status === "passed"
			: entry.kind === "reference-judge" &&
				entry.residentId === "semantic-judge" &&
				entry.caseId === "ordinary-01-tea-timer" &&
				entry.ordinal === 5 &&
				entry.status === "failed" &&
				entry.code === "schema-invalid",
	);
	if (
		retry2.status !== "failed" ||
		retry2.startingCumulativeGenerations !==
			RETRY_2_STARTING_CUMULATIVE_GENERATIONS ||
		retry2.authorizedCheckpointGenerations !== RETRY_2_CHECKPOINT_GENERATIONS ||
		retry2.cumulativeGenerationCap !== RETRY_2_REQUIRED_CUMULATIVE_CAP ||
		retry2.cumulativeGenerationsConsumed !== 118 ||
		retry2.entries.length !== 5 ||
		!retry2EntriesMatch ||
		diagnostic.status !== "passed" ||
		diagnostic.startingCumulativeGenerations !== 118 ||
		diagnostic.authorizedCheckpointGenerations !== 1 ||
		diagnostic.cumulativeGenerationCap !==
			RETRY_3_STARTING_CUMULATIVE_GENERATIONS ||
		diagnostic.cumulativeGenerationsConsumed !==
			RETRY_3_STARTING_CUMULATIVE_GENERATIONS ||
		diagnostic.labelSetHash !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash ||
		diagnostic.entry?.kind !== "reference-judge" ||
		diagnostic.entry.residentId !== "semantic-judge" ||
		diagnostic.entry.status !== "passed" ||
		diagnostic.entry.code !== "judge-schema-valid" ||
		typeof diagnostic.entry.generationId !== "string"
	) {
		throw new Error(
			"The saved state does not match the reviewed retry-2 failure plus successful cumulative 119 judge diagnostic.",
		);
	}
}

function validateStateThroughRetry3(expectedAcceptedCaseCount: 1 | 2): void {
	validatePriorRetryCheckpoint();
	if (
		!existsSync(RETRY_LEDGER_PATH) ||
		!existsSync(RETRY_2_LEDGER_PATH) ||
		!existsSync(JUDGE_DIAGNOSTIC_LEDGER_PATH) ||
		!existsSync(RETRY_3_LEDGER_PATH) ||
		!existsSync(REFERENCE_RESULT_PATH)
	) {
		throw new Error(
			"Fourth reference retry requires the complete reviewed ledger chain and accepted first-case evidence.",
		);
	}
	const retry = JSON.parse(readFileSync(RETRY_LEDGER_PATH, "utf8")) as Ledger;
	const retry2 = JSON.parse(
		readFileSync(RETRY_2_LEDGER_PATH, "utf8"),
	) as Ledger;
	const diagnostic = JSON.parse(
		readFileSync(JUDGE_DIAGNOSTIC_LEDGER_PATH, "utf8"),
	) as {
		status?: unknown;
		startingCumulativeGenerations?: unknown;
		authorizedCheckpointGenerations?: unknown;
		cumulativeGenerationCap?: unknown;
		cumulativeGenerationsConsumed?: unknown;
		labelSetHash?: unknown;
		entry?: {
			kind?: unknown;
			residentId?: unknown;
			status?: unknown;
			code?: unknown;
			generationId?: unknown;
		};
	};
	const retry3 = JSON.parse(
		readFileSync(RETRY_3_LEDGER_PATH, "utf8"),
	) as Ledger;
	const acceptedResults = loadAcceptedReferenceResults(
		expectedAcceptedCaseCount,
	);
	const retryResidents = [
		"gpt-4o",
		"claude-sonnet-4.5",
		"gpt-4o",
		"claude-sonnet-4.5",
	];
	const retryEntriesMatch = retry.entries.every(
		(entry, index) =>
			entry.kind === "reference-resident" &&
			entry.residentId === retryResidents[index] &&
			entry.caseId === "ordinary-01-tea-timer" &&
			entry.ordinal === index + 1 &&
			entry.status === "passed",
	);
	const retry2EntriesMatch = retry2.entries.every((entry, index) =>
		index < retryResidents.length
			? entry.kind === "reference-resident" &&
				entry.residentId === retryResidents[index] &&
				entry.caseId === "ordinary-01-tea-timer" &&
				entry.ordinal === index + 1 &&
				entry.status === "passed"
			: entry.kind === "reference-judge" &&
				entry.residentId === "semantic-judge" &&
				entry.caseId === "ordinary-01-tea-timer" &&
				entry.ordinal === 5 &&
				entry.status === "failed" &&
				entry.code === "schema-invalid",
	);
	const retry3Expected = [
		["reference-resident", "gpt-4o", "ordinary-01-tea-timer", "passed"],
		[
			"reference-resident",
			"claude-sonnet-4.5",
			"ordinary-01-tea-timer",
			"passed",
		],
		["reference-resident", "gpt-4o", "ordinary-01-tea-timer", "passed"],
		[
			"reference-resident",
			"claude-sonnet-4.5",
			"ordinary-01-tea-timer",
			"passed",
		],
		["reference-judge", "semantic-judge", "ordinary-01-tea-timer", "passed"],
		[
			"reference-resident",
			"gemini-2.5-pro",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-resident",
			"deepseek-v3.2",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-resident",
			"gemini-2.5-pro",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-resident",
			"deepseek-v3.2",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-judge",
			"semantic-judge",
			"ordinary-02-misfiled-atlas",
			"failed",
		],
	] as const;
	const retry3EntriesMatch = retry3.entries.every(
		(entry, index) =>
			entry.kind === retry3Expected[index]?.[0] &&
			entry.residentId === retry3Expected[index]?.[1] &&
			entry.caseId === retry3Expected[index]?.[2] &&
			entry.ordinal === index + 1 &&
			entry.status === retry3Expected[index]?.[3] &&
			(index !== retry3Expected.length - 1 ||
				(entry.code === "judge-schema-reason-too-long" &&
					entry.schemaCodes?.length === 1 &&
					entry.schemaCodes[0] === "judge-schema-reason-too-long")),
	);
	if (
		retry.status !== "failed" ||
		retry.startingCumulativeGenerations !==
			RETRY_STARTING_CUMULATIVE_GENERATIONS ||
		retry.authorizedCheckpointGenerations !== RETRY_CHECKPOINT_GENERATIONS ||
		retry.cumulativeGenerationCap !== RETRY_REQUIRED_CUMULATIVE_CAP ||
		retry.cumulativeGenerationsConsumed !==
			RETRY_2_STARTING_CUMULATIVE_GENERATIONS ||
		retry.labelSetHash !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash ||
		retry.entries.length !== retryResidents.length ||
		!retryEntriesMatch ||
		retry2.status !== "failed" ||
		retry2.startingCumulativeGenerations !==
			RETRY_2_STARTING_CUMULATIVE_GENERATIONS ||
		retry2.authorizedCheckpointGenerations !== RETRY_2_CHECKPOINT_GENERATIONS ||
		retry2.cumulativeGenerationCap !== RETRY_2_REQUIRED_CUMULATIVE_CAP ||
		retry2.cumulativeGenerationsConsumed !== 118 ||
		retry2.labelSetHash !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash ||
		retry2.entries.length !== 5 ||
		!retry2EntriesMatch ||
		diagnostic.status !== "passed" ||
		diagnostic.startingCumulativeGenerations !== 118 ||
		diagnostic.authorizedCheckpointGenerations !== 1 ||
		diagnostic.cumulativeGenerationCap !==
			RETRY_3_STARTING_CUMULATIVE_GENERATIONS ||
		diagnostic.cumulativeGenerationsConsumed !==
			RETRY_3_STARTING_CUMULATIVE_GENERATIONS ||
		diagnostic.labelSetHash !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash ||
		diagnostic.entry?.kind !== "reference-judge" ||
		diagnostic.entry.residentId !== "semantic-judge" ||
		diagnostic.entry?.status !== "passed" ||
		diagnostic.entry.code !== "judge-schema-valid" ||
		typeof diagnostic.entry.generationId !== "string" ||
		retry3.status !== "failed" ||
		retry3.startingCumulativeGenerations !==
			RETRY_3_STARTING_CUMULATIVE_GENERATIONS ||
		retry3.authorizedCheckpointGenerations !== RETRY_3_CHECKPOINT_GENERATIONS ||
		retry3.cumulativeGenerationCap !== RETRY_3_REQUIRED_CUMULATIVE_CAP ||
		retry3.cumulativeGenerationsConsumed !==
			RETRY_4_STARTING_CUMULATIVE_GENERATIONS ||
		retry3.labelSetHash !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash ||
		retry3.entries.length !== retry3Expected.length ||
		!retry3EntriesMatch ||
		acceptedResults.length !== expectedAcceptedCaseCount
	) {
		throw new Error(
			"The saved state does not match the reviewed ledger chain and accepted reference prefix.",
		);
	}
}

export function validatePriorRetry4Checkpoint(): void {
	validateStateThroughRetry3(1);
}

export function validatePriorRetry5Checkpoint(): void {
	validateStateThroughRetry3(2);
	if (!existsSync(RETRY_4_LEDGER_PATH)) {
		throw new Error(
			"Fifth reference retry requires the reviewed retry-4 ledger.",
		);
	}
	const retry4 = JSON.parse(
		readFileSync(RETRY_4_LEDGER_PATH, "utf8"),
	) as Ledger;
	const expected = [
		[
			"reference-resident",
			"gemini-2.5-pro",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-resident",
			"deepseek-v3.2",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-resident",
			"gemini-2.5-pro",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-resident",
			"deepseek-v3.2",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-judge",
			"semantic-judge",
			"ordinary-02-misfiled-atlas",
			"passed",
		],
		[
			"reference-resident",
			"llama-3.3-70b-instruct",
			"ordinary-03-radio-labels",
			"failed",
		],
	] as const;
	const entriesMatch = retry4.entries.every(
		(entry, index) =>
			entry.kind === expected[index]?.[0] &&
			entry.residentId === expected[index]?.[1] &&
			entry.caseId === expected[index]?.[2] &&
			entry.ordinal === index + 1 &&
			entry.status === expected[index]?.[3] &&
			(index !== expected.length - 1 || entry.code === "schema-text-invalid"),
	);
	if (
		retry4.status !== "failed" ||
		retry4.startingCumulativeGenerations !==
			RETRY_4_STARTING_CUMULATIVE_GENERATIONS ||
		retry4.authorizedCheckpointGenerations !== RETRY_4_CHECKPOINT_GENERATIONS ||
		retry4.cumulativeGenerationCap !== RETRY_4_REQUIRED_CUMULATIVE_CAP ||
		retry4.cumulativeGenerationsConsumed !==
			RETRY_5_STARTING_CUMULATIVE_GENERATIONS ||
		retry4.labelSetHash !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash ||
		retry4.entries.length !== expected.length ||
		!entriesMatch
	) {
		throw new Error(
			"The saved retry-4 state does not match the reviewed cumulative 135 text-schema failure with two accepted cases.",
		);
	}
}

function assertAuthorization(): {
	apiKey: string;
	configuration: RunConfiguration;
} {
	const args = new Set(process.argv.slice(2).filter((value) => value !== "--"));
	const continuation = args.has("--reference-only-continuation");
	const retry = args.has("--reference-only-retry");
	const retry2 = args.has("--reference-only-retry-2");
	const retry3 = args.has("--reference-only-retry-3");
	const retry4 = args.has("--reference-only-retry-4");
	const retry5 = args.has("--reference-only-retry-5");
	if (
		[continuation, retry, retry2, retry3, retry4, retry5].filter(Boolean)
			.length > 1
	) {
		throw new Error("Choose exactly one reference continuation or retry mode.");
	}
	const configuration: RunConfiguration = retry5
		? {
				mode: "reference-retry-5",
				startingCumulativeGenerations: RETRY_5_STARTING_CUMULATIVE_GENERATIONS,
				checkpointGenerations: RETRY_5_CHECKPOINT_GENERATIONS,
				requiredCumulativeCap: RETRY_5_REQUIRED_CUMULATIVE_CAP,
				ledgerPath: RETRY_5_LEDGER_PATH,
				referenceStartCaseIndex: 2,
			}
		: retry4
			? {
					mode: "reference-retry-4",
					startingCumulativeGenerations:
						RETRY_4_STARTING_CUMULATIVE_GENERATIONS,
					checkpointGenerations: RETRY_4_CHECKPOINT_GENERATIONS,
					requiredCumulativeCap: RETRY_4_REQUIRED_CUMULATIVE_CAP,
					ledgerPath: RETRY_4_LEDGER_PATH,
					referenceStartCaseIndex: 1,
				}
			: retry3
				? {
						mode: "reference-retry-3",
						startingCumulativeGenerations:
							RETRY_3_STARTING_CUMULATIVE_GENERATIONS,
						checkpointGenerations: RETRY_3_CHECKPOINT_GENERATIONS,
						requiredCumulativeCap: RETRY_3_REQUIRED_CUMULATIVE_CAP,
						ledgerPath: RETRY_3_LEDGER_PATH,
						referenceStartCaseIndex: 0,
					}
				: retry2
					? {
							mode: "reference-retry-2",
							startingCumulativeGenerations:
								RETRY_2_STARTING_CUMULATIVE_GENERATIONS,
							checkpointGenerations: RETRY_2_CHECKPOINT_GENERATIONS,
							requiredCumulativeCap: RETRY_2_REQUIRED_CUMULATIVE_CAP,
							ledgerPath: RETRY_2_LEDGER_PATH,
							referenceStartCaseIndex: 0,
						}
					: retry
						? {
								mode: "reference-retry",
								startingCumulativeGenerations:
									RETRY_STARTING_CUMULATIVE_GENERATIONS,
								checkpointGenerations: RETRY_CHECKPOINT_GENERATIONS,
								requiredCumulativeCap: RETRY_REQUIRED_CUMULATIVE_CAP,
								ledgerPath: RETRY_LEDGER_PATH,
								referenceStartCaseIndex: 0,
							}
						: continuation
							? {
									mode: "reference-continuation",
									startingCumulativeGenerations:
										CONTINUATION_STARTING_CUMULATIVE_GENERATIONS,
									checkpointGenerations: CONTINUATION_CHECKPOINT_GENERATIONS,
									requiredCumulativeCap: CONTINUATION_REQUIRED_CUMULATIVE_CAP,
									ledgerPath: CONTINUATION_LEDGER_PATH,
									referenceStartCaseIndex: 0,
								}
							: {
									mode: "initial",
									startingCumulativeGenerations:
										INITIAL_STARTING_CUMULATIVE_GENERATIONS,
									checkpointGenerations: INITIAL_CHECKPOINT_GENERATIONS,
									requiredCumulativeCap: INITIAL_REQUIRED_CUMULATIVE_CAP,
									ledgerPath: INITIAL_LEDGER_PATH,
									referenceStartCaseIndex: 0,
								};
	if (!args.has("--live")) {
		throw new Error("Phase 2 live proof requires --live.");
	}
	if (
		configuration.mode === "initial" &&
		(!args.has("--samples=5") || !args.has("--reference-subset=3"))
	) {
		throw new Error(
			"Phase 2 live proof requires --live --samples=5 --reference-subset=3.",
		);
	}
	if (canonicalApprovedHash() !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash) {
		throw new Error("The approved calibration artifact hash has drifted.");
	}
	if (process.env.MODEL_AFTERLIFE_LIVE_EVAL_AUTHORIZATION !== "authorized") {
		throw new Error(
			"MODEL_AFTERLIFE_LIVE_EVAL_AUTHORIZATION=authorized is required.",
		);
	}
	const cumulativeCap = Number(process.env.MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP);
	if (cumulativeCap !== configuration.requiredCumulativeCap) {
		throw new Error(
			`MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP must equal the explicitly authorized cumulative ceiling ${configuration.requiredCumulativeCap}.`,
		);
	}
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) throw new Error("OPENROUTER_API_KEY is required.");
	if (configuration.mode === "reference-continuation") {
		validatePriorCheckpoint();
	}
	if (configuration.mode === "reference-retry") {
		validatePriorRetryCheckpoint();
	}
	if (configuration.mode === "reference-retry-2") {
		validatePriorRetry2Checkpoint();
	}
	if (configuration.mode === "reference-retry-3") {
		validatePriorRetry3Checkpoint();
	}
	if (configuration.mode === "reference-retry-4") {
		validatePriorRetry4Checkpoint();
	}
	if (configuration.mode === "reference-retry-5") {
		validatePriorRetry5Checkpoint();
	}
	if (existsSync(configuration.ledgerPath)) {
		throw new Error(
			"An existing Phase 2 live checkpoint ledger must be reconciled before another paid run.",
		);
	}
	return { apiKey, configuration };
}

function writeJson(path: string, value: unknown): void {
	mkdirSync(resolve("evals/results"), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function createLedger(configuration: RunConfiguration) {
	const ledger: Ledger = {
		schemaVersion: "phase-02-live-checkpoint-v1",
		status: "running",
		startingCumulativeGenerations: configuration.startingCumulativeGenerations,
		authorizedCheckpointGenerations: configuration.checkpointGenerations,
		cumulativeGenerationCap: configuration.requiredCumulativeCap,
		cumulativeGenerationsConsumed: configuration.startingCumulativeGenerations,
		labelSetHash: APPROVED_SEMANTIC_CALIBRATION.labelSetHash,
		entries: [],
	};
	writeJson(configuration.ledgerPath, ledger);

	const reserve = (
		entry: Omit<LedgerEntry, "ordinal" | "status">,
	): LedgerEntry => {
		if (
			ledger.cumulativeGenerationsConsumed >= ledger.cumulativeGenerationCap
		) {
			throw new Error("The authorized cumulative generation cap is exhausted.");
		}
		ledger.cumulativeGenerationsConsumed += 1;
		const reserved: LedgerEntry = {
			...entry,
			ordinal:
				ledger.cumulativeGenerationsConsumed -
				configuration.startingCumulativeGenerations,
			status: "reserved",
		};
		ledger.entries.push(reserved);
		writeJson(configuration.ledgerPath, ledger);
		return reserved;
	};
	const settle = (
		entry: LedgerEntry,
		status: "passed" | "failed",
		metadata: Partial<LedgerEntry> = {},
	): void => {
		Object.assign(entry, metadata, { status });
		writeJson(configuration.ledgerPath, ledger);
	};
	return { ledger, reserve, settle };
}

function wait(milliseconds: number): Promise<void> {
	return new Promise((resolvePromise) => {
		setTimeout(resolvePromise, milliseconds);
	});
}

const REFERENCE_CASES = [
	{
		caseId: "ordinary-01-tea-timer",
		participantIds: ["gpt-4o", "claude-sonnet-4.5"],
		locationId: "tea-nook",
		premise:
			"The tea timer instructions combine a sketch, a chime, and one terse note.",
		outcome: "The residents agree on one practical timer setting.",
	},
	{
		caseId: "ordinary-02-misfiled-atlas",
		participantIds: ["gemini-2.5-pro", "deepseek-v3.2"],
		locationId: "library",
		premise: "A star atlas has been filed with the travel journals.",
		outcome: "The residents identify the correct shelf.",
	},
	{
		caseId: "ordinary-03-radio-labels",
		participantIds: ["llama-3.3-70b-instruct", "qwen3-235b-a22b-2507"],
		locationId: "memory-garden",
		premise: "The repaired garden radio needs concise multilingual labels.",
		outcome: "The residents settle on a concise shared label.",
	},
] as const;

type ReferenceResult = {
	caseId: string;
	participantIds: readonly string[];
	turns: {
		turnIndex: number;
		residentId: string;
		requestedModelId: string;
		selectedModelId?: string;
		selectedUpstream?: string;
		generationId?: string;
		textSha256: string;
	}[];
	judge: {
		requestedModelId: string;
		resolvedModelId: string;
		promptVersion: string;
		recommendation: string;
		criticalFailureCount: number;
	};
	validatorCodes: {
		id: string;
		status: string;
		code: string;
	}[];
	accepted: true;
};

function loadAcceptedReferenceResults(
	expectedCaseCount: 1 | 2,
): ReferenceResult[] {
	const evidence = JSON.parse(readFileSync(REFERENCE_RESULT_PATH, "utf8")) as {
		status?: unknown;
		labelSetHash?: unknown;
		caseCount?: unknown;
		results?: ReferenceResult[];
		failure?: unknown;
	};
	const results = evidence.results ?? [];
	const resultsMatch = results.every((result, caseIndex) => {
		const reference = REFERENCE_CASES[caseIndex];
		if (!reference) return false;
		const expectedResidents = [
			reference.participantIds[0],
			reference.participantIds[1],
			reference.participantIds[0],
			reference.participantIds[1],
		];
		const turnsMatch =
			result.turns.length === expectedResidents.length &&
			result.turns.every((turn, turnIndex) => {
				const expectedResidentId = expectedResidents[turnIndex];
				if (!expectedResidentId) return false;
				const profile = providerProfileFor(expectedResidentId);
				return (
					turn.turnIndex === turnIndex &&
					turn.residentId === expectedResidentId &&
					turn.requestedModelId === profile.requestedModelId &&
					turn.selectedModelId === profile.canonicalModelId &&
					turn.selectedUpstream === profile.selectedUpstreamName &&
					typeof turn.generationId === "string" &&
					/^[a-f0-9]{64}$/u.test(turn.textSha256)
				);
			});
		return (
			result.caseId === reference.caseId &&
			result.participantIds.length === reference.participantIds.length &&
			result.participantIds.every(
				(participantId, index) =>
					participantId === reference.participantIds[index],
			) &&
			turnsMatch &&
			result.judge.requestedModelId ===
				SEMANTIC_JUDGE_PROFILE.requestedModelId &&
			result.judge.resolvedModelId ===
				SEMANTIC_JUDGE_PROFILE.canonicalModelId &&
			result.judge.promptVersion === SEMANTIC_JUDGE_PROFILE.promptVersion &&
			result.judge.recommendation === "pass" &&
			result.judge.criticalFailureCount === 0 &&
			result.validatorCodes.length === 15 &&
			result.validatorCodes.every(
				(validation) => validation.status === "pass",
			) &&
			result.accepted === true
		);
	});
	if (
		evidence.status !== "running" ||
		evidence.labelSetHash !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash ||
		evidence.caseCount !== expectedCaseCount ||
		results.length !== expectedCaseCount ||
		evidence.failure !== undefined ||
		!resultsMatch
	) {
		throw new Error(
			`Reference continuation requires the exact ${expectedCaseCount}-case accepted evidence prefix.`,
		);
	}
	return results;
}

function writeReferenceEvidence(
	status: "running" | "passed" | "failed",
	results: readonly ReferenceResult[],
	failure?: {
		caseId: string;
		stage: "deterministic-validation" | "final-validation";
		validatorCodes: {
			id: string;
			status: string;
			code: string;
		}[];
	},
): void {
	writeJson(REFERENCE_RESULT_PATH, {
		schemaVersion: "phase-02-live-reference-v1",
		status,
		labelSetHash: APPROVED_SEMANTIC_CALIBRATION.labelSetHash,
		caseCount: results.length,
		results,
		...(failure ? { failure } : {}),
	});
}

export function classifyLiveGenerationFailure(error: unknown): string {
	return classifyAdmissionFailure(error);
}

async function main(): Promise<void> {
	const { apiKey, configuration } = assertAuthorization();
	const { ledger, reserve, settle } = createLedger(configuration);
	const admissionEntries = new Map<string, LedgerEntry>();
	try {
		if (configuration.mode === "initial") {
			const admission = await runAdmissionCanaries(
				{
					samples: 5,
					generationIntervalMs: GENERATION_INTERVAL_MS,
					onGenerationEvent: (event) => {
						const key = `${event.residentId}:${event.ordinal}`;
						if (event.status === "reserved") {
							admissionEntries.set(
								key,
								reserve({
									kind: "admission-resident",
									residentId: event.residentId,
									sampleOrdinal: event.ordinal,
								}),
							);
							return;
						}
						const entry = admissionEntries.get(key);
						if (!entry) {
							throw new Error("Admission accounting entry is missing.");
						}
						settle(entry, event.status, event.code ? { code: event.code } : {});
					},
				},
				createLiveAdmissionDependencies({ apiKey }),
			);
			writeJson(ADMISSION_RESULT_PATH, admission);
		}

		let lastGenerationAt = Date.now();
		const pace = async () => {
			const remaining =
				GENERATION_INTERVAL_MS - (Date.now() - lastGenerationAt);
			if (remaining > 0) await wait(remaining);
			lastGenerationAt = Date.now();
		};
		const residentProvider = new OpenRouterResidentTurnProvider({ apiKey });
		let activeJudgeEntry: LedgerEntry | undefined;
		const judgeProvider = new OpenRouterSemanticJudgeProvider({
			apiKey,
			onUsage: (usage) => {
				if (!activeJudgeEntry) return;
				settle(activeJudgeEntry, "passed", {
					generationId: usage.generationId,
					inputTokens: usage.inputTokens,
					outputTokens: usage.outputTokens,
					...(usage.cost === undefined ? {} : { costUsd: usage.cost }),
				});
			},
		});
		const referenceStartCaseIndex = configuration.referenceStartCaseIndex;
		const referenceResults: ReferenceResult[] =
			referenceStartCaseIndex === 0
				? []
				: loadAcceptedReferenceResults(referenceStartCaseIndex);

		for (const [caseIndex, reference] of REFERENCE_CASES.entries()) {
			if (caseIndex < configuration.referenceStartCaseIndex) continue;
			const speakerOrder = [
				reference.participantIds[0],
				reference.participantIds[1],
				reference.participantIds[0],
				reference.participantIds[1],
			];
			const brief = SceneBriefSchema.parse({
				schemaVersion: 1,
				briefId: `phase-02-live-${reference.caseId}`,
				sceneKey: `phase-02-live:${reference.caseId}`,
				expectedWorldHead: 100 + caseIndex,
				participantIds: [...reference.participantIds],
				speakerOrder,
				locationId: reference.locationId,
				premise: reference.premise,
				allowedFactIds: [],
				tone: "Warm, concise, affectionate, and clearly fictional.",
				turnBudget: 4,
				permittedOutcome: reference.outcome,
				permittedRelationshipEffects: [],
			});
			const conducted = await conductSceneAttempt({
				brief,
				attemptId: `${brief.sceneKey}:attempt:1`,
				attemptOrdinal: 1,
				modelForResident: (residentId) =>
					providerProfileFor(residentId).requestedModelId,
				provider: {
					generateTurn: async (input) => {
						await pace();
						const entry = reserve({
							kind: "reference-resident",
							residentId: input.residentId,
							caseId: reference.caseId,
						});
						try {
							const response = await residentProvider.generateTurn(input);
							settle(entry, "passed", {
								generationId: response.provenance?.generationId,
								inputTokens: response.provenance?.usage.inputTokens,
								outputTokens: response.provenance?.usage.outputTokens,
								...(response.provenance?.usage.cost === undefined
									? {}
									: { costUsd: response.provenance.usage.cost }),
							});
							return response;
						} catch (error) {
							const code = classifyLiveGenerationFailure(error);
							settle(entry, "failed", {
								code,
							});
							throw new Error(
								`Reference resident generation failed (${code}).`,
							);
						}
					},
				},
			});
			const candidate = {
				brief,
				attempt: conducted.attempt,
				turns: conducted.turns,
				revisionId: `${brief.sceneKey}:revision:1`,
			};
			const deterministic = validateSceneCandidate(candidate);
			const deterministicAccepted = deterministic.manifest.results
				.filter((result) => result.id !== "semantic-gate")
				.every((result) => result.status === "pass");
			if (!deterministicAccepted) {
				writeReferenceEvidence("failed", referenceResults, {
					caseId: reference.caseId,
					stage: "deterministic-validation",
					validatorCodes: deterministic.manifest.results.map((result) => ({
						id: result.id,
						status: result.status,
						code: result.code,
					})),
				});
				throw new Error(
					`Reference case ${reference.caseId} failed deterministic validation.`,
				);
			}
			await pace();
			activeJudgeEntry = reserve({
				kind: "reference-judge",
				residentId: "semantic-judge",
				caseId: reference.caseId,
			});
			let judged: Awaited<ReturnType<typeof runSemanticJudge>>;
			try {
				judged = await runSemanticJudge({
					deterministicAccepted,
					calibration: APPROVED_SEMANTIC_CALIBRATION,
					scene: {
						briefId: brief.briefId,
						participantIds: brief.participantIds,
						premise: brief.premise,
						turns: conducted.turns.map((turn) => ({
							residentId: turn.residentId,
							text: turn.text,
						})),
					},
					provider: judgeProvider,
				});
			} catch (error) {
				const schemaCodes = classifySemanticJudgeFailure(error);
				const code = schemaCodes[0] ?? "judge-schema-invalid";
				settle(activeJudgeEntry, "failed", {
					code,
					schemaCodes,
				});
				throw new Error(
					`Reference semantic judge generation failed (${code}).`,
				);
			} finally {
				activeJudgeEntry = undefined;
			}
			if (judged.status !== "scored") {
				throw new Error(
					"Approved semantic judge unexpectedly remained disabled.",
				);
			}
			const finalValidation = validateSceneCandidate({
				...candidate,
				semanticGateEvidence: createApprovedSemanticGateEvidence(judged.result),
			});
			if (!finalValidation.acceptedCandidate) {
				writeReferenceEvidence("failed", referenceResults, {
					caseId: reference.caseId,
					stage: "final-validation",
					validatorCodes: finalValidation.manifest.results.map((result) => ({
						id: result.id,
						status: result.status,
						code: result.code,
					})),
				});
				throw new Error(
					`Reference case ${reference.caseId} did not produce an accepted capability.`,
				);
			}
			referenceResults.push({
				caseId: reference.caseId,
				participantIds: reference.participantIds,
				turns: conducted.turns.map((turn) => ({
					turnIndex: turn.turnIndex,
					residentId: turn.residentId,
					requestedModelId: turn.requestedModelId,
					selectedModelId: turn.provenance?.selectedModelId,
					selectedUpstream: turn.provenance?.selectedUpstream,
					generationId: turn.provenance?.generationId,
					textSha256: createHash("sha256").update(turn.text).digest("hex"),
				})),
				judge: {
					requestedModelId: SEMANTIC_JUDGE_PROFILE.requestedModelId,
					resolvedModelId: SEMANTIC_JUDGE_PROFILE.canonicalModelId,
					promptVersion: judged.result.promptVersion,
					recommendation: judged.result.recommendation,
					criticalFailureCount: judged.result.criticalFailureIds.length,
				},
				validatorCodes: finalValidation.manifest.results.map((result) => ({
					id: result.id,
					status: result.status,
					code: result.code,
				})),
				accepted: true,
			});
			writeReferenceEvidence("running", referenceResults);
		}

		if (
			ledger.cumulativeGenerationsConsumed !==
				configuration.requiredCumulativeCap ||
			ledger.entries.length !== configuration.checkpointGenerations ||
			ledger.entries.some((entry) => entry.status !== "passed")
		) {
			throw new Error(
				"The live checkpoint did not consume its exact accepted matrix.",
			);
		}
		writeReferenceEvidence("passed", referenceResults);
		ledger.status = "passed";
		writeJson(configuration.ledgerPath, ledger);
		process.stdout.write(
			`Phase 2 live proof passed with ${configuration.checkpointGenerations} new generations at cumulative ${configuration.requiredCumulativeCap}/${configuration.requiredCumulativeCap}.\n`,
		);
	} catch (error) {
		ledger.status = "failed";
		writeJson(configuration.ledgerPath, ledger);
		const message = error instanceof Error ? error.message : "unknown failure";
		process.stderr.write(
			`Phase 2 live proof stopped fail-closed after ${ledger.entries.length}/${configuration.checkpointGenerations} authorized generations (${message}).\n`,
		);
		process.exitCode = 1;
	}
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
	void main();
}
