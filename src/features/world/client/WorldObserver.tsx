"use client";

import { useEffect, useState } from "react";
import { ConnectionBanner } from "../components/ConnectionBanner.tsx";
import { HomeStatusStrip } from "../components/HomeStatusStrip.tsx";
import { ObserverControlDock } from "../components/ObserverControlDock.tsx";
import { PixelWorldViewport } from "../components/PixelWorldViewport.tsx";
import { SceneRail } from "../components/SceneRail.tsx";
import { useWorldFeed } from "./use-world-feed.ts";

export function WorldObserver() {
	const { state, dispatch, jumpToLive, retry } = useWorldFeed();
	const [zoom, setZoom] = useState(100);
	const snapshot = state.presentedSnapshot;
	const followedResidentName = snapshot?.residents.find(
		(resident) => resident.id === state.followedResidentId,
	)?.name;

	useEffect(() => {
		if (!state.announcement) return;
		const timeout = window.setTimeout(
			() => dispatch({ type: "clear-announcement" }),
			2_500,
		);
		return () => window.clearTimeout(timeout);
	}, [dispatch, state.announcement]);

	return (
		<main className="observer-shell">
			<HomeStatusStrip
				snapshot={snapshot}
				mode={state.mode}
				connection={state.connection}
			/>
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
						onFollow={(residentId, residentName) =>
							dispatch({ type: "follow", residentId, residentName })
						}
						onManualPan={() => dispatch({ type: "manual-pan-started" })}
					/>
					<ObserverControlDock
						hasSnapshot={snapshot !== null}
						connection={state.connection}
						mode={state.mode}
						followedResidentName={followedResidentName ?? null}
						zoom={zoom}
						onZoomIn={() => setZoom((value) => Math.min(value + 25, 200))}
						onZoomOut={() => setZoom((value) => Math.max(value - 25, 50))}
						onReset={() => setZoom(100)}
						onPause={() => dispatch({ type: "pause" })}
						onResume={() => dispatch({ type: "resume" })}
						onJumpLive={jumpToLive}
						onUnfollow={() => dispatch({ type: "unfollow" })}
					/>
				</div>
				<SceneRail snapshot={snapshot} mode={state.mode} />
			</div>
			<p className="visually-hidden" aria-live="polite">
				{state.announcement}
			</p>
		</main>
	);
}
