create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger language plpgsql as $fn$
begin
  new.updated_at = now();
  return new;
end $fn$;

do $$ begin create type user_role as enum ('owner','admin','hr','coordinator','supervisor','finance','viewer'); exception when duplicate_object then null; end $$;
do $$ begin create type event_status as enum ('draft','recruiting','staffed','active','completed','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type person_type as enum ('temp','permanent'); exception when duplicate_object then null; end $$;
do $$ begin create type gender as enum ('male','female','other'); exception when duplicate_object then null; end $$;
do $$ begin create type person_status as enum ('pool','maybe_roster','active','inactive','blacklisted'); exception when duplicate_object then null; end $$;
do $$ begin create type consent_channel as enum ('whatsapp','sms','email'); exception when duplicate_object then null; end $$;
do $$ begin create type deduction_kind as enum ('fixed','percent'); exception when duplicate_object then null; end $$;
do $$ begin create type assignment_stage as enum ('candidate','screening','interview','offered','accepted','confirmed','declined','rejected','withdrawn'); exception when duplicate_object then null; end $$;
do $$ begin create type assignment_source as enum ('pool','recruitment'); exception when duplicate_object then null; end $$;
do $$ begin create type interview_status as enum ('scheduled','completed','no_show','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type contract_status as enum ('draft','sent','signed','declined','expired'); exception when duplicate_object then null; end $$;
do $$ begin create type contract_ingestion as enum ('whatsapp','manual'); exception when duplicate_object then null; end $$;
do $$ begin create type attendance_status as enum ('present','absent','late','excused'); exception when duplicate_object then null; end $$;
do $$ begin create type backup_outcome as enum ('not_applicable','standby','took_over'); exception when duplicate_object then null; end $$;
do $$ begin create type template_category as enum ('utility','marketing','authentication'); exception when duplicate_object then null; end $$;
do $$ begin create type template_status as enum ('draft','pending','approved','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type message_direction as enum ('inbound','outbound'); exception when duplicate_object then null; end $$;
do $$ begin create type message_status as enum ('queued','sent','delivered','read','failed'); exception when duplicate_object then null; end $$;
do $$ begin create type budget_side as enum ('billable','cost'); exception when duplicate_object then null; end $$;
do $$ begin create type budget_category as enum ('staff','meal','accommodation','transport','operational','food_vendor','other'); exception when duplicate_object then null; end $$;
do $$ begin create type applicant_import_run_status as enum ('running','completed','failed','partial'); exception when duplicate_object then null; end $$;
do $$ begin create type applicant_import_row_status as enum ('pending_review','error','accepted','merged','rejected','deferred'); exception when duplicate_object then null; end $$;
do $$ begin create type payment_batch_status as enum ('draft','in_review','reviewed','approved','rejected','exported'); exception when duplicate_object then null; end $$;
do $$ begin create type file_kind as enum ('cv','photo','contract','message_media','export','other'); exception when duplicate_object then null; end $$;
do $$ begin create type export_run_status as enum ('generated','failed'); exception when duplicate_object then null; end $$;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country text not null default 'SA',
  timezone text not null default 'Asia/Riyadh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tenant_settings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  default_language text not null default 'ar',
  supported_languages text[] not null default array['ar','en'],
  timezone text not null default 'Asia/Riyadh',
  currency text not null default 'SAR',
  hijri_enabled boolean not null default true,
  google_sheet_id text,
  google_sheet_range text,
  applicant_import_mapping jsonb,
  whatsapp_phone_number_id text,
  settings jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table if not exists persons (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_type person_type not null default 'temp',
  full_name text not null,
  phone text,
  email text,
  gender gender,
  birth_date date,
  city text,
  photo_url text,
  cv_url text,
  status person_status not null default 'pool',
  rating_event_avg numeric(5,2),
  rating_interview_avg numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_id uuid references persons(id) on delete set null,
  email text not null,
  password_hash text not null,
  full_name text not null,
  role user_role not null default 'coordinator',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  city text,
  location text,
  status event_status not null default 'draft',
  start_date date,
  end_date date,
  total_budget numeric(12,2),
  currency text not null default 'SAR',
  vat_rate numeric(5,2) not null default 0,
  payment_terms text,
  min_interview_score numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists job_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists shift_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  code text not null,
  name text not null,
  hours numeric(5,2),
  is_default boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, code),
  check (hours is null or hours > 0)
);

create table if not exists event_roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  job_role_id uuid not null references job_roles(id),
  headcount_required integer not null default 1,
  backup_count integer not null default 0,
  backup_standby_rate numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, job_role_id),
  check (headcount_required >= 0),
  check (backup_count >= 0),
  check (backup_standby_rate is null or backup_standby_rate >= 0)
);

create table if not exists event_budget_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  side budget_side not null,
  category budget_category not null,
  job_role_id uuid references job_roles(id),
  label text,
  shift_type text,
  shift_type_id uuid references shift_types(id),
  unit_rate numeric(12,2) not null default 0,
  days integer not null default 1,
  quantity integer not null default 1,
  planned_amount numeric(14,2) generated always as (unit_rate * days * quantity) stored,
  actual_amount numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (unit_rate >= 0),
  check (days > 0),
  check (quantity > 0),
  check (actual_amount is null or actual_amount >= 0)
);

create table if not exists late_penalty_tiers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  min_minutes integer not null,
  max_minutes integer,
  deduction_kind deduction_kind not null default 'fixed',
  deduction_value numeric(12,2) not null,
  created_at timestamptz not null default now(),
  check (min_minutes >= 0),
  check (max_minutes is null or max_minutes >= min_minutes),
  check (deduction_value >= 0)
);

create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  unique (tenant_id, name)
);

create table if not exists person_skills (
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  skill_id uuid not null references skills(id) on delete cascade,
  primary key (person_id, skill_id)
);

create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  channel consent_channel not null default 'whatsapp',
  consented boolean not null default true,
  consent_source text,
  consented_at timestamptz not null default now()
);

create table if not exists staff_groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  description text,
  is_smart boolean not null default false,
  criteria jsonb,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists staff_group_members (
  tenant_id uuid not null references tenants(id) on delete cascade,
  group_id uuid not null references staff_groups(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (group_id, person_id)
);

create table if not exists applicant_import_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  source_type text not null default 'google_sheets',
  source_id text not null,
  source_range text,
  started_by_user_id uuid references users(id) on delete set null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status applicant_import_run_status not null default 'running',
  rows_seen integer not null default 0,
  rows_imported integer not null default 0,
  rows_failed integer not null default 0,
  error_summary text,
  metadata jsonb,
  check (rows_seen >= 0),
  check (rows_imported >= 0),
  check (rows_failed >= 0)
);

create table if not exists applicant_import_rows (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  import_run_id uuid not null references applicant_import_runs(id) on delete cascade,
  source_id text not null,
  source_range text not null,
  source_row_id text not null,
  source_hash text not null,
  raw_data jsonb not null,
  mapped_data jsonb,
  status applicant_import_row_status not null default 'pending_review',
  error_messages jsonb,
  matched_person_id uuid references persons(id) on delete set null,
  created_person_id uuid references persons(id) on delete set null,
  reviewed_by_user_id uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  decision_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, import_run_id, source_row_id),
  unique (tenant_id, source_id, source_range, source_row_id),
  unique (tenant_id, source_hash)
);

create table if not exists event_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  job_role_id uuid references job_roles(id),
  stage assignment_stage not null default 'candidate',
  source assignment_source not null default 'pool',
  is_backup boolean not null default false,
  agreed_wage numeric(12,2),
  invited_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, person_id),
  check (agreed_wage is null or agreed_wage >= 0)
);

create table if not exists event_supervisors (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  assigned_by_user_id uuid references users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  is_lead boolean not null default false,
  notes text,
  unique (event_id, user_id)
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  interviewer_user_id uuid references users(id) on delete set null,
  scheduled_at timestamptz,
  status interview_status not null default 'scheduled',
  overall_score numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interview_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  interview_id uuid not null references interviews(id) on delete cascade,
  criterion text not null,
  score numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  owner_entity_type text not null,
  owner_entity_id uuid not null,
  file_kind file_kind not null default 'other',
  storage_provider text not null,
  storage_key text not null,
  public_url text,
  original_filename text,
  mime_type text,
  size_bytes bigint,
  checksum text,
  uploaded_by_user_id uuid references users(id) on delete set null,
  source text,
  created_at timestamptz not null default now(),
  check (size_bytes is null or size_bytes >= 0)
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_assignment_id uuid not null references event_assignments(id) on delete cascade,
  status contract_status not null default 'draft',
  file_url text,
  file_id uuid references files(id) on delete set null,
  ingestion_method contract_ingestion,
  sent_at timestamptz,
  signed_at timestamptz,
  deadline_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_assignment_id)
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_assignment_id uuid not null references event_assignments(id) on delete cascade,
  work_date date not null,
  status attendance_status not null default 'present',
  shift_type text,
  shift_type_id uuid references shift_types(id),
  late_minutes integer not null default 0,
  applied_tier_id uuid references late_penalty_tiers(id) on delete set null,
  backup_outcome backup_outcome not null default 'not_applicable',
  covered_assignment_id uuid references event_assignments(id) on delete set null,
  recorded_by_user_id uuid references users(id) on delete set null,
  recorded_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_assignment_id, work_date),
  check (late_minutes >= 0),
  check (status <> 'late' or late_minutes > 0)
);

create table if not exists event_day_ratings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  event_assignment_id uuid references event_assignments(id) on delete set null,
  rated_by_user_id uuid references users(id) on delete set null,
  rated_by_client_id uuid references clients(id) on delete set null,
  score numeric(5,2) not null,
  work_date date,
  comments text,
  created_at timestamptz not null default now()
);

create table if not exists payment_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  attendance_record_id uuid not null references attendance_records(id) on delete cascade,
  base_amount numeric(12,2) not null default 0,
  late_deduction numeric(12,2) not null default 0,
  backup_adjustment numeric(12,2) not null default 0,
  other_adjustment numeric(12,2) not null default 0,
  net_amount numeric(12,2) not null default 0,
  breakdown jsonb,
  calculated_at timestamptz not null default now(),
  unique (attendance_record_id),
  check (base_amount >= 0),
  check (late_deduction >= 0),
  check (net_amount >= 0)
);

create table if not exists payment_batches (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  status payment_batch_status not null default 'draft',
  created_by_user_id uuid references users(id) on delete set null,
  reviewed_by_user_id uuid references users(id) on delete set null,
  reviewed_at timestamptz,
  approved_by_user_id uuid references users(id) on delete set null,
  approved_at timestamptz,
  rejected_by_user_id uuid references users(id) on delete set null,
  rejected_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_batch_lines (
  tenant_id uuid not null references tenants(id) on delete cascade,
  payment_batch_id uuid not null references payment_batches(id) on delete cascade,
  payment_line_id uuid not null references payment_lines(id) on delete cascade,
  included_at timestamptz not null default now(),
  primary key (payment_batch_id, payment_line_id)
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  category template_category not null default 'utility',
  language text not null default 'ar',
  body text not null,
  meta_template_name text,
  status template_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name, language)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  person_id uuid references persons(id) on delete set null,
  template_id uuid references message_templates(id) on delete set null,
  direction message_direction not null,
  status message_status,
  wa_message_id text unique,
  related_entity_type text,
  related_entity_id uuid,
  payload jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  author_user_id uuid references users(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  actor_user_id uuid references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  request_id text,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists export_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  export_type text not null,
  format text not null,
  status export_run_status not null default 'generated',
  requested_by_user_id uuid references users(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  file_id uuid references files(id) on delete set null,
  row_count integer,
  error text,
  created_at timestamptz not null default now(),
  check (row_count is null or row_count >= 0)
);

create or replace view event_budget_summary as
select
  e.id as event_id,
  e.tenant_id,
  e.vat_rate,
  coalesce(sum(bi.planned_amount) filter (where bi.side = 'billable'), 0) as total_in_planned,
  coalesce(sum(bi.planned_amount) filter (where bi.side = 'cost'), 0) as total_out_planned,
  coalesce(sum(bi.actual_amount) filter (where bi.side = 'cost'), 0) as total_out_actual,
  coalesce(sum(bi.planned_amount) filter (where bi.side = 'billable'), 0)
    - coalesce(sum(bi.planned_amount) filter (where bi.side = 'cost'), 0) as projected_income,
  coalesce(sum(bi.planned_amount) filter (where bi.side = 'billable'), 0)
    - coalesce(sum(bi.actual_amount) filter (where bi.side = 'cost'), 0) as actual_income
from events e
left join event_budget_items bi on bi.event_id = e.id
group by e.id, e.tenant_id, e.vat_rate;

create index if not exists idx_persons_tenant_status on persons (tenant_id, status);
create index if not exists idx_persons_tenant_city on persons (tenant_id, city);
create index if not exists idx_persons_tenant_gender on persons (tenant_id, gender);
create index if not exists idx_persons_tenant_type on persons (tenant_id, person_type);
create index if not exists idx_persons_phone on persons (phone);
create index if not exists idx_events_tenant_status on events (tenant_id, status);
create index if not exists idx_events_tenant_client_date on events (tenant_id, client_id, start_date);
create index if not exists idx_event_roles_event on event_roles (event_id);
create index if not exists idx_late_tiers_event on late_penalty_tiers (event_id);
create index if not exists idx_assignments_event on event_assignments (event_id);
create index if not exists idx_assignments_person on event_assignments (person_id);
create index if not exists idx_assignments_tenant_stage on event_assignments (tenant_id, stage);
create index if not exists idx_applicant_rows_tenant_status_hash on applicant_import_rows (tenant_id, status, source_hash);
create index if not exists idx_attendance_assignment on attendance_records (event_assignment_id);
create index if not exists idx_attendance_tenant_date on attendance_records (tenant_id, work_date);
create index if not exists idx_payment_batches_tenant_event_status on payment_batches (tenant_id, event_id, status);
create index if not exists idx_messages_person on messages (tenant_id, person_id);
create index if not exists idx_messages_entity on messages (related_entity_type, related_entity_id);
create index if not exists idx_audit_logs_tenant_entity_action_created on audit_logs (tenant_id, entity_type, entity_id, action, created_at);
create index if not exists idx_files_tenant_owner_kind on files (tenant_id, owner_entity_type, owner_entity_id, file_kind);
create index if not exists idx_export_runs_tenant_type_created on export_runs (tenant_id, export_type, created_at);

do $$
declare t text;
begin
  foreach t in array array[
    'tenants','tenant_settings','persons','users','clients','events','job_roles',
    'shift_types','event_roles','event_budget_items','staff_groups',
    'applicant_import_rows','event_assignments','interviews','contracts',
    'attendance_records','message_templates','messages','payment_batches'
  ]
  loop
    execute format('drop trigger if exists trg_%1$s_updated on %1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;
