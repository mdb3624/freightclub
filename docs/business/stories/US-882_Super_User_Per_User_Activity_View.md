# US-882: Super User — Per-User Activity View

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P1
**Persona:** Super User (platform ADMIN role)
**Scope:** FULL_STACK
**Depends On:** US-874, US-880 (Audit Log Foundation)
**Jira:** [FREIG-145](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-145)

---

## User Story

As a **Super User**, I want to view a specific user's basic activity (recent logins, and any admin actions taken on their account), so that I can investigate a support ticket or suspicious-activity report without querying the production database directly.

---

## Background

Resolved via `/council-review` (2026-09-02): named by the Buyer, Logician, and Researcher personas as part of the minimum floor for this to function as a real support tool — the Buyer's fraud-investigation scenario specifically needed to answer "who logged in, from where, when" before any suspend action could be taken responsibly. This is a viewer, not a new data-collection system — it surfaces data the platform already has (login events via existing auth flow, admin actions via US-880's audit log) in one place.

---

## Business Rules

- BR-1: Shows two data sources merged chronologically for a given user: login events (timestamp; IP address only if already captured elsewhere in the auth flow — do not add new tracking infrastructure to satisfy this story) and US-880 audit log entries where this user is the target.
- BR-2: Read-only — this story adds no new write actions.
- BR-3: Cross-tenant, Super-User-only — same access pattern as US-750/751/752/880 (`freightclub_super_user_read`-style narrow role, never tenant-scoped RLS).
- BR-4: Scoped to what already exists — if login-event history isn't already being recorded anywhere in the current auth implementation, this story surfaces audit-log entries only and flags the login-history gap as a separate future story rather than building new tracking infrastructure to fill it.

---

## Acceptance Criteria

- AC-1: Given a Super User views a specific user's activity, when the page loads, then they see that user's audit-log entries (from US-880) in reverse-chronological order.
- AC-2: Given login-event data already exists in the platform for that user, then it is merged into the same chronological view; if it does not exist, the view clearly shows audit-log entries only, not a broken/empty login section.
- AC-3: Given a non-Super-User attempts to access this view or its backing endpoint, then they receive a 403.
- AC-4: Given a user with no activity history, then the view shows an explicit empty state, not an error.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Activity list (merged login + audit events) | `userId` (path param) | `admin_audit_log.target_id` (US-880) + existing login-event source if any | N/A | Yes |

---

## Platform Foundation Mapping

Actor: Super User. Sequence: investigative tool supporting US-881's suspend/reset decisions — not part of the load lifecycle.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-874 and US-880; does not depend on US-881 (can ship in either order relative to it, though pairs naturally).
- [x] **Negotiable** — describes the merged view, not exact layout.
- [x] **Valuable** — the "what happened" tool needed before responsibly taking a suspend/reset action.
- [x] **Estimable** — one read-only endpoint merging two existing data sources.
- [x] **Small** — a list view, no new write capability.
- [x] **Testable** — AC-1 through AC-4 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous, council-reviewed)

- **No new tracking infrastructure:** per the council's explicit caution against overbuilding, this story surfaces existing data (audit log, and login events only if that data already exists) rather than adding new instrumentation. If login-history turns out not to exist yet, that's flagged as separate future work, not silently expanded into this story's scope.

---

## Approval

Approved by Mike, 2026-09-02, as part of the "Super User feature gaps" council-reviewed batch (US-880 through US-885).
