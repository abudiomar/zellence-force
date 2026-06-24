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

function queueItem() {
  return {
    id: "row-1",
    sourceRowId: "2",
    status: "pending_review" as const,
    fullName: "Sara Ahmed",
    phone: "+966500000000",
    email: null,
    city: "Riyadh",
    errorMessages: [],
    matchedPersonId: null,
    screeningStatus: "needs_review" as const,
    interviewStatus: "not_scheduled" as const,
    contractSent: false,
    contractStatus: "not_sent" as const,
    createdAt: "2026-06-12T00:00:00.000Z"
  };
}

function baseApplicants(overrides: Partial<ApplicantImportRepository> = {}): ApplicantImportRepository {
  return {
    createImportRun: vi.fn(async () => "run-1"),
    upsertImportRow: vi.fn(async (input) => ({ id: `row-${input.sourceRowId}`, ...input })),
    finishImportRun: vi.fn(async () => undefined),
    findExistingPersonByPhone: vi.fn(async () => null),
    listReviewQueue: vi.fn(async () => [queueItem()]),
    findImportRow: vi.fn(async () => queueItem()),
    createPersonFromApplicant: vi.fn(async () => "person-1"),
    mergeApplicantIntoPerson: vi.fn(async () => "person-existing"),
    updateImportRowDecision: vi.fn(async () => undefined),
    updateScreening: vi.fn(async () => ({
      id: "row-1",
      sourceRowId: "2",
      status: "pending_review" as const,
      fullName: "Sara Ahmed",
      phone: "+966500000000",
      email: null,
      city: "Riyadh",
      errorMessages: [],
      matchedPersonId: null,
      screeningStatus: "shortlist_for_interview" as const,
      screeningNotes: "Strong profile",
      interviewStatus: "not_scheduled" as const,
      contractSent: false,
      contractStatus: "not_sent" as const,
      createdAt: "2026-06-12T00:00:00.000Z"
    })),
    updateInterviewPipeline: vi.fn(async () => ({
      id: "row-1",
      sourceRowId: "2",
      status: "pending_review" as const,
      fullName: "Sara Ahmed",
      phone: "+966500000000",
      email: null,
      city: "Riyadh",
      errorMessages: [],
      matchedPersonId: null,
      screeningStatus: "shortlist_for_interview" as const,
      interviewStatus: "interviewed" as const,
      contractSent: true,
      contractStatus: "sent" as const,
      presentationScore: 4,
      communicationScore: 5,
      englishFluencyScore: 3,
      finalScore: 4,
      createdAt: "2026-06-12T00:00:00.000Z"
    })),
    saveToStaffPool: vi.fn(async () => ({
      personId: "person-1",
      row: {
        id: "row-1",
        sourceRowId: "2",
        status: "accepted" as const,
        fullName: "Sara Ahmed",
        phone: "+966500000000",
        email: null,
        city: "Riyadh",
        errorMessages: [],
        matchedPersonId: null,
        createdPersonId: "person-1",
        screeningStatus: "save_to_staff_pool" as const,
        interviewStatus: "passed" as const,
        contractSent: true,
        contractStatus: "signed" as const,
        finalScore: 4.5,
        createdAt: "2026-06-12T00:00:00.000Z"
      }
    })),
    listStaffPool: vi.fn(async () => [
      {
        id: "row-1",
        sourceRowId: "2",
        status: "accepted" as const,
        personId: "person-1",
        fullName: "Sara Ahmed",
        phone: "+966500000000",
        email: null,
        city: "Riyadh",
        errorMessages: [],
        matchedPersonId: null,
        createdPersonId: "person-1",
        screeningStatus: "save_to_staff_pool" as const,
        interviewStatus: "passed" as const,
        contractSent: true,
        contractStatus: "signed" as const,
        finalScore: 4.5,
        savedForFuture: false,
        savedToStaff: true,
        createdAt: "2026-06-12T00:00:00.000Z"
      }
    ]),
    createDemoEvent: vi.fn(async () => ({
      id: "demo-event-1",
      name: "Riyadh Launch",
      city: "Riyadh",
      eventDate: "2026-07-01",
      roleName: "Host",
      neededHeadcount: 6,
      shortlisted: 0,
      confirmed: 0
    })),
    listDemoEvents: vi.fn(async () => [
      {
        id: "demo-event-1",
        name: "Riyadh Launch",
        city: "Riyadh",
        eventDate: "2026-07-01",
        roleName: "Host",
        neededHeadcount: 6,
        shortlisted: 1,
        confirmed: 0
      }
    ]),
    addCandidateToDemoEvent: vi.fn(async () => ({
      id: "demo-event-1",
      name: "Riyadh Launch",
      city: "Riyadh",
      eventDate: "2026-07-01",
      roleName: "Host",
      neededHeadcount: 6,
      shortlisted: 1,
      confirmed: 0
    })),
    listWhatsAppInbox: vi.fn(async () => [
      {
        id: "message-1",
        fromPhone: "+966500000000",
        body: "Emergency, I cannot attend",
        intent: "emergency" as const,
        isEmergency: true,
        personId: "person-1",
        applicantRowId: "row-1",
        matchedName: "Sara Ahmed",
        receivedAt: "2026-06-12T00:00:00.000Z"
      }
    ]),
    recordWhatsAppInbound: vi.fn(async () => ({
      id: "message-1",
      fromPhone: "+966500000000",
      body: "Emergency, I cannot attend",
      intent: "emergency" as const,
      isEmergency: true,
      personId: "person-1",
      applicantRowId: "row-1",
      matchedName: "Sara Ahmed",
      receivedAt: "2026-06-12T00:00:00.000Z"
    })),
    findWhatsAppContactContext: vi.fn(async () => null),
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
  whatsappSender?: {
    send(input: {
      to: string;
      response: {
        kind: "text" | "interactive_buttons";
        body: string;
        buttons?: Array<{ id: string; title: string }>;
      };
    }): Promise<void>;
  };
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
        listTabs: vi.fn(async () => [
          { id: "0", title: "Form Responses 1", index: 0 },
          { id: "123", title: "Interview", index: 1 }
        ]),
        readRows: vi.fn(async () => [
          { rowId: "2", values: { "Full Name": "Sara Ahmed", Mobile: "+966500000000", City: "Riyadh" } }
        ])
      }
    },
    ...(options.whatsappSender ? { whatsappSender: options.whatsappSender } : {}),
    whatsappWebhookVerifyToken: "verify-token",
    whatsappWebhookTenantId: "tenant-a"
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

  test("previews sheet headers and records screening/interview pipeline changes", async () => {
    const applicants = baseApplicants();
    const server = app({ applicants });

    const tabs = await request(server).post("/api/applicants/sheet-tabs").send({
      sourceId: "sheet-123"
    });
    expect(tabs.status).toBe(200);
    expect(tabs.body.tabs).toEqual([
      { id: "0", title: "Form Responses 1", index: 0 },
      { id: "123", title: "Interview", index: 1 }
    ]);

    const preview = await request(server).post("/api/applicants/header-preview").send({
      sourceId: "sheet-123",
      sourceRange: "Form Responses 1!A:Z"
    });
    expect(preview.status).toBe(200);
    expect(preview.body.headers).toEqual(["Full Name", "Mobile", "City"]);

    const screening = await request(server)
      .patch("/api/applicants/review-queue/row-1/screening")
      .send({ screeningStatus: "shortlist_for_interview", notes: "Strong profile" });
    expect(screening.status).toBe(200);
    expect(screening.body.screeningStatus).toBe("shortlist_for_interview");

    const interview = await request(server)
      .patch("/api/applicants/review-queue/row-1/interview-pipeline")
      .send({
        interviewStatus: "interviewed",
        contractSent: true,
        contractStatus: "sent",
        scores: { presentation: 4, communication: 5, englishFluency: 3 }
      });
    expect(interview.status).toBe(200);
    expect(interview.body.finalScore).toBe(4);

    expect(applicants.updateInterviewPipeline).toHaveBeenCalledWith(
      expect.objectContaining({
        finalScore: 4,
        presentationScore: 4,
        communicationScore: 5,
        englishFluencyScore: 3
      })
    );
  });

  test("saves applicants to staff pool, filters staff, and manages demo event shortlist", async () => {
    const server = app({});

    const save = await request(server)
      .post("/api/applicants/review-queue/row-1/save-to-staff")
      .send({ mode: "staff" });
    expect(save.status).toBe(200);
    expect(save.body.personId).toBe("person-1");

    const staff = await request(server).get("/api/staff-pool?city=Riyadh&minFinalScore=4&hasCv=true");
    expect(staff.status).toBe(200);
    expect(staff.body[0]).toMatchObject({ fullName: "Sara Ahmed", savedToStaff: true });

    const created = await request(server).post("/api/demo-events").send({
      name: "Riyadh Launch",
      city: "Riyadh",
      eventDate: "2026-07-01",
      roleName: "Host",
      neededHeadcount: 6
    });
    expect(created.status).toBe(201);
    expect(created.body.neededHeadcount).toBe(6);

    const shortlisted = await request(server)
      .post("/api/demo-events/demo-event-1/shortlist")
      .send({ applicantRowId: "row-1", personId: "person-1" });
    expect(shortlisted.status).toBe(200);
    expect(shortlisted.body.shortlisted).toBe(1);
  });

  test("verifies Meta WhatsApp webhook and records emergency inbound messages", async () => {
    const applicants = baseApplicants();
    const server = app({ applicants });

    const challenge = await request(server)
      .get("/api/whatsapp/webhook")
      .query({
        "hub.mode": "subscribe",
        "hub.verify_token": "verify-token",
        "hub.challenge": "challenge-123"
      });
    expect(challenge.status).toBe(200);
    expect(challenge.text).toBe("challenge-123");

    const inbound = await request(server)
      .post("/api/whatsapp/webhook")
      .send({
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      id: "wamid.demo-1",
                      from: "966500000000",
                      text: { body: "Emergency, I cannot attend" }
                    }
                  ]
                }
              }
            ]
          }
        ]
      });
    expect(inbound.status).toBe(200);
    expect(inbound.body.received).toBe(1);
    expect(applicants.recordWhatsAppInbound).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-a",
        waMessageId: "wamid.demo-1",
        fromPhone: "+966500000000",
        intent: "emergency",
        isEmergency: true
      })
    );

    const inbox = await request(server).get("/api/whatsapp/inbox");
    expect(inbox.status).toBe(200);
    expect(inbox.body[0].isEmergency).toBe(true);
  });

  test("sends simple menu responses from WhatsApp webhook actions", async () => {
    const sender = { send: vi.fn(async () => undefined) };
    const applicants = baseApplicants();
    const server = app({ applicants, whatsappSender: sender });

    const unregistered = await request(server)
      .post("/api/whatsapp/webhook")
      .send({
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      id: "wamid.unregistered",
                      from: "966599999999",
                      text: { body: "Hello" }
                    }
                  ]
                }
              }
            ]
          }
        ]
      });
    expect(unregistered.status).toBe(200);
    expect(sender.send).toHaveBeenCalledWith({
      to: "+966599999999",
      response: {
        kind: "interactive_buttons",
        body: "Welcome to MAG Events. How can we help you today?",
        buttons: [
          { id: "apply", title: "Apply" },
          { id: "contact_team", title: "Contact team" }
        ]
      }
    });

    vi.mocked(applicants.findWhatsAppContactContext).mockResolvedValueOnce({
      personId: "person-1",
      applicantRowId: "row-1",
      fullName: "Sara Ahmed",
      phone: "+966500000000",
      email: "sara@example.com",
      city: "Riyadh",
      gender: "female",
      age: 25,
      screeningStatus: "save_to_staff_pool",
      interviewStatus: "passed",
      contractStatus: "signed",
      finalScore: 4.5
    });
    const profile = await request(server)
      .post("/api/whatsapp/webhook")
      .send({
        entry: [
          {
            changes: [
              {
                value: {
                  messages: [
                    {
                      id: "wamid.profile",
                      from: "966500000000",
                      interactive: {
                        type: "button_reply",
                        button_reply: { id: "profile", title: "Profile" }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ]
      });
    expect(profile.status).toBe(200);
    expect(sender.send).toHaveBeenLastCalledWith({
      to: "+966500000000",
      response: {
        kind: "text",
        body: expect.stringContaining("Sara Ahmed")
      }
    });
  });
});
