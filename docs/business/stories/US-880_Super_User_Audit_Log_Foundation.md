# US-880: Super User Audit Log (Foundation)

**Story Type:** New Feature (Infrastructure)
**Status:** READY_FOR_DESIGN
**Priority:** P0
**Persona:** Platform (Super User actions), no direct UI of its own beyond a viewer
**Scope:** BACKEND
**Depends On:** US-874 (Role Model Foundation)
**Jira:** [FREIG-143](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-143)

---

## User Story

As the **platform**, I need every Super User write action (suspend a user, reset a password, deactivate a tenant, impersonate) recorded in an immutable, queryable log — who did it, to whom, when, and why — so that every privileged action taken on a customer's account is accountable and reviewable after the fact.

---

## Background

Resolved via `/council-review` (2026-09-02, "Super User feature gaps" session): the founder's "the admin module is basically useless" complaint, and the resulting council verdict (GO, scoped), converged on one non-negotiable precondition before any new write-action ships — an audit log. Per the Researcher's finding: "the audit log is the precondition for granting suspend/impersonate powers, not a follow-on" — this story must ship *before or alongside* US-881, never after. `DisputesTab`'s forced-reason-and-resolve pattern (US-751) is the one existing precedent for a governed write action on this platform; this story generalizes that pattern into reusable infrastructure the rest of the Super User feature set builds on.

---

## Business Rules

- BR-1: Every Super User write action (this story defines the mechanism; US-881/882/884/885 are the actions that use it) must write an audit log entry in the same transaction as the action itself — an action that "succeeds" but fails to log is a defect, not an edge case.
- BR-2: Audit log entries are append-only — no UPDATE, no DELETE, at the application layer or the database grant level. Not even a Super User can edit or remove an entry.
- BR-3: Every entry captures: acting Super User's identity, action type, target (user or tenant ID), timestamp, and a mandatory non-empty reason — matching the forced-reason precedent from US-751.
- BR-4: The audit log itself is a cross-tenant, Super-User-only resource — read via the same narrow `freightclub_super_user_read`-pattern access already established for US-750/751/752, never through tenant-scoped RLS.
- BR-5: This story ships the storage, write-path, and a basic viewer (chronological list, filterable by target). It does not need to be a full search/analytics tool — that's explicitly out of scope per the council's "don't overbuild for 13 tenants" caution.

---

## Acceptance Criteria

- AC-1: Given a Super User action that writes an audit entry, when the action's own database write fails, then no partial audit entry is left behind (same transaction, both succeed or both roll back).
- AC-2: Given an audit log entry exists, when any request (including from a Super User) attempts to modify or delete it via the application, then it is rejected — there is no code path that allows it.
- AC-3: Given a Super User attempts an action requiring a reason with an empty/blank reason, when they submit, then the action is rejected before either the action or the audit entry is written.
- AC-4: Given a Super User views the audit log, when they filter by a specific user or tenant ID, then only entries targeting that ID are shown, most recent first.
- AC-5: Given a non-Super-User (any tenant-scoped role) attempts to read the audit log via its endpoint, then they receive a 403.

---

## Field Contract Table

| Field | API Param | DB Column | Type | Required |
|-------|-----------|-----------|------|----------|
| Actor (Super User) | *(from JWT, not client-supplied)* | `admin_audit_log.actor_user_id` | UUID | Yes |
| Action type | `actionType` | `admin_audit_log.action_type` | VARCHAR | Yes |
| Target user/tenant ID | `targetId` | `admin_audit_log.target_id` | UUID | Yes |
| Reason | `reason` | `admin_audit_log.reason` | TEXT | Yes |
| Timestamp | *(server-generated)* | `admin_audit_log.created_at` | TIMESTAMPTZ | Yes |

---

## Platform Foundation Mapping

Actor: Platform/Super User. Sequence: foundational infrastructure underneath US-881, US-882, US-884, US-885 — not part of the load lifecycle itself.

---

## INVEST Self-Check

- [x] **Independent** — depends only on US-874's role model existing.
- [x] **Negotiable** — describes the required guarantee (append-only, transactional, mandatory reason), not a specific table schema.
- [x] **Valuable** — the precondition every other story in this batch needs; without it, none of them are safe to ship per the council verdict.
- [x] **Estimable** — one new table, one service, one narrow viewer endpoint.
- [x] **Small** — infrastructure only, no complex UI.
- [x] **Testable** — AC-1 through AC-5 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous, council-reviewed)

- **Ships first, not alongside or after:** every council member who addressed sequencing agreed the audit log must exist before or with the first write-action, never retrofitted. This story is deliberately the first in the batch.
- **Append-only enforced at the database grant level, not just application logic:** matches this codebase's existing pattern of defense-in-depth (RLS + application checks) rather than trusting application code alone to prevent tampering with an accountability record.
- **No full search/analytics tooling in v1:** per the council's explicit caution against overbuilding for a 13-tenant platform — a chronological, filterable list is sufficient; a dedicated audit-analytics UI would be premature.

---

## Approval

Approved by Mike, 2026-09-02, as part of the "Super User feature gaps" council-reviewed batch (US-880 through US-885).
