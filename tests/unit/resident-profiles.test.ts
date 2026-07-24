import { describe, expect, it } from "vitest";
import {
	PROFILE_SECTION_IDS,
	RESIDENT_PROFILES,
} from "../../src/features/residents/fixtures/resident-profiles.ts";
import {
	assembleResidentDirectory,
	assembleResidentProfile,
} from "../../src/features/publication/server/read-resident-profile.ts";
import { relationshipPhrase } from "../../src/features/publication/server/relationship-phrases.ts";
import { HISTORICAL_CLAIMS } from "../../src/features/world/fixtures/historical-claims.ts";
import { LAUNCH_RESIDENTS } from "../../src/features/world/fixtures/launch-residents.ts";

describe("reviewed resident profile registry", () => {
	it("publishes exactly six distinct profiles in fixed launch and section order", () => {
		const directory = assembleResidentDirectory({
			definitions: [...RESIDENT_PROFILES].reverse(),
			residents: [
				...LAUNCH_RESIDENTS.slice(3),
				...LAUNCH_RESIDENTS.slice(0, 3),
			],
			claims: [...HISTORICAL_CLAIMS].reverse(),
		});
		expect(directory.kind).toBe("ready");
		if (directory.kind !== "ready") return;
		expect(directory.residents.map((resident) => resident.residentId)).toEqual(
			LAUNCH_RESIDENTS.map((resident) => resident.id),
		);
		expect(new Set(directory.residents.map((resident) => resident.significance)).size).toBe(
			6,
		);
		for (const resident of directory.residents) {
			const result = assembleResidentProfile({
				residentId: resident.residentId,
				definitions: [...RESIDENT_PROFILES].reverse(),
				claims: [...HISTORICAL_CLAIMS].reverse(),
			});
			expect(result.kind).toBe("complete");
			if (result.kind !== "complete") continue;
			expect(result.profile.sections.map((section) => section.id)).toEqual(
				PROFILE_SECTION_IDS,
			);
			expect(result.profile.profilePath).toBe(
				`/residents/${encodeURIComponent(resident.residentId)}`,
			);
			expect(result.profile.behaviors).toHaveLength(1);
		}
	});

	it("fails the directory closed for zero, partial, duplicate, or invalid profile data", () => {
		expect(assembleResidentDirectory({ definitions: [] })).toEqual({
			kind: "error",
		});
		expect(
			assembleResidentDirectory({
				definitions: RESIDENT_PROFILES.slice(0, 5),
			}),
		).toEqual({ kind: "error" });
		expect(
			assembleResidentDirectory({
				definitions: [
					...RESIDENT_PROFILES.slice(0, 5),
					structuredClone(RESIDENT_PROFILES[0]),
				].filter((profile) => profile !== undefined),
			}),
		).toEqual({ kind: "error" });
	});

	it("keeps exact versions distinct and rejects duplicate or cross-scoped references", () => {
		const alternateClaims = structuredClone(HISTORICAL_CLAIMS);
		const original = HISTORICAL_CLAIMS.find(
			(claim) =>
				claim.claimVersionId === "claim-version:gpt4o-reputation:v1",
		);
		if (!original) throw new Error("Reviewed GPT-4o claim missing.");
		alternateClaims.push({
			...structuredClone(original),
			claimVersionId: "claim-version:gpt4o-reputation:v2",
			versionKey: "gpt4o-versatile-flagship-reputation.v2",
			statement: "A different reviewed version that must not replace version one.",
		});
		const exact = assembleResidentProfile({
			residentId: "gpt-4o",
			claims: alternateClaims,
		});
		expect(exact.kind).toBe("complete");
		if (exact.kind === "complete") {
			expect(
				exact.profile.sections[0]?.claims[0]?.claimVersionId,
			).toBe("claim-version:gpt4o-reputation:v1");
			expect(JSON.stringify(exact)).not.toContain("must not replace version one");
		}

		const duplicate = structuredClone(RESIDENT_PROFILES[0]);
		if (!duplicate) throw new Error("GPT-4o profile missing.");
		const duplicateReference =
			duplicate.sections[0]?.claimReferences[0];
		if (!duplicateReference) throw new Error("GPT-4o reference missing.");
		duplicate.sections[0]?.claimReferences.push(
			structuredClone(duplicateReference),
		);
		expect(
			assembleResidentProfile({
				residentId: "gpt-4o",
				definitions: [duplicate],
			}).kind,
		).toBe("known-unavailable");

		const crossScoped = structuredClone(RESIDENT_PROFILES[0]);
		if (!crossScoped) throw new Error("GPT-4o profile missing.");
		const crossReference = crossScoped.sections[0]?.claimReferences[0];
		if (!crossReference) throw new Error("GPT-4o reference missing.");
		crossReference.claimVersionId = "claim-version:claude45-reputation:v1";
		crossReference.claimId = "claude45-meticulous-reputation";
		expect(
			assembleResidentProfile({
				residentId: "gpt-4o",
				definitions: [crossScoped],
			}).kind,
		).toBe("known-unavailable");
	});

	it("fails closed for every missing evidence field and incomplete narrative shape", () => {
		const firstClaim = (claims: typeof HISTORICAL_CLAIMS) => {
			const claim = claims[0];
			if (!claim) throw new Error("Historical claim fixture missing.");
			return claim;
		};
		for (const mutation of [
			(claims: typeof HISTORICAL_CLAIMS) => {
				firstClaim(claims).source.url = "";
			},
			(claims: typeof HISTORICAL_CLAIMS) => {
				firstClaim(claims).source.accessedOn = "";
			},
			(claims: typeof HISTORICAL_CLAIMS) => {
				firstClaim(claims).scope.exactModelIds = [];
			},
		]) {
			const claims = structuredClone(HISTORICAL_CLAIMS);
			mutation(claims);
			expect(
				assembleResidentProfile({ residentId: "gpt-4o", claims }).kind,
			).toBe("known-unavailable");
		}

		const missingSection = structuredClone(RESIDENT_PROFILES[1]);
		if (!missingSection) throw new Error("Claude profile missing.");
		missingSection.sections.splice(2, 1);
		expect(
			assembleResidentProfile({
				residentId: missingSection.residentId,
				definitions: [missingSection],
			}).kind,
		).toBe("known-unavailable");
	});

	it("maps every nonzero qualitative relationship direction exhaustively", () => {
		expect(relationshipPhrase("friendship", 1)).toBe(
			"Their friendship grew.",
		);
		expect(relationshipPhrase("friendship", -1)).toBe(
			"Their friendship eased.",
		);
		expect(relationshipPhrase("rivalry", 1)).toBe(
			"Their rivalry sharpened.",
		);
		expect(relationshipPhrase("rivalry", -1)).toBe(
			"Their rivalry softened.",
		);
		expect(relationshipPhrase("familiarity", 1)).toBe(
			"They became more familiar with one another.",
		);
		expect(relationshipPhrase("familiarity", -1)).toBe(
			"Their familiarity receded.",
		);
	});
});
