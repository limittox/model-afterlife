import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("pre-release database migration", () => {
	it("ships one fresh-install migration containing the complete Phase 1 schema", async () => {
		const journal = JSON.parse(
			await readFile("drizzle/meta/_journal.json", "utf8"),
		) as { entries: Array<{ tag: string }> };
		const migration = await readFile("drizzle/0000_world_skeleton.sql", "utf8");

		expect(journal.entries.map((entry) => entry.tag)).toEqual([
			"0000_world_skeleton",
		]);
		expect(migration).toContain('"schema_version" integer DEFAULT 1 NOT NULL');
		expect(migration).toContain('"public_snapshot" jsonb NOT NULL');
		expect(migration).toContain('"state" jsonb NOT NULL');
		expect(migration).toContain('"sequence" integer PRIMARY KEY NOT NULL');
	});
});
