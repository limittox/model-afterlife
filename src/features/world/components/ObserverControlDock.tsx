import { ShareSceneActions } from "../../publication/client/ShareSceneActions.tsx";
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
	canonicalSceneHref,
	onZoomIn,
	onZoomOut,
	onReset,
	onPan,
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
	canonicalSceneHref: string | null;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
	onPan: (dx: number, dy: number) => void;
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
		<nav
			className="observer-control-dock"
			id="observer-controls"
			aria-label="Observer controls"
		>
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
				{[
					["Pan left", "<", -16, 0],
					["Pan up", "^", 0, -16],
					["Pan down", "v", 0, 16],
					["Pan right", ">", 16, 0],
				].map(([label, icon, dx, dy]) => (
					<button
						className="pan-button"
						type="button"
						key={String(label)}
						onClick={() => onPan(Number(dx), Number(dy))}
						disabled={cameraControlsDisabled}
						aria-label={String(label)}
						title={String(label)}
						aria-describedby={
							cameraControlsDisabled ? "control-disabled-reason" : undefined
						}
					>
						<span aria-hidden="true">{icon}</span>
					</button>
				))}
			</fieldset>

			{followedResidentName ? (
				<ResidentFocusChip
					residentName={followedResidentName}
					onUnfollow={onUnfollow}
				/>
			) : null}

			<fieldset className="dock-group presentation-controls">
				<legend className="visually-hidden">Presentation controls</legend>
				<button
					type="button"
					onClick={mode === "paused" ? onResume : onPause}
					disabled={sceneControlsDisabled}
					aria-describedby={
						sceneControlsDisabled ? "control-disabled-reason" : undefined
					}
				>
					{mode === "paused" ? "Resume presentation" : "Pause presentation"}
				</button>
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
			<ShareSceneActions canonicalHref={canonicalSceneHref} />
		</nav>
	);
}
