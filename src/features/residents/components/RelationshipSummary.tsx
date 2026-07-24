import Link from "next/link";
import type { PublicRelationshipSummary } from "../../publication/server/read-resident-profile.ts";

export function RelationshipSummary({
	relationship,
}: {
	relationship: PublicRelationshipSummary | null;
}) {
	return (
		<section aria-labelledby="relationship-summary-heading">
			<h2 id="relationship-summary-heading">Recent relationship history</h2>
			{relationship ? (
				<p style={{ overflowWrap: "anywhere" }}>
					With{" "}
					<Link href={relationship.counterpartProfilePath}>
						{relationship.counterpartName}
					</Link>
					: {relationship.description}{" "}
					<Link href={relationship.scene.href}>
						Open the cause scene: {relationship.scene.label}
					</Link>
				</p>
			) : (
				<p>No recent relationship change is available.</p>
			)}
		</section>
	);
}
