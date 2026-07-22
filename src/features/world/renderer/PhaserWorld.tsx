"use client";

import { useEffect, useRef } from "react";
import { createWorldGame } from "./create-world-game.ts";
import { sizeCanvasAtIntegerScale } from "./integer-display-scale.ts";
import { RendererBridge } from "./renderer-bridge.ts";
import { disposeWorldGame } from "./renderer-lifecycle.ts";
import type {
	RendererIntent,
	RenderWorldState,
} from "./renderer-types.ts";
import { PRESENTATION_TOKENS } from "./renderer-types.ts";

export default function PhaserWorld({
	state,
	onIntent,
}: {
	state: RenderWorldState;
	onIntent: (intent: RendererIntent) => void;
}) {
	const hostRef = useRef<HTMLDivElement>(null);
	const bridgeRef = useRef<RendererBridge | null>(null);
	const initialStateRef = useRef(state);
	const intentRef = useRef(onIntent);
	intentRef.current = onIntent;

	useEffect(() => {
		if (!hostRef.current) return;
		const bridge = new RendererBridge(initialStateRef.current, (intent) =>
			intentRef.current(intent),
		);
		bridgeRef.current = bridge;
		const game = createWorldGame(hostRef.current, bridge, PRESENTATION_TOKENS);
		const resize = () => {
			if (!hostRef.current) return;
			sizeCanvasAtIntegerScale(
				game.canvas,
				hostRef.current.clientWidth,
				hostRef.current.clientHeight,
			);
		};
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(hostRef.current);
		resize();

		return () => {
			bridge.destroy();
			bridgeRef.current = null;
			disposeWorldGame(game, [() => resizeObserver.disconnect()]);
		};
	}, []);

	useEffect(() => {
		bridgeRef.current?.setState(state);
	}, [state]);

	return (
		<div
			className="phaser-world-host"
			ref={hostRef}
			aria-hidden="true"
			data-renderer="phaser"
		/>
	);
}
