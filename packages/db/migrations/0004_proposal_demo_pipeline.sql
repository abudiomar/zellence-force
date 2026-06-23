alter table applicant_import_rows
  add column if not exists screening_status text not null default 'needs_review',
  add column if not exists screening_notes text,
  add column if not exists interview_status text not null default 'not_scheduled',
  add column if not exists contract_sent boolean not null default false,
  add column if not exists contract_status text not null default 'not_sent',
  add column if not exists presentation_score numeric(3,1),
  add column if not exists communication_score numeric(3,1),
  add column if not exists english_fluency_score numeric(3,1),
  add column if not exists final_score numeric(3,2),
  add column if not exists saved_to_staff_at timestamptz,
  add column if not exists saved_for_future_at timestamptz;

alter table applicant_import_rows
  add constraint applicant_screening_status_check
    check (screening_status in (
      'needs_review',
      'shortlist_for_interview',
      'save_to_staff_pool',
      'save_for_future',
      'underqualified',
      'overqualified',
      'rejected'
    )),
  add constraint applicant_interview_status_check
    check (interview_status in (
      'not_scheduled',
      'scheduled',
      'interviewed',
      'no_show',
      'passed',
      'failed'
    )),
  add constraint applicant_contract_status_check
    check (contract_status in (
      'not_sent',
      'sent',
      'pending',
      'signed',
      'refused'
    )),
  add constraint applicant_demo_scores_check
    check (
      (presentation_score is null or presentation_score between 1 and 5)
      and (communication_score is null or communication_score between 1 and 5)
      and (english_fluency_score is null or english_fluency_score between 1 and 5)
      and (final_score is null or final_score between 1 and 5)
    );

create table if not exists demo_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  city text,
  event_date date,
  role_name text not null,
  needed_headcount integer not null default 1,
  created_by_user_id uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (needed_headcount > 0)
);

create table if not exists demo_event_shortlist (
  tenant_id uuid not null references tenants(id) on delete cascade,
  demo_event_id uuid not null references demo_events(id) on delete cascade,
  person_id uuid references persons(id) on delete cascade,
  applicant_row_id uuid references applicant_import_rows(id) on delete cascade,
  status text not null default 'shortlisted',
  added_by_user_id uuid references users(id) on delete set null,
  added_at timestamptz not null default now(),
  check (status in ('shortlisted','confirmed','declined')),
  check (person_id is not null or applicant_row_id is not null),
  unique (demo_event_id, person_id),
  unique (demo_event_id, applicant_row_id)
);

create table if not exists whatsapp_inbound_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  wa_message_id text not null unique,
  person_id uuid references persons(id) on delete set null,
  applicant_row_id uuid references applicant_import_rows(id) on delete set null,
  from_phone text not null,
  body text not null,
  intent text not null default 'unknown',
  is_emergency boolean not null default false,
  matched_demo_event_id uuid references demo_events(id) on delete set null,
  payload jsonb,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (intent in ('profile_request','emergency','current_status','unknown'))
);

create index if not exists idx_applicant_rows_demo_screening on applicant_import_rows (tenant_id, screening_status, interview_status, contract_status);
create index if not exists idx_applicant_rows_demo_score on applicant_import_rows (tenant_id, final_score);
create index if not exists idx_demo_events_tenant_date on demo_events (tenant_id, event_date);
create index if not exists idx_demo_shortlist_event on demo_event_shortlist (tenant_id, demo_event_id);
create index if not exists idx_whatsapp_inbound_tenant_received on whatsapp_inbound_messages (tenant_id, received_at desc);
create index if not exists idx_whatsapp_inbound_emergency on whatsapp_inbound_messages (tenant_id, is_emergency, received_at desc);

drop trigger if exists trg_demo_events_updated on demo_events;
create trigger trg_demo_events_updated before update on demo_events
for each row execute function set_updated_at();
