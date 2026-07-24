import { z } from "zod";

const opaqueId = z
	.string()
	.trim()
	.min(1)
	.max(160)
	.regex(/^[a-zA-Z0-9._:/@-]+$/)
	.refine(
		(value) => !/^(?:sk-|phx_|bearer)/iu.test(value),
		"Credential-like values are not telemetry metadata.",
	);

export const GenerationTelemetrySchema = z
	.object({
		attemptId: opaqueId,
		sceneKey: opaqueId,
		residentId: opaqueId.optional(),
		requestedModelId: opaqueId.optional(),
		resolvedModelId: opaqueId.optional(),
		provider: opaqueId.optional(),
		upstream: opaqueId.optional(),
		promptVersion: opaqueId.optional(),
		validatorId: opaqueId.optional(),
		validatorVersion: opaqueId.optional(),
		disposition: opaqueId,
		latencyMs: z.number().int().nonnegative().max(600_000),
		inputTokens: z.number().int().nonnegative().max(10_000_000),
		outputTokens: z.number().int().nonnegative().max(10_000_000),
		costUsd: z.number().nonnegative().max(1_000).optional(),
	})
	.strict();

export type GenerationTelemetry = z.infer<typeof GenerationTelemetrySchema>;

const TELEMETRY_ATTRIBUTE_KEYS = {
	attemptId: "generation.attempt_id",
	sceneKey: "generation.scene_key",
	residentId: "generation.resident_id",
	requestedModelId: "generation.requested_model_id",
	resolvedModelId: "generation.resolved_model_id",
	provider: "generation.provider",
	upstream: "generation.upstream",
	promptVersion: "generation.prompt_version",
	validatorId: "generation.validator_id",
	validatorVersion: "generation.validator_version",
	disposition: "generation.disposition",
	latencyMs: "generation.latency_ms",
	inputTokens: "generation.input_tokens",
	outputTokens: "generation.output_tokens",
	costUsd: "generation.cost_usd",
} as const;

export function redactTelemetryMetadata(
	input: unknown,
): Record<string, string | number | boolean> {
	const parsed = GenerationTelemetrySchema.parse(input);
	const attributes: Record<string, string | number | boolean> = {};
	for (const [key, attributeName] of Object.entries(TELEMETRY_ATTRIBUTE_KEYS)) {
		const value = parsed[key as keyof GenerationTelemetry];
		if (value !== undefined) attributes[attributeName] = value;
	}
	return attributes;
}
