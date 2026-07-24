import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResidentDirectory } from "../../src/features/residents/components/ResidentDirectory.tsx";
import { ResidentDirectoryResultSchema } from "../../src/features/publication/contracts/public-publication.ts";

const result = ResidentDirectoryResultSchema.parse(
	JSON.parse(process.env.RESIDENT_DIRECTORY_STATE ?? "{}"),
);

process.stdout.write(renderToStaticMarkup(createElement(ResidentDirectory, { result })));
