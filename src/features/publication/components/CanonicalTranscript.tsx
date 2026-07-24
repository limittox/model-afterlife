import Link from "next/link";
import type { CanonicalScene } from "../contracts/public-publication.ts";

export function CanonicalTranscript({
	turns,
}: {
	turns: CanonicalScene["turns"];
}) {
	return (
		<section aria-labelledby="canonical-transcript-heading">
			<h2 id="canonical-transcript-heading">Canonical transcript</h2>
			<ol
				className="dialogue-transcript"
				aria-label="Complete canonical scene transcript"
				style={{ overflow: "visible", overflowWrap: "anywhere" }}
			>
				{turns.map((turn) => (
					<li className="dialogue-turn" key={turn.turnIndex}>
						<p className="turn-attribution">
							<Link href={turn.speakerProfilePath} tabIndex={0}>
								<span className="speaker-name">{turn.speakerName}</span>
							</Link>
							<span className="model-label">{turn.exactModelId}</span>
						</p>
						<p>{turn.text}</p>
					</li>
				))}
			</ol>
		</section>
	);
}
