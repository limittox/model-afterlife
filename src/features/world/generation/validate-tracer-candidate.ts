import {
	PublishedSceneRevisionSchema,
	type GenerationAttempt,
	type PublishedSceneRevision,
	type ResidentTurn,
	type SceneBrief,
	type ValidationResult,
} from "./contracts.ts";

export function validateTracerCandidate(input: {
	brief: SceneBrief;
	attempt: GenerationAttempt;
	turns: ResidentTurn[];
	revisionId: string;
	relationshipEffects?: PublishedSceneRevision["relationshipEffects"];
}): {
	result: ValidationResult;
	revision?: ReturnType<typeof PublishedSceneRevisionSchema.parse>;
} {
	const reject = (code: string, detail: string) => ({ result: { attemptId: input.attempt.attemptId, accepted: false, code, detail } });
	if (input.attempt.identityEvidence !== "openrouter_verified") return reject("identity", "Verified direct OpenRouter identity evidence is required.");
	if (input.turns.length !== input.brief.turnBudget) return reject("turn_budget", "Turn count must match the approved brief.");
	for (const [index, turn] of input.turns.entries()) {
		if (turn.turnIndex !== index || turn.residentId !== input.brief.speakerOrder[index]) return reject("speaker_order", "Application-owned speaker order changed.");
		if (!input.brief.participantIds.includes(turn.residentId) || !turn.text.trim()) return reject("attribution", "A turn is not attributable to an admitted participant.");
		if (turn.effects.length !== 0) return reject("effects", "Tracer permits no model-proposed effects.");
	}
	if (!input.turns.at(-1)?.ending) return reject("ending", "The final turn must explicitly end the scene.");
	const relationshipEffects = input.relationshipEffects ?? [];
	const permitted = new Set(
		input.brief.permittedRelationshipEffects.map(
			(effect) =>
				`${[effect.residentAId, effect.residentBId].sort().join(":")}:${effect.dimension}`,
		),
	);
	const effectKeys = new Set<string>();
	for (const effect of relationshipEffects) {
		const pair = [effect.residentAId, effect.residentBId].sort();
		const permissionKey = `${pair.join(":")}:${effect.dimension}`;
		const uniqueKey = `${permissionKey}:${effect.effectOrdinal}`;
		if (!permitted.has(permissionKey) || effectKeys.has(uniqueKey)) {
			return reject(
				"effects",
				"Relationship effects must be uniquely permitted by the approved brief.",
			);
		}
		effectKeys.add(uniqueKey);
	}
	const revision = PublishedSceneRevisionSchema.parse({
		revisionId: input.revisionId,
		attemptId: input.attempt.attemptId,
		sceneKey: input.brief.sceneKey,
		expectedWorldHead: input.brief.expectedWorldHead,
		turns: input.turns,
		relationshipEffects,
		sharedExperience: {
			summary: input.brief.permittedOutcome,
			tags: [
				input.brief.locationId,
				...input.brief.participantIds.map((residentId) => `resident:${residentId}`),
			],
		},
	});
	return { result: { attemptId: input.attempt.attemptId, accepted: true, code: "accepted", detail: "Strict tracer validation passed." }, revision };
}
