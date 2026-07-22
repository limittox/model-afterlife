import { execFileSync } from "node:child_process";
import { createWorldDatabase } from "../../src/db/client.ts";
import { worldProjection } from "../../src/db/schema.ts";

function runPnpm(script: string): void {
	if (process.platform === "win32") {
		execFileSync("cmd.exe", ["/d", "/s", "/c", `corepack pnpm ${script}`], {
			cwd: process.cwd(),
			stdio: "inherit",
		});
		return;
	}
	execFileSync("corepack", ["pnpm", script], {
		cwd: process.cwd(),
		stdio: "inherit",
	});
}

export default async function globalSetup(): Promise<void> {
	runPnpm("db:up");
	runPnpm("db:migrate");

	const { db, close } = createWorldDatabase();
	let hasProjection = false;
	try {
		hasProjection =
			(await db.select({ worldId: worldProjection.worldId }).from(worldProjection).limit(1))
				.length === 1;
	} finally {
		await close();
	}

	if (!hasProjection) runPnpm("db:seed");
}
