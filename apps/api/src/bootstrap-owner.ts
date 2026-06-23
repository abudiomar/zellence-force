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

type BootstrapOwnerArgs = {
  tenantSlug: string;
  tenantName?: string;
  fullName: string;
  email: string;
  password: string;
};

export function parseBootstrapOwnerArgs(args: string[]): BootstrapOwnerArgs {
  const values = new Map(
    args.map((arg) => {
      const separator = arg.indexOf("=");
      return separator === -1
        ? [arg, ""]
        : [arg.slice(0, separator), arg.slice(separator + 1)];
    })
  );
  const result = {
    tenantSlug: values.get("--tenant-slug")?.trim(),
    tenantName: values.get("--tenant-name")?.trim(),
    fullName: values.get("--full-name")?.trim(),
    email: values.get("--email")?.trim(),
    password: values.get("--password")
  };
  if (!result.tenantSlug || !result.fullName || !result.email || !result.password) {
    throw new Error(
      "Missing bootstrap arguments: --tenant-slug, --full-name, --email, --password"
    );
  }
  return result as BootstrapOwnerArgs;
}

async function main() {
  const input = parseBootstrapOwnerArgs(process.argv.slice(2));
  const env = loadApiEnv(process.env as RuntimeEnvInput);
  const pool = createPgPool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL_MODE === "require" ? { rejectUnauthorized: true } : undefined
  });

  try {
    await runMigrations(pool);
    const provisioner = createIdentityProvisioner({ pool, env });
    const user = await bootstrapOwner(
      {
        bootstrap: createPgBootstrapRepository(pool),
        users: createPgUserRepository(pool),
        identity: createIdentityAdmin(provisioner, pool)
      },
      input
    );
    console.log(`[OK] Bootstrapped owner ${user.email}`);
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
