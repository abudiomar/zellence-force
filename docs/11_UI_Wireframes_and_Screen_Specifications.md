# Implemented UI Shell And Screen Specification

Status: Phase 3 implemented foundation  
Related source: `docs/07_UI_UX_Wireframe_Specification.md`

## Shell

- Arabic is default. Root layout reads `zf_locale` and sets `<html lang>` and `<html dir>`.
- English switches entire interface to LTR without locale URL prefixes.
- Density preference uses `zf_density`; comfortable default, compact optional.
- Desktop uses fixed logical-start sidebar.
- Tablet/mobile hide sidebar and expose modal drawer navigation.
- Topbar includes user identity, locale control, density control, and logout.
- Email and code-like values render LTR inside RTL UI.

## Navigation

- Navigation comes from `apps/web/src/navigation/app-nav.ts`.
- Disabled future modules stay absent from rendered navigation.
- UI permission checks hide unavailable controls only; Express remains authorization authority.

## Implemented Screens

| Route | Pattern | Notes |
|---|---|---|
| `/login` | Localized form | Uses React Hook Form, Zod, shared fields, validation summary, and safe auth errors. |
| `/` | Protected operational placeholder | Uses shell, page header, section panels, and status badges. No fabricated workflow data. |
| `/settings/users` | Protected table fixture | Uses shared table pattern and status badge. No create/update workflow added. |
| `/settings/general` | Protected settings form fixture | Uses shared form controls for language, currency, timezone, and Hijri setting. |

## Responsive Gate

Playwright verifies:

- 360 x 800 mobile;
- 768 x 1024 tablet;
- 1280 x 800 desktop;
- 1440 x 900 wide desktop.

Required result: no page-level horizontal overflow, no broken protected shell, landmarks visible.

## State Behavior

Shared states exist for:

- loading;
- initial;
- empty;
- no results;
- recoverable error;
- permission denied;
- offline;
- locked;
- archived;
- success.

Critical errors use persistent inline state or alert banners. Toasts are for transient confirmations only.

## Test Commands

- `bun run test apps/web`
- `bun run test packages/ui`
- `bun run test:e2e`
