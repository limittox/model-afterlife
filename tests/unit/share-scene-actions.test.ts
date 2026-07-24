import { describe, expect, it, vi } from "vitest";
import {
	prepareCanonicalSceneUrl,
	runShareSceneAction,
} from "../../src/features/publication/client/ShareSceneActions.tsx";

const canonicalUrl =
	"https://afterlife.example/scenes/original-revision-with-a-deliberately-long-unicode-title-%E9%9B%AA";

describe("ShareSceneActions", () => {
	it("prepares one full canonical address without changing Unicode URL encoding", () => {
		expect(
			prepareCanonicalSceneUrl(
				"/scenes/original-revision-with-a-deliberately-long-unicode-title-%E9%9B%AA",
				"https://afterlife.example/live?ignored=true",
			),
		).toBe(canonicalUrl);
	});

	it("uses native share successfully without touching the clipboard", async () => {
		const share = vi.fn().mockResolvedValue(undefined);
		const writeClipboard = vi.fn().mockResolvedValue(undefined);

		await expect(
			runShareSceneAction({
				action: "share",
				url: canonicalUrl,
				capability: { share, writeClipboard },
			}),
		).resolves.toBe("shared");
		expect(share).toHaveBeenCalledExactlyOnceWith({
			title: "Model Afterlife · Canonical scene",
			text: "A staged fictional scene from Model Afterlife.",
			url: canonicalUrl,
		});
		expect(writeClipboard).not.toHaveBeenCalled();
	});

	it("keeps Copy scene link independent when native share exists", async () => {
		const share = vi.fn().mockResolvedValue(undefined);
		const writeClipboard = vi.fn().mockResolvedValue(undefined);

		await expect(
			runShareSceneAction({
				action: "copy",
				url: canonicalUrl,
				capability: { share, writeClipboard },
			}),
		).resolves.toBe("copied");
		expect(share).not.toHaveBeenCalled();
		expect(writeClipboard).toHaveBeenCalledExactlyOnceWith(canonicalUrl);
	});

	it("falls back to clipboard when Web Share is unavailable", async () => {
		const writeClipboard = vi.fn().mockResolvedValue(undefined);

		await expect(
			runShareSceneAction({
				action: "share",
				url: canonicalUrl,
				capability: { writeClipboard },
			}),
		).resolves.toBe("copied");
		expect(writeClipboard).toHaveBeenCalledExactlyOnceWith(canonicalUrl);
	});

	it("falls back to clipboard after a non-cancellation share failure", async () => {
		const share = vi.fn().mockRejectedValue(new Error("permission denied"));
		const writeClipboard = vi.fn().mockResolvedValue(undefined);

		await expect(
			runShareSceneAction({
				action: "share",
				url: canonicalUrl,
				capability: { share, writeClipboard },
			}),
		).resolves.toBe("copied");
		expect(writeClipboard).toHaveBeenCalledExactlyOnceWith(canonicalUrl);
	});

	it("reports automatic copy failure so the already-visible URL remains the fallback", async () => {
		const writeClipboard = vi.fn().mockRejectedValue(new Error("blocked"));

		await expect(
			runShareSceneAction({
				action: "copy",
				url: canonicalUrl,
				capability: { writeClipboard },
			}),
		).resolves.toBe("copy-failed");
	});

	it("treats AbortError as a silent terminal result with no clipboard fallback", async () => {
		const share = vi
			.fn()
			.mockRejectedValue(new DOMException("cancelled", "AbortError"));
		const writeClipboard = vi.fn().mockResolvedValue(undefined);

		await expect(
			runShareSceneAction({
				action: "share",
				url: canonicalUrl,
				capability: { share, writeClipboard },
			}),
		).resolves.toBe("cancelled");
		expect(writeClipboard).not.toHaveBeenCalled();
	});

	it("ignores a stale completion after the observed scene target changes", async () => {
		let current = true;
		let finishShare: (() => void) | undefined;
		const share = vi.fn(
			() =>
				new Promise<void>((resolve) => {
					finishShare = resolve;
				}),
		);
		const operation = runShareSceneAction({
			action: "share",
			url: canonicalUrl,
			capability: { share },
			isCurrent: () => current,
		});

		current = false;
		finishShare?.();
		await expect(operation).resolves.toBe("stale");
	});
});
