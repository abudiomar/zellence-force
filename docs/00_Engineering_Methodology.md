# Engineering Methodology

**Project:** Zell-force  
**Status:** Mandatory project methodology  
**Date:** 2026-06-10

---

## 1. Purpose

This document defines how Zell-force must be designed, implemented, tested, reviewed, and maintained.

Required methodologies:

1. `code-structure`
2. `improve-codebase-architecture`
3. `dry-principle`
4. `test-driven-development`

These rules apply to all production code after planning begins.

---

## 2. Code Structure Methodology

Use two-layer separation:

| Layer | Owns | Must Not Own |
|---|---|---|
| Actions | Business rules, auth, role checks, workflow stage changes, approvals, user-facing errors | Low-level provider mechanics copied across flows |
| Operational-mechanics modules | Reusable mechanics like Google Sheets import, WhatsApp delivery, file storage, payment calculation, exports | Domain approval decisions or hidden DB state mutation |

Rule:

- Product flow meaning stays in Actions.
- Reliable operational mechanics go behind reusable Modules.

Examples:

| Product Flow | Action Owns | Operational Module Owns |
|---|---|---|
| Import applicants | Who may import, when row becomes review item | Google Sheets read, mapping, validation result |
| Send event invite | Which assignments can be invited | WhatsApp template send and status parsing |
| Record attendance | Supervisor access and lock rules | Attendance validation helpers, payment trigger |
| Export payment list | Approval state and role checks | CSV/XLSX generation |

Design rules:

- explicit parameters;
- structured return values;
- no hidden global state;
- no giant "do everything" module;
- extract one repeated block, replace one caller, verify, then migrate other callers.

---

## 3. Architecture Methodology

Use architecture vocabulary consistently:

| Term | Meaning |
|---|---|
| Module | Anything with an Interface and Implementation. |
| Interface | Everything callers must know: types, invariants, ordering, errors, config, performance. |
| Implementation | Code inside Module. |
| Depth | Leverage at Interface: much behavior behind small Interface. |
| Seam | Place where Module Interface lives and behavior can vary. |
| Adapter | Concrete thing satisfying an Interface at a Seam. |
| Leverage | Capability callers get from deep Module. |
| Locality | Change, bugs, knowledge, and verification concentrated in one place. |

Architecture review rules:

- Prefer deep Modules over shallow pass-through Modules.
- Use deletion test: if deleting Module removes complexity, it was shallow. If complexity spreads across callers, it earned its keep.
- Interface is test surface.
- One Adapter = hypothetical Seam. Two Adapters = real Seam.
- Do not create seams without real variation.

Project deep Module targets:

- Applicant Intake Import
- Staff Filtering
- Assignment Pipeline
- Budget Engine
- Attendance Capture
- Payment Calculator
- WhatsApp Messaging
- Contract Ingestion
- Report Export
- Audit Log

---

## 4. DRY Methodology

Core rule:

Do not repeat operational logic or config truth. Do not create premature abstractions.

Mandatory rules:

- Single source of truth for role names, statuses, permissions, template names, env vars, external integration config, event status values, assignment stage values, payment formulas.
- Wait for 3 concrete instances before extracting shared abstraction, unless duplication creates immediate config/state drift risk.
- Do not DRY coincidentally similar code with different domain meaning.
- Prefer readable duplication over obscure indirection.
- Tests may keep some setup duplication for clarity.

Examples:

| Avoid | Use |
|---|---|
| Role strings repeated in pages/actions/tests | central role constants/schema enum |
| WhatsApp send logic copied in invite, reminder, contract flows | one WhatsApp Messaging Module |
| Payment math repeated in report/export/recalc | one Payment Calculator Module |
| Google Sheet parsing copied in import jobs | one Applicant Intake Import Module |

---

## 5. TDD Methodology

Iron law:

```text
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Required workflow:

1. RED: write one minimal test for one behavior.
2. Verify RED: run test and confirm it fails for expected reason.
3. GREEN: write minimal code to pass.
4. Verify GREEN: run test and confirm all relevant tests pass.
5. REFACTOR: clean code while tests stay green.

Bug rule:

- Never fix bug without failing regression test first.

Refactor rule:

- Add characterization tests before refactoring behavior without existing tests.

Exceptions require explicit human approval:

- throwaway prototypes;
- generated code;
- pure configuration files.

---

## 6. Testing Strategy By Module

| Module | Required Test Focus |
|---|---|
| Payment Calculator | Unit tests for every rate source, absence, excused, standby, takeover, lateness tier boundary, adjustment, negative-net prevention. |
| Applicant Intake Import | Validation, dedupe by phone, malformed row, repeated sync idempotency. |
| Assignment Pipeline | Valid/invalid stage transitions, duplicate assignment prevention, source tracking. |
| Attendance Capture | Supervisor scope, same-day edits, lock after Finance review, late minutes validation. |
| WhatsApp Messaging | Template validation, webhook idempotency, confirm/decline mapping, media import failure. |
| Contract Ingestion | Manual upload, WhatsApp PDF ingest, duplicate media, failed download. |
| Budget Engine | Planned amount, billable/cost summary, shift/role cost lookup. |
| RBAC | Every role's allowed and denied actions. |
| Reports/Exports | Correct columns, sensitive-field exclusion, approval gating. |

---

## 7. Development Gate

Before any feature implementation starts:

- requirement or use case exists;
- expected Module and Interface are named;
- failing test written and verified;
- sensitive data and role access considered;
- source of truth checked to avoid duplication.

Before merge/complete:

- tests show RED then GREEN in work log;
- all relevant tests pass;
- lint/typecheck pass when available;
- no duplicated operational mechanics introduced;
- architecture vocabulary updated if new domain Module introduced;
- docs/ADR updated if decision affects future architecture.

---

## 8. Recommended Initial Architecture Shape

Recommended project shape for future implementation:

```text
src/
  actions/
    applicants/
    events/
    assignments/
    attendance/
    payments/
    messaging/
  modules/
    applicant-intake/
    staff-filtering/
    assignment-pipeline/
    budget-engine/
    attendance-capture/
    payment-calculator/
    whatsapp-messaging/
    contract-ingestion/
    report-export/
    audit-log/
  adapters/
    postgres/
    google-sheets/
    whatsapp-cloud/
    object-storage/
  shared/
    auth/
    roles/
    validation/
    i18n/
tests/
  modules/
  actions/
  integration/
```

Notes:

- Folder names are recommendations, not final stack decisions.
- Actions orchestrate.
- Modules hide deep behavior.
- Adapters isolate external systems and infrastructure.
- Tests target Module Interfaces first.

---

## 9. Documentation Links

- Product context: `CONTEXT.md`
- BRD: `docs/01_BRD.md`
- Stakeholders and roles: `docs/02_Stakeholders_User_Roles.md`
- Use cases: `docs/03_Use_Cases.md`
- Functional requirements: `docs/04_Functional_Requirements.md`
- Architecture source: `SYSTEM_ARCHITECTURE.md`
- DB starting point: `database.js`

