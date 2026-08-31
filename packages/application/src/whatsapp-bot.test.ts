import { describe, expect, test, vi } from "vitest";
import {
  createWhatsAppBotResponse,
  handleWhatsAppInbound,
  type ApplicantImportRepository
} from "./index";

function applicantRepository(overrides: Partial<ApplicantImportRepository> = {}): ApplicantImportRepository {
  return {
    createImportRun: vi.fn(async () => "run-1"),
    upsertImportRow: vi.fn(async (input) => ({ id: `row-${input.sourceRowId}`, ...input })),
    finishImportRun: vi.fn(async () => undefined),
    findExistingPersonByPhone: vi.fn(async () => null),
    listReviewQueue: vi.fn(async () => []),
    findImportRow: vi.fn(async () => null),
    createPersonFromApplicant: vi.fn(async () => "person-1"),
    mergeApplicantIntoPerson: vi.fn(async () => "person-1"),
    updateImportRowDecision: vi.fn(async () => undefined),
    updateScreening: vi.fn(async () => {
      throw new Error("not used");
    }),
    updateInterviewPipeline: vi.fn(async () => {
      throw new Error("not used");
    }),
    saveToStaffPool: vi.fn(async () => {
      throw new Error("not used");
    }),
    listStaffPool: vi.fn(async () => []),
    createDemoEvent: vi.fn(async () => {
      throw new Error("not used");
    }),
    listDemoEvents: vi.fn(async () => []),
    addCandidateToDemoEvent: vi.fn(async () => {
      throw new Error("not used");
    }),
    listWhatsAppInbox: vi.fn(async () => []),
    recordWhatsAppInbound: vi.fn(async (input) => ({
      id: "message-1",
      fromPhone: input.fromPhone,
      body: input.body,
      intent: input.intent,
      isEmergency: input.isEmergency,
      personId: null,
      applicantRowId: null,
      matchedName: null,
      receivedAt: "2026-06-23T00:00:00.000Z"
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

describe("WhatsApp Bot Module", () => {
  test("shows apply and contact options to unregistered numbers", () => {
    expect(createWhatsAppBotResponse({ contact: null, actionId: null })).toEqual({
      kind: "interactive_buttons",
      body: "Welcome to MAG Events. How can we help you today?",
      buttons: [
        { id: "apply", title: "Apply" },
        { id: "contact_team", title: "Contact team" }
      ]
    });
  });

  test("shows profile and event details options to registered users who passed interviews", () => {
    expect(
      createWhatsAppBotResponse({
        actionId: null,
        contact: {
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
        }
      })
    ).toEqual({
      kind: "interactive_buttons",
      body: "Welcome back Sara Ahmed. What would you like to view?",
      buttons: [
        { id: "profile", title: "Profile" },
        { id: "event_details", title: "Event details" }
      ]
    });
  });

  test("returns form link, profile, and pending event details for selected actions", () => {
    const contact = {
      personId: "person-1",
      applicantRowId: "row-1",
      fullName: "Sara Ahmed",
      phone: "+966500000000",
      email: "sara@example.com",
      city: "Riyadh",
      gender: "female",
      age: 25,
      screeningStatus: "save_to_staff_pool" as const,
      interviewStatus: "passed" as const,
      contractStatus: "signed" as const,
      finalScore: 4.5
    };

    expect(createWhatsAppBotResponse({ contact: null, actionId: "apply" })).toMatchObject({
      kind: "text",
      body: expect.stringContaining("docs.google.com/forms")
    });
    expect(createWhatsAppBotResponse({ contact, actionId: "profile" })).toMatchObject({
      kind: "text",
      body: expect.stringContaining("Sara Ahmed")
    });
    expect(createWhatsAppBotResponse({ contact, actionId: "event_details" })).toEqual({
      kind: "text",
      body: "You will be informed here when you are assigned to an event."
    });
  });

  test("records inbound message and returns the menu-driven response", async () => {
    const applicants = applicantRepository();

    await expect(
      handleWhatsAppInbound(
        { applicants },
        {
          tenantId: "tenant-a",
          waMessageId: "wamid.demo",
          fromPhone: "+966500000000",
          body: "Hello",
          payload: { demo: true },
          actionId: null
        }
      )
    ).resolves.toMatchObject({
      inbound: { id: "message-1" },
      response: {
        kind: "interactive_buttons",
        buttons: [
          { id: "apply", title: "Apply" },
          { id: "contact_team", title: "Contact team" }
        ]
      }
    });
  });
});
