import { and, desc, eq, gt, lte } from "drizzle-orm";
import { z } from "zod";
import { createWorldDatabase } from "../../../db/client.ts";
import { worldEvents, worldProjection } from "../../../db/schema.ts";
import {
	type CanonicalScene,
	ReturnRecapResponseSchema,
	type ReturnRecapBeat,
	type ReturnRecapResponse,
} from "../contracts/public-publication.ts";
import { PublicWorldSnapshotSchema } from "../../world/contracts/public-world.ts";
import { CANONICAL_WORLD_ID } from "../../world/server/seed-data.ts";
import { canonicalSceneHref } from "./canonical-scene-href.ts";
import { readCanonicalScene } from "./read-canonical-scene.ts";

const RECAP_LIMIT = 5;
const CANDIDATE_LIMIT = 100;
const PublicationIdentitySchema = z
	.object({
		revisionId: z.string().optional(),
		scene: z
			.object({ originalRevisionId: z.string().optional() })
			.passthrough()
			.optional(),
	})
	.passthrough();

export type ReturnPublicationCandidate = {
	sequence: number;
	payload: Record<string, unknown>;
};

export type ReturnRecapHead = {
	worldId: string;
	throughSequence: number;
	snapshot: z.infer<typeof PublicWorldSnapshotSchema>;
};

export class ReturnRecapMarkerError extends Error {
	constructor(
		public readonly code: "world-mismatch" | "future-sequence",
	) {
		super(code);
	}
}

function canonicalIdFromPayload(
	payload: Record<string, unknown>,
): string | null {
	const parsed = PublicationIdentitySchema.safeParse(payload);
	if (!parsed.success) return null;
	const href = canonicalSceneHref({
		revisionId: parsed.data.revisionId,
		originalRevisionId: parsed.data.scene?.originalRevisionId,
	});
	return href ? decodeURIComponent(href.slice("/scenes/".length)) : null;
}

function significanceFor(scene: CanonicalScene): {
	rank: number;
	kind: ReturnRecapBeat["significance"];
} {
	if (scene.outcome.relationshipChanges.length > 0) {
		return { rank: 3, kind: "relationship-change" };
	}
	if (scene.outcome.sharedExperience !== null) {
		return { rank: 2, kind: "shared-experience" };
	}
	return { rank: 1, kind: "ordinary-publication" };
}

function beatFor(scene: CanonicalScene): ReturnRecapBeat | null {
	const href = canonicalSceneHref({ revisionId: scene.revisionId });
	if (!href || href !== scene.canonicalPath) return null;
	const significance = significanceFor(scene);
	const relationshipNote =
		scene.outcome.relationshipChanges.length > 0
			? [
					...new Set(
						scene.outcome.relationshipChanges.map(
							(change) => change.description,
						),
					),
				].join(" ")
			: null;
	const development =
		relationshipNote ??
		scene.outcome.sharedExperience ??
		scene.outcome.summary;
	const residents = scene.cast.map((resident) => ({
		residentId: resident.residentId,
		displayName: resident.displayName,
		profilePath: resident.profilePath,
	}));
	return {
		revisionId: scene.revisionId,
		publicationSequence: scene.publicationSequence,
		significance: significance.kind,
		development,
		home: {
			homeDay: scene.home.homeDay,
			homeTime: scene.home.homeTime,
			dayPeriod: scene.home.dayPeriod,
		},
		scene: { href, label: scene.premise },
		residents,
		relationshipNote,
	};
}

function currentSituation(
	snapshot: z.infer<typeof PublicWorldSnapshotSchema>,
): ReturnRecapResponse["currentSituation"] {
	const description = snapshot.scene
		? `The current scene is “${snapshot.scene.premise}”.`
		: (snapshot.quiet?.message ??
			"The home is continuing its quiet routines.");
	const minutesFromEpoch = 9 * 60 + snapshot.logicalTick;
	return {
		homeDay: Math.floor(minutesFromEpoch / (24 * 60)) + 1,
		homeTime: snapshot.homeTime,
		dayPeriod: snapshot.dayPeriod,
		description,
	};
}

export async function assembleReturnRecap(
	head: ReturnRecapHead,
	afterSequence: number,
	candidates: readonly ReturnPublicationCandidate[],
	readScene: typeof readCanonicalScene = readCanonicalScene,
): Promise<ReturnRecapResponse> {
	if (!Number.isSafeInteger(afterSequence) || afterSequence < 1) {
		throw new RangeError("afterSequence must be a positive safe integer.");
	}
	if (afterSequence > head.throughSequence) {
		throw new ReturnRecapMarkerError("future-sequence");
	}

	const orderedCandidates = [...candidates]
		.filter(
			(candidate) =>
				Number.isSafeInteger(candidate.sequence) &&
				candidate.sequence > afterSequence &&
				candidate.sequence <= head.throughSequence,
		)
		.sort(
			(left, right) =>
				right.sequence - left.sequence ||
				(canonicalIdFromPayload(right.payload) ?? "").localeCompare(
					canonicalIdFromPayload(left.payload) ?? "",
				),
		);
	let partial = orderedCandidates.length > CANDIDATE_LIMIT;
	const beats: Array<ReturnRecapBeat & { rank: number }> = [];
	const seenRevisions = new Set<string>();
	for (const candidate of orderedCandidates.slice(0, CANDIDATE_LIMIT)) {
		const revisionId = canonicalIdFromPayload(candidate.payload);
		if (!revisionId || seenRevisions.has(revisionId)) {
			partial ||= revisionId === null;
			continue;
		}
		seenRevisions.add(revisionId);
		const result = await readScene(revisionId);
		if (
			result.kind !== "complete" ||
			result.scene.publicationSequence !== candidate.sequence
		) {
			partial = true;
			continue;
		}
		const beat = beatFor(result.scene);
		if (!beat) {
			partial = true;
			continue;
		}
		beats.push({ ...beat, rank: significanceFor(result.scene).rank });
	}
	beats.sort(
		(left, right) =>
			right.rank - left.rank ||
			right.publicationSequence - left.publicationSequence ||
			right.revisionId.localeCompare(left.revisionId),
	);

	return ReturnRecapResponseSchema.parse({
		worldId: head.worldId,
		afterSequence,
		throughSequence: head.throughSequence,
		partial,
		beats: beats.slice(0, RECAP_LIMIT).map(({ rank: _rank, ...beat }) => beat),
		currentSituation: currentSituation(head.snapshot),
	});
}

export async function readReturnRecap(input: {
	worldId: string;
	afterSequence: number;
}): Promise<ReturnRecapResponse> {
	if (input.worldId !== CANONICAL_WORLD_ID) {
		throw new ReturnRecapMarkerError("world-mismatch");
	}
	const { db, close } = createWorldDatabase();
	try {
		const [row] = await db
			.select({
				worldId: worldProjection.worldId,
				throughSequence: worldProjection.throughSequence,
				snapshot: worldProjection.projection,
			})
			.from(worldProjection)
			.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID))
			.limit(1);
		if (!row) {
			throw new Error("The canonical world has not been seeded.");
		}
		const snapshot = PublicWorldSnapshotSchema.parse(row.snapshot);
		if (input.afterSequence > row.throughSequence) {
			throw new ReturnRecapMarkerError("future-sequence");
		}
		const candidates = await db
			.select({
				sequence: worldEvents.sequence,
				payload: worldEvents.payload,
			})
			.from(worldEvents)
			.where(
				and(
					eq(worldEvents.worldId, CANONICAL_WORLD_ID),
					eq(worldEvents.type, "scene_published"),
					gt(worldEvents.sequence, input.afterSequence),
					lte(worldEvents.sequence, row.throughSequence),
				),
			)
			.orderBy(desc(worldEvents.sequence))
			.limit(CANDIDATE_LIMIT + 1);
		return await assembleReturnRecap(
			{
				worldId: row.worldId,
				throughSequence: row.throughSequence,
				snapshot,
			},
			input.afterSequence,
			candidates,
		);
	} finally {
		await close();
	}
}
