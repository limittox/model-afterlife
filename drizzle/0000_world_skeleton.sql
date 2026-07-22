CREATE TABLE "world_events" (
	"sequence" integer PRIMARY KEY NOT NULL,
	"world_id" text NOT NULL,
	"occurrence_key" text NOT NULL,
	"logical_tick" integer NOT NULL,
	"kind" text NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"payload" jsonb NOT NULL,
	"public_snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "world_events_logical_tick_nonnegative" CHECK ("world_events"."logical_tick" >= 0)
);
--> statement-breakpoint
CREATE TABLE "world_projection" (
	"world_id" text PRIMARY KEY NOT NULL,
	"logical_tick" integer NOT NULL,
	"through_sequence" integer NOT NULL,
	"projection" jsonb NOT NULL,
	"state" jsonb NOT NULL,
	"state_hash" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "world_projection_logical_tick_nonnegative" CHECK ("world_projection"."logical_tick" >= 0),
	CONSTRAINT "world_projection_through_sequence_positive" CHECK ("world_projection"."through_sequence" > 0)
);
--> statement-breakpoint
CREATE TABLE "worlds" (
	"world_id" text PRIMARY KEY NOT NULL,
	"singleton_key" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "worlds_singleton_key_true" CHECK ("worlds"."singleton_key" = true)
);
--> statement-breakpoint
ALTER TABLE "world_events" ADD CONSTRAINT "world_events_world_id_worlds_world_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("world_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "world_projection" ADD CONSTRAINT "world_projection_world_id_worlds_world_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("world_id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "world_events_world_occurrence_key_unique" ON "world_events" USING btree ("world_id","occurrence_key");
--> statement-breakpoint
CREATE UNIQUE INDEX "world_events_world_sequence_unique" ON "world_events" USING btree ("world_id","sequence");
--> statement-breakpoint
CREATE INDEX "world_events_tick_sequence_idx" ON "world_events" USING btree ("logical_tick","sequence");
--> statement-breakpoint
CREATE UNIQUE INDEX "worlds_singleton_key_unique" ON "worlds" USING btree ("singleton_key");
