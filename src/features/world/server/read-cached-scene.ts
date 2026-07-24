import { desc, eq } from "drizzle-orm";
import { createWorldDatabase } from "../../../db/client.ts";
import {
	publishedSceneRevisions,
	sceneBriefs,
} from "../../../db/schema.ts";
import type { CompleteWorldScene, WorldRoomId } from "../domain/types.ts";
import {
	PublishedSceneRevisionSchema,
	SceneBriefSchema,
	type SceneBrief,
} from "../generation/contracts.ts";

function sameParticipants(
	left: readonly string[],
	right: readonly string[],
): boolean {
	return [...left].sort().join(":") === [...right].sort().join(":");
}

export function cachedSceneFromPublishedRevision(input: {
	failedBrief: SceneBrief;
	revision: unknown;
	originalBrief: unknown;
	startedAtTick: number;
}): CompleteWorldScene | null {
	const revision = PublishedSceneRevisionSchema.safeParse(input.revision);
	const originalBrief = SceneBriefSchema.safeParse(input.originalBrief);
	if (
		!revision.success ||
		!originalBrief.success ||
		revision.data.sceneKey === input.failedBrief.sceneKey ||
		originalBrief.data.locationId !== input.failedBrief.locationId ||
		!sameParticipants(
			originalBrief.data.participantIds,
			input.failedBrief.participantIds,
		)
	) {
		return null;
	}

	return {
		id: `cached:${input.failedBrief.sceneKey}:${revision.data.revisionId}`,
		premise: originalBrief.data.premise,
		locationId: originalBrief.data.locationId as WorldRoomId,
		participantIds: [...originalBrief.data.participantIds],
		startedAtTick: input.startedAtTick,
		durationTicks: 1,
		presentationDurationMs: 12_000,
		turns: revision.data.turns.map((turn) => ({
			id: `cached:${revision.data.revisionId}:${turn.turnIndex}`,
			speakerId: turn.residentId,
			exactModelId: turn.requestedModelId,
			text: turn.text,
		})),
		deliveryMode: "cached",
		originalRevisionId: revision.data.revisionId,
		originalSceneKey: revision.data.sceneKey,
	};
}

export async function readCachedScene(input: {
	worldId: string;
	failedBrief: SceneBrief;
	startedAtTick: number;
}): Promise<CompleteWorldScene | null> {
	const { db, close } = createWorldDatabase();
	try {
		const rows = await db
			.select({
				revision: publishedSceneRevisions.revision,
				brief: sceneBriefs.brief,
			})
			.from(publishedSceneRevisions)
			.innerJoin(
				sceneBriefs,
				eq(publishedSceneRevisions.sceneKey, sceneBriefs.sceneKey),
			)
			.where(eq(sceneBriefs.worldId, input.worldId))
			.orderBy(desc(publishedSceneRevisions.createdAt))
			.limit(20);
		for (const row of rows) {
			const cached = cachedSceneFromPublishedRevision({
				failedBrief: input.failedBrief,
				revision: row.revision,
				originalBrief: row.brief,
				startedAtTick: input.startedAtTick,
			});
			if (cached) return cached;
		}
		return null;
	} finally {
		await close();
	}
}
