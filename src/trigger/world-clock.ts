import { idempotencyKeys, schedules, tasks } from "@trigger.dev/sdk";
import { targetTickFor } from "../features/world/domain/clock.ts";
import { WORLD_EPOCH_MS } from "../features/world/fixtures/provisional-world.ts";
import {
	advanceWorldTo,
	type AdvanceWorldResult,
	type CommittedGenerationRequest,
} from "../features/world/server/advance-world-to.ts";
import { CANONICAL_WORLD_ID } from "../features/world/server/seed-data.ts";

export const WORLD_CLOCK_CRON = "* * * * *";
export const WORLD_CLOCK_TTL = "2m";
export const WORLD_CLOCK_RETRY = {
	maxAttempts: 3,
	minTimeoutInMs: 1_000,
	maxTimeoutInMs: 10_000,
	factor: 2,
	randomize: false,
} as const;

type WorldWriter = (
	worldId: string,
	targetTick: number,
) => Promise<AdvanceWorldResult>;

type GenerationDispatcher = (
	request: CommittedGenerationRequest,
) => Promise<unknown>;

type DispatchDependencies = {
	createKey: (
		key: string,
		options: { scope: "global" },
	) => Promise<unknown>;
	trigger: (
		taskId: string,
		payload: CommittedGenerationRequest,
		options: { idempotencyKey: unknown },
	) => Promise<unknown>;
};

export async function dispatchCommittedGenerationRequest(
	request: CommittedGenerationRequest,
	dependencies: DispatchDependencies = {
		createKey: idempotencyKeys.create as DispatchDependencies["createKey"],
		trigger: tasks.trigger as DispatchDependencies["trigger"],
	},
): Promise<unknown> {
	const idempotencyKey = await dependencies.createKey(request.sceneKey, {
		scope: "global",
	});
	return dependencies.trigger("model-afterlife-generate-scene", request, {
		idempotencyKey,
	});
}

export function worldClockIdempotencyKey(
	worldId: string,
	targetTick: number,
): string {
	return `world-clock:${worldId}:tick:${targetTick}`;
}

export async function runWorldClockAt(
	scheduledAt: Date,
	writer: WorldWriter = advanceWorldTo,
	dispatcher: GenerationDispatcher = async () => undefined,
) {
	const instantMs = scheduledAt.getTime();
	if (!Number.isFinite(instantMs)) {
		throw new TypeError("Scheduled world-clock timestamp must be valid.");
	}

	const targetTick = targetTickFor(instantMs, WORLD_EPOCH_MS);
	const idempotencyKey = worldClockIdempotencyKey(
		CANONICAL_WORLD_ID,
		targetTick,
	);
	const advance = await writer(CANONICAL_WORLD_ID, targetTick);
	for (const request of advance.generationRequests ?? []) {
		await dispatcher(request);
	}

	return {
		targetTick,
		idempotencyKey,
		advance,
		dispatchedGenerationRequests: advance.generationRequests?.length ?? 0,
	};
}

export const worldClock = schedules.task({
	id: "model-afterlife-world-clock",
	cron: WORLD_CLOCK_CRON,
	ttl: WORLD_CLOCK_TTL,
	retry: WORLD_CLOCK_RETRY,
	maxDuration: 60,
	queue: {
		name: "canonical-world-clock",
		concurrencyLimit: 1,
	},
	run: async (payload) =>
		runWorldClockAt(
			payload.timestamp,
			advanceWorldTo,
			dispatchCommittedGenerationRequest,
		),
});
