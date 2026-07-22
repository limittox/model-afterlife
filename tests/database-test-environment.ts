import { execFileSync } from "node:child_process";
import { Client } from "pg";

const TEST_DATABASE_NAME = "model_afterlife_test";
const DEFAULT_TEST_DATABASE_URL =
	"postgresql://model_afterlife:model_afterlife@db:5432/model_afterlife_test";
const DEFAULT_TEST_MIGRATION_URL =
	"postgresql://model_afterlife:model_afterlife@localhost:54329/model_afterlife_test";

function checkedTestDatabaseName(databaseUrl: string): string {
	const name = new URL(databaseUrl).pathname.slice(1);
	if (name !== TEST_DATABASE_NAME || !/^[a-z0-9_]+$/.test(name)) {
		throw new Error(
			`Refusing to reset database ${name || "<empty>"}; expected ${TEST_DATABASE_NAME}.`,
		);
	}
	return name;
}

export function configureTestDatabaseEnvironment(): void {
	process.env.DATABASE_PURPOSE = "test";
	process.env.DATABASE_URL =
		process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
	process.env.MIGRATION_DATABASE_URL =
		process.env.TEST_MIGRATION_DATABASE_URL ?? DEFAULT_TEST_MIGRATION_URL;
	process.env.NEON_WS_PROXY ??= "localhost:54330/v1";
	checkedTestDatabaseName(process.env.DATABASE_URL);
	checkedTestDatabaseName(process.env.MIGRATION_DATABASE_URL);
}

function run(command: string, args: string[], env = process.env): void {
	execFileSync(command, args, {
		cwd: process.cwd(),
		env,
		stdio: "inherit",
	});
}

function migrateTestDatabase(): void {
	if (process.platform === "win32") {
		run("cmd.exe", [
			"/d",
			"/s",
			"/c",
			"corepack pnpm exec drizzle-kit migrate --config drizzle.config.ts",
		]);
		return;
	}
	run("corepack", [
		"pnpm",
		"exec",
		"drizzle-kit",
		"migrate",
		"--config",
		"drizzle.config.ts",
	]);
}

async function recreateTestDatabase(): Promise<void> {
	const migrationUrl = process.env.MIGRATION_DATABASE_URL;
	if (!migrationUrl) throw new Error("Test migration URL was not configured.");
	const databaseName = checkedTestDatabaseName(migrationUrl);
	const adminUrl = new URL(migrationUrl);
	adminUrl.pathname = "/postgres";
	const client = new Client({ connectionString: adminUrl.toString() });

	await client.connect();
	try {
		await client.query(
			"select pg_terminate_backend(pid) from pg_stat_activity where datname = $1 and pid <> pg_backend_pid()",
			[databaseName],
		);
		await client.query(`drop database if exists "${databaseName}"`);
		await client.query(
			`create database "${databaseName}" owner model_afterlife`,
		);
	} finally {
		await client.end();
	}
}

export async function prepareTestDatabase(): Promise<void> {
	configureTestDatabaseEnvironment();
	run("docker", ["compose", "up", "-d", "db", "wsproxy"]);
	await recreateTestDatabase();
	migrateTestDatabase();
	run(process.execPath, ["--experimental-strip-types", "scripts/seed-world.ts"]);
}
