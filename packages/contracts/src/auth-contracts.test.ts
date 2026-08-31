import { describe, expect, test } from "vitest";
import {
  API_ERROR_SCHEMA,
  AUTHENTICATED_USER_SCHEMA,
  CREATE_INTERNAL_USER_INPUT_SCHEMA,
  LINK_USER_PERSON_INPUT_SCHEMA,
  TENANT_SETTINGS_SCHEMA,
  UPDATE_TENANT_SETTINGS_INPUT_SCHEMA,
  UPDATE_USER_STATUS_INPUT_SCHEMA,
  USER_SUMMARY_SCHEMA
} from "./index";

describe("Phase 2 contracts", () => {
  test("validates authenticated user and internal user inputs", () => {
    const actor = AUTHENTICATED_USER_SCHEMA.parse({
      id: "app-user",
      authUserId: "auth-user",
      tenantId: "tenant",
      personId: null,
      email: "owner@example.com",
      fullName: "Owner",
      role: "owner",
      isActive: true
    });

    expect(actor.role).toBe("owner");
    expect(
      CREATE_INTERNAL_USER_INPUT_SCHEMA.parse({
        fullName: "Admin",
        email: " ADMIN@EXAMPLE.COM ",
        password: "password123",
        role: "admin",
        isActive: true,
        personId: null
      }).email
    ).toBe("admin@example.com");
    expect(UPDATE_USER_STATUS_INPUT_SCHEMA.parse({ isActive: false })).toEqual({
      isActive: false
    });
    expect(LINK_USER_PERSON_INPUT_SCHEMA.parse({ personId: null })).toEqual({
      personId: null
    });
    expect(USER_SUMMARY_SCHEMA.parse(actor)).toMatchObject({ id: "app-user" });
  });

  test("rejects unsupported roles and weak passwords", () => {
    expect(() =>
      CREATE_INTERNAL_USER_INPUT_SCHEMA.parse({
        fullName: "Invalid",
        email: "invalid@example.com",
        password: "short",
        role: "super-admin"
      })
    ).toThrow();
  });

  test("validates tenant settings and partial updates", () => {
    expect(
      TENANT_SETTINGS_SCHEMA.parse({
        defaultLanguage: "ar",
        supportedLanguages: ["ar", "en"],
        timezone: "Asia/Riyadh",
        currency: "SAR",
        hijriEnabled: true
      })
    ).toMatchObject({ currency: "SAR" });

    expect(() =>
      TENANT_SETTINGS_SCHEMA.parse({
        defaultLanguage: "ar",
        supportedLanguages: ["en"],
        timezone: "Invalid/Timezone",
        currency: "sar",
        hijriEnabled: true
      })
    ).toThrow();

    expect(
      UPDATE_TENANT_SETTINGS_INPUT_SCHEMA.parse({ currency: "USD" })
    ).toEqual({ currency: "USD" });
  });

  test("provides a stable API error contract", () => {
    expect(
      API_ERROR_SCHEMA.parse({
        error: "Forbidden",
        code: "FORBIDDEN"
      })
    ).toEqual({ error: "Forbidden", code: "FORBIDDEN" });
  });
});
