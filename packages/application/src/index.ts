import {
  APPLICANT_DECISION_INPUT_SCHEMA,
  RECORD_INTERVIEW_SCORE_INPUT_SCHEMA,
  RUN_APPLICANT_IMPORT_INPUT_SCHEMA,
  SCHEDULE_INTERVIEW_INPUT_SCHEMA,
  CREATE_INTERNAL_USER_INPUT_SCHEMA,
  TENANT_SETTINGS_SCHEMA,
  UPDATE_TENANT_SETTINGS_INPUT_SCHEMA,
  type ApplicantDecisionInput,
  type ApplicantImportMappedData,
  type ApplicantImportResult,
  type ApplicantReviewQueueItem,
  type AuthenticatedUser,
  type CreateInternalUserInput,
  type RecordInterviewScoreInput,
  type RunApplicantImportInput,
  type ScheduleInterviewInput,
  type TenantSettings,
  type UpdateTenantSettingsInput
} from "@zellforce/contracts";
import {
  PERMISSIONS,
  authorizeRole,
  type Permission,
  type PermissionDecision
} from "@zellforce/domain";
import { createHash } from "node:crypto";

export type RequestActor = AuthenticatedUser;

export class ApplicationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}

export interface IdentityAdmin {
  createIdentity(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ authUserId: string }>;
  deleteIdentity(authUserId: string): Promise<void>;
}

export interface SessionRevoker {
  revokeAllForIdentity(authUserId: string): Promise<void>;
}

export interface UserRepository {
  findByAuthUserId(authUserId: string): Promise<AuthenticatedUser | null>;
  findById(tenantId: string, userId: string): Promise<AuthenticatedUser | null>;
  listByTenant(tenantId: string): Promise<AuthenticatedUser[]>;
  create(
    tenantId: string,
    input: Omit<CreateInternalUserInput, "password">,
    authUserId: string
  ): Promise<AuthenticatedUser>;
  setActive(
    tenantId: string,
    userId: string,
    isActive: boolean
  ): Promise<AuthenticatedUser>;
  linkPerson(
    tenantId: string,
    userId: string,
    personId: string | null
  ): Promise<AuthenticatedUser>;
  personBelongsToTenant(tenantId: string, personId: string): Promise<boolean>;
  countActiveOwners(tenantId: string): Promise<number>;
  writeAudit(input: {
    tenantId: string;
    actorUserId: string;
    action: string;
    entityId: string;
    before: unknown;
    after: unknown;
  }): Promise<void>;
}

export interface SettingsRepository {
  get(tenantId: string): Promise<TenantSettings>;
  update(tenantId: string, settings: TenantSettings): Promise<TenantSettings>;
  writeAudit(input: {
    tenantId: string;
    actorUserId: string;
    before: TenantSettings;
    after: TenantSettings;
  }): Promise<void>;
}

export interface BootstrapRepository {
  findTenantIdBySlug(slug: string): Promise<string | null>;
  countUsers(tenantId: string): Promise<number>;
  ensureTenantSettings(tenantId: string): Promise<void>;
}

export type ApplicantSheetRow = {
  rowId: string;
  values: Record<string, unknown>;
};

export interface ApplicantSheetReader {
  readRows(input: {
    sourceId: string;
    sourceRange: string;
  }): Promise<ApplicantSheetRow[]>;
}

export type ApplicantImportRowWrite = {
  tenantId: string;
  importRunId: string;
  sourceId: string;
  sourceRange: string;
  sourceRowId: string;
  sourceHash: string;
  rawData: Record<string, unknown>;
  mappedData: ApplicantImportMappedData | null;
  status: "pending_review" | "error";
  errorMessages: string[];
  matchedPersonId: string | null;
};

export interface ApplicantImportRepository {
  createImportRun(input: {
    tenantId: string;
    sourceId: string;
    sourceRange: string;
    startedByUserId: string;
  }): Promise<string>;
  upsertImportRow(input: ApplicantImportRowWrite): Promise<{ id: string } & ApplicantImportRowWrite>;
  finishImportRun(input: {
    tenantId: string;
    importRunId: string;
    rowsSeen: number;
    rowsImported: number;
    rowsFailed: number;
    status: "completed" | "failed" | "partial";
    errorSummary?: string;
  }): Promise<void>;
  findExistingPersonByPhone(tenantId: string, phone: string): Promise<string | null>;
  listReviewQueue(input: {
    tenantId: string;
    status?: string;
  }): Promise<ApplicantReviewQueueItem[]>;
  findImportRow(tenantId: string, rowId: string): Promise<ApplicantReviewQueueItem | null>;
  createPersonFromApplicant(input: {
    tenantId: string;
    actorUserId: string;
    rowId: string;
  }): Promise<string>;
  mergeApplicantIntoPerson(input: {
    tenantId: string;
    actorUserId: string;
    rowId: string;
    targetPersonId: string;
  }): Promise<string>;
  updateImportRowDecision(input: {
    tenantId: string;
    actorUserId: string;
    rowId: string;
    status: "accepted" | "merged" | "rejected" | "deferred";
    personId: string | null;
    notes?: string;
  }): Promise<void>;
  scheduleInterview(input: {
    tenantId: string;
    actorUserId: string;
    personId: string;
    eventId?: string;
    interviewerUserId?: string;
    scheduledAt: string;
    notes?: string;
  }): Promise<string>;
  recordInterviewScore(input: {
    tenantId: string;
    actorUserId: string;
    interviewId: string;
    scores: Array<{ criterion: string; score: number }>;
    notes?: string;
    minimumScore?: number;
  }): Promise<{ interviewId: string; overallScore: number; belowMinimum: boolean }>;
  writeAudit(input: {
    tenantId: string;
    actorUserId: string;
    action: string;
    entityId: string;
    before: unknown;
    after: unknown;
  }): Promise<void>;
}

export function authorize(actor: RequestActor, permission: Permission): PermissionDecision {
  const decision = authorizeRole(actor.role, permission);
  if (!decision.allowed) {
    throw new ApplicationError("FORBIDDEN", "Forbidden", 403);
  }
  return decision;
}

export async function resolveRequestActor(input: {
  authUserId: string;
  users: UserRepository;
}): Promise<RequestActor> {
  const actor = await input.users.findByAuthUserId(input.authUserId);
  if (!actor?.isActive) {
    throw new ApplicationError("UNAUTHORIZED", "Unauthorized", 401);
  }
  return actor;
}

export async function createInternalUser(
  deps: { users: UserRepository; identity: IdentityAdmin },
  actor: RequestActor,
  rawInput: CreateInternalUserInput
): Promise<AuthenticatedUser> {
  authorize(actor, PERMISSIONS.MANAGE_USERS);
  const input = CREATE_INTERNAL_USER_INPUT_SCHEMA.parse(rawInput);

  if (
    input.personId &&
    !(await deps.users.personBelongsToTenant(actor.tenantId, input.personId))
  ) {
    throw new ApplicationError(
      "PERSON_TENANT_MISMATCH",
      "Person does not belong to tenant",
      400
    );
  }

  return createIdentityAndUser(deps, actor.tenantId, input);
}

export async function listInternalUsers(
  deps: { users: UserRepository },
  actor: RequestActor
): Promise<AuthenticatedUser[]> {
  authorize(actor, PERMISSIONS.MANAGE_USERS);
  return deps.users.listByTenant(actor.tenantId);
}

export async function setInternalUserActive(
  deps: { users: UserRepository; sessions: SessionRevoker },
  actor: RequestActor,
  userId: string,
  isActive: boolean
): Promise<AuthenticatedUser> {
  authorize(actor, PERMISSIONS.MANAGE_USERS);
  const current = await deps.users.findById(actor.tenantId, userId);
  if (!current) {
    throw new ApplicationError("USER_NOT_FOUND", "User not found", 404);
  }

  if (!isActive && current.role === "owner") {
    const activeOwners = await deps.users.countActiveOwners(actor.tenantId);
    if (activeOwners <= 1) {
      throw new ApplicationError(
        "FINAL_OWNER_REQUIRED",
        "At least one active owner is required",
        409
      );
    }
  }

  const updated = await deps.users.setActive(actor.tenantId, userId, isActive);
  if (!isActive) {
    await deps.sessions.revokeAllForIdentity(current.authUserId);
  }
  await deps.users.writeAudit({
    tenantId: actor.tenantId,
    actorUserId: actor.id,
    action: isActive ? "user.activated" : "user.deactivated",
    entityId: userId,
    before: current,
    after: updated
  });
  return updated;
}

export async function linkUserToPerson(
  deps: { users: UserRepository },
  actor: RequestActor,
  userId: string,
  personId: string | null
): Promise<AuthenticatedUser> {
  authorize(actor, PERMISSIONS.MANAGE_USERS);
  if (
    personId &&
    !(await deps.users.personBelongsToTenant(actor.tenantId, personId))
  ) {
    throw new ApplicationError(
      "PERSON_TENANT_MISMATCH",
      "Person does not belong to tenant",
      400
    );
  }
  return deps.users.linkPerson(actor.tenantId, userId, personId);
}

export async function getTenantSettings(
  deps: { settings: SettingsRepository },
  actor: RequestActor
): Promise<TenantSettings> {
  return deps.settings.get(actor.tenantId);
}

export async function updateTenantSettings(
  deps: { settings: SettingsRepository },
  actor: RequestActor,
  rawInput: UpdateTenantSettingsInput
): Promise<TenantSettings> {
  authorize(actor, PERMISSIONS.MANAGE_SETTINGS);
  const input = UPDATE_TENANT_SETTINGS_INPUT_SCHEMA.parse(rawInput);
  const before = await deps.settings.get(actor.tenantId);
  const next = TENANT_SETTINGS_SCHEMA.parse({ ...before, ...input });
  const updated = await deps.settings.update(actor.tenantId, next);
  await deps.settings.writeAudit({
    tenantId: actor.tenantId,
    actorUserId: actor.id,
    before,
    after: updated
  });
  return updated;
}

export async function importApplicantRows(
  deps: { applicants: ApplicantImportRepository; sheet: ApplicantSheetReader },
  actor: RequestActor,
  rawInput: RunApplicantImportInput
): Promise<ApplicantImportResult> {
  authorize(actor, PERMISSIONS.MANAGE_APPLICANT_IMPORT);
  const input = RUN_APPLICANT_IMPORT_INPUT_SCHEMA.parse(rawInput);
  const importRunId = await deps.applicants.createImportRun({
    tenantId: actor.tenantId,
    sourceId: input.sourceId,
    sourceRange: input.sourceRange,
    startedByUserId: actor.id
  });

  let rows: ApplicantSheetRow[];
  try {
    rows = await deps.sheet.readRows({
      sourceId: input.sourceId,
      sourceRange: input.sourceRange
    });
  } catch (error) {
    await deps.applicants.finishImportRun({
      tenantId: actor.tenantId,
      importRunId,
      rowsSeen: 0,
      rowsImported: 0,
      rowsFailed: 0,
      status: "failed",
      errorSummary: error instanceof Error ? error.message : "Sheet read failed"
    });
    throw new ApplicationError("APPLICANT_IMPORT_FAILED", "Applicant import failed", 502);
  }

  let rowsImported = 0;
  let rowsFailed = 0;
  for (const row of rows) {
    const mapped = mapApplicantRow(row.values, input.mapping);
    const validation = validateApplicantMapping(mapped);
    const status = validation.length === 0 ? "pending_review" : "error";
    if (status === "pending_review") rowsImported += 1;
    else rowsFailed += 1;
    const matchedPersonId =
      mapped.phone && validation.length === 0
        ? await deps.applicants.findExistingPersonByPhone(actor.tenantId, mapped.phone)
        : null;

    await deps.applicants.upsertImportRow({
      tenantId: actor.tenantId,
      importRunId,
      sourceId: input.sourceId,
      sourceRange: input.sourceRange,
      sourceRowId: row.rowId,
      sourceHash: createApplicantSourceHash(input.sourceId, row.rowId, mapped),
      rawData: row.values,
      mappedData: validation.length === 0 ? mapped : null,
      status,
      errorMessages: validation,
      matchedPersonId
    });
  }

  const status = rowsFailed === 0 ? "completed" : rowsImported === 0 ? "failed" : "partial";
  const result = {
    importRunId,
    rowsSeen: rows.length,
    rowsImported,
    rowsFailed,
    status
  } as const;
  await deps.applicants.finishImportRun({
    tenantId: actor.tenantId,
    ...result
  });
  return result;
}

export async function listApplicantReviewQueue(
  deps: { applicants: ApplicantImportRepository },
  actor: RequestActor,
  filter: { status?: string }
): Promise<ApplicantReviewQueueItem[]> {
  authorize(actor, PERMISSIONS.MANAGE_APPLICANT_IMPORT);
  return deps.applicants.listReviewQueue({
    tenantId: actor.tenantId,
    ...(filter.status ? { status: filter.status } : {})
  });
}

export async function decideApplicantImportRow(
  deps: { applicants: ApplicantImportRepository },
  actor: RequestActor,
  rowId: string,
  rawInput: ApplicantDecisionInput
): Promise<{ personId: string | null; status: "accepted" | "merged" | "rejected" | "deferred" }> {
  authorize(actor, PERMISSIONS.MANAGE_APPLICANT_IMPORT);
  const input = APPLICANT_DECISION_INPUT_SCHEMA.parse(rawInput);
  const current = await deps.applicants.findImportRow(actor.tenantId, rowId);
  if (!current) {
    throw new ApplicationError("APPLICANT_ROW_NOT_FOUND", "Applicant row not found", 404);
  }

  let personId: string | null = null;
  let status: "accepted" | "merged" | "rejected" | "deferred";
  if (input.decision === "accept") {
    personId = await deps.applicants.createPersonFromApplicant({
      tenantId: actor.tenantId,
      actorUserId: actor.id,
      rowId
    });
    status = "accepted";
  } else if (input.decision === "merge") {
    personId = await deps.applicants.mergeApplicantIntoPerson({
      tenantId: actor.tenantId,
      actorUserId: actor.id,
      rowId,
      targetPersonId: input.targetPersonId
    });
    status = "merged";
  } else {
    status = input.decision === "reject" ? "rejected" : "deferred";
  }

  await deps.applicants.updateImportRowDecision({
    tenantId: actor.tenantId,
    actorUserId: actor.id,
    rowId,
    status,
    personId,
    ...("notes" in input && input.notes ? { notes: input.notes } : {})
  });
  await deps.applicants.writeAudit({
    tenantId: actor.tenantId,
    actorUserId: actor.id,
    action: `applicant.${status}`,
    entityId: rowId,
    before: current,
    after: { personId, status }
  });
  return { personId, status };
}

export async function scheduleInterview(
  deps: { applicants: ApplicantImportRepository },
  actor: RequestActor,
  rawInput: ScheduleInterviewInput
): Promise<{ interviewId: string }> {
  authorize(actor, PERMISSIONS.MANAGE_PEOPLE);
  const input = SCHEDULE_INTERVIEW_INPUT_SCHEMA.parse(rawInput);
  const interviewId = await deps.applicants.scheduleInterview({
    tenantId: actor.tenantId,
    actorUserId: actor.id,
    personId: input.personId,
    scheduledAt: input.scheduledAt,
    ...(input.eventId ? { eventId: input.eventId } : {}),
    ...(input.interviewerUserId ? { interviewerUserId: input.interviewerUserId } : {}),
    ...(input.notes ? { notes: input.notes } : {})
  });
  return { interviewId };
}

export async function recordInterviewScore(
  deps: { applicants: ApplicantImportRepository },
  actor: RequestActor,
  rawInput: RecordInterviewScoreInput
): Promise<{ interviewId: string; overallScore: number; belowMinimum: boolean }> {
  authorize(actor, PERMISSIONS.MANAGE_PEOPLE);
  const input = RECORD_INTERVIEW_SCORE_INPUT_SCHEMA.parse(rawInput);
  return deps.applicants.recordInterviewScore({
    tenantId: actor.tenantId,
    actorUserId: actor.id,
    interviewId: input.interviewId,
    scores: input.scores,
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.minimumScore !== undefined ? { minimumScore: input.minimumScore } : {})
  });
}

function mapApplicantRow(
  raw: Record<string, unknown>,
  mapping: RunApplicantImportInput["mapping"]
): ApplicantImportMappedData {
  const mapped: Record<string, string> = {};
  for (const [field, column] of Object.entries(mapping)) {
    if (!column) continue;
    const value = raw[column];
    if (value !== undefined && value !== null) {
      mapped[field] = String(value).trim();
    }
  }
  return mapped as ApplicantImportMappedData;
}

function validateApplicantMapping(mapped: Partial<ApplicantImportMappedData>): string[] {
  const errors: string[] = [];
  if (!mapped.fullName?.trim()) errors.push("fullName is required");
  if (!mapped.phone?.trim()) errors.push("phone is required");
  return errors;
}

function createApplicantSourceHash(
  sourceId: string,
  sourceRowId: string,
  mapped: ApplicantImportMappedData
): string {
  return createHash("sha256")
    .update(JSON.stringify({ sourceId, sourceRowId, mapped }))
    .digest("hex");
}

export async function bootstrapOwner(
  deps: {
    bootstrap: BootstrapRepository;
    users: UserRepository;
    identity: IdentityAdmin;
  },
  rawInput: {
    tenantSlug: string;
    fullName: string;
    email: string;
    password: string;
  }
): Promise<AuthenticatedUser> {
  const tenantId = await deps.bootstrap.findTenantIdBySlug(rawInput.tenantSlug.trim());
  if (!tenantId) {
    throw new ApplicationError("TENANT_NOT_FOUND", "Tenant not found", 404);
  }
  if ((await deps.bootstrap.countUsers(tenantId)) !== 0) {
    throw new ApplicationError(
      "TENANT_ALREADY_BOOTSTRAPPED",
      "Tenant already contains users",
      409
    );
  }
  const input = CREATE_INTERNAL_USER_INPUT_SCHEMA.parse({
    fullName: rawInput.fullName,
    email: rawInput.email,
    password: rawInput.password,
    role: "owner",
    isActive: true,
    personId: null
  });
  await deps.bootstrap.ensureTenantSettings(tenantId);
  return createIdentityAndUser(deps, tenantId, input);
}

async function createIdentityAndUser(
  deps: { users: UserRepository; identity: IdentityAdmin },
  tenantId: string,
  input: CreateInternalUserInput
): Promise<AuthenticatedUser> {
  const identity = await deps.identity.createIdentity({
    name: input.fullName,
    email: input.email,
    password: input.password
  });

  try {
    const { password: _password, ...applicationInput } = input;
    return await deps.users.create(tenantId, applicationInput, identity.authUserId);
  } catch (error) {
    await deps.identity.deleteIdentity(identity.authUserId);
    throw error;
  }
}

export const APPLICATION_PACKAGE_STATUS = "ready" as const;
