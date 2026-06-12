import { describe, expect, test } from "vitest";
import {
  getAppliedMigrations,
  runMigrations,
  type DbClient
} from "./index";

class FakeMigrationClient implements DbClient {
  readonly applied = new Set<string>();
  readonly statements: string[] = [];

  async query(sql: string, params?: unknown[]) {
    this.statements.push(sql);

    if (sql.includes("select version from schema_migrations")) {
      return {
        rows: [...this.applied].map((version) => ({ version })),
        rowCount: this.applied.size
      };
    }

    if (sql.includes("insert into schema_migrations")) {
      this.applied.add(String(params?.[0]));
      return { rows: [], rowCount: 1 };
    }

    return { rows: [], rowCount: 0 };
  }
}

describe("migration runner", () => {
  test("creates migration table and applies first migration against empty database", async () => {
    const client = new FakeMigrationClient();

    const result = await runMigrations(client);

    expect(result.applied).toContain("0001_initial_schema");
    expect(result.applied).toContain("0002_better_auth");
    expect(result.skipped).toEqual([]);
    expect(client.statements.some((sql) => sql.includes("create table if not exists schema_migrations"))).toBe(true);
  });

  test("skips migrations already recorded in schema_migrations", async () => {
    const client = new FakeMigrationClient();

    await runMigrations(client);
    const secondRun = await runMigrations(client);
    const applied = await getAppliedMigrations(client);

    expect(secondRun.applied).toEqual([]);
    expect(secondRun.skipped).toEqual([
      "0001_initial_schema",
      "0002_better_auth"
    ]);
    expect(applied).toEqual([
      { version: "0001_initial_schema" },
      { version: "0002_better_auth" }
    ]);
  });
});
