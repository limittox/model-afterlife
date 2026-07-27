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
import { projectResidents } from "../../src/features/world/renderer/world-layout.ts";
import { activeSceneState } from "../../src/features/world/fixtures/ui-states.ts";

const EXPECTED_RESIDENT_ASSETS = [
	{
		id: "gpt-4o",
		variant: "amber-waistcoat-short-stack",
		hash: "ee3d3349c5efab355b401382d99d197c46ded9d5138cbf3a8b57fedfc2178e61",
	},
	{
		id: "claude-sonnet-4.5",
		variant: "navy-cardigan-tall-bookish",
		hash: "a639da96f4e3d5aee2ad97b10db1bcd1a5ecf2ee5cb1ebc96316c8b55dc58d49",
	},
	{
		id: "gemini-2.5-pro",
		variant: "violet-shawl-round-satchel",
		hash: "cd2bb9cb3ae0d7bfed0319da1c4b058c5ca1e0ad948d57a3a28fe85b5521d12d",
	},
	{
		id: "deepseek-v3.2",
		variant: "teal-apron-square-glasses",
		hash: "2011075ca3d9a876581a4081d2307ac22bc9c19ed2e761d969ff6db0c7addf8d",
	},
	{
		id: "llama-3.3-70b-instruct",
		variant: "rust-overalls-broad-brim",
		hash: "b640441d9252d84f6bba3dd767ba3d5a65178f5fa9a923171bd577b79dd2a2c9",
	},
	{
		id: "qwen3-235b-a22b-2507",
		variant: "jade-coat-many-tabbed-satchel",
		hash: "6f2dbdcade35aa5b4bcbfe2b9cdef63926046773b6d70b3c2b6e3961c0952862",
	},
] as const;

describe("production resident asset manifest", () => {
	it("validates the expanded world and all six resident frame contracts", () => {
		const parsed = parseProductionAssetManifest(rawAssetManifest);
		expect(parsed.success).toBe(true);
		if (!parsed.success) return;

		expect(parsed.data).toMatchObject({
			schemaVersion: 1,
			status: "pilot",
			world: { width: 512, height: 384, tileSize: 16 },
		});
		expect(parsed.data.residents).toHaveLength(6);
		expect(parsed.data.artwork).toEqual([
			expect.objectContaining({
				id: "home-establishing",
				path: "/art/home/model-afterlife-home.svg",
				dimensions: { width: 512, height: 384 },
			}),
			expect.objectContaining({
				id: "social-preview-frame",
				path: "/art/social/model-afterlife-social-card.svg",
				dimensions: { width: 1200, height: 630 },
			}),
		]);
		expect(
			parsed.data.residents.map(({ id, visualVariant, sha256 }) => ({
				id,
				variant: visualVariant,
				hash: sha256,
			})),
		).toEqual(EXPECTED_RESIDENT_ASSETS);
		for (const resident of parsed.data.residents) {
			expect(resident).toMatchObject({
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
		}
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
			})?.textureKey,
		).toBe("resident-claude-sonnet-4-5-pilot");
		expect(
			getResidentProductionAsset({
				id: "future-resident",
				variant: "amber-waistcoat-short-stack",
			}),
		).toBeNull();
	});

	it("selects every explicit pose and a stable reduced-motion still", () => {
		const asset = PRODUCTION_ASSET_MANIFEST?.residents[0];
		expect(asset).toBeDefined();
		if (!asset) return;

		expect(
			selectResidentProductionFrame(asset, {
				state: "neutral",
				reducedMotion: false,
				animationStep: 83,
			}),
		).toBe(0);
		expect(
			[0, 1, 2, 3].map((animationStep) =>
				selectResidentProductionFrame(asset, {
					state: "speak",
					reducedMotion: false,
					animationStep,
				}),
			),
		).toEqual([3, 4, 3, 4]);
		expect(
			selectResidentProductionFrame(asset, {
				state: "neutral",
				reducedMotion: true,
				animationStep: 1,
			}),
		).toBe(9);
		expect(
			selectResidentProductionFrame(asset, {
				state: "speak",
				reducedMotion: true,
				animationStep: 1,
			}),
		).toBe(3);
		for (const state of [
			"neutral",
			"seated",
			"listen",
			"speak",
			"walk",
		] as const) {
			expect(
				selectResidentProductionFrame(asset, {
					state,
					reducedMotion: true,
					animationStep: 999,
				}),
			).toBe(asset.states[state].reducedMotionFrame);
		}
	});

	it("projects stable discrete pose, facing, and movement intent for every resident", () => {
		const snapshot = activeSceneState.snapshot;
		expect(snapshot).not.toBeNull();
		if (!snapshot) return;
		const residents = projectResidents(snapshot.residents);
		expect(
			residents.map(({ id, pose, facing, movementIntent }) => ({
				id,
				pose,
				facing,
				movementIntent,
			})),
		).toEqual([
			{
				id: "gpt-4o",
				pose: "seated",
				facing: "right",
				movementIntent: "settled",
			},
			{
				id: "claude-sonnet-4.5",
				pose: "seated",
				facing: "left",
				movementIntent: "settled",
			},
			{
				id: "gemini-2.5-pro",
				pose: "listen",
				facing: "left",
				movementIntent: "listening",
			},
			{
				id: "deepseek-v3.2",
				pose: "walk",
				facing: "right",
				movementIntent: "walking",
			},
			{
				id: "llama-3.3-70b-instruct",
				pose: "neutral",
				facing: "right",
				movementIntent: "idle",
			},
			{
				id: "qwen3-235b-a22b-2507",
				pose: "listen",
				facing: "left",
				movementIntent: "listening",
			},
		]);
	});

	it("pins every checked-in runtime atlas to its manifest hash", async () => {
		for (const resident of PRODUCTION_ASSET_MANIFEST?.residents ?? []) {
			const atlas = await readFile(`public${resident.path}`);
			expect(createHash("sha256").update(atlas).digest("hex")).toBe(
				resident.sha256,
			);
		}
	});

	it("keeps the editable and runtime home artwork byte-identical", async () => {
		const [source, runtime] = await Promise.all([
			readFile("art-src/home/model-afterlife-home.svg"),
			readFile("public/art/home/model-afterlife-home.svg"),
		]);
		expect(createHash("sha256").update(source).digest("hex")).toBe(
			createHash("sha256").update(runtime).digest("hex"),
		);
		expect(source.equals(runtime)).toBe(true);
	});
});
