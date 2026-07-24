import type { PublishedSceneRevision } from "./contracts.ts";
import type { ValidationManifest } from "./validate-scene-candidate.ts";

declare const acceptedCandidateBrand: unique symbol;

export type AcceptedCandidate = Readonly<{
	revision: PublishedSceneRevision;
	manifest: ValidationManifest;
	[acceptedCandidateBrand]: true;
}>;

const issuedCandidates = new WeakSet<object>();

function deepFreeze<T>(value: T): T {
	if (value && typeof value === "object" && !Object.isFrozen(value)) {
		Object.freeze(value);
		for (const child of Object.values(value as Record<string, unknown>)) {
			deepFreeze(child);
		}
	}
	return value;
}

export function issueAcceptedCandidate(
	revision: PublishedSceneRevision,
	manifest: ValidationManifest,
): AcceptedCandidate {
	const candidate = deepFreeze({
		revision: structuredClone(revision),
		manifest: structuredClone(manifest),
	}) as AcceptedCandidate;
	issuedCandidates.add(candidate);
	return candidate;
}

export function acceptedRevision(candidate: AcceptedCandidate): PublishedSceneRevision {
	if (!candidate || typeof candidate !== "object" || !issuedCandidates.has(candidate)) {
		throw new TypeError("Scene publication requires a validator-issued AcceptedCandidate.");
	}
	return candidate.revision;
}
