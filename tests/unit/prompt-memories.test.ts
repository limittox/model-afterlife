import { describe, expect, it } from "vitest";
import type { SharedExperienceMemory } from "../../src/features/world/domain/types.ts";
import { selectPromptMemories } from "../../src/features/world/generation/select-prompt-memories.ts";

function memory(
	id: string,
	logicalTick: number,
	participantIds: string[],
): SharedExperienceMemory {
	return {
		id,
		source: "published",
		causeRevisionId: `revision:${id}`,
		sceneKey: `scene:${id}`,
		participantIds,
		summary: `Accepted structured outcome ${id}.`,
		tags: ["fixture"],
		logicalTick,
	};
}

describe("bounded prompt memory selection", () => {
	it("returns at most three relevant published memories in stable order", () => {
		const memories = [
			memory("old-pair", 10, ["gpt-4o", "claude-sonnet-4.5"]),
			memory("new-pair", 30, ["gpt-4o", "claude-sonnet-4.5"]),
			memory("new-solo-relevant", 40, ["gpt-4o", "deepseek-v3.2"]),
			memory("middle-pair", 20, ["gpt-4o", "claude-sonnet-4.5"]),
			memory("irrelevant", 50, ["gemini-2.5-pro", "deepseek-v3.2"]),
		];

		const selected = selectPromptMemories({
			residentId: "gpt-4o",
			participantIds: ["gpt-4o", "claude-sonnet-4.5"],
			memories,
		});

		expect(selected.map((candidate) => candidate.id)).toEqual([
			"new-pair",
			"middle-pair",
			"old-pair",
		]);
		expect(JSON.stringify(selected)).not.toContain("irrelevant");
	});

	it("excludes private or rejected memory-shaped input at runtime", () => {
		const privateMemory = {
			...memory("private", 99, ["gpt-4o", "claude-sonnet-4.5"]),
			source: "private",
			summary: "Rejected raw dialogue must never enter a prompt.",
		} as unknown as SharedExperienceMemory;

		expect(
			selectPromptMemories({
				residentId: "gpt-4o",
				participantIds: ["claude-sonnet-4.5"],
				memories: [privateMemory],
			}),
		).toEqual([]);
	});

	it("supports empty history and rejects an unbounded request", () => {
		expect(
			selectPromptMemories({
				residentId: "gpt-4o",
				participantIds: ["claude-sonnet-4.5"],
				memories: [],
			}),
		).toEqual([]);
		expect(() =>
			selectPromptMemories({
				residentId: "gpt-4o",
				participantIds: ["claude-sonnet-4.5"],
				memories: [],
				limit: 4,
			}),
		).toThrow(/cannot exceed 3/);
	});
});
