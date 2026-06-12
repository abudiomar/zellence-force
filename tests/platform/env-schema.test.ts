import { describe, expect, test } from "vitest";
import { parseEnv } from "@zellforce/config";

describe("environment schema", () => {
  test("reports missing required runtime config without reading process.env implicitly", () => {
    const result = parseEnv({});

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues).toContain("NODE_ENV");
      expect(result.issues).toContain("APP_ENV");
      expect(result.issues).toContain("APP_URL");
      expect(result.issues).toContain("API_URL");
      expect(result.issues).toContain("DATABASE_URL");
      expect(result.issues).toContain("BETTER_AUTH_SECRET");
      expect(result.issues).toContain("BETTER_AUTH_URL");
      expect(result.issues).toContain("TOKEN_SIGNING_SECRET");
    }
  });

  test("accepts Better Auth runtime config and keeps worker token signing separate", () => {
    const result = parseEnv({
      NODE_ENV: "test",
      APP_ENV: "test",
      APP_URL: "http://localhost:3000",
      API_URL: "http://localhost:4000",
      DATABASE_URL: "postgres://zellforce:zellforce_test@localhost:54329/zellforce_test",
      BETTER_AUTH_SECRET: "12345678901234567890123456789012",
      BETTER_AUTH_URL: "http://localhost:4000",
      TOKEN_SIGNING_SECRET: "12345678901234567890123456789012"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.env.BETTER_AUTH_URL).toBe("http://localhost:4000");
      expect(result.env.API_PORT).toBe(4000);
    }
  });
});
