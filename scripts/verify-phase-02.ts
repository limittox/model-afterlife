import { spawnSync } from "node:child_process";

const resolvedPnpmCli = process.env.npm_execpath;
if (!resolvedPnpmCli) {
	throw new Error("verify:phase-02 must be launched through pnpm.");
}
const pnpmCli: string = resolvedPnpmCli;
const offline = process.argv.includes("--offline");
const live = process.argv.includes("--live");

function run(args: string[]): void {
	const result = spawnSync(process.execPath, [pnpmCli, ...args], {
		cwd: process.cwd(),
		env: {
			...process.env,
			PROMPTFOO_DISABLE_TELEMETRY: "1",
			PROMPTFOO_DISABLE_UPDATE: "1",
		},
		stdio: "inherit",
	});
	if (result.status !== 0) {
		throw new Error(`Verification command failed: pnpm ${args.join(" ")}`);
	}
}

if (!offline) {
	run(["db:up"]);
	run(["db:migrate"]);
	run(["db:seed"]);
	run(["test"]);
	run(["rebuild-world", "--", "--check"]);
} else {
	run(["exec", "vitest", "run", "--config", "vitest.phase-02-offline.config.ts"]);
}

run(["eval:phase-02:frozen"]);
run([
	"exec",
	"promptfoo",
	"eval",
	"--config",
	"evals/promptfooconfig.yaml",
	"--no-cache",
	"--no-write",
	"--no-share",
	"--no-progress-bar",
	"--no-table",
]);
run(["privacy:phase-02"]);

if (!offline) {
	run(["test:e2e"]);
} else {
	run([
		"exec",
		"playwright",
		"test",
		"tests/e2e/semantic-observer.spec.ts",
		"--config",
		"playwright.phase-02-offline.config.ts",
	]);
}

run(["lint"]);
run(["typecheck"]);
run(["build"]);

if (live) {
	run(["eval:phase-02:live"]);
}
