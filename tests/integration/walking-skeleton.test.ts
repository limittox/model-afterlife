import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as snapshotRoute from "../../src/app/api/world/snapshot/route.ts";
import {
	createInitialPresentationState,
	presentationReducer,
} from "../../src/features/world/client/presentation-reducer.ts";
import { PublicWorldSnapshotSchema } from "../../src/features/world/contracts/public-world.ts";
import { readCurrentStateHash } from "../../src/features/world/server/read-current-snapshot.ts";

describe("PostgreSQL-backed observer walking skeleton", () => {
	it("returns the same committed snapshot to two independent viewers", async () => {
		const firstResponse = await snapshotRoute.GET();
		const secondResponse = await snapshotRoute.GET();

		expect(firstResponse.status).toBe(200);
		expect(secondResponse.status).toBe(200);

		const first = PublicWorldSnapshotSchema.parse(await firstResponse.json());
		const second = PublicWorldSnapshotSchema.parse(await secondResponse.json());

		expect(second).toMatchObject({
			worldId: first.worldId,
			logicalTick: first.logicalTick,
			throughSequence: first.throughSequence,
			stateHash: first.stateHash,
		});
		expect((first.scene === null) !== (first.quiet === null)).toBe(true);
	});

	it("keeps pause, resume, and jump-live presentation state local", async () => {
		const response = await snapshotRoute.GET();
		const snapshot = PublicWorldSnapshotSchema.parse(await response.json());
		const hashBefore = await readCurrentStateHash();

		let presentation = createInitialPresentationState(snapshot);
		presentation = presentationReducer(presentation, { type: "pause" });
		expect(presentation.mode).toBe("paused");

		presentation = presentationReducer(presentation, { type: "resume" });
		expect(presentation.mode).toBe("live");

		presentation = presentationReducer(presentation, {
			type: "snapshot-accepted",
			snapshot,
			reason: "jump-live",
		});
		expect(presentation.presentedSnapshot?.stateHash).toBe(hashBefore);
		expect(await readCurrentStateHash()).toBe(hashBefore);
	});

	it("exposes no browser-callable canonical mutation route or secret", async () => {
		expect(Object.keys(snapshotRoute).sort()).toEqual(["GET"]);

		const routeDirectory = path.resolve("src/app/api/world/snapshot");
		expect(await readdir(routeDirectory)).toEqual(["route.ts"]);

		const clientSource = (
			await Promise.all(
				[
					"src/features/world/client/WorldObserver.tsx",
					"src/features/world/client/use-world-feed.ts",
					"src/features/world/client/presentation-reducer.ts",
				].map((file) => readFile(path.resolve(file), "utf8")),
			)
		).join("\n");
		expect(clientSource).not.toMatch(
			/DATABASE_URL|TRIGGER_SECRET_KEY|createWorldDatabase|worldProjection/,
		);
		expect(clientSource).toContain('method: "GET"');
	});
});
