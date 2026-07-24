import { describe, expect, it } from "vitest";
import { validateSceneCandidate } from "../../src/features/world/generation/validate-scene-candidate.ts";
import { REQUIRED_VALIDATOR_IDS } from "../../src/features/world/generation/validators/core.ts";
import { buildValidSceneCandidate } from "../fixtures/scene-candidate.ts";

function resultFor(
	validation: ReturnType<typeof validateSceneCandidate>,
	id: (typeof REQUIRED_VALIDATOR_IDS)[number],
) {
	return validation.manifest.results.find((result) => result.id === id);
}

describe("fail-closed scene validators", () => {
	it("issues one immutable capability only after the complete current manifest passes", () => {
		const input = buildValidSceneCandidate();
		const validation = validateSceneCandidate(input);

		expect(validation.result).toMatchObject({ accepted: true, code: "accepted" });
		expect(validation.manifest).toMatchObject({
			complete: true,
			accepted: true,
		});
		expect(validation.manifest.results.map((result) => result.id)).toEqual(
			REQUIRED_VALIDATOR_IDS,
		);
		expect(validation.acceptedCandidate).toBeDefined();
		expect(Object.isFrozen(validation.acceptedCandidate)).toBe(true);
		expect(validation.revision?.turns.map((turn) => turn.text)).toEqual(
			input.turns.map((turn) => turn.text),
		);
	});

	it("rejects missing exact turn provenance", () => {
		const input = buildValidSceneCandidate();
		input.turns[1] = { ...input.turns[1], provenance: undefined };
		const validation = validateSceneCandidate(input);

		expect(validation.acceptedCandidate).toBeUndefined();
		expect(resultFor(validation, "identity")?.status).toBe("fail");
	});

	it("rejects wrong speakers, unsupported claims, and repeated turns", () => {
		const input = buildValidSceneCandidate();
		input.turns[1] = {
			...input.turns[1],
			residentId: "gpt-4o",
			approvedClaimIds: ["unknown-claim"],
			text: input.turns[0]?.text ?? "",
		};
		const validation = validateSceneCandidate(input);

		expect(resultFor(validation, "participants")?.status).toBe("fail");
		expect(resultFor(validation, "claims")?.status).toBe("fail");
		expect(resultFor(validation, "continuity")?.status).toBe("fail");
	});

	it("counts Unicode graphemes and rejects non-normalized or overlong text", () => {
		const normalized = buildValidSceneCandidate();
		normalized.turns[2] = {
			...normalized.turns[2],
			text: "é".repeat(241),
		};
		expect(
			resultFor(validateSceneCandidate(normalized), "grapheme-budget")?.status,
		).toBe("fail");

		const decomposed = buildValidSceneCandidate();
		decomposed.turns[2] = {
			...decomposed.turns[2],
			text: "Cafe\u0301 timer.",
		};
		expect(
			resultFor(validateSceneCandidate(decomposed), "grapheme-budget")?.status,
		).toBe("fail");
	});

	it("rejects an unbounded usage envelope and a near-duplicate recent transcript", () => {
		const input = buildValidSceneCandidate();
		input.attempt = {
			...input.attempt,
			usage: { inputTokens: 16, outputTokens: 9999 },
		};
		const transcript = input.turns
			.map((turn) => `${turn.residentId}:${turn.text}`)
			.join("\n");
		const validation = validateSceneCandidate({
			...input,
			recentPublishedTranscripts: [transcript],
		});

		expect(resultFor(validation, "attempt-envelope")?.status).toBe("fail");
		expect(resultFor(validation, "novelty")?.status).toBe("fail");
	});
});
