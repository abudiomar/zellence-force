import type {
  ApplicantImportRepository,
  BootstrapRepository,
  SessionRevoker,
  SettingsRepository,
  UserRepository,
  WhatsAppContactContext,
  WhatsAppInboundMessageSummary
} from "@zellforce/application";
import type {
  ApplicantImportMappedData,
  ApplicantReviewQueueItem,
  AuthenticatedUser,
  CreateInternalUserInput,
  DemoEvent,
  StaffPoolFilter,
  StaffPoolItem,
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
  raw_data: Record<string, unknown> | string | null;
  mapped_data: ApplicantImportMappedData | null;
  error_messages: string[] | null;
  matched_person_id: string | null;
  created_person_id: string | null;
  screening_status: ApplicantReviewQueueItem["screeningStatus"] | null;
  screening_notes: string | null;
  interview_status: ApplicantReviewQueueItem["interviewStatus"] | null;
  contract_sent: boolean | null;
  contract_status: ApplicantReviewQueueItem["contractStatus"] | null;
  presentation_score: string | number | null;
  communication_score: string | number | null;
  english_fluency_score: string | number | null;
  final_score: string | number | null;
  saved_to_staff_at: Date | string | null;
  saved_for_future_at: Date | string | null;
  created_at: Date | string;
};

type DemoEventRow = {
  id: string;
  name: string;
  city: string | null;
  event_date: Date | string | null;
  role_name: string;
  needed_headcount: string | number;
  shortlisted: string | number | null;
  confirmed: string | number | null;
};

type WhatsAppInboundMessageRow = {
  id: string;
  from_phone: string;
  body: string;
  intent: WhatsAppInboundMessageSummary["intent"];
  is_emergency: boolean;
  person_id: string | null;
  applicant_row_id: string | null;
  matched_name: string | null;
  received_at: Date | string;
};

const USER_COLUMNS =
  "id, auth_user_id, tenant_id, person_id, email, full_name, role, is_active";
const APPLICANT_QUEUE_COLUMNS = `
  id, source_row_id, status, raw_data, mapped_data, error_messages,
  matched_person_id, created_person_id, screening_status, screening_notes,
  interview_status, contract_sent, contract_status, presentation_score,
  communication_score, english_fluency_score, final_score, saved_to_staff_at,
  saved_for_future_at, created_at
`;

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
          on conflict (tenant_id, source_hash)
          do update set
            import_run_id = excluded.import_run_id,
            source_row_id = excluded.source_row_id,
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
          select ${APPLICANT_QUEUE_COLUMNS}
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
          select ${APPLICANT_QUEUE_COLUMNS}
          from applicant_import_rows
          where tenant_id = $1 and id = $2
        `,
        [tenantId, rowId]
      );
      return result.rows[0] ? mapApplicantQueueRow(result.rows[0]) : null;
    },

    async createPersonFromApplicant(input) {
      const current = await this.findImportRow(input.tenantId, input.rowId);
      if (!current?.fullName || !current.phone) {
        throw new Error("Applicant row cannot be promoted without name and phone");
      }
      if (current.createdPersonId) {
        return current.createdPersonId;
      }

      const result = await client.query(
        `
          insert into persons (
            tenant_id, person_type, full_name, phone, email, gender,
            birth_date, city, photo_url, cv_url, status
          )
          values ($1, 'temp', $2, $3, $4, $5, $6, $7, $8, $9, 'pool')
          returning id
        `,
        [
          input.tenantId,
          current.fullName,
          current.phone,
          current.email,
          normalizeGender(current.gender),
          parseDateValue(current.rawData?.dateOfBirth ?? current.rawData?.["Date of Birth"]),
          current.city,
          current.photoUrl,
          current.cvUrl
        ]
      );
      const personId = (result.rows[0] as { id: string }).id;
      await client.query(
        `
          update applicant_import_rows
          set created_person_id = $3,
              updated_at = now()
          where tenant_id = $1 and id = $2
        `,
        [input.tenantId, input.rowId, personId]
      );
      return personId;
    },

    async mergeApplicantIntoPerson(input) {
      const current = await this.findImportRow(input.tenantId, input.rowId);
      await client.query(
        `
          update persons
          set full_name = coalesce($4, full_name),
              phone = coalesce($5, phone),
              email = coalesce($6, email),
              gender = coalesce($7::gender, gender),
              city = coalesce($8, city),
              photo_url = coalesce($9, photo_url),
              cv_url = coalesce($10, cv_url),
              updated_at = now()
          where tenant_id = $1 and id = $3
        `,
        [
          input.tenantId,
          input.rowId,
          input.targetPersonId,
          current?.fullName ?? null,
          current?.phone ?? null,
          current?.email ?? null,
          normalizeGender(current?.gender),
          current?.city ?? null,
          current?.photoUrl ?? null,
          current?.cvUrl ?? null
        ]
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

    async updateScreening(input) {
      const result = await client.query(
        `
          update applicant_import_rows
          set screening_status = $4,
              screening_notes = $5,
              reviewed_by_user_id = $3,
              reviewed_at = now(),
              updated_at = now()
          where tenant_id = $1 and id = $2
          returning ${APPLICANT_QUEUE_COLUMNS}
        `,
        [
          input.tenantId,
          input.rowId,
          input.actorUserId,
          input.screeningStatus,
          input.notes ?? null
        ]
      );
      return mapRequiredApplicantQueueRow(result.rows[0]);
    },

    async updateInterviewPipeline(input) {
      const result = await client.query(
        `
          update applicant_import_rows
          set interview_status = $4,
              contract_sent = coalesce($5, contract_sent),
              contract_status = coalesce($6, contract_status),
              presentation_score = $7,
              communication_score = $8,
              english_fluency_score = $9,
              final_score = $10,
              reviewed_by_user_id = $3,
              reviewed_at = now(),
              updated_at = now()
          where tenant_id = $1 and id = $2
          returning ${APPLICANT_QUEUE_COLUMNS}
        `,
        [
          input.tenantId,
          input.rowId,
          input.actorUserId,
          input.interviewStatus,
          input.contractSent ?? null,
          input.contractStatus ?? null,
          input.presentationScore ?? null,
          input.communicationScore ?? null,
          input.englishFluencyScore ?? null,
          input.finalScore
        ]
      );
      return mapRequiredApplicantQueueRow(result.rows[0]);
    },

    async saveToStaffPool(input) {
      const current = await this.findImportRow(input.tenantId, input.rowId);
      if (!current) {
        throw new Error("Applicant row not found");
      }

      let personId = current.createdPersonId ?? current.matchedPersonId;
      if (!personId) {
        personId = await this.createPersonFromApplicant(input);
      }

      await client.query(
        `
          update persons
          set status = $3::person_status,
              updated_at = now()
          where tenant_id = $1 and id = $2
        `,
        [input.tenantId, personId, input.mode === "staff" ? "pool" : "maybe_roster"]
      );

      const result = await client.query(
        `
          update applicant_import_rows
          set status = case when $4 = 'staff' then 'accepted'::applicant_import_row_status else status end,
              created_person_id = coalesce(created_person_id, $3),
              screening_status = case
                when $4 = 'staff' then 'save_to_staff_pool'
                else 'save_for_future'
              end,
              saved_to_staff_at = case when $4 = 'staff' then now() else saved_to_staff_at end,
              saved_for_future_at = case when $4 = 'future' then now() else saved_for_future_at end,
              reviewed_by_user_id = $5,
              reviewed_at = now(),
              updated_at = now()
          where tenant_id = $1 and id = $2
          returning ${APPLICANT_QUEUE_COLUMNS}
        `,
        [input.tenantId, input.rowId, personId, input.mode, input.actorUserId]
      );
      return { personId, row: mapRequiredApplicantQueueRow(result.rows[0]) };
    },

    async listStaffPool(input) {
      const result = await client.query(
        `
          select ${APPLICANT_QUEUE_COLUMNS}
          from applicant_import_rows
          where tenant_id = $1
            and mapped_data is not null
            and (
              created_person_id is not null
              or saved_to_staff_at is not null
              or saved_for_future_at is not null
              or screening_status in ('save_to_staff_pool', 'save_for_future')
            )
          order by final_score desc nulls last, created_at desc
        `,
        [input.tenantId]
      );
      return result.rows
        .map(mapStaffPoolRow)
        .filter((item) => staffPoolItemMatchesFilter(item, input.filter));
    },

    async createDemoEvent(input) {
      const result = await client.query(
        `
          insert into demo_events (
            tenant_id, name, city, event_date, role_name,
            needed_headcount, created_by_user_id
          )
          values ($1, $2, $3, $4, $5, $6, $7)
          returning id, name, city, event_date, role_name, needed_headcount,
                    0::integer as shortlisted, 0::integer as confirmed
        `,
        [
          input.tenantId,
          input.event.name,
          input.event.city ?? null,
          input.event.eventDate ?? null,
          input.event.roleName,
          input.event.neededHeadcount,
          input.actorUserId
        ]
      );
      return mapDemoEvent(result.rows[0]);
    },

    async listDemoEvents(tenantId) {
      const result = await client.query(
        `
          select demo_events.id,
                 demo_events.name,
                 demo_events.city,
                 demo_events.event_date,
                 demo_events.role_name,
                 demo_events.needed_headcount,
                 count(demo_event_shortlist.*)
                   filter (where demo_event_shortlist.status = 'shortlisted')::integer as shortlisted,
                 count(demo_event_shortlist.*)
                   filter (where demo_event_shortlist.status = 'confirmed')::integer as confirmed
          from demo_events
          left join demo_event_shortlist
            on demo_event_shortlist.tenant_id = demo_events.tenant_id
           and demo_event_shortlist.demo_event_id = demo_events.id
          where demo_events.tenant_id = $1
          group by demo_events.id
          order by demo_events.event_date nulls last, demo_events.created_at desc
        `,
        [tenantId]
      );
      return result.rows.map(mapDemoEvent);
    },

    async addCandidateToDemoEvent(input) {
      await client.query(
        `
          insert into demo_event_shortlist (
            tenant_id, demo_event_id, person_id, applicant_row_id, added_by_user_id
          )
          values ($1, $2, $3, $4, $5)
          on conflict do nothing
        `,
        [
          input.tenantId,
          input.eventId,
          input.candidate.personId ?? null,
          input.candidate.applicantRowId ?? null,
          input.actorUserId
        ]
      );
      return loadDemoEvent(client, input.tenantId, input.eventId);
    },

    async listWhatsAppInbox(tenantId) {
      const result = await client.query(
        `
          select whatsapp_inbound_messages.id,
                 whatsapp_inbound_messages.from_phone,
                 whatsapp_inbound_messages.body,
                 whatsapp_inbound_messages.intent,
                 whatsapp_inbound_messages.is_emergency,
                 whatsapp_inbound_messages.person_id,
                 whatsapp_inbound_messages.applicant_row_id,
                 coalesce(persons.full_name, applicant_import_rows.mapped_data->>'fullName') as matched_name,
                 whatsapp_inbound_messages.received_at
          from whatsapp_inbound_messages
          left join persons
            on persons.tenant_id = whatsapp_inbound_messages.tenant_id
           and persons.id = whatsapp_inbound_messages.person_id
          left join applicant_import_rows
            on applicant_import_rows.tenant_id = whatsapp_inbound_messages.tenant_id
           and applicant_import_rows.id = whatsapp_inbound_messages.applicant_row_id
          where whatsapp_inbound_messages.tenant_id = $1
          order by whatsapp_inbound_messages.received_at desc
          limit 100
        `,
        [tenantId]
      );
      return result.rows.map(mapWhatsAppInboundMessage);
    },

    async recordWhatsAppInbound(input) {
      const result = await client.query(
        `
          with matched_person as (
            select id
            from persons
            where tenant_id = $1
              and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') =
                  regexp_replace($3, '[^0-9]', '', 'g')
            order by updated_at desc
            limit 1
          ),
          matched_row as (
            select id
            from applicant_import_rows
            where tenant_id = $1
              and regexp_replace(coalesce(mapped_data->>'phone', ''), '[^0-9]', '', 'g') =
                  regexp_replace($3, '[^0-9]', '', 'g')
            order by updated_at desc
            limit 1
          ),
          upsert as (
            insert into whatsapp_inbound_messages (
              tenant_id, wa_message_id, person_id, applicant_row_id,
              from_phone, body, intent, is_emergency, payload
            )
            values (
              $1, $2,
              (select id from matched_person),
              (select id from matched_row),
              $3, $4, $5, $6, $7
            )
            on conflict (wa_message_id) do update
              set payload = excluded.payload
            returning id, from_phone, body, intent, is_emergency,
                      person_id, applicant_row_id, received_at
          )
          select upsert.id,
                 upsert.from_phone,
                 upsert.body,
                 upsert.intent,
                 upsert.is_emergency,
                 upsert.person_id,
                 upsert.applicant_row_id,
                 coalesce(persons.full_name, applicant_import_rows.mapped_data->>'fullName') as matched_name,
                 upsert.received_at
          from upsert
          left join persons
            on persons.tenant_id = $1 and persons.id = upsert.person_id
          left join applicant_import_rows
            on applicant_import_rows.tenant_id = $1
           and applicant_import_rows.id = upsert.applicant_row_id
        `,
        [
          input.tenantId,
          input.waMessageId,
          input.fromPhone,
          input.body,
          input.intent,
          input.isEmergency,
          JSON.stringify(input.payload)
        ]
      );
      return mapWhatsAppInboundMessage(result.rows[0]);
    },

    async findWhatsAppContactContext(tenantId, phone) {
      const result = await client.query(
        `
          /* find_whatsapp_contact_context */
          select ${APPLICANT_QUEUE_COLUMNS}
          from applicant_import_rows
          where tenant_id = $1
            and regexp_replace(coalesce(mapped_data->>'phone', ''), '[^0-9]', '', 'g') =
                regexp_replace($2, '[^0-9]', '', 'g')
          order by (interview_status = 'passed') desc, updated_at desc
          limit 1
        `,
        [tenantId, phone]
      );
      if (!result.rows[0]) return null;
      return mapWhatsAppContactContext(result.rows[0]);
    },

    async findDefaultTenantId() {
      const result = await client.query(
        "select id from tenants order by created_at asc limit 1"
      );
      return (result.rows[0] as { id?: string } | undefined)?.id ?? null;
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

    async ensureTenant(input) {
      const result = await client.query(
        `
          insert into tenants (name, slug)
          values ($1, $2)
          on conflict (slug) do update
            set name = excluded.name
          returning id
        `,
        [input.name, input.slug]
      );
      return (result.rows[0] as { id: string }).id;
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

function mapRequiredApplicantQueueRow(value: unknown): ApplicantReviewQueueItem {
  if (!value) {
    throw new Error("Applicant row not found");
  }
  return mapApplicantQueueRow(value);
}

function mapApplicantQueueRow(value: unknown): ApplicantReviewQueueItem {
  const row = value as ApplicantImportRow;
  const mappedData = parseJsonObject<ApplicantImportMappedData>(row.mapped_data);
  const rawData = parseJsonObject<Record<string, unknown>>(row.raw_data) ?? {};
  return {
    id: row.id,
    sourceRowId: row.source_row_id,
    status: row.status,
    fullName: emptyToNull(mappedData?.fullName),
    phone: emptyToNull(mappedData?.phone),
    email: emptyToNull(mappedData?.email),
    city: emptyToNull(mappedData?.city),
    gender: emptyToNull(mappedData?.gender),
    nationality: emptyToNull(mappedData?.nationality),
    age: parseApplicantAge(mappedData),
    canTravel: parseBooleanish(mappedData?.canTravel),
    photoUrl: emptyToNull(mappedData?.photoUrl),
    cvUrl: emptyToNull(mappedData?.cvUrl),
    experience: emptyToNull(mappedData?.experience),
    englishLevel: emptyToNull(mappedData?.englishLevel),
    languages: emptyToNull(mappedData?.languages),
    submittedAt: emptyToNull(mappedData?.submittedAt),
    rawData,
    errorMessages: row.error_messages ?? [],
    matchedPersonId: row.matched_person_id,
    createdPersonId: row.created_person_id,
    screeningStatus: row.screening_status ?? "needs_review",
    screeningNotes: row.screening_notes,
    interviewStatus: row.interview_status ?? "not_scheduled",
    contractSent: row.contract_sent ?? false,
    contractStatus: row.contract_status ?? "not_sent",
    presentationScore: numberOrNull(row.presentation_score),
    communicationScore: numberOrNull(row.communication_score),
    englishFluencyScore: numberOrNull(row.english_fluency_score),
    finalScore: numberOrNull(row.final_score),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

function mapStaffPoolRow(value: unknown): StaffPoolItem {
  const row = value as ApplicantImportRow;
  const item = mapApplicantQueueRow(row);
  return {
    ...item,
    personId: item.createdPersonId ?? item.matchedPersonId,
    savedForFuture: Boolean(row.saved_for_future_at),
    savedToStaff: Boolean(row.saved_to_staff_at) || item.screeningStatus === "save_to_staff_pool"
  };
}

function mapDemoEvent(value: unknown): DemoEvent {
  if (!value) {
    throw new Error("Demo event not found");
  }
  const row = value as DemoEventRow;
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? undefined,
    eventDate: formatDateOnly(row.event_date),
    roleName: row.role_name,
    neededHeadcount: Number(row.needed_headcount),
    shortlisted: Number(row.shortlisted ?? 0),
    confirmed: Number(row.confirmed ?? 0)
  };
}

async function loadDemoEvent(
  client: DbClient,
  tenantId: string,
  eventId: string
): Promise<DemoEvent> {
  const result = await client.query(
    `
      select demo_events.id,
             demo_events.name,
             demo_events.city,
             demo_events.event_date,
             demo_events.role_name,
             demo_events.needed_headcount,
             count(demo_event_shortlist.*)
               filter (where demo_event_shortlist.status = 'shortlisted')::integer as shortlisted,
             count(demo_event_shortlist.*)
               filter (where demo_event_shortlist.status = 'confirmed')::integer as confirmed
      from demo_events
      left join demo_event_shortlist
        on demo_event_shortlist.tenant_id = demo_events.tenant_id
       and demo_event_shortlist.demo_event_id = demo_events.id
      where demo_events.tenant_id = $1 and demo_events.id = $2
      group by demo_events.id
    `,
    [tenantId, eventId]
  );
  return mapDemoEvent(result.rows[0]);
}

function mapWhatsAppInboundMessage(value: unknown): WhatsAppInboundMessageSummary {
  if (!value) {
    throw new Error("WhatsApp inbound message not found");
  }
  const row = value as WhatsAppInboundMessageRow;
  return {
    id: row.id,
    fromPhone: row.from_phone,
    body: row.body,
    intent: row.intent,
    isEmergency: row.is_emergency,
    personId: row.person_id,
    applicantRowId: row.applicant_row_id,
    matchedName: row.matched_name,
    receivedAt: row.received_at instanceof Date ? row.received_at.toISOString() : row.received_at
  };
}

function mapWhatsAppContactContext(value: unknown): WhatsAppContactContext {
  const item = mapApplicantQueueRow(value);
  return {
    personId: item.createdPersonId ?? item.matchedPersonId,
    applicantRowId: item.id,
    fullName: item.fullName,
    phone: item.phone ?? "",
    email: item.email,
    city: item.city,
    gender: item.gender ?? null,
    age: item.age ?? null,
    screeningStatus: item.screeningStatus,
    interviewStatus: item.interviewStatus,
    contractStatus: item.contractStatus,
    finalScore: item.finalScore ?? null
  };
}

function staffPoolItemMatchesFilter(item: StaffPoolItem, filter: StaffPoolFilter): boolean {
  const search = filter.search?.toLowerCase();
  if (
    search &&
    !`${item.fullName ?? ""} ${item.phone ?? ""}`.toLowerCase().includes(search)
  ) {
    return false;
  }
  if (filter.city && !equalsLoose(item.city, filter.city)) return false;
  if (filter.gender && !equalsLoose(item.gender, filter.gender)) return false;
  if (filter.nationality && !equalsLoose(item.nationality, filter.nationality)) return false;
  if (
    filter.language &&
    !(item.languages ?? "").toLowerCase().includes(filter.language.trim().toLowerCase())
  ) {
    return false;
  }
  if (filter.canTravel !== undefined && (item.canTravel ?? null) !== filter.canTravel) return false;
  if (filter.minAge !== undefined && (item.age === null || item.age === undefined || item.age < filter.minAge)) {
    return false;
  }
  if (filter.maxAge !== undefined && (item.age === null || item.age === undefined || item.age > filter.maxAge)) {
    return false;
  }
  if (filter.hasPhoto !== undefined && Boolean(item.photoUrl) !== filter.hasPhoto) return false;
  if (filter.hasCv !== undefined && Boolean(item.cvUrl) !== filter.hasCv) return false;
  if (filter.screeningStatus && item.screeningStatus !== filter.screeningStatus) return false;
  if (filter.interviewStatus && item.interviewStatus !== filter.interviewStatus) return false;
  if (filter.contractStatus && item.contractStatus !== filter.contractStatus) return false;
  if (!meetsMinimum(item.finalScore, filter.minFinalScore)) return false;
  if (!meetsMinimum(item.presentationScore, filter.minPresentation)) return false;
  if (!meetsMinimum(item.communicationScore, filter.minCommunication)) return false;
  if (!meetsMinimum(item.englishFluencyScore, filter.minEnglishFluency)) return false;
  return true;
}

function meetsMinimum(value: number | null | undefined, minimum: number | undefined): boolean {
  return minimum === undefined || (value !== null && value !== undefined && value >= minimum);
}

function equalsLoose(value: string | null | undefined, expected: string): boolean {
  return (value ?? "").trim().toLowerCase() === expected.trim().toLowerCase();
}

function parseJsonObject<T extends object>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed !== null ? parsed as T : null;
    } catch {
      return null;
    }
  }
  return typeof value === "object" ? value as T : null;
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

// Form yes/no answers arrive as free text in either language. Normalize the
// common affirmative/negative spellings to a boolean; anything unrecognized
// (or blank) stays null so it reads as "unknown" rather than a false "no".
const TRUTHY_ANSWERS = new Set(["yes", "y", "true", "1", "نعم", "اي", "ايوه", "أجل"]);
const FALSY_ANSWERS = new Set(["no", "n", "false", "0", "لا", "كلا"]);

function parseBooleanish(value: string | null | undefined): boolean | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (TRUTHY_ANSWERS.has(normalized)) return true;
  if (FALSY_ANSWERS.has(normalized)) return false;
  return null;
}

function parseApplicantAge(mappedData: ApplicantImportMappedData | null): number | null {
  const directAge = parseInteger(mappedData?.age);
  if (directAge !== null) return directAge;
  const birthDate = parseDateValue(mappedData?.dateOfBirth);
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < birth.getUTCDate())) {
    age -= 1;
  }
  return age >= 0 && age <= 100 ? age : null;
}

function parseInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function numberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeGender(value: string | null | undefined): "male" | "female" | "other" | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (["male", "m", "ذكر"].includes(normalized)) return "male";
  if (["female", "f", "انثى", "أنثى"].includes(normalized)) return "female";
  if (["other", "اخرى", "أخرى"].includes(normalized)) return "other";
  return null;
}

function parseDateValue(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function formatDateOnly(value: Date | string | null): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}
