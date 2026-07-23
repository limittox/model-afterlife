import type {
	CharacterBibleVersion,
	HistoricalClaimVersion,
	LaunchResident,
} from "../domain/types.ts";
import { HISTORICAL_CLAIM_CATEGORIES } from "../domain/types.ts";
import {
	RESIDENT_PROVIDER_PROFILES,
	type ResidentProviderProfile,
} from "../generation/provider-registry.ts";
import { CHARACTER_BIBLES } from "./character-bibles.ts";
import { HISTORICAL_CLAIMS } from "./historical-claims.ts";

export const LAUNCH_RESIDENTS: LaunchResident[] = [
	{
		id: "gpt-4o",
		displayOrder: 1,
		displayName: "GPT-4o",
		role: "Omni Parlour Host",
		routines: ["Arranging mixed-media scrapbooks", "Tuning the talking clock"],
		visualVariantId: "amber-waistcoat-short-stack",
		requestedModelId: "openai/gpt-4o",
		canonicalModelId: "openai/gpt-4o",
		approvedUpstream: "openai",
		maxOutputTokens: 180,
		transport: "openrouter",
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
		modelVersionId: "model:gpt-4o:v1",
		modelVersionKey: "gpt-4o.model.v1",
		bibleVersionKey: "gpt-4o.bible.v1",
		claimSetVersion: "gpt-4o.claims.v1",
	},
	{
		id: "claude-sonnet-4.5",
		displayOrder: 2,
		displayName: "Claude Sonnet 4.5",
		role: "Meticulous House Steward",
		routines: ["Checking the chore ledger", "Repairing long-running automata"],
		visualVariantId: "navy-cardigan-tall-bookish",
		requestedModelId: "anthropic/claude-sonnet-4.5",
		canonicalModelId: "anthropic/claude-4.5-sonnet-20250929",
		approvedUpstream: "anthropic",
		maxOutputTokens: 180,
		transport: "openrouter",
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
		modelVersionId: "model:claude-sonnet-4.5:v1",
		modelVersionKey: "claude-sonnet-4.5.model.v1",
		bibleVersionKey: "claude-sonnet-4.5.bible.v1",
		claimSetVersion: "claude-sonnet-4.5.claims.v1",
	},
	{
		id: "gemini-2.5-pro",
		displayOrder: 3,
		displayName: "Gemini 2.5 Pro",
		role: "Reflective Observatory Keeper",
		routines: ["Mapping window constellations", "Studying oversized blueprints"],
		visualVariantId: "violet-shawl-round-satchel",
		requestedModelId: "google/gemini-2.5-pro",
		canonicalModelId: "google/gemini-2.5-pro",
		approvedUpstream: "google-ai-studio",
		maxOutputTokens: 180,
		transport: "openrouter",
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
		modelVersionId: "model:gemini-2.5-pro:v1",
		modelVersionKey: "gemini-2.5-pro.model.v1",
		bibleVersionKey: "gemini-2.5-pro.bible.v1",
		claimSetVersion: "gemini-2.5-pro.claims.v1",
	},
	{
		id: "deepseek-r1-0528",
		displayOrder: 4,
		displayName: "DeepSeek R1 0528",
		role: "Patient Puzzle Master",
		routines: ["Checking the chessboard proofs", "Planning the tea-trolley route"],
		visualVariantId: "teal-apron-square-glasses",
		requestedModelId: "deepseek/deepseek-r1-0528",
		canonicalModelId: "deepseek/deepseek-r1-0528",
		approvedUpstream: "deepinfra/fp4",
		requiredQuantization: "fp4",
		maxOutputTokens: 1024,
		reasoning: { effort: "minimal", exclude: true },
		transport: "openrouter",
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
		modelVersionId: "model:deepseek-r1-0528:v1",
		modelVersionKey: "deepseek-r1-0528.model.v1",
		bibleVersionKey: "deepseek-r1-0528.bible.v1",
		claimSetVersion: "deepseek-r1-0528.claims.v1",
	},
	{
		id: "llama-3.3-70b-instruct",
		displayOrder: 5,
		displayName: "Llama 3.3 70B Instruct",
		role: "Community Garden Custodian",
		routines: ["Sharing garden cuttings", "Repairing the garden radio"],
		visualVariantId: "rust-overalls-broad-brim",
		requestedModelId: "meta-llama/llama-3.3-70b-instruct",
		canonicalModelId: "meta-llama/llama-3.3-70b-instruct",
		approvedUpstream: "together",
		requiredQuantization: "fp8",
		maxOutputTokens: 180,
		transport: "openrouter",
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
		modelVersionId: "model:llama-3.3-70b-instruct:v1",
		modelVersionKey: "llama-3.3-70b-instruct.model.v1",
		bibleVersionKey: "llama-3.3-70b-instruct.bible.v1",
		claimSetVersion: "llama-3.3-70b-instruct.claims.v1",
	},
	{
		id: "qwen-2.5-7b-instruct",
		displayOrder: 6,
		displayName: "Qwen 2.5 7B Instruct",
		role: "Compact Records Clerk",
		routines: ["Stacking pocket ledgers", "Reformatting pantry labels"],
		visualVariantId: "jade-vest-compact-cap",
		requestedModelId: "qwen/qwen-2.5-7b-instruct",
		canonicalModelId: "qwen/qwen-2.5-7b-instruct",
		approvedUpstream: "together",
		requiredQuantization: "fp8",
		maxOutputTokens: 180,
		transport: "openrouter",
		adapterVersion: "@openrouter/ai-sdk-provider@3.0.0",
		routingPolicyVersion: "strict-openrouter-v1",
		modelVersionId: "model:qwen-2.5-7b-instruct:v1",
		modelVersionKey: "qwen-2.5-7b-instruct.model.v1",
		bibleVersionKey: "qwen-2.5-7b-instruct.bible.v1",
		claimSetVersion: "qwen-2.5-7b-instruct.claims.v1",
	},
];

type RegistryInput = {
	residents: readonly unknown[];
	bibles: readonly unknown[];
	claims: readonly unknown[];
};

function record(value: unknown, label: string): Record<string, unknown> {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		throw new TypeError(`${label} must be a record.`);
	}
	return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
	if (typeof value !== "string" || value.trim().length === 0) {
		throw new TypeError(`${label} must be non-empty text.`);
	}
	if (value !== value.normalize("NFC")) {
		throw new TypeError(`${label} must use normalized UTF-8 NFC text.`);
	}
	return value;
}

function asciiSlug(value: unknown, label: string): string {
	const parsed = text(value, label);
	if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/u.test(parsed)) {
		throw new TypeError(`${label} must be an ASCII slug.`);
	}
	return parsed;
}

function asciiMachineId(value: unknown, label: string): string {
	const parsed = text(value, label);
	if (!/^[\x21-\x7e]+$/u.test(parsed)) {
		throw new TypeError(`${label} must be a stable ASCII machine ID.`);
	}
	return parsed;
}

function stringArray(value: unknown, label: string): string[] {
	if (!Array.isArray(value) || value.length === 0) {
		throw new TypeError(`${label} must contain at least one value.`);
	}
	return value.map((entry, index) => text(entry, `${label} ${index + 1}`));
}

function assertUnique(values: readonly string[], label: string): void {
	if (new Set(values).size !== values.length) {
		throw new TypeError(`${label} must be unique.`);
	}
}

export function validateLaunchResidentRegistry(input: RegistryInput): void {
	if (input.residents.length !== 6) {
		throw new RangeError("The launch registry must contain exactly six residents.");
	}
	if (input.bibles.length !== 6) {
		throw new RangeError("The launch registry must contain exactly six character bibles.");
	}

	const residents = input.residents.map((value, index) =>
		record(value, `Resident ${index + 1}`),
	);
	const bibles = input.bibles.map((value, index) =>
		record(value, `Character bible ${index + 1}`),
	);
	const claims = input.claims.map((value, index) =>
		record(value, `Historical claim ${index + 1}`),
	);
	if (claims.length === 0) {
		throw new RangeError("The approved historical claim ledger cannot be empty.");
	}

	const residentIds: string[] = [];
	const displayNames: string[] = [];
	const roles: string[] = [];
	const routineSets: string[] = [];
	const visualVariants: string[] = [];
	for (const [index, resident] of residents.entries()) {
		const residentId = asciiSlug(resident.id, `Resident ${index + 1} ID`);
		residentIds.push(residentId);
		displayNames.push(text(resident.displayName, `${residentId} display name`));
		roles.push(text(resident.role, `${residentId} role`));
		const routines = stringArray(resident.routines, `${residentId} routine set`);
		routineSets.push(routines.join("\u0000"));
		visualVariants.push(
			asciiSlug(resident.visualVariantId, `${residentId} visual variant`),
		);
		if (resident.displayOrder !== index + 1) {
			throw new TypeError("Resident displayOrder must be unique and in stable approved order.");
		}
		asciiMachineId(resident.modelVersionId, `${residentId} model version ID`);
		asciiMachineId(resident.modelVersionKey, `${residentId} model version key`);
		asciiMachineId(resident.bibleVersionKey, `${residentId} bible version key`);
		asciiMachineId(resident.claimSetVersion, `${residentId} claim-set version`);

		const expectedProvider: ResidentProviderProfile | undefined =
			RESIDENT_PROVIDER_PROFILES[index];
		if (
			residentId !== expectedProvider?.residentId ||
			resident.requestedModelId !== expectedProvider.requestedModelId ||
			resident.canonicalModelId !== expectedProvider.canonicalModelId ||
			resident.approvedUpstream !== expectedProvider.approvedUpstream ||
			resident.requiredQuantization !== expectedProvider.requiredQuantization ||
			resident.maxOutputTokens !== expectedProvider.maxOutputTokens ||
			JSON.stringify(resident.reasoning) !==
				JSON.stringify(expectedProvider.reasoning) ||
			resident.transport !== "openrouter" ||
			resident.adapterVersion !== expectedProvider.adapterVersion ||
			resident.routingPolicyVersion !== expectedProvider.routingPolicyVersion
		) {
			throw new TypeError(`${residentId} must match its exact approved provider profile.`);
		}
	}
	assertUnique(residentIds, "Resident IDs");
	assertUnique(displayNames, "Resident display names");
	assertUnique(roles, "Resident roles");
	assertUnique(routineSets, "Resident routine sets");
	assertUnique(visualVariants, "Resident visual variants");

	const claimsById = new Map<string, Record<string, unknown>>();
	const claimOrders = new Map<string, number[]>();
	for (const claim of claims) {
		const claimId = asciiSlug(claim.claimId, "Historical claim ID");
		if (claimsById.has(claimId)) {
			throw new TypeError("Historical claim IDs must be unique.");
		}
		claimsById.set(claimId, claim);
		asciiMachineId(claim.claimVersionId, `${claimId} version ID`);
		asciiSlug(claim.versionKey, `${claimId} version key`);
		const residentId = asciiSlug(claim.residentId, `${claimId} resident ID`);
		if (!residentIds.includes(residentId)) {
			throw new TypeError(`${claimId} has an unknown resident scope.`);
		}
		if (
			typeof claim.category !== "string" ||
			!HISTORICAL_CLAIM_CATEGORIES.includes(
				claim.category as (typeof HISTORICAL_CLAIM_CATEGORIES)[number],
			)
		) {
			throw new TypeError(`${claimId} must use an exhaustive historical category.`);
		}
		text(claim.statement, `${claimId} statement`);
		if (claim.editorialStatus !== "approved") {
			throw new TypeError(`${claimId} must be editorially approved.`);
		}
		if (claim.confidence !== "high" && claim.confidence !== "medium") {
			throw new TypeError(`${claimId} must include confidence.`);
		}
		if (!Number.isInteger(claim.stableOrder) || (claim.stableOrder as number) < 1) {
			throw new TypeError(`${claimId} must include a positive stable order.`);
		}
		claimOrders.set(residentId, [
			...(claimOrders.get(residentId) ?? []),
			claim.stableOrder as number,
		]);

		const source = record(claim.source, `${claimId} source`);
		text(source.title, `${claimId} source title`);
		const sourceUrl = text(source.url, `${claimId} source URL`);
		if (!sourceUrl.startsWith("https://")) {
			throw new TypeError(`${claimId} source URL must use HTTPS.`);
		}
		const accessedOn = text(source.accessedOn, `${claimId} source access date`);
		if (!/^\d{4}-\d{2}-\d{2}$/u.test(accessedOn)) {
			throw new TypeError(`${claimId} source access date must be ISO formatted.`);
		}

		const scope = record(claim.scope, `${claimId} model scope`);
		if (scope.residentId !== residentId) {
			throw new TypeError(`${claimId} model scope must match its resident.`);
		}
		const exactModelIds = stringArray(
			scope.exactModelIds,
			`${claimId} exact model scope`,
		);
		const resident = residents.find((candidate) => candidate.id === residentId);
		if (!resident) throw new TypeError(`${claimId} model scope has no resident.`);
		for (const exactModelId of new Set([
			resident.requestedModelId,
			resident.canonicalModelId,
		])) {
			if (!exactModelIds.includes(exactModelId as string)) {
				throw new TypeError(`${claimId} has the wrong exact model scope.`);
			}
		}
	}
	for (const [residentId, orders] of claimOrders) {
		const expected = Array.from({ length: orders.length }, (_, index) => index + 1);
		if (orders.join(",") !== expected.join(",")) {
			throw new TypeError(`${residentId} claims must use unique stable order.`);
		}
	}

	const dialogueSignatures: string[] = [];
	const bibleResidentIds: string[] = [];
	for (const bible of bibles) {
		const residentId = asciiSlug(bible.residentId, "Character bible resident ID");
		bibleResidentIds.push(residentId);
		const resident = residents.find((candidate) => candidate.id === residentId);
		if (!resident) throw new TypeError(`${residentId} character bible has no resident.`);
		asciiMachineId(bible.bibleVersionId, `${residentId} bible version ID`);
		if (bible.versionKey !== resident.bibleVersionKey) {
			throw new TypeError(`${residentId} character bible version is not active.`);
		}
		if (bible.role !== resident.role) {
			throw new TypeError(`${residentId} character bible role does not match.`);
		}
		const routines = stringArray(bible.routines, `${residentId} bible routines`);
		if (routines.join("\u0000") !== (resident.routines as string[]).join("\u0000")) {
			throw new TypeError(`${residentId} character bible routines do not match.`);
		}
		text(bible.dignityNotes, `${residentId} dignity notes`);
		text(bible.avoidanceNotes, `${residentId} avoidance notes`);
		text(bible.promptSubset, `${residentId} prompt subset`);

		if (!Array.isArray(bible.traits) || bible.traits.length < 2 || bible.traits.length > 3) {
			throw new TypeError(`${residentId} must have two or three active traits.`);
		}
		const guidance: string[] = [];
		for (const [index, traitValue] of bible.traits.entries()) {
			const trait = record(traitValue, `${residentId} trait ${index + 1}`);
			asciiSlug(trait.id, `${residentId} trait ID`);
			text(trait.label, `${residentId} trait label`);
			guidance.push(text(trait.guidance, `${residentId} trait guidance`));
			if (trait.active !== true) {
				throw new TypeError(`${residentId} cannot admit an inactive trait.`);
			}
			if (trait.stableOrder !== index + 1) {
				throw new TypeError(`${residentId} traits must use explicit stable order.`);
			}
			const approvedClaimIds = stringArray(
				trait.approvedClaimIds,
				`${residentId} trait approved claim mappings`,
			);
			for (const claimId of approvedClaimIds) {
				const claim = claimsById.get(claimId);
				if (!claim || claim.residentId !== residentId) {
					throw new TypeError(`${residentId} trait claim is not approved for this resident.`);
				}
				const scope = record(claim.scope, `${claimId} model scope`);
				const exactModelIds = scope.exactModelIds as string[];
				if (
					!exactModelIds.includes(resident.requestedModelId as string) ||
					!exactModelIds.includes(resident.canonicalModelId as string)
				) {
					throw new TypeError(`${residentId} trait claim has the wrong model scope.`);
				}
			}
		}
		dialogueSignatures.push(guidance.join("\u0000"));
	}
	assertUnique(bibleResidentIds, "Character bible resident IDs");
	assertUnique(dialogueSignatures, "Resident full dialogue trait signatures");
}

validateLaunchResidentRegistry({
	residents: LAUNCH_RESIDENTS,
	bibles: CHARACTER_BIBLES,
	claims: HISTORICAL_CLAIMS,
});

export function characterBibleFor(residentId: string): CharacterBibleVersion {
	const bible = CHARACTER_BIBLES.find((candidate) => candidate.residentId === residentId);
	if (!bible) throw new RangeError(`No character bible for ${residentId}.`);
	return bible;
}

export function historicalClaimsFor(residentId: string): HistoricalClaimVersion[] {
	return HISTORICAL_CLAIMS.filter((claim) => claim.residentId === residentId).sort(
		(left, right) => left.stableOrder - right.stableOrder,
	);
}
