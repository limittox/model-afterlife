import { execFileSync } from "node:child_process";
import { count, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createWorldDatabase } from "../../src/db/client.ts";
import {
	characterBibleVersions,
	historicalClaimVersions,
	residentModelVersions,
	worldProjection,
} from "../../src/db/schema.ts";
import { rebuildProjection } from "../../src/features/world/domain/replay.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "../../src/features/world/server/to-public-snapshot.ts";
import {
	readCanonicalHead,
	readCommittedWorldEvents,
} from "../../src/features/world/server/world-repository.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";

async function writeCanonicalHead(
	state: ReturnType<typeof rebuildProjection>["state"],
): Promise<void> {
	const snapshot = toPublicWorldSnapshot(state);
	const { db, close } = createWorldDatabase();
	try {
		await db
			.update(worldProjection)
			.set({
				logicalTick: state.logicalTick,
				throughSequence: state.throughSequence,
				projection: snapshot,
				state,
				stateHash: snapshot.stateHash,
				updatedAt: new Date(),
			})
			.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID));
	} finally {
		await close();
	}
}

describe("database seeding", () => {
	it("seeds the six versioned residents and editorial ledger idempotently", async () => {
		const readCounts = async () => {
			const { db, close } = createWorldDatabase();
			try {
				const [[models], [bibles], [claims], modelRows, bibleRows, claimRows] = await Promise.all([
					db.select({ value: count() }).from(residentModelVersions),
					db.select({ value: count() }).from(characterBibleVersions),
					db.select({ value: count() }).from(historicalClaimVersions),
					db
						.select({
							residentId: residentModelVersions.residentId,
							exactModelId: residentModelVersions.exactModelId,
						})
						.from(residentModelVersions)
						.orderBy(residentModelVersions.residentId),
					db.select({ content: characterBibleVersions.content }).from(characterBibleVersions),
					db.select({ content: historicalClaimVersions.content }).from(historicalClaimVersions),
				]);
				return {
					models: models?.value ?? 0,
					bibles: bibles?.value ?? 0,
					claims: claims?.value ?? 0,
					modelRows,
					bibleRows,
					claimRows,
				};
			} finally {
				await close();
			}
		};

		const before = await readCounts();
		expect(before.models).toBe(6);
		expect(before.bibles).toBe(6);
		expect(before.claims).toBe(18);

		execFileSync(
			process.execPath,
			["--experimental-strip-types", "scripts/seed-world.ts"],
			{ cwd: process.cwd(), env: process.env, stdio: "pipe" },
		);
		const after = await readCounts();
		expect(after).toEqual(before);
		expect(after.modelRows.map((row) => row.exactModelId).sort()).toEqual(
			[
				"anthropic/claude-sonnet-4.5",
				"deepseek/deepseek-v3.2",
				"google/gemini-2.5-pro",
				"meta-llama/llama-3.3-70b-instruct",
				"openai/gpt-4o",
				"qwen/qwen-2.5-7b-instruct",
			].sort(),
		);
		for (const row of [...after.bibleRows, ...after.claimRows]) {
			const serialized = JSON.stringify(row.content);
			expect(serialized).toBe(serialized.normalize("NFC"));
		}
	});

	it("persists one internally coherent deployment-time seed event", async () => {
		const [seedEvent] = await readCommittedWorldEvents(CANONICAL_WORLD_ID);

		expect(seedEvent?.logicalTick).toBeGreaterThan(0);
		expect(seedEvent?.type).toBe("world_initialized");
		if (seedEvent?.type !== "world_initialized") return;
		expect(seedEvent.payload.state.logicalTick).toBe(seedEvent.logicalTick);
		expect(seedEvent.payload.state.throughSequence).toBe(seedEvent.sequence);
	});

	it("preserves an existing canonical head when seeding is repeated", async () => {
		const events = await readCommittedWorldEvents(CANONICAL_WORLD_ID);
		const rebuilt = rebuildProjection(createProvisionalWorld(), events);
		await writeCanonicalHead(rebuilt.state);
		const advanced = await readCanonicalHead(CANONICAL_WORLD_ID);
		expect(advanced.state.logicalTick).toBeGreaterThan(0);

		try {
			execFileSync(
				process.execPath,
				["--experimental-strip-types", "scripts/seed-world.ts"],
				{
					cwd: process.cwd(),
					env: process.env,
					stdio: "pipe",
				},
			);
			const after = await readCanonicalHead(CANONICAL_WORLD_ID);

			expect(after.snapshot.throughSequence).toBe(
				advanced.snapshot.throughSequence,
			);
			expect(after.snapshot.stateHash).toBe(advanced.snapshot.stateHash);
			expect(after.state).toEqual(advanced.state);
		} finally {
			await writeCanonicalHead(advanced.state);
		}
	});
});
