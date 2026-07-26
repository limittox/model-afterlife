import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import rawAssetManifest from "../../public/art/manifest.json";
import { parseProductionAssetManifest } from "../../src/features/world/renderer/asset-manifest.ts";
import {
	getResidentProductionAsset,
	PRODUCTION_ASSET_MANIFEST,
	selectResidentProductionFrame,
} from "../../src/features/world/renderer/production-assets.ts";

describe("production asset manifest pilot", () => {
	it("validates the bounded 352x256 manifest and GPT-4o frame contract", () => {
		const parsed = parseProductionAssetManifest(rawAssetManifest);
		expect(parsed.success).toBe(true);
		if (!parsed.success) return;

		expect(parsed.data).toMatchObject({
			schemaVersion: 1,
			status: "pilot",
			world: { width: 352, height: 256, tileSize: 16 },
		});
		expect(parsed.data.residents).toHaveLength(1);
		expect(parsed.data.residents[0]).toMatchObject({
			id: "gpt-4o",
			visualVariant: "amber-waistcoat-short-stack",
			textureKey: "resident-gpt-4o-pilot",
			path: "/art/residents/gpt-4o-pilot.png",
			sha256:
				"ee3d3349c5efab355b401382d99d197c46ded9d5138cbf3a8b57fedfc2178e61",
			dimensions: { width: 120, height: 64 },
			grid: {
				columns: 5,
				rows: 2,
				frameWidth: 24,
				frameHeight: 32,
				frameCount: 10,
			},
			states: {
				neutral: { frames: [0], reducedMotionFrame: 9 },
				seated: { frames: [1], reducedMotionFrame: 1 },
				listen: { frames: [2], reducedMotionFrame: 2 },
				speak: { frames: [3, 4], reducedMotionFrame: 3 },
				walk: { frames: [5, 6, 7, 8], reducedMotionFrame: 9 },
			},
		});
	});

	it("rejects private generation metadata and malformed sprite geometry", () => {
		const withPrompt = structuredClone(rawAssetManifest) as Record<
			string,
			unknown
		>;
		withPrompt.prompt = "must not be published in the runtime manifest";
		expect(parseProductionAssetManifest(withPrompt)).toEqual({
			success: false,
			error: "Runtime asset manifest contains private generation metadata",
		});

		const malformed = structuredClone(rawAssetManifest);
		const [resident] = malformed.residents;
		expect(resident).toBeDefined();
		if (!resident) return;
		resident.grid.frameWidth = 25;
		expect(parseProductionAssetManifest(malformed)).toEqual({
			success: false,
			error: "Runtime resident asset entry is invalid",
		});
	});

	it("matches residents by stable identity and preserves procedural fallback", () => {
		expect(PRODUCTION_ASSET_MANIFEST?.status).toBe("pilot");
		expect(
			getResidentProductionAsset({
				id: "gpt-4o",
				variant: "amber-waistcoat-short-stack",
			})?.textureKey,
		).toBe("resident-gpt-4o-pilot");
		expect(
			getResidentProductionAsset({
				id: "claude-sonnet-4.5",
				variant: "navy-cardigan-tall-bookish",
			}),
		).toBeNull();
		expect(
			getResidentProductionAsset({
				id: "gpt-4o",
				variant: "navy-cardigan-tall-bookish",
			}),
		).toBeNull();
	});

	it("uses speaking frames only for the active speaker and static reduced-motion frames", () => {
		const asset = PRODUCTION_ASSET_MANIFEST?.residents[0];
		expect(asset).toBeDefined();
		if (!asset) return;

		expect(
			selectResidentProductionFrame(asset, {
				activeSpeaker: false,
				reducedMotion: false,
				animationStep: 83,
			}),
		).toBe(0);
		expect(
			[0, 1, 2, 3].map((animationStep) =>
				selectResidentProductionFrame(asset, {
					activeSpeaker: true,
					reducedMotion: false,
					animationStep,
				}),
			),
		).toEqual([3, 4, 3, 4]);
		expect(
			selectResidentProductionFrame(asset, {
				activeSpeaker: false,
				reducedMotion: true,
				animationStep: 1,
			}),
		).toBe(9);
		expect(
			selectResidentProductionFrame(asset, {
				activeSpeaker: true,
				reducedMotion: true,
				animationStep: 1,
			}),
		).toBe(3);
	});

	it("pins the checked-in runtime atlas to the reviewed manifest hash", async () => {
		const atlas = await readFile("public/art/residents/gpt-4o-pilot.png");
		expect(createHash("sha256").update(atlas).digest("hex")).toBe(
			PRODUCTION_ASSET_MANIFEST?.residents[0]?.sha256,
		);
	});
});
