import { describe, expect, test, vi } from "vitest";
import { getPublicEnv, parsePublicEnv } from "./public-env";

describe("public web config", () => {
  test("requires an API URL", () => {
    expect(parsePublicEnv({ NEXT_PUBLIC_API_URL: "http://localhost:4000" })).toEqual({
      NEXT_PUBLIC_API_URL: "http://localhost:4000"
    });
    expect(() => parsePublicEnv({})).toThrow("NEXT_PUBLIC_API_URL");
  });

  test("uses localhost API fallback during local development", () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousApiUrl = process.env.NEXT_PUBLIC_API_URL;
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_API_URL", undefined);

    expect(getPublicEnv()).toEqual({
      NEXT_PUBLIC_API_URL: "http://localhost:4000"
    });

    vi.stubEnv("NODE_ENV", previousNodeEnv);
    vi.stubEnv("NEXT_PUBLIC_API_URL", previousApiUrl);
  });
});
