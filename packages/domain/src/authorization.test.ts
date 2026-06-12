import { describe, expect, test } from "vitest";
import { authorizeRole, PERMISSIONS } from "./index";

describe("authorization decisions", () => {
  test("returns tenant scope for owner and assigned-event scope for supervisor", () => {
    expect(authorizeRole("owner", PERMISSIONS.MANAGE_USERS)).toEqual({
      allowed: true,
      scope: "tenant"
    });
    expect(authorizeRole("supervisor", PERMISSIONS.VIEW_ASSIGNED_EVENT)).toEqual({
      allowed: true,
      scope: "assigned-event"
    });
  });

  test("returns read-only or denied decisions", () => {
    expect(authorizeRole("viewer", PERMISSIONS.READ_LIMITED)).toEqual({
      allowed: true,
      scope: "read-only"
    });
    expect(authorizeRole("finance", PERMISSIONS.APPROVE_PAYMENTS)).toEqual({
      allowed: false,
      scope: "denied"
    });
  });
});
