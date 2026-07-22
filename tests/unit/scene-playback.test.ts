import { describe, expect, it } from "vitest";
import {
	advanceScenePlayback,
	createScenePlayback,
	pauseScenePlayback,
	resumeScenePlayback,
} from "../../src/features/world/client/scene-playback.ts";

describe("local scene playback", () => {
	it("advances configured turns across the full presentation duration", () => {
		let playback = createScenePlayback("scene-1", 6, 45_000, 1_000, false);

		expect(playback.turnIndex).toBe(0);
		expect(playback.remainingMs).toBe(7_500);
		playback = advanceScenePlayback(playback, 8_500, 6, 7_500);
		expect(playback.turnIndex).toBe(1);
		expect(playback.remainingMs).toBe(7_500);
	});

	it("freezes and resumes the exact remaining turn time", () => {
		let playback = createScenePlayback("scene-1", 6, 45_000, 1_000, false);
		playback = pauseScenePlayback(playback, 3_500);

		expect(playback.turnIndex).toBe(0);
		expect(playback.remainingMs).toBe(5_000);
		expect(playback.runningSinceMs).toBeNull();

		playback = resumeScenePlayback(playback, 20_000, 6);
		playback = advanceScenePlayback(playback, 25_000, 6, 7_500);
		expect(playback.turnIndex).toBe(1);
	});

	it("never advances beyond the final turn", () => {
		let playback = createScenePlayback("scene-1", 2, 10_000, 0, false);
		playback = advanceScenePlayback(playback, 20_000, 2, 5_000);

		expect(playback.turnIndex).toBe(1);
		expect(playback.remainingMs).toBe(0);
		expect(playback.runningSinceMs).toBeNull();
	});
});
