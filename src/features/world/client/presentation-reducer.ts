import type { PublicWorldSnapshot } from "../contracts/public-world.ts";
import type {
	PresentationAction,
	PresentationState,
} from "./presentation-types.ts";

const CAUGHT_UP_TO_LIVE = "Caught up to live";
const MAX_BUFFERED_UPDATES = 100;

export function createInitialPresentationState(
	snapshot: PublicWorldSnapshot | null = null,
): PresentationState {
	const cursor = snapshot?.throughSequence ?? 0;
	return {
		mode: "live",
		acquisitionCursor: cursor,
		presentationCursor: cursor,
		lastValidSnapshot: snapshot,
		presentedSnapshot: snapshot,
		bufferedUpdates: [],
		followedResidentId: null,
		followedResidentName: null,
		manualPan: false,
		connection: snapshot ? "connected" : "opening",
		announcement: null,
		needsFreshSnapshot: snapshot === null,
		errorMessage: null,
	};
}

function requestRecovery(state: PresentationState): PresentationState {
	return {
		...state,
		connection: state.lastValidSnapshot ? "reconnecting" : "opening",
		needsFreshSnapshot: true,
		errorMessage: null,
	};
}

export function presentationReducer(
	state: PresentationState,
	action: PresentationAction,
): PresentationState {
	switch (action.type) {
		case "snapshot-accepted": {
			const cursor = action.snapshot.throughSequence;
			return {
				...state,
				mode: "live",
				acquisitionCursor: cursor,
				presentationCursor: cursor,
				lastValidSnapshot: action.snapshot,
				presentedSnapshot: action.snapshot,
				bufferedUpdates: [],
				connection: "connected",
				announcement: action.reason === "bootstrap" ? null : CAUGHT_UP_TO_LIVE,
				needsFreshSnapshot: false,
				errorMessage: null,
			};
		}
		case "snapshot-rejected":
			return {
				...state,
				connection: state.lastValidSnapshot ? "reconnecting" : "error",
				needsFreshSnapshot: false,
				errorMessage: state.lastValidSnapshot
					? "The live feed is having trouble. You’re viewing the last known state while we reconnect."
					: "The home couldn’t load. Try loading again.",
			};
		case "connection-restored":
			return {
				...state,
				connection: "connected",
				errorMessage: null,
			};
		case "update-accepted": {
			if (action.update.sequence !== state.acquisitionCursor + 1) {
				return requestRecovery(state);
			}

			if (state.mode === "live") {
				return {
					...state,
					acquisitionCursor: action.update.sequence,
					presentationCursor: action.update.sequence,
					lastValidSnapshot: action.update.snapshot,
					presentedSnapshot: action.update.snapshot,
					connection: "connected",
					needsFreshSnapshot: false,
					errorMessage: null,
				};
			}
			if (state.bufferedUpdates.length >= MAX_BUFFERED_UPDATES) {
				return requestRecovery(state);
			}

			return {
				...state,
				acquisitionCursor: action.update.sequence,
				lastValidSnapshot: action.update.snapshot,
				bufferedUpdates: [...state.bufferedUpdates, action.update],
				connection: "connected",
				needsFreshSnapshot: false,
				errorMessage: null,
			};
		}
		case "recovery-requested":
			return requestRecovery(state);
		case "pause":
			return state.presentedSnapshot ? { ...state, mode: "paused" } : state;
		case "resume":
			return {
				...state,
				mode: state.bufferedUpdates.length > 0 ? "behind-live" : "live",
			};
		case "present-next": {
			if (state.mode !== "behind-live") {
				return state;
			}
			const [next, ...remaining] = state.bufferedUpdates;
			if (!next) {
				return { ...state, mode: "live" };
			}
			return {
				...state,
				mode: remaining.length === 0 ? "live" : "behind-live",
				presentationCursor: next.sequence,
				presentedSnapshot: next.snapshot,
				bufferedUpdates: remaining,
			};
		}
		case "jump-live-requested":
			return requestRecovery(state);
		case "retry":
			return requestRecovery(state);
		case "follow":
			return {
				...state,
				followedResidentId: action.residentId,
				followedResidentName: action.residentName,
				manualPan: false,
			};
		case "unfollow":
			return {
				...state,
				followedResidentId: null,
				followedResidentName: null,
			};
		case "manual-pan-started":
			return {
				...state,
				followedResidentId: null,
				followedResidentName: null,
				manualPan: true,
				announcement: state.followedResidentName
					? `Stopped following ${state.followedResidentName}`
					: state.announcement,
			};
		case "manual-pan-ended":
			return { ...state, manualPan: false };
		case "clear-announcement":
			return { ...state, announcement: null };
	}
}
