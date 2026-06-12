import { z } from "zod";
import { USER_ROLE_SCHEMA } from "@zellforce/domain";

const EMAIL_SCHEMA = z.string().trim().toLowerCase().email();
const LANGUAGE_SCHEMA = z.enum(["ar", "en"]);
const TIMEZONE_SCHEMA = z.string().refine(
  (value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  },
  { message: "Invalid timezone" }
);

export const AUTHENTICATED_USER_SCHEMA = z.object({
  id: z.string().min(1),
  authUserId: z.string().min(1),
  tenantId: z.string().min(1),
  personId: z.string().min(1).nullable(),
  email: EMAIL_SCHEMA,
  fullName: z.string().trim().min(1),
  role: USER_ROLE_SCHEMA,
  isActive: z.boolean()
});

export type AuthenticatedUser = z.infer<typeof AUTHENTICATED_USER_SCHEMA>;

export const CREATE_INTERNAL_USER_INPUT_SCHEMA = z.object({
  fullName: z.string().trim().min(1),
  email: EMAIL_SCHEMA,
  password: z.string().min(8).max(128),
  role: USER_ROLE_SCHEMA,
  isActive: z.boolean().default(true),
  personId: z.string().min(1).nullable().default(null)
});

export type CreateInternalUserInput = z.infer<typeof CREATE_INTERNAL_USER_INPUT_SCHEMA>;

export const UPDATE_USER_STATUS_INPUT_SCHEMA = z.object({
  isActive: z.boolean()
});

export const LINK_USER_PERSON_INPUT_SCHEMA = z.object({
  personId: z.string().min(1).nullable()
});

export const USER_SUMMARY_SCHEMA = AUTHENTICATED_USER_SCHEMA;
export type UserSummary = z.infer<typeof USER_SUMMARY_SCHEMA>;

export const TENANT_SETTINGS_SCHEMA = z
  .object({
    defaultLanguage: LANGUAGE_SCHEMA,
    supportedLanguages: z.array(LANGUAGE_SCHEMA).min(1),
    timezone: TIMEZONE_SCHEMA,
    currency: z.string().regex(/^[A-Z]{3}$/),
    hijriEnabled: z.boolean()
  })
  .refine((settings) => settings.supportedLanguages.includes(settings.defaultLanguage), {
    message: "Default language must be supported",
    path: ["supportedLanguages"]
  });

export type TenantSettings = z.infer<typeof TENANT_SETTINGS_SCHEMA>;

export const UPDATE_TENANT_SETTINGS_INPUT_SCHEMA = z
  .object({
    defaultLanguage: LANGUAGE_SCHEMA.optional(),
    supportedLanguages: z.array(LANGUAGE_SCHEMA).min(1).optional(),
    timezone: TIMEZONE_SCHEMA.optional(),
    currency: z.string().regex(/^[A-Z]{3}$/).optional(),
    hijriEnabled: z.boolean().optional()
  })
  .refine((settings) => Object.keys(settings).length > 0, {
    message: "At least one setting is required"
  });

export type UpdateTenantSettingsInput = z.infer<typeof UPDATE_TENANT_SETTINGS_INPUT_SCHEMA>;

export const API_ERROR_SCHEMA = z.object({
  error: z.string().min(1),
  code: z.string().min(1),
  details: z.unknown().optional()
});

export type ApiError = z.infer<typeof API_ERROR_SCHEMA>;

export const CONTRACTS_PACKAGE_STATUS = "ready" as const;
