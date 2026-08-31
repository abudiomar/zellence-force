# Functional Requirements Specification

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Draft v0.1  
**Source inputs:** BRD, Stakeholder/User Role Analysis, Use Cases, `SYSTEM_ARCHITECTURE.md`, `database.js`, approved Phase 4 recommendations  
**Date:** 2026-06-10

---

## 1. Purpose

This document defines MVP functional requirements for Zell-force. Requirements are organized by module and written in "system shall" format so they can guide frontend, backend, database, QA, project planning, and AI coding agents.

Future requirements are listed separately and are not part of MVP unless explicitly moved into scope.

---

## 2. Requirement Format

Each requirement includes:

- requirement ID;
- title;
- description;
- user role;
- priority;
- input;
- output;
- business rule;
- acceptance criteria;
- dependencies;
- MVP/future status.

Priority values:

- **High** = required for pilot MVP.
- **Medium** = important but can be simplified if timeline pressure exists.
- **Low** = future or optional enhancement.

---

## 3. Module 1: Authentication and User Management

### FR-001: The system shall allow authorized internal users to log in.

| Field | Detail |
|---|---|
| User role | Owner, Admin, HR, Coordinator, Supervisor, Finance, Viewer |
| Priority | High |
| Input | Email, password |
| Output | Authenticated session/token |
| Business rule | Workers do not log into admin app in MVP. |
| Acceptance criteria | Valid active user can log in; inactive user cannot log in; invalid credentials show safe error; session expires according to security settings. |
| Dependencies | users table, password hashing, auth middleware |
| Status | MVP |

### FR-002: The system shall allow Owner/Admin to create internal users.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | High |
| Input | Full name, email, role, active status, optional linked person |
| Output | User account record |
| Business rule | User email must be unique per tenant. |
| Acceptance criteria | Owner/Admin can create user; duplicate tenant email blocked; role must be valid MVP role. |
| Dependencies | users, persons |
| Status | MVP |

### FR-003: The system shall allow Owner/Admin to activate or deactivate users.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | Medium |
| Input | User ID, active/inactive state |
| Output | Updated user status |
| Business rule | Deactivated users cannot log in. |
| Acceptance criteria | Deactivated user sessions are invalidated or blocked on next request; action is audit logged. |
| Dependencies | users, audit log |
| Status | MVP |

### FR-004: The system shall support linking a login user to a person record.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | Medium |
| Input | User ID, person ID |
| Output | User linked to person |
| Business rule | Permanent staff, owner, or supervisor may also exist as workforce person records. |
| Acceptance criteria | User may be linked/unlinked; deleting person does not delete user; user access follows role, not person type. |
| Dependencies | users.person_id, persons |
| Status | MVP |

---

## 4. Module 2: Role-Based Access Control

### FR-005: The system shall enforce fixed MVP roles.

| Field | Detail |
|---|---|
| User role | All internal users |
| Priority | High |
| Input | User role |
| Output | Allowed/denied app access |
| Business rule | MVP roles are owner, admin, hr, coordinator, supervisor, finance, viewer. |
| Acceptance criteria | Each route/action checks role; unauthorized access returns access denied; role enum includes supervisor and finance. |
| Dependencies | users.role, authorization middleware |
| Status | MVP |

### FR-006: The system shall allow Owner/Admin override for operational and finance actions.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | High |
| Input | Action request |
| Output | Action permitted when valid |
| Business rule | Owner/Admin can perform Finance actions initially. |
| Acceptance criteria | Owner/Admin can review/approve/export payments; Finance cannot perform Owner-only settings actions. |
| Dependencies | RBAC policy map |
| Status | MVP |

### FR-007: The system shall restrict Supervisor access to assigned events.

| Field | Detail |
|---|---|
| User role | Supervisor |
| Priority | High |
| Input | Supervisor user ID, event ID |
| Output | Allowed/denied assigned event access |
| Business rule | Supervisor must not access unrelated events, budgets, margins, or payment details. |
| Acceptance criteria | Supervisor sees assigned event roster only; unrelated event URL/API request is denied. |
| Dependencies | event assignment/supervisor assignment model TBD |
| Status | MVP |

### FR-008: The system shall restrict sensitive staff files and payment data by role.

| Field | Detail |
|---|---|
| User role | All internal users |
| Priority | High |
| Input | File/payment data request |
| Output | Allowed/denied response |
| Business rule | Photos/CVs/contracts/payment amounts are sensitive. |
| Acceptance criteria | Finance sees payment data but not photos/CVs by default; Viewer sees no sensitive files/pay by default; HR sees candidate files. |
| Dependencies | RBAC policy map, file metadata |
| Status | MVP |

---

## 5. Module 3: Google Form / Sheet Applicant Import

### FR-009: The system shall support importing applicant rows from Google Sheets.

| Field | Detail |
|---|---|
| User role | HR, Admin |
| Priority | High |
| Input | Google Sheet ID/range, integration credentials, field mapping |
| Output | Applicant import records |
| Business rule | Existing Google Form intake remains active; Zell-force imports from linked Sheet/API. |
| Acceptance criteria | User can trigger manual sync; system reads rows; imported rows appear in review queue; import result shows created, skipped, failed counts. |
| Dependencies | Google Sheets API, import mapping config |
| Status | MVP |

### FR-010: The system shall support scheduled applicant import.

| Field | Detail |
|---|---|
| User role | Admin |
| Priority | Medium |
| Input | Sync schedule setting |
| Output | Automated import run |
| Business rule | Near-real-time Pub/Sub/Form watches are future unless required. |
| Acceptance criteria | Scheduled sync runs without manual action; failures are logged; repeated sync does not duplicate records. |
| Dependencies | background job scheduler, Google Sheets API |
| Status | MVP |

### FR-011: The system shall validate required applicant import fields.

| Field | Detail |
|---|---|
| User role | HR |
| Priority | High |
| Input | Imported row |
| Output | Valid review item or import error |
| Business rule | Missing required fields must not create dirty person profiles. |
| Acceptance criteria | Missing name or phone creates error item; HR can view error reason; valid rows proceed to review queue. |
| Dependencies | import mapping config |
| Status | MVP |

### FR-012: The system shall detect possible duplicate applicants by phone first.

| Field | Detail |
|---|---|
| User role | HR |
| Priority | High |
| Input | Imported phone/email/name |
| Output | Duplicate match suggestions |
| Business rule | Phone is primary identity signal for WhatsApp workforce. |
| Acceptance criteria | Matching phone suggests existing person; HR can merge, create new, or defer. |
| Dependencies | persons.phone index |
| Status | MVP |

### FR-013: The system shall provide an applicant review queue.

| Field | Detail |
|---|---|
| User role | HR |
| Priority | High |
| Input | Imported applicant record |
| Output | Create person, merge, reject, defer |
| Business rule | Imported rows must be reviewed before becoming active staff/person records. |
| Acceptance criteria | HR can filter queue by status; each item has decision history; accepted applicant creates or updates person record. |
| Dependencies | import staging model TBD, persons |
| Status | MVP |

---

## 6. Module 4: Staff Profiles

### FR-014: The system shall allow creating and editing person profiles.

| Field | Detail |
|---|---|
| User role | Owner, Admin, HR |
| Priority | High |
| Input | Name, phone, email, city, gender, birth date, type, status, photo, CV, skills |
| Output | Person record |
| Business rule | Temps and permanent staff share one persons table with person_type. |
| Acceptance criteria | Required fields enforced; duplicate phone warning shown; profile updates audit logged for sensitive fields. |
| Dependencies | persons, skills, files |
| Status | MVP |

### FR-015: The system shall classify persons as temp or permanent.

| Field | Detail |
|---|---|
| User role | Admin, HR |
| Priority | High |
| Input | person_type |
| Output | Person classification |
| Business rule | Permanent staff can follow same pipeline as temps. |
| Acceptance criteria | Profile shows type; filters can include/exclude temp/permanent; assignment rules work for both. |
| Dependencies | persons.person_type |
| Status | MVP |

### FR-016: The system shall manage person status.

| Field | Detail |
|---|---|
| User role | Owner, Admin, HR limited |
| Priority | High |
| Input | Status: pool, maybe_roster, active, inactive, blacklisted |
| Output | Updated person status |
| Business rule | Blacklisting is Owner/Admin only. |
| Acceptance criteria | HR cannot blacklist unless allowed; blacklisted persons are excluded from normal assignment search; status change reason stored for sensitive statuses. |
| Dependencies | persons.status, audit log |
| Status | MVP |

### FR-017: The system shall support staff search and filtering.

| Field | Detail |
|---|---|
| User role | Admin, HR, Coordinator |
| Priority | High |
| Input | Filters: city, gender, type, status, skills, ratings, text search |
| Output | Filtered person list |
| Business rule | Filtering must support hundreds to thousands of profiles quickly. |
| Acceptance criteria | Common filters respond under performance target; list supports pagination; filters can be combined. |
| Dependencies | persons indexes, skills, rating caches |
| Status | MVP |

### FR-018: The system shall show dual rating summaries on person profiles.

| Field | Detail |
|---|---|
| User role | Admin, HR, Coordinator limited |
| Priority | Medium |
| Input | Interview and event-day rating data |
| Output | Separate interview and event rating averages |
| Business rule | Interview ratings and event-day ratings must remain distinct. |
| Acceptance criteria | Profile displays both averages separately; filtering can use either rating. |
| Dependencies | interviews, event_day_ratings, persons rating caches |
| Status | MVP |

---

## 7. Module 5: Skills and Staff Groups

### FR-019: The system shall allow Admin/HR to manage skills.

| Field | Detail |
|---|---|
| User role | Admin, HR |
| Priority | Medium |
| Input | Skill name |
| Output | Skill record |
| Business rule | Skills are tenant-specific. |
| Acceptance criteria | Duplicate skill name per tenant blocked; inactive/delete behavior TBD. |
| Dependencies | skills, person_skills |
| Status | MVP |

### FR-020: The system shall allow assigning skills to persons.

| Field | Detail |
|---|---|
| User role | Admin, HR |
| Priority | Medium |
| Input | Person ID, skill IDs |
| Output | Person skills updated |
| Business rule | Skills support filtering and matching. |
| Acceptance criteria | User can add/remove skills; changes appear in filters. |
| Dependencies | person_skills |
| Status | MVP |

### FR-021: The system shall allow creating manual staff groups.

| Field | Detail |
|---|---|
| User role | Coordinator, HR, Admin |
| Priority | High |
| Input | Group name, description, selected persons |
| Output | Staff group |
| Business rule | Groups support saved rosters/batches. |
| Acceptance criteria | User can create group from selected staff; duplicate members not allowed; group usable for bulk assignment/message. |
| Dependencies | staff_groups, staff_group_members |
| Status | MVP |

### FR-022: The system shall allow creating smart staff groups.

| Field | Detail |
|---|---|
| User role | Coordinator, Admin |
| Priority | Medium |
| Input | Group criteria JSON/filter set |
| Output | Smart group |
| Business rule | Smart groups can refresh based on changing pool data. |
| Acceptance criteria | User can save filter criteria; opening group shows current matching staff; criteria validation prevents broken groups. |
| Dependencies | staff_groups.criteria, staff filtering |
| Status | MVP |

---

## 8. Module 6: Recruitment and Screening

### FR-023: The system shall support candidate screening decisions.

| Field | Detail |
|---|---|
| User role | HR |
| Priority | High |
| Input | Candidate, screening decision, notes |
| Output | Updated status/stage/notes |
| Business rule | Screening can route candidate to active pool, maybe roster, reject/inactive, or event interview. |
| Acceptance criteria | HR can record decision; notes saved; decision visible in candidate history. |
| Dependencies | persons, notes, event_assignments |
| Status | MVP |

### FR-024: The system shall support event-specific candidate pipeline stages.

| Field | Detail |
|---|---|
| User role | HR, Coordinator |
| Priority | High |
| Input | Assignment stage |
| Output | Updated event assignment |
| Business rule | event_assignments is pipeline spine for pool and recruitment paths. |
| Acceptance criteria | Stage values include candidate, screening, interview, offered, accepted, declined, rejected, confirmed, withdrawn; stage change logged. |
| Dependencies | event_assignments.stage |
| Status | MVP |

### FR-025: The system shall store screening and candidate notes.

| Field | Detail |
|---|---|
| User role | HR, Admin |
| Priority | Medium |
| Input | Note body, entity type, entity ID |
| Output | Note record |
| Business rule | Notes may require visibility controls in future. |
| Acceptance criteria | Notes appear on person/event/assignment as relevant; author and timestamp stored. |
| Dependencies | notes |
| Status | MVP |

---

## 9. Module 7: Interviews and Scoring

### FR-026: The system shall allow scheduling interviews.

| Field | Detail |
|---|---|
| User role | HR |
| Priority | Medium |
| Input | Person, event optional, interviewer, scheduled date/time |
| Output | Interview record |
| Business rule | WhatsApp reminder can be sent if consent and template exist. |
| Acceptance criteria | Interview can be scheduled, rescheduled, cancelled; status updates visible. |
| Dependencies | interviews, users, persons, events |
| Status | MVP |

### FR-027: The system shall allow recording interview scores by criterion.

| Field | Detail |
|---|---|
| User role | HR |
| Priority | High |
| Input | Criterion, score, notes |
| Output | Interview score records and overall score |
| Business rule | Event may define minimum interview score gate. |
| Acceptance criteria | Score validation enforced; overall score displayed; person interview rating average updates. |
| Dependencies | interviews, interview_scores, persons.rating_interview_avg |
| Status | MVP |

### FR-028: The system shall enforce or warn on event minimum interview score.

| Field | Detail |
|---|---|
| User role | HR, Coordinator |
| Priority | Medium |
| Input | Event min score, candidate score |
| Output | Pass/fail warning/gate |
| Business rule | Minimum score gate can prevent unqualified event assignment unless overridden. |
| Acceptance criteria | Candidate below threshold is flagged; override requires Owner/Admin or Admin-level permission. |
| Dependencies | events.min_interview_score, interviews.overall_score |
| Status | MVP |

---

## 10. Module 8: Clients

### FR-029: The system shall allow managing client records.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | Medium |
| Input | Client name, contact name, phone, email, notes |
| Output | Client record |
| Business rule | Client logins are future, not MVP. |
| Acceptance criteria | Client can be created/edited; duplicate warning by name; events can be linked to client. |
| Dependencies | clients, events |
| Status | MVP |

---

## 11. Module 9: Events

### FR-030: The system shall allow creating and editing events.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Coordinator |
| Priority | High |
| Input | Event name, client, city, location, dates, status, budget header, VAT, payment terms, notes |
| Output | Event record |
| Business rule | Event status lifecycle: draft, recruiting, staffed, active, completed, cancelled. |
| Acceptance criteria | Required fields validated; date range validated; event appears in dashboards/lists. |
| Dependencies | events, clients |
| Status | MVP |

### FR-031: The system shall show event operational status.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Coordinator, Viewer limited |
| Priority | High |
| Input | Event data, roles, assignments, contracts |
| Output | Event status dashboard |
| Business rule | Event status should reflect staffing progress. |
| Acceptance criteria | Dashboard shows role requirements, confirmed count, pending count, contract status, attendance status when active. |
| Dependencies | events, event_roles, event_assignments, contracts |
| Status | MVP |

---

## 12. Module 10: Event Roles and Headcount

### FR-032: The system shall allow managing tenant job roles.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | Medium |
| Input | Role name, description, active/default status |
| Output | Job role |
| Business rule | Job roles are staffing roles, not app permission roles. |
| Acceptance criteria | Tenant can create custom roles; duplicate names blocked per tenant; inactive roles excluded from new event setup. |
| Dependencies | job_roles |
| Status | MVP |

### FR-033: The system shall allow configuring event role headcount.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Coordinator |
| Priority | High |
| Input | Event, job role, required headcount, backup count |
| Output | Event role record |
| Business rule | Each event/job role combination should be unique. |
| Acceptance criteria | Role requirements save correctly; dashboard shows required vs confirmed; duplicate event role blocked/merged. |
| Dependencies | event_roles, job_roles |
| Status | MVP |

### FR-034: The system shall allow setting backup standby rate per event role.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | High |
| Input | Backup standby rate |
| Output | Event role backup rate |
| Business rule | Backup standby pay differs from active takeover pay. |
| Acceptance criteria | Backup standby rate used by payment calculation when backup_outcome = standby. |
| Dependencies | event_roles.backup_standby_rate, payment engine |
| Status | MVP |

---

## 13. Module 11: Budget and Wage Rules

### FR-035: The system shall allow creating billable budget lines.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | High |
| Input | Event, category, role optional, shift type, unit rate, days, quantity, notes |
| Output | Billable budget item |
| Business rule | Billable side represents client charge/income. |
| Acceptance criteria | Planned amount auto-calculates; values use decimal precision; summary updates. |
| Dependencies | event_budget_items |
| Status | MVP |

### FR-036: The system shall allow creating cost budget lines.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | High |
| Input | Event, category, role optional, shift type, unit rate, days, quantity, notes |
| Output | Cost budget item |
| Business rule | Cost side represents staff/vendor/operational cost. |
| Acceptance criteria | Planned amount auto-calculates; staff cost lines can be matched by role + shift type; summary updates. |
| Dependencies | event_budget_items |
| Status | MVP |

### FR-037: The system shall calculate event budget summary.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Finance |
| Priority | High |
| Input | Event budget lines, actual cost values |
| Output | Total planned in, planned out, actual out, projected income, actual income |
| Business rule | Margin visibility is core business value. |
| Acceptance criteria | Summary matches budget item values; updates after budget changes and payment actuals. |
| Dependencies | event_budget_summary view |
| Status | MVP |

### FR-038: The system shall allow configuring lateness penalty tiers.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | High |
| Input | Event, min minutes, max minutes, deduction kind, deduction value |
| Output | Penalty tier |
| Business rule | Tiers are event-specific in MVP unless global defaults added later. |
| Acceptance criteria | No overlapping ranges; fixed/percent supported; payment calculator applies correct tier. |
| Dependencies | late_penalty_tiers, payment engine |
| Status | MVP |

---

## 14. Module 12: Assignment Pipeline

### FR-039: The system shall allow assigning persons to event roles.

| Field | Detail |
|---|---|
| User role | Coordinator, Admin |
| Priority | High |
| Input | Event, person, job role, source, backup flag, agreed wage optional |
| Output | Event assignment |
| Business rule | A person can have only one assignment per event in current model. |
| Acceptance criteria | Duplicate event/person assignment blocked; assignment stage starts correctly; roster count updates. |
| Dependencies | event_assignments |
| Status | MVP |

### FR-040: The system shall track assignment source.

| Field | Detail |
|---|---|
| User role | HR, Coordinator |
| Priority | Medium |
| Input | Source: pool or recruitment |
| Output | Assignment source |
| Business rule | Pool and recruitment paths converge in event_assignments. |
| Acceptance criteria | Assignment shows source; reports can filter by source. |
| Dependencies | event_assignments.source |
| Status | MVP |

### FR-041: The system shall track assignment stage changes.

| Field | Detail |
|---|---|
| User role | HR, Coordinator, Admin |
| Priority | High |
| Input | Stage change |
| Output | Updated assignment stage |
| Business rule | Stage drives workflow from candidate to confirmed/withdrawn. |
| Acceptance criteria | Valid stage changes saved; timestamp/actor logged; dashboard updates counts. |
| Dependencies | event_assignments.stage, audit log |
| Status | MVP |

### FR-042: The system shall allow Owner/Admin to set agreed wage on assignment.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | Medium |
| Input | Agreed wage |
| Output | Assignment agreed wage |
| Business rule | Agreed wage overrides budget cost rate for payment calculation. |
| Acceptance criteria | Wage change requires permission; reason/audit log required; payment recalculation uses agreed wage. |
| Dependencies | event_assignments.agreed_wage, audit log, payment engine |
| Status | MVP |

### FR-043: The system shall support final roster approval.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Coordinator |
| Priority | High |
| Input | Event roster approval action |
| Output | Roster approved state/event staffed state |
| Business rule | Roster should be confirmed before field operations. |
| Acceptance criteria | System shows understaffed warnings; approval records approver/time; event status can become staffed. |
| Dependencies | events, event_assignments, audit log |
| Status | MVP |

---

## 15. Module 13: WhatsApp Messaging

### FR-044: The system shall store WhatsApp message templates.

| Field | Detail |
|---|---|
| User role | Admin |
| Priority | Medium |
| Input | Template name, category, language, body, Meta template name, status |
| Output | Message template record |
| Business rule | Utility templates are preferred for MVP messages. |
| Acceptance criteria | Admin can create/edit templates; unapproved production templates are blocked or warned. |
| Dependencies | message_templates |
| Status | MVP |

### FR-045: The system shall send event invitations through WhatsApp.

| Field | Detail |
|---|---|
| User role | Coordinator, Admin |
| Priority | High |
| Input | Assignments, approved template |
| Output | Outbound WhatsApp messages |
| Business rule | Worker must have phone and WhatsApp consent. |
| Acceptance criteria | Bulk send supports selected assignments; failed sends logged; assignment invited_at set. |
| Dependencies | Meta WhatsApp Cloud API, messages, consents |
| Status | MVP |

### FR-046: The system shall process WhatsApp confirm/decline responses.

| Field | Detail |
|---|---|
| User role | Worker, System |
| Priority | High |
| Input | WhatsApp webhook payload |
| Output | Assignment response update |
| Business rule | Webhooks must be idempotent by WhatsApp message ID. |
| Acceptance criteria | Confirm marks assignment accepted/confirmed according workflow; decline marks declined; duplicate webhook ignored. |
| Dependencies | webhook endpoint, messages.wa_message_id, event_assignments |
| Status | MVP |

### FR-047: The system shall send interview, contract, and shift reminders.

| Field | Detail |
|---|---|
| User role | HR, Coordinator, System |
| Priority | Medium |
| Input | Scheduled reminder rules, templates |
| Output | WhatsApp reminder messages |
| Business rule | MVP reminder types: interview reminder, event invitation, availability confirm/decline, contract reminder, shift reminder. |
| Acceptance criteria | User can send or schedule reminders; message status visible; failures logged. |
| Dependencies | background jobs, message_templates, messages |
| Status | MVP |

### FR-048: The system shall log inbound and outbound WhatsApp messages.

| Field | Detail |
|---|---|
| User role | Admin, HR, Coordinator |
| Priority | High |
| Input | Message payload/status |
| Output | Message log |
| Business rule | Message log supports operational traceability. |
| Acceptance criteria | Logs include direction, status, person, related entity, payload/error, timestamps. |
| Dependencies | messages |
| Status | MVP |

---

## 16. Module 14: Contracts

### FR-049: The system shall create contract records for event assignments.

| Field | Detail |
|---|---|
| User role | HR, Admin |
| Priority | High |
| Input | Event assignment, deadline, file/template TBD |
| Output | Contract record |
| Business rule | One contract per event assignment in current model. |
| Acceptance criteria | Duplicate contract for assignment blocked; status starts draft/sent; contract linked to assignment. |
| Dependencies | contracts, event_assignments |
| Status | MVP |

### FR-050: The system shall send contract instructions or links through WhatsApp.

| Field | Detail |
|---|---|
| User role | HR, Admin |
| Priority | High |
| Input | Contract, worker phone/consent, template |
| Output | WhatsApp contract message |
| Business rule | Workers use WhatsApp/token link; no worker app login. |
| Acceptance criteria | Contract status changes to sent; sent_at recorded; failure logged. |
| Dependencies | contracts, messages, token link service |
| Status | MVP |

### FR-051: The system shall receive signed contract PDFs from WhatsApp.

| Field | Detail |
|---|---|
| User role | Worker, System |
| Priority | High |
| Input | Inbound WhatsApp media webhook |
| Output | Stored file and signed contract status |
| Business rule | Media URLs expire quickly; fetch and store immediately. |
| Acceptance criteria | PDF downloaded to object storage; contract file_url set; signed_at set; duplicates ignored. |
| Dependencies | Meta WhatsApp Cloud API, object storage, contracts |
| Status | MVP |

### FR-052: The system shall allow manual signed contract upload.

| Field | Detail |
|---|---|
| User role | HR, Admin |
| Priority | High |
| Input | Contract PDF upload |
| Output | Stored file and contract status update |
| Business rule | Manual upload is fallback when WhatsApp import fails. |
| Acceptance criteria | User uploads PDF; status becomes signed if selected; ingestion_method = manual; action logged. |
| Dependencies | object storage, contracts |
| Status | MVP |

### FR-053: The system shall track contract statuses.

| Field | Detail |
|---|---|
| User role | HR, Coordinator, Admin |
| Priority | High |
| Input | Contract status action/webhook |
| Output | draft, sent, signed, declined, expired |
| Business rule | Roster readiness depends on contract status. |
| Acceptance criteria | Contract dashboard filters by status; expired contracts detected by deadline; assignment view shows contract state. |
| Dependencies | contracts |
| Status | MVP |

---

## 17. Module 15: Supervisor Attendance

### FR-054: The system shall show assigned event roster to Supervisor.

| Field | Detail |
|---|---|
| User role | Supervisor |
| Priority | High |
| Input | Supervisor user, event/date |
| Output | Assigned event roster |
| Business rule | Supervisor access is assigned events only. |
| Acceptance criteria | Mobile-friendly roster shows names, roles, phone, backup flag, current attendance state; unrelated events denied. |
| Dependencies | event supervisor assignment TBD, event_assignments |
| Status | MVP |

### FR-055: The system shall allow Supervisor to record attendance.

| Field | Detail |
|---|---|
| User role | Supervisor |
| Priority | High |
| Input | Assignment, work date, status, shift type, notes |
| Output | Attendance record |
| Business rule | One attendance record per assignment per work date. |
| Acceptance criteria | Supervisor can mark present, absent, late, excused; duplicate date blocked/updates existing; recorded_by_user_id stored. |
| Dependencies | attendance_records |
| Status | MVP |

### FR-056: The system shall allow Supervisor to record lateness minutes.

| Field | Detail |
|---|---|
| User role | Supervisor |
| Priority | High |
| Input | Late minutes |
| Output | Attendance late_minutes and applied tier |
| Business rule | Lateness affects payment deduction. |
| Acceptance criteria | Late minutes cannot be negative; status late requires late_minutes > 0; matching tier shown if configured. |
| Dependencies | attendance_records, late_penalty_tiers |
| Status | MVP |

### FR-057: The system shall lock attendance edits after Finance review starts.

| Field | Detail |
|---|---|
| User role | Supervisor, Admin |
| Priority | High |
| Input | Attendance edit request |
| Output | Allowed/blocked edit |
| Business rule | Supervisor can edit same day; locked after Finance review starts; Admin can reopen with reason. |
| Acceptance criteria | Locked attendance cannot be edited by Supervisor; Admin reopen requires reason and audit log. |
| Dependencies | payment review state TBD, audit log |
| Status | MVP |

---

## 18. Module 16: Backup Handling

### FR-058: The system shall allow marking assigned staff as backup.

| Field | Detail |
|---|---|
| User role | Coordinator, Admin |
| Priority | High |
| Input | Assignment backup flag |
| Output | Backup assignment |
| Business rule | Backup status affects attendance and payment. |
| Acceptance criteria | Roster distinguishes backup from active staff; backup count visible per role. |
| Dependencies | event_assignments.is_backup |
| Status | MVP |

### FR-059: The system shall allow recording backup outcome.

| Field | Detail |
|---|---|
| User role | Supervisor |
| Priority | High |
| Input | standby, took_over, not_applicable, covered assignment optional |
| Output | Attendance backup outcome |
| Business rule | Standby gets standby rate; takeover gets active rate. |
| Acceptance criteria | Supervisor can select backup outcome; took_over can link covered assignment; payment uses correct rule. |
| Dependencies | attendance_records.backup_outcome, covered_assignment_id, payment engine |
| Status | MVP |

---

## 19. Module 17: Ratings

### FR-060: The system shall allow event-day ratings.

| Field | Detail |
|---|---|
| User role | Supervisor, Admin |
| Priority | Medium |
| Input | Person, event, assignment, score, comments, work date |
| Output | Event-day rating |
| Business rule | Event-day ratings are separate from interview ratings. |
| Acceptance criteria | Score validation enforced; rating visible in person history; rating average updates. |
| Dependencies | event_day_ratings, persons.rating_event_avg |
| Status | MVP |

### FR-061: The system shall show rating history for a person.

| Field | Detail |
|---|---|
| User role | Admin, HR, Coordinator limited |
| Priority | Medium |
| Input | Person ID |
| Output | Interview and event rating history |
| Business rule | Ratings support future staffing decisions. |
| Acceptance criteria | User can view rating entries by event/date/source; access follows role restrictions. |
| Dependencies | interviews, interview_scores, event_day_ratings |
| Status | MVP |

---

## 20. Module 18: Payment Calculation

### FR-062: The system shall calculate payment lines from attendance records.

| Field | Detail |
|---|---|
| User role | System |
| Priority | High |
| Input | Attendance record, assignment, event budget rates, lateness tiers, backup rules |
| Output | Payment line |
| Business rule | One attendance row resolves to one payment line. |
| Acceptance criteria | Each eligible attendance row creates/updates one payment line; calculation is repeatable/idempotent. |
| Dependencies | attendance_records, payment_lines, event_budget_items, late_penalty_tiers |
| Status | MVP |

### FR-063: The system shall resolve base pay according to attendance and assignment rules.

| Field | Detail |
|---|---|
| User role | System |
| Priority | High |
| Input | Attendance status, backup outcome, agreed wage, cost rate |
| Output | Base amount |
| Business rule | Absent/excused = 0; standby = standby rate; otherwise active rate = agreed_wage if set else cost-side role/shift rate. |
| Acceptance criteria | Unit tests cover absent, excused, standby, takeover, agreed wage override, cost rate fallback, missing rate. |
| Dependencies | payment engine |
| Status | MVP |

### FR-064: The system shall apply lateness deductions.

| Field | Detail |
|---|---|
| User role | System |
| Priority | High |
| Input | Late minutes, penalty tiers, base amount |
| Output | Late deduction |
| Business rule | Deduction can be fixed or percent and is capped at base amount. |
| Acceptance criteria | Correct tier selected; deduction never makes net negative; unit tests cover tier boundaries. |
| Dependencies | late_penalty_tiers, payment engine |
| Status | MVP |

### FR-065: The system shall support manual payment adjustments.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | Medium |
| Input | Adjustment amount, reason |
| Output | Updated payment line |
| Business rule | Manual adjustment requires reason and audit log. |
| Acceptance criteria | Owner/Admin can add adjustment; Finance can view reason; net recalculates; action logged. |
| Dependencies | payment_lines.other_adjustment, audit log |
| Status | MVP |

### FR-066: The system shall store payment calculation breakdown.

| Field | Detail |
|---|---|
| User role | Finance, Owner, Admin |
| Priority | High |
| Input | Calculation result |
| Output | JSON breakdown |
| Business rule | Breakdown supports audits and disputes. |
| Acceptance criteria | Breakdown includes rate source, base, late tier, deductions, adjustments, net, calculation timestamp. |
| Dependencies | payment_lines.breakdown |
| Status | MVP |

### FR-067: The system shall prevent negative net payments.

| Field | Detail |
|---|---|
| User role | System |
| Priority | High |
| Input | Base, deductions, adjustments |
| Output | Net amount >= 0 |
| Business rule | Net = max(0, base - deductions + adjustments). |
| Acceptance criteria | Unit tests prove net cannot be negative. |
| Dependencies | payment engine |
| Status | MVP |

---

## 21. Module 19: Payment Review and Export

### FR-068: The system shall show event payment list.

| Field | Detail |
|---|---|
| User role | Finance, Owner, Admin |
| Priority | High |
| Input | Event/pay cycle |
| Output | Payment list |
| Business rule | Finance reviews; Owner/Admin approves. |
| Acceptance criteria | List shows worker, role, date, attendance, base, deduction, adjustments, net, status/errors. |
| Dependencies | payment_lines, attendance_records, event_assignments |
| Status | MVP |

### FR-069: The system shall support Finance review state.

| Field | Detail |
|---|---|
| User role | Finance |
| Priority | Medium |
| Input | Review action, notes |
| Output | Reviewed/flagged payment state |
| Business rule | Attendance edits lock when Finance review starts. |
| Acceptance criteria | Finance can mark list reviewed or flag issues; reviewed state visible to Owner/Admin. |
| Dependencies | payment review model TBD |
| Status | MVP |

### FR-070: The system shall support payment approval.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | High |
| Input | Approval action |
| Output | Approved payment list |
| Business rule | Payment export requires approval for final export. |
| Acceptance criteria | Approval records actor/time; unresolved calculation errors block approval unless override; approval locks payment-relevant edits. |
| Dependencies | payment approval model TBD, audit log |
| Status | MVP |

### FR-071: The system shall export approved payment lists as CSV/XLSX.

| Field | Detail |
|---|---|
| User role | Finance, Owner, Admin |
| Priority | Medium |
| Input | Event/pay cycle, export format |
| Output | CSV/XLSX file |
| Business rule | Export does not disburse money. |
| Acceptance criteria | CSV/XLSX export downloads; export logged; draft export clearly labeled if allowed. |
| Dependencies | payment approval model, file generation |
| Status | MVP |

---

## 22. Module 20: Reports and Dashboards

### FR-072: The system shall provide role-specific dashboards.

| Field | Detail |
|---|---|
| User role | All internal roles |
| Priority | High |
| Input | User role and scoped data |
| Output | Relevant dashboard |
| Business rule | First screen should match user job. |
| Acceptance criteria | Owner sees business summary; HR sees recruitment queue; Coordinator sees staffing; Supervisor sees today's roster; Finance sees payment review; Viewer sees read-only. |
| Dependencies | RBAC, module data |
| Status | MVP |

### FR-073: The system shall provide event roster report.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Coordinator, Supervisor limited |
| Priority | High |
| Input | Event |
| Output | Roster report |
| Business rule | Supervisor view excludes budget/payment. |
| Acceptance criteria | Report shows role, worker, phone, contract status, confirmation status, backup flag. |
| Dependencies | event_assignments, persons, contracts |
| Status | MVP |

### FR-074: The system shall provide confirmed vs required headcount report.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Coordinator |
| Priority | High |
| Input | Event |
| Output | Staffing progress by role |
| Business rule | Helps approve roster and detect gaps. |
| Acceptance criteria | Each role shows required, confirmed, pending, backup counts; understaffed roles highlighted. |
| Dependencies | event_roles, event_assignments |
| Status | MVP |

### FR-075: The system shall provide attendance report.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Finance, Supervisor assigned limited |
| Priority | High |
| Input | Event/date range |
| Output | Attendance report |
| Business rule | Attendance report supports payment review. |
| Acceptance criteria | Shows present/late/absent/excused, late minutes, backup outcome, recorder, timestamp. |
| Dependencies | attendance_records |
| Status | MVP |

### FR-076: The system shall provide budget/profit summary report.

| Field | Detail |
|---|---|
| User role | Owner, Admin, Finance |
| Priority | High |
| Input | Event |
| Output | Financial summary |
| Business rule | Margin is sensitive and restricted. |
| Acceptance criteria | Shows planned in/out, actual out, projected income, actual income, category breakdown. |
| Dependencies | event_budget_summary |
| Status | MVP |

### FR-077: The system shall provide basic ratings report.

| Field | Detail |
|---|---|
| User role | Owner, Admin, HR, Coordinator limited |
| Priority | Medium |
| Input | Person/event/date filter |
| Output | Rating list/summary |
| Business rule | Ratings guide future staffing. |
| Acceptance criteria | User can see interview and event-day ratings separately; export optional/TBD. |
| Dependencies | interviews, event_day_ratings |
| Status | MVP |

---

## 23. Module 21: Files and Object Storage

### FR-078: The system shall upload and store CV files.

| Field | Detail |
|---|---|
| User role | HR, Admin |
| Priority | Medium |
| Input | CV file |
| Output | Stored file URL |
| Business rule | CV access restricted to allowed roles. |
| Acceptance criteria | User can upload supported file; URL saved on person; unauthorized roles cannot access file. |
| Dependencies | object storage, persons.cv_url |
| Status | MVP |

### FR-079: The system shall upload and store staff photos.

| Field | Detail |
|---|---|
| User role | HR, Admin |
| Priority | Medium |
| Input | Image file |
| Output | Stored photo URL |
| Business rule | Photos are sensitive personal data. |
| Acceptance criteria | User can upload supported image; URL saved on person; access restricted. |
| Dependencies | object storage, persons.photo_url |
| Status | MVP |

### FR-080: The system shall upload and store signed contracts.

| Field | Detail |
|---|---|
| User role | HR, Admin, System |
| Priority | High |
| Input | PDF file or WhatsApp media |
| Output | Stored contract file URL |
| Business rule | Signed contracts stored in KSA-region object storage where possible. |
| Acceptance criteria | Manual and WhatsApp-ingested files stored; contract file_url updated; file access restricted. |
| Dependencies | object storage, contracts.file_url |
| Status | MVP |

---

## 24. Module 22: Audit Logs

### FR-081: The system shall audit changes to budgets and wage rules.

| Field | Detail |
|---|---|
| User role | System |
| Priority | High |
| Input | Budget/wage edit action |
| Output | Audit log entry |
| Business rule | Budget/wage edits affect margin and payments. |
| Acceptance criteria | Audit log captures actor, timestamp, entity, before/after, reason if required. |
| Dependencies | audit log model TBD |
| Status | MVP |

### FR-082: The system shall audit attendance edits after initial submission.

| Field | Detail |
|---|---|
| User role | System |
| Priority | High |
| Input | Attendance edit |
| Output | Audit log entry |
| Business rule | Attendance affects payment. |
| Acceptance criteria | Changes record actor, before/after, timestamp, reason if locked/reopened. |
| Dependencies | audit log model TBD |
| Status | MVP |

### FR-083: The system shall audit payment recalculation and manual adjustments.

| Field | Detail |
|---|---|
| User role | System |
| Priority | High |
| Input | Recalculation/adjustment action |
| Output | Audit log entry |
| Business rule | Payment disputes require traceability. |
| Acceptance criteria | Recalculation time and actor/source recorded; manual adjustments require reason. |
| Dependencies | audit log model TBD, payment engine |
| Status | MVP |

### FR-084: The system shall audit roster approval and contract status changes.

| Field | Detail |
|---|---|
| User role | System |
| Priority | Medium |
| Input | Approval/status change |
| Output | Audit log entry |
| Business rule | Staffing commitments need traceability. |
| Acceptance criteria | Approver/status actor/time stored; old/new state captured. |
| Dependencies | audit log model TBD |
| Status | MVP |

---

## 25. Module 23: Settings and Localization

### FR-085: The system shall support Arabic-first RTL UI.

| Field | Detail |
|---|---|
| User role | All users |
| Priority | High |
| Input | Language/direction setting |
| Output | RTL Arabic UI |
| Business rule | Arabic-first, not translated-last. |
| Acceptance criteria | Main layouts render RTL; forms/tables/navigation support Arabic labels; no critical LTR-only layouts. |
| Dependencies | frontend i18n/RTL setup |
| Status | MVP |

### FR-086: The system shall support English UI fallback.

| Field | Detail |
|---|---|
| User role | All users |
| Priority | Medium |
| Input | Language selection |
| Output | English UI |
| Business rule | System is bilingual Arabic/English. |
| Acceptance criteria | User can switch language or app can be configured; missing translation falls back safely. |
| Dependencies | i18n files |
| Status | MVP |

### FR-087: The system shall support Hijri date display option.

| Field | Detail |
|---|---|
| User role | All internal users |
| Priority | Medium |
| Input | Date display preference |
| Output | Gregorian/Hijri display |
| Business rule | Hijri option required by source architecture. |
| Acceptance criteria | Key event dates can show Hijri alongside Gregorian or by preference; stored dates remain stable. |
| Dependencies | date library/localization |
| Status | MVP |

### FR-088: The system shall store tenant-level settings.

| Field | Detail |
|---|---|
| User role | Owner, Admin |
| Priority | Medium |
| Input | Tenant config |
| Output | Settings applied |
| Business rule | MVP single tenant, multi-tenant-ready. |
| Acceptance criteria | Tenant country/timezone/currency available; future settings can extend model. |
| Dependencies | tenants, settings model TBD |
| Status | MVP |

---

## 26. Future Functional Requirements

| ID | Requirement | Status |
|---|---|---|
| FFR-001 | The system shall support custom roles and granular permissions. | Future |
| FFR-002 | The system shall support multiple roles per user. | Future |
| FFR-003 | The system shall support client-facing login and event reports. | Future |
| FFR-004 | The system shall support external client/per-host rating links. | Future |
| FFR-005 | The system shall support payment disbursement or WPS integration. | Future |
| FFR-006 | The system shall support accounting export/integration such as Xero. | Future |
| FFR-007 | The system shall support near-real-time Google Forms watches/Pub/Sub intake sync. | Future |
| FFR-008 | The system shall support full SaaS multi-tenant onboarding and tenant billing. | Future |
| FFR-009 | The system shall support cross-event analytics and master-master sheet reporting. | Future |
| FFR-010 | The system shall support automated CV parsing and candidate auto-scoring. | Future |
| FFR-011 | The system shall support branded PDF reports. | Future |
| FFR-012 | The system shall support worker profile self-update links. | Future |
| FFR-013 | The system shall support attendance self-check-in if business process changes. | Future |

---

## 27. Traceability Matrix

| Use Case | Related Functional Requirements |
|---|---|
| UC-001 Import applicant responses | FR-009, FR-010, FR-011 |
| UC-002 Review and deduplicate applicant | FR-012, FR-013, FR-014 |
| UC-003 Screen candidate | FR-016, FR-023, FR-025 |
| UC-004 Schedule interview | FR-026, FR-047 |
| UC-005 Record interview score | FR-027, FR-028 |
| UC-006 Create client record | FR-029 |
| UC-007 Create event | FR-030, FR-031 |
| UC-008 Configure event roles/headcount | FR-032, FR-033, FR-034 |
| UC-009 Configure event budget/wage rules | FR-035, FR-036, FR-037 |
| UC-010 Configure lateness tiers | FR-038 |
| UC-011 Filter staff pool | FR-017, FR-018, FR-020 |
| UC-012 Create staff group | FR-021, FR-022 |
| UC-013 Assign staff to event role | FR-039, FR-040, FR-041, FR-042 |
| UC-014 Send event invitation | FR-044, FR-045, FR-048 |
| UC-015 Worker confirms/declines | FR-046 |
| UC-016 Issue contract | FR-049, FR-050 |
| UC-017 Receive signed contract | FR-051, FR-052, FR-053 |
| UC-018 Approve final roster | FR-043 |
| UC-019 View assigned roster | FR-054 |
| UC-020 Record attendance/lateness | FR-055, FR-056, FR-057 |
| UC-021 Record backup outcome | FR-058, FR-059 |
| UC-022 Record event-day rating | FR-060, FR-061 |
| UC-023 Calculate payment lines | FR-062, FR-063, FR-064, FR-065, FR-066, FR-067 |
| UC-024 Review payment list | FR-068, FR-069 |
| UC-025 Approve payment list | FR-070 |
| UC-026 Export payment list | FR-071 |
| UC-027 View budget/profit | FR-037, FR-076 |
| UC-028 View reports | FR-072, FR-073, FR-074, FR-075, FR-076, FR-077 |
| UC-029 Manage users/roles | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006 |
| UC-030 Manage WhatsApp templates | FR-044 |

---

## 28. Open Functional Questions

| ID | Question |
|---|---|
| OQ-001 | Exact Google Form fields and required mapping? |
| OQ-002 | Exact applicant import staging table/model? |
| OQ-003 | Exact supervisor-to-event assignment model? |
| OQ-004 | Exact payment review/approval state model? |
| OQ-005 | Exact audit log table design? |
| OQ-006 | Exact role permission policy map for every action? |
| OQ-007 | Exact shift type taxonomy and tenant customization rules? |
| OQ-008 | Exact interview score criteria and score scale? |
| OQ-009 | Exact event-day rating criteria and score scale? |
| OQ-010 | Exact export columns for payment list and reports? |

