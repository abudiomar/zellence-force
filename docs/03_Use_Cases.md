# Use Case Diagram and Use Case Descriptions

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Draft v0.1  
**Source inputs:** `SYSTEM_ARCHITECTURE.md`, `database.js`, BRD, Stakeholder/User Role Analysis, approved Phase 3 recommendations  
**Date:** 2026-06-10

---

## 1. Purpose

This document defines the main actors and use cases for Zell-force MVP. It translates the business workflow into user/system interactions that will later drive:

- functional requirements;
- UI screens and navigation;
- database requirements;
- API requirements;
- QA test cases;
- acceptance criteria.

Future use cases are listed separately so they do not expand MVP scope accidentally.

---

## 2. Actor List

| Actor | Type | Description |
|---|---|---|
| Owner | Internal user | Full business control, final approvals, override rights |
| Admin | Internal user | Full operational administration |
| HR / Recruiter | Internal user | Candidate intake, screening, interviews, contracts |
| Coordinator | Internal user | Event staffing, groups, assignments, roster management, messaging |
| Supervisor | Internal user | Assigned event attendance, lateness, backup outcomes, event-day notes/ratings |
| Finance / Accountant | Internal user | Payment review, exports, financial reports |
| Viewer | Internal user | Read-only operational visibility |
| Temp Worker | External workforce actor | Receives WhatsApp messages and token links; does not log into admin app |
| Permanent Staff | Workforce/internal actor | Same workforce pipeline; may also hold internal login if given app role |
| Client | External business customer | Tracked as record in MVP; no login |
| Google Forms / Google Sheets | External system | Current applicant intake source |
| Meta WhatsApp Cloud API | External system | Sends/receives worker messages and contract media |
| Object Storage | External system | Stores CVs, photos, contracts, uploaded files |

---

## 3. MVP Workflow Overview

MVP supports two operational paths that converge at event assignment:

1. Continuous applicant intake path:
   - Google Form response enters linked Google Sheet.
   - Zell-force imports row into review queue.
   - HR reviews, deduplicates, screens, interviews, and creates/updates person profile.

2. Event staffing path:
   - Admin creates event and budget.
   - Coordinator filters staff and builds roster.
   - HR/Admin issues contracts.
   - Worker confirms through WhatsApp/token link.
   - Supervisor records attendance.
   - Payment engine calculates payment lines.
   - Finance reviews payment output.
   - Owner/Admin approves payment list/export.

---

## 4. Use Case Diagram Description

Text diagram:

```text
Owner/Admin
  -> Manage users/settings
  -> Manage clients/events
  -> Manage budgets/wage rules
  -> Approve final roster
  -> Approve payment list
  -> View reports

HR / Recruiter
  -> Import/review applicants
  -> Screen candidate
  -> Schedule interview
  -> Score interview
  -> Issue contract

Coordinator
  -> Filter staff
  -> Create staff group
  -> Assign staff to event
  -> Send invitations/reminders
  -> Track confirmations

Supervisor
  -> View assigned event roster
  -> Record attendance/lateness
  -> Record backup outcome
  -> Rate event-day performance

Finance / Accountant
  -> Review payment lines
  -> Review attendance summary
  -> Export payment list
  -> View financial reports

Temp/Permanent Worker
  -> Receive WhatsApp invitation
  -> Confirm/decline assignment
  -> View event details through token link
  -> Return signed contract

External Systems
  -> Google Sheets provides applicant intake data
  -> Meta WhatsApp Cloud API handles worker messaging/media
  -> Object Storage stores files
```

---

## 5. Use Case List

| ID | Use Case | Primary Actor | Priority | MVP/Future |
|---|---|---|---|---|
| UC-001 | Import applicant responses | HR / Recruiter | High | MVP |
| UC-002 | Review and deduplicate applicant | HR / Recruiter | High | MVP |
| UC-003 | Screen candidate | HR / Recruiter | High | MVP |
| UC-004 | Schedule interview | HR / Recruiter | Medium | MVP |
| UC-005 | Record interview score | HR / Recruiter | High | MVP |
| UC-006 | Create client record | Admin | Medium | MVP |
| UC-007 | Create event | Admin / Coordinator | High | MVP |
| UC-008 | Configure event roles and headcount | Admin / Coordinator | High | MVP |
| UC-009 | Configure event budget and wage rules | Owner / Admin | High | MVP |
| UC-010 | Configure lateness penalty tiers | Owner / Admin | High | MVP |
| UC-011 | Filter staff pool | Coordinator | High | MVP |
| UC-012 | Create staff group | Coordinator | High | MVP |
| UC-013 | Assign staff to event role | Coordinator | High | MVP |
| UC-014 | Send event invitation | Coordinator | High | MVP |
| UC-015 | Worker confirms or declines assignment | Temp/Permanent Worker | High | MVP |
| UC-016 | Issue contract | HR / Admin | High | MVP |
| UC-017 | Receive signed contract | Worker / WhatsApp API | High | MVP |
| UC-018 | Approve final roster | Owner / Admin / Coordinator | High | MVP |
| UC-019 | View assigned event roster | Supervisor | High | MVP |
| UC-020 | Record attendance and lateness | Supervisor | High | MVP |
| UC-021 | Record backup standby/takeover | Supervisor | High | MVP |
| UC-022 | Record event-day rating | Supervisor | Medium | MVP |
| UC-023 | Calculate payment lines | System | High | MVP |
| UC-024 | Review payment list | Finance / Accountant | High | MVP |
| UC-025 | Approve payment list | Owner / Admin | High | MVP |
| UC-026 | Export payment list | Finance / Accountant | Medium | MVP |
| UC-027 | View event budget/profit summary | Owner / Admin / Finance | High | MVP |
| UC-028 | View reports | Owner / Admin / Finance / Viewer | Medium | MVP |
| UC-029 | Manage users and roles | Owner / Admin | Medium | MVP |
| UC-030 | Manage WhatsApp templates | Admin | Medium | MVP |
| UC-031 | Client login and reports | Client | Low | Future |
| UC-032 | Client/per-host rating link | Client / Host | Low | Future |
| UC-033 | Payment disbursement / WPS | Finance | Low | Future |
| UC-034 | Multi-tenant SaaS onboarding | Super Admin | Low | Future |
| UC-035 | Cross-event analytics | Owner | Low | Future |

---

## 6. Detailed MVP Use Cases

### UC-001: Import Applicant Responses

| Field | Description |
|---|---|
| Actor | HR / Recruiter, Google Forms / Google Sheets |
| Goal | Bring applicant data from existing Google Form response Sheet into Zell-force. |
| Preconditions | Google Form is linked to Google Sheet; integration credentials configured; field mapping exists. |
| Trigger | Scheduled sync, manual sync, or future response notification. |
| Main flow | 1. HR opens import screen. 2. System reads new Sheet rows. 3. System validates required fields. 4. System creates import records in review queue. 5. System marks rows as imported or logs errors. |
| Alternative flows | Manual CSV upload may be supported if API access fails. |
| Exception flows | Missing required fields -> row enters import error queue. API auth failure -> sync fails with admin alert/log. Duplicate row -> flagged for merge. |
| Postconditions | Valid rows are available for HR review; invalid rows remain unresolved. |
| Business rules | Google Form intake remains source; import should not create dirty person records without review. |
| Related data | persons, consents, import mapping TBD, notes |
| Priority | High |
| MVP/Future | MVP |

### UC-002: Review and Deduplicate Applicant

| Field | Description |
|---|---|
| Actor | HR / Recruiter |
| Goal | Confirm whether imported applicant is new or matches existing person. |
| Preconditions | Applicant import record exists. |
| Trigger | HR opens import review queue. |
| Main flow | 1. System shows imported applicant. 2. System suggests matches by phone first, then email/name. 3. HR chooses create new person, merge into existing, or reject. 4. System records decision. |
| Alternative flows | HR sends applicant to maybe roster for future events. |
| Exception flows | Ambiguous duplicate -> HR marks for later review. |
| Postconditions | Applicant becomes person profile or remains unresolved/rejected. |
| Business rules | Phone number is primary duplicate key recommendation. |
| Related data | persons, consents, notes, skills |
| Priority | High |
| MVP/Future | MVP |

### UC-003: Screen Candidate

| Field | Description |
|---|---|
| Actor | HR / Recruiter |
| Goal | Decide whether candidate should proceed, be rejected, or saved for future. |
| Preconditions | Person profile exists. |
| Trigger | HR reviews candidate for event or general pool. |
| Main flow | 1. HR reviews profile, city, gender, age, skills, notes, CV/photo if available. 2. HR selects status: active pool, maybe roster, inactive, rejected/blacklisted if permitted. 3. HR adds notes. |
| Alternative flows | Candidate routed directly to interview for specific event. |
| Exception flows | Missing consent -> candidate cannot receive WhatsApp messages until resolved. |
| Postconditions | Candidate status updated. |
| Business rules | Blacklisting only Owner/Admin; HR may recommend depending final rules. |
| Related data | persons, skills, consents, notes |
| Priority | High |
| MVP/Future | MVP |

### UC-004: Schedule Interview

| Field | Description |
|---|---|
| Actor | HR / Recruiter |
| Goal | Schedule candidate interview and notify candidate. |
| Preconditions | Person exists; WhatsApp consent exists if messaging through WhatsApp. |
| Trigger | HR chooses schedule interview. |
| Main flow | 1. HR selects person, date/time, event optional, interviewer. 2. System creates interview record. 3. System sends WhatsApp reminder/template if enabled. |
| Alternative flows | Interview scheduled without WhatsApp message. |
| Exception flows | WhatsApp send fails -> message marked failed and HR notified. |
| Postconditions | Interview status = scheduled. |
| Business rules | Templates must be approved utility templates before production messaging. |
| Related data | interviews, messages, message_templates, persons |
| Priority | Medium |
| MVP/Future | MVP |

### UC-005: Record Interview Score

| Field | Description |
|---|---|
| Actor | HR / Recruiter |
| Goal | Capture candidate interview score by criteria and overall result. |
| Preconditions | Interview exists. |
| Trigger | Interview completed. |
| Main flow | 1. HR opens interview. 2. HR enters scores by criteria. 3. System calculates or stores overall score. 4. System updates person interview rating cache. |
| Alternative flows | HR marks no-show/cancelled. |
| Exception flows | Score outside allowed range -> validation error. |
| Postconditions | Interview status and scores saved. |
| Business rules | Event may define minimum interview score gate. |
| Related data | interviews, interview_scores, persons, event_assignments |
| Priority | High |
| MVP/Future | MVP |

### UC-006: Create Client Record

| Field | Description |
|---|---|
| Actor | Admin |
| Goal | Store client details for event association and reporting. |
| Preconditions | User has client management permission. |
| Trigger | Admin needs to create event for new client. |
| Main flow | 1. Admin enters client name, contact info, notes. 2. System validates and saves record. |
| Alternative flows | Event can be created with client TBD if allowed. |
| Exception flows | Duplicate client name -> warning. |
| Postconditions | Client available for event selection. |
| Business rules | Client login out of MVP. |
| Related data | clients, events |
| Priority | Medium |
| MVP/Future | MVP |

### UC-007: Create Event

| Field | Description |
|---|---|
| Actor | Admin / Coordinator |
| Goal | Create event shell for staffing and budget planning. |
| Preconditions | Client exists or client TBD allowed. |
| Trigger | New event/project begins. |
| Main flow | 1. User enters event name, client, city, location, start/end dates, status, notes. 2. System creates event as draft. |
| Alternative flows | Owner/Admin imports event from template in future. |
| Exception flows | End date before start date -> validation error. |
| Postconditions | Event exists and can receive roles, budget, assignments. |
| Business rules | Events move through statuses: draft, recruiting, staffed, active, completed, cancelled. |
| Related data | events, clients |
| Priority | High |
| MVP/Future | MVP |

### UC-008: Configure Event Roles and Headcount

| Field | Description |
|---|---|
| Actor | Admin / Coordinator |
| Goal | Define required staffing roles and headcount for event. |
| Preconditions | Event exists; job roles exist. |
| Trigger | User plans event staffing. |
| Main flow | 1. User selects job role. 2. User sets headcount required and backup count. 3. User saves event role plan. |
| Alternative flows | User creates tenant custom job role if permitted. |
| Exception flows | Duplicate role for same event -> system updates existing or blocks duplicate. |
| Postconditions | Event has staffing plan. |
| Business rules | Job roles are staffing roles, not app permission roles. |
| Related data | event_roles, job_roles, events |
| Priority | High |
| MVP/Future | MVP |

### UC-009: Configure Event Budget and Wage Rules

| Field | Description |
|---|---|
| Actor | Owner / Admin |
| Goal | Define billable and cost-side budget lines, rates, shifts, and quantities. |
| Preconditions | Event exists; user has budget permission. |
| Trigger | Event budget/master sheet planning begins. |
| Main flow | 1. User adds billable lines. 2. User adds cost lines. 3. User assigns role, shift type, unit rate, days, quantity where relevant. 4. System calculates planned amounts and budget summary. |
| Alternative flows | Finance views/reviews but does not edit by default. |
| Exception flows | Invalid negative rates/quantities -> validation error. |
| Postconditions | Event has planned income/cost summary. |
| Business rules | Money calculated with numeric precision; billable and cost sides kept distinct. |
| Related data | event_budget_items, event_budget_summary, job_roles, events |
| Priority | High |
| MVP/Future | MVP |

### UC-010: Configure Lateness Penalty Tiers

| Field | Description |
|---|---|
| Actor | Owner / Admin |
| Goal | Define event-specific lateness deduction rules. |
| Preconditions | Event exists. |
| Trigger | Event setup requires payment rules. |
| Main flow | 1. User defines min/max minutes. 2. User selects fixed or percent deduction. 3. System validates no overlapping tiers. |
| Alternative flows | Future global default tiers copied to event. |
| Exception flows | Overlapping ranges -> validation error. |
| Postconditions | Event lateness rules ready for payment calculation. |
| Business rules | Penalty deduction capped at base amount. |
| Related data | late_penalty_tiers, attendance_records, payment_lines |
| Priority | High |
| MVP/Future | MVP |

### UC-011: Filter Staff Pool

| Field | Description |
|---|---|
| Actor | Coordinator |
| Goal | Find suitable staff quickly for event roles. |
| Preconditions | Staff profiles exist. |
| Trigger | Event requires staff sourcing. |
| Main flow | 1. Coordinator opens staff pool or event staffing screen. 2. Applies filters: city, gender, skills, status, ratings, person type, availability/TBD. 3. System returns matching staff quickly. |
| Alternative flows | HR filters candidates during recruitment. |
| Exception flows | No results -> user changes filters or opens recruitment path. |
| Postconditions | Candidate staff selected for group or assignment. |
| Business rules | Filtering must feel instant for hundreds/thousands of profiles. |
| Related data | persons, skills, person_skills, event_day_ratings, interviews |
| Priority | High |
| MVP/Future | MVP |

### UC-012: Create Staff Group

| Field | Description |
|---|---|
| Actor | Coordinator |
| Goal | Save manual or smart group for bulk staffing/message actions. |
| Preconditions | Staff pool exists. |
| Trigger | Coordinator wants reusable roster/batch. |
| Main flow | 1. Coordinator selects staff or filter criteria. 2. Creates group name/description. 3. System saves manual membership or smart criteria. |
| Alternative flows | HR creates group for candidate batch. |
| Exception flows | Smart criteria invalid -> validation error. |
| Postconditions | Group available for assignment/messaging. |
| Business rules | Smart group refresh can be background job. |
| Related data | staff_groups, staff_group_members, persons |
| Priority | High |
| MVP/Future | MVP |

### UC-013: Assign Staff to Event Role

| Field | Description |
|---|---|
| Actor | Coordinator |
| Goal | Connect selected person to event role and assignment stage. |
| Preconditions | Event, job role, and person exist. |
| Trigger | Coordinator selects staff for event. |
| Main flow | 1. Coordinator selects person/group. 2. Selects event role. 3. Sets source pool/recruitment and backup flag if needed. 4. System creates event assignment. |
| Alternative flows | HR adds recruited candidate to assignment pipeline after interview. |
| Exception flows | Person already assigned to event -> duplicate blocked. |
| Postconditions | Assignment row exists. |
| Business rules | `event_assignments` is convergence spine for both sourcing paths. |
| Related data | event_assignments, persons, events, job_roles |
| Priority | High |
| MVP/Future | MVP |

### UC-014: Send Event Invitation

| Field | Description |
|---|---|
| Actor | Coordinator |
| Goal | Invite worker to event and request confirm/decline response. |
| Preconditions | Assignment exists; worker has WhatsApp consent and phone. |
| Trigger | Coordinator sends invite. |
| Main flow | 1. Coordinator selects assignments. 2. System sends approved WhatsApp template with event summary and buttons/link. 3. Message status is logged. |
| Alternative flows | Manual WhatsApp fallback outside system if API unavailable. |
| Exception flows | Missing phone/consent -> message blocked. Send failure -> message failed with error. |
| Postconditions | Worker receives invitation or failure recorded. |
| Business rules | Utility template preferred; promotional content avoided. |
| Related data | messages, message_templates, event_assignments, persons |
| Priority | High |
| MVP/Future | MVP |

### UC-015: Worker Confirms or Declines Assignment

| Field | Description |
|---|---|
| Actor | Temp Worker / Permanent Staff, Meta WhatsApp Cloud API |
| Goal | Capture worker response without admin app login. |
| Preconditions | Invitation sent. |
| Trigger | Worker taps confirm/decline button or opens token link. |
| Main flow | 1. WhatsApp webhook receives response. 2. System validates message/token. 3. System updates assignment stage and responded_at. 4. Coordinator sees status update. |
| Alternative flows | Coordinator records manual response. |
| Exception flows | Expired/invalid token -> worker sees error and contacts recruiter. |
| Postconditions | Assignment marked accepted/declined or equivalent stage. |
| Business rules | Worker has no admin access. Token scoped to one action/context. |
| Related data | event_assignments, messages |
| Priority | High |
| MVP/Future | MVP |

### UC-016: Issue Contract

| Field | Description |
|---|---|
| Actor | HR / Admin |
| Goal | Send contract to assigned worker for signature/return. |
| Preconditions | Assignment exists and candidate approved enough to receive contract. |
| Trigger | HR/Admin issues contract. |
| Main flow | 1. User selects assignment. 2. System creates contract record. 3. System sends WhatsApp/template with token link or contract instructions. 4. Deadline is recorded. |
| Alternative flows | Manual upload for signed contract. |
| Exception flows | Missing required worker/event info -> contract generation blocked. |
| Postconditions | Contract status = sent. |
| Business rules | Contract signature via WhatsApp PDF is operational, not cryptographic e-signature guarantee. |
| Related data | contracts, event_assignments, messages, files/object storage |
| Priority | High |
| MVP/Future | MVP |

### UC-017: Receive Signed Contract

| Field | Description |
|---|---|
| Actor | Worker, Meta WhatsApp Cloud API, HR/Admin |
| Goal | Capture signed contract PDF and link it to assignment. |
| Preconditions | Contract exists. |
| Trigger | Worker returns PDF via WhatsApp or staff manually uploads file. |
| Main flow | 1. System receives inbound media webhook. 2. Downloads media quickly. 3. Stores file in object storage. 4. Updates contract status to signed. |
| Alternative flows | HR/Admin manually uploads signed PDF. |
| Exception flows | Media download fails -> contract remains pending/sent and error shown. |
| Postconditions | Contract file linked to contract record. |
| Business rules | WhatsApp message ID dedupes inbound media; manual upload is fallback. |
| Related data | contracts, messages, object storage |
| Priority | High |
| MVP/Future | MVP |

### UC-018: Approve Final Roster

| Field | Description |
|---|---|
| Actor | Owner / Admin / Coordinator |
| Goal | Confirm event roster is ready before event operations. |
| Preconditions | Assignments and contract statuses exist. |
| Trigger | Event staffing reaches required headcount. |
| Main flow | 1. User reviews roles, headcount required, confirmed staff, backups, contract status. 2. User approves final roster. 3. System marks event as staffed or equivalent state. |
| Alternative flows | Approver returns roster to coordinator for changes. |
| Exception flows | Understaffed role -> approval blocked or warning requiring override. |
| Postconditions | Event ready for supervisor attendance workflow. |
| Business rules | Final roster approval useful before contract/event reminders. |
| Related data | event_assignments, event_roles, contracts, events |
| Priority | High |
| MVP/Future | MVP |

### UC-019: View Assigned Event Roster

| Field | Description |
|---|---|
| Actor | Supervisor |
| Goal | See only assigned event roster needed for on-site operations. |
| Preconditions | Supervisor has assigned event access. |
| Trigger | Supervisor opens mobile web on event day. |
| Main flow | 1. Supervisor opens today's event. 2. System shows roster, roles, contact info, status, backup info. |
| Alternative flows | Admin views all rosters. |
| Exception flows | Supervisor not assigned -> access denied. |
| Postconditions | Supervisor can record attendance. |
| Business rules | Supervisor cannot see budgets, margins, payment calculations. |
| Related data | events, event_assignments, persons, event_roles |
| Priority | High |
| MVP/Future | MVP |

### UC-020: Record Attendance and Lateness

| Field | Description |
|---|---|
| Actor | Supervisor |
| Goal | Capture per-worker per-day attendance and lateness. |
| Preconditions | Event active or assigned date valid; roster exists. |
| Trigger | Staff arrive or shift ends. |
| Main flow | 1. Supervisor selects worker. 2. Marks present/late/absent/excused. 3. Enters late minutes and shift type if needed. 4. System saves record. |
| Alternative flows | Admin records/edit attendance. |
| Exception flows | Attendance already exists for same date -> edit existing if allowed. |
| Postconditions | Attendance row available for payment calculation. |
| Business rules | Supervisor can edit same day; lock after Finance review starts unless Admin reopens. |
| Related data | attendance_records, event_assignments, late_penalty_tiers |
| Priority | High |
| MVP/Future | MVP |

### UC-021: Record Backup Standby/Takeover

| Field | Description |
|---|---|
| Actor | Supervisor |
| Goal | Capture backup outcome for payment and staffing accuracy. |
| Preconditions | Worker assigned as backup or backup used. |
| Trigger | Backup attends, remains standby, or replaces no-show. |
| Main flow | 1. Supervisor selects backup worker. 2. Marks standby or took over. 3. If took over, links covered assignment if known. |
| Alternative flows | Admin adjusts backup outcome after review. |
| Exception flows | Covered assignment missing -> allow note and review flag. |
| Postconditions | Payment engine can apply standby or active rate. |
| Business rules | Standby gets standby rate; takeover gets active rate. |
| Related data | attendance_records, event_assignments, payment_lines |
| Priority | High |
| MVP/Future | MVP |

### UC-022: Record Event-Day Rating

| Field | Description |
|---|---|
| Actor | Supervisor |
| Goal | Capture performance score after/during event. |
| Preconditions | Worker assigned to event. |
| Trigger | Supervisor rates performance. |
| Main flow | 1. Supervisor selects worker. 2. Enters score and comments. 3. System saves rating and updates rating cache. |
| Alternative flows | Admin/Coordinator records rating. |
| Exception flows | Score outside allowed range -> validation error. |
| Postconditions | Person event rating history updated. |
| Business rules | Interview rating and event-day rating are distinct. |
| Related data | event_day_ratings, persons |
| Priority | Medium |
| MVP/Future | MVP |

### UC-023: Calculate Payment Lines

| Field | Description |
|---|---|
| Actor | System |
| Goal | Generate accurate pay line for each attendance record. |
| Preconditions | Attendance record exists; budget/wage rules exist; lateness tiers configured if needed. |
| Trigger | Attendance saved, manual recalc, or scheduled job. |
| Main flow | 1. System resolves base rate. 2. Applies backup rule. 3. Applies lateness deduction. 4. Applies manual adjustments if any. 5. Saves net amount and JSON breakdown. |
| Alternative flows | Admin/Finance triggers recalculation for event. |
| Exception flows | Missing rate -> payment line marked error/review required. |
| Postconditions | Payment line available for Finance review. |
| Business rules | Payment disbursement out of scope; calculation must be pure/testable; net cannot be negative. |
| Related data | attendance_records, payment_lines, event_budget_items, late_penalty_tiers |
| Priority | High |
| MVP/Future | MVP |

### UC-024: Review Payment List

| Field | Description |
|---|---|
| Actor | Finance / Accountant |
| Goal | Review calculated payments before approval/export. |
| Preconditions | Payment lines exist. |
| Trigger | Event attendance complete or pay cycle starts. |
| Main flow | 1. Finance opens event payment list. 2. Reviews attendance, base, deductions, adjustments, net amounts. 3. Flags issues or marks reviewed. |
| Alternative flows | Finance requests Admin/Supervisor correction. |
| Exception flows | Payment line missing/broken -> event cannot be approved until resolved or manually overridden. |
| Postconditions | Payment list ready for Owner/Admin approval. |
| Business rules | Finance prepares/reviews; Owner/Admin approves. |
| Related data | payment_lines, attendance_records, persons, events |
| Priority | High |
| MVP/Future | MVP |

### UC-025: Approve Payment List

| Field | Description |
|---|---|
| Actor | Owner / Admin |
| Goal | Confirm final payment list for external payout process. |
| Preconditions | Finance review complete or Owner/Admin override. |
| Trigger | Payment list ready. |
| Main flow | 1. Owner/Admin reviews summary and exceptions. 2. Approves payment list. 3. System locks payment-relevant records or marks approved state. |
| Alternative flows | Approver rejects and returns to Finance/Admin. |
| Exception flows | Unresolved errors -> approval blocked unless override allowed. |
| Postconditions | Payment list can be exported. |
| Business rules | No payment disbursement in MVP. |
| Related data | payment_lines, attendance_records, events |
| Priority | High |
| MVP/Future | MVP |

### UC-026: Export Payment List

| Field | Description |
|---|---|
| Actor | Finance / Accountant |
| Goal | Export approved payment data for external processing. |
| Preconditions | Payment list approved or export permission allows draft export. |
| Trigger | Finance clicks export. |
| Main flow | 1. Finance selects event/pay cycle. 2. System generates CSV/XLSX export. 3. System logs export event. |
| Alternative flows | Admin exports. |
| Exception flows | Not approved -> system blocks final export or labels draft. |
| Postconditions | Export file available. |
| Business rules | Export does not transfer money. |
| Related data | payment_lines, persons, attendance_records |
| Priority | Medium |
| MVP/Future | MVP |

### UC-027: View Event Budget/Profit Summary

| Field | Description |
|---|---|
| Actor | Owner / Admin / Finance |
| Goal | See planned and actual event financial performance. |
| Preconditions | Budget lines exist. |
| Trigger | User opens event financial dashboard. |
| Main flow | 1. System shows planned billable, planned cost, actual cost, projected income, actual income. 2. User drills into budget categories. |
| Alternative flows | Coordinator sees operational summary without sensitive margin if configured. |
| Exception flows | Missing budget lines -> empty state. |
| Postconditions | User understands event margin/status. |
| Business rules | Budget view access restricted by role. |
| Related data | event_budget_items, event_budget_summary, payment_lines |
| Priority | High |
| MVP/Future | MVP |

### UC-028: View Reports

| Field | Description |
|---|---|
| Actor | Owner / Admin / Finance / Viewer |
| Goal | Access operational and financial reports according to role. |
| Preconditions | User has report permission. |
| Trigger | User opens reports area. |
| Main flow | 1. User selects report: roster, confirmed vs required, attendance, payment list, budget/profit, basic ratings. 2. System shows filtered data. 3. User exports if permitted. |
| Alternative flows | Viewer has read-only no export by default unless allowed. |
| Exception flows | No permission -> access denied. |
| Postconditions | Report reviewed/exported. |
| Business rules | Reports must respect sensitive data restrictions. |
| Related data | multiple |
| Priority | Medium |
| MVP/Future | MVP |

### UC-029: Manage Users and Roles

| Field | Description |
|---|---|
| Actor | Owner / Admin |
| Goal | Create internal users and assign MVP fixed roles. |
| Preconditions | Owner/Admin logged in. |
| Trigger | New staff member needs access. |
| Main flow | 1. Owner/Admin creates user. 2. Assigns role. 3. Links person record if user is also permanent staff/supervisor. 4. Activates account. |
| Alternative flows | Deactivate user. |
| Exception flows | Duplicate email -> validation error. |
| Postconditions | User can access allowed app areas. |
| Business rules | Full custom permissions future; MVP uses fixed roles. |
| Related data | users, persons |
| Priority | Medium |
| MVP/Future | MVP |

### UC-030: Manage WhatsApp Templates

| Field | Description |
|---|---|
| Actor | Admin |
| Goal | Manage internal records for approved WhatsApp templates. |
| Preconditions | Meta WhatsApp Cloud API configured. |
| Trigger | Messaging workflow needs template. |
| Main flow | 1. Admin creates template record. 2. Adds language/body/category/meta template name. 3. Marks approval status. |
| Alternative flows | Future API-assisted template submission. |
| Exception flows | Unapproved template used in production send -> block/warn. |
| Postconditions | Template available for messaging workflows. |
| Business rules | Utility templates preferred; marketing avoided for cost/scope. |
| Related data | message_templates, messages |
| Priority | Medium |
| MVP/Future | MVP |

---

## 7. Future Use Cases Summary

| ID | Use Case | Notes |
|---|---|---|
| UC-031 | Client login and reports | Give clients controlled access to event reports/status. Not MVP. |
| UC-032 | Client/per-host rating link | External rating links for staff performance. Fast-follow candidate. |
| UC-033 | Payment disbursement / WPS | Actual payment transfer/integration. Out of MVP. |
| UC-034 | Multi-tenant SaaS onboarding | Activate RLS, tenant onboarding, billing, platform super admin. Future. |
| UC-035 | Cross-event analytics | Revenue trends, what-went-wrong notes, post-mortems. Future. |

---

## 8. Exception Rules

| Scenario | Expected System Behavior |
|---|---|
| Worker declines after contract sent | Assignment stage becomes declined; contract marked declined/void if needed; Coordinator selects replacement/backups. |
| Worker no-shows | Supervisor marks absent; payment = 0; backup can be marked took_over and paid active rate. |
| Signed contract PDF import fails | Contract remains pending/sent; import error shown; manual upload allowed. |
| Google Sheet row missing required fields | Row enters import error queue; no person created until fixed. |
| WhatsApp webhook duplicates message | System dedupes by WhatsApp message ID. |
| Payment rate missing | Payment line marked error/review required; approval/export blocked unless override. |
| Attendance edit after Finance review starts | Locked by default; Admin can reopen. |
| Supervisor accesses unrelated event | Access denied. |

---

## 9. Traceability Seed

| Business Goal | Related Use Cases |
|---|---|
| Centralize workforce data | UC-001, UC-002, UC-003, UC-011 |
| Faster staffing | UC-011, UC-012, UC-013, UC-014, UC-015 |
| Accurate budget/profit tracking | UC-007, UC-008, UC-009, UC-027 |
| Contract tracking | UC-016, UC-017, UC-018 |
| Attendance accuracy | UC-019, UC-020, UC-021 |
| Payment accuracy | UC-010, UC-020, UC-021, UC-023, UC-024, UC-025 |
| WhatsApp-based workforce flow | UC-004, UC-014, UC-015, UC-016, UC-017, UC-030 |
| Arabic-first operations | Applies to all admin and worker-facing flows |

---

## 10. Open Questions

| ID | Question |
|---|---|
| OQ-001 | Exact fields in current Google Form and linked Google Sheet? |
| OQ-002 | Exact import schedule: manual, hourly, daily, or near-real-time? |
| OQ-003 | Should Coordinator ever edit agreed wage, or only Owner/Admin? |
| OQ-004 | Exact roster approval state names and whether approval blocks contract issue. |
| OQ-005 | Exact report/export formats required: PDF, CSV, XLSX, print. |
| OQ-006 | Exact score criteria for interviews and event-day ratings. |
| OQ-007 | Exact shift types and rate lookup rules. |
| OQ-008 | Whether payment list export needs two-step approval. |

