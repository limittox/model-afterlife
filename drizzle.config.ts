import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

const databasePurpose = process.env.DATABASE_PURPOSE;
if (databasePurpose !== "development" && databasePurpose !== "test") {
	throw new Error(
		"Drizzle commands require DATABASE_PURPOSE=development or DATABASE_PURPOSE=test.",
	);
}

const databaseUrl =
	process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error("MIGRATION_DATABASE_URL or DATABASE_URL is required.");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: databaseUrl,
	},
	verbose: true,
});
