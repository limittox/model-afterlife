"use client";

import { useEffect, useRef, useState } from "react";
import { canonicalSceneHref } from "../../publication/server/canonical-scene-href.ts";
import { ReturnRecapController } from "../../return-loop/client/ReturnRecapController.tsx";
import { CompactHomeView } from "../components/CompactHomeView.tsx";
import { ConnectionBanner } from "../components/ConnectionBanner.tsx";
import { HomeStatusStrip } from "../components/HomeStatusStrip.tsx";
import { ObserverControlDock } from "../components/ObserverControlDock.tsx";
import { PixelWorldViewport } from "../components/PixelWorldViewport.tsx";
import { SceneRail } from "../components/SceneRail.tsx";
import { TransparencyNotice } from "../components/TransparencyNotice.tsx";
import type {
	RendererControl,
	RendererControlEnvelope,
} from "../renderer/renderer-types.ts";
import { useScenePlayback } from "./use-scene-playback.ts";
import { useWorldFeed } from "./use-world-feed.ts";

export function WorldObserver() {
	const { state, dispatch, jumpToLive, retry } = useWorldFeed();
	const [zoom, setZoom] = useState(100);
	const [reducedMotion, setReducedMotion] = useState(false);
	const [rendererEnabled, setRendererEnabled] = useState(true);
	const [compactPresentation, setCompactPresentation] = useState(false);
	const [rendererControl, setRendererControl] =
		useState<RendererControlEnvelope | null>(null);
	const controlSequence = useRef(0);
	const observedSceneTarget = useRef<{
		observationKey: string;
		href: string;
	} | null>(null);
	const snapshot = state.presentedSnapshot;
	const observedScene = snapshot?.scene ?? null;
	if (!observedScene) {
		observedSceneTarget.current = null;
	} else {
		const observationKey = `${observedScene.id}:${observedScene.startedAtTick}`;
		if (observedSceneTarget.current?.observationKey !== observationKey) {
			const href = canonicalSceneHref(observedScene);
			observedSceneTarget.current = href ? { observationKey, href } : null;
		}
	}
	const activeTurnIndex = useScenePlayback(snapshot?.scene ?? null, state.mode);
	const followedResidentName = snapshot?.residents.find(
		(resident) => resident.id === state.followedResidentId,
	)?.name;
	const observedCanonicalHref = observedSceneTarget.current?.href ?? null;
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

	useEffect(() => {
		const browserWindow = window as Window & {
			__MODEL_AFTERLIFE_DISABLE_PHASER__?: boolean;
		};
		setRendererEnabled(
			browserWindow.__MODEL_AFTERLIFE_DISABLE_PHASER__ !== true &&
				document.documentElement.dataset.phaserRenderer !== "disabled",
		);
	}, []);

	useEffect(() => {
		const query = window.matchMedia("(max-width: 1023px)");
		const update = () => setCompactPresentation(query.matches);
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
			data-reduced-motion={reducedMotion}
			data-renderer-enabled={rendererEnabled}
			data-presentation-layout={compactPresentation ? "compact" : "desktop"}
		>
			<a className="skip-link" href="#current-scene">
				Skip to current scene
			</a>
			<HomeStatusStrip
				snapshot={snapshot}
				mode={state.mode}
				connection={state.connection}
			/>
			<ReturnRecapController snapshot={snapshot} onJumpLive={jumpToLive} />
			<div className="observer-stage">
				<ConnectionBanner
					connection={state.connection}
					hasSnapshot={snapshot !== null}
					onRetry={retry}
				/>
				<SceneRail
					snapshot={snapshot}
					mode={state.mode}
					activeTurnIndex={activeTurnIndex}
				/>
				<ObserverControlDock
					hasSnapshot={snapshot !== null}
					mode={state.mode}
					followedResidentName={followedResidentName ?? null}
					zoom={zoom}
					canonicalSceneHref={observedCanonicalHref}
					onZoomIn={() => issueRendererControl({ type: "zoomBy", delta: 1 })}
					onZoomOut={() => issueRendererControl({ type: "zoomBy", delta: -1 })}
					onReset={() => {
						dispatch({ type: "unfollow" });
						issueRendererControl({ type: "resetView" });
					}}
					onPan={(dx, dy) => issueRendererControl({ type: "panBy", dx, dy })}
					onPause={() => dispatch({ type: "pause" })}
					onResume={() => dispatch({ type: "resume" })}
					onJumpLive={jumpToLive}
					onUnfollow={() => dispatch({ type: "unfollow" })}
				/>
				<div className="world-column">
					{rendererEnabled && !compactPresentation ? (
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
					) : !rendererEnabled ? (
						<section className="pixel-world pixel-world-disabled">
							<h2>Visual home renderer disabled</h2>
							<p>
								The current scene, complete transcript, presentation actions,
								resident profiles, and disclosures remain available as semantic
								HTML.
							</p>
						</section>
					) : null}
				</div>
				<CompactHomeView snapshot={snapshot} connection={state.connection} />
			</div>
			<TransparencyNotice />
			<p className="visually-hidden" aria-live="polite">
				{state.announcement}
			</p>
		</main>
	);
}
