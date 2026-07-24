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
			"0002_lumpy_daimon_hellstrom",
			"0003_phase3_public_provenance",
		]);
		expect(migration).toContain('"schema_version" integer DEFAULT 1 NOT NULL');
		expect(migration).toContain('"public_snapshot" jsonb NOT NULL');
		expect(migration).toContain('"state" jsonb NOT NULL');
		expect(migration).toContain('"sequence" integer PRIMARY KEY NOT NULL');
		const sceneMigration = await readFile(
			"drizzle/0001_majestic_mariko_yashida.sql",
			"utf8",
		);
		for (const table of [
			"resident_model_versions",
			"character_bible_versions",
			"historical_claim_versions",
			"scene_briefs",
			"generation_attempts",
			"generation_turns",
			"scene_validation_results",
			"published_scene_revisions",
		])
			expect(sceneMigration).toContain(`CREATE TABLE "${table}"`);
		const provenanceMigration = await readFile(
			"drizzle/0002_lumpy_daimon_hellstrom.sql",
			"utf8",
		);
		expect(provenanceMigration).toContain(
			'ALTER TABLE "generation_turns" ADD COLUMN "approved_claim_ids"',
		);
		expect(provenanceMigration).toContain(
			'ALTER TABLE "generation_turns" ADD COLUMN "provenance"',
		);
		const publicProvenanceMigration = await readFile(
			"drizzle/0003_phase3_public_provenance.sql",
			"utf8",
		);
		expect(publicProvenanceMigration).toContain(
			'CREATE TABLE "published_scene_claim_versions"',
		);
		expect(publicProvenanceMigration).toContain(
			'PRIMARY KEY("revision_id","turn_index","claim_version_id")',
		);
		expect(publicProvenanceMigration).toContain(
			'("claim_version_id","revision_id")',
		);
	});
});
