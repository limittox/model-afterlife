import type { PublicWorldSnapshot } from "../contracts/public-world.ts";

type Scene = NonNullable<PublicWorldSnapshot["scene"]>;

export function DialogueTranscript({
	scene,
	residents,
	activeTurnIndex,
}: {
	scene: Scene;
	residents: PublicWorldSnapshot["residents"];
	activeTurnIndex: number;
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
					aria-current={index === activeTurnIndex ? "true" : undefined}
				>
					<p className="turn-attribution">
						<span className="speaker-name">
							{residentNames.get(turn.speakerId) ?? "Resident"}
						</span>
						<span className="model-label">{turn.exactModelId}</span>
					</p>
					<p>{turn.text}</p>
				</li>
			))}
		</ol>
	);
}
