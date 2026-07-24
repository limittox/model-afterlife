import type { ReturnRecapBeat as ReturnRecapBeatData } from "../../publication/contracts/public-publication.ts";

export function RecapBeat({ beat }: { beat: ReturnRecapBeatData }) {
	return (
		<li className="recap-beat" data-significance={beat.significance}>
			<p className="scene-label">
				Home day {beat.home.homeDay} · {beat.home.homeTime} ·{" "}
				{beat.home.dayPeriod}
			</p>
			<p>{beat.development}</p>
			<p>
				<a href={beat.scene.href}>Open scene: {beat.scene.label}</a>
			</p>
			<p>
				Residents:{" "}
				{beat.residents.map((resident, index) => (
					<span key={resident.residentId}>
						{index > 0 ? ", " : null}
						<a href={resident.profilePath}>{resident.displayName}</a>
					</span>
				))}
			</p>
			{beat.relationshipNote ? (
				<p>
					<strong>Relationship change:</strong> {beat.relationshipNote}
				</p>
			) : null}
		</li>
	);
}
