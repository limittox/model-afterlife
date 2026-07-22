import { createWorldDatabase } from "../../../db/client.ts";
import { generationAttempts, generationTurns, sceneBriefs, sceneValidationResults } from "../../../db/schema.ts";
import type { GenerationAttempt, ResidentTurn, SceneBrief, ValidationResult } from "../generation/contracts.ts";

export async function persistGenerationAttempt(input: { worldId: string; brief: SceneBrief; attempt: GenerationAttempt; turns: ResidentTurn[]; result: ValidationResult }): Promise<void> {
	const { db, close } = createWorldDatabase();
	try {
		await db.transaction(async (transaction) => {
			await transaction.insert(sceneBriefs).values({ sceneKey: input.brief.sceneKey, worldId: input.worldId, expectedWorldHead: input.brief.expectedWorldHead, brief: input.brief }).onConflictDoNothing();
			await transaction.insert(generationAttempts).values({ ...input.attempt, usage: input.attempt.usage }).onConflictDoNothing();
			if (input.turns.length) await transaction.insert(generationTurns).values(input.turns.map((turn) => ({ turnId: `${input.attempt.attemptId}:turn:${turn.turnIndex}`, attemptId: input.attempt.attemptId, turnIndex: turn.turnIndex, residentId: turn.residentId, requestedModelId: turn.requestedModelId, text: turn.text, ending: turn.ending, effects: turn.effects }))).onConflictDoNothing();
			await transaction.insert(sceneValidationResults).values({ validationId: `${input.attempt.attemptId}:${input.result.code}`, ...input.result }).onConflictDoNothing();
		});
	} finally { await close(); }
}
