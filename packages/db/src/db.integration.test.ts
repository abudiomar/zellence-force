import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import {
  assertTenantScopedTableMetadata,
  createPgPool,
  findTenantBySlug,
  getAppliedMigrations,
  insertTenant,
  runMigrations,
  withTransaction
} from "./index";

const hasTestDatabase = Boolean(process.env.TEST_DATABASE_URL);

const pool = hasTestDatabase
  ? createPgPool({
      connectionString: process.env.TEST_DATABASE_URL
    })
  : null;

function dbPool() {
  if (!pool) {
    throw new Error("TEST_DATABASE_URL is required for DB integration tests");
  }

  return pool;
}

async function resetPublicSchema() {
  await dbPool().query("drop schema if exists public cascade");
  await dbPool().query("create schema public");
}

describe.skipIf(!hasTestDatabase)("Postgres integration", () => {
  beforeAll(async () => {
    await resetPublicSchema();
  });

  beforeEach(async () => {
    await resetPublicSchema();
  });

  afterAll(async () => {
    await dbPool().end();
  });

  test("runs MVP baseline migration and skips it on second run", async () => {
    const firstRun = await runMigrations(dbPool());
    const secondRun = await runMigrations(dbPool());
    const applied = await getAppliedMigrations(dbPool());

    expect(firstRun.applied).toEqual(["0001_initial_schema", "0002_better_auth"]);
    expect(secondRun.applied).toEqual([]);
    expect(secondRun.skipped).toEqual(["0001_initial_schema", "0002_better_auth"]);
    expect(applied).toEqual([
      { version: "0001_initial_schema" },
      { version: "0002_better_auth" }
    ]);
  });

  test("creates Better Auth schema and removes application password storage", async () => {
    await runMigrations(dbPool());

    const tables = await dbPool().query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_name in ('user', 'session', 'account', 'verification')
      order by table_name
    `);
    const columns = await dbPool().query(`
      select column_name
      from information_schema.columns
      where table_schema = 'public' and table_name = 'users'
      order by column_name
    `);

    expect(tables.rows.map((row) => row.table_name)).toEqual([
      "account",
      "session",
      "user",
      "verification"
    ]);
    expect(columns.rows.map((row) => row.column_name)).toContain("auth_user_id");
    expect(columns.rows.map((row) => row.column_name)).not.toContain("password_hash");
  });

  test("creates required tenant-owned schema without missing tenant_id columns", async () => {
    await runMigrations(dbPool());

    const requiredTables = [
      "tenant_settings",
      "applicant_import_runs",
      "applicant_import_rows",
      "event_supervisors",
      "payment_batches",
      "payment_batch_lines",
      "files",
      "audit_logs",
      "export_runs",
      "shift_types"
    ];

    const tableResult = await dbPool().query(
      `
        select table_name
        from information_schema.tables
        where table_schema = 'public'
          and table_name = any($1)
        order by table_name
      `,
      [requiredTables]
    );
    const tenantScope = await assertTenantScopedTableMetadata(dbPool());

    expect(tableResult.rows.map((row) => row.table_name)).toEqual([...requiredTables].sort());
    expect(tenantScope.missingTenantId).toEqual([]);
  });

  test("commits tenant inserts through transaction helper", async () => {
    await runMigrations(dbPool());
    const slug = `tenant-${randomUUID()}`;

    await withTransaction(dbPool(), async (client) => {
      await insertTenant(client, { name: "MAG Events", slug });
    });

    await expect(findTenantBySlug(dbPool(), slug)).resolves.toMatchObject({ slug });
  });

  test("rolls back tenant inserts when transaction callback throws", async () => {
    await runMigrations(dbPool());
    const slug = `tenant-${randomUUID()}`;

    await expect(
      withTransaction(dbPool(), async (client) => {
        await insertTenant(client, { name: "MAG Events", slug });
        throw new Error("rollback me");
      })
    ).rejects.toThrow("rollback me");

    await expect(findTenantBySlug(dbPool(), slug)).resolves.toBeNull();
  });
});
