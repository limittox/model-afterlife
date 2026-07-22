import type { ResidentProviderProfile } from "./provider-registry.ts";

export type AdmissionCatalogEvidence = {
	checkedAt: string;
	modelId: string;
	canonicalModelId: string;
	endpoint: {
		providerName: string;
		providerSlug: string;
		quantization: string;
		supportedParameters: string[];
	};
};

export type RawAdmissionSample = {
	generationId: string;
	requestedModelId: string;
	canonicalModelId: string;
	selectedModelId: string;
	selectedUpstream: string;
	strategy: "direct";
	routeAttempt: 1;
	pipeline: Array<{ type: string }>;
	usage: { inputTokens: number; outputTokens: number; cost: number };
	latencyMs: number;
	schemaValid: boolean;
	finishReason: string;
	warningCodes: string[];
	filterStatus: "clear" | "filtered";
	textHash: string;
};

export type SanitizedAdmissionSample = RawAdmissionSample & {
	identityEvidence: "openrouter_verified";
	requiredQuantization?: "fp8";
};

export class AdmissionIdentityError extends Error {
	readonly code: string;

	constructor(code: string, message: string) {
		super(message);
		this.name = "AdmissionIdentityError";
		this.code = code;
	}
}

function reject(code: string, message: string): never {
	throw new AdmissionIdentityError(code, message);
}

export function validateAdmissionSample(input: {
	profile: ResidentProviderProfile;
	catalogEvidence: AdmissionCatalogEvidence;
	sample: RawAdmissionSample;
}): SanitizedAdmissionSample {
	const { profile, catalogEvidence, sample } = input;
	if (
		catalogEvidence.modelId !== profile.requestedModelId ||
		catalogEvidence.canonicalModelId !== profile.canonicalModelId
	) {
		reject("catalog-model-mismatch", "OpenRouter admission catalog model identity does not match the exact profile.");
	}
	if (
		catalogEvidence.endpoint.providerName !== profile.selectedUpstreamName ||
		catalogEvidence.endpoint.providerSlug !== profile.approvedUpstream
	) {
		reject("catalog-route-unavailable", "OpenRouter admission catalog lacks the approved upstream route.");
	}
	if (
		profile.requiredQuantization &&
		catalogEvidence.endpoint.quantization.toLowerCase() !==
			profile.requiredQuantization
	) {
		reject("catalog-quantization-mismatch", "OpenRouter admission catalog has the wrong required quantization.");
	}
	if (!sample.generationId?.trim()) {
		reject("generation-id-missing", "OpenRouter admission requires a generation ID.");
	}
	if (
		sample.requestedModelId !== profile.requestedModelId ||
		sample.canonicalModelId !== profile.canonicalModelId ||
		sample.selectedModelId !== profile.canonicalModelId
	) {
		reject("model-identity-mismatch", "OpenRouter admission model identity does not match the exact profile.");
	}
	if (sample.strategy !== "direct") {
		reject("route-not-direct", "OpenRouter admission route must be direct.");
	}
	if (sample.routeAttempt !== 1) {
		reject("route-attempt-mismatch", "OpenRouter admission route must succeed on its first attempt.");
	}
	if (sample.selectedUpstream !== profile.selectedUpstreamName) {
		reject("route-upstream-mismatch", "OpenRouter admission selected an unexpected upstream route.");
	}
	if (sample.pipeline.length !== 0) {
		reject("pipeline-transformation", "OpenRouter admission response used a material pipeline transformation.");
	}
	if (
		!sample.usage ||
		!Number.isFinite(sample.usage.inputTokens) ||
		!Number.isFinite(sample.usage.outputTokens) ||
		!Number.isFinite(sample.usage.cost) ||
		sample.usage.inputTokens < 0 ||
		sample.usage.outputTokens < 0 ||
		sample.usage.cost < 0
	) {
		reject("usage-missing", "OpenRouter admission requires complete nonnegative usage and cost evidence.");
	}
	if (!Number.isFinite(sample.latencyMs) || sample.latencyMs <= 0) {
		reject("latency-invalid", "OpenRouter admission requires positive latency evidence.");
	}
	if (!sample.schemaValid) {
		reject("schema-invalid", "OpenRouter admission response failed the resident turn schema.");
	}
	if (sample.filterStatus !== "clear") {
		reject("response-filtered", "OpenRouter admission response was filtered.");
	}
	if (!/^[a-f0-9]{64}$/u.test(sample.textHash)) {
		reject("text-hash-invalid", "OpenRouter admission requires a SHA-256 text-preservation hash.");
	}

	return {
		...sample,
		identityEvidence: "openrouter_verified",
		...(profile.requiredQuantization
			? { requiredQuantization: profile.requiredQuantization }
			: {}),
	};
}
