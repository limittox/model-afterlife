import { readOrderedUpdates } from "@/features/world/server/world-repository";
import { CANONICAL_WORLD_ID } from "@/features/world/server/seed-data";

function parseAfter(request: Request): number | null {
	const raw = new URL(request.url).searchParams.get("after") ?? "0";
	if (!/^(0|[1-9]\d*)$/.test(raw)) {
		return null;
	}
	const value = Number(raw);
	return Number.isSafeInteger(value) ? value : null;
}

export async function GET(request: Request): Promise<Response> {
	const after = parseAfter(request);
	if (after === null) {
		return Response.json(
			{ error: "after must be a non-negative safe integer." },
			{ status: 400 },
		);
	}

	try {
		const updates = await readOrderedUpdates(CANONICAL_WORLD_ID, after, 100);
		return Response.json(updates, {
			status: 200,
			headers: { "cache-control": "no-store" },
		});
	} catch (error) {
		console.error("Unable to read ordered world updates.", error);
		return Response.json(
			{
				error:
					"Live updates are temporarily unavailable. Replace from the current snapshot.",
			},
			{ status: 503 },
		);
	}
}
