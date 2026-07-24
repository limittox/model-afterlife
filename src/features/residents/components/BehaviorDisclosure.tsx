import type { PublicResidentBehavior } from "../../publication/contracts/public-publication.ts";

function ClaimList({
	claims,
}: {
	claims: PublicResidentBehavior["historicalInspiration"];
}) {
	return (
		<ul>
			{claims.map((claim) => (
				<li key={claim.claimVersionId}>
					<p>{claim.statement}</p>
					<p>
						{claim.categoryLabel} · Claim version:{" "}
						<span style={{ overflowWrap: "anywhere" }}>
							{claim.claimVersionId}
						</span>
					</p>
				</li>
			))}
		</ul>
	);
}

export function BehaviorDisclosure({
	behavior,
	state = "complete",
}: {
	behavior?: PublicResidentBehavior;
	state?: "complete" | "loading" | "error" | "partial";
}) {
	if (state === "loading") {
		return <p role="status">Opening behavior notes…</p>;
	}
	if (state === "error" || !behavior) {
		return <p>Behavior notes are unavailable. Try opening them again.</p>;
	}
	return (
		<>
			{state === "partial" ? (
				<p role="status">Some supporting sources are unavailable.</p>
			) : null}
			<details
				style={{
					minWidth: 0,
					border: "1px solid var(--color-border)",
					padding: "var(--space-md)",
					overflowWrap: "anywhere",
				}}
			>
				<summary
					style={{
						minHeight: 44,
						cursor: "pointer",
						fontWeight: 600,
					}}
				>
					Behind this behavior: {behavior.title}
				</summary>
				<section aria-label={`${behavior.title} explanation`}>
					<h3>The joke</h3>
					<p>{behavior.joke}</p>

					<h3>Historical inspiration</h3>
					<ClaimList claims={behavior.historicalInspiration} />

					<h3>Fictional exaggeration</h3>
					<ClaimList claims={behavior.fictionalExaggeration} />

					<h3>Uncertainty and scope</h3>
					<p>{behavior.uncertaintyAndScope}</p>

					<h3>Sources</h3>
					<ul>
						{behavior.sources.map((source) => (
							<li key={source.claimVersionId}>
								<a href={source.url}>{source.title}</a> · {source.category} ·
								accessed {source.accessedOn} ·{" "}
								<span style={{ overflowWrap: "anywhere" }}>
									{source.claimVersionId}
								</span>
							</li>
						))}
					</ul>
				</section>
			</details>
		</>
	);
}
