"use client";

import { useEffect, useId, useRef, useState } from "react";

export type ShareSceneCapability = {
	share?: (data: ShareData) => Promise<void>;
	writeClipboard?: (text: string) => Promise<void>;
};

export type ShareSceneActionResult =
	| "shared"
	| "copied"
	| "cancelled"
	| "copy-failed"
	| "stale";

function isAbortError(error: unknown): boolean {
	return error instanceof DOMException
		? error.name === "AbortError"
		: typeof error === "object" &&
				error !== null &&
				"name" in error &&
				error.name === "AbortError";
}

export function prepareCanonicalSceneUrl(
	canonicalHref: string,
	baseHref: string,
): string {
	return new URL(canonicalHref, baseHref).href;
}

export async function runShareSceneAction({
	action,
	url,
	capability,
	isCurrent = () => true,
}: {
	action: "share" | "copy";
	url: string;
	capability: ShareSceneCapability;
	isCurrent?: () => boolean;
}): Promise<ShareSceneActionResult> {
	if (action === "share" && capability.share) {
		try {
			await capability.share({
				title: "Model Afterlife · Canonical scene",
				text: "A staged fictional scene from Model Afterlife.",
				url,
			});
			return isCurrent() ? "shared" : "stale";
		} catch (error) {
			if (!isCurrent()) return "stale";
			if (isAbortError(error)) return "cancelled";
		}
	}

	if (!isCurrent()) return "stale";
	if (!capability.writeClipboard) return "copy-failed";

	try {
		await capability.writeClipboard(url);
		return isCurrent() ? "copied" : "stale";
	} catch {
		return isCurrent() ? "copy-failed" : "stale";
	}
}

function browserCapability(): ShareSceneCapability {
	return {
		share:
			typeof navigator.share === "function"
				? (data) => navigator.share(data)
				: undefined,
		writeClipboard:
			typeof navigator.clipboard?.writeText === "function"
				? (text) => navigator.clipboard.writeText(text)
				: undefined,
	};
}

export function ShareSceneActions({
	canonicalHref,
}: {
	canonicalHref: string | null;
}) {
	const addressLabelId = useId();
	const [preparedUrl, setPreparedUrl] = useState<string | null>(null);
	const [status, setStatus] = useState<{
		kind: "shared" | "copied" | "copy-failed";
		href: string;
	} | null>(null);
	const [preparing, setPreparing] = useState(false);
	const [busy, setBusy] = useState(false);
	const targetGeneration = useRef(0);
	const activeOperation = useRef(0);
	const busyRef = useRef(false);
	const currentHref = useRef(canonicalHref);
	const mounted = useRef(true);
	currentHref.current = canonicalHref;

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
			activeOperation.current += 1;
		};
	}, []);

	useEffect(() => {
		targetGeneration.current += 1;
		activeOperation.current += 1;
		busyRef.current = false;
		setBusy(false);
		setStatus(null);
		setPreparedUrl(null);
		if (!canonicalHref) {
			setPreparing(false);
			return;
		}

		const generation = targetGeneration.current;
		setPreparing(true);
		queueMicrotask(() => {
			if (generation !== targetGeneration.current) return;
			setPreparedUrl(
				prepareCanonicalSceneUrl(canonicalHref, window.location.href),
			);
			setPreparing(false);
		});
	}, [canonicalHref]);

	if (!canonicalHref) return null;

	const displayedUrl = preparedUrl ?? canonicalHref;
	const run = async (action: "share" | "copy") => {
		if (!preparedUrl || busyRef.current) return;

		busyRef.current = true;
		setBusy(true);
		setStatus(null);
		const target = targetGeneration.current;
		const targetHref = canonicalHref;
		const operation = ++activeOperation.current;
		const isCurrent = () =>
			mounted.current &&
			targetHref === currentHref.current &&
			target === targetGeneration.current &&
			operation === activeOperation.current;
		const result = await runShareSceneAction({
			action,
			url: preparedUrl,
			capability: browserCapability(),
			isCurrent,
		});
		if (!isCurrent()) return;

		if (result === "shared" || result === "copied") {
			setStatus({ kind: result, href: targetHref });
		} else if (result === "copy-failed") {
			setStatus({ kind: "copy-failed", href: targetHref });
		}
		busyRef.current = false;
		setBusy(false);
	};
	const visibleStatus = status?.href === canonicalHref ? status.kind : null;

	return (
		<section className="share-scene-actions" aria-label="Share current scene">
			<div className="share-action-buttons">
				<button
					type="button"
					disabled={preparing || busy}
					onClick={() => void run("share")}
				>
					Share this scene
				</button>
				<button
					type="button"
					disabled={preparing || busy}
					onClick={() => void run("copy")}
				>
					Copy scene link
				</button>
			</div>
			{preparing ? (
				<p className="share-status" role="status">
					Preparing scene link…
				</p>
			) : null}
			{visibleStatus === "shared" ? (
				<p className="share-status" role="status">
					Scene shared.
				</p>
			) : null}
			{visibleStatus === "copied" ? (
				<p className="share-status" role="status">
					Scene link copied
				</p>
			) : null}
			{visibleStatus === "copy-failed" ? (
				<p className="share-status share-status-error" role="status">
					The link could not be copied automatically. Select and copy the scene
					address below.
				</p>
			) : null}
			<div className="scene-address">
				<label htmlFor={addressLabelId}>Scene address</label>
				<textarea
					id={addressLabelId}
					value={displayedUrl}
					readOnly
					rows={3}
					onFocus={(event) => event.currentTarget.select()}
				/>
			</div>
		</section>
	);
}
