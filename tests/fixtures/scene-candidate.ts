import {
	SceneBriefSchema,
	type GenerationAttempt,
	type ResidentTurn,
} from "../../src/features/world/generation/contracts.ts";
import { providerProfileFor } from "../../src/features/world/generation/provider-registry.ts";

export function buildValidSceneCandidate() {
	const brief = SceneBriefSchema.parse({
		schemaVersion: 1,
		briefId: "quality-gate-brief",
		sceneKey: "quality-gate-scene",
		expectedWorldHead: 12,
		participantIds: ["gpt-4o", "claude-sonnet-4.5"],
		speakerOrder: [
			"gpt-4o",
			"claude-sonnet-4.5",
			"gpt-4o",
			"claude-sonnet-4.5",
		],
		locationId: "tea-nook",
		premise: "A brass tea timer needs a careful repair.",
		allowedFactIds: [],
		tone: "Warm and concise.",
		turnBudget: 4,
		permittedOutcome: "The brass tea timer is repaired and chimes once.",
		permittedRelationshipEffects: [],
	});
	const texts = [
		"The brass tea timer has one loose spring; let us inspect it.",
		"I will hold the casing while you seat the spring.",
		"The spring is aligned, and the little dial can turn again.",
		"One clean chime. The timer is ready for tea.",
	];
	const turns: ResidentTurn[] = brief.speakerOrder.map((residentId, turnIndex) => {
		const profile = providerProfileFor(residentId);
		return {
			turnIndex,
			residentId,
			requestedModelId: profile.requestedModelId,
			text: texts[turnIndex] as string,
			approvedClaimIds: [],
			provenance: {
				generationId: `generation-quality-${turnIndex}`,
				requestedModelId: profile.requestedModelId,
				canonicalModelId: profile.canonicalModelId,
				selectedModelId: profile.canonicalModelId,
				selectedUpstream: profile.selectedUpstreamName,
				strategy: "direct",
				routeAttempt: 1,
				pipeline: [],
				usage: { inputTokens: 4, outputTokens: 3 },
				warningCodes: [],
				filterStatus: "clear",
			},
			ending: turnIndex === brief.turnBudget - 1,
			effects: [],
		};
	});
	const attempt: GenerationAttempt = {
		attemptId: "quality-gate-attempt",
		sceneKey: brief.sceneKey,
		attemptOrdinal: 1,
		disposition: "pending",
		identityEvidence: "openrouter_verified",
		providerResponseId: "generation-quality-0",
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		configurationVersion: "strict-openrouter-v1",
		promptVersion: "resident-turn-v1",
		bibleVersionKey: "launch-residents-v1",
		claimVersionKey: "historical-claims-v1",
		finishReason: "stop",
		usage: { inputTokens: 16, outputTokens: 12 },
	};
	return {
		brief,
		attempt,
		turns,
		revisionId: "quality-gate-revision",
	};
}
