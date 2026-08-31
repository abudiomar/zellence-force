import { createServer } from "node:http";
import { createPgPool } from "@zellforce/db";
import type { RuntimeEnvInput } from "@zellforce/config";
import { createAuth, createIdentityProvisioner } from "./auth/auth";
import { createIdentityAdmin } from "./auth/identity-admin";
import {
  createPgApplicantImportRepository,
  createPgSettingsRepository,
  createPgUserRepository,
  createSessionRevoker
} from "./adapters/postgres";
import { createGoogleSheetsApplicantAdapter } from "./adapters/google-sheets";
import { createWhatsAppCloudSender } from "./adapters/whatsapp-cloud";
import { loadGoogleSheetsAuth } from "./config/google-service-account";
import { loadApiServerEnv } from "./config/runtime-env";
import { createExpressApp } from "./http/app";

const env = loadApiServerEnv(process.env as RuntimeEnvInput);
const pool = createPgPool({
  connectionString: env.DATABASE_URL,
  ssl: env.DB_SSL_MODE === "require" ? { rejectUnauthorized: true } : undefined
});

const auth = createAuth({ pool, env });
const identityProvisioner = createIdentityProvisioner({ pool, env });
const googleServiceAccount = loadGoogleSheetsAuth(env);
const whatsappSender =
  env.WHATSAPP_ACCESS_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID
    ? createWhatsAppCloudSender({
        accessToken: env.WHATSAPP_ACCESS_TOKEN,
        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID
      })
    : undefined;
const app = createExpressApp({
  auth,
  corsOrigin: env.CORS_ORIGIN ?? env.APP_URL,
  phaseTwo: {
    users: createPgUserRepository(pool),
    settings: createPgSettingsRepository(pool),
    identity: createIdentityAdmin(identityProvisioner, pool),
    sessions: createSessionRevoker(pool)
  },
  phaseFour: {
    applicants: createPgApplicantImportRepository(pool),
    sheet: createGoogleSheetsApplicantAdapter(googleServiceAccount)
  },
  ...(whatsappSender ? { whatsappSender } : {}),
  ...(env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
    ? { whatsappWebhookVerifyToken: env.WHATSAPP_WEBHOOK_VERIFY_TOKEN }
    : {})
});

const server = createServer(app);

server.listen(env.API_PORT, () => {
  console.log(`[OK] API listening on ${env.API_PORT}`);
});
