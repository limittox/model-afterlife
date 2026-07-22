import { describe, expect, it } from "vitest";
import * as snapshotRoute from "../../src/app/api/world/snapshot/route.ts";
import * as updatesRoute from "../../src/app/api/world/updates/route.ts";
import {
	PublicWorldSnapshotSchema,
	PublicWorldUpdatesSchema,
} from "../../src/features/world/contracts/public-world.ts";
import { readCanonicalHead } from "../../src/features/world/server/world-repository.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";

describe("read-only world API", () => {
	it.each(["-1", "nope", "9007199254740992", "1.5"])(
		"rejects malformed cursor %s before reading updates",
		async (after) => {
			const response = await updatesRoute.GET(
				new Request(`http://local.test/api/world/updates?after=${after}`),
			);

			expect(response.status).toBe(400);
			expect(await response.json()).toEqual({
				error: "after must be a non-negative safe integer.",
			});
		},
	);

	it("returns contiguous schema-versioned updates with a hard cap", async () => {
		const response = await updatesRoute.GET(
			new Request("http://local.test/api/world/updates?after=0"),
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("cache-control")).toBe("no-store");
		const result = PublicWorldUpdatesSchema.parse(await response.json());

		expect(result.updates.length).toBeLessThanOrEqual(100);
		expect(result.updates.map((update) => update.sequence)).toEqual(
			Array.from({ length: result.updates.length }, (_, index) => index + 1),
		);
		for (const update of result.updates) {
			expect(update.snapshot.throughSequence).toBe(update.sequence);
			expect(update.snapshot.stateHash).toBe(update.stateHash);
		}
	});

	it("returns an empty tail at the committed head and requests a snapshot on gaps", async () => {
		const head = await readCanonicalHead(CANONICAL_WORLD_ID);
		const atHead = PublicWorldUpdatesSchema.parse(
			await (
				await updatesRoute.GET(
					new Request(
						`http://local.test/api/world/updates?after=${head.snapshot.throughSequence}`,
					),
				)
			).json(),
		);
		const beyondHead = PublicWorldUpdatesSchema.parse(
			await (
				await updatesRoute.GET(
					new Request(
						`http://local.test/api/world/updates?after=${head.snapshot.throughSequence + 10}`,
					),
				)
			).json(),
		);

		expect(atHead.updates).toEqual([]);
		expect(atHead.requiresSnapshot).toBe(false);
		expect(beyondHead.updates).toEqual([]);
		expect(beyondHead.requiresSnapshot).toBe(true);
	});

	it("serves one coherent projection and exports GET handlers only", async () => {
		const response = await snapshotRoute.GET();
		const snapshot = PublicWorldSnapshotSchema.parse(await response.json());
		const committed = await readCanonicalHead(CANONICAL_WORLD_ID);

		expect(response.status).toBe(200);
		expect(snapshot).toEqual(committed.snapshot);
		expect(Object.keys(snapshotRoute).sort()).toEqual(["GET"]);
		expect(Object.keys(updatesRoute).sort()).toEqual(["GET"]);
	});
});
