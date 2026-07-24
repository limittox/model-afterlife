import {
	readReturnRecap,
	ReturnRecapMarkerError,
} from "@/features/publication/server/read-return-recap";
import { z } from "zod";

const QuerySchema = z
	.object({
		worldId: z.string().uuid(),
		after: z
			.string()
			.regex(/^[1-9]\d*$/u)
			.transform(Number)
			.refine(Number.isSafeInteger),
	})
	.strict();

export async function GET(request: Request): Promise<Response> {
	const url = new URL(request.url);
	const parsed = QuerySchema.safeParse({
		worldId: url.searchParams.get("worldId"),
		after: url.searchParams.get("after"),
	});
	if (!parsed.success) {
		return Response.json(
			{ error: "worldId and a positive safe after cursor are required." },
			{ status: 400 },
		);
	}

	try {
		const recap = await readReturnRecap({
			worldId: parsed.data.worldId,
			afterSequence: parsed.data.after,
		});
		return Response.json(recap, {
			status: 200,
			headers: { "cache-control": "no-store" },
		});
	} catch (error) {
		if (error instanceof ReturnRecapMarkerError) {
			return Response.json(
				{ error: "The local recap marker does not match the current home." },
				{ status: 409 },
			);
		}
		console.error("Unable to read the return recap.", error);
		return Response.json(
			{ error: "The return recap is temporarily unavailable." },
			{ status: 503 },
		);
	}
}
