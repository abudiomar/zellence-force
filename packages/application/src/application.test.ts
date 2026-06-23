import { describe, expect, test, vi } from "vitest";
import { PERMISSIONS } from "@zellforce/domain";
import type {
  AuthenticatedUser,
  CreateInternalUserInput,
  TenantSettings
} from "@zellforce/contracts";
import {
  ApplicationError,
  authorize,
  bootstrapOwner,
  createInternalUser,
  linkUserToPerson,
  resolveRequestActor,
  setInternalUserActive,
  updateTenantSettings,
  type IdentityAdmin,
  type BootstrapRepository,
  type SessionRevoker,
  type SettingsRepository,
  type UserRepository
} from "./index";

const owner: AuthenticatedUser = {
  id: "owner",
  authUserId: "auth-owner",
  tenantId: "tenant-a",
  personId: null,
  email: "owner@example.com",
  fullName: "Owner",
  role: "owner",
  isActive: true
};

function userRepository(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findByAuthUserId: vi.fn(async () => owner),
    findById: vi.fn(async () => owner),
    listByTenant: vi.fn(async () => [owner]),
    create: vi.fn(async (_tenantId, input, authUserId) => ({
      id: "new-user",
      authUserId,
      tenantId: "tenant-a",
      personId: input.personId,
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      isActive: input.isActive
    })),
    setActive: vi.fn(async (_tenantId, id, isActive) => ({
      ...owner,
      id,
      isActive
    })),
    linkPerson: vi.fn(async (_tenantId, id, personId) => ({
      ...owner,
      id,
      personId
    })),
    personBelongsToTenant: vi.fn(async () => true),
    countActiveOwners: vi.fn(async () => 2),
    writeAudit: vi.fn(async () => undefined),
    ...overrides
  };
}

describe("Phase 2 application Actions", () => {
  test("resolves only active linked application users", async () => {
    await expect(
      resolveRequestActor({
        authUserId: "auth-owner",
        users: userRepository()
      })
    ).resolves.toEqual(owner);

    await expect(
      resolveRequestActor({
        authUserId: "missing",
        users: userRepository({ findByAuthUserId: vi.fn(async () => null) })
      })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  test("returns scoped permission decisions", () => {
    expect(authorize(owner, PERMISSIONS.MANAGE_USERS)).toEqual({
      allowed: true,
      scope: "tenant"
    });
    expect(() =>
      authorize({ ...owner, role: "finance" }, PERMISSIONS.APPROVE_PAYMENTS)
    ).toThrow(ApplicationError);
  });

  test("compensates identity creation when application user creation fails", async () => {
    const identity: IdentityAdmin = {
      createIdentity: vi.fn(async () => ({ authUserId: "new-auth" })),
      deleteIdentity: vi.fn(async () => undefined)
    };
    const input: CreateInternalUserInput = {
      fullName: "Admin",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      isActive: true,
      personId: null
    };

    await expect(
      createInternalUser(
        {
          users: userRepository({
            create: vi.fn(async () => {
              throw new Error("duplicate");
            })
          }),
          identity
        },
        owner,
        input
      )
    ).rejects.toThrow("duplicate");

    expect(identity.deleteIdentity).toHaveBeenCalledWith("new-auth");
  });

  test("prevents deactivating final active owner and revokes other users", async () => {
    const revoker: SessionRevoker = {
      revokeAllForIdentity: vi.fn(async () => undefined)
    };
    const finalOwnerRepo = userRepository({
      countActiveOwners: vi.fn(async () => 1)
    });

    await expect(
      setInternalUserActive(
        { users: finalOwnerRepo, sessions: revoker },
        owner,
        "owner",
        false
      )
    ).rejects.toMatchObject({ code: "FINAL_OWNER_REQUIRED" });

    const admin = { ...owner, id: "admin", authUserId: "auth-admin", role: "admin" as const };
    const users = userRepository({ findById: vi.fn(async () => admin) });
    await setInternalUserActive({ users, sessions: revoker }, owner, "admin", false);

    expect(revoker.revokeAllForIdentity).toHaveBeenCalledWith("auth-admin");
    expect(users.writeAudit).toHaveBeenCalled();
  });

  test("rejects linking a Person from another tenant", async () => {
    await expect(
      linkUserToPerson(
        {
          users: userRepository({
            personBelongsToTenant: vi.fn(async () => false)
          })
        },
        owner,
        "owner",
        "other-person"
      )
    ).rejects.toMatchObject({ code: "PERSON_TENANT_MISMATCH" });
  });

  test("merges tenant settings and records audit data", async () => {
    const current: TenantSettings = {
      defaultLanguage: "ar",
      supportedLanguages: ["ar", "en"],
      timezone: "Asia/Riyadh",
      currency: "SAR",
      hijriEnabled: true
    };
    const settings: SettingsRepository = {
      get: vi.fn(async () => current),
      update: vi.fn(async (_tenantId, next) => next),
      writeAudit: vi.fn(async () => undefined)
    };

    const result = await updateTenantSettings(
      { settings },
      owner,
      { currency: "USD" }
    );

    expect(result).toEqual({ ...current, currency: "USD" });
    expect(settings.update).toHaveBeenCalledWith("tenant-a", {
      ...current,
      currency: "USD"
    });
    expect(settings.writeAudit).toHaveBeenCalled();
  });

  test("bootstraps only an empty tenant with an owner role", async () => {
    const bootstrap: BootstrapRepository = {
      findTenantIdBySlug: vi.fn(async () => "tenant-a"),
      ensureTenant: vi.fn(async () => "tenant-a"),
      countUsers: vi.fn(async () => 0),
      ensureTenantSettings: vi.fn(async () => undefined)
    };
    const identity: IdentityAdmin = {
      createIdentity: vi.fn(async () => ({ authUserId: "auth-owner" })),
      deleteIdentity: vi.fn(async () => undefined)
    };
    const users = userRepository();

    await expect(
      bootstrapOwner(
        { bootstrap, identity, users },
        {
          tenantSlug: "mag-events",
          tenantName: "MAG Events",
          fullName: "Owner",
          email: "owner@example.com",
          password: "password123"
        }
      )
    ).resolves.toMatchObject({ role: "owner", tenantId: "tenant-a" });

    await expect(
      bootstrapOwner(
        {
          bootstrap: { ...bootstrap, countUsers: vi.fn(async () => 1) },
          identity,
          users
        },
        {
          tenantSlug: "mag-events",
          tenantName: "MAG Events",
          fullName: "Owner",
          email: "owner@example.com",
          password: "password123"
        }
      )
    ).rejects.toMatchObject({ code: "TENANT_ALREADY_BOOTSTRAPPED" });
  });

  test("creates the tenant during owner bootstrap when a tenant name is supplied", async () => {
    const bootstrap: BootstrapRepository = {
      findTenantIdBySlug: vi.fn(async () => null),
      ensureTenant: vi.fn(async () => "tenant-created"),
      countUsers: vi.fn(async () => 0),
      ensureTenantSettings: vi.fn(async () => undefined)
    };
    const identity: IdentityAdmin = {
      createIdentity: vi.fn(async () => ({ authUserId: "auth-owner" })),
      deleteIdentity: vi.fn(async () => undefined)
    };

    await expect(
      bootstrapOwner(
        { bootstrap, identity, users: userRepository() },
        {
          tenantSlug: "mag-events",
          tenantName: "MAG Events",
          fullName: "Owner",
          email: "owner@example.com",
          password: "password123"
        }
      )
    ).resolves.toMatchObject({ role: "owner" });

    expect(bootstrap.ensureTenant).toHaveBeenCalledWith({
      name: "MAG Events",
      slug: "mag-events"
    });
  });
});
