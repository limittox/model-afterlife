import { describe, expect, it } from "vitest";
import type {
	PublicWorldSnapshot,
	PublicWorldUpdate,
} from "../../src/features/world/contracts/public-world.ts";
import {
	createInitialPresentationState,
	presentationReducer,
} from "../../src/features/world/client/presentation-reducer.ts";

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

function update(sequence: number): PublicWorldUpdate {
	return {
		schemaVersion: 1,
		sequence,
		logicalTick: sequence,
		stateHash: sequence.toString(16).padStart(64, "0"),
		snapshot: snapshot(sequence),
	};
}

describe("presentationReducer", () => {
	it("keeps acquiring complete updates while local presentation is paused", () => {
		let state = createInitialPresentationState(snapshot(10));
		state = presentationReducer(state, { type: "pause" });
		state = presentationReducer(state, {
			type: "update-accepted",
			update: update(11),
		});
		state = presentationReducer(state, {
			type: "update-accepted",
			update: update(12),
		});

		expect(state.mode).toBe("paused");
		expect(state.acquisitionCursor).toBe(12);
		expect(state.presentationCursor).toBe(10);
		expect(state.presentedSnapshot?.throughSequence).toBe(10);
		expect(state.lastValidSnapshot?.throughSequence).toBe(12);
		expect(state.bufferedUpdates.map((item) => item.sequence)).toEqual([
			11, 12,
		]);
	});

	it("resumes from the paused cursor and reaches live through ordered presentation", () => {
		let state = createInitialPresentationState(snapshot(4));
		state = presentationReducer(state, { type: "pause" });
		state = presentationReducer(state, {
			type: "update-accepted",
			update: update(5),
		});
		state = presentationReducer(state, {
			type: "update-accepted",
			update: update(6),
		});
		state = presentationReducer(state, { type: "resume" });

		expect(state.mode).toBe("behind-live");
		expect(state.presentationCursor).toBe(4);
		state = presentationReducer(state, { type: "present-next" });
		expect(state.presentationCursor).toBe(5);
		expect(state.mode).toBe("behind-live");
		state = presentationReducer(state, { type: "present-next" });
		expect(state.presentationCursor).toBe(6);
		expect(state.mode).toBe("live");
	});

	it("waits for a valid fresh snapshot before completing jump to live", () => {
		let state = createInitialPresentationState(snapshot(20));
		state = presentationReducer(state, { type: "pause" });
		state = presentationReducer(state, {
			type: "update-accepted",
			update: update(21),
		});
		state = presentationReducer(state, { type: "jump-live-requested" });

		expect(state.mode).toBe("paused");
		expect(state.needsFreshSnapshot).toBe(true);
		expect(state.presentationCursor).toBe(20);

		state = presentationReducer(state, {
			type: "snapshot-accepted",
			snapshot: snapshot(24),
			reason: "jump-live",
		});

		expect(state.mode).toBe("live");
		expect(state.acquisitionCursor).toBe(24);
		expect(state.presentationCursor).toBe(24);
		expect(state.bufferedUpdates).toEqual([]);
		expect(state.announcement).toBe("Caught up to live");
	});

	it.each(["gap", "focus", "reconnect", "schema", "parse"] as const)(
		"retains the last valid world and requests replacement for %s recovery",
		(reason) => {
			const initial = createInitialPresentationState(snapshot(30));
			const state = presentationReducer(initial, {
				type: "recovery-requested",
				reason,
			});

			expect(state.needsFreshSnapshot).toBe(true);
			expect(state.connection).toBe("reconnecting");
			expect(state.presentedSnapshot).toEqual(snapshot(30));
			expect(state.presentationCursor).toBe(30);
		},
	);

	it("rejects a noncontiguous update without changing either cursor", () => {
		const initial = createInitialPresentationState(snapshot(8));
		const state = presentationReducer(initial, {
			type: "update-accepted",
			update: update(10),
		});

		expect(state.acquisitionCursor).toBe(8);
		expect(state.presentationCursor).toBe(8);
		expect(state.needsFreshSnapshot).toBe(true);
		expect(state.lastValidSnapshot).toEqual(snapshot(8));
	});

	it("unfollows on deliberate manual pan and announces the local change", () => {
		let state = createInitialPresentationState(snapshot(2));
		state = presentationReducer(state, {
			type: "follow",
			residentId: "masked-encoder",
			residentName: "The Masked Encoder",
		});
		state = presentationReducer(state, { type: "manual-pan-started" });

		expect(state.followedResidentId).toBeNull();
		expect(state.manualPan).toBe(true);
		expect(state.announcement).toBe("Stopped following The Masked Encoder");
	});
});
