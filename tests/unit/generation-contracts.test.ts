import { describe, expect, it } from "vitest";
import { PublicWorldSnapshotSchema } from "../../src/features/world/contracts/public-world.ts";
import { createProvisionalWorld } from "../../src/features/world/fixtures/provisional-world.ts";
import { toPublicWorldSnapshot } from "../../src/features/world/server/to-public-snapshot.ts";

describe("Phase 2 public scene contract", () => {
	it("accepts an accepted scene with the maximum ten complete turns", () => {
		const world = createProvisionalWorld();
		world.throughSequence = 1;
		world.scene = {
			id: "scene-phase-2-tracer",
			premise: "A quiet retrospective becomes a finished conversation.",
			locationId: "common-room",
			participantIds: ["atlas", "ember"],
			startedAtTick: 3,
			durationTicks: 4,
			presentationDurationMs: 12_000,
			turns: Array.from({ length: 10 }, (_, index) => ({
				id: `turn-${index}`,
				speakerId: index % 2 === 0 ? "atlas" : "ember",
				text: `Validated tracer turn ${index + 1}.`,
			})),
		};
		world.quiet = null;

		expect(() =>
			PublicWorldSnapshotSchema.parse(toPublicWorldSnapshot(world)),
		).not.toThrow();
	});
});
