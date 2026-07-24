import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import type {
	PublicResidentDirectoryEntry,
	ResidentDirectoryResult,
} from "../../src/features/publication/contracts/public-publication.ts";

const RESIDENT_IDS = [
	"gpt-4o",
	"claude-sonnet-4.5",
	"gemini-2.5-pro",
	"deepseek-v3.2",
	"llama-3.3-70b-instruct",
	"qwen3-235b-a22b-2507",
] as const;

function entry(
	index: number,
	portraitVariantId: string | null = `portrait-${index}`,
): PublicResidentDirectoryEntry {
	const residentId = RESIDENT_IDS[index - 1] ?? "gpt-4o";
	return {
		residentId,
		displayOrder: index,
		displayName:
			index === 6
				? "Qwen3 235B A22B Instruct 2507 with a deliberately long archive name"
				: `Resident ${index}`,
		role: `Distinct role ${index}`,
		significance:
			index === 1
				? "A deliberately long reviewed significance statement that must wrap naturally without clipping its exact historical meaning or forcing horizontal page scrolling."
				: `Reviewed significance ${index}`,
		portraitVariantId,
		exactModelIds: [`provider/exact-model-${index}`],
		profilePath: `/residents/${residentId}`,
	};
}

async function showDirectoryState(
	page: Page,
	result: ResidentDirectoryResult,
): Promise<void> {
	const executable = path.resolve(
		"node_modules",
		".bin",
		process.platform === "win32" ? "tsx.CMD" : "tsx",
	);
	const env = {
		...process.env,
		RESIDENT_DIRECTORY_STATE: JSON.stringify(result),
	};
	const markup =
		process.platform === "win32"
			? execFileSync(
					"cmd.exe",
					[
						"/d",
						"/s",
						"/c",
						`${executable} tests/fixtures/render-resident-directory.tsx`,
					],
					{ cwd: process.cwd(), encoding: "utf8", env },
				)
			: execFileSync(
					executable,
					["tests/fixtures/render-resident-directory.tsx"],
					{ cwd: process.cwd(), encoding: "utf8", env },
				);
	await page.setContent(
		`<style>
			:root{--color-border:#465066;--color-secondary:#272f40;--color-dominant:#171b26;--space-lg:24px}
			body{margin:0;overflow-wrap:anywhere}
		</style>${markup}`,
	);
}

test("resident directory publishes exactly six profiles in fixed order and responsive columns", async ({
	page,
}) => {
	await page.goto("/residents");
	const cards = page.locator("[data-resident-id]");
	await expect(cards).toHaveCount(6);
	expect(
		await cards.evaluateAll((items) =>
			items.map((item) => item.getAttribute("data-resident-id")),
		),
	).toEqual(
		RESIDENT_IDS,
	);
	await expect(
		page.getByRole("link", { name: "View resident profile" }),
	).toHaveCount(6);

	await page.setViewportSize({ width: 1280, height: 720 });
	await expect(cards.first()).toBeVisible();
	expect(
		await cards.evaluateAll((items) => new Set(items.map((item) => item.getBoundingClientRect().top)).size),
	).toBe(2);
	await page.setViewportSize({ width: 800, height: 720 });
	expect(
		await cards.evaluateAll((items) => new Set(items.map((item) => item.getBoundingClientRect().top)).size),
	).toBe(3);
	await page.setViewportSize({ width: 375, height: 720 });
	expect(
		await cards.evaluateAll((items) => new Set(items.map((item) => item.getBoundingClientRect().top)).size),
	).toBe(6);
	expect(
		await page.evaluate(
			() =>
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth,
		),
	).toBe(true);
});

test("all six stable routes keep history, fiction, sources, and relationships semantically distinct", async ({
	page,
}) => {
	for (const residentId of RESIDENT_IDS) {
		await page.goto(`/residents/${residentId}`);
		await expect(
			page.getByRole("heading", { name: "Real-world significance" }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Fictional character behaviors" }),
		).toBeVisible();
		const disclosure = page.locator("details").first();
		await disclosure.locator("summary").focus();
		await page.keyboard.press("Enter");
		await expect(disclosure).toHaveAttribute("open", "");
		for (const heading of [
			"The joke",
			"Historical inspiration",
			"Fictional exaggeration",
			"Uncertainty and scope",
			"Sources",
		]) {
			await expect(
				disclosure.getByRole("heading", { name: heading }),
			).toBeVisible();
		}
		await expect(
			page
				.getByText("No recent relationship change is available.")
				.or(page.getByRole("link", { name: /Open the cause scene:/u })),
		).toBeVisible();
		await expect(page.getByText("Exact model identity:", { exact: false })).toBeVisible();
		await expect(page.locator('a[href^="https://"]').first()).toBeVisible();
		expect(
			await page.evaluate(
				() =>
					!document.body.innerText.match(
						/\brelationship score\b|\braw delta\b|\baffinity meter\b|\bprovider response\b/iu,
					),
			),
		).toBe(true);
	}

	await page.goto("/residents/not-a-launch-resident");
	await expect(
		page.getByRole("heading", { name: "Resident profile not found" }),
	).toBeVisible();
});

test("profiles remain readable without CSS and preserve document heading order", async ({
	page,
}) => {
	await page.goto("/residents/qwen3-235b-a22b-2507");
	await page.evaluate(() => {
		for (const stylesheet of document.querySelectorAll(
			'style, link[rel="stylesheet"]',
		)) {
			stylesheet.remove();
		}
	});
	const headings = await page
		.locator("h1, h2")
		.allTextContents();
	expect(headings.slice(0, 7)).toEqual([
		"Qwen3 235B A22B Instruct 2507",
		"Life in the home",
		"Real-world significance",
		"Lineage",
		"Architecture and capabilities",
		"Documented limitations and scope",
		"Why this resident is here",
	]);
	await expect(page.getByText("Exact model identity:", { exact: false })).toBeVisible();
	await expect(page.locator('a[href^="https://"]').first()).toBeVisible();
});

test("directory states use six quiet loading frames and fail closed for incomplete data", async ({
	page,
}) => {
	await showDirectoryState(page, { kind: "loading" });
	await expect(page.getByRole("status")).toContainText(
		"Opening resident profiles",
	);
	await expect(page.locator("[data-resident-loading-frame]")).toHaveCount(6);
	await expect(page.locator("[data-resident-id]")).toHaveCount(0);

	await showDirectoryState(page, { kind: "error" });
	await expect(
		page.getByRole("heading", { name: "Resident profiles are unavailable" }),
	).toBeVisible();
	await expect(page.locator("[data-resident-id]")).toHaveCount(0);

	await showDirectoryState(page, {
		kind: "ready",
		residents: Array.from({ length: 6 }, (_, index) =>
			entry(index + 1, index === 0 ? null : `portrait-${index + 1}`),
		),
	});
	await expect(page.locator("[data-resident-id]")).toHaveCount(6);
	await expect(
		page.getByRole("img", { name: "Portrait unavailable for Resident 1" }),
	).toBeVisible();
	await page.setViewportSize({ width: 360, height: 720 });
	expect(
		await page.evaluate(
			() =>
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth,
		),
	).toBe(true);
});
