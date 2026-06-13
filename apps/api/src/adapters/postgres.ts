import type {
  ApplicantImportRepository,
  BootstrapRepository,
  SessionRevoker,
  SettingsRepository,
  UserRepository
} from "@zellforce/application";
import type {
  ApplicantImportMappedData,
  ApplicantReviewQueueItem,
  AuthenticatedUser,
  CreateInternalUserInput,
  TenantSettings
} from "@zellforce/contracts";
import type { DbClient } from "@zellforce/db";

type UserRow = {
  id: string;
  auth_user_id: string;
  tenant_id: string;
  person_id: string | null;
  email: string;
  full_name: string;
  role: AuthenticatedUser["role"];
  is_active: boolean;
};

type SettingsRow = {
  default_language: TenantSettings["defaultLanguage"];
  supported_languages: TenantSettings["supportedLanguages"];
  timezone: string;
  currency: string;
  hijri_enabled: boolean;
};

type ApplicantImportRow = {
  id: string;
  source_row_id: string;
  status: ApplicantReviewQueueItem["status"];
  mapped_data: ApplicantImportMappedData | null;
  error_messages: string[] | null;
  matched_person_id: string | null;
  created_at: Date | string;
};

const USER_COLUMNS =
  "id, auth_user_id, tenant_id, person_id, email, full_name, role, is_active";

export function createPgUserRepository(client: DbClient): UserRepository {
  return {
    async findByAuthUserId(authUserId) {
      const result = await client.query(
        `select ${USER_COLUMNS} from users where auth_user_id = $1`,
        [authUserId]
      );
      return mapOptionalUser(result.rows[0]);
    },

    async findById(tenantId, userId) {
      const result = await client.query(
        `select ${USER_COLUMNS} from users where tenant_id = $1 and id = $2`,
        [tenantId, userId]
      );
      return mapOptionalUser(result.rows[0]);
    },

    async listByTenant(tenantId) {
      const result = await client.query(
        `select ${USER_COLUMNS} from users where tenant_id = $1 order by full_name`,
        [tenantId]
      );
      return result.rows.map(mapUser);
    },

    async create(
      tenantId: string,
      input: Omit<CreateInternalUserInput, "password">,
      authUserId: string
    ) {
      const result = await client.query(
        `
          insert into users (
            tenant_id, person_id, auth_user_id, email, full_name, role, is_active
          )
          values ($1, $2, $3, $4, $5, $6, $7)
          returning ${USER_COLUMNS}
        `,
        [
          tenantId,
          input.personId,
          authUserId,
          input.email,
          input.fullName,
          input.role,
          input.isActive
        ]
      );
      return mapUser(result.rows[0]);
    },

    async setActive(tenantId, userId, isActive) {
      const result = await client.query(
        `
          update users set is_active = $3
          where tenant_id = $1 and id = $2
          returning ${USER_COLUMNS}
        `,
        [tenantId, userId, isActive]
      );
      return mapRequiredUser(result.rows[0]);
    },

    async linkPerson(tenantId, userId, personId) {
      const result = await client.query(
        `
          update users set person_id = $3
          where tenant_id = $1 and id = $2
          returning ${USER_COLUMNS}
        `,
        [tenantId, userId, personId]
      );
      return mapRequiredUser(result.rows[0]);
    },

    async personBelongsToTenant(tenantId, personId) {
      const result = await client.query(
        "select 1 from persons where tenant_id = $1 and id = $2",
        [tenantId, personId]
      );
      return result.rowCount === 1;
    },

    async countActiveOwners(tenantId) {
      const result = await client.query(
        `
          select count(*)::integer as count
          from users
          where tenant_id = $1 and role = 'owner' and is_active = true
        `,
        [tenantId]
      );
      return Number((result.rows[0] as { count?: number } | undefined)?.count ?? 0);
    },

    async writeAudit(input) {
      await client.query(
        `
          insert into audit_logs (
            tenant_id, actor_user_id, action, entity_type, entity_id,
            before_data, after_data
          )
          values ($1, $2, $3, 'user', $4, $5, $6)
        `,
        [
          input.tenantId,
          input.actorUserId,
          input.action,
          input.entityId,
          JSON.stringify(input.before),
          JSON.stringify(input.after)
        ]
      );
    }
  };
}

export function createPgSettingsRepository(client: DbClient): SettingsRepository {
  return {
    async get(tenantId) {
      const result = await client.query(
        `
          select default_language, supported_languages, timezone, currency, hijri_enabled
          from tenant_settings
          where tenant_id = $1
        `,
        [tenantId]
      );
      return mapSettings(result.rows[0]);
    },

    async update(tenantId, settings) {
      const result = await client.query(
        `
          update tenant_settings
          set default_language = $2,
              supported_languages = $3,
              timezone = $4,
              currency = $5,
              hijri_enabled = $6
          where tenant_id = $1
          returning default_language, supported_languages, timezone, currency, hijri_enabled
        `,
        [
          tenantId,
          settings.defaultLanguage,
          settings.supportedLanguages,
          settings.timezone,
          settings.currency,
          settings.hijriEnabled
        ]
      );
      return mapSettings(result.rows[0]);
    },

    async writeAudit(input) {
      await client.query(
        `
          insert into audit_logs (
            tenant_id, actor_user_id, action, entity_type, entity_id,
            before_data, after_data
          )
          values ($1, $2, 'tenant.settings.updated', 'tenant', $1, $3, $4)
        `,
        [
          input.tenantId,
          input.actorUserId,
          JSON.stringify(input.before),
          JSON.stringify(input.after)
        ]
      );
    }
  };
}

export function createPgApplicantImportRepository(client: DbClient): ApplicantImportRepository {
  return {
    async createImportRun(input) {
      const result = await client.query(
        `
          insert into applicant_import_runs (
            tenant_id, source_type, source_id, source_range, started_by_user_id
          )
          values ($1, 'google_sheets', $2, $3, $4)
          returning id
        `,
        [input.tenantId, input.sourceId, input.sourceRange, input.startedByUserId]
      );
      return (result.rows[0] as { id: string }).id;
    },

    async upsertImportRow(input) {
      const result = await client.query(
        `
          insert into applicant_import_rows (
            tenant_id, import_run_id, source_row_id, source_hash, raw_data,
            mapped_data, status, error_messages, matched_person_id
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          on conflict (tenant_id, import_run_id, source_row_id)
          do update set
            source_hash = excluded.source_hash,
            raw_data = excluded.raw_data,
            mapped_data = excluded.mapped_data,
            status = excluded.status,
            error_messages = excluded.error_messages,
            matched_person_id = excluded.matched_person_id,
            updated_at = now()
          returning id
        `,
        [
          input.tenantId,
          input.importRunId,
          input.sourceRowId,
          input.sourceHash,
          JSON.stringify(input.rawData),
          input.mappedData ? JSON.stringify(input.mappedData) : null,
          input.status,
          JSON.stringify(input.errorMessages),
          input.matchedPersonId
        ]
      );
      return { id: (result.rows[0] as { id: string }).id, ...input };
    },

    async finishImportRun(input) {
      await client.query(
        `
          update applicant_import_runs
          set finished_at = now(),
              rows_seen = $3,
              rows_imported = $4,
              rows_failed = $5,
              status = $6,
              error_summary = $7
          where tenant_id = $1 and id = $2
        `,
        [
          input.tenantId,
          input.importRunId,
          input.rowsSeen,
          input.rowsImported,
          input.rowsFailed,
          input.status,
          input.errorSummary ?? null
        ]
      );
    },

    async findExistingPersonByPhone(tenantId, phone) {
      const result = await client.query(
        "select id from persons where tenant_id = $1 and phone = $2 limit 1",
        [tenantId, phone]
      );
      return (result.rows[0] as { id?: string } | undefined)?.id ?? null;
    },

    async listReviewQueue(input) {
      const params: unknown[] = [input.tenantId];
      const statusFilter = input.status ? "and status = $2" : "";
      if (input.status) params.push(input.status);
      const result = await client.query(
        `
          select id, source_row_id, status, mapped_data, error_messages,
                 matched_person_id, created_at
          from applicant_import_rows
          where tenant_id = $1 ${statusFilter}
          order by created_at desc
        `,
        params
      );
      return result.rows.map(mapApplicantQueueRow);
    },

    async findImportRow(tenantId, rowId) {
      const result = await client.query(
        `
          select id, source_row_id, status, mapped_data, error_messages,
                 matched_person_id, created_at
          from applicant_import_rows
          where tenant_id = $1 and id = $2
        `,
        [tenantId, rowId]
      );
      return result.rows[0] ? mapApplicantQueueRow(result.rows[0]) : null;
    },

    async createPersonFromApplicant(input) {
      const result = await client.query(
        `
          insert into persons (tenant_id, full_name, phone, city)
          select tenant_id,
                 mapped_data->>'fullName',
                 mapped_data->>'phone',
                 mapped_data->>'city'
          from applicant_import_rows
          where tenant_id = $1 and id = $2
          returning id
        `,
        [input.tenantId, input.rowId]
      );
      return (result.rows[0] as { id: string }).id;
    },

    async mergeApplicantIntoPerson(input) {
      await client.query(
        `
          update persons
          set full_name = coalesce(applicant_import_rows.mapped_data->>'fullName', persons.full_name),
              phone = coalesce(applicant_import_rows.mapped_data->>'phone', persons.phone),
              city = coalesce(applicant_import_rows.mapped_data->>'city', persons.city)
          from applicant_import_rows
          where persons.tenant_id = $1
            and persons.id = $3
            and applicant_import_rows.tenant_id = $1
            and applicant_import_rows.id = $2
        `,
        [input.tenantId, input.rowId, input.targetPersonId]
      );
      return input.targetPersonId;
    },

    async updateImportRowDecision(input) {
      await client.query(
        `
          update applicant_import_rows
          set status = $4,
              created_person_id = case when $4 = 'accepted' then $5 else created_person_id end,
              matched_person_id = case when $4 = 'merged' then $5 else matched_person_id end,
              reviewed_by_user_id = $3,
              reviewed_at = now(),
              decision_notes = $6,
              updated_at = now()
          where tenant_id = $1 and id = $2
        `,
        [
          input.tenantId,
          input.rowId,
          input.actorUserId,
          input.status,
          input.personId,
          input.notes ?? null
        ]
      );
    },

    async scheduleInterview(input) {
      const result = await client.query(
        `
          insert into interviews (
            tenant_id, person_id, event_id, interviewer_user_id, scheduled_at, notes
          )
          values ($1, $2, $3, $4, $5, $6)
          returning id
        `,
        [
          input.tenantId,
          input.personId,
          input.eventId ?? null,
          input.interviewerUserId ?? input.actorUserId,
          input.scheduledAt,
          input.notes ?? null
        ]
      );
      return (result.rows[0] as { id: string }).id;
    },

    async recordInterviewScore(input) {
      await client.query("delete from interview_scores where tenant_id = $1 and interview_id = $2", [
        input.tenantId,
        input.interviewId
      ]);
      for (const score of input.scores) {
        await client.query(
          `
            insert into interview_scores (tenant_id, interview_id, criterion, score)
            values ($1, $2, $3, $4)
          `,
          [input.tenantId, input.interviewId, score.criterion, score.score]
        );
      }
      const result = await client.query(
        `
          update interviews
          set status = 'completed',
              overall_score = (
                select avg(score) from interview_scores
                where tenant_id = $1 and interview_id = $2
              ),
              notes = coalesce($3, notes),
              updated_at = now()
          where tenant_id = $1 and id = $2
          returning overall_score
        `,
        [input.tenantId, input.interviewId, input.notes ?? null]
      );
      const overallScore = Number((result.rows[0] as { overall_score: string | number }).overall_score);
      return {
        interviewId: input.interviewId,
        overallScore,
        belowMinimum: input.minimumScore !== undefined ? overallScore < input.minimumScore : false
      };
    },

    async writeAudit(input) {
      await client.query(
        `
          insert into audit_logs (
            tenant_id, actor_user_id, action, entity_type, entity_id,
            before_data, after_data
          )
          values ($1, $2, $3, 'applicant_import_row', $4, $5, $6)
        `,
        [
          input.tenantId,
          input.actorUserId,
          input.action,
          input.entityId,
          JSON.stringify(input.before),
          JSON.stringify(input.after)
        ]
      );
    }
  };
}

export function createSessionRevoker(client: DbClient): SessionRevoker {
  return {
    async revokeAllForIdentity(authUserId) {
      await client.query('delete from session where "userId" = $1', [authUserId]);
    }
  };
}

export function createPgBootstrapRepository(client: DbClient): BootstrapRepository {
  return {
    async findTenantIdBySlug(slug) {
      const result = await client.query(
        "select id from tenants where slug = $1",
        [slug]
      );
      return (result.rows[0] as { id?: string } | undefined)?.id ?? null;
    },

    async countUsers(tenantId) {
      const result = await client.query(
        "select count(*)::integer as count from users where tenant_id = $1",
        [tenantId]
      );
      return Number((result.rows[0] as { count?: number } | undefined)?.count ?? 0);
    },

    async ensureTenantSettings(tenantId) {
      await client.query(
        `
          insert into tenant_settings (tenant_id)
          values ($1)
          on conflict (tenant_id) do nothing
        `,
        [tenantId]
      );
    }
  };
}

function mapOptionalUser(row: unknown): AuthenticatedUser | null {
  return row ? mapUser(row) : null;
}

function mapRequiredUser(row: unknown): AuthenticatedUser {
  if (!row) {
    throw new Error("User not found");
  }
  return mapUser(row);
}

function mapUser(value: unknown): AuthenticatedUser {
  const row = value as UserRow;
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    tenantId: row.tenant_id,
    personId: row.person_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    isActive: row.is_active
  };
}

function mapSettings(value: unknown): TenantSettings {
  if (!value) {
    throw new Error("Tenant settings not found");
  }
  const row = value as SettingsRow;
  return {
    defaultLanguage: row.default_language,
    supportedLanguages: row.supported_languages,
    timezone: row.timezone,
    currency: row.currency,
    hijriEnabled: row.hijri_enabled
  };
}

function mapApplicantQueueRow(value: unknown): ApplicantReviewQueueItem {
  const row = value as ApplicantImportRow;
  return {
    id: row.id,
    sourceRowId: row.source_row_id,
    status: row.status,
    fullName: row.mapped_data?.fullName ?? null,
    phone: row.mapped_data?.phone ?? null,
    email: row.mapped_data?.email ?? null,
    city: row.mapped_data?.city ?? null,
    errorMessages: row.error_messages ?? [],
    matchedPersonId: row.matched_person_id,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}
