import { describe, expect, test } from "vitest";
import { DEFAULT_LOCALE, getLocaleFromCookieValue, getTextDirectionForLocale } from "./config";

describe("web i18n config", () => {
  test("defaults invalid or missing locale to Arabic RTL", () => {
    expect(DEFAULT_LOCALE).toBe("ar");
    expect(getLocaleFromCookieValue(undefined)).toBe("ar");
    expect(getLocaleFromCookieValue("fr")).toBe("ar");
    expect(getTextDirectionForLocale("ar")).toBe("rtl");
    expect(getTextDirectionForLocale("en")).toBe("ltr");
  });
});
