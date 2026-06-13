# Software Requirements Specification

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Draft v0.1 for approval  
**Date:** 2026-06-10  
**Source inputs:** BRD, stakeholder analysis, use cases, FRs, NFRs, data model, UI/UX wireframe specification, technical architecture  

---

## 1. Introduction

Zell-force is an Arabic-first internal event workforce management web application for MAG Events. It is designed to centralize event staffing operations across applicant intake, recruitment, staff records, event setup, budgeting, staffing, WhatsApp communication, contracts, attendance, ratings, payment calculation, payment review, and reports.

This SRS consolidates approved planning work into one requirements baseline for design, development, QA, deployment planning, AI coding agents, and future maintenance.

This document does not replace the detailed supporting documents. It summarizes and traces them:

- `docs/01_BRD.md`
- `docs/02_Stakeholders_User_Roles.md`
- `docs/03_Use_Cases.md`
- `docs/04_Functional_Requirements.md`
- `docs/05_Non_Functional_Requirements.md`
- `docs/06_Data_Model_Database_Requirements.md`
- `docs/07_UI_UX_Wireframe_Specification.md`
- `docs/08_Technical_Architecture_Document.md`

---

## 2. Purpose

The purpose of Zell-force MVP is to provide MAG Events with a pilot-ready platform that can:

- centralize temp and permanent staff data;
- import applicant responses from the existing Google Form/Sheet flow;
- manage screening, interviews, contracts, and assignments;
- create event master sheets with role headcounts, billable amounts, costs, and wage rules;
- send and track WhatsApp invitations, reminders, and contract-related messages;
- let Supervisors record attendance, lateness, backup standby, and takeover outcomes;
- calculate staff payments from auditable rules;
- let Finance review and export payment lists;
- support Owner/Admin approval and auditability;
- support Arabic-first RTL and English fallback;
- prepare for future multi-tenant SaaS expansion.

---

## 3. Scope

### 3.1 MVP In Scope

| Area | In-scope capabilities |
|---|---|
| Authentication/RBAC | Internal login, fixed MVP roles, Owner/Admin override, Supervisor assigned-event access |
| Applicant intake | Google Sheets import, import runs, review queue, validation, duplicate suggestions |
| Staff management | Temp/permanent person profiles, skills, files, statuses, ratings, search/filter |
| Staff groups | Manual groups and smart/filter-based groups |
| Recruitment | Screening, notes, interview scheduling, interview scoring |
| Clients | Client records linked to events |
| Events | Event creation, statuses, role/headcount planning |
| Budget | Two-sided billable/cost budget, wage rules, lateness tiers, summaries |
| Staffing | Assign staff to event roles, track stages, backups, confirmations |
| WhatsApp | Template metadata, outbound messages, inbound webhook responses, message logs |
| Worker token pages | Assignment details, confirm/decline, contract view/upload, expired/completed states |
| Contracts | Issue, track, ingest signed PDFs via WhatsApp/manual upload |
| Attendance | Supervisor roster, attendance status, late minutes, backup outcome, lock rules |
| Ratings | Interview and event-day ratings kept separate |
| Payments | Payment calculation, breakdown, review, approval, export |
| Reports | Roster, headcount, attendance, payment, budget/profit, ratings basics |
| Files | CVs, photos, signed contracts in private object storage |
| Audit | Audit logs for sensitive/money/workflow changes |
| Localization | Arabic-first RTL, English fallback, Hijri display option |
| Architecture | TypeScript monorepo, Next.js/React, Express API, PostgreSQL, Kysely, pg-boss recommended and approved |

### 3.2 Out of Scope

| Item | Status |
|---|---|
| Payment disbursement, bank transfer, WPS integration | Future |
| Dedicated worker mobile app | Future |
| Replacing Google Form intake | Out of MVP |
| Public customer marketing website | Out of MVP |
| Client portal/login | Future |
| Client/per-host rating links | Future |
| Automated CV parsing | Future |
| Candidate auto-scoring | Future |
| Accounting integrations such as Xero | Future |
| Full SaaS onboarding and tenant billing | Future |
| Cross-event advanced analytics/master-master sheet | Future |

---

## 4. Definitions and Acronyms

| Term | Definition |
|---|---|
| Applicant | Person imported from Google Form/Sheet before HR decision |
| Assignment | Link between person, event, job role, and workflow stage |
| Backup standby | Backup worker attends but is not used; paid standby rate |
| Backup takeover | Backup worker replaces another worker; paid active rate |
| Billable | Amount charged to client |
| Cost | Internal cost to MAG Events |
| Event role | Required staffing role and headcount for one event |
| Job role | Tenant staffing role, e.g. host, usher, driver |
| Master sheet | Event budget/workforce planning sheet with billable and cost sides |
| Payment batch | Group of payment lines for Finance review, Owner/Admin approval, and export |
| Payment line | Calculated payment for one attendance record |
| Person | Workforce profile; temp or permanent |
| RLS | PostgreSQL Row-Level Security |
| SRS | Software Requirements Specification |
| Tenant | Agency/account root; MVP single tenant but tenant-ready |
| Token page | Temporary unauthenticated scoped web page for worker action |
| Utility template | WhatsApp transactional template for reminders/confirmations |

---

## 5. Overall System Description

### 5.1 Product Perspective

Zell-force replaces scattered spreadsheets, WhatsApp groups, phone calls, and manual payment calculations with one internal operations platform. It keeps the existing Google Form intake and imports its linked Sheet data instead of replacing the public application flow.

The system has two main engines:

- Staff Engine: applicant import, staff profiles, skills, ratings, filtering, groups, recruitment.
- Event Engine: clients, events, roles, budget, staffing, contracts, attendance, payment calculation.

The engines converge at `event_assignments`, which connects staff to events and drives contracts, attendance, ratings, payments, and reporting.

### 5.2 System Context

```text
Internal users -> Zell-force web app -> API -> PostgreSQL
Workers -> WhatsApp/token pages -> API
API/Worker -> Google Sheets API
API/Worker -> Meta WhatsApp Cloud API
API/Worker -> Private object storage
API/Worker -> logs/monitoring
```

### 5.3 Key Constraints

| Constraint | Impact |
|---|---|
| 10-12 week MVP timeline | Scope must stay controlled |
| Existing Google Form retained | Import/sync architecture required |
| WhatsApp as worker channel | Webhooks, templates, consent, token pages required |
| Arabic-first RTL | UI and components must be RTL-aware from start |
| KSA data residency | Hosting/storage/provider choice constrained |
| Payment accuracy | Payment Calculator must be test-first and auditable |
| Heavy-scale readiness | Indexes, pagination, jobs, efficient tables required |

---

## 6. User Classes and Characteristics

| User class | Characteristics | Main goals |
|---|---|---|
| Owner | Full business authority, approves money and critical operations | profitability, approvals, risk visibility |
| Admin | Daily system operator | manage users, events, staff, budgets, settings, reports |
| HR / Recruiter | Recruitment workflow owner | review applicants, screen, interview, score, issue contracts |
| Coordinator | Staffing execution owner | find staff, create groups, assign roles, send invitations |
| Supervisor | Field/mobile event-day user | view assigned roster, record attendance/lateness/backup outcomes |
| Finance / Accountant | Payment review user | review calculations, handle exceptions, export payment lists |
| Viewer | Read-only internal observer | view scoped dashboards/reports |
| Temp worker | External workforce actor, no app login | confirm/decline, view assignment, return contract |
| Permanent staff | Workforce actor and possible internal user | same worker flow; may also hold internal login if assigned |
| Client | External business customer | tracked as record; login future |
| Developer/Maintainer | Technical stakeholder | implement, test, support, maintain |

---

## 7. Operating Environment

### 7.1 Runtime Environment

| Layer | Approved recommendation |
|---|---|
| Frontend | Next.js + React |
| API | Node.js TypeScript API, Express.js |
| Database | PostgreSQL |
| Query/migrations | SQL migrations + Kysely-style typed query layer |
| Jobs | pg-boss/Postgres-backed jobs |
| Object storage | Private S3-compatible storage, KSA region where available |
| Auth | Better Auth server-side sessions, email/password login, strong password hashing |
| Validation | Shared schemas, e.g. Zod |
| Testing | Vitest/Jest, integration tests, manual frontend QA |
| Deployment | Dockerized web/API/worker in KSA-region hosting |

### 7.2 Supported Devices and Browsers

| Device/browser | Requirement |
|---|---|
| Desktop | Primary for Owner/Admin/HR/Coordinator/Finance |
| Tablet | Supported for internal workflows |
| Mobile web | Primary for Supervisor and worker token pages |
| Chrome | Latest stable supported |
| Edge | Latest stable supported |
| Safari | Latest stable supported |
| Firefox | TBD / needs confirmation |

---

## 8. Assumptions and Dependencies

### 8.1 Assumptions

| ID | Assumption |
|---|---|
| A-001 | MAG Events is initial single-tenant pilot client. |
| A-002 | Existing Google Form response Sheet remains applicant intake source in MVP. |
| A-003 | Owner/Admin can perform finance approval actions in MVP. |
| A-004 | Finance reviews and exports; Owner/Admin approves final payment lists. |
| A-005 | Workers do not log into internal app in MVP. |
| A-006 | Clients do not log in during MVP. |
| A-007 | Payment calculation only; no disbursement. |
| A-008 | WhatsApp Cloud API is primary worker communication channel. |
| A-009 | KSA-region data hosting/storage is required where available. |
| A-010 | Heavy-scale readiness means at least 10,000 staff profiles without major redesign. |
| A-011 | Exact legal retention periods are TBD and need legal confirmation. |

### 8.2 Dependencies

| Dependency | Required for |
|---|---|
| Google Sheets API | Applicant import |
| Existing Google Form/Sheet | Applicant intake source |
| Meta WhatsApp Cloud API | Invitations, reminders, confirmations, inbound contract media |
| Object storage | CVs, photos, signed contracts, exports |
| PostgreSQL | Core operational data |
| Background job runner | imports, reminders, recalculation, exports |
| KSA-region hosting/provider | Production deployment |
| WhatsApp template approval | Production outbound messaging |

---

## 9. Functional Requirements

Detailed functional requirements live in `docs/04_Functional_Requirements.md`. This SRS establishes the consolidated functional baseline.

| SRS ID | Requirement group | System shall | Source FRs | Priority |
|---|---|---|---|---|
| SRS-FR-001 | Authentication | Allow authorized internal users to log in and block inactive/invalid users | FR-001 | High |
| SRS-FR-002 | User management | Allow Owner/Admin to create, link, activate, and deactivate internal users | FR-002 to FR-004 | High |
| SRS-FR-003 | RBAC | Enforce fixed MVP roles and Owner/Admin override rules server-side | FR-005 to FR-008 | High |
| SRS-FR-004 | Applicant import | Import applicant rows from Google Sheets manually/scheduled with validation and run history | FR-009 to FR-011 | High |
| SRS-FR-005 | Applicant review | Detect duplicate applicants and support create/merge/reject/defer decisions | FR-012 to FR-013 | High |
| SRS-FR-006 | Staff profiles | Manage temp/permanent person profiles, statuses, files, skills, ratings | FR-014 to FR-020, FR-078 to FR-079 | High |
| SRS-FR-007 | Staff filtering/groups | Support fast filtering, manual groups, and smart groups | FR-017 to FR-022 | High |
| SRS-FR-008 | Recruitment | Support screening decisions, candidate notes, pipeline stages | FR-023 to FR-025 | High |
| SRS-FR-009 | Interviews | Schedule interviews, record criterion scores, warn/enforce event score gates | FR-026 to FR-028 | Medium/High |
| SRS-FR-010 | Clients | Manage client records and associate them with events | FR-029 | Medium |
| SRS-FR-011 | Events | Create/edit events and show operational status | FR-030 to FR-031 | High |
| SRS-FR-012 | Event roles | Manage job roles, event role headcounts, backup counts/rates | FR-032 to FR-034 | High |
| SRS-FR-013 | Budget | Manage billable/cost lines, calculate summaries, maintain money precision | FR-035 to FR-037 | High |
| SRS-FR-014 | Lateness rules | Configure and validate lateness penalty tiers | FR-038 | High |
| SRS-FR-015 | Assignments | Assign staff to event roles, track stages, prevent duplicates | FR-039 to FR-043 | High |
| SRS-FR-016 | WhatsApp messaging | Send invitations/templates, receive responses, track message state | FR-044 to FR-048 | High |
| SRS-FR-017 | Contracts | Issue contracts, receive signed contracts, store files, handle failures | FR-049 to FR-053, FR-080 | High |
| SRS-FR-018 | Supervisor roster | Restrict Supervisor to assigned event roster | FR-054 | High |
| SRS-FR-019 | Attendance | Record attendance, lateness, lock after Finance review | FR-055 to FR-057 | High |
| SRS-FR-020 | Backup handling | Mark backup workers and record standby/took_over outcomes | FR-058 to FR-059 | High |
| SRS-FR-021 | Ratings | Capture event-day ratings and show rating history | FR-060 to FR-061 | Medium |
| SRS-FR-022 | Payment calculation | Calculate payment lines, resolve base pay, apply deductions, store breakdown, prevent negative net | FR-062 to FR-067 | High |
| SRS-FR-023 | Payment review/export | Show payment lists, support Finance review, Owner/Admin approval, CSV/XLSX export | FR-068 to FR-071 | High |
| SRS-FR-024 | Dashboards/reports | Provide role-specific dashboards and MVP reports | FR-072 to FR-077 | High/Medium |
| SRS-FR-025 | Audit logs | Audit budget, wage, attendance, payment, roster, and contract changes | FR-081 to FR-084 | High |
| SRS-FR-026 | Settings/localization | Support Arabic RTL, English fallback, Hijri display, tenant settings | FR-085 to FR-088 | High |

### 9.1 Future Functional Requirements

| Future ID | Requirement |
|---|---|
| FFR-001 | Custom roles and granular permissions |
| FFR-002 | Multiple roles per user |
| FFR-003 | Client-facing login and reports |
| FFR-004 | External client/per-host rating links |
| FFR-005 | Payment disbursement or WPS integration |
| FFR-006 | Accounting export/integration |
| FFR-007 | Near-real-time Google Forms watches/Pub/Sub sync |
| FFR-008 | Full SaaS multi-tenant onboarding and billing |
| FFR-009 | Cross-event analytics |
| FFR-010 | Automated CV parsing and candidate auto-scoring |
| FFR-011 | Branded PDF reports |
| FFR-012 | Worker profile self-update links |
| FFR-013 | Attendance self-check-in if business process changes |

---

## 10. Non-Functional Requirements

Detailed NFRs live in `docs/05_Non_Functional_Requirements.md`.

| SRS NFR | Requirement | Source |
|---|---|---|
| SRS-NFR-001 | Staff filters return common results under 2 seconds for up to 10,000 profiles | NFR-001 |
| SRS-NFR-002 | Core dashboards load under 3 seconds under normal load | NFR-002 |
| SRS-NFR-003 | Payment recalculation handles 1,000 attendance records within 10 seconds | NFR-003 |
| SRS-NFR-004 | Applicant imports and exports run without blocking normal UI | NFR-004, NFR-005 |
| SRS-NFR-005 | System is heavy-scale-ready and tenant-ready | NFR-006 to NFR-008 |
| SRS-NFR-006 | Background jobs handle non-interactive work | NFR-009 |
| SRS-NFR-007 | MVP availability target is 99.5% monthly excluding planned maintenance | NFR-010 |
| SRS-NFR-008 | WhatsApp webhooks are idempotent | NFR-012 |
| SRS-NFR-009 | Payment-related writes are transactional or fail safely | NFR-013 |
| SRS-NFR-010 | Database and object storage backups exist with restore test before pilot | NFR-015 to NFR-018 |
| SRS-NFR-011 | Auth, RBAC, tenant scoping, token security, secrets, HTTPS are required | NFR-019 to NFR-026 |
| SRS-NFR-012 | KSA data residency, consent tracking, PDPL-aware design, data minimization are required | NFR-027 to NFR-031 |
| SRS-NFR-013 | Audit logs cover sensitive money/workflow changes and are immutable to normal users | NFR-032 to NFR-034 |
| SRS-NFR-014 | TDD, Deep Modules, Actions vs Modules, DRY config truth are mandatory | NFR-035 to NFR-041 |
| SRS-NFR-015 | Payment, RBAC, adapters, import, webhook tests are required | NFR-042 to NFR-046 |
| SRS-NFR-016 | Core workflows target WCAG 2.1/2.2 AA practical baseline | NFR-047, Phase 7 |
| SRS-NFR-017 | Arabic-first RTL, English fallback, Hijri, SAR, Asia/Riyadh defaults are required | NFR-051 to NFR-054 |
| SRS-NFR-018 | Latest Chrome, Edge, Safari and responsive web are supported | NFR-055 to NFR-057 |
| SRS-NFR-019 | SEO is not core; token pages must protect preview privacy | NFR-058 to NFR-059 |
| SRS-NFR-020 | App/integration/job/webhook/import monitoring is required | NFR-060 to NFR-064 |
| SRS-NFR-021 | UUIDs, timestamptz, decimal money, status validation, referential integrity are required | NFR-065 to NFR-069 |

---

## 11. External Interface Requirements

### 11.1 User Interfaces

| Interface | Requirement |
|---|---|
| Internal web app | Arabic-first RTL, role-based navigation, table/list/grid heavy operations UI |
| Supervisor mobile web | Mobile-first assigned-event roster, attendance, backup, notes/ratings |
| Worker token pages | Single-purpose unauthenticated pages for assignment and contract workflows |
| Admin settings | Users, integrations, tenant settings, catalogs |
| Reports/export UI | Filtered report tables, CSV/XLSX export where permitted |

### 11.2 External System Interfaces

| System | Interface requirement |
|---|---|
| Google Sheets API | Read applicant response rows from configured Sheet/range |
| Google Forms | Existing intake remains; direct Forms API optional/future |
| Meta WhatsApp Cloud API | Send templates, receive webhooks, handle interactive responses, ingest media |
| Object storage | Store private CVs/photos/contracts/exports with signed URL access |
| Email/SMS | Out of MVP unless client requests |
| Accounting/WPS | Out of MVP |

### 11.3 API Interface

Approved default:

- REST-style JSON API;
- typed request/response schemas;
- stable error codes;
- server-side pagination, sorting, filtering;
- role and tenant checks on every protected endpoint;
- no sensitive data in error details.

---

## 12. Data Requirements

Detailed data requirements live in `docs/06_Data_Model_Database_Requirements.md`.

### 12.1 MVP Entity Baseline

| Entity group | Entities |
|---|---|
| Tenancy/access | Tenant, Tenant Settings, User |
| Workforce | Person, Skill, Person Skill, Consent, Staff Group, Staff Group Member |
| Applicant import | Applicant Import Run, Applicant Import Row |
| Clients/events | Client, Event, Job Role, Event Role, Shift Type |
| Budget/payment rules | Event Budget Item, Late Penalty Tier |
| Assignment pipeline | Event Assignment, Event Supervisor |
| Recruitment | Interview, Interview Score |
| Contracts/files | Contract, File |
| Operations | Attendance Record, Event-Day Rating |
| Payments | Payment Line, Payment Batch, Payment Batch Line |
| Messaging | Message Template, Message |
| Notes/audit/export | Note, Audit Log, Export Run |

### 12.2 Required Schema Changes From Starting `database.js`

| Gap | Required change |
|---|---|
| Missing `supervisor`, `finance` roles | Add enum values or migrate to role lookup later |
| Missing applicant import staging | Add `applicant_import_runs`, `applicant_import_rows` |
| Missing audit logs | Add `audit_logs` |
| Missing Supervisor event scoping | Add `event_supervisors` |
| Missing payment review/approval model | Add `payment_batches`, `payment_batch_lines` |
| File URLs only | Add `files` metadata table |
| Raw shift type text | Add `shift_types` lookup |
| Tenant config scattered | Add `tenant_settings` |
| Export logging missing | Add `export_runs` |

### 12.3 Data Integrity Rules

- every tenant-owned table includes `tenant_id`;
- money uses `numeric`;
- primary keys use UUID;
- timestamps use `timestamptz` where operational/audit timing matters;
- core relationships use foreign keys;
- stable statuses use enum/controlled values;
- critical updates write audit logs;
- sensitive files use private storage and permission-checked access.

---

## 13. Security Requirements

| Area | Requirement |
|---|---|
| Authentication | Better Auth email/password login for internal users, default identity tables, strong password hashing in `account`, secure sessions, and Zell-force `users.auth_user_id` linkage |
| Authorization | Server-enforced RBAC and central permission map |
| Tenant isolation | Query-level tenant scoping from MVP; RLS-ready |
| Supervisor scope | Assigned-event-only access |
| Worker tokens | Signed, scoped, time-limited, no admin session |
| Sensitive files | Private object storage, signed URLs, role checks |
| Secrets | Environment/secret manager only, no source-code secrets |
| Webhooks | Verify signatures where available, dedupe provider events |
| HTTPS | Required in production |
| Audit | Money, attendance, roster, contract, user/role, payment changes logged |
| Logs | Redact secrets and sensitive file contents |
| Rate limiting | Login, token pages, webhook/public endpoints |

---

## 14. User Interface Requirements

Detailed UI requirements live in `docs/07_UI_UX_Wireframe_Specification.md`.

### 14.1 UI Principles

- Arabic-first RTL;
- table/list/grid-first for operational data;
- cards only for limited dashboard summaries, empty states, worker token pages;
- Event Detail is object workspace with tabs;
- Supervisor mobile flow is mobile-first;
- Worker token pages are focused and unauthenticated;
- approval, lock, error, message failure, missing payment rule, and review states stay visible;
- no color-only status communication;
- WCAG 2.2 AA wireframe baseline.

### 14.2 Primary Screen Groups

| Screen group | Main screens |
|---|---|
| Auth | Login, password reset |
| Dashboards | Owner, Admin, HR, Coordinator, Supervisor, Finance, Viewer |
| Recruitment | Import runs, applicant review queue, applicant detail, interviews |
| Staff | Staff database, staff profile, staff groups |
| Clients | Clients list/detail |
| Events | Events list, event create/edit, Event Detail tabs |
| Event workspace | Overview, roles, budget, staffing, contracts, attendance, payments, reports |
| Payments | Payments worklist, payment batch review |
| Reports | Reports index/detail |
| Messages | Templates, logs |
| Settings | Users, tenant settings, integrations, catalogs |
| Audit | Audit log |
| Supervisor mobile | Today, roster, attendance, backup/issues |
| Worker token pages | Assignment, contract, expired/completed |

---

## 15. Use Cases

MVP use cases from `docs/03_Use_Cases.md` are included in scope:

| Range | Use cases |
|---|---|
| UC-001 to UC-005 | Applicant import, review, screening, interviews |
| UC-006 to UC-010 | Client, event, roles, budget, lateness rules |
| UC-011 to UC-018 | Staff filtering, groups, assignments, invitations, confirmations, contracts, roster approval |
| UC-019 to UC-022 | Supervisor roster, attendance, backup, ratings |
| UC-023 to UC-026 | Payment calculation, review, approval, export |
| UC-027 to UC-030 | Budget/profit summary, reports, users/roles, WhatsApp templates |

Future use cases UC-031 to UC-035 are out of MVP unless explicitly moved into scope.

---

## 16. Acceptance Criteria

### 16.1 MVP Product Acceptance

MVP is acceptable when:

1. Owner/Admin can create users, clients, staff, events, roles, budgets, wage rules, and settings.
2. HR can import applicant rows from Google Sheets into a review queue.
3. HR can review applicants, detect duplicates, create/merge person profiles, screen, interview, and score candidates.
4. Coordinator/Admin can filter staff, create groups, assign staff to event roles, send WhatsApp invitations, and track confirmations.
5. Worker can confirm/decline through WhatsApp or token page without internal login.
6. HR/Admin can issue contracts and store signed contract files from WhatsApp or manual upload.
7. Supervisor can access only assigned events and record attendance, lateness, backup outcome, notes/ratings on mobile.
8. Payment Calculator creates auditable payment lines from attendance, backup, lateness, wage/rate, and adjustment rules.
9. Finance can review payment lists and export approved payment data.
10. Owner/Admin can approve final payment list.
11. Reports exist for roster, headcount, attendance, payment, budget/profit, and ratings basics.
12. Arabic-first RTL and English fallback work across core screens.
13. Sensitive files/payment data are restricted by role.
14. Audit logs capture critical budget, wage, attendance, contract, roster, and payment changes.
15. Required tests pass, including payment, RBAC, import idempotency, webhook idempotency, attendance lock, contract ingestion.

### 16.2 Technical Acceptance

1. Production code follows TDD.
2. CI runs tests, typecheck, lint/build gates.
3. API enforces permissions server-side.
4. Database migrations are source-controlled.
5. `tenant_id` is present and enforced in tenant-owned data paths.
6. Private file storage and signed URL access are implemented.
7. Secrets are not committed.
8. Backups and restore test exist before pilot.
9. Monitoring/logging for imports, WhatsApp, jobs, API errors, payment errors exists.
10. No dense operational page is implemented as a card grid.

---

## 17. Traceability Matrix

| Business goal | Use cases | Functional requirements | UI areas | Data entities | Test focus |
|---|---|---|---|---|---|
| Centralize workforce data | UC-001 to UC-003, UC-011 | FR-009 to FR-018 | Applicant queue, Staff DB, Staff profile | persons, skills, import rows | import, dedupe, staff filtering |
| Faster staffing | UC-011 to UC-018 | FR-017, FR-021 to FR-048 | Staff DB, Groups, Event Staffing, Contracts | staff_groups, event_assignments, messages, contracts | assignment pipeline, WhatsApp |
| Accurate event budget/profit | UC-007 to UC-010, UC-027 | FR-030 to FR-038, FR-076 | Event setup, Roles, Budget, Reports | events, event_roles, event_budget_items, late_penalty_tiers | budget engine, money precision |
| Contract tracking | UC-016, UC-017 | FR-049 to FR-053, FR-080 | Contracts tab, Worker contract token | contracts, files, messages | contract ingestion, file storage |
| Attendance accuracy | UC-019 to UC-021 | FR-054 to FR-059 | Supervisor roster/attendance, Event attendance | event_supervisors, attendance_records | attendance lock/scope |
| Payment accuracy | UC-023 to UC-026 | FR-062 to FR-071 | Payment tab, Payment batch review | payment_lines, payment_batches | payment calculator, approval/export |
| Operational visibility | UC-027, UC-028 | FR-072 to FR-077 | Dashboards, Reports | report views, events, payments | report permissions |
| WhatsApp-based workforce flow | UC-014, UC-015, UC-017, UC-030 | FR-044 to FR-048 | Messages, Token pages | messages, templates, assignments | webhook idempotency |
| Arabic-first operations | All core UCs | FR-085 to FR-088 | All screens | tenant_settings | RTL/i18n checks |
| Sensitive access control | UC-029 and cross-cutting | FR-005 to FR-008, FR-081 to FR-084 | All protected screens | users, audit_logs, files | RBAC matrix |

---

## 18. Open Issues

| ID | Open issue | Source | Impact |
|---|---|---|---|
| OI-001 | Exact Google Form fields and Sheet structure | BRD/FR/Data/UI/Architecture | Import mapping and validation |
| OI-002 | Exact staff pool size, event volume, concurrent users | BRD/NFR | Performance testing and infra sizing |
| OI-003 | Exact shift taxonomy and rate lookup rules | Use cases/Data/UI | Budget/payment correctness |
| OI-004 | Exact interview/event-day rating criteria and scale | FR/Data/UI | Rating UI/data validation |
| OI-005 | Exact report/export formats and columns | BRD/FR/UI | Report/export module |
| OI-006 | Whether payment export needs two-step approval | Roles/Use cases/UI | Payment batch workflow |
| OI-007 | Legal retention periods for applicants, CVs, photos, contracts, payments, audit logs | NFR/Data/Architecture | Compliance/storage/deletion |
| OI-008 | Hosting provider and object storage provider with KSA region | Architecture | Deployment plan |
| OI-009 | MFA requirement for Owner/Admin | NFR/Architecture | Auth scope |
| OI-010 | Offline attendance behavior | UI/Architecture | Supervisor mobile complexity |
| OI-011 | Whether Finance can view contract files for disputes | Roles/Data/UI | Permission rules |
| OI-012 | Whether notes need private/sensitive categories in MVP | Roles/Data/UI | Access control and UI |
| OI-013 | Whether Firefox support is required | NFR | Browser testing |
| OI-014 | Exact token expiry and one-time/multi-use policy | NFR/Architecture | Token security |

---

## 19. SRS Approval Criteria

SRS approval means stakeholders accept that:

- MVP scope is correct;
- future/out-of-scope items are not required for pilot;
- functional and non-functional baselines are sufficient for development planning;
- approved technical recommendations are accepted for implementation planning;
- unresolved items remain tracked as TBD/open issues;
- detailed design/build can proceed into project planning and test planning phases.
