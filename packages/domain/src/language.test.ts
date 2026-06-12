import { describe, expect, test } from "vitest";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_SCHEMA,
  SUPPORTED_LANGUAGES,
  getTextDirection
} from "./index";

describe("language source of truth", () => {
  test("defines supported languages and text direction", () => {
    expect(SUPPORTED_LANGUAGES).toEqual(["ar", "en"]);
    expect(DEFAULT_LANGUAGE).toBe("ar");
    expect(LANGUAGE_SCHEMA.parse("en")).toBe("en");
    expect(getTextDirection("ar")).toBe("rtl");
    expect(getTextDirection("en")).toBe("ltr");
  });
});
