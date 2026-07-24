import { orderedResidentPair } from "./relationships.ts";
import type {
	SharedExperienceMemory,
	WorldRelationship,
} from "./types.ts";

export const WORLD_MEMORY_RETENTION_LIMIT = 24;
export const PROMPT_MEMORY_LIMIT = 3;

export function recordSharedExperience(
	memories: readonly SharedExperienceMemory[],
	relationships: readonly WorldRelationship[],
	memory: SharedExperienceMemory,
): {
	memories: SharedExperienceMemory[];
	relationships: WorldRelationship[];
} {
	if (
		!memory.id ||
		memory.source !== "published" ||
		!memory.causeRevisionId ||
		!memory.sceneKey ||
		!memory.summary.trim() ||
		!Number.isSafeInteger(memory.logicalTick) ||
		memory.logicalTick < 0
	) {
		throw new RangeError("Shared memories require an accepted structured cause.");
	}
	if (
		memory.participantIds.length < 2 ||
		new Set(memory.participantIds).size !== memory.participantIds.length
	) {
		throw new RangeError("Shared memories require unique scene participants.");
	}
	if (memories.some((candidate) => candidate.id === memory.id)) {
		throw new RangeError(`Duplicate shared memory ${memory.id}.`);
	}

	const orderedMemories = [...memories, structuredClone(memory)]
		.sort(
			(left, right) =>
				left.logicalTick - right.logicalTick || left.id.localeCompare(right.id),
		)
		.slice(-WORLD_MEMORY_RETENTION_LIMIT);
	const retainedIds = new Set(orderedMemories.map((candidate) => candidate.id));
	const nextRelationships = relationships.map((relationship) => {
		const [residentAId, residentBId] = orderedResidentPair(
			relationship.residentAId,
			relationship.residentBId,
		);
		if (
			!memory.participantIds.includes(residentAId) ||
			!memory.participantIds.includes(residentBId)
		) {
			return {
				...relationship,
				recentExperienceIds: relationship.recentExperienceIds.filter((id) =>
					retainedIds.has(id),
				),
			};
		}
		return {
			...relationship,
			recentExperienceIds: [
				...relationship.recentExperienceIds.filter(
					(id) => id !== memory.id && retainedIds.has(id),
				),
				memory.id,
			].slice(-6),
		};
	});

	return { memories: orderedMemories, relationships: nextRelationships };
}
