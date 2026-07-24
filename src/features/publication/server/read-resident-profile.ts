import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { createWorldDatabase } from "../../../db/client.ts";
import { worldEvents } from "../../../db/schema.ts";
import {
	PROFILE_SECTION_IDS,
	PROFILE_SECTION_TITLES,
	RESIDENT_PROFILES,
	type ResidentProfileClaimReference,
	type ResidentProfileDefinition,
} from "../../residents/fixtures/resident-profiles.ts";
import {
	HISTORICAL_CLAIM_CATEGORY_LABELS,
	HISTORICAL_CLAIMS,
} from "../../world/fixtures/historical-claims.ts";
import { LAUNCH_RESIDENTS } from "../../world/fixtures/launch-residents.ts";
import type {
	HistoricalClaimVersion,
	LaunchResident,
} from "../../world/domain/types.ts";
import {
	NON_AFFILIATION_DISCLOSURE,
} from "../../world/components/TransparencyNotice.tsx";
import {
	canonicalScenePath,
	PublicHistoricalClaimSchema,
	PublicRelationshipSummarySchema,
	PublicResidentIdSchema,
	PublicResidentProfileSchema,
	ResidentProfileReadResultSchema,
	residentProfilePath,
	type CanonicalSceneReadResult,
} from "../contracts/public-publication.ts";
import { readCanonicalScene } from "./read-canonical-scene.ts";
import {
	relationshipPhrase,
	type NonzeroRelationshipDelta,
} from "./relationship-phrases.ts";

export type PublicHistoricalClaim = z.infer<typeof PublicHistoricalClaimSchema>;
export type PublicRelationshipSummary = z.infer<
	typeof PublicRelationshipSummarySchema
>;
export type PublicResidentProfile = z.infer<typeof PublicResidentProfileSchema>;
export type ResidentProfileReadResult = z.infer<
	typeof ResidentProfileReadResultSchema
>;

export type RelationshipEventCandidate = {
	sequence: number;
	payload: Record<string, unknown>;
};

const RelationshipEffectPayloadSchema = z
	.object({
		causeRevisionId: z.string().trim().min(1),
		residentAId: PublicResidentIdSchema,
		residentBId: PublicResidentIdSchema,
		dimension: z.enum(["friendship", "rivalry", "familiarity"]),
		delta: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
	})
	.passthrough();

const RECONSTRUCTION_DISCLOSURE =
	"Model Afterlife uses documented model history to stage an affectionate fictional character. Behaviors and retirement framing are reconstructions, not claims of consciousness.";

function unavailable(residentId: string): ResidentProfileReadResult {
	return ResidentProfileReadResultSchema.parse({
		kind: "known-unavailable",
		residentId,
		reason: "profile-evidence-incomplete",
	});
}

function exactModelIdsFor(resident: LaunchResident): string[] {
	return [...new Set([resident.requestedModelId, resident.canonicalModelId])];
}

function resolveClaim(
	reference: ResidentProfileClaimReference,
	resident: LaunchResident,
	claims: readonly HistoricalClaimVersion[],
): PublicHistoricalClaim | null {
	const matches = claims.filter(
		(claim) => claim.claimVersionId === reference.claimVersionId,
	);
	if (matches.length !== 1) return null;
	const claim = matches[0];
	if (
		!claim ||
		claim.claimId !== reference.claimId ||
		claim.residentId !== resident.id ||
		claim.category !== reference.category ||
		claim.editorialStatus !== "approved" ||
		!claim.source.url.startsWith("https://") ||
		!/^\d{4}-\d{2}-\d{2}$/u.test(claim.source.accessedOn) ||
		claim.scope.residentId !== resident.id
	) {
		return null;
	}
	const exactModelIds = exactModelIdsFor(resident);
	if (
		exactModelIds.some(
			(exactModelId) => !claim.scope.exactModelIds.includes(exactModelId),
		)
	) {
		return null;
	}
	const parsed = PublicHistoricalClaimSchema.safeParse({
		claimId: claim.claimId,
		claimVersionId: claim.claimVersionId,
		stableOrder: claim.stableOrder,
		category: claim.category,
		categoryLabel: HISTORICAL_CLAIM_CATEGORY_LABELS[claim.category],
		statement: claim.statement,
		scope: claim.scope,
		source: claim.source,
		confidence: claim.confidence,
	});
	return parsed.success ? parsed.data : null;
}

function resolveReferences(
	references: readonly ResidentProfileClaimReference[],
	resident: LaunchResident,
	claims: readonly HistoricalClaimVersion[],
): PublicHistoricalClaim[] | null {
	if (references.length === 0) return null;
	const tupleKeys = references.map(
		(reference) =>
			`${reference.claimVersionId}\u0000${reference.claimId}\u0000${reference.category}`,
	);
	if (new Set(tupleKeys).size !== tupleKeys.length) return null;
	const resolved = references.map((reference) =>
		resolveClaim(reference, resident, claims),
	);
	if (resolved.some((claim) => claim === null)) return null;
	return resolved.filter((claim): claim is PublicHistoricalClaim => claim !== null);
}

export function assembleResidentProfile(input: {
	residentId: string;
	definitions?: readonly ResidentProfileDefinition[];
	residents?: readonly LaunchResident[];
	claims?: readonly HistoricalClaimVersion[];
	relationship?: PublicRelationshipSummary | null;
}): ResidentProfileReadResult {
	const parsedResidentId = PublicResidentIdSchema.safeParse(input.residentId);
	if (!parsedResidentId.success) {
		return ResidentProfileReadResultSchema.parse({ kind: "not-found" });
	}
	const definitions = input.definitions ?? RESIDENT_PROFILES;
	const residents = input.residents ?? LAUNCH_RESIDENTS;
	const claims = input.claims ?? HISTORICAL_CLAIMS;
	const matchingDefinitions = definitions.filter(
		(definition) => definition.residentId === parsedResidentId.data,
	);
	const matchingResidents = residents.filter(
		(resident) => resident.id === parsedResidentId.data,
	);
	if (matchingDefinitions.length === 0 || matchingResidents.length === 0) {
		return ResidentProfileReadResultSchema.parse({ kind: "not-found" });
	}
	if (matchingDefinitions.length !== 1 || matchingResidents.length !== 1) {
		return unavailable(parsedResidentId.data);
	}
	const definition = matchingDefinitions[0];
	const resident = matchingResidents[0];
	if (
		!definition ||
		!resident ||
		definition.displayOrder !== resident.displayOrder ||
		definition.sections.length !== PROFILE_SECTION_IDS.length ||
		definition.behaviors.length === 0
	) {
		return unavailable(parsedResidentId.data);
	}

	const sections = definition.sections.map((section, index) => {
		if (section.id !== PROFILE_SECTION_IDS[index]) return null;
		const sectionClaims = resolveReferences(
			section.claimReferences,
			resident,
			claims,
		);
		return sectionClaims
			? {
					id: section.id,
					title: PROFILE_SECTION_TITLES[section.id],
					claims: sectionClaims,
				}
			: null;
	});
	if (sections.some((section) => section === null)) {
		return unavailable(parsedResidentId.data);
	}

	const behaviors = definition.behaviors.map((behavior) => {
		const historicalInspiration = resolveReferences(
			behavior.historicalInspiration,
			resident,
			claims,
		);
		const fictionalExaggeration = resolveReferences(
			behavior.fictionalExaggeration,
			resident,
			claims,
		);
		if (
			!historicalInspiration ||
			!fictionalExaggeration ||
			fictionalExaggeration.some(
				(claim) => claim.category !== "exaggeration",
			)
		) {
			return null;
		}
		const evidence = [...historicalInspiration, ...fictionalExaggeration];
		const sources = [
			...new Map(
				evidence.map((claim) => [
					claim.claimVersionId,
					{
						claimVersionId: claim.claimVersionId,
						category: claim.category,
						title: claim.source.title,
						url: claim.source.url,
						accessedOn: claim.source.accessedOn,
					},
				]),
			).values(),
		];
		return {
			id: behavior.id,
			title: behavior.title,
			joke: behavior.joke,
			historicalInspiration,
			fictionalExaggeration,
			uncertaintyAndScope: behavior.uncertaintyAndScope,
			sources,
		};
	});
	if (behaviors.some((behavior) => behavior === null)) {
		return unavailable(parsedResidentId.data);
	}

	const profile = PublicResidentProfileSchema.safeParse({
		residentId: resident.id,
		displayOrder: resident.displayOrder,
		displayName: resident.displayName,
		role: resident.role,
		routines: resident.routines,
		portraitVariantId: resident.visualVariantId,
		exactModelIds: exactModelIdsFor(resident),
		profilePath: residentProfilePath(resident.id),
		sections: sections.filter((section) => section !== null),
		behaviors: behaviors.filter((behavior) => behavior !== null),
		relationship: input.relationship ?? null,
		disclosures: {
			reconstruction: RECONSTRUCTION_DISCLOSURE,
			nonAffiliation: NON_AFFILIATION_DISCLOSURE,
		},
	});
	return profile.success
		? ResidentProfileReadResultSchema.parse({
				kind: "complete",
				profile: profile.data,
			})
		: unavailable(parsedResidentId.data);
}

export async function assembleLatestRelationshipSummary(
	residentId: string,
	candidates: readonly RelationshipEventCandidate[],
	readScene: (
		revisionId: string,
	) => Promise<CanonicalSceneReadResult> = readCanonicalScene,
): Promise<PublicRelationshipSummary | null> {
	const resident = LAUNCH_RESIDENTS.find(
		(candidate) => candidate.id === residentId,
	);
	if (!resident) return null;
	const residentsById = new Map(
		LAUNCH_RESIDENTS.map((candidate) => [candidate.id, candidate]),
	);
	for (const candidate of [...candidates].sort(
		(left, right) => right.sequence - left.sequence,
	)) {
		const parsed = RelationshipEffectPayloadSchema.safeParse(candidate.payload);
		if (!parsed.success || parsed.data.delta === 0) continue;
		const event = parsed.data;
		if (
			event.residentAId !== residentId &&
			event.residentBId !== residentId
		) {
			continue;
		}
		const counterpartId =
			event.residentAId === residentId ? event.residentBId : event.residentAId;
		const counterpart = residentsById.get(counterpartId);
		if (!counterpart) continue;
		const sceneResult = await readScene(event.causeRevisionId);
		if (sceneResult.kind !== "complete") continue;
		const description = relationshipPhrase(
			event.dimension,
			event.delta as NonzeroRelationshipDelta,
		);
		const matchingChange = sceneResult.scene.outcome.relationshipChanges.find(
			(change) =>
				change.dimension === event.dimension &&
				description === change.description &&
				new Set([change.residentAId, change.residentBId]).size === 2 &&
				[change.residentAId, change.residentBId].includes(residentId) &&
				[change.residentAId, change.residentBId].includes(counterpartId),
		);
		const href = canonicalScenePath(event.causeRevisionId);
		if (!matchingChange || !href || href !== sceneResult.scene.canonicalPath) {
			continue;
		}
		const summary = PublicRelationshipSummarySchema.safeParse({
			counterpartResidentId: counterpart.id,
			counterpartName: counterpart.displayName,
			counterpartProfilePath: residentProfilePath(counterpart.id),
			dimension: event.dimension,
			description,
			scene: {
				revisionId: event.causeRevisionId,
				href,
				label: sceneResult.scene.premise,
			},
		});
		if (summary.success) return summary.data;
	}
	return null;
}

async function readRelationshipCandidates(): Promise<RelationshipEventCandidate[]> {
	const { db, close } = createWorldDatabase();
	try {
		return await db
			.select({
				sequence: worldEvents.sequence,
				payload: worldEvents.payload,
			})
			.from(worldEvents)
			.where(eq(worldEvents.type, "relationship_effect_applied"))
			.orderBy(desc(worldEvents.sequence))
			.limit(60);
	} finally {
		await close();
	}
}

export async function readResidentProfile(
	residentId: string,
): Promise<ResidentProfileReadResult> {
	const base = assembleResidentProfile({ residentId });
	if (base.kind !== "complete") return base;
	let relationship: PublicRelationshipSummary | null = null;
	try {
		relationship = await assembleLatestRelationshipSummary(
			residentId,
			await readRelationshipCandidates(),
		);
	} catch {
		relationship = null;
	}
	return assembleResidentProfile({ residentId, relationship });
}
