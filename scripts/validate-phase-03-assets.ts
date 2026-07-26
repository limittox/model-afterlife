import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { LAUNCH_RESIDENTS } from "../src/features/world/fixtures/launch-residents.ts";
import { parseProductionAssetManifest } from "../src/features/world/renderer/asset-manifest.ts";

const PNG_SIGNATURE = Buffer.from([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function pngDimensions(buffer: Buffer): { width: number; height: number } {
	if (
		buffer.length < 24 ||
		!buffer.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
		buffer.toString("ascii", 12, 16) !== "IHDR"
	) {
		throw new Error("Runtime asset is not a valid PNG with an IHDR header.");
	}
	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20),
	};
}

async function main(): Promise<void> {
	const rawAssetManifest = JSON.parse(
		await readFile(
			path.join(process.cwd(), "public", "art", "manifest.json"),
			"utf8",
		),
	) as unknown;
	const parsed = parseProductionAssetManifest(rawAssetManifest);
	if (!parsed.success) {
		throw new Error(`Runtime manifest rejected: ${parsed.error}`);
	}

	const expected = LAUNCH_RESIDENTS.map((resident) => ({
		id: resident.id,
		variant: resident.visualVariantId,
	}));
	const actual = parsed.data.residents.map((resident) => ({
		id: resident.id,
		variant: resident.visualVariant,
	}));
	if (JSON.stringify(actual) !== JSON.stringify(expected)) {
		throw new Error(
			`Resident asset roster does not match launch order: ${JSON.stringify(actual)}`,
		);
	}

	for (const resident of parsed.data.residents) {
		const runtimePath = path.join(
			process.cwd(),
			"public",
			resident.path.replace(/^\/+/, ""),
		);
		const runtime = await readFile(runtimePath);
		const hash = createHash("sha256").update(runtime).digest("hex");
		if (hash !== resident.sha256) {
			throw new Error(
				`${resident.id} runtime hash does not match the manifest.`,
			);
		}
		const dimensions = pngDimensions(runtime);
		if (
			dimensions.width !== resident.dimensions.width ||
			dimensions.height !== resident.dimensions.height
		) {
			throw new Error(
				`${resident.id} runtime dimensions do not match the manifest.`,
			);
		}

		const sourceDirectory = path.join(
			process.cwd(),
			"art-src",
			"residents",
			resident.id,
		);
		const prefix = resident.id === "gpt-4o" ? "pilot-attempt-01" : "attempt-01";
		await Promise.all([
			access(path.join(sourceDirectory, `${prefix}-chroma.png`)),
			access(path.join(sourceDirectory, `${prefix}-alpha.png`)),
			access(path.join(sourceDirectory, `${prefix}-preview-8x.png`)),
			access(path.join(process.cwd(), resident.provenanceRef)),
		]);
	}

	console.log(
		`Validated ${parsed.data.residents.length} Phase 3 resident atlases as ${parsed.data.status} assets.`,
	);
}

await main();
