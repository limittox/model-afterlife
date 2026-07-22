import type { PublishedSceneRevision, SceneBrief } from "./contracts.ts";
import type { CommittedGenerationRequest } from "../server/advance-world-to.ts";

export type GenerationAttemptDisposition =
	| "schema_rejected"
	| "identity_rejected"
	| "timed_out"
	| "stale_world"
	| "provider_failed";

export type GenerationAttemptResult =
	| { status: "accepted"; revision: PublishedSceneRevision }
	| {
			status: "rejected";
			disposition: GenerationAttemptDisposition;
	  };

export type GenerationRequestDependencies = {
	loadBrief: (request: CommittedGenerationRequest) => Promise<SceneBrief>;
	runAttempt: (input: {
		brief: SceneBrief;
		attemptOrdinal: 1 | 2;
	}) => Promise<GenerationAttemptResult>;
	publish: (revision: PublishedSceneRevision) => Promise<unknown>;
	recordQuiet: (input: {
		sceneKey: string;
		disposition: "generation_failed_after_two_attempts";
		attemptDispositions: GenerationAttemptDisposition[];
	}) => Promise<void>;
};

export async function runGenerationRequest(
	request: CommittedGenerationRequest,
	dependencies: GenerationRequestDependencies,
) {
	const brief = await dependencies.loadBrief(request);
	if (
		brief.sceneKey !== request.sceneKey ||
		brief.expectedWorldHead !== request.expectedWorldHead
	) {
		throw new Error("Committed generation request does not match its immutable brief.");
	}

	const attemptDispositions: GenerationAttemptDisposition[] = [];
	for (const attemptOrdinal of [1, 2] as const) {
		let result: GenerationAttemptResult;
		try {
			result = await dependencies.runAttempt({ brief, attemptOrdinal });
		} catch {
			result = { status: "rejected", disposition: "provider_failed" };
		}

		if (result.status === "accepted") {
			await dependencies.publish(result.revision);
			return {
				status: "published" as const,
				attemptOrdinal,
				attemptDispositions,
			};
		}
		attemptDispositions.push(result.disposition);
	}

	const disposition = "generation_failed_after_two_attempts" as const;
	await dependencies.recordQuiet({
		sceneKey: request.sceneKey,
		disposition,
		attemptDispositions,
	});
	return { status: "quiet" as const, disposition, attemptDispositions };
}
