import { pathToFileURL } from "node:url";
import { sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { createWorldDatabase } from "../src/db/client.ts";
import { publishedSceneClaimVersions } from "../src/db/schema.ts";

const SUPPORTED_CLAIM_SET_VERSION = "historical-claims-v1";
const ModeSchema = z.enum(["--dry-run", "--apply", "--check"]);
const nonBlank = z.string().trim().min(1);

const RequestedBindingRowSchema = z.object({
	revision_id: nonBlank,
	turn_index: z.number().int().nonnegative(),
	claim_id: nonBlank,
	claim_version_key: nonBlank,
});
const ClaimRowSchema = z.object({
	claim_version_id: nonBlank,
	claim_id: nonBlank,
	content: z.record(z.string(), z.unknown()),
});
const ExistingBindingRowSchema = z.object({
	revision_id: nonBlank,
	turn_index: z.number().int().nonnegative(),
	claim_version_id: nonBlank,
});

type BackfillMode = z.infer<typeof ModeSchema>;
type RequestedBindingRow = z.infer<typeof RequestedBindingRowSchema>;
type ClaimRow = z.infer<typeof ClaimRowSchema>;
type ExistingBindingRow = z.infer<typeof ExistingBindingRowSchema>;

export type BackfillReport = {
	mode: BackfillMode;
	total: number;
	resolved: number;
	unresolved: number;
	ambiguous: number;
	pending: number;
	extra: number;
	applied: number;
};

type SqlResult = { rows: unknown[] };
type ExecuteSql = (query: SQL) => Promise<SqlResult>;

function assertLocalPhaseDatabase(): void {
	const purpose = process.env.DATABASE_PURPOSE;
	if (purpose !== "development" && purpose !== "test") {
		throw new Error(
			"Backfill requires DATABASE_PURPOSE=development or DATABASE_PURPOSE=test.",
		);
	}
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) throw new Error("DATABASE_URL is required.");
	const parsed = new URL(databaseUrl);
	const expectedDatabase =
		purpose === "development"
			? "model_afterlife_app"
			: "model_afterlife_test";
	if (parsed.pathname.slice(1) !== expectedDatabase) {
		throw new Error(
			`Refusing ${purpose} backfill outside ${expectedDatabase}.`,
		);
	}
	const proxyHost = process.env.NEON_WS_PROXY?.split("/")[0]?.split(":")[0];
	const databaseIsLocal =
		["localhost", "127.0.0.1", "db"].includes(parsed.hostname) &&
		(parsed.hostname !== "db" ||
			proxyHost === "localhost" ||
			proxyHost === "127.0.0.1");
	if (!databaseIsLocal) {
		throw new Error("Backfill is restricted to the configured local database.");
	}
}

function bindingKey(input: {
	revisionId: string;
	turnIndex: number;
	claimVersionId: string;
}): string {
	return `${input.revisionId}\u0000${input.turnIndex}\u0000${input.claimVersionId}`;
}

function claimContentMatchesRow(row: ClaimRow): boolean {
	return (
		row.content.claimId === row.claim_id &&
		row.content.claimVersionId === row.claim_version_id &&
		row.content.editorialStatus === "approved"
	);
}

async function loadEvidence(execute: ExecuteSql) {
	const [requestedResult, claimsResult, existingResult] = await Promise.all([
		execute(sql`
			SELECT DISTINCT
				revision.revision_id,
				(turn_entry.value->>'turnIndex')::integer AS turn_index,
				claim_id.value AS claim_id,
				attempt.claim_version_key
			FROM published_scene_revisions AS revision
			INNER JOIN generation_attempts AS attempt
				ON attempt.attempt_id = revision.attempt_id
			CROSS JOIN LATERAL jsonb_array_elements(
				COALESCE(revision.revision->'turns', '[]'::jsonb)
			) AS turn_entry(value)
			CROSS JOIN LATERAL jsonb_array_elements_text(
				COALESCE(turn_entry.value->'approvedClaimIds', '[]'::jsonb)
			) AS claim_id(value)
		`),
		execute(sql`
			SELECT claim_version_id, claim_id, content
			FROM historical_claim_versions
		`),
		execute(sql`
			SELECT revision_id, turn_index, claim_version_id
			FROM published_scene_claim_versions
		`),
	]);
	return {
		requested: z.array(RequestedBindingRowSchema).parse(requestedResult.rows),
		claims: z.array(ClaimRowSchema).parse(claimsResult.rows),
		existing: z.array(ExistingBindingRowSchema).parse(existingResult.rows),
	};
}

function evaluateEvidence(input: {
	mode: BackfillMode;
	requested: readonly RequestedBindingRow[];
	claims: readonly ClaimRow[];
	existing: readonly ExistingBindingRow[];
}): {
	report: BackfillReport;
	missing: Array<{
		revisionId: string;
		turnIndex: number;
		claimVersionId: string;
	}>;
} {
	const expected = new Map<
		string,
		{ revisionId: string; turnIndex: number; claimVersionId: string }
	>();
	let unresolvedResolution = 0;
	let ambiguous = 0;

	for (const request of input.requested) {
		if (request.claim_version_key !== SUPPORTED_CLAIM_SET_VERSION) {
			unresolvedResolution += 1;
			continue;
		}
		const matches = input.claims.filter(
			(claim) =>
				claim.claim_id === request.claim_id && claimContentMatchesRow(claim),
		);
		if (matches.length === 0) {
			unresolvedResolution += 1;
			continue;
		}
		if (matches.length > 1) {
			ambiguous += 1;
			continue;
		}
		const match = matches[0];
		if (!match) {
			unresolvedResolution += 1;
			continue;
		}
		const binding = {
			revisionId: request.revision_id,
			turnIndex: request.turn_index,
			claimVersionId: match.claim_version_id,
		};
		expected.set(bindingKey(binding), binding);
	}

	const existingKeys = new Set(
		input.existing.map((binding) =>
			bindingKey({
				revisionId: binding.revision_id,
				turnIndex: binding.turn_index,
				claimVersionId: binding.claim_version_id,
			}),
		),
	);
	const missing = [...expected.entries()]
		.filter(([key]) => !existingKeys.has(key))
		.map(([, binding]) => binding);
	const extra = input.existing.filter(
		(binding) =>
			!expected.has(
				bindingKey({
					revisionId: binding.revision_id,
					turnIndex: binding.turn_index,
					claimVersionId: binding.claim_version_id,
				}),
			),
	).length;
	const checkOnlyFailures =
		input.mode === "--check" ? missing.length + extra : extra;

	return {
		report: {
			mode: input.mode,
			total: input.requested.length,
			resolved: expected.size,
			unresolved: unresolvedResolution + checkOnlyFailures,
			ambiguous,
			pending: missing.length,
			extra,
			applied: 0,
		},
		missing,
	};
}

async function evidenceFor(
	mode: BackfillMode,
	execute: ExecuteSql,
): Promise<ReturnType<typeof evaluateEvidence>> {
	const evidence = await loadEvidence(execute);
	return evaluateEvidence({ mode, ...evidence });
}

export async function runBackfill(modeInput: string): Promise<BackfillReport> {
	const mode = ModeSchema.parse(modeInput);
	assertLocalPhaseDatabase();
	const { db, close } = createWorldDatabase();
	try {
		if (mode !== "--apply") {
			const result = await evidenceFor(mode, (query) =>
				db.execute(query) as Promise<SqlResult>,
			);
			if (
				mode === "--check" &&
				(result.report.unresolved !== 0 || result.report.ambiguous !== 0)
			) {
				throw new Error(
					`Evidence check failed: unresolved=${result.report.unresolved} ambiguous=${result.report.ambiguous}.`,
				);
			}
			return result.report;
		}

		return await db.transaction(async (transaction) => {
			const result = await evidenceFor(mode, (query) =>
				transaction.execute(query) as Promise<SqlResult>,
			);
			if (
				result.report.unresolved !== 0 ||
				result.report.ambiguous !== 0 ||
				result.report.extra !== 0
			) {
				throw new Error(
					`Refusing apply: unresolved=${result.report.unresolved} ambiguous=${result.report.ambiguous} extra=${result.report.extra}.`,
				);
			}
			if (result.missing.length > 0) {
				await transaction
					.insert(publishedSceneClaimVersions)
					.values(result.missing)
					.onConflictDoNothing();
			}
			return {
				...result.report,
				applied: result.missing.length,
			};
		});
	} finally {
		await close();
	}
}

async function main(): Promise<void> {
	const mode = ModeSchema.parse(process.argv[2]);
	if (process.argv.length !== 3) {
		throw new Error("Use exactly one mode: --dry-run, --apply, or --check.");
	}
	const report = await runBackfill(mode);
	process.stdout.write(`${JSON.stringify(report)}\n`);
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
	main().catch((error: unknown) => {
		const message = error instanceof Error ? error.message : "Backfill failed.";
		process.stderr.write(`${message}\n`);
		process.exitCode = 1;
	});
}
