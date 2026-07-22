import { ObserverSkeleton } from "@/features/world/client/ObserverSkeleton";
import { readCurrentSnapshot } from "@/features/world/server/read-current-snapshot";

export const dynamic = "force-dynamic";

export default async function HomePage() {
	const snapshot = await readCurrentSnapshot();
	return <ObserverSkeleton initialSnapshot={snapshot} />;
}
