import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool, type PoolConfig, type QueryResult } from "pg";

export const MIGRATIONS_DIRECTORY = "packages/db/migrations";
const packageRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export type DbClient = {
  query(sql: string, params?: unknown[]): Promise<QueryResult | { rows: unknown[]; rowCount: number }>;
};

export type ReleasableDbClient = DbClient & {
  release(): void;
};

export type Transaction<T> = (client: DbClient) => Promise<T>;

export type AppliedMigration = {
  version: string;
};

export type MigrationResult = {
  applied: string[];
  skipped: string[];
};

export type TenantScopeReport = {
  missingTenantId: string[];
  checkedTables: string[];
};

type PoolLike = {
  connect(): Promise<ReleasableDbClient>;
};

const migrations = [
  {
    version: "0001_initial_schema",
    fileName: "0001_initial_schema.sql"
  },
  {
    version: "0002_better_auth",
    fileName: "0002_better_auth.sql"
  }
] as const;

export function createPgPool(config: PoolConfig): Pool {
  return new Pool(config);
}

export async function getAppliedMigrations(client: DbClient): Promise<AppliedMigration[]> {
  const result = await client.query("select version from schema_migrations order by version");
  return result.rows as AppliedMigration[];
}

export async function runMigrations(client: DbClient): Promise<MigrationResult> {
  await client.query(`
    create table if not exists schema_migrations (
      version text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const appliedRows = await getAppliedMigrations(client);
  const appliedVersions = new Set(appliedRows.map((row) => row.version));
  const result: MigrationResult = { applied: [], skipped: [] };

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) {
      result.skipped.push(migration.version);
      continue;
    }

    const sql = readFileSync(join(packageRoot, "migrations", migration.fileName), "utf8");
    await client.query(sql);
    await client.query("insert into schema_migrations (version) values ($1)", [migration.version]);
    result.applied.push(migration.version);
  }

  return result;
}

export async function withTransaction<T>(pool: PoolLike, fn: Transaction<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function assertTenantScopedTableMetadata(client: DbClient): Promise<TenantScopeReport> {
  const result = await client.query(`
    select
      tables.table_name,
      bool_or(columns.column_name = 'tenant_id') as has_tenant_id
    from information_schema.tables tables
    left join information_schema.columns columns
      on columns.table_schema = tables.table_schema
      and columns.table_name = tables.table_name
    where tables.table_schema = 'public'
      and tables.table_type = 'BASE TABLE'
      and tables.table_name not in (
        'schema_migrations',
        'tenants',
        'user',
        'session',
        'account',
        'verification'
      )
    group by tables.table_name
    order by tables.table_name
  `);

  const rows = result.rows as Array<{ table_name: string; has_tenant_id: boolean }>;
  return {
    checkedTables: rows.map((row) => row.table_name),
    missingTenantId: rows
      .filter((row) => !row.has_tenant_id)
      .map((row) => row.table_name)
  };
}

export type TenantRecord = {
  id: string;
  name: string;
  slug: string;
};

export async function insertTenant(
  client: DbClient,
  params: { name: string; slug: string }
): Promise<TenantRecord> {
  if (!params.name.trim()) {
    throw new Error("Tenant name is required");
  }
  if (!params.slug.trim()) {
    throw new Error("Tenant slug is required");
  }

  const result = await client.query(
    "insert into tenants (name, slug) values ($1, $2) returning id, name, slug",
    [params.name, params.slug]
  );
  return result.rows[0] as TenantRecord;
}

export async function findTenantBySlug(client: DbClient, slug: string): Promise<TenantRecord | null> {
  if (!slug.trim()) {
    throw new Error("Tenant slug is required");
  }

  const result = await client.query(
    "select id, name, slug from tenants where slug = $1",
    [slug]
  );
  return (result.rows[0] as TenantRecord | undefined) ?? null;
}
