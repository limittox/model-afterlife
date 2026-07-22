import type { ResidentTurnProvider } from "./resident-turn-provider.ts";

export class FakeResidentTurnProvider implements ResidentTurnProvider {
	readonly calls: Array<{ turnIndex: number; residentId: string }> = [];
	async generateTurn(input: Parameters<ResidentTurnProvider["generateTurn"]>[0]) {
		this.calls.push({ turnIndex: input.turnIndex, residentId: input.residentId });
		return {
			text: input.turnIndex === input.brief.turnBudget - 1 ? "The conversation settles into a quiet ending." : `${input.residentId} offers validated tracer turn ${input.turnIndex + 1}.`,
			providerResponseId: `fake-response-${input.turnIndex}`,
			observedModelId: input.requestedModelId,
			identityEvidence: "openrouter_verified" as const,
			finishReason: "stop",
			usage: { inputTokens: 10, outputTokens: 8 },
		};
	}
}
