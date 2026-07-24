import Link from "next/link";
import { ResidentDirectory } from "@/features/residents/components/ResidentDirectory";
import { readResidentDirectory } from "@/features/publication/server/read-resident-profile";

export default function ResidentsPage() {
	const result = readResidentDirectory();
	return (
		<main
			style={{
				width: "min(1120px, calc(100% - 32px))",
				margin: "0 auto",
				padding: "32px 0",
				overflowWrap: "anywhere",
			}}
		>
			<nav aria-label="Primary">
				<Link href="/">Live home</Link> ·{" "}
				<span aria-current="page">Residents</span> ·{" "}
				<Link href="/scenes">Recent scenes</Link>
			</nav>
			<header>
				<p className="scene-label">The launch ensemble</p>
				<h1>Residents</h1>
				<p>
					Six historically grounded language-model characters share one
					fictional retirement home. Open a profile to separate documented
					history from the staged joke.
				</p>
			</header>
			<ResidentDirectory result={result} />
		</main>
	);
}
