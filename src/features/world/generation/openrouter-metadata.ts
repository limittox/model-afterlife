import { z } from "zod";
import type { ResidentProviderProfile } from "./provider-registry.ts";

const nonBlank = z.string().trim().min(1);

const EndpointSchema = z
	.object({
		provider: nonBlank,
		model: nonBlank,
		selected: z.boolean(),
	})
	.passthrough();

const AttemptSchema = z
	.object({
		provider: nonBlank,
		model: nonBlank,
		status: z.number().int(),
	})
	.passthrough();

const PipelineStageSchema = z
	.object({
		type: nonBlank,
		name: nonBlank,
	})
	.passthrough();

const OpenRouterMetadataSchema = z
	.object({
		requested: nonBlank,
		strategy: nonBlank,
		attempt: z.number().int().nonnegative(),
		endpoints: z
			.object({
				total: z.number().int().nonnegative(),
				available: z.array(EndpointSchema),
			})
			.passthrough(),
		attempts: z.array(AttemptSchema).optional(),
		pipeline: z.array(PipelineStageSchema).optional(),
	})
	.passthrough();

export type OpenRouterVerifiedEvidence = {
	evidenceKind: "openrouter_verified";
	generationId: string;
	requestedModelId: string;
	canonicalModelId: string;
	selectedModelId: string;
	selectedUpstream: string;
	strategy: "direct";
	routeAttempt: 1;
};

export function validateOpenRouterMetadata(input: {
	profile: ResidentProviderProfile;
	generationId: string | undefined;
	responseModelId: string;
	metadata: unknown;
}): OpenRouterVerifiedEvidence {
	if (!input.generationId?.trim()) {
		throw new Error("OpenRouter generation ID is required for authorship evidence.");
	}

	const parsed = OpenRouterMetadataSchema.safeParse(input.metadata);
	if (!parsed.success) {
		throw new Error("OpenRouter router metadata is missing or malformed.");
	}
	const metadata = parsed.data;
	if (metadata.requested !== input.profile.requestedModelId) {
		throw new Error("OpenRouter requested model does not match the exact profile.");
	}
	if (metadata.strategy !== "direct" || metadata.attempt !== 1) {
		throw new Error("OpenRouter route was not direct on its first attempt.");
	}
	if (input.responseModelId !== input.profile.canonicalModelId) {
		throw new Error("OpenRouter response model does not match the canonical profile.");
	}
	if ((metadata.pipeline?.length ?? 0) !== 0) {
		throw new Error("OpenRouter materially transformed the resident response.");
	}

	const selected = metadata.endpoints.available.filter(
		(endpoint) => endpoint.selected,
	);
	if (
		selected.length !== 1 ||
		selected[0]?.provider !== input.profile.selectedUpstreamName ||
		selected[0]?.model !== input.profile.canonicalModelId
	) {
		throw new Error("OpenRouter selected an unexpected model or upstream.");
	}

	if (
		metadata.attempts?.length !== 1 ||
		metadata.attempts[0]?.provider !== input.profile.selectedUpstreamName ||
		metadata.attempts[0]?.model !== input.profile.canonicalModelId ||
		metadata.attempts[0]?.status !== 200
	) {
		throw new Error("OpenRouter attempt evidence does not prove one approved route.");
	}

	return {
		evidenceKind: "openrouter_verified",
		generationId: input.generationId,
		requestedModelId: input.profile.requestedModelId,
		canonicalModelId: input.profile.canonicalModelId,
		selectedModelId: selected[0].model,
		selectedUpstream: selected[0].provider,
		strategy: "direct",
		routeAttempt: 1,
	};
}
