import { ResidentProfile } from "@/features/residents/components/ResidentProfile";
import { PublicResidentIdSchema } from "@/features/publication/contracts/public-publication";
import { readResidentProfile } from "@/features/publication/server/read-resident-profile";

export const dynamic = "force-dynamic";

export default async function ResidentProfilePage({
	params,
}: {
	params: Promise<{ residentId: string }>;
}) {
	const { residentId } = await params;
	let decodedResidentId: string;
	try {
		decodedResidentId = decodeURIComponent(residentId);
	} catch {
		return <ResidentProfile result={{ kind: "not-found" }} />;
	}
	const parsed = PublicResidentIdSchema.safeParse(decodedResidentId);
	if (!parsed.success) {
		return <ResidentProfile result={{ kind: "not-found" }} />;
	}
	const result = await readResidentProfile(parsed.data);
	return <ResidentProfile result={result} />;
}
