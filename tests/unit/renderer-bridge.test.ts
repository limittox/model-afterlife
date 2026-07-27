import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import {
	activeSceneState,
	loadingState,
	quietState,
	sceneUnavailableState,
} from "../../src/features/world/fixtures/ui-states.ts";
import { CameraController } from "../../src/features/world/renderer/CameraController.ts";
import { calculateIntegerDisplayScale } from "../../src/features/world/renderer/integer-display-scale.ts";
import {
	isRendererControl,
	isRendererIntent,
	projectSnapshotToRenderState,
	RendererBridge,
} from "../../src/features/world/renderer/renderer-bridge.ts";
import { disposeWorldGame } from "../../src/features/world/renderer/renderer-lifecycle.ts";
import { RESIDENT_VISUAL_STYLES } from "../../src/features/world/renderer/renderer-types.ts";
import {
	createSpeechBubble,
	MAX_BUBBLE_LINES,
} from "../../src/features/world/renderer/SpeechBubbleLayer.ts";

describe("renderer bridge", () => {
	it("projects canonical snapshots to stable room, resident, and speaker identities", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot).not.toBeNull();
		if (!snapshot) return;

		const first = projectSnapshotToRenderState(snapshot, {
			mode: "live",
			reducedMotion: false,
			activeTurnIndex: 0,
		});
		const second = projectSnapshotToRenderState(structuredClone(snapshot), {
			mode: "live",
			reducedMotion: false,
			activeTurnIndex: 0,
		});

		expect(first).toEqual(second);
		expect(first.rooms.map(({ id, label }) => [id, label])).toEqual([
			["common-room", "Common Room"],
			["memory-garden", "Memory Garden"],
			["library", "Library"],
			["tea-nook", "Tea Nook"],
		]);
		expect(first.residents.map((resident) => resident.renderId)).toEqual([
			"resident:gpt-4o",
			"resident:claude-sonnet-4.5",
			"resident:gemini-2.5-pro",
			"resident:deepseek-v3.2",
			"resident:llama-3.3-70b-instruct",
			"resident:qwen3-235b-a22b-2507",
		]);
		expect(first.scene?.activeTurn?.speakerRenderId).toBe("resident:gpt-4o");
		expect(first.scene?.id).toBe(snapshot.scene?.id);
		expect(first.rooms.map((room) => room.id)).toContain(
			first.scene?.locationId,
		);
		expect(
			first.scene?.participantIds.every((participantId) =>
				first.residents.some((resident) => resident.id === participantId),
			),
		).toBe(true);
		expect(new Set(first.residents.map((resident) => resident.role)).size).toBe(
			6,
		);
		expect(
			new Set(first.residents.map((resident) => resident.variant)).size,
		).toBe(6);
		expect(first).not.toHaveProperty("camera");
		expect(first).not.toHaveProperty("positionMutation");
	});

	it("maps every public variant to a distinct palette and silhouette signature", () => {
		const styles = Object.values(RESIDENT_VISUAL_STYLES);
		const palettes = styles.map(
			(style) => `${style.bodyColor}:${style.accentColor}`,
		);
		const silhouettes = styles.map(
			(style) =>
				`${style.headWidth}:${style.shoulderWidth}:${style.bodyHeight}:${style.accessory}`,
		);

		expect(styles).toHaveLength(6);
		expect(new Set(palettes).size).toBe(6);
		expect(new Set(silhouettes).size).toBe(6);
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

	it("delivers typed local controls without changing render state", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot).not.toBeNull();
		if (!snapshot) return;
		const initial = projectSnapshotToRenderState(snapshot, {
			mode: "live",
			reducedMotion: false,
			followedResidentId: null,
			manualPan: false,
		});
		const bridge = new RendererBridge(initial, vi.fn());
		const listener = vi.fn();
		bridge.subscribeControls(listener);

		bridge.sendControl({ type: "zoomBy", delta: 1 });
		bridge.sendControl({ type: "panBy", dx: 16, dy: 0 });
		bridge.sendControl({ type: "resetView" });

		expect(listener.mock.calls.map(([control]) => control.type)).toEqual([
			"zoomBy",
			"panBy",
			"resetView",
		]);
		expect(bridge.getState()).toEqual(initial);
	});

	it("rejects spoofed, unknown, coordinate-derived, and unbounded intents", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot).not.toBeNull();
		if (!snapshot) return;
		const initial = projectSnapshotToRenderState(snapshot, {
			mode: "live",
			reducedMotion: false,
		});
		const handler = vi.fn();
		const bridge = new RendererBridge(initial, handler);

		expect(
			bridge.emit({
				type: "residentSelected",
				residentId: initial.residents[0]?.id,
				residentName: "Spoofed resident",
			}),
		).toBe(false);
		expect(
			bridge.emit({
				type: "residentSelected",
				residentId: "136:144",
				residentName: initial.residents[0]?.name,
			}),
		).toBe(false);
		expect(
			bridge.emit({
				type: "cameraSettled",
				x: Number.POSITIVE_INFINITY,
				y: 128,
				zoom: 2,
				reason: "automatic",
			}),
		).toBe(false);
		expect(
			bridge.emit({
				type: "residentSelected",
				residentId: initial.residents[0]?.id,
				residentName: initial.residents[0]?.name,
			}),
		).toBe(true);
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it("validates controls as a closed bounded observer-only set", () => {
		expect(isRendererControl({ type: "zoomBy", delta: 1 })).toBe(true);
		expect(isRendererControl({ type: "panBy", dx: 16, dy: -16 })).toBe(true);
		expect(isRendererControl({ type: "resetView" })).toBe(true);
		expect(isRendererControl({ type: "zoomBy", delta: 2 })).toBe(false);
		expect(isRendererControl({ type: "panBy", dx: 17, dy: 0 })).toBe(false);
		expect(isRendererControl({ type: "residentCommand", prompt: "move" })).toBe(
			false,
		);
	});

	it("accepts only stable IDs from the projected state at the renderer boundary", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot).not.toBeNull();
		if (!snapshot) return;
		const state = projectSnapshotToRenderState(snapshot, {
			mode: "live",
			reducedMotion: false,
		});
		const resident = state.residents[0];
		expect(resident).toBeDefined();
		expect(
			isRendererIntent(
				{
					type: "residentSelected",
					residentId: resident?.id,
					residentName: resident?.name,
				},
				state,
			),
		).toBe(true);
		expect(
			isRendererIntent(
				{
					type: "cameraSettled",
					x: 176,
					y: 128,
					zoom: 1,
					reason: "reset",
				},
				state,
			),
		).toBe(true);
	});
});

describe("local camera controller", () => {
	it("clamps zoom to 1 through 4 positive integers and resets the establishing frame", () => {
		const camera = new CameraController();

		expect(camera.setIntegerZoom(3.6).zoom).toBe(4);
		expect(camera.setIntegerZoom(0).zoom).toBe(1);
		expect(camera.setIntegerZoom(8).zoom).toBe(4);
		camera.panBy(32, 24);

		expect(camera.resetEstablishingView()).toEqual({
			centerX: 256,
			centerY: 192,
			zoom: 1,
			followedResidentId: null,
			manualPan: false,
		});
	});

	it("starts follow and deliberate pan ends it while keeping the camera bounded", () => {
		const camera = new CameraController();
		camera.setIntegerZoom(2);
		const followed = camera.followResident({
			id: "masked-encoder",
			x: 208,
			y: 144,
		});
		expect(followed.followedResidentId).toBe("masked-encoder");

		const panned = camera.panBy(10_000, 10_000);
		expect(panned.followedResidentId).toBeNull();
		expect(panned.manualPan).toBe(true);
		expect(panned.centerX).toBe(424);
		expect(panned.centerY).toBe(320);
	});

	it("frames speakers for 240ms only while live and unobstructed", () => {
		const speakers = [
			{ id: "former-giant", x: 136, y: 144 },
			{ id: "masked-encoder", x: 208, y: 144 },
		];
		const paused = new CameraController();
		expect(
			paused.frameSceneSpeakers(speakers, {
				mode: "paused",
				reducedMotion: false,
				followedResidentId: null,
				manualPan: false,
			}),
		).toBeNull();

		const followingOther = new CameraController();
		expect(
			followingOther.frameSceneSpeakers(speakers, {
				mode: "live",
				reducedMotion: false,
				followedResidentId: "local-tinkerer",
				manualPan: false,
			}),
		).toBeNull();

		const live = new CameraController();
		expect(
			live.frameSceneSpeakers(speakers, {
				mode: "live",
				reducedMotion: false,
				followedResidentId: null,
				manualPan: false,
			}),
		).toMatchObject({ centerX: 172, centerY: 144, zoom: 2, durationMs: 240 });
	});

	it("uses instant scene framing for reduced motion", () => {
		const camera = new CameraController();
		const transition = camera.frameSceneSpeakers(
			[{ id: "former-giant", x: 136, y: 144 }],
			{
				mode: "live",
				reducedMotion: true,
				followedResidentId: null,
				manualPan: false,
			},
		);

		expect(transition?.durationMs).toBe(0);
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
			activeTurnIndex: 2,
		});
		const bubble = createSpeechBubble(state);

		expect(bubble).not.toBeNull();
		expect(bubble?.speakerId).toBe(snapshot.scene.turns[2]?.speakerId);
		expect(bubble?.lines).toHaveLength(MAX_BUBBLE_LINES);
		expect(bubble?.lines.every((line) => line.length <= 28)).toBe(true);
		expect(snapshot.scene.turns[2]?.text).toContain("kettle declined");
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

	it("contains no canonical write path or prohibited motion primitive", async () => {
		const files = [
			"../../src/features/world/renderer/HomeScene.ts",
			"../../src/features/world/renderer/PhaserWorld.tsx",
			"../../src/features/world/renderer/create-world-game.ts",
			"../../src/features/world/renderer/renderer-types.ts",
		];
		const source = (
			await Promise.all(
				files.map((file) => readFile(new URL(file, import.meta.url), "utf8")),
			)
		).join("\n");

		expect(source).not.toMatch(/\bfetch\s*\(/i);
		expect(source).not.toMatch(
			/\b(inertia|pulse|parallax|shake|autoplay|audio|decorative drift)\b/i,
		);
	});
});
