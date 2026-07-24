import {
	GenerationAttemptSchema,
	PublishedSceneRevisionSchema,
	ResidentTurnSchema,
	SceneBriefSchema,
	type GenerationAttempt,
	type PublishedSceneRevision,
	type ResidentTurn,
	type SceneBrief,
	type ValidationResult,
} from "./contracts.ts";
import {
	issueAcceptedCandidate,
	type AcceptedCandidate,
} from "./accepted-candidate.ts";
import {
	PUBLICATION_VALIDATOR_VERSION,
	REQUIRED_VALIDATOR_IDS,
	runCoreValidators,
	type ValidatorResult,
} from "./validators/core.ts";

export type ValidationManifest = Readonly<{
	version: typeof PUBLICATION_VALIDATOR_VERSION;
	attemptId: string;
	complete: boolean;
	accepted: boolean;
	results: readonly ValidatorResult[];
}>;

export type SceneCandidateValidation = Readonly<{
	result: ValidationResult;
	manifest: ValidationManifest;
	acceptedCandidate?: AcceptedCandidate;
	revision?: PublishedSceneRevision;
}>;

export function validateSceneCandidate(input: {
	brief: SceneBrief;
	attempt: GenerationAttempt;
	turns: ResidentTurn[];
	revisionId: string;
	relationshipEffects?: PublishedSceneRevision["relationshipEffects"];
	recentPublishedTranscripts?: readonly string[];
}): SceneCandidateValidation {
	const brief = SceneBriefSchema.parse(input.brief);
	const attempt = GenerationAttemptSchema.parse(input.attempt);
	const turns = input.turns.map((turn) => ResidentTurnSchema.parse(turn));
	const revision = PublishedSceneRevisionSchema.parse({
		revisionId: input.revisionId,
		attemptId: attempt.attemptId,
		sceneKey: brief.sceneKey,
		expectedWorldHead: brief.expectedWorldHead,
		turns,
		relationshipEffects: input.relationshipEffects ?? [],
		sharedExperience: {
			summary: brief.permittedOutcome,
			tags: [
				brief.locationId,
				...brief.participantIds.map((residentId) => `resident:${residentId}`),
			],
		},
	});
	const results = runCoreValidators({
		brief,
		attempt,
		turns,
		revision,
		recentPublishedTranscripts: input.recentPublishedTranscripts ?? [],
	});
	const presentIds = new Set(results.map((result) => result.id));
	const complete =
		results.length === REQUIRED_VALIDATOR_IDS.length &&
		REQUIRED_VALIDATOR_IDS.every((id) => presentIds.has(id));
	const accepted =
		complete && results.every((result) => result.status === "pass");
	const manifest: ValidationManifest = Object.freeze({
		version: PUBLICATION_VALIDATOR_VERSION,
		attemptId: attempt.attemptId,
		complete,
		accepted,
		results: Object.freeze(results),
	});
	const firstFailure = results.find((result) => result.status !== "pass");
	const result = {
		attemptId: attempt.attemptId,
		accepted,
		code: accepted ? "accepted" : (firstFailure?.code ?? "validation.incomplete"),
		detail: accepted
			? `All ${results.length} ${PUBLICATION_VALIDATOR_VERSION} validators passed.`
			: (firstFailure?.detail ?? "The required validation manifest is incomplete."),
	} satisfies ValidationResult;
	if (!accepted) return { result, manifest };
	const acceptedCandidate = issueAcceptedCandidate(revision, manifest);
	return { result, manifest, acceptedCandidate, revision };
}
