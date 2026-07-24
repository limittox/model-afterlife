import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
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
import { canonicalSceneHref } from "../../src/features/publication/server/canonical-scene-href.ts";
import { readCanonicalScene } from "../../src/features/publication/server/read-canonical-scene.ts";
import { readRecentScenes } from "../../src/features/publication/server/read-recent-scenes.ts";
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

const SCENE_KEY = "phase3-backfill-legacy-scene";
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

async function seedLegacyFixture(): Promise<void> {
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
		if (!projection) throw new Error("Canonical test projection is unavailable.");
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
			throw new Error("Reviewed legacy fixture did not pass publication.");
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
}

async function cleanupLegacyFixture(): Promise<void> {
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

describe("Phase 3 evidence backfill release gate", () => {
	beforeAll(seedLegacyFixture);
	afterAll(cleanupLegacyFixture);

	it("runs dry-run, transactional apply, idempotent apply, and final check", async () => {
		await expect(runBackfill("--dry-run")).resolves.toMatchObject({
			mode: "--dry-run",
			total: 1,
			resolved: 1,
			unresolved: 0,
			ambiguous: 0,
			pending: 1,
			applied: 0,
		});
		await expect(runBackfill("--apply")).resolves.toMatchObject({
			mode: "--apply",
			total: 1,
			resolved: 1,
			unresolved: 0,
			ambiguous: 0,
			pending: 1,
			applied: 1,
		});
		await expect(runBackfill("--apply")).resolves.toMatchObject({
			pending: 0,
			applied: 0,
		});
		await expect(runBackfill("--check")).resolves.toMatchObject({
			mode: "--check",
			total: 1,
			resolved: 1,
			unresolved: 0,
			ambiguous: 0,
			pending: 0,
			applied: 0,
		});
	});

	it("opens the evidenced legacy revision from the canonical archive", async () => {
		const archive = await readRecentScenes();
		expect(archive.kind).toBe("ready");
		if (archive.kind !== "ready") return;
		const legacy = archive.scenes.find(
			(scene) => scene.revisionId === REVISION_ID,
		);
		expect(legacy?.canonicalHref).toBe(
			canonicalSceneHref({ revisionId: REVISION_ID }),
		);
		await expect(readCanonicalScene(REVISION_ID)).resolves.toMatchObject({
			kind: "complete",
			scene: {
				revisionId: REVISION_ID,
				canonicalPath: legacy?.canonicalHref,
			},
		});
	});

	it("fails closed before connecting to an unapproved database", async () => {
		const originalUrl = process.env.DATABASE_URL;
		process.env.DATABASE_URL =
			"postgresql://model_afterlife:model_afterlife@db:5432/not_phase_3";
		try {
			await expect(runBackfill("--check")).rejects.toThrow(
				"Refusing test backfill outside model_afterlife_test.",
			);
		} finally {
			process.env.DATABASE_URL = originalUrl;
		}
	});
});
