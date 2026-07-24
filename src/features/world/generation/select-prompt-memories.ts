import { PROMPT_MEMORY_LIMIT } from "../domain/memories.ts";
import type { SharedExperienceMemory } from "../domain/types.ts";

export type PromptMemory = Readonly<{
	id: string;
	summary: string;
	logicalTick: number;
}>;

export function selectPromptMemories(input: {
	residentId: string;
	participantIds: readonly string[];
	memories: readonly SharedExperienceMemory[];
	limit?: number;
}): PromptMemory[] {
	const limit = input.limit ?? PROMPT_MEMORY_LIMIT;
	if (
		!Number.isSafeInteger(limit) ||
		limit < 0 ||
		limit > PROMPT_MEMORY_LIMIT
	) {
		throw new RangeError(`Prompt memory limit cannot exceed ${PROMPT_MEMORY_LIMIT}.`);
	}

	const activeParticipants = new Set([
		input.residentId,
		...input.participantIds,
	]);
	return input.memories
		.filter((memory) => memory.source === "published")
		.filter((memory) => memory.participantIds.includes(input.residentId))
		.map((memory) => ({
			memory,
			relevance: memory.participantIds.reduce(
				(score, residentId) =>
					score + (activeParticipants.has(residentId) ? 1 : 0),
				0,
			),
		}))
		.sort(
			(left, right) =>
				right.relevance - left.relevance ||
				right.memory.logicalTick - left.memory.logicalTick ||
				left.memory.id.localeCompare(right.memory.id),
		)
		.slice(0, limit)
		.map(({ memory }) => ({
			id: memory.id,
			summary: memory.summary,
			logicalTick: memory.logicalTick,
		}));
}
