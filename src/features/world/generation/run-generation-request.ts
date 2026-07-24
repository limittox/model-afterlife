import type { PublishedSceneRevision, SceneBrief } from "./contracts.ts";
import type { CommittedGenerationRequest } from "../server/advance-world-to.ts";

export type GenerationAttemptDisposition =
	| "schema_rejected"
	| "identity_rejected"
	| "fact_rejected"
	| "safety_rejected"
	| "refused"
	| "timed_out"
	| "stale_world"
	| "provider_outage"
	| "publication_failed"
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
	publish: (revision: PublishedSceneRevision) => Promise<{
		revisionId: string;
		published?: boolean;
	}>;
	resolveContinuity: (input: {
		brief: SceneBrief;
		sceneKey: string;
		terminalDisposition:
			| "generation_failed_after_two_attempts"
			| "stale_world"
			| "publication_failed";
		attemptDispositions: GenerationAttemptDisposition[];
	}) => Promise<{
		mode: "quiet" | "cached";
		cachedRevisionId?: string;
	}>;
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
	const resolve = async (
		terminalDisposition:
			| "generation_failed_after_two_attempts"
			| "stale_world"
			| "publication_failed",
	) => {
		const continuity = await dependencies.resolveContinuity({
			brief,
			sceneKey: request.sceneKey,
			terminalDisposition,
			attemptDispositions,
		});
		return {
			status: continuity.mode,
			disposition: terminalDisposition,
			attemptDispositions,
			...(continuity.cachedRevisionId
				? { cachedRevisionId: continuity.cachedRevisionId }
				: {}),
		} as const;
	};
	for (const attemptOrdinal of [1, 2] as const) {
		let result: GenerationAttemptResult;
		try {
			result = await dependencies.runAttempt({ brief, attemptOrdinal });
		} catch {
			result = { status: "rejected", disposition: "provider_failed" };
		}

		if (result.status === "accepted") {
			try {
				const publication = await dependencies.publish(result.revision);
				if (publication.published === false) {
					return {
						status: "duplicate" as const,
						revisionId: publication.revisionId,
						attemptOrdinal,
						attemptDispositions,
					};
				}
			} catch (error) {
				const disposition =
					error instanceof Error && error.message === "stale_world"
						? "stale_world"
						: "publication_failed";
				attemptDispositions.push(disposition);
				return resolve(disposition);
			}
			return {
				status: "published" as const,
				attemptOrdinal,
				attemptDispositions,
			};
		}
		attemptDispositions.push(result.disposition);
	}

	const disposition = "generation_failed_after_two_attempts" as const;
	return resolve(disposition);
}
