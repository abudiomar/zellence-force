# UI/UX Wireframe Specification

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Document status:** Draft v0.1 for review  
**Date:** 2026-06-10  
**Source inputs:** `SYSTEM_ARCHITECTURE.md`, `database.js`, `docs/02_Stakeholders_User_Roles.md`, `docs/03_Use_Cases.md`, `docs/04_Functional_Requirements.md`, `docs/06_Data_Model_Database_Requirements.md`, `docs/07A_UI_UX_Foundations_Research.md`

---

## 1. Purpose

This document defines practical wireframe requirements for Zell-force MVP. It is not a high-fidelity visual design. It defines screens, navigation, layouts, states, role visibility, data needs, responsive behavior, RTL behavior, accessibility requirements, and traceability to use cases and functional requirements.

The wireframes must guide:

- client review;
- UI/UX design;
- frontend implementation;
- backend/API planning;
- QA test planning;
- AI coding agents;
- future design-system documentation.

---

## 2. Approved Design Foundations

| Area | Approved rule |
|---|---|
| Product personality | Calm Arabic-first operations console: serious, fast, dense, trustworthy |
| Master direction | Calm Operations Console |
| Sub-directions | Field Ops Mobile for Supervisor/token pages; Finance Ledger for budget/payment; Object Workspace for Event Detail |
| Language | Arabic-first RTL default; English LTR secondary |
| Typography | IBM Plex Sans Arabic + IBM Plex Sans; fallback Noto Sans Arabic + system UI / Inter |
| Density | Comfortable default, compact optional for data-heavy internal tables |
| Spacing | Combined 4/8 spacing system |
| Colors | Blue-teal primary, charcoal neutrals, semantic status colors |
| Cards | Exception only; not main layout primitive |
| Tables | Default for multi-record comparison, filters, bulk actions, exports |
| Lists | Default for mobile roster and attendance workflows |
| Spreadsheet grids | Default for budget, wage rules, and payment review |
| Event workspace | Central object page with tabs |
| Supervisor | Mobile-first, large touch rows, one-tap status controls |
| Accessibility | WCAG 2.2 AA at wireframe level |

### 2.1 Card Guardrail

Do not default to card grids. Choose the container from the user task:

- table for comparison and bulk work;
- structured list for mobile roster work;
- spreadsheet grid for numeric finance work;
- object page/tabs for event workspace;
- drawer for row detail;
- dialog only for focused confirmation;
- cards only after passing the Zell-force Card Eligibility Test in `docs/07A_UI_UX_Foundations_Research.md`.

---

## 3. User Experience Principles

| Principle | Wireframe implication |
|---|---|
| Operations before decoration | Every block must answer a role-specific question or enable action |
| Dense but readable | Use compact typography, dividers, grouping, and table controls instead of card grids |
| Status always visible | Approval, lock, review, message failure, contract, attendance, and payment states must stay visible |
| Arabic-first | Layout, navigation, forms, tables, and reading order start RTL |
| Worker simplicity | Worker token pages are single-purpose and mobile-first |
| Error prevention | Payment, attendance, roster, contract, user, and budget actions require clear state and confirmation |
| Preserve context | Use drawers/split panes for record details so list filters/search stay intact |
| Role relevance | Each role lands on a dashboard that answers that role's first operational question |
| Reusable patterns | Same table/filter/drawer/state patterns across modules |
| Accessibility built in | Keyboard, focus, labels, errors, touch targets, and status text are required from wireframe stage |

---

## 4. Information Architecture

### 4.1 Primary Internal Navigation

RTL layout places the sidebar on the right by default.

| Nav item | Primary roles | Main contents |
|---|---|---|
| Dashboard | All internal roles | Role-specific landing page |
| Recruitment | Owner, Admin, HR | Applicant import, review queue, interviews |
| Staff | Owner, Admin, HR, Coordinator | Staff database, profiles, groups, skills |
| Clients | Owner, Admin, Coordinator | Client records |
| Events | Owner, Admin, Coordinator, HR limited, Finance limited, Viewer limited | Events list and Event Detail workspace |
| Payments | Owner, Admin, Finance | Payment review, batches, exports |
| Reports | Owner, Admin, Finance, Viewer, Coordinator limited | Operational and finance reports |
| Messages | Owner, Admin, HR, Coordinator | WhatsApp templates, logs, failures |
| Settings | Owner, Admin | Users, roles, tenant settings, integrations, job roles, shift types |
| Audit | Owner, Admin, Finance limited | Critical change logs |

### 4.2 Event Workspace Tabs

Event Detail is the central workspace.

| Tab | Purpose | Primary roles |
|---|---|---|
| Overview | Status, risks, client, dates, summary | Owner, Admin, Coordinator, Viewer |
| Roles | Required roles, headcount, backups | Owner, Admin, Coordinator |
| Budget | Billable/cost budget and margin | Owner, Admin, Finance view |
| Staffing | Assignments, confirmations, backups | Owner, Admin, Coordinator, HR limited |
| Contracts | Contract status and signed files | Owner, Admin, HR, Coordinator status-only |
| Attendance | Roster attendance and lateness | Owner, Admin, Supervisor assigned, Finance view |
| Payments | Payment lines and review state | Owner, Admin, Finance |
| Reports | Event-specific exports/reports | Owner, Admin, Coordinator, Finance, Viewer scoped |

Tabs hidden or disabled according to role permission. If hidden, routes must still be server-protected.

---

## 5. Role-Based Navigation

| Role | Landing screen | Visible primary nav | Never shown by default |
|---|---|---|---|
| Owner | Executive dashboard | All modules | None, except future SaaS admin |
| Admin | Operations dashboard | All modules except future SaaS admin | Future client portal config |
| HR / Recruiter | Recruitment dashboard | Dashboard, Recruitment, Staff, Events limited, Messages, Reports limited | Budget margin, payment approval |
| Coordinator | Staffing dashboard | Dashboard, Staff limited, Clients limited, Events, Messages, Reports limited | User management, payment approval, sensitive HR files by default |
| Supervisor | Mobile Today view | Today, Roster, Attendance, Issues/Profile | Budgets, margins, payment lines, unrelated events |
| Finance / Accountant | Finance dashboard | Dashboard, Events finance view, Payments, Reports, Audit limited | Recruitment files/photos/CVs by default |
| Viewer | Read-only dashboard | Dashboard, Reports, Events scoped read-only | Edit actions, files, payments unless explicitly scoped |
| Worker token user | Token page only | None | Internal app shell |

---

## 6. Complete Screen Inventory

| ID | Screen | Route / location | Primary roles | Pattern |
|---|---|---|---|---|
| S-001 | Login | `/login` | Internal users | Simple form |
| S-002 | Forgot/reset password | `/auth/reset` | Internal users | Simple form |
| S-003 | App shell | global | Internal users | RTL sidebar + top bar |
| S-004 | Owner dashboard | `/dashboard` | Owner | Metric strip + priority lists |
| S-005 | Admin dashboard | `/dashboard` | Admin | Alert list + work queues |
| S-006 | HR dashboard | `/dashboard` | HR | Recruitment queues |
| S-007 | Coordinator dashboard | `/dashboard` | Coordinator | Staffing progress |
| S-008 | Supervisor Today | `/m/today` | Supervisor | Mobile list |
| S-009 | Finance dashboard | `/dashboard` | Finance | Payment review queues |
| S-010 | Viewer dashboard | `/dashboard` | Viewer | Read-only summary |
| S-011 | Applicant import runs | `/recruitment/imports` | HR, Admin | Table |
| S-012 | Applicant review queue | `/recruitment/applicants` | HR, Admin | Table/list + drawer |
| S-013 | Applicant review detail | drawer/full page | HR, Admin | Drawer |
| S-014 | Interviews list | `/recruitment/interviews` | HR, Admin | Table/calendar list |
| S-015 | Interview score form | `/recruitment/interviews/:id` | HR, Admin | Form |
| S-016 | Staff database | `/staff` | Owner, Admin, HR, Coordinator limited | Index table |
| S-017 | Staff profile | `/staff/:id` | Owner, Admin, HR, Coordinator limited | Object page |
| S-018 | Staff groups | `/staff/groups` | Admin, HR, Coordinator | Table + builder |
| S-019 | Clients list | `/clients` | Owner, Admin, Coordinator | Table |
| S-020 | Client detail | `/clients/:id` | Owner, Admin, Coordinator | Summary page |
| S-021 | Events list | `/events` | Owner, Admin, Coordinator, Finance/View scoped | Index table |
| S-022 | Event create/edit | `/events/new`, `/events/:id/edit` | Owner, Admin, Coordinator limited | Full-page form |
| S-023 | Event detail overview | `/events/:id/overview` | Event roles scoped | Object page tab |
| S-024 | Event roles tab | `/events/:id/roles` | Owner, Admin, Coordinator | Table |
| S-025 | Event budget tab | `/events/:id/budget` | Owner, Admin, Finance view | Spreadsheet grid |
| S-026 | Event staffing tab | `/events/:id/staffing` | Owner, Admin, Coordinator, HR limited | Table/list + drawer |
| S-027 | Event contracts tab | `/events/:id/contracts` | Owner, Admin, HR, Coordinator status | Table + drawer |
| S-028 | Event attendance tab | `/events/:id/attendance` | Owner, Admin, Supervisor assigned, Finance view | Table/roster |
| S-029 | Event payments tab | `/events/:id/payments` | Owner, Admin, Finance | Spreadsheet/table |
| S-030 | Event reports tab | `/events/:id/reports` | Scoped roles | Report list |
| S-031 | Payments worklist | `/payments` | Owner, Admin, Finance | Table |
| S-032 | Payment batch review | `/payments/:batchId` | Owner, Admin, Finance | Finance grid |
| S-033 | Reports index | `/reports` | Scoped roles | Report directory/table |
| S-034 | Report detail | `/reports/:reportId` | Scoped roles | Filters + table/export |
| S-035 | Message templates | `/messages/templates` | Admin | Table/form |
| S-036 | Message log | `/messages/logs` | Admin, HR, Coordinator | Table |
| S-037 | Users and roles | `/settings/users` | Owner, Admin | Table + drawer |
| S-038 | Tenant settings | `/settings/general` | Owner, Admin | Sectioned form |
| S-039 | Integrations settings | `/settings/integrations` | Owner, Admin | Sectioned form |
| S-040 | Job roles and shift types | `/settings/catalogs` | Owner, Admin | Tables |
| S-041 | Audit log | `/audit` | Owner, Admin, Finance limited | Table |
| S-042 | Supervisor event roster | `/m/events/:id/roster` | Supervisor | Mobile roster list |
| S-043 | Supervisor attendance | `/m/events/:id/attendance` | Supervisor | Mobile roster controls |
| S-044 | Supervisor backup/issues | `/m/events/:id/issues` | Supervisor | Mobile forms/list |
| S-045 | Worker assignment token | `/t/assignment/:token` | Worker | Token page |
| S-046 | Worker contract token | `/t/contract/:token` | Worker | Token page |
| S-047 | Token expired/completed | token error state | Worker | State page |

---

## 7. Page-by-Page Wireframe Descriptions

### 7.1 Common Internal App Shell

| Field | Requirement |
|---|---|
| Screen | S-003 App shell |
| Purpose | Provide stable orientation, navigation, search, language, user/session controls |
| Layout regions | Right sidebar in RTL; top bar; main content; optional drawer layer; toast/status region |
| Primary action | Navigate to role-allowed module |
| Secondary actions | Global search, language switch, density switch future, profile/logout |
| Components | Sidebar nav, top bar, breadcrumbs, page title, action zone, drawers/dialogs |
| Data shown | User name/role, tenant name, current route, optional notification counts |
| Mobile behavior | Supervisor uses separate mobile shell; admin tablet collapses sidebar |
| RTL behavior | Sidebar right in Arabic; left in English; logical CSS only |
| Permission rules | Nav items visible by role; route/API protected server-side |
| Acceptance criteria | Current route highlighted; keyboard can reach nav/main; no module link appears for unauthorized role |

### 7.2 Screen Specification Matrix

This matrix defines wireframe-level requirements for major screens. Detailed common states are in section 15.

| Screen | Purpose and user questions | Data displayed | Primary / secondary actions | Layout and components | Search, filters, states | Mobile / RTL / permissions | Related UC / FR | Acceptance criteria |
|---|---|---|---|---|---|---|---|---|
| S-001 Login | Let internal user access app. Question: can I start work? | Logo/name, email, password, language | Login; forgot password | Centered form, no marketing hero | Loading, invalid credentials, inactive account | RTL by default; mobile full width; public route only | UC-029, FR-001 | Valid user logs in; inactive/invalid blocked with safe error |
| S-004 Owner dashboard | Show business risks first. Questions: what events/money need attention? | Active events, staffing risks, margin/payment approvals, exceptions | Open event/payment; approve queue | Metric strip max 4-6, priority lists, exception table | Empty no active events; loading skeleton; error retry | Desktop first; hide decorative charts; Owner only | UC-027, UC-028, FR-072 | Owner can reach every urgent item within 1 click |
| S-005 Admin dashboard | Show operational work queues. Questions: what is blocked today? | Failed imports/messages, understaffed events, pending contracts, attendance issues | Resolve queue item; open event | Alert list, work queues, compact metrics | Status badges, retry states | Admin only; RTL sidebar | UC-001, UC-014, UC-016, FR-072 | Admin sees broken workflows with owner entity links |
| S-006 HR dashboard | Show recruitment workload. Questions: who needs review/interview/contract? | Import count, applicant queue, interviews, contract progress | Review applicant; schedule interview | Queue lists + compact metrics | Filters by date/status/event; empty import queue | HR/Admin; no payment data | UC-001 to UC-005, FR-009 to FR-028 | HR can reach next applicant/interview directly |
| S-007 Coordinator dashboard | Show staffing progress. Questions: which roles are underfilled? | Events by staffing risk, declines, confirmations, backup coverage | Open event staffing; send/resend invites | Progress lists, exception table | Filter by event/date/client/status | Coordinator/Admin; no budget margin by default | UC-011 to UC-018, FR-039 to FR-048 | Underfilled role visible without opening every event |
| S-009 Finance dashboard | Show payment workload. Questions: what can be reviewed/exported? | Events awaiting review, payment exceptions, locked attendance, approved/export-ready batches | Open batch; export approved | Payment worklist table + exception list | Filter by event/status/date; error states | Finance/Owner/Admin; desktop first | UC-023 to UC-026, FR-068 to FR-071 | Finance can identify blockers before approval |
| S-010 Viewer dashboard | Read-only overview. Question: what can I see? | Scoped events/reports | Open report/event | Simple list/report summary | Empty state explains no access | Viewer cannot edit/export unless granted | UC-028, FR-072 | No edit actions rendered or accepted |
| S-011 Applicant import runs | Show sync history. Questions: did Google Sheet import work? | Run status, started/finished, rows seen/imported/failed, error summary | Run manual sync | Table with status badges | Filter by status/date; loading/error/retry | HR/Admin; Arabic dates | UC-001, FR-009 to FR-010 | Sync result counts visible; failed rows linked |
| S-012 Applicant review queue | Review imported rows before staff DB. Questions: create, merge, reject, defer? | Applicant name/phone/city/source row/status/match suggestion | Review selected row | Index table + side drawer | Search phone/name; filter status/source/run; bulk defer/reject TBD | HR/Admin; mobile becomes list | UC-002, FR-011 to FR-013 | No imported row creates person without decision |
| S-013 Applicant review detail | Compare imported row with possible person match. | Raw/mapped data, duplicate suggestions, errors, decision history | Create person, merge, reject, defer | Drawer 520px or full page mobile | Validation errors inline; conflict state | HR/Admin; LTR isolate phone/email | UC-002, FR-012 to FR-014 | Decision requires reason for reject/merge override |
| S-014 Interviews list | Manage interview schedule and outcomes. | Person, event, interviewer, date/time, status, score | Schedule interview; open score form | Table/calendar list toggle | Filter date/status/event/interviewer | HR/Admin; mobile list | UC-004, UC-005, FR-026 to FR-028 | Missed/overdue interviews visibly flagged |
| S-015 Interview score form | Record structured scores. | Candidate, criteria, score fields, notes, status | Save score; mark no-show/cancel | Full page/drawer form | Inline validation; score out of range | HR/Admin; Arabic labels | UC-005, FR-027 | Overall score updates and appears on profile |
| S-016 Staff database | Find and manage workforce records. Questions: who fits this event/filter? | Name, phone, city, type, status, skills, ratings, availability TBD | Open profile; create person; add to group | Index table with saved views; drawer quick view | Search, filters, column visibility, bulk actions | No card grid; mobile priority list | UC-011, FR-014 to FR-018 | Common filters work together; selection enables bulk actions |
| S-017 Staff profile | View/edit staff record. | Personal data, skills, files, ratings, history, notes, assignments | Edit profile; add note; upload file | Object page sections/tabs | Read-only/locked states for restricted roles | Sensitive fields hidden by role | UC-003, UC-011, FR-014 to FR-018 | Role restrictions hide and block sensitive fields |
| S-018 Staff groups | Create manual/smart groups. | Group name/type/count/criteria/members | Create group; add selected staff | Table + builder drawer | Filter manual/smart; empty state | Coordinator/HR/Admin | UC-012, FR-021 to FR-022 | Smart group criteria preview before save |
| S-019 Clients list | Manage client records. | Client name/contact/events count/notes snippet | Create client; open detail | Table | Search name/contact; duplicate warning | Owner/Admin edit; Coordinator limited | UC-006, FR-029 | Duplicate client warning shown |
| S-020 Client detail | Show client and related events. | Client fields, event history, contacts, notes | Edit client; create event | Summary list + events table | Empty no events | Permissions by role | UC-006, UC-007, FR-029 to FR-030 | Related events accessible from client |
| S-021 Events list | Manage event pipeline. | Event, client, city, dates, status, staffing progress, risk, finance status if allowed | Create event; open event | Index table/list report | Saved views, status/date/client filters | No card grid; role-based columns | UC-007, FR-030 to FR-031 | Understaffed/completed/cancelled states clear |
| S-022 Event create/edit | Create event shell. | Event fields, client, city/location, dates, status, VAT/payment terms | Save draft; continue to roles | Full-page sectioned form | Inline validation, unsaved warning | Coordinator may have limited fields | UC-007, FR-030 | Date validation blocks invalid ranges |
| S-023 Event overview | Give event command summary. | Event status, role progress, contract state, attendance/payment locks, key risks | Open next required tab | Object page header + panels/lists | Empty/missing setup alerts | Role-specific visibility | UC-007 to UC-028, FR-031 | User sees next blocking action in header/alerts |
| S-024 Event roles | Configure required roles/headcount/backups. | Job role, headcount, backup count, confirmed/pending counts | Add/edit role | Table with inline edit/drawer | Duplicate role validation | Coordinator/Admin/Owner | UC-008, FR-032 to FR-034 | Required vs confirmed visible per role |
| S-025 Event budget | Configure billable/cost master sheet. | Budget lines, side, category, role, shift, rate, days, qty, planned/actual, margin | Add line; save/recalculate | Spreadsheet-like grid + summary strip | Cell validation, locked/approved state, missing rate warnings | Owner/Admin edit; Finance view | UC-009, UC-027, FR-035 to FR-037 | Billable and cost visually distinct; money aligned |
| S-026 Event staffing | Build roster and send invitations. | Assignments, role, stage, confirmation, backup, contract status, message status | Assign staff; send invite; approve roster | Table/grouped list + side drawer | Filters role/stage/status; bulk send; no cards | Coordinator/Admin; HR limited | UC-011 to UC-018, FR-039 to FR-048 | Bulk action bar appears only with selected rows |
| S-027 Event contracts | Track contract issue and return. | Worker, assignment, contract status, sent/signed/deadline/file | Issue/resend/upload contract | Table + drawer/file upload | Filter status/deadline; failed upload state | HR/Admin; Coordinator status-only | UC-016, UC-017, FR-049 to FR-053 | Signed file linked and visible to allowed roles |
| S-028 Event attendance | Review or enter event attendance. | Roster by date/role, status, late minutes, backup outcome, recorder, lock state | Mark/edit attendance; lock/reopen | Desktop table; Supervisor mobile roster | Filter date/role/status; locked state | Supervisor assigned only; Finance view | UC-019 to UC-021, FR-054 to FR-059 | Locked records block Supervisor edits |
| S-029 Event payments | Review event payment lines. | Worker, attendance, base, deduction, adjustment, net, status, errors, batch state | Mark reviewed; approve; export | Finance grid/table + summary strip | Filter errors/status; missing rate state | Finance/Owner/Admin only | UC-023 to UC-026, FR-062 to FR-071 | Unresolved errors block approval unless override |
| S-030 Event reports | Event-specific reports. | Roster, headcount, attendance, payment, budget summary links | Generate/export report | Report list + filter panels | Loading/export progress | Role-scoped report list | UC-028, FR-073 to FR-077 | Exports respect role and approval state |
| S-031 Payments worklist | Show all payment batches/events. | Event, batch status, reviewed/approved/exported, exception count | Open batch; create batch | Table | Filter status/date/client | Finance/Owner/Admin | UC-024 to UC-026, FR-068 to FR-071 | Export-ready batches visible |
| S-032 Payment batch review | Review/approve/export payment batch. | Lines, totals, adjustments, errors, audit trail | Review, approve, reject, export | Spreadsheet/table + sticky summary/action bar | Error, locked, approval, export states | Owner/Admin approval; Finance review/export | UC-024 to UC-026, FR-068 to FR-071 | Approval records actor/time and locks relevant records |
| S-033 Reports index | Select report by need. | Report name, description, permitted roles, last generated | Open report | Table/list directory | Search report name/module | Viewer read-only scoped | UC-028, FR-073 to FR-077 | User sees only permitted reports |
| S-034 Report detail | Run report with filters. | Filter panel, result table, export action | Apply filters; export | Filters + table; no chart unless decision-useful | No results, export loading, permission denied | Responsive table behavior | UC-028, FR-073 to FR-077 | Export columns match report type and permissions |
| S-035 Message templates | Manage WhatsApp templates. | Name, language, category, Meta name, approval status, body | Create/edit template | Table + full/drawer form | Filter language/status; unapproved warning | Admin only | UC-030, FR-044 | Production sends blocked/warned if unapproved |
| S-036 Message log | Investigate sends/replies/failures. | Person, related entity, direction, status, time, error | Resend/retry if allowed | Table + detail drawer | Filters status/entity/person/date | HR/Coordinator see relevant logs only | UC-014, UC-015, UC-017, FR-045 to FR-048 | Failed messages link to related assignment/contract |
| S-037 Users and roles | Manage internal users. | User, email, role, status, linked person | Create user; activate/deactivate | Table + drawer | Search role/status; duplicate email | Owner/Admin only | UC-029, FR-002 to FR-006 | Deactivated user cannot log in |
| S-038 Tenant settings | Configure tenant defaults. | Language, timezone, currency, Hijri, country | Save settings | Sectioned form | Validation, unsaved warning | Owner/Admin only | FR-085 to FR-088 | Settings use references for secrets, not plaintext |
| S-039 Integrations settings | Configure Google Sheets and WhatsApp. | Sheet ID/range/mapping, WhatsApp config refs, sync schedule | Save/test integration | Sectioned form + test result panels | Auth failure, mapping errors | Owner/Admin only | UC-001, UC-030, FR-009, FR-044 | Test result shows success/error without exposing secrets |
| S-040 Catalogs | Manage job roles, shift types, skills. | Role names, shift codes/hours, active/default | Add/edit catalog item | Tables + drawers | Duplicate validation | Owner/Admin; skills may HR limited | UC-008, FR-019, FR-032 | Inactive catalog items excluded from new setup |
| S-041 Audit log | Review critical changes. | Actor, action, entity, before/after summary, reason, time | View detail/export TBD | Table + detail drawer | Filter actor/action/entity/date | Owner/Admin; Finance payment-related limited | FR-081 to FR-084 | Sensitive values redacted where needed |
| S-042 Supervisor event roster | Show assigned event roster on mobile. | Worker name, role, phone, confirmation, backup, contract status | Open attendance; call/message | Mobile grouped list | Search worker; group by role/status | Supervisor assigned event only; RTL mobile | UC-019, FR-054 | Unrelated event URL denied |
| S-043 Supervisor attendance | Fast attendance entry. | Roster rows, current status, late minutes, backup outcome | Mark present/late/absent/excused | Large rows + segmented controls + sticky summary | Offline/poor network banner; locked state | 48px targets; no swipe-only critical actions | UC-020, UC-021, FR-055 to FR-059 | High-risk changes confirm; saved state visible within row |
| S-044 Supervisor backup/issues | Capture backup outcome, notes, ratings. | Backup workers, covered assignment, notes, rating score | Mark standby/took_over; save note/rating | Mobile forms + lists | Validation for took_over link | Supervisor assigned event only | UC-021, UC-022, FR-059 to FR-061 | Backup outcome affects payment state |
| S-045 Worker assignment token | Let worker view assignment and confirm/decline. | Event, role, date/time, location, instructions, status | Confirm; decline | Single-purpose mobile page | Expired, already completed, network error | No app shell; Arabic-first; token scoped | UC-015, FR-046 | Token action updates assignment once |
| S-046 Worker contract token | Let worker view/upload contract. | Contract details, deadline, file upload, status | Upload signed contract | Single-purpose mobile page | Upload progress/error/success | File input camera/files; token scoped | UC-017, FR-052 to FR-053 | File stored and linked to contract |
| S-047 Token expired/completed | Explain unavailable token. | Reason, support contact/action | Contact MAG/return | State page | Expired/completed/invalid | No sensitive data | UC-015, UC-017 | Invalid token reveals no internal data |

---

## 8. Event Workspace Specification

### 8.1 Header

Every Event Detail tab uses a persistent header:

- event name;
- client;
- city/location;
- date range;
- status badge;
- staffing progress summary;
- approval/lock states;
- primary next action based on role and status;
- tabs visible by permission.

### 8.2 Tab Behavior

| Rule | Requirement |
|---|---|
| Preserve context | Switching tabs preserves filters where reasonable |
| Deep links | Each tab has direct URL |
| Permission | Hidden/disabled tabs must also be API-protected |
| Lock states | Header and relevant tab show lock/review/approval state |
| Unsaved changes | Prompt before leaving dirty forms/grids |
| Mobile | Internal admin tabs become scrollable segmented nav; Supervisor uses separate mobile routes |

### 8.3 Event Tab Acceptance Criteria

- User can identify event status without scrolling.
- Understaffed role, missing wage rule, failed message, missing contract, attendance lock, and payment error appear as visible alerts or status columns.
- Event Detail never becomes card grid; it uses object page header, tabs, sections, tables, grids, and drawers.

---

## 9. Desktop Dashboard Specifications

| Dashboard | First question | Blocks | Action enabled | Data required | Priority |
|---|---|---|---|---|---|
| Owner | What needs my decision? | Event risks, payment approvals, margin exceptions, active events | Approve/open issue | events, roles, payment batches, budget summaries | High |
| Admin | What operational item is broken? | Import failures, message failures, pending contracts, attendance issues | Resolve/open owner entity | imports, messages, contracts, attendance | High |
| HR | Who needs recruitment action? | New imports, review queue, interviews, contract progress | Review/schedule/score | import rows, persons, interviews, contracts | High |
| Coordinator | Which events need staffing action? | Underfilled roles, confirmations, declines, backup coverage, message failures | Assign/invite/replace | events, assignments, event roles, messages | High |
| Finance | What payment work is ready or blocked? | Review queue, errors, approved/export-ready batches, attendance locks | Review/export/open blocker | payment lines, batches, attendance | High |
| Viewer | What can I read? | Scoped reports/events | Open report | reports/events allowed by role | Medium |

Dashboard rules:

- Use KPI cards only for 4-6 top metrics.
- Use prioritized lists/tables for exceptions.
- Charts only if they answer a decision question.
- Every block needs direct link to source workflow.

---

## 10. Mobile Supervisor Flow

### 10.1 Flow

```text
m/today
  -> assigned event
  -> roster
  -> attendance
  -> backup/issues
  -> optional rating/note
```

### 10.2 Mobile Requirements

| Area | Requirement |
|---|---|
| Navigation | Minimal: Today, Roster, Attendance, Issues/Profile |
| Roster rows | Worker name, role, confirmation, backup flag, phone/action, status |
| Attendance controls | One-tap segmented controls: present, late, absent, excused |
| Late input | Shown only when late selected; numeric keyboard |
| Backup outcome | standby/took_over/not_applicable with covered worker selector |
| Safety | Confirm absent/no-show, locked edits, override actions |
| Feedback | Save state visible in row; pending/offline state visible |
| Touch | 48px minimum critical touch targets |
| Offline/poor network | Show banner and retry queue if supported; otherwise block with clear retry |
| Privacy | No budget, margin, payment details |

---

## 11. Worker Token Pages

Worker pages are not a portal and do not use internal navigation.

| Page | Purpose | Content | Actions | States |
|---|---|---|---|---|
| Assignment details | Worker checks offer | Event, role, date/time, location, instructions, contact | Confirm, decline | Loading, confirmed, declined, expired, invalid |
| Decline reason | Optional capture reason | Reason options/text | Submit | Validation, submitted |
| Contract view/upload | Worker returns signed contract | Contract deadline, file instructions, upload control | Upload PDF/photo file, submit | Uploading, success, failed, expired |
| Completed state | Prevent duplicate action | Summary of prior response | Contact MAG | Already completed |
| Expired/invalid state | Safe failure | Generic reason, contact | Contact support | No sensitive data |

Token rules:

- token scoped to one assignment/contract;
- no list of other workers/events;
- no budget/payment data;
- minimal text and large actions;
- Arabic-first, English fallback;
- file upload optimized for mobile camera/files;
- expired/invalid page must not reveal internal identifiers beyond safe support context.

---

## 12. Tables and Spreadsheet Patterns

### 12.1 Standard Index Table

Use for Staff, Applicants, Events, Contracts, Payments, Reports, Users, Messages.

Required anatomy:

- page title and result count;
- saved views;
- search;
- primary filters;
- more filters drawer/dropdown;
- active filter chips;
- column visibility;
- sorting;
- row selection;
- bulk action bar;
- pagination or virtual scroll for large lists;
- sticky header;
- sticky first column for wide tables;
- detail drawer;
- loading/empty/no results/error states.

### 12.2 Spreadsheet Grid

Use for budget, wage rules, and payment review.

Required anatomy:

- frozen header;
- row numbers or stable line labels;
- decimal-aligned money columns;
- inline validation;
- formula/calculation display;
- locked/read-only state;
- summary strip;
- changed-cell indicator before save;
- audit/history access for sensitive lines;
- keyboard navigation;
- copy/paste rules TBD.

### 12.3 Roster List

Use for Supervisor mobile and some staffing views.

Required anatomy:

- grouped by role/status;
- worker primary name line;
- secondary role/status line;
- clear status badge;
- primary action visible;
- phone/contact action where allowed;
- large touch areas;
- no swipe-only critical action.

---

## 13. Form Patterns

| Form type | Pattern | Examples |
|---|---|---|
| Simple create/edit | Drawer or full page based on complexity | Client, user, catalog item |
| Complex setup | Full page with sections | Event create/edit, staff profile |
| Finance/budget edits | Spreadsheet cell/grid | Budget lines, payment adjustments |
| High-risk confirmation | Dialog | Delete, approve, lock/reopen, reject payment |
| Mobile field capture | Full mobile page/bottom sheet where safe | Attendance late minutes, backup outcome |

Form rules:

- visible labels, never placeholder-only;
- required fields clearly marked;
- logical field grouping with headings/fieldsets;
- inline validation near field;
- error summary for long forms;
- save draft for event/budget where possible;
- unsaved-change warning;
- read-only state distinct from disabled;
- audit reason field for sensitive changes;
- Arabic inputs align start in RTL; phone/email/IDs use LTR isolation.

---

## 14. Search, Filters, and Bulk Actions

| Module | Search | Primary filters | Bulk actions |
|---|---|---|---|
| Applicant queue | Name, phone | status, import run, error, duplicate | defer/reject TBD |
| Staff DB | Name, phone, city | status, city, gender, type, skills, ratings | add to group, assign, message TBD |
| Events | Event/client/city | status, date, client, staffing risk | export/list actions TBD |
| Staffing | Worker/name/phone | role, stage, confirmation, backup, contract | send invite, resend, assign role, remove |
| Contracts | Worker/event | status, deadline, role | issue/resend/download TBD |
| Attendance | Worker/role/date | status, role, backup outcome, date | mark selected TBD, export |
| Payments | Worker/event | status, errors, approval, role | mark reviewed, export approved |
| Messages | Person/entity | status, direction, date, template | retry/resend where allowed |
| Users | Name/email | role, active status | deactivate/reactivate TBD |
| Audit | Entity/action/actor | date, action, entity type | export TBD |

Bulk action rules:

- bulk bar appears only after selection;
- show selected count;
- destructive/financial bulk actions require confirmation;
- disabled bulk action must explain why;
- selection must persist through row focus, not through unrelated filter changes unless explicit.

---

## 15. Screen States

Every major screen must define these states:

| State | Required behavior |
|---|---|
| Initial | Shows shell, title, and skeleton or empty data placeholder |
| Loading | Skeleton for tables/lists; button-level spinner for action |
| Empty | Explains no records and gives allowed next action |
| No search results | Shows current filters and clear/reset action |
| Partial data | Shows available data plus warning for missing integration/source |
| Success | Inline state update plus optional non-blocking toast |
| Validation error | Field-level error + summary for long forms |
| System error | Clear message, retry action, support/error ID if available |
| Offline/connection issue | Banner and retry guidance; mobile attendance must not silently lose entries |
| Permission denied | Explain access denied; no sensitive details |
| Locked/read-only | Lock badge, reason, who/when if allowed, reopen request action if permitted |
| Archived/cancelled | Muted state, read-only default, limited actions |
| Pending approval | Amber/review state visible in header and table/status column |
| Approved | Green/check state visible; related edit actions disabled if locked |
| Rejected | Reason and next correction action |
| Import failure | Row/run error with source row and repair guidance |
| Message failure | Status column with error and retry/resend action where allowed |
| Missing payment rule | Payment line error blocks approval and links to budget/wage rule |
| Attendance conflict | Conflict row with current value, attempted change, and resolution action |

Do not rely only on toast notifications for critical workflow state.

---

## 16. RTL and Bilingual Behavior

| Area | RTL rule |
|---|---|
| App shell | Sidebar on right in Arabic; left in English |
| Breadcrumbs | Order and chevrons mirror in RTL |
| Tabs | Start from right in Arabic |
| Drawers | Open from logical end/right in Arabic unless source context suggests otherwise |
| Forms | Labels and text align start; numeric/phone/email fields use LTR isolation |
| Tables | Text columns align start; numeric/money columns align by decimal/end with tabular numerals |
| Icons | Directional icons mirror; media/common icons do not mirror |
| Dates | Locale-aware; Hijri optional beside Gregorian |
| Currency | SAR formatting by locale preference; numbers remain readable and stable |
| Mixed text | Use `bdi` or explicit direction for names, phone, email, file names, IDs |
| Charts | Do not mirror time/data meaning if it changes interpretation |

Language switch must not create two unrelated layouts. Same component system uses logical CSS.

---

## 17. Responsive Behavior

| Breakpoint | Width | Behavior |
|---|---:|---|
| Mobile | 360-767 | Supervisor/token optimized; admin tables simplified or horizontal where unavoidable |
| Tablet | 768-1023 | Collapsed sidebar; drawers become full-height overlays if needed |
| Desktop | 1024-1439 | Full sidebar; table-first internal workflows |
| Wide | 1440+ | More columns where useful; do not stretch text blocks |

Responsive rules:

- administrative roles are desktop-first;
- Supervisor and worker token pages are mobile-first;
- dense tables do not become card grids on mobile by default;
- mobile tables show priority columns and row details;
- sticky action bars reserve safe area;
- touch controls at least 44px, critical mobile actions 48px;
- no viewport-width type scaling;
- long Arabic names wrap in detail views and truncate with accessible disclosure in dense rows.

---

## 18. Accessibility Requirements

Wireframes must support:

- WCAG 2.2 AA;
- keyboard access for navigation, tables, filters, tabs, drawers, dialogs;
- visible focus ring;
- semantic headings and table headers;
- screen-reader labels for icon-only controls;
- aria/status communication for async updates;
- field labels and helper text;
- inline errors and error summary;
- dialog focus trap and Escape behavior;
- 200% zoom without content loss;
- reduced motion support;
- color contrast 4.5:1 for normal text;
- status not communicated by color alone;
- 44px minimum touch targets and 48px for mobile critical actions;
- RTL logical reading order;
- no hover-only critical actions;
- accessible file upload feedback.

---

## 19. Component Inventory

| Component | Use | Notes |
|---|---|---|
| App shell | Internal desktop/tablet | RTL-aware sidebar/topbar |
| Mobile shell | Supervisor | Minimal nav only |
| Token page shell | Worker | No internal nav |
| Data table | Core record lists | Saved views, filters, columns, bulk actions |
| Spreadsheet grid | Budget/payments | Keyboard, validation, locking |
| Roster row | Supervisor/staffing | Large status controls |
| Status badge | All modules | Label + icon + color |
| Alert banner | Critical states | Missing rules, failed integration, locked state |
| Side drawer | Record details | Preserve list context |
| Dialog | Confirmation | High-risk focused decisions only |
| Section panel | Grouped content | Use instead of nested cards |
| KPI card | Dashboard summary | Limited count only |
| Summary list | Metadata | Event/staff/client facts |
| Filter bar | Tables/reports | Primary + more filters |
| Bulk action bar | Tables | Selection count and actions |
| Stepper/task list | Event setup/contracts | Progress state |
| File upload | CV/photo/contract | Progress/error/success |
| Audit drawer | Sensitive changes | Before/after/reason |
| Empty state | No data | Short message + action |
| Skeleton | Loading | Table/list/page-level |

---

## 20. Data Requirements Per Screen

| Screen group | Required entities |
|---|---|
| Auth/app shell | users, tenants, tenant_settings |
| Dashboards | events, event_roles, event_assignments, contracts, attendance_records, payment_batches, messages, applicant_import_rows |
| Recruitment | applicant_import_runs, applicant_import_rows, persons, interviews, interview_scores, notes, messages |
| Staff | persons, skills, person_skills, consents, files, interviews, event_day_ratings, staff_groups, staff_group_members, notes |
| Clients | clients, events, notes |
| Events list/detail | events, clients, event_roles, job_roles, event_assignments, contracts, attendance_records, payment_lines, payment_batches |
| Budget | event_budget_items, event_budget_summary, job_roles, shift_types, late_penalty_tiers, audit_logs |
| Staffing | persons, event_assignments, event_roles, job_roles, contracts, messages, staff_groups |
| Attendance | event_assignments, persons, attendance_records, late_penalty_tiers, event_supervisors |
| Payments | payment_lines, payment_batches, payment_batch_lines, attendance_records, event_budget_items, audit_logs, export_runs |
| Reports | report-specific views over events, assignments, attendance, budget, payments, ratings |
| Messages | message_templates, messages, persons, event_assignments, contracts |
| Settings | users, tenant_settings, job_roles, shift_types, skills, message_templates |
| Audit | audit_logs, users, related entities |
| Worker tokens | token payload, event_assignments, events, contracts, files, messages |

---

## 21. Permissions and Role Visibility

| Screen group | Owner | Admin | HR | Coordinator | Supervisor | Finance | Viewer |
|---|---:|---:|---:|---:|---:|---:|---:|
| Dashboards | Full | Full ops | HR | Staffing | Assigned mobile | Finance | Read-only |
| Recruitment | Full | Full | Full | No/TBD | No | No | No |
| Staff DB | Full | Full | Full | Limited | Assigned roster only | Limited/no files | Read-only limited |
| Clients | Full | Full | Limited/TBD | Limited/full TBD | Event context only | Limited | Read-only |
| Events | Full | Full | Limited | Full ops | Assigned only | Finance view | Read-only scoped |
| Budget | Edit | Edit | No | No/TBD | No | View/review | No default |
| Staffing | Full | Full | Limited | Full ops | Assigned view | No/TBD | Read-only scoped |
| Contracts | Full | Full | Full | Status/TBD | No | Dispute/TBD | No default |
| Attendance | Full | Full | No/TBD | View/TBD | Assigned write | View | Read-only scoped |
| Payments | Full/approve | Full/approve | No | No/TBD | No | Review/export | No default |
| Reports | Full | Full | Limited | Operational | Assigned only | Finance | Read-only scoped |
| Messages | Full | Full | Relevant | Relevant | No/TBD | No | No |
| Users/settings | Full | Full | No | No | No | No | No |
| Audit | Full | Full | Limited/TBD | No | No | Payment-related TBD | No |

TBD permissions must be confirmed before implementation. UI hiding is not security; APIs enforce every rule.

---

## 22. Traceability

| UI area | Use cases | Functional requirements | Data entities |
|---|---|---|---|
| Applicant import/review | UC-001, UC-002 | FR-009 to FR-013 | applicant_import_runs, applicant_import_rows, persons |
| Candidate screening/interviews | UC-003 to UC-005 | FR-023 to FR-028 | persons, interviews, interview_scores, notes |
| Staff database/groups | UC-011, UC-012 | FR-014 to FR-022 | persons, skills, staff_groups |
| Clients | UC-006 | FR-029 | clients |
| Event setup | UC-007, UC-008 | FR-030 to FR-034 | events, event_roles, job_roles |
| Budget/master sheet | UC-009, UC-010, UC-027 | FR-035 to FR-038, FR-076 | event_budget_items, late_penalty_tiers |
| Staffing/invitations | UC-013 to UC-015, UC-018 | FR-039 to FR-048 | event_assignments, messages |
| Contracts | UC-016, UC-017 | FR-049 to FR-053, FR-080 | contracts, files, messages |
| Supervisor attendance | UC-019 to UC-022 | FR-054 to FR-061 | event_supervisors, attendance_records, event_day_ratings |
| Payments | UC-023 to UC-026 | FR-062 to FR-071 | payment_lines, payment_batches |
| Reports | UC-028 | FR-073 to FR-077 | report views over core entities |
| Users/RBAC | UC-029 | FR-001 to FR-008 | users, persons |
| Messages/templates | UC-030 | FR-044 to FR-048 | message_templates, messages |
| Audit | Cross-cutting | FR-081 to FR-084 | audit_logs |
| Localization/settings | Cross-cutting | FR-085 to FR-088 | tenant_settings |

---

## 23. Open Questions

| ID | Question | Impact |
|---|---|---|
| OQ-001 | Exact Google Form fields and required mapping? | Applicant import/review wireframes |
| OQ-002 | Exact report/export formats and columns: CSV, XLSX, PDF, print? | Reports/payments screens |
| OQ-003 | Should Coordinator edit agreed wage or only Owner/Admin? | Staffing and budget permissions |
| OQ-004 | Should payment export require two-step approval? | Payment batch states |
| OQ-005 | Exact shift taxonomy: 6hr, 10hr, custom, tenant-configurable? | Budget/payment grids |
| OQ-006 | Exact interview and event-day rating criteria/scale? | HR/profile/supervisor screens |
| OQ-007 | Should notes have sensitivity/visibility levels in MVP? | Staff profile/audit/access rules |
| OQ-008 | Should Viewer have operational vs finance scopes? | Viewer dashboard/report visibility |
| OQ-009 | Exact support contact text for token expired/invalid pages? | Worker token UX |
| OQ-010 | Offline attendance behavior: queue changes or require live connection? | Supervisor mobile implementation |

---

## 24. Wireframe Acceptance Criteria

Phase 7 wireframes are acceptable when:

1. Every MVP role has a defined landing screen and navigation.
2. Every MVP use case has at least one related screen or screen state.
3. Event Detail uses object workspace tabs and not card-grid layout.
4. Staff, applicants, events, contracts, payments, users, messages, and reports are table/list-first.
5. Budget and payment review use spreadsheet-like grids with validation and lock states.
6. Supervisor attendance is mobile-first with large roster rows and one-tap status controls.
7. Worker token pages are single-purpose and unauthenticated.
8. Approval, lock, error, missing-rule, failed-message, and payment-review states are visible.
9. RTL and mixed Arabic/English behavior are specified.
10. Responsive behavior is defined for desktop, tablet, mobile, Supervisor, and token pages.
11. Accessibility requirements are included before visual design.
12. Permissions and role visibility are documented.
13. Traceability links screens to use cases, FRs, and data entities.
14. Open questions are explicitly marked instead of silently decided.

