# Proposal Demo MVP Implementation Summary

**Date:** 2026-06-23  
**Scope:** Candidate management, filtering, lightweight event shortlist, and inbound WhatsApp demo workflow.

## Purpose

This implementation turns the existing applicant review foundation into a proposal-demo MVP for MAG Events. The demo focuses on replacing the current manual flow:

Google Form response Sheet -> screening Sheet -> interview Sheet -> filtered shortlist.

The implementation intentionally does not include attendance, payment calculation, master sheets, reports, full contract generation, or full event operations.

## Implemented Capabilities

### Applicant Intake

- Google Sheet sync remains the applicant source of truth.
- Added Sheet header preview endpoint and UI.
- Added configurable field mapping for:
  - full name
  - phone
  - email
  - city/location
  - gender
  - age/date of birth
  - photo URL
  - CV URL
  - experience
  - notes
- Preserves raw unmapped Sheet data for candidate detail review.
- Fixed repeated sync idempotency by upserting on source hash.

### Screening Workspace

- Rebuilt `/recruitment/applicants` into a candidate management workspace.
- Added screening table fields:
  - photo thumbnail
  - name
  - phone
  - city/location
  - age
  - CV presence
  - screening status
  - interview status
  - final score
  - contract status placeholder
- Added candidate detail panel with:
  - photo preview
  - CV/photo links
  - raw Sheet fields
  - screening notes
  - decision buttons
- Added screening decisions:
  - `needs_review`
  - `shortlist_for_interview`
  - `save_to_staff_pool`
  - `save_for_future`
  - `underqualified`
  - `overqualified`
  - `rejected`

### Interview Pipeline

- Added interview status tracking:
  - `not_scheduled`
  - `scheduled`
  - `interviewed`
  - `no_show`
  - `passed`
  - `failed`
- Added lightweight contract fields:
  - contract sent
  - contract status: `not_sent`, `sent`, `pending`, `signed`, `refused`
- Added interview scoring fields:
  - presentation
  - communication
  - English fluency
- Final score is calculated as an equal-weight average of entered scores.

### Staff Pool And Filtering

- Added staff pool API and UI.
- Candidates can be saved to active staff pool or saved for future.
- Added filters for:
  - search by name/phone
  - city/location
  - gender
  - age range
  - has photo
  - has CV
  - screening status
  - interview status
  - contract status
  - minimum final score
  - minimum presentation score
  - minimum communication score
  - minimum English fluency score
- Added saved filter shortcuts:
  - Ready for interview
  - High score
  - Has CV + photo
  - Saved for future
  - Ready for event shortlist

### Demo Event Shortlist

- Added lightweight demo event table and API.
- Demo events support:
  - event name
  - city
  - date
  - role name
  - needed headcount
- Staff pool candidates can be added to a demo event shortlist.
- UI shows needed, shortlisted, and confirmed placeholder counts.

### WhatsApp Bot Demo

- Added real Meta webhook endpoints:
  - `GET /api/whatsapp/webhook` for verification challenge.
  - `POST /api/whatsapp/webhook` for inbound messages.
- Added inbound message storage.
- Matches inbound sender phone to person/applicant rows.
- Shows WhatsApp Inbox and Emergency Alerts in the UI.
- Added a simple menu-driven bot response flow:
  - unknown/non-registered numbers receive Apply and Contact team options;
  - Apply returns the MAG Events Google Form link;
  - Contact team confirms that the team will follow up;
  - registered candidates who passed interviews receive Profile and Event details options;
  - Profile returns a compact candidate profile from stored applicant data;
  - Event details returns a placeholder telling the candidate they will be informed when assigned to an event.
- Added optional outbound Cloud API sender. It is enabled when `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are configured.
- Text intent classification remains only as fallback logging, not the primary bot interaction model.

## Database Changes

Added migration:

- `packages/db/migrations/0004_proposal_demo_pipeline.sql`

This migration extends `applicant_import_rows` with screening, interview, contract, scoring, and staff-save fields.

It also adds:

- `demo_events`
- `demo_event_shortlist`
- `whatsapp_inbound_messages`

## Application And API Changes

Key application/API additions:

- Sheet header preview.
- Screening status updates.
- Interview pipeline updates.
- Save to staff pool/future.
- Staff pool listing and filters.
- Demo event creation/listing.
- Demo shortlist updates.
- WhatsApp inbox listing.
- WhatsApp webhook record handling.
- WhatsApp menu response generation.
- Optional WhatsApp Cloud API outbound sending.

Primary files:

- `packages/contracts/src/index.ts`
- `packages/application/src/index.ts`
- `apps/api/src/http/routes.ts`
- `apps/api/src/http/app.ts`
- `apps/api/src/server.ts`
- `apps/api/src/adapters/whatsapp-cloud.ts`
- `apps/api/src/adapters/postgres.ts`
- `apps/api/src/adapters/google-sheets.ts`

## Frontend Changes

The applicant route was redesigned into a multi-tab workspace:

- Dashboard
- Applicant Intake
- Screening
- Interviews
- Staff Pool
- Demo Shortlist
- WhatsApp Inbox

Primary files:

- `apps/web/src/app/recruitment/applicants/applicants-client.tsx`
- `apps/web/src/app/recruitment/applicants/applicants-table.tsx`
- `apps/web/src/app/recruitment/applicants/applicants-api.ts`
- `apps/web/src/app/globals.css`

## Foundation Fixes

The implementation also fixed existing foundation gaps that were blocking a clean test/build run:

- Added missing UI exports from `@zellforce/ui`.
- Added missing UI table/screen-state primitives expected by tests.
- Added compact density token.
- Added `/settings/users` navigation item.
- Removed `next/font/google` dependency from the app layout so builds do not depend on fetching Google Fonts.

## Demo Data

Updated `apps/api/src/seed-local.ts` to create:

- demo tenant and owner
- realistic applicant rows
- staff pool people
- screening/interview/contract statuses
- one demo event
- event shortlist row
- WhatsApp emergency and status messages

Default local login:

- Email: `owner@example.com`
- Password: `Password123!`

## Verification

Completed verification:

- `bun run typecheck`
- `bun run test`
- `bun run build`
- HTTP smoke check:
  - `GET /recruitment/applicants` returned `200`
  - `GET /health` returned `{"status":"ok"}`

DB integration tests remain skipped unless `TEST_DATABASE_URL` is provided.

## Remaining MVP Gaps

### Must Resolve Before Client Demo

- Confirm live Google Sheet access method.
- Share the response Sheet with the selected service account.
- Save tenant-level Sheet ID, range, and mapping instead of relying on local state.
- Confirm whether Google Form photo/CV links are public, shared with the service account, or need file ingestion.
- Confirm final Arabic/English copy for the current WhatsApp buttons and profile text.
- Add WhatsApp signature verification using `WHATSAPP_APP_SECRET`.
- Add supervisor routing for Contact team and future emergency actions.

### Recommended Near-Term Improvements

- Add Arabic labels and copy for the demo UI.
- Add a guided “Connect Google Sheet” onboarding panel.
- Add a “Coming Soon” area for attendance, payments, master sheets, and reports.
- Add a short demo script for the proposal presentation.
- Add tenant settings persistence for applicant intake configuration.

## Recommended Business Onboarding Flow

For the fastest MVP rollout, use a Zell-force-owned Google service account.

Recommended flow:

1. Show the tenant the service account email in the app.
2. Ask them to share the Google Form response Sheet with Viewer access.
3. Tenant pastes the Sheet URL.
4. App previews headers.
5. Tenant maps fields.
6. App saves the mapping for future syncs.

OAuth can be added later for a more self-service SaaS experience, but it is heavier because it requires consent handling, token storage, refresh, revocation, and possibly Google app verification.

## WhatsApp Bot Direction

The WhatsApp bot is now treated as reactive and menu-driven:

- Users select predefined buttons/lists.
- We process stable action IDs.
- Free text is only enabled after selecting “Speak to someone”.
- Current MVP actions are `apply`, `contact_team`, `profile`, and `event_details`.

Next WhatsApp implementation should introduce:

- signature verification
- supervisor alert routing
- message templates or session-window handling rules
- richer profile editing and event-assignment details
