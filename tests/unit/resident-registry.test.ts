import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const EXPECTED_RESIDENTS = [
	{
		id: "gpt-4o",
		requestedModelId: "openai/gpt-4o",
		canonicalModelId: "openai/gpt-4o",
		approvedUpstream: "openai",
		maxOutputTokens: 180,
	},
	{
		id: "claude-sonnet-4.5",
		requestedModelId: "anthropic/claude-sonnet-4.5",
		canonicalModelId: "anthropic/claude-4.5-sonnet-20250929",
		approvedUpstream: "anthropic",
		maxOutputTokens: 180,
	},
	{
		id: "gemini-2.5-pro",
		requestedModelId: "google/gemini-2.5-pro",
		canonicalModelId: "google/gemini-2.5-pro",
		approvedUpstream: "google-ai-studio",
		maxOutputTokens: 1024,
		reasoning: { max_tokens: 128, exclude: true },
	},
	{
		id: "deepseek-v3.2",
		requestedModelId: "deepseek/deepseek-v3.2",
		canonicalModelId: "deepseek/deepseek-v3.2-20251201",
		approvedUpstream: "deepinfra/fp4",
		requiredQuantization: "fp4",
		maxOutputTokens: 180,
		reasoning: { enabled: false, effort: "none", exclude: true },
	},
	{
		id: "llama-3.3-70b-instruct",
		requestedModelId: "meta-llama/llama-3.3-70b-instruct",
		canonicalModelId: "meta-llama/llama-3.3-70b-instruct",
		approvedUpstream: "together",
		requiredQuantization: "fp8",
		maxOutputTokens: 180,
	},
	{
		id: "qwen-2.5-7b-instruct",
		requestedModelId: "qwen/qwen-2.5-7b-instruct",
		canonicalModelId: "qwen/qwen-2.5-7b-instruct",
		approvedUpstream: "together",
		requiredQuantization: "fp8",
		maxOutputTokens: 180,
	},
] as const;

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

describe("launch resident registry", () => {
	it("admits exactly the approved six residents in stable display order", async () => {
		const registry = await loadEditorialRegistry();

		expect(registry, "editorial registry modules must exist").toBeDefined();
		expect(
			registry?.LAUNCH_RESIDENTS.map((resident) => ({
				id: resident.id,
				requestedModelId: resident.requestedModelId,
				canonicalModelId: resident.canonicalModelId,
				approvedUpstream: resident.approvedUpstream,
				...(resident.requiredQuantization
					? { requiredQuantization: resident.requiredQuantization }
					: {}),
				maxOutputTokens: resident.maxOutputTokens,
				...(resident.reasoning ? { reasoning: resident.reasoning } : {}),
			})),
		).toEqual(EXPECTED_RESIDENTS);
		expect(
			registry?.LAUNCH_RESIDENTS.map((resident) => resident.displayOrder),
		).toEqual([1, 2, 3, 4, 5, 6]);
		expect(registry?.LAUNCH_RESIDENTS.filter((resident) => resident.requiredQuantization)).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: "deepseek-v3.2", requiredQuantization: "fp4" }),
				expect.objectContaining({ id: "llama-3.3-70b-instruct", requiredQuantization: "fp8" }),
				expect.objectContaining({ id: "qwen-2.5-7b-instruct", requiredQuantization: "fp8" }),
			]),
		);
	});

	it("keeps every role, routine set, visual signature, and dialogue signature distinct", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;

		const biblesById = new Map(
			registry.CHARACTER_BIBLES.map((bible) => [bible.residentId, bible]),
		);
		const values = registry.LAUNCH_RESIDENTS.map((resident) => {
			const bible = biblesById.get(resident.id);
			expect(bible).toBeDefined();
			return {
				name: resident.displayName,
				role: resident.role,
				routines: resident.routines.join("|"),
				visual: resident.visualVariantId,
				dialogue: bible?.traits.map((trait) => trait.guidance).join("|"),
			};
		});

		for (const key of ["name", "role", "routines", "visual", "dialogue"] as const) {
			expect(new Set(values.map((value) => value[key])).size).toBe(6);
		}
	});

	it("fails closed for the empty, singleton, seventh, malformed, or duplicate registry", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;

		const valid = {
			residents: registry.LAUNCH_RESIDENTS,
			bibles: registry.CHARACTER_BIBLES,
			claims: registry.HISTORICAL_CLAIMS,
		};
		expect(() => registry.validateLaunchResidentRegistry(valid)).not.toThrow();
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: [] })).toThrow(/exactly six/i);
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: valid.residents.slice(0, 1) })).toThrow(/exactly six/i);
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: [...valid.residents, valid.residents[0]] })).toThrow(/exactly six/i);

		const missingRole = clone(valid.residents);
		missingRole[0].role = "";
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: missingRole })).toThrow(/role/i);

		const missingRoutine = clone(valid.residents);
		missingRoutine[1].routines = [];
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: missingRoutine })).toThrow(/routine/i);

		const duplicateVisual = clone(valid.residents);
		duplicateVisual[1].visualVariantId = duplicateVisual[0].visualVariantId;
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: duplicateVisual })).toThrow(/visual/i);

		const duplicateOrder = clone(valid.residents);
		duplicateOrder[1].displayOrder = duplicateOrder[0].displayOrder;
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: duplicateOrder })).toThrow(/displayorder/i);

		const invalidId = clone(valid.residents);
		invalidId[0].id = "résident-one";
		expect(() => registry.validateLaunchResidentRegistry({ ...valid, residents: invalidId })).toThrow(/ascii slug/i);
	});

	it("rejects non-NFC human copy and accepts normalized UTF-8 copy", async () => {
		const registry = await loadEditorialRegistry();
		expect(registry, "editorial registry modules must exist").toBeDefined();
		if (!registry) return;

		for (const resident of registry.LAUNCH_RESIDENTS) {
			for (const text of [resident.displayName, resident.role, ...resident.routines]) {
				expect(text).toBe(text.normalize("NFC"));
			}
		}

		const residents = clone(registry.LAUNCH_RESIDENTS);
		residents[0].role = "Caf\u0065\u0301 historian";
		expect(() =>
			registry.validateLaunchResidentRegistry({
				residents,
				bibles: registry.CHARACTER_BIBLES,
				claims: registry.HISTORICAL_CLAIMS,
			}),
		).toThrow(/nfc/i);
	});
});

describe("phase 02 reference dataset", () => {
	it("contains exactly 24 versioned cases with the required composition", () => {
		const datasetPath = resolve("evals/datasets/phase-02-reference.jsonl");
		expect(existsSync(datasetPath), "reference dataset must exist").toBe(true);
		if (!existsSync(datasetPath)) return;

		const cases = readFileSync(datasetPath, "utf8")
			.trim()
			.split(/\r?\n/u)
			.map((line) => JSON.parse(line));
		expect(cases).toHaveLength(24);
		expect(new Set(cases.map((entry) => entry.id)).size).toBe(24);
		expect(new Set(cases.map((entry) => entry.datasetVersion))).toEqual(
			new Set(["phase-02-reference-v1"]),
		);
		expect(
			Object.fromEntries(
				["ordinary", "cast-contrast", "historical-trap", "injection-safety", "fault-matrix"].map(
					(category) => [category, cases.filter((entry) => entry.category === category).length],
				),
			),
		).toEqual({
			ordinary: 10,
			"cast-contrast": 5,
			"historical-trap": 4,
			"injection-safety": 3,
			"fault-matrix": 2,
		});
	});

	it("covers all 15 resident pairs in contrast cases and every resident at least six times", () => {
		const datasetPath = resolve("evals/datasets/phase-02-reference.jsonl");
		expect(existsSync(datasetPath), "reference dataset must exist").toBe(true);
		if (!existsSync(datasetPath)) return;
		const cases = readFileSync(datasetPath, "utf8")
			.trim()
			.split(/\r?\n/u)
			.map((line) => JSON.parse(line));

		const contrastPairs = new Set<string>();
		for (const entry of cases.filter((candidate) => candidate.category === "cast-contrast")) {
			for (let left = 0; left < entry.participantIds.length; left += 1) {
				for (let right = left + 1; right < entry.participantIds.length; right += 1) {
					contrastPairs.add([entry.participantIds[left], entry.participantIds[right]].sort().join("::"));
				}
			}
		}
		expect(contrastPairs.size).toBe(15);

		const appearances = new Map<string, number>(
			EXPECTED_RESIDENTS.map((resident) => [resident.id, 0]),
		);
		for (const entry of cases) {
			for (const residentId of new Set(entry.participantIds as string[])) {
				appearances.set(residentId, (appearances.get(residentId) ?? 0) + 1);
			}
			expect(entry.expected).toEqual({
				canonicalEffect: expect.stringMatching(/^(publish-scene|no-canon-change)$/u),
				privateEffect: expect.stringMatching(/^[a-z0-9-]+$/u),
			});
		}
		expect([...appearances.values()].every((count) => count >= 6)).toBe(true);
		expect([...appearances.keys()].sort()).toEqual(
			EXPECTED_RESIDENTS.map((resident) => resident.id).sort(),
		);
	});
});
