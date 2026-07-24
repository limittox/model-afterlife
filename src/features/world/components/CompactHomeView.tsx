import type { ConnectionState } from "../client/presentation-types.ts";
import type { PublicWorldSnapshot } from "../contracts/public-world.ts";

function currentLocation(snapshot: PublicWorldSnapshot): string {
	const locationId =
		snapshot.scene?.locationId ?? snapshot.quiet?.locationId ?? null;
	return (
		snapshot.rooms.find((room) => room.id === locationId)?.name ??
		"The retirement home"
	);
}

export function CompactHomeView({
	snapshot,
	connection,
}: {
	snapshot: PublicWorldSnapshot | null;
	connection: ConnectionState;
}) {
	const headingId = "compact-home-heading";

	if (!snapshot) {
		const failed = connection === "error";
		return (
			<section
				className="compact-home-view compact-home-unavailable"
				aria-labelledby={headingId}
			>
				<p className="scene-label">Static home view</p>
				<h2 id={headingId}>
					{failed ? "Home view unavailable" : "Opening the home…"}
				</h2>
				<div
					className="compact-home-snapshot compact-home-placeholder"
					role="img"
					aria-label={
						failed
							? "Static home image unavailable."
							: "Static outline of the home while it opens."
					}
					draggable={false}
				>
					<span aria-hidden="true" />
					<span aria-hidden="true" />
					<span aria-hidden="true" />
					<span aria-hidden="true" />
				</div>
				<p>
					{failed
						? "The semantic scene, transcript, navigation, and controls remain available while the establishing view is unavailable."
						: "The scene and transcript remain available while the static establishing view opens."}
				</p>
			</section>
		);
	}

	const location = currentLocation(snapshot);
	const imageLabel = snapshot.scene
		? `Static home snapshot. The current scene is in ${location}. ${snapshot.residents.length} residents are shown across ${snapshot.rooms.length} rooms.`
		: `Static home snapshot. The home is quiet in ${location}. ${snapshot.residents.length} residents are shown across ${snapshot.rooms.length} rooms.`;

	return (
		<section className="compact-home-view" aria-labelledby={headingId}>
			<p className="scene-label">Static home view · non-draggable</p>
			<h2 id={headingId}>The shared home at a glance</h2>
			<div
				className="compact-home-snapshot"
				role="img"
				aria-label={imageLabel}
				draggable={false}
				data-static-home="true"
				data-current-location={location}
			>
				{snapshot.rooms.map((room) => {
					const residentCount = snapshot.residents.filter(
						(resident) => resident.roomId === room.id,
					).length;
					const isCurrent = room.name === location;
					return (
						<span
							className={isCurrent ? "compact-room is-current" : "compact-room"}
							key={room.id}
							aria-hidden="true"
						>
							<strong>{room.name}</strong>
							<small>
								{residentCount} {residentCount === 1 ? "resident" : "residents"}
								{isCurrent ? " · current location" : ""}
							</small>
						</span>
					);
				})}
			</div>
			<nav className="resident-shortcuts" aria-label="Resident shortcuts">
				<h3>Resident profiles</h3>
				<ul>
					{snapshot.residents.map((resident) => (
						<li key={resident.id}>
							<a href={`/residents/${encodeURIComponent(resident.id)}`}>
								<span>{resident.name}</span>
								<small>{resident.role}</small>
							</a>
						</li>
					))}
				</ul>
			</nav>
		</section>
	);
}
