import Link from "next/link";
import { RecentSceneArchive } from "@/features/publication/components/RecentSceneArchive";
import { readRecentScenes } from "@/features/publication/server/read-recent-scenes";

export const dynamic = "force-dynamic";

export default async function RecentScenesPage() {
	let result;
	try {
		result = await readRecentScenes();
	} catch {
		result = { kind: "error" } as const;
	}
	return (
		<main
			style={{
				width: "min(880px, calc(100% - 32px))",
				margin: "0 auto",
				padding: "32px 0",
				overflowWrap: "anywhere",
			}}
		>
			<nav aria-label="Breadcrumb">
				<Link href="/">Live home</Link> /{" "}
				<span aria-current="page">Recent scenes</span>
			</nav>
			<header>
				<p className="scene-label">Canonical archive</p>
				<h1>Recent scenes</h1>
				<p>
					The latest complete moments from the shared home, newest first.
				</p>
			</header>
			<RecentSceneArchive result={result} />
		</main>
	);
}
