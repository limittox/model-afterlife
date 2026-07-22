import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

const databasePurpose = process.env.DATABASE_PURPOSE;
if (databasePurpose !== "development" && databasePurpose !== "test") {
	throw new Error(
		"Drizzle push requires DATABASE_PURPOSE=development or DATABASE_PURPOSE=test.",
	);
}

const pushDatabaseUrl = process.env.PUSH_DATABASE_URL;
if (!pushDatabaseUrl) {
	throw new Error(
		"PUSH_DATABASE_URL is required for the disposable push target.",
	);
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: pushDatabaseUrl,
	},
	verbose: true,
});
