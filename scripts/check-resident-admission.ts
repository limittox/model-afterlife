import { mkdir, writeFile } from "node:fs/promises";
import {
	createLiveAdmissionDependencies,
	ResidentAdmissionError,
	runAdmissionCanaries,
} from "../src/features/world/generation/run-admission-canaries.ts";

const LIVE_FLAG = "--live";
const SAMPLE_FLAG = "--samples=5";
const RESULT_PATH = "evals/results/phase-02-live-admission.json";

async function main(): Promise<void> {
	const argumentsSet = new Set(process.argv.slice(2).filter((value) => value !== "--"));
	if (!argumentsSet.has(LIVE_FLAG) || !argumentsSet.has(SAMPLE_FLAG)) {
		throw new Error("Live resident admission requires --live and --samples=5.");
	}
	const apiKey = process.env.OPENROUTER_API_KEY;
	if (!apiKey) throw new Error("Live resident admission requires the server API key.");

	const result = await runAdmissionCanaries(
		{ samples: 5 },
		createLiveAdmissionDependencies({ apiKey }),
	);
	await mkdir("evals/results", { recursive: true });
	await writeFile(RESULT_PATH, `${JSON.stringify(result, null, 2)}\n`, "utf8");
	process.stdout.write(
		`Resident admission passed: ${result.residents.length} residents, ${result.sampleCount} samples.\n`,
	);
}

main().catch((error: unknown) => {
	if (error instanceof ResidentAdmissionError) {
		process.stderr.write(
			`Admission failed: ${error.residentId} via ${error.approvedUpstream} (${error.code}).\n`,
		);
	} else {
		process.stderr.write("Resident admission could not complete (configuration-or-runner-error).\n");
	}
	process.exitCode = 1;
});
