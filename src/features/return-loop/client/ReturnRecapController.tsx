"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
	ReturnRecapResponseSchema,
	type ReturnRecapResponse,
} from "../../publication/contracts/public-publication.ts";
import type { PublicWorldSnapshot } from "../../world/contracts/public-world.ts";
import { ObserverNavigation } from "../../world/components/ObserverNavigation.tsx";
import {
	ReturnRecap,
	type ReturnRecapViewState,
} from "../components/ReturnRecap.tsx";
import {
	baselineMarker,
	LAST_VISIT_STORAGE_KEY,
	markerDisposition,
	parseLastVisitMarker,
	readLastVisitMarker,
	writeLastVisitMarker,
} from "./last-visit-marker.ts";

type ControllerState =
	| { kind: "idle" }
	| { kind: "loading"; worldId: string; afterSequence: number }
	| {
			kind: "error";
			worldId: string;
			afterSequence: number;
			message: string;
	  }
	| { kind: "ready"; recap: ReturnRecapResponse; open: boolean };

async function fetchRecap(
	worldId: string,
	afterSequence: number,
	signal?: AbortSignal,
): Promise<ReturnRecapResponse> {
	const response = await fetch(
		`/api/recap?worldId=${encodeURIComponent(worldId)}&after=${afterSequence}`,
		{ method: "GET", cache: "no-store", signal },
	);
	if (!response.ok) {
		throw new Error(`The recap request returned ${response.status}.`);
	}
	return ReturnRecapResponseSchema.parse(await response.json());
}

export function ReturnRecapController({
	snapshot,
	onJumpLive,
}: {
	snapshot: PublicWorldSnapshot | null;
	onJumpLive: () => void;
}) {
	const [state, setState] = useState<ControllerState>({ kind: "idle" });
	const initializedWorld = useRef<string | null>(null);
	const recapActionRef = useRef<HTMLButtonElement | null>(null);
	const acknowledgedBoundary = useRef<string | null>(null);

	const loadRecap = useCallback(
		async (
			worldId: string,
			afterSequence: number,
			signal?: AbortSignal,
		) => {
			setState({ kind: "loading", worldId, afterSequence });
			try {
				const recap = await fetchRecap(worldId, afterSequence, signal);
				if (signal?.aborted) return;
				if (recap.worldId !== worldId || recap.afterSequence !== afterSequence) {
					throw new Error("The recap response did not match its request.");
				}
				if (recap.beats.length === 0) {
					writeLastVisitMarker(window.localStorage, {
						version: 1,
						worldId: recap.worldId,
						throughSequence: recap.throughSequence,
					});
					setState({ kind: "idle" });
					return;
				}
				setState({ kind: "ready", recap, open: true });
			} catch {
				if (signal?.aborted) return;
				setState({
					kind: "error",
					worldId,
					afterSequence,
					message:
						"The recap could not be loaded. The live home is still available.",
				});
			}
		},
		[],
	);

	useEffect(() => {
		if (!snapshot || initializedWorld.current === snapshot.worldId) return;
		initializedWorld.current = snapshot.worldId;
		const baseline = baselineMarker(snapshot);
		if (!baseline) return;
		const stored = readLastVisitMarker(window.localStorage);
		if (stored.kind !== "present") {
			if (stored.kind !== "unavailable") {
				writeLastVisitMarker(window.localStorage, baseline);
			}
			return;
		}
		const disposition = markerDisposition(stored.marker, snapshot);
		if (disposition === "reset") {
			writeLastVisitMarker(window.localStorage, baseline);
			return;
		}
		if (disposition === "current") return;
		void loadRecap(
			stored.marker.worldId,
			stored.marker.throughSequence,
		);
	}, [loadRecap, snapshot]);

	useEffect(() => {
		function onStorage(event: StorageEvent) {
			if (
				event.key !== LAST_VISIT_STORAGE_KEY ||
				event.newValue === null ||
				state.kind !== "ready" ||
				state.open
			) {
				return;
			}
			const marker = parseLastVisitMarker(event.newValue);
			if (
				marker?.worldId === state.recap.worldId &&
				marker.throughSequence >= state.recap.throughSequence
			) {
				setState({ kind: "idle" });
			}
		}
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, [state]);

	const viewState: ReturnRecapViewState | null =
		state.kind === "loading"
			? { kind: "loading" }
			: state.kind === "error"
				? { kind: "error", message: state.message }
				: state.kind === "ready" && state.open
					? { kind: "ready", recap: state.recap }
					: null;

	const reviewLater = () => {
		if (state.kind !== "ready") return;
		setState({ ...state, open: false });
		window.setTimeout(() => recapActionRef.current?.focus(), 0);
	};
	const dismiss = () => {
		if (state.kind !== "ready") return;
		const boundary = `${state.recap.worldId}:${state.recap.throughSequence}`;
		if (acknowledgedBoundary.current === boundary) return;
		if (
			writeLastVisitMarker(window.localStorage, {
				version: 1,
				worldId: state.recap.worldId,
				throughSequence: state.recap.throughSequence,
			})
		) {
			acknowledgedBoundary.current = boundary;
			setState({ kind: "idle" });
		} else {
			setState({ ...state, open: false });
		}
	};

	return (
		<>
			<ObserverNavigation
				hasRecap={state.kind === "ready"}
				recapOpen={state.kind === "ready" && state.open}
				onOpenRecap={() => {
					if (state.kind === "ready") setState({ ...state, open: true });
				}}
				recapActionRef={recapActionRef}
			/>
			{viewState ? (
				<ReturnRecap
					state={viewState}
					onRetry={() => {
						if (state.kind === "error") {
							void loadRecap(state.worldId, state.afterSequence);
						}
					}}
					onReviewLater={reviewLater}
					onDismiss={dismiss}
					onJumpLive={() => {
						if (state.kind === "ready") {
							setState({ ...state, open: false });
						}
						onJumpLive();
					}}
				/>
			) : null}
		</>
	);
}
