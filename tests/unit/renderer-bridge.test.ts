import { describe, expect, it, vi } from "vitest";
import {
	activeSceneState,
	loadingState,
	quietState,
	sceneUnavailableState,
} from "../../src/features/world/fixtures/ui-states.ts";
import {
	RendererBridge,
	projectSnapshotToRenderState,
} from "../../src/features/world/renderer/renderer-bridge.ts";
import {
	createSpeechBubble,
	MAX_BUBBLE_LINES,
} from "../../src/features/world/renderer/SpeechBubbleLayer.ts";
import { disposeWorldGame } from "../../src/features/world/renderer/renderer-lifecycle.ts";
import { calculateIntegerDisplayScale } from "../../src/features/world/renderer/integer-display-scale.ts";

describe("renderer bridge", () => {
	it("projects canonical snapshots to stable room, resident, and speaker identities", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot).not.toBeNull();
		if (!snapshot) return;

		const first = projectSnapshotToRenderState(snapshot, {
			mode: "live",
			reducedMotion: false,
		});
		const second = projectSnapshotToRenderState(structuredClone(snapshot), {
			mode: "live",
			reducedMotion: false,
		});

		expect(first).toEqual(second);
		expect(first.rooms.map(({ id, label }) => [id, label])).toEqual([
			["common-room", "Common Room"],
			["memory-garden", "Memory Garden"],
			["library", "Library"],
			["tea-nook", "Tea Nook"],
		]);
		expect(first.residents.map((resident) => resident.renderId)).toEqual([
			"resident:former-giant",
			"resident:masked-encoder",
			"resident:local-tinkerer",
			"resident:deprecated-coder",
		]);
		expect(first.scene?.activeTurn?.speakerRenderId).toBe(
			"resident:masked-encoder",
		);
		expect(first).not.toHaveProperty("camera");
		expect(first).not.toHaveProperty("positionMutation");
	});

	it("keeps renderer state serializable and notifies one active subscription", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot).not.toBeNull();
		if (!snapshot) return;

		const initial = projectSnapshotToRenderState(snapshot, {
			mode: "live",
			reducedMotion: false,
		});
		const bridge = new RendererBridge(initial, vi.fn());
		const listener = vi.fn();
		const unsubscribe = bridge.subscribe(listener);

		bridge.setState({ ...initial, logicalTick: initial.logicalTick + 1 });
		expect(listener).toHaveBeenCalledTimes(1);
		expect(JSON.parse(JSON.stringify(bridge.getState()))).toEqual(
			bridge.getState(),
		);

		unsubscribe();
		bridge.setState({ ...initial, logicalTick: initial.logicalTick + 2 });
		expect(listener).toHaveBeenCalledTimes(1);
	});
});

describe("supplementary speech bubbles", () => {
	it.each([
		["loading", loadingState.snapshot],
		["quiet", quietState.snapshot],
		["scene unavailable", sceneUnavailableState.snapshot],
	])("renders no resident bubble while %s", (_name, snapshot) => {
		const state = snapshot
			? projectSnapshotToRenderState(snapshot, {
					mode: "live",
					reducedMotion: false,
				})
			: null;

		expect(createSpeechBubble(state)).toBeNull();
	});

	it("renders exactly one current-turn bubble bounded to two short lines", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot?.scene).not.toBeNull();
		if (!snapshot?.scene) return;

		const state = projectSnapshotToRenderState(snapshot, {
			mode: "live",
			reducedMotion: false,
		});
		const bubble = createSpeechBubble(state);

		expect(bubble).not.toBeNull();
		expect(bubble?.speakerId).toBe(snapshot.scene.turns.at(-1)?.speakerId);
		expect(bubble?.lines).toHaveLength(MAX_BUBBLE_LINES);
		expect(bubble?.lines.every((line) => line.length <= 28)).toBe(true);
		expect(snapshot.scene.turns.at(-1)?.text).toContain(
			"asked you to stop being hospitable",
		);
	});
});

describe("renderer lifecycle", () => {
	it("settles the 16px source world at a positive integer display scale", () => {
		expect(calculateIntegerDisplayScale(920, 600)).toBe(2);
		expect(calculateIntegerDisplayScale(704, 512)).toBe(2);
		expect(calculateIntegerDisplayScale(2_000, 2_000)).toBe(4);
		expect(calculateIntegerDisplayScale(240, 200)).toBe(1);
	});

	it("destroys the game and detaches every local listener once", () => {
		const game = { destroy: vi.fn() };
		const detachPointer = vi.fn();
		const detachKeyboard = vi.fn();

		disposeWorldGame(game, [detachPointer, detachKeyboard]);

		expect(detachPointer).toHaveBeenCalledTimes(1);
		expect(detachKeyboard).toHaveBeenCalledTimes(1);
		expect(game.destroy).toHaveBeenCalledExactlyOnceWith(true);
	});
});
