import { pathToFileURL } from "node:url";
import { bootstrapOwner } from "@zellforce/application";
import { createPgPool, runMigrations, type DbClient } from "@zellforce/db";
import type { RuntimeEnvInput } from "@zellforce/config";
import { createIdentityProvisioner } from "./auth/auth";
import { createIdentityAdmin } from "./auth/identity-admin";
import {
  createPgBootstrapRepository,
  createPgUserRepository
} from "./adapters/postgres";
import { loadApiEnv } from "./config/runtime-env";

type SeedLocalArgs = {
  tenantSlug: string;
  tenantName: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPassword: string;
};

const defaults: SeedLocalArgs = {
  tenantSlug: "mag-events",
  tenantName: "MAG Events",
  ownerFullName: "Owner User",
  ownerEmail: "owner@example.com",
  ownerPassword: "Password123!"
};

export function parseSeedLocalArgs(args: string[]): SeedLocalArgs {
  const values = new Map(
    args.map((arg) => {
      const separator = arg.indexOf("=");
      return separator === -1
        ? [arg, ""]
        : [arg.slice(0, separator), arg.slice(separator + 1)];
    })
  );

  return {
    tenantSlug: values.get("--tenant-slug")?.trim() || defaults.tenantSlug,
    tenantName: values.get("--tenant-name")?.trim() || defaults.tenantName,
    ownerFullName: values.get("--owner-full-name")?.trim() || defaults.ownerFullName,
    ownerEmail: values.get("--owner-email")?.trim() || defaults.ownerEmail,
    ownerPassword: values.get("--owner-password") || defaults.ownerPassword
  };
}

function withLocalDefaults(input: NodeJS.ProcessEnv): RuntimeEnvInput {
  return {
    ...input,
    NODE_ENV: input.NODE_ENV ?? "development",
    APP_ENV: input.APP_ENV ?? "local",
    APP_URL: input.APP_URL ?? "http://localhost:3000",
    API_URL: input.API_URL ?? "http://localhost:4000",
    API_PORT: input.API_PORT ?? "4000",
    DATABASE_URL:
      input.DATABASE_URL ??
      "postgres://zellforce:zellforce_test@localhost:54329/zellforce_test",
    BETTER_AUTH_SECRET:
      input.BETTER_AUTH_SECRET ??
      "local_dev_secret_32_chars_minimum_123",
    BETTER_AUTH_URL: input.BETTER_AUTH_URL ?? "http://localhost:4000",
    TOKEN_SIGNING_SECRET:
      input.TOKEN_SIGNING_SECRET ??
      "local_token_secret_32_chars_minimum_123",
    DB_SSL_MODE: input.DB_SSL_MODE ?? "disable"
  };
}

async function ensureSeedPerson(
  client: DbClient,
  input: {
    tenantId: string;
    fullName: string;
    phone: string;
    email: string;
    gender: "male" | "female" | "other";
    birthDate: string;
    city: string;
    photoUrl: string;
    cvUrl: string;
    status: "pool" | "maybe_roster" | "active" | "inactive" | "blacklisted";
  }
): Promise<string> {
  const result = await client.query(
    `
      with existing as (
        select id from persons
        where tenant_id = $1 and phone = $3
        limit 1
      ),
      inserted as (
        insert into persons (
          tenant_id, person_type, full_name, phone, email, gender,
          birth_date, city, photo_url, cv_url, status
        )
        select $1, 'temp', $2, $3, $4, $5::gender, $6, $7, $8, $9, $10::person_status
        where not exists (select 1 from existing)
        returning id
      ),
      updated as (
        update persons
        set full_name = $2,
            email = $4,
            gender = $5::gender,
            birth_date = $6,
            city = $7,
            photo_url = $8,
            cv_url = $9,
            status = $10::person_status,
            updated_at = now()
        where tenant_id = $1 and phone = $3
        returning id
      )
      select id from inserted
      union all
      select id from updated
      union all
      select id from existing
      limit 1
    `,
    [
      input.tenantId,
      input.fullName,
      input.phone,
      input.email,
      input.gender,
      input.birthDate,
      input.city,
      input.photoUrl,
      input.cvUrl,
      input.status
    ]
  );
  return (result.rows[0] as { id: string }).id;
}

async function main() {
  const input = parseSeedLocalArgs(process.argv.slice(2));
  const env = loadApiEnv(withLocalDefaults(process.env));
  const pool = createPgPool({
    connectionString: env.DATABASE_URL,
    ssl: env.DB_SSL_MODE === "require" ? { rejectUnauthorized: true } : undefined
  });

  try {
    const migrations = await runMigrations(pool);
    const tenant = await pool.query(
      `
        insert into tenants (name, slug)
        values ($1, $2)
        on conflict (slug) do update set name = excluded.name
        returning id
      `,
      [input.tenantName, input.tenantSlug]
    );
    const tenantId = (tenant.rows[0] as { id: string }).id;
    await createPgBootstrapRepository(pool).ensureTenantSettings(tenantId);
    const saraPerson = await ensureSeedPerson(pool, {
      tenantId,
      fullName: "Sara Ahmed",
      phone: "+966500000000",
      email: "sara@example.com",
      gender: "female",
      birthDate: "2001-04-16",
      city: "Riyadh",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
      cvUrl: "https://example.com/demo/sara-ahmed-cv.pdf",
      status: "pool"
    });
    const omarPerson = await ensureSeedPerson(pool, {
      tenantId,
      fullName: "Omar Khalid",
      phone: "+966511111111",
      email: "omar@example.com",
      gender: "male",
      birthDate: "1999-09-03",
      city: "Riyadh",
      photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
      cvUrl: "https://example.com/demo/omar-khalid-cv.pdf",
      status: "pool"
    });
    const importRun = await pool.query(
      `
        insert into applicant_import_runs (
          tenant_id, source_type, source_id, source_range, status,
          rows_seen, rows_imported, rows_failed, metadata
        )
        values (
          $1, 'google_sheets', 'local-demo', 'Form Responses 1!A:Z',
          'partial', 5, 4, 1, '{"seed":"local","demo":"candidate-management"}'::jsonb
        )
        returning id
      `,
      [tenantId]
    );
    const importRunId = (importRun.rows[0] as { id: string }).id;
    await pool.query(
      `
        insert into applicant_import_rows (
          tenant_id, import_run_id, source_row_id, source_hash,
          raw_data, mapped_data, status, error_messages, created_person_id,
          screening_status, screening_notes, interview_status, contract_sent,
          contract_status, presentation_score, communication_score,
          english_fluency_score, final_score, saved_to_staff_at, saved_for_future_at
        )
        values
          (
            $1, $2, '2', 'local-demo-sara-ahmed-v2',
            '{"Full Name":"Sara Ahmed","Mobile":"+966500000000","Email":"sara@example.com","City":"Riyadh","Gender":"female","Age":"25","Photo":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80","CV":"https://example.com/demo/sara-ahmed-cv.pdf","Experience":"Luxury retail event hostess"}'::jsonb,
            '{"fullName":"Sara Ahmed","phone":"+966500000000","email":"sara@example.com","city":"Riyadh","gender":"female","age":"25","photoUrl":"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80","cvUrl":"https://example.com/demo/sara-ahmed-cv.pdf","experience":"Luxury retail event hostess"}'::jsonb,
            'accepted', '[]'::jsonb, $3,
            'save_to_staff_pool', 'Confident presentation and complete profile',
            'passed', true, 'signed', 4.5, 4.7, 4.2, 4.47, now(), null
          ),
          (
            $1, $2, '3', 'local-demo-omar-khalid-v2',
            '{"Full Name":"Omar Khalid","Mobile":"+966511111111","Email":"omar@example.com","City":"Riyadh","Gender":"male","Age":"27","Photo":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80","CV":"https://example.com/demo/omar-khalid-cv.pdf","Experience":"Usher and crowd flow lead"}'::jsonb,
            '{"fullName":"Omar Khalid","phone":"+966511111111","email":"omar@example.com","city":"Riyadh","gender":"male","age":"27","photoUrl":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80","cvUrl":"https://example.com/demo/omar-khalid-cv.pdf","experience":"Usher and crowd flow lead"}'::jsonb,
            'pending_review', '[]'::jsonb, $4,
            'shortlist_for_interview', 'Good location fit and event background',
            'scheduled', false, 'not_sent', null, null, null, null, null, null
          ),
          (
            $1, $2, '4', 'local-demo-lina-mansour-v2',
            '{"Full Name":"Lina Mansour","Mobile":"+966522222222","Email":"lina@example.com","City":"Jeddah","Gender":"female","Age":"32","Photo":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80","CV":"https://example.com/demo/lina-mansour-cv.pdf","Experience":"Senior brand ambassador and trainer"}'::jsonb,
            '{"fullName":"Lina Mansour","phone":"+966522222222","email":"lina@example.com","city":"Jeddah","gender":"female","age":"32","photoUrl":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80","cvUrl":"https://example.com/demo/lina-mansour-cv.pdf","experience":"Senior brand ambassador and trainer"}'::jsonb,
            'deferred', '[]'::jsonb, null,
            'save_for_future', 'Overqualified for this role, keep for premium events',
            'not_scheduled', false, 'not_sent', null, null, null, null, null, now()
          ),
          (
            $1, $2, '5', 'local-demo-noura-saleh-v2',
            '{"Full Name":"Noura Saleh","Mobile":"+966533333333","Email":"noura@example.com","City":"Dammam","Gender":"female","Age":"18","Photo":"","CV":"","Experience":"No event experience yet"}'::jsonb,
            '{"fullName":"Noura Saleh","phone":"+966533333333","email":"noura@example.com","city":"Dammam","gender":"female","age":"18","experience":"No event experience yet"}'::jsonb,
            'pending_review', '[]'::jsonb, null,
            'underqualified', 'Missing CV and limited experience',
            'not_scheduled', false, 'not_sent', null, null, null, null, null, null
          ),
          (
            $1, $2, '6', 'local-demo-missing-phone-v2',
            '{"Full Name":"Missing Phone","Mobile":"","Email":"missing-phone@example.com","City":"Jeddah"}'::jsonb,
            null,
            'error', '["phone is required"]'::jsonb, null,
            'needs_review', null, 'not_scheduled', false, 'not_sent',
            null, null, null, null, null, null
          )
        on conflict (tenant_id, source_hash) do update set
          raw_data = excluded.raw_data,
          mapped_data = excluded.mapped_data,
          status = excluded.status,
          error_messages = excluded.error_messages,
          created_person_id = excluded.created_person_id,
          screening_status = excluded.screening_status,
          screening_notes = excluded.screening_notes,
          interview_status = excluded.interview_status,
          contract_sent = excluded.contract_sent,
          contract_status = excluded.contract_status,
          presentation_score = excluded.presentation_score,
          communication_score = excluded.communication_score,
          english_fluency_score = excluded.english_fluency_score,
          final_score = excluded.final_score,
          saved_to_staff_at = excluded.saved_to_staff_at,
          saved_for_future_at = excluded.saved_for_future_at,
          updated_at = now()
      `,
      [tenantId, importRunId, saraPerson, omarPerson]
    );

    const demoEvent = await pool.query(
      `
        with existing as (
          select id from demo_events
          where tenant_id = $1 and name = 'Riyadh Launch Demo'
          limit 1
        ),
        inserted as (
          insert into demo_events (
            tenant_id, name, city, event_date, role_name, needed_headcount
          )
          select $1, 'Riyadh Launch Demo', 'Riyadh', current_date + interval '14 days', 'Host', 6
          where not exists (select 1 from existing)
          returning id
        )
        select id from inserted
        union all
        select id from existing
        limit 1
      `,
      [tenantId]
    );
    const demoEventId = (demoEvent.rows[0] as { id: string }).id;
    await pool.query(
      `
        insert into demo_event_shortlist (
          tenant_id, demo_event_id, person_id, applicant_row_id
        )
        select $1, $2, $3, id
        from applicant_import_rows
        where tenant_id = $1 and source_hash = 'local-demo-sara-ahmed-v2'
        on conflict do nothing
      `,
      [tenantId, demoEventId, saraPerson]
    );
    await pool.query(
      `
        insert into whatsapp_inbound_messages (
          tenant_id, wa_message_id, person_id, applicant_row_id,
          from_phone, body, intent, is_emergency, payload
        )
        select $1, 'local-demo-wa-emergency', $2, id,
               '+966500000000', 'Emergency, I cannot attend tomorrow',
               'emergency', true,
               '{"seed":"local"}'::jsonb
        from applicant_import_rows
        where tenant_id = $1 and source_hash = 'local-demo-sara-ahmed-v2'
        on conflict (wa_message_id) do nothing
      `,
      [tenantId, saraPerson]
    );
    await pool.query(
      `
        insert into whatsapp_inbound_messages (
          tenant_id, wa_message_id, person_id, applicant_row_id,
          from_phone, body, intent, is_emergency, payload
        )
        select $1, 'local-demo-wa-profile', $2, id,
               '+966511111111', 'Can I see my current status?',
               'current_status', false,
               '{"seed":"local"}'::jsonb
        from applicant_import_rows
        where tenant_id = $1 and source_hash = 'local-demo-omar-khalid-v2'
        on conflict (wa_message_id) do nothing
      `,
      [tenantId, omarPerson]
    );

    const userCount = await createPgBootstrapRepository(pool).countUsers(tenantId);
    if (userCount === 0) {
      const provisioner = createIdentityProvisioner({ pool, env });
      const user = await bootstrapOwner(
        {
          bootstrap: createPgBootstrapRepository(pool),
          users: createPgUserRepository(pool),
          identity: createIdentityAdmin(provisioner, pool)
        },
        {
          tenantSlug: input.tenantSlug,
          fullName: input.ownerFullName,
          email: input.ownerEmail,
          password: input.ownerPassword
        }
      );
      console.log(`[OK] Seeded tenant ${input.tenantSlug}`);
      console.log(`[OK] Bootstrapped owner ${user.email}`);
    } else {
      console.log(`[OK] Tenant ${input.tenantSlug} already has ${userCount} user(s)`);
    }
    console.log(`[OK] Migrations applied: ${migrations.applied.length}; skipped: ${migrations.skipped.length}`);
  } finally {
    await pool.end();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
