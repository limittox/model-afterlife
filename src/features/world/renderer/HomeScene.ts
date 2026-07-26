import Phaser from "phaser";
import type { ResidentProductionAsset } from "./asset-manifest.ts";
import { CameraController, type CameraViewState } from "./CameraController.ts";
import {
	getResidentProductionAsset,
	getOriginalArtworkAsset,
	PRODUCTION_ASSET_MANIFEST,
	selectResidentProductionFrame,
} from "./production-assets.ts";
import type { RendererBridge } from "./renderer-bridge.ts";
import type {
	PresentationTokens,
	RendererControl,
	RenderResident,
	RenderRoom,
	RenderWorldState,
} from "./renderer-types.ts";
import { RESIDENT_VISUAL_STYLES } from "./renderer-types.ts";
import { createSpeechBubble } from "./SpeechBubbleLayer.ts";
import { HOME_HEIGHT, HOME_WIDTH } from "./world-layout.ts";

type ResidentVisual = {
	body: Phaser.GameObjects.Container;
	baseY: number;
	index: number;
	activeSpeaker: boolean;
	asset: ResidentProductionAsset | null;
	sprite: Phaser.GameObjects.Sprite | null;
	pose: RenderResident["pose"];
};

function colorNumber(hex: string): number {
	return Number.parseInt(hex.slice(1), 16);
}

export class HomeScene extends Phaser.Scene {
	private readonly bridge: RendererBridge;
	private readonly tokens: PresentationTokens;
	private unsubscribe: (() => void) | null = null;
	private unsubscribeControls: (() => void) | null = null;
	private residentVisuals: ResidentVisual[] = [];
	private readonly residentBodies = new Map<
		string,
		Phaser.GameObjects.Container
	>();
	private readonly cameraController = new CameraController();
	private lastSceneId: string | null = null;
	private hasRendered = false;
	private dragPoint: { x: number; y: number } | null = null;
	private dragging = false;

	constructor(bridge: RendererBridge, tokens: PresentationTokens) {
		super({ key: "HomeScene" });
		this.bridge = bridge;
		this.tokens = tokens;
	}

	preload(): void {
		const home = getOriginalArtworkAsset("home-establishing");
		if (home && !this.textures.exists(home.textureKey)) {
			this.load.svg(home.textureKey, home.path, {
				width: home.dimensions.width,
				height: home.dimensions.height,
			});
		}
		for (const asset of PRODUCTION_ASSET_MANIFEST?.residents ?? []) {
			if (this.textures.exists(asset.textureKey)) continue;
			this.load.spritesheet(asset.textureKey, asset.path, {
				frameWidth: asset.grid.frameWidth,
				frameHeight: asset.grid.frameHeight,
				startFrame: 0,
				endFrame: asset.grid.frameCount - 1,
			});
		}
	}

	create(): void {
		this.cameras.main.setBounds(0, 0, HOME_WIDTH, HOME_HEIGHT);
		this.cameras.main.setRoundPixels(true);
		this.renderState(this.bridge.getState());
		this.unsubscribe = this.bridge.subscribe((state) =>
			this.renderState(state),
		);
		this.unsubscribeControls = this.bridge.subscribeControls((control) =>
			this.handleControl(control),
		);
		this.input.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown);
		this.input.on(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove);
		this.input.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp);
		this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.handlePointerUp);
		this.input.on(Phaser.Input.Events.POINTER_WHEEL, this.handleWheel);
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.unsubscribe?.();
			this.unsubscribe = null;
			this.unsubscribeControls?.();
			this.unsubscribeControls = null;
			this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown);
			this.input.off(Phaser.Input.Events.POINTER_MOVE, this.handlePointerMove);
			this.input.off(Phaser.Input.Events.POINTER_UP, this.handlePointerUp);
			this.input.off(
				Phaser.Input.Events.POINTER_UP_OUTSIDE,
				this.handlePointerUp,
			);
			this.input.off(Phaser.Input.Events.POINTER_WHEEL, this.handleWheel);
		});
	}

	update(time: number): void {
		const state = this.bridge.getState();
		const frame = Math.floor(time / 143);
		for (const visual of this.residentVisuals) {
			if (visual.asset && visual.sprite) {
				visual.sprite.setFrame(
					selectResidentProductionFrame(visual.asset, {
						state: visual.activeSpeaker ? "speak" : visual.pose,
						reducedMotion: state.reducedMotion,
						animationStep: frame,
					}),
				);
			}
			const quietStep = state.reducedMotion
				? 0
				: (frame + visual.index * 2) % 12 === 0
					? -1
					: 0;
			visual.body.y = visual.baseY + quietStep;
		}
	}

	private renderState(state: RenderWorldState): void {
		const priorSceneId = this.lastSceneId;
		const bubble = createSpeechBubble(state);
		this.game.canvas.dataset.bubbleCount = bubble ? "1" : "0";
		this.game.canvas.dataset.bubbleLines = bubble
			? String(bubble.lines.filter(Boolean).length)
			: "0";
		this.game.canvas.dataset.bubbleText = bubble?.lines.join(" ") ?? "";
		this.game.canvas.dataset.idleMotion = state.reducedMotion ? "held" : "7fps";
		this.game.canvas.dataset.speakerMarker = "static";
		this.game.canvas.dataset.reducedMotion = String(state.reducedMotion);
		this.game.canvas.dataset.roomIds = state.rooms
			.map((room) => room.id)
			.join("|");
		this.game.canvas.dataset.residentIds = state.residents
			.map((resident) => resident.id)
			.join("|");
		this.game.canvas.dataset.residentIntents = state.residents
			.map(
				(resident) =>
					`${resident.id}:${resident.pose}:${resident.facing}:${resident.movementIntent}`,
			)
			.join("|");
		this.game.canvas.dataset.sceneId = state.scene?.id ?? "quiet";
		this.children.removeAll(true);
		this.residentVisuals = [];
		this.residentBodies.clear();
		this.drawFloor();
		for (const room of state.rooms) this.drawRoom(room, state);
		for (const [index, resident] of state.residents.entries()) {
			this.drawResident(resident, index, state);
		}
		this.game.canvas.dataset.productionAssetIds = this.residentVisuals
			.flatMap((visual) => (visual.asset ? [visual.asset.id] : []))
			.join("|");
		this.drawSpeechBubble(state);
		this.applyFollowState(state);
		this.lastSceneId = state.scene?.id ?? null;
		if (
			this.hasRendered &&
			state.scene !== null &&
			state.scene.id !== priorSceneId
		) {
			this.frameCurrentScene(state);
		}
		this.hasRendered = true;
	}

	private drawFloor(): void {
		const home = getOriginalArtworkAsset("home-establishing");
		if (home && this.textures.exists(home.textureKey)) {
			this.add
				.image(0, 0, home.textureKey)
				.setOrigin(0, 0)
				.setName("home:original-art");
			this.game.canvas.dataset.homeArtwork = home.id;
			return;
		}
		this.game.canvas.dataset.homeArtwork = "procedural-fallback";
		const graphics = this.add.graphics();
		graphics.fillStyle(colorNumber(this.tokens.colors.dominant), 1);
		graphics.fillRect(0, 0, HOME_WIDTH, HOME_HEIGHT);
		graphics.lineStyle(1, colorNumber(this.tokens.colors.border), 0.24);
		for (let x = 0; x <= HOME_WIDTH; x += this.tokens.tileSize) {
			graphics.lineBetween(x, 0, x, HOME_HEIGHT);
		}
		for (let y = 0; y <= HOME_HEIGHT; y += this.tokens.tileSize) {
			graphics.lineBetween(0, y, HOME_WIDTH, y);
		}
	}

	private drawRoom(room: RenderRoom, state: RenderWorldState): void {
		const graphics = this.add.graphics();
		const isSceneRoom = state.scene?.locationId === room.id;
		const home = getOriginalArtworkAsset("home-establishing");
		const hasOriginalHomeArtwork = Boolean(
			home && this.textures.exists(home.textureKey),
		);
		if (hasOriginalHomeArtwork) {
			if (isSceneRoom) {
				graphics.lineStyle(2, colorNumber(this.tokens.colors.text), 1);
				graphics.strokeRect(room.x, room.y, room.width, room.height);
			}
		} else {
			graphics.fillStyle(colorNumber(this.tokens.colors.secondary), 1);
			graphics.fillRect(room.x, room.y, room.width, room.height);
			graphics.lineStyle(
				isSceneRoom ? 2 : 1,
				colorNumber(
					isSceneRoom ? this.tokens.colors.text : this.tokens.colors.border,
				),
				1,
			);
			graphics.strokeRect(room.x, room.y, room.width, room.height);
			this.drawStructuralCue(graphics, room);
		}

		const roomLabel =
			room.label.length > 20
				? `${room.label.slice(0, 17).trimEnd()}...`
				: room.label;
		this.add
			.text(room.x + 8, room.y + 10, roomLabel, {
				fontFamily: "Pixelify Sans, sans-serif",
				fontSize: "10px",
				color: this.tokens.colors.text,
				backgroundColor: this.tokens.colors.dominant,
				padding: { x: 3, y: 1 },
			})
			.setResolution(1)
			.setDepth(2);
	}

	private drawStructuralCue(
		graphics: Phaser.GameObjects.Graphics,
		room: RenderRoom,
	): void {
		graphics.fillStyle(colorNumber(this.tokens.colors.muted), 0.72);
		switch (room.structuralCue) {
			case "garden":
				graphics.fillRect(room.x + 12, room.y + 40, 20, 20);
				graphics.fillRect(room.x + 72, room.y + 40, 20, 20);
				graphics.fillTriangle(
					room.x + 22,
					room.y + 28,
					room.x + 14,
					room.y + 44,
					room.x + 30,
					room.y + 44,
				);
				break;
			case "bookshelves":
				for (let offset = 0; offset < 3; offset += 1) {
					graphics.fillRect(room.x + 14 + offset * 30, room.y + 34, 20, 34);
				}
				break;
			case "hearth":
				graphics.fillRect(room.x + room.width / 2 - 24, room.y + 24, 48, 12);
				graphics.fillRect(room.x + room.width / 2 - 16, room.y + 36, 32, 18);
				graphics.fillRect(room.x + 24, room.y + room.height - 38, 40, 18);
				graphics.fillRect(
					room.x + room.width - 64,
					room.y + room.height - 38,
					40,
					18,
				);
				break;
			case "counter":
				graphics.fillRect(room.x + 12, room.y + 40, room.width - 24, 16);
				graphics.lineStyle(2, colorNumber(this.tokens.colors.text), 0.6);
				graphics.strokeCircle(room.x + room.width - 24, room.y + 32, 7);
				break;
		}
	}

	private drawResident(
		resident: RenderResident,
		index: number,
		state: RenderWorldState,
	): void {
		const isSpeaker = state.scene?.activeTurn?.speakerId === resident.id;
		const body = this.add.container(resident.x, resident.y);
		body.setName(resident.renderId);
		const asset = getResidentProductionAsset(resident);
		const loadedAsset =
			asset && this.textures.exists(asset.textureKey) ? asset : null;
		const sprite = loadedAsset
			? this.add
					.sprite(
						0,
						-2,
						loadedAsset.textureKey,
						selectResidentProductionFrame(loadedAsset, {
							state: isSpeaker ? "speak" : resident.pose,
							reducedMotion: state.reducedMotion,
							animationStep: 0,
						}),
					)
					.setOrigin(0.5, 0.5)
					.setFlipX(resident.facing === "left")
					.setName(`${resident.renderId}:production-sprite`)
			: null;
		if (sprite) body.add(sprite);
		else this.drawProceduralResident(body, resident);

		if (isSpeaker) {
			const marker = this.add.graphics();
			marker.lineStyle(2, colorNumber(this.tokens.colors.accent), 1);
			marker.strokeEllipse(0, 12, 26, 8);
			body.addAt(marker, 0);
		}

		const target = this.add
			.zone(0, -2, 44, 44)
			.setInteractive({ useHandCursor: true });
		target.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.bridge.emit({
				type: "residentSelected",
				residentId: resident.id,
				residentName: resident.name,
			});
		});
		body.add(target);
		this.residentBodies.set(resident.id, body);
		this.residentVisuals.push({
			body,
			baseY: resident.y,
			index,
			activeSpeaker: isSpeaker,
			asset: loadedAsset,
			sprite,
			pose: resident.pose,
		});
	}

	private drawProceduralResident(
		body: Phaser.GameObjects.Container,
		resident: RenderResident,
	): void {
		const pixels = this.add.graphics();
		const style = RESIDENT_VISUAL_STYLES[resident.variant];
		const headX = -Math.floor(style.headWidth / 2);
		const shoulderX = -Math.floor(style.shoulderWidth / 2);
		pixels.fillStyle(0x10131b, 1);
		pixels.fillRect(headX, -17, style.headWidth, 7);
		pixels.fillStyle(style.bodyColor, 1);
		pixels.fillRect(-6, -10, 12, style.bodyHeight);
		pixels.fillRect(shoulderX, -6, style.shoulderWidth, 7);
		pixels.fillStyle(style.accentColor, 1);
		switch (style.accessory) {
			case "waistcoat":
				pixels.fillRect(-1, -8, 2, 12);
				break;
			case "cardigan":
				pixels.fillRect(-1, -7, 2, 2);
				pixels.fillRect(-1, -2, 2, 2);
				pixels.fillRect(-1, 3, 2, 2);
				break;
			case "shawl":
				pixels.fillTriangle(-7, -6, 7, -6, 0, 2);
				break;
			case "apron":
				pixels.fillRect(-4, -4, 8, 9);
				pixels.lineStyle(1, 0x10131b, 1);
				pixels.strokeRect(-6, -15, 4, 3);
				pixels.strokeRect(2, -15, 4, 3);
				break;
			case "broad-brim":
				pixels.fillRect(-9, -18, 18, 3);
				pixels.fillRect(-5, -21, 10, 3);
				break;
			case "tabbed-satchel":
				pixels.fillRect(6, -5, 5, 8);
				pixels.fillRect(-4, -8, 2, 3);
				pixels.fillRect(0, -8, 2, 3);
				pixels.fillRect(4, -8, 2, 3);
				break;
		}
		pixels.fillStyle(0x353e52, 1);
		pixels.fillRect(-6, 5, 5, 7);
		pixels.fillRect(1, 5, 5, 7);
		body.add(pixels);
	}

	private applyFollowState(state: RenderWorldState): void {
		if (!state.followedResidentId) {
			if (this.cameraController.getState().followedResidentId) {
				this.cameraController.stopFollowing();
				this.cameras.main.stopFollow();
			}
			return;
		}
		const resident = state.residents.find(
			(candidate) => candidate.id === state.followedResidentId,
		);
		const body = this.residentBodies.get(state.followedResidentId);
		if (!resident || !body) return;
		const wasFollowing =
			this.cameraController.getState().followedResidentId === resident.id;
		const view = this.cameraController.followResident(resident);
		this.cameras.main.setZoom(view.zoom);
		this.cameras.main.startFollow(body, true, 0.12, 0.12);
		if (!wasFollowing) this.emitSettled("automatic");
	}

	private frameCurrentScene(state: RenderWorldState): void {
		if (!state.scene) return;
		const speakers = state.residents.filter((resident) =>
			state.scene?.participantIds.includes(resident.id),
		);
		const transition = this.cameraController.frameSceneSpeakers(speakers, {
			mode: state.mode,
			reducedMotion: state.reducedMotion,
			followedResidentId: state.followedResidentId,
			manualPan: state.manualPan,
		});
		if (!transition) return;
		this.game.canvas.dataset.cameraDuration = String(transition.durationMs);
		this.cameras.main.stopFollow();
		this.cameras.main.setZoom(transition.zoom);
		if (transition.durationMs === 0) {
			this.cameras.main.centerOn(transition.centerX, transition.centerY);
			this.emitSettled("automatic");
			return;
		}
		this.cameras.main.pan(
			transition.centerX,
			transition.centerY,
			transition.durationMs,
			"Quad.easeOut",
			true,
		);
		this.time.delayedCall(transition.durationMs, () =>
			this.emitSettled("automatic"),
		);
	}

	private handleControl(control: RendererControl): void {
		switch (control.type) {
			case "zoomBy": {
				this.beginManualCameraChange();
				const current = this.cameraController.getState();
				this.applyView(
					this.cameraController.setIntegerZoom(current.zoom + control.delta),
				);
				this.finishManualCameraChange();
				break;
			}
			case "panBy":
				this.beginManualCameraChange();
				this.applyView(this.cameraController.panBy(control.dx, control.dy));
				this.finishManualCameraChange();
				break;
			case "resetView":
				this.cameras.main.stopFollow();
				this.applyView(this.cameraController.resetEstablishingView());
				this.emitSettled("reset");
				break;
		}
	}

	private readonly handlePointerDown = (pointer: Phaser.Input.Pointer) => {
		this.dragPoint = { x: pointer.x, y: pointer.y };
		this.dragging = false;
	};

	private readonly handlePointerMove = (pointer: Phaser.Input.Pointer) => {
		if (!pointer.isDown || !this.dragPoint) return;
		const dx = pointer.x - this.dragPoint.x;
		const dy = pointer.y - this.dragPoint.y;
		if (Math.abs(dx) + Math.abs(dy) < 2) return;
		if (!this.dragging) this.beginManualCameraChange();
		this.dragging = true;
		const zoom = this.cameraController.getState().zoom;
		this.applyView(this.cameraController.panBy(-dx / zoom, -dy / zoom));
		this.dragPoint = { x: pointer.x, y: pointer.y };
	};

	private readonly handlePointerUp = () => {
		if (this.dragging) this.finishManualCameraChange();
		this.dragPoint = null;
		this.dragging = false;
	};

	private readonly handleWheel = (
		_pointer: Phaser.Input.Pointer,
		_gameObjects: Phaser.GameObjects.GameObject[],
		_deltaX: number,
		deltaY: number,
	) => {
		this.beginManualCameraChange();
		const current = this.cameraController.getState();
		this.applyView(
			this.cameraController.setIntegerZoom(
				current.zoom + (deltaY < 0 ? 1 : -1),
			),
		);
		this.finishManualCameraChange();
	};

	private beginManualCameraChange(): void {
		this.cameras.main.stopFollow();
		this.cameraController.stopFollowing();
		this.bridge.emit({ type: "manualPanStarted" });
	}

	private finishManualCameraChange(): void {
		this.cameraController.finishManualPan();
		this.emitSettled("manual");
	}

	private applyView(view: CameraViewState): void {
		this.cameras.main.setZoom(view.zoom);
		this.cameras.main.centerOn(view.centerX, view.centerY);
	}

	private emitSettled(reason: "manual" | "automatic" | "reset"): void {
		const view = this.cameraController.getState();
		this.game.canvas.dataset.cameraX = String(Math.round(view.centerX));
		this.game.canvas.dataset.cameraY = String(Math.round(view.centerY));
		this.game.canvas.dataset.cameraZoom = String(view.zoom);
		this.bridge.emit({
			type: "cameraSettled",
			x: view.centerX,
			y: view.centerY,
			zoom: view.zoom,
			reason,
		});
	}

	private drawSpeechBubble(state: RenderWorldState): void {
		const bubble = createSpeechBubble(state);
		if (!bubble) return;
		const speaker = state.residents.find(
			(resident) => resident.id === bubble.speakerId,
		);
		if (!speaker) return;

		const x = Phaser.Math.Clamp(speaker.x - 60, 4, HOME_WIDTH - 124);
		const y = Phaser.Math.Clamp(speaker.y - 48, 4, HOME_HEIGHT - 52);
		const graphics = this.add.graphics().setDepth(8);
		graphics.fillStyle(colorNumber(this.tokens.colors.text), 1);
		graphics.fillRect(x, y, 120, 35);
		graphics.fillTriangle(
			speaker.x - 4,
			y + 35,
			speaker.x + 5,
			y + 35,
			speaker.x,
			y + 43,
		);
		this.add
			.text(x + 6, y + 5, bubble.lines.filter(Boolean).join("\n"), {
				fontFamily: "Atkinson Hyperlegible Next, sans-serif",
				fontSize: "8px",
				lineSpacing: 2,
				color: this.tokens.colors.dominant,
			})
			.setResolution(1)
			.setDepth(9);
	}
}
