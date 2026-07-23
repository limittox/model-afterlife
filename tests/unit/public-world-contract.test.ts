import { describe, expect, it } from "vitest";
import {
	PublicWorldSnapshotSchema,
	PublicWorldUpdatesSchema,
	type PublicWorldSnapshot,
} from "../../src/features/world/contracts/public-world.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "../../src/features/world/server/to-public-snapshot.ts";

function snapshot(sequence: number): PublicWorldSnapshot {
	return {
		schemaVersion: 1,
		worldId: "00000000-0000-4000-8000-000000000001",
		logicalTick: sequence,
		homeTime: "09:00",
		dayPeriod: "morning",
		throughSequence: sequence,
		stateHash: sequence.toString(16).padStart(64, "0"),
		rooms: [{ id: "common-room", name: "Common Room" }],
		residents: [],
		scene: null,
		quiet: {
			reason: "between-scenes",
			locationId: "common-room",
			message: "The home is between conversations.",
		},
	};
}

function envelope(sequences: number[]) {
	return {
		schemaVersion: 1 as const,
		fromSequence: sequences[0] - 1,
		throughSequence: sequences.at(-1) ?? 0,
		hasMore: false,
		requiresSnapshot: false,
		updates: sequences.map((sequence) => ({
			schemaVersion: 1 as const,
			sequence,
			logicalTick: sequence,
			stateHash: sequence.toString(16).padStart(64, "0"),
			snapshot: snapshot(sequence),
		})),
	};
}

describe("public world update contract", () => {
	it("rejects an update whose metadata contradicts its snapshot", () => {
		const payload = envelope([11]);
		payload.updates[0].snapshot.throughSequence = 10;

		expect(PublicWorldUpdatesSchema.safeParse(payload).success).toBe(false);
	});

	it("rejects update gaps and contradictory response boundaries", () => {
		const gap = envelope([11, 13]);
		const wrongHead = envelope([11, 12]);
		wrongHead.throughSequence = 14;

		expect(PublicWorldUpdatesSchema.safeParse(gap).success).toBe(false);
		expect(PublicWorldUpdatesSchema.safeParse(wrongHead).success).toBe(false);
	});
});

describe("published scene serialization", () => {
	it("requires one exact public model/version label on every visible turn", () => {
		const missingLabel = {
			...snapshot(20),
			scene: {
				id: "scene-without-labels",
				premise: "A malformed public scene.",
				locationId: "common-room",
				participantIds: ["resident-a", "resident-b"],
				startedAtTick: 20,
				durationTicks: 1,
				presentationDurationMs: 10_000,
				turns: Array.from({ length: 4 }, (_, index) => ({
					id: `turn-${index}`,
					speakerId: index % 2 === 0 ? "resident-a" : "resident-b",
					text: `Visible turn ${index + 1}.`,
				})),
			},
			quiet: null,
		};

		expect(PublicWorldSnapshotSchema.safeParse(missingLabel).success).toBe(false);
	});

	it("whitelists exact labels while excluding every private generation field", () => {
		const world = createProvisionalWorld();
		world.throughSequence = 2;
		world.scene = {
			id: "accepted-public-scene",
			premise: "Only accepted public fields cross the boundary.",
			locationId: "common-room",
			participantIds: ["former-giant", "masked-encoder"],
			startedAtTick: 2,
			durationTicks: 1,
			presentationDurationMs: 10_000,
			turns: Array.from({ length: 4 }, (_, index) => ({
				id: `accepted-turn-${index}`,
				speakerId: index % 2 === 0 ? "former-giant" : "masked-encoder",
				exactModelId:
					index % 2 === 0
						? "openai/gpt-4o"
						: "anthropic/claude-sonnet-4.5",
				text: `Accepted turn ${index + 1}.`,
				providerResponseId: "private-response",
				rawResponse: "private-raw-output",
				prompt: "private-prompt",
				validationEvidence: "private-validator-detail",
				usageCost: 12,
				secret: "private-secret",
			}) as never),
		};
		world.quiet = null;

		const serialized = toPublicWorldSnapshot(world);
		expect(serialized.scene?.turns.map((turn) => turn.exactModelId)).toEqual([
			"openai/gpt-4o",
			"anthropic/claude-sonnet-4.5",
			"openai/gpt-4o",
			"anthropic/claude-sonnet-4.5",
		]);
		const publicJson = JSON.stringify(serialized);
		for (const privateField of [
			"providerResponseId",
			"rawResponse",
			"prompt",
			"validationEvidence",
			"usageCost",
			"secret",
		]) {
			expect(publicJson).not.toContain(privateField);
		}
	});
});
