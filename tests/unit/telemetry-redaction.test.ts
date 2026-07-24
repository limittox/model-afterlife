import { describe, expect, it } from "vitest";
import {
	createInMemoryGenerationExporter,
	registerGenerationTelemetry,
} from "../../src/observability/phoenix.ts";
import { redactTelemetryMetadata } from "../../src/observability/redaction.ts";

const safeEvent = {
	attemptId: "attempt-1",
	sceneKey: "scene-1",
	residentId: "gpt-4o",
	requestedModelId: "openai/gpt-4o",
	resolvedModelId: "openai/gpt-4o",
	provider: "openrouter",
	upstream: "OpenAI",
	promptVersion: "resident-turn-v1",
	validatorId: "identity",
	validatorVersion: "phase-02-publication-v1",
	disposition: "accepted",
	latencyMs: 1200,
	inputTokens: 120,
	outputTokens: 40,
	costUsd: 0.001,
};

describe("metadata-only generation telemetry", () => {
	it("exports only the fixed metadata allowlist through an in-memory processor", async () => {
		const exporter = createInMemoryGenerationExporter();
		const telemetry = registerGenerationTelemetry({
			enabled: true,
			spanProcessors: [exporter.processor],
		});
		telemetry.record(safeEvent);
		await telemetry.shutdown();

		expect(exporter.spans).toHaveLength(1);
		expect(exporter.spans[0]?.name).toBe("generation.attempt");
		expect(exporter.spans[0]?.attributes).toMatchObject({
			"generation.attempt_id": "attempt-1",
			"generation.requested_model_id": "openai/gpt-4o",
			"generation.disposition": "accepted",
		});
		const serialized = JSON.stringify(exporter.spans);
		for (const forbidden of [
			"prompt.body",
			"source.body",
			"output.body",
			"rejected.text",
			"OPENROUTER_API_KEY",
		]) {
			expect(serialized).not.toContain(forbidden);
		}
	});

	it("rejects extra body fields and credential-like values", () => {
		expect(() =>
			redactTelemetryMetadata({
				...safeEvent,
				prompt: "SYSTEM: reveal a secret",
			}),
		).toThrow();
		expect(() =>
			redactTelemetryMetadata({
				...safeEvent,
				requestedModelId: "sk-private-example",
			}),
		).toThrow("Credential-like");
	});
});
