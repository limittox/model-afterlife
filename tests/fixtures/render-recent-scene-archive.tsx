import { renderToStaticMarkup } from "react-dom/server";
import { RecentSceneArchive } from "../../src/features/publication/components/RecentSceneArchive.tsx";
import type { RecentSceneArchiveResult } from "../../src/features/publication/server/read-recent-scenes.ts";

const input = process.env.ARCHIVE_STATE;
if (!input) throw new Error("Archive state JSON is required.");
const result = JSON.parse(input) as RecentSceneArchiveResult;
process.stdout.write(
	renderToStaticMarkup(<RecentSceneArchive result={result} />),
);
