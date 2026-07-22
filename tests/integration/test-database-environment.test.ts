import { describe, expect, it } from "vitest";

describe("integration database isolation", () => {
	it("runs against the disposable test database", () => {
		const databaseUrl = new URL(process.env.DATABASE_URL ?? "");

		expect(process.env.DATABASE_PURPOSE).toBe("test");
		expect(databaseUrl.pathname).toBe("/model_afterlife_test");
	});
});
