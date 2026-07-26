import rawAssetManifest from "../../../../public/art/manifest.json";
import {
	parseProductionAssetManifest,
	type OriginalArtworkAsset,
	type ResidentProductionAsset,
} from "./asset-manifest.ts";
import type { RenderResident } from "./renderer-types.ts";

const parsedManifest = parseProductionAssetManifest(rawAssetManifest);

export const PRODUCTION_ASSET_MANIFEST = parsedManifest.success
	? parsedManifest.data
	: null;

export function getResidentProductionAsset(
	resident: Pick<RenderResident, "id" | "variant">,
): ResidentProductionAsset | null {
	return (
		PRODUCTION_ASSET_MANIFEST?.residents.find(
			(asset) =>
				asset.id === resident.id && asset.visualVariant === resident.variant,
		) ?? null
	);
}

export function getOriginalArtworkAsset(
	id: OriginalArtworkAsset["id"],
): OriginalArtworkAsset | null {
	return (
		PRODUCTION_ASSET_MANIFEST?.artwork.find((asset) => asset.id === id) ?? null
	);
}

export function selectResidentProductionFrame(
	asset: ResidentProductionAsset,
	options: {
		state: keyof ResidentProductionAsset["states"];
		reducedMotion: boolean;
		animationStep: number;
	},
): number {
	const state = asset.states[options.state];
	if (options.reducedMotion) return state.reducedMotionFrame;
	const frameIndex =
		Math.abs(Math.trunc(options.animationStep)) % state.frames.length;
	return state.frames[frameIndex] ?? state.reducedMotionFrame;
}
