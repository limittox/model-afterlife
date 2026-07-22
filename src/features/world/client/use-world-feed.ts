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
import type { RecoveryReason } from "./presentation-types.ts";

class WorldFeedRequestError extends Error {}
class WorldSchemaMismatchError extends Error {}

async function readJson(response: Response): Promise<unknown> {
	if (!response.ok) {
		throw new WorldFeedRequestError(
			`The world feed returned ${response.status}.`,
		);
	}
	return response.json();
}

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
	const handledUpdatesAt = useRef(0);
	const handledSnapshotAt = useRef(0);

	const snapshotQuery = useQuery({
		queryKey: ["world", "snapshot", state.snapshotRequestGeneration],
		queryFn: async () => ({
			snapshot: await fetchSnapshot(),
			requestGeneration: state.snapshotRequestGeneration,
			reason: state.snapshotReason,
		}),
		enabled: state.needsFreshSnapshot,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
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
		},
		[],
	);

	useEffect(() => {
		const result = snapshotQuery.data;
		if (
			!result ||
			snapshotQuery.dataUpdatedAt <= handledSnapshotAt.current
		) {
			return;
		}
		handledSnapshotAt.current = snapshotQuery.dataUpdatedAt;
		if (
			result.requestGeneration !== state.snapshotRequestGeneration ||
			result.snapshot.throughSequence < state.acquisitionCursor ||
			(state.lastValidSnapshot !== null &&
				result.snapshot.worldId !== state.lastValidSnapshot.worldId)
		) {
			requestRecovery("gap");
			return;
		}
		dispatch({
			type: "snapshot-accepted",
			snapshot: result.snapshot,
			reason: result.reason,
			requestGeneration: result.requestGeneration,
		});
	}, [
		requestRecovery,
		snapshotQuery.data,
		snapshotQuery.dataUpdatedAt,
		state.acquisitionCursor,
		state.lastValidSnapshot,
		state.snapshotRequestGeneration,
	]);

	useEffect(() => {
		if (snapshotQuery.isError) {
			dispatch({
				type: "snapshot-rejected",
				requestGeneration: state.snapshotRequestGeneration,
			});
		}
	}, [snapshotQuery.isError, state.snapshotRequestGeneration]);

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
			if (updatesQuery.error instanceof WorldFeedRequestError) {
				dispatch({ type: "snapshot-rejected" });
			} else {
				requestRecovery(
					updatesQuery.error instanceof WorldSchemaMismatchError
						? "schema"
						: "parse",
				);
			}
		}
	}, [requestRecovery, updatesQuery.error, updatesQuery.isError]);

	useEffect(() => {
		function handleFocus() {
			requestRecovery("focus");
		}
		function handleOnline() {
			requestRecovery("reconnect");
		}
		window.addEventListener("focus", handleFocus);
		window.addEventListener("online", handleOnline);
		return () => {
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("online", handleOnline);
		};
	}, [requestRecovery]);

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
