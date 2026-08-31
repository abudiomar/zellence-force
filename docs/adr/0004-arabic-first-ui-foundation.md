# ADR-0004: Arabic-First UI Foundation

**Status:** Accepted  
**Date:** 2026-06-12

## Context

Zell-force needs an Arabic-first internal operations UI before product workflow screens expand. Phase 2 already provides auth, RBAC, user APIs, and tenant settings. Phase 3 must create reusable shell, token, table, form, overlay, and state patterns without adding new business workflow behavior.

## Decision

Use:

- `next-intl` without locale URL segments;
- `zf_locale` cookie for locale, defaulting to Arabic;
- server-rendered `<html lang>` and `<html dir>`;
- `zf_density` preference for comfortable/compact density;
- `packages/ui` for reusable React primitives and design tokens;
- Lucide for interface icons;
- Radix Dialog/Alert Dialog/Toast for accessible overlay mechanics;
- TanStack Table dependency for table state direction, while exposing a project-owned table Interface;
- app-owned status-to-visual mapping from `@zellforce/domain` statuses to generic UI tones.

## Consequences

Positive:

- Phase 4+ screens can reuse shell, forms, tables, grids, lists, overlays, status, and responsive patterns.
- Arabic RTL is default from first render.
- `packages/ui` remains framework/data independent.
- Locale and density behavior are tested at unit and browser levels.

Tradeoffs:

- `apps/web` must keep status visuals and nav registry synchronized with domain permissions/statuses.
- No Storybook exists in Phase 3; package UI tests, web logic tests, and manual frontend QA are current verification.
- Next.js Server Components cannot pass function props into client UI primitives; interactive table config must live in client child components.

## Non-Negotiables

- Express remains security authority; UI permission checks are UX only.
- `packages/ui` must not import Next.js, Better Auth, DB, application Actions, or API clients.
- Product status values stay in `@zellforce/domain`.
- Critical states must not be color-only or toast-only.
