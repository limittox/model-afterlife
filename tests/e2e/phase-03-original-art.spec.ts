import { expect, test } from "@playwright/test";
import type { PublicWorldSnapshot } from "../../src/features/world/contracts/public-world.ts";
import { activeSceneState } from "../../src/features/world/fixtures/ui-states.ts";

const snapshot = activeSceneState.snapshot as PublicWorldSnapshot;
const residentIds = snapshot.residents.map((resident) => resident.id).join("|");

test.beforeEach(async ({ page }) => {
	await page.route("**/api/world/snapshot", async (route) => {
		await route.fulfill({ json: snapshot });
	});
	await page.route("**/api/world/updates?**", async (route) => {
		const after = Number(
			new URL(route.request().url()).searchParams.get("after") ?? 0,
		);
		await route.fulfill({
			json: {
				schemaVersion: 1,
				fromSequence: after,
				throughSequence: after,
				hasMore: false,
				requiresSnapshot: false,
				updates: [],
			},
		});
	});
});

test("loads a production sprite atlas for all six launch residents", async ({
	page,
}) => {
	await page.goto("/");
	const canvas = page.locator(".phaser-world-host canvas").last();
	await expect(canvas).toHaveAttribute(
		"data-production-asset-ids",
		residentIds,
	);
	await expect(canvas).toHaveAttribute("data-resident-ids", residentIds);
	await expect(canvas).toHaveAttribute(
		"data-home-artwork",
		"home-establishing",
	);
	await expect(canvas).toHaveAttribute(
		"data-resident-intents",
		expect.stringContaining("deepseek-v3.2:walk:right:walking"),
	);
});

test("uses original home art and static resident portraits in the compact semantic view", async ({
	page,
}) => {
	await page.setViewportSize({ width: 640, height: 900 });
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	const home = page.locator(".compact-home-snapshot");
	await expect(home).toHaveAttribute("data-static-home", "true");
	await expect(home.locator(".compact-home-art")).toHaveAttribute(
		"src",
		"/art/home/model-afterlife-home.svg",
	);
	await expect(home.locator(".compact-resident-portrait")).toHaveCount(6);
	await expect(home).toHaveAttribute("role", "img");
});

test("keeps all six resident atlases while reduced motion selects held frames", async ({
	page,
}) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
	await page.goto("/");
	const canvas = page.locator(".phaser-world-host canvas").last();
	await expect(canvas).toHaveAttribute(
		"data-production-asset-ids",
		residentIds,
	);
	await expect(canvas).toHaveAttribute("data-reduced-motion", "true");
	await expect(canvas).toHaveAttribute("data-idle-motion", "held");
});
