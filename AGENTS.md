# Zell-force Agent Instructions

These rules apply to all code work in this repository.

## Required Methodologies

Every production change must follow:

1. `code-structure`
2. `improve-codebase-architecture`
3. `dry-principle`
4. `test-driven-development`

Read [docs/00_Engineering_Methodology.md](docs/00_Engineering_Methodology.md) and [CONTEXT.md](CONTEXT.md) before implementing features.

## TDD Is Mandatory

No production code without a failing test first.

Required cycle:

1. RED: write one failing test for one behavior.
2. Verify RED: run the test and confirm it fails for the expected reason.
3. GREEN: write minimal production code to pass.
4. Verify GREEN: run the test and confirm it passes.
5. REFACTOR: clean code while tests stay green.

Bug fix rule: reproduce bug with failing test first.

Exceptions require explicit human approval:

- throwaway prototypes;
- generated code;
- pure config files.

## Code Structure

Use two-layer separation:

- Actions orchestrate product/domain rules: auth, role checks, workflow stage changes, approvals, user-facing errors.
- Operational-mechanics modules centralize reusable operations: Google Sheets sync, WhatsApp send/webhook handling, file storage, payment calculation, exports.

Do not create one giant module. Prefer small composable capability modules with explicit inputs and structured outputs.

## Monorepo Structure

Runtime apps live in `apps/`; reusable Interfaces and Implementations live in `packages/`.

- `apps/web`: Next.js + React UI only. May import `@zellforce/ui`, `@zellforce/domain`, `@zellforce/contracts`, and public config.
- `apps/api`: Express.js HTTP Adapter. Owns route glue, Better Auth mounting, request/response conversion, and calls application Actions.
- `apps/worker`: background job runtime. Calls application Modules/Actions; no HTTP/UI logic.
- `packages/application`: server-side Actions and deep Modules. No Next.js or Express imports.
- `packages/contracts`: API DTOs and validation schemas shared by web/API.
- `packages/domain`: roles, statuses, permissions, domain constants.
- `packages/db`: migrations, transaction helpers, DB Interfaces.
- `packages/config`: env/config schema source of truth.
- `packages/ui`: design tokens and reusable React UI primitives. No data fetching or DB access.

Forbidden dependencies: web -> db/application, packages -> apps, api -> web internals, worker -> web internals.

## Architecture Vocabulary

Use these architecture terms:

- Module
- Interface
- Implementation
- Depth
- Seam
- Adapter
- Leverage
- Locality

Avoid vague alternatives in architecture reviews. Discuss whether a Module is deep or shallow, where its Interface lives, what Seam it creates, and which Adapter satisfies it.

## DRY Rules

- Single source of truth for config values, role names, statuses, permission maps, template names, and integration settings.
- Do not extract abstraction on second occurrence. Wait for at least 3 concrete instances unless duplication is dangerous config/state drift.
- Do not DRY coincidentally similar code from different domain meanings.
- Prefer readable duplication over obscure indirection.
- Do not copy-paste operational mechanics as first resort. Check existing modules first.

## Project-Specific Module Expectations

Deep Modules expected in MVP:

- applicant intake import;
- staff filtering;
- assignment pipeline;
- budget engine;
- attendance capture;
- payment calculation;
- WhatsApp messaging;
- contract ingestion;
- report/export generation;
- audit logging.

These Modules should hide operational detail behind small Interfaces and be tested through those Interfaces.

## Documentation Discipline

When architecture decisions become accepted, record them in `docs/adr/`.

When project domain language changes, update `CONTEXT.md`.

When requirements change, update matching docs:

- BRD -> `docs/01_BRD.md`
- roles -> `docs/02_Stakeholders_User_Roles.md`
- use cases -> `docs/03_Use_Cases.md`
- functional requirements -> `docs/04_Functional_Requirements.md`
- non-functional requirements -> `docs/05_Non_Functional_Requirements.md`
