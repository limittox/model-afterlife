import type { SceneBrief } from "./contracts.ts";

export type ProviderTurnResponse = {
	text: string;
	providerResponseId?: string;
	observedModelId?: string;
	identityEvidence?: "openrouter_verified" | "provider_response" | "requested_only";
	finishReason?: string;
	usage?: { inputTokens: number; outputTokens: number };
};

export interface ResidentTurnProvider {
	generateTurn(input: {
		brief: SceneBrief;
		turnIndex: number;
		residentId: string;
		requestedModelId: string;
		priorTurns: readonly string[];
		residentGuidance?: string;
		allowedClaims?: readonly { id: string; text: string }[];
		relationships?: readonly {
			residentId: string;
			dimension: string;
			value: number;
		}[];
		memories?: readonly string[];
	}): Promise<ProviderTurnResponse>;
}
