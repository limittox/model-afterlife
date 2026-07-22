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

	it("uses a generic code for unknown errors without inspecting their message", () => {
		const error = providerError({ name: "UnexpectedProviderFailure" });
		expect(classifyAdmissionFailure(error)).toBe("generation-check-failed");
	});
});
