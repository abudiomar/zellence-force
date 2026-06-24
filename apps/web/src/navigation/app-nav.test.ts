import { describe, expect, test } from "vitest";
import { APP_NAV_ITEMS, visibleAppNavItems } from "./app-nav";

describe("app nav", () => {
  test("only renders enabled items the role is permitted to see", () => {
    expect(visibleAppNavItems("viewer").every((item) => item.enabled)).toBe(true);
    // Settings is a single owner/admin destination; users live inside it as a tab,
    // not as a separate top-level nav item.
    expect(APP_NAV_ITEMS.map((item) => item.href)).not.toContain("/settings/users");
    expect(visibleAppNavItems("viewer").map((item) => item.href)).not.toContain("/settings/general");
    expect(visibleAppNavItems("owner").map((item) => item.href)).toContain("/settings/general");
  });

  test("exposes the candidate pipeline spine to staffing roles", () => {
    expect(visibleAppNavItems("hr").map((item) => item.href)).toContain("/candidates");
    expect(visibleAppNavItems("hr").map((item) => item.href)).toContain("/staff");
    expect(visibleAppNavItems("hr").map((item) => item.href)).toContain("/events");
    expect(visibleAppNavItems("viewer").map((item) => item.href)).not.toContain("/candidates");
  });

  test("dashboard is visible to everyone authenticated", () => {
    expect(visibleAppNavItems("viewer").map((item) => item.href)).toContain("/");
    expect(visibleAppNavItems("owner").map((item) => item.href)).toContain("/");
  });
});
