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
