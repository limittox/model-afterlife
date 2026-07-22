import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { configureTestDatabaseEnvironment } from "./tests/database-test-environment.ts";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
configureTestDatabaseEnvironment();

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(projectRoot, "src"),
		},
	},
	test: {
		environment: "node",
		fileParallelism: false,
		include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
		setupFiles: ["./tests/setup.ts"],
		globalSetup: ["./tests/global-setup.ts"],
		sequence: {
			concurrent: false,
		},
	},
});
