import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const roots = [
	resolve("src/app/api"),
	resolve("src/features/world/contracts"),
	resolve("src/features/world/server/to-public-snapshot.ts"),
	resolve("evals/results"),
];
const extensions = new Set([".ts", ".tsx", ".js", ".json"]);
const forbidden = [
	{ label: "credential-like token", pattern: /\b(?:sk-|phx_)[a-z0-9_-]{12,}\b/iu },
	{ label: "authorization bearer value", pattern: /authorization\s*:\s*bearer\s+\S+/iu },
	{ label: "raw prompt field", pattern: /"(?:rawPrompt|systemPrompt|promptBody)"\s*:/u },
	{ label: "raw source body field", pattern: /"(?:sourceBody|rawSource)"\s*:/u },
	{ label: "rejected output field", pattern: /"(?:rejectedText|rawResponse|privateOutput)"\s*:/u },
];

function filesUnder(path: string): string[] {
	const stats = statSync(path);
	if (stats.isFile()) return extensions.has(extname(path)) ? [path] : [];
	return readdirSync(path)
		.flatMap((entry) => filesUnder(join(path, entry)))
		.sort();
}

const findings: string[] = [];
const files = roots.flatMap(filesUnder);
for (const file of files) {
	const content = readFileSync(file, "utf8");
	for (const rule of forbidden) {
		if (rule.pattern.test(content)) findings.push(`${file}: ${rule.label}`);
	}
}
if (findings.length > 0) {
	throw new Error(`Phase 2 privacy scan failed:\n${findings.join("\n")}`);
}
process.stdout.write(`Phase 2 privacy scan passed across ${files.length} public/result files.\n`);
