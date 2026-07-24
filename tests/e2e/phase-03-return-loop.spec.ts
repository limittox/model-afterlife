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
