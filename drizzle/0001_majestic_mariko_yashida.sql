CREATE TABLE "character_bible_versions" (
	"bible_version_id" text PRIMARY KEY NOT NULL,
	"resident_id" text NOT NULL,
	"version_key" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "character_bible_versions_version_key_unique" UNIQUE("version_key")
);
--> statement-breakpoint
CREATE TABLE "generation_attempts" (
	"attempt_id" text PRIMARY KEY NOT NULL,
	"scene_key" text NOT NULL,
	"attempt_ordinal" integer NOT NULL,
	"disposition" text NOT NULL,
	"identity_evidence" text NOT NULL,
	"provider_response_id" text,
	"adapter_version" text NOT NULL,
	"configuration_version" text NOT NULL,
	"prompt_version" text NOT NULL,
	"bible_version_key" text NOT NULL,
	"claim_version_key" text NOT NULL,
	"finish_reason" text NOT NULL,
	"usage" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_turns" (
	"turn_id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"turn_index" integer NOT NULL,
	"resident_id" text NOT NULL,
	"requested_model_id" text NOT NULL,
	"text" text NOT NULL,
	"ending" boolean NOT NULL,
	"effects" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "historical_claim_versions" (
	"claim_version_id" text PRIMARY KEY NOT NULL,
	"claim_id" text NOT NULL,
	"version_key" text NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "historical_claim_versions_version_key_unique" UNIQUE("version_key")
);
--> statement-breakpoint
CREATE TABLE "published_scene_revisions" (
	"revision_id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"scene_key" text NOT NULL,
	"expected_world_head" integer NOT NULL,
	"revision" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "published_scene_revisions_attempt_id_unique" UNIQUE("attempt_id"),
	CONSTRAINT "published_scene_revisions_scene_key_unique" UNIQUE("scene_key")
);
--> statement-breakpoint
CREATE TABLE "resident_model_versions" (
	"model_version_id" text PRIMARY KEY NOT NULL,
	"resident_id" text NOT NULL,
	"exact_model_id" text NOT NULL,
	"version_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resident_model_versions_version_key_unique" UNIQUE("version_key")
);
--> statement-breakpoint
CREATE TABLE "scene_briefs" (
	"scene_key" text PRIMARY KEY NOT NULL,
	"world_id" text NOT NULL,
	"expected_world_head" integer NOT NULL,
	"brief" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scene_validation_results" (
	"validation_id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"accepted" boolean NOT NULL,
	"code" text NOT NULL,
	"detail" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generation_attempts" ADD CONSTRAINT "generation_attempts_scene_key_scene_briefs_scene_key_fk" FOREIGN KEY ("scene_key") REFERENCES "public"."scene_briefs"("scene_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_turns" ADD CONSTRAINT "generation_turns_attempt_id_generation_attempts_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."generation_attempts"("attempt_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "published_scene_revisions" ADD CONSTRAINT "published_scene_revisions_attempt_id_generation_attempts_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."generation_attempts"("attempt_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "published_scene_revisions" ADD CONSTRAINT "published_scene_revisions_scene_key_scene_briefs_scene_key_fk" FOREIGN KEY ("scene_key") REFERENCES "public"."scene_briefs"("scene_key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_briefs" ADD CONSTRAINT "scene_briefs_world_id_worlds_world_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("world_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scene_validation_results" ADD CONSTRAINT "scene_validation_results_attempt_id_generation_attempts_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."generation_attempts"("attempt_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "generation_attempts_scene_ordinal_unique" ON "generation_attempts" USING btree ("scene_key","attempt_ordinal");--> statement-breakpoint
CREATE UNIQUE INDEX "generation_turns_attempt_index_unique" ON "generation_turns" USING btree ("attempt_id","turn_index");