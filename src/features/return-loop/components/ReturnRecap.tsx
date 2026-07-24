import type { ReturnRecapResponse } from "../../publication/contracts/public-publication.ts";
import { RecapBeat } from "./RecapBeat.tsx";

export type ReturnRecapViewState =
	| { kind: "loading" }
	| { kind: "error"; message: string }
	| { kind: "ready"; recap: ReturnRecapResponse };

export function ReturnRecap({
	state,
	onRetry,
	onReviewLater,
	onDismiss,
	onJumpLive,
}: {
	state: ReturnRecapViewState;
	onRetry: () => void;
	onReviewLater: () => void;
	onDismiss: () => void;
	onJumpLive: () => void;
}) {
	if (state.kind === "loading") {
		return (
			<aside id="return-recap" className="return-recap" aria-live="polite">
				<p role="status">Checking what changed since your last visit…</p>
			</aside>
		);
	}
	if (state.kind === "error") {
		return (
			<aside id="return-recap" className="return-recap" aria-live="polite">
				<h2>Since your last visit</h2>
				<p>{state.message}</p>
				<button type="button" onClick={onRetry}>
					Try recap again
				</button>
			</aside>
		);
	}
	if (state.recap.beats.length === 0) return null;

	return (
		<aside
			id="return-recap"
			className="return-recap"
			aria-labelledby="return-recap-heading"
		>
			<header>
				<h2 id="return-recap-heading">Since your last visit</h2>
				{state.recap.partial ? (
					<p role="status">
						Some canonical scenes were unavailable. This recap includes only
						complete developments.
					</p>
				) : null}
			</header>
			<ol>
				{state.recap.beats.map((beat) => (
					<RecapBeat key={beat.revisionId} beat={beat} />
				))}
			</ol>
			<footer>
				<h3>Current situation</h3>
				<p>
					Home day {state.recap.currentSituation.homeDay} ·{" "}
					{state.recap.currentSituation.homeTime} ·{" "}
					{state.recap.currentSituation.dayPeriod}.{" "}
					{state.recap.currentSituation.description}
				</p>
				<div className="recap-actions">
					<button type="button" onClick={onReviewLater}>
						Review later
					</button>
					<button type="button" onClick={onDismiss}>
						Dismiss recap
					</button>
					<button type="button" onClick={onJumpLive}>
						Jump to live
					</button>
				</div>
			</footer>
		</aside>
	);
}
