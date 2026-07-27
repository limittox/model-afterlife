import type { PresentationMode } from "../client/presentation-types.ts";
import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import type {
	RendererControl,
	RendererIntent,
	RenderWorldState,
} from "./renderer-types.ts";
import { projectResidents, projectRooms } from "./world-layout.ts";
import { WORLD_HEIGHT, WORLD_WIDTH } from "./world-geometry.ts";

type BridgeListener = (state: RenderWorldState) => void;
type IntentHandler = (intent: RendererIntent) => void;
type ControlListener = (control: RendererControl) => void;

function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

export function isRendererIntent(
	intent: unknown,
	state: RenderWorldState,
): intent is RendererIntent {
	if (typeof intent !== "object" || intent === null || !("type" in intent)) {
		return false;
	}

	if (intent.type === "residentSelected") {
		if (!("residentId" in intent) || !("residentName" in intent)) return false;
		return state.residents.some(
			(resident) =>
				resident.id === intent.residentId &&
				resident.name === intent.residentName,
		);
	}

	if (intent.type === "manualPanStarted") return true;
	if (intent.type !== "cameraSettled") return false;
	if (
		!("x" in intent) ||
		!("y" in intent) ||
		!("zoom" in intent) ||
		!("reason" in intent)
	) {
		return false;
	}
	return (
		isFiniteNumber(intent.x) &&
		intent.x >= 0 &&
		intent.x <= WORLD_WIDTH &&
		isFiniteNumber(intent.y) &&
		intent.y >= 0 &&
		intent.y <= WORLD_HEIGHT &&
		isFiniteNumber(intent.zoom) &&
		Number.isInteger(intent.zoom) &&
		intent.zoom >= 1 &&
		intent.zoom <= 4 &&
		["manual", "automatic", "reset"].includes(String(intent.reason))
	);
}

export function isRendererControl(
	control: unknown,
): control is RendererControl {
	if (typeof control !== "object" || control === null || !("type" in control)) {
		return false;
	}
	if (control.type === "resetView") return true;
	if (control.type === "zoomBy") {
		return "delta" in control && (control.delta === -1 || control.delta === 1);
	}
	if (control.type !== "panBy" || !("dx" in control) || !("dy" in control)) {
		return false;
	}
	return (
		isFiniteNumber(control.dx) &&
		isFiniteNumber(control.dy) &&
		Math.abs(control.dx) <= 16 &&
		Math.abs(control.dy) <= 16
	);
}

export class RendererBridge {
	private state: RenderWorldState;
	private readonly listeners = new Set<BridgeListener>();
	private readonly controlListeners = new Set<ControlListener>();
	private intentHandler: IntentHandler;

	constructor(initialState: RenderWorldState, onIntent: IntentHandler) {
		this.state = initialState;
		this.intentHandler = onIntent;
	}

	getState(): RenderWorldState {
		return this.state;
	}

	setState(state: RenderWorldState): void {
		this.state = state;
		for (const listener of this.listeners) listener(state);
	}

	setIntentHandler(onIntent: IntentHandler): void {
		this.intentHandler = onIntent;
	}

	emit(intent: unknown): boolean {
		if (!isRendererIntent(intent, this.state)) return false;
		this.intentHandler(intent);
		return true;
	}

	subscribe(listener: BridgeListener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	sendControl(control: unknown): boolean {
		if (!isRendererControl(control)) return false;
		for (const listener of this.controlListeners) listener(control);
		return true;
	}

	subscribeControls(listener: ControlListener): () => void {
		this.controlListeners.add(listener);
		return () => this.controlListeners.delete(listener);
	}

	destroy(): void {
		this.listeners.clear();
		this.controlListeners.clear();
	}
}

export function projectSnapshotToRenderState(
	snapshot: PublicWorldSnapshot,
	presentation: {
		mode: PresentationMode;
		reducedMotion: boolean;
		activeTurnIndex?: number;
		followedResidentId?: string | null;
		manualPan?: boolean;
		showSpeechBubble?: boolean;
	},
): RenderWorldState {
	const activeTurn = snapshot.scene
		? (snapshot.scene.turns[presentation.activeTurnIndex ?? 0] ??
			snapshot.scene.turns[0] ??
			null)
		: null;
	return {
		worldId: snapshot.worldId,
		logicalTick: snapshot.logicalTick,
		throughSequence: snapshot.throughSequence,
		stateHash: snapshot.stateHash,
		mode: presentation.mode,
		reducedMotion: presentation.reducedMotion,
		followedResidentId: presentation.followedResidentId ?? null,
		manualPan: presentation.manualPan ?? false,
		showSpeechBubble: presentation.showSpeechBubble ?? true,
		rooms: projectRooms(snapshot.rooms),
		residents: projectResidents(snapshot.residents),
		scene: snapshot.scene
			? {
					id: snapshot.scene.id,
					locationId: snapshot.scene.locationId,
					participantIds: [...snapshot.scene.participantIds],
					activeTurn: activeTurn
						? {
								...activeTurn,
								speakerRenderId: `resident:${activeTurn.speakerId}`,
							}
						: null,
				}
			: null,
	};
}
