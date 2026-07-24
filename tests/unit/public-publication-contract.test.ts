import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ScenePermalink } from "../../src/features/publication/components/ScenePermalink.tsx";
import {
	type CanonicalScene,
	CanonicalSceneReadResultSchema,
	CanonicalSceneSchema,
	canonicalScenePath,
} from "../../src/features/publication/contracts/public-publication.ts";
import { homeClockForLogicalTick } from "../../src/features/publication/domain/home-clock.ts";
import {
	assembleCanonicalScene,
	type CanonicalSceneRows,
} from "../../src/features/publication/server/read-canonical-scene.ts";
import {
	NON_AFFILIATION_DISCLOSURE,
	STAGED_FICTION_DISCLOSURE,
} from "../../src/features/world/components/TransparencyNotice.tsx";
import { HISTORICAL_CLAIMS } from "../../src/features/world/fixtures/historical-claims.ts";
import {
	PublishedSceneRevisionSchema,
	SceneBriefSchema,
} from "../../src/features/world/generation/contracts.ts";

const GPT_CLAIM_ID = "gpt4o-native-multimodal";
const CLAUDE_CLAIM_ID = "claude45-coding-and-agents";

function fixtureRows(input?: {
	revisionId?: string;
	turnCount?: number;
	duplicateFirstClaim?: boolean;
	longText?: string;
}): CanonicalSceneRows {
	const revisionId = input?.revisionId ?? "canonical-scene-alpha";
	const turnCount = input?.turnCount ?? 4;
	const speakerOrder = Array.from({ length: turnCount }, (_, index) =>
		index % 2 === 0 ? "gpt-4o" : "claude-sonnet-4.5",
	);
	const premise =
		input?.longText ??
		"A brass tea timer becomes the subject of a careful repair.";
	const brief = SceneBriefSchema.parse({
		schemaVersion: 1,
		briefId: `brief:${revisionId}`,
		sceneKey: `scene:${revisionId}`,
		expectedWorldHead: 80,
		participantIds: ["gpt-4o", "claude-sonnet-4.5"],
		speakerOrder,
		locationId: "tea-nook",
		premise,
		allowedFactIds: [GPT_CLAIM_ID, CLAUDE_CLAIM_ID],
		tone: "Warm and precise.",
		turnBudget: turnCount,
		permittedOutcome: "The timer is repaired and chimes once.",
		permittedRelationshipEffects: [],
	});
	const revision = PublishedSceneRevisionSchema.parse({
		revisionId,
		attemptId: `attempt:${revisionId}`,
		sceneKey: brief.sceneKey,
		expectedWorldHead: brief.expectedWorldHead,
		turns: speakerOrder.map((residentId, turnIndex) => {
			const approvedClaimIds =
				turnIndex === 0
					? input?.duplicateFirstClaim
						? [GPT_CLAIM_ID, GPT_CLAIM_ID]
						: [GPT_CLAIM_ID]
					: turnIndex === 1
						? [CLAUDE_CLAIM_ID]
						: [];
			return {
				turnIndex,
				residentId,
				requestedModelId:
					residentId === "gpt-4o"
						? "openai/gpt-4o"
						: "anthropic/claude-sonnet-4.5",
				text:
					input?.longText ??
					`Resident turn ${turnIndex + 1} settles the brass timer repair.`,
				approvedClaimIds,
				ending: turnIndex === turnCount - 1,
				effects: [],
			};
		}),
		relationshipEffects: [],
		sharedExperience: {
			summary: brief.permittedOutcome,
			tags: ["tea-nook", "resident:gpt-4o", "resident:claude-sonnet-4.5"],
		},
	});
	const scene = {
		id: revisionId,
		premise: brief.premise,
		locationId: brief.locationId,
		participantIds: brief.participantIds,
		startedAtTick: 144,
		durationTicks: 1,
		presentationDurationMs: 12_000,
		turns: revision.turns.map((turn) => ({
			id: `${revisionId}:${turn.turnIndex}`,
			speakerId: turn.residentId,
			exactModelId: turn.requestedModelId,
			text: turn.text,
		})),
		deliveryMode: "live" as const,
		originalRevisionId: revisionId,
		originalSceneKey: revision.sceneKey,
	};
	const gptClaim = HISTORICAL_CLAIMS.find(
		(claim) => claim.claimId === GPT_CLAIM_ID,
	);
	const claudeClaim = HISTORICAL_CLAIMS.find(
		(claim) => claim.claimId === CLAUDE_CLAIM_ID,
	);
	if (!gptClaim || !claudeClaim) throw new Error("Claim fixtures are missing.");

	return {
		revisionId,
		revision,
		brief,
		publicationEvents: [
			{
				sequence: 81,
				logicalTick: 144,
				payload: {
					scene,
					revisionId,
					sceneKey: revision.sceneKey,
					briefId: brief.briefId,
				},
			},
		],
		claimBindings: [
			{
				turnIndex: 1,
				claimVersionId: claudeClaim.claimVersionId,
				content: claudeClaim,
			},
			{
				turnIndex: 0,
				claimVersionId: gptClaim.claimVersionId,
				content: gptClaim,
			},
		],
		causeEvents: [
			{
				type: "shared_experience_recorded",
				payload: {
					memory: {
						id: `memory:${revisionId}`,
						source: "published",
						causeRevisionId: revisionId,
						sceneKey: revision.sceneKey,
						participantIds: [...brief.participantIds].sort(),
						summary: revision.sharedExperience?.summary,
						tags: [...(revision.sharedExperience?.tags ?? [])].sort(),
						logicalTick: 144,
					},
				},
			},
		],
	};
}

function completeScene(rows = fixtureRows()): CanonicalScene {
	const result = assembleCanonicalScene(rows);
	if (result.kind !== "complete") {
		throw new Error(`Expected a complete scene, received ${result.kind}.`);
	}
	return result.scene;
}

describe("public publication contract", () => {
	it("assembles one strict complete scene with exact ordered provenance", () => {
		const scene = completeScene();

		expect(scene.turns).toHaveLength(4);
		expect(
			scene.historicalContext.map((claim) => [
				claim.turnIndex,
				claim.stableOrder,
				claim.claimVersionId,
			]),
		).toEqual([
			[0, 1, "claim-version:gpt4o-capability:v1"],
			[1, 1, "claim-version:claude45-capability:v1"],
		]);
		expect(scene.disclosures.exactModelIds).toEqual([
			"openai/gpt-4o",
			"anthropic/claude-sonnet-4.5",
		]);
		expect(scene.home).toEqual({
			logicalTick: 144,
			homeDay: 1,
			homeTime: "11:24",
			dayPeriod: "morning",
		});

		const serialized = JSON.stringify(scene);
		for (const privateField of [
			"attemptId",
			"promptVersion",
			"providerResponseId",
			"rawResponse",
			"usage",
			"cost",
			"hiddenReasoning",
			"calibration",
			"friendship",
			"rivalry",
			"familiarity",
			"delta",
		]) {
			expect(serialized).not.toContain(`"${privateField}"`);
		}
	});

	it("fails the whole read when any approved claim binding is unresolved", () => {
		const rows = fixtureRows();
		rows.claimBindings = rows.claimBindings.filter(
			(binding) => binding.turnIndex !== 1,
		);

		expect(assembleCanonicalScene(rows)).toEqual({
			kind: "known-unavailable",
			revisionId: rows.revisionId,
			reason: "canonical-record-incomplete",
		});
	});

	it("emits no historical context for claim-free scenes", () => {
		const rows = fixtureRows();
		const revision = PublishedSceneRevisionSchema.parse({
			...rows.revision,
			turns: (
				rows.revision as { turns: Array<Record<string, unknown>> }
			).turns.map((turn) => ({ ...turn, approvedClaimIds: [] })),
		});
		rows.revision = revision;
		rows.claimBindings = [];

		expect(completeScene(rows).historicalContext).toEqual([]);
	});

	it("retains adjacent turn bindings while duplicate tuples stay idempotent", () => {
		const adjacent = completeScene();
		expect(adjacent.historicalContext.map((claim) => claim.turnIndex)).toEqual([
			0, 1,
		]);

		const duplicateRows = fixtureRows({ duplicateFirstClaim: true });
		const duplicate = assembleCanonicalScene(duplicateRows);
		expect(duplicate.kind).toBe("complete");
		if (duplicate.kind === "complete") {
			expect(duplicate.scene.turns[0]?.claimVersionIds).toEqual([
				"claim-version:gpt4o-capability:v1",
			]);
		}
	});

	it("sorts historical context independently of query row order", () => {
		const rows = fixtureRows();
		const forward = assembleCanonicalScene(rows);
		const permuted = assembleCanonicalScene({
			...rows,
			claimBindings: [...rows.claimBindings].reverse(),
			causeEvents: [...rows.causeEvents].reverse(),
			publicationEvents: [...rows.publicationEvents].reverse(),
		});

		expect(permuted).toEqual(forward);
	});

	it("derives distinct permanent paths from equal-content immutable revisions", () => {
		const alpha = completeScene(fixtureRows({ revisionId: "revision-alpha" }));
		const beta = completeScene(fixtureRows({ revisionId: "revision-beta" }));

		expect(alpha.premise).toBe(beta.premise);
		expect(alpha.canonicalPath).toBe("/scenes/revision-alpha");
		expect(beta.canonicalPath).toBe("/scenes/revision-beta");
		expect(alpha.canonicalPath).not.toBe(beta.canonicalPath);
	});

	it("rejects blank, malformed, and synthetic cached presentation IDs", () => {
		for (const invalidId of [
			"",
			" ",
			"/scene",
			"scene?draft=true",
			"cached:brief:revision",
			"x".repeat(161),
		]) {
			expect(canonicalScenePath(invalidId)).toBeNull();
		}
	});

	it("produces the same revision URLs regardless of input enumeration order", () => {
		const ids = ["revision-z", "revision-a", "revision-m"];
		const paths = new Map(ids.map((id) => [id, canonicalScenePath(id)]));
		const permuted = new Map(
			[...ids].reverse().map((id) => [id, canonicalScenePath(id)]),
		);

		expect(permuted).toEqual(paths);
	});

	it("rejects every partial canonical scene field and private extensions", () => {
		const scene = completeScene();
		for (const field of [
			"revisionId",
			"canonicalPath",
			"publicationSequence",
			"premise",
			"cast",
			"home",
			"location",
			"turns",
			"outcome",
			"historicalContext",
			"disclosures",
		] as const) {
			const partial = structuredClone(scene) as Record<string, unknown>;
			delete partial[field];
			expect(CanonicalSceneSchema.safeParse(partial).success).toBe(false);
		}
		expect(
			CanonicalSceneSchema.safeParse({
				...scene,
				usage: { inputTokens: 100 },
			}).success,
		).toBe(false);
	});

	it("renders four and ten ordered complete turns with exact attribution", () => {
		for (const turnCount of [4, 10]) {
			const scene = completeScene(fixtureRows({ turnCount }));
			const html = renderToStaticMarkup(
				createElement(ScenePermalink, {
					result: { kind: "complete", scene },
				}),
			);

			expect(html.match(/class="dialogue-turn"/gu)).toHaveLength(turnCount);
			expect(html.indexOf("Resident turn 1")).toBeLessThan(
				html.indexOf(`Resident turn ${turnCount}`),
			);
			expect(html).toContain("openai/gpt-4o");
			expect(html).toContain("anthropic/claude-sonnet-4.5");
		}
	});

	it("keeps long canonical text and reflow safeguards in semantic markup", () => {
		const longText = `A long exact canonical sentence ${"contextual-detail-".repeat(40)}`;
		const scene = completeScene(fixtureRows({ longText }));
		const html = renderToStaticMarkup(
			createElement(ScenePermalink, {
				result: { kind: "complete", scene },
			}),
		);

		expect(html).toContain(longText);
		expect(html).toContain("overflow-wrap:anywhere");
		expect(html).toContain("<main");
		expect(html).toContain("<ol");
	});

	it("keeps staged-fiction and non-affiliation copy on all surface states", () => {
		const complete = renderToStaticMarkup(
			createElement(ScenePermalink, {
				result: { kind: "complete", scene: completeScene() },
			}),
		);
		const loading = renderToStaticMarkup(
			createElement(ScenePermalink, { result: { kind: "loading" } }),
		);
		const unavailable = renderToStaticMarkup(
			createElement(ScenePermalink, {
				result: {
					kind: "known-unavailable",
					revisionId: "canonical-scene-alpha",
					reason: "canonical-record-incomplete",
				},
			}),
		);

		for (const html of [complete, loading, unavailable]) {
			expect(html).toContain(STAGED_FICTION_DISCLOSURE);
			expect(html).toContain(NON_AFFILIATION_DISCLOSURE);
		}
		expect(loading).not.toContain("Exact model provenance");
		expect(unavailable).not.toContain("Exact model provenance");
		expect(loading).not.toContain("openai/gpt-4o");
		expect(unavailable).not.toContain("openai/gpt-4o");
		expect(
			CanonicalSceneReadResultSchema.safeParse({
				kind: "known-unavailable",
				revisionId: "canonical-scene-alpha",
				reason: "canonical-record-incomplete",
				exactModelIds: ["guessed/model"],
			}).success,
		).toBe(false);
	});

	it("formats home time deterministically across home-day boundaries", () => {
		expect(homeClockForLogicalTick(0)).toMatchObject({
			homeDay: 1,
			homeTime: "09:00",
			dayPeriod: "morning",
		});
		expect(homeClockForLogicalTick(15 * 60)).toMatchObject({
			homeDay: 2,
			homeTime: "00:00",
			dayPeriod: "morning",
		});
		expect(() => homeClockForLogicalTick(-1)).toThrow(RangeError);
	});
});
