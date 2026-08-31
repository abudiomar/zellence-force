# Non-Functional Requirements Specification

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Draft v0.1  
**Source inputs:** BRD, Stakeholder/User Role Analysis, Use Cases, Functional Requirements, `SYSTEM_ARCHITECTURE.md`, `database.js`, Engineering Methodology  
**Date:** 2026-06-10

---

## 1. Purpose

This document defines the quality, security, performance, reliability, maintainability, localization, compliance, and operational requirements for Zell-force MVP.

These requirements apply to all MVP modules unless a specific exception is documented.

---

## 2. Scope

MVP quality expectations cover:

- Arabic-first internal admin platform;
- WhatsApp/token-link worker interactions;
- Google Forms/Sheets applicant intake import;
- staff database and filtering;
- event budgeting and staffing;
- attendance and payment calculation;
- file handling for CVs, photos, and contracts;
- reports and exports;
- auditability for sensitive business actions.

Future SaaS, client portal, payment disbursement, WPS, and advanced analytics are out of MVP unless explicitly moved into scope.

---

## 3. NFR Summary

| Area | MVP Target |
|---|---|
| Performance | Staff filters under 2 seconds for 10,000 staff profiles; dashboard pages under 3 seconds under normal load |
| Availability | 99.5% monthly uptime target, excluding planned maintenance |
| Recovery | RPO 24 hours, RTO 4-8 hours |
| Security | RBAC, tenant scoping, strong password hashing, audit logs, least privilege |
| Privacy | KSA-region hosting/storage/backups; consent records; sensitive data restrictions |
| Accessibility | WCAG 2.1 AA where practical for core workflows |
| Localization | Arabic-first RTL, English fallback, Hijri display option, SAR currency, Asia/Riyadh timezone |
| Browser/device | Latest Chrome, Edge, Safari; responsive desktop/tablet/mobile web |
| Maintainability | TDD, deep Modules, explicit Interfaces, DRY config truth |
| Monitoring | Error logs, import logs, webhook logs, job failure alerts |
| Retention | TBD / needs legal confirmation |

---

## 4. Performance Requirements

### NFR-001: Staff filtering performance

The system shall return common staff filter results in under 2 seconds for up to 10,000 staff profiles under normal production load.

**Measurement:** city, gender, person type, status, skills, and rating filters tested against seeded dataset.  
**Rationale:** staff filtering is core daily value and must feel instant.  
**Related FRs:** FR-017, FR-018, FR-021, FR-022.

### NFR-002: Dashboard page response time

The system shall load core dashboard pages in under 3 seconds under normal production load.

**Core dashboards:** Owner, Admin, HR, Coordinator, Supervisor, Finance.  
**Rationale:** ops staff need fast repeated use.  
**Needs confirmation:** exact concurrent user count.

### NFR-003: Payment calculation speed

The system shall calculate or recalculate payment lines for a normal event within 10 seconds for up to 1,000 attendance records.

**Rationale:** payment calculation must support event closing and finance review without blocking manual spreadsheet fallback.  
**Related FRs:** FR-062 to FR-067.

### NFR-004: Import sync performance

The system shall process Google Sheet applicant import in batches without blocking normal user activity.

**Recommended target:** process 1,000 rows in under 60 seconds, excluding Google API latency.  
**Rationale:** applicant intake can grow and must not freeze admin UI.  
**Related FRs:** FR-009 to FR-013.

### NFR-005: Report export performance

The system shall generate CSV/XLSX exports for common MVP reports without timing out.

**Recommended target:** exports up to 10,000 rows complete within 60 seconds.  
**Reports:** roster, attendance, payment list, budget/profit summary.  
**Related FRs:** FR-071 to FR-077.

---

## 5. Scalability Requirements

### NFR-006: Heavy-scale readiness

The system shall be designed for hundreds to thousands of staff profiles in MVP and at least 10,000 staff profiles without major redesign.

**Rationale:** exact MAG Events staff pool size is TBD, but heavy-scale readiness was requested.  
**Design notes:** indexed filters, pagination, query limits, background jobs.

### NFR-007: Multi-tenant-ready schema

The system shall include `tenant_id` on tenant-owned data from the beginning.

**Rationale:** MVP is single tenant, but future SaaS requires tenant isolation.  
**Acceptance:** database queries must be tenant-scoped.  
**Related source:** `database.js`, `SYSTEM_ARCHITECTURE.md`.

### NFR-008: Future RLS readiness

The system shall keep PostgreSQL Row-Level Security activation feasible without major data migration.

**MVP status:** RLS-ready, not necessarily active.  
**Future trigger:** second tenant onboarding.

### NFR-009: Background job scalability

The system shall run non-interactive work as background jobs where appropriate.

**Examples:** applicant import, WhatsApp reminders, payment recalculation, smart-group refresh, rating aggregation.  
**Rationale:** keeps UI responsive and avoids request timeouts.

---

## 6. Availability and Reliability Requirements

### NFR-010: Availability target

The system shall target 99.5% monthly uptime during MVP, excluding planned maintenance.

**Rationale:** realistic for pilot while still business-focused.  
**Needs confirmation:** event-day support hours and SLA expectations.

### NFR-011: Planned maintenance

The system shall allow planned maintenance windows to be communicated before production-impacting work.

**Recommended default:** outside active event hours where possible.  
**Needs confirmation:** MAG Events typical event operation hours.

### NFR-012: Idempotent WhatsApp webhook handling

The system shall process WhatsApp webhooks idempotently using WhatsApp message IDs or equivalent dedupe keys.

**Rationale:** webhooks can retry; duplicate confirm/decline/media events must not corrupt workflow.  
**Related FRs:** FR-046, FR-048, FR-051.

### NFR-013: Transactional payment-related writes

The system shall keep attendance, payment recalculation, and budget actual updates consistent.

**Rationale:** partial writes can cause payment disputes and wrong margins.  
**Acceptance:** payment-relevant updates either complete fully or fail safely with visible error.

### NFR-014: Graceful integration failure

The system shall handle external integration failures without losing user-entered data.

**Integrations:** Google Sheets, Meta WhatsApp Cloud API, object storage.  
**Acceptance:** failures are logged, surfaced to authorized users, and retriable.

---

## 7. Backup and Recovery Requirements

### NFR-015: Database backups

The system shall perform automated PostgreSQL backups at least daily.

**Retention recommended default:** 30 days.  
**Rationale:** protects operational data, payment records, contracts, and audit history.

### NFR-016: Object storage backups

The system shall protect uploaded files through object storage backup/versioning or equivalent recovery mechanism.

**Files:** CVs, photos, signed contracts.  
**Rationale:** signed contracts and staff docs are business-critical.

### NFR-017: Restore testing

The system shall verify backup restore before pilot launch.

**Acceptance:** documented restore test with date, environment, and result.

### NFR-018: Recovery objectives

The system shall target:

- RPO: 24 hours
- RTO: 4-8 hours

**Rationale:** practical MVP default.  
**Needs confirmation:** whether event-day operations require shorter recovery.

---

## 8. Security Requirements

### NFR-019: Authentication security

The system shall store passwords using strong one-way hashing such as Argon2 or bcrypt.

**Acceptance:** plaintext passwords are never stored or logged.

### NFR-020: Role-based access control

The system shall enforce role-based access at page/action level.

**Roles:** owner, admin, hr, coordinator, supervisor, finance, viewer.  
**Acceptance:** unauthorized route and action requests are denied server-side, not only hidden in UI.  
**Related FRs:** FR-005 to FR-008.

### NFR-021: Tenant-scoped access

The system shall scope tenant-owned queries by tenant.

**Acceptance:** user from one tenant cannot access another tenant's data, even by direct ID.  
**MVP:** single tenant but enforce pattern from start.

### NFR-022: Least privilege for sensitive data

The system shall restrict sensitive fields and files to roles that need them.

**Sensitive data:** photos, CVs, appearance notes, contracts, payment amounts, audit records.  
**Acceptance:** Finance cannot access photos/CVs by default; Viewer cannot access payment amounts by default.

### NFR-023: Secure token links

The system shall generate worker token links that are scoped, time-limited, and non-admin.

**Allowed use:** contract/details/confirmation workflows.  
**Acceptance:** token link cannot expose other workers, admin pages, budgets, or payment details.

### NFR-024: Secrets management

The system shall store secrets outside source code.

**Secrets:** database URL, Google credentials, Meta WhatsApp token, object storage keys, session secrets.  
**Acceptance:** secrets are loaded from environment variables or managed secret store.

### NFR-025: Production HTTPS

The system shall require HTTPS in production.

**Rationale:** protects credentials, tokens, files, and personal data in transit.

### NFR-026: MFA recommendation

The system should support MFA for Owner/Admin as a future or fast-follow security enhancement.

**MVP default:** optional unless client requires it.  
**Reason:** strong security value but may affect 10-12 week delivery.

---

## 9. Privacy and Compliance Requirements

### NFR-027: KSA data residency

The system shall host production database, object storage, and backups in a Saudi Arabia region where available.

**Rationale:** architecture source marks KSA data residency as decided.

### NFR-028: Consent tracking

The system shall store consent records for WhatsApp/data processing.

**Acceptance:** messaging is blocked or flagged if consent is missing.  
**Related FRs:** FR-045, FR-047.

### NFR-029: PDPL-aware design

The system shall be designed with Saudi PDPL awareness for personal data access, storage, and retention.

**Status:** Needs legal confirmation for exact requirements.  
**MVP action:** restrict sensitive access, log critical changes, avoid unnecessary data collection.

### NFR-030: Sensitive data minimization

The system shall only collect sensitive worker data needed for MVP workflows.

**MVP file scope:** CV, photo, signed contract.  
**Future/TBD:** IDs, work permits, Iqama fields, bank details.

### NFR-031: Data retention policy

The system shall support a formal data retention policy once confirmed.

**Status:** TBD / needs legal confirmation.  
**Temporary default:** retain applicant/staff records unless manually deactivated; retain contracts, payment records, and audit logs for business/legal period TBD.

---

## 10. Auditability Requirements

### NFR-032: Audit log coverage

The system shall audit changes to money, staffing commitments, attendance, contracts, and sensitive access decisions.

**Covered MVP areas:** budgets, wage rules, agreed wages, roster approval, attendance edits, payment recalculation, manual adjustments, payment approval, contract status changes.

### NFR-033: Audit log content

Audit entries shall include actor, timestamp, tenant, entity type, entity ID, action, before/after values where safe, and reason where required.

**Rationale:** supports disputes and internal accountability.

### NFR-034: Audit log immutability

The system should prevent normal users from editing or deleting audit logs.

**MVP acceptance:** no UI for editing/deleting audit logs; DB permissions restricted where possible.

---

## 11. Maintainability and Architecture Requirements

### NFR-035: Mandatory TDD

The system shall be built with test-driven development for production code.

**Rule:** no production code without a failing test first.  
**Applies to:** features, bug fixes, behavior changes, refactors.  
**Exceptions:** explicit human approval only for throwaway prototypes, generated code, or pure config.

### NFR-036: Deep Module architecture

The system shall prefer deep Modules with small Interfaces and strong locality.

**Target Modules:** applicant intake import, staff filtering, assignment pipeline, budget engine, attendance capture, payment calculator, WhatsApp messaging, contract ingestion, report export, audit log.

### NFR-037: Action and operational-mechanics separation

The system shall separate Actions from reusable operational-mechanics Modules.

**Actions own:** business rules, auth, role checks, stage changes, approvals, user-facing errors.  
**Modules own:** reusable operations, provider interactions, structured results, explicit failure modes.

### NFR-038: DRY configuration truth

The system shall keep a single source of truth for configuration and domain constants.

**Examples:** roles, statuses, assignment stages, contract statuses, attendance statuses, template categories, permission map, shift types, env config.

### NFR-039: No premature abstraction

The system shall not extract shared abstractions from coincidentally similar code or before clear repetition.

**Default rule:** wait for 3 concrete instances unless duplicated config/state creates immediate bug risk.

### NFR-040: Architecture decision records

The system shall record accepted architecture decisions in `docs/adr/`.

**Acceptance:** meaningful architecture choices have ADRs before implementation depends on them.

### NFR-041: Domain context maintenance

The system shall keep core domain language in `CONTEXT.md`.

**Acceptance:** new major domain terms or sharpened definitions are added when they become load-bearing.

---

## 12. Testability Requirements

### NFR-042: Payment calculator test coverage

The payment calculator shall have unit tests for all rate sources and edge cases before implementation.

**Required cases:** absent, excused, standby, takeover, agreed wage override, cost-rate fallback, missing rate, fixed penalty, percent penalty, tier boundaries, adjustment, negative net prevention.

### NFR-043: RBAC test coverage

Role permissions shall have automated tests for allowed and denied actions.

**Roles:** owner, admin, hr, coordinator, supervisor, finance, viewer.

### NFR-044: Integration adapter tests

External integration Adapters shall return structured success/failure outcomes and be testable without calling live providers in unit tests.

**Adapters:** Google Sheets, Meta WhatsApp Cloud API, object storage.

### NFR-045: Import idempotency tests

Applicant import shall have tests proving repeated sync does not duplicate accepted/review records.

### NFR-046: Webhook idempotency tests

WhatsApp webhook handling shall have tests proving duplicate webhook delivery does not duplicate actions or corrupt state.

---

## 13. Accessibility and Usability Requirements

### NFR-047: Core accessibility

The system shall target WCAG 2.1 AA where practical for core workflows.

**Core workflows:** login, staff search, event setup, assignment, attendance, payment review.  
**Acceptance:** keyboard navigation, visible focus, labels, contrast, and screen reader-friendly form semantics where practical.

### NFR-048: Non-technical UX

The system shall be usable by non-technical operations staff.

**Acceptance:** simple language, clear statuses, bulk actions, explicit errors, predictable workflows.

### NFR-049: Supervisor mobile usability

Supervisor attendance flow shall be optimized for mobile web.

**Acceptance:** roster, attendance buttons, lateness input, backup outcome, and notes are usable on modern phone viewport.

### NFR-050: Error states

The system shall provide clear error messages and recovery steps for common failures.

**Examples:** import row invalid, WhatsApp send failed, contract media failed, payment rate missing, access denied.

---

## 14. Localization Requirements

### NFR-051: Arabic-first RTL

The system shall support Arabic-first right-to-left UI from day one.

**Acceptance:** layout, navigation, tables, forms, modals, and dashboards render correctly in RTL.

### NFR-052: English fallback

The system shall support English UI fallback.

**Acceptance:** UI copy can switch or fall back without broken labels.

### NFR-053: Hijri date display

The system shall support Hijri date display option alongside Gregorian.

**Acceptance:** key event dates can display Hijri where enabled; stored dates remain reliable.

### NFR-054: Saudi localization defaults

The system shall default tenant settings to Saudi operational context.

**Defaults:** SAR currency, Asia/Riyadh timezone, Saudi phone formatting support, Arabic language default.

---

## 15. Browser and Device Support

### NFR-055: Browser support

The system shall support latest stable versions of:

- Chrome
- Edge
- Safari

**Needs confirmation:** Firefox support.

### NFR-056: Responsive web support

The system shall support desktop, tablet, and mobile web layouts.

**Role focus:** admin/finance on desktop, coordinator on desktop/tablet, supervisor on mobile/tablet.

### NFR-057: No native mobile app dependency

The MVP shall not require a native mobile app for workers or supervisors.

**Workers:** WhatsApp/token links.  
**Supervisors:** responsive web admin access.

---

## 16. SEO Requirements

### NFR-058: SEO not core for admin MVP

The system shall not prioritize SEO for internal admin pages.

**Rationale:** Zell-force MVP is authenticated admin software.  
**Exception:** public token links should have safe metadata and no sensitive previews.

### NFR-059: Public link privacy

Public/token pages shall prevent sensitive data exposure through metadata previews where possible.

**Rationale:** worker links may be opened through messaging apps.

---

## 17. Logging and Monitoring Requirements

### NFR-060: Application error logging

The system shall log server-side application errors with enough context for debugging without exposing secrets.

**Acceptance:** logs include request ID/correlation ID where practical.

### NFR-061: Integration logging

The system shall log integration failures for Google Sheets, WhatsApp, and object storage.

**Acceptance:** authorized admin can see recent sync/message/file failures or support can inspect logs.

### NFR-062: Background job monitoring

The system shall monitor background job success/failure.

**Jobs:** imports, reminders, payment recalculation, rating aggregation, smart group refresh.

### NFR-063: WhatsApp webhook monitoring

The system shall alert or visibly report repeated WhatsApp webhook failures.

**Rationale:** messaging failure can break event staffing.

### NFR-064: Import sync monitoring

The system shall show import run history.

**Acceptance:** last run time, status, rows imported, rows failed, error summary.

---

## 18. Data Integrity Requirements

### NFR-065: UUID primary keys

The system shall use UUIDs for primary keys.

**Rationale:** already defined in `database.js`; helps future distributed/multi-tenant readiness.

### NFR-066: Timestamp consistency

The system shall use timezone-aware timestamps for operational records.

**Rationale:** event operations and audits need reliable timing.

### NFR-067: Decimal money precision

The system shall use precise numeric/decimal storage for money values.

**Acceptance:** no floating-point money math in persisted payment/budget calculations.

### NFR-068: Status validation

The system shall validate stable status values through enums or controlled lookup tables.

**Examples:** event status, assignment stage, contract status, attendance status, message status.

### NFR-069: Referential integrity

The system shall maintain relational integrity for core operational records.

**Examples:** assignments reference events/persons; contracts reference assignments; attendance references assignments; payment lines reference attendance.

---

## 19. Open NFR Questions

| ID | Question |
|---|---|
| OQ-001 | Exact concurrent internal user target? |
| OQ-002 | Exact staff pool size and event volume target? |
| OQ-003 | Exact legal retention period for applicants, CVs, photos, contracts, payment records, audit logs? |
| OQ-004 | Whether MFA is required for Owner/Admin in MVP? |
| OQ-005 | Whether RPO/RTO must be stricter during active events? |
| OQ-006 | Exact hosting provider with KSA region support? |
| OQ-007 | Whether Firefox must be supported? |
| OQ-008 | Exact accessibility acceptance depth for MVP budget/timeline? |
| OQ-009 | Whether PDF report exports are required in MVP or CSV/XLSX is enough? |
| OQ-010 | Whether token links require one-time use or time-limited multi-use per workflow? |

---

## 20. Traceability

| NFR Area | Related Requirements / Use Cases |
|---|---|
| Performance | FR-017, FR-062, FR-071, UC-011, UC-023, UC-026 |
| Security/RBAC | FR-005 to FR-008, UC-029 |
| Privacy | FR-078 to FR-080, UC-016, UC-017 |
| Auditability | FR-081 to FR-084, payment/attendance/budget workflows |
| Localization | FR-085 to FR-088 |
| Reliability | WhatsApp, import, payment, attendance workflows |
| Maintainability | `docs/00_Engineering_Methodology.md`, ADR-0001 |
| Testability | Payment, RBAC, import, webhook, contract, attendance Modules |

