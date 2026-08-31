import { describe, expect, test } from "vitest";
import { loadApiEnv, loadApiServerEnv } from "./runtime-env";

describe("API runtime env", () => {
  test("fails startup when required config is missing", () => {
    expect(() => loadApiEnv({})).toThrow("Missing required env vars");
  });

  test("loads safe local defaults for dev server startup", () => {
    expect(loadApiServerEnv({}).DATABASE_URL).toBe(
      "postgres://zellforce:zellforce_test@localhost:54329/zellforce_test"
    );
    expect(loadApiServerEnv({}).BETTER_AUTH_URL).toBe("http://localhost:4000");
  });
});
