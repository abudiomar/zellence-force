import { describe, expect, test } from "vitest";
import {
  APPLICANT_IMPORT_ROW_STATUSES,
  ATTENDANCE_STATUSES,
  BACKUP_OUTCOMES,
  canRole,
  CONTRACT_STATUSES,
  EVENT_STATUSES,
  isUserRole,
  parseStatus,
  parseUserRole,
  PAYMENT_BATCH_STATUSES,
  PERMISSIONS,
  PERSON_STATUSES,
  ROLE_PERMISSIONS,
  USER_ROLES,
  USER_ROLE_SCHEMA
} from "./index";

describe("domain roles and permissions", () => {
  test("defines every MVP user role in one public Interface", () => {
    expect(USER_ROLES).toEqual([
      "owner",
      "admin",
      "hr",
      "coordinator",
      "supervisor",
      "finance",
      "viewer"
    ]);
    expect(USER_ROLE_SCHEMA.parse("finance")).toBe("finance");
    expect(isUserRole("supervisor")).toBe(true);
    expect(() => parseUserRole("guest")).toThrow("Invalid user role");
  });

  test("maps permissions without caller-specific role branching", () => {
    expect(canRole("owner", "payments.approve")).toBe(true);
    expect(canRole("admin", "settings.manage")).toBe(true);
    expect(canRole("finance", "payments.export")).toBe(true);
    expect(canRole("supervisor", "attendance.record.assigned")).toBe(true);
    expect(canRole("viewer", "payments.export")).toBe(false);
    expect(ROLE_PERMISSIONS.viewer).toEqual([PERMISSIONS.READ_LIMITED]);
  });
});

describe("domain statuses", () => {
  test("defines controlled status values for MVP entities", () => {
    expect(EVENT_STATUSES).toContain("active");
    expect(PERSON_STATUSES).toContain("blacklisted");
    expect(CONTRACT_STATUSES).toContain("signed");
    expect(ATTENDANCE_STATUSES).toContain("excused");
    expect(BACKUP_OUTCOMES).toContain("took_over");
    expect(APPLICANT_IMPORT_ROW_STATUSES).toEqual([
      "pending_review",
      "error",
      "accepted",
      "merged",
      "rejected",
      "deferred"
    ]);
    expect(PAYMENT_BATCH_STATUSES).toEqual([
      "draft",
      "in_review",
      "reviewed",
      "approved",
      "rejected",
      "exported"
    ]);
  });

  test("rejects invalid status values by status kind", () => {
    expect(parseStatus("paymentBatch", "approved")).toBe("approved");
    expect(() => parseStatus("paymentBatch", "paid")).toThrow("Invalid paymentBatch status");
  });
});
