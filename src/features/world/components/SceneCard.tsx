import type { PublicWorldSnapshot } from "../contracts/public-world.ts";

type Scene = NonNullable<PublicWorldSnapshot["scene"]>;

export function SceneCard({
	scene,
	snapshot,
	activeTurnIndex,
}: {
	scene: Scene;
	snapshot: PublicWorldSnapshot;
	activeTurnIndex: number;
}) {
	const location =
		snapshot.rooms.find((room) => room.id === scene.locationId)?.name ??
		"The retirement home";
	const speakers = scene.participantIds
		.map(
			(id) => snapshot.residents.find((resident) => resident.id === id)?.name,
		)
		.filter((name): name is string => Boolean(name));

	return (
		<section className="scene-card" aria-labelledby="scene-premise">
			<p className="scene-label">
				{scene.deliveryMode === "cached"
					? `Cached scene · not live · originally in ${location}`
					: `Now in ${location}`}
			</p>
			<h2 id="scene-premise">{scene.premise}</h2>
			<p className="scene-speakers">
				<span>Speakers</span> {speakers.join(" and ")}
			</p>
			<p className="scene-progress">
				Scene playback · {activeTurnIndex + 1} of {scene.turns.length} turns
			</p>
		</section>
	);
}
