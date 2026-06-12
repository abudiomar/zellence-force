import { describe, expect, test } from "vitest";
import { parseEnv } from "./runtime-env";

describe("auth runtime config", () => {
  test("provides stable session and password defaults", () => {
    const result = parseEnv({
      NODE_ENV: "test",
      APP_ENV: "test",
      APP_URL: "http://localhost:3000",
      API_URL: "http://localhost:4000",
      DATABASE_URL: "postgres://test",
      BETTER_AUTH_SECRET: "12345678901234567890123456789012",
      BETTER_AUTH_URL: "http://localhost:4000",
      TOKEN_SIGNING_SECRET: "12345678901234567890123456789012"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.env.AUTH_SESSION_EXPIRES_IN).toBe(604800);
      expect(result.env.AUTH_SESSION_UPDATE_AGE).toBe(86400);
      expect(result.env.AUTH_PASSWORD_MIN_LENGTH).toBe(8);
      expect(result.env.AUTH_PASSWORD_MAX_LENGTH).toBe(128);
    }
  });
});
