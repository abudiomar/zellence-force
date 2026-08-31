# Business Requirements Document (BRD)

**Project:** Zell-force  
**Client / Business Owner:** MAG Events  
**Market:** Saudi Arabia / Arab Middle East  
**Document status:** Draft v0.1  
**Source inputs:** `SYSTEM_ARCHITECTURE.md`, client confirmations, MAG Events public website, Google Workspace documentation  
**Date:** 2026-06-10

---

## 1. Executive Summary

Zell-force is a cloud-based event staffing operations platform for MAG Events, a Saudi event staffing and field operations company. The platform will centralize staff profiles, event staffing, role planning, budget tracking, contracts, attendance, ratings, WhatsApp communication, and payment calculation.

The MVP will not replace the existing Google Form applicant intake. Instead, it will build around current intake data by importing or synchronizing Google Forms responses through the linked Google Sheet and/or Google APIs. This keeps current public recruitment flow stable while adding internal operational control.

The expected MVP delivery timeline is **10-12 calendar weeks**, with a heavy-scale architecture ready for hundreds to thousands of staff profiles and future multi-tenant expansion.

---

## 2. Business Background

MAG Events operates in Saudi event staffing and field operations. Its public positioning covers front-of-house staffing, recruitment/manpower, guest experience and protocol, VIP/VVIP hospitality, and field supervision for cultural, corporate, and large-scale events.

Current public recruitment appears to depend on an "Apply Now" process and recruiter WhatsApp communication. Internally, the business need described in the architecture source is to replace spreadsheets, WhatsApp groups, phone calls, and manual coordination with one operational system.

**Known scale:** Heavy-scale readiness required. Exact staff pool size, event volume, and monthly operational load are **TBD**.

---

## 3. Problem Statement

MAG Events needs a reliable way to manage large rotating event workforce operations across recruitment, selection, scheduling, attendance, contracts, payments, and profitability.

Current operations are assumed to rely on:

- Google Form / Google Sheet intake for applicants.
- WhatsApp recruiter communication.
- Spreadsheets for staff lists, event rosters, budgets, and payment calculations.
- Manual follow-up for confirmations, contracts, attendance, and reporting.

This creates operational risk:

- staff data scattered across tools;
- slow filtering and selection of suitable staff;
- unclear staffing status per event;
- contract tracking gaps;
- attendance and lateness disputes;
- payment calculation errors;
- weak visibility into event cost, revenue, and margin.

**Needs client confirmation:** exact current workflow, pain frequency, financial impact, and worst operational failure cases.

---

## 4. Business Objectives

| ID | Objective | Priority |
|---|---|---|
| BO-001 | Centralize workforce data for temps and permanent staff. | High |
| BO-002 | Let operations staff filter, group, invite, and assign staff faster. | High |
| BO-003 | Create event master sheets with role headcounts, wages, client billing, cost lines, and margin visibility. | High |
| BO-004 | Track applicant journey from intake through screening, interview, contract, assignment, attendance, rating, and payment. | High |
| BO-005 | Keep WhatsApp as worker communication channel while reducing manual message chaos. | High |
| BO-006 | Calculate staff payments accurately from attendance, shift type, agreed wage, backup status, and lateness rules. | High |
| BO-007 | Support Arabic-first RTL operations with bilingual Arabic/English capability. | High |
| BO-008 | Prepare architecture for future multi-tenant SaaS usage. | Medium |

---

## 5. Success Metrics / KPIs

Exact KPI targets are **TBD**. Recommended defaults:

| KPI | Recommended Target |
|---|---|
| Staff search/filter speed | Common filters return usable results in under 2 seconds for thousands of profiles. |
| Event staffing visibility | Admin can see confirmed vs. required headcount per event role in real time. |
| Contract tracking | 100% of assigned staff show contract status: pending, signed, rejected, expired, or manual override. |
| Attendance coverage | Every confirmed worker has per-day attendance status before payment calculation. |
| Payment accuracy | Payment lines generated from rules with auditable breakdown for every attendance row. |
| Manual spreadsheet reduction | Core event roster, attendance, and payment workflows handled inside Zell-force for pilot events. |
| Pilot readiness | One real MAG Events event can be planned, staffed, attended, rated, and costed in platform. |

---

## 6. Stakeholders

| Stakeholder | Role in Project | Needs |
|---|---|---|
| MAG Events Owner | Business sponsor, ultimate approver | Operational control, margin visibility, payment confidence |
| Admin / Operations Manager | Daily system operator | Event setup, staffing, budgets, reports |
| HR / Recruiter | Applicant and interview workflow owner | Intake review, screening, scoring, contract issuance |
| Coordinator | Event staffing execution | Rosters, confirmations, groups, messaging |
| Supervisor | On-site attendance owner | Simple attendance and lateness entry |
| Finance / Accountant | Payment review and payout preparation | Payment lines, exports, audit trail |
| Viewer / Auditor | Read-only oversight | Reports and operational visibility |
| Temps / Permanent Staff | Workforce | WhatsApp-based confirmations, reminders, contracts |
| Clients | Companies hiring MAG Events | Indirect benefit; client login future/TBD |
| Developers / Maintainers | Build and support system | Clear requirements, data model, tests, architecture |

---

## 7. Current Process

**Current process assumption, needs client confirmation:**

1. Candidate discovers MAG Events and applies through public Google Form.
2. Form responses are stored in Google Sheets.
3. Recruiter communicates with candidates via WhatsApp.
4. Staff details, ratings, and availability are tracked manually or semi-manually.
5. Event staffing is planned in spreadsheets.
6. Event budgets, staff wages, penalties, and margin are calculated manually.
7. Contracts are sent and returned through WhatsApp or manual file handling.
8. Supervisors collect attendance/lateness on-site.
9. Payment calculations are prepared manually from attendance and wage rules.
10. Reports are assembled from spreadsheets and message records.

---

## 8. Proposed Process

1. Applicant responses continue entering through existing Google Form.
2. Zell-force imports applicant data from linked Google Sheet / Google API into applicant/person records.
3. HR screens candidates, adds notes, schedules interviews, and records interview scores.
4. Admin creates event, client record, roles, headcounts, shifts, rates, budget lines, and lateness rules.
5. Coordinator filters staff by city, gender, skills, ratings, availability, and role suitability.
6. Coordinator creates manual or smart groups and assigns/invites staff to event roles.
7. WhatsApp messages send event details, confirmations, reminders, and contract instructions.
8. Contracts are tracked as issued, signed, pending, rejected, expired, or manually uploaded.
9. Supervisor enters attendance, lateness, absence, backup standby, or takeover status per event day.
10. Payment engine calculates payment lines with auditable breakdown.
11. Finance / Accountant reviews payment list; Owner/Admin retains approval authority in MVP.
12. Event dashboard shows confirmed staffing, planned vs. actual cost, income, and margin.

---

## 9. Business Scope

### MVP In Scope

- Event creation and management.
- Client records.
- Staff/person profiles for temps and permanent staff.
- Applicant import from Google Forms response Sheet / Google APIs.
- Staff filtering, saved groups, and smart groups.
- Recruitment, screening, interview scoring.
- Contract issue and return tracking.
- WhatsApp messaging using Meta WhatsApp Cloud API.
- Role/headcount planning.
- Two-sided event budget: billable vs. cost.
- Attendance and lateness entry by supervisor.
- Backup standby vs. takeover handling.
- Event-day ratings and interview ratings.
- Payment calculation only.
- Budget/profit monitor.
- Reports needed for pilot: roster, attendance, payment list, budget/profit.
- Arabic-first RTL UI with English support.
- Finance / Accountant role.
- Role creation foundation, with Owner/Admin able to hold finance/accounting responsibilities initially.

### MVP Priority Order

| Rank | Capability |
|---|---|
| 1 | Staff database + filtering |
| 2 | Event setup + master budget |
| 3 | Assignment pipeline |
| 4 | Contract tracking |
| 5 | Attendance + lateness |
| 6 | Payment calculation |
| 7 | WhatsApp automation |
| 8 | Reports/profit monitor |

---

## 10. Out of Scope

| Item | Status |
|---|---|
| Payment disbursement / bank / WPS integration | Out of MVP |
| Dedicated crew-facing mobile app | Out of MVP |
| Replacing Google Form intake | Out of MVP |
| Automated CV parsing | Out of MVP |
| Candidate auto-scoring | Out of MVP |
| Client-facing logins and client ratings | Future/TBD |
| Cross-event "master-master sheet" analytics | Future |
| Full multi-tenant activation and billing | Future |
| Accounting integrations such as Xero | Future |

---

## 11. Business Rules

| ID | Rule |
|---|---|
| BR-001 | Every operational record must belong to a tenant, even while MVP runs as single tenant. |
| BR-002 | A person may be temp or permanent staff, but both follow the same operational pipeline. |
| BR-003 | Owner and Admin have full operational access in MVP. |
| BR-004 | Finance / Accountant role can review payment calculations and export payment lists. |
| BR-005 | Owner/Admin may hold finance/accountant permissions initially. |
| BR-006 | Custom permission management is future work unless needed earlier by client. |
| BR-007 | Event assignments are the main workflow spine connecting staff to events, contracts, attendance, ratings, and payments. |
| BR-008 | Staff payment is calculated from attendance, shift type, agreed wage or event cost rate, backup status, lateness tiers, and adjustments. |
| BR-009 | Payment disbursement is not performed by Zell-force in MVP. |
| BR-010 | WhatsApp is the main workforce communication channel. |
| BR-011 | Candidate consent must be captured before WhatsApp/data processing. |
| BR-012 | Contract PDFs returned via WhatsApp are operational signed documents; cryptographic e-signature audit trail is not assumed. |
| BR-013 | Google Form intake remains active; Zell-force imports or syncs response data instead of replacing the form. |
| BR-014 | Money fields must use numeric/decimal precision, not floating-point approximations. |
| BR-015 | Calculated payment output must retain explanation/breakdown for audit and dispute handling. |

---

## 12. Assumptions

| ID | Assumption |
|---|---|
| A-001 | MAG Events is the pilot client and business owner. |
| A-002 | 10-12 calendar weeks is accepted MVP target timeline. |
| A-003 | System must support heavy scale, interpreted as hundreds to thousands of staff profiles for MVP architecture. |
| A-004 | Existing applicant intake uses Google Forms linked to Google Sheets. |
| A-005 | `database.js` is a starting DB source, not final authoritative schema. |
| A-006 | `SYSTEM_ARCHITECTURE.md` is current product source unless contradicted by client. |
| A-007 | Owner/Admin can temporarily cover finance approval duties until role/permission design matures. |
| A-008 | Arabic-first, RTL, bilingual Arabic/English, and Hijri support are required. |
| A-009 | KSA hosting/data residency is required. |

---

## 13. Constraints

| Constraint | Impact |
|---|---|
| 10-12 week MVP timeline | Requires strict MVP control and phased delivery. |
| Existing Google Form intake retained | Requires Google Sheet/API import rather than custom intake replacement. |
| WhatsApp Cloud API direct | Requires template approval, webhook reliability, token management. |
| KSA data residency | Hosting, DB, object storage, backups must be region-aware. |
| Arabic-first RTL | UI framework, layout, components, date handling must support RTL from day one. |
| Payment complexity | Needs test-first implementation and clear client rule validation. |
| Heavy-scale expectation | Requires indexed data model, efficient filters, pagination, background jobs. |

---

## 14. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Payment rules unclear or change late | Wrong payouts, disputes | Document rules early, unit-test payment engine, support manual adjustments |
| Google Form/Sheet schema changes | Broken intake import | Store mapping config, validation errors, import logs |
| WhatsApp template/API issues | Delayed confirmations/reminders | Start setup early, support manual fallback |
| Data quality from intake forms | Duplicate/incomplete profiles | Duplicate detection, required field mapping, review queue |
| Sensitive personal data handling | Compliance/privacy risk | Access limits, consent records, retention policy |
| Manual workflow adoption | Staff may keep using old spreadsheets | MVP must match real workflow and include import/export |
| Future multi-tenancy complexity | Rework risk | Keep `tenant_id` everywhere from start |
| Scope creep | Timeline risk | Use confirmed MVP priority order |

---

## 15. Approval Criteria

BRD approval means stakeholders agree that:

- Zell-force MVP purpose and business scope are correct.
- Google Form intake will be integrated, not replaced, in MVP.
- MVP timeline target is 10-12 calendar weeks.
- Payment disbursement, crew app, client portal, and advanced analytics are out of MVP.
- Finance / Accountant role is included, with Owner/Admin able to hold those permissions initially.
- The MVP priority order is accepted.
- Remaining unknowns are acceptable as TBD items for later requirements phases.

---

## 16. External Source Notes

Google documentation confirms that Google Forms responses can be stored in a linked Google Sheet, and that Google Sheets data can be read programmatically with the Sheets API. Google Forms API can also retrieve form metadata and responses directly. Forms watches can notify a Pub/Sub topic when responses are submitted, but watches expire and must be renewed.

Recommended MVP approach:

1. Link MAG Events Google Form responses to a Google Sheet.
2. Use Google Sheets API to read new rows on schedule or via a controlled sync action.
3. Map rows into Zell-force applicant/person records.
4. Add duplicate detection and import error review.
5. Consider Forms API watches/Pub/Sub later if near-real-time intake becomes necessary.

Sources:

- Google Help: Choose where to save form responses - https://support.google.com/docs/answer/2917686
- Google Forms API reference - https://developers.google.com/workspace/forms/api/reference/rest
- Google Forms retrieve responses guide - https://developers.google.com/workspace/forms/api/guides/retrieve-forms-responses
- Google Sheets API overview - https://developers.google.com/workspace/sheets/api/guides/concepts
- Google Forms watches reference - https://developers.google.com/workspace/forms/api/reference/rest/v1beta/forms.watches

---

## 17. Open Questions

| ID | Question | Owner |
|---|---|---|
| OQ-001 | Exact MAG Events decision-maker and final approver? | Client |
| OQ-002 | Exact staff pool size and expected event volume? | Client |
| OQ-003 | Exact current Google Form fields and linked Sheet structure? | Client / Developer |
| OQ-004 | Required reports for pilot beyond roster, attendance, payment, budget/profit? | Client |
| OQ-005 | Final role that approves payment lists before external payout? | Client |
| OQ-006 | Formal Saudi PDPL/data retention requirements for CVs, photos, IDs, contracts? | Client / Legal |
| OQ-007 | Canonical shift types: 6hr, 10hr, custom, or tenant-configurable? | Client |
| OQ-008 | Contract signature standard acceptable for disputes? | Client / Legal |
| OQ-009 | Exact hosting provider and KSA region availability? | Technical Lead |
| OQ-010 | Whether Google Form sync is one-way import only or needs status write-back to Sheets? | Client / Developer |

