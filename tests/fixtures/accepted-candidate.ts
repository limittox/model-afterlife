import type {
	PublishedSceneRevision,
	SceneBrief,
} from "../../src/features/world/generation/contracts.ts";
import { providerProfileFor } from "../../src/features/world/generation/provider-registry.ts";
import { validateSceneCandidate } from "../../src/features/world/generation/validate-scene-candidate.ts";

export function acceptedCandidateFixture(
	brief: SceneBrief,
	revision: PublishedSceneRevision,
) {
	const turns = revision.turns.map((turn, index) => {
		const profile = providerProfileFor(turn.residentId);
		return {
			...turn,
			text:
				index === 0
					? `${brief.premise.split(/\s+/u).slice(0, 4).join(" ")}. ${turn.text}`
					: turn.text,
			approvedClaimIds: [],
			provenance: {
				generationId: `${revision.attemptId}:generation:${index}`,
				requestedModelId: profile.requestedModelId,
				canonicalModelId: profile.canonicalModelId,
				selectedModelId: profile.canonicalModelId,
				selectedUpstream: profile.selectedUpstreamName,
				strategy: "direct" as const,
				routeAttempt: 1 as const,
				pipeline: [] as [],
				usage: { inputTokens: 4, outputTokens: 3 },
				warningCodes: [],
				filterStatus: "clear" as const,
			},
		};
	});
	const validation = validateSceneCandidate({
		brief,
		attempt: {
			attemptId: revision.attemptId,
			sceneKey: brief.sceneKey,
			attemptOrdinal: 1,
			disposition: "pending",
			identityEvidence: "openrouter_verified",
			providerResponseId: `${revision.attemptId}:generation:0`,
			adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
			configurationVersion: "strict-openrouter-v1",
			promptVersion: "resident-turn-v1",
			bibleVersionKey: "launch-residents-v1",
			claimVersionKey: "historical-claims-v1",
			finishReason: "stop",
			usage: {
				inputTokens: turns.length * 4,
				outputTokens: turns.length * 3,
			},
		},
		turns,
		revisionId: revision.revisionId,
		relationshipEffects: revision.relationshipEffects,
	});
	if (!validation.acceptedCandidate) {
		throw new Error(`Fixture candidate was rejected: ${validation.result.code}`);
	}
	return validation.acceptedCandidate;
}
