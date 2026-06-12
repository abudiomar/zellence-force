# Phase 3 UI Design System

Status: Implemented foundation  
Scope: Arabic-first operational shell and reusable UI primitives

## Ownership

- `packages/ui` owns design tokens and reusable React primitives.
- `apps/web` owns Next.js routes, locale loading, auth state, navigation registry, API data, and domain-status visual mapping.
- `packages/ui` must not import Next.js, Better Auth, DB, application Actions, or API clients.

## Tokens

Token sources:

- `packages/ui/src/tokens/tokens.ts`
- `packages/ui/src/tokens/tokens.css`

Token groups:

- cool neutral surfaces and charcoal text;
- teal primary action;
- blue info, green success, amber review/warning, red danger, neutral locked;
- 4px/8px spacing scale;
- typography sizes, weights, line heights;
- focus ring;
- radius scale capped at 8px;
- comfortable and compact density values through `data-density`.

## Components

Implemented primitive Interfaces:

- controls: `Button`, `IconButton`, `TextInput`, `TextArea`, `Select`, `Checkbox`, `Switch`;
- forms: `Field`, `FormSection`, `ErrorSummary`, `ReadOnlyField`;
- feedback: `StatusBadge`, `AlertBanner`, `ScreenState`, `Skeleton`, `ProgressIndicator`;
- layout: `PageHeader`, `SectionPanel`, `Tabs`, `Toolbar`, `FilterBar`, `Pagination`;
- data patterns: `DataTable`, `SpreadsheetGrid`, `RosterList`;
- overlays: `Dialog`, `Drawer`, `AlertDialog`, `ToastProvider`, `useToast`.

## Rules

- Use logical CSS properties for RTL/LTR.
- Use shared primitives before adding screen-local controls.
- Keep product status meaning in `@zellforce/domain`.
- Map product statuses to visual tones in `apps/web`, not in `packages/ui`.
- Do not use cards as default page layout; use tables, lists, grids, drawers, and section panels.
- Critical states cannot be toast-only or color-only.
- Mixed email, phone, IDs, and codes use explicit LTR isolation.

## Verification

- `bun run test packages/ui`
- `bun run test apps/web`
- `bun run test:e2e`
- `bun run typecheck`
- `bun run build`
