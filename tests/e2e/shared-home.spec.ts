import path from "node:path";
import { expect, test, type Page, type Route } from "@playwright/test";
import type { PublicWorldSnapshot } from "../../src/features/world/contracts/public-world.ts";
import {
	activeSceneState,
	longTextState,
	overflowState,
	quietState,
} from "../../src/features/world/fixtures/ui-states.ts";
import { advanceWorldTo } from "../../src/features/world/server/advance-world-to.ts";
import {
	readCurrentSnapshot,
	readCurrentStateHash,
} from "../../src/features/world/server/read-current-snapshot.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";

const activeSnapshot = activeSceneState.snapshot as PublicWorldSnapshot;
const quietSnapshot = quietState.snapshot as PublicWorldSnapshot;
const overflowSnapshot = overflowState.snapshot as PublicWorldSnapshot;
const longSnapshot = longTextState.snapshot as PublicWorldSnapshot;

function emptyUpdates(after: number) {
	return {
		schemaVersion: 1,
		fromSequence: after,
		throughSequence: after,
		hasMore: false,
		requiresSnapshot: false,
		updates: [],
	};
}

async function mockSnapshot(
	page: Page,
	snapshot: PublicWorldSnapshot,
	options: { updateStatus?: number } = {},
): Promise<void> {
	await page.route("**/api/world/snapshot", (route) =>
		route.fulfill({ json: snapshot }),
	);
	await page.route("**/api/world/updates?**", (route) => {
		if (options.updateStatus) {
			return route.fulfill({
				status: options.updateStatus,
				json: { error: "unavailable" },
			});
		}
		const after = Number(
			new URL(route.request().url()).searchParams.get("after") ?? 0,
		);
		return route.fulfill({ json: emptyUpdates(after) });
	});
}

async function openFixture(
	page: Page,
	snapshot: PublicWorldSnapshot,
	options: { updateStatus?: number } = {},
): Promise<void> {
	await mockSnapshot(page, snapshot, options);
	await page.goto("/");
	await expect(page.locator(".pixel-world")).toHaveAttribute(
		"data-state-hash",
		snapshot.stateHash,
	);
	await expect(page.locator(".phaser-world-host canvas")).toHaveCount(1);
}

async function worldEvidence(page: Page) {
	const world = page.locator(".pixel-world");
	await expect(world).toHaveAttribute("data-world-id", /.+/);
	return world.evaluate((element) => ({
		worldId: element.getAttribute("data-world-id"),
		logicalTick: element.getAttribute("data-logical-tick"),
		throughSequence: element.getAttribute("data-through-sequence"),
		stateHash: element.getAttribute("data-state-hash"),
		residentLocations: element.getAttribute("data-resident-locations"),
		sceneId: element.getAttribute("data-scene-id"),
	}));
}

test.describe("server-owned shared home", () => {
	test("two isolated viewers converge while one delays and moves only its camera", async ({
		browser,
	}) => {
		test.setTimeout(60_000);
		const initial = await readCurrentSnapshot();
		const contextA = await browser.newContext();
		const contextB = await browser.newContext();
		const pageA = await contextA.newPage();
		const pageB = await contextB.newPage();

		try {
			await Promise.all([pageA.goto("/"), pageB.goto("/")]);
			await expect(pageA.locator(".pixel-world")).toHaveAttribute(
				"data-state-hash",
				initial.stateHash,
			);
			await expect(pageB.locator(".pixel-world")).toHaveAttribute(
				"data-state-hash",
				initial.stateHash,
			);
			expect(await worldEvidence(pageA)).toEqual(await worldEvidence(pageB));

			await pageA.getByRole("button", { name: "Pause presentation" }).click();
			const resident = initial.residents[0];
			const follow = pageA.getByRole("button", {
				name: `Follow ${resident.name}`,
			});
			await follow.focus();
			await follow.press("Enter");
			await pageA.getByRole("button", { name: "Pan right" }).click();
			await pageA.getByRole("button", { name: "Zoom in" }).click();
			await pageA.getByRole("button", { name: "Reset view" }).click();

			expect((await worldEvidence(pageB)).stateHash).toBe(initial.stateHash);
			expect(await readCurrentStateHash()).toBe(initial.stateHash);

			const advanced = await advanceWorldTo(
				CANONICAL_WORLD_ID,
				initial.logicalTick + 1,
			);
			await expect(pageB.locator(".pixel-world")).toHaveAttribute(
				"data-state-hash",
				advanced.stateHash,
				{ timeout: 12_000 },
			);
			await expect(pageA.locator(".observer-shell")).toHaveAttribute(
				"data-acquisition-cursor",
				String(advanced.throughSequence),
				{ timeout: 12_000 },
			);
			await expect(pageA.locator(".pixel-world")).toHaveAttribute(
				"data-state-hash",
				initial.stateHash,
			);

			await pageA.getByRole("button", { name: "Resume presentation" }).click();
			await expect(pageA.locator(".pixel-world")).toHaveAttribute(
				"data-state-hash",
				advanced.stateHash,
				{ timeout: 8_000 },
			);
			await pageA.getByRole("button", { name: "Jump to live" }).click();
			await expect(
				pageA.locator(".observer-shell > .visually-hidden[aria-live='polite']"),
			).toContainText(
				"Caught up to live",
			);

			expect(await worldEvidence(pageA)).toEqual(await worldEvidence(pageB));
			expect(await readCurrentStateHash()).toBe(advanced.stateHash);
		} finally {
			await contextA.close();
			await contextB.close();
		}
	});
});

test.describe("SpeechBubbleLayer considerations", () => {
	test("SpeechBubbleLayer/empty: quiet canon renders no bubble", async ({
		page,
	}) => {
		await openFixture(page, quietSnapshot);
		await expect(page.locator(".phaser-world-host canvas")).toHaveAttribute(
			"data-bubble-count",
			"0",
		);
		await expect(page.getByRole("heading", { name: "The home is quiet" })).toBeVisible();
	});

	test("SpeechBubbleLayer/loading: loading renders no placeholder speech", async ({
		page,
	}) => {
		await page.route(
			"**/api/world/snapshot",
			() => new Promise<void>(() => undefined),
		);
		await page.goto("/");
		await expect(page.locator(".pixel-world-empty h2")).toContainText(
			"Opening the home",
		);
		await expect(page.locator(".phaser-world-host canvas")).toHaveCount(0);
		await expect(page.locator(".dialogue-turn")).toHaveCount(0);
	});

	test("SpeechBubbleLayer/error: cached outage never becomes resident speech", async ({
		page,
	}) => {
		await openFixture(page, activeSnapshot, { updateStatus: 503 });
		await expect(
			page.getByText("The live feed is having trouble.", { exact: false }),
		).toBeVisible();
		await expect(page.locator(".phaser-world-host canvas")).toHaveAttribute(
			"data-bubble-count",
			"0",
		);
	});

	test("SpeechBubbleLayer/populated: exactly one current turn supplements the transcript", async ({
		page,
	}) => {
		await openFixture(page, activeSnapshot);
		const canvas = page.locator(".phaser-world-host canvas");
		await expect(canvas).toHaveAttribute("data-bubble-count", "1");
		await expect(canvas).toHaveAttribute("data-bubble-lines", "2");
		await expect(page.locator(".dialogue-turn")).toHaveCount(
			activeSnapshot.scene?.turns.length ?? 0,
		);
	});

	test("SpeechBubbleLayer/overflow: supplementary copy stays within two lines", async ({
		page,
	}) => {
		await openFixture(page, overflowSnapshot);
		const canvas = page.locator(".phaser-world-host canvas");
		await expect(canvas).toHaveAttribute("data-bubble-count", "1");
		await expect(canvas).toHaveAttribute("data-bubble-lines", "2");
		await expect(page.locator(".dialogue-turn")).toHaveCount(8);
	});

	test("SpeechBubbleLayer/long-text: full DOM turn survives bounded canvas copy", async ({
		page,
	}) => {
		await openFixture(page, longSnapshot);
		const completeTurn = longSnapshot.scene?.turns.at(-1)?.text ?? "";
		const canvas = page.locator(".phaser-world-host canvas");
		await expect(canvas).toHaveAttribute("data-bubble-lines", "2");
		expect((await canvas.getAttribute("data-bubble-text"))?.length).toBeLessThan(
			completeTurn.length,
		);
		await expect(page.locator(".dialogue-turn").last()).toContainText(
			completeTurn,
		);
	});
});

test.describe("renderer composition and lifecycle", () => {
	test("one client-only renderer owns one canvas and one control subscription", async ({
		page,
	}) => {
		await openFixture(page, activeSnapshot);
		const canvas = page.locator(".phaser-world-host canvas");
		await expect(canvas).toHaveCount(1);
		await page.getByRole("button", { name: "Zoom in" }).click();
		await expect(canvas).toHaveAttribute("data-camera-zoom", "2");
		await page.reload();
		await expect(page.locator(".phaser-world-host canvas")).toHaveCount(1);
	});

	test("1280 and 1024 layouts keep crisp integer pixels and fixed rail widths", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1280, height: 720 });
		await openFixture(page, activeSnapshot);
		const canvas = page.locator(".phaser-world-host canvas");
		expect((await page.locator(".scene-rail").boundingBox())?.width).toBe(360);
		await expect(canvas).toHaveAttribute("data-display-scale", "2");
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
			),
		).toBe(true);

		await page.setViewportSize({ width: 1024, height: 640 });
		expect((await page.locator(".scene-rail").boundingBox())?.width).toBe(320);
		await expect(canvas).toHaveAttribute("data-display-scale", "2");

		await page.setViewportSize({ width: 1280, height: 720 });
		await page.evaluate(async () => {
			await document.fonts.ready;
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
		});
		await page.addStyleTag({
			content:
				".scene-focus-target, nextjs-portal { display: none !important; }",
		});
		await page.screenshot({
			path: path.resolve("test-results/phase-1-home.png"),
			animations: "disabled",
		});
	});

	test("reduced motion holds quiet loops and frames a newly active scene instantly", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		let snapshotCall = 0;
		await page.route("**/api/world/snapshot", (route) => {
			snapshotCall += 1;
			return route.fulfill({
				json: snapshotCall === 1 ? quietSnapshot : activeSnapshot,
			});
		});
		await page.route("**/api/world/updates?**", (route: Route) => {
			const after = Number(
				new URL(route.request().url()).searchParams.get("after") ?? 0,
			);
			return route.fulfill({ json: emptyUpdates(after) });
		});
		await page.goto("/");
		const canvas = page.locator(".phaser-world-host canvas");
		await expect(canvas).toHaveAttribute("data-idle-motion", "held");
		await page.evaluate(() => window.dispatchEvent(new Event("focus")));
		await expect(page.locator(".pixel-world")).toHaveAttribute(
			"data-scene-id",
			activeSnapshot.scene?.id ?? "",
		);
		await expect(canvas).toHaveAttribute("data-camera-duration", "0");
		await expect(canvas).toHaveAttribute("data-speaker-marker", "static");
		await expect(page.locator("[aria-live='polite']")).toContainText(
			"Current scene framed without motion.",
		);
	});
});
