import { pathToFileURL } from "node:url";
import { bootstrapOwner } from "@zellforce/application";
import { createPgPool, runMigrations } from "@zellforce/db";
import type { RuntimeEnvInput } from "@zellforce/config";
import { createIdentityProvisioner } from "./auth/auth";
import { createIdentityAdmin } from "./auth/identity-admin";
import {
  createPgBootstrapRepository,
  createPgUserRepository
} from "./adapters/postgres";
import { loadApiEnv } from "./config/runtime-env";

type SeedLocalArgs = {
  tenantSlug: string;
  tenantName: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPassword: string;
};

const defaults: SeedLocalArgs = {
  tenantSlug: "mag-events",
  tenantName: "MAG Events",
  ownerFullName: "Owner User",
  ownerEmail: "owner@example.com",
  ownerPassword: "Password123!"
};

export function parseSeedLocalArgs(args: string[]): SeedLocalArgs {
  const values = new Map(
    args.map((arg) => {
      const separator = arg.indexOf("=");
      return separator === -1
        ? [arg, ""]
        : [arg.slice(0, separator), arg.slice(separator + 1)];
    })
  );

  return {
    tenantSlug: values.get("--tenant-slug")?.trim() || defaults.tenantSlug,
    tenantName: values.get("--tenant-name")?.trim() || defaults.tenantName,
    ownerFullName: values.get("--owner-full-name")?.trim() || defaults.ownerFullName,
    ownerEmail: values.get("--owner-email")?.trim() || defaults.ownerEmail,
    ownerPassword: values.get("--owner-password") || defaults.ownerPassword
  };
}

function withLocalDefaults(input: NodeJS.ProcessEnv): RuntimeEnvInput {
  return {
    ...input,
    NODE_ENV: input.NODE_ENV ?? "development",
    APP_ENV: input.APP_ENV ?? "local",
    APP_URL: input.APP_URL ?? "http://localhost:3000",
    API_URL: input.API_URL ?? "http://localhost:4000",
    API_PORT: input.API_PORT ?? "4000",
    DATABASE_URL:
      input.DATABASE_URL ??
      "postgres://zellforce:zellforce_test@localhost:54329/zellforce_test",
    BETTER_AUTH_SECRET:
      input.BETTER_AUTH_SECRET ??
      "local_dev_secret_32_chars_minimum_123",
    BETTER_AUTH_URL: input.BETTER_AUTH_URL ?? "http://localhost:4000",
    TOKEN_SIGNING_SECRET:
      input.TOKEN_SIGNING_SECRET ??
      "local_token_secret_32_chars_minimum_123",
    DB_SSL_MODE: input.DB_SSL_MODE ?? "disable"
  };
}

async function main() {
  const input = parseSeedLocalArgs(process.argv.slice(2));
  const env = loadApiEnv(withLocalDefaults(process.env));
  const pool = createPgPool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL_MODE === "require" ? { rejectUnauthorized: true } : undefined
  });

  try {
    const migrations = await runMigrations(pool);
    const tenant = await pool.query(
      `
        insert into tenants (name, slug)
        values ($1, $2)
        on conflict (slug) do update set name = excluded.name
        returning id
      `,
      [input.tenantName, input.tenantSlug]
    );
    const tenantId = (tenant.rows[0] as { id: string }).id;
    await createPgBootstrapRepository(pool).ensureTenantSettings(tenantId);
    const importRun = await pool.query(
      `
        insert into applicant_import_runs (
          tenant_id, source_type, source_id, source_range, status,
          rows_seen, rows_imported, rows_failed, metadata
        )
        values (
          $1, 'google_sheets', 'local-demo', 'Form Responses 1!A:Z',
          'partial', 2, 1, 1, '{"seed":"local"}'::jsonb
        )
        returning id
      `,
      [tenantId]
    );
    const importRunId = (importRun.rows[0] as { id: string }).id;
    await pool.query(
      `
        insert into applicant_import_rows (
          tenant_id, import_run_id, source_row_id, source_hash,
          raw_data, mapped_data, status, error_messages
        )
        values
          (
            $1, $2, '2', 'local-demo-sara-ahmed',
            '{"Full Name":"Sara Ahmed","Mobile":"+966500000000","Email":"sara@example.com","City":"Riyadh"}'::jsonb,
            '{"fullName":"Sara Ahmed","phone":"+966500000000","email":"sara@example.com","city":"Riyadh"}'::jsonb,
            'pending_review', '[]'::jsonb
          ),
          (
            $1, $2, '3', 'local-demo-missing-phone',
            '{"Full Name":"Missing Phone","Mobile":"","Email":"missing-phone@example.com","City":"Jeddah"}'::jsonb,
            null,
            'error', '["phone is required"]'::jsonb
          )
        on conflict (tenant_id, source_hash) do nothing
      `,
      [tenantId, importRunId]
    );

    const userCount = await createPgBootstrapRepository(pool).countUsers(tenantId);
    if (userCount === 0) {
      const provisioner = createIdentityProvisioner({ pool, env });
      const user = await bootstrapOwner(
        {
          bootstrap: createPgBootstrapRepository(pool),
          users: createPgUserRepository(pool),
          identity: createIdentityAdmin(provisioner, pool)
        },
        {
          tenantSlug: input.tenantSlug,
          fullName: input.ownerFullName,
          email: input.ownerEmail,
          password: input.ownerPassword
        }
      );
      console.log(`[OK] Seeded tenant ${input.tenantSlug}`);
      console.log(`[OK] Bootstrapped owner ${user.email}`);
    } else {
      console.log(`[OK] Tenant ${input.tenantSlug} already has ${userCount} user(s)`);
    }
    console.log(`[OK] Migrations applied: ${migrations.applied.length}; skipped: ${migrations.skipped.length}`);
  } finally {
    await pool.end();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
