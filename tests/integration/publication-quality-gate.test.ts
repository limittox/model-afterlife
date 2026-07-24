import { describe, expect, it } from "vitest";
import {
	acceptedRevision,
	type AcceptedCandidate,
} from "../../src/features/world/generation/accepted-candidate.ts";
import { validateSceneCandidate } from "../../src/features/world/generation/validate-scene-candidate.ts";
import { buildValidSceneCandidate } from "../fixtures/scene-candidate.ts";

describe("publication capability boundary", () => {
	it("preserves accepted model-authored text byte-for-byte", () => {
		const input = buildValidSceneCandidate();
		const validation = validateSceneCandidate(input);
		if (!validation.acceptedCandidate) {
			throw new Error(`Expected acceptance, received ${validation.result.code}`);
		}

		expect(
			acceptedRevision(validation.acceptedCandidate).turns.map(
				(turn) => turn.text,
			),
		).toEqual(input.turns.map((turn) => turn.text));
	});

	it("rejects a raw revision even if application code casts it to the capability type", () => {
		const input = buildValidSceneCandidate();
		const validation = validateSceneCandidate(input);
		if (!validation.revision) throw new Error("Expected a parsed private revision.");

		expect(() =>
			acceptedRevision(validation.revision as unknown as AcceptedCandidate),
		).toThrow("validator-issued AcceptedCandidate");
	});

	it("issues no capability when any required validator fails", () => {
		const input = buildValidSceneCandidate();
		input.turns[3] = { ...input.turns[3], ending: false };
		const validation = validateSceneCandidate(input);

		expect(validation.manifest.complete).toBe(true);
		expect(validation.manifest.accepted).toBe(false);
		expect(validation.acceptedCandidate).toBeUndefined();
	});

	it("keeps publication fail-closed when calibration evidence is absent", () => {
		const { semanticGateEvidence: _omitted, ...input } =
			buildValidSceneCandidate();
		const validation = validateSceneCandidate(input);

		expect(
			validation.manifest.results.find(
				(result) => result.id === "semantic-gate",
			),
		).toMatchObject({
			status: "fail",
			code: "semantic-gate.uncalibrated",
		});
		expect(validation.acceptedCandidate).toBeUndefined();
	});
});
