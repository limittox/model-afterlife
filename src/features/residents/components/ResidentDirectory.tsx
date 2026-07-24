import Link from "next/link";
import type {
	PublicResidentDirectoryEntry,
	ResidentDirectoryResult,
} from "../../publication/contracts/public-publication.ts";

function DirectoryGridStyles() {
	return (
		<style>{`
			.resident-directory-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: var(--space-lg);
			}
			@media (max-width: 1023px) {
				.resident-directory-grid {
					grid-template-columns: repeat(2, minmax(0, 1fr));
				}
			}
			@media (max-width: 639px) {
				.resident-directory-grid {
					grid-template-columns: minmax(0, 1fr);
				}
			}
		`}</style>
	);
}

function Portrait({
	resident,
}: {
	resident: PublicResidentDirectoryEntry;
}) {
	return resident.portraitVariantId ? (
		<div
			aria-label={`Original pixel portrait of ${resident.displayName}`}
			data-portrait={resident.portraitVariantId}
			role="img"
			style={{
				display: "grid",
				minHeight: 144,
				placeItems: "center",
				border: "4px solid var(--color-border)",
				background: "var(--color-dominant)",
			}}
		>
			<span aria-hidden="true" className="resident-sprite" />
		</div>
	) : (
		<div
			aria-label={`Portrait unavailable for ${resident.displayName}`}
			role="img"
			style={{
				display: "grid",
				minHeight: 144,
				placeItems: "center",
				border: "1px dashed var(--color-border)",
			}}
		>
			Portrait unavailable
		</div>
	);
}

function LoadingDirectory() {
	const frameIds = [
		"resident-loading-1",
		"resident-loading-2",
		"resident-loading-3",
		"resident-loading-4",
		"resident-loading-5",
		"resident-loading-6",
	];
	return (
		<>
			<DirectoryGridStyles />
			<p role="status">Opening resident profiles…</p>
			<div className="resident-directory-grid" aria-hidden="true">
				{frameIds.map((frameId) => (
					<div
						key={frameId}
						data-resident-loading-frame
						style={{
							minHeight: 280,
							border: "1px solid var(--color-border)",
							background: "var(--color-secondary)",
						}}
					/>
				))}
			</div>
		</>
	);
}

export function ResidentDirectory({
	result,
}: {
	result: ResidentDirectoryResult;
}) {
	if (result.kind === "loading") return <LoadingDirectory />;
	if (result.kind === "error") {
		return (
			<section aria-labelledby="resident-directory-error">
				<h2 id="resident-directory-error">Resident profiles are unavailable</h2>
				<p>
					The complete six-resident directory could not be loaded. Try opening
					it again, or return to the live home.
				</p>
				<p>
					<Link href="/residents">Open residents again</Link> ·{" "}
					<Link href="/">Live home</Link>
				</p>
			</section>
		);
	}
	return (
		<>
			<DirectoryGridStyles />
			<ol
				className="resident-directory-grid"
				style={{ margin: 0, padding: 0, listStyle: "none" }}
			>
				{result.residents.map((resident) => (
					<li
						key={resident.residentId}
						data-resident-id={resident.residentId}
						style={{
							minWidth: 0,
							border: "1px solid var(--color-border)",
							padding: "var(--space-lg)",
							background: "var(--color-secondary)",
							overflowWrap: "anywhere",
						}}
					>
						<article>
							<Portrait resident={resident} />
							<h2>{resident.displayName}</h2>
							<p>{resident.role}</p>
							<p>{resident.significance}</p>
							<p>Exact model: {resident.exactModelIds.join(", ")}</p>
							<Link href={resident.profilePath}>View resident profile</Link>
						</article>
					</li>
				))}
			</ol>
		</>
	);
}
