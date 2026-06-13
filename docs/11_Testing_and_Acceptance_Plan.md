# Testing and Acceptance Plan

Status: Draft for approval  
Document type: Phase 11 testing, QA, UAT, and acceptance plan  
Product: Zell-force  
Business: MAG Events  
Primary users: Owner, Admin, HR / Recruiter, Coordinator, Supervisor, Finance / Accountant, Viewer, Workers through token pages  
Primary interface direction: Arabic-first RTL with English fallback  

---

## 0. Source Imports

This document is an execution and acceptance plan. It does not replace the requirements docs.

| Source | Required sections / line refs | Used for |
|---|---|---|
| `docs/03_Use_Cases.md` | `docs/03_Use_Cases.md:120` use case list, `:162` detailed MVP use cases, `:688` exception rules, `:703` traceability seed | Workflow and UAT scenario source |
| `docs/04_Functional_Requirements.md` | `docs/04_Functional_Requirements.md:43` FR modules, `:1299` traceability, `:1336` open questions | Functional test case source |
| `docs/05_Non_Functional_Requirements.md` | `docs/05_Non_Functional_Requirements.md:55` performance, `:98` scalability, `:204` security, `:301` auditability, `:323` maintainability, `:372` testability, `:402` accessibility, `:431` localization, `:503` logging, `:537` data integrity | NFR test source |
| `docs/07_UI_UX_Wireframe_Specification.md` | `docs/07_UI_UX_Wireframe_Specification.md:185` screen specs, `:365` tables/grids, `:424` forms, `:474` states, `:504` RTL, `:546` accessibility, `:619` permissions | UI, responsive, state, and role-visibility tests |
| `docs/08_Technical_Architecture_Document.md` | `docs/08_Technical_Architecture_Document.md:812` testing architecture, `:824` test pyramid, `:834` required suites, `:847` risks | Test architecture and minimum suite source |
| `docs/09_Software_Requirements_Specification.md` | `docs/09_Software_Requirements_Specification.md:237` FR summary, `:290` NFR summary, `:477` acceptance criteria, `:514` traceability, `:531` open issues | Final acceptance and traceability source |
| `docs/10_Project_Plan_and_Timeline.md` | `docs/10_Project_Plan_and_Timeline.md:10` skill imports, `:175` dependency gates, `:1458` agent definition of done | Implementation-phase verification and TDD evidence source |

---

## 1. Purpose

This plan defines how Zell-force MVP will be tested and accepted before pilot usage.

It covers:

- test strategy;
- test levels and test types;
- module test cases;
- role permission tests;
- form validation tests;
- file, WhatsApp, payment, report, export tests;
- responsive, RTL, and accessibility tests;
- security and privacy tests;
- UAT checklist;
- acceptance criteria;
- bug severity and release gates.

---

## 2. Known Information

| Area | Known |
|---|---|
| Stack | TypeScript, Next.js + React, Express API, PostgreSQL, Kysely + SQL migrations, Bun workspaces, pg-boss, private object storage recommendation |
| Test architecture | Automated backend/domain/contract/config/platform tests, reusable UI primitive tests, selected non-rendering web logic tests, and manual frontend QA |
| Mandatory methodology | TDD, Deep Modules, Actions vs Modules separation, DRY configuration truth |
| Critical Modules | Applicant Intake Import, Staff Filtering, Assignment Pipeline, Budget Engine, Attendance Capture, Payment Calculator, WhatsApp Messaging, Contract Ingestion, Report Export, Audit Log |
| Critical MVP workflows | applicant import, staff filtering, event setup, assignment, WhatsApp/token response, contracts, attendance, payment, reports, audit |
| Critical NFRs | payment accuracy, RBAC, tenant scoping, import idempotency, webhook idempotency, attendance locks, private files, RTL/accessibility |

---

## 3. Missing Information

| ID | Missing item | Testing impact |
|---|---|---|
| TQA-OPEN-001 | Exact Google Sheet field names and example rows | Final import fixtures cannot be complete |
| TQA-OPEN-002 | Exact staff pool size and event concurrency target | Performance load data size remains recommended default |
| TQA-OPEN-003 | Exact shift taxonomy and rate rules | Final payment fixtures need confirmation |
| TQA-OPEN-004 | Exact interview and event-day rating criteria | Rating validation tests use placeholder criteria |
| TQA-OPEN-005 | Exact payment export format and columns | Export snapshot tests need final columns |
| TQA-OPEN-006 | Whether payment export needs two-step approval | Approval workflow tests may change |
| TQA-OPEN-007 | Retention policy for applicant files/contracts/audit | Retention/deletion tests remain TBD |
| TQA-OPEN-008 | Hosting and object storage provider | Deployment smoke and backup restore tests remain provider-specific |
| TQA-OPEN-009 | MFA decision | Auth security tests may expand |
| TQA-OPEN-010 | Offline attendance behavior | Supervisor mobile poor-network tests remain online-first |

---

## 4. Assumptions

| ID | Assumption | Reason |
|---|---|---|
| TQA-ASM-001 | Automated tests use Bun commands for backend/domain/contracts/config/platform/package UI primitive and selected non-rendering web logic coverage. Frontend screens use manual QA in `docs/QA.md`. | Current testing policy replaces Playwright E2E with manual frontend acceptance. |
| TQA-ASM-002 | MVP testing is online-first for Supervisor attendance. | Offline attendance is open issue, not approved MVP requirement. |
| TQA-ASM-003 | Test data includes at least 10,000 staff records for filter performance checks. | NFR-001 and SRS-NFR-001 define target. |
| TQA-ASM-004 | Payment calculator has pure Module test fixtures independent of UI/API. | Architecture requires Payment Calculator as deep Module. |
| TQA-ASM-005 | UAT can be run with representative pilot data before real event go-live. | Recommended default for risk reduction. |

---

## 5. Test Strategy

Testing will follow risk-based coverage.

Highest-risk areas get deepest automated coverage:

1. Payment calculation and approval.
2. RBAC, tenant scoping, and sensitive file access.
3. Attendance lock and supervisor scope.
4. Applicant import idempotency and duplicate handling.
5. WhatsApp webhook idempotency and token response security.
6. Contract ingestion and private file storage.
7. Budget/money precision.
8. Report/export permission gating.
9. Arabic RTL, responsive behavior, and accessibility on critical screens through manual QA.

Testing follows the project TDD rule:

```text
RED -> verify failure -> GREEN -> verify pass -> REFACTOR -> verify still green
```

No feature is complete if its new behavior lacks a failing test observed before implementation.

---

## 6. Test Levels

| Level | Purpose | Owner | Required evidence |
|---|---|---|---|
| Unit tests | Validate pure Modules and utilities | Coding agent / developer | Passing test output and RED/GREEN evidence |
| Action tests | Validate auth, role checks, workflow state changes, user-facing errors | Coding agent / developer | Action-level tests with role and state fixtures |
| Integration tests | Validate DB queries, migrations, transactions, external Adapter contracts | Coding agent / developer | Test DB run, rollback tests, adapter fake/provider contract tests |
| API tests | Validate request/response, auth cookies/sessions, server-side permission denial | Coding agent / developer | API test output and error shape checks |
| Reusable UI package tests | Validate `packages/ui` primitive behavior and accessibility basics | Coding agent / developer | Vitest/jsdom coverage for package UI Interfaces |
| Manual frontend QA | Validate screen rendering, critical user journeys, responsive behavior, RTL, and accessibility checks | User / QA / coding agent support | `docs/QA.md` checklist, screenshots or user confirmation |
| Performance tests | Validate defined NFR thresholds | QA / coding agent | Seed data size, command output, threshold result |
| Security tests | Validate auth, RBAC, tenant, token, file access, secrets/log safety | QA / security reviewer | Security checklist and automated regression tests |
| UAT | Validate business acceptance with client/business owner | Product owner / client / QA | Signed UAT checklist |

---

## 7. Test Types

| Test type | Required for MVP | Examples |
|---|---|---|
| Functional | Yes | Create event, assign worker, record attendance |
| Negative/exception | Yes | Duplicate applicant, invalid payment approval, expired token |
| Permission/RBAC | Yes | Supervisor cannot access unassigned event |
| Data integrity | Yes | Tenant scoping, FK constraints, decimal money |
| Integration | Yes | Google Sheets Adapter, WhatsApp webhook, storage Adapter |
| Idempotency | Yes | repeated import sync, duplicate WhatsApp webhook |
| Transaction | Yes | payment approval, attendance write + audit |
| Performance | Yes | staff filtering, payment calculation, export |
| Accessibility | Yes, manual for screens; automated for reusable UI primitives | keyboard, focus, labels, contrast, dialog focus |
| RTL/localization | Yes, manual for screens; automated for non-rendering locale logic | Arabic layout, LTR mixed content, SAR/date formatting |
| Responsive | Yes, manual | desktop admin, mobile supervisor, worker token pages |
| Security/privacy | Yes | token links, signed URLs, sensitive logs |
| Regression | Yes | Every fixed bug gets a failing regression test first |
| Smoke | Yes | post-deploy login, import, event, attendance, payment |
| Exploratory | Recommended | live event-day edge cases and admin workflows |

---

## 8. Test Environment Requirements

| Environment | Purpose | Requirements |
|---|---|---|
| Local dev | TDD and fast feedback | Bun, local PostgreSQL/test DB, env schema, seeded fixtures |
| CI | Automated gates | install, lint, typecheck, unit/action/integration tests, build |
| Staging | UAT and integration checks | production-like env, private storage, test WhatsApp credentials or sandbox, seeded pilot data |
| Production | Smoke and monitoring | smoke tests only, no destructive test data, backup/restore evidence before pilot |

Recommended test commands:

```powershell
bun install
bun run lint
bun run typecheck
bun run test
bun run test:integration
bun run build
```

Frontend screen acceptance follows `docs/QA.md` instead of Playwright.

---

## 9. Entry and Exit Criteria

### 9.1 Feature Test Entry

Feature testing may start when:

- related use case and FR exist;
- data entities/statuses are defined;
- role permissions are known or marked TBD;
- expected behavior and exception flows are clear;
- test data or fixtures are available.

### 9.2 Feature Completion Exit

Feature is complete when:

- RED/GREEN TDD evidence exists;
- unit/action/integration tests pass as applicable;
- role permission tests pass;
- UI state tests pass if UI exists;
- audit/logging checks pass if workflow is critical;
- docs/context/ADR updates are done if behavior/architecture changed.

### 9.3 MVP Release Exit

MVP pilot candidate requires:

- all critical and high-priority test cases pass;
- no open Severity 1 or Severity 2 bugs;
- all required SRS acceptance criteria pass;
- payment, RBAC, import idempotency, webhook idempotency, attendance lock, contract ingestion test suites pass;
- staging smoke test passes;
- backup restore test evidence exists;
- UAT sign-off received.

---

## 10. Module Test Plan

Priority values:

- P0: release blocker;
- P1: high priority before pilot;
- P2: important but can be accepted with workaround;
- P3: future or low risk.

### 10.1 Authentication and User Management

Source refs: FR-001 to FR-004, UC-029, NFR-019 to NFR-026.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-AUTH-001 | Valid internal user logs in | API/Manual QA | P0 | Session created, user lands on allowed dashboard |
| TC-AUTH-002 | Invalid password rejected | API | P0 | Safe error, no session |
| TC-AUTH-003 | Inactive user rejected | API | P0 | Safe error, no session |
| TC-AUTH-004 | Logout invalidates session | API/Manual QA | P1 | Protected pages require login after logout |
| TC-AUTH-005 | Owner/Admin creates user | Action/API | P0 | User created with role and tenant |
| TC-AUTH-006 | Non-admin cannot create user | Action/API | P0 | Server-side denial |
| TC-AUTH-007 | User linked to person record | Action/API | P1 | Link saved and visible to authorized users |

### 10.2 RBAC and Tenant Access

Source refs: FR-005 to FR-008, UC-029, NFR-020 to NFR-022, SRS technical acceptance.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-RBAC-001 | Role matrix allow/deny for all MVP roles | Unit/Action | P0 | Permission map matches docs/02 |
| TC-RBAC-002 | Supervisor accesses only assigned event | Action/API/Manual QA | P0 | Assigned event allowed, unassigned denied |
| TC-RBAC-003 | Finance sees payment data but not photos/CVs by default | API/Manual QA | P0 | Sensitive staff files hidden/denied |
| TC-RBAC-004 | Viewer cannot mutate data | API/Manual QA | P0 | Mutating requests denied |
| TC-RBAC-005 | Direct object ID from another tenant denied | Integration/API | P0 | 403/404 safe denial |
| TC-RBAC-006 | UI hidden link is backed by server denial | API/Manual QA | P0 | Manual URL/API call still denied |

### 10.3 Applicant Import and Review

Source refs: UC-001 to UC-005, FR-009 to FR-013, FR-023 to FR-028, NFR-004, NFR-045.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-IMP-001 | Import valid Google Sheet rows | Module/Integration | P0 | Import run created, rows staged |
| TC-IMP-002 | Missing required applicant field | Module | P0 | Row marked invalid with field error |
| TC-IMP-003 | Duplicate phone detected | Module/Action | P0 | Possible duplicate shown in review queue |
| TC-IMP-004 | Repeated sync with same source hash | Module/Integration | P0 | No duplicate applicant rows |
| TC-IMP-005 | Google Sheets Adapter failure | Adapter/Action | P1 | Failure logged, visible, retriable |
| TC-IMP-006 | HR accepts applicant into person profile | Action/Manual QA | P0 | Person created/linked, row status updated |
| TC-IMP-007 | HR merges duplicate applicant | Action | P0 | Existing person updated, audit/log entry if required |
| TC-IMP-008 | Interview score below event minimum | Action/UI | P1 | Warning or block per configured policy |

### 10.4 Staff Profiles, Skills, Filtering, Groups

Source refs: UC-011 to UC-012, FR-014 to FR-022, NFR-001.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-STF-001 | Create/edit temp person profile | Action/API/UI | P0 | Profile saved with required fields |
| TC-STF-002 | Invalid person status rejected | Action/API | P0 | Controlled status validation error |
| TC-STF-003 | Upload staff photo/CV permission checked | Integration/API | P0 | Only allowed roles can access |
| TC-STF-004 | Combined staff filters | Module/Integration | P0 | Correct paginated results |
| TC-STF-005 | Staff filter performance with 10,000 profiles | Performance | P0 | Common filters under 2 seconds |
| TC-STF-006 | Manual group membership update | Action/UI | P1 | Members added/removed correctly |
| TC-STF-007 | Smart group uses saved criteria | Module/Action | P1 | Group refresh matches filter criteria |

### 10.5 Clients, Events, Roles, Budget

Source refs: UC-006 to UC-010, UC-027, FR-029 to FR-038, FR-076, NFR-067.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-EVT-001 | Admin creates client | Action/UI | P1 | Client available for event |
| TC-EVT-002 | Coordinator creates event | Action/UI | P0 | Event created with tenant and valid dates |
| TC-EVT-003 | Invalid event status transition rejected | Action | P1 | Validation error |
| TC-EVT-004 | Configure event roles/headcount | Action/UI | P0 | Required count and backup rate saved |
| TC-EVT-005 | Budget billable/cost lines calculate totals | Module/UI | P0 | Revenue, cost, margin correct |
| TC-EVT-006 | Decimal money precision | Unit/Integration | P0 | No floating-point artifacts |
| TC-EVT-007 | Lateness tier overlap rejected | Module/Action/UI | P0 | User sees validation error |
| TC-EVT-008 | Budget/wage change audited | Action/Integration | P0 | Audit entry contains before/after/actor |

### 10.6 Assignment Pipeline and Roster

Source refs: UC-013 to UC-018, FR-039 to FR-043.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-ASN-001 | Assign eligible person to event role | Module/Action/UI | P0 | Assignment created in correct stage |
| TC-ASN-002 | Duplicate person assignment blocked | Module/Action | P0 | Duplicate rejected |
| TC-ASN-003 | Invalid stage transition rejected | Module | P0 | Structured workflow error |
| TC-ASN-004 | Assignment source tracked | Action/Integration | P1 | Source recorded |
| TC-ASN-005 | Owner/Admin sets agreed wage | Action/UI | P0 | Wage saved and audited |
| TC-ASN-006 | Unauthorized wage change denied | Action/API | P0 | Server-side denial |
| TC-ASN-007 | Final roster approval locks expected fields | Action/UI | P0 | Approval state visible and enforced |

### 10.7 WhatsApp Messaging and Worker Token Pages

Source refs: UC-014, UC-015, UC-030, FR-044 to FR-048, NFR-012, NFR-023, NFR-046.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-MSG-001 | Create/update WhatsApp template | Action/UI | P1 | Template variables validated |
| TC-MSG-002 | Send event invitation | Action/Adapter | P0 | Message record created with provider ID/status |
| TC-MSG-003 | Send blocked when consent missing | Action | P0 | Send blocked or flagged per policy |
| TC-MSG-004 | Worker confirms through token page | Manual QA/API | P0 | Assignment stage updated |
| TC-MSG-005 | Worker declines with reason | Manual QA/API | P0 | Stage/reason saved |
| TC-MSG-006 | Expired/invalid token denied | Security/API/Manual QA | P0 | No worker/admin data leaked |
| TC-MSG-007 | Duplicate WhatsApp webhook | Module/API | P0 | Processed once only |
| TC-MSG-008 | Message failure retried | Action/Job | P1 | Retry status and log updated |

### 10.8 Contracts and Files

Source refs: UC-016 to UC-017, FR-049 to FR-053, FR-078 to FR-080, NFR-022, NFR-023.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-CON-001 | Issue contract for assignment | Action/UI | P0 | Contract record created |
| TC-CON-002 | Contract status transition valid | Module/Action | P0 | Status updated correctly |
| TC-CON-003 | Manual signed contract upload | Integration/API/UI | P0 | Private file metadata created |
| TC-CON-004 | WhatsApp PDF contract ingestion | Adapter/Module/Action | P0 | File linked to contract |
| TC-CON-005 | Wrong MIME rejected | Module/API | P0 | Upload rejected safely |
| TC-CON-006 | Duplicate WhatsApp media ignored | Module/Integration | P1 | No duplicate file/contract status |
| TC-CON-007 | Signed URL access denied by role | Security/API | P0 | Unauthorized user cannot open file |

### 10.9 Supervisor Attendance, Backup, Ratings

Source refs: UC-019 to UC-022, FR-054 to FR-061, NFR-049.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-ATT-001 | Supervisor views assigned roster | Action/Manual QA | P0 | Assigned event roster visible |
| TC-ATT-002 | Supervisor cannot view other event roster | Security/API/Manual QA | P0 | Denied server-side |
| TC-ATT-003 | Mark present/absent/excused | Module/Action/UI | P0 | Attendance saved |
| TC-ATT-004 | Record late minutes | Module/Action/UI | P0 | Minutes saved and valid |
| TC-ATT-005 | Invalid late minutes rejected | Module/UI | P0 | Validation error |
| TC-ATT-006 | Edit after Finance review starts denied | Action/API/UI | P0 | Locked state visible and enforced |
| TC-ATT-007 | Backup standby/took_over recorded | Module/Action/UI | P0 | Backup outcome saved |
| TC-ATT-008 | Event-day rating saved | Action/UI | P1 | Rating history updated |
| TC-ATT-009 | Mobile attendance controls usable | Responsive/UAT | P0 | Actions reachable on phone viewport |

### 10.10 Payment Calculation, Review, Approval, Export

Source refs: UC-023 to UC-026, FR-062 to FR-071, NFR-003, NFR-013, NFR-042, NFR-067.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-PAY-001 | Present worker full pay | Unit | P0 | Correct gross/net and breakdown |
| TC-PAY-002 | Absent worker pay rule | Unit | P0 | Correct pay per configured rule |
| TC-PAY-003 | Excused worker pay rule | Unit | P0 | Correct pay per configured rule |
| TC-PAY-004 | Backup standby rate | Unit | P0 | Standby pay correct |
| TC-PAY-005 | Backup takeover rate | Unit | P0 | Takeover pay correct |
| TC-PAY-006 | Agreed wage overrides default | Unit/Action | P0 | Base pay source recorded |
| TC-PAY-007 | Lateness deduction tier boundary | Unit | P0 | Correct deduction at boundaries |
| TC-PAY-008 | Manual adjustment recorded | Action/UI | P0 | Adjustment and reason saved |
| TC-PAY-009 | Negative net prevented | Unit/Action | P0 | Net cannot go below zero unless approved policy changes |
| TC-PAY-010 | Recalculate 1,000 attendance rows | Performance | P0 | Completes within 10 seconds |
| TC-PAY-011 | Finance starts review | Action/UI | P0 | Batch state changes and attendance locks |
| TC-PAY-012 | Owner/Admin approves batch | Action/UI | P0 | Approval actor/time saved |
| TC-PAY-013 | Export before approval denied | Action/API | P0 | Export blocked |
| TC-PAY-014 | Approved payment CSV/XLSX export | Export/Integration | P0 | File columns correct and logged |

### 10.11 Reports, Dashboards, Audit

Source refs: UC-027 to UC-028, FR-072 to FR-077, FR-081 to FR-084, NFR-032 to NFR-034.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-RPT-001 | Owner dashboard shows payment approvals | Manual QA | P1 | Urgent items reachable |
| TC-RPT-002 | Coordinator dashboard shows understaffed roles | UI/API | P1 | Underfilled roles visible |
| TC-RPT-003 | Finance dashboard shows payment review queues | UI/API | P1 | Correct batches visible |
| TC-RPT-004 | Roster report role-safe | Action/UI | P1 | Only allowed columns visible |
| TC-RPT-005 | Attendance report accurate | Action/Integration | P1 | Matches attendance records |
| TC-RPT-006 | Budget/profit report accurate | Module/Action | P1 | Margin summary correct |
| TC-RPT-007 | Sensitive report data hidden from Viewer | Security/API/UI | P0 | No payment/sensitive leak |
| TC-RPT-008 | Audit log immutable to normal users | Security/Integration | P0 | No update/delete by app users |
| TC-RPT-009 | Audit entry contains actor/action/entity/time | Integration | P0 | Required fields present |

### 10.12 Settings and Localization

Source refs: FR-085 to FR-088, NFR-051 to NFR-054.

| Test ID | Scenario | Type | Priority | Expected result |
|---|---|---|---|---|
| TC-I18N-001 | Arabic RTL default | Manual QA | P0 | Layout direction RTL by default |
| TC-I18N-002 | English fallback | Manual QA | P1 | UI labels switch/fallback without broken text |
| TC-I18N-003 | Mixed Arabic/English names | UI | P1 | Text direction and truncation usable |
| TC-I18N-004 | SAR money formatting | Unit/UI | P1 | Amounts display consistently |
| TC-I18N-005 | Asia/Riyadh time handling | Unit/Integration | P0 | Stored/displayed dates correct |
| TC-I18N-006 | Hijri display option | UI/Unit | P2 | Key event dates can display Hijri when enabled |

---

## 11. Role Permission Test Matrix

Each row requires:

- positive test for allowed role;
- negative API/action test for disallowed role;
- UI visibility test where applicable.

| Capability | Owner | Admin | HR | Coordinator | Supervisor | Finance | Viewer | Worker token |
|---|---|---|---|---|---|---|---|---|
| Manage users/roles | Allow | Allow | Deny | Deny | Deny | Deny | Deny | N/A |
| Import applicants | Allow | Allow | Allow | Deny | Deny | Deny | Deny | N/A |
| Review applicants | Allow | Allow | Allow | Deny | Deny | Deny | Deny | N/A |
| Manage staff profiles | Allow | Allow | Allow | Limited/TBD | Deny | Deny | View limited/TBD | N/A |
| View staff files | Allow | Allow | Allow | Limited/TBD | Deny | Deny | Deny | N/A |
| Manage clients/events | Allow | Allow | Limited/TBD | Allow | Deny | View limited/TBD | View limited/TBD | N/A |
| Manage budget/wages | Allow | Allow | Deny | Limited/TBD | Deny | View/review limited | View limited/TBD | N/A |
| Assign staff | Allow | Allow | Limited/TBD | Allow | Deny | Deny | Deny | N/A |
| Send WhatsApp invitations | Allow | Allow | Limited/TBD | Allow | Deny | Deny | Deny | N/A |
| Confirm/decline assignment | N/A | N/A | N/A | N/A | N/A | N/A | N/A | Allow own token only |
| Issue contracts | Allow | Allow | Allow | Limited/TBD | Deny | Deny | Deny | Contract token limited |
| Record attendance | Allow/TBD | Allow/TBD | Deny | Deny | Assigned events only | Deny | Deny | N/A |
| Review payment list | Allow | Allow | Deny | Deny | Deny | Allow | Deny | N/A |
| Approve payment list | Allow | Allow | Deny | Deny | Deny | Deny/TBD | Deny | N/A |
| Export approved payments | Allow | Allow | Deny | Deny | Deny | Allow | Deny | N/A |
| View reports | Allow | Allow | Limited | Limited | Assigned event limited | Finance reports | View-only limited | N/A |

`TBD` items must be confirmed before final permission tests are locked.

---

## 12. Form Validation Tests

Every form must include:

- required-field validation;
- type/format validation;
- max length where applicable;
- duplicate handling where applicable;
- server-side validation matching client-side validation;
- Arabic/English input behavior;
- loading state;
- submission error;
- success state;
- locked/read-only state where applicable;
- unsaved-change warning for long forms.

| Form | Required validation focus |
|---|---|
| Login | email/password required, invalid credentials, inactive user |
| User create/edit | role required, valid email, active/inactive status, person link optional/valid |
| Applicant review | phone required, duplicate resolution, accept/reject reason if required |
| Person profile | name, phone, type, status, city, gender, files, skills |
| Client | name/contact fields, duplicate name if rule exists |
| Event | client, date/time, location, status, required operational fields |
| Event role/headcount | role, required count, backup count/rate, non-negative values |
| Budget line | line type, amount numeric/decimal, billable vs cost, no float artifacts |
| Lateness tier | min/max minute ranges, overlap rejection, deduction amount |
| Assignment | person/event role required, duplicate rejection, agreed wage auth |
| WhatsApp template | template key, language, required variables |
| Contract upload | PDF type, max size, assignment/contract link, permission |
| Attendance | status, late minutes, note optional, lock state |
| Backup outcome | standby/took_over values, valid with attendance |
| Rating | rating range/criteria, role permission |
| Payment adjustment | amount, reason, non-negative net result |
| Settings | locale, currency, timezone, Hijri toggle, tenant defaults |

---

## 13. File, WhatsApp, Payment, Report Special Tests

### 13.1 File Tests

| Test focus | Required result |
|---|---|
| Private storage | Raw object URL is not public |
| Signed URL | Generated only for authorized user and limited time |
| MIME validation | Wrong type rejected |
| Size limit | Oversized file rejected |
| Metadata | file type, entity link, uploader, created_at stored |
| Deletion/retention | TBD until retention policy confirmed |
| Virus scanning | Recommended default, TBD if provider/tool selected |

### 13.2 WhatsApp Tests

| Test focus | Required result |
|---|---|
| Template variable validation | Missing variable blocks send |
| Provider send failure | Failure logged and retryable |
| Duplicate webhook | One business effect only |
| Confirm/decline mapping | Button/text maps to correct assignment response |
| Contract media download failure | Contract remains pending/error visible |
| Consent missing | Send blocked or flagged |
| Token expiry | Expired token cannot act |

### 13.3 Payment Tests

| Test focus | Required result |
|---|---|
| Pure calculator fixtures | Expected gross/deduction/net/breakdown |
| Decimal precision | No float rounding artifacts |
| Tier boundaries | Correct deduction at every boundary |
| Manual adjustments | reason and actor stored |
| Negative net | prevented |
| Approval lock | payment-relevant edits blocked |
| Export gate | approved batches only |

### 13.4 Report/Export Tests

| Test focus | Required result |
|---|---|
| Column accuracy | export columns match approved format |
| Permission gating | sensitive columns excluded by role |
| CSV/XLSX generation | valid file opens and data correct |
| Export run history | actor/time/filter/status stored |
| Large export | does not block UI |

---

## 14. Responsive and Device Tests

| Area | Desktop | Tablet | Mobile |
|---|---|---|---|
| Internal admin shell | Full sidebar, dense tables | Collapsible sidebar, tables still usable | Limited admin support, avoid broken layout |
| Staff database | Table-first, filters visible | Table horizontal scroll/priority columns | Key filters and simplified list if needed |
| Event workspace | Object tabs visible | Tabs scroll or wrap predictably | Critical tabs accessible, no overlap |
| Budget grid | Spreadsheet grid | Horizontal scroll allowed | Read/review only unless mobile editing approved |
| Supervisor attendance | Usable but not primary | Usable | Primary path, large roster rows, safe status controls |
| Worker token pages | Simple centered flow | Simple flow | Primary path, large controls, file upload usable |
| Payment review | Table/grid review | Horizontal scroll | Review only unless approved; no hidden totals |

Required viewport smoke set:

- desktop: 1440 x 900;
- laptop: 1280 x 800;
- tablet: 768 x 1024;
- mobile: 390 x 844;
- small mobile: 360 x 740.

---

## 15. Accessibility Tests

Source refs: NFR-047, Phase 7 accessibility requirements.

Required checks:

| Test ID | Check | Priority | Expected result |
|---|---|---|---|
| TC-A11Y-001 | Keyboard navigation through shell and forms | P0 | Logical focus order, no traps except dialogs |
| TC-A11Y-002 | Visible focus indicator | P0 | Focus visible on all interactive controls |
| TC-A11Y-003 | Form labels and errors | P0 | Inputs have labels, errors linked to fields |
| TC-A11Y-004 | Dialog focus trapping | P1 | Focus stays in dialog and returns on close |
| TC-A11Y-005 | Table semantics | P1 | Headers, row selection, sortable controls announced |
| TC-A11Y-006 | Touch target size | P0 for mobile supervisor/token | Critical actions are easy to tap |
| TC-A11Y-007 | Color contrast | P0 | Text/status/focus colors meet practical WCAG AA target |
| TC-A11Y-008 | Status not color-only | P0 | Text/icon/label accompanies color |
| TC-A11Y-009 | 200% zoom | P1 | Core pages remain usable without overlap |
| TC-A11Y-010 | Reduced motion | P2 | Motion does not block use |
| TC-A11Y-011 | RTL screen reader order | P1 | Arabic layout reading order is coherent |

Recommended tools:

- manual accessibility checks for critical pages;
- keyboard manual pass;
- browser zoom pass;
- mobile touch manual pass.

---

## 16. Security and Privacy Tests

| Test ID | Scenario | Priority | Expected result |
|---|---|---|---|
| TC-SEC-001 | Password not stored/logged plaintext | P0 | Hash only; logs clean |
| TC-SEC-002 | Session cookie security | P0 | HttpOnly/Secure/SameSite per environment |
| TC-SEC-003 | Direct API call without auth | P0 | Denied |
| TC-SEC-004 | Role bypass via UI-hidden route/API | P0 | Denied server-side |
| TC-SEC-005 | Tenant object ID guessing | P0 | Cross-tenant access denied |
| TC-SEC-006 | Token page cannot access admin data | P0 | Only assignment details shown |
| TC-SEC-007 | Token page cannot see other workers | P0 | Own assignment only |
| TC-SEC-008 | Expired/used token behavior | P0 | Safe expired/completed state |
| TC-SEC-009 | Signed file URL role gating | P0 | Unauthorized denied |
| TC-SEC-010 | Sensitive data in logs | P0 | No passwords, tokens, raw contract URLs, CV/photo data |
| TC-SEC-011 | CSRF/session mutation protection | P1 | Protected mutations cannot be forged |
| TC-SEC-012 | Rate limiting recommendation | P2 | Recommended for login/token endpoints, exact policy TBD |
| TC-SEC-013 | Consent enforcement before messaging | P0 | Missing consent blocks/flags send |
| TC-SEC-014 | Audit log tamper prevention | P0 | Normal users cannot modify audit logs |

---

## 17. Performance Tests

| Test ID | NFR | Scenario | Dataset | Target |
|---|---|---|---|---|
| TC-PERF-001 | NFR-001 | Common staff filters | 10,000 persons | under 2 seconds |
| TC-PERF-002 | NFR-002 | Owner/Admin dashboard load | representative active events/payments | under 3 seconds normal load |
| TC-PERF-003 | NFR-003 | Payment recalculation | 1,000 attendance records | under 10 seconds |
| TC-PERF-004 | NFR-004 | Applicant import | TBD row count, recommended 1,000 rows | async/non-blocking UI |
| TC-PERF-005 | NFR-005 | Export payment/report | TBD row count, recommended 5,000 rows | async or completes without blocking normal UI |
| TC-PERF-006 | NFR-009 | Background job processing | import/message/export jobs | retries and status visible |

Open issue: exact staff/event/payment volume must be confirmed for final load profile.

---

## 18. UAT Plan

UAT should use a staging environment with representative MAG Events data.

### 18.1 UAT Roles

| Role | UAT responsibility |
|---|---|
| Owner | Approve business scope, payment approval, dashboards, budget/profit visibility |
| Admin | Validate user/event/config/admin workflows |
| HR / Recruiter | Validate applicant import, review, screening, interviews, contracts |
| Coordinator | Validate filtering, groups, assignment, invitations, roster status |
| Supervisor | Validate mobile event-day roster, attendance, lateness, backup, ratings |
| Finance / Accountant | Validate payment review, approval readiness, export |
| Viewer | Validate read-only report access |
| Worker tester | Validate token confirm/decline and contract upload/view |

### 18.2 UAT End-to-End Scenarios

| UAT ID | Scenario | Roles | Source UCs | Pass criteria |
|---|---|---|---|---|
| UAT-001 | Import applicant from Google Sheet and accept into staff | HR/Admin | UC-001 to UC-003 | Valid row appears, duplicate warning works, person created |
| UAT-002 | Create event with roles/headcount/budget | Admin/Coordinator/Owner | UC-006 to UC-010 | Event workspace complete, budget summary correct |
| UAT-003 | Filter staff, create group, assign roster | Coordinator | UC-011 to UC-013 | Required role headcount can be filled |
| UAT-004 | Send WhatsApp invite and worker confirms | Coordinator/Worker | UC-014 to UC-015 | Message logged, assignment confirmed |
| UAT-005 | Issue and receive contract | HR/Worker/Admin | UC-016 to UC-017 | Contract status updates, file stored privately |
| UAT-006 | Approve final roster | Owner/Admin/Coordinator | UC-018 | Approval state visible |
| UAT-007 | Supervisor records attendance and lateness on phone | Supervisor | UC-019 to UC-020 | Mobile flow is fast and safe |
| UAT-008 | Record backup takeover and rating | Supervisor | UC-021 to UC-022 | Backup outcome/rating saved |
| UAT-009 | Calculate and review payments | System/Finance | UC-023 to UC-024 | Payment lines and breakdowns are correct |
| UAT-010 | Approve and export payment list | Owner/Admin/Finance | UC-025 to UC-026 | Approved export is accurate |
| UAT-011 | View dashboards and reports | Owner/Admin/Finance/Viewer | UC-027 to UC-028 | Role sees correct data only |
| UAT-012 | Manage users and WhatsApp templates | Owner/Admin | UC-029 to UC-030 | Roles/templates update as expected |

### 18.3 UAT Sign-Off Checklist

- [ ] MVP scope matches BRD and SRS.
- [ ] No Severity 1 or Severity 2 bugs remain.
- [ ] All critical payment cases approved by Owner/Finance.
- [ ] Supervisor mobile flow accepted by event operations tester.
- [ ] Worker token flow accepted on phone.
- [ ] Sensitive data access accepted by Owner/Admin.
- [ ] Reports/export format accepted, or gaps listed as approved TBD.
- [ ] Arabic RTL usability accepted for core flows.
- [ ] Deployment smoke test passed in staging.
- [ ] Backup/restore evidence exists before pilot.

---

## 19. Acceptance Criteria

MVP is accepted when all conditions below are true.

### 19.1 Product Acceptance

Derived from SRS acceptance criteria:

1. Owner/Admin can create users, clients, staff, events, roles, budgets, wage rules, and settings.
2. HR can import applicant rows from Google Sheets into a review queue.
3. HR can review applicants, detect duplicates, create/merge person profiles, screen, interview, and score candidates.
4. Coordinator/Admin can filter staff, create groups, assign staff, send WhatsApp invitations, and track confirmations.
5. Worker can confirm/decline through WhatsApp or token page without internal login.
6. HR/Admin can issue contracts and store signed contract files.
7. Supervisor can access only assigned events and record attendance, lateness, backup outcome, notes/ratings on mobile.
8. Payment Calculator creates auditable payment lines from attendance, backup, lateness, wage/rate, and adjustment rules.
9. Finance can review payment lists and export approved payment data.
10. Owner/Admin can approve final payment list.
11. Reports exist for roster, headcount, attendance, payment, budget/profit, and ratings basics.
12. Arabic-first RTL and English fallback work across core screens.
13. Sensitive files/payment data are restricted by role.
14. Audit logs capture critical budget, wage, attendance, contract, roster, and payment changes.

### 19.2 Technical Acceptance

1. Production code follows TDD and has RED/GREEN evidence.
2. CI runs tests, typecheck, lint/build gates.
3. API enforces permissions server-side.
4. Database migrations are source-controlled and tested.
5. `tenant_id` is present and enforced in tenant-owned data paths.
6. Private file storage and signed URL access are implemented.
7. Secrets are not committed or logged.
8. Backups and restore test exist before pilot.
9. Monitoring/logging for imports, WhatsApp, jobs, API errors, payment errors exists.
10. Dense operational pages are not implemented as generic card grids.

---

## 20. Bug Severity Levels

| Severity | Definition | Examples | Release rule |
|---|---|---|---|
| S1 Critical | Blocks core business operation, data corruption, payment wrong, security/privacy leak | wrong payment net, cross-tenant data leak, worker token exposes other worker, app cannot login | Must fix before pilot/release |
| S2 High | Major workflow broken with no reasonable workaround | cannot import applicants, attendance lock broken, WhatsApp responses not processed, contract files inaccessible | Must fix before pilot unless formally accepted |
| S3 Medium | Important defect with workaround | dashboard count wrong but report correct, UI state confusing, export column order issue | Can release only with owner-approved workaround |
| S4 Low | Minor UI/copy/cosmetic issue not affecting workflow | typo, minor alignment, non-critical empty state | Can defer |

Bug report must include:

- title;
- severity;
- environment;
- role/user;
- steps to reproduce;
- expected result;
- actual result;
- screenshots/logs if useful;
- related UC/FR/test ID;
- regression test added before fix.

---

## 21. Test Data Requirements

Minimum staging test data:

| Data set | Minimum content |
|---|---|
| Users | Owner, Admin, HR, Coordinator, Supervisor, Finance, Viewer |
| Staff/persons | 50 manual profiles plus generated 10,000 profile performance seed |
| Applicants | valid rows, missing fields, duplicate phone, rejected applicant |
| Clients | at least 3 clients |
| Events | active event, upcoming event, completed event, cancelled event |
| Event roles | multiple roles with different headcounts and backup rates |
| Assignments | pending, invited, confirmed, declined, contracted, attended |
| Contracts | pending, sent, signed, failed upload, manual upload |
| Attendance | present, late, absent, excused, backup standby, backup takeover |
| Payments | unreviewed, in review, approved, exported, adjustment cases |
| Messages | sent, delivered, failed, duplicate webhook event |
| Files | photo, CV, contract PDF |
| Audit logs | budget change, attendance edit, payment approval, roster approval |

---

## 22. Traceability Matrix

| Business goal | Use cases | FRs | Test focus | Key test IDs |
|---|---|---|---|---|
| Centralize workforce data | UC-001 to UC-003, UC-011 | FR-009 to FR-018 | import, dedupe, profile, filtering | TC-IMP-001 to TC-IMP-008, TC-STF-001 to TC-STF-005 |
| Faster staffing | UC-011 to UC-018 | FR-017, FR-021 to FR-048 | groups, assignment, WhatsApp, roster | TC-STF-004 to TC-STF-007, TC-ASN-001 to TC-ASN-007, TC-MSG-001 to TC-MSG-008 |
| Accurate event budget/profit | UC-007 to UC-010, UC-027 | FR-030 to FR-038, FR-076 | event setup, budget, money precision | TC-EVT-001 to TC-EVT-008, TC-RPT-006 |
| Contract tracking | UC-016 to UC-017 | FR-049 to FR-053, FR-080 | issue, status, upload, private files | TC-CON-001 to TC-CON-007 |
| Attendance accuracy | UC-019 to UC-021 | FR-054 to FR-059 | supervisor scope, attendance, backup, lock | TC-ATT-001 to TC-ATT-007 |
| Payment accuracy | UC-023 to UC-026 | FR-062 to FR-071 | calculator, approval, export | TC-PAY-001 to TC-PAY-014 |
| Operational visibility | UC-027 to UC-028 | FR-072 to FR-077 | dashboard/report permissions | TC-RPT-001 to TC-RPT-007 |
| WhatsApp workforce flow | UC-014, UC-015, UC-017, UC-030 | FR-044 to FR-048 | send, response, token, webhook | TC-MSG-001 to TC-MSG-008 |
| Arabic-first operations | All core UCs | FR-085 to FR-088 | RTL, i18n, localization | TC-I18N-001 to TC-I18N-006, TC-A11Y-011 |
| Sensitive access control | UC-029 and cross-cutting | FR-005 to FR-008, FR-081 to FR-084 | RBAC, tenant, file, audit | TC-RBAC-001 to TC-RBAC-006, TC-SEC-001 to TC-SEC-014 |

---

## 23. Open Questions

| ID | Question | Owner | Blocking? |
|---|---|---|---|
| TQA-Q001 | What exact Google Sheet columns and sample data should be used for import fixtures? | Client/Admin | Blocks final import fixtures |
| TQA-Q002 | What exact payment export columns and format are required? | Finance/Owner | Blocks final export snapshot |
| TQA-Q003 | What exact shift types and rate lookup rules are approved? | Owner/Finance/Admin | Blocks final payment golden fixtures |
| TQA-Q004 | Can Finance approve payments, or only Owner/Admin? | Owner | Blocks permission matrix finalization |
| TQA-Q005 | Is MFA required for Owner/Admin in MVP? | Owner | Blocks auth security scope |
| TQA-Q006 | Is offline attendance in MVP, or online-only with clear connection errors? | Operations | Blocks mobile poor-network scope |
| TQA-Q007 | What retention policy applies to applicants, CVs, photos, contracts, payments, and audit logs? | Owner/Legal | Blocks retention/deletion tests |
| TQA-Q008 | Which hosting and object storage provider will be used? | Owner/Technical | Blocks provider-specific deployment/restore tests |

---

## 24. Approval Checklist

Approve this Phase 11 plan if these decisions are accepted:

1. MVP testing follows risk-based coverage with payment, RBAC, attendance, import, WhatsApp, contracts, and reports as highest-risk areas.
2. TDD RED/GREEN evidence is required for implementation acceptance.
3. UAT uses role-based end-to-end scenarios in staging.
4. No Severity 1 or Severity 2 bugs may remain before pilot unless explicitly accepted by owner.
5. Online-first Supervisor attendance is the default until offline behavior is explicitly approved.
6. Payment export, shift taxonomy, and Google Sheet columns remain open until client confirmation.
