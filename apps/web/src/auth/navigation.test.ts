import { describe, expect, test } from "vitest";
import { visibleSettingsLinks } from "./navigation";

describe("permission-aware navigation", () => {
  test("shows user and settings controls only to owner/admin", () => {
    expect(visibleSettingsLinks("owner")).toEqual(["users", "general"]);
    expect(visibleSettingsLinks("admin")).toEqual(["users", "general"]);
    expect(visibleSettingsLinks("finance")).toEqual([]);
  });
});
