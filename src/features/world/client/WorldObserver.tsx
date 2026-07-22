"use client";

import { useEffect, useRef, useState } from "react";
import { ConnectionBanner } from "../components/ConnectionBanner.tsx";
import { HomeStatusStrip } from "../components/HomeStatusStrip.tsx";
import { ObserverControlDock } from "../components/ObserverControlDock.tsx";
import { PixelWorldViewport } from "../components/PixelWorldViewport.tsx";
import { SceneRail } from "../components/SceneRail.tsx";
import { TransparencyNotice } from "../components/TransparencyNotice.tsx";
import { useWorldFeed } from "./use-world-feed.ts";
import { useScenePlayback } from "./use-scene-playback.ts";
import type {
	RendererControl,
	RendererControlEnvelope,
} from "../renderer/renderer-types.ts";

export function WorldObserver() {
	const { state, dispatch, jumpToLive, retry } = useWorldFeed();
	const [zoom, setZoom] = useState(100);
	const [reducedMotion, setReducedMotion] = useState(false);
	const [rendererControl, setRendererControl] =
		useState<RendererControlEnvelope | null>(null);
	const controlSequence = useRef(0);
	const snapshot = state.presentedSnapshot;
	const activeTurnIndex = useScenePlayback(snapshot?.scene ?? null, state.mode);
	const followedResidentName = snapshot?.residents.find(
		(resident) => resident.id === state.followedResidentId,
	)?.name;
	const issueRendererControl = (control: RendererControl) => {
		controlSequence.current += 1;
		setRendererControl({ sequence: controlSequence.current, control });
	};

	useEffect(() => {
		if (!state.announcement) return;
		const timeout = window.setTimeout(
			() => dispatch({ type: "clear-announcement" }),
			2_500,
		);
		return () => window.clearTimeout(timeout);
	}, [dispatch, state.announcement]);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReducedMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	return (
		<main
			className="observer-shell"
			data-acquisition-cursor={state.acquisitionCursor}
			data-presentation-cursor={state.presentationCursor}
			data-presentation-mode={state.mode}
		>
			<HomeStatusStrip
				snapshot={snapshot}
				mode={state.mode}
				connection={state.connection}
			/>
			<TransparencyNotice />
			<p className="desktop-notice" role="note">
				For the full home view and camera controls, visit on a wider screen.
			</p>
			<div className="observer-stage">
				<div className="world-column">
					<ConnectionBanner
						connection={state.connection}
						hasSnapshot={snapshot !== null}
						onRetry={retry}
					/>
					<PixelWorldViewport
						snapshot={snapshot}
						followedResidentId={state.followedResidentId}
						mode={state.mode}
						reducedMotion={reducedMotion}
						manualPan={state.manualPan}
						connection={state.connection}
						activeTurnIndex={activeTurnIndex}
						rendererControl={rendererControl}
						onFollow={(residentId, residentName) =>
							dispatch({ type: "follow", residentId, residentName })
						}
						onManualPan={() => dispatch({ type: "manual-pan-started" })}
						onPanBy={(dx, dy) =>
							issueRendererControl({ type: "panBy", dx, dy })
						}
						onCameraSettled={(intent) => {
							setZoom(intent.zoom * 100);
							dispatch({
								type: "camera-settled",
								announcement:
									intent.reason === "automatic" && reducedMotion
										? "Current scene framed without motion."
										: null,
							});
						}}
					/>
				</div>
				<SceneRail
					snapshot={snapshot}
					mode={state.mode}
					activeTurnIndex={activeTurnIndex}
				/>
				<ObserverControlDock
					hasSnapshot={snapshot !== null}
					connection={state.connection}
					mode={state.mode}
					followedResidentName={followedResidentName ?? null}
					zoom={zoom}
					onZoomIn={() => issueRendererControl({ type: "zoomBy", delta: 1 })}
					onZoomOut={() => issueRendererControl({ type: "zoomBy", delta: -1 })}
					onReset={() => {
						dispatch({ type: "unfollow" });
						issueRendererControl({ type: "resetView" });
					}}
					onPan={(dx, dy) =>
						issueRendererControl({ type: "panBy", dx, dy })
					}
					onPause={() => dispatch({ type: "pause" })}
					onResume={() => dispatch({ type: "resume" })}
					onJumpLive={jumpToLive}
					onUnfollow={() => dispatch({ type: "unfollow" })}
				/>
			</div>
			<p className="visually-hidden" aria-live="polite">
				{state.announcement}
			</p>
		</main>
	);
}
