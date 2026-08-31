# Deployment, Maintenance, and Handover Plan

Status: Draft for approval  
Document type: Phase 12 deployment, maintenance, support, and handover plan  
Product: Zell-force  
Business: MAG Events  
Primary region: Saudi Arabia / Gulf region  
Hosting status: Provider TBD  
Object storage status: Provider TBD  

---

## 0. Source Imports

This document defines production readiness and post-launch operations. It does not replace architecture, NFR, SRS, or testing documents.

| Source | Required sections / line refs | Used for |
|---|---|---|
| `docs/05_Non_Functional_Requirements.md` | `docs/05_Non_Functional_Requirements.md:170` backup/recovery, `:204` security, `:263` privacy/compliance, `:503` logging/monitoring | Backup, recovery, security, compliance, observability |
| `docs/08_Technical_Architecture_Document.md` | `docs/08_Technical_Architecture_Document.md:614` hosting/deployment, `:660` env vars, `:686` backup/recovery, `:713` monitoring/logging, `:847` technical risks, `:942` open technical questions | Deployment architecture and provider constraints |
| `docs/09_Software_Requirements_Specification.md` | `docs/09_Software_Requirements_Specification.md:173` operating environment, `:204` assumptions/dependencies, `:477` acceptance criteria, `:531` open issues | Release acceptance and unresolved dependencies |
| `docs/10_Project_Plan_and_Timeline.md` | `docs/10_Project_Plan_and_Timeline.md:175` dependency gates, `:1296` deployment/pilot readiness phase, `:1458` definition of done | Implementation-to-deployment gates |
| `docs/11_Testing_and_Acceptance_Plan.md` | `docs/11_Testing_and_Acceptance_Plan.md:154` environments, `:202` MVP release exit, `:613` UAT plan, `:662` acceptance, `:763` open questions | UAT, smoke testing, release exit criteria |

No provider-specific online research was performed for this phase because hosting, object storage, domain/DNS provider, and monitoring provider are still `TBD`. Provider docs must be checked after selection.

---

## 1. Purpose

This plan defines how Zell-force should be deployed, maintained, supported, and handed over after MVP completion.

It covers:

1. deployment plan;
2. environment setup;
3. domain/DNS plan;
4. database migration plan;
5. backup and restore plan;
6. monitoring and logging plan;
7. admin training plan;
8. handover checklist;
9. maintenance plan;
10. support process;
11. update process;
12. future improvement roadmap.

---

## 2. Known Information

| Area | Known |
|---|---|
| Runtime | Dockerized web app, API, worker |
| Frontend | Next.js + React |
| API | Express.js / Node.js TypeScript |
| Database | PostgreSQL |
| Query/migrations | SQL migrations + Kysely-style typed query layer |
| Jobs | pg-boss / Postgres-backed jobs |
| Storage | Private S3-compatible storage recommended |
| Auth | Better Auth server-side sessions, strong password hashing |
| Deployment region | KSA-region hosting/storage required where available |
| Environments | Local, Dev, Staging, Production |
| Required release gate | CI pass, staging deploy, UAT sign-off, backup restore evidence |
| Backup target | Daily PostgreSQL backups minimum, 30-day recommended retention |
| Recovery target | RPO 24 hours, RTO 4-8 hours MVP default |
| Monitoring | API, DB, jobs, Google import, WhatsApp, storage, payment, frontend |

---

## 3. Missing Information

| ID | Missing item | Impact |
|---|---|---|
| DEP-OPEN-001 | Hosting provider with KSA region | Blocks final infrastructure steps, costs, DNS docs, CI deploy target |
| DEP-OPEN-002 | Object storage provider with KSA region and signed URLs | Blocks final file backup and signed URL runbook |
| DEP-OPEN-003 | Domain name/subdomain | Blocks final DNS and TLS setup |
| DEP-OPEN-004 | DNS provider access owner | Blocks DNS cutover plan |
| DEP-OPEN-005 | Monitoring/logging provider | Blocks exact alert routing and dashboard setup |
| DEP-OPEN-006 | Secret manager/provider | Blocks exact secret rotation process |
| DEP-OPEN-007 | Legal retention policy | Blocks final data deletion/retention automation |
| DEP-OPEN-008 | Admin/support owner after handover | Blocks support escalation assignment |
| DEP-OPEN-009 | MFA decision for Owner/Admin | Blocks final auth hardening checklist |
| DEP-OPEN-010 | Offline attendance decision | Blocks event-day contingency runbook |

---

## 4. Assumptions

| ID | Assumption | Type |
|---|---|---|
| DEP-ASM-001 | MVP deploys as Dockerized web/API/worker units. | Approved architecture |
| DEP-ASM-002 | Production data, files, and backups should be in Saudi Arabia region where available. | Requirement |
| DEP-ASM-003 | Staging must be production-like enough for UAT, integration checks, and smoke tests. | Recommended default |
| DEP-ASM-004 | Production release requires no open Severity 1 or Severity 2 bugs. | Testing plan |
| DEP-ASM-005 | Supervisor attendance remains online-first unless offline scope is approved. | Assumption |
| DEP-ASM-006 | Production deployment should stay provider-portable until provider is selected. | Recommended default |
| DEP-ASM-007 | Initial support process can be lightweight but must include incident triage, backup restore, and integration failure handling. | Recommended default |

---

## 5. Deployment Strategy

Recommended deployment strategy: controlled staged release.

```text
Local -> Dev -> Staging -> UAT sign-off -> Production release -> Production smoke -> Monitoring watch
```

### 5.1 Deployment Principles

| Principle | Rule |
|---|---|
| Provider portability | Keep web/API/worker Dockerized and avoid provider-specific app code. |
| Staging first | Every production release must be deployed to staging first. |
| CI gate | Lint, typecheck, tests, and build must pass before deploy. |
| Migration control | Migrations run as controlled release step, with backup before risky changes. |
| No destructive deploys | Destructive DB migrations need explicit approval and tested backup. |
| Secrets isolation | Production secrets live in environment/secret manager, never source code. |
| Rollback awareness | Every release must know whether rollback is code-only or code+DB. |
| Observability | Release is not complete until smoke checks and monitoring checks pass. |

### 5.2 Deployment Units

| Unit | Runtime | Purpose | Deployment notes |
|---|---|---|---|
| Web app | Next.js container | Internal UI and token pages | Public HTTPS entry point |
| API | Express container | Application API, auth/session endpoints, webhooks | Internal/public routes depending endpoint |
| Worker | Node container | imports, reminders, recalculation, exports, retries | No public traffic |
| PostgreSQL | Managed DB preferred | operational data | automated backups required |
| Object storage | Managed private bucket | CVs, photos, contracts, exports | signed URL access only |

---

## 6. Environment Setup

### 6.1 Environment Model

| Environment | Purpose | Data | Access | Notes |
|---|---|---|---|---|
| Local | Developer TDD and fast feedback | synthetic local data | developers/agents | no real secrets unless necessary |
| Dev | Shared integration environment | synthetic/test data | developers/QA | integration testing |
| Staging | Production-like UAT | representative test/pilot data | project team/client testers | must not use production secrets unless provider requires sandbox |
| Production | Live MAG Events tenant | real operational data | authorized users only | strict secrets, backups, monitoring |

### 6.2 Environment Parity Rules

Staging should match production in:

- runtime containers;
- database engine/version;
- migration process;
- object storage behavior;
- auth/session behavior;
- worker/job behavior;
- logging format;
- timezone/currency/language defaults;
- Arabic RTL and English fallback config.

Staging may differ in:

- provider sandbox credentials;
- domain/subdomain;
- smaller compute size;
- test WhatsApp phone/templates;
- test data only.

### 6.3 Minimum Environment Variables

Source: architecture env var groups.

| Group | Variables |
|---|---|
| App | `NODE_ENV`, `APP_ENV`, `APP_URL`, `API_URL` |
| Database | `DATABASE_URL`, `DB_SSL_MODE` |
| Auth | `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `PASSWORD_HASH_PEPPER` optional |
| Google | `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_PROJECT_ID` |
| WhatsApp | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` |
| Storage | `STORAGE_PROVIDER`, `STORAGE_BUCKET`, `STORAGE_REGION`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` |
| Jobs | `JOB_CONCURRENCY`, `JOB_POLL_INTERVAL`, `WORKER_ENABLED` |
| Security | `CORS_ORIGIN`, `RATE_LIMIT_*`, `TOKEN_SIGNING_SECRET` |
| Observability | `LOG_LEVEL`, `SENTRY_DSN` or equivalent, `OTEL_EXPORTER_*` optional |
| Localization | `DEFAULT_LANGUAGE`, `DEFAULT_TIMEZONE`, `DEFAULT_CURRENCY` |

### 6.4 Secret Handling Rules

- Validate environment at startup.
- Fail fast on missing production secrets.
- Never commit secrets.
- Never log secrets, tokens, raw signed URLs, CV/photo contents, or contract file contents.
- Restrict production secret access to approved maintainers.
- Rotate secrets when a maintainer leaves or a leak is suspected.
- Store secret inventory in handover docs without secret values.

---

## 7. Domain, DNS, and TLS Plan

### 7.1 Domain Plan

| Item | Status | Recommended default |
|---|---|---|
| Production domain/subdomain | TBD | `zellforce.magevents.sa` or client-approved equivalent |
| Staging domain/subdomain | TBD | `staging-zellforce.magevents.sa` or provider preview URL |
| API domain | TBD | same domain under `/api` or `api-zellforce.magevents.sa` |
| Worker public domain | Not needed | worker should not expose public HTTP unless health endpoint is protected/internal |
| Token links | Required | generated under production app domain with scoped tokens |

### 7.2 DNS Checklist

- [ ] Confirm production domain/subdomain.
- [ ] Confirm DNS provider and admin access.
- [ ] Set staging DNS before UAT if needed.
- [ ] Set production DNS after release approval.
- [ ] Configure HTTPS/TLS certificate.
- [ ] Configure redirect from HTTP to HTTPS.
- [ ] Validate CORS/session cookie domain settings.
- [ ] Validate WhatsApp webhook callback URL after production DNS is live.
- [ ] Validate Google OAuth/API callback or service account access if applicable.

### 7.3 TLS and Security Headers

Production must enforce:

- HTTPS;
- secure session cookies;
- appropriate `SameSite` cookies;
- HSTS after stable TLS setup;
- no mixed-content file links;
- secure webhook endpoint verification.

---

## 8. CI/CD and Release Gates

### 8.1 CI Pipeline

Recommended CI gate:

```powershell
bun install
bun run lint
bun run typecheck
bun run test
bun run test:integration
bun run build
```

Frontend staging release candidates should pass manual QA in `docs/QA.md`.

Exact script names remain `TBD` until implementation defines package scripts.

### 8.2 Release Gate

Production release may proceed only when:

- CI passes;
- DB migrations pass on staging;
- staging deploy succeeds;
- critical manual frontend QA passes;
- UAT sign-off exists for MVP release;
- backup restore evidence exists before pilot;
- no Severity 1 or Severity 2 bugs remain;
- production env vars are configured and validated;
- monitoring/logging endpoints are active;
- rollback plan is documented.

### 8.3 Release Checklist

| Step | Owner | Evidence |
|---|---|---|
| Confirm release version/commit | Tech lead / agent | commit hash |
| Review open bugs | QA / owner | no S1/S2 |
| Run CI | CI | green pipeline |
| Deploy to staging | Developer / agent | staging deployment ID |
| Run migrations on staging | Developer / agent | migration log |
| Run staging smoke | QA / agent | smoke result |
| Confirm UAT sign-off | Product owner | signed checklist |
| Confirm backup status | Maintainer | latest backup timestamp |
| Confirm restore test | Maintainer | restore evidence |
| Deploy production | Developer / maintainer | deployment ID |
| Run production smoke | QA / maintainer | smoke result |
| Watch monitoring | Maintainer | first 60-120 minute watch |

---

## 9. Database Migration Plan

### 9.1 Migration Principles

- Migrations are source-controlled.
- Migrations run in order.
- Migrations must be tested against empty DB and staging-like DB.
- Destructive migrations require explicit approval.
- Production backup must exist before risky migrations.
- Payment, attendance, roster, contract, and audit tables are high-risk.

### 9.2 Migration Flow

```text
1. Write migration with tests.
2. Run against local test DB.
3. Run against staging clone/test DB.
4. Verify schema state.
5. Deploy app code to staging.
6. Run UAT/smoke.
7. Backup production DB.
8. Run production migration.
9. Deploy production app code.
10. Run production smoke.
```

### 9.3 Migration Risk Classes

| Class | Examples | Required handling |
|---|---|---|
| Low | add nullable column, add index concurrently if supported | normal CI/staging verification |
| Medium | add required column with default/backfill, add FK | staging migration test and backup before production |
| High | drop column/table, change enum/status, rewrite payment data | explicit approval, backup, rollback plan, maintenance window |
| Critical | destructive payment/audit/contract migration | avoid in MVP unless mandatory and fully rehearsed |

### 9.4 Rollback Rules

| Change type | Rollback approach |
|---|---|
| Code-only | redeploy previous image/commit |
| Additive DB migration | rollback code if old code tolerates new schema |
| Breaking DB migration | restore backup or run tested down migration |
| Data rewrite | restore backup or apply tested corrective migration |

No production migration should run unless rollback path is known.

---

## 10. Data Import and Pilot Data Plan

### 10.1 Initial Data Setup

Before pilot:

- create MAG Events tenant;
- create Owner/Admin user;
- configure roles and default permissions;
- configure tenant settings: Arabic default, timezone Asia/Riyadh, SAR currency;
- configure job roles and shift types if confirmed;
- configure Google Sheet mapping;
- configure WhatsApp templates after provider/template approval;
- configure object storage bucket/folders;
- seed or import initial staff data if available;
- validate report/export formats if confirmed.

### 10.2 Google Form/Sheet Intake Setup

Source system remains Google Form response Sheet.

Setup checklist:

- [ ] Confirm source Google Form and linked response Sheet.
- [ ] Confirm service account or OAuth access.
- [ ] Confirm Sheet ID and range.
- [ ] Confirm row identity strategy.
- [ ] Confirm required columns.
- [ ] Run staging import dry run.
- [ ] Review invalid/duplicate rows.
- [ ] Confirm import run history displays status.
- [ ] Enable scheduled import only after manual dry run passes.

### 10.3 Data Cutover

Recommended MVP approach:

1. Keep Google Form live.
2. Configure Zell-force import mapping.
3. Run controlled import into staging.
4. Review duplicates/errors with HR/Admin.
5. Run production import.
6. Validate counts and sample profiles.
7. Keep original Google Sheet as source backup during pilot.

---

## 11. Backup Plan

### 11.1 Backup Scope

| Asset | Requirement | Default |
|---|---|---|
| PostgreSQL | automated backups | daily minimum |
| PostgreSQL retention | retained backups | 30 days recommended |
| Object storage | versioning or backup process | required for CVs/photos/contracts |
| Env/secrets | provider/secret manager backup | restricted access |
| Migrations | source-controlled | required |
| Export files | retention TBD | store metadata; generated exports may be regenerated if source data retained |
| Audit logs | protected from normal user modification | retain per legal/business policy TBD |

### 11.2 Backup Verification

Backup is not accepted until restore test succeeds.

Restore test evidence must include:

- date/time;
- environment;
- backup source;
- restored DB target;
- object storage restore sample;
- migration version;
- smoke test result;
- responsible person/agent;
- issues found.

### 11.3 Backup Schedule

| Item | Recommended default |
|---|---|
| DB backup frequency | daily automated |
| DB backup retention | 30 days |
| Object storage versioning | enabled if provider supports |
| Restore test | before pilot, then quarterly recommended |
| Pre-release backup | before high-risk migration |
| Secret backup | managed by provider/secret manager |

Legal retention periods remain `TBD`.

---

## 12. Recovery and Incident Plan

### 12.1 Recovery Objectives

| Target | MVP default |
|---|---|
| RPO | 24 hours |
| RTO | 4-8 hours |
| Restore test | required before pilot |

Needs client confirmation:

- stricter event-day RTO;
- whether critical event days need on-call support;
- offline attendance contingency.

### 12.2 Incident Severity

| Severity | Examples | Response goal | Escalation |
|---|---|---|---|
| SEV-1 | production down, payment calculation wrong, data/security leak | immediate triage | Owner + technical maintainer |
| SEV-2 | key workflow blocked, WhatsApp/webhook broken, import blocked before event | same business day | Admin + technical maintainer |
| SEV-3 | workaround exists, report/export issue, slow dashboard | planned fix | support queue |
| SEV-4 | copy/minor UI issue | backlog | product owner |

### 12.3 Incident Runbook

1. Record incident time, reporter, role, environment.
2. Identify affected workflow and severity.
3. Check monitoring/logs by correlation ID if available.
4. Stop risky jobs if needed.
5. Preserve evidence before data correction.
6. Apply workaround if safe.
7. Fix through TDD/regression test process.
8. Communicate status to owner/admin.
9. Write post-incident note for SEV-1/SEV-2.
10. Update runbook/tests if gap found.

### 12.4 Rollback Runbook

1. Confirm release version causing issue.
2. Check if DB migration is backward compatible.
3. If code-only: redeploy previous image/commit.
4. If DB-breaking: execute approved rollback or restore backup.
5. Run production smoke.
6. Keep monitoring watch for 60-120 minutes.
7. Document root cause and prevention.

---

## 13. Monitoring and Logging Plan

### 13.1 Monitoring Targets

| Area | Metrics/events |
|---|---|
| API | error rate, latency, 4xx/5xx, auth failures |
| Database | CPU, memory, storage, connections, slow queries |
| Jobs | success/failure, retries, stuck jobs, queue depth |
| Google import | last run, rows imported, rows failed, auth errors |
| WhatsApp | webhook failures, send failures, template errors |
| Storage | upload/download failures, signed URL failures |
| Payment | calculation errors, missing rates, approval/export errors |
| Frontend | client errors, route load failures |
| Security | repeated failed login, token failures, permission denials |

### 13.2 Logging Rules

- Use structured logs.
- Include request ID/correlation ID where practical.
- Include actor/user ID where allowed.
- Include tenant ID.
- Redact secrets and sensitive file contents.
- Redact raw tokens and signed URLs.
- Separate audit logs from operational logs.
- Surface integration failures in admin screens where useful.

### 13.3 Alert Rules

| Alert | Trigger | Priority |
|---|---|---|
| API high error rate | sustained 5xx spike | SEV-1/SEV-2 |
| DB unavailable | connection failures | SEV-1 |
| Worker stopped/stuck | no job progress | SEV-2 |
| Google import repeated failure | consecutive failed imports | SEV-2 |
| WhatsApp webhook repeated failure | repeated webhook errors | SEV-2 |
| Payment calculation error | missing rate/calculation failure | SEV-1/SEV-2 |
| Storage upload failure | repeated file upload failures | SEV-2 |
| Backup failed | backup job failure | SEV-2 |
| Restore test overdue | no restore evidence in agreed period | SEV-3 |

Alert destination is `TBD` until monitoring/support owner is confirmed.

---

## 14. Security Operations Plan

### 14.1 Access Control

- Production admin access should use named accounts.
- Shared accounts should be avoided.
- Owner/Admin privileges should be limited to approved users.
- Database direct access should be restricted to maintainers.
- Object storage console access should be restricted.
- Support access should be least privilege.

### 14.2 Secrets

- Store secrets in provider secret manager or environment vault.
- Rotate secrets after handover if implementation team access changes.
- Rotate WhatsApp/Google/storage credentials after suspected leak.
- Keep secret inventory without secret values.
- Keep production `.env` files out of git and chat.

### 14.3 Data Privacy

- Keep files private.
- Use signed URLs only after permission checks.
- Avoid collecting future sensitive fields unless approved.
- Maintain consent records for WhatsApp/data processing.
- Treat retention/deletion as `TBD` pending legal confirmation.

---

## 15. Admin Training Plan

Training should be role-based and use staging before production.

| Role | Training topics | Evidence |
|---|---|---|
| Owner | dashboard, budget/profit, payment approval, audit/report review, escalation | owner sign-off |
| Admin | user setup, settings, client/event setup, failed import/message monitoring | admin checklist |
| HR / Recruiter | applicant import, review, duplicate handling, screening, interviews, contracts | HR workflow run |
| Coordinator | staff filtering, groups, assignment, WhatsApp invitations, roster approval visibility | event staffing run |
| Supervisor | mobile roster, attendance, lateness, backup, ratings, locked states | mobile UAT run |
| Finance | payment review, adjustments, approval readiness, export, dispute review | payment export run |
| Viewer | read-only reports and limitations | viewer access check |

### 15.1 Training Materials

Minimum handover materials:

- role-specific quick start guide;
- admin setup checklist;
- applicant import guide;
- event setup guide;
- staffing and WhatsApp invitation guide;
- supervisor mobile attendance guide;
- payment review/export guide;
- contract/file handling guide;
- incident/support contact guide;
- known limitations and open issues.

### 15.2 Training Sequence

1. Admin/Owner setup training.
2. HR applicant/recruitment training.
3. Coordinator event staffing training.
4. Supervisor mobile attendance training.
5. Finance payment/export training.
6. UAT scenario walkthrough.
7. Production go-live briefing.

---

## 16. Handover Checklist

### 16.1 Technical Handover

- [ ] Repository access transferred.
- [ ] Deployment access transferred.
- [ ] Domain/DNS access confirmed.
- [ ] Hosting provider account access confirmed.
- [ ] Database access policy documented.
- [ ] Object storage access policy documented.
- [ ] Secret inventory documented, without values.
- [ ] Env var schema documented.
- [ ] CI/CD process documented.
- [ ] Migration process documented.
- [ ] Backup process documented.
- [ ] Restore test evidence delivered.
- [ ] Monitoring dashboards/alerts documented.
- [ ] Production smoke test checklist delivered.
- [ ] Rollback process documented.
- [ ] Support escalation contacts documented.

### 16.2 Product/Admin Handover

- [ ] User roles and permission model explained.
- [ ] Owner/Admin accounts created.
- [ ] Tenant settings configured.
- [ ] Google Sheet import configured.
- [ ] WhatsApp templates configured or pending approval list delivered.
- [ ] Job roles/shift types configured or pending list delivered.
- [ ] Payment export format confirmed or open issue documented.
- [ ] Admin training completed.
- [ ] Supervisor mobile training completed.
- [ ] Finance payment/export training completed.
- [ ] Known limitations delivered.
- [ ] Future roadmap delivered.

### 16.3 Documentation Handover

Deliver:

- BRD;
- Stakeholder/User Role Analysis;
- Use Cases;
- Functional Requirements;
- Non-Functional Requirements;
- Data Model and Database Requirements;
- UI/UX Foundations Research;
- UI/UX Wireframe Specification;
- Technical Architecture Document;
- SRS;
- Agent Implementation Plan;
- Testing and Acceptance Plan;
- Deployment, Maintenance, and Handover Plan.

---

## 17. Maintenance Plan

### 17.1 Routine Maintenance

| Frequency | Task |
|---|---|
| Daily | check backups and critical alerts |
| Daily during pilot | check import/WhatsApp/job/payment error queues |
| Weekly | review failed jobs, slow queries, high API errors |
| Weekly | review open bugs and support tickets |
| Monthly | dependency/security patch review |
| Monthly | backup restore status review |
| Quarterly recommended | restore test rehearsal |
| Before major events | verify WhatsApp templates, supervisor access, event roster, backup plan |

### 17.2 Maintenance Windows

- Planned maintenance should be announced to Owner/Admin.
- Avoid event-day operational hours where possible.
- High-risk DB migrations should use explicit maintenance windows.
- Maintenance note should include expected downtime and rollback owner.

### 17.3 Dependency Updates

Process:

1. Review dependency update/security notice.
2. Create branch.
3. Run tests locally/CI.
4. Deploy to staging.
5. Run smoke/regression.
6. Deploy production in planned window if risk is material.

Critical security updates may bypass normal cadence but still need smoke testing.

---

## 18. Support Process

### 18.1 Support Channels

Support channel is `TBD`.

Recommended default:

- one primary support channel for MAG Events admins;
- incident template for urgent issues;
- separate backlog for enhancements;
- explicit escalation owner for SEV-1/SEV-2.

### 18.2 Support Triage

Every support request should capture:

- requester;
- role;
- environment;
- event/client/person/payment batch affected;
- expected result;
- actual result;
- screenshots if useful;
- time issue occurred;
- whether event-day operation is blocked;
- severity.

### 18.3 Support Responsibilities

| Area | Responsible party | Notes |
|---|---|---|
| Business approval | Owner/Admin | approve workarounds and release decisions |
| User management | Owner/Admin | create/deactivate users |
| Operational data correction | Admin with technical support if needed | audit required for sensitive changes |
| Technical incidents | Maintainer/technical team TBD | provider access required |
| Hosting/billing | Owner/client or technical maintainer TBD | depends provider ownership |
| WhatsApp template/provider issues | Admin + technical maintainer | provider portal access needed |

### 18.4 Support Period

Support period is `TBD`.

Recommended default:

- 2-4 weeks hypercare after pilot launch;
- daily monitoring during first live event cycle;
- weekly review during first month;
- move to maintenance cadence after stable pilot.

---

## 19. Operational Runbooks

### 19.1 Failed Applicant Import

1. Check import run history.
2. Confirm Google credentials and Sheet access.
3. Review failed row errors.
4. Check if Sheet columns changed.
5. Run manual sync in staging if mapping changed.
6. Fix mapping through TDD if code change required.
7. Re-run import.
8. Document root cause if repeated.

### 19.2 WhatsApp Send/Webhook Failure

1. Check WhatsApp provider status/credentials.
2. Check webhook verification and callback URL.
3. Review message log and retry queue.
4. Check template approval/state.
5. Retry failed messages if safe.
6. Use manual communication fallback if event-day staffing is blocked.
7. Record incident if repeated.

### 19.3 Contract Upload/Ingestion Failure

1. Check object storage health.
2. Verify file MIME and size.
3. Check assignment/contract status.
4. Retry media download if WhatsApp source.
5. Use manual upload if urgent.
6. Verify signed URL permission.
7. Audit status correction if manual change required.

### 19.4 Attendance Event-Day Issue

1. Confirm supervisor is assigned to event.
2. Check network/session status.
3. Confirm event roster and assignment status.
4. If app is unavailable, use approved manual attendance backup sheet.
5. Enter manual attendance into Zell-force when service returns.
6. Audit late/manual changes.
7. Trigger payment recalculation after corrections.

Offline-first attendance remains `TBD`; this runbook is online-first fallback.

### 19.5 Payment Calculation Dispute

1. Open payment line breakdown.
2. Verify attendance status, late minutes, backup outcome, agreed wage, shift/rate rule, adjustment.
3. Check audit log for related changes.
4. If formula bug suspected, write failing test before fix.
5. Recalculate in staging if possible.
6. Apply production correction only after Owner/Admin approval.
7. Re-export approved batch if affected.

### 19.6 Restore From Backup

1. Declare incident and freeze risky writes if needed.
2. Identify backup timestamp.
3. Restore DB to new environment first if possible.
4. Restore object storage sample or bucket version.
5. Verify migration version.
6. Run smoke tests.
7. Decide cutover/restore with Owner/Admin.
8. Document data loss window vs RPO.

---

## 20. Update and Change Management

### 20.1 Change Types

| Change type | Examples | Process |
|---|---|---|
| Patch | bug fix, text/copy, minor UI defect | TDD/regression, CI, staging smoke, production deploy |
| Minor | new report filter, new status, new template | update docs/tests, staging UAT, production deploy |
| Major | new payment rule, custom permissions, client portal | requirements update, architecture review, ADR, full test plan |
| Emergency | security or production blocker | hotfix branch, regression test, expedited deploy, incident note |

### 20.2 Required Documentation Updates

| Change | Update |
|---|---|
| New domain term | `CONTEXT.md` |
| Architecture decision | `docs/adr/` |
| Requirement change | BRD/FR/NFR/SRS as applicable |
| Data schema/status change | Data model doc and migrations |
| UI workflow change | UI/UX wireframe spec |
| Test coverage change | Testing and Acceptance Plan |
| Deployment provider/process change | This document |

---

## 21. Future Improvement Roadmap

### 21.1 Fast-Follow Candidates

| Item | Reason | Dependency |
|---|---|---|
| MFA for Owner/Admin | security hardening | auth library/provider decision |
| Offline attendance mode | event-day resilience | operations approval and sync conflict design |
| Exact retention automation | compliance | legal retention policy |
| Advanced monitoring dashboards | faster support | monitoring provider |
| Branded PDF reports | client-facing polish | report/export format approval |
| Accounting/WPS/payment disbursement integration | finance automation | business/legal/bank integration decisions |

### 21.2 Future Product Scope

Out of MVP unless explicitly approved:

- client login and reports;
- external client/per-host rating links;
- payment disbursement/WPS integration;
- full SaaS multi-tenant onboarding;
- cross-event analytics;
- worker profile self-update links;
- attendance self-check-in.

---

## 22. Deployment Acceptance Criteria

Deployment is acceptable when:

1. Hosting provider and storage provider are confirmed or explicitly marked `TBD` for pre-provider planning only.
2. Staging environment is deployed and production-like.
3. Production environment is configured with secure secrets.
4. CI deploy gate passes.
5. Database migrations are tested and source-controlled.
6. Backup and restore test evidence exists before pilot.
7. Production HTTPS works.
8. Google import, WhatsApp webhook, object storage, jobs, and payment recalculation have monitoring/logging.
9. Production smoke test passes after deploy.
10. UAT sign-off exists.
11. Admin/support handover is complete.
12. Rollback and incident runbooks are documented.

---

## 23. Open Questions

| ID | Question | Owner | Impact |
|---|---|---|---|
| DEP-Q001 | Which KSA-region hosting provider will be used? | Owner/Technical | final deploy process, cost, access, monitoring |
| DEP-Q002 | Which object storage provider will be used? | Owner/Technical | file backup, signed URLs, retention |
| DEP-Q003 | What domain/subdomain should production use? | Owner/Admin | DNS/TLS, token link URLs, webhook URL |
| DEP-Q004 | Who controls DNS? | Owner/Admin | cutover authority |
| DEP-Q005 | Which monitoring/logging provider should be used? | Technical/Owner | alerts and dashboards |
| DEP-Q006 | Who owns first-line support after handover? | Owner | escalation and response process |
| DEP-Q007 | What support/hypercare period is expected? | Owner | maintenance responsibility |
| DEP-Q008 | What legal retention periods apply? | Owner/Legal | data deletion/retention |
| DEP-Q009 | Is MFA required for MVP? | Owner | production auth readiness |
| DEP-Q010 | Do live event days need stricter RTO than 4-8 hours? | Owner/Operations | backup/DR and support coverage |

---

## 24. Approval Checklist

Approve this Phase 12 plan if these decisions are accepted:

1. Deployment remains provider-portable until hosting/storage are confirmed.
2. Dockerized web/API/worker is the deployment model.
3. Staging is required before production.
4. Production release requires CI pass, UAT sign-off, no S1/S2 bugs, staging smoke, production smoke, backup/restore evidence.
5. Daily DB backup with 30-day recommended retention is the MVP default.
6. RPO 24 hours and RTO 4-8 hours are MVP defaults unless event-day operations require stricter targets.
7. Online-first attendance support remains default until offline scope is approved.
8. Admin training and technical handover are required before production pilot.
