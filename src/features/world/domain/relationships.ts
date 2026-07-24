import type {
	RelationshipDimension,
	RelationshipEffectAppliedEvent,
	WorldRelationship,
} from "./types.ts";

export const RELATIONSHIP_VALUE_MIN = -5;
export const RELATIONSHIP_VALUE_MAX = 5;
export const RECENT_PAIR_EXPERIENCE_LIMIT = 6;

export type RelationshipGraph = WorldRelationship[];

export type RelationshipEffect = Readonly<{
	effectKey: string;
	causeRevisionId: string;
	sceneKey: string;
	effectOrdinal: number;
	residentAId: string;
	residentBId: string;
	dimension: RelationshipDimension;
	delta: -1 | 0 | 1;
}>;

export function orderedResidentPair(
	leftId: string,
	rightId: string,
): readonly [string, string] {
	if (!leftId || !rightId || leftId === rightId) {
		throw new RangeError("A relationship requires two distinct resident IDs.");
	}
	return leftId < rightId ? [leftId, rightId] : [rightId, leftId];
}

export function relationshipEffectKey(input: {
	causeRevisionId: string;
	residentAId: string;
	residentBId: string;
	dimension: RelationshipDimension;
	effectOrdinal: number;
}): string {
	const [residentAId, residentBId] = orderedResidentPair(
		input.residentAId,
		input.residentBId,
	);
	return [
		"relationship-effect",
		input.causeRevisionId,
		residentAId,
		residentBId,
		input.dimension,
		input.effectOrdinal,
	].join(":");
}

function clampRelationshipValue(value: number): number {
	return Math.max(
		RELATIONSHIP_VALUE_MIN,
		Math.min(RELATIONSHIP_VALUE_MAX, value),
	);
}

export function validateRelationshipGraph(
	graph: readonly WorldRelationship[],
	residentIds: readonly string[],
): void {
	const expectedPairs = (residentIds.length * (residentIds.length - 1)) / 2;
	if (graph.length !== expectedPairs) {
		throw new RangeError(
			`Relationship graph must contain all ${expectedPairs} unordered pairs.`,
		);
	}

	const allowedResidents = new Set(residentIds);
	const seenPairs = new Set<string>();
	for (const relationship of graph) {
		const [residentAId, residentBId] = orderedResidentPair(
			relationship.residentAId,
			relationship.residentBId,
		);
		if (
			residentAId !== relationship.residentAId ||
			residentBId !== relationship.residentBId ||
			!allowedResidents.has(residentAId) ||
			!allowedResidents.has(residentBId)
		) {
			throw new RangeError(
				"Relationship pairs must use known residents in canonical order.",
			);
		}
		const pairKey = `${residentAId}:${residentBId}`;
		if (seenPairs.has(pairKey)) {
			throw new RangeError(`Duplicate relationship pair ${pairKey}.`);
		}
		seenPairs.add(pairKey);
		for (const value of [
			relationship.friendship,
			relationship.rivalry,
			relationship.familiarity,
		]) {
			if (
				!Number.isSafeInteger(value) ||
				value < RELATIONSHIP_VALUE_MIN ||
				value > RELATIONSHIP_VALUE_MAX
			) {
				throw new RangeError("Relationship values must be bounded integers.");
			}
		}
		if (
			relationship.recentExperienceIds.length >
				RECENT_PAIR_EXPERIENCE_LIMIT ||
			new Set(relationship.recentExperienceIds).size !==
				relationship.recentExperienceIds.length
		) {
			throw new RangeError(
				"Recent pair experiences must be unique and bounded.",
			);
		}
	}
}

export function applyRelationshipEffects(
	graph: readonly WorldRelationship[],
	effects: readonly RelationshipEffect[],
	appliedEffectKeys: readonly string[] = [],
): {
	relationships: RelationshipGraph;
	appliedEffectKeys: string[];
} {
	const seenEffectKeys = new Set(appliedEffectKeys);
	const next = graph.map((relationship) => ({
		...relationship,
		recentExperienceIds: [...relationship.recentExperienceIds],
	}));

	for (const effect of effects) {
		const expectedKey = relationshipEffectKey(effect);
		if (effect.effectKey !== expectedKey) {
			throw new RangeError("Relationship effect key does not match its cause.");
		}
		if (
			!effect.causeRevisionId ||
			!effect.sceneKey ||
			!Number.isSafeInteger(effect.effectOrdinal) ||
			effect.effectOrdinal < 0 ||
			![-1, 0, 1].includes(effect.delta)
		) {
			throw new RangeError("Relationship effects must be cause-backed and bounded.");
		}
		if (seenEffectKeys.has(effect.effectKey)) {
			throw new RangeError(`Duplicate relationship effect ${effect.effectKey}.`);
		}
		const [residentAId, residentBId] = orderedResidentPair(
			effect.residentAId,
			effect.residentBId,
		);
		const relationship = next.find(
			(candidate) =>
				candidate.residentAId === residentAId &&
				candidate.residentBId === residentBId,
		);
		if (!relationship) {
			throw new RangeError(
				`Relationship effect references unknown pair ${residentAId}:${residentBId}.`,
			);
		}
		relationship[effect.dimension] = clampRelationshipValue(
			relationship[effect.dimension] + effect.delta,
		);
		seenEffectKeys.add(effect.effectKey);
	}

	return {
		relationships: next,
		appliedEffectKeys: [...seenEffectKeys],
	};
}

export function relationshipEffectFromEvent(
	event: RelationshipEffectAppliedEvent,
): RelationshipEffect {
	return { ...event.payload };
}
