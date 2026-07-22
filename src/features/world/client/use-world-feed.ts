"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
	PublicWorldSnapshotSchema,
	PublicWorldUpdatesSchema,
} from "../contracts/public-world.ts";
import {
	createInitialPresentationState,
	presentationReducer,
} from "./presentation-reducer.ts";
import type { RecoveryReason, SnapshotReason } from "./presentation-types.ts";

async function readJson(response: Response): Promise<unknown> {
	if (!response.ok) {
		throw new Error(`The world feed returned ${response.status}.`);
	}
	return response.json();
}

class WorldSchemaMismatchError extends Error {}

async function fetchSnapshot() {
	const response = await fetch("/api/world/snapshot", {
		method: "GET",
		cache: "no-store",
	});
	return PublicWorldSnapshotSchema.parse(await readJson(response));
}

async function fetchUpdates(after: number) {
	const response = await fetch(`/api/world/updates?after=${after}`, {
		method: "GET",
		cache: "no-store",
	});
	const payload = await readJson(response);
	if (
		typeof payload === "object" &&
		payload !== null &&
		"schemaVersion" in payload &&
		payload.schemaVersion !== 1
	) {
		throw new WorldSchemaMismatchError("Unsupported world schema version.");
	}
	return PublicWorldUpdatesSchema.parse(payload);
}

export function useWorldFeed() {
	const [state, dispatch] = useReducer(presentationReducer, undefined, () =>
		createInitialPresentationState(),
	);
	const snapshotReason = useRef<SnapshotReason>("bootstrap");
	const handledSnapshotAt = useRef(0);
	const handledUpdatesAt = useRef(0);

	const snapshotQuery = useQuery({
		queryKey: ["world", "snapshot"],
		queryFn: fetchSnapshot,
		refetchOnWindowFocus: "always",
		refetchOnReconnect: "always",
	});

	const updatesQuery = useQuery({
		queryKey: ["world", "updates", state.acquisitionCursor],
		queryFn: () => fetchUpdates(state.acquisitionCursor),
		enabled: state.lastValidSnapshot !== null && !state.needsFreshSnapshot,
		refetchInterval: 5_000,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	const requestRecovery = useCallback(
		(reason: RecoveryReason | "jump-live" | "retry") => {
			dispatch(
				reason === "jump-live"
					? { type: "jump-live-requested" }
					: reason === "retry"
						? { type: "retry" }
						: { type: "recovery-requested", reason },
			);
			snapshotReason.current = reason;
			void snapshotQuery.refetch();
		},
		[snapshotQuery.refetch],
	);

	useEffect(() => {
		if (
			snapshotQuery.data &&
			snapshotQuery.dataUpdatedAt > handledSnapshotAt.current
		) {
			handledSnapshotAt.current = snapshotQuery.dataUpdatedAt;
			dispatch({
				type: "snapshot-accepted",
				snapshot: snapshotQuery.data,
				reason: snapshotReason.current,
			});
			snapshotReason.current = "focus";
		}
	}, [snapshotQuery.data, snapshotQuery.dataUpdatedAt]);

	useEffect(() => {
		if (snapshotQuery.isError) {
			dispatch({ type: "snapshot-rejected" });
		}
	}, [snapshotQuery.isError]);

	useEffect(() => {
		const updates = updatesQuery.data;
		if (!updates || updatesQuery.dataUpdatedAt <= handledUpdatesAt.current) {
			return;
		}
		handledUpdatesAt.current = updatesQuery.dataUpdatedAt;

		if (updates.requiresSnapshot) {
			requestRecovery("gap");
			return;
		}

		for (const update of updates.updates) {
			dispatch({ type: "update-accepted", update });
		}
		dispatch({ type: "connection-restored" });
	}, [requestRecovery, updatesQuery.data, updatesQuery.dataUpdatedAt]);

	useEffect(() => {
		if (updatesQuery.isError) {
			requestRecovery(
				updatesQuery.error instanceof WorldSchemaMismatchError
					? "schema"
					: "parse",
			);
		}
	}, [requestRecovery, updatesQuery.error, updatesQuery.isError]);

	useEffect(() => {
		function handleFocus() {
			dispatch({ type: "recovery-requested", reason: "focus" });
			snapshotReason.current = "focus";
		}
		function handleOnline() {
			dispatch({ type: "recovery-requested", reason: "reconnect" });
			snapshotReason.current = "reconnect";
		}
		window.addEventListener("focus", handleFocus);
		window.addEventListener("online", handleOnline);
		return () => {
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("online", handleOnline);
		};
	}, []);

	useEffect(() => {
		if (state.mode !== "behind-live" || state.bufferedUpdates.length === 0) {
			return;
		}
		const timeout = window.setTimeout(
			() => dispatch({ type: "present-next" }),
			900,
		);
		return () => window.clearTimeout(timeout);
	}, [state.mode, state.bufferedUpdates.length]);

	return {
		state,
		dispatch,
		jumpToLive: () => requestRecovery("jump-live"),
		retry: () => requestRecovery("retry"),
	};
}
