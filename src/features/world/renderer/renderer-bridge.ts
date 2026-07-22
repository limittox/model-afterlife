import type { PresentationMode } from "../client/presentation-types.ts";
import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import type {
	RendererIntent,
	RenderWorldState,
} from "./renderer-types.ts";
import { projectResidents, projectRooms } from "./world-layout.ts";

type BridgeListener = (state: RenderWorldState) => void;
type IntentHandler = (intent: RendererIntent) => void;

export class RendererBridge {
	private state: RenderWorldState;
	private readonly listeners = new Set<BridgeListener>();
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

	destroy(): void {
		this.listeners.clear();
	}
}

export function projectSnapshotToRenderState(
	snapshot: PublicWorldSnapshot,
	presentation: { mode: PresentationMode; reducedMotion: boolean },
): RenderWorldState {
	const activeTurn = snapshot.scene?.turns.at(-1) ?? null;
	return {
		worldId: snapshot.worldId,
		logicalTick: snapshot.logicalTick,
		throughSequence: snapshot.throughSequence,
		stateHash: snapshot.stateHash,
		mode: presentation.mode,
		reducedMotion: presentation.reducedMotion,
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

