import type { RefObject } from "react";

export function ObserverNavigation({
	hasRecap,
	recapOpen,
	onOpenRecap,
	recapActionRef,
}: {
	hasRecap: boolean;
	recapOpen: boolean;
	onOpenRecap: () => void;
	recapActionRef: RefObject<HTMLButtonElement | null>;
}) {
	return (
		<nav className="observer-navigation" aria-label="Observer">
			<a href="/" aria-current="page">
				Live home
			</a>
			<a href="/residents">Residents</a>
			<a href="/scenes">Recent scenes</a>
			{hasRecap ? (
				<button
					ref={recapActionRef}
					type="button"
					aria-expanded={recapOpen}
					aria-controls="return-recap"
					onClick={onOpenRecap}
				>
					Since your last visit
				</button>
			) : null}
		</nav>
	);
}
