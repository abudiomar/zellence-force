import { describe, expect, test, vi } from "vitest";
import type { AuthenticatedUser } from "@zellforce/contracts";
import {
  ApplicationError,
  decideApplicantImportRow,
  importApplicantRows,
  listApplicantReviewQueue,
  listApplicantSheetTabs,
  recordInterviewScore,
  scheduleInterview,
  type ApplicantImportRepository,
  type ApplicantSheetReader
} from "./index";

const hrActor: AuthenticatedUser = {
  id: "hr-user",
  authUserId: "auth-hr",
  tenantId: "tenant-a",
  personId: null,
  email: "hr@example.com",
  fullName: "HR",
  role: "hr",
  isActive: true
};

function queueItem() {
  return {
    id: "row-1",
    sourceRowId: "2",
    status: "pending_review" as const,
    fullName: "Sara Ahmed",
    phone: "+966500000000",
    email: "sara@example.com",
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

function applicantRepository(overrides: Partial<ApplicantImportRepository> = {}): ApplicantImportRepository {
  return {
    findExistingPersonByPhone: vi.fn(async () => null),
    createImportRun: vi.fn(async () => "run-1"),
    upsertImportRow: vi.fn(async (input) => ({ id: `row-${input.sourceRowId}`, ...input })),
    finishImportRun: vi.fn(async () => undefined),
    listReviewQueue: vi.fn(async () => []),
    findImportRow: vi.fn(async () => queueItem()),
    createPersonFromApplicant: vi.fn(async () => "person-1"),
    mergeApplicantIntoPerson: vi.fn(async () => "person-existing"),
    updateImportRowDecision: vi.fn(async () => undefined),
    updateScreening: vi.fn(async () => queueItem()),
    updateInterviewPipeline: vi.fn(async () => queueItem()),
    saveToStaffPool: vi.fn(async () => ({ personId: "person-1", row: queueItem() })),
    listStaffPool: vi.fn(async () => []),
    createDemoEvent: vi.fn(async () => ({
      id: "demo-event-1",
      name: "Demo Event",
      city: "Riyadh",
      eventDate: "2026-07-01",
      roleName: "Host",
      neededHeadcount: 5,
      shortlisted: 0,
      confirmed: 0
    })),
    listDemoEvents: vi.fn(async () => []),
    addCandidateToDemoEvent: vi.fn(async () => ({
      id: "demo-event-1",
      name: "Demo Event",
      city: "Riyadh",
      eventDate: "2026-07-01",
      roleName: "Host",
      neededHeadcount: 5,
      shortlisted: 1,
      confirmed: 0
    })),
    listWhatsAppInbox: vi.fn(async () => []),
    recordWhatsAppInbound: vi.fn(async () => ({
      id: "message-1",
      fromPhone: "+966500000000",
      body: "Status",
      intent: "current_status" as const,
      isEmergency: false,
      personId: "person-1",
      applicantRowId: "row-1",
      matchedName: "Sara Ahmed",
      receivedAt: "2026-06-12T00:00:00.000Z"
    })),
    findWhatsAppContactContext: vi.fn(async () => null),
    scheduleInterview: vi.fn(async () => "interview-1"),
    recordInterviewScore: vi.fn(async () => ({
      interviewId: "interview-1",
      overallScore: 4.5,
      belowMinimum: false
    })),
    writeAudit: vi.fn(async () => undefined),
    ...overrides
  };
}

describe("Applicant Intake Import Module and Actions", () => {
  test("imports valid rows, marks missing phone as error, and keeps source hash idempotency", async () => {
    const sheet: ApplicantSheetReader = {
      listTabs: vi.fn(async () => []),
      readRows: vi.fn(async () => [
        { rowId: "2", values: { "Full Name": "Sara Ahmed", Mobile: "+966500000000", City: "Riyadh" } },
        { rowId: "3", values: { "Full Name": "No Phone", Mobile: "", City: "Jeddah" } }
      ])
    };
    const applicants = applicantRepository({
      findExistingPersonByPhone: vi.fn(async (tenantId, phone) =>
        tenantId === "tenant-a" && phone === "+966500000000" ? "person-match" : null
      )
    });

    const result = await importApplicantRows(
      { applicants, sheet },
      hrActor,
      {
        sourceId: "sheet-123",
        sourceRange: "Form Responses 1!A:Z",
        mapping: { fullName: "Full Name", phone: "Mobile", city: "City" }
      }
    );

    expect(result).toEqual({
      importRunId: "run-1",
      rowsSeen: 2,
      rowsImported: 1,
      rowsFailed: 1,
      status: "partial"
    });
    expect(applicants.upsertImportRow).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: "tenant-a",
        sourceRowId: "2",
        status: "pending_review",
        matchedPersonId: "person-match"
      })
    );
    expect(applicants.upsertImportRow).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceRowId: "3",
        status: "error",
        errorMessages: ["phone is required"]
      })
    );
  });

  test("requires HR/Admin permission for import and review queue", async () => {
    const viewer = { ...hrActor, role: "viewer" as const };
    await expect(
      importApplicantRows(
        {
          applicants: applicantRepository(),
          sheet: {
            listTabs: vi.fn(async () => []),
            readRows: vi.fn(async () => [])
          }
        },
        viewer,
        {
          sourceId: "sheet",
          sourceRange: "A:Z",
          mapping: { fullName: "Name", phone: "Phone" }
        }
      )
    ).rejects.toThrow(ApplicationError);

    await expect(
      listApplicantReviewQueue({ applicants: applicantRepository() }, viewer, {})
    ).rejects.toThrow(ApplicationError);
  });

  test("lists applicant Sheet tabs for authorized HR users", async () => {
    const sheet: ApplicantSheetReader = {
      readRows: vi.fn(async () => []),
      listTabs: vi.fn(async () => [
        { id: "0", title: "Form Responses 1", index: 0 },
        { id: "123", title: "Interview", index: 1 }
      ])
    };

    await expect(
      listApplicantSheetTabs({ sheet }, hrActor, { sourceId: "sheet-123" })
    ).resolves.toEqual({
      tabs: [
        { id: "0", title: "Form Responses 1", index: 0 },
        { id: "123", title: "Interview", index: 1 }
      ]
    });
    expect(sheet.listTabs).toHaveBeenCalledWith({ sourceId: "sheet-123" });
  });

  test("accepts, merges, rejects, defers applicant rows and records audit", async () => {
    const applicants = applicantRepository();

    await expect(
      decideApplicantImportRow({ applicants }, hrActor, "row-1", {
        decision: "accept",
        notes: "Approved"
      })
    ).resolves.toEqual({ personId: "person-1", status: "accepted" });

    await expect(
      decideApplicantImportRow({ applicants }, hrActor, "row-1", {
        decision: "merge",
        targetPersonId: "person-existing",
        notes: "Same phone"
      })
    ).resolves.toEqual({ personId: "person-existing", status: "merged" });

    await expect(
      decideApplicantImportRow({ applicants }, hrActor, "row-1", {
        decision: "reject",
        notes: "Not eligible"
      })
    ).resolves.toEqual({ personId: null, status: "rejected" });

    await expect(
      decideApplicantImportRow({ applicants }, hrActor, "row-1", {
        decision: "defer",
        notes: "Later"
      })
    ).resolves.toEqual({ personId: null, status: "deferred" });

    expect(applicants.writeAudit).toHaveBeenCalled();
  });

  test("schedules interviews and records score warnings below event minimum", async () => {
    const applicants = applicantRepository({
      recordInterviewScore: vi.fn(async () => ({
        interviewId: "interview-1",
        overallScore: 2.5,
        belowMinimum: true
      }))
    });

    await expect(
      scheduleInterview({ applicants }, hrActor, {
        personId: "person-1",
        scheduledAt: "2026-06-13T10:00:00.000Z"
      })
    ).resolves.toEqual({ interviewId: "interview-1" });

    await expect(
      recordInterviewScore({ applicants }, hrActor, {
        interviewId: "interview-1",
        scores: [
          { criterion: "communication", score: 2 },
          { criterion: "presentation", score: 3 }
        ],
        minimumScore: 3
      })
    ).resolves.toEqual({
      interviewId: "interview-1",
      overallScore: 2.5,
      belowMinimum: true
    });
  });
});
