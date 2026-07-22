export type ScenePlaybackState = {
	sceneId: string;
	turnIndex: number;
	remainingMs: number;
	runningSinceMs: number | null;
};

function turnDurationMs(turnCount: number, presentationDurationMs: number) {
	if (!Number.isInteger(turnCount) || turnCount < 1) {
		throw new RangeError("Scene playback requires at least one turn.");
	}
	if (!Number.isFinite(presentationDurationMs) || presentationDurationMs <= 0) {
		throw new RangeError("Scene playback duration must be positive.");
	}
	return presentationDurationMs / turnCount;
}

export function createScenePlayback(
	sceneId: string,
	turnCount: number,
	presentationDurationMs: number,
	nowMs: number,
	paused: boolean,
): ScenePlaybackState {
	const remainingMs = turnDurationMs(turnCount, presentationDurationMs);
	return {
		sceneId,
		turnIndex: 0,
		remainingMs: turnCount === 1 ? 0 : remainingMs,
		runningSinceMs: paused || turnCount === 1 ? null : nowMs,
	};
}

export function pauseScenePlayback(
	state: ScenePlaybackState,
	nowMs: number,
): ScenePlaybackState {
	if (state.runningSinceMs === null) return state;
	const elapsedMs = Math.max(0, nowMs - state.runningSinceMs);
	return {
		...state,
		remainingMs: Math.max(1, state.remainingMs - elapsedMs),
		runningSinceMs: null,
	};
}

export function resumeScenePlayback(
	state: ScenePlaybackState,
	nowMs: number,
	turnCount: number,
): ScenePlaybackState {
	if (state.runningSinceMs !== null || state.turnIndex >= turnCount - 1) {
		return state;
	}
	return { ...state, runningSinceMs: nowMs };
}

export function advanceScenePlayback(
	state: ScenePlaybackState,
	nowMs: number,
	turnCount: number,
	turnDuration: number,
): ScenePlaybackState {
	if (state.runningSinceMs === null || state.turnIndex >= turnCount - 1) {
		return state;
	}
	const elapsedMs = Math.max(0, nowMs - state.runningSinceMs);
	if (elapsedMs < state.remainingMs) {
		return {
			...state,
			remainingMs: state.remainingMs - elapsedMs,
			runningSinceMs: nowMs,
		};
	}

	const overflowMs = elapsedMs - state.remainingMs;
	const steps = 1 + Math.floor(overflowMs / turnDuration);
	const turnIndex = Math.min(turnCount - 1, state.turnIndex + steps);
	const isComplete = turnIndex === turnCount - 1;
	return {
		...state,
		turnIndex,
		remainingMs: isComplete
			? 0
			: turnDuration - (overflowMs % turnDuration),
		runningSinceMs: isComplete ? null : nowMs,
	};
}
