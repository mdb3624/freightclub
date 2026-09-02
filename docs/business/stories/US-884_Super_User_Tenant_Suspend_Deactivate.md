# US-884: Super User — Tenant Suspend/Deactivate

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P2
**Persona:** Super User (platform ADMIN role)
**Scope:** FULL_STACK
**Depends On:** US-874, US-880 (Audit Log Foundation)
**Jira:** [FREIG-147](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-147)

---

## User Story

As a **Super User**, I want to suspend (and reactivate) an entire tenant's access to the platform, so that I can enforce account status (e.g., non-payment, policy violation, fraud investigation) without a manual database operation.

---

## Background

Resolved via `/council-review` (2026-09-02): ranked second-tier by the council (after user-level actions) — rarer, higher-blast-radius, but named by multiple members (Expansionist, Buyer, Logician) as a real gap. Today the tenant table (US-750) is view-only; there is no way to enforce access at the tenant level short of a direct DB write. Mirrors US-881's pattern (suspend/reactivate flag, mandatory reason, audit log) but at the tenant level instead of the user level.

---

## Business Rules

- BR-1: Suspension is a new `is_suspended` flag on `Tenant` — every user in a suspended tenant is blocked from login, without touching individual `is_suspended` flags on those users (tenant-level lock is independent of and layered on top of US-881's user-level lock).
- BR-2: Suspending a tenant requires a non-empty reason and writes an audit entry (US-880), same pattern as US-881.
- BR-3: A suspended tenant's data is untouched — this is an access lock, not a data action; no soft-delete, no data export/removal implied.
- BR-4: Reactivation follows the same governed pattern (reason + audit entry).
- BR-5: Explicitly out of scope for this story (per council caution against overbuilding): tenant deletion, plan/billing changes. Those are separate, larger decisions (plan/billing is Tier A financial per `BUSINESS_ANALYST.md` and needs a Director decision before being drafted, matching the existing deferral already recorded for Phase 9b).

---

## Acceptance Criteria

- AC-1: Given a Super User suspends a tenant with a reason, when the action completes, then every user in that tenant is blocked from login (existing sessions invalidated), and an audit entry is written.
- AC-2: Given a user in a suspended tenant attempts to log in, then they receive a clear "account suspended" message, not a generic error.
- AC-3: Given a Super User reactivates a suspended tenant with a reason, then users in that tenant can log in again (subject to their own individual `is_suspended` status from US-881, if separately set), and an audit entry is written.
- AC-4: Given a Super User attempts suspend/reactivate with an empty reason, then the action is rejected.
- AC-5: Given a non-Super-User attempts this action via the API directly, then they receive a 403.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Suspend/reactivate toggle | `isSuspended` | `tenants.is_suspended` | boolean | Yes |
| Reason | `reason` | `admin_audit_log.reason` (US-880) | TEXT | Yes |

---

## Platform Foundation Mapping

Actor: Super User. Sequence: account-lifecycle gate upstream of an entire tenant's ability to authenticate — not part of the load lifecycle.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-874 and US-880.
- [x] **Negotiable** — describes the required lock behavior, not UI layout.
- [x] **Valuable** — closes the "tenant table is view-only" gap the council flagged.
- [x] **Estimable** — one new tenant field, one governed action, mirrors US-881's pattern.
- [x] **Small** — a single suspend/reactivate action.
- [x] **Testable** — AC-1 through AC-5 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous, council-reviewed)

- **Access lock only, not deletion or billing action:** deliberately narrow scope per the council's overbuild caution and the existing Tier A/financial deferral already on record for plan/billing management.
- **Independent of user-level suspend:** a tenant-level lock and a user-level lock (US-881) are separate flags so each can be reasoned about and reversed independently.

---

## Approval

Approved by Mike, 2026-09-02, as part of the "Super User feature gaps" council-reviewed batch (US-880 through US-885).
