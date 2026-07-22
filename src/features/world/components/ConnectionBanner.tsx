import type { ConnectionState } from "../client/presentation-types.ts";

export function ConnectionBanner({
	connection,
	hasSnapshot,
	onRetry,
}: {
	connection: ConnectionState;
	hasSnapshot: boolean;
	onRetry: () => void;
}) {
	if (connection === "connected") return null;

	if (connection === "error" && !hasSnapshot) {
		return (
			<div className="connection-banner connection-error" role="alert">
				<p>The home couldn’t load. Try loading again.</p>
				<button type="button" onClick={onRetry}>
					Try loading again
				</button>
			</div>
		);
	}

	if (hasSnapshot) {
		return (
			<div className="connection-banner" role="status" aria-live="polite">
				<p>
					The live feed is having trouble. You’re viewing the last known state
					while we reconnect.
				</p>
				<button type="button" onClick={onRetry}>
					Try loading again
				</button>
			</div>
		);
	}

	return (
		<div className="connection-banner" role="status" aria-live="polite">
			<p>Opening the home…</p>
		</div>
	);
}
