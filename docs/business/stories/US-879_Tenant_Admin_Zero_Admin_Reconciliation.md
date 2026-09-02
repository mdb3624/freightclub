# US-879: Tenant Admin Zero-Admin Reconciliation

**Story Type:** Bug Fix + Defensive Infrastructure
**Status:** DONE
**Priority:** P0
**Persona:** Platform (system-level; no user-facing UI)
**Scope:** BACKEND
**Depends On:** US-874 (Role Model Foundation)
**Jira:** [FREIG-142](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-142)

---

## Origin

Discovered 2026-09-02, immediately after the Admin persona sprint (US-874/750-752/875-878) shipped: `is_tenant_admin` defaulted to `false` for every pre-existing user, so all 13 currently-active real-customer tenants had **zero** designated tenant-admins — and the only promote/demote endpoint (`TeamController`) requires the caller to already be an admin, so nobody at any of those companies could self-serve their way in. Verified directly against production (`freightclub_db`) before any fix: 13/13 active tenants, 0 admins each.

## Background

`TeamService.removeMember`/`setTenantAdminStatus` already block a tenant from reaching zero active admins through the live UI (`LastTenantAdminException`, US-875/877 BR-4). That protection only covers the interactive path — it does nothing for legacy data predating the flag, or any future code path that soft-deletes a user without going through `TeamService`. This story closes both.

Resolved via `/council-review` (2026-09-02, 6-persona council, verdict: RESHAPE) rather than a unilateral call — full transcript in session history. Consensus: automate detection and promotion (5 of 6 council members), but the promoted user must be notified, not silently flagged; Super User/human involvement is reserved only for a tenant with genuinely zero active members (a different problem — reactivation, not succession), not for routine admin drift.

---

## Business Rules

- BR-1: A tenant with ≥1 active (non-deleted) member and 0 active `is_tenant_admin = true` members is treated as a defect state, never a valid steady state.
- BR-2: Resolution nominates the tenant's earliest-joined active member (`created_at ASC`) as admin, deterministically — no manual selection, no ambiguity.
- BR-3: Promotion is not silent — the promoted user receives an email notification explaining what happened and how to reassign if it should be someone else (via the existing grant/revoke flow, unaffected by this story).
- BR-4: Detection runs both retroactively (fixes the 13-tenant backfill) and on an ongoing schedule (catches any future drift) — one mechanism, not two separate ones.
- BR-5: A tenant with zero active members at all is explicitly out of scope here — that's a reactivation/ownership-recovery problem for the existing Super User tooling, not an admin-succession problem this job solves.
- BR-6: Detection reads cross-tenant (which tenants have zero admins) through the narrow `freightclub_super_user_read` BYPASSRLS role, same pattern as `SuperUserDashboardService` — the standard tenant-scoped `freightclub_runtime` role cannot see other tenants' rows by design (RLS) and that must not change for this feature.

---

## Acceptance Criteria

- AC-1: Given a tenant with ≥1 active member and 0 active admins, when the reconciliation job runs, then the earliest-joined active member is granted `is_tenant_admin = true`.
- AC-2: Given AC-1's promotion, then the promoted user receives an email notification naming the tenant and explaining how to reassign if needed.
- AC-3: Given a tenant that already has ≥1 active admin, when the job runs, then it is not touched (no-op, no duplicate notification).
- AC-4: Given a tenant with zero active members, when the job runs, then it is skipped without error (not this story's problem to solve).
- AC-5: Given the job runs a second time after already resolving a tenant, then it does not re-promote or re-notify (idempotent).
- AC-6: Given the job encounters an error processing one tenant, then it logs and continues to the next tenant rather than aborting the whole run.
- AC-7: Given the job's per-tenant work, then `TenantContextHolder` is cleared after each tenant regardless of success or failure — no cross-tenant context leakage.

---

## Field Contract Table

| Field | API Param | DB Column | Type | Required |
|-------|-----------|-----------|------|----------|
| Zero-admin tenant detection | N/A (internal) | `tenants.id`, `users.tenant_id`, `users.deleted_at`, `users.is_tenant_admin` | N/A | N/A |
| Promotion | N/A (internal) | `users.is_tenant_admin` | boolean | Yes |
| Notification | N/A (internal) | `users.email`, `users.first_name` | N/A | Yes |

---

## Platform Foundation Mapping

Actor: Platform (scheduled system job). Sequence: upstream of everything gated on `ROLE_TENANT_ADMIN` (US-875/876/877/878) — a prerequisite-repair mechanism, not part of the load lifecycle.

---

## INVEST Self-Check

- [x] **Independent** — depends only on US-874's `is_tenant_admin` flag existing.
- [x] **Negotiable** — describes the required outcome (no tenant left adminless), not a specific job-scheduling mechanism.
- [x] **Valuable** — unblocks the entire Admin persona sprint's self-service value for every existing customer; without it, US-875-878 are unusable by anyone who signed up before 2026-09-01.
- [x] **Estimable** — bounded: one detection query, one promotion path, one notification.
- [x] **Small** — one new service, one new repository method, one migration.
- [x] **Testable** — AC-1 through AC-7 are concrete and covered by `TenantAdminReconciliationServiceTest`.

---

## Decision Log (Tier B — non-financial, BA autonomous, council-reviewed)

- **Auto-promote + notify, not a pending-accept flow:** the mechanism is a scheduled job with no live user session to attach a real-time accept step to; gating the fix on the promoted user's later action would leave the tenant adminless for an unbounded window, reproducing the exact outage this story exists to prevent. Every real-world precedent researched (Slack, GitHub, Google Workspace, Stripe) gates *ownerless recovery* (zero members at all) behind human/support verification but treats *routine succession* (an active member simply isn't flagged) as safe to automate — this tenant's situation is the latter, not the former.
- **No Super User/human-in-the-loop for the common case:** `TeamService`'s existing last-admin protection already makes this scenario impossible through the live UI; routing every future occurrence through a support queue would build a permanent, scaling operational cost for what is, for FreightClub's 1-2-person tenants, a proportionate self-healing fix. Super User escalation is reserved for the genuinely different zero-active-member case (BR-5), which already has its own tooling.
- **One mechanism for both the one-time backfill and ongoing drift, not two:** avoids maintaining a throwaway migration script alongside separately-built production code; the same idempotent job simply finds nothing left to do on every run after the first.
- **Also discovered and fixed in this story's implementation: `@EnableScheduling` was never added to the application**, despite an existing `@Scheduled` outbox poller (`LoadPublishedListener`) already depending on it — meaning that poller (and the auto-match discovery it drives) has likely never actually run in any environment. Fixed as part of this story since this story's own job needed the same annotation to function at all; flagged prominently as separate, pre-existing debt, not introduced by this story.

---

## Approval

Approved by Mike, 2026-09-02 ("lets do 1 and 2" — both the immediate production backfill and this ongoing mechanism). Council-review verdict (RESHAPE, 6-persona) adopted as the design basis in place of a separate BA/ARCHITECT drafting pass, given the bounded, backend-only, no-UI scope and the urgency of 13 real customers being locked out.
