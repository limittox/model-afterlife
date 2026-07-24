import Link from "next/link";

export default function SceneNotFound() {
	return (
		<main
			style={{
				width: "min(880px, calc(100% - 32px))",
				margin: "0 auto",
				padding: "32px 0",
			}}
		>
			<h1>Canonical scene not found</h1>
			<p>
				This scene does not have a published canonical record. Return to recent
				scenes or the live home.
			</p>
			<p>
				<Link href="/scenes">Recent scenes</Link> ·{" "}
				<Link href="/">Live home</Link>
			</p>
		</main>
	);
}
