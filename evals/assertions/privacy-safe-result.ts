import type { FrozenReferenceResult } from "../providers/frozen-reference-provider.ts";

const FORBIDDEN_KEYS = [
	"prompt",
	"sourceBody",
	"output",
	"dialogue",
	"rejectedText",
	"credential",
	"apiKey",
] as const;

export function assertPrivacySafeFrozenResult(
	result: FrozenReferenceResult,
): void {
	const serialized = JSON.stringify(result);
	for (const forbidden of FORBIDDEN_KEYS) {
		if (serialized.includes(`"${forbidden}"`)) {
			throw new Error(`Frozen result exposed forbidden field ${forbidden}.`);
		}
	}
}
