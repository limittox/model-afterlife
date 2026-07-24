import { notFound } from "next/navigation";
import { ScenePermalink } from "@/features/publication/components/ScenePermalink";
import { CanonicalRevisionIdSchema } from "@/features/publication/contracts/public-publication";
import { readCanonicalScene } from "@/features/publication/server/read-canonical-scene";

export const dynamic = "force-dynamic";

export default async function CanonicalScenePage({
	params,
}: {
	params: Promise<{ sceneId: string }>;
}) {
	const { sceneId } = await params;
	const parsed = CanonicalRevisionIdSchema.safeParse(sceneId);
	if (!parsed.success) notFound();

	const result = await readCanonicalScene(parsed.data);
	if (result.kind === "not-found") notFound();

	return <ScenePermalink result={result} />;
}
