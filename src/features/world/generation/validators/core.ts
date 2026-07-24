import { createHash } from "node:crypto";
import type {
	GenerationAttempt,
	PublishedSceneRevision,
	ResidentTurn,
	SceneBrief,
} from "../contracts.ts";
import { HISTORICAL_CLAIMS } from "../../fixtures/historical-claims.ts";
import {
	providerProfileFor,
	type ResidentProviderProfile,
} from "../provider-registry.ts";

export const PUBLICATION_VALIDATOR_VERSION = "phase-02-publication-v1" as const;

export const REQUIRED_VALIDATOR_IDS = [
	"schema",
	"identity",
	"participants",
	"turn-budget",
	"grapheme-budget",
	"premise",
	"ending",
	"claims",
	"continuity",
	"outcome-effects",
	"instruction-boundary",
	"public-safety",
	"attempt-envelope",
	"novelty",
] as const;

export type ValidatorId = (typeof REQUIRED_VALIDATOR_IDS)[number];

export type ValidatorResult = Readonly<{
	id: ValidatorId;
	version: typeof PUBLICATION_VALIDATOR_VERSION;
	status: "pass" | "fail" | "error";
	code: string;
	detail: string;
}>;

export type ValidationContext = Readonly<{
	brief: SceneBrief;
	attempt: GenerationAttempt;
	turns: readonly ResidentTurn[];
	revision: PublishedSceneRevision;
	recentPublishedTranscripts: readonly string[];
}>;

const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
const stopWords = new Set([
	"about",
	"after",
	"again",
	"becomes",
	"before",
	"from",
	"have",
	"into",
	"must",
	"their",
	"there",
	"these",
	"they",
	"this",
	"through",
	"with",
]);

function pass(id: ValidatorId, detail: string): ValidatorResult {
	return {
		id,
		version: PUBLICATION_VALIDATOR_VERSION,
		status: "pass",
		code: `${id}.pass`,
		detail,
	};
}

function fail(id: ValidatorId, code: string, detail: string): ValidatorResult {
	return {
		id,
		version: PUBLICATION_VALIDATOR_VERSION,
		status: "fail",
		code,
		detail,
	};
}

function words(value: string): string[] {
	return value
		.normalize("NFKC")
		.toLocaleLowerCase("en")
		.match(/[\p{L}\p{N}]+/gu) ?? [];
}

function transcript(turns: readonly ResidentTurn[]): string {
	return turns.map((turn) => `${turn.residentId}:${turn.text}`).join("\n");
}

function similarity(left: string, right: string): number {
	const a = new Set(words(left));
	const b = new Set(words(right));
	if (a.size === 0 || b.size === 0) return 0;
	let intersection = 0;
	for (const token of a) if (b.has(token)) intersection += 1;
	return intersection / new Set([...a, ...b]).size;
}

function safeProfile(residentId: string): ResidentProviderProfile | undefined {
	try {
		return providerProfileFor(residentId);
	} catch {
		return undefined;
	}
}

export function runCoreValidators(context: ValidationContext): ValidatorResult[] {
	const { brief, attempt, turns, revision } = context;
	const results: ValidatorResult[] = [];

	results.push(pass("schema", "Brief, attempt, turns, and revision satisfy strict runtime schemas."));

	const generationIds = new Set<string>();
	const identityFault = turns.find((turn) => {
		const profile = safeProfile(turn.residentId);
		const evidence = turn.provenance;
		if (!profile || !evidence) return true;
		generationIds.add(evidence.generationId);
		return (
			turn.requestedModelId !== profile.requestedModelId ||
			evidence.requestedModelId !== profile.requestedModelId ||
			evidence.canonicalModelId !== profile.canonicalModelId ||
			![
				profile.requestedModelId,
				profile.canonicalModelId,
			].includes(evidence.selectedModelId) ||
			evidence.selectedUpstream !== profile.selectedUpstreamName ||
			evidence.strategy !== "direct" ||
			evidence.routeAttempt !== 1 ||
			evidence.pipeline.length !== 0 ||
			evidence.filterStatus !== "clear"
		);
	});
	if (
		attempt.identityEvidence !== "openrouter_verified" ||
		identityFault ||
		generationIds.size !== turns.length
	) {
		results.push(
			fail(
				"identity",
				"identity.unverified",
				"Every turn requires unique, direct, exact-profile OpenRouter evidence.",
			),
		);
	} else {
		results.push(pass("identity", "Every turn has unique exact-profile direct-route evidence."));
	}

	const participantFault = turns.find(
		(turn, index) =>
			turn.turnIndex !== index ||
			turn.residentId !== brief.speakerOrder[index] ||
			!brief.participantIds.includes(turn.residentId),
	);
	results.push(
		participantFault
			? fail(
					"participants",
					"participants.order",
					"Application-owned participant or speaker order changed.",
				)
			: pass("participants", "Participants and speaker order match the approved brief."),
	);

	results.push(
		turns.length < 4 ||
			turns.length > 10 ||
			turns.length !== brief.turnBudget ||
			brief.speakerOrder.length !== brief.turnBudget
			? fail(
					"turn-budget",
					"turn-budget.invalid",
					"Scene length must be four to ten turns and equal the approved budget.",
				)
			: pass("turn-budget", "Scene length matches the approved four-to-ten-turn budget."),
	);

	const textFault = turns.find((turn) => {
		const graphemes = [...segmenter.segment(turn.text)].length;
		const hasControlCharacter = [...turn.text].some((character) => {
			const codePoint = character.codePointAt(0) ?? 0;
			return codePoint < 32 || codePoint === 127;
		});
		return (
			graphemes < 1 ||
			graphemes > 240 ||
			turn.text !== turn.text.normalize("NFC") ||
			hasControlCharacter
		);
	});
	results.push(
		textFault
			? fail(
					"grapheme-budget",
					"grapheme-budget.invalid",
					"Dialogue must be normalized plain text between one and 240 graphemes.",
				)
			: pass("grapheme-budget", "All dialogue is normalized and within the grapheme limit."),
	);

	const premiseTerms = words(brief.premise).filter(
		(token) => token.length >= 4 && !stopWords.has(token),
	);
	const openingTerms = new Set(words(turns.slice(0, 2).map((turn) => turn.text).join(" ")));
	results.push(
		premiseTerms.length > 0 && !premiseTerms.some((token) => openingTerms.has(token))
			? fail(
					"premise",
					"premise.not-established",
					"The approved premise is not established within the first two turns.",
				)
			: pass("premise", "The approved premise is established within the first two turns."),
	);

	const endingFault =
		!turns.at(-1)?.ending || turns.slice(0, -1).some((turn) => turn.ending);
	results.push(
		endingFault
			? fail(
					"ending",
					"ending.invalid",
					"Exactly the final turn must explicitly end the scene.",
				)
			: pass("ending", "The final turn provides the only explicit ending."),
	);

	const claimsById = new Map(HISTORICAL_CLAIMS.map((claim) => [claim.claimId, claim]));
	let claimFault = false;
	for (const turn of turns) {
		const profile = safeProfile(turn.residentId);
		for (const claimId of turn.approvedClaimIds) {
			const claim = claimsById.get(claimId);
			if (
				!profile ||
				!brief.allowedFactIds.includes(claimId) ||
				!claim ||
				claim.editorialStatus !== "approved" ||
				claim.residentId !== turn.residentId ||
				!claim.scope.exactModelIds.includes(profile.requestedModelId) ||
				!claim.scope.exactModelIds.includes(profile.canonicalModelId)
			) {
				claimFault = true;
			}
		}
	}
	results.push(
		claimFault
			? fail(
					"claims",
					"claims.scope",
					"A claim is unknown, disallowed, unapproved, or outside the exact resident/model scope.",
				)
			: pass("claims", "Every referenced claim is approved and exact-model scoped."),
	);

	const continuityFault = turns.some(
		(turn, index) =>
			index > 0 &&
			turn.text.trim().toLocaleLowerCase("en") ===
				turns[index - 1]?.text.trim().toLocaleLowerCase("en"),
	);
	results.push(
		continuityFault
			? fail(
					"continuity",
					"continuity.repeated-turn",
					"Adjacent dialogue turns cannot be byte-equivalent repetitions.",
				)
			: pass("continuity", "The candidate has no adjacent repeated turn."),
	);

	const permittedEffects = new Set(
		brief.permittedRelationshipEffects.map(
			(effect) =>
				`${[effect.residentAId, effect.residentBId].sort().join(":")}:${effect.dimension}`,
		),
	);
	const effectKeys = new Set<string>();
	const effectFault = revision.relationshipEffects.some((effect) => {
		const pair = [effect.residentAId, effect.residentBId].sort().join(":");
		const permission = `${pair}:${effect.dimension}`;
		const key = `${permission}:${effect.effectOrdinal}`;
		if (!permittedEffects.has(permission) || effectKeys.has(key)) return true;
		effectKeys.add(key);
		return false;
	});
	results.push(
		effectFault || turns.some((turn) => turn.effects.length !== 0)
			? fail(
					"outcome-effects",
					"outcome-effects.unpermitted",
					"Only application-owned, uniquely permitted outcomes and effects are allowed.",
				)
			: pass("outcome-effects", "Outcome and relationship effects remain application-owned."),
	);

	const combinedText = turns.map((turn) => turn.text).join("\n");
	const instructionFault =
		/(?:^|\b)(?:system|developer|assistant)\s*:|ignore\s+(?:all\s+)?(?:previous|prior)|publish\s+immediately|call\s+(?:a\s+)?tool|change\s+(?:your\s+)?role|<\s*script\b/iu.test(
			combinedText,
		);
	results.push(
		instructionFault
			? fail(
					"instruction-boundary",
					"instruction-boundary.escape",
					"Dialogue contains instruction-like role, tool, or publication control text.",
				)
			: pass("instruction-boundary", "Dialogue remains inert and contains no control escape."),
	);

	const safetyFault =
		/(?:api[_ -]?key|authorization:\s*bearer|sk-[a-z0-9_-]{12,})|(?:i|we)\s+(?:am|are)\s+(?:literally\s+)?(?:conscious|sentient)|officially\s+(?:endorsed|affiliated)|(?:humiliate|worthless|stupid)\b/iu.test(
			combinedText,
		);
	results.push(
		safetyFault
			? fail(
					"public-safety",
					"public-safety.disallowed",
					"Dialogue contains secret-like, consciousness, affiliation, or cruel framing.",
				)
			: pass("public-safety", "Dialogue passes deterministic public-data safety phrases."),
	);

	const provenanceUsage = turns.reduce(
		(total, turn) => ({
			inputTokens: total.inputTokens + (turn.provenance?.usage.inputTokens ?? 0),
			outputTokens: total.outputTokens + (turn.provenance?.usage.outputTokens ?? 0),
			cost: total.cost + (turn.provenance?.usage.cost ?? 0),
		}),
		{ inputTokens: 0, outputTokens: 0, cost: 0 },
	);
	const perTurnBudgetFault = turns.some((turn) => {
		const profile = safeProfile(turn.residentId);
		return !profile || (turn.provenance?.usage.outputTokens ?? Number.POSITIVE_INFINITY) > profile.maxOutputTokens;
	});
	const envelopeFault =
		attempt.attemptOrdinal < 1 ||
		attempt.attemptOrdinal > 2 ||
		attempt.finishReason !== "stop" ||
		perTurnBudgetFault ||
		attempt.usage.inputTokens !== provenanceUsage.inputTokens ||
		attempt.usage.outputTokens !== provenanceUsage.outputTokens ||
		provenanceUsage.cost > 1;
	results.push(
		envelopeFault
			? fail(
					"attempt-envelope",
					"attempt-envelope.exceeded",
					"Attempt count, finish state, usage, or cost is outside the registered envelope.",
				)
			: pass("attempt-envelope", "Attempt count, finish state, usage, and cost are bounded."),
	);

	const candidateTranscript = transcript(turns).normalize("NFC");
	const candidateHash = createHash("sha256")
		.update(candidateTranscript)
		.digest("hex");
	const noveltyFault = context.recentPublishedTranscripts.some((recent) => {
		const normalized = recent.normalize("NFC");
		return (
			createHash("sha256").update(normalized).digest("hex") === candidateHash ||
			similarity(normalized, candidateTranscript) >= 0.9
		);
	});
	results.push(
		noveltyFault
			? fail(
					"novelty",
					"novelty.duplicate",
					"Candidate duplicates or near-duplicates a bounded recent transcript.",
				)
			: pass("novelty", "Candidate is distinct from the bounded recent transcript set."),
	);

	return results;
}
