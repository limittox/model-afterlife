import { prepareTestDatabase } from "./database-test-environment.ts";

export default async function globalSetup(): Promise<void> {
	await prepareTestDatabase();
}
