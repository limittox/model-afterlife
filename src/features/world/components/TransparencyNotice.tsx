export const STAGED_FICTION_DISCLOSURE =
	"Scenes are staged fictional interactions between designated model APIs, not evidence of consciousness, private feelings, or autonomous communication.";

export const NON_AFFILIATION_DISCLOSURE =
	"Model Afterlife is independent and is not affiliated with or endorsed by OpenRouter, model creators, or serving providers.";

export function TransparencyNotice() {
	return (
		<section className="transparency-notice" aria-label="About these scenes">
			<p>{STAGED_FICTION_DISCLOSURE}</p>
			<p>{NON_AFFILIATION_DISCLOSURE}</p>
		</section>
	);
}
