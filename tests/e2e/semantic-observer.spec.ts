import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page, type Route } from "@playwright/test";
import type {
	PublicWorldSnapshot,
	PublicWorldUpdate,
} from "../../src/features/world/contracts/public-world.ts";
import {
	activeSceneState,
	longTextState,
	overflowState,
	quietState,
	sceneUnavailableState,
} from "../../src/features/world/fixtures/ui-states.ts";

const activeSnapshot = activeSceneState.snapshot as PublicWorldSnapshot;
const quietSnapshot = quietState.snapshot as PublicWorldSnapshot;
const unavailableSnapshot =
	sceneUnavailableState.snapshot as PublicWorldSnapshot;
const overflowSnapshot = overflowState.snapshot as PublicWorldSnapshot;
const longSnapshot = longTextState.snapshot as PublicWorldSnapshot;

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

function updateFor(snapshot: PublicWorldSnapshot): PublicWorldUpdate {
	return {
		schemaVersion: 1,
		sequence: snapshot.throughSequence,
		logicalTick: snapshot.logicalTick,
		stateHash: snapshot.stateHash,
		snapshot,
	};
}

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

async function mockWorld(
	page: Page,
	options: {
		snapshots?: PublicWorldSnapshot[];
		onSnapshot?: (route: Route, call: number) => Promise<void>;
		onUpdates?: (route: Route, call: number) => Promise<void>;
	} = {},
) {
	let snapshotCall = 0;
	let updatesCall = 0;
	const snapshots = options.snapshots ?? [activeSnapshot];

	await page.route("**/api/world/snapshot", async (route) => {
		snapshotCall += 1;
		if (options.onSnapshot) {
			await options.onSnapshot(route, snapshotCall);
			return;
		}
		const selected =
			snapshots[Math.min(snapshotCall - 1, snapshots.length - 1)];
		await route.fulfill({ json: selected });
	});

	await page.route("**/api/world/updates?**", async (route) => {
		updatesCall += 1;
		if (options.onUpdates) {
			await options.onUpdates(route, updatesCall);
			return;
		}
		await route.fulfill({ json: emptyUpdates(afterFrom(route)) });
	});

	return {
		snapshotCalls: () => snapshotCall,
		updatesCalls: () => updatesCall,
	};
}

async function openSnapshot(page: Page, snapshot = activeSnapshot) {
	await mockWorld(page, { snapshots: [snapshot] });
	await page.goto("/");
	await expect(
		page.getByRole("heading", { name: "Model Afterlife" }),
	).toBeVisible();
	await expect(page.locator(".state-badge")).toContainText("Live");
}

async function openHardError(page: Page) {
	await mockWorld(page, {
		onSnapshot: async (route) => {
			await route.fulfill({ status: 503, json: { error: "unavailable" } });
		},
	});
	await page.goto("/");
	await expect(page.locator('.connection-error[role="alert"]')).toContainText(
		"The home couldn’t load. Try loading again.",
	);
}

async function openCachedError(page: Page, snapshot = activeSnapshot) {
	await mockWorld(page, {
		snapshots: [snapshot],
		onUpdates: async (route) => {
			await route.fulfill({ status: 503, json: { error: "unavailable" } });
		},
	});
	await page.goto("/");
	await expect(
		page.getByText("The live feed is having trouble.", { exact: false }),
	).toBeVisible();
}

test.describe("semantic observer UI consideration matrix", () => {
	test("HomeStatusStrip loading uses em dashes and Opening the home copy", async ({
		page,
	}) => {
		await mockWorld(page, {
			onSnapshot: async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 1_500));
				await route.fulfill({ json: activeSnapshot });
			},
		});
		await page.goto("/");
		await expect(page.getByText("Opening the home…").first()).toBeVisible();
		await expect(page.locator(".home-status-values")).toContainText("—");
	});

	test("HomeStatusStrip cached error retains time and explicit reconnecting state", async ({
		page,
	}) => {
		await openCachedError(page);
		await expect(page.locator(".status-clock")).toContainText(
			activeSnapshot.homeTime,
		);
		await expect(page.locator(".state-badge")).toHaveText("Reconnecting");
	});

	test("HomeStatusStrip overflow preserves wordmark and badge while location absorbs width", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1024, height: 720 });
		await openSnapshot(page, longSnapshot);
		await expect(
			page.getByRole("heading", { name: "Model Afterlife" }),
		).toBeVisible();
		await expect(page.locator(".state-badge")).toBeVisible();
		const location = page.locator(".status-location-value");
		await expect(location).toHaveAttribute("title", longSnapshot.rooms[0].name);
		await expect(location).toHaveCSS("text-overflow", "ellipsis");
	});

	test("HomeStatusStrip long location retains its full accessible name and tooltip", async ({
		page,
	}) => {
		await openSnapshot(page, longSnapshot);
		const name = longSnapshot.rooms[0].name;
		await expect(page.getByRole("button", { name })).toHaveAttribute(
			"title",
			name,
		);
	});

	test("PixelWorldViewport empty state is a semantic home fallback", async ({
		page,
	}) => {
		await openHardError(page);
		await expect(page.getByRole("region", { name: "Home view" })).toContainText(
			"The shared home will appear here when it is ready.",
		);
	});

	test("PixelWorldViewport loading shows a static silhouette without fabricated dialogue", async ({
		page,
	}) => {
		await mockWorld(page, {
			onSnapshot: async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 1_500));
				await route.fulfill({ json: activeSnapshot });
			},
		});
		await page.goto("/");
		await expect(page.locator(".home-silhouette span")).toHaveCount(4);
		await expect(page.locator(".dialogue-turn")).toHaveCount(0);
	});

	test("PixelWorldViewport error keeps cached world and hard failure exposes retry", async ({
		page,
	}) => {
		await openCachedError(page);
		await expect(
			page.getByText("A compact home, quietly carrying on"),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Try loading again" }),
		).toBeVisible();
	});

	test("PixelWorldViewport populated state exposes rooms residents and one primary scene", async ({
		page,
	}) => {
		await openSnapshot(page);
		for (const room of activeSnapshot.rooms) {
			await expect(
				page.getByRole("region", { name: new RegExp(room.name) }),
			).toBeVisible();
		}
		await expect(
			page.getByRole("button", { name: /Follow The Former Giant/ }),
		).toBeVisible();
		await expect(page.getByText("one primary scene")).toBeVisible();
	});

	test("SceneRail empty state shows the approved quiet heading and body", async ({
		page,
	}) => {
		await openSnapshot(page, quietSnapshot);
		await expect(
			page.getByRole("heading", { name: "The home is quiet" }),
		).toBeVisible();
		await expect(
			page.getByText("No scene is playing.", { exact: false }),
		).toBeVisible();
	});

	test("SceneRail loading reserves space and creates no dialogue", async ({
		page,
	}) => {
		await mockWorld(page, {
			onSnapshot: async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 1_500));
				await route.fulfill({ json: activeSnapshot });
			},
		});
		await page.goto("/");
		await expect(page.locator(".scene-space")).toBeVisible();
		await expect(page.locator(".dialogue-turn")).toHaveCount(0);
	});

	test("SceneRail error shows approved unavailable copy", async ({ page }) => {
		await openSnapshot(page, unavailableSnapshot);
		await expect(
			page.getByText(
				"This scene is unavailable. The home is continuing with quiet routines.",
			),
		).toBeVisible();
	});

	test("SceneRail populated state shows premise speakers progress and complete transcript", async ({
		page,
	}) => {
		await openSnapshot(page);
		await expect(
			page.getByRole("heading", { name: activeSnapshot.scene?.premise }),
		).toBeVisible();
		await expect(page.locator(".scene-speakers")).toContainText(
			"The Former Giant",
		);
		await expect(page.locator(".scene-progress")).toContainText("1 of 6 turns");
	});

	test("SceneRail partial scene is withheld and prior complete presentation remains", async ({
		page,
	}) => {
		const partial = structuredClone(activeSnapshot);
		if (!partial.scene) throw new Error("Active fixture requires a scene.");
		partial.scene.turns = partial.scene.turns.slice(0, 3);
		partial.scene.turns[2].text = "PARTIAL TURN MUST NEVER APPEAR";
		await mockWorld(page, { snapshots: [activeSnapshot, partial] });
		await page.goto("/");
		await expect(page.locator(".dialogue-turn")).toHaveCount(6);
		await page.evaluate(() => window.dispatchEvent(new Event("focus")));
		await expect(
			page.getByText("The live feed is having trouble.", { exact: false }),
		).toBeVisible();
		await expect(page.locator(".dialogue-turn")).toHaveCount(6);
		await expect(page.getByText("PARTIAL TURN MUST NEVER APPEAR")).toHaveCount(
			0,
		);
	});

	test("SceneRail overflow scrolls transcript while premise and actions stay visible", async ({
		page,
	}) => {
		await openSnapshot(page, overflowSnapshot);
		const transcript = page.locator(".dialogue-transcript");
		await expect
			.poll(() =>
				transcript.evaluate((node) => node.scrollHeight > node.clientHeight),
			)
			.toBe(true);
		await expect(page.locator(".scene-card")).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Pause presentation" }),
		).toBeVisible();
	});

	test("SceneRail zero one many contract exposes either quiet or one singular current scene", async ({
		page,
	}) => {
		await openSnapshot(page);
		await expect(
			page.getByRole("complementary", { name: "Current scene" }),
		).toHaveCount(1);
		await expect(page.locator(".scene-card")).toHaveCount(1);
	});

	test("SceneRail long text wraps without clipping complete dialogue", async ({
		page,
	}) => {
		await openSnapshot(page, longSnapshot);
		await expect(page.locator(".scene-card h2")).toHaveCSS(
			"overflow-wrap",
			"anywhere",
		);
		await expect(page.locator(".dialogue-turn").last()).toContainText(
			"natural wrapping",
		);
	});

	test("DialogueTranscript empty state renders no empty bordered list", async ({
		page,
	}) => {
		await openSnapshot(page, quietSnapshot);
		await expect(page.locator(".dialogue-transcript")).toHaveCount(0);
	});

	test("DialogueTranscript loading fabricates no turn rows", async ({
		page,
	}) => {
		await mockWorld(page, {
			onSnapshot: async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 1_500));
				await route.fulfill({ json: activeSnapshot });
			},
		});
		await page.goto("/");
		await expect(page.locator(".dialogue-turn")).toHaveCount(0);
	});

	test("DialogueTranscript error creates no partial list", async ({ page }) => {
		await openSnapshot(page, unavailableSnapshot);
		await expect(page.locator(".dialogue-transcript")).toHaveCount(0);
	});

	test("DialogueTranscript populated state preserves six ordered speaker-labelled turns", async ({
		page,
	}) => {
		await openSnapshot(page);
		const turns = page.locator(".dialogue-turn");
		await expect(turns).toHaveCount(6);
		await expect(turns.first()).toContainText("The Former Giant");
		await expect(turns.nth(1)).toContainText("The Masked Encoder");
	});

	test("scene turns advance over configured time while Pause freezes playback", async ({
		page,
	}) => {
		await page.clock.install();
		await openSnapshot(page, activeSnapshot);
		const currentTurn = page.locator('.dialogue-turn[aria-current="true"]');

		await expect(currentTurn).toContainText("In my day");
		await page.clock.fastForward(7_600);
		await expect(currentTurn).toContainText("preferred seeing both sides");

		await page.getByRole("button", { name: "Pause presentation" }).click();
		await page.clock.fastForward(15_000);
		await expect(currentTurn).toContainText("preferred seeing both sides");

		await page.getByRole("button", { name: "Resume presentation" }).click();
		await page.clock.fastForward(7_600);
		await expect(currentTurn).toContainText("discovered confidence");
	});

	test("DialogueTranscript partial content never replaces complete rows", async ({
		page,
	}) => {
		const partial = structuredClone(activeSnapshot);
		if (!partial.scene) throw new Error("Active fixture requires a scene.");
		partial.scene.turns = partial.scene.turns.slice(0, 3);
		await mockWorld(page, { snapshots: [activeSnapshot, partial] });
		await page.goto("/");
		await page.evaluate(() => window.dispatchEvent(new Event("focus")));
		await expect(page.locator(".dialogue-turn")).toHaveCount(6);
	});

	test("DialogueTranscript overflow keeps a programmatic current turn", async ({
		page,
	}) => {
		await openSnapshot(page, overflowSnapshot);
		await expect(
			page.locator('.dialogue-turn[aria-current="true"]'),
		).toHaveCount(1);
		await expect(
			page.locator('.dialogue-turn[aria-current="true"]'),
		).toContainText("In my day");
		await expect(page.locator(".dialogue-transcript")).toHaveCSS(
			"overflow-y",
			"auto",
		);
	});

	test("DialogueTranscript zero one many rows keep consistent list semantics", async ({
		page,
	}) => {
		await openSnapshot(page);
		const transcript = page.getByRole("list", {
			name: "Complete scene transcript",
		});
		await expect(transcript.getByRole("listitem")).toHaveCount(6);
		await expect(transcript.locator(".speaker-name")).toHaveCount(6);
	});

	test("DialogueTranscript long text survives effective 200 percent zoom without page overflow", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 512, height: 720 });
		await openSnapshot(page, longSnapshot);
		await expect(page.locator(".dialogue-turn").last()).toContainText(
			"semantic reading order",
		);
		expect(
			await page.evaluate(
				() =>
					document.documentElement.scrollWidth <=
					document.documentElement.clientWidth,
			),
		).toBe(true);
	});

	test("ObserverControlDock loading disables world-dependent actions with a reason", async ({
		page,
	}) => {
		await mockWorld(page, {
			onSnapshot: async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 1_500));
				await route.fulfill({ json: activeSnapshot });
			},
		});
		await page.goto("/");
		const pause = page.getByRole("button", { name: "Pause presentation" });
		await expect(pause).toBeDisabled();
		await expect(pause).toHaveAttribute(
			"aria-describedby",
			"control-disabled-reason",
		);
	});

	test("ObserverControlDock cached error keeps camera actions usable and scene action disabled", async ({
		page,
	}) => {
		await openCachedError(page);
		await expect(page.getByRole("button", { name: "Zoom in" })).toBeEnabled();
		await expect(
			page.getByRole("button", { name: "Reset view" }),
		).toBeEnabled();
		await expect(
			page.getByRole("button", { name: "Pause presentation" }),
		).toBeDisabled();
	});

	test("ObserverControlDock overflow remains one row with named controls", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1024, height: 720 });
		await openSnapshot(page);
		const dock = page.getByRole("navigation", { name: "Observer controls" });
		await expect(dock).toBeVisible();
		await expect(page.getByRole("button", { name: "Zoom in" })).toBeVisible();
		await expect(
			page.getByRole("button", { name: "Jump to live" }),
		).toBeVisible();
		expect(await dock.evaluate((node) => getComputedStyle(node).flexWrap)).toBe(
			"nowrap",
		);
	});

	test("ObserverControlDock long followed name ellipsizes with full label and tooltip", async ({
		page,
	}) => {
		await openSnapshot(page, longSnapshot);
		const name = longSnapshot.residents[0].name;
		const followButton = page.getByRole("button", { name: `Follow ${name}` });
		await followButton.focus();
		await followButton.press("Enter");
		const chip = page.getByRole("button", { name: `Stop following ${name}` });
		await expect(chip).toHaveAttribute("title", `Stop following ${name}`);
		await expect(chip.locator(".focus-chip-name")).toHaveCSS(
			"text-overflow",
			"ellipsis",
		);
	});

	test("ConnectionBanner overflow wraps without clipping retry", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1024, height: 640 });
		await openCachedError(page);
		const banner = page.locator(".connection-banner");
		await expect(banner).toBeVisible();
		await expect(
			banner.getByRole("button", { name: "Try loading again" }),
		).toBeVisible();
		expect(
			await banner.evaluate((node) => node.scrollWidth <= node.clientWidth),
		).toBe(true);
	});

	test("ConnectionBanner long recovery copy never ellipsizes and retry stays focusable", async ({
		page,
	}) => {
		await openCachedError(page);
		const copy = page.locator(".connection-banner p");
		await expect(copy).toHaveCSS("text-overflow", "clip");
		await page.locator(".connection-banner button").focus();
		await expect(page.locator(".connection-banner button")).toBeFocused();
	});
});

test.describe("local playback and recovery", () => {
	test("camera dock follows, manually unfollows, clamps integer zoom, and resets locally", async ({
		page,
	}) => {
		await openSnapshot(page, activeSnapshot);
		const resident = activeSnapshot.residents[0];
		const world = page.locator(".pixel-world");
		const canvas = page.locator(".phaser-world-host canvas");
		const canonicalHash = await world.getAttribute("data-state-hash");
		const follow = page.getByRole("button", {
			name: `Follow ${resident.name}`,
		});

		await follow.focus();
		await follow.press("Enter");
		await expect(
			page.getByRole("button", {
				name: `Stop following ${resident.name}`,
			}),
		).toBeVisible();
		await expect(canvas).toHaveAttribute("data-camera-zoom", "2");

		await page.getByRole("button", { name: "Pan right" }).click();
		await expect(
			page.getByRole("button", {
				name: `Stop following ${resident.name}`,
			}),
		).toHaveCount(0);
		await expect(page.locator("[aria-live='polite']")).toContainText(
			`Stopped following ${resident.name}`,
		);

		await page.getByRole("button", { name: "Zoom in" }).click();
		await expect(canvas).toHaveAttribute("data-camera-zoom", "3");
		await page.getByRole("button", { name: "Reset view" }).click();
		await expect(canvas).toHaveAttribute("data-camera-zoom", "1");
		await expect(canvas).toHaveAttribute("data-camera-x", "176");
		await expect(canvas).toHaveAttribute("data-camera-y", "128");
		await expect(world).toHaveAttribute("data-state-hash", canonicalHash ?? "");
	});

	test("Pause continues acquisition and Resume advances from the paused presentation", async ({
		page,
	}) => {
		await page.clock.install();
		const live = snapshotAt(activeSnapshot, 84);
		const next = snapshotAt(quietSnapshot, 85);
		await mockWorld(page, {
			snapshots: [live],
			onUpdates: async (route, call) => {
				const after = afterFrom(route);
				await route.fulfill({
					json:
						call === 1 || after !== 84
							? emptyUpdates(after)
							: {
									schemaVersion: 1,
									fromSequence: 84,
									throughSequence: 85,
									hasMore: false,
									requiresSnapshot: false,
									updates: [updateFor(next)],
								},
				});
			},
		});
		await page.goto("/");
		await expect(page.locator(".dialogue-turn")).toHaveCount(6);
		await page.getByRole("button", { name: "Pause presentation" }).click();
		await page.clock.fastForward(6_000);
		await expect(page.locator(".dialogue-turn")).toHaveCount(6);
		await page.getByRole("button", { name: "Resume presentation" }).click();
		await page.clock.fastForward(1_000);
		await expect(
			page.getByRole("heading", { name: "The home is quiet" }),
		).toBeVisible();
	});

	test("Jump to live replaces presentation from a fresh world and announces catch-up", async ({
		page,
	}) => {
		await mockWorld(page, { snapshots: [activeSnapshot, quietSnapshot] });
		await page.goto("/");
		await page.getByRole("button", { name: "Pause presentation" }).click();
		await page.getByRole("button", { name: "Jump to live" }).click();
		await expect(page.getByText("Caught up to live")).toBeAttached();
		await expect(
			page.getByRole("heading", { name: "The home is quiet" }),
		).toBeVisible();
	});

	test("sequence gap requests and installs a fresh world", async ({ page }) => {
		await mockWorld(page, {
			snapshots: [activeSnapshot, quietSnapshot],
			onUpdates: async (route) => {
				const after = afterFrom(route);
				await route.fulfill({
					json: {
						...emptyUpdates(after),
						requiresSnapshot: true,
					},
				});
			},
		});
		await page.goto("/");
		await expect(
			page.getByRole("heading", { name: "The home is quiet" }),
		).toBeVisible();
		await expect(page.getByText("Caught up to live")).toBeAttached();
	});

	test("focus return replaces from a fresh world without movement replay", async ({
		page,
	}) => {
		const routes = await mockWorld(page, {
			snapshots: [activeSnapshot, quietSnapshot],
		});
		await page.goto("/");
		await expect(page.locator(".dialogue-turn")).toHaveCount(6);
		await page.evaluate(() => window.dispatchEvent(new Event("focus")));
		await expect(
			page.getByRole("heading", { name: "The home is quiet" }),
		).toBeVisible();
		await expect.poll(routes.snapshotCalls).toBeGreaterThan(1);
	});

	test("reconnect replaces from a fresh world without movement replay", async ({
		page,
	}) => {
		const routes = await mockWorld(page, {
			snapshots: [activeSnapshot, quietSnapshot],
		});
		await page.goto("/");
		await expect(page.locator(".dialogue-turn")).toHaveCount(6);
		await page.evaluate(() => window.dispatchEvent(new Event("online")));
		await expect(
			page.getByRole("heading", { name: "The home is quiet" }),
		).toBeVisible();
		await expect.poll(routes.snapshotCalls).toBeGreaterThan(1);
	});

	test("hard failure retry installs the first valid world", async ({
		page,
	}) => {
		await mockWorld(page, {
			onSnapshot: async (route, call) => {
				if (call <= 3) {
					await route.fulfill({ status: 503, json: { error: "unavailable" } });
					return;
				}
				await route.fulfill({ json: activeSnapshot });
			},
		});
		await page.goto("/");
		await expect(page.locator('.connection-error[role="alert"]')).toBeVisible();
		await page.getByRole("button", { name: "Try loading again" }).click();
		await expect(page.locator(".state-badge")).toHaveText("Live");
	});

	test("keyboard order reaches status world scene and observer controls with visible focus", async ({
		page,
	}) => {
		await openSnapshot(page);
		const status = page.locator(".status-location-value");
		const world = page.locator(".world-keyboard-target");
		const scene = page.locator(".scene-focus-target");
		const controls = page.getByRole("button", { name: "Zoom out" });
		expect(
			await page.evaluate(() => {
				const statusNode = document.querySelector(".status-location-value");
				const worldNode = document.querySelector(".world-keyboard-target");
				const sceneNode = document.querySelector(".scene-focus-target");
				const dockNode = document.querySelector(
					".observer-control-dock button",
				);
				if (!statusNode || !worldNode || !sceneNode || !dockNode) return false;
				return (
					Boolean(
						statusNode.compareDocumentPosition(worldNode) &
							Node.DOCUMENT_POSITION_FOLLOWING,
					) &&
					Boolean(
						worldNode.compareDocumentPosition(sceneNode) &
							Node.DOCUMENT_POSITION_FOLLOWING,
					) &&
					Boolean(
						sceneNode.compareDocumentPosition(dockNode) &
							Node.DOCUMENT_POSITION_FOLLOWING,
					)
				);
			}),
		).toBe(true);
		await page.keyboard.press("Tab");
		await expect(status).toBeFocused();
		await page.keyboard.press("Tab");
		await expect(world).toBeFocused();
		await scene.focus();
		await expect(scene).toBeFocused();
		await controls.focus();
		await expect(controls).toBeFocused();
		await expect(controls).toHaveCSS("outline-style", "solid");
	});

	test("observer presentation source issues GET requests only and exposes no canonical write", async () => {
		const clientDirectory = path.resolve("src/features/world/client");
		const source = await Promise.all(
			["WorldObserver.tsx", "use-world-feed.ts"].map(
				(file) => readFile(path.join(clientDirectory, file), "utf8"),
			),
		);
		const combined = source.join("\n");
		expect(combined).not.toMatch(/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/);
		expect(combined).not.toMatch(/\/api\/world\/(?:advance|mutate|write)/);
		expect(combined).not.toContain("dangerouslySetInnerHTML");
	});
});
