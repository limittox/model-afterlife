import { describe, expect, it } from "vitest";
import { generationAttempts, generationTurns, publishedSceneRevisions } from "../../src/db/schema.ts";
import { FakeResidentTurnProvider } from "../../src/features/world/generation/fake-resident-turn-provider.ts";
import { conductSceneAttempt } from "../../src/features/world/generation/conduct-scene.ts";
import { SceneBriefSchema } from "../../src/features/world/generation/contracts.ts";
import { validateTracerCandidate } from "../../src/features/world/generation/validate-tracer-candidate.ts";
import { persistGenerationAttempt } from "../../src/features/world/server/persist-generation-attempt.ts";
import { publishSceneRevision } from "../../src/features/world/server/publish-scene-revision.ts";
import { readCanonicalHead } from "../../src/features/world/server/world-repository.ts";
import { createWorldDatabase } from "../../src/db/client.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";

describe("private-to-canonical scene tracer", () => {
	it("persists a four-turn private attempt and exposes exactly one accepted revision", async () => {
		const before = await readCanonicalHead(CANONICAL_WORLD_ID);
		const brief = SceneBriefSchema.parse({ schemaVersion: 1, sceneKey: `tracer:${before.state.throughSequence}`, expectedWorldHead: before.state.throughSequence, participantIds: ["former-giant", "masked-encoder"], speakerOrder: ["former-giant", "masked-encoder", "former-giant", "masked-encoder"], locationId: "common-room", premise: "A bounded tracer scene", allowedFactIds: ["claim-1"], tone: "warm", turnBudget: 4, permittedOutcome: "quiet ending" });
		const provider = new FakeResidentTurnProvider();
		const { attempt, turns } = await conductSceneAttempt({ brief, attemptId: "tracer-attempt-1", provider, modelForResident: (residentId) => `${residentId}-model-v1` });
		const validation = validateTracerCandidate({ brief, attempt, turns, revisionId: "tracer-revision-1" });
		expect(validation.result.accepted).toBe(true);
		if (!validation.revision) throw new Error("Expected accepted tracer revision.");
		await persistGenerationAttempt({ worldId: CANONICAL_WORLD_ID, brief, attempt, turns, result: validation.result });
		const first = await publishSceneRevision(CANONICAL_WORLD_ID, validation.revision);
		const second = await publishSceneRevision(CANONICAL_WORLD_ID, validation.revision);
		expect(first.published).toBe(true);
		expect(second).toEqual({ revisionId: "tracer-revision-1", published: false });
		expect(provider.calls.map((call) => call.residentId)).toEqual(brief.speakerOrder);
		const after = await readCanonicalHead(CANONICAL_WORLD_ID);
		expect(after.snapshot.scene?.turns).toHaveLength(4);
		expect(after.snapshot.scene?.turns.map((turn) => turn.exactModelId)).toEqual(["former-giant-model-v1", "masked-encoder-model-v1", "former-giant-model-v1", "masked-encoder-model-v1"]);
		const publicKeys = JSON.stringify(after.snapshot);
		for (const privateKey of ["attemptId", "providerResponseId", "rawResponse", "validationResult", "usage", "secret"]) expect(publicKeys).not.toContain(`\"${privateKey}\"`);
		const { db, close } = createWorldDatabase();
		try {
			expect(await db.select().from(generationAttempts)).toHaveLength(1);
			expect(await db.select().from(generationTurns)).toHaveLength(4);
			expect(await db.select().from(publishedSceneRevisions)).toHaveLength(1);
		} finally { await close(); }
	});
});
