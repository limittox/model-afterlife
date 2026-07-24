import type { PresentationMode } from "../client/presentation-types.ts";
import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import { DialogueTranscript } from "./DialogueTranscript.tsx";
import { SceneCard } from "./SceneCard.tsx";

export function SceneRail({
	snapshot,
	mode,
	activeTurnIndex,
}: {
	snapshot: PublicWorldSnapshot | null;
	mode: PresentationMode;
	activeTurnIndex: number | null;
}) {
	if (!snapshot) {
		return (
			<aside
				className="scene-rail scene-rail-loading"
				id="current-scene"
				aria-label="Current scene"
			>
				<a className="scene-focus-target" href="#observer-controls">
					Scene status. Continue to observer controls
				</a>
				<div>
					<p className="scene-label">Current scene</p>
					<h2>Opening the home…</h2>
				</div>
				<div className="scene-space" aria-hidden="true" />
			</aside>
		);
	}

	if (snapshot.scene === null) {
		const unavailable = snapshot.quiet?.reason === "scene-unavailable";
		return (
			<aside
				className="scene-rail"
				id="current-scene"
				aria-label="Current scene"
			>
				<a className="scene-focus-target" href="#observer-controls">
					Scene status. Continue to observer controls
				</a>
				<div className="quiet-state">
					<p className="scene-label">Current scene</p>
					<h2>{unavailable ? "Scene unavailable" : "The home is quiet"}</h2>
					<p>
						{unavailable
							? "This scene is unavailable. The home is continuing with quiet routines."
							: "No scene is playing. Residents are carrying on with their day. Stay and watch for the next scene."}
					</p>
				</div>
			</aside>
		);
	}

	return (
		<aside className="scene-rail" id="current-scene" aria-label="Current scene">
			<a className="scene-focus-target" href="#observer-controls">
				Scene transcript. Continue to observer controls
			</a>
			<SceneCard
				scene={snapshot.scene}
				snapshot={snapshot}
				activeTurnIndex={activeTurnIndex ?? 0}
			/>
			<div className="transcript-heading">
				<h2>Dialogue</h2>
				<p>
					{mode === "paused" ? "Paused for reading" : "Complete transcript"}
				</p>
			</div>
			<DialogueTranscript
				scene={snapshot.scene}
				residents={snapshot.residents}
				activeTurnIndex={activeTurnIndex ?? 0}
			/>
		</aside>
	);
}
