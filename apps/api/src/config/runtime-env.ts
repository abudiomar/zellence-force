import { parseEnv, type RuntimeEnvInput } from "@zellforce/config";

export function loadApiEnv(input: RuntimeEnvInput) {
  const result = parseEnv(input);

  if (!result.ok) {
    throw new Error(`Missing required env vars: ${result.issues.join(", ")}`);
  }

  return result.env;
}

export function loadApiServerEnv(input: RuntimeEnvInput) {
  return loadApiEnv({
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
    DB_SSL_MODE: input.DB_SSL_MODE ?? "disable",
    CORS_ORIGIN: input.CORS_ORIGIN ?? "http://localhost:3000"
  });
}
