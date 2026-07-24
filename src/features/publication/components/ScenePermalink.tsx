import Link from "next/link";
import {
	NON_AFFILIATION_DISCLOSURE,
	STAGED_FICTION_DISCLOSURE,
} from "../../world/components/TransparencyNotice.tsx";
import type {
	CanonicalScene,
	CanonicalSceneReadResult,
} from "../contracts/public-publication.ts";
import { CanonicalTranscript } from "./CanonicalTranscript.tsx";

export type ScenePermalinkState =
	| CanonicalSceneReadResult
	| { kind: "loading" };

function DisclosureBlock({ scene }: { scene?: CanonicalScene }) {
	return (
		<section
			aria-label="About this canonical scene"
			style={{ minWidth: 0, overflowWrap: "anywhere" }}
		>
			<h2>About this scene</h2>
			<p>{scene?.disclosures.stagedFiction ?? STAGED_FICTION_DISCLOSURE}</p>
			{scene ? <p>{scene.disclosures.aiAuthorship}</p> : null}
			{scene ? (
				<p>
					Exact model provenance: {scene.disclosures.exactModelIds.join(", ")}.
				</p>
			) : null}
			<p>{scene?.disclosures.nonAffiliation ?? NON_AFFILIATION_DISCLOSURE}</p>
		</section>
	);
}

function SceneUnavailable() {
	return (
		<>
			<section aria-labelledby="scene-unavailable-heading">
				<p className="scene-label">Canonical scene</p>
				<h1 id="scene-unavailable-heading">
					This canonical scene is unavailable
				</h1>
				<p>
					The scene cannot be displayed right now. Return to recent scenes or
					jump back to the live home.
				</p>
				<p>
					<Link href="/scenes" tabIndex={0}>
						Recent scenes
					</Link>{" "}
					·{" "}
					<Link href="/" tabIndex={0}>
						Live home
					</Link>
				</p>
			</section>
			<DisclosureBlock />
		</>
	);
}

export function ScenePermalink({ result }: { result: ScenePermalinkState }) {
	if (result.kind === "loading") {
		return (
			<main
				style={{
					width: "min(1120px, calc(100% - 32px))",
					margin: "0 auto",
					padding: "32px 0",
					overflowWrap: "anywhere",
				}}
			>
				<p role="status">Opening canonical scene…</p>
				<DisclosureBlock />
			</main>
		);
	}
	if (result.kind !== "complete") {
		return (
			<main
				style={{
					width: "min(1120px, calc(100% - 32px))",
					margin: "0 auto",
					padding: "32px 0",
					overflowWrap: "anywhere",
				}}
			>
				<SceneUnavailable />
			</main>
		);
	}

	const { scene } = result;
	return (
		<main
			style={{
				width: "min(1120px, calc(100% - 32px))",
				margin: "0 auto",
				padding: "32px 0",
				overflowWrap: "anywhere",
			}}
		>
			<nav aria-label="Breadcrumb">
				<Link href="/" tabIndex={0}>
					Live home
				</Link>{" "}
				/{" "}
				<Link href="/scenes" tabIndex={0}>
					Recent scenes
				</Link>{" "}
				/ <span aria-current="page">Canonical scene</span>
			</nav>

			<article style={{ minWidth: 0 }}>
				<header>
					<p className="scene-label">Canonical scene</p>
					<h1>{scene.premise}</h1>
					<p>
						Home day {scene.home.homeDay}, {scene.home.homeTime} (
						{scene.home.dayPeriod}) · {scene.location.name}
					</p>
					<p>
						Cast:{" "}
						{scene.cast.map((resident, index) => (
							<span key={resident.residentId}>
								{index > 0 ? ", " : null}
								<Link href={resident.profilePath} tabIndex={0}>
									{resident.displayName}
								</Link>
							</span>
						))}
					</p>
				</header>

				<CanonicalTranscript turns={scene.turns} />

				<section aria-labelledby="scene-outcome-heading">
					<h2 id="scene-outcome-heading">What changed</h2>
					<p>{scene.outcome.summary}</p>
					{scene.outcome.sharedExperience ? (
						<p>Shared experience: {scene.outcome.sharedExperience}</p>
					) : null}
					{scene.outcome.relationshipChanges.length > 0 ? (
						<ul>
							{scene.outcome.relationshipChanges.map((change) => (
								<li
									key={`${change.residentAId}:${change.residentBId}:${change.dimension}`}
								>
									<Link href={change.residentAProfilePath} tabIndex={0}>
										{change.residentAName}
									</Link>{" "}
									and{" "}
									<Link href={change.residentBProfilePath} tabIndex={0}>
										{change.residentBName}
									</Link>
									: {change.description}
								</li>
							))}
						</ul>
					) : (
						<p>No relationship change was recorded by this scene.</p>
					)}
				</section>

				<section aria-labelledby="historical-context-heading">
					<h2 id="historical-context-heading">Historical context</h2>
					{scene.historicalContext.length > 0 ? (
						<ol>
							{scene.historicalContext.map((claim) => (
								<li
									key={`${claim.turnIndex}:${claim.claimVersionId}`}
									style={{ overflowWrap: "anywhere" }}
								>
									<p>
										Turn {claim.turnIndex + 1} ·{" "}
										<Link href={claim.residentProfilePath} tabIndex={0}>
											{claim.residentName}
										</Link>{" "}
										· {claim.categoryLabel}
									</p>
									<p>{claim.statement}</p>
									<p>
										Claim version: {claim.claimVersionId} · Confidence:{" "}
										{claim.confidence}
									</p>
									<p>
										<a href={claim.source.url} tabIndex={0}>
											{claim.source.title}
										</a>{" "}
										(accessed {claim.source.accessedOn})
									</p>
								</li>
							))}
						</ol>
					) : (
						<p>This scene used no approved historical claims.</p>
					)}
				</section>

				<DisclosureBlock scene={scene} />
			</article>
		</main>
	);
}
