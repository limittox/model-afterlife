import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("pre-release database migration", () => {
	it("ships ordered migrations containing the world and private scene schemas", async () => {
		const journal = JSON.parse(
			await readFile("drizzle/meta/_journal.json", "utf8"),
		) as { entries: Array<{ tag: string }> };
		const migration = await readFile("drizzle/0000_world_skeleton.sql", "utf8");

		expect(journal.entries.map((entry) => entry.tag)).toEqual([
			"0000_world_skeleton",
			"0001_majestic_mariko_yashida",
		]);
		expect(migration).toContain('"schema_version" integer DEFAULT 1 NOT NULL');
		expect(migration).toContain('"public_snapshot" jsonb NOT NULL');
		expect(migration).toContain('"state" jsonb NOT NULL');
		expect(migration).toContain('"sequence" integer PRIMARY KEY NOT NULL');
		const sceneMigration = await readFile("drizzle/0001_majestic_mariko_yashida.sql", "utf8");
		for (const table of ["resident_model_versions", "character_bible_versions", "historical_claim_versions", "scene_briefs", "generation_attempts", "generation_turns", "scene_validation_results", "published_scene_revisions"]) expect(sceneMigration).toContain(`CREATE TABLE "${table}"`);
	});
});
