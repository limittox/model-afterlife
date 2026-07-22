import type {
	PublicWorldSnapshot,
	PublicWorldUpdate,
} from "../contracts/public-world.ts";

export type PresentationMode = "live" | "paused" | "behind-live";
export type ConnectionState =
	| "opening"
	| "connected"
	| "reconnecting"
	| "error";
export type RecoveryReason = "gap" | "focus" | "reconnect" | "schema" | "parse";
export type SnapshotReason =
	| "bootstrap"
	| "jump-live"
	| "retry"
	| RecoveryReason;

export type PresentationState = {
	mode: PresentationMode;
	acquisitionCursor: number;
	presentationCursor: number;
	lastValidSnapshot: PublicWorldSnapshot | null;
	presentedSnapshot: PublicWorldSnapshot | null;
	bufferedUpdates: PublicWorldUpdate[];
	followedResidentId: string | null;
	followedResidentName: string | null;
	manualPan: boolean;
	connection: ConnectionState;
	announcement: string | null;
	needsFreshSnapshot: boolean;
	snapshotRequestGeneration: number;
	snapshotReason: SnapshotReason;
	errorMessage: string | null;
};

export type PresentationAction =
	| {
			type: "snapshot-accepted";
			snapshot: PublicWorldSnapshot;
			reason: SnapshotReason;
			requestGeneration?: number;
	  }
	| { type: "snapshot-rejected"; requestGeneration?: number }
	| { type: "connection-restored" }
	| { type: "update-accepted"; update: PublicWorldUpdate }
	| { type: "recovery-requested"; reason: RecoveryReason }
	| { type: "pause" }
	| { type: "resume" }
	| { type: "present-next" }
	| { type: "jump-live-requested" }
	| { type: "retry" }
	| { type: "follow"; residentId: string; residentName: string }
	| { type: "unfollow" }
	| { type: "manual-pan-started" }
	| { type: "manual-pan-ended" }
	| { type: "camera-settled"; announcement: string | null }
	| { type: "clear-announcement" };
