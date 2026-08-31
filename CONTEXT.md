# Zell-force Context

This file defines project domain language for architecture, requirements, tests, and future code.

## Product

Zell-force is an Arabic-first event staffing operations platform for MAG Events in Saudi Arabia. It manages event workforce intake, staffing, contracts, attendance, ratings, WhatsApp communication, budget tracking, and payment calculation.

## Core Domain Terms

| Term | Meaning |
|---|---|
| Tenant | Agency/account that owns all operational data. MVP runs one tenant, but schema is multi-tenant-ready. |
| Person | Workforce record. Can be temp or permanent staff. |
| Temp | Casual event worker. Does not log into admin app in MVP. |
| Permanent Staff | Internal staff member who can also be assigned to events. May have admin login if given role. |
| User | Internal login account with a role. May link to a Person. |
| Client | Company hiring MAG Events for an event. No client login in MVP. |
| Event | Staffing project with client, location, dates, roles, budget, roster, attendance, and payments. |
| Job Role | Staffing role for event work, such as host, usher, driver, hospitality staff. Not same as User role. |
| User Role | App permission role: owner, admin, hr, coordinator, supervisor, finance, viewer. |
| Event Role | Required headcount and backup count for one Job Role in one Event. |
| Master Sheet | Two-sided Event budget: billable income side and cost side. |
| Billable | Amount charged to Client. |
| Cost | Amount paid/spent by MAG Events for staff, vendors, meals, transport, operations, or other costs. |
| Assignment | Connection between Person and Event. It is workflow spine for sourcing, contracts, attendance, ratings, and payments. |
| Assignment Pipeline | Stages from candidate/screening/interview/offered to accepted/confirmed/declined/rejected/withdrawn. |
| Applicant Intake | Google Form/Google Sheet data flow into Zell-force review queue. |
| Review Queue | Staging area where imported applicant rows are validated, deduplicated, rejected, merged, or promoted to Person records. |
| Staff Group | Saved manual or smart group of Persons used for assignment and messaging. |
| Smart Group | Criteria-based Staff Group refreshed from filters. |
| Interview Rating | Candidate evaluation score captured during recruitment/interview. Separate from Event-Day Rating. |
| Event-Day Rating | Performance score from actual event work. Separate from Interview Rating. |
| Contract | Event assignment contract tracked as draft, sent, signed, declined, or expired. |
| Attendance Record | Per assignment, per work date attendance/lateness/backup outcome record. |
| Backup Standby | Backup attends but does not take over. Paid standby rate. |
| Backup Takeover | Backup replaces absent/removed worker. Paid active rate. |
| Payment Line | Calculated pay output for one Attendance Record. No disbursement in MVP. |
| Payment Breakdown | Auditable explanation of base amount, rate source, lateness deduction, adjustments, and net amount. |
| WhatsApp Message | Logged inbound/outbound worker communication through Meta WhatsApp Cloud API. |
| Token Link | Short-lived worker link for scoped actions such as contract details or assignment confirmation. |

## Deep Module Candidates

These are expected to become deep Modules with small Interfaces and strong tests:

| Module | Purpose |
|---|---|
| Applicant Intake Import | Import Google Sheet rows, validate, dedupe, stage for review. |
| Staff Filtering | Query/filter Persons by operational criteria quickly. |
| Assignment Pipeline | Own assignment stage transitions and invariants. |
| Budget Engine | Manage billable/cost budget lines and summary values. |
| Attendance Capture | Record attendance, lateness, backup outcome, locking rules. |
| Payment Calculator | Pure calculation from attendance/rates/penalties/adjustments to Payment Line. |
| WhatsApp Messaging | Send templates, process webhooks, dedupe messages, log statuses. |
| Contract Ingestion | Issue contracts and ingest signed PDFs from WhatsApp/manual upload. |
| Report Export | Generate CSV/XLSX outputs for rosters, attendance, payment, and budget. |
| Audit Log | Record changes to money, attendance, roster, contract, and permission-sensitive data. |

## Accepted Product Constraints

- MVP timeline: 10-12 calendar weeks.
- Google Form intake stays; Zell-force imports from linked Google Sheet/API.
- Worker interaction stays WhatsApp/token links; no crew app in MVP.
- Payment calculation only; no payment disbursement/WPS in MVP.
- Arabic-first RTL UI with English fallback and Hijri option.
- KSA data residency required.
- Single tenant first; multi-tenant-ready schema using `tenant_id`.

## Development Conventions

- `bun run test` runs the full Vitest suite.
- `bun run typecheck` runs TypeScript project references.
- `bun run build` runs package build checks across the workspace.
- `bun run ci` runs the local CI-equivalent gate: typecheck, lint, test, build.
- Frontend screen acceptance uses manual QA in `docs/QA.md`; automated tests cover backend/domain/contracts/config/platform/package UI primitives and selected non-rendering web logic.
- `bun run dev` starts Next.js and Express development processes through Turborepo; copy `.env.example` to `.env` first.
- `bun run test:db:integration` runs Docker/Postgres-backed DB integration and requires `TEST_DATABASE_URL`.
- Local Docker test DB convention: container `zellforce-postgres-test`, port `54329`, URL `postgres://zellforce:zellforce_test@localhost:54329/zellforce_test`.
- Runtime stack decision: Next.js + React web app and Express.js TypeScript API.
- Auth library decision: Better Auth for internal user email/password sessions on Express API.
- UI foundation decision: Arabic is default, `next-intl` runs without locale URL prefixes, locale persists in `zf_locale`, and density is fixed to comfortable for MVP.
- `packages/ui` owns reusable design tokens and React primitives; `apps/web` owns locale loading, route composition, auth state, navigation registry, API data, and status-to-visual mapping.
- Better Auth owns identity, password hashes, cookies, and sessions using default `"user"`, `session`, `account`, and `verification` tables.
- Zell-force `users` owns tenant, role, active state, and optional Person link through `auth_user_id`.
- Applicant import uses `ApplicantSheetReader` for Google Sheet reads, `ApplicantImportRepository` for staging/review persistence, and applicant Actions for permission checks, validation outcomes, review decisions, and audit writes.
- `/recruitment/applicants` is the Phase 4 applicant review route; it can run a Google Sheet sync, show invalid/duplicate rows, accept/create Person, merge/reject/defer, schedule interview, and record score. It uses shared table/form primitives and does not replace the Google Form source.
- Google Sheets runtime auth uses service-account env vars `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`; sheet ID/range are supplied to the import Action request until tenant-level source settings are confirmed.
- `bun run bootstrap:owner --tenant-slug=... --full-name=... --email=... --password=...` creates first Owner for an empty tenant.
- `bun run smoke:workspace` verifies workspace public Interface imports.
- `bun run smoke:env` verifies runtime env schema failure behavior.
