import { PublishedSceneRevisionSchema, type GenerationAttempt, type ResidentTurn, type SceneBrief, type ValidationResult } from "./contracts.ts";

export function validateTracerCandidate(input: { brief: SceneBrief; attempt: GenerationAttempt; turns: ResidentTurn[]; revisionId: string }): { result: ValidationResult; revision?: ReturnType<typeof PublishedSceneRevisionSchema.parse> } {
	const reject = (code: string, detail: string) => ({ result: { attemptId: input.attempt.attemptId, accepted: false, code, detail } });
	if (input.attempt.identityEvidence === "requested_only") return reject("identity", "Independent provider identity evidence is required.");
	if (input.turns.length !== input.brief.turnBudget) return reject("turn_budget", "Turn count must match the approved brief.");
	for (const [index, turn] of input.turns.entries()) {
		if (turn.turnIndex !== index || turn.residentId !== input.brief.speakerOrder[index]) return reject("speaker_order", "Application-owned speaker order changed.");
		if (!input.brief.participantIds.includes(turn.residentId) || !turn.text.trim()) return reject("attribution", "A turn is not attributable to an admitted participant.");
		if (turn.effects.length !== 0) return reject("effects", "Tracer permits no model-proposed effects.");
	}
	if (!input.turns.at(-1)?.ending) return reject("ending", "The final turn must explicitly end the scene.");
	const revision = PublishedSceneRevisionSchema.parse({ revisionId: input.revisionId, attemptId: input.attempt.attemptId, sceneKey: input.brief.sceneKey, expectedWorldHead: input.brief.expectedWorldHead, turns: input.turns });
	return { result: { attemptId: input.attempt.attemptId, accepted: true, code: "accepted", detail: "Strict tracer validation passed." }, revision };
}
