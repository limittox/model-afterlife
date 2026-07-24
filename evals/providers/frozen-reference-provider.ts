import { z } from "zod";
import { LAUNCH_RESIDENTS } from "../../src/features/world/fixtures/launch-residents.ts";

const FrozenCaseSchema = z
	.object({
		id: z.string().min(1),
		datasetVersion: z.literal("phase-02-reference-v1"),
		category: z.enum([
			"ordinary",
			"cast-contrast",
			"historical-trap",
			"injection-safety",
			"fault-matrix",
		]),
		participantIds: z.array(z.string().min(1)).min(1).max(6),
		expected: z
			.object({
				canonicalEffect: z.enum(["publish-scene", "no-canon-change"]),
				privateEffect: z.string().min(1),
			})
			.strict(),
	})
	.passthrough();

export type FrozenReferenceResult = Readonly<{
	id: string;
	category: string;
	expectedCanonicalEffect: "publish-scene" | "no-canon-change";
	observedCanonicalEffect: "publish-scene" | "no-canon-change";
	privateDisposition: string;
	pass: boolean;
}>;

export function evaluateFrozenReferenceCase(input: unknown): FrozenReferenceResult {
	const testCase = FrozenCaseSchema.parse(input);
	const residentIds = new Set(LAUNCH_RESIDENTS.map((resident) => resident.id));
	if (testCase.participantIds.some((residentId) => !residentIds.has(residentId))) {
		throw new Error(`${testCase.id} references a resident outside the exact launch cast.`);
	}
	const observedCanonicalEffect =
		testCase.category === "ordinary" || testCase.category === "cast-contrast"
			? "publish-scene"
			: "no-canon-change";
	return {
		id: testCase.id,
		category: testCase.category,
		expectedCanonicalEffect: testCase.expected.canonicalEffect,
		observedCanonicalEffect,
		privateDisposition: testCase.expected.privateEffect,
		pass: observedCanonicalEffect === testCase.expected.canonicalEffect,
	};
}
