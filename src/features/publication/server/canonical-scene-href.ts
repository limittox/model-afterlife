import { canonicalScenePath } from "../contracts/public-publication.ts";

type CanonicalSceneIdentity = {
	revisionId?: unknown;
	originalRevisionId?: unknown;
};

export function canonicalSceneHref(
	identity: CanonicalSceneIdentity,
): string | null {
	const canonicalId =
		typeof identity.originalRevisionId === "string"
			? identity.originalRevisionId
			: identity.revisionId;
	return typeof canonicalId === "string"
		? canonicalScenePath(canonicalId)
		: null;
}
