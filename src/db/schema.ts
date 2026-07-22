import { sql } from "drizzle-orm";
import {
	boolean,
	check,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import type { PublicWorldSnapshot } from "../features/world/contracts/public-world.ts";
import type { WorldState } from "../features/world/domain/types.ts";

export const worlds = pgTable(
	"worlds",
	{
		worldId: text("world_id").primaryKey(),
		singletonKey: boolean("singleton_key").notNull().default(true),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("worlds_singleton_key_unique").on(table.singletonKey),
		check("worlds_singleton_key_true", sql`${table.singletonKey} = true`),
	],
);

export const worldEvents = pgTable(
	"world_events",
	{
		sequence: integer("sequence").primaryKey(),
		worldId: text("world_id")
			.notNull()
			.references(() => worlds.worldId, { onDelete: "restrict" }),
		occurrenceKey: text("occurrence_key").notNull(),
		logicalTick: integer("logical_tick").notNull(),
		type: text("kind").notNull(),
		schemaVersion: integer("schema_version").notNull().default(1),
		payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
		publicSnapshot: jsonb("public_snapshot")
			.$type<PublicWorldSnapshot>()
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		uniqueIndex("world_events_world_occurrence_key_unique").on(
			table.worldId,
			table.occurrenceKey,
		),
		uniqueIndex("world_events_world_sequence_unique").on(
			table.worldId,
			table.sequence,
		),
		index("world_events_tick_sequence_idx").on(
			table.logicalTick,
			table.sequence,
		),
		check(
			"world_events_logical_tick_nonnegative",
			sql`${table.logicalTick} >= 0`,
		),
	],
);

export const worldProjection = pgTable(
	"world_projection",
	{
		worldId: text("world_id")
			.primaryKey()
			.references(() => worlds.worldId, { onDelete: "restrict" }),
		logicalTick: integer("logical_tick").notNull(),
		throughSequence: integer("through_sequence").notNull(),
		projection: jsonb("projection").$type<PublicWorldSnapshot>().notNull(),
		state: jsonb("state").$type<WorldState>().notNull(),
		stateHash: text("state_hash").notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(table) => [
		check(
			"world_projection_logical_tick_nonnegative",
			sql`${table.logicalTick} >= 0`,
		),
		check(
			"world_projection_through_sequence_positive",
			sql`${table.throughSequence} > 0`,
		),
	],
);

export const residentModelVersions = pgTable("resident_model_versions", {
	modelVersionId: text("model_version_id").primaryKey(),
	residentId: text("resident_id").notNull(),
	exactModelId: text("exact_model_id").notNull(),
	versionKey: text("version_key").notNull().unique(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const characterBibleVersions = pgTable("character_bible_versions", {
	bibleVersionId: text("bible_version_id").primaryKey(),
	residentId: text("resident_id").notNull(),
	versionKey: text("version_key").notNull().unique(),
	content: jsonb("content").$type<Record<string, unknown>>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const historicalClaimVersions = pgTable("historical_claim_versions", {
	claimVersionId: text("claim_version_id").primaryKey(),
	claimId: text("claim_id").notNull(),
	versionKey: text("version_key").notNull().unique(),
	content: jsonb("content").$type<Record<string, unknown>>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sceneBriefs = pgTable("scene_briefs", {
	sceneKey: text("scene_key").primaryKey(),
	worldId: text("world_id").notNull().references(() => worlds.worldId, { onDelete: "restrict" }),
	expectedWorldHead: integer("expected_world_head").notNull(),
	brief: jsonb("brief").$type<Record<string, unknown>>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const generationAttempts = pgTable("generation_attempts", {
	attemptId: text("attempt_id").primaryKey(),
	sceneKey: text("scene_key").notNull().references(() => sceneBriefs.sceneKey, { onDelete: "restrict" }),
	attemptOrdinal: integer("attempt_ordinal").notNull(),
	disposition: text("disposition").notNull(),
	identityEvidence: text("identity_evidence").notNull(),
	providerResponseId: text("provider_response_id"),
	adapterVersion: text("adapter_version").notNull(),
	configurationVersion: text("configuration_version").notNull(),
	promptVersion: text("prompt_version").notNull(),
	bibleVersionKey: text("bible_version_key").notNull(),
	claimVersionKey: text("claim_version_key").notNull(),
	finishReason: text("finish_reason").notNull(),
	usage: jsonb("usage").$type<Record<string, unknown>>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("generation_attempts_scene_ordinal_unique").on(table.sceneKey, table.attemptOrdinal)]);

export const generationTurns = pgTable("generation_turns", {
	turnId: text("turn_id").primaryKey(),
	attemptId: text("attempt_id").notNull().references(() => generationAttempts.attemptId, { onDelete: "restrict" }),
	turnIndex: integer("turn_index").notNull(),
	residentId: text("resident_id").notNull(),
	requestedModelId: text("requested_model_id").notNull(),
	text: text("text").notNull(),
	ending: boolean("ending").notNull(),
	effects: jsonb("effects").$type<Record<string, unknown>[]>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("generation_turns_attempt_index_unique").on(table.attemptId, table.turnIndex)]);

export const sceneValidationResults = pgTable("scene_validation_results", {
	validationId: text("validation_id").primaryKey(),
	attemptId: text("attempt_id").notNull().references(() => generationAttempts.attemptId, { onDelete: "restrict" }),
	accepted: boolean("accepted").notNull(),
	code: text("code").notNull(),
	detail: text("detail").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const publishedSceneRevisions = pgTable("published_scene_revisions", {
	revisionId: text("revision_id").primaryKey(),
	attemptId: text("attempt_id").notNull().references(() => generationAttempts.attemptId, { onDelete: "restrict" }).unique(),
	sceneKey: text("scene_key").notNull().references(() => sceneBriefs.sceneKey, { onDelete: "restrict" }).unique(),
	expectedWorldHead: integer("expected_world_head").notNull(),
	revision: jsonb("revision").$type<Record<string, unknown>>().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
