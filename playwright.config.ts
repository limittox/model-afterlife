import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: false,
	workers: 1,
	timeout: 30_000,
	expect: { timeout: 6_000 },
	reporter: "line",
	use: {
		baseURL: "http://127.0.0.1:3100",
		trace: "retain-on-failure",
		screenshot: "only-on-failure",
		...devices["Desktop Chrome"],
		viewport: { width: 1280, height: 720 },
	},
	webServer: {
		command: "corepack pnpm exec next dev --hostname 127.0.0.1 --port 3100",
		url: "http://127.0.0.1:3100",
		reuseExistingServer: !process.env.CI,
		timeout: 120_000,
	},
});
