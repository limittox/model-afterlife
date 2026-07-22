import {
	PUBLIC_WORLD_SCHEMA_VERSION,
	PublicWorldSnapshotSchema,
	type PublicWorldSnapshot,
} from "../contracts/public-world.ts";
import { hashPublicSnapshot } from "./state-hash.ts";

export const CANONICAL_WORLD_ID = "00000000-0000-4000-8000-000000000001";
export const SEED_OCCURRENCE_KEY = "world-opened:v1";

export function createSeedSnapshot(
	throughSequence: number,
): PublicWorldSnapshot {
	const withoutHash: Omit<PublicWorldSnapshot, "stateHash"> = {
		schemaVersion: PUBLIC_WORLD_SCHEMA_VERSION,
		worldId: CANONICAL_WORLD_ID,
		logicalTick: 0,
		homeTime: "09:00",
		dayPeriod: "morning",
		throughSequence,
		rooms: [
			{ id: "common-room", name: "Common Room" },
			{ id: "memory-garden", name: "Memory Garden" },
			{ id: "library", name: "Library" },
			{ id: "tea-nook", name: "Tea Nook" },
		],
		residents: [
			{
				id: "former-giant",
				name: "The Former Giant",
				roomId: "common-room",
				activity: "Reading an old benchmark sheet",
			},
			{
				id: "masked-encoder",
				name: "The Masked Encoder",
				roomId: "library",
				activity: "Filling in missing words",
			},
			{
				id: "local-tinkerer",
				name: "The Local Tinkerer",
				roomId: "tea-nook",
				activity: "Repairing the kettle offline",
			},
		],
		scene: null,
		quiet: {
			reason: "between-scenes",
			locationId: "common-room",
			message: "The home is between conversations. Quiet routines continue.",
		},
	};

	return PublicWorldSnapshotSchema.parse({
		...withoutHash,
		stateHash: hashPublicSnapshot(withoutHash),
	});
}
