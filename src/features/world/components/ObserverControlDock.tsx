import type {
	ConnectionState,
	PresentationMode,
} from "../client/presentation-types.ts";
import { ResidentFocusChip } from "./ResidentFocusChip.tsx";

export function ObserverControlDock({
	hasSnapshot,
	connection,
	mode,
	followedResidentName,
	zoom,
	onZoomIn,
	onZoomOut,
	onReset,
	onPause,
	onResume,
	onJumpLive,
	onUnfollow,
}: {
	hasSnapshot: boolean;
	connection: ConnectionState;
	mode: PresentationMode;
	followedResidentName: string | null;
	zoom: number;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
	onPause: () => void;
	onResume: () => void;
	onJumpLive: () => void;
	onUnfollow: () => void;
}) {
	const sceneControlsDisabled = !hasSnapshot || connection !== "connected";
	const cameraControlsDisabled = !hasSnapshot;
	const disabledReason = !hasSnapshot
		? "Controls are unavailable until the home opens."
		: "Scene controls are unavailable while the home reconnects.";

	return (
		<nav className="observer-control-dock" aria-label="Observer controls">
			<span className="visually-hidden" id="control-disabled-reason">
				{disabledReason}
			</span>
			<fieldset className="dock-group world-controls">
				<legend className="visually-hidden">View controls</legend>
				<button
					type="button"
					onClick={onZoomOut}
					disabled={cameraControlsDisabled}
					aria-describedby={
						cameraControlsDisabled ? "control-disabled-reason" : undefined
					}
				>
					Zoom out
				</button>
				<output className="zoom-readout" aria-label={`Zoom ${zoom} percent`}>
					{zoom}%
				</output>
				<button
					type="button"
					onClick={onZoomIn}
					disabled={cameraControlsDisabled}
					aria-describedby={
						cameraControlsDisabled ? "control-disabled-reason" : undefined
					}
				>
					Zoom in
				</button>
				<button
					type="button"
					onClick={onReset}
					disabled={cameraControlsDisabled}
					aria-describedby={
						cameraControlsDisabled ? "control-disabled-reason" : undefined
					}
				>
					Reset view
				</button>
			</fieldset>

			{followedResidentName ? (
				<ResidentFocusChip
					residentName={followedResidentName}
					onUnfollow={onUnfollow}
				/>
			) : null}

			<fieldset className="dock-group presentation-controls">
				<legend className="visually-hidden">Presentation controls</legend>
				{mode === "paused" ? (
					<button
						type="button"
						onClick={onResume}
						disabled={sceneControlsDisabled}
						aria-describedby={
							sceneControlsDisabled ? "control-disabled-reason" : undefined
						}
					>
						Resume presentation
					</button>
				) : (
					<button
						type="button"
						onClick={onPause}
						disabled={sceneControlsDisabled}
						aria-describedby={
							sceneControlsDisabled ? "control-disabled-reason" : undefined
						}
					>
						Pause presentation
					</button>
				)}
				<button
					className="jump-live"
					type="button"
					onClick={onJumpLive}
					disabled={!hasSnapshot}
					aria-describedby={
						!hasSnapshot ? "control-disabled-reason" : undefined
					}
				>
					Jump to live
				</button>
			</fieldset>
		</nav>
	);
}
