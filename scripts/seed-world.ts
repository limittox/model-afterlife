import { desc, eq, inArray } from "drizzle-orm";
import { createWorldDatabase } from "../src/db/client.ts";
import {
	characterBibleVersions,
	historicalClaimVersions,
	residentModelVersions,
	worldEvents,
	worldProjection,
	worlds,
} from "../src/db/schema.ts";
import { PublicWorldSnapshotSchema } from "../src/features/world/contracts/public-world.ts";
import { targetTickFor } from "../src/features/world/domain/clock.ts";
import type { WorldState } from "../src/features/world/domain/types.ts";
import { LAUNCH_RESIDENTS } from "../src/features/world/fixtures/launch-residents.ts";
import { WORLD_EPOCH_MS } from "../src/features/world/fixtures/provisional-world.ts";
import {
	CANONICAL_WORLD_ID,
	createEditorialSeedData,
	createGroundedEnsembleInitializedEvent,
	createWorldInitializedEvent,
	GROUNDED_ENSEMBLE_OCCURRENCE_KEY,
	SEED_OCCURRENCE_KEY,
} from "../src/features/world/server/seed-data.ts";
import { toPublicWorldSnapshot } from "../src/features/world/server/to-public-snapshot.ts";

function isCurrentWorldState(value: unknown): value is WorldState {
	if (!value || typeof value !== "object") return false;
	const state = value as Partial<WorldState>;
	if (
		!Array.isArray(state.residents) ||
		!Array.isArray(state.relationships) ||
		!Array.isArray(state.memories) ||
		!Array.isArray(state.appliedRelationshipEffectKeys) ||
		!Array.isArray(state.sceneHistory)
	) {
		return false;
	}
	const expectedResidentIds = LAUNCH_RESIDENTS.map(
		(resident) => resident.id,
	).sort();
	const actualResidentIds = state.residents
		.map((resident) => resident.id)
		.sort();
	return (
		actualResidentIds.length === expectedResidentIds.length &&
		actualResidentIds.every(
			(residentId, index) => residentId === expectedResidentIds[index],
		)
	);
}

export async function seedWorld(): Promise<void> {
	const { db, close } = createWorldDatabase();

	try {
		await db.transaction(async (transaction) => {
			const editorialSeed = createEditorialSeedData();
			await transaction
				.delete(residentModelVersions)
				.where(
					inArray(residentModelVersions.modelVersionId, [
						"model:gpt-3.5-turbo-0613:v1",
						"model:command-r-plus-08-2024:v1",
						"model:deepseek-r1-0528:v1",
						"model:qwen-2.5-7b-instruct:v1",
					]),
				);
			await transaction
				.delete(characterBibleVersions)
				.where(
					inArray(characterBibleVersions.bibleVersionId, [
						"bible:gpt-3.5-turbo-0613:v1",
						"bible:command-r-plus-08-2024:v1",
						"bible:deepseek-r1-0528:v1",
						"bible:qwen-2.5-7b-instruct:v1",
					]),
				);
			await transaction
				.delete(historicalClaimVersions)
				.where(
					inArray(historicalClaimVersions.claimVersionId, [
						"claim-version:gpt35-context:v1",
						"claim-version:gpt35-reputation:v1",
						"claim-version:gpt35-index-cards:v1",
						"claim-version:commandr-capability:v1",
						"claim-version:commandr-reputation:v1",
						"claim-version:commandr-tea-index:v1",
						"claim-version:deepseek-r1-0528-capability:v1",
						"claim-version:deepseek-r1-0528-reputation:v1",
						"claim-version:deepseek-r1-0528-tea-proof:v1",
						"claim-version:qwen25-capability:v1",
						"claim-version:qwen25-reputation:v1",
						"claim-version:qwen25-ledgers:v1",
					]),
				);
			await transaction
				.insert(residentModelVersions)
				.values(editorialSeed.residentModelVersions)
				.onConflictDoNothing();
			await transaction
				.insert(characterBibleVersions)
				.values(editorialSeed.characterBibleVersions)
				.onConflictDoNothing();
			await transaction
				.insert(historicalClaimVersions)
				.values(editorialSeed.historicalClaimVersions)
				.onConflictDoNothing();

			await transaction
				.insert(worlds)
				.values({ worldId: CANONICAL_WORLD_ID })
				.onConflictDoNothing();

			const initialTick = targetTickFor(Date.now(), WORLD_EPOCH_MS);
			const initialEvent = createWorldInitializedEvent(1, initialTick);
			const initialSnapshot = toPublicWorldSnapshot(initialEvent.payload.state);
			const inserted = await transaction
				.insert(worldEvents)
				.values({
					sequence: initialEvent.sequence,
					worldId: CANONICAL_WORLD_ID,
					occurrenceKey: SEED_OCCURRENCE_KEY,
					logicalTick: initialEvent.logicalTick,
					type: initialEvent.type,
					schemaVersion: initialEvent.schemaVersion,
					payload: initialEvent.payload,
					publicSnapshot: initialSnapshot,
				})
				.onConflictDoNothing()
				.returning({
					sequence: worldEvents.sequence,
					logicalTick: worldEvents.logicalTick,
				});

			const [existing] =
				inserted.length > 0
					? inserted
					: await transaction
							.select({
								sequence: worldEvents.sequence,
								logicalTick: worldEvents.logicalTick,
							})
							.from(worldEvents)
							.where(eq(worldEvents.occurrenceKey, SEED_OCCURRENCE_KEY))
							.limit(1);

			if (!existing) {
				throw new Error("The immutable seed occurrence could not be read.");
			}

			const seededEvent = createWorldInitializedEvent(
				existing.sequence,
				existing.logicalTick,
			);
			const snapshot = toPublicWorldSnapshot(seededEvent.payload.state);
			const [projection] = await transaction
				.select({
					logicalTick: worldProjection.logicalTick,
					throughSequence: worldProjection.throughSequence,
					projection: worldProjection.projection,
					state: worldProjection.state,
				})
				.from(worldProjection)
				.where(eq(worldProjection.worldId, CANONICAL_WORLD_ID))
				.limit(1);
			const projectionIsCurrent =
				projection !== undefined &&
				isCurrentWorldState(projection.state) &&
				PublicWorldSnapshotSchema.safeParse(projection.projection).success;

			if (projectionIsCurrent) return;

			if (!projection && inserted.length > 0) {
				await transaction.insert(worldProjection).values({
					worldId: CANONICAL_WORLD_ID,
					logicalTick: snapshot.logicalTick,
					throughSequence: snapshot.throughSequence,
					projection: snapshot,
					state: seededEvent.payload.state,
					stateHash: snapshot.stateHash,
				});
				return;
			}

			const [latestEvent] = await transaction
				.select({ sequence: worldEvents.sequence })
				.from(worldEvents)
				.where(eq(worldEvents.worldId, CANONICAL_WORLD_ID))
				.orderBy(desc(worldEvents.sequence))
				.limit(1);
			if (!latestEvent) {
				throw new Error("The canonical event journal has no initialization.");
			}
			const upgradeCandidate = createGroundedEnsembleInitializedEvent(
				latestEvent.sequence + 1,
				projection?.logicalTick ?? existing.logicalTick,
			);
			await transaction
				.insert(worldEvents)
				.values({
					sequence: upgradeCandidate.sequence,
					worldId: CANONICAL_WORLD_ID,
					occurrenceKey: GROUNDED_ENSEMBLE_OCCURRENCE_KEY,
					logicalTick: upgradeCandidate.logicalTick,
					type: upgradeCandidate.type,
					schemaVersion: upgradeCandidate.schemaVersion,
					payload: upgradeCandidate.payload,
					publicSnapshot: toPublicWorldSnapshot(upgradeCandidate.payload.state),
				})
				.onConflictDoNothing();
			const [upgradeRow] = await transaction
				.select({
					sequence: worldEvents.sequence,
					logicalTick: worldEvents.logicalTick,
				})
				.from(worldEvents)
				.where(eq(worldEvents.occurrenceKey, GROUNDED_ENSEMBLE_OCCURRENCE_KEY))
				.limit(1);
			if (!upgradeRow) {
				throw new Error(
					"The grounded ensemble upgrade event could not be read.",
				);
			}
			if (projection && projection.throughSequence > upgradeRow.sequence) {
				throw new Error(
					"Refusing to rewind a newer incompatible canonical projection.",
				);
			}
			const upgradeEvent = createGroundedEnsembleInitializedEvent(
				upgradeRow.sequence,
				upgradeRow.logicalTick,
			);
			const upgradeSnapshot = toPublicWorldSnapshot(upgradeEvent.payload.state);
			await transaction
				.insert(worldProjection)
				.values({
					worldId: CANONICAL_WORLD_ID,
					logicalTick: upgradeSnapshot.logicalTick,
					throughSequence: upgradeSnapshot.throughSequence,
					projection: upgradeSnapshot,
					state: upgradeEvent.payload.state,
					stateHash: upgradeSnapshot.stateHash,
					updatedAt: new Date(),
				})
				.onConflictDoUpdate({
					target: worldProjection.worldId,
					set: {
						logicalTick: upgradeSnapshot.logicalTick,
						throughSequence: upgradeSnapshot.throughSequence,
						projection: upgradeSnapshot,
						state: upgradeEvent.payload.state,
						stateHash: upgradeSnapshot.stateHash,
						updatedAt: new Date(),
					},
				});
		});
	} finally {
		await close();
	}
}

await seedWorld();
