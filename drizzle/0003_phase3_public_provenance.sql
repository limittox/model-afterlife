CREATE TABLE "published_scene_claim_versions" (
	"revision_id" text NOT NULL,
	"turn_index" integer NOT NULL,
	"claim_version_id" text NOT NULL,
	CONSTRAINT "published_scene_claim_versions_pk" PRIMARY KEY("revision_id","turn_index","claim_version_id"),
	CONSTRAINT "published_scene_claim_versions_turn_index_nonnegative" CHECK ("published_scene_claim_versions"."turn_index" >= 0)
);
--> statement-breakpoint
ALTER TABLE "published_scene_claim_versions" ADD CONSTRAINT "published_scene_claim_versions_revision_id_published_scene_revisions_revision_id_fk" FOREIGN KEY ("revision_id") REFERENCES "public"."published_scene_revisions"("revision_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "published_scene_claim_versions" ADD CONSTRAINT "published_scene_claim_versions_claim_version_id_historical_claim_versions_claim_version_id_fk" FOREIGN KEY ("claim_version_id") REFERENCES "public"."historical_claim_versions"("claim_version_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "published_scene_claim_versions_claim_revision_idx" ON "published_scene_claim_versions" USING btree ("claim_version_id","revision_id");--> statement-breakpoint
DO $$
DECLARE
	invalid_binding_count integer;
BEGIN
	WITH requested_bindings AS (
		SELECT DISTINCT
			revision."revision_id",
			(turn_entry.value->>'turnIndex')::integer AS turn_index,
			claim_id.value AS claim_id,
			attempt."claim_version_key"
		FROM "published_scene_revisions" AS revision
		INNER JOIN "generation_attempts" AS attempt
			ON attempt."attempt_id" = revision."attempt_id"
		CROSS JOIN LATERAL jsonb_array_elements(
			COALESCE(revision."revision"->'turns', '[]'::jsonb)
		) WITH ORDINALITY AS turn_entry(value, ordinality)
		CROSS JOIN LATERAL jsonb_array_elements_text(
			COALESCE(turn_entry.value->'approvedClaimIds', '[]'::jsonb)
		) AS claim_id(value)
	),
	resolved_bindings AS (
		SELECT
			requested."revision_id",
			requested.turn_index,
			requested.claim_id,
			requested."claim_version_key",
			count(claim."claim_version_id") AS match_count
		FROM requested_bindings AS requested
		LEFT JOIN "historical_claim_versions" AS claim
			ON claim."claim_id" = requested.claim_id
			AND claim."content"->>'claimId' = requested.claim_id
			AND claim."content"->>'claimVersionId' = claim."claim_version_id"
			AND claim."content"->>'editorialStatus' = 'approved'
		GROUP BY
			requested."revision_id",
			requested.turn_index,
			requested.claim_id,
			requested."claim_version_key"
	)
	SELECT count(*) INTO invalid_binding_count
	FROM resolved_bindings
	WHERE "claim_version_key" <> 'historical-claims-v1'
		OR match_count <> 1;

	IF invalid_binding_count <> 0 THEN
		RAISE EXCEPTION
			'Published claim provenance backfill found % unresolved, ambiguous, or unsupported bindings.',
			invalid_binding_count;
	END IF;

	INSERT INTO "published_scene_claim_versions" (
		"revision_id",
		"turn_index",
		"claim_version_id"
	)
	SELECT DISTINCT
		requested."revision_id",
		requested.turn_index,
		claim."claim_version_id"
	FROM (
		SELECT DISTINCT
			revision."revision_id",
			(turn_entry.value->>'turnIndex')::integer AS turn_index,
			claim_id.value AS claim_id
		FROM "published_scene_revisions" AS revision
		CROSS JOIN LATERAL jsonb_array_elements(
			COALESCE(revision."revision"->'turns', '[]'::jsonb)
		) WITH ORDINALITY AS turn_entry(value, ordinality)
		CROSS JOIN LATERAL jsonb_array_elements_text(
			COALESCE(turn_entry.value->'approvedClaimIds', '[]'::jsonb)
		) AS claim_id(value)
	) AS requested
	INNER JOIN "historical_claim_versions" AS claim
		ON claim."claim_id" = requested.claim_id
		AND claim."content"->>'claimId' = requested.claim_id
		AND claim."content"->>'claimVersionId' = claim."claim_version_id"
		AND claim."content"->>'editorialStatus' = 'approved'
	ON CONFLICT DO NOTHING;
END
$$;
