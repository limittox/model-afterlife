import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import * as snapshotRoute from "../../src/app/api/world/snapshot/route.ts";
import {
	reduceObserverPresentation,
	type ObserverPresentationState,
} from "../../src/features/world/client/ObserverSkeleton.tsx";
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
		expect(first.scene).toBeNull();
		expect(first.quiet).not.toBeNull();
	});

	it("keeps pause, resume, and jump-live presentation state local", async () => {
		const response = await snapshotRoute.GET();
		const snapshot = PublicWorldSnapshotSchema.parse(await response.json());
		const hashBefore = await readCurrentStateHash();

		let presentation: ObserverPresentationState = {
			mode: "live",
			snapshot,
		};
		presentation = reduceObserverPresentation(presentation, { type: "pause" });
		expect(presentation.mode).toBe("paused");

		presentation = reduceObserverPresentation(presentation, { type: "resume" });
		expect(presentation.mode).toBe("live");

		presentation = reduceObserverPresentation(presentation, {
			type: "jump-live",
			snapshot,
		});
		expect(presentation.snapshot.stateHash).toBe(hashBefore);
		expect(await readCurrentStateHash()).toBe(hashBefore);
	});

	it("exposes no browser-callable canonical mutation route or secret", async () => {
		expect(Object.keys(snapshotRoute).sort()).toEqual(["GET"]);

		const routeDirectory = path.resolve("src/app/api/world/snapshot");
		expect(await readdir(routeDirectory)).toEqual(["route.ts"]);

		const clientSource = await readFile(
			path.resolve("src/features/world/client/ObserverSkeleton.tsx"),
			"utf8",
		);
		expect(clientSource).not.toMatch(
			/DATABASE_URL|TRIGGER_SECRET_KEY|createWorldDatabase|worldProjection/,
		);
		expect(clientSource).toContain('method: "GET"');
	});
});
