import { createHash } from "node:crypto";
import { orderedResidentPair } from "./relationships.ts";
import type {
	ApprovedSceneBrief,
	PublishedSceneRecord,
	WorldState,
} from "./types.ts";

export const RESIDENT_COOLDOWN_TICKS = 12;
export const PAIR_COOLDOWN_TICKS = 30;
export const ROLLING_BALANCE_SCENES = 30;
export const MATURE_BALANCE_SCENES = 60;
export const MIN_RESIDENT_SLOT_SHARE = 0.1;
export const MAX_RESIDENT_SLOT_SHARE = 0.25;
export const MAX_PAIR_SCENE_SHARE = 0.15;

export type SceneEligibilityResult =
	| {
			kind: "selected";
			brief: ApprovedSceneBrief;
			score: number;
		}
	| {
			kind: "quiet";
			reason:
				| "active-scene"
				| "pending-generation"
				| "quiet-interval"
				| "cooldown"
				| "balance-impossible"
				| "no-approved-brief";
			diagnostic?: string;
		};

function pairKey(participantIds: readonly string[]): string {
	if (participantIds.length !== 2) {
		throw new RangeError("Launch scene briefs must use exactly two participants.");
	}
	return orderedResidentPair(participantIds[0], participantIds[1]).join(":");
}

function latestParticipationTick(
	history: readonly PublishedSceneRecord[],
	residentId: string,
): number | undefined {
	return history
		.filter((record) => record.participantIds.includes(residentId))
		.at(-1)?.publishedAtTick;
}

function latestPairTick(
	history: readonly PublishedSceneRecord[],
	brief: ApprovedSceneBrief,
): number | undefined {
	const expectedPair = pairKey(brief.participantIds);
	return history
		.filter((record) => pairKey(record.participantIds) === expectedPair)
		.at(-1)?.publishedAtTick;
}

function hasActiveOverride(
	brief: ApprovedSceneBrief,
	tick: number,
	bypass: "pair-cooldown" | "pair-share",
): boolean {
	const override = brief.override;
	return Boolean(
		override?.id &&
			override.version &&
			override.bypass === bypass &&
			tick >= override.startsAtTick &&
			tick <= override.endsAtTick,
	);
}

function projectedMatureBalanceAllows(
	state: WorldState,
	brief: ApprovedSceneBrief,
): { allowed: boolean; diagnostic?: string } {
	const projected = [
		...state.sceneHistory.slice(-(MATURE_BALANCE_SCENES - 1)),
		{
			revisionId: "projected",
			sceneKey: "projected",
			briefId: brief.briefId,
			participantIds: [...brief.participantIds],
			publishedAtTick: state.logicalTick,
		},
	];
	if (projected.length < MATURE_BALANCE_SCENES) {
		return { allowed: true };
	}

	const residentIds = state.residents.map((resident) => resident.id).sort();
	const totalSlots = projected.reduce(
		(total, record) => total + record.participantIds.length,
		0,
	);
	const residentShares = residentIds.map((residentId) => {
		const slots = projected.reduce(
			(total, record) =>
				total + (record.participantIds.includes(residentId) ? 1 : 0),
			0,
		);
		return { residentId, share: slots / totalSlots };
	});
	const outsideResidentBounds = residentShares.filter(
		(candidate) =>
			candidate.share < MIN_RESIDENT_SLOT_SHARE ||
			candidate.share > MAX_RESIDENT_SLOT_SHARE,
	);
	if (outsideResidentBounds.length > 0) {
		return {
			allowed: false,
			diagnostic: `Resident balance outside 10-25%: ${outsideResidentBounds
				.map(
					(candidate) =>
						`${candidate.residentId}=${candidate.share.toFixed(3)}`,
				)
				.join(", ")}`,
		};
	}

	const selectedPair = pairKey(brief.participantIds);
	const selectedPairShare =
		projected.filter(
			(record) => pairKey(record.participantIds) === selectedPair,
		).length / projected.length;
	if (selectedPairShare > MAX_PAIR_SCENE_SHARE) {
		return {
			allowed: false,
			diagnostic: `Pair ${selectedPair} would reach ${selectedPairShare.toFixed(3)}.`,
		};
	}
	return { allowed: true };
}

function stableTieBreak(seed: number, tick: number, briefId: string): number {
	const digest = createHash("sha256")
		.update(`${seed}:${tick}:${briefId}`)
		.digest();
	return digest.readUInt32BE(0);
}

function scoreBrief(
	state: WorldState,
	brief: ApprovedSceneBrief,
	tick: number,
	seed: number,
): number {
	const rolling = state.sceneHistory.slice(-ROLLING_BALANCE_SCENES);
	const participantCounts = brief.participantIds.map((residentId) =>
		rolling.reduce(
			(total, record) =>
				total + (record.participantIds.includes(residentId) ? 1 : 0),
			0,
		),
	);
	const pairCount = rolling.filter(
		(record) => pairKey(record.participantIds) === pairKey(brief.participantIds),
	).length;
	const roomFit = brief.participantIds.reduce(
		(total, residentId) =>
			total +
			(state.residents.find((resident) => resident.id === residentId)
				?.roomId === brief.locationId
				? 1
				: 0),
		0,
	);
	const relationship = state.relationships.find(
		(candidate) =>
			`${candidate.residentAId}:${candidate.residentBId}` ===
			pairKey(brief.participantIds),
	);
	const staleParticipationScore = participantCounts.reduce(
		(total, count) => total + (ROLLING_BALANCE_SCENES - count),
		0,
	);
	const relationshipFit =
		(relationship?.rivalry ?? 0) +
		(relationship?.friendship ?? 0) +
		(relationship?.familiarity ?? 0);
	return (
		staleParticipationScore * 10_000 +
		(ROLLING_BALANCE_SCENES - pairCount) * 1_000 +
		roomFit * 100 +
		relationshipFit * 10 +
		(stableTieBreak(seed, tick, brief.briefId) % 10)
	);
}

export function selectEligibleSceneBrief(input: {
	state: WorldState;
	briefs: readonly ApprovedSceneBrief[];
	logicalTick: number;
	seed: number;
}): SceneEligibilityResult {
	const { state, briefs, logicalTick, seed } = input;
	if (!Number.isSafeInteger(logicalTick) || !Number.isSafeInteger(seed)) {
		throw new TypeError("Eligibility tick and seed must be safe integers.");
	}
	if (state.scene) return { kind: "quiet", reason: "active-scene" };
	if (state.pendingSceneRequest) {
		return { kind: "quiet", reason: "pending-generation" };
	}
	const latestScene = state.sceneHistory.at(-1);
	if (
		latestScene &&
		logicalTick <= latestScene.publishedAtTick + 1
	) {
		return { kind: "quiet", reason: "quiet-interval" };
	}
	if (briefs.length === 0) {
		return { kind: "quiet", reason: "no-approved-brief" };
	}

	const candidates = briefs
		.filter(
			(brief) =>
				brief.participantIds.length === 2 &&
				new Set(brief.participantIds).size === 2 &&
				brief.participantIds.every((residentId) =>
					state.residents.some((resident) => resident.id === residentId),
				),
		)
		.filter((brief) =>
			brief.participantIds.every((residentId) => {
				const latest = latestParticipationTick(
					state.sceneHistory,
					residentId,
				);
				return (
					latest === undefined ||
					logicalTick - latest >= RESIDENT_COOLDOWN_TICKS
				);
			}),
		)
		.filter((brief) => {
			const latest = latestPairTick(state.sceneHistory, brief);
			return (
				latest === undefined ||
				logicalTick - latest >= PAIR_COOLDOWN_TICKS ||
				hasActiveOverride(brief, logicalTick, "pair-cooldown")
			);
		});
	if (candidates.length === 0) {
		return { kind: "quiet", reason: "cooldown" };
	}

	const balanced = candidates.filter((brief) => {
		const balance = projectedMatureBalanceAllows(state, brief);
		if (
			balance.allowed ||
			hasActiveOverride(brief, logicalTick, "pair-share")
		) {
			return true;
		}
		return false;
	});
	if (balanced.length === 0) {
		const diagnostics = candidates
			.map(
				(brief) =>
					`${brief.briefId}: ${
						projectedMatureBalanceAllows(state, brief).diagnostic ??
						"constraint conflict"
					}`,
			)
			.join("; ");
		return {
			kind: "quiet",
			reason: "balance-impossible",
			diagnostic: diagnostics,
		};
	}

	const ranked = balanced
		.map((brief) => ({
			brief,
			score: scoreBrief(state, brief, logicalTick, seed),
		}))
		.sort(
			(left, right) =>
				right.score - left.score ||
				left.brief.briefId.localeCompare(right.brief.briefId),
		);
	return { kind: "selected", ...ranked[0] };
}
