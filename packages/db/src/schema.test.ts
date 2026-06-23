import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { assertTenantScopedTableMetadata } from "./index";

const migrationSql = readFileSync(
  join(process.cwd(), "packages/db/migrations/0001_initial_schema.sql"),
  "utf8"
);
const authMigrationSql = readFileSync(
  join(process.cwd(), "packages/db/migrations/0002_better_auth.sql"),
  "utf8"
);
const proposalDemoMigrationSql = readFileSync(
  join(process.cwd(), "packages/db/migrations/0004_proposal_demo_pipeline.sql"),
  "utf8"
);
const schemaSql = `${migrationSql}\n${proposalDemoMigrationSql}`;

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
  "shift_types",
  "demo_events",
  "demo_event_shortlist",
  "whatsapp_inbound_messages"
];

describe("MVP schema migration", () => {
  test("contains Phase 1 required schema gap tables", () => {
    for (const table of requiredTables) {
      expect(schemaSql).toContain(`create table if not exists ${table}`);
    }
  });

  test("contains required roles, statuses, indexes, and foreign keys", () => {
    expect(migrationSql).toContain("'supervisor'");
    expect(migrationSql).toContain("'finance'");
    expect(migrationSql).toContain("create type applicant_import_row_status");
    expect(migrationSql).toContain("create type payment_batch_status");
    expect(migrationSql).toContain("idx_applicant_rows_tenant_status_hash");
    expect(migrationSql).toContain("idx_payment_batches_tenant_event_status");
    expect(migrationSql).toContain("idx_audit_logs_tenant_entity_action_created");
    expect(migrationSql).toContain("idx_files_tenant_owner_kind");
    expect(migrationSql).toContain("references tenants(id)");
  });

  test("reports tenant-owned tables missing tenant_id", async () => {
    const report = await assertTenantScopedTableMetadata({
      async query() {
        return {
          rows: requiredTables.map((table_name) => ({ table_name, has_tenant_id: table_name !== "files" })),
          rowCount: requiredTables.length
        };
      }
    });

    expect(report.missingTenantId).toEqual(["files"]);
  });

  test("adds Better Auth default tables and links application users", () => {
    for (const table of ['"user"', "session", "account", "verification"]) {
      expect(authMigrationSql).toContain(`create table ${table}`);
    }
    expect(authMigrationSql).toContain("auth_user_id");
    expect(authMigrationSql).toContain("drop column password_hash");
  });
});
