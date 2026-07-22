import { CANONICAL_WORLD_ID } from "./seed-data.ts";
import { readCanonicalHead } from "./world-repository.ts";

export async function readCurrentSnapshot() {
	return (await readCanonicalHead(CANONICAL_WORLD_ID)).snapshot;
}

export async function readCurrentStateHash(): Promise<string> {
	return (await readCanonicalHead(CANONICAL_WORLD_ID)).snapshot.stateHash;
}
