import type { PublicWorldSnapshot } from "../contracts/public-world.ts";

type Scene = NonNullable<PublicWorldSnapshot["scene"]>;

export function DialogueTranscript({
	scene,
	residents,
}: {
	scene: Scene;
	residents: PublicWorldSnapshot["residents"];
}) {
	const residentNames = new Map(
		residents.map((resident) => [resident.id, resident.name]),
	);

	return (
		<ol className="dialogue-transcript" aria-label="Complete scene transcript">
			{scene.turns.map((turn, index) => (
				<li
					className="dialogue-turn"
					key={turn.id}
					aria-current={index === scene.turns.length - 1 ? "true" : undefined}
				>
					<p className="speaker-name">
						{residentNames.get(turn.speakerId) ?? "Resident"}
					</p>
					<p>{turn.text}</p>
				</li>
			))}
		</ol>
	);
}
