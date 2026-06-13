import { z } from "zod";

export const USER_ROLES = [
  "owner",
  "admin",
  "hr",
  "coordinator",
  "supervisor",
  "finance",
  "viewer"
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_SCHEMA = z.enum(USER_ROLES);

export const SUPPORTED_LANGUAGES = ["ar", "en"] as const;
export const DEFAULT_LANGUAGE = "ar" as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const LANGUAGE_SCHEMA = z.enum(SUPPORTED_LANGUAGES);

export function getTextDirection(language: SupportedLanguage): "rtl" | "ltr" {
  return language === "ar" ? "rtl" : "ltr";
}

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLE_SCHEMA.safeParse(value).success;
}

export function parseUserRole(value: unknown): UserRole {
  const result = USER_ROLE_SCHEMA.safeParse(value);
  if (!result.success) {
    throw new Error("Invalid user role");
  }

  return result.data;
}

export const PERMISSIONS = {
  MANAGE_SETTINGS: "settings.manage",
  MANAGE_USERS: "users.manage",
  READ_LIMITED: "read.limited",
  MANAGE_APPLICANT_IMPORT: "applicants.import.manage",
  MANAGE_PEOPLE: "people.manage",
  MANAGE_EVENTS: "events.manage",
  VIEW_ASSIGNED_EVENT: "events.view.assigned",
  RECORD_ASSIGNED_ATTENDANCE: "attendance.record.assigned",
  REVIEW_PAYMENTS: "payments.review",
  APPROVE_PAYMENTS: "payments.approve",
  EXPORT_PAYMENTS: "payments.export",
  VIEW_AUDIT: "audit.view"
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const fullAccess = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  owner: fullAccess,
  admin: fullAccess,
  hr: [
    PERMISSIONS.MANAGE_APPLICANT_IMPORT,
    PERMISSIONS.MANAGE_PEOPLE,
    PERMISSIONS.READ_LIMITED
  ],
  coordinator: [
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.READ_LIMITED
  ],
  supervisor: [
    PERMISSIONS.VIEW_ASSIGNED_EVENT,
    PERMISSIONS.RECORD_ASSIGNED_ATTENDANCE,
    PERMISSIONS.READ_LIMITED
  ],
  finance: [
    PERMISSIONS.REVIEW_PAYMENTS,
    PERMISSIONS.EXPORT_PAYMENTS,
    PERMISSIONS.READ_LIMITED
  ],
  viewer: [PERMISSIONS.READ_LIMITED]
};

export function canRole(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export type PermissionScope = "tenant" | "assigned-event" | "read-only" | "denied";

export type PermissionDecision = {
  allowed: boolean;
  scope: PermissionScope;
};

export function authorizeRole(role: UserRole, permission: Permission): PermissionDecision {
  if (!canRole(role, permission)) {
    return { allowed: false, scope: "denied" };
  }

  if (
    role === "supervisor" &&
    (permission === PERMISSIONS.VIEW_ASSIGNED_EVENT ||
      permission === PERMISSIONS.RECORD_ASSIGNED_ATTENDANCE)
  ) {
    return { allowed: true, scope: "assigned-event" };
  }

  if (permission === PERMISSIONS.READ_LIMITED) {
    return { allowed: true, scope: "read-only" };
  }

  return { allowed: true, scope: "tenant" };
}

export const EVENT_STATUSES = [
  "draft",
  "recruiting",
  "staffed",
  "active",
  "completed",
  "cancelled"
] as const;

export const PERSON_STATUSES = [
  "pool",
  "maybe_roster",
  "active",
  "inactive",
  "blacklisted"
] as const;

export const ASSIGNMENT_STAGES = [
  "candidate",
  "screening",
  "interview",
  "offered",
  "accepted",
  "confirmed",
  "declined",
  "rejected",
  "withdrawn"
] as const;

export const CONTRACT_STATUSES = [
  "draft",
  "sent",
  "signed",
  "declined",
  "expired"
] as const;

export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "late",
  "excused"
] as const;

export const BACKUP_OUTCOMES = [
  "not_applicable",
  "standby",
  "took_over"
] as const;

export const APPLICANT_IMPORT_ROW_STATUSES = [
  "pending_review",
  "error",
  "accepted",
  "merged",
  "rejected",
  "deferred"
] as const;

export const APPLICANT_IMPORT_ROW_STATUS_SCHEMA = z.enum(APPLICANT_IMPORT_ROW_STATUSES);

export const PAYMENT_BATCH_STATUSES = [
  "draft",
  "in_review",
  "reviewed",
  "approved",
  "rejected",
  "exported"
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];
export type PersonStatus = (typeof PERSON_STATUSES)[number];
export type AssignmentStage = (typeof ASSIGNMENT_STAGES)[number];
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
export type BackupOutcome = (typeof BACKUP_OUTCOMES)[number];
export type ApplicantImportRowStatus = (typeof APPLICANT_IMPORT_ROW_STATUSES)[number];
export type PaymentBatchStatus = (typeof PAYMENT_BATCH_STATUSES)[number];

const statusValues = {
  event: EVENT_STATUSES,
  person: PERSON_STATUSES,
  assignment: ASSIGNMENT_STAGES,
  contract: CONTRACT_STATUSES,
  attendance: ATTENDANCE_STATUSES,
  backup: BACKUP_OUTCOMES,
  applicantImportRow: APPLICANT_IMPORT_ROW_STATUSES,
  paymentBatch: PAYMENT_BATCH_STATUSES
} as const;

export type StatusKind = keyof typeof statusValues;
export type StatusFor<K extends StatusKind> = (typeof statusValues)[K][number];

export function parseStatus<K extends StatusKind>(kind: K, value: unknown): StatusFor<K> {
  const values = statusValues[kind] as readonly string[];
  if (typeof value === "string" && values.includes(value)) {
    return value as StatusFor<K>;
  }

  throw new Error(`Invalid ${kind} status`);
}

export function phaseZeroHarnessStatus(): "green" {
  return "green";
}
