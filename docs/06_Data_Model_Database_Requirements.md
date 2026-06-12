# Data Model and Database Requirements

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Draft v0.1  
**Source inputs:** `database.js`, `SYSTEM_ARCHITECTURE.md`, BRD, Roles, Use Cases, Functional Requirements, Non-Functional Requirements, approved Phase 6 recommendations  
**Date:** 2026-06-10

---

## 1. Purpose

This document defines the database and data model requirements for Zell-force MVP. It translates business workflows into entities, relationships, fields, validation rules, access rules, status models, audit requirements, and database design notes.

`database.js` is treated as a **starting point**, not final schema. This document identifies required changes before implementation.

---

## 2. Database Design Principles

| Principle | Requirement |
|---|---|
| Tenant-ready | Every tenant-owned table must include `tenant_id`. |
| Relational core | PostgreSQL is primary source of truth. |
| UUID keys | Primary keys should use UUIDs. |
| Timezone-aware time | Operational timestamps use `timestamptz`. |
| Money precision | Money uses `numeric`, never floating point. |
| Status control | Stable statuses use enums or controlled lookup tables. |
| Calculated money | Payment and budget calculations must be reproducible and auditable. |
| Sensitive data control | Photos, CVs, contracts, payment data, and appearance-related data need access rules. |
| Auditability | Money, attendance, roster, contract, import, and permission-sensitive changes must be logged. |
| TDD/testability | Deep Modules test through clear Interfaces; payment and imports must be test-first. |

---

## 3. Current Schema Summary

Current `database.js` defines these core groups:

| Group | Tables |
|---|---|
| Tenancy/access | `tenants`, `users` |
| Workforce | `persons`, `skills`, `person_skills`, `consents`, `staff_groups`, `staff_group_members` |
| Clients/events | `clients`, `events`, `job_roles`, `event_roles`, `late_penalty_tiers` |
| Hiring pipeline | `event_assignments`, `interviews`, `interview_scores`, `contracts` |
| Operations | `attendance_records`, `event_day_ratings` |
| Payments | `payment_lines` |
| Budgeting | `event_budget_items`, view `event_budget_summary` |
| Messaging | `message_templates`, `messages` |
| Notes | `notes` |

Current required schema changes:

| Gap | Required Change |
|---|---|
| `user_role` missing `supervisor`, `finance` | Add enum values or migrate to role lookup later |
| No applicant import staging | Add `applicant_import_runs`, `applicant_import_rows` |
| No audit table | Add `audit_logs` |
| No supervisor-event access source | Add `event_supervisors` |
| No payment review/approval state | Add `payment_batches`, `payment_batch_lines` |
| Files only stored as URLs | Add `files` metadata table |
| Shift type stored as raw text | Add `shift_types` lookup |
| Tenant config scattered | Add `tenant_settings` |
| Export logging missing | Add `export_runs` recommended |

---

## 4. Entity List

### MVP Entities

| Entity | Table | Purpose |
|---|---|---|
| Tenant | `tenants` | Agency/account root |
| Tenant Settings | `tenant_settings` | Locale, currency, import, WhatsApp, and operational settings |
| User | `users` | Internal login account |
| Person | `persons` | Temp/permanent workforce profile |
| Client | `clients` | Company hiring MAG Events |
| Event | `events` | Staffing project |
| Job Role | `job_roles` | Tenant staffing role, e.g. host/usher/driver |
| Event Role | `event_roles` | Required headcount and backups for one role in one event |
| Shift Type | `shift_types` | 6hr/10hr/custom shift definitions |
| Event Budget Item | `event_budget_items` | Billable/cost master sheet line |
| Late Penalty Tier | `late_penalty_tiers` | Lateness deduction rules |
| Skill | `skills` | Workforce attribute |
| Person Skill | `person_skills` | Skill assignment |
| Consent | `consents` | WhatsApp/SMS/email/data consent |
| Staff Group | `staff_groups` | Manual or smart roster/batch |
| Staff Group Member | `staff_group_members` | Manual group membership |
| Applicant Import Run | `applicant_import_runs` | One Google Sheet import execution |
| Applicant Import Row | `applicant_import_rows` | Staged imported applicant row |
| Event Assignment | `event_assignments` | Person-to-event workflow spine |
| Event Supervisor | `event_supervisors` | Supervisor assigned event access |
| Interview | `interviews` | Interview appointment/result |
| Interview Score | `interview_scores` | Score by criterion |
| Contract | `contracts` | Assignment contract status/file |
| Attendance Record | `attendance_records` | Per assignment/day attendance |
| Event-Day Rating | `event_day_ratings` | Performance rating from event work |
| Payment Line | `payment_lines` | Calculated pay for one attendance row |
| Payment Batch | `payment_batches` | Finance review/Owner approval unit |
| Payment Batch Line | `payment_batch_lines` | Payment lines included in batch |
| Message Template | `message_templates` | WhatsApp template metadata |
| Message | `messages` | Inbound/outbound WhatsApp log |
| File | `files` | File metadata and storage reference |
| Note | `notes` | Notes on persons/events/assignments/etc. |
| Audit Log | `audit_logs` | Critical change history |
| Export Run | `export_runs` | Report/export history |

### Future Entities

| Entity | Purpose |
|---|---|
| Permission | Granular action permission |
| Role | Custom role definition |
| Role Permission | Permission assignment to custom role |
| User Role | Multiple roles per user |
| Client User | Client-facing login |
| External Rating Link | Client/per-host rating |
| Payment Disbursement | WPS/bank payout integration |
| Accounting Export | Xero/accounting integration |
| Tenant Billing | Future SaaS billing |

---

## 5. Relationship Overview

| Relationship | Cardinality | Notes |
|---|---|---|
| Tenant -> Users | 1:N | Users scoped by tenant |
| Tenant -> Persons | 1:N | Workforce scoped by tenant |
| User -> Person | 0/1:1 | Internal user may link to workforce person |
| Client -> Events | 1:N | Event may have nullable client during draft |
| Event -> Event Roles | 1:N | Staffing plan |
| Job Role -> Event Roles | 1:N | Role reused across events |
| Event -> Budget Items | 1:N | Master sheet lines |
| Event -> Late Penalty Tiers | 1:N | Event-specific MVP rules |
| Person -> Event Assignments | 1:N | Person can work many events |
| Event -> Event Assignments | 1:N | Event roster/pipeline |
| Event Assignment -> Contract | 1:0/1 | Current model: one contract per assignment |
| Event Assignment -> Attendance Records | 1:N | One row per work date |
| Attendance Record -> Payment Line | 1:0/1 | One calculated payment line |
| Payment Batch -> Payment Batch Lines | 1:N | Review/approval/export unit |
| Payment Line -> Payment Batch Lines | 1:0/N | Usually one final batch; draft/history rules TBD |
| Person -> Interviews | 1:N | Interviews may be event-specific |
| Interview -> Interview Scores | 1:N | Scores by criterion |
| Person -> Event-Day Ratings | 1:N | Rating history |
| Person -> Consents | 1:N | Consent per channel/source |
| Staff Group -> Members | 1:N | Manual membership; smart groups use criteria |
| Person -> Files | 1:N | CV/photo/etc. |
| Contract -> Files | 1:N | Signed contract file(s) |
| Entity -> Audit Logs | 1:N | Polymorphic audit target |

---

## 6. Data Dictionary

### 6.1 `tenants`

Purpose: root agency/account.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `name` | text | Yes | Tenant display name |
| `slug` | text | Yes | Unique tenant slug |
| `country` | text | Yes | Default `SA` |
| `timezone` | text | Yes | Default `Asia/Riyadh` |
| `created_at` | timestamptz | Yes | Created timestamp |
| `updated_at` | timestamptz | Yes | Updated timestamp |

Access:

- Owner/Admin can manage tenant profile.
- Future SaaS Super Admin can manage multiple tenants.

### 6.2 `tenant_settings` (new)

Purpose: single source of truth for tenant config.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `default_language` | text | Yes | Recommended `ar` |
| `supported_languages` | text[] or jsonb | Yes | `ar`, `en` |
| `timezone` | text | Yes | `Asia/Riyadh` |
| `currency` | text | Yes | `SAR` |
| `hijri_enabled` | boolean | Yes | Default true |
| `google_sheet_id` | text | No | Applicant intake Sheet |
| `google_sheet_range` | text | No | Import range |
| `applicant_import_mapping` | jsonb | No | Sheet field mapping |
| `whatsapp_phone_number_id` | text | No | Meta config reference |
| `settings` | jsonb | No | Extension config |
| `created_at` | timestamptz | Yes | Created timestamp |
| `updated_at` | timestamptz | Yes | Updated timestamp |

Validation:

- One active settings row per tenant.
- Secrets must not be stored here in plaintext; secret names/references only.

### 6.3 `users`

Purpose: internal login accounts.

Required role enum update:

```sql
('owner','admin','hr','coordinator','supervisor','finance','viewer')
```

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `person_id` | uuid | No | Optional FK persons |
| `auth_user_id` | text | Yes after provisioning | Unique FK to Better Auth `"user".id` |
| `email` | text | Yes | Unique per tenant |
| `full_name` | text | Yes | Login display name |
| `role` | user_role | Yes | MVP fixed role |
| `is_active` | boolean | Yes | Login allowed/blocked |
| `created_at` | timestamptz | Yes | Created timestamp |
| `updated_at` | timestamptz | Yes | Updated timestamp |

Access:

- Owner/Admin manage users.
- User may view own basic profile.

Validation:

- Unique `(tenant_id, email)`.
- Inactive user cannot log in.

### 6.4 `persons`

Purpose: single workforce table for temps and permanent staff.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `person_type` | enum | Yes | `temp`, `permanent` |
| `full_name` | text | Yes | Worker name |
| `phone` | text | Recommended | WhatsApp identity; duplicate warning |
| `email` | text | No | Optional |
| `gender` | enum | No | Sensitive |
| `birth_date` | date | No | Sensitive/age derived |
| `city` | text | No | Filter field |
| `photo_url` | text | No | Current starting field; future use file ref |
| `cv_url` | text | No | Current starting field; future use file ref |
| `status` | enum | Yes | pool/maybe_roster/active/inactive/blacklisted |
| `rating_event_avg` | numeric(5,2) | No | Denormalized cache |
| `rating_interview_avg` | numeric(5,2) | No | Denormalized cache |
| `created_at` | timestamptz | Yes | Created timestamp |
| `updated_at` | timestamptz | Yes | Updated timestamp |

Access:

- Owner/Admin/HR full.
- Coordinator limited.
- Supervisor assigned-event roster only.
- Finance limited.
- Viewer restricted.

Recommended changes:

- Add normalized phone field or phone uniqueness strategy per tenant if data quality allows.
- Consider `nationality`, `language`, `shirt_size`, `emergency_contact` only if client confirms.
- Use `files` table instead of relying only on URLs.

### 6.5 `clients`

Purpose: companies that hire MAG Events.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `name` | text | Yes | Client company |
| `contact_name` | text | No | Main contact |
| `contact_phone` | text | No | Contact phone |
| `contact_email` | text | No | Contact email |
| `notes` | text | No | Internal notes |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Access:

- Owner/Admin full.
- Coordinator operational access.
- Finance limited billing/report access.
- Client login future.

### 6.6 `events`

Purpose: event/project header.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `client_id` | uuid | No | FK clients |
| `name` | text | Yes | Event name |
| `city` | text | No | Event city |
| `location` | text | No | Venue/location |
| `status` | enum | Yes | draft/recruiting/staffed/active/completed/cancelled |
| `start_date` | date | No | Start |
| `end_date` | date | No | End |
| `total_budget` | numeric(12,2) | No | Header/reference |
| `currency` | text | Yes | Default SAR |
| `vat_rate` | numeric(5,2) | Yes | Default 0 |
| `payment_terms` | text | No | Client terms |
| `min_interview_score` | numeric(5,2) | No | Event gate |
| `notes` | text | No | Internal |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- `end_date >= start_date`.
- Status transitions controlled by workflow.

### 6.7 `job_roles`

Purpose: tenant staffing role catalog.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `name` | text | Yes | Unique per tenant |
| `description` | text | No | Description |
| `is_default` | boolean | Yes | Seed/default role |
| `is_active` | boolean | Yes | Available for new events |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Unique `(tenant_id, name)`.
- Not same concept as `user_role`.

### 6.8 `shift_types` (new)

Purpose: controlled shift taxonomy for rate lookup.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `code` | text | Yes | e.g. `6h`, `10h`, `custom` |
| `name` | text | Yes | Display |
| `hours` | numeric(5,2) | No | Expected duration |
| `is_default` | boolean | Yes | Tenant default |
| `is_active` | boolean | Yes | Available |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Unique `(tenant_id, code)`.
- Existing raw `shift_type` text can later migrate to `shift_type_id`.

### 6.9 `event_roles`

Purpose: event staffing plan by Job Role.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_id` | uuid | Yes | FK events |
| `job_role_id` | uuid | Yes | FK job_roles |
| `headcount_required` | integer | Yes | Required staff |
| `backup_count` | integer | Yes | Required backups |
| `backup_standby_rate` | numeric(12,2) | No | Standby pay |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Unique `(event_id, job_role_id)`.
- Headcount and backup count cannot be negative.

### 6.10 `event_budget_items`

Purpose: two-sided master sheet budget lines.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_id` | uuid | Yes | FK events |
| `side` | enum | Yes | billable/cost |
| `category` | enum | Yes | staff/meal/accommodation/transport/operational/food_vendor/other |
| `job_role_id` | uuid | No | Staff lines |
| `label` | text | No | Non-role line label |
| `shift_type` | text | No | Current starting field |
| `unit_rate` | numeric(12,2) | Yes | Money |
| `days` | integer | Yes | Quantity component |
| `quantity` | integer | Yes | Quantity component |
| `planned_amount` | numeric(14,2) | Generated | `unit_rate * days * quantity` |
| `actual_amount` | numeric(12,2) | No | Filled from actuals/payment calc |
| `notes` | text | No | Internal |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Recommended changes:

- Add `shift_type_id` nullable FK to `shift_types` after shift model final.
- Audit every create/update/delete.
- Use cost-side staff budget line for payment active rate when no agreed wage.

### 6.11 `late_penalty_tiers`

Purpose: event-specific lateness deduction rules.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_id` | uuid | Yes | FK events |
| `min_minutes` | integer | Yes | Inclusive lower bound |
| `max_minutes` | integer | No | Inclusive/defined by implementation; null = no upper bound |
| `deduction_kind` | enum | Yes | fixed/percent |
| `deduction_value` | numeric(12,2) | Yes | Fixed SAR or percentage |
| `created_at` | timestamptz | Yes | Created |

Validation:

- No overlapping ranges per event.
- `min_minutes >= 0`.
- Percent values in valid range TBD.
- Deduction capped at base pay.

### 6.12 `skills` and `person_skills`

Purpose: staff attributes and filter tags.

`skills`:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `name` | text | Yes | Unique per tenant |

`person_skills`:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `person_id` | uuid | Yes | FK persons |
| `skill_id` | uuid | Yes | FK skills |

Validation:

- Unique `(tenant_id, name)`.
- Composite PK `(person_id, skill_id)`.

### 6.13 `consents`

Purpose: channel/data consent records.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `person_id` | uuid | Yes | FK persons |
| `channel` | enum | Yes | whatsapp/sms/email |
| `consented` | boolean | Yes | Consent state |
| `consent_source` | text | No | Google Form/manual/etc. |
| `consented_at` | timestamptz | Yes | Timestamp |

Access:

- HR/Admin can manage.
- Messaging checks consent.

### 6.14 `staff_groups` and `staff_group_members`

Purpose: manual and smart groups for saved rosters/batches.

`staff_groups`:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `name` | text | Yes | Group name |
| `description` | text | No | Description |
| `is_smart` | boolean | Yes | Criteria-based |
| `criteria` | jsonb | No | Filter criteria |
| `created_by` | uuid | No | FK users |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

`staff_group_members`:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `group_id` | uuid | Yes | FK staff_groups |
| `person_id` | uuid | Yes | FK persons |
| `added_at` | timestamptz | Yes | Timestamp |

Validation:

- Manual groups use members.
- Smart groups use criteria; membership can be computed or cached TBD.

### 6.15 `applicant_import_runs` (new)

Purpose: track Google Sheet sync executions.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `source_type` | text | Yes | `google_sheets` initially |
| `source_id` | text | Yes | Sheet ID or config key |
| `source_range` | text | No | Sheet range |
| `started_by_user_id` | uuid | No | Manual sync user |
| `started_at` | timestamptz | Yes | Start |
| `finished_at` | timestamptz | No | End |
| `status` | text/enum | Yes | running/completed/failed/partial |
| `rows_seen` | integer | Yes | Count |
| `rows_imported` | integer | Yes | Count |
| `rows_failed` | integer | Yes | Count |
| `error_summary` | text | No | Failure summary |
| `metadata` | jsonb | No | Provider/run info |

Validation:

- Counts non-negative.
- Running run eventually completes/fails via job timeout handling.

### 6.16 `applicant_import_rows` (new)

Purpose: staged applicant review queue.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `import_run_id` | uuid | Yes | FK applicant_import_runs |
| `source_row_id` | text | Yes | Sheet row number or stable key |
| `source_hash` | text | Yes | Dedupe/idempotency hash |
| `raw_data` | jsonb | Yes | Original row |
| `mapped_data` | jsonb | No | Normalized fields |
| `status` | text/enum | Yes | pending_review/error/accepted/merged/rejected/deferred |
| `error_messages` | jsonb | No | Validation errors |
| `matched_person_id` | uuid | No | Suggested/selected match |
| `created_person_id` | uuid | No | Created person |
| `reviewed_by_user_id` | uuid | No | HR/Admin |
| `reviewed_at` | timestamptz | No | Review time |
| `decision_notes` | text | No | Reason |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Unique `(tenant_id, source_id/source_row_id/source_hash)` design TBD.
- Required mapped fields: full name and phone recommended.
- No direct person creation before review.

Access:

- HR/Admin only.

### 6.17 `event_assignments`

Purpose: convergence spine from sourcing to contract, attendance, rating, payment.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_id` | uuid | Yes | FK events |
| `person_id` | uuid | Yes | FK persons |
| `job_role_id` | uuid | No | FK job_roles |
| `stage` | enum | Yes | candidate/screening/interview/offered/accepted/declined/rejected/confirmed/withdrawn |
| `source` | enum | Yes | pool/recruitment |
| `is_backup` | boolean | Yes | Backup assignment |
| `agreed_wage` | numeric(12,2) | No | Overrides cost rate |
| `invited_at` | timestamptz | No | Invite sent |
| `responded_at` | timestamptz | No | Worker response |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Unique `(event_id, person_id)` current model.
- Agreed wage change restricted and audited.
- Stage changes audited.

Open question:

- If same person can work multiple roles in same event, current unique constraint must change. MVP assumes one event assignment per person per event.

### 6.18 `event_supervisors` (new)

Purpose: define which Supervisors can access which event rosters/attendance.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_id` | uuid | Yes | FK events |
| `user_id` | uuid | Yes | FK users |
| `assigned_by_user_id` | uuid | No | FK users |
| `assigned_at` | timestamptz | Yes | Timestamp |
| `is_lead` | boolean | Yes | Optional lead supervisor |
| `notes` | text | No | Internal |

Validation:

- Unique `(event_id, user_id)`.
- User role should be `supervisor` or Owner/Admin override.

### 6.19 `interviews` and `interview_scores`

Purpose: recruitment scoring.

`interviews` key fields:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `person_id` | uuid | Yes | Candidate |
| `event_id` | uuid | No | Event-specific interview |
| `interviewer_user_id` | uuid | No | Interviewer |
| `scheduled_at` | timestamptz | No | Schedule |
| `status` | enum | Yes | scheduled/completed/no_show/cancelled |
| `overall_score` | numeric(5,2) | No | Aggregate/manual |
| `notes` | text | No | Internal |

`interview_scores` key fields:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `interview_id` | uuid | Yes | FK interviews |
| `criterion` | text | Yes | e.g. communication, presentation |
| `score` | numeric(5,2) | Yes | Score |

Recommended changes:

- Add `interview_score_criteria` lookup if criteria need consistency.
- Define score scale in requirements later. Current scale TBD.

### 6.20 `contracts`

Purpose: track assignment contract and signed file.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_assignment_id` | uuid | Yes | FK event_assignments |
| `status` | enum | Yes | draft/sent/signed/declined/expired |
| `file_url` | text | No | Starting field; future file ref |
| `ingestion_method` | enum | No | whatsapp/manual |
| `sent_at` | timestamptz | No | Sent |
| `signed_at` | timestamptz | No | Signed |
| `deadline_at` | timestamptz | No | Deadline |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Recommended changes:

- Add `file_id` FK to `files` or bridge table if multiple files per contract.
- Audit contract status changes.

### 6.21 `attendance_records`

Purpose: per worker assignment, per work date field reality.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_assignment_id` | uuid | Yes | FK event_assignments |
| `work_date` | date | Yes | Event work date |
| `status` | enum | Yes | present/absent/late/excused |
| `shift_type` | text | No | Current; migrate to shift_type_id later |
| `late_minutes` | integer | No | Default 0 |
| `applied_tier_id` | uuid | No | FK late_penalty_tiers |
| `backup_outcome` | enum | Yes | not_applicable/standby/took_over |
| `covered_assignment_id` | uuid | No | Assignment covered by backup |
| `recorded_by_user_id` | uuid | No | Supervisor/Admin |
| `recorded_at` | timestamptz | Yes | Timestamp |
| `notes` | text | No | Field notes |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Unique `(event_assignment_id, work_date)`.
- Late status requires `late_minutes > 0`.
- `late_minutes >= 0`.
- Edits lock after Finance review starts.

### 6.22 `event_day_ratings`

Purpose: performance ratings from event work.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `event_id` | uuid | Yes | FK events |
| `person_id` | uuid | Yes | Rated worker |
| `event_assignment_id` | uuid | No | FK assignment |
| `rated_by_user_id` | uuid | No | Internal rater |
| `rated_by_client_id` | uuid | No | Future client rating |
| `score` | numeric(5,2) | Yes | Rating score |
| `work_date` | date | No | Date |
| `comments` | text | No | Comments |
| `created_at` | timestamptz | Yes | Created |

Open:

- Score scale and criteria TBD.

### 6.23 `payment_lines`

Purpose: calculated payment output for one attendance record.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `attendance_record_id` | uuid | Yes | FK attendance_records |
| `base_amount` | numeric(12,2) | Yes | Base pay |
| `late_deduction` | numeric(12,2) | Yes | Deduction |
| `backup_adjustment` | numeric(12,2) | Yes | Backup adjustment |
| `other_adjustment` | numeric(12,2) | Yes | Manual adjustment |
| `net_amount` | numeric(12,2) | Yes | Final calculated net |
| `breakdown` | jsonb | No | Explanation |
| `calculated_at` | timestamptz | Yes | Timestamp |

Validation:

- Unique `(attendance_record_id)`.
- `net_amount >= 0`.
- Manual adjustments require reason/audit log. Current schema needs adjustment reason location.

Recommended changes:

- Add `calculation_status` and `error_message` if missing rates can produce review-required state.
- Add `manual_adjustment_reason` or separate adjustments table.

### 6.24 `payment_batches` (new)

Purpose: finance review, approval, lock, and export unit.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `event_id` | uuid | Yes | FK events |
| `status` | text/enum | Yes | draft/in_review/reviewed/approved/rejected/exported |
| `created_by_user_id` | uuid | No | FK users |
| `reviewed_by_user_id` | uuid | No | Finance |
| `reviewed_at` | timestamptz | No | Finance review |
| `approved_by_user_id` | uuid | No | Owner/Admin |
| `approved_at` | timestamptz | No | Approval |
| `rejected_by_user_id` | uuid | No | Rejection |
| `rejected_at` | timestamptz | No | Rejection |
| `notes` | text | No | Review notes |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Approval only Owner/Admin.
- Finance can review/flag.
- Approval locks included payment lines/attendance unless reopened.

### 6.25 `payment_batch_lines` (new)

Purpose: connect payment lines to review/approval batch.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `payment_batch_id` | uuid | Yes | FK payment_batches |
| `payment_line_id` | uuid | Yes | FK payment_lines |
| `included_at` | timestamptz | Yes | Timestamp |

Validation:

- Composite PK `(payment_batch_id, payment_line_id)`.
- A payment line should not be in multiple approved batches unless correction workflow is defined.

### 6.26 `message_templates`

Purpose: internal metadata for WhatsApp templates.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `name` | text | Yes | Internal template name |
| `category` | enum | Yes | utility/marketing/authentication |
| `language` | text | Yes | e.g. ar/en |
| `body` | text | Yes | Template body |
| `meta_template_name` | text | No | Meta approved name |
| `status` | enum | Yes | draft/pending/approved/rejected |

Validation:

- Unique `(tenant_id, name, language)`.
- Production sends should use approved utility templates.

### 6.27 `messages`

Purpose: WhatsApp inbound/outbound log.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `person_id` | uuid | No | Worker |
| `template_id` | uuid | No | Template |
| `direction` | enum | Yes | inbound/outbound |
| `status` | enum | No | queued/sent/delivered/read/failed |
| `wa_message_id` | text | No | Unique dedupe key |
| `related_entity_type` | text | No | e.g. assignment/contract |
| `related_entity_id` | uuid | No | Related record |
| `payload` | jsonb | No | Provider payload |
| `error` | text | No | Failure |
| `created_at` | timestamptz | Yes | Created |
| `updated_at` | timestamptz | Yes | Updated |

Validation:

- Unique `wa_message_id` where present.
- Webhooks idempotent.

### 6.28 `files` (new)

Purpose: file metadata, storage reference, and access control.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `owner_entity_type` | text | Yes | person/contract/message/etc. |
| `owner_entity_id` | uuid | Yes | Related entity |
| `file_kind` | text/enum | Yes | cv/photo/contract/other |
| `storage_provider` | text | Yes | Provider name |
| `storage_key` | text | Yes | Object key/path |
| `public_url` | text | No | Avoid public if sensitive |
| `original_filename` | text | No | Original name |
| `mime_type` | text | No | Content type |
| `size_bytes` | bigint | No | Size |
| `checksum` | text | No | Integrity |
| `uploaded_by_user_id` | uuid | No | FK users |
| `source` | text | No | manual/whatsapp/google_form |
| `created_at` | timestamptz | Yes | Created |

Validation:

- Sensitive files should use private storage and signed URLs.
- Contract PDFs should be `application/pdf` unless manual override.

### 6.29 `notes`

Purpose: polymorphic internal notes.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `entity_type` | text | Yes | person/event/assignment/etc. |
| `entity_id` | uuid | Yes | Target ID |
| `author_user_id` | uuid | No | FK users |
| `body` | text | Yes | Note text |
| `created_at` | timestamptz | Yes | Created |

Recommended changes:

- Add `visibility` or `is_sensitive` if notes include private HR/appearance/payment content.

### 6.30 `audit_logs` (new)

Purpose: immutable record of sensitive changes.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `actor_user_id` | uuid | No | User/system |
| `action` | text | Yes | e.g. budget.updated |
| `entity_type` | text | Yes | Target type |
| `entity_id` | uuid | Yes | Target ID |
| `before_data` | jsonb | No | Redact sensitive if needed |
| `after_data` | jsonb | No | Redact sensitive if needed |
| `reason` | text | No | Required for some actions |
| `request_id` | text | No | Correlation |
| `ip_address` | inet/text | No | Optional |
| `user_agent` | text | No | Optional |
| `created_at` | timestamptz | Yes | Timestamp |

Audit actions required:

- budget create/update/delete;
- wage/agreed wage change;
- roster approval;
- attendance edit/reopen;
- payment calculation/recalculation;
- manual payment adjustment;
- payment batch review/approval/export;
- contract status/file change;
- user/role change;
- blacklist/deactivate person.

### 6.31 `export_runs` (new/recommended)

Purpose: report/export traceability.

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | uuid | Yes | PK |
| `tenant_id` | uuid | Yes | FK tenants |
| `export_type` | text | Yes | payment/attendance/roster/budget |
| `format` | text | Yes | csv/xlsx/pdf future |
| `status` | text | Yes | generated/failed |
| `requested_by_user_id` | uuid | No | FK users |
| `related_entity_type` | text | No | event/payment_batch/etc. |
| `related_entity_id` | uuid | No | Target |
| `file_id` | uuid | No | FK files if stored |
| `row_count` | integer | No | Rows exported |
| `error` | text | No | Failure |
| `created_at` | timestamptz | Yes | Timestamp |

Validation:

- Final payment export should require approved payment batch unless draft-labeled.

---

## 7. Status Models

### 7.1 User Role

Current required MVP values:

| Value | Meaning |
|---|---|
| `owner` | Full business owner |
| `admin` | Full operations admin |
| `hr` | Recruiter/HR user |
| `coordinator` | Staffing coordinator |
| `supervisor` | Assigned-event field supervisor |
| `finance` | Payment review/export role |
| `viewer` | Read-only user |

### 7.2 Event Status

| Value | Meaning |
|---|---|
| `draft` | Event created, not actively recruiting |
| `recruiting` | Staff sourcing underway |
| `staffed` | Final roster approved/ready |
| `active` | Event underway |
| `completed` | Event finished |
| `cancelled` | Event cancelled |

### 7.3 Person Status

| Value | Meaning |
|---|---|
| `pool` | Available in workforce pool |
| `maybe_roster` | Saved for possible future/event use |
| `active` | Active/current worker |
| `inactive` | Not currently active |
| `blacklisted` | Excluded from normal assignment |

### 7.4 Assignment Stage

| Value | Meaning |
|---|---|
| `candidate` | Candidate identified |
| `screening` | Screening underway |
| `interview` | Interview stage |
| `offered` | Offer/invitation sent |
| `accepted` | Worker accepted |
| `declined` | Worker declined |
| `rejected` | Business rejected |
| `confirmed` | Final confirmed assignment |
| `withdrawn` | Removed/withdrew |

### 7.5 Contract Status

| Value | Meaning |
|---|---|
| `draft` | Created, not sent |
| `sent` | Sent to worker |
| `signed` | Signed/returned |
| `declined` | Worker declined |
| `expired` | Deadline passed |

### 7.6 Attendance Status

| Value | Meaning |
|---|---|
| `present` | Attended |
| `absent` | Did not attend |
| `late` | Attended late |
| `excused` | Excused absence |

### 7.7 Backup Outcome

| Value | Meaning |
|---|---|
| `not_applicable` | Normal staff/no backup outcome |
| `standby` | Backup not used, earns standby |
| `took_over` | Backup replaced another worker |

### 7.8 Applicant Import Row Status

Recommended enum:

| Value | Meaning |
|---|---|
| `pending_review` | Valid row awaiting HR decision |
| `error` | Invalid row needs fix |
| `accepted` | Created person |
| `merged` | Merged into existing person |
| `rejected` | Rejected row/applicant |
| `deferred` | Left for later review |

### 7.9 Payment Batch Status

Recommended enum:

| Value | Meaning |
|---|---|
| `draft` | Batch created |
| `in_review` | Finance review started |
| `reviewed` | Finance completed review |
| `approved` | Owner/Admin approved |
| `rejected` | Returned for correction |
| `exported` | Export completed |

---

## 8. Validation Rules

| Area | Validation |
|---|---|
| Tenant | Slug unique; timezone valid |
| User | Email unique per tenant; role valid; inactive blocks login |
| Person | Full name required; duplicate phone warning; blacklisting restricted |
| Applicant import | Name + phone recommended required; raw row retained; row id/hash idempotent |
| Event | End date must not be before start date |
| Job role | Name unique per tenant |
| Event role | Unique event/job role; counts non-negative |
| Budget item | Unit rate >= 0; days > 0; quantity > 0; money numeric |
| Late tiers | No overlaps; min/max valid; deduction non-negative |
| Assignment | Unique event/person; valid stage; agreed wage audited |
| Contract | One contract per assignment; status transitions valid |
| Attendance | Unique assignment/date; late minutes non-negative; late status requires minutes |
| Backup | Took-over should reference covered assignment where possible |
| Payment line | One per attendance; net >= 0; breakdown stored |
| Payment batch | Approval only Owner/Admin; reviewed by Finance; export gated |
| Message | `wa_message_id` unique when present |
| File | MIME/size restrictions; sensitive files private |
| Audit | Critical actions logged; no normal edit/delete |

---

## 9. Access Rules

| Data | Owner/Admin | HR | Coordinator | Supervisor | Finance | Viewer |
|---|---|---|---|---|---|---|
| Users/settings | Full | No | No | No | No | No |
| Person profile | Full | Full | Limited | Assigned roster only | Limited | Limited/read-only |
| Photos/CVs | Full | Full | Limited/TBD | No | No default | No default |
| Applicant import rows | Full | Full | No | No | No | No |
| Clients | Full | Limited | Full/limited | Event context only | Limited | Read-only limited |
| Events | Full | Limited | Full ops | Assigned only | Financial/read-only | Read-only |
| Budgets/wages | Full | No | No/TBD | No | View | No default |
| Assignments | Full | Limited | Full ops | Assigned roster only | No/TBD | Read-only limited |
| Contracts | Full | Full | Status only/TBD | No | Dispute-only/TBD | No |
| Attendance | Full | No/TBD | View/TBD | Assigned write | View | Read-only limited |
| Payment lines | Full | No | No/TBD | No | Full review/export | No default |
| Audit logs | Full | Limited/TBD | No | No | Payment-related/TBD | No |

Server-side enforcement required. UI hiding is not enough.

---

## 10. Audit Log Requirements

Audit log must capture:

- actor;
- tenant;
- entity type and ID;
- action;
- timestamp;
- before/after data where safe;
- reason where required;
- request/correlation ID where available.

Required audited actions:

| Area | Actions |
|---|---|
| Users/RBAC | create/update/deactivate, role changes |
| Person status | deactivate, blacklist, sensitive field edits |
| Applicant import | accept, merge, reject imported rows |
| Event budget | create/update/delete billable/cost lines |
| Wage rules | agreed wage, backup standby rate, penalty tiers |
| Assignment | stage changes, final roster approval |
| Contracts | send/sign/decline/expire/manual upload |
| Attendance | create/edit/reopen after lock |
| Payment | recalculation, manual adjustment, review, approval, export |
| Files | upload/delete/sensitive access TBD |

Audit logs should not be editable/deletable by normal users.

---

## 11. Database Index Requirements

Required index focus:

| Table | Index Need |
|---|---|
| `persons` | tenant/status, tenant/city, tenant/gender, tenant/type, phone, rating caches |
| `users` | tenant/email unique |
| `events` | tenant/status, client |
| `event_roles` | event, event/job_role unique |
| `event_assignments` | event, person, tenant/stage, event/person unique |
| `attendance_records` | assignment/date unique, tenant/work_date |
| `payment_lines` | attendance unique |
| `payment_batches` | tenant/event/status |
| `applicant_import_rows` | tenant/status, source_hash, matched_person_id |
| `messages` | wa_message_id unique, tenant/person, related entity |
| `audit_logs` | tenant/entity, actor, action, created_at |
| `files` | tenant/owner entity, file_kind |

Performance target: common staff filters under 2 seconds for 10,000 profiles.

---

## 12. Database Design Notes

### 12.1 Strong starting decisions

- One `persons` table for temp and permanent staff.
- `event_assignments` as convergence spine.
- Split `job_roles` from app `user_role`.
- Two-sided budget lines for billable/cost.
- Payment line per attendance record.
- `tenant_id` everywhere for tenant-owned data.

### 12.2 Required before implementation

- Update user roles.
- Add import staging tables.
- Add audit logs.
- Add payment batch/review/approval model.
- Add event supervisor assignment table.
- Add file metadata table.
- Add shift type lookup.
- Add tenant settings.

### 12.3 Future migrations

- Replace fixed role enum with custom RBAC tables when needed.
- Activate PostgreSQL RLS before second tenant.
- Add client portal tables if client login enters scope.
- Add payment disbursement/WPS tables if payouts enter scope.
- Add accounting export tables if integration enters scope.

---

## 13. Recommended Schema Additions Summary

```sql
-- Role enum update
alter type user_role add value if not exists 'supervisor';
alter type user_role add value if not exists 'finance';

-- New MVP tables recommended:
-- tenant_settings
-- shift_types
-- applicant_import_runs
-- applicant_import_rows
-- event_supervisors
-- payment_batches
-- payment_batch_lines
-- files
-- audit_logs
-- export_runs
```

Note: actual migration syntax/order must be handled by migration tooling, not direct production edits.

---

## 14. Traceability

| Data Entity | Related Use Cases | Related FRs |
|---|---|---|
| Applicant Import Run/Row | UC-001, UC-002 | FR-009 to FR-013 |
| Person | UC-002, UC-003, UC-011 | FR-014 to FR-018 |
| Staff Group | UC-012 | FR-021, FR-022 |
| Event | UC-007 | FR-030, FR-031 |
| Event Role | UC-008 | FR-032 to FR-034 |
| Budget Item | UC-009, UC-027 | FR-035 to FR-037 |
| Late Penalty Tier | UC-010 | FR-038, FR-064 |
| Event Assignment | UC-013 to UC-018 | FR-039 to FR-043 |
| Message Template/Message | UC-014, UC-015, UC-030 | FR-044 to FR-048 |
| Contract/File | UC-016, UC-017 | FR-049 to FR-053, FR-078 to FR-080 |
| Attendance Record | UC-020, UC-021 | FR-055 to FR-059 |
| Payment Line/Batch | UC-023 to UC-026 | FR-062 to FR-071 |
| Audit Log | Cross-cutting | FR-081 to FR-084 |

---

## 15. Open Questions

| ID | Question |
|---|---|
| OQ-001 | Exact Google Form fields and required mapping? |
| OQ-002 | Exact source row identity strategy from Google Sheets: row number, timestamp, response ID, or hash? |
| OQ-003 | Should person phone be unique per tenant or duplicate-allowed with warning? |
| OQ-004 | Can one person hold multiple event roles in same event? Current schema says no. |
| OQ-005 | Exact shift taxonomy: 6hr, 10hr, custom, tenant-configurable? |
| OQ-006 | Exact score scales and criteria for interview/event-day ratings? |
| OQ-007 | Should notes support sensitivity/visibility levels in MVP? |
| OQ-008 | Exact payment batch lifecycle and correction workflow after approval/export? |
| OQ-009 | Exact export file retention rules? |
| OQ-010 | Exact legal retention periods for applicants, CVs, photos, contracts, payment records, audit logs? |
