import { createHash } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { ZodError } from "zod";
import { OpenRouterSemanticJudgeProvider } from "../src/features/world/generation/openrouter-semantic-judge-provider.ts";
import { classifyAdmissionFailure } from "../src/features/world/generation/run-admission-canaries.ts";
import { runSemanticJudge } from "../src/features/world/generation/semantic-judge.ts";
import { APPROVED_SEMANTIC_CALIBRATION } from "../src/features/world/generation/semantic-calibration.ts";
import { buildValidSceneCandidate } from "../tests/fixtures/scene-candidate.ts";

const STARTING_CUMULATIVE_GENERATIONS = 118;
const REQUIRED_CUMULATIVE_CAP = 119;
const PREVIOUS_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-reference-retry-2.json",
);
const DIAGNOSTIC_LEDGER_PATH = resolve(
	"evals/results/phase-02-live-judge-diagnostic.json",
);

type UsageEvidence = Readonly<{
	generationId: string;
	inputTokens: number;
	outputTokens: number;
	cost?: number;
}>;

type DiagnosticLedger = {
	schemaVersion: "phase-02-live-judge-diagnostic-v1";
	status: "running" | "passed" | "failed";
	startingCumulativeGenerations: 118;
	authorizedCheckpointGenerations: 1;
	cumulativeGenerationCap: 119;
	cumulativeGenerationsConsumed: 119;
	labelSetHash: string;
	caseId: "quality-gate-scene";
	entry: {
		kind: "reference-judge";
		residentId: "semantic-judge";
		status: "reserved" | "passed" | "failed";
		code?: string;
		schemaCodes?: string[];
		generationId?: string;
		inputTokens?: number;
		outputTokens?: number;
		costUsd?: number;
	};
};

function writeJson(path: string, value: unknown): void {
	mkdirSync(resolve("evals/results"), { recursive: true });
	writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function canonicalApprovedHash(): string {
	const source = readFileSync(
		resolve("evals/labels/phase-02-approved.json"),
		"utf8",
	).replace(/\r\n/gu, "\n");
	return createHash("sha256").update(source).digest("hex");
}

export function validateDiagnosticPreflight(): void {
	if (!existsSync(PREVIOUS_LEDGER_PATH)) {
		throw new Error("The cumulative 118 retry-2 ledger is required.");
	}
	if (existsSync(DIAGNOSTIC_LEDGER_PATH)) {
		throw new Error("The one-shot judge diagnostic ledger already exists.");
	}
	const previous = JSON.parse(
		readFileSync(PREVIOUS_LEDGER_PATH, "utf8"),
	) as {
		status?: unknown;
		cumulativeGenerationsConsumed?: unknown;
		entries?: {
			kind?: unknown;
			status?: unknown;
			code?: unknown;
		}[];
	};
	const finalEntry = previous.entries?.at(-1);
	if (
		previous.status !== "failed" ||
		previous.cumulativeGenerationsConsumed !==
			STARTING_CUMULATIVE_GENERATIONS ||
		previous.entries?.length !== 5 ||
		finalEntry?.kind !== "reference-judge" ||
		finalEntry.status !== "failed" ||
		finalEntry.code !== "schema-invalid" ||
		canonicalApprovedHash() !== APPROVED_SEMANTIC_CALIBRATION.labelSetHash
	) {
		throw new Error(
			"The saved checkpoint does not match the reviewed cumulative 118 judge-schema failure.",
		);
	}
}

export function classifyJudgeSchemaIssues(error: unknown): string[] {
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

function assertAuthorization(): string {
	const args = new Set(process.argv.slice(2).filter((value) => value !== "--"));
	if (!args.has("--live") || !args.has("--one-judge")) {
		throw new Error("Judge diagnostic requires --live --one-judge.");
	}
	if (
		process.env.MODEL_AFTERLIFE_JUDGE_DIAGNOSTIC_AUTHORIZATION !== "authorized"
	) {
		throw new Error(
			"MODEL_AFTERLIFE_JUDGE_DIAGNOSTIC_AUTHORIZATION=authorized is required.",
		);
	}
	if (
		Number(process.env.MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP) !==
		REQUIRED_CUMULATIVE_CAP
	) {
		throw new Error(
			`MODEL_AFTERLIFE_LIVE_EVAL_CALL_CAP must equal ${REQUIRED_CUMULATIVE_CAP}.`,
		);
	}
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) throw new Error("OPENROUTER_API_KEY is required.");
	validateDiagnosticPreflight();
	return apiKey;
}

async function main(): Promise<void> {
	const apiKey = assertAuthorization();
	const ledger: DiagnosticLedger = {
		schemaVersion: "phase-02-live-judge-diagnostic-v1",
		status: "running",
		startingCumulativeGenerations: STARTING_CUMULATIVE_GENERATIONS,
		authorizedCheckpointGenerations: 1,
		cumulativeGenerationCap: REQUIRED_CUMULATIVE_CAP,
		cumulativeGenerationsConsumed: REQUIRED_CUMULATIVE_CAP,
		labelSetHash: APPROVED_SEMANTIC_CALIBRATION.labelSetHash,
		caseId: "quality-gate-scene",
		entry: {
			kind: "reference-judge",
			residentId: "semantic-judge",
			status: "reserved",
		},
	};
	writeJson(DIAGNOSTIC_LEDGER_PATH, ledger);

	let usage: UsageEvidence | undefined;
	const provider = new OpenRouterSemanticJudgeProvider({
		apiKey,
		onUsage: (observed) => {
			usage = observed;
		},
	});
	const candidate = buildValidSceneCandidate();
	try {
		const judged = await runSemanticJudge({
			deterministicAccepted: true,
			calibration: APPROVED_SEMANTIC_CALIBRATION,
			scene: {
				briefId: candidate.brief.briefId,
				participantIds: candidate.brief.participantIds,
				premise: candidate.brief.premise,
				turns: candidate.turns.map((turn) => ({
					residentId: turn.residentId,
					text: turn.text,
				})),
			},
			provider,
		});
		if (judged.status !== "scored") {
			throw new Error("Approved semantic judge unexpectedly remained disabled.");
		}
		ledger.status = "passed";
		ledger.entry = {
			...ledger.entry,
			status: "passed",
			code: "judge-schema-valid",
			...(usage
				? {
						generationId: usage.generationId,
						inputTokens: usage.inputTokens,
						outputTokens: usage.outputTokens,
						...(usage.cost === undefined ? {} : { costUsd: usage.cost }),
					}
				: {}),
		};
		writeJson(DIAGNOSTIC_LEDGER_PATH, ledger);
		process.stdout.write(
			`Semantic judge diagnostic passed at cumulative ${REQUIRED_CUMULATIVE_CAP}.\n`,
		);
	} catch (error) {
		const schemaCodes = classifyJudgeSchemaIssues(error);
		ledger.status = "failed";
		ledger.entry = {
			...ledger.entry,
			status: "failed",
			code: schemaCodes[0] ?? "judge-schema-invalid",
			schemaCodes,
			...(usage
				? {
						generationId: usage.generationId,
						inputTokens: usage.inputTokens,
						outputTokens: usage.outputTokens,
						...(usage.cost === undefined ? {} : { costUsd: usage.cost }),
					}
				: {}),
		};
		writeJson(DIAGNOSTIC_LEDGER_PATH, ledger);
		process.stderr.write(
			`Semantic judge diagnostic stopped fail-closed (${ledger.entry.code}).\n`,
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
