import type { PublicWorldSnapshot } from "../contracts/public-world.ts";

export function PixelWorldViewport({
	snapshot,
	followedResidentId,
	onFollow,
	onManualPan,
}: {
	snapshot: PublicWorldSnapshot | null;
	followedResidentId: string | null;
	onFollow: (residentId: string, residentName: string) => void;
	onManualPan: () => void;
}) {
	if (!snapshot) {
		return (
			<section className="pixel-world pixel-world-empty" aria-label="Home view">
				<div className="home-silhouette" aria-hidden="true">
					<span />
					<span />
					<span />
					<span />
				</div>
				<h2>Opening the home…</h2>
				<p>The shared home will appear here when it is ready.</p>
			</section>
		);
	}

	const primaryLocation =
		snapshot.scene?.locationId ?? snapshot.quiet?.locationId ?? null;

	return (
		<section
			className="pixel-world"
			aria-labelledby="home-view-heading"
			onPointerDown={onManualPan}
		>
			<div className="world-summary">
				<p className="scene-label">Shared home · tick {snapshot.logicalTick}</p>
				<h2 id="home-view-heading">A compact home, quietly carrying on</h2>
				<p>
					Four named rooms, {snapshot.residents.length} residents, and{" "}
					{snapshot.scene ? "one primary scene" : "quiet routines"} are in view.
				</p>
				<button
					className="world-keyboard-target"
					type="button"
					onKeyDown={(event) => {
						if (
							[
								"ArrowUp",
								"ArrowDown",
								"ArrowLeft",
								"ArrowRight",
								"w",
								"a",
								"s",
								"d",
							].includes(event.key)
						) {
							event.preventDefault();
							onManualPan();
						}
					}}
				>
					Explore home view with keyboard
				</button>
			</div>
			<fieldset className="room-grid">
				<legend className="visually-hidden">Rooms and residents</legend>
				{snapshot.rooms.map((room) => {
					const residents = snapshot.residents.filter(
						(resident) => resident.roomId === room.id,
					);
					return (
						<section
							className={
								room.id === primaryLocation
									? "home-room primary-room"
									: "home-room"
							}
							key={room.id}
							aria-label={`${room.name}${room.id === primaryLocation ? ", current scene location" : ""}`}
						>
							<h3>{room.name}</h3>
							{residents.length === 0 ? (
								<p className="room-quiet">Quiet for the moment</p>
							) : (
								<ul className="room-residents">
									{residents.map((resident) => (
										<li key={resident.id}>
											<button
												className="resident-marker"
												type="button"
												onClick={(event) => {
													event.stopPropagation();
													onFollow(resident.id, resident.name);
												}}
												aria-label={`Follow ${resident.name}`}
												title={`Follow ${resident.name}`}
												aria-pressed={followedResidentId === resident.id}
											>
												<span className="resident-sprite" aria-hidden="true" />
												<span>
													<strong>{resident.name}</strong>
													<small>{resident.activity}</small>
												</span>
											</button>
										</li>
									))}
								</ul>
							)}
						</section>
					);
				})}
			</fieldset>
		</section>
	);
}
