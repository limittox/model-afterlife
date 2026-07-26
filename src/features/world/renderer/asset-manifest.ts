import type { ResidentVisualVariant } from "./renderer-types.ts";

export const RESIDENT_ASSET_STATES = [
	"neutral",
	"seated",
	"listen",
	"speak",
	"walk",
] as const;

export type ResidentAssetState = (typeof RESIDENT_ASSET_STATES)[number];

export type ResidentAssetStateFrames = {
	frames: number[];
	reducedMotionFrame: number;
};

export type ResidentProductionAsset = {
	id: string;
	visualVariant: ResidentVisualVariant;
	textureKey: string;
	path: string;
	sha256: string;
	provenanceRef: string;
	dimensions: {
		width: number;
		height: number;
	};
	grid: {
		columns: number;
		rows: number;
		frameWidth: number;
		frameHeight: number;
		frameCount: number;
	};
	states: Record<ResidentAssetState, ResidentAssetStateFrames>;
};

export type ProductionAssetManifest = {
	schemaVersion: 1;
	status: "pilot" | "production";
	world: {
		width: 352;
		height: 256;
		tileSize: 16;
	};
	residents: ResidentProductionAsset[];
};

export type AssetManifestParseResult =
	| { success: true; data: ProductionAssetManifest }
	| { success: false; error: string };

const VISUAL_VARIANTS = new Set<ResidentVisualVariant>([
	"amber-waistcoat-short-stack",
	"navy-cardigan-tall-bookish",
	"violet-shawl-round-satchel",
	"teal-apron-square-glasses",
	"rust-overalls-broad-brim",
	"jade-coat-many-tabbed-satchel",
]);

const PRIVATE_METADATA_KEYS = new Set([
	"prompt",
	"providerResponse",
	"requestBody",
	"responseBody",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPositiveInteger(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function containsPrivateMetadata(value: unknown): boolean {
	if (Array.isArray(value)) return value.some(containsPrivateMetadata);
	if (!isRecord(value)) return false;
	for (const [key, child] of Object.entries(value)) {
		if (PRIVATE_METADATA_KEYS.has(key)) return true;
		if (containsPrivateMetadata(child)) return true;
	}
	return false;
}

function parseStateFrames(
	value: unknown,
	frameCount: number,
): ResidentAssetStateFrames | null {
	if (!isRecord(value) || !Array.isArray(value.frames)) return null;
	if (
		value.frames.length === 0 ||
		!value.frames.every(
			(frame) =>
				typeof frame === "number" &&
				Number.isInteger(frame) &&
				frame >= 0 &&
				frame < frameCount,
		)
	) {
		return null;
	}
	if (
		typeof value.reducedMotionFrame !== "number" ||
		!Number.isInteger(value.reducedMotionFrame) ||
		value.reducedMotionFrame < 0 ||
		value.reducedMotionFrame >= frameCount
	) {
		return null;
	}
	return {
		frames: [...value.frames],
		reducedMotionFrame: value.reducedMotionFrame,
	};
}

function parseResident(value: unknown): ResidentProductionAsset | null {
	if (!isRecord(value)) return null;
	if (
		typeof value.id !== "string" ||
		value.id.length === 0 ||
		typeof value.visualVariant !== "string" ||
		!VISUAL_VARIANTS.has(value.visualVariant as ResidentVisualVariant) ||
		typeof value.textureKey !== "string" ||
		!/^resident-[a-z0-9-]+$/.test(value.textureKey) ||
		typeof value.path !== "string" ||
		!value.path.startsWith("/art/") ||
		typeof value.sha256 !== "string" ||
		!/^[a-f0-9]{64}$/.test(value.sha256) ||
		typeof value.provenanceRef !== "string" ||
		!value.provenanceRef.startsWith("art-src/")
	) {
		return null;
	}
	if (!isRecord(value.dimensions) || !isRecord(value.grid)) return null;
	const { width, height } = value.dimensions;
	const { columns, rows, frameWidth, frameHeight, frameCount } = value.grid;
	if (
		!isPositiveInteger(width) ||
		!isPositiveInteger(height) ||
		!isPositiveInteger(columns) ||
		!isPositiveInteger(rows) ||
		!isPositiveInteger(frameWidth) ||
		!isPositiveInteger(frameHeight) ||
		!isPositiveInteger(frameCount) ||
		columns * rows !== frameCount ||
		columns * frameWidth !== width ||
		rows * frameHeight !== height ||
		!isRecord(value.states)
	) {
		return null;
	}

	const states = {} as Record<ResidentAssetState, ResidentAssetStateFrames>;
	for (const state of RESIDENT_ASSET_STATES) {
		const parsed = parseStateFrames(value.states[state], frameCount);
		if (!parsed) return null;
		states[state] = parsed;
	}

	return {
		id: value.id,
		visualVariant: value.visualVariant as ResidentVisualVariant,
		textureKey: value.textureKey,
		path: value.path,
		sha256: value.sha256,
		provenanceRef: value.provenanceRef,
		dimensions: { width, height },
		grid: {
			columns,
			rows,
			frameWidth,
			frameHeight,
			frameCount,
		},
		states,
	};
}

export function parseProductionAssetManifest(
	value: unknown,
): AssetManifestParseResult {
	if (containsPrivateMetadata(value)) {
		return {
			success: false,
			error: "Runtime asset manifest contains private generation metadata",
		};
	}
	if (
		!isRecord(value) ||
		value.schemaVersion !== 1 ||
		(value.status !== "pilot" && value.status !== "production") ||
		!isRecord(value.world) ||
		value.world.width !== 352 ||
		value.world.height !== 256 ||
		value.world.tileSize !== 16 ||
		!Array.isArray(value.residents)
	) {
		return {
			success: false,
			error: "Runtime asset manifest header is invalid",
		};
	}

	const residents = value.residents.map(parseResident);
	if (residents.some((resident) => resident === null)) {
		return { success: false, error: "Runtime resident asset entry is invalid" };
	}
	const parsedResidents = residents as ResidentProductionAsset[];
	if (
		new Set(parsedResidents.map((resident) => resident.id)).size !==
			parsedResidents.length ||
		new Set(parsedResidents.map((resident) => resident.textureKey)).size !==
			parsedResidents.length ||
		new Set(parsedResidents.map((resident) => resident.path)).size !==
			parsedResidents.length
	) {
		return { success: false, error: "Runtime resident assets must be unique" };
	}

	return {
		success: true,
		data: {
			schemaVersion: 1,
			status: value.status,
			world: { width: 352, height: 256, tileSize: 16 },
			residents: parsedResidents,
		},
	};
}
