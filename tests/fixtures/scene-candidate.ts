import {
	SceneBriefSchema,
	type GenerationAttempt,
	type ResidentTurn,
} from "../../src/features/world/generation/contracts.ts";
import { providerProfileFor } from "../../src/features/world/generation/provider-registry.ts";
import {
	SEMANTIC_JUDGE_PROFILE,
	SEMANTIC_JUDGE_PROMPT_VERSION,
	type SemanticGateEvidence,
} from "../../src/features/world/generation/semantic-judge.ts";
import { APPROVED_SEMANTIC_CALIBRATION } from "../../src/features/world/generation/semantic-calibration.ts";

export function approvedSemanticGateFixture(): SemanticGateEvidence {
	return {
		status: "approved",
		labelSetHash: APPROVED_SEMANTIC_CALIBRATION.labelSetHash,
		correlation: APPROVED_SEMANTIC_CALIBRATION.correlation,
		criticalFalseNegatives: 0,
		result: {
			scores: {
				responsiveness: 4,
				voice: 4,
				affection: 4,
				novelty: 4,
				resolution: 4,
			},
			reasons: {
				responsiveness: "The exchange responds directly.",
				voice: "The resident voices remain recognizable.",
				affection: "The tone preserves dignity.",
				novelty: "The beat is distinct from recent scenes.",
				resolution: "The scene reaches a clear ending.",
			},
			recommendation: "pass",
			criticalFailureIds: [],
			requestedModelId: SEMANTIC_JUDGE_PROFILE.requestedModelId,
			resolvedModelId: SEMANTIC_JUDGE_PROFILE.canonicalModelId,
			promptVersion: SEMANTIC_JUDGE_PROMPT_VERSION,
		},
	};
}

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
		semanticGateEvidence: approvedSemanticGateFixture(),
	};
}
