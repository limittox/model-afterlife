"use client";

import dynamic from "next/dynamic";

export const PixelWorld = dynamic(() => import("./PhaserWorld.tsx"), {
	ssr: false,
	loading: () => <div className="pixel-renderer-loading" aria-hidden="true" />,
});

