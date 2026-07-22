import { describe, expect, it, vi } from "vitest";
import {
	PublishedSceneRevisionSchema,
	SceneBriefSchema,
} from "../../src/features/world/generation/contracts.ts";

async function loadGenerationRunner() {
	try {
		return await import(
			"../../src/features/world/generation/run-generation-request.ts"
		);
	} catch {
		return undefined;
	}
}

async function loadGenerationTask() {
	try {
		return await import("../../src/trigger/generate-scene.ts");
	} catch {
		return undefined;
	}
}

const request = {
	sceneKey: "world:committed:scene",
	expectedWorldHead: 17,
	occurrenceKey: "world:tick:rule:scene:generation:requested",
};

const brief = SceneBriefSchema.parse({
	schemaVersion: 1,
	sceneKey: request.sceneKey,
	expectedWorldHead: request.expectedWorldHead,
	participantIds: ["gpt-3.5-turbo-0613", "claude-sonnet-4.5"],
	speakerOrder: [
		"gpt-3.5-turbo-0613",
		"claude-sonnet-4.5",
		"gpt-3.5-turbo-0613",
		"claude-sonnet-4.5",
	],
	locationId: "common-room",
	premise: "A committed request reaches a bounded attempt.",
	allowedFactIds: ["claim-job"],
	tone: "warm",
	turnBudget: 4,
	permittedOutcome: "quiet ending",
});

const revision = PublishedSceneRevisionSchema.parse({
	revisionId: "revision-job-1",
	attemptId: "attempt-job-1",
	sceneKey: brief.sceneKey,
	expectedWorldHead: brief.expectedWorldHead,
	turns: brief.speakerOrder.map((residentId, turnIndex) => ({
		turnIndex,
		residentId,
		requestedModelId:
			residentId === "gpt-3.5-turbo-0613"
				? "openai/gpt-3.5-turbo-0613"
				: "anthropic/claude-sonnet-4.5",
		text: `Accepted job turn ${turnIndex + 1}.`,
		ending: turnIndex === brief.turnBudget - 1,
		effects: [],
	})),
});

describe("durable generation request runner", () => {
	it("publishes an accepted first attempt once", async () => {
		const runnerModule = await loadGenerationRunner();

		expect(runnerModule, "generation runner module must exist").toBeDefined();
		const runAttempt = vi.fn(async () => ({ status: "accepted" as const, revision }));
		const publish = vi.fn(async () => ({ revisionId: revision.revisionId, published: true }));
		const recordQuiet = vi.fn(async () => undefined);
		const result = await runnerModule?.runGenerationRequest(request, {
			loadBrief: async () => brief,
			runAttempt,
			publish,
			recordQuiet,
		});

		expect(runAttempt).toHaveBeenCalledTimes(1);
		expect(runAttempt).toHaveBeenCalledWith({ brief, attemptOrdinal: 1 });
		expect(publish).toHaveBeenCalledOnce();
		expect(recordQuiet).not.toHaveBeenCalled();
		expect(result).toMatchObject({ status: "published", attemptOrdinal: 1 });
	});

	it("starts attempt two from the original brief and records a named quiet disposition", async () => {
		const runnerModule = await loadGenerationRunner();

		expect(runnerModule, "generation runner module must exist").toBeDefined();
		const inputs: unknown[] = [];
		const runAttempt = vi.fn(async (input: unknown) => {
			inputs.push(input);
			return inputs.length === 1
				? {
						status: "rejected" as const,
						disposition: "schema_rejected" as const,
						rejectedText: "Do not place this in the next prompt.",
					}
				: {
						status: "rejected" as const,
						disposition: "identity_rejected" as const,
					};
		});
		const publish = vi.fn(async () => undefined);
		const recordQuiet = vi.fn(async () => undefined);
		const result = await runnerModule?.runGenerationRequest(request, {
			loadBrief: async () => brief,
			runAttempt,
			publish,
			recordQuiet,
		});

		expect(runAttempt).toHaveBeenCalledTimes(2);
		expect(inputs).toEqual([
			{ brief, attemptOrdinal: 1 },
			{ brief, attemptOrdinal: 2 },
		]);
		expect(JSON.stringify(inputs[1])).not.toContain("Do not place this");
		expect(publish).not.toHaveBeenCalled();
		expect(recordQuiet).toHaveBeenCalledWith({
			sceneKey: request.sceneKey,
			disposition: "generation_failed_after_two_attempts",
			attemptDispositions: ["schema_rejected", "identity_rejected"],
		});
		expect(result).toEqual({
			status: "quiet",
			disposition: "generation_failed_after_two_attempts",
			attemptDispositions: ["schema_rejected", "identity_rejected"],
		});
	});

	it("turns a provider exception into one failed attempt rather than an SDK retry", async () => {
		const runnerModule = await loadGenerationRunner();

		expect(runnerModule, "generation runner module must exist").toBeDefined();
		const runAttempt = vi
			.fn()
			.mockRejectedValueOnce(new Error("provider timed out"))
			.mockResolvedValueOnce({ status: "accepted", revision });
		const result = await runnerModule?.runGenerationRequest(request, {
			loadBrief: async () => brief,
			runAttempt,
			publish: async () => ({ revisionId: revision.revisionId, published: true }),
			recordQuiet: async () => undefined,
		});

		expect(runAttempt).toHaveBeenCalledTimes(2);
		expect(result).toMatchObject({
			status: "published",
			attemptOrdinal: 2,
			attemptDispositions: ["provider_failed"],
		});
	});
});

describe("generation Trigger task", () => {
	it("declares the stable task identity and bounded durable configuration", async () => {
		const taskModule = await loadGenerationTask();

		expect(taskModule, "generation Trigger module must exist").toBeDefined();
		expect(taskModule?.GENERATE_SCENE_TASK_ID).toBe(
			"model-afterlife-generate-scene",
		);
		expect(taskModule?.GENERATE_SCENE_MAX_DURATION).toBe(240);
		expect(taskModule?.GENERATE_SCENE_RETRY).toMatchObject({
			maxAttempts: 3,
			randomize: false,
		});
	});
});
