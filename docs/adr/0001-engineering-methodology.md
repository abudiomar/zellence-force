# ADR-0001: Engineering Methodology

**Status:** Accepted  
**Date:** 2026-06-10  

## Context

Zell-force is planned as a heavy-scale event staffing operations platform with sensitive personal data, payment calculations, WhatsApp integration, Google Sheet intake, role-based access, and future multi-tenant readiness.

The project must be maintainable, testable, and AI-navigable from the start. The MVP timeline is short, but shortcuts in payment, attendance, assignment, and integration logic would create high business risk.

## Decision

Zell-force will strictly follow these methodologies:

1. `code-structure`
2. `improve-codebase-architecture`
3. `dry-principle`
4. `test-driven-development`

Project-specific rules are captured in:

- `AGENTS.md`
- `CONTEXT.md`
- `docs/00_Engineering_Methodology.md`

Mandatory practices:

- No production code without a failing test first.
- Actions orchestrate domain rules.
- Reusable operational mechanics live behind deep Modules with explicit Interfaces.
- Architecture reviews use Module, Interface, Implementation, Depth, Seam, Adapter, Leverage, and Locality vocabulary.
- DRY applies to real duplicated operational logic and config truth, not coincidental similarity.
- Architecture decisions are recorded in ADRs.
- Domain language changes are recorded in `CONTEXT.md`.

## Consequences

Positive:

- Payment, attendance, and import behavior can be tested before implementation.
- Operational mechanics such as WhatsApp, Google Sheets, exports, and file storage stay reusable.
- Future AI coding agents get clear navigation and project rules.
- Architecture review has consistent vocabulary and decision history.

Tradeoffs:

- Initial implementation may feel slower because tests must be written first.
- Some duplication may remain until third concrete occurrence proves shared abstraction.
- Developers must record decisions and domain terms as project understanding evolves.

## Non-Negotiables

- TDD applies to features, bug fixes, refactors, and behavior changes.
- Exceptions require explicit human approval.
- Payment calculation must be test-first.
- Role permission logic must be test-first.
- Integration adapters must expose structured outcomes and explicit failure modes.

