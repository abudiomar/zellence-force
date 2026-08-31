# Stakeholder and User Role Analysis

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Draft v0.1  
**Source inputs:** `SYSTEM_ARCHITECTURE.md`, `database.js`, approved Phase 2 assumptions  
**Date:** 2026-06-10

---

## 1. Purpose

This document defines the stakeholders, system actors, user roles, access needs, permissions, and role-based risks for Zell-force. It is intended to guide:

- authentication and authorization design;
- dashboard and navigation design;
- use case mapping;
- functional requirements;
- QA role-permission testing;
- future custom permission planning.

---

## 2. Approved Role Model

MVP will use fixed role-based access control.

Approved MVP internal roles:

1. Owner
2. Admin
3. HR / Recruiter
4. Coordinator
5. Supervisor
6. Finance / Accountant
7. Viewer

External / non-admin actors:

1. Temp worker
2. Permanent staff
3. Client
4. Future SaaS Super Admin
5. Developer / Maintainer

**Approved assumption:** workers do not log into Zell-force in MVP. They interact through WhatsApp and tokenized links.

**Approved assumption:** clients do not log in during MVP. Client records exist for event and reporting context.

**Approved assumption:** Owner/Admin can perform Finance actions initially.

---

## 3. Database Alignment Note

Current `database.js` role enum starts as:

```sql
('owner','admin','hr','coordinator','viewer')
```

Required MVP update:

```sql
('owner','admin','hr','coordinator','supervisor','finance','viewer')
```

Future recommended permission model:

- `roles`
- `permissions`
- `role_permissions`
- `user_roles`

This future model should allow one user to hold multiple roles. For MVP, a simple fixed role enum is acceptable if Owner/Admin overrides are clearly handled.

---

## 4. Stakeholder List

| Stakeholder | Type | Interest / Need | Impact |
|---|---|---|---|
| MAG Events Owner | Internal decision-maker | Full operational control, profitability, final approvals | High |
| Admin / Operations Manager | Internal operator | Daily system management, users, events, budgets, reports | High |
| HR / Recruiter | Internal operator | Candidate intake, screening, interviews, contracts | High |
| Coordinator | Internal operator | Event staffing, rosters, groups, assignments, messaging | High |
| Supervisor | Internal operator | On-site roster, attendance, lateness, backup outcome | High |
| Finance / Accountant | Internal operator | Payment review, exports, cost visibility, audit trail | High |
| Viewer / Auditor | Internal reviewer | Read-only visibility for approved records/reports | Medium |
| Temp worker | Workforce actor | WhatsApp confirmations, reminders, contract return | High |
| Permanent staff | Workforce actor / possible internal user | Same workforce flow; may also supervise if given login | Medium |
| Client | External business customer | Event delivery quality, future reports/ratings | Medium |
| Developer / Maintainer | Technical stakeholder | Clear requirements, access logs, support workflows | Medium |
| Future SaaS Super Admin | Future platform operator | Tenant onboarding, support, billing, system-level settings | Future |

---

## 5. User Role Table

| Role | Goal | Main Tasks | Frequency | Devices | First Screen |
|---|---|---|---|---|---|
| Owner | Control business outcomes and approvals | View dashboards, approve budgets/payments, manage settings, override critical actions | Weekly/daily | Desktop, tablet, mobile web | Executive dashboard |
| Admin | Run platform operations | Manage users, events, clients, staff, budgets, messages, reports | Daily | Desktop, tablet | Operations dashboard |
| HR / Recruiter | Move candidates through hiring pipeline | Review intake, screen candidates, schedule interviews, score, issue contracts | Daily/seasonal | Desktop, mobile web | Recruitment dashboard |
| Coordinator | Staff events efficiently | Filter staff, build groups, assign roles, send invitations, track confirmations | Daily/event-heavy | Desktop, tablet, mobile web | Event staffing dashboard |
| Supervisor | Capture field reality | View assigned event roster, mark attendance/lateness, record backup outcome, add notes/ratings | Event days | Mobile web, tablet | Today's event roster |
| Finance / Accountant | Review calculated payments | Review payment lines, attendance summaries, exports, cost reports | Per event/pay cycle | Desktop | Payment review dashboard |
| Viewer | Observe without changing data | View permitted dashboards/reports | Occasional | Desktop | Read-only dashboard |
| Temp worker | Respond to work requests | Confirm/decline, receive reminders, return signed contract | Event-based | WhatsApp/mobile link | WhatsApp chat/token link |
| Permanent staff | Participate as worker or supervisor | Same as temp; may hold internal login if assigned role | Event-based/daily | WhatsApp/mobile/desktop | Depends on assigned role |
| Client | Hire MAG Events for events | Future: view reports, submit ratings | Future | TBD | Future/TBD |
| Super Admin | Manage platform tenants | Future: tenant support, onboarding, system config | Future | Desktop | Platform admin |

---

## 6. Permissions Overview

| Capability | Owner | Admin | HR | Coordinator | Supervisor | Finance | Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|
| Manage users | Yes | Yes | No | No | No | No | No |
| Manage roles/settings | Yes | Yes | No | No | No | No | No |
| View clients | Yes | Yes | Limited | Yes | Limited | Limited | Read-only limited |
| Manage clients | Yes | Yes | No | Limited/TBD | No | No | No |
| Create/edit events | Yes | Yes | Limited/TBD | Yes | No | No | No |
| Create/edit budgets | Yes | Yes | No | No/TBD | No | View only | No |
| Create/edit wage rules | Yes | Yes | No | No/TBD | No | View only | No |
| Manage staff profiles | Yes | Yes | Yes | Limited | No | Limited | Read-only limited |
| View photos/CVs | Yes | Yes | Yes | Limited/TBD | No | No by default | No by default |
| Import applicants | Yes | Yes | Yes | No | No | No | No |
| Screen candidates | Yes | Yes | Yes | No/TBD | No | No | No |
| Schedule interviews | Yes | Yes | Yes | No/TBD | No | No | No |
| Score interviews | Yes | Yes | Yes | No | No | No | No |
| Build staff groups | Yes | Yes | Yes | Yes | No | No | Read-only/TBD |
| Assign staff to events | Yes | Yes | Limited/TBD | Yes | No | No | No |
| Approve final roster | Yes | Yes | No/TBD | Yes | No | No | No |
| Issue contracts | Yes | Yes | Yes | No/TBD | No | No | No |
| Send WhatsApp messages | Yes | Yes | Yes | Yes | Limited/TBD | No | No |
| View assigned event roster | Yes | Yes | Yes | Yes | Yes | No/TBD | Read-only limited |
| Enter attendance/lateness | Yes | Yes | No | Limited/TBD | Assigned events only | No | No |
| Rate event-day performance | Yes | Yes | No/TBD | Limited/TBD | Yes | No | No |
| Review payment lines | Yes | Yes | No | No/TBD | No | Yes | No by default |
| Approve payment list | Yes | Yes | No | No | No | Prepare/recommend only | No |
| Export payment list | Yes | Yes | No | No | No | Yes | No |
| View reports | Yes | Yes | Limited | Operational | Assigned events only | Finance reports | Read-only allowed |
| Blacklist/deactivate staff | Yes | Yes | Recommend/TBD | No | No | No | No |

Legend:

- `Limited` = only fields needed for role tasks.
- `TBD` = needs client confirmation in functional requirements.
- `Assigned events only` = scoped access, not global access.

---

## 7. Role-Based Needs

### Owner

Needs:

- full business visibility;
- profitability by event;
- final approval rights;
- ability to override critical operational decisions;
- auditability of budget, attendance, and payment changes.

### Admin

Needs:

- all operational tools;
- user and configuration management;
- ability to fix data problems;
- reporting and exports.

### HR / Recruiter

Needs:

- applicant intake review;
- duplicate candidate detection;
- screening statuses;
- interview scheduling and scoring;
- contract status visibility;
- notes and candidate history.

Should not need:

- full profit margin visibility;
- final payment approval.

### Coordinator

Needs:

- staff search/filter;
- role-based roster building;
- availability/confirmation tracking;
- bulk messaging;
- staffing status per event.

Should not need:

- system settings;
- sensitive wage rule edits unless explicitly approved.

### Supervisor

Needs:

- assigned event roster;
- worker phone/contact;
- attendance status;
- lateness entry;
- backup standby/takeover entry;
- simple event-day notes and ratings.

Should never access:

- budgets;
- margins;
- payment calculations;
- full staff database;
- unrelated events.

### Finance / Accountant

Needs:

- attendance summaries;
- payment calculation output;
- adjustment breakdown;
- payment exports;
- audit trail for changed payment-relevant data.

Should not need:

- photos, CVs, appearance notes;
- recruitment scoring detail unless required for dispute.

### Viewer

Needs:

- read-only dashboards/reports;
- scoped event visibility.

Should never access:

- edit actions;
- sensitive personal files;
- payment amounts by default.

### Temp Worker

Needs:

- WhatsApp confirmations;
- event details;
- reminder messages;
- contract view/upload/sign return through token link.

Should never access:

- admin app;
- other workers' data;
- event budget/payment details.

### Permanent Staff

Needs:

- same workforce flow as temps when assigned to events;
- internal login only if they perform operational role.

### Client

MVP:

- tracked as record only.

Future:

- possible report access;
- client/per-host ratings;
- event feedback.

---

## 8. Data Access Rules

| Data Area | Access Notes |
|---|---|
| Staff personal data | Owner/Admin/HR full; Coordinator limited; Finance/Viewer restricted |
| Photos/CVs | Sensitive; default restrict to Owner/Admin/HR |
| Appearance/gender/age notes | Sensitive screening data; restrict and audit |
| Event budgets | Owner/Admin edit; Finance view/review; others limited/no access |
| Wage rules | Owner/Admin edit; Finance view; changes audited |
| Attendance | Supervisor assigned event write; Owner/Admin full; Finance read |
| Payment lines | Finance/Owner/Admin; Viewer no by default |
| WhatsApp messages | Operational users see relevant message logs only |
| Client contacts | Owner/Admin/Coordinator full; others limited |
| Notes | Scoped by entity and sensitivity; private note rules TBD |

---

## 9. Role-Based Risks

| Role | Risk | Mitigation |
|---|---|---|
| Owner/Admin | Too much power, accidental critical changes | Audit logs, confirmations, backups |
| HR | Sensitive personal data exposure | Restrict exports, audit profile/file access |
| Coordinator | Incorrect roster or unauthorized wage expectations | Approval workflow for final roster and wages |
| Supervisor | Attendance mistakes affect payment | Edit history, cutoff, review workflow |
| Finance | Payment export before approval | Owner/Admin final approval state |
| Viewer | Sensitive data exposure | Strict read-only scope, no pay/files by default |
| Worker | Token link misuse | Expiring one-time tokens, scoped payload |
| Client | Future access leakage | Client portal out of MVP until designed |

---

## 10. Access Control Notes

MVP:

- fixed RBAC with approved roles;
- every query scoped by `tenant_id`;
- Supervisor access scoped to assigned events;
- Owner/Admin override most operational actions;
- Finance can prepare/review/export payment lists, but Owner/Admin approval required;
- sensitive data access minimized by role.

Future:

- custom roles and permissions;
- multiple roles per user;
- per-field access controls for sensitive staff data;
- client-facing access;
- platform super admin for SaaS operations;
- Row-Level Security activation when second tenant is onboarded.

---

## 11. Accepted Decisions

| ID | Decision |
|---|---|
| D-001 | Add Supervisor role to MVP role model. |
| D-002 | Add Finance / Accountant role to MVP role model. |
| D-003 | Keep fixed role-based access in MVP. |
| D-004 | Build custom permission system later. |
| D-005 | Owner/Admin can perform Finance actions initially. |
| D-006 | Supervisor can access assigned events only. |
| D-007 | Workers do not log into admin app in MVP. |
| D-008 | Clients do not log in during MVP. |
| D-009 | Viewer has read-only, non-sensitive access by default. |

---

## 12. Assumptions

| ID | Assumption |
|---|---|
| A-001 | MAG Events team members may perform multiple business functions even if app starts with one primary role. |
| A-002 | Owner/Admin override is acceptable for MVP while custom permissions are deferred. |
| A-003 | Supervisor login is needed for mobile web attendance entry. |
| A-004 | Finance payment export does not mean payment disbursement from platform. |
| A-005 | Sensitive data includes photos, CVs, appearance notes, payment amounts, and contract files. |

---

## 13. Open Questions

| ID | Question |
|---|---|
| OQ-001 | Should Coordinator ever edit agreed wages, or only Owner/Admin? |
| OQ-002 | Should HR be allowed to assign candidates directly to an event, or only prepare candidates for Coordinator/Admin? |
| OQ-003 | Should payment exports require two-step approval? |
| OQ-004 | Should Viewer have separate report scopes, e.g. operations viewer vs. finance viewer? |
| OQ-005 | Should contract files be visible to Finance for dispute handling? |
| OQ-006 | Should staff notes have private/internal categories with restricted visibility? |

