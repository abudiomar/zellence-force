import { describe, expect, test } from "vitest";
import { parsePublicEnv } from "./public-env";

describe("public web config", () => {
  test("requires an API URL", () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_API_URL: "http://localhost:4000" })).toEqual({
      NEXT_PUBLIC_API_URL: "http://localhost:4000"
    });
    expect(() => parsePublicEnv({})).toThrow("NEXT_PUBLIC_API_URL");
  });
});
