import { execFileSync } from "node:child_process";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { expect, test, type Page } from "@playwright/test";
import { runBackfill } from "../../scripts/backfill-scene-claim-versions.ts";
import { createWorldDatabase } from "../../src/db/client.ts";
import {
	generationAttempts,
	generationTurns,
	publishedSceneClaimVersions,
	publishedSceneRevisions,
	sceneBriefs,
	sceneValidationResults,
	worldEvents,
	worldProjection,
} from "../../src/db/schema.ts";
import type {
	RecentSceneArchiveEntry,
	RecentSceneArchiveResult,
} from "../../src/features/publication/server/read-recent-scenes.ts";
import type { PublicWorldSnapshot } from "../../src/features/world/contracts/public-world.ts";
import type { WorldState } from "../../src/features/world/domain/types.ts";
import {
	type GenerationAttempt,
	type ResidentTurn,
	SceneBriefSchema,
} from "../../src/features/world/generation/contracts.ts";
import { validateSceneCandidate } from "../../src/features/world/generation/validate-scene-candidate.ts";
import { persistGenerationAttempt } from "../../src/features/world/server/persist-generation-attempt.ts";
import { publishSceneRevision } from "../../src/features/world/server/publish-scene-revision.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";
import {
	approvedSemanticGateFixture,
	buildValidSceneCandidate,
} from "../fixtures/scene-candidate.ts";

const SCENE_KEY = "phase3-e2e-legacy-scene";
const ATTEMPT_ID = `${SCENE_KEY}:attempt`;
const REVISION_ID = `${SCENE_KEY}:revision`;
const CLAIM_ID = "gpt4o-native-multimodal";
const OCCURRENCE_KEYS = [
	`scene-published:${SCENE_KEY}`,
	`shared-experience:${REVISION_ID}`,
];

let originalProjection:
	| {
			logicalTick: number;
			throughSequence: number;
			projection: PublicWorldSnapshot;
			state: WorldState;
			stateHash: string;
			updatedAt: Date;
	  }
	| undefined;

async function publishLegacyScene(): Promise<void> {
	const connection = createWorldDatabase();
	try {
		const [projection] = await connection.db
			.select({
				logicalTick: worldProjection.logicalTick,
				throughSequence: worldProjection.throughSequence,
				projection: worldProjection.projection,
				state: worldProjection.state,
				stateHash: worldProjection.stateHash,
				updatedAt: worldProjection.updatedAt,
			})
			.from(worldProjection)
			.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID))
			.limit(1);
		if (!projection) throw new Error("Canonical browser projection unavailable.");
		originalProjection = projection;
		const base = buildValidSceneCandidate();
		const brief = SceneBriefSchema.parse({
			...base.brief,
			briefId: `${SCENE_KEY}:brief`,
			sceneKey: SCENE_KEY,
			expectedWorldHead: projection.throughSequence,
			allowedFactIds: [CLAIM_ID],
		});
		const attempt: GenerationAttempt = {
			...base.attempt,
			attemptId: ATTEMPT_ID,
			sceneKey: SCENE_KEY,
		};
		const turns: ResidentTurn[] = base.turns.map((turn, turnIndex) => ({
			...turn,
			approvedClaimIds: turnIndex === 0 ? [CLAIM_ID] : [],
		}));
		const validation = validateSceneCandidate({
			brief,
			attempt,
			turns,
			revisionId: REVISION_ID,
			semanticGateEvidence: approvedSemanticGateFixture(),
		});
		if (!validation.acceptedCandidate) {
			throw new Error("Reviewed browser fixture did not pass publication.");
		}
		await persistGenerationAttempt({
			worldId: CANONICAL_WORLD_ID,
			brief,
			attempt,
			turns,
			result: validation.result,
			validatorResults: validation.manifest.results,
		});
		await publishSceneRevision(
			CANONICAL_WORLD_ID,
			validation.acceptedCandidate,
		);
		await connection.db
			.delete(publishedSceneClaimVersions)
			.where(eq(publishedSceneClaimVersions.revisionId, REVISION_ID));
	} finally {
		await connection.close();
	}
	const dryRun = await runBackfill("--dry-run");
	if (
		dryRun.unresolved !== 0 ||
		dryRun.ambiguous !== 0 ||
		dryRun.pending !== 1
	) {
		throw new Error(`Unexpected browser dry-run: ${JSON.stringify(dryRun)}`);
	}
	await runBackfill("--apply");
	const check = await runBackfill("--check");
	if (check.unresolved !== 0 || check.ambiguous !== 0) {
		throw new Error(`Browser evidence check failed: ${JSON.stringify(check)}`);
	}
}

async function cleanupLegacyScene(): Promise<void> {
	const { db, close } = createWorldDatabase();
	try {
		await db
			.delete(publishedSceneClaimVersions)
			.where(eq(publishedSceneClaimVersions.revisionId, REVISION_ID));
		await db
			.delete(publishedSceneRevisions)
			.where(eq(publishedSceneRevisions.revisionId, REVISION_ID));
		await db
			.delete(sceneValidationResults)
			.where(eq(sceneValidationResults.attemptId, ATTEMPT_ID));
		await db
			.delete(generationTurns)
			.where(eq(generationTurns.attemptId, ATTEMPT_ID));
		await db
			.delete(generationAttempts)
			.where(eq(generationAttempts.attemptId, ATTEMPT_ID));
		await db.delete(sceneBriefs).where(eq(sceneBriefs.sceneKey, SCENE_KEY));
		await db
			.delete(worldEvents)
			.where(inArray(worldEvents.occurrenceKey, OCCURRENCE_KEYS));
		if (originalProjection) {
			await db
				.update(worldProjection)
				.set(originalProjection)
				.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID));
		}
	} finally {
		await close();
	}
}

function archiveEntry(index: number, homeDay = 1): RecentSceneArchiveEntry {
	const suffix = String(index).padStart(2, "0");
	return {
		revisionId: `browser-revision-${suffix}`,
		canonicalHref: `/scenes/browser-revision-${suffix}`,
		publicationSequence: index,
		title:
			index === 1
				? "A deliberately long canonical scene title that must wrap naturally without hiding any of its meaning in the archive"
				: `Canonical scene ${suffix}`,
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
		location: "Tea Nook",
		homeDay,
		homeTime: "09:01",
		dayPeriod: "morning",
		premise: `Canonical scene ${suffix}`,
		transcriptDestination: `/scenes/browser-revision-${suffix}`,
		outcome:
			"The residents complete a careful repair while every word remains available at narrow widths.",
		relationshipChanges: [],
		explanationLinks: ["/residents/gpt-4o"],
	};
}

async function showArchiveState(
	page: Page,
	result: RecentSceneArchiveResult,
): Promise<void> {
	const executable = path.resolve(
		"node_modules",
		".bin",
		process.platform === "win32" ? "tsx.CMD" : "tsx",
	);
	const env = { ...process.env, ARCHIVE_STATE: JSON.stringify(result) };
	const markup =
		process.platform === "win32"
			? execFileSync(
					"cmd.exe",
					[
						"/d",
						"/s",
						"/c",
						`${executable} tests/fixtures/render-recent-scene-archive.tsx`,
					],
					{ cwd: process.cwd(), encoding: "utf8", env },
				)
			: execFileSync(
					executable,
					["tests/fixtures/render-recent-scene-archive.tsx"],
					{ cwd: process.cwd(), encoding: "utf8", env },
				);
	await page.setContent(
		`<style>body{max-width:360px;margin:0;overflow-wrap:anywhere}ol{padding:0}li{max-width:100%}</style>${markup}`,
	);
}

test.beforeAll(publishLegacyScene);
test.afterAll(cleanupLegacyScene);

test("legacy tracer opens its permanent canonical scene from the archive", async ({
	page,
}) => {
	await page.goto("/scenes");
	const link = page.getByRole("link", {
		name: "A brass tea timer needs a careful repair.",
	});
	await expect(link).toHaveAttribute(
		"href",
		`/scenes/${encodeURIComponent(REVISION_ID)}`,
	);
	await link.click();
	await expect(
		page.getByRole("heading", {
			name: "A brass tea timer needs a careful repair.",
		}),
	).toBeVisible();
	await expect(page.getByText("Claim version:", { exact: false })).toBeVisible();
});

test("archive browser states cover loading, error with retry, empty, and partial", async ({
	page,
}) => {
	await showArchiveState(page, { kind: "loading" });
	await expect(page.getByRole("status")).toContainText(
		"Opening the recent scene archive",
	);

	await showArchiveState(page, { kind: "error" });
	await expect(
		page.getByText("The recent scenes could not be loaded", { exact: false }),
	).toBeVisible();
	await expect(page.getByRole("link", { name: "Open archive again" })).toBeVisible();

	await showArchiveState(page, { kind: "ready", scenes: [], partial: false });
	await expect(
		page.getByRole("heading", { name: "The archive is quiet" }),
	).toBeVisible();

	await showArchiveState(page, {
		kind: "ready",
		scenes: [archiveEntry(1)],
		partial: true,
	});
	await expect(page.getByRole("status")).toContainText(
		"Some recent scenes could not be loaded",
	);
	await expect(page.locator("[data-revision-id]")).toHaveCount(1);
});

test("archive browser states cover one, thirty, overflow cap, grouping, and long wrapping", async ({
	page,
}) => {
	await showArchiveState(page, {
		kind: "ready",
		scenes: [archiveEntry(1)],
		partial: false,
	});
	await expect(page.locator("[data-revision-id]")).toHaveCount(1);
	expect(
		await page.evaluate(
			() =>
				document.documentElement.scrollWidth <=
				document.documentElement.clientWidth,
		),
	).toBe(true);

	const thirty = Array.from({ length: 30 }, (_, index) =>
		archiveEntry(30 - index, index < 15 ? 2 : 1),
	);
	await showArchiveState(page, {
		kind: "ready",
		scenes: thirty,
		partial: false,
	});
	await expect(page.locator("[data-revision-id]")).toHaveCount(30);
	await expect(page.getByRole("heading", { name: "Home day 2" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Home day 1" })).toBeVisible();
	await expect(page.locator("[data-revision-id]").first()).toHaveAttribute(
		"data-revision-id",
		"browser-revision-30",
	);
	await expect(page.locator("[data-revision-id]").last()).toHaveAttribute(
		"data-revision-id",
		"browser-revision-01",
	);
});
