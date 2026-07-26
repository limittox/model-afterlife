import rawAssetManifest from "../../../../public/art/manifest.json";
import {
	parseProductionAssetManifest,
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

export function selectResidentProductionFrame(
	asset: ResidentProductionAsset,
	options: {
		activeSpeaker: boolean;
		reducedMotion: boolean;
		animationStep: number;
	},
): number {
	const state = options.activeSpeaker
		? asset.states.speak
		: asset.states.neutral;
	if (options.reducedMotion) return state.reducedMotionFrame;
	const frameIndex =
		Math.abs(Math.trunc(options.animationStep)) % state.frames.length;
	return state.frames[frameIndex] ?? state.reducedMotionFrame;
}
