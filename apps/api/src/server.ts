import { createServer } from "node:http";
import { createPgPool } from "@zellforce/db";
import type { RuntimeEnvInput } from "@zellforce/config";
import { createAuth, createIdentityProvisioner } from "./auth/auth";
import { createIdentityAdmin } from "./auth/identity-admin";
import {
  createPgSettingsRepository,
  createPgUserRepository,
  createSessionRevoker
} from "./adapters/postgres";
import { loadApiEnv } from "./config/runtime-env";
import { createExpressApp } from "./http/app";

const env = loadApiEnv(process.env as RuntimeEnvInput);
const pool = createPgPool({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL_MODE === "require" ? { rejectUnauthorized: true } : undefined
});

const auth = createAuth({ pool, env });
const identityProvisioner = createIdentityProvisioner({ pool, env });
const app = createExpressApp({
  auth,
  corsOrigin: env.CORS_ORIGIN ?? env.APP_URL,
  phaseTwo: {
    users: createPgUserRepository(pool),
    settings: createPgSettingsRepository(pool),
    identity: createIdentityAdmin(identityProvisioner, pool),
    sessions: createSessionRevoker(pool)
  }
});

const server = createServer(app);

server.listen(env.API_PORT, () => {
  console.log(`[OK] API listening on ${env.API_PORT}`);
});
