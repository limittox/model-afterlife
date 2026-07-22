import { describe, expect, it } from "vitest";

async function loadEditorialRegistry() {
	try {
		const [residents, bibles, claims] = await Promise.all([
			import("../../src/features/world/fixtures/launch-residents.ts"),
			import("../../src/features/world/fixtures/character-bibles.ts"),
			import("../../src/features/world/fixtures/historical-claims.ts"),
		]);
		return { ...residents, ...bibles, ...claims };
	} catch {
		return undefined;
	}
}

function clone<T>(value: T): T {
	return structuredClone(value);
}

describe("historical grounding", () => {
	it("stores exhaustive category, source, confidence, scope, status, and order metadata", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;

		expect(new Set(registry.HISTORICAL_CLAIMS.map((claim) => claim.category))).toEqual(
			new Set(["documented", "reported", "exaggeration"]),
		);
		expect(registry.HISTORICAL_CLAIM_CATEGORY_LABELS).toEqual({
			documented: "Documented fact",
			reported: "Reported reputation",
			exaggeration: "Fictional exaggeration",
		});
		for (const claim of registry.HISTORICAL_CLAIMS) {
			expect(claim.claimId).toMatch(/^[a-z0-9-]+$/u);
			expect(claim.versionKey).toMatch(/^[a-z0-9.-]+$/u);
			expect(claim.scope.residentId).toMatch(/^[a-z0-9.-]+$/u);
			expect(claim.scope.exactModelIds.length).toBeGreaterThan(0);
			expect(claim.source.url).toMatch(/^https:\/\//u);
			expect(claim.source.title.trim()).not.toBe("");
			expect(claim.source.accessedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
			expect(["high", "medium"]).toContain(claim.confidence);
			expect(claim.editorialStatus).toBe("approved");
			expect(claim.stableOrder).toBeGreaterThan(0);
			expect(claim.statement).toBe(claim.statement.normalize("NFC"));
		}
	});

	it("gives every resident two or three ordered active traits with approved adjacent claims", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;

		const valid = {
			residents: registry.LAUNCH_RESIDENTS,
			bibles: registry.CHARACTER_BIBLES,
			claims: registry.HISTORICAL_CLAIMS,
		};
		expect(() => registry.validateLaunchResidentRegistry(valid)).not.toThrow();

		for (const bible of registry.CHARACTER_BIBLES) {
			expect(bible.traits).toHaveLength(3);
			expect(bible.traits.map((trait) => trait.stableOrder)).toEqual([1, 2, 3]);
			expect(bible.traits.every((trait) => trait.active)).toBe(true);
			expect(bible.traits.every((trait) => trait.approvedClaimIds.length > 0)).toBe(true);
			expect(bible.dignityNotes.trim()).not.toBe("");
			expect(bible.avoidanceNotes.trim()).not.toBe("");
			expect(bible.promptSubset.trim()).not.toBe("");
		}
	});

	it("rejects wrong-version adjacency, empty mappings, unapproved anecdotes, and category confusion", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;
		const valid = {
			residents: registry.LAUNCH_RESIDENTS,
			bibles: registry.CHARACTER_BIBLES,
			claims: registry.HISTORICAL_CLAIMS,
		};

		const wrongScopeClaims = clone(valid.claims);
		const firstClaimId = valid.bibles[0].traits[0].approvedClaimIds[0];
		const wrongScope = wrongScopeClaims.find((claim) => claim.claimId === firstClaimId);
		expect(wrongScope).toBeDefined();
		if (!wrongScope) return;
		wrongScope.scope.exactModelIds = ["openai/gpt-3.5-turbo-0125"];
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, claims: wrongScopeClaims })).toThrow(/model scope/i);

		const emptyMappings = clone(valid.bibles);
		emptyMappings[0].traits[0].approvedClaimIds = [];
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, bibles: emptyMappings })).toThrow(/claim/i);

		const unapprovedClaims = clone(valid.claims);
		unapprovedClaims[0].editorialStatus = "rejected";
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, claims: unapprovedClaims })).toThrow(/approved/i);

		const categorylessClaims = clone(valid.claims) as Array<Record<string, unknown>>;
		delete categorylessClaims[0].category;
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, claims: categorylessClaims })).toThrow(/category/i);

		const missingSource = clone(valid.claims) as Array<Record<string, unknown>>;
		delete missingSource[0].source;
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, claims: missingSource })).toThrow(/source/i);

		const missingScope = clone(valid.claims) as Array<Record<string, unknown>>;
		delete missingScope[0].scope;
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, claims: missingScope })).toThrow(/scope/i);
	});

	it("rejects empty or non-NFC bible and claim text while preserving explicit stable order", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;
		const valid = {
			residents: registry.LAUNCH_RESIDENTS,
			bibles: registry.CHARACTER_BIBLES,
			claims: registry.HISTORICAL_CLAIMS,
		};

		const emptyBible = clone(valid.bibles);
		emptyBible[0].promptSubset = "";
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, bibles: emptyBible })).toThrow(/prompt subset/i);

		const nonNfcClaims = clone(valid.claims);
		nonNfcClaims[0].statement = "Caf\u0065\u0301 context";
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, claims: nonNfcClaims })).toThrow(/nfc/i);

		const reorderedClaims = clone(valid.claims);
		const sameResident = reorderedClaims.filter(
			(claim) => claim.residentId === reorderedClaims[0].residentId,
		);
		sameResident[1].stableOrder = sameResident[0].stableOrder;
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, claims: reorderedClaims })).toThrow(/stable order/i);
	});

	it("does not seed the unverified BERT space anecdote", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;
		const serialized = JSON.stringify({
			residents: registry.LAUNCH_RESIDENTS,
			bibles: registry.CHARACTER_BIBLES,
			claims: registry.HISTORICAL_CLAIMS,
		}).toLowerCase();
		expect(serialized).not.toMatch(/bert.{0,80}space|space.{0,80}bert/u);
	});
});
