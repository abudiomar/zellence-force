import { describe, expect, test } from "vitest";
import { loadApiEnv } from "./runtime-env";

describe("API runtime env", () => {
  test("fails startup when required config is missing", () => {
    expect(() => loadApiEnv({})).toThrow("Missing required env vars");
  });
});
