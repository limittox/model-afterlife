import { rebuildWorldProjection } from "../src/features/world/server/rebuild-world-projection.ts";
import { CANONICAL_WORLD_ID } from "../src/features/world/server/seed-data.ts";

const checkOnly = process.argv.slice(2).includes("--check");
if (!checkOnly) {
	throw new Error(
		"Rebuild defaults to verification only. Pass --check; overwrites require an explicit test-only integration path.",
	);
}

const result = await rebuildWorldProjection(CANONICAL_WORLD_ID, {
	checkOnly: true,
});

console.log(JSON.stringify(result, null, 2));
