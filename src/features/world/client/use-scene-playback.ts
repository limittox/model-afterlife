"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import type { PresentationMode } from "./presentation-types.ts";
import {
	advanceScenePlayback,
	createScenePlayback,
	pauseScenePlayback,
	resumeScenePlayback,
	type ScenePlaybackState,
} from "./scene-playback.ts";

type Scene = NonNullable<PublicWorldSnapshot["scene"]>;

function clockNow() {
	return performance.now();
}

export function useScenePlayback(
	scene: Scene | null,
	mode: PresentationMode,
): number | null {
	const modeRef = useRef(mode);
	modeRef.current = mode;
	const [playback, setPlayback] = useState<ScenePlaybackState | null>(null);
	const sceneId = scene?.id ?? null;
	const turnCount = scene?.turns.length ?? 0;
	const presentationDurationMs = scene?.presentationDurationMs ?? 0;

	useEffect(() => {
		if (!sceneId) {
			setPlayback(null);
			return;
		}
		setPlayback(
			createScenePlayback(
				sceneId,
				turnCount,
				presentationDurationMs,
				clockNow(),
				modeRef.current === "paused",
			),
		);
	}, [sceneId, turnCount, presentationDurationMs]);

	useEffect(() => {
		if (!sceneId) return;
		setPlayback((current) => {
			if (!current || current.sceneId !== sceneId) return current;
			return mode === "paused"
				? pauseScenePlayback(current, clockNow())
				: resumeScenePlayback(current, clockNow(), turnCount);
		});
	}, [mode, sceneId, turnCount]);

	useEffect(() => {
		if (
			!sceneId ||
			!playback ||
			playback.sceneId !== sceneId ||
			playback.runningSinceMs === null ||
			playback.turnIndex >= turnCount - 1
		) {
			return;
		}

		const turnDuration = presentationDurationMs / turnCount;
		const timeout = window.setTimeout(() => {
			setPlayback((current) =>
				current
					? advanceScenePlayback(
							current,
							clockNow(),
							turnCount,
							turnDuration,
						)
					: current,
			);
		}, playback.remainingMs);
		return () => window.clearTimeout(timeout);
	}, [playback, sceneId, turnCount, presentationDurationMs]);

	if (!sceneId) return null;
	return playback?.sceneId === sceneId ? playback.turnIndex : 0;
}
