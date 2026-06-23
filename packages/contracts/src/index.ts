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
  dateOfBirth: z.string().trim().min(1).optional(),
  age: z.string().trim().min(1).optional(),
  photoUrl: z.string().trim().min(1).optional(),
  cvUrl: z.string().trim().min(1).optional(),
  experience: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional()
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
  email: EMAIL_SCHEMA.or(z.literal("")).optional(),
  city: z.string().trim().min(1).optional(),
  gender: z.string().trim().min(1).optional(),
  nationalId: z.string().trim().min(1).optional(),
  dateOfBirth: z.string().trim().min(1).optional(),
  age: z.string().trim().min(1).optional(),
  photoUrl: z.string().trim().min(1).optional(),
  cvUrl: z.string().trim().min(1).optional(),
  experience: z.string().trim().min(1).optional(),
  notes: z.string().trim().min(1).optional()
});

export type ApplicantImportMappedData = z.infer<typeof APPLICANT_IMPORT_MAPPED_DATA_SCHEMA>;

export const APPLICANT_IMPORT_ROW_SCHEMA = z.object({
  sourceRowId: z.string().trim().min(1),
  rawData: z.record(z.string(), z.unknown()),
  mappedData: APPLICANT_IMPORT_MAPPED_DATA_SCHEMA
});

export type ApplicantImportRow = z.infer<typeof APPLICANT_IMPORT_ROW_SCHEMA>;

export const SCREENING_STATUSES = [
  "needs_review",
  "shortlist_for_interview",
  "save_to_staff_pool",
  "save_for_future",
  "underqualified",
  "overqualified",
  "rejected"
] as const;

export const INTERVIEW_STATUSES = [
  "not_scheduled",
  "scheduled",
  "interviewed",
  "no_show",
  "passed",
  "failed"
] as const;

export const DEMO_CONTRACT_STATUSES = [
  "not_sent",
  "sent",
  "pending",
  "signed",
  "refused"
] as const;

export const WHATSAPP_INTENTS = [
  "profile_request",
  "emergency",
  "current_status",
  "unknown"
] as const;

export const SCREENING_STATUS_SCHEMA = z.enum(SCREENING_STATUSES);
export const INTERVIEW_STATUS_SCHEMA = z.enum(INTERVIEW_STATUSES);
export const DEMO_CONTRACT_STATUS_SCHEMA = z.enum(DEMO_CONTRACT_STATUSES);
export const WHATSAPP_INTENT_SCHEMA = z.enum(WHATSAPP_INTENTS);

export type ScreeningStatus = z.infer<typeof SCREENING_STATUS_SCHEMA>;
export type InterviewStatus = z.infer<typeof INTERVIEW_STATUS_SCHEMA>;
export type DemoContractStatus = z.infer<typeof DEMO_CONTRACT_STATUS_SCHEMA>;
export type WhatsAppIntent = z.infer<typeof WHATSAPP_INTENT_SCHEMA>;

const SCORE_SCHEMA = z.number().min(1).max(5).nullable();
const FILTER_BOOLEAN_SCHEMA = z.union([
  z.boolean(),
  z.enum(["true", "false"]).transform((value) => value === "true")
]);

export const APPLICANT_REVIEW_QUEUE_ITEM_SCHEMA = z.object({
  id: z.string().min(1),
  sourceRowId: z.string().min(1),
  status: APPLICANT_IMPORT_ROW_STATUS_SCHEMA,
  fullName: z.string().min(1).nullable(),
  phone: z.string().min(1).nullable(),
  email: z.string().nullable(),
  city: z.string().min(1).nullable(),
  gender: z.string().nullable().optional(),
  age: z.number().nullable().optional(),
  photoUrl: z.string().nullable().optional(),
  cvUrl: z.string().nullable().optional(),
  experience: z.string().nullable().optional(),
  rawData: z.record(z.string(), z.unknown()).optional(),
  errorMessages: z.array(z.string()),
  matchedPersonId: z.string().min(1).nullable(),
  createdPersonId: z.string().min(1).nullable().optional(),
  screeningStatus: SCREENING_STATUS_SCHEMA.default("needs_review"),
  screeningNotes: z.string().nullable().optional(),
  interviewStatus: INTERVIEW_STATUS_SCHEMA.default("not_scheduled"),
  contractSent: z.boolean().default(false),
  contractStatus: DEMO_CONTRACT_STATUS_SCHEMA.default("not_sent"),
  presentationScore: SCORE_SCHEMA.optional(),
  communicationScore: SCORE_SCHEMA.optional(),
  englishFluencyScore: SCORE_SCHEMA.optional(),
  finalScore: z.number().min(1).max(5).nullable().optional(),
  createdAt: z.string().min(1)
});

export type ApplicantReviewQueueItem = z.infer<typeof APPLICANT_REVIEW_QUEUE_ITEM_SCHEMA>;

export const PREVIEW_SHEET_HEADERS_INPUT_SCHEMA = z.object({
  sourceId: z.string().trim().min(1),
  sourceRange: z.string().trim().min(1)
});

export type PreviewSheetHeadersInput = z.infer<typeof PREVIEW_SHEET_HEADERS_INPUT_SCHEMA>;

export const SHEET_HEADER_PREVIEW_SCHEMA = z.object({
  headers: z.array(z.string()),
  sampleRows: z.array(z.record(z.string(), z.unknown()))
});

export type SheetHeaderPreview = z.infer<typeof SHEET_HEADER_PREVIEW_SCHEMA>;

export const UPDATE_SCREENING_INPUT_SCHEMA = z.object({
  screeningStatus: SCREENING_STATUS_SCHEMA,
  notes: z.string().trim().optional()
});

export type UpdateScreeningInput = z.infer<typeof UPDATE_SCREENING_INPUT_SCHEMA>;

export const UPDATE_INTERVIEW_PIPELINE_INPUT_SCHEMA = z.object({
  interviewStatus: INTERVIEW_STATUS_SCHEMA,
  contractSent: z.boolean().optional(),
  contractStatus: DEMO_CONTRACT_STATUS_SCHEMA.optional(),
  scores: z.object({
    presentation: z.number().min(1).max(5).nullable().optional(),
    communication: z.number().min(1).max(5).nullable().optional(),
    englishFluency: z.number().min(1).max(5).nullable().optional()
  }).optional()
});

export type UpdateInterviewPipelineInput = z.infer<typeof UPDATE_INTERVIEW_PIPELINE_INPUT_SCHEMA>;

export const STAFF_POOL_FILTER_SCHEMA = z.object({
  search: z.string().trim().optional(),
  city: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  minAge: z.coerce.number().int().min(0).max(100).optional(),
  maxAge: z.coerce.number().int().min(0).max(100).optional(),
  hasPhoto: FILTER_BOOLEAN_SCHEMA.optional(),
  hasCv: FILTER_BOOLEAN_SCHEMA.optional(),
  screeningStatus: SCREENING_STATUS_SCHEMA.optional(),
  interviewStatus: INTERVIEW_STATUS_SCHEMA.optional(),
  contractStatus: DEMO_CONTRACT_STATUS_SCHEMA.optional(),
  minFinalScore: z.coerce.number().min(1).max(5).optional(),
  minPresentation: z.coerce.number().min(1).max(5).optional(),
  minCommunication: z.coerce.number().min(1).max(5).optional(),
  minEnglishFluency: z.coerce.number().min(1).max(5).optional()
});

export type StaffPoolFilter = z.infer<typeof STAFF_POOL_FILTER_SCHEMA>;

export const STAFF_POOL_ITEM_SCHEMA = APPLICANT_REVIEW_QUEUE_ITEM_SCHEMA.extend({
  personId: z.string().min(1).nullable(),
  savedForFuture: z.boolean(),
  savedToStaff: z.boolean()
});

export type StaffPoolItem = z.infer<typeof STAFF_POOL_ITEM_SCHEMA>;

export const DEMO_EVENT_INPUT_SCHEMA = z.object({
  name: z.string().trim().min(1),
  city: z.string().trim().optional(),
  eventDate: z.string().trim().optional(),
  roleName: z.string().trim().min(1),
  neededHeadcount: z.number().int().positive().max(1000)
});

export type DemoEventInput = z.infer<typeof DEMO_EVENT_INPUT_SCHEMA>;

export const DEMO_EVENT_SCHEMA = DEMO_EVENT_INPUT_SCHEMA.extend({
  id: z.string().min(1),
  shortlisted: z.number().int().nonnegative(),
  confirmed: z.number().int().nonnegative()
});

export type DemoEvent = z.infer<typeof DEMO_EVENT_SCHEMA>;

export const ADD_SHORTLIST_INPUT_SCHEMA = z.object({
  applicantRowId: z.string().trim().min(1).optional(),
  personId: z.string().trim().min(1).optional()
}).refine((input) => Boolean(input.applicantRowId || input.personId), {
  message: "Applicant row or person is required"
});

export type AddShortlistInput = z.infer<typeof ADD_SHORTLIST_INPUT_SCHEMA>;

export const WHATSAPP_INBOUND_MESSAGE_SCHEMA = z.object({
  id: z.string().min(1),
  fromPhone: z.string().min(1),
  body: z.string().min(1),
  intent: WHATSAPP_INTENT_SCHEMA,
  isEmergency: z.boolean(),
  personId: z.string().min(1).nullable(),
  applicantRowId: z.string().min(1).nullable(),
  matchedName: z.string().nullable(),
  receivedAt: z.string().min(1)
});

export type WhatsAppInboundMessage = z.infer<typeof WHATSAPP_INBOUND_MESSAGE_SCHEMA>;

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
