import { describe, expect, test, vi } from "vitest";
import {
  createPgBootstrapRepository,
  createPgSettingsRepository,
  createPgUserRepository,
  createSessionRevoker
} from "./postgres";

describe("PostgreSQL Phase 2 Adapters", () => {
  test("maps application user rows and scopes lookups by identity", async () => {
    const query = vi.fn(async () => ({
      rows: [
        {
          id: "user",
          auth_user_id: "auth",
          tenant_id: "tenant",
          person_id: null,
          email: "owner@example.com",
          full_name: "Owner",
          role: "owner",
          is_active: true
        }
      ],
      rowCount: 1
    }));
    const users = createPgUserRepository({ query });

    await expect(users.findByAuthUserId("auth")).resolves.toMatchObject({
      authUserId: "auth",
      tenantId: "tenant",
      role: "owner"
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("where auth_user_id = $1"),
      ["auth"]
    );
  });

  test("maps tenant settings and revokes sessions by Better Auth identity", async () => {
    const query = vi.fn(async (sql: string) => ({
      rows: sql.includes("tenant_settings")
        ? [
            {
              default_language: "ar",
              supported_languages: ["ar", "en"],
              timezone: "Asia/Riyadh",
              currency: "SAR",
              hijri_enabled: true
            }
          ]
        : [],
      rowCount: 1
    }));

    const settings = createPgSettingsRepository({ query });
    const sessions = createSessionRevoker({ query });

    await expect(settings.get("tenant")).resolves.toMatchObject({ currency: "SAR" });
    await sessions.revokeAllForIdentity("auth-user");

    expect(query).toHaveBeenCalledWith(
      'delete from session where "userId" = $1',
      ["auth-user"]
    );
  });

  test("provides one-time tenant bootstrap operations", async () => {
    const query = vi.fn(async (sql: string) => ({
      rows: sql.includes("select id from tenants")
        ? [{ id: "tenant" }]
        : sql.includes("count(*)")
          ? [{ count: 0 }]
          : [],
      rowCount: 1
    }));
    const bootstrap = createPgBootstrapRepository({ query });

    await expect(bootstrap.findTenantIdBySlug("mag-events")).resolves.toBe("tenant");
    await expect(bootstrap.countUsers("tenant")).resolves.toBe(0);
    await bootstrap.ensureTenantSettings("tenant");

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("insert into tenant_settings"),
      ["tenant"]
    );
  });
});
