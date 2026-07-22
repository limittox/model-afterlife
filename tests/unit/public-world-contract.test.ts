import { describe, expect, it } from "vitest";
import {
	PublicWorldUpdatesSchema,
	type PublicWorldSnapshot,
} from "../../src/features/world/contracts/public-world.ts";

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
