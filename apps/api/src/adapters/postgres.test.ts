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
    await expect(
      applicants.listReviewQueue({ tenantId: "tenant", status: "pending_review" })
    ).resolves.toEqual([
      {
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
      }
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
});
