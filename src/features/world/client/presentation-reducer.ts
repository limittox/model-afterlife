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
		snapshotRequestGeneration: 0,
		snapshotReason: "bootstrap",
		errorMessage: null,
	};
}

function requestRecovery(
	state: PresentationState,
	reason: PresentationState["snapshotReason"],
	forceNewRequest = false,
): PresentationState {
	if (state.needsFreshSnapshot && !forceNewRequest) return state;
	return {
		...state,
		connection: state.lastValidSnapshot ? "reconnecting" : "opening",
		needsFreshSnapshot: true,
		snapshotRequestGeneration: state.snapshotRequestGeneration + 1,
		snapshotReason: reason,
		errorMessage: null,
	};
}

export function presentationReducer(
	state: PresentationState,
	action: PresentationAction,
): PresentationState {
	switch (action.type) {
		case "snapshot-accepted": {
			if (
				(action.requestGeneration !== undefined &&
					action.requestGeneration !== state.snapshotRequestGeneration) ||
				action.snapshot.throughSequence < state.acquisitionCursor ||
				(state.lastValidSnapshot !== null &&
					action.snapshot.worldId !== state.lastValidSnapshot.worldId)
			) {
				return state;
			}
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
				announcement:
					action.reason === "jump-live"
						? CAUGHT_UP_TO_LIVE
						: state.announcement,
				needsFreshSnapshot: false,
				errorMessage: null,
			};
		}
		case "snapshot-rejected":
			if (
				action.requestGeneration !== undefined &&
				action.requestGeneration !== state.snapshotRequestGeneration
			) {
				return state;
			}
			return {
				...state,
				connection: state.lastValidSnapshot ? "reconnecting" : "error",
				needsFreshSnapshot: false,
				errorMessage: state.lastValidSnapshot
					? "The live feed is having trouble. You’re viewing the last known state while we reconnect."
					: "The home couldn’t load. Try loading again.",
			};
		case "connection-restored":
			if (state.needsFreshSnapshot) return state;
			return {
				...state,
				connection: "connected",
				errorMessage: null,
			};
		case "update-accepted": {
			if (action.update.sequence !== state.acquisitionCursor + 1) {
				return requestRecovery(state, "gap");
			}

			if (state.mode === "live") {
				return {
					...state,
					acquisitionCursor: action.update.sequence,
					presentationCursor: action.update.sequence,
					lastValidSnapshot: action.update.snapshot,
					presentedSnapshot: action.update.snapshot,
					connection: state.needsFreshSnapshot ? "reconnecting" : "connected",
					needsFreshSnapshot: state.needsFreshSnapshot,
					errorMessage: null,
				};
			}
			if (state.bufferedUpdates.length >= MAX_BUFFERED_UPDATES) {
				return requestRecovery(state, "gap");
			}

			return {
				...state,
				acquisitionCursor: action.update.sequence,
				lastValidSnapshot: action.update.snapshot,
				bufferedUpdates: [...state.bufferedUpdates, action.update],
				connection: state.needsFreshSnapshot ? "reconnecting" : "connected",
				needsFreshSnapshot: state.needsFreshSnapshot,
				errorMessage: null,
			};
		}
		case "recovery-requested":
			return requestRecovery(state, action.reason, true);
		case "pause":
			return state.presentedSnapshot
				? { ...state, mode: "paused", announcement: "Presentation paused." }
				: state;
		case "resume":
			return {
				...state,
				mode: state.bufferedUpdates.length > 0 ? "behind-live" : "live",
				announcement:
					state.bufferedUpdates.length > 0
						? "Presentation resumed behind live."
						: "Presentation resumed.",
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
			return requestRecovery(state, "jump-live", true);
		case "retry":
			return requestRecovery(state, "retry", true);
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
		case "camera-settled":
			return {
				...state,
				manualPan: false,
				announcement: action.announcement ?? state.announcement,
			};
		case "clear-announcement":
			return { ...state, announcement: null };
	}
}
