import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { createWorldDatabase } from "../../src/db/client.ts";
import { generationAttempts } from "../../src/db/schema.ts";
import { conductSceneAttempt } from "../../src/features/world/generation/conduct-scene.ts";
import { SceneBriefSchema } from "../../src/features/world/generation/contracts.ts";
import { FakeResidentTurnProvider } from "../../src/features/world/generation/fake-resident-turn-provider.ts";
import { validateTracerCandidate } from "../../src/features/world/generation/validate-tracer-candidate.ts";
import { persistGenerationAttempt } from "../../src/features/world/server/persist-generation-attempt.ts";
import { CANONICAL_WORLD_ID } from "../../src/features/world/server/seed-data.ts";
import { readCanonicalHead } from "../../src/features/world/server/world-repository.ts";

describe("scene publication faults", () => {
	it("keeps an identity-rejected candidate private and leaves canon unchanged", async () => {
		const before = await readCanonicalHead(CANONICAL_WORLD_ID);
		const brief = SceneBriefSchema.parse({
			schemaVersion: 1,
			sceneKey: "identity-rejected",
			expectedWorldHead: before.state.throughSequence,
			participantIds: ["gpt-4o", "claude-sonnet-4.5"],
			speakerOrder: [
				"gpt-4o",
				"claude-sonnet-4.5",
				"gpt-4o",
				"claude-sonnet-4.5",
			],
			locationId: "common-room",
			premise: "identity fault",
			allowedFactIds: ["claim-1"],
			tone: "warm",
			turnBudget: 4,
			permittedOutcome: "quiet ending",
		});
		const { attempt, turns } = await conductSceneAttempt({
			brief,
			attemptId: "identity-attempt",
			provider: new FakeResidentTurnProvider(),
			modelForResident: () => "expected-model",
		});
		attempt.identityEvidence = "requested_only";
		attempt.disposition = "identity_rejected";
		const result = validateTracerCandidate({
			brief,
			attempt,
			turns,
			revisionId: "unpublished",
		});
		expect(result.result).toMatchObject({
			accepted: false,
			code: "identity.unverified",
		});
		await persistGenerationAttempt({
			worldId: CANONICAL_WORLD_ID,
			brief,
			attempt,
			turns,
			result: result.result,
		});
		const after = await readCanonicalHead(CANONICAL_WORLD_ID);
		expect(after.snapshot.stateHash).toBe(before.snapshot.stateHash);
		expect(after.state.relationships).toEqual(before.state.relationships);
		const { db, close } = createWorldDatabase();
		try {
			expect(
				(
					await db
						.select()
						.from(generationAttempts)
						.where(eq(generationAttempts.attemptId, "identity-attempt"))
				)[0]?.disposition,
			).toBe("identity_rejected");
		} finally {
			await close();
		}
	});
});
