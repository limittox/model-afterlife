import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createWorldDatabase } from "../../../db/client.ts";
import { worldEvents } from "../../../db/schema.ts";
import type { CanonicalScene } from "../contracts/public-publication.ts";
import { canonicalSceneHref } from "./canonical-scene-href.ts";
import { readCanonicalScene } from "./read-canonical-scene.ts";

const ARCHIVE_LIMIT = 30;
const PublicationIdentitySchema = z
	.object({
		revisionId: z.string().optional(),
		scene: z
			.object({
				originalRevisionId: z.string().optional(),
			})
			.passthrough()
			.optional(),
	})
	.passthrough();

export type RecentSceneArchiveEntry = {
	revisionId: string;
	canonicalHref: string;
	publicationSequence: number;
	title: string;
	residents: Array<{
		residentId: string;
		displayName: string;
		profilePath: string;
	}>;
	location: string;
	homeDay: number;
	homeTime: string;
	dayPeriod: CanonicalScene["home"]["dayPeriod"];
	premise: string;
	transcriptDestination: string;
	outcome: string;
	relationshipChanges: string[];
	explanationLinks: string[];
};

export type RecentSceneArchiveResult =
	| { kind: "loading" }
	| { kind: "error" }
	| {
			kind: "ready";
			scenes: RecentSceneArchiveEntry[];
			partial: boolean;
		};

export type RecentPublicationCandidate = {
	sequence: number;
	payload: Record<string, unknown>;
};

function canonicalIdFromPayload(
	payload: Record<string, unknown>,
): string | null {
	const parsed = PublicationIdentitySchema.safeParse(payload);
	if (!parsed.success) return null;
	const identity = parsed.data;
	const href = canonicalSceneHref({
		revisionId: identity.revisionId,
		originalRevisionId: identity.scene?.originalRevisionId,
	});
	return href ? decodeURIComponent(href.slice("/scenes/".length)) : null;
}

function toArchiveEntry(scene: CanonicalScene): RecentSceneArchiveEntry | null {
	const canonicalHref = canonicalSceneHref({ revisionId: scene.revisionId });
	if (!canonicalHref || canonicalHref !== scene.canonicalPath) return null;
	return {
		revisionId: scene.revisionId,
		canonicalHref,
		publicationSequence: scene.publicationSequence,
		title: scene.premise,
		residents: scene.cast.map((resident) => ({
			residentId: resident.residentId,
			displayName: resident.displayName,
			profilePath: resident.profilePath,
		})),
		location: scene.location.name,
		homeDay: scene.home.homeDay,
		homeTime: scene.home.homeTime,
		dayPeriod: scene.home.dayPeriod,
		premise: scene.premise,
		transcriptDestination: canonicalHref,
		outcome: scene.outcome.summary,
		relationshipChanges: scene.outcome.relationshipChanges.map(
			(change) => change.description,
		),
		explanationLinks: [
			...new Set(
				scene.historicalContext.map((claim) => claim.residentProfilePath),
			),
		],
	};
}

export async function assembleRecentSceneArchive(
	candidates: readonly RecentPublicationCandidate[],
	readScene: typeof readCanonicalScene = readCanonicalScene,
): Promise<RecentSceneArchiveResult> {
	const sorted = [...candidates]
		.sort(
			(left, right) =>
				right.sequence - left.sequence ||
				(canonicalIdFromPayload(right.payload) ?? "").localeCompare(
					canonicalIdFromPayload(left.payload) ?? "",
				),
		)
		.slice(0, ARCHIVE_LIMIT);
	const scenes: RecentSceneArchiveEntry[] = [];
	let partial = false;
	for (const candidate of sorted) {
		const revisionId = canonicalIdFromPayload(candidate.payload);
		if (!revisionId) {
			partial = true;
			continue;
		}
		const result = await readScene(revisionId);
		if (result.kind !== "complete") {
			partial = true;
			continue;
		}
		const entry = toArchiveEntry(result.scene);
		if (!entry) {
			partial = true;
			continue;
		}
		scenes.push(entry);
	}
	scenes.sort(
		(left, right) =>
			right.publicationSequence - left.publicationSequence ||
			right.revisionId.localeCompare(left.revisionId),
	);
	return { kind: "ready", scenes, partial };
}

export async function readRecentScenes(): Promise<RecentSceneArchiveResult> {
	const { db, close } = createWorldDatabase();
	try {
		const rows = await db
			.select({
				sequence: worldEvents.sequence,
				payload: worldEvents.payload,
			})
			.from(worldEvents)
			.where(eq(worldEvents.type, "scene_published"))
			.orderBy(desc(worldEvents.sequence))
			.limit(ARCHIVE_LIMIT);
		return await assembleRecentSceneArchive(rows);
	} finally {
		await close();
	}
}
