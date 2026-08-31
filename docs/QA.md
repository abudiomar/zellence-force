# Manual QA

Status: Current frontend acceptance policy

## Manual QA Policy

Frontend screens are accepted through manual QA. Automated tests remain required for backend/API logic, domain Modules, contracts, config, DB behavior, platform boundaries, reusable `packages/ui` primitives, and selected non-rendering web logic.

Manual QA replaces Playwright E2E and app-level rendered component tests. Typecheck and build still gate frontend code.

## Per-Change Checklist

- [ ] Affected page loads.
- [ ] Browser console has no new errors.
- [ ] Arabic RTL works.
- [ ] English fallback works if changed.
- [ ] Desktop 1440 x 900 checked.
- [ ] Tablet 768 x 1024 checked if layout changed.
- [ ] Mobile 390 x 844 checked if screen can be used on mobile.
- [ ] Auth/session behavior checked if protected route changed.
- [ ] Role visibility checked if nav/permission behavior changed.
- [ ] Loading, empty, and error states checked if data UI changed.
- [ ] Form validation checked if form changed.
- [ ] Screenshot or user confirmation recorded in work log.

## Screen Checklist

- [ ] Primary action is visible and reachable.
- [ ] Tables/lists do not overflow page unintentionally.
- [ ] Status is not color-only.
- [ ] Focus indicator is visible.
- [ ] Labels and validation errors are clear.
- [ ] Empty state explains next action.
- [ ] Error state is persistent, not toast-only.
- [ ] Long Arabic and English text does not overlap.
- [ ] Phone, email, IDs, and codes render with readable LTR isolation.

## Role Checklist

- [ ] Owner/Admin sees admin controls.
- [ ] HR sees applicant/recruitment controls.
- [ ] Coordinator sees staffing controls.
- [ ] Supervisor sees only assigned operational surfaces.
- [ ] Finance sees payment/review surfaces only.
- [ ] Viewer cannot mutate data.
- [ ] Hidden UI controls have matching API denial tests where security matters.

## Browser/Device Checklist

- [ ] Chromium desktop 1440 x 900.
- [ ] Chromium laptop 1280 x 800 when dense layouts changed.
- [ ] Tablet 768 x 1024 when responsive layout changed.
- [ ] Mobile 390 x 844 for supervisor, worker token, or narrow admin flows.
- [ ] 200% zoom for form-heavy or accessibility-sensitive changes.

## Bug Report Template

- Title:
- Severity: S1/S2/S3/S4
- Environment:
- Role/user:
- Page/screen:
- Steps:
- Expected:
- Actual:
- Screenshot/logs:
- Related requirement/test:
- Regression test needed for backend/logic: yes/no

## Sign-Off Format

Use this format in work log or PR notes:

```text
Manual QA:
- Screen(s):
- Role(s):
- Viewport(s):
- Locale(s):
- Result:
- Evidence:
```
