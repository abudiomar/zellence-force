import {
  CREATE_INTERNAL_USER_INPUT_SCHEMA,
  TENANT_SETTINGS_SCHEMA,
  UPDATE_TENANT_SETTINGS_INPUT_SCHEMA,
  type AuthenticatedUser,
  type CreateInternalUserInput,
  type TenantSettings,
  type UpdateTenantSettingsInput
} from "@zellforce/contracts";
import {
  PERMISSIONS,
  authorizeRole,
  type Permission,
  type PermissionDecision
} from "@zellforce/domain";

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
