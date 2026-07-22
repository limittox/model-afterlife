import Phaser from "phaser";
import { createSpeechBubble } from "./SpeechBubbleLayer.ts";
import type { RendererBridge } from "./renderer-bridge.ts";
import type {
	PresentationTokens,
	RenderResident,
	RenderRoom,
	RenderWorldState,
} from "./renderer-types.ts";
import { HOME_HEIGHT, HOME_WIDTH } from "./world-layout.ts";

type ResidentVisual = {
	body: Phaser.GameObjects.Container;
	baseY: number;
	index: number;
};

function colorNumber(hex: string): number {
	return Number.parseInt(hex.slice(1), 16);
}

export class HomeScene extends Phaser.Scene {
	private readonly bridge: RendererBridge;
	private readonly tokens: PresentationTokens;
	private unsubscribe: (() => void) | null = null;
	private residentVisuals: ResidentVisual[] = [];

	constructor(bridge: RendererBridge, tokens: PresentationTokens) {
		super({ key: "HomeScene" });
		this.bridge = bridge;
		this.tokens = tokens;
	}

	create(): void {
		this.cameras.main.setBounds(0, 0, HOME_WIDTH, HOME_HEIGHT);
		this.cameras.main.setRoundPixels(true);
		this.renderState(this.bridge.getState());
		this.unsubscribe = this.bridge.subscribe((state) => this.renderState(state));
		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.unsubscribe?.();
			this.unsubscribe = null;
		});
	}

	update(time: number): void {
		const state = this.bridge.getState();
		const frame = Math.floor(time / 143);
		for (const visual of this.residentVisuals) {
			const quietStep = state.reducedMotion
				? 0
				: (frame + visual.index * 2) % 12 === 0
					? -1
					: 0;
			visual.body.y = visual.baseY + quietStep;
		}
	}

	private renderState(state: RenderWorldState): void {
		this.children.removeAll(true);
		this.residentVisuals = [];
		this.drawFloor();
		for (const room of state.rooms) this.drawRoom(room, state);
		for (const [index, resident] of state.residents.entries()) {
			this.drawResident(resident, index, state);
		}
		this.drawSpeechBubble(state);
	}

	private drawFloor(): void {
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

		const roomLabel =
			room.label.length > 20 ? `${room.label.slice(0, 19).trimEnd()}â€¦` : room.label;
		this.add
			.text(room.x + 8, room.y + 6, roomLabel, {
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
				graphics.fillRect(room.x + room.width - 64, room.y + room.height - 38, 40, 18);
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

		const pixels = this.add.graphics();
		const bodyColor = [0x8796a5, 0xa48f78, 0x718c80, 0x8c7898][
			resident.variant
		];
		pixels.fillStyle(0x10131b, 1);
		pixels.fillRect(-7, -17, 14, 7);
		pixels.fillStyle(bodyColor, 1);
		pixels.fillRect(-6, -10, 12, 15);
		pixels.fillRect(-8, -6, 16, 7);
		pixels.fillStyle(0x353e52, 1);
		pixels.fillRect(-6, 5, 5, 7);
		pixels.fillRect(1, 5, 5, 7);
		body.add(pixels);

		if (isSpeaker) {
			const marker = this.add.graphics();
			marker.lineStyle(2, colorNumber(this.tokens.colors.accent), 1);
			marker.strokeEllipse(0, 12, 26, 8);
			body.addAt(marker, 0);
		}

		const target = this.add
			.zone(0, -2, 32, 44)
			.setInteractive({ useHandCursor: true });
		target.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.bridge.emit({
				type: "residentSelected",
				residentId: resident.id,
				residentName: resident.name,
			});
		});
		body.add(target);
		this.residentVisuals.push({ body, baseY: resident.y, index });
	}

	private drawSpeechBubble(state: RenderWorldState): void {
		const bubble = createSpeechBubble(state);
		if (!bubble) return;
		const speaker = state.residents.find(
			(resident) => resident.id === bubble.speakerId,
		);
		if (!speaker) return;

		const x = Phaser.Math.Clamp(speaker.x - 60, 4, HOME_WIDTH - 124);
		const y = Phaser.Math.Clamp(speaker.y - 72, 4, HOME_HEIGHT - 52);
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
