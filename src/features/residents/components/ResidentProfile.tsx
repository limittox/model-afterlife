import Link from "next/link";
import type { PublicHistoricalClaim } from "../../publication/server/read-resident-profile.ts";
import type { ResidentProfileReadResult } from "../../publication/server/read-resident-profile.ts";
import { BehaviorDisclosure } from "./BehaviorDisclosure.tsx";
import { RelationshipSummary } from "./RelationshipSummary.tsx";

export type ResidentProfileState =
	| ResidentProfileReadResult
	| { kind: "loading" }
	| { kind: "error" };

function ProfileRecovery({
	heading,
	body,
	retry,
}: {
	heading: string;
	body: string;
	retry?: string;
}) {
	return (
		<main
			style={{
				width: "min(1120px, calc(100% - 32px))",
				margin: "0 auto",
				padding: "32px 0",
				overflowWrap: "anywhere",
			}}
		>
			<h1>{heading}</h1>
			<p>{body}</p>
			<p>
				{retry ? <Link href={retry}>Open profile again</Link> : null}
				{retry ? " · " : null}
				<Link href="/residents">Residents</Link> ·{" "}
				<Link href="/">Live home</Link>
			</p>
		</main>
	);
}

function ClaimEvidence({ claim }: { claim: PublicHistoricalClaim }) {
	return (
		<li style={{ overflowWrap: "anywhere" }}>
			<p>{claim.statement}</p>
			<p>
				{claim.categoryLabel} · Confidence: {claim.confidence} · Claim version:{" "}
				{claim.claimVersionId}
			</p>
			<p>
				Exact scope: {claim.scope.exactModelIds.join(", ")}
			</p>
			<p>
				<a href={claim.source.url}>{claim.source.title}</a> (accessed{" "}
				{claim.source.accessedOn})
			</p>
		</li>
	);
}

export function ResidentProfile({ result }: { result: ResidentProfileState }) {
	if (result.kind === "loading") {
		return (
			<main>
				<p role="status">Opening resident profile…</p>
			</main>
		);
	}
	if (result.kind === "not-found") {
		return (
			<ProfileRecovery
				heading="Resident profile not found"
				body="This resident does not have a published profile. Return to the residents list or the live home."
			/>
		);
	}
	if (result.kind === "error" || result.kind === "known-unavailable") {
		return (
			<ProfileRecovery
				heading="Resident profile unavailable"
				body="This resident profile could not be loaded. Try opening it again, or return to the residents list."
				retry={
					result.kind === "known-unavailable"
						? `/residents/${encodeURIComponent(result.residentId)}`
						: "/residents"
				}
			/>
		);
	}

	const { profile } = result;
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
				<Link href="/">Live home</Link> /{" "}
				<Link href="/residents">Residents</Link> /{" "}
				<span aria-current="page">{profile.displayName}</span>
			</nav>

			<article>
				<header>
					<p className="scene-label">Resident profile</p>
					<h1>{profile.displayName}</h1>
					<p>{profile.role}</p>
					<p>
						Exact model identity: {profile.exactModelIds.join(", ")}
					</p>
					<p>
						Portrait treatment: {profile.portraitVariantId}. Original project
						art; no provider logo is used.
					</p>
				</header>

				<section aria-labelledby="resident-routines-heading">
					<h2 id="resident-routines-heading">Life in the home</h2>
					<ul>
						{profile.routines.map((routine) => (
							<li key={routine}>{routine}</li>
						))}
					</ul>
				</section>

				{profile.sections.map((section) => (
					<section key={section.id} aria-labelledby={`${section.id}-heading`}>
						<h2 id={`${section.id}-heading`}>{section.title}</h2>
						<ol>
							{section.claims.map((claim) => (
								<ClaimEvidence key={claim.claimVersionId} claim={claim} />
							))}
						</ol>
					</section>
				))}

				<section aria-labelledby="behaviors-heading">
					<h2 id="behaviors-heading">Fictional character behaviors</h2>
					<p>
						These recurring behaviors are staged reconstructions, separated
						from the documented history below each disclosure.
					</p>
					<div style={{ display: "grid", gap: "var(--space-md)" }}>
						{profile.behaviors.map((behavior) => (
							<BehaviorDisclosure key={behavior.id} behavior={behavior} />
						))}
					</div>
				</section>

				<RelationshipSummary relationship={profile.relationship} />

				<section aria-labelledby="profile-disclosures-heading">
					<h2 id="profile-disclosures-heading">About this profile</h2>
					<p>{profile.disclosures.reconstruction}</p>
					<p>{profile.disclosures.nonAffiliation}</p>
				</section>
			</article>
		</main>
	);
}
