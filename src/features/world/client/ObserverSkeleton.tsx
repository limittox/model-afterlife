"use client";

import { useState } from "react";
import {
	PublicWorldSnapshotSchema,
	type PublicWorldSnapshot,
} from "../contracts/public-world";

export type ObserverPresentationState = {
	mode: "live" | "paused";
	snapshot: PublicWorldSnapshot;
};

export type ObserverPresentationAction =
	| { type: "pause" }
	| { type: "resume" }
	| { type: "jump-live"; snapshot: PublicWorldSnapshot };

export function reduceObserverPresentation(
	state: ObserverPresentationState,
	action: ObserverPresentationAction,
): ObserverPresentationState {
	switch (action.type) {
		case "pause":
			return { ...state, mode: "paused" };
		case "resume":
			return { ...state, mode: "live" };
		case "jump-live":
			return { mode: "live", snapshot: action.snapshot };
	}
}

type ObserverSkeletonProps = {
	initialSnapshot: PublicWorldSnapshot;
};

export function ObserverSkeleton({ initialSnapshot }: ObserverSkeletonProps) {
	const [presentation, setPresentation] = useState<ObserverPresentationState>({
		mode: "live",
		snapshot: initialSnapshot,
	});
	const [connectionMessage, setConnectionMessage] = useState<string | null>(
		null,
	);
	const [isJumping, setIsJumping] = useState(false);

	const { snapshot } = presentation;
	const locationId =
		snapshot.scene?.locationId ?? snapshot.quiet?.locationId ?? "common-room";
	const location =
		snapshot.rooms.find((room) => room.id === locationId)?.name ??
		"The retirement home";

	function dispatch(action: ObserverPresentationAction) {
		setPresentation((current) => reduceObserverPresentation(current, action));
	}

	async function jumpToLive() {
		setIsJumping(true);
		setConnectionMessage(null);

		try {
			const response = await fetch("/api/world/snapshot", {
				method: "GET",
				cache: "no-store",
			});
			if (!response.ok) {
				throw new Error(`Snapshot request failed with ${response.status}.`);
			}

			const liveSnapshot = PublicWorldSnapshotSchema.parse(
				await response.json(),
			);
			dispatch({ type: "jump-live", snapshot: liveSnapshot });
			setConnectionMessage("Returned to the latest shared moment.");
		} catch {
			setConnectionMessage(
				"Live updates are unavailable. The last valid shared moment remains visible.",
			);
		} finally {
			setIsJumping(false);
		}
	}

	return (
		<main className="observer-shell">
			<header className="observer-header">
				<div>
					<p className="eyebrow">A quiet corner of the internet</p>
					<h1>Model Afterlife</h1>
				</div>
				<dl className="world-status" aria-label="Shared home status">
					<div>
						<dt>Home time</dt>
						<dd>
							{snapshot.homeTime} · {snapshot.dayPeriod}
						</dd>
					</div>
					<div>
						<dt>Location</dt>
						<dd>{location}</dd>
					</div>
					<div>
						<dt>Presentation</dt>
						<dd className="live-state">
							{presentation.mode === "live" ? "Live" : "Paused"}
						</dd>
					</div>
				</dl>
			</header>

			<section className="home-window" aria-labelledby="home-window-title">
				<div className="home-window-copy">
					<p className="eyebrow">Shared world · tick {snapshot.logicalTick}</p>
					<h2 id="home-window-title">Morning in the Common Room</h2>
					<p>
						{snapshot.quiet?.message ??
							snapshot.scene?.premise ??
							"The current shared moment is ready."}
					</p>
				</div>
				<ul className="resident-row" aria-label="Residents currently at home">
					{snapshot.residents.map((resident) => (
						<li className="resident-card" key={resident.id}>
							<span className="resident-pixel" aria-hidden="true" />
							<div>
								<h3>{resident.name}</h3>
								<p>{resident.activity}</p>
							</div>
						</li>
					))}
				</ul>
			</section>

			<footer className="observer-dock">
				<p className="local-note">These controls affect only your view.</p>
				<div className="control-group">
					{presentation.mode === "live" ? (
						<button type="button" onClick={() => dispatch({ type: "pause" })}>
							Pause presentation
						</button>
					) : (
						<button type="button" onClick={() => dispatch({ type: "resume" })}>
							Resume presentation
						</button>
					)}
					<button type="button" onClick={jumpToLive} disabled={isJumping}>
						{isJumping ? "Returning…" : "Jump to live"}
					</button>
				</div>
				<p className="connection-message" aria-live="polite">
					{connectionMessage}
				</p>
			</footer>
		</main>
	);
}
