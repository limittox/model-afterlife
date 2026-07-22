import type { SceneBrief } from "./contracts.ts";

export type ProviderTurnResponse = {
	text: string;
	providerResponseId?: string;
	observedModelId?: string;
	identityEvidence?: "openrouter_verified" | "provider_response" | "requested_only";
	finishReason?: string;
	usage?: { inputTokens: number; outputTokens: number };
	provenance?: {
		generationId: string;
		requestedModelId: string;
		canonicalModelId: string;
		selectedModelId: string;
		selectedUpstream: string;
		strategy: "direct";
		routeAttempt: 1;
		pipeline: [];
		usage: { inputTokens: number; outputTokens: number; cost?: number };
		warningCodes: string[];
		filterStatus: "clear" | "filtered";
	};
};

export interface ResidentTurnProvider {
	generateTurn(input: {
		brief: SceneBrief;
		turnIndex: number;
		residentId: string;
		requestedModelId: string;
		priorTurns: readonly string[];
		relationships?: readonly {
			residentId: string;
			dimension: string;
			value: number;
		}[];
		memories?: readonly string[];
	}): Promise<ProviderTurnResponse>;
}
