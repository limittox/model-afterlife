import type { ResidentTurnProvider } from "./resident-turn-provider.ts";
import { providerProfileFor } from "./provider-registry.ts";

export class FakeResidentTurnProvider implements ResidentTurnProvider {
	readonly calls: Array<{ turnIndex: number; residentId: string }> = [];
	async generateTurn(input: Parameters<ResidentTurnProvider["generateTurn"]>[0]) {
		this.calls.push({ turnIndex: input.turnIndex, residentId: input.residentId });
		const profile = providerProfileFor(input.residentId);
		return {
			text:
				input.turnIndex === input.brief.turnBudget - 1
					? `The ${input.brief.premise.split(/\s+/u).slice(0, 3).join(" ")} settles into a quiet ending.`
					: `${input.residentId} considers the ${input.brief.premise.split(/\s+/u).slice(0, 4).join(" ")} in turn ${input.turnIndex + 1}.`,
			approvedClaimIds: [],
			providerResponseId: `fake-response-${input.turnIndex}`,
			observedModelId: input.requestedModelId,
			identityEvidence: "openrouter_verified" as const,
			finishReason: "stop",
			usage: { inputTokens: 10, outputTokens: 8 },
			provenance: {
				generationId: `fake-response-${input.turnIndex}`,
				requestedModelId: profile.requestedModelId,
				canonicalModelId: profile.canonicalModelId,
				selectedModelId: profile.canonicalModelId,
				selectedUpstream: profile.selectedUpstreamName,
				strategy: "direct" as const,
				routeAttempt: 1 as const,
				pipeline: [] as [],
				usage: { inputTokens: 10, outputTokens: 8 },
				warningCodes: [],
				filterStatus: "clear" as const,
			},
		};
	}
}
