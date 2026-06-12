# ADR-0003: Next.js Web App and Express API Separation

**Status:** Accepted  
**Date:** 2026-06-11  

## Context

Zell-force needs an Arabic-first internal web app, token pages for workers, a protected API, Better Auth sessions, webhooks, background worker jobs, and future multi-tenant readiness.

Earlier planning allowed Fastify for the API. The accepted stack is now Next.js for the frontend and Express.js for the backend API.

## Decision

Use:

- Next.js + React for `apps/web`;
- Express.js + Node.js TypeScript for `apps/api`;
- separate worker runtime for background jobs;
- Better Auth for email/password sessions on the Express API.

Better Auth integration will use the Express adapter pattern:

- mount `/api/auth/*` through `toNodeHandler(auth)`;
- mount the Better Auth handler before `express.json()`;
- use `fromNodeHeaders(req.headers)` when reading sessions in API routes;
- keep Better Auth default identity tables: `"user"`, `session`, `account`, `verification`.

## Consequences

Positive:

- Next.js owns routing, SSR-capable token pages, and React UI work.
- Express keeps API middleware familiar and portable.
- Better Auth has official Express integration docs.
- Business rules remain outside framework glue in Actions and Modules.

Tradeoffs:

- Express middleware order is load-bearing for Better Auth.
- API tests must cover auth route mounting and JSON middleware ordering.
- Existing Fastify planning references must be removed before Phase 2 implementation starts.

## Non-Negotiables

- Frontend-only permission checks are UX only; Express Actions enforce authorization.
- No business workflow logic inside Express route glue.
- Better Auth default identity tables are not renamed unless a future ADR supersedes this decision.
