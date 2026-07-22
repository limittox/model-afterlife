import { WorldObserver } from "@/features/world/client/WorldObserver";
import { WorldQueryClient } from "@/features/world/client/world-query-client";

export const dynamic = "force-dynamic";

export default function HomePage() {
	return (
		<WorldQueryClient>
			<WorldObserver />
		</WorldQueryClient>
	);
}
