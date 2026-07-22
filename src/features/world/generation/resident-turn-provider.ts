import type { SceneBrief } from "./contracts.ts";

export type ProviderTurnResponse = {
	text: string;
	providerResponseId?: string;
	observedModelId?: string;
	finishReason?: string;
	usage?: { inputTokens: number; outputTokens: number };
};

export interface ResidentTurnProvider {
	generateTurn(input: { brief: SceneBrief; turnIndex: number; residentId: string; requestedModelId: string; priorTurns: readonly string[] }): Promise<ProviderTurnResponse>;
}
