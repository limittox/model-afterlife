import { readCurrentSnapshot } from "@/features/world/server/read-snapshot";

export async function GET(): Promise<Response> {
	try {
		const snapshot = await readCurrentSnapshot();
		return Response.json(snapshot, {
			status: 200,
			headers: {
				"cache-control": "no-store",
			},
		});
	} catch (error) {
		console.error("Unable to read the canonical world snapshot.", error);
		return Response.json(
			{
				error:
					"The home is temporarily unavailable. No fictional scene was created.",
			},
			{ status: 503 },
		);
	}
}
