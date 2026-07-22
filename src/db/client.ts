import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema.ts";

function requiredDatabaseUrl(): string {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required on the server.");
	}
	return databaseUrl;
}

function configureNeonDriver(): void {
	neonConfig.webSocketConstructor = ws;

	const localProxy = process.env.NEON_WS_PROXY;
	if (localProxy) {
		neonConfig.wsProxy = localProxy;
		neonConfig.useSecureWebSocket = false;
		neonConfig.pipelineConnect = false;
		neonConfig.forceDisablePgSSL = true;
	}
}

export function createWorldDatabase() {
	configureNeonDriver();
	const pool = new Pool({ connectionString: requiredDatabaseUrl() });
	const db = drizzle({ client: pool, schema });

	return {
		db,
		close: () => pool.end(),
	};
}
