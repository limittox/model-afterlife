import { expect, type Page, type Route, test } from "@playwright/test";
import type {
	PublicWorldSnapshot,
	PublicWorldUpdate,
} from "../../src/features/world/contracts/public-world.ts";
import {
	activeSceneState,
	longTextState,
	quietState,
} from "../../src/features/world/fixtures/ui-states.ts";

const activeSnapshot = activeSceneState.snapshot as PublicWorldSnapshot;
const quietSnapshot = quietState.snapshot as PublicWorldSnapshot;
const longSnapshot = longTextState.snapshot as PublicWorldSnapshot;

function emptyUpdates(after: number) {
	return {
		schemaVersion: 1 as const,
		fromSequence: after,
		throughSequence: after,
		hasMore: false,
		requiresSnapshot: false,
		updates: [],
	};
}

function afterFrom(route: Route): number {
	return Number(new URL(route.request().url()).searchParams.get("after") ?? 0);
}

function snapshotAt(
	base: PublicWorldSnapshot,
	sequence: number,
): PublicWorldSnapshot {
	return {
		...structuredClone(base),
		logicalTick: sequence,
		throughSequence: sequence,
		stateHash: sequence.toString(16).padStart(64, "0"),
	};
}

function updateFor(next: PublicWorldSnapshot): PublicWorldUpdate {
	return {
		schemaVersion: 1,
		sequence: next.throughSequence,
		logicalTick: next.logicalTick,
		stateHash: next.stateHash,
		snapshot: next,
	};
}

async function mockWorld(
	page: Page,
	options: {
		snapshot?: PublicWorldSnapshot;
		onSnapshot?: (route: Route, call: number) => Promise<void>;
		onUpdates?: (route: Route, call: number) => Promise<void>;
	} = {},
) {
	let snapshotCalls = 0;
	let updateCalls = 0;
	await page.route("**/api/world/snapshot", async (route) => {
		snapshotCalls += 1;
		if (options.onSnapshot) {
			await options.onSnapshot(route, snapshotCalls);
			return;
		}
		await route.fulfill({ json: options.snapshot ?? activeSnapshot });
	});
	await page.route("**/api/world/updates?**", async (route) => {
		updateCalls += 1;
		if (options.onUpdates) {
			await options.onUpdates(route, updateCalls);
			return;
		}
		await route.fulfill({ json: emptyUpdates(afterFrom(route)) });
	});
}

test("Phaser-disabled desktop keeps the complete observer story and actions in semantic HTML", async ({
	page,
}) => {
	await page.addInitScript(() => {
		(
			window as Window & {
				__MODEL_AFTERLIFE_DISABLE_PHASER__?: boolean;
			}
		).__MODEL_AFTERLIFE_DISABLE_PHASER__ = true;
	});
	await mockWorld(page);
	await page.goto("/");

	await expect(page.locator(".observer-shell")).toHaveAttribute(
		"data-renderer-enabled",
		"false",
	);
	await expect(page.locator(".phaser-world-host canvas")).toHaveCount(0);
	await expect(
		page.getByRole("heading", { name: activeSnapshot.scene?.premise }),
	).toBeVisible();
	await expect(
		page
			.getByRole("list", { name: "Complete scene transcript" })
			.getByRole("listitem"),
	).toHaveCount(activeSnapshot.scene?.turns.length ?? 0);
	await expect(
		page.getByRole("navigation", { name: "Observer controls" }),
	).toBeVisible();
	await expect(
		page
			.getByRole("navigation", { name: "Resident shortcuts" })
			.getByRole("link"),
	).toHaveCount(6);
	await expect(
		page.getByRole("navigation", { name: "Observer", exact: true }),
	).toContainText("Live homeResidentsRecent scenes");
	await expect(
		page.getByText("Scenes are staged fictional interactions", {
			exact: false,
		}),
	).toBeVisible();
	await expect(
		page.getByText("Model Afterlife is independent", { exact: false }),
	).toBeVisible();
});

test("mobile heading, DOM, and keyboard order stays scene-first with visible unclipped focus", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await mockWorld(page);
	await page.goto("/");
	await expect(
		page.getByRole("navigation", { name: "Resident shortcuts" }),
	).toBeVisible();
	await expect(page.locator(".observer-shell")).toHaveAttribute(
		"data-presentation-layout",
		"compact",
	);

	const orderedSelectors = [
		".home-status-strip",
		".observer-navigation",
		"#current-scene",
		"#observer-controls",
		".compact-home-view",
		".resident-shortcuts",
		".transparency-notice",
	];
	const positions = await page.evaluate((selectors) => {
		const all = Array.from(document.querySelectorAll("*"));
		return selectors.map((selector) =>
			all.indexOf(document.querySelector(selector) as Element),
		);
	}, orderedSelectors);
	expect(positions).toEqual([...positions].sort((a, b) => a - b));

	const headingLabels = await page
		.locator("main h1, main h2, main h3")
		.allTextContents();
	expect(headingLabels.slice(0, 5)).toEqual([
		"Model Afterlife",
		activeSnapshot.scene?.premise,
		"Dialogue",
		"The shared home at a glance",
		"Resident profiles",
	]);

	const targets = page.locator(
		".observer-navigation a:visible, #observer-controls button:visible, #observer-controls textarea:visible, .resident-shortcuts a:visible",
	);
	for (const target of await targets.all()) {
		const box = await target.boundingBox();
		expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
		expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
	}
	let pause = page.getByRole("button", { name: "Pause presentation" });
	await pause.press("Enter");
	const resume = page.getByRole("button", { name: "Resume presentation" });
	await expect(resume).toBeVisible();
	await resume.press("Enter");
	pause = page.getByRole("button", { name: "Pause presentation" });
	await pause.focus();
	await expect(pause).toBeFocused();
	await expect(pause).toHaveCSS("outline-style", "solid");
	expect(
		await pause.evaluate((node) => {
			const box = node.getBoundingClientRect();
			const shell = document.documentElement.getBoundingClientRect();
			return box.left >= shell.left && box.right <= shell.right;
		}),
	).toBe(true);
});

test("optional share controls disappear without moving focus from the remaining presentation action", async ({
	page,
}) => {
	const quietNext = snapshotAt(quietSnapshot, 85);
	let allowQuiet = false;
	await mockWorld(page, {
		onUpdates: async (route) => {
			const after = afterFrom(route);
			await route.fulfill({
				json:
					allowQuiet && after === 84
						? {
								schemaVersion: 1,
								fromSequence: 84,
								throughSequence: 85,
								hasMore: false,
								requiresSnapshot: false,
								updates: [updateFor(quietNext)],
							}
						: emptyUpdates(after),
			});
		},
	});
	await page.goto("/");
	await expect(
		page.getByRole("textbox", { name: "Scene address" }),
	).toHaveValue(/^http:\/\/127\.0\.0\.1:3100\/scenes\//u);
	let pause = page.getByRole("button", { name: "Pause presentation" });
	await pause.press("Enter");
	const resume = page.getByRole("button", { name: "Resume presentation" });
	await expect(resume).toBeVisible();
	await resume.press("Enter");
	pause = page.getByRole("button", { name: "Pause presentation" });
	await pause.focus();
	await expect(
		page.getByRole("button", { name: "Share this scene" }),
	).toBeVisible();

	allowQuiet = true;
	await expect(
		page.getByRole("heading", { name: "The home is quiet" }),
	).toBeVisible({ timeout: 7_000 });
	await expect(
		page.getByRole("button", { name: "Share this scene" }),
	).toHaveCount(0);
	await expect(pause).toBeFocused();
});

test("runtime reduced motion, local pause, and canonical acquisition remain independent", async ({
	page,
}) => {
	const quietNext = snapshotAt(quietSnapshot, 85);
	let allowUpdate = false;
	await page.emulateMedia({ reducedMotion: "no-preference" });
	await mockWorld(page, {
		onUpdates: async (route) => {
			const after = afterFrom(route);
			await route.fulfill({
				json:
					allowUpdate && after === 84
						? {
								schemaVersion: 1,
								fromSequence: 84,
								throughSequence: 85,
								hasMore: false,
								requiresSnapshot: false,
								updates: [updateFor(quietNext)],
							}
						: emptyUpdates(after),
			});
		},
	});
	await page.goto("/");
	const canvas = page.locator(".phaser-world-host canvas");
	await expect(canvas).toHaveAttribute("data-reduced-motion", "false");
	await expect(canvas).toHaveAttribute("data-idle-motion", "7fps");

	await page.emulateMedia({ reducedMotion: "reduce" });
	await expect(page.locator(".observer-shell")).toHaveAttribute(
		"data-reduced-motion",
		"true",
	);
	await expect(canvas).toHaveAttribute("data-reduced-motion", "true");
	await expect(canvas).toHaveAttribute("data-idle-motion", "held");

	const pause = page.getByRole("button", { name: "Pause presentation" });
	await pause.click();
	const resume = page.getByRole("button", { name: "Resume presentation" });
	await expect(resume).toBeFocused();
	await expect(page.locator("[aria-live='polite']")).toContainText(
		"Presentation paused.",
	);
	allowUpdate = true;
	await expect
		.poll(
			() =>
				page.locator(".observer-shell").getAttribute("data-acquisition-cursor"),
			{ timeout: 7_000 },
		)
		.toBe("85");
	await expect(page.locator(".observer-shell")).toHaveAttribute(
		"data-presentation-cursor",
		"84",
	);
	await expect(page.locator(".dialogue-turn")).toHaveCount(
		activeSnapshot.scene?.turns.length ?? 0,
	);
	await expect(resume).toBeFocused();
});

test("Unicode dialogue, exact IDs, long addresses, and 200-percent reflow retain complete meaning", async ({
	page,
}) => {
	await page.setViewportSize({ width: 512, height: 720 });
	const unicode = structuredClone(longSnapshot);
	if (!unicode.scene) throw new Error("Long fixture needs a scene.");
	unicode.scene.originalRevisionId =
		"revision-context-window-with-a-very-long-canonical-identity-2026-07-25";
	unicode.scene.turns[0] = {
		...unicode.scene.turns[0],
		exactModelId: "openai/gpt-4o-2024-11-20-長い-exact-model-id",
		text: "“Tea?” asked GPT‑4o — 雪, Δ, naïve café, and every context token remain intact.",
	};
	await mockWorld(page, { snapshot: unicode });
	await page.goto("/");

	await expect(page.locator(".dialogue-turn").first()).toContainText(
		"“Tea?” asked GPT‑4o — 雪, Δ, naïve café",
	);
	await expect(page.locator(".model-label").first()).toHaveText(
		"openai/gpt-4o-2024-11-20-長い-exact-model-id",
	);
	await expect(
		page.getByRole("textbox", { name: "Scene address" }),
	).toHaveValue(/http:\/\/127\.0\.0\.1:3100\/scenes\/revision-/u);
	expect(
		await page.evaluate(
			() =>
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth,
		),
	).toBe(true);
	await expect(
		page.locator(".dialogue-turn").first().locator("p").last(),
	).toHaveCSS("overflow-wrap", "anywhere");
});

test("hard loading failure keeps truthful recovery, controls, compact fallback, and disclosures", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 720 });
	await mockWorld(page, {
		onSnapshot: async (route) => {
			await route.fulfill({ status: 503, json: { error: "unavailable" } });
		},
	});
	await page.goto("/");
	await expect(page.locator('.connection-error[role="alert"]')).toContainText(
		"The home couldn’t load",
	);
	await expect(
		page.getByRole("heading", { name: "Home view unavailable" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Try loading again" }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Pause presentation" }),
	).toBeDisabled();
	await expect(
		page.getByRole("button", { name: "Share this scene" }),
	).toHaveCount(0);
	await expect(
		page.getByText("Scenes are staged fictional interactions", {
			exact: false,
		}),
	).toBeVisible();
	expect(
		await page.evaluate(
			() =>
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth,
		),
	).toBe(true);
});
