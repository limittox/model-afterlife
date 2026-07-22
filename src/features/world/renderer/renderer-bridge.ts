import type { PresentationMode } from "../client/presentation-types.ts";
import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import type {
	RendererIntent,
	RendererControl,
	RenderWorldState,
} from "./renderer-types.ts";
import { projectResidents, projectRooms } from "./world-layout.ts";

type BridgeListener = (state: RenderWorldState) => void;
type IntentHandler = (intent: RendererIntent) => void;
type ControlListener = (control: RendererControl) => void;

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

	emit(intent: RendererIntent): void {
		this.intentHandler(intent);
	}

	subscribe(listener: BridgeListener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	sendControl(control: RendererControl): void {
		for (const listener of this.controlListeners) listener(control);
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
		followedResidentId?: string | null;
		manualPan?: boolean;
	},
): RenderWorldState {
	const activeTurn = snapshot.scene?.turns.at(-1) ?? null;
	return {
		worldId: snapshot.worldId,
		logicalTick: snapshot.logicalTick,
		throughSequence: snapshot.throughSequence,
		stateHash: snapshot.stateHash,
		mode: presentation.mode,
		reducedMotion: presentation.reducedMotion,
		followedResidentId: presentation.followedResidentId ?? null,
		manualPan: presentation.manualPan ?? false,
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
