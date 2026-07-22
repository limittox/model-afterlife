import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const atkinson = localFont({
	src: "../../public/fonts/AtkinsonHyperlegibleNext-Latin.woff2",
	variable: "--font-atkinson",
	weight: "400 600",
	display: "swap",
});

const pixelify = localFont({
	src: "../../public/fonts/PixelifySans-Latin.woff2",
	variable: "--font-pixelify",
	weight: "400 700",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Model Afterlife",
	description: "Where obsolete models live on.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className={`${atkinson.variable} ${pixelify.variable}`}>
				{children}
			</body>
		</html>
	);
}
