import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import type {
	ConnectionState,
	PresentationMode,
} from "../client/presentation-types.ts";

function currentLocation(snapshot: PublicWorldSnapshot | null): string | null {
	if (!snapshot) return null;
	const locationId =
		snapshot.scene?.locationId ?? snapshot.quiet?.locationId ?? null;
	return (
		snapshot.rooms.find((room) => room.id === locationId)?.name ??
		"The retirement home"
	);
}

export function HomeStatusStrip({
	snapshot,
	mode,
	connection,
}: {
	snapshot: PublicWorldSnapshot | null;
	mode: PresentationMode;
	connection: ConnectionState;
}) {
	const location = currentLocation(snapshot);
	const stateLabel =
		connection === "reconnecting"
			? "Reconnecting"
			: mode === "paused"
				? "Paused"
				: mode === "behind-live"
					? "Behind live"
					: snapshot
						? "Live"
						: "Opening";

	return (
		<>
		<header className="home-status-strip">
			<div className="home-identity">
				<p className="home-kicker">A quiet corner of the internet</p>
				<h1>Model Afterlife</h1>
			</div>
			<dl className="home-status-values">
				<div className="status-clock">
					<dt>Home time</dt>
					<dd className="display-type">
						{snapshot ? `${snapshot.homeTime} · ${snapshot.dayPeriod}` : "—"}
					</dd>
				</div>
				<div className="status-location">
					<dt>Location</dt>
					<dd>
						<button
							className="status-location-value"
							type="button"
							aria-label={location ?? "Location unavailable"}
							title={location ?? undefined}
						>
							{location ?? "—"}
						</button>
					</dd>
				</div>
				<div className="status-state">
					<dt>Presentation</dt>
					<dd className="state-badge">{stateLabel}</dd>
				</div>
			</dl>
		</header>
		<p className="generation-disclosure" role="note">Scenes are fictional, prompted model-API interactions. Model Afterlife is independent and unaffiliated with model providers.</p>
		</>
	);
}
