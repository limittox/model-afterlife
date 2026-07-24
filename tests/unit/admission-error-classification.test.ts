import { NoOutputGeneratedError } from "ai";
import { describe, expect, it } from "vitest";
import { OpenRouterIdentityError } from "../../src/features/world/generation/openrouter-metadata.ts";
import { classifyAdmissionFailure } from "../../src/features/world/generation/run-admission-canaries.ts";

const SECRET = "SENSITIVE prompt, output, response body, header, and credential material";

function providerError(properties: Record<string, unknown>): Error {
	return Object.assign(new Error(SECRET), properties, {
		responseBody: SECRET,
		requestBodyValues: { prompt: SECRET },
		responseHeaders: { authorization: SECRET },
	});
}

describe("admission failure classification", () => {
	it.each([
		{ label: "HTTP 401", error: providerError({ name: "AI_APICallError", statusCode: 401 }), expected: "provider-http-401" },
		{ label: "HTTP 429", error: providerError({ name: "AI_APICallError", statusCode: 429 }), expected: "provider-http-429" },
		{ label: "HTTP 503", error: providerError({ name: "AI_APICallError", statusCode: 503 }), expected: "provider-http-503" },
		{ label: "timeout", error: providerError({ name: "TimeoutError" }), expected: "provider-timeout" },
		{ label: "abort", error: providerError({ name: "AbortError" }), expected: "provider-timeout" },
		{ label: "no object", error: providerError({ name: "AI_NoObjectGeneratedError" }), expected: "schema-no-object" },
		{ label: "schema", error: providerError({ name: "ZodError" }), expected: "schema-invalid" },
	] as const)("returns a stable code for $label without sensitive detail", ({ error, expected }) => {
		const code = classifyAdmissionFailure(error);
		expect(code).toBe(expected);
		expect(JSON.stringify(code)).not.toContain(SECRET);
	});

	it("preserves only typed router identity codes", () => {
		const error = new OpenRouterIdentityError(
			"router-metadata-missing",
			SECRET,
		);
		const code = classifyAdmissionFailure(error);
		expect(code).toBe("router-metadata-missing");
		expect(JSON.stringify(code)).not.toContain(SECRET);
	});

	it("returns a stable code when a non-stop generation has no structured output", () => {
		const error = new NoOutputGeneratedError();
		const code = classifyAdmissionFailure(error);

		expect(code).toBe("generation-no-output");
		expect(JSON.stringify(code)).not.toContain(SECRET);
	});

	it.each([
		{
			label: "overlong text",
			issue: { code: "too_big", path: ["text"], message: SECRET },
			expected: "schema-text-too-long",
		},
		{
			label: "invalid text",
			issue: { code: "invalid_type", path: ["text"], message: SECRET },
			expected: "schema-text-invalid",
		},
		{
			label: "too many approved claims",
			issue: { code: "too_big", path: ["approvedClaimIds"], message: SECRET },
			expected: "schema-approved-claim-count",
		},
		{
			label: "invalid approved claim ID",
			issue: {
				code: "too_small",
				path: ["approvedClaimIds", 0],
				message: SECRET,
			},
			expected: "schema-approved-claim-ids-invalid",
		},
		{
			label: "forbidden relationship effects",
			issue: {
				code: "too_big",
				path: ["proposedRelationshipEffects"],
				message: SECRET,
			},
			expected: "schema-relationship-effects-forbidden",
		},
		{
			label: "invalid ends-scene flag",
			issue: { code: "invalid_type", path: ["endsScene"], message: SECRET },
			expected: "schema-ends-scene-invalid",
		},
	] as const)(
		"returns a privacy-safe field-level code for $label",
		({ issue, expected }) => {
			const error = providerError({ name: "ZodError", issues: [issue] });
			const code = classifyAdmissionFailure(error);

			expect(code).toBe(expected);
			expect(JSON.stringify(code)).not.toContain(SECRET);
		},
	);

	it("uses a generic code for unknown errors without inspecting their message", () => {
		const error = providerError({ name: "UnexpectedProviderFailure" });
		expect(classifyAdmissionFailure(error)).toBe("generation-check-failed");
	});
});
