import { expect, type Page, type Route, test } from "@playwright/test";
import type {
	PublicWorldSnapshot,
	PublicWorldUpdate,
} from "../../src/features/world/contracts/public-world.ts";
import { activeSceneState } from "../../src/features/world/fixtures/ui-states.ts";

const snapshot = activeSceneState.snapshot as PublicWorldSnapshot;

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
	overrides: Partial<PublicWorldSnapshot> = {},
): PublicWorldSnapshot {
	return {
		...structuredClone(base),
		logicalTick: sequence,
		throughSequence: sequence,
		stateHash: sequence.toString(16).padStart(64, "0"),
		...overrides,
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
	onUpdates?: (route: Route, call: number) => Promise<void>,
) {
	let updateCalls = 0;
	await page.route("**/api/world/snapshot", (route) =>
		route.fulfill({ json: snapshot }),
	);
	await page.route("**/api/world/updates?**", async (route) => {
		updateCalls += 1;
		if (onUpdates) {
			await onUpdates(route, updateCalls);
			return;
		}
		await route.fulfill({ json: emptyUpdates(afterFrom(route)) });
	});
}

test("mobile tracer preserves semantic order and copies the observed canonical revision when Web Share is absent", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.addInitScript(() => {
		const state = window as Window & { __copiedSceneUrls?: string[] };
		state.__copiedSceneUrls = [];
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: undefined,
		});
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: async (text: string) => {
					state.__copiedSceneUrls?.push(text);
				},
			},
		});
	});
	await mockWorld(page);
	await page.goto("/");
	await expect(
		page.getByRole("navigation", { name: "Resident shortcuts" }),
	).toBeVisible();

	const selectors = [
		".home-status-strip",
		".observer-navigation",
		"#current-scene",
		"#observer-controls",
		".compact-home-view",
		".resident-shortcuts",
		".transparency-notice",
	];
	const sourcePositions = await page.evaluate((orderedSelectors) => {
		const nodes = orderedSelectors.map((selector) =>
			document.querySelector(selector),
		);
		if (nodes.some((node) => node === null)) return [];
		const allElements = Array.from(document.querySelectorAll("*"));
		return (nodes as Element[]).map((node) => allElements.indexOf(node));
	}, selectors);
	expect(sourcePositions).toHaveLength(selectors.length);
	expect(sourcePositions).toEqual([...sourcePositions].sort((a, b) => a - b));

	const staticHome = page.getByRole("img", {
		name: /Static home snapshot\. The current scene is in Common Room/u,
	});
	await expect(staticHome).toBeVisible();
	await expect(staticHome).toHaveAttribute("draggable", "false");
	await expect(
		page
			.getByRole("navigation", { name: "Resident shortcuts" })
			.getByRole("link"),
	).toHaveCount(6);
	await expect(page.locator(".phaser-world-host")).toBeHidden();

	for (const control of await page
		.locator("#observer-controls button:visible, .resident-shortcuts a:visible")
		.all()) {
		const box = await control.boundingBox();
		expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
		expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
	}

	const address = page.getByRole("textbox", { name: "Scene address" });
	await expect(address).toContainText(
		"http://127.0.0.1:3100/scenes/fixture-scene",
	);
	await page.getByRole("button", { name: "Share this scene" }).click();
	await expect(page.locator(".share-status")).toHaveText("Scene link copied");
	expect(
		await page.evaluate(
			() =>
				(window as Window & { __copiedSceneUrls?: string[] }).__copiedSceneUrls,
		),
	).toEqual(["http://127.0.0.1:3100/scenes/fixture-scene"]);
});

test("native sharing succeeds once while independent copy remains available", async ({
	page,
}) => {
	await page.addInitScript(() => {
		const state = window as Window & {
			__sharedScenes?: ShareData[];
			__copiedSceneUrls?: string[];
		};
		state.__sharedScenes = [];
		state.__copiedSceneUrls = [];
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: async (data: ShareData) => {
				state.__sharedScenes?.push(data);
			},
		});
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: async (text: string) => {
					state.__copiedSceneUrls?.push(text);
				},
			},
		});
	});
	await mockWorld(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Share this scene" }).click();
	await expect(page.locator(".share-status")).toHaveText("Scene shared.");

	expect(
		await page.evaluate(
			() =>
				(window as Window & { __sharedScenes?: ShareData[] }).__sharedScenes,
		),
	).toHaveLength(1);
	expect(
		await page.evaluate(
			() =>
				(window as Window & { __copiedSceneUrls?: string[] }).__copiedSceneUrls,
		),
	).toEqual([]);

	await page.getByRole("button", { name: "Copy scene link" }).click();
	await expect(page.locator(".share-status")).toHaveText("Scene link copied");
	expect(
		await page.evaluate(
			() =>
				(window as Window & { __copiedSceneUrls?: string[] }).__copiedSceneUrls,
		),
	).toEqual(["http://127.0.0.1:3100/scenes/fixture-scene"]);
});

test("AbortError is silent and never falls back to clipboard", async ({
	page,
}) => {
	await page.addInitScript(() => {
		const state = window as Window & { __copiedSceneUrls?: string[] };
		state.__copiedSceneUrls = [];
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: async () => {
				throw new DOMException("cancelled", "AbortError");
			},
		});
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: async (text: string) => {
					state.__copiedSceneUrls?.push(text);
				},
			},
		});
	});
	await mockWorld(page);
	await page.goto("/");
	await page.getByRole("button", { name: "Share this scene" }).click();
	await expect(page.locator(".share-status")).toHaveCount(0);
	expect(
		await page.evaluate(
			() =>
				(window as Window & { __copiedSceneUrls?: string[] }).__copiedSceneUrls,
		),
	).toEqual([]);
});

test("polling cannot retarget one observed scene and stale completions cannot overwrite a new scene", async ({
	page,
}) => {
	await page.clock.install();
	const retargetAttempt = snapshotAt(snapshot, 85);
	if (!retargetAttempt.scene) throw new Error("Active fixture needs a scene.");
	retargetAttempt.scene.originalRevisionId = "retargeted-revision";

	const nextScene = snapshotAt(snapshot, 86);
	if (!nextScene.scene) throw new Error("Active fixture needs a scene.");
	nextScene.scene = {
		...nextScene.scene,
		id: "next-scene",
		originalRevisionId: "next-original-revision",
		startedAtTick: nextScene.scene.startedAtTick + 1,
	};

	await page.addInitScript(() => {
		const state = window as Window & {
			__shareCalls?: number;
			__resolveShare?: () => void;
		};
		state.__shareCalls = 0;
		Object.defineProperty(navigator, "share", {
			configurable: true,
			value: () => {
				state.__shareCalls = (state.__shareCalls ?? 0) + 1;
				return new Promise<void>((resolve) => {
					state.__resolveShare = resolve;
				});
			},
		});
	});
	let allowNextScene = false;
	await mockWorld(page, async (route, call) => {
		const after = afterFrom(route);
		const next =
			call === 2
				? retargetAttempt
				: allowNextScene && after === 85
					? nextScene
					: undefined;
		await route.fulfill({
			json: next
				? {
						schemaVersion: 1,
						fromSequence: after,
						throughSequence: next.throughSequence,
						hasMore: false,
						requiresSnapshot: false,
						updates: [updateFor(next)],
					}
				: emptyUpdates(after),
		});
	});
	await page.goto("/");
	const address = page.getByRole("textbox", { name: "Scene address" });
	await expect(address).toContainText("/scenes/fixture-scene");

	await page.clock.fastForward(5_100);
	await expect(page.locator(".observer-shell")).toHaveAttribute(
		"data-acquisition-cursor",
		"85",
	);
	await expect(address).toContainText("/scenes/fixture-scene");
	await expect(address).not.toContainText("retargeted-revision");

	await page.getByRole("button", { name: "Share this scene" }).click({
		noWaitAfter: true,
	});
	await expect(
		page.getByRole("button", { name: "Share this scene" }),
	).toBeDisabled();
	await page
		.getByRole("button", { name: "Share this scene" })
		.click({ force: true, noWaitAfter: true });
	expect(
		await page.evaluate(
			() => (window as Window & { __shareCalls?: number }).__shareCalls,
		),
	).toBe(1);

	allowNextScene = true;
	await page.clock.fastForward(5_100);
	await expect(page.locator(".observer-shell")).toHaveAttribute(
		"data-acquisition-cursor",
		"86",
	);
	await expect(address).toContainText("/scenes/next-original-revision");
	await page.evaluate(() =>
		(window as Window & { __resolveShare?: () => void }).__resolveShare?.(),
	);
	await expect(page.getByText("Scene shared.")).toHaveCount(0);
});
