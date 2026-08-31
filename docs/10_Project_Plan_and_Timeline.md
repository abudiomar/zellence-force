# Phase 10: Agent Implementation Plan and Execution Gates

Status: Phase 4 Implemented  
Document type: Agent implementation plan, not human staffing timeline  
Planning base: Approved MVP scope, approved Phase 8 architecture recommendations, approved SRS  
Business timeline constraint: MVP target remains 10-12 calendar weeks from BRD, but this document uses dependency gates, not human calendar scheduling.

---

## 0. Mandatory Skill Imports

Any agent implementing Zell-force must read and apply these skills before feature work. Treat them like required imports.

```text
import $test-driven-development from C:\Users\Afiz\.agents\skills\test-driven-development\SKILL.md
import $code-structure from .agents\skills\code-structure\SKILL.md
import $improve-codebase-architecture from C:\Users\Afiz\.agents\skills\improve-codebase-architecture\SKILL.md
import $dry-principle from C:\Users\Afiz\.agents\skills\dry-principle\SKILL.md
```

If a skill path moves, search by skill name and read the full `SKILL.md` before coding.

| Skill | How it must shape every phase |
|---|---|
| `$test-driven-development` | No production code without failing test first. Every feature follows RED -> verify RED -> GREEN -> verify GREEN -> REFACTOR. |
| `$code-structure` | Actions orchestrate product rules. Modules own reusable operational mechanics. Adapters own provider/IO details. |
| `$improve-codebase-architecture` | Use Module, Interface, Implementation, Seam, Adapter, Depth, Leverage, Locality. Interface is the test surface. Apply deletion test before adding or keeping Modules. |
| `$dry-principle` | Single source of truth for roles, statuses, permissions, env vars, templates, provider config, money formulas, workflow states. Avoid premature abstraction unless duplication creates config/state drift. |

Non-negotiable combined rule:

```text
Read source docs -> name Action/Module/Interface/Adapter -> write failing test -> verify fail -> implement minimum -> verify pass -> refactor -> update context/docs.
```

---

## 1. Source Imports

This plan is not source of truth for product behavior. It is an execution map. Open these files first.

### 1.1 Global Agent Rules

| Import | Required lines/headings | Why agent must read it |
|---|---|---|
| `AGENTS.md` | `AGENTS.md:5` Required Methodologies, `AGENTS.md:16` TDD Is Mandatory, `AGENTS.md:36` Code Structure, `AGENTS.md:45` Architecture Vocabulary, `AGENTS.md:60` DRY Rules, `AGENTS.md:68` Project-Specific Module Expectations, `AGENTS.md:85` Documentation Discipline | Repo law for all implementation work. |
| `CONTEXT.md` | `CONTEXT.md:5` Product, `CONTEXT.md:9` Core Domain Terms, `CONTEXT.md:43` Deep Module Candidates, `CONTEXT.md:60` Accepted Product Constraints | Domain vocabulary and Module names. Update when domain meaning changes. |
| `docs/adr/0001-engineering-methodology.md` | `docs/adr/0001-engineering-methodology.md:12` Decision, `docs/adr/0001-engineering-methodology.md:52` Non-Negotiables | Accepted methodology decision. Do not re-litigate without real friction. |
| `docs/00_Engineering_Methodology.md` | `docs/00_Engineering_Methodology.md:24` Code Structure, `docs/00_Engineering_Methodology.md:57` Architecture, `docs/00_Engineering_Methodology.md:95` DRY, `docs/00_Engineering_Methodology.md:120` TDD, `docs/00_Engineering_Methodology.md:152` Testing Strategy, `docs/00_Engineering_Methodology.md:168` Development Gate, `docs/00_Engineering_Methodology.md:189` Initial Architecture Shape | Method rules converted into project-specific gates. |

### 1.2 Product and Requirements Sources

| Import | Required lines/headings | Why agent must read it |
|---|---|---|
| `SYSTEM_ARCHITECTURE.md` | `SYSTEM_ARCHITECTURE.md:18` Product overview, `:31` Target audience, `:55` MVP scope, `:109` Core domains, `:139` Workflow, `:161` Data model, `:244` WhatsApp, `:255` Payment engine, `:270` Security, `:282` Localization, `:291` NFR, `:311` Integrations, `:323` Jobs, `:333` Open decisions, `:351` Roadmap | Original product architecture source. Use for context, not final DB authority. |
| `database.js` | `database.js:18` pg pool, `database.js:31` `SCHEMA_SQL`, `database.js:470` exports | Starting schema only. Not final. Compare against docs/06 required schema. |
| `docs/01_BRD.md` | `docs/01_BRD.md:57` Objectives, `:72` KPIs, `:139` Scope, `:163` MVP priority, `:194` Business rules, `:261` Approval criteria, `:275` Google Forms/Sheets source notes | Business constraints and MVP priority order. |
| `docs/02_Stakeholders_User_Roles.md` | `docs/02_Stakeholders_User_Roles.md:24` Role model, `:98` Role table, `:116` Permissions, `:155` Role needs, `:290` Data access, `:322` Access control notes | RBAC and UI visibility source. |
| `docs/03_Use_Cases.md` | `docs/03_Use_Cases.md:26` Actors, `:46` MVP workflow, `:120` Use case list, `:162` Detailed MVP use cases, `:688` Exception rules, `:703` Traceability seed | Behavior source for each Action. |
| `docs/04_Functional_Requirements.md` | `docs/04_Functional_Requirements.md:43` FR modules start, `:1299` Traceability, `:1336` Open questions | Functional source for every feature. |
| `docs/05_Non_Functional_Requirements.md` | `docs/05_Non_Functional_Requirements.md:55` Performance, `:98` Scalability, `:204` Security, `:263` Privacy, `:301` Audit, `:323` Maintainability, `:372` Testability, `:402` Accessibility, `:431` Localization, `:503` Logging, `:537` Data integrity | Quality gates and measurable constraints. |
| `docs/06_Data_Model_Database_Requirements.md` | `docs/06_Data_Model_Database_Requirements.md:68` Entity list, `:125` Relationships, `:155` Data dictionary, `:935` Status models, `:1041` Validation, `:1066` Access, `:1087` Audit, `:1119` Indexes, `:1142` Design notes, `:1218` Open questions | DB and status source. |
| `docs/07A_UI_UX_Foundations_Research.md` | `docs/07A_UI_UX_Foundations_Research.md:11` Executive recommendation, `:114` Typography, `:177` Spacing, `:224` Color, `:304` Card overuse, `:411` Component rules, `:456` RTL, `:502` Responsive, `:573` Accessibility, `:596` Design tokens | UI foundations. Prevent generic card-heavy app. |
| `docs/07_UI_UX_Wireframe_Specification.md` | `docs/07_UI_UX_Wireframe_Specification.md:78` IA, `:97` Event tabs, `:131` Screen inventory, `:185` Screen specs, `:256` Event workspace, `:291` dashboards, `:311` Supervisor mobile, `:341` Worker token, `:365` Tables/grids, `:424` Forms, `:474` States, `:504` RTL, `:546` Accessibility, `:619` Permissions, `:642` Traceability | Screen and component behavior source. |
| `docs/08_Technical_Architecture_Document.md` | `docs/08_Technical_Architecture_Document.md:133` Stack, `:169` Repo structure, `:229` Backend layers, `:256` Deep Modules, `:332` DB principles, `:387` Auth, `:442` File storage, `:481` Integrations, `:539` Jobs, `:564` Security, `:614` Deployment, `:740` API, `:812` Testing, `:847` Risks, `:865` Build sequence, `:900` Architecture gates | Technical source for code shape. |
| `docs/09_Software_Requirements_Specification.md` | `docs/09_Software_Requirements_Specification.md:48` Scope, `:155` User classes, `:237` FR summary, `:290` NFR summary, `:320` interfaces, `:356` data, `:404` security, `:423` UI, `:477` acceptance criteria, `:514` traceability, `:531` open issues | Consolidated SRS source and final acceptance criteria. |

### 1.3 Conflict Rule

If sources disagree:

1. Stop implementation for affected feature.
2. Identify conflicting files and line refs.
3. Mark as `Needs client confirmation`.
4. Ask user or create ADR if technical decision.
5. Do not silently choose.

---

## 2. Agent Execution Model

This is a dependency-ordered plan for coding agents.

It is not:

- calendar plan for humans;
- sprint staffing plan;
- UI mockup plan;
- substitute for BRD/SRS/FR/data docs.

It is:

- source-linked route through implementation;
- phase gate checklist;
- feature-by-feature TDD plan;
- context update plan;
- architecture and DRY guardrail plan.

Each feature card below must be executed with this standard cycle.

### 2.1 Standard Feature Cycle

```text
1. Import skill docs and source refs.
2. Open exact lines listed in feature card.
3. Write short implementation note:
   - Use cases
   - FR/NFR
   - screens
   - entities/statuses
   - permissions
   - Action name
   - Module name
   - Interface shape
   - Adapter needs
4. Apply code-structure:
   - Action owns auth, role checks, workflow decisions, user-facing errors.
   - Module owns reusable mechanics and pure logic.
   - Adapter owns external provider/IO.
5. Apply improve-codebase-architecture:
   - Interface is test surface.
   - Run deletion test.
   - Avoid shallow pass-through Module.
   - Use Seam only where behavior varies.
6. Apply dry-principle:
   - Check existing roles/statuses/permissions/templates/env/rates before adding new values.
   - Add single source of truth when config drift risk exists.
   - Do not extract on second occurrence unless config/state drift risk exists.
7. Apply TDD:
   - RED: write one failing behavior test.
   - Verify RED: run test and confirm expected failure.
   - GREEN: minimal production code.
   - Verify GREEN: run test and relevant suite.
   - REFACTOR: improve names/locality; tests stay green.
8. Verify:
   - unit/action/integration/e2e as applicable;
   - typecheck;
   - lint;
   - build;
   - migration status;
   - accessibility/RTL if UI;
   - security/RBAC if protected.
9. Update knowledge:
   - `CONTEXT.md` for new/sharpened domain terms.
   - `docs/adr/` for accepted architecture decisions.
   - matching docs if requirements changed.
   - test fixtures if rules changed.
```

### 2.2 Work Log Requirement

Every implementation PR/agent run must record:

```text
Feature:
Source refs opened:
Action:
Module:
Interface:
Adapter:
RED test command:
Expected RED failure:
GREEN test command:
Verification commands:
DRY truths touched:
Architecture depth/deletion-test result:
Context/docs updates:
Open questions:
```

If the RED failure was not observed, the feature is not complete.

---

## 3. MVP Dependency Gates

| Gate | Agent phase | Unlocks | Must be true before exit |
|---|---|---|---|
| G0 | Orientation and repo foundation | All coding | Skills imported, source refs mapped, test/CI skeleton works. |
| G1 | Schema and domain constants | Auth, import, staff, events | Migrations, statuses, roles, permissions, tenant scoping, seed data, DB tests. |
| G2 | Auth, RBAC, settings | All protected workflows | Login/session, role checks, permission map, tenant settings. |
| G3 | UI shell and design system | Screens | Arabic-first RTL shell, tables/forms/states, no dense card grids. |
| G4 | Applicant intake and recruitment | Staff DB | Google Sheet import staging, review queue, dedupe, screening, interview. |
| G5 | Staff records, filtering, groups | Assignment | Staff profiles, skills, manual/smart groups, high-scale filters. |
| G6 | Clients, events, roles | Budget and assignment | Client/event lifecycle, event roles/headcount, event workspace. |
| G7 | Budget, wage, lateness | Payment calculator | Budget Engine, wage rules, lateness tiers, money precision. |
| G8 | Assignment and roster | WhatsApp/contracts/attendance | Assignment Pipeline, stage transitions, roster approval. |
| G9 | WhatsApp and token pages | Worker responses/contracts | Templates, send logs, webhook idempotency, token confirm/decline. |
| G10 | Contracts and files | Attendance/payment readiness | Contract records, file metadata, signed URLs, WhatsApp/manual upload. |
| G11 | Supervisor attendance, backup, ratings | Payment calculation | Mobile roster, attendance lock, backup outcome, event-day rating. |
| G12 | Payment review/export | Reports/UAT | Payment Calculator, batches, approval, export. |
| G13 | Reports, dashboards, audit views | Pilot | Role dashboards, reports, audit coverage. |
| G14 | Hardening | Production candidate | Performance, accessibility, security, monitoring, backups, migration rehearsal. |
| G15 | Deployment/UAT handover prep | Phase 11/12 docs | Deployable environments, runbooks, UAT checklist inputs. |

---

## 4. Phase 0 - Orientation, Repo, CI, Test Harness

Goal: create agent-safe foundation before product behavior.

Open first:

- `AGENTS.md:5-91`
- `CONTEXT.md:5-64`
- `docs/00_Engineering_Methodology.md:24-238`
- `docs/08_Technical_Architecture_Document.md:133-228`
- `docs/08_Technical_Architecture_Document.md:812-921`
- `docs/09_Software_Requirements_Specification.md:499-510`

Architecture principle applied:

- Code-structure: create monorepo shape where Actions, Modules, Adapters, DB, UI tokens, and tests have clear homes.
- Stack constraint: `apps/web` uses Next.js + React; `apps/api` uses Express.js + Node.js TypeScript.
- Improve architecture: no shallow shared packages. Each package needs real leverage or single source of truth value.
- DRY: one env schema, one role/status source, one test helper pattern.
- TDD: even setup work needs failing verification first where behavior exists. Pure config exceptions require human approval and still need smoke verification.

Feature checklists:

### P0-F001 Workspace and package manager

- Sources: `docs/08:135-152`, `docs/08:154-165`, `docs/08:169-225`.
- RED: add failing smoke test or script proving workspace cannot yet import shared package.
- GREEN: configure Bun workspace, package scripts, basic TypeScript project refs, `apps/web` Next.js home, and `apps/api` Express home.
- Code-structure check: app packages do not import implementation internals across layers.
- Architecture check: run deletion test on each package. Remove package if only a pass-through folder.
- DRY check: package manager, script names, tsconfig base live once.
- Verify: targeted smoke test, `bun install`, `bun run typecheck`, workspace import test.
- Context/docs update: ADR only if repo structure differs from `docs/08:169-225`.

### P0-F002 Test framework and RED/GREEN reporting

- Sources: `docs/00:120-166`, `docs/08:812-843`, `docs/09:497-502`.
- RED: create one intentionally failing sample behavior test.
- GREEN: install/configure Vitest/Jest, test scripts by package, coverage output if needed.
- Code-structure check: tests target Module Interfaces, not private Implementation.
- Architecture check: test helpers do not hide behavior or force broad mocks.
- DRY check: shared test setup only for DB/env/bootstrap; feature fixtures can stay explicit.
- Verify: sample RED observed, sample GREEN observed, suite command works.
- Context/docs update: record test command names in `CONTEXT.md` only if stable project convention.

### P0-F003 CI quality gate

- Sources: `docs/08:150-152`, `docs/08:812-843`, `docs/09:499-510`.
- RED: create failing CI-equivalent local script before fixing missing scripts.
- GREEN: add lint/typecheck/test/build gate scripts.
- Code-structure check: CI validates all apps/packages without hidden local state.
- Architecture check: gate failures are localizable by package.
- DRY check: CI commands call package scripts; no duplicated command lists.
- Verify: run local CI script and confirm clean output.
- Context/docs update: ADR if CI provider or gate policy becomes accepted.

### P0-F004 Environment schema and secrets policy

- Sources: `docs/08:660-685`, `docs/05:241-253`, `docs/09:507`.
- RED: failing env validation test for missing required env var.
- GREEN: create typed env schema and load rules.
- Code-structure check: Actions and Modules receive config through explicit params or config object; no scattered `process.env`.
- Architecture check: env schema is single Interface for runtime config.
- DRY check: no env var names repeated outside schema/tests/docs.
- Verify: env unit tests, app startup failure on missing required vars, no secrets committed.
- Context/docs update: update ADR if env naming/provider policy accepted.

Exit gate:

- Agent can run one command for tests.
- Workspace has visible Action/Module/Adapter homes.
- No production behavior exists without at least one RED/GREEN proof.

Implementation status:

- Complete in repo.
- RED observed for workspace import, env validation, test harness, and CI-equivalent script.
- GREEN verified with `bun install`, `bun run smoke:workspace`, `bun run smoke:env`, `bun run typecheck`, `bun run test`, `bun run build`, and `bun run ci`.
- Stable commands recorded in `CONTEXT.md`.

---

## 5. Phase 1 - Schema, Domain Constants, Tenant Foundation

Goal: freeze MVP data spine before feature logic.

Open first:

- `database.js:31-470`
- `docs/06_Data_Model_Database_Requirements.md:68-155`
- `docs/06_Data_Model_Database_Requirements.md:155-935`
- `docs/06_Data_Model_Database_Requirements.md:935-1119`
- `docs/08_Technical_Architecture_Document.md:332-386`
- `docs/09_Software_Requirements_Specification.md:356-403`

Architecture principle applied:

- Code-structure: DB repositories execute queries; Actions own workflow decisions; Modules own calculation/validation mechanics.
- Improve architecture: statuses and entities are deep domain Interfaces, not scattered strings.
- DRY: roles, permissions, statuses, env names, template keys, money precision rules live in one domain source.
- TDD: migration tests and repository tests first.

Feature checklists:

### P1-F001 Baseline migration system

- Sources: `docs/08:332-360`, `docs/06:36-67`, `database.js:31-470`.
- RED: failing migration test against empty DB expecting version table and first schema object.
- GREEN: create migration runner and first migration from starting schema with required changes marked.
- Code-structure check: migration runner is operational Module; DB Action logic does not live here.
- Architecture check: migration Interface supports up/down or up-only policy explicitly.
- DRY check: no schema SQL duplicated between `database.js` and migrations after migration source exists.
- Verify: empty DB migrate, migrate twice idempotency policy, type generation if selected.
- Context/docs update: ADR if migration style differs from `docs/08:143-144`.

### P1-F002 Tenant, role, permission, status constants

- Sources: `docs/02:24-153`, `docs/04:99-153`, `docs/06:937-1040`, `docs/05:557-568`.
- RED: failing tests for each role/status enum and invalid status rejection.
- GREEN: create domain constants/schemas for roles, permissions, statuses.
- Code-structure check: permissions checked in Actions/API, not hidden in UI only.
- Architecture check: permission map is deep enough to prevent caller-specific role branching.
- DRY check: no literal role/status strings in implementation except central source/tests.
- Verify: unit tests, rg for duplicated status strings, typecheck.
- Context/docs update: update `CONTEXT.md` if role wording changes.

### P1-F003 Required schema gaps

- Sources: `docs/08:348-360`, `docs/06:176-201`, `docs/06:511-568`, `docs/06:600-619`, `docs/06:749-789`, `docs/06:834-908`, `docs/06:910-934`.
- RED: migration tests fail for missing tables/columns/indexes.
- GREEN: add `tenant_settings`, import staging, event supervisors, payment batches, files, audit logs, export runs, shift types.
- Code-structure check: schema supports Actions without embedding workflow state in UI.
- Architecture check: table design supports deep Modules with explicit inputs.
- DRY check: one status model per entity; no duplicate status columns with different meanings.
- Verify: migration test, FK/index test, tenant_id presence check.
- Context/docs update: update docs/06 only if schema changes from approved design.

### P1-F004 Repository and transaction helpers

- Sources: `docs/08:362-370`, `docs/08:740-789`, `docs/06:1066-1117`.
- RED: failing transaction test proving rollback on thrown error.
- GREEN: create DB adapter/repository helper with explicit transaction Interface.
- Code-structure check: repositories must not decide business workflow stages.
- Architecture check: transaction helper is a Seam only if multiple adapters exist or test adapter required.
- DRY check: one pagination/filter shape for list queries.
- Verify: DB integration tests for rollback, pagination, tenant scoping.
- Context/docs update: ADR if repository pattern differs from architecture doc.

Exit gate:

- Migrations can create full MVP schema.
- Roles/statuses/permissions are single-source.
- Tenant-owned tables have `tenant_id`.
- DB transaction helper is tested.

Implementation status:

- Complete in repo.
- P1-F001 migration system: RED observed with missing `runMigrations` and missing `0001_initial_schema.sql`; GREEN verified with `packages/db/src/migrations.test.ts`.
- P1-F002 domain constants: RED observed with missing role/status/permission Interfaces; GREEN verified with `packages/domain/src/domain.test.ts`.
- P1-F003 schema gaps: RED observed with missing migration file/table definitions; GREEN verified with `packages/db/src/schema.test.ts`.
- P1-F004 transaction helpers: RED observed with missing `withTransaction`, `insertTenant`, and `findTenantBySlug`; GREEN verified with `packages/db/src/transactions.test.ts`.
- Verification commands: `bun run test packages/domain`, `bun run test packages/db`, `bun run typecheck`, `bun run test`, `bun run build`, `bun run ci`.
- DB integration: Docker container `zellforce-postgres-test` on port `54329` verified with `TEST_DATABASE_URL=postgres://zellforce:zellforce_test@localhost:54329/zellforce_test bun run test:db:integration`.
- Real Postgres coverage verifies baseline migration, idempotent rerun, required schema tables, no missing `tenant_id` on tenant-owned base tables, transaction commit, and transaction rollback.
- Source refs opened: `CONTEXT.md`, `docs/00_Engineering_Methodology.md`, `docs/06_Data_Model_Database_Requirements.md`, `docs/08_Technical_Architecture_Document.md`, `docs/09_Software_Requirements_Specification.md`, `database.js`.
- Action: none added; Phase 1 kept to DB/domain foundation.
- Module/Interface: `@zellforce/domain` role/status/permission Interface, `@zellforce/db` migration/transaction/tenant-scope Interface.
- Adapter: PostgreSQL Adapter via `pg` pool and explicit `DbClient` Interface.
- DRY truths touched: roles, statuses, permissions, schema SQL, migration commands.
- Architecture deletion-test result: `@zellforce/domain` and `@zellforce/db` retained because deleting either would spread role/status/schema/migration/transaction logic across future Actions and Adapters.
- Context/docs updates: `CONTEXT.md`, `.claude/context/memory/learnings.md`, and this plan status. No ADR needed; implementation follows approved architecture.

---

## 6. Phase 2 - Authentication, RBAC, User Management, Settings

Goal: protect every future workflow with server-side access.

Open first:

- `docs/02_Stakeholders_User_Roles.md:24-153`
- `docs/02_Stakeholders_User_Roles.md:290-343`
- `docs/04_Functional_Requirements.md:43-153`
- `docs/05_Non_Functional_Requirements.md:204-262`
- `docs/08_Technical_Architecture_Document.md:387-441`
- `docs/09_Software_Requirements_Specification.md:404-421`

Architecture principle applied:

- Code-structure: Better Auth owns identity/password/session mechanics; application Actions own user lifecycle, activation, tenant settings, and authorization decisions; Express and PostgreSQL code are Adapters.
- Improve architecture: `RequestActor`, permission decisions, identity provisioning, session revocation, and repositories are explicit Interfaces.
- DRY: `@zellforce/domain` is role/permission truth; `@zellforce/contracts` is HTTP DTO/schema truth; `@zellforce/config` is auth policy/env truth.
- TDD: migration, contract, Action, Adapter, API, CLI, and web auth behavior were written RED first.

Feature checklists:

### P2-F001 Better Auth schema and session lifecycle

- Sources: `docs/04:45-56`, `docs/05:206-212`, `docs/08:389-399`.
- GREEN: migration `0002_better_auth.sql` creates Better Auth default `"user"`, `session`, `account`, `verification` tables, links `users.auth_user_id`, and removes application password storage.
- GREEN: public signup disabled; database sessions use configured expiry/update age; cookie cache remains disabled; inactive/unlinked application users cannot create sessions.
- GREEN: Express v4 mounts `toNodeHandler(auth)` before `express.json()` and resolves sessions with `fromNodeHeaders`.
- Verify: Docker migration/idempotency tests, `/api/auth/ok`, real login/logout, `HttpOnly` cookie, public signup denial, and inactive-session denial.

### P2-F002 Internal user CRUD

- Sources: `docs/04:58-97`, `docs/02:98-153`, `docs/06:202-234`.
- GREEN: protected list/create/status/person-link Actions and Express routes.
- GREEN: private Better Auth provisioning Adapter creates credentials; failed application-row creation deletes orphan identity.
- GREEN: deactivation revokes every DB session immediately, writes audit data, and cannot remove final active Owner.
- GREEN: `bun run bootstrap:owner` creates first Owner only for an empty tenant.
- Verify: Action, Adapter, API, CLI, and real HTTP create/deactivate/session tests.

### P2-F003 Permission enforcement matrix

- Sources: `docs/02:116-153`, `docs/04:101-153`, `docs/05:212-240`, `docs/08:400-441`.
- GREEN: `authorizeRole` returns `tenant`, `assigned-event`, `read-only`, or `denied`.
- GREEN: every protected request resolves active Zell-force actor from Better Auth identity.
- GREEN: application Actions enforce product permission decisions; UI permission visibility is convenience only.
- Verify: role matrix, protected-route 401/403, Finance payment-approval denial, and user-management denial.

### P2-F004 Tenant settings

- Sources: `docs/04:1264-1277`, `docs/06:176-201`, `docs/08:241-254`.
- GREEN: shared tenant settings schemas validate language, supported languages, IANA timezone, currency, and Hijri flag.
- GREEN: settings reads are tenant-scoped; Owner/Admin updates merge partial input and write audit data.
- Verify: schema, Action, Adapter, API, merge, and role-denial tests.

### P2-F005 Next.js auth client and minimal protected screens

- GREEN: one `better-auth/react` client targets Express using credentialed requests.
- GREEN: `/login`, protected operations placeholder, `/settings/users`, and `/settings/general`.
- GREEN: unauthenticated users redirect to login; login/logout redirect correctly; settings navigation follows domain permissions.
- Architecture check: no Next.js auth handler or server auth duplication.
- Verify: auth-flow, protected-state, public-env, navigation, render, typecheck, and production build tests.

Exit gate:

- Complete in repo.
- Better Auth schema, login/logout, user provisioning, deactivation, RBAC, settings, bootstrap, Express routes, and Next.js auth client implemented.
- Docker/PostgreSQL integration and real HTTP auth lifecycle verified.
- Every later feature can call `RequestActor`, authorization, user, and settings Interfaces.

---

## 7. Phase 3 - UI Shell, Design System, RTL, Tables, Forms

Goal: build operational UI foundation before feature screens.

Open first:

- `docs/07A_UI_UX_Foundations_Research.md:11-30`
- `docs/07A_UI_UX_Foundations_Research.md:114-303`
- `docs/07A_UI_UX_Foundations_Research.md:304-410`
- `docs/07A_UI_UX_Foundations_Research.md:411-572`
- `docs/07_UI_UX_Wireframe_Specification.md:78-184`
- `docs/07_UI_UX_Wireframe_Specification.md:365-569`

Architecture principle applied:

- Code-structure: Next.js app routes/screens own product task composition; UI patterns own reusable mechanics.
- Improve architecture: design-system primitives need high leverage. Avoid shallow wrapper components.
- DRY: tokens for color/type/spacing/status, not hardcoded per screen.
- TDD: component behavior, accessibility, RTL, and table interactions need tests before implementation.

Feature checklists:

### P3-F001 UI test harness and token foundation

- Sources: `docs/07A:114-303`, `docs/07A:596-609`, `docs/05:404-457`.
- RED observed: `@zellforce/ui` import/render tests failed before React primitives, semantic tokens, and JSDOM setup existed.
- GREEN: `packages/ui` now exports `UI_TOKENS`, `UI_DENSITIES`, `UI_STATUS_TONES`, `tokens.css`, and reusable React primitives.
- Code-structure check: `packages/ui` owns reusable UI mechanics only; no Next.js, Better Auth, DB, Actions, or API clients.
- Architecture check: UI package passes deletion test because token/control/table/form logic would otherwise duplicate across screens.
- DRY check: color, radius, typography, spacing, focus, status tone, density values live in tokens.
- Verify: `bun run test packages/ui`, `bun run typecheck`, `bun run build`.

### P3-F002 Arabic/English locale and RTL shell

- Sources: `docs/07:187-202`, `docs/07:504-523`, `docs/04:1225-1249`, `docs/05:433-457`.
- RED observed: root document had static direction, no Arabic/English catalogs, no persistent locale/density behavior.
- GREEN: `next-intl` without locale URL prefixes, `zf_locale` cookie defaulting to Arabic, `zf_density` preference, server-rendered `lang`/`dir`, protected shell, responsive sidebar/drawer, user/density/language/logout controls.
- Code-structure check: `apps/web` owns routing, locale loading, auth state, nav registry, and API data.
- Architecture check: locale/direction Interface lives in `@zellforce/domain` and `apps/web/src/i18n`.
- DRY check: language constants live in `@zellforce/domain`; nav lives in one registry.
- Verify: `bun run test apps/web`, manual frontend QA in `docs/QA.md`.

### P3-F003 Core UI primitives and existing screen refactor

- Sources: `docs/07A:411-455`, `docs/07:424-503`, `docs/07:546-569`.
- RED observed: existing login/settings screens used raw controls and inconsistent state handling.
- GREEN: login, dashboard placeholder, user settings, and tenant settings now compose shared `@zellforce/ui` primitives.
- Implemented primitives: `Button`, `IconButton`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `Switch`, `Field`, `FormSection`, `ErrorSummary`, `ReadOnlyField`, `PageHeader`, `SectionPanel`, `Tabs`, `Toolbar`, `FilterBar`, `Pagination`.
- Code-structure check: screen Server Components pass data/labels; interactive table config lives in client child component.
- DRY check: form and control styling no longer repeated per screen.
- Verify: `bun run test apps/web`, `bun run build`.

### P3-F004 Status and screen-state system

- Sources: `docs/06:935-1040`, `docs/07:474-503`, `docs/05:404-430`.
- RED observed: domain statuses lacked exhaustive web visual mapping.
- GREEN: `apps/web/src/ui/status-visuals.ts` maps domain statuses to generic UI tones; `StatusBadge`, `AlertBanner`, `ScreenState`, `Skeleton`, and `ProgressIndicator` provide state patterns.
- Code-structure check: product status meaning remains in `@zellforce/domain`; web owns display mapping; UI receives generic tone only.
- DRY check: no per-screen status color truth.
- Verify: `bun run test apps/web`, `bun run test packages/domain`.

### P3-F005 Operational data patterns

- Sources: `docs/07:365-423`, `docs/07A:350-410`, `docs/07A:411-455`.
- RED observed: no standard sorting, selection, row activation, spreadsheet grid, or roster list component.
- GREEN: `DataTable`, `SpreadsheetGrid`, and `RosterList` provide tested fixture patterns without adding applicant/event/attendance/payment workflow behavior.
- Code-structure check: patterns own UI mechanics; feature screens own rows, columns, labels, and commands.
- Architecture check: table/grid/list Interfaces create leverage for Phase 4+ screens without leaking workflow logic.
- Verify: `bun run test packages/ui`, manual frontend QA in `docs/QA.md`.

### P3-F006 Forms, drawers, dialogs, and mutation feedback

- Sources: `docs/07:424-503`, `docs/07A:411-455`, `docs/05:404-430`.
- RED observed: settings forms had no shared validation/error/drawer/dialog pattern.
- GREEN: app uses React Hook Form/Zod for login and shared UI form primitives; Radix-backed `Dialog`, `Drawer`, `AlertDialog`, `ToastProvider`, and `useToast` exist for future mutations.
- Code-structure check: UI primitives remain form-library independent; app-level forms own validation integration.
- Verify: `bun run test packages/ui`, `bun run test apps/web`.

### P3-F007 Responsive and accessibility gate

- Sources: `docs/07:504-569`, `docs/05:404-457`, `docs/09:494-497`.
- RED observed: no documented manual responsive/RTL/accessibility gate.
- GREEN: manual QA covers Arabic RTL, English LTR, locale persistence, role-aware nav, protected shell, main landmarks, and no page-level overflow at 360, 768, 1280, and 1440 widths.
- Code-structure check: permission visibility still comes from domain permission registry; Express remains authorization authority.
- Verify: manual frontend QA in `docs/QA.md`; CI no longer installs Playwright.

Exit gate:

- Complete in repo.
- Existing Phase 2 screens use shared UI primitives.
- Arabic default RTL and English LTR switching work.
- Locale and density persist across refresh.
- `@zellforce/ui` is reusable and framework/data independent.
- Phase 4 screens can compose shell, table, grid, list, form, overlay, status, responsive, and feedback patterns without local substitutes.

---

## 8. Phase 4 - Applicant Intake Import, Review, Recruitment

Goal: integrate Google Form response Sheet without replacing it.

Open first:

- `docs/01_BRD.md:146-148`
- `docs/01_BRD.md:275-293`
- `docs/03_Use_Cases.md:164-248`
- `docs/04_Functional_Requirements.md:155-223`
- `docs/04_Functional_Requirements.md:349-433`
- `docs/06_Data_Model_Database_Requirements.md:511-568`
- `docs/08_Technical_Architecture_Document.md:483-502`

Architecture principle applied:

- Code-structure: Applicant Actions own import permission, review decisions, merge/reject policy. Applicant Intake Import Module owns Sheet row read/map/validate/dedupe mechanics. Google Sheets Adapter owns API calls.
- Improve architecture: Applicant Intake Import Module Interface is test surface for row mapping/idempotency.
- DRY: Google Sheet column mapping and required fields live once.
- TDD: malformed rows, repeated sync idempotency, duplicate phone, review decisions first.

Feature checklists:

### P4-F001 Google Sheets applicant sync Adapter

- Status: Complete for Adapter Interface and Express wiring.
- Sources: `docs/01:275-293`, `docs/04:157-181`, `docs/08:483-502`.
- RED: failing Adapter contract test using fake Sheet data for changed rows.
- GREEN: implement Google Sheets Adapter behind explicit Interface.
- Implemented Interface: `ApplicantSheetReader`.
- Implemented Adapter: `createGoogleSheetsApplicantAdapter`.
- Code-structure check: Adapter does not decide applicant status.
- Architecture check: Seam is real if fake/test Adapter and Google Adapter both satisfy Interface.
- DRY check: Sheet ID/range/column names from env/mapping config only.
- Verify: `bunx vitest run apps/api/src/adapters/google-sheets.test.ts`; no row status decisions or secrets in Adapter logs.
- Context/docs update: exact sheet mapping -> docs/06 or config docs when confirmed.

### P4-F002 Applicant Intake Import Module

- Status: Complete for mapping, validation, dedupe hash, and import summaries.
- Sources: `docs/04:157-223`, `docs/06:511-568`, `docs/05:80-87`, `docs/05:392-396`.
- RED: tests for required fields, missing phone, duplicate phone, source hash idempotency, import run summary.
- GREEN: implement mapping, validation, dedupe key generation, import result.
- Implemented Module/Action surface: `importApplicantRows`.
- Implemented repository Interface: `ApplicantImportRepository`.
- Code-structure check: Module returns structured result; Action writes workflow decisions.
- Architecture check: Interface hides Google row shape from callers.
- DRY check: required field list and duplicate rules single-source.
- Verify: `bunx vitest run packages/application/src/applicant-intake.test.ts packages/db/src/migrations.test.ts`; DB integration requires `TEST_DATABASE_URL`.
- Context/docs update: new applicant status meaning -> `CONTEXT.md` and docs/06.

### P4-F003 Applicant import Actions and queue

- Status: Complete for protected API and minimal review queue screen.
- Sources: `docs/03:164-197`, `docs/04:209-223`, `docs/07:203-255`, `docs/07:597-641`.
- RED: action tests for HR/Admin sync permission, row review list, duplicate warnings, import errors.
- GREEN: implement sync Action, review queue API/screen.
- Implemented routes: `POST /api/applicants/import-runs`, `GET /api/applicants/review-queue`.
- Implemented web route: `/recruitment/applicants`.
- Code-structure check: Action owns permission and row status transition.
- Architecture check: review queue screen uses table pattern, not cards.
- DRY check: applicant row status from central status model.
- Verify: `bunx vitest run apps/api/src/http/applicants-routes.test.ts`; manual frontend QA in `docs/QA.md`.
- Context/docs update: update docs if review statuses change.

### P4-F004 Applicant decision, screening, interview

- Status: Complete for MVP recruitment flow: review decision UI, accept/create Person, merge duplicate, reject/defer, schedule interview, and record interview score.
- Sources: `docs/03:181-248`, `docs/04:351-433`, `docs/06:620-647`.
- RED: tests for accept/create person, merge duplicate, reject, screen decision, schedule interview, record score, minimum score warning.
- GREEN: implement Actions and screens.
- Implemented Actions: `decideApplicantImportRow`, `scheduleInterview`, `recordInterviewScore`.
- Implemented routes: `POST /api/applicants/review-queue/:id/decision`, `POST /api/interviews`, `POST /api/interviews/:id/scores`.
- Code-structure check: Action owns decision + transaction + audit; Module handles scoring mechanics if reused.
- Architecture check: applicant decision transaction follows `docs/08:366`.
- DRY check: rating/interview criteria are config/settings if reused.
- Verify: `bunx vitest run packages/application/src/applicant-intake.test.ts apps/api/src/http/applicants-routes.test.ts`; frontend verified by `bun run typecheck`, `bun run build`, and manual QA.
- Context/docs update: interview criteria TBD -> document confirmed values when known.

Exit gate:

- Google Sheet rows can be synced into review queue.
- Duplicate and invalid rows are visible.
- Accepted applicant can become person profile.
- Import idempotency tests pass.
- Verification completed: `bun run typecheck`, `bun run build`, `bun run test apps/api`, `bun run test apps/web`, `bun run test packages/application`, `bun run test packages/contracts`, `bun run test packages/db`, manual frontend QA in `docs/QA.md`.
- DB integration note: `bun run test:db:integration` still requires reachable Docker/Postgres and `TEST_DATABASE_URL`.

---

## 9. Phase 5 - Staff Profiles, Filtering, Skills, Groups

Goal: create high-scale staff pool operations.

Open first:

- `docs/01_BRD.md:167-167`
- `docs/03_Use_Cases.md:334-367`
- `docs/04_Functional_Requirements.md:224-347`
- `docs/05_Non_Functional_Requirements.md:57-64`
- `docs/06_Data_Model_Database_Requirements.md:235-269`
- `docs/06_Data_Model_Database_Requirements.md:437-510`
- `docs/07_UI_UX_Wireframe_Specification.md:365-388`

Architecture principle applied:

- Code-structure: Staff Actions own person lifecycle and group decisions. Staff Filtering Module owns filter/query mechanics and ranking/sorting.
- Improve architecture: Staff Filtering Interface hides query composition and index details.
- DRY: staff status/type/skill/city/gender/filter option values live once.
- TDD: combined filters, pagination, permission-sensitive fields first.

Feature checklists:

### P5-F001 Person profile CRUD

- Sources: `docs/04:226-264`, `docs/06:235-269`, `docs/02:290-306`.
- RED: tests for create/update/status/type validation and role denial.
- GREEN: implement person Actions/API/screens.
- Code-structure check: Action owns permission and status changes; repository writes.
- Architecture check: profile save Interface returns validation errors by field.
- DRY check: person status/type from central domain constants.
- Verify: action tests, DB tests, form tests, audit if sensitive fields change.
- Context/docs update: add domain terms if profile fields change.

### P5-F002 Skills management

- Sources: `docs/04:295-319`, `docs/06:437-459`.
- RED: tests for create skill, duplicate skill rejection, assign/remove skill to person.
- GREEN: implement skills Actions and UI.
- Code-structure check: Action owns who can manage skills; Module can normalize skill names.
- Architecture check: avoid shallow `skillsService` if repository is enough.
- DRY check: skill normalization rule in one helper/Module.
- Verify: action/DB tests, UI table tests.
- Context/docs update: confirmed standard skills list if provided.

### P5-F003 Staff Filtering Module

- Sources: `docs/04:265-291`, `docs/05:57-64`, `docs/08:260-261`, `docs/06:1119-1141`.
- RED: tests for city/gender/status/type/skills/rating filters, combined filters, pagination, sorting, performance seed.
- GREEN: implement filtering Interface and DB query/repository.
- Code-structure check: Module owns filter mechanics; Action owns role visibility and sensitive field gating.
- Architecture check: Interface accepts typed filter object, returns paginated structured result.
- DRY check: filter schema shared by UI/API/Module.
- Verify: unit/integration tests, explain/index check for critical filters, performance seed run.
- Context/docs update: new filter names -> docs/07 if visible.

### P5-F004 Manual and smart groups

- Sources: `docs/03:351-367`, `docs/04:321-347`, `docs/06:480-510`.
- RED: tests for manual group create/edit/member add/remove, smart group saved criteria refresh.
- GREEN: implement group Actions and screens.
- Code-structure check: smart groups call Staff Filtering Module; no copied filter SQL.
- Architecture check: group Interface hides membership vs saved criteria differences.
- DRY check: one filter criteria schema reused.
- Verify: action tests, Staff Filtering regression tests, UI table tests.
- Context/docs update: group terminology if changed.

Exit gate:

- Staff database supports table-first search/filter.
- Groups build on filtering Module, no duplicate filtering logic.
- Staff filtering performance target has evidence.

---

## 10. Phase 6 - Clients, Events, Event Roles, Event Workspace

Goal: create event planning spine.

Open first:

- `docs/03_Use_Cases.md:249-316`
- `docs/04_Functional_Requirements.md:435-523`
- `docs/06_Data_Model_Database_Requirements.md:272-384`
- `docs/07_UI_UX_Wireframe_Specification.md:256-290`
- `docs/08_Technical_Architecture_Document.md:241-255`

Architecture principle applied:

- Code-structure: Event Actions own event lifecycle, role/headcount policy, roster approval preconditions. Event role Modules own validation mechanics only if reused.
- Improve architecture: Event workspace is UI locality around event assignment spine.
- DRY: event status, role names, shift types, headcount rules single-source.
- TDD: event status, role headcount, backup standby rate, permission tests first.

Feature checklists:

### P6-F001 Client records

- Sources: `docs/03:249-264`, `docs/04:437-450`, `docs/06:272-294`.
- RED: tests for create/update client, duplicate handling if specified, permission denial.
- GREEN: implement client Actions/API/table/form.
- Code-structure check: Action owns permission and validation; repo owns persistence.
- Architecture check: no deep Module unless client logic grows.
- DRY check: client status/types if added must be central.
- Verify: action/API/UI tests.
- Context/docs update: client fields if confirmed beyond docs/06.

### P6-F002 Event create/edit/status

- Sources: `docs/03:266-281`, `docs/04:454-480`, `docs/06:295-322`, `docs/06:951-961`.
- RED: tests for create event, invalid dates/status, role permissions, operational status display.
- GREEN: implement event Actions/API/screens.
- Code-structure check: Action owns event status transitions.
- Architecture check: status transition Interface if transitions become multi-caller.
- DRY check: event status source used by DB/UI/API/tests.
- Verify: action tests, DB status tests, UI event list/detail tests.
- Context/docs update: event status wording if changed.

### P6-F003 Tenant job roles and event role headcount

- Sources: `docs/03:283-298`, `docs/04:484-523`, `docs/06:324-384`.
- RED: tests for role create, event role headcount, backup standby rate, duplicate role prevention.
- GREEN: implement role catalog and event roles tab.
- Code-structure check: Action owns who can configure; Module validates headcount/rates if reused by budget/payment.
- Architecture check: event role Interface feeds Budget and Assignment Modules.
- DRY check: job role and shift type values not duplicated.
- Verify: action tests, DB uniqueness tests, event workspace UI tests.
- Context/docs update: shift taxonomy if confirmed.

### P6-F004 Event workspace tabs

- Sources: `docs/07:97-115`, `docs/07:256-290`, `docs/07:619-641`.
- RED: tests for role-visible tabs, locked/approval state display, active tab routing.
- GREEN: implement workspace shell and Overview/Roles placeholders wired to real data.
- Code-structure check: workspace shell owns navigation mechanics; tabs own product content.
- Architecture check: avoid giant event page Implementation; split by tab with shared Event Header Interface.
- DRY check: event header/status components reused across tabs.
- Verify: manual frontend QA for event workspace smoke, RTL tab behavior, permission visibility checks.
- Context/docs update: tab changes -> docs/07.

Exit gate:

- Event workspace exists.
- Client/event/role/headcount data can be created and edited.
- Event roles feed budget and assignment phases.

---

## 11. Phase 7 - Budget Engine, Wage Rules, Lateness Tiers

Goal: controlled spreadsheet-like event budget and wage rules.

Open first:

- `docs/03_Use_Cases.md:300-333`
- `docs/03_Use_Cases.md:606-621`
- `docs/04_Functional_Requirements.md:525-579`
- `docs/06_Data_Model_Database_Requirements.md:386-435`
- `docs/07_UI_UX_Wireframe_Specification.md:389-406`
- `docs/08_Technical_Architecture_Document.md:263-264`

Architecture principle applied:

- Code-structure: Budget Actions own who can change budgets and when locked. Budget Engine Module owns totals, billable/cost separation, rate lookup candidates, money math.
- Improve architecture: Budget Engine must be deep. Tests use Engine Interface, not UI grid cells.
- DRY: money precision, rate lookup, lateness tier rules are single-source.
- TDD: money precision, tier boundaries, missing rates, billable/cost summary first.

Feature checklists:

### P7-F001 Budget Engine Module

- Sources: `docs/04:527-564`, `docs/05:551-556`, `docs/08:263-264`.
- RED: unit tests for billable totals, cost totals, margin, decimal precision, missing/invalid line.
- GREEN: implement pure Budget Engine.
- Code-structure check: Module does calculations only; Action owns persistence/permission.
- Architecture check: Engine Interface accepts typed inputs and returns breakdown, not UI strings.
- DRY check: money helpers shared with Payment Calculator if same domain meaning.
- Verify: unit tests, property/edge tests for decimal behavior.
- Context/docs update: calculation rule changes -> docs/04/docs/06.

### P7-F002 Budget grid Actions and UI

- Sources: `docs/04:527-553`, `docs/06:386-414`, `docs/07:389-406`.
- RED: action tests for add/edit/delete line, permission denial, audit required.
- GREEN: implement Budget tab with spreadsheet-like controlled grid.
- Code-structure check: Action owns workflow/audit; UI grid owns edit mechanics.
- Architecture check: grid uses shared spreadsheet pattern from Phase 3.
- DRY check: budget line type/status values central.
- Verify: action tests, audit tests, grid keyboard/RTL tests.
- Context/docs update: any new budget line fields -> docs/06.

### P7-F003 Wage rules and event role rates

- Sources: `docs/04:540-564`, `docs/06:365-414`, `docs/01:204-212`.
- RED: tests for default event role rate, agreed wage override candidate, missing rate warning.
- GREEN: implement rate configuration and summaries.
- Code-structure check: Action owns allowed overrides; Budget Engine owns planned cost math.
- Architecture check: wage lookup Interface will later feed Payment Calculator.
- DRY check: rate source enum single-source.
- Verify: unit/action tests, event role UI tests.
- Context/docs update: exact shift/rate taxonomy if confirmed.

### P7-F004 Lateness penalty tiers

- Sources: `docs/03:317-333`, `docs/04:566-579`, `docs/06:415-435`.
- RED: tests for tier boundaries, overlapping tiers rejection, no matching tier behavior.
- GREEN: implement lateness tier Actions and validation Module.
- Code-structure check: Action owns who configures; Module validates ranges and calculates deduction candidate.
- Architecture check: lateness Module Interface reused by Payment Calculator.
- DRY check: lateness tier logic not duplicated in UI and payment.
- Verify: unit/action tests, DB constraint tests, UI validation.
- Context/docs update: penalty policy if changed.

Exit gate:

- Budget tab gives planned billable/cost/margin.
- Lateness rules are test-covered.
- Budget and wage data ready for assignment/payment.

---

## 12. Phase 8 - Assignment Pipeline and Final Roster

Goal: connect staff to event roles with traceable stage transitions.

Open first:

- `docs/03_Use_Cases.md:368-467`
- `docs/04_Functional_Requirements.md:581-648`
- `docs/06_Data_Model_Database_Requirements.md:570-619`
- `docs/06_Data_Model_Database_Requirements.md:972-985`
- `docs/07_UI_UX_Wireframe_Specification.md:407-423`
- `docs/08_Technical_Architecture_Document.md:262-263`

Architecture principle applied:

- Code-structure: Assignment Actions own stage changes, uniqueness, roster approval, wage override authority. Assignment Pipeline Module owns transition validation mechanics.
- Improve architecture: Assignment Pipeline Interface is test surface for workflow spine.
- DRY: assignment stages and sources live once.
- TDD: valid/invalid transitions, duplicate assignment, source tracking, roster approval first.

Feature checklists:

### P8-F001 Assignment Pipeline Module

- Sources: `docs/04:583-648`, `docs/06:570-599`, `docs/06:972-985`, `docs/08:262`.
- RED: tests for allowed transitions, forbidden transitions, duplicate person/event role, source tracking, wage override rule inputs.
- GREEN: implement pure transition/validation Module.
- Code-structure check: Module validates mechanics; Action owns permission and transactions.
- Architecture check: Interface small enough for tests and multiple Actions.
- DRY check: assignment stages from central constants.
- Verify: unit tests, edge tests for stage graph.
- Context/docs update: stage graph changes -> docs/06 and docs/03.

### P8-F002 Assign staff from filters/groups

- Sources: `docs/03:334-384`, `docs/04:583-621`, `docs/07:407-423`.
- RED: action tests for assign from person, assign from group, duplicate rejection, role permission.
- GREEN: implement Staffing tab assignment Actions/UI.
- Code-structure check: Action uses Staff Filtering and Assignment Pipeline Modules; no duplicated filtering logic.
- Architecture check: staff search and assignment stay separate Interfaces.
- DRY check: selection/bulk action UI pattern reused.
- Verify: action tests, UI roster list tests, permission tests.
- Context/docs update: assignment source values if changed.

### P8-F003 Agreed wage and roster approval

- Sources: `docs/03:453-467`, `docs/04:622-648`, `docs/01:204-212`.
- RED: tests for Owner/Admin wage update, non-authorized denial, approval locks final roster state.
- GREEN: implement wage override and approve roster Actions.
- Code-structure check: Action owns approval and audit; Module validates workflow preconditions.
- Architecture check: payment inputs later read finalized agreed wage consistently.
- DRY check: wage override reason/audit rule centralized.
- Verify: action tests, audit tests, payment fixture preparation.
- Context/docs update: approval policy change -> docs/03/docs/04.

Exit gate:

- Event Staffing tab works with filters/groups.
- Roster approval state visible.
- Assignment stage transitions are exhaustively tested.

---

## 13. Phase 9 - WhatsApp Messaging and Worker Token Pages

Goal: keep WhatsApp as worker communication channel while reducing manual chaos.

Open first:

- `docs/01_BRD.md:207-210`
- `docs/03_Use_Cases.md:385-417`
- `docs/03_Use_Cases.md:657-674`
- `docs/04_Functional_Requirements.md:650-717`
- `docs/05_Non_Functional_Requirements.md:147-153`
- `docs/06_Data_Model_Database_Requirements.md:791-832`
- `docs/07_UI_UX_Wireframe_Specification.md:341-364`
- `docs/08_Technical_Architecture_Document.md:503-518`

Architecture principle applied:

- Code-structure: Message Actions own when/why to send and response effects. WhatsApp Messaging Module owns template validation, send mechanics, webhook parsing/idempotency. WhatsApp Adapter owns Meta API.
- Improve architecture: Messaging Interface hides provider event shape from assignment/contract workflows.
- DRY: template names, provider config, message statuses, token policies single-source.
- TDD: webhook idempotency, confirm/decline mapping, send failure classification first.

Feature checklists:

### P9-F001 Message templates

- Sources: `docs/03:657-674`, `docs/04:652-663`, `docs/06:791-807`.
- RED: tests for template create/update, required variables, role denial.
- GREEN: implement template Actions/UI.
- Code-structure check: Action owns template management permission; Module validates variable schema.
- Architecture check: template validation Interface reused by send Actions.
- DRY check: template keys/variables not duplicated across code.
- Verify: action tests, UI form tests.
- Context/docs update: confirmed templates -> docs/04 or config docs.

### P9-F002 WhatsApp Messaging Module and Adapter

- Sources: `docs/04:665-717`, `docs/05:147-153`, `docs/08:503-518`.
- RED: tests for send template success/failure, duplicate webhook ignored, provider status logged, button confirm/decline parsed.
- GREEN: implement Module and Meta Cloud Adapter.
- Code-structure check: Adapter performs provider IO only; Module classifies provider mechanics; Actions apply business effect.
- Architecture check: fake Adapter and real Adapter justify Seam.
- DRY check: provider message ID handling and status mapping single-source.
- Verify: unit tests, adapter contract tests, webhook integration tests.
- Context/docs update: provider-specific status terms if they become domain terms.

### P9-F003 Invitation send and worker confirm/decline

- Sources: `docs/03:385-417`, `docs/04:665-689`, `docs/07:341-364`.
- RED: action tests for invitation allowed only for eligible assignment, confirm changes stage, decline records reason, expired token blocked.
- GREEN: implement sendInvitation, recordWorkerResponse, token page.
- Code-structure check: Action owns assignment state update; Messaging Module just parses/sends.
- Architecture check: token response Interface hides auth-free access mechanics.
- DRY check: token expiry policy single-source.
- Verify: action/API/e2e tests, secure token tests, mobile viewport tests.
- Context/docs update: exact token expiry policy -> docs/08/open issue resolution.

### P9-F004 Message log and retry

- Sources: `docs/04:704-717`, `docs/06:809-832`, `docs/05:511-535`.
- RED: tests for message log visibility by role, failed retry eligibility, duplicate retry prevention.
- GREEN: implement message log table and retry Action/job.
- Code-structure check: retry Action owns eligibility; Module owns resend mechanics.
- Architecture check: job queue Adapter isolated.
- DRY check: message status mapping central.
- Verify: action tests, job tests, UI table tests.
- Context/docs update: retry policy if changed.

Exit gate:

- Staff can be invited through WhatsApp.
- Worker token confirm/decline works without internal login.
- Webhook idempotency tests pass.

---

## 14. Phase 10 - Contracts and File Storage

Goal: track contract issue/return and protect sensitive files.

Open first:

- `docs/01_BRD.md:208-209`
- `docs/03_Use_Cases.md:419-451`
- `docs/04_Functional_Requirements.md:719-786`
- `docs/04_Functional_Requirements.md:1124-1165`
- `docs/05_Non_Functional_Requirements.md:227-240`
- `docs/06_Data_Model_Database_Requirements.md:649-670`
- `docs/06_Data_Model_Database_Requirements.md:834-859`
- `docs/08_Technical_Architecture_Document.md:442-480`

Architecture principle applied:

- Code-structure: Contract Actions own assignment eligibility, contract status, audit. Contract Ingestion Module owns file validation/linking mechanics. Storage Adapter owns signed URLs/object IO.
- Improve architecture: File storage is a Seam with local/test and S3-compatible Adapter if needed.
- DRY: file type/MIME/size/access rules single-source.
- TDD: manual upload, WhatsApp PDF ingest, duplicate media, failed download, signed URL permission first.

Feature checklists:

### P10-F001 File metadata and storage Adapter

- Sources: `docs/04:1126-1165`, `docs/06:834-859`, `docs/08:442-480`.
- RED: tests for private file metadata creation, signed URL denied without permission, MIME/size rejection.
- GREEN: implement file Module and storage Adapter.
- Code-structure check: Adapter owns storage IO; Action owns whether user may access file.
- Architecture check: storage Interface supports private file access without leaking provider details.
- DRY check: file type rules central.
- Verify: unit/integration tests, signed URL permission tests.
- Context/docs update: storage provider decision -> ADR.

### P10-F002 Contract issue and status

- Sources: `docs/03:419-434`, `docs/04:721-745`, `docs/06:649-670`, `docs/06:986-995`.
- RED: tests for issue contract from assignment, status transitions, role denial, audit log.
- GREEN: implement contract Actions and Contracts tab.
- Code-structure check: Action owns issue/transition policy; Module validates contract state mechanics.
- Architecture check: contract status Interface is small and consistent with assignment.
- DRY check: contract status constants central.
- Verify: action tests, UI table tests, audit tests.
- Context/docs update: contract status changes -> docs/06.

### P10-F003 WhatsApp and manual signed contract ingestion

- Sources: `docs/03:436-451`, `docs/04:747-771`, `docs/08:465-480`.
- RED: tests for manual upload success, WhatsApp PDF success, wrong MIME failure, duplicate media ignored, failed provider download logged.
- GREEN: implement Contract Ingestion Module, Actions, UI upload.
- Code-structure check: Ingestion Module owns validation/linking; WhatsApp Adapter owns media download.
- Architecture check: Interface hides whether source is WhatsApp or manual.
- DRY check: file validation reused from File Module.
- Verify: module tests, adapter tests, action transaction tests.
- Context/docs update: if cryptographic e-signature added, docs/01 out-of-scope changes need confirmation.

Exit gate:

- Contract status visible per assignment.
- Signed files stored privately.
- File access checks tested.

---

## 15. Phase 11 - Supervisor Attendance, Backup Outcomes, Ratings

Goal: support fast mobile event-day operations.

Open first:

- `docs/03_Use_Cases.md:470-536`
- `docs/04_Functional_Requirements.md:788-902`
- `docs/05_Non_Functional_Requirements.md:417-430`
- `docs/06_Data_Model_Database_Requirements.md:672-719`
- `docs/06_Data_Model_Database_Requirements.md:996-1012`
- `docs/07_UI_UX_Wireframe_Specification.md:311-340`
- `docs/08_Technical_Architecture_Document.md:264-265`

Architecture principle applied:

- Code-structure: Attendance Actions own supervisor scope, lock rules, audit, payment recalculation trigger. Attendance Capture Module owns validation mechanics. Payment remains separate.
- Improve architecture: Attendance Capture Interface must make lock/error states testable.
- DRY: attendance statuses, backup outcomes, rating scales single-source.
- TDD: supervisor scope, same-day edits, lock after Finance review, late minutes validation first.

Feature checklists:

### P11-F001 Supervisor event scope

- Sources: `docs/04:790-801`, `docs/04:127-138`, `docs/06:600-619`.
- RED: tests for Supervisor sees only assigned events, Admin sees all, unassigned denied.
- GREEN: implement event_supervisors access checks and mobile entry list.
- Code-structure check: permission Action owns scope; repository filters by tenant/supervisor.
- Architecture check: supervisor scope Interface reused across attendance/rating.
- DRY check: no duplicate supervisor access queries.
- Verify: action/API tests, mobile UI tests.
- Context/docs update: supervisor assignment rule if changed.

### P11-F002 Attendance Capture Module and Actions

- Sources: `docs/03:487-503`, `docs/04:803-842`, `docs/06:672-699`, `docs/06:996-1004`.
- RED: tests for present/late/absent/excused, late minutes bounds, duplicate attendance, locked edit denial.
- GREEN: implement Module, recordAttendance Action, mobile roster UI.
- Code-structure check: Action owns permission/lock/audit; Module validates attendance mechanics.
- Architecture check: Module Interface returns structured state conflict errors.
- DRY check: attendance status constants central.
- Verify: unit/action/DB tests, manual mobile QA flow, audit tests.
- Context/docs update: offline behavior remains open unless confirmed.

### P11-F003 Backup outcome handling

- Sources: `docs/03:504-520`, `docs/04:846-872`, `docs/06:1005-1012`.
- RED: tests for standby vs takeover outcomes, invalid combination with attendance, rate input for payment.
- GREEN: implement backup Actions and UI controls.
- Code-structure check: Attendance/Backup Actions coordinate; Payment Calculator later consumes normalized result.
- Architecture check: backup outcome Interface hides UI control choice.
- DRY check: backup outcome statuses central.
- Verify: action tests, mobile roster tests.
- Context/docs update: backup policy if changed.

### P11-F004 Event-day ratings

- Sources: `docs/03:521-536`, `docs/04:876-902`, `docs/06:701-719`.
- RED: tests for rating create/update, invalid scale, role denial, rating history summary update.
- GREEN: implement rating Actions and UI.
- Code-structure check: Action owns rating permission and audit if needed.
- Architecture check: rating summary Module only if multiple callers need same aggregation.
- DRY check: rating scale source central.
- Verify: action/DB/UI tests.
- Context/docs update: rating criteria open issue -> docs when confirmed.

Exit gate:

- Supervisor can mark attendance on mobile.
- Attendance lock rules are tested.
- Backup/rating data is ready for payment/reporting.

---

## 16. Phase 12 - Payment Calculator, Review, Approval, Export

Goal: produce auditable payment lines from attendance and wage rules.

Open first:

- `docs/01_BRD.md:204-212`
- `docs/03_Use_Cases.md:538-604`
- `docs/04_Functional_Requirements.md:904-1040`
- `docs/05_Non_Functional_Requirements.md:73-78`
- `docs/05_Non_Functional_Requirements.md:154-160`
- `docs/05_Non_Functional_Requirements.md:374-383`
- `docs/06_Data_Model_Database_Requirements.md:721-789`
- `docs/08_Technical_Architecture_Document.md:265-266`

Architecture principle applied:

- Code-structure: Payment Actions own recalculation timing, review, approval, export eligibility. Payment Calculator Module owns pure money calculation. Report Export Module owns CSV/XLSX mechanics.
- Improve architecture: Payment Calculator must be deepest Module in MVP. Interface is test surface and must expose breakdown.
- DRY: payment formula, money rounding, rate source, lateness tiers, adjustment reasons single-source.
- TDD: absent/excused/standby/takeover/tier boundaries/manual adjustments/negative net prevention first.

Feature checklists:

### P12-F001 Payment Calculator Module

- Sources: `docs/04:906-984`, `docs/01:204-212`, `docs/08:265`.
- RED: unit tests for present full pay, absent zero/defined pay, excused policy, standby rate, takeover rate, agreed wage override, lateness tier boundaries, manual adjustment, negative net prevention, decimal precision.
- GREEN: implement pure Payment Calculator with breakdown output.
- Code-structure check: Calculator never reads DB or user role.
- Architecture check: small Interface, high leverage, deletion test must show complexity would spread to payment, export, reports if removed.
- DRY check: money helpers shared only when same domain meaning as Budget.
- Verify: exhaustive unit suite, edge cases, golden fixtures.
- Context/docs update: if exact formula discovered/changed, docs/04/docs/06/CONTEXT update.

### P12-F002 Recalculate payment lines

- Sources: `docs/03:538-553`, `docs/04:906-984`, `docs/06:721-747`.
- RED: action tests for recalculation from attendance, locked attendance behavior, breakdown persistence, audit log.
- GREEN: implement recalculation Action/job.
- Code-structure check: Action gathers inputs and persists output; Calculator computes only.
- Architecture check: transaction follows `docs/08:368-369`.
- DRY check: no payment math outside Calculator.
- Verify: action/integration tests, rg for math duplication, audit tests.
- Context/docs update: recalculation trigger policy if changed.

### P12-F003 Payment batch review and approval

- Sources: `docs/03:555-587`, `docs/04:988-1025`, `docs/06:749-789`, `docs/06:1026-1040`.
- RED: tests for Finance review state, Owner/Admin approval, denied roles, lock included lines, rejection/reopen if supported.
- GREEN: implement payment batch Actions and Payment tab.
- Code-structure check: Action owns review/approval state transitions; repo writes transaction.
- Architecture check: approval Interface makes lock state explicit to UI.
- DRY check: payment batch statuses central.
- Verify: action tests, permission tests, UI locked state tests, audit tests.
- Context/docs update: if two-step approval policy resolved, docs/03/docs/04/docs/09.

### P12-F004 Payment export

- Sources: `docs/03:589-604`, `docs/04:1027-1040`, `docs/05:88-96`, `docs/06:910-934`.
- RED: tests for export denied before approval, CSV/XLSX columns, sensitive field exclusion, export run logged.
- GREEN: implement Report Export Module for payment batch and export Action.
- Code-structure check: Action owns approval gate; Export Module owns file format mechanics.
- Architecture check: export Module Interface supports future reports without hidden payment policy.
- DRY check: export column definitions single-source per report type.
- Verify: unit export tests, action permission tests, generated file snapshot tests.
- Context/docs update: exact export format open issue -> resolve docs when confirmed.

Exit gate:

- Payment Calculator suite passes.
- Finance can review and approved data can export.
- No payment math duplicated outside Calculator.

---

## 17. Phase 13 - Reports, Dashboards, Audit Views

Goal: provide operational visibility without decorative dashboards.

Open first:

- `docs/03_Use_Cases.md:606-638`
- `docs/04_Functional_Requirements.md:1042-1221`
- `docs/05_Non_Functional_Requirements.md:88-96`
- `docs/05_Non_Functional_Requirements.md:301-321`
- `docs/06_Data_Model_Database_Requirements.md:877-934`
- `docs/07_UI_UX_Wireframe_Specification.md:291-309`
- `docs/09_Software_Requirements_Specification.md:514-528`

Architecture principle applied:

- Code-structure: Report Actions own role-safe access and filters. Report Export Module owns generation mechanics. Audit Log Module owns immutable audit entry shape.
- Improve architecture: report query Interfaces must not leak sensitive fields by default.
- DRY: report column sets, dashboard metrics, audit action names single-source.
- TDD: sensitive exclusion, permission gating, approved-only payment export, audit shape first.

Feature checklists:

### P13-F001 Audit Log Module and critical event coverage

- Sources: `docs/04:1169-1221`, `docs/05:303-321`, `docs/06:877-908`, `docs/08:269`.
- RED: tests for budget/wage/attendance/payment/roster/contract audit entries with actor, before/after, reason where required.
- GREEN: implement Audit Log Module and wire to critical Actions.
- Code-structure check: Actions call audit Module; repositories do not silently audit.
- Architecture check: audit Interface gives locality for audit shape.
- DRY check: audit action names central.
- Verify: action tests for each critical workflow, immutability tests.
- Context/docs update: audit reason policy if changed.

### P13-F002 Role dashboards

- Sources: `docs/04:1044-1055`, `docs/07A:553-572`, `docs/07:291-309`.
- RED: tests for Owner/Admin/HR/Coordinator/Supervisor/Finance dashboard data visibility.
- GREEN: implement dashboard queries and screens.
- Code-structure check: dashboard Actions own role-specific data selection; UI blocks display decisions.
- Architecture check: avoid decorative charts; each block answers user question.
- DRY check: shared metric calculation Module only after real reuse.
- Verify: action tests, UI tests, no card-grid overload for dense lists.
- Context/docs update: dashboard block changes -> docs/07.

### P13-F003 Operational reports

- Sources: `docs/04:1057-1122`, `docs/03:606-638`, `docs/09:516-528`.
- RED: tests for roster, headcount, attendance, budget/profit, rating reports by role.
- GREEN: implement report Actions/tables/exports where MVP requires.
- Code-structure check: Action owns permission and filters; Export Module owns file formatting.
- Architecture check: query Modules only if report logic reused or complex enough.
- DRY check: report column definitions central.
- Verify: report tests, export tests, performance tests for large datasets.
- Context/docs update: exact report columns if confirmed.

### P13-F004 Audit/search/admin visibility

- Sources: `docs/06:877-908`, `docs/07:597-641`, `docs/05:505-535`.
- RED: tests for audit view permission, filters, entity drill-in, sensitive data masking.
- GREEN: implement audit/admin views.
- Code-structure check: Action owns access and masking rules.
- Architecture check: audit log read Interface does not expose write internals.
- DRY check: masking rules central.
- Verify: permission tests, UI table tests, logging checks.
- Context/docs update: masking policy if changed.

Exit gate:

- Required MVP reports exist.
- Audit coverage exists for critical changes.
- Dashboards drive action, not decoration.

---

## 18. Phase 14 - Hardening, Performance, Accessibility, Security

Goal: prove app can survive pilot load and sensitive workflows.

Open first:

- `docs/05_Non_Functional_Requirements.md:55-571`
- `docs/07_UI_UX_Wireframe_Specification.md:546-569`
- `docs/08_Technical_Architecture_Document.md:791-843`
- `docs/08_Technical_Architecture_Document.md:847-862`
- `docs/09_Software_Requirements_Specification.md:479-510`

Architecture principle applied:

- Code-structure: hardening changes should deepen existing Modules, not scatter patches across Actions.
- Improve architecture: identify shallow Modules and deepen only where tests/locality improve.
- DRY: monitoring names, error codes, limits, retention policies, rate limits single-source.
- TDD: every bug/hardening fix starts with failing regression test.

Feature checklists:

### P14-F001 Performance seed tests

- Sources: `docs/05:57-96`, `docs/05:100-130`, `docs/08:791-811`.
- RED: failing/performance threshold tests for staff filters, dashboards, payment calc, import, export.
- GREEN: add indexes/query optimization/caching only where test proves need.
- Code-structure check: optimize Module/repository, not UI workaround.
- Architecture check: perf fix should improve locality.
- DRY check: performance thresholds live in one test config.
- Verify: performance runs with seed sizes, query plans for critical indexes.
- Context/docs update: actual scale assumptions if confirmed.

### P14-F002 Security and RBAC regression

- Sources: `docs/05:204-262`, `docs/09:404-421`, `docs/08:564-613`.
- RED: failing regression for any discovered access leak.
- GREEN: fix in permission Module/Action, not UI-only.
- Code-structure check: server enforcement always.
- Architecture check: sensitive access Interface explicit.
- DRY check: one masking/access rule.
- Verify: RBAC matrix, API deny tests, file signed URL tests, token expiry tests.
- Context/docs update: security decision -> ADR if broad.

### P14-F003 Accessibility, RTL, mobile resilience

- Sources: `docs/07:504-569`, `docs/05:404-457`, `docs/09:494-497`.
- RED: failing accessibility/RTL test for each critical screen issue.
- GREEN: fix focus order, labels, contrast, table semantics, mobile touch targets.
- Code-structure check: fix in design-system pattern where repeated.
- Architecture check: accessibility behavior belongs in pattern Interfaces.
- DRY check: no per-screen duplicate focus/label hacks.
- Verify: automated a11y, keyboard tests, 200% zoom smoke, mobile supervisor flow.
- Context/docs update: UX pattern change -> docs/07.

### P14-F004 Logging, monitoring, backup restore proof

- Sources: `docs/05:170-202`, `docs/05:503-535`, `docs/08:686-739`.
- RED: failing test/smoke for missing structured log or backup restore checklist item.
- GREEN: implement structured logging, job monitoring, backup script/runbook.
- Code-structure check: logging wrapper central; Actions pass context.
- Architecture check: monitoring Interface hides provider choice.
- DRY check: event names/error codes central.
- Verify: log smoke, job failure alert smoke, restore test evidence.
- Context/docs update: provider decisions -> ADR/docs/12 later.

Exit gate:

- MVP acceptance criteria in `docs/09:479-510` pass.
- Required test suites in `docs/08:834-843` pass.
- Critical screens pass accessibility/RTL checks.

---

## 19. Phase 15 - Deployment, Pilot Readiness, Handover Inputs

Goal: prepare deployable MVP and feed Phase 11/12 plans.

Open first:

- `docs/08_Technical_Architecture_Document.md:614-659`
- `docs/08_Technical_Architecture_Document.md:686-739`
- `docs/09_Software_Requirements_Specification.md:477-552`
- `docs/01_BRD.md:261-271`

Architecture principle applied:

- Code-structure: deployment scripts own operational mechanics; app code owns product behavior.
- Improve architecture: deployment Interface should not tie app to one provider unless provider accepted.
- DRY: env names, image names, domains, storage buckets, job names in one deploy config.
- TDD: deployment smoke tests and health checks before claiming ready.

Feature checklists:

### P15-F001 Environment builds and health checks

- Sources: `docs/08:616-635`, `docs/08:660-685`.
- RED: failing health check test against missing API/web/worker readiness.
- GREEN: implement Docker/build/health endpoints and startup checks.
- Code-structure check: health checks call lightweight readiness Modules.
- Architecture check: provider portability preserved.
- DRY check: environment names and URLs central.
- Verify: local production build, health check smoke, no secrets in image/logs.
- Context/docs update: hosting provider ADR when selected.

### P15-F002 Seed/import pilot data path

- Sources: `docs/01:281-284`, `docs/09:481-497`.
- RED: failing pilot smoke for creating tenant/admin/importing sample row.
- GREEN: implement seed scripts and controlled import setup.
- Code-structure check: seed scripts do not bypass domain rules except explicit test data setup.
- Architecture check: import path uses same Applicant Intake Import Module.
- DRY check: seed roles/statuses from central constants.
- Verify: fresh DB -> migrate -> seed -> smoke login -> sample import.
- Context/docs update: pilot data assumptions.

### P15-F003 UAT evidence pack

- Sources: `docs/09:479-510`, `docs/09:514-528`.
- RED: failing checklist if any MVP acceptance criterion lacks test/evidence.
- GREEN: map tests/screens to acceptance criteria and produce evidence index.
- Code-structure check: not code-heavy; ensure tests map to source truth.
- Architecture check: missing evidence reveals shallow/untested Module.
- DRY check: traceability table reused from SRS, not rewritten inconsistently.
- Verify: all acceptance rows linked to test command or manual UAT case.
- Context/docs update: Phase 11 Testing Plan will formalize.

Exit gate:

- MVP deploy candidate can be built and smoke tested.
- UAT inputs ready for Phase 11.
- Deployment/handover inputs ready for Phase 12.

---

## 20. Cross-Feature Source Lookup Matrix

Use this when agent starts feature with no broader context.

| Feature area | Open these first | Must implement using |
|---|---|---|
| Methodology | `AGENTS.md:5-91`, `docs/00:24-238`, `docs/adr/0001:12-57` | All 4 imported skills. |
| Auth/RBAC/users | `docs/02:24-153`, `docs/04:43-153`, `docs/05:204-262`, `docs/08:387-441` | Permission Module, auth/session Adapter, Action tests. |
| Google applicant import | `docs/01:275-293`, `docs/03:164-197`, `docs/04:155-223`, `docs/06:511-568`, `docs/08:483-502` | Applicant Intake Import Module, Google Sheets Adapter. |
| Applicant review/recruitment | `docs/03:181-248`, `docs/04:349-433`, `docs/06:620-647` | Applicant Actions, interview/rating validation. |
| Staff DB/filtering/groups | `docs/03:334-367`, `docs/04:224-347`, `docs/05:57-64`, `docs/06:235-269`, `docs/06:437-510` | Staff Filtering Module, group Actions. |
| Clients/events/roles | `docs/03:249-316`, `docs/04:435-523`, `docs/06:272-384`, `docs/07:256-290` | Event Actions, event workspace patterns. |
| Budget/wage/lateness | `docs/03:300-333`, `docs/04:525-579`, `docs/06:386-435`, `docs/08:263-264` | Budget Engine Module. |
| Assignment/roster | `docs/03:368-467`, `docs/04:581-648`, `docs/06:570-619`, `docs/06:972-985` | Assignment Pipeline Module. |
| WhatsApp/token | `docs/03:385-417`, `docs/04:650-717`, `docs/06:791-832`, `docs/08:503-518`, `docs/07:341-364` | WhatsApp Messaging Module and Adapter. |
| Contracts/files | `docs/03:419-451`, `docs/04:719-786`, `docs/04:1124-1165`, `docs/06:649-670`, `docs/06:834-859`, `docs/08:442-480` | Contract Ingestion Module, Storage Adapter. |
| Attendance/backup/rating | `docs/03:470-536`, `docs/04:788-902`, `docs/06:672-719`, `docs/07:311-340` | Attendance Capture Module. |
| Payments/export | `docs/01:204-212`, `docs/03:538-604`, `docs/04:904-1040`, `docs/06:721-789`, `docs/08:265-266` | Payment Calculator Module, Report Export Module. |
| Reports/audit | `docs/03:606-638`, `docs/04:1042-1221`, `docs/06:877-934`, `docs/09:514-528` | Report Export Module, Audit Log Module. |
| UI/UX | `docs/07A:11-609`, `docs/07:78-681` | Tokenized UI patterns, RTL, tables/lists/grids, no dense card grids. |
| Deployment/hardening | `docs/05:55-571`, `docs/08:614-739`, `docs/09:479-510` | Provider-portable deploy scripts, monitoring, backup restore proof. |

---

## 21. MVP vs Future Roadmap

### MVP

Implement only:

- internal users, fixed roles, role creation foundation;
- Google Sheets applicant import/review;
- staff profiles, skills, filtering, groups;
- clients, events, event roles/headcount;
- budget/master sheet, wage/rate rules, lateness tiers;
- assignment pipeline, roster approval;
- WhatsApp invitations and token confirm/decline;
- contracts and private file storage;
- supervisor mobile attendance, backup, ratings;
- payment calculation, review, approval, export;
- role dashboards, reports, audit logs;
- Arabic-first RTL with English fallback.

### Future

Defer unless user explicitly approves:

- public customer pages/client portal;
- payment disbursement;
- native mobile app;
- advanced analytics;
- custom permission builder beyond role foundation;
- full e-signature legal platform;
- near-real-time Google Forms watches/Pub/Sub;
- multi-tenant self-service onboarding;
- offline-first attendance.

Source refs:

- MVP scope: `docs/01:141-162`, `docs/09:50-74`.
- Out of scope: `docs/01:178-193`, `docs/09:75-91`.

---

## 22. Risks and Mitigations

| Risk | Source | Agent mitigation |
|---|---|---|
| Payment logic mistakes | `docs/08:851` | Payment Calculator as pure deep Module with exhaustive TDD fixtures. |
| WhatsApp duplicate/failure | `docs/08:852` | Webhook idempotency tests, provider ID uniqueness, retry jobs/logs. |
| Google Sheet field drift | `docs/08:853` | Mapping config, import error queue, import run history, validation tests. |
| Card-heavy/slow UI | `docs/08:854`, `docs/07A:304-410` | Use tables/lists/grids; card eligibility test before any card use. |
| Role leakage | `docs/08:855` | Central permission Module, API deny tests, file access tests. |
| Tenant leakage | `docs/08:856` | `tenant_id` in schema and repository tests from Phase 1. |
| File exposure | `docs/08:857` | Private storage, signed URL checks, sensitive file permission tests. |
| Provider mismatch | `docs/08:858` | Docker/provider portability until provider confirmed. |
| Over-abstraction | `docs/08:859` | Deletion test before adding Module/Seam. |
| Under-tested integrations | `docs/08:860` | Adapter contract tests, structured failures, sandbox/staging smoke. |
| Offline attendance grows | `docs/08:861`, `docs/09:544` | Keep online-first with explicit error unless client confirms offline scope. |

---

## 23. Context and Documentation Update Gates

Update these during implementation:

| Trigger | Update |
|---|---|
| New domain term or clarified existing term | `CONTEXT.md` |
| Architecture decision accepted or changed | New ADR in `docs/adr/` |
| Requirement changes | `docs/04_Functional_Requirements.md` and SRS if accepted |
| Role/permission changes | `docs/02_Stakeholders_User_Roles.md` and permission tests |
| Entity/status/field changes | `docs/06_Data_Model_Database_Requirements.md`, migrations, fixtures |
| UI navigation/screen behavior changes | `docs/07_UI_UX_Wireframe_Specification.md` |
| NFR/security/performance target changes | `docs/05_Non_Functional_Requirements.md` |
| Open issue resolved | `docs/09_Software_Requirements_Specification.md:531-549` and relevant source doc |

Do not update docs to justify unapproved implementation drift. Update docs only when decision is accepted or source needs correction.

---

## 24. Agent Definition of Done

Feature complete only when:

- source refs opened and listed in work log;
- Action, Module, Interface, Adapter decisions documented;
- TDD RED observed for each new behavior;
- GREEN verified with targeted tests;
- relevant suite passes;
- code-structure separation respected;
- architecture deletion test passed for new Modules;
- DRY truth checked with `rg`;
- permissions tested server-side;
- tenant scoping tested where data is tenant-owned;
- UI follows Phase 7 patterns if screen changed;
- audit/logging checked for critical workflow;
- docs/context/ADR updated where required;
- open questions recorded, not hidden.

---

## 25. Approval Checkpoint

Approve this Phase 10 plan if these decisions are accepted:

1. Implementation plan is agent-gated, not human calendar timeline.
2. All feature work must import and apply `$test-driven-development`, `$code-structure`, `$improve-codebase-architecture`, and `$dry-principle`.
3. Every feature requires source refs, Action/Module/Interface/Adapter note, RED/GREEN evidence, DRY check, and context/doc update check.
4. Phase ordering follows dependency gates G0-G15.
5. MVP stays limited to approved SRS/BRD scope.
6. Open questions in SRS stay blockers only when they affect feature correctness or security.
