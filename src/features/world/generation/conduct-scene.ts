import {
	type GenerationAttempt,
	GenerationAttemptSchema,
	type ResidentTurn,
	ResidentTurnSchema,
	type SceneBrief,
} from "./contracts.ts";
import type { ResidentTurnProvider } from "./resident-turn-provider.ts";

export async function conductSceneAttempt(input: {
	brief: SceneBrief;
	attemptId: string;
	attemptOrdinal?: number;
	provider: ResidentTurnProvider;
	modelForResident: (residentId: string) => string;
}): Promise<{ attempt: GenerationAttempt; turns: ResidentTurn[] }> {
	const turns: ResidentTurn[] = [];
	let identityEvidence: GenerationAttempt["identityEvidence"] =
		"openrouter_verified";
	let providerResponseId: string | undefined;
	let finishReason = "stop";
	let inputTokens = 0;
	let outputTokens = 0;
	for (const [turnIndex, residentId] of input.brief.speakerOrder.entries()) {
		const requestedModelId = input.modelForResident(residentId);
		const response = await input.provider.generateTurn({
			brief: input.brief,
			turnIndex,
			residentId,
			requestedModelId,
			priorTurns: turns.map((turn) => turn.text),
		});
		const observedIdentityMatches =
			response.observedModelId === requestedModelId ||
			(response.identityEvidence === "openrouter_verified" &&
				response.provenance?.requestedModelId === requestedModelId &&
				response.observedModelId === response.provenance.canonicalModelId);
		if (!observedIdentityMatches) {
			identityEvidence = "requested_only";
		} else if (response.identityEvidence !== "openrouter_verified") {
			identityEvidence = response.identityEvidence ?? "provider_response";
		}
		providerResponseId ??= response.providerResponseId;
		finishReason = response.finishReason ?? finishReason;
		inputTokens += response.usage?.inputTokens ?? 0;
		outputTokens += response.usage?.outputTokens ?? 0;
		turns.push(
			ResidentTurnSchema.parse({
				turnIndex,
				residentId,
				requestedModelId,
				text: response.text,
				approvedClaimIds: response.approvedClaimIds ?? [],
				provenance: response.provenance,
				ending: turnIndex === input.brief.turnBudget - 1,
				effects: [],
			}),
		);
	}
	return {
		attempt: GenerationAttemptSchema.parse({
			attemptId: input.attemptId,
			sceneKey: input.brief.sceneKey,
			attemptOrdinal: input.attemptOrdinal ?? 1,
			disposition: "pending",
			identityEvidence,
			providerResponseId,
			adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
			configurationVersion: "strict-openrouter-v1",
			promptVersion: "resident-turn-v1",
			bibleVersionKey: "launch-residents-v1",
			claimVersionKey: "historical-claims-v1",
			finishReason,
			usage: { inputTokens, outputTokens },
		}),
		turns,
	};
}
