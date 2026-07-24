import { describe, expect, it } from "vitest";
import {
	PublicWorldSnapshotSchema,
	PublicWorldUpdatesSchema,
	type PublicWorldSnapshot,
} from "../../src/features/world/contracts/public-world.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "../../src/features/world/server/to-public-snapshot.ts";

function snapshot(sequence: number): PublicWorldSnapshot {
	const world = createProvisionalWorld();
	world.logicalTick = sequence;
	world.throughSequence = sequence;
	return toPublicWorldSnapshot(world);
}

function envelope(sequences: number[]) {
	return {
		schemaVersion: 1 as const,
		fromSequence: sequences[0] - 1,
		throughSequence: sequences.at(-1) ?? 0,
		hasMore: false,
		requiresSnapshot: false,
		updates: sequences.map((sequence) => {
			const current = snapshot(sequence);
			return {
				schemaVersion: 1 as const,
				sequence,
				logicalTick: sequence,
				stateHash: current.stateHash,
				snapshot: current,
			};
		}),
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
	it("publishes exactly six distinct grounded resident identities and routine cues", () => {
		const world = createProvisionalWorld();
		world.throughSequence = 1;
		const serialized = toPublicWorldSnapshot(world);

		expect(serialized.residents.map((resident) => resident.id)).toEqual([
			"gpt-4o",
			"claude-sonnet-4.5",
			"gemini-2.5-pro",
			"deepseek-v3.2",
			"llama-3.3-70b-instruct",
			"qwen3-235b-a22b-2507",
		]);
		expect(
			new Set(serialized.residents.map((resident) => resident.role)).size,
		).toBe(6);
		expect(
			new Set(serialized.residents.map((resident) => resident.visualVariantId))
				.size,
		).toBe(6);
		expect(
			serialized.residents.every((resident) => resident.activity.length > 0),
		).toBe(true);

		const duplicateVisual = structuredClone(serialized);
		duplicateVisual.residents[1].visualVariantId =
			duplicateVisual.residents[0].visualVariantId;
		expect(PublicWorldSnapshotSchema.safeParse(duplicateVisual).success).toBe(
			false,
		);
	});

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

		expect(PublicWorldSnapshotSchema.safeParse(missingLabel).success).toBe(
			false,
		);
	});

	it("whitelists exact labels while excluding every private generation field", () => {
		const world = createProvisionalWorld();
		world.throughSequence = 2;
		world.scene = {
			id: "accepted-public-scene",
			premise: "Only accepted public fields cross the boundary.",
			locationId: "common-room",
			participantIds: ["gpt-4o", "claude-sonnet-4.5"],
			startedAtTick: 2,
			durationTicks: 1,
			presentationDurationMs: 10_000,
			deliveryMode: "live",
			originalRevisionId: "accepted-scene",
			originalSceneKey: "accepted-scene",
			turns: Array.from(
				{ length: 4 },
				(_, index) =>
					({
						id: `accepted-turn-${index}`,
						speakerId: index % 2 === 0 ? "gpt-4o" : "claude-sonnet-4.5",
						exactModelId:
							index % 2 === 0 ? "openai/gpt-4o" : "anthropic/claude-sonnet-4.5",
						text: `Accepted turn ${index + 1}.`,
						providerResponseId: "private-response",
						rawResponse: "private-raw-output",
						prompt: "private-prompt",
						validationEvidence: "private-validator-detail",
						usageCost: 12,
						secret: "private-secret",
					}) as never,
			),
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
