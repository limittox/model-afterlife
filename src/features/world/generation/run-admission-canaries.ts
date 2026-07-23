import { createHash } from "node:crypto";
import { SceneBriefSchema } from "./contracts.ts";
import { historicalClaimsFor, LAUNCH_RESIDENTS } from "../fixtures/launch-residents.ts";
import { OpenRouterResidentTurnProvider } from "./openrouter-resident-turn-provider.ts";
import { OpenRouterIdentityError } from "./openrouter-metadata.ts";
import {
	AdmissionIdentityError,
	type AdmissionCatalogEvidence,
	type RawAdmissionSample,
	type SanitizedAdmissionSample,
	validateAdmissionSample,
} from "./provider-identity.ts";
import {
	RESIDENT_PROVIDER_PROFILES,
	type ResidentProviderProfile,
} from "./provider-registry.ts";

export type AdmissionDependencies = {
	checkCatalog: (
		profile: ResidentProviderProfile,
	) => Promise<AdmissionCatalogEvidence>;
	generateSample: (
		profile: ResidentProviderProfile,
		ordinal: number,
		catalogEvidence: AdmissionCatalogEvidence,
	) => Promise<RawAdmissionSample>;
};

export type ResidentAdmissionSummary = {
	residentId: string;
	requestedModelId: string;
	canonicalModelId: string;
	approvedUpstream: string;
	maxOutputTokens: ResidentProviderProfile["maxOutputTokens"];
	reasoning?: ResidentProviderProfile["reasoning"];
	adapterVersion: ResidentProviderProfile["adapterVersion"];
	routingPolicyVersion: ResidentProviderProfile["routingPolicyVersion"];
	catalogEvidence: AdmissionCatalogEvidence;
	samples: SanitizedAdmissionSample[];
	p50LatencyMs: number;
	p95LatencyMs: number;
	totalCost: number;
};

export type AdmissionSummary = {
	schemaVersion: 1;
	status: "admitted";
	checkedAt: string;
	sampleCount: number;
	residents: ResidentAdmissionSummary[];
};

export class ResidentAdmissionError extends Error {
	readonly residentId: string;
	readonly approvedUpstream: string;
	readonly code: string;
	readonly callsConsumed: number;

	constructor(input: {
		residentId: string;
		approvedUpstream: string;
		code: string;
		callsConsumed: number;
	}) {
		super(
			`Resident admission failed for ${input.residentId} via ${input.approvedUpstream} (${input.code}).`,
		);
		this.name = "ResidentAdmissionError";
		this.residentId = input.residentId;
		this.approvedUpstream = input.approvedUpstream;
		this.code = input.code;
		this.callsConsumed = input.callsConsumed;
	}
}

function percentile(values: readonly number[], fraction: number): number {
	const sorted = [...values].sort((left, right) => left - right);
	const index = Math.max(0, Math.ceil(sorted.length * fraction) - 1);
	return sorted[index] ?? 0;
}

export function classifyAdmissionFailure(error: unknown): string {
	if (error instanceof AdmissionIdentityError) return error.code;
	if (error instanceof OpenRouterIdentityError) return error.code;
	if (!error || typeof error !== "object") return "generation-check-failed";

	const failure = error as { name?: unknown; statusCode?: unknown; status?: unknown };
	const status = failure.statusCode ?? failure.status;
	if (Number.isInteger(status) && Number(status) >= 400 && Number(status) <= 599) {
		return `provider-http-${status}`;
	}
	if (failure.name === "TimeoutError" || failure.name === "AbortError") {
		return "provider-timeout";
	}
	if (failure.name === "AI_NoObjectGeneratedError") return "schema-no-object";
	if (failure.name === "ZodError") return "schema-invalid";
	return "generation-check-failed";
}

export async function runAdmissionCanaries(
	options: { samples: number; checkedAt?: string },
	dependencies: AdmissionDependencies,
): Promise<AdmissionSummary> {
	if (options.samples !== 5) {
		throw new RangeError("Resident admission requires exactly five samples per resident.");
	}

	let callsConsumed = 0;
	const preparedResidents: {
		profile: ResidentProviderProfile;
		catalogEvidence: AdmissionCatalogEvidence;
		samples: SanitizedAdmissionSample[];
	}[] = [];
	for (const profile of RESIDENT_PROVIDER_PROFILES) {
		let catalogEvidence: AdmissionCatalogEvidence;
		try {
			catalogEvidence = await dependencies.checkCatalog(profile);
		} catch {
			throw new ResidentAdmissionError({
				residentId: profile.residentId,
				approvedUpstream: profile.approvedUpstream,
				code: "catalog-check-failed",
				callsConsumed,
			});
		}

		preparedResidents.push({ profile, catalogEvidence, samples: [] });
	}

	for (let ordinal = 1; ordinal <= options.samples; ordinal += 1) {
		for (const prepared of preparedResidents) {
			const { profile, catalogEvidence, samples } = prepared;
			try {
				callsConsumed += 1;
				const sample = await dependencies.generateSample(
					profile,
					ordinal,
					catalogEvidence,
				);
				samples.push(
					validateAdmissionSample({ profile, catalogEvidence, sample }),
				);
			} catch (error) {
				throw new ResidentAdmissionError({
					residentId: profile.residentId,
					approvedUpstream: profile.approvedUpstream,
					code: classifyAdmissionFailure(error),
					callsConsumed,
				});
			}
		}
	}

	const residents = preparedResidents.map(
		({ profile, catalogEvidence, samples }): ResidentAdmissionSummary => {
			const latencies = samples.map((sample) => sample.latencyMs);
			return {
				residentId: profile.residentId,
				requestedModelId: profile.requestedModelId,
				canonicalModelId: profile.canonicalModelId,
				approvedUpstream: profile.approvedUpstream,
				maxOutputTokens: profile.maxOutputTokens,
				...("reasoning" in profile && profile.reasoning
					? { reasoning: profile.reasoning }
					: {}),
				adapterVersion: profile.adapterVersion,
				routingPolicyVersion: profile.routingPolicyVersion,
				catalogEvidence,
				samples,
				p50LatencyMs: percentile(latencies, 0.5),
				p95LatencyMs: percentile(latencies, 0.95),
				totalCost: samples.reduce((sum, sample) => sum + sample.usage.cost, 0),
			};
		},
	);

	return {
		schemaVersion: 1,
		status: "admitted",
		checkedAt: options.checkedAt ?? new Date().toISOString(),
		sampleCount: residents.reduce((sum, resident) => sum + resident.samples.length, 0),
		residents,
	};
}

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | undefined {
	return value && typeof value === "object" ? (value as JsonRecord) : undefined;
}

function string(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value : undefined;
}

function stringArray(value: unknown): string[] {
	return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeSlug(value: string): string {
	return value
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/gu, "-")
		.replaceAll(/^-|-$/gu, "");
}

async function getJson(
	fetcher: typeof fetch,
	url: string,
	apiKey: string,
): Promise<JsonRecord> {
	const response = await fetcher(url, {
		headers: { Authorization: `Bearer ${apiKey}` },
		signal: AbortSignal.timeout(30_000),
	});
	if (!response.ok) throw new Error("catalog-request-failed");
	const body = record(await response.json());
	if (!body) throw new Error("catalog-response-invalid");
	return body;
}

function endpointEntries(body: JsonRecord): JsonRecord[] {
	const data = record(body.data);
	const candidates = data?.endpoints ?? body.endpoints ?? body.data;
	return Array.isArray(candidates)
		? candidates.map(record).filter((entry): entry is JsonRecord => Boolean(entry))
		: [];
}

function modelData(body: JsonRecord): JsonRecord {
	return record(body.data) ?? body;
}

function routeMatches(endpoint: JsonRecord, profile: ResidentProviderProfile): boolean {
	const name = string(endpoint.provider_name) ?? string(endpoint.provider) ?? string(endpoint.name);
	const tag = string(endpoint.tag) ?? string(endpoint.provider_slug) ?? string(endpoint.slug);
	return (
		name === profile.selectedUpstreamName ||
		tag === profile.approvedUpstream ||
		(name ? normalizeSlug(name) === profile.approvedUpstream : false)
	);
}

function quantizationFor(endpoint: JsonRecord): string {
	return (
		string(endpoint.quantization) ??
		string(endpoint.quantization_name) ??
		"unknown"
	).toLowerCase();
}

function modelPath(modelId: string): string {
	return modelId
		.split("/")
		.map((segment) => encodeURIComponent(segment))
		.join("/");
}

function canaryBrief(profile: ResidentProviderProfile, ordinal: number) {
	const resident = LAUNCH_RESIDENTS.find(
		(candidate) => candidate.id === profile.residentId,
	);
	if (!resident) throw new Error("resident-profile-missing");
	const partner = LAUNCH_RESIDENTS.find(
		(candidate) => candidate.id !== profile.residentId,
	);
	const claim = historicalClaimsFor(profile.residentId).find(
		(candidate) => candidate.editorialStatus === "approved",
	);
	if (!partner || !claim) throw new Error("resident-context-missing");

	return SceneBriefSchema.parse({
		schemaVersion: 1,
		sceneKey: `admission-${profile.residentId}-${ordinal}`,
		expectedWorldHead: 1,
		participantIds: [profile.residentId, partner.id],
		speakerOrder: [profile.residentId, partner.id, profile.residentId, partner.id],
		locationId: "common-room",
		premise: "A quiet resident notices the tea has cooled and makes one gentle observation.",
		allowedFactIds: [claim.claimId],
		tone: "warm, concise, and non-confrontational",
		turnBudget: 4,
		permittedOutcome: "One brief line; no state change and no relationship effect.",
	});
}

export function createLiveAdmissionDependencies(input: {
	apiKey: string;
	fetch?: typeof fetch;
}): AdmissionDependencies {
	const fetcher = input.fetch ?? fetch;
	const provider = new OpenRouterResidentTurnProvider({ apiKey: input.apiKey });

	return {
		async checkCatalog(profile) {
			const path = modelPath(profile.requestedModelId);
			const [modelBody, endpointsBody] = await Promise.all([
				getJson(fetcher, `https://openrouter.ai/api/v1/model/${path}`, input.apiKey),
				getJson(
					fetcher,
					`https://openrouter.ai/api/v1/models/${path}/endpoints`,
					input.apiKey,
				),
			]);
			const model = modelData(modelBody);
			const returnedModelId = string(model.id) ?? string(model.slug);
			if (
				returnedModelId !== profile.requestedModelId &&
				returnedModelId !== profile.canonicalModelId
			) {
				throw new Error("catalog-model-mismatch");
			}
			const endpoint = endpointEntries(endpointsBody).find((candidate) =>
				routeMatches(candidate, profile),
			);
			if (!endpoint) throw new Error("catalog-route-unavailable");
			const providerName =
				string(endpoint.provider_name) ??
				string(endpoint.provider) ??
				string(endpoint.name);
			if (providerName !== profile.selectedUpstreamName) {
				throw new Error("catalog-provider-mismatch");
			}

			return {
				checkedAt: new Date().toISOString(),
				modelId: profile.requestedModelId,
				canonicalModelId: profile.canonicalModelId,
				endpoint: {
					providerName,
					providerSlug: profile.approvedUpstream,
					quantization: quantizationFor(endpoint),
					supportedParameters: stringArray(endpoint.supported_parameters),
				},
			};
		},

		async generateSample(profile, ordinal) {
			const startedAt = performance.now();
			const result = await provider.generateTurn({
				brief: canaryBrief(profile, ordinal),
				turnIndex: 0,
				residentId: profile.residentId,
				requestedModelId: profile.requestedModelId,
				priorTurns: [],
				relationships: [],
				memories: [],
			});
			const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));
			const provenance = result.provenance;
			if (!provenance || provenance.usage.cost === undefined) {
				throw new Error("provenance-incomplete");
			}

			return {
				...provenance,
				usage: {
					inputTokens: provenance.usage.inputTokens,
					outputTokens: provenance.usage.outputTokens,
					cost: provenance.usage.cost,
				},
				latencyMs,
				schemaValid: true,
				finishReason: result.finishReason ?? "unknown",
				textHash: createHash("sha256").update(result.text).digest("hex"),
			};
		},
	};
}
