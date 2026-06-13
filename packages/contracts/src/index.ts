import { z } from "zod";
import {
  APPLICANT_IMPORT_ROW_STATUS_SCHEMA,
  LANGUAGE_SCHEMA,
  USER_ROLE_SCHEMA
} from "@zellforce/domain";

const EMAIL_SCHEMA = z.string().trim().toLowerCase().email();
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

export const GOOGLE_SHEET_MAPPING_SCHEMA = z.object({
  fullName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.string().trim().min(1).optional(),
  city: z.string().trim().min(1).optional(),
  gender: z.string().trim().min(1).optional(),
  nationalId: z.string().trim().min(1).optional(),
  dateOfBirth: z.string().trim().min(1).optional()
});

export type GoogleSheetMapping = z.infer<typeof GOOGLE_SHEET_MAPPING_SCHEMA>;

export const RUN_APPLICANT_IMPORT_INPUT_SCHEMA = z.object({
  sourceId: z.string().trim().min(1),
  sourceRange: z.string().trim().min(1),
  mapping: GOOGLE_SHEET_MAPPING_SCHEMA
});

export type RunApplicantImportInput = z.infer<typeof RUN_APPLICANT_IMPORT_INPUT_SCHEMA>;

export const APPLICANT_IMPORT_MAPPED_DATA_SCHEMA = z.object({
  fullName: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: EMAIL_SCHEMA.optional(),
  city: z.string().trim().min(1).optional(),
  gender: z.string().trim().min(1).optional(),
  nationalId: z.string().trim().min(1).optional(),
  dateOfBirth: z.string().trim().min(1).optional()
});

export type ApplicantImportMappedData = z.infer<typeof APPLICANT_IMPORT_MAPPED_DATA_SCHEMA>;

export const APPLICANT_IMPORT_ROW_SCHEMA = z.object({
  sourceRowId: z.string().trim().min(1),
  rawData: z.record(z.string(), z.unknown()),
  mappedData: APPLICANT_IMPORT_MAPPED_DATA_SCHEMA
});

export type ApplicantImportRow = z.infer<typeof APPLICANT_IMPORT_ROW_SCHEMA>;

export const APPLICANT_REVIEW_QUEUE_ITEM_SCHEMA = z.object({
  id: z.string().min(1),
  sourceRowId: z.string().min(1),
  status: APPLICANT_IMPORT_ROW_STATUS_SCHEMA,
  fullName: z.string().min(1).nullable(),
  phone: z.string().min(1).nullable(),
  email: z.string().email().nullable(),
  city: z.string().min(1).nullable(),
  errorMessages: z.array(z.string()),
  matchedPersonId: z.string().min(1).nullable(),
  createdAt: z.string().min(1)
});

export type ApplicantReviewQueueItem = z.infer<typeof APPLICANT_REVIEW_QUEUE_ITEM_SCHEMA>;

export const APPLICANT_DECISION_INPUT_SCHEMA = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("accept"),
    notes: z.string().trim().min(1).optional()
  }),
  z.object({
    decision: z.literal("merge"),
    targetPersonId: z.string().trim().min(1),
    notes: z.string().trim().min(1).optional()
  }),
  z.object({
    decision: z.literal("reject"),
    notes: z.string().trim().min(1)
  }),
  z.object({
    decision: z.literal("defer"),
    notes: z.string().trim().min(1).optional()
  })
]);

export type ApplicantDecisionInput = z.infer<typeof APPLICANT_DECISION_INPUT_SCHEMA>;

export const SCHEDULE_INTERVIEW_INPUT_SCHEMA = z.object({
  personId: z.string().trim().min(1),
  eventId: z.string().trim().min(1).optional(),
  interviewerUserId: z.string().trim().min(1).optional(),
  scheduledAt: z.string().datetime(),
  notes: z.string().trim().min(1).optional()
});

export type ScheduleInterviewInput = z.infer<typeof SCHEDULE_INTERVIEW_INPUT_SCHEMA>;

export const RECORD_INTERVIEW_SCORE_INPUT_SCHEMA = z.object({
  interviewId: z.string().trim().min(1),
  scores: z.array(
    z.object({
      criterion: z.string().trim().min(1),
      score: z.number().min(0).max(5)
    })
  ).min(1),
  notes: z.string().trim().min(1).optional(),
  minimumScore: z.number().min(0).max(5).optional()
});

export type RecordInterviewScoreInput = z.infer<typeof RECORD_INTERVIEW_SCORE_INPUT_SCHEMA>;

export const APPLICANT_IMPORT_RESULT_SCHEMA = z.object({
  importRunId: z.string().min(1),
  rowsSeen: z.number().int().nonnegative(),
  rowsImported: z.number().int().nonnegative(),
  rowsFailed: z.number().int().nonnegative(),
  status: z.enum(["completed", "failed", "partial"])
});

export type ApplicantImportResult = z.infer<typeof APPLICANT_IMPORT_RESULT_SCHEMA>;

export const CONTRACTS_PACKAGE_STATUS = "ready" as const;
