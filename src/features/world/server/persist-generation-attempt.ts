import { createWorldDatabase } from "../../../db/client.ts";
import { generationAttempts, generationTurns, sceneBriefs, sceneValidationResults } from "../../../db/schema.ts";
import type { GenerationAttempt, ResidentTurn, SceneBrief, ValidationResult } from "../generation/contracts.ts";
import type { ValidatorResult } from "../generation/validators/core.ts";

export async function persistGenerationAttempt(input: { worldId: string; brief: SceneBrief; attempt: GenerationAttempt; turns: ResidentTurn[]; result: ValidationResult; validatorResults?: readonly ValidatorResult[] }): Promise<void> {
	const { db, close } = createWorldDatabase();
	try {
		await db.transaction(async (transaction) => {
			await transaction.insert(sceneBriefs).values({ sceneKey: input.brief.sceneKey, worldId: input.worldId, expectedWorldHead: input.brief.expectedWorldHead, brief: input.brief }).onConflictDoNothing();
			await transaction.insert(generationAttempts).values({ ...input.attempt, usage: input.attempt.usage }).onConflictDoNothing();
			if (input.turns.length) await transaction.insert(generationTurns).values(input.turns.map((turn) => ({
				turnId: `${input.attempt.attemptId}:turn:${turn.turnIndex}`,
				attemptId: input.attempt.attemptId,
				turnIndex: turn.turnIndex,
				residentId: turn.residentId,
				requestedModelId: turn.requestedModelId,
				text: turn.text,
				approvedClaimIds: turn.approvedClaimIds,
				provenance: turn.provenance,
				ending: turn.ending,
				effects: turn.effects,
			}))).onConflictDoNothing();
			const validatorRows = input.validatorResults?.length
				? input.validatorResults.map((result) => ({
						validationId: `${input.attempt.attemptId}:${result.version}:${result.id}`,
						attemptId: input.attempt.attemptId,
						validatorId: result.id,
						validatorVersion: result.version,
						accepted: result.status === "pass",
						code: result.code,
						detail: result.detail,
					}))
				: [{
						validationId: `${input.attempt.attemptId}:legacy:${input.result.code}`,
						attemptId: input.attempt.attemptId,
						validatorId: "legacy",
						validatorVersion: "legacy-v1",
						accepted: input.result.accepted,
						code: input.result.code,
						detail: input.result.detail,
					}];
			await transaction.insert(sceneValidationResults).values(validatorRows).onConflictDoNothing();
		});
	} finally { await close(); }
}
