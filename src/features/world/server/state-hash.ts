import { createHash } from "node:crypto";
import type { PublicWorldSnapshot } from "../contracts/public-world.ts";

export function hashPublicSnapshot(
	snapshot: Omit<PublicWorldSnapshot, "stateHash">,
): string {
	return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
}
