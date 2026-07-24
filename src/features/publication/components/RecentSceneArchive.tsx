import Link from "next/link.js";
import type {
	RecentSceneArchiveEntry,
	RecentSceneArchiveResult,
} from "../server/read-recent-scenes.ts";

function ArchiveRow({ scene }: { scene: RecentSceneArchiveEntry }) {
	return (
		<li
			data-revision-id={scene.revisionId}
			style={{
				minWidth: 0,
				border: "1px solid var(--color-border)",
				padding: "var(--space-lg)",
				overflowWrap: "anywhere",
			}}
		>
			<article>
				<h3>
					<Link href={scene.canonicalHref}>{scene.title}</Link>
				</h3>
				<p>
					{scene.residents.map((resident, index) => (
						<span key={resident.residentId}>
							{index > 0 ? ", " : null}
							<Link href={resident.profilePath}>{resident.displayName}</Link>
						</span>
					))}
				</p>
				<p>
					{scene.location} · {scene.homeTime} ({scene.dayPeriod})
				</p>
				<p>{scene.outcome}</p>
				{scene.relationshipChanges.map((change) => (
					<p key={change}>{change}</p>
				))}
				{scene.explanationLinks.length > 0 ? (
					<p>
						{scene.explanationLinks.map((href, index) => (
							<span key={href}>
								{index > 0 ? " · " : null}
								<Link href={href}>Behind this behavior</Link>
							</span>
						))}
					</p>
				) : null}
			</article>
		</li>
	);
}

export function RecentSceneArchive({
	result,
}: {
	result: RecentSceneArchiveResult;
}) {
	if (result.kind === "loading") {
		return <p role="status">Opening the recent scene archive…</p>;
	}
	if (result.kind === "error") {
		return (
			<section aria-labelledby="archive-error-heading">
				<h2 id="archive-error-heading">Recent scenes are unavailable</h2>
				<p>
					The recent scenes could not be loaded. Try opening the archive again,
					or return to the live home.
				</p>
				<p>
					<Link href="/scenes">Open archive again</Link> ·{" "}
					<Link href="/">Live home</Link>
				</p>
			</section>
		);
	}
	if (result.scenes.length === 0 && !result.partial) {
		return (
			<section aria-labelledby="archive-empty-heading">
				<h2 id="archive-empty-heading">The archive is quiet</h2>
				<p>
					No canonical scenes are available yet. Return to the live home while
					the residents continue their day.
				</p>
			</section>
		);
	}

	const groups = new Map<number, RecentSceneArchiveEntry[]>();
	for (const scene of result.scenes) {
		groups.set(scene.homeDay, [...(groups.get(scene.homeDay) ?? []), scene]);
	}
	return (
		<>
			{result.partial ? (
				<p role="status">
					Some recent scenes could not be loaded. Open the archive again to
					retry.
				</p>
			) : null}
			{[...groups.entries()].map(([homeDay, scenes]) => (
				<section key={homeDay} aria-labelledby={`home-day-${homeDay}`}>
					<h2 id={`home-day-${homeDay}`}>Home day {homeDay}</h2>
					<ol
						style={{
							display: "grid",
							gap: "var(--space-md)",
							margin: "0 0 var(--space-xl)",
							padding: 0,
							listStyle: "none",
						}}
					>
						{scenes.map((scene) => (
							<ArchiveRow key={scene.revisionId} scene={scene} />
						))}
					</ol>
				</section>
			))}
		</>
	);
}
