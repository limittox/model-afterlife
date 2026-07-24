ALTER TABLE "generation_turns" ADD COLUMN "approved_claim_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "generation_turns" ADD COLUMN "provenance" jsonb;--> statement-breakpoint
ALTER TABLE "scene_validation_results" ADD COLUMN "validator_id" text DEFAULT 'legacy' NOT NULL;--> statement-breakpoint
ALTER TABLE "scene_validation_results" ADD COLUMN "validator_version" text DEFAULT 'legacy-v1' NOT NULL;