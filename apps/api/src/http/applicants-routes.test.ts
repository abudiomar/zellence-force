import { describe, expect, test, vi } from "vitest";
import request from "supertest";
import type {
  ApplicantImportRepository,
  ApplicantSheetReader,
  IdentityAdmin,
  SessionRevoker,
  SettingsRepository,
  UserRepository
} from "@zellforce/application";
import type { AuthenticatedUser } from "@zellforce/contracts";
import { createExpressApp } from "./app";

const hr: AuthenticatedUser = {
  id: "hr-user",
  authUserId: "auth-hr",
  tenantId: "tenant-a",
  personId: null,
  email: "hr@example.com",
  fullName: "HR",
  role: "hr",
  isActive: true
};

function baseUsers(actor: AuthenticatedUser = hr): UserRepository {
  return {
    findByAuthUserId: async () => actor,
    findById: async () => actor,
    listByTenant: async () => [actor],
    create: async () => actor,
    setActive: async () => actor,
    linkPerson: async () => actor,
    personBelongsToTenant: async () => true,
    countActiveOwners: async () => 1,
    writeAudit: async () => undefined
  };
}

function baseSettings(): SettingsRepository {
  return {
    get: async () => ({
      defaultLanguage: "ar",
      supportedLanguages: ["ar", "en"],
      timezone: "Asia/Riyadh",
      currency: "SAR",
      hijriEnabled: true
    }),
    update: async (_tenantId, value) => value,
    writeAudit: async () => undefined
  };
}

function baseApplicants(overrides: Partial<ApplicantImportRepository> = {}): ApplicantImportRepository {
  return {
    createImportRun: vi.fn(async () => "run-1"),
    upsertImportRow: vi.fn(async (input) => ({ id: `row-${input.sourceRowId}`, ...input })),
    finishImportRun: vi.fn(async () => undefined),
    findExistingPersonByPhone: vi.fn(async () => null),
    listReviewQueue: vi.fn(async () => [
      {
        id: "row-1",
        sourceRowId: "2",
        status: "pending_review" as const,
        fullName: "Sara Ahmed",
        phone: "+966500000000",
        email: null,
        city: "Riyadh",
        errorMessages: [],
        matchedPersonId: null,
        createdAt: "2026-06-12T00:00:00.000Z"
      }
    ]),
    findImportRow: vi.fn(async () => ({
      id: "row-1",
      sourceRowId: "2",
      status: "pending_review" as const,
      fullName: "Sara Ahmed",
      phone: "+966500000000",
      email: null,
      city: "Riyadh",
      errorMessages: [],
      matchedPersonId: null,
      createdAt: "2026-06-12T00:00:00.000Z"
    })),
    createPersonFromApplicant: vi.fn(async () => "person-1"),
    mergeApplicantIntoPerson: vi.fn(async () => "person-existing"),
    updateImportRowDecision: vi.fn(async () => undefined),
    scheduleInterview: vi.fn(async () => "interview-1"),
    recordInterviewScore: vi.fn(async () => ({
      interviewId: "interview-1",
      overallScore: 4,
      belowMinimum: false
    })),
    writeAudit: vi.fn(async () => undefined),
    ...overrides
  };
}

function app(options: {
  actor?: AuthenticatedUser;
  applicants?: ApplicantImportRepository;
  sheet?: ApplicantSheetReader;
}) {
  const identity: IdentityAdmin = {
    createIdentity: async () => ({ authUserId: "created" }),
    deleteIdentity: async () => undefined
  };
  const sessions: SessionRevoker = {
    revokeAllForIdentity: async () => undefined
  };
  return createExpressApp({
    sessionReader: { api: { getSession: async () => ({ user: { id: "auth-hr" } }) } },
    phaseTwo: {
      users: baseUsers(options.actor),
      settings: baseSettings(),
      identity,
      sessions
    },
    phaseFour: {
      applicants: options.applicants ?? baseApplicants(),
      sheet: options.sheet ?? {
        readRows: vi.fn(async () => [
          { rowId: "2", values: { "Full Name": "Sara Ahmed", Mobile: "+966500000000" } }
        ])
      }
    }
  });
}

describe("Applicant API routes", () => {
  test("runs import sync and lists review queue for HR", async () => {
    const server = app({});

    const sync = await request(server).post("/api/applicants/import-runs").send({
      sourceId: "sheet-123",
      sourceRange: "Form Responses 1!A:Z",
      mapping: { fullName: "Full Name", phone: "Mobile" }
    });
    expect(sync.status).toBe(201);
    expect(sync.body).toMatchObject({ rowsSeen: 1, rowsImported: 1 });

    const queue = await request(server).get("/api/applicants/review-queue");
    expect(queue.status).toBe(200);
    expect(queue.body[0].fullName).toBe("Sara Ahmed");
  });

  test("denies applicant import to viewer", async () => {
    const server = app({ actor: { ...hr, role: "viewer" } });

    const response = await request(server).post("/api/applicants/import-runs").send({
      sourceId: "sheet-123",
      sourceRange: "A:Z",
      mapping: { fullName: "Full Name", phone: "Mobile" }
    });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe("FORBIDDEN");
  });

  test("records applicant decisions and interview score", async () => {
    const server = app({});

    const decision = await request(server)
      .post("/api/applicants/review-queue/row-1/decision")
      .send({ decision: "accept", notes: "Ready" });
    expect(decision.status).toBe(200);
    expect(decision.body).toEqual({ personId: "person-1", status: "accepted" });

    const interview = await request(server).post("/api/interviews").send({
      personId: "person-1",
      scheduledAt: "2026-06-13T10:00:00.000Z"
    });
    expect(interview.status).toBe(201);

    const score = await request(server).post("/api/interviews/interview-1/scores").send({
      scores: [{ criterion: "communication", score: 4 }],
      minimumScore: 3
    });
    expect(score.status).toBe(200);
    expect(score.body.overallScore).toBe(4);
  });
});
