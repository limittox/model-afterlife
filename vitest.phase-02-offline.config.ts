import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: { alias: { "@": path.resolve(projectRoot, "src") } },
	test: {
		environment: "node",
		fileParallelism: false,
		include: [
			"tests/unit/**/*.test.ts",
			"tests/integration/generation-job.test.ts",
			"tests/integration/provider-failure-continuity.test.ts",
			"tests/integration/publication-quality-gate.test.ts",
		],
		setupFiles: ["./tests/setup.ts"],
		sequence: { concurrent: false },
	},
});
