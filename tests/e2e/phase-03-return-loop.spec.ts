import { expect, test, type Route } from "@playwright/test";
import type {
	ReturnRecapResponse,
} from "../../src/features/publication/contracts/public-publication.ts";
import type {
	PublicWorldSnapshot,
	PublicWorldUpdate,
} from "../../src/features/world/contracts/public-world.ts";
import { activeSceneState } from "../../src/features/world/fixtures/ui-states.ts";

const snapshot = activeSceneState.snapshot as PublicWorldSnapshot;
const recap: ReturnRecapResponse = {
	worldId: snapshot.worldId,
	afterSequence: 80,
	throughSequence: 84,
	partial: false,
	beats: [
		{
			revisionId: "recap-scene",
			publicationSequence: 82,
			significance: "shared-experience",
			development: "They now share a memory of the repaired brass tea timer.",
			home: { homeDay: 1, homeTime: "09:40", dayPeriod: "morning" },
			scene: {
				href: "/scenes/recap-scene",
				label: "The residents repair the brass tea timer.",
			},
			residents: [
				{
					residentId: "gpt-4o",
					displayName: "GPT-4o",
					profilePath: "/residents/gpt-4o",
				},
				{
					residentId: "claude-sonnet-4.5",
					displayName: "Claude Sonnet 4.5",
					profilePath: "/residents/claude-sonnet-4.5",
				},
			],
			relationshipNote: null,
		},
	],
	currentSituation: {
		homeDay: 1,
		homeTime: "09:42",
		dayPeriod: "morning",
		description: `The current scene is “${snapshot.scene?.premise}”.`,
	},
};

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

function updateAt85(): PublicWorldUpdate {
	const next: PublicWorldSnapshot = {
		...structuredClone(snapshot),
		logicalTick: 43,
		homeTime: "09:43",
		throughSequence: 85,
		stateHash: "b".repeat(64),
	};
	return {
		schemaVersion: 1,
		sequence: 85,
		logicalTick: 43,
		stateHash: next.stateHash,
		snapshot: next,
	};
}

function afterFrom(route: Route): number {
	return Number(new URL(route.request().url()).searchParams.get("after") ?? 0);
}

async function mockWorld(page: import("@playwright/test").Page) {
	await page.route("**/api/world/snapshot", (route) =>
		route.fulfill({ json: snapshot }),
	);
	await page.route("**/api/world/updates?**", (route) =>
		route.fulfill({ json: emptyUpdates(afterFrom(route)) }),
	);
}

function recapWithBeats(count: number, partial = false): ReturnRecapResponse {
	return {
		...recap,
		afterSequence: 75,
		partial,
		beats: Array.from({ length: count }, (_, index) => ({
			...recap.beats[0],
			revisionId: `recap-scene-${index + 1}`,
			publicationSequence: 84 - index,
			development:
				index === 0
					? `A complete canonical development ${"wraps-with-context-".repeat(18)}`
					: `Complete canonical development ${index + 1}.`,
			scene: {
				href: `/scenes/recap-scene-${index + 1}`,
				label:
					index === 0
						? `A deliberately long canonical scene title ${"with-context-".repeat(18)}`
						: `Canonical scene ${index + 1}`,
			},
		})),
	};
}

test("frozen tracer keeps one real beat stable and only dismissal acknowledges", async ({
	page,
}) => {
	await page.clock.install();
	await page.addInitScript(
		({ worldId }) => {
			localStorage.setItem(
				"model-afterlife:last-visit:v1",
				JSON.stringify({ version: 1, worldId, throughSequence: 80 }),
			);
		},
		{ worldId: snapshot.worldId },
	);
	let updateCalls = 0;
	let recapCalls = 0;
	await page.route("**/api/world/snapshot", (route) =>
		route.fulfill({ json: snapshot }),
	);
	await page.route("**/api/world/updates?**", (route) => {
		updateCalls += 1;
		const after = afterFrom(route);
		return route.fulfill({
			json:
				updateCalls === 1 && after === 84
					? {
							schemaVersion: 1,
							fromSequence: 84,
							throughSequence: 85,
							hasMore: false,
							requiresSnapshot: false,
							updates: [updateAt85()],
						}
					: emptyUpdates(after),
		});
	});
	await page.route("**/api/recap?**", (route) => {
		recapCalls += 1;
		return route.fulfill({ json: recap });
	});

	await page.goto("/");
	await expect(
		page.getByRole("navigation", { name: "Observer", exact: true }),
	).toContainText("Live home");
	expect(
		await page.evaluate(() =>
			JSON.parse(
				localStorage.getItem("model-afterlife:last-visit:v1") ?? "{}",
			),
		),
	).toMatchObject({ throughSequence: 80 });
	await expect.poll(() => recapCalls).toBe(1);
	await expect(
		page.getByRole("heading", { name: "Since your last visit" }),
	).toBeVisible();
	await expect(page.locator(".recap-beat")).toHaveCount(1);
	await expect(
		page.getByRole("link", {
			name: "Open scene: The residents repair the brass tea timer.",
		}),
	).toHaveAttribute("href", "/scenes/recap-scene");
	await expect(page.getByRole("link", { name: "GPT-4o" })).toHaveAttribute(
		"href",
		"/residents/gpt-4o",
	);
	await expect(
		page.getByRole("heading", { name: "Current situation" }),
	).toBeVisible();

	await page.clock.fastForward(5_100);
	await expect(page.locator(".observer-shell")).toHaveAttribute(
		"data-acquisition-cursor",
		"85",
	);
	await expect(page.locator(".return-recap")).toContainText("09:42");
	await expect(page.locator(".return-recap")).not.toContainText("09:43");

	await page.getByRole("button", { name: "Review later" }).click();
	await expect(page.locator(".return-recap")).toHaveCount(0);
	await expect(
		page.getByRole("button", { name: "Since your last visit" }),
	).toBeFocused();
	expect(
		await page.evaluate(() =>
			JSON.parse(
				localStorage.getItem("model-afterlife:last-visit:v1") ?? "{}",
			),
		),
	).toMatchObject({ throughSequence: 80 });

	await page.getByRole("button", { name: "Since your last visit" }).click();
	await page
		.locator(".return-recap")
		.getByRole("button", { name: "Jump to live" })
		.click();
	expect(
		await page.evaluate(() =>
			JSON.parse(
				localStorage.getItem("model-afterlife:last-visit:v1") ?? "{}",
			),
		),
	).toMatchObject({ throughSequence: 80 });

	await page.getByRole("button", { name: "Since your last visit" }).click();
	await page.getByRole("button", { name: "Dismiss recap" }).click();
	await expect(
		page.getByRole("button", { name: "Since your last visit" }),
	).toHaveCount(0);
	expect(
		await page.evaluate(() =>
			JSON.parse(
				localStorage.getItem("model-afterlife:last-visit:v1") ?? "{}",
			),
		),
	).toMatchObject({ throughSequence: 84 });
	expect(recapCalls).toBe(1);
});

test("first, corrupt, future, and other-world visits establish a local baseline only after observation", async ({
	browser,
}) => {
	const initialValues: Array<string | null> = [
		null,
		"not-json",
		JSON.stringify({
			version: 1,
			worldId: snapshot.worldId,
			throughSequence: 999,
		}),
		JSON.stringify({
			version: 1,
			worldId: "00000000-0000-4000-8000-000000000002",
			throughSequence: 80,
		}),
	];
	for (const initialValue of initialValues) {
		const context = await browser.newContext();
		if (initialValue !== null) {
			await context.addInitScript(
				({ value }) =>
					localStorage.setItem("model-afterlife:last-visit:v1", value),
				{ value: initialValue },
			);
		}
		const visitor = await context.newPage();
		let recapCalls = 0;
		await mockWorld(visitor);
		await visitor.route("**/api/recap?**", (route) => {
			recapCalls += 1;
			return route.fulfill({ json: recap });
		});
		await visitor.goto("/");
		await expect(visitor.locator(".pixel-world")).toHaveAttribute(
			"data-through-sequence",
			"84",
		);
		await expect(
			visitor.getByRole("navigation", { name: "Observer", exact: true }),
		).toContainText("Live homeResidentsRecent scenes");
		expect(
			await visitor.evaluate(() =>
				JSON.parse(
					localStorage.getItem("model-afterlife:last-visit:v1") ?? "{}",
				),
			),
		).toEqual({
			version: 1,
			worldId: snapshot.worldId,
			throughSequence: 84,
		});
		expect(recapCalls).toBe(0);
		await expect(visitor.locator(".return-recap")).toHaveCount(0);
		await context.close();
	}
});

test("empty recap advances silently while denied storage remains non-blocking", async ({
	browser,
}) => {
	const emptyContext = await browser.newContext();
	await emptyContext.addInitScript(
		({ worldId }) =>
			localStorage.setItem(
				"model-afterlife:last-visit:v1",
				JSON.stringify({ version: 1, worldId, throughSequence: 80 }),
			),
		{ worldId: snapshot.worldId },
	);
	const emptyPage = await emptyContext.newPage();
	await mockWorld(emptyPage);
	await emptyPage.route("**/api/recap?**", (route) =>
		route.fulfill({ json: { ...recap, beats: [] } }),
	);
	await emptyPage.goto("/");
	await expect(emptyPage.locator(".pixel-world")).toHaveAttribute(
		"data-through-sequence",
		"84",
	);
	await expect(emptyPage.locator(".return-recap")).toHaveCount(0);
	expect(
		await emptyPage.evaluate(() =>
			JSON.parse(
				localStorage.getItem("model-afterlife:last-visit:v1") ?? "{}",
			),
		),
	).toMatchObject({ throughSequence: 84 });
	await emptyContext.close();

	const deniedContext = await browser.newContext();
	await deniedContext.addInitScript(() => {
		Storage.prototype.getItem = () => {
			throw new DOMException("denied");
		};
		Storage.prototype.setItem = () => {
			throw new DOMException("denied");
		};
	});
	const deniedPage = await deniedContext.newPage();
	let deniedRecapCalls = 0;
	await mockWorld(deniedPage);
	await deniedPage.route("**/api/recap?**", (route) => {
		deniedRecapCalls += 1;
		return route.fulfill({ json: recap });
	});
	await deniedPage.goto("/");
	await expect(
		deniedPage.getByRole("link", { name: "Live home" }),
	).toBeVisible();
	await expect(deniedPage.locator(".return-recap")).toHaveCount(0);
	expect(deniedRecapCalls).toBe(0);
	await deniedContext.close();
});

test("loading failure retries into a partial five-beat internally scrolling recap", async ({
	page,
}) => {
	await page.setViewportSize({ width: 375, height: 640 });
	await page.addInitScript(
		({ worldId }) =>
			localStorage.setItem(
				"model-afterlife:last-visit:v1",
				JSON.stringify({ version: 1, worldId, throughSequence: 75 }),
			),
		{ worldId: snapshot.worldId },
	);
	await mockWorld(page);
	let calls = 0;
	await page.route("**/api/recap?**", async (route) => {
		calls += 1;
		if (calls === 1) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			await route.fulfill({ status: 503, json: { error: "unavailable" } });
			return;
		}
		await route.fulfill({ json: recapWithBeats(5, true) });
	});
	await page.goto("/");
	await expect(page.getByRole("status")).toContainText("Checking what changed");
	await expect(
		page.getByText("The recap could not be loaded.", { exact: false }),
	).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Since your last visit" }),
	).toHaveCount(0);
	await page.getByRole("button", { name: "Try recap again" }).click();
	await expect(page.locator(".recap-beat")).toHaveCount(5);
	await expect(page.locator(".return-recap")).toContainText(
		"Some canonical scenes were unavailable",
	);
	await expect
		.poll(() =>
			page
				.locator(".return-recap")
				.evaluate((node) => node.scrollHeight > node.clientHeight),
		)
		.toBe(true);
	expect(
		await page.evaluate(
			() =>
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth,
		),
	).toBe(true);
	await page.locator(".return-recap a").first().focus();
	await expect(page.locator(".return-recap a").first()).toBeFocused();
	expect(calls).toBe(2);
});

test("focus and concurrent-tab acknowledgement cannot mutate an open frozen recap", async ({
	page,
}) => {
	await page.addInitScript(
		({ worldId }) =>
			localStorage.setItem(
				"model-afterlife:last-visit:v1",
				JSON.stringify({ version: 1, worldId, throughSequence: 80 }),
			),
		{ worldId: snapshot.worldId },
	);
	await mockWorld(page);
	await page.route("**/api/recap?**", (route) => route.fulfill({ json: recap }));
	await page.goto("/");
	await expect(page.locator(".recap-beat")).toHaveCount(1);
	await page.evaluate(
		({ worldId }) => {
			window.dispatchEvent(new Event("focus"));
			window.dispatchEvent(
				new StorageEvent("storage", {
					key: "model-afterlife:last-visit:v1",
					newValue: JSON.stringify({
						version: 1,
						worldId,
						throughSequence: 84,
					}),
				}),
			);
		},
		{ worldId: snapshot.worldId },
	);
	await expect(page.locator(".recap-beat")).toHaveCount(1);
	await expect(page.locator(".return-recap")).toContainText("09:42");
	await page.getByRole("button", { name: "Review later" }).click();
	await page.evaluate(
		({ worldId }) =>
			window.dispatchEvent(
				new StorageEvent("storage", {
					key: "model-afterlife:last-visit:v1",
					newValue: JSON.stringify({
						version: 1,
						worldId,
						throughSequence: 84,
					}),
				}),
			),
		{ worldId: snapshot.worldId },
	);
	await expect(
		page.getByRole("button", { name: "Since your last visit" }),
	).toHaveCount(0);
});

test("opening a canonical scene follows a real link without acknowledging", async ({
	page,
}) => {
	await page.addInitScript(
		({ worldId }) => {
			if (localStorage.getItem("model-afterlife:last-visit:v1") === null) {
				localStorage.setItem(
					"model-afterlife:last-visit:v1",
					JSON.stringify({ version: 1, worldId, throughSequence: 80 }),
				);
			}
		},
		{ worldId: snapshot.worldId },
	);
	await mockWorld(page);
	await page.route("**/api/recap?**", (route) => route.fulfill({ json: recap }));
	await page.route("**/scenes/recap-scene", (route) =>
		route.fulfill({
			contentType: "text/html",
			body: "<main><h1>Canonical recap scene</h1></main>",
		}),
	);
	await page.goto("/");
	await page
		.getByRole("link", {
			name: "Open scene: The residents repair the brass tea timer.",
		})
		.click();
	await expect(page).toHaveURL(/\/scenes\/recap-scene$/u);
	await expect(
		page.getByRole("heading", { name: "Canonical recap scene" }),
	).toBeVisible();
	expect(
		await page.evaluate(() =>
			JSON.parse(
				localStorage.getItem("model-afterlife:last-visit:v1") ?? "{}",
			),
		),
	).toMatchObject({ throughSequence: 80 });
});
