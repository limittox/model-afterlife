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
	mode: "initial" | "reference-continuation" | "reference-retry";
	startingCumulativeGenerations: number;
	checkpointGenerations: number;
	requiredCumulativeCap: number;
	ledgerPath: string;
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

function assertAuthorization(): {
	apiKey: string;
	configuration: RunConfiguration;
} {
	const args = new Set(process.argv.slice(2).filter((value) => value !== "--"));
	const continuation = args.has("--reference-only-continuation");
	const retry = args.has("--reference-only-retry");
	if (continuation && retry) {
		throw new Error("Choose exactly one reference continuation or retry mode.");
	}
	const configuration: RunConfiguration = retry
		? {
				mode: "reference-retry",
				startingCumulativeGenerations: RETRY_STARTING_CUMULATIVE_GENERATIONS,
				checkpointGenerations: RETRY_CHECKPOINT_GENERATIONS,
				requiredCumulativeCap: RETRY_REQUIRED_CUMULATIVE_CAP,
				ledgerPath: RETRY_LEDGER_PATH,
			}
		: continuation
			? {
					mode: "reference-continuation",
					startingCumulativeGenerations:
						CONTINUATION_STARTING_CUMULATIVE_GENERATIONS,
					checkpointGenerations: CONTINUATION_CHECKPOINT_GENERATIONS,
					requiredCumulativeCap: CONTINUATION_REQUIRED_CUMULATIVE_CAP,
					ledgerPath: CONTINUATION_LEDGER_PATH,
				}
			: {
					mode: "initial",
					startingCumulativeGenerations:
						INITIAL_STARTING_CUMULATIVE_GENERATIONS,
					checkpointGenerations: INITIAL_CHECKPOINT_GENERATIONS,
					requiredCumulativeCap: INITIAL_REQUIRED_CUMULATIVE_CAP,
					ledgerPath: INITIAL_LEDGER_PATH,
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
		const referenceResults: ReferenceResult[] = [];

		for (const [caseIndex, reference] of REFERENCE_CASES.entries()) {
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
				const code = classifyLiveGenerationFailure(error);
				settle(activeJudgeEntry, "failed", {
					code,
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
