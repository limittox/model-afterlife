DROP INDEX "world_events_occurrence_key_unique";--> statement-breakpoint
ALTER TABLE "world_events" ALTER COLUMN "sequence" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "world_events" ADD COLUMN "schema_version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "world_events" ADD COLUMN "public_snapshot" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "world_projection" ADD COLUMN "state" jsonb NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "world_events_world_occurrence_key_unique" ON "world_events" USING btree ("world_id","occurrence_key");--> statement-breakpoint
CREATE UNIQUE INDEX "world_events_world_sequence_unique" ON "world_events" USING btree ("world_id","sequence");
