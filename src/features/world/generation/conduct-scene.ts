import { GenerationAttemptSchema, ResidentTurnSchema, type GenerationAttempt, type ResidentTurn, type SceneBrief } from "./contracts.ts";
import type { ResidentTurnProvider } from "./resident-turn-provider.ts";

export async function conductSceneAttempt(input: { brief: SceneBrief; attemptId: string; provider: ResidentTurnProvider; modelForResident: (residentId: string) => string }): Promise<{ attempt: GenerationAttempt; turns: ResidentTurn[] }> {
	const turns: ResidentTurn[] = [];
	let identityEvidence: GenerationAttempt["identityEvidence"] = "provider_response";
	let providerResponseId: string | undefined;
	for (const [turnIndex, residentId] of input.brief.speakerOrder.entries()) {
		const requestedModelId = input.modelForResident(residentId);
		const response = await input.provider.generateTurn({ brief: input.brief, turnIndex, residentId, requestedModelId, priorTurns: turns.map((turn) => turn.text) });
		if (response.observedModelId !== requestedModelId) identityEvidence = "requested_only";
		providerResponseId ??= response.providerResponseId;
		turns.push(ResidentTurnSchema.parse({ turnIndex, residentId, requestedModelId, text: response.text, ending: turnIndex === input.brief.turnBudget - 1, effects: [] }));
	}
	return { attempt: GenerationAttemptSchema.parse({ attemptId: input.attemptId, sceneKey: input.brief.sceneKey, attemptOrdinal: 1, disposition: "pending", identityEvidence, providerResponseId, adapterVersion: "fake-v1", configurationVersion: "tracer-v1", promptVersion: "tracer-v1", bibleVersionKey: "tracer-v1", claimVersionKey: "tracer-v1", finishReason: "stop", usage: { inputTokens: input.brief.turnBudget * 10, outputTokens: input.brief.turnBudget * 8 } }), turns };
}
