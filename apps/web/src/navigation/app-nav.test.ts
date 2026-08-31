import { describe, expect, test } from "vitest";
import { APP_NAV_ITEMS, visibleAppNavItems } from "./app-nav";

describe("app nav", () => {
  test("keeps disabled future modules out of rendered navigation", () => {
    expect(APP_NAV_ITEMS.some((item) => !item.enabled)).toBe(true);
    expect(visibleAppNavItems("viewer").every((item) => item.enabled)).toBe(true);
    expect(visibleAppNavItems("viewer").map((item) => item.href)).not.toContain("/settings/users");
    expect(visibleAppNavItems("owner").map((item) => item.href)).toContain("/settings/users");
    expect(visibleAppNavItems("hr").map((item) => item.href)).toContain("/recruitment/applicants");
    expect(visibleAppNavItems("viewer").map((item) => item.href)).not.toContain("/recruitment/applicants");
  });
});
