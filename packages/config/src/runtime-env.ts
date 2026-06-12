import { z } from "zod";

export const ENV_VAR_NAMES = [
  "NODE_ENV",
  "APP_ENV",
  "APP_URL",
  "API_URL",
  "API_PORT",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_API_URL",
  "AUTH_SESSION_EXPIRES_IN",
  "AUTH_SESSION_UPDATE_AGE",
  "AUTH_PASSWORD_MIN_LENGTH",
  "AUTH_PASSWORD_MAX_LENGTH",
  "TOKEN_SIGNING_SECRET",
  "DB_SSL_MODE",
  "GOOGLE_CLIENT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
  "GOOGLE_PROJECT_ID",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
  "WHATSAPP_APP_SECRET",
  "STORAGE_PROVIDER",
  "STORAGE_BUCKET",
  "STORAGE_REGION",
  "STORAGE_ENDPOINT",
  "STORAGE_ACCESS_KEY_ID",
  "STORAGE_SECRET_ACCESS_KEY",
  "JOB_CONCURRENCY",
  "JOB_POLL_INTERVAL",
  "WORKER_ENABLED",
  "CORS_ORIGIN",
  "LOG_LEVEL",
  "DEFAULT_LANGUAGE",
  "DEFAULT_TIMEZONE",
  "DEFAULT_CURRENCY"
] as const;

export type EnvVarName = (typeof ENV_VAR_NAMES)[number];
export type RuntimeEnvInput = Partial<Record<EnvVarName, string | undefined>>;

const requiredEnv = [
  "NODE_ENV",
  "APP_ENV",
  "APP_URL",
  "API_URL",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "TOKEN_SIGNING_SECRET"
] as const satisfies readonly EnvVarName[];

const runtimeEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  APP_ENV: z.enum(["local", "test", "staging", "production"]),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  API_PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  AUTH_SESSION_EXPIRES_IN: z.coerce.number().int().positive().default(604800),
  AUTH_SESSION_UPDATE_AGE: z.coerce.number().int().positive().default(86400),
  AUTH_PASSWORD_MIN_LENGTH: z.coerce.number().int().min(8).default(8),
  AUTH_PASSWORD_MAX_LENGTH: z.coerce.number().int().max(256).default(128),
  TOKEN_SIGNING_SECRET: z.string().min(32),
  DB_SSL_MODE: z.enum(["disable", "prefer", "require"]).default("prefer"),
  GOOGLE_CLIENT_EMAIL: z.string().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_PROJECT_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  STORAGE_PROVIDER: z.enum(["s3"]).optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_ENDPOINT: z.string().url().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  JOB_CONCURRENCY: z.coerce.number().int().positive().default(1),
  JOB_POLL_INTERVAL: z.coerce.number().int().positive().default(5000),
  WORKER_ENABLED: z.coerce.boolean().default(false),
  CORS_ORIGIN: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DEFAULT_LANGUAGE: z.enum(["ar", "en"]).default("ar"),
  DEFAULT_TIMEZONE: z.string().default("Asia/Riyadh"),
  DEFAULT_CURRENCY: z.string().default("SAR")
});

export type RuntimeEnv = z.infer<typeof runtimeEnvSchema>;

export type EnvParseResult =
  | { ok: true; env: RuntimeEnv }
  | { ok: false; issues: EnvVarName[] };

export function parseEnv(input: RuntimeEnvInput): EnvParseResult {
  const result = runtimeEnvSchema.safeParse(input);

  if (result.success) {
    return { ok: true, env: result.data };
  }

  const issueNames = new Set<EnvVarName>();
  for (const name of requiredEnv) {
    if (!input[name]) {
      issueNames.add(name);
    }
  }

  for (const issue of result.error.issues) {
    const name = issue.path[0];
    if (typeof name === "string" && ENV_VAR_NAMES.includes(name as EnvVarName)) {
      issueNames.add(name as EnvVarName);
    }
  }

  return { ok: false, issues: [...issueNames] };
}
