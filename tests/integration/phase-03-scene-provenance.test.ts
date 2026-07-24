import { readFile } from "node:fs/promises";
import { count, eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createWorldDatabase } from "../../src/db/client.ts";
import {
	generationAttempts,
	generationTurns,
	historicalClaimVersions,
	publishedSceneClaimVersions,
	publishedSceneRevisions,
	sceneBriefs,
	sceneValidationResults,
	worldEvents,
	worldProjection,
} from "../../src/db/schema.ts";
import { readCanonicalScene } from "../../src/features/publication/server/read-canonical-scene.ts";
import type { PublicWorldSnapshot } from "../../src/features/world/contracts/public-world.ts";
import type { WorldState } from "../../src/features/world/domain/types.ts";
import { HISTORICAL_CLAIMS } from "../../src/features/world/fixtures/historical-claims.ts";
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

const MISSING_CLAIM_ID = "gpt4o-parlour-demo-exaggeration";
const AMBIGUOUS_CLAIM_ID = "gpt4o-versatile-flagship-reputation";
const DUPLICATE_CLAIM_VERSION_ID = "claim-version:phase3-ambiguous:v1";

const sceneKeys = [
	"phase3-missing-scene",
	"phase3-ambiguous-scene",
	"phase3-canonical-scene",
	"phase3-equal-content-scene",
];
const attemptIds = sceneKeys.map((sceneKey) => `${sceneKey}:attempt`);
const revisionIds = sceneKeys.map((sceneKey) => `${sceneKey}:revision`);
const eventOccurrenceKeys = [
	...sceneKeys.map((sceneKey) => `scene-published:${sceneKey}`),
	...revisionIds.map((revisionId) => `shared-experience:${revisionId}`),
];

let initialSequence = 0;
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

function historicalClaim(claimId: string) {
	const claim = HISTORICAL_CLAIMS.find(
		(candidate) => candidate.claimId === claimId,
	);
	if (!claim) throw new Error(`Historical claim ${claimId} is unavailable.`);
	return claim;
}

async function seedIsolatedWorld(): Promise<void> {
	const { db, close } = createWorldDatabase();
	try {
		const [projection] = await db
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
		if (!projection)
			throw new Error("Canonical test projection is unavailable.");
		originalProjection = projection;
		initialSequence = projection.throughSequence;
	} finally {
		await close();
	}
}

async function cleanupIsolatedWorld(): Promise<void> {
	const { db, close } = createWorldDatabase();
	try {
		await db
			.delete(publishedSceneClaimVersions)
			.where(inArray(publishedSceneClaimVersions.revisionId, revisionIds));
		await db
			.delete(publishedSceneRevisions)
			.where(inArray(publishedSceneRevisions.revisionId, revisionIds));
		await db
			.delete(sceneValidationResults)
			.where(inArray(sceneValidationResults.attemptId, attemptIds));
		await db
			.delete(generationTurns)
			.where(inArray(generationTurns.attemptId, attemptIds));
		await db
			.delete(generationAttempts)
			.where(inArray(generationAttempts.attemptId, attemptIds));
		await db
			.delete(sceneBriefs)
			.where(inArray(sceneBriefs.sceneKey, sceneKeys));
		await db
			.delete(worldEvents)
			.where(inArray(worldEvents.occurrenceKey, eventOccurrenceKeys));
		if (originalProjection) {
			await db
				.update(worldProjection)
				.set(originalProjection)
				.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID));
		}
		await db
			.delete(historicalClaimVersions)
			.where(
				eq(historicalClaimVersions.claimVersionId, DUPLICATE_CLAIM_VERSION_ID),
			);
	} finally {
		await close();
	}
}

async function canonicalFootprint() {
	const { db, close } = createWorldDatabase();
	try {
		const [[revisions], [bindings], [events], [projection]] = await Promise.all(
			[
				db
					.select({ value: count() })
					.from(publishedSceneRevisions)
					.where(inArray(publishedSceneRevisions.revisionId, revisionIds)),
				db
					.select({ value: count() })
					.from(publishedSceneClaimVersions)
					.where(inArray(publishedSceneClaimVersions.revisionId, revisionIds)),
				db
					.select({ value: count() })
					.from(worldEvents)
					.where(eq(worldEvents.worldId, CANONICAL_WORLD_ID)),
				db
					.select({
						throughSequence: worldProjection.throughSequence,
						stateHash: worldProjection.stateHash,
					})
					.from(worldProjection)
					.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID)),
			],
		);
		return {
			revisions: revisions?.value ?? 0,
			bindings: bindings?.value ?? 0,
			events: events?.value ?? 0,
			projection,
		};
	} finally {
		await close();
	}
}

async function acceptedCandidateFor(input: {
	sceneKey: string;
	revisionId: string;
	expectedWorldHead: number;
	claimIdsByTurn: readonly (readonly string[])[];
}) {
	const base = buildValidSceneCandidate();
	const brief = SceneBriefSchema.parse({
		...base.brief,
		briefId: `${input.sceneKey}:brief`,
		sceneKey: input.sceneKey,
		expectedWorldHead: input.expectedWorldHead,
		allowedFactIds: [...new Set(input.claimIdsByTurn.flat())],
	});
	const attempt: GenerationAttempt = {
		...base.attempt,
		attemptId: `${input.sceneKey}:attempt`,
		sceneKey: input.sceneKey,
	};
	const turns: ResidentTurn[] = base.turns.map((turn, turnIndex) => ({
		...turn,
		approvedClaimIds: [...(input.claimIdsByTurn[turnIndex] ?? [])],
	}));
	const validation = validateSceneCandidate({
		brief,
		attempt,
		turns,
		revisionId: input.revisionId,
		semanticGateEvidence: approvedSemanticGateFixture(),
	});
	expect(validation.result.accepted).toBe(true);
	if (!validation.acceptedCandidate) {
		throw new Error(`Expected ${input.sceneKey} to be accepted.`);
	}
	await persistGenerationAttempt({
		worldId: CANONICAL_WORLD_ID,
		brief,
		attempt,
		turns,
		result: validation.result,
		validatorResults: validation.manifest.results,
	});
	return validation.acceptedCandidate;
}

describe("Phase 3 immutable scene provenance", () => {
	beforeAll(seedIsolatedWorld);
	afterAll(cleanupIsolatedWorld);

	it("ships the reviewed exact-binding migration and ordered snapshot entry", async () => {
		const [migration, journal, snapshot] = await Promise.all([
			readFile("drizzle/0003_phase3_public_provenance.sql", "utf8"),
			readFile("drizzle/meta/_journal.json", "utf8"),
			readFile("drizzle/meta/0003_snapshot.json", "utf8"),
		]);
		const manifest = JSON.parse(journal) as {
			entries: Array<{ idx: number; tag: string }>;
		};

		expect(manifest.entries.at(-1)).toMatchObject({
			idx: 3,
			tag: "0003_phase3_public_provenance",
		});
		expect(migration).toContain(
			'PRIMARY KEY("revision_id","turn_index","claim_version_id")',
		);
		expect(migration).toContain("ON DELETE restrict");
		expect(migration).toContain('("claim_version_id","revision_id")');
		expect(migration).toContain("invalid_binding_count");
		expect(migration).toContain("historical-claims-v1");
		expect(snapshot).toContain('"published_scene_claim_versions_pk"');
		expect(snapshot).toContain(
			'"published_scene_claim_versions_claim_revision_idx"',
		);
	});

	it("rolls back every canonical write when an approved claim is missing", async () => {
		const candidate = await acceptedCandidateFor({
			sceneKey: sceneKeys[0] as string,
			revisionId: revisionIds[0] as string,
			expectedWorldHead: initialSequence,
			claimIdsByTurn: [[MISSING_CLAIM_ID], [], [], []],
		});
		const claim = historicalClaim(MISSING_CLAIM_ID);
		const { db, close } = createWorldDatabase();
		await db
			.delete(historicalClaimVersions)
			.where(eq(historicalClaimVersions.claimVersionId, claim.claimVersionId));
		await close();

		const before = await canonicalFootprint();
		try {
			await expect(
				publishSceneRevision(CANONICAL_WORLD_ID, candidate),
			).rejects.toThrow("resolved to 0 immutable versions");
			expect(await canonicalFootprint()).toEqual(before);
		} finally {
			const restored = createWorldDatabase();
			try {
				await restored.db.insert(historicalClaimVersions).values({
					claimVersionId: claim.claimVersionId,
					claimId: claim.claimId,
					versionKey: claim.versionKey,
					content: claim,
				});
			} finally {
				await restored.close();
			}
		}
	});

	it("rolls back every canonical write when claim resolution is ambiguous", async () => {
		const candidate = await acceptedCandidateFor({
			sceneKey: sceneKeys[1] as string,
			revisionId: revisionIds[1] as string,
			expectedWorldHead: initialSequence,
			claimIdsByTurn: [[AMBIGUOUS_CLAIM_ID], [], [], []],
		});
		const claim = historicalClaim(AMBIGUOUS_CLAIM_ID);
		const duplicate = {
			...claim,
			claimVersionId: DUPLICATE_CLAIM_VERSION_ID,
			versionKey: "phase3-ambiguous.v1",
		};
		const { db, close } = createWorldDatabase();
		await db.insert(historicalClaimVersions).values({
			claimVersionId: duplicate.claimVersionId,
			claimId: duplicate.claimId,
			versionKey: duplicate.versionKey,
			content: duplicate,
		});
		await close();

		const before = await canonicalFootprint();
		try {
			await expect(
				publishSceneRevision(CANONICAL_WORLD_ID, candidate),
			).rejects.toThrow("resolved to 2 immutable versions");
			expect(await canonicalFootprint()).toEqual(before);
		} finally {
			const cleanup = createWorldDatabase();
			try {
				await cleanup.db
					.delete(historicalClaimVersions)
					.where(
						eq(
							historicalClaimVersions.claimVersionId,
							DUPLICATE_CLAIM_VERSION_ID,
						),
					);
			} finally {
				await cleanup.close();
			}
		}
	});

	it("publishes exact bindings once and preserves the immutable read after live advance", async () => {
		const firstCandidate = await acceptedCandidateFor({
			sceneKey: sceneKeys[2] as string,
			revisionId: revisionIds[2] as string,
			expectedWorldHead: initialSequence,
			claimIdsByTurn: [
				["gpt4o-native-multimodal", "gpt4o-native-multimodal"],
				["claude45-coding-and-agents"],
				[],
				[],
			],
		});
		const first = await publishSceneRevision(
			CANONICAL_WORLD_ID,
			firstCandidate,
		);
		const duplicate = await publishSceneRevision(
			CANONICAL_WORLD_ID,
			firstCandidate,
		);
		expect(first).toEqual({
			revisionId: revisionIds[2],
			published: true,
		});
		expect(duplicate).toEqual({
			revisionId: revisionIds[2],
			published: false,
		});

		const { db, close } = createWorldDatabase();
		const bindings = await db
			.select({
				turnIndex: publishedSceneClaimVersions.turnIndex,
				claimVersionId: publishedSceneClaimVersions.claimVersionId,
			})
			.from(publishedSceneClaimVersions)
			.where(
				eq(publishedSceneClaimVersions.revisionId, revisionIds[2] as string),
			)
			.orderBy(publishedSceneClaimVersions.turnIndex);
		await close();
		expect(bindings).toEqual([
			{
				turnIndex: 0,
				claimVersionId: "claim-version:gpt4o-capability:v1",
			},
			{
				turnIndex: 1,
				claimVersionId: "claim-version:claude45-capability:v1",
			},
		]);

		const originalRead = await readCanonicalScene(revisionIds[2] as string);
		expect(originalRead.kind).toBe("complete");
		if (originalRead.kind !== "complete") return;
		const headAfterFirst = (await canonicalFootprint()).projection
			.throughSequence;
		const secondCandidate = await acceptedCandidateFor({
			sceneKey: sceneKeys[3] as string,
			revisionId: revisionIds[3] as string,
			expectedWorldHead: headAfterFirst,
			claimIdsByTurn: [[], [], [], []],
		});
		await publishSceneRevision(CANONICAL_WORLD_ID, secondCandidate);

		const afterAdvance = await readCanonicalScene(revisionIds[2] as string);
		expect(afterAdvance).toEqual(originalRead);
		const equalContent = await readCanonicalScene(revisionIds[3] as string);
		expect(equalContent.kind).toBe("complete");
		if (equalContent.kind === "complete") {
			expect(equalContent.scene.premise).toBe(originalRead.scene.premise);
			expect(equalContent.scene.turns.map((turn) => turn.text)).toEqual(
				originalRead.scene.turns.map((turn) => turn.text),
			);
			expect(equalContent.scene.canonicalPath).not.toBe(
				originalRead.scene.canonicalPath,
			);
		}
	});

	it("returns not-found for unknown and synthetic presentation identities", async () => {
		await expect(readCanonicalScene("unknown-revision")).resolves.toEqual({
			kind: "not-found",
		});
		await expect(
			readCanonicalScene("cached:scene:unknown-revision"),
		).resolves.toEqual({ kind: "not-found" });
		await expect(readCanonicalScene("")).resolves.toEqual({
			kind: "not-found",
		});
	});
});
