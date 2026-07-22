import { defineConfig } from "@trigger.dev/sdk";

export default defineConfig({
	project: process.env.TRIGGER_PROJECT_REF ?? "proj_model_afterlife",
	dirs: ["./src/trigger"],
	runtime: "node-22",
	maxDuration: 60,
	ttl: "2m",
	retries: {
		enabledInDev: false,
		default: {
			maxAttempts: 3,
			minTimeoutInMs: 1_000,
			maxTimeoutInMs: 10_000,
			factor: 2,
			randomize: false,
		},
	},
	build: {
		external: ["bufferutil", "ws"],
	},
});
