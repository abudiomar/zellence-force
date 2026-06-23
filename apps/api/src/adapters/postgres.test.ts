import { describe, expect, test, vi } from "vitest";
import {
  createPgApplicantImportRepository,
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
      rows: sql.includes("insert into tenants")
        ? [{ id: "tenant-created" }]
        : sql.includes("select id from tenants")
          ? [{ id: "tenant" }]
          : sql.includes("count(*)")
            ? [{ count: 0 }]
            : [],
      rowCount: 1
    }));
    const bootstrap = createPgBootstrapRepository({ query });

    await expect(bootstrap.findTenantIdBySlug("mag-events")).resolves.toBe("tenant");
    await expect(
      bootstrap.ensureTenant({ name: "MAG Events", slug: "mag-events" })
    ).resolves.toBe("tenant-created");
    await expect(bootstrap.countUsers("tenant")).resolves.toBe(0);
    await bootstrap.ensureTenantSettings("tenant");

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("insert into tenant_settings"),
      ["tenant"]
    );
  });

  test("persists applicant import runs, rows, decisions, and interviews", async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes("insert into applicant_import_runs")) return { rows: [{ id: "run-1" }], rowCount: 1 };
      if (sql.includes("insert into applicant_import_rows")) return { rows: [{ id: "row-1" }], rowCount: 1 };
      if (sql.includes("from persons") && sql.includes("phone")) return { rows: [{ id: "person-match" }], rowCount: 1 };
      if (sql.includes("insert into persons")) return { rows: [{ id: "person-1" }], rowCount: 1 };
      if (sql.includes("from applicant_import_rows")) {
        return {
          rows: [
            {
              id: "row-1",
              source_row_id: "2",
              status: "pending_review",
              mapped_data: {
                fullName: "Sara Ahmed",
                phone: "+966500000000",
                city: "Riyadh"
              },
              error_messages: [],
              matched_person_id: "person-match",
              created_at: new Date("2026-06-12T00:00:00.000Z")
            }
          ],
          rowCount: 1
        };
      }
      if (sql.includes("insert into interviews")) return { rows: [{ id: "interview-1" }], rowCount: 1 };
      if (sql.includes("avg(score)")) return { rows: [{ overall_score: "4.50" }], rowCount: 1 };
      return { rows: [], rowCount: 1 };
    });
    const applicants = createPgApplicantImportRepository({ query });

    await expect(
      applicants.createImportRun({
        tenantId: "tenant",
        sourceId: "sheet",
        sourceRange: "A:Z",
        startedByUserId: "hr"
      })
    ).resolves.toBe("run-1");
    await expect(applicants.findExistingPersonByPhone("tenant", "+966500000000")).resolves.toBe("person-match");
    await expect(
      applicants.upsertImportRow({
        tenantId: "tenant",
        importRunId: "run-1",
        sourceId: "sheet",
        sourceRange: "A:Z",
        sourceRowId: "2",
        sourceHash: "hash",
        rawData: { Name: "Sara" },
        mappedData: { fullName: "Sara Ahmed", phone: "+966500000000" },
        status: "pending_review",
        errorMessages: [],
        matchedPersonId: "person-match"
      })
    ).resolves.toMatchObject({ id: "row-1" });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("on conflict (tenant_id, source_hash)"),
      expect.any(Array)
    );
    await expect(
      applicants.listReviewQueue({ tenantId: "tenant", status: "pending_review" })
    ).resolves.toEqual([
      expect.objectContaining({
        id: "row-1",
        sourceRowId: "2",
        status: "pending_review",
        fullName: "Sara Ahmed",
        phone: "+966500000000",
        email: null,
        city: "Riyadh",
        errorMessages: [],
        matchedPersonId: "person-match",
        createdAt: "2026-06-12T00:00:00.000Z"
      })
    ]);
    await expect(
      applicants.createPersonFromApplicant({
        tenantId: "tenant",
        actorUserId: "hr",
        rowId: "row-1"
      })
    ).resolves.toBe("person-1");
    await expect(
      applicants.scheduleInterview({
        tenantId: "tenant",
        actorUserId: "hr",
        personId: "person-1",
        scheduledAt: "2026-06-13T10:00:00.000Z"
      })
    ).resolves.toBe("interview-1");
    await expect(
      applicants.recordInterviewScore({
        tenantId: "tenant",
        actorUserId: "hr",
        interviewId: "interview-1",
        scores: [{ criterion: "communication", score: 4.5 }],
        minimumScore: 4
      })
    ).resolves.toEqual({
      interviewId: "interview-1",
      overallScore: 4.5,
      belowMinimum: false
    });
  });

  test("persists proposal demo screening, staff pool, event shortlist, and WhatsApp inbox", async () => {
    const applicantRow = {
      id: "row-1",
      source_row_id: "2",
      status: "accepted",
      raw_data: {
        "Full Name": "Sara Ahmed",
        Mobile: "+966500000000",
        City: "Riyadh",
        Photo: "https://example.com/photo.jpg",
        CV: "https://example.com/cv.pdf"
      },
      mapped_data: {
        fullName: "Sara Ahmed",
        phone: "+966500000000",
        city: "Riyadh",
        gender: "female",
        age: "24",
        photoUrl: "https://example.com/photo.jpg",
        cvUrl: "https://example.com/cv.pdf"
      },
      error_messages: [],
      matched_person_id: null,
      created_person_id: "person-1",
      screening_status: "save_to_staff_pool",
      screening_notes: "Strong profile",
      interview_status: "passed",
      contract_sent: true,
      contract_status: "signed",
      presentation_score: "4.0",
      communication_score: "5.0",
      english_fluency_score: "4.0",
      final_score: "4.33",
      saved_to_staff_at: new Date("2026-06-12T00:00:00.000Z"),
      saved_for_future_at: null,
      created_at: new Date("2026-06-12T00:00:00.000Z")
    };
    const demoEvent = {
      id: "demo-event-1",
      name: "Riyadh Launch",
      city: "Riyadh",
      event_date: "2026-07-01",
      role_name: "Host",
      needed_headcount: 6,
      shortlisted: 1,
      confirmed: 0
    };
    const inboundMessage = {
      id: "message-1",
      from_phone: "+966500000000",
      body: "Emergency, I cannot attend",
      intent: "emergency",
      is_emergency: true,
      person_id: "person-1",
      applicant_row_id: "row-1",
      matched_name: "Sara Ahmed",
      received_at: new Date("2026-06-12T00:00:00.000Z")
    };
    const query = vi.fn(async (sql: string) => {
      if (sql.includes("update applicant_import_rows") && sql.includes("screening_status")) {
        return { rows: [applicantRow], rowCount: 1 };
      }
      if (sql.includes("update applicant_import_rows") && sql.includes("interview_status")) {
        return { rows: [applicantRow], rowCount: 1 };
      }
      if (sql.includes("insert into persons")) return { rows: [{ id: "person-1" }], rowCount: 1 };
      if (sql.includes("saved_to_staff_at")) return { rows: [applicantRow], rowCount: 1 };
      if (sql.includes("from applicant_import_rows") && sql.includes("saved_to_staff_at")) {
        return { rows: [applicantRow], rowCount: 1 };
      }
      if (sql.includes("insert into demo_events")) return { rows: [demoEvent], rowCount: 1 };
      if (sql.includes("insert into demo_event_shortlist")) return { rows: [], rowCount: 1 };
      if (sql.includes("from demo_events")) return { rows: [demoEvent], rowCount: 1 };
      if (sql.includes("insert into whatsapp_inbound_messages")) {
        return { rows: [inboundMessage], rowCount: 1 };
      }
      if (sql.includes("from whatsapp_inbound_messages")) {
        return { rows: [inboundMessage], rowCount: 1 };
      }
      if (sql.includes("find_whatsapp_contact_context")) {
        return { rows: [applicantRow], rowCount: 1 };
      }
      return { rows: [], rowCount: 1 };
    });
    const applicants = createPgApplicantImportRepository({ query });

    await expect(
      applicants.updateScreening({
        tenantId: "tenant",
        actorUserId: "hr",
        rowId: "row-1",
        screeningStatus: "save_to_staff_pool",
        notes: "Strong profile"
      })
    ).resolves.toMatchObject({ screeningStatus: "save_to_staff_pool" });

    await expect(
      applicants.updateInterviewPipeline({
        tenantId: "tenant",
        actorUserId: "hr",
        rowId: "row-1",
        interviewStatus: "passed",
        contractSent: true,
        contractStatus: "signed",
        presentationScore: 4,
        communicationScore: 5,
        englishFluencyScore: 4,
        finalScore: 4.33
      })
    ).resolves.toMatchObject({ finalScore: 4.33, contractStatus: "signed" });

    await expect(
      applicants.saveToStaffPool({
        tenantId: "tenant",
        actorUserId: "hr",
        rowId: "row-1",
        mode: "staff"
      })
    ).resolves.toMatchObject({ personId: "person-1" });

    await expect(
      applicants.listStaffPool({
        tenantId: "tenant",
        filter: { city: "Riyadh", minFinalScore: 4, hasCv: true }
      })
    ).resolves.toEqual([
      expect.objectContaining({
        personId: "person-1",
        fullName: "Sara Ahmed",
        savedToStaff: true,
        finalScore: 4.33
      })
    ]);

    await expect(
      applicants.createDemoEvent({
        tenantId: "tenant",
        actorUserId: "hr",
        event: {
          name: "Riyadh Launch",
          city: "Riyadh",
          eventDate: "2026-07-01",
          roleName: "Host",
          neededHeadcount: 6
        }
      })
    ).resolves.toMatchObject({ shortlisted: 1, neededHeadcount: 6 });

    await expect(
      applicants.addCandidateToDemoEvent({
        tenantId: "tenant",
        actorUserId: "hr",
        eventId: "demo-event-1",
        candidate: { applicantRowId: "row-1", personId: "person-1" }
      })
    ).resolves.toMatchObject({ id: "demo-event-1", shortlisted: 1 });

    await expect(
      applicants.recordWhatsAppInbound({
        tenantId: "tenant",
        waMessageId: "wamid.demo",
        fromPhone: "+966500000000",
        body: "Emergency, I cannot attend",
        payload: { demo: true },
        intent: "emergency",
        isEmergency: true
      })
    ).resolves.toMatchObject({ intent: "emergency", matchedName: "Sara Ahmed" });

    await expect(applicants.listWhatsAppInbox("tenant")).resolves.toEqual([
      expect.objectContaining({ isEmergency: true, matchedName: "Sara Ahmed" })
    ]);
    await expect(
      applicants.findWhatsAppContactContext("tenant", "+966500000000")
    ).resolves.toMatchObject({
      applicantRowId: "row-1",
      fullName: "Sara Ahmed",
      interviewStatus: "passed",
      contractStatus: "signed",
      finalScore: 4.33
    });
  });
});
