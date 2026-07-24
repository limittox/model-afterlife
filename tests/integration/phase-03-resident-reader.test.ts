import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResidentProfile } from "../../src/features/residents/components/ResidentProfile.tsx";
import { RESIDENT_PROFILES } from "../../src/features/residents/fixtures/resident-profiles.ts";
import type { CanonicalScene } from "../../src/features/publication/contracts/public-publication.ts";
import {
	assembleLatestRelationshipSummary,
	assembleResidentProfile,
} from "../../src/features/publication/server/read-resident-profile.ts";
import { HISTORICAL_CLAIMS } from "../../src/features/world/fixtures/historical-claims.ts";

function canonicalScene(description: string): CanonicalScene {
	return {
		revisionId: "revision:gpt-claude",
		canonicalPath: "/scenes/revision%3Agpt-claude",
		publicationSequence: 7,
		premise: "A careful parlour repair",
		cast: [
			{
				residentId: "gpt-4o",
				displayName: "GPT-4o",
				profilePath: "/residents/gpt-4o",
				exactModelId: "openai/gpt-4o",
			},
			{
				residentId: "claude-sonnet-4.5",
				displayName: "Claude Sonnet 4.5",
				profilePath: "/residents/claude-sonnet-4.5",
				exactModelId: "anthropic/claude-4.5-sonnet-20250929",
			},
		],
		home: {
			logicalTick: 7,
			homeDay: 1,
			homeTime: "09:07",
			dayPeriod: "morning",
		},
		location: { id: "parlour", name: "Parlour" },
		turns: Array.from({ length: 4 }, (_, turnIndex) => ({
			turnIndex,
			speakerId: turnIndex % 2 === 0 ? "gpt-4o" : "claude-sonnet-4.5",
			speakerName:
				turnIndex % 2 === 0 ? "GPT-4o" : "Claude Sonnet 4.5",
			speakerProfilePath:
				turnIndex % 2 === 0
					? "/residents/gpt-4o"
					: "/residents/claude-sonnet-4.5",
			exactModelId:
				turnIndex % 2 === 0
					? "openai/gpt-4o"
					: "anthropic/claude-4.5-sonnet-20250929",
			text: `Turn ${turnIndex + 1}`,
			claimVersionIds: [],
		})),
		outcome: {
			summary: "The repair is complete.",
			sharedExperience: null,
			relationshipChanges: [
				{
					residentAId: "gpt-4o",
					residentAName: "GPT-4o",
					residentAProfilePath: "/residents/gpt-4o",
					residentBId: "claude-sonnet-4.5",
					residentBName: "Claude Sonnet 4.5",
					residentBProfilePath: "/residents/claude-sonnet-4.5",
					dimension: "friendship",
					description,
				},
			],
		},
		historicalContext: [],
		disclosures: {
			stagedFiction: "Staged fiction.",
			aiAuthorship: "AI-authored dialogue.",
			exactModelIds: [
				"openai/gpt-4o",
				"anthropic/claude-4.5-sonnet-20250929",
			],
			nonAffiliation: "Not affiliated.",
		},
	};
}

describe("Phase 3 resident profile tracer", () => {
	it("closes the GPT-4o profile over exact approved scoped claim versions", () => {
		const result = assembleResidentProfile({ residentId: "gpt-4o" });
		expect(result.kind).toBe("complete");
		if (result.kind !== "complete") return;
		expect(result.profile.sections.map((section) => section.id)).toEqual([
			"real-world-significance",
			"lineage",
			"architecture-and-capabilities",
			"documented-limitations",
			"fictional-retirement",
		]);
		for (const section of result.profile.sections) {
			for (const claim of section.claims) {
				const ledgerClaim = HISTORICAL_CLAIMS.find(
					(candidate) =>
						candidate.claimVersionId === claim.claimVersionId,
				);
				expect(ledgerClaim).toMatchObject({
					claimId: claim.claimId,
					residentId: "gpt-4o",
					category: claim.category,
					editorialStatus: "approved",
				});
				expect(claim.scope.exactModelIds).toContain("openai/gpt-4o");
				expect(claim.source.url).toMatch(/^https:\/\//u);
				expect(claim.source.accessedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
			}
		}
		expect(JSON.stringify(result)).not.toMatch(
			/prompt|providerResponse|hiddenReasoning|usage|cost|rawRelationship|score|delta|meter|rank|progress/u,
		);
	});

	it("fails closed for cross-scoped, unreviewed, missing, or incomplete evidence", () => {
		const profile = structuredClone(RESIDENT_PROFILES[0]);
		if (!profile) throw new Error("GPT-4o profile fixture missing.");
		const firstReference = profile.sections[0]?.claimReferences[0];
		if (!firstReference) throw new Error("GPT-4o profile evidence missing.");
		firstReference.claimVersionId = "claim-version:claude45-reputation:v1";
		expect(
			assembleResidentProfile({
				residentId: "gpt-4o",
				definitions: [profile],
			}).kind,
		).toBe("known-unavailable");

		const unreviewedClaims = structuredClone(HISTORICAL_CLAIMS);
		const referenced = unreviewedClaims.find(
			(claim) =>
				claim.claimVersionId === "claim-version:gpt4o-capability:v1",
		);
		if (!referenced) throw new Error("Claim fixture missing.");
		referenced.editorialStatus = "rejected";
		expect(
			assembleResidentProfile({
				residentId: "gpt-4o",
				claims: unreviewedClaims,
			}).kind,
		).toBe("known-unavailable");

		const missingSection = structuredClone(RESIDENT_PROFILES[0]);
		if (!missingSection) throw new Error("Profile fixture missing.");
		missingSection.sections.pop();
		expect(
			assembleResidentProfile({
				residentId: "gpt-4o",
				definitions: [missingSection],
			}).kind,
		).toBe("known-unavailable");

		const noBehaviors = structuredClone(RESIDENT_PROFILES[0]);
		if (!noBehaviors) throw new Error("Profile fixture missing.");
		noBehaviors.behaviors = [];
		expect(
			assembleResidentProfile({
				residentId: "gpt-4o",
				definitions: [noBehaviors],
			}).kind,
		).toBe("known-unavailable");
	});

	it("renders native disclosures with five distinct titled sections and semantic recovery states", () => {
		const result = assembleResidentProfile({ residentId: "gpt-4o" });
		const markup = renderToStaticMarkup(
			createElement(ResidentProfile, { result }),
		);
		expect(markup).toContain("<details");
		for (const heading of [
			"The joke",
			"Historical inspiration",
			"Fictional exaggeration",
			"Uncertainty and scope",
			"Sources",
		]) {
			expect(markup).toContain(`<h3>${heading}</h3>`);
		}
		expect(markup).toContain("No recent relationship change is available.");
		expect(markup).toContain("overflow-wrap:anywhere");
		expect(
			renderToStaticMarkup(
				createElement(ResidentProfile, {
					result: { kind: "not-found" },
				}),
			),
		).toContain("Resident profile not found");
	});

	it("uses only the newest complete nonzero cause-backed relationship scene", async () => {
		const candidates = [
			{
				sequence: 9,
				payload: {
					causeRevisionId: "revision:incomplete",
					residentAId: "gpt-4o",
					residentBId: "claude-sonnet-4.5",
					dimension: "friendship",
					delta: 1,
				},
			},
			{
				sequence: 8,
				payload: {
					causeRevisionId: "revision:zero",
					residentAId: "gpt-4o",
					residentBId: "claude-sonnet-4.5",
					dimension: "friendship",
					delta: 0,
				},
			},
			{
				sequence: 7,
				payload: {
					causeRevisionId: "revision:gpt-claude",
					residentAId: "gpt-4o",
					residentBId: "claude-sonnet-4.5",
					dimension: "friendship",
					delta: 1,
				},
			},
		];
		const summary = await assembleLatestRelationshipSummary(
			"gpt-4o",
			candidates,
			async (revisionId) =>
				revisionId === "revision:gpt-claude"
					? {
							kind: "complete",
							scene: canonicalScene("Their friendship grew."),
						}
					: {
							kind: "known-unavailable",
							revisionId,
							reason: "canonical-record-incomplete",
						},
		);
		expect(summary).toEqual({
			counterpartResidentId: "claude-sonnet-4.5",
			counterpartName: "Claude Sonnet 4.5",
			counterpartProfilePath: "/residents/claude-sonnet-4.5",
			dimension: "friendship",
			description: "Their friendship grew.",
			scene: {
				revisionId: "revision:gpt-claude",
				href: "/scenes/revision%3Agpt-claude",
				label: "A careful parlour repair",
			},
		});
		expect(JSON.stringify(summary)).not.toMatch(/delta|score|meter|rank|progress/u);
	});
});
