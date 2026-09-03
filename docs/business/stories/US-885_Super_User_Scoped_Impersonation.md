# US-885: Super User — Scoped User Impersonation

**Story Type:** New Feature
**Status:** DONE
**Priority:** P3 (last in the batch, deliberately — see Background)
**Persona:** Super User (platform ADMIN role)
**Scope:** FULL_STACK
**Depends On:** US-874, US-880 (Audit Log Foundation), US-881 (Suspend/Reactivate)
**Jira:** [FREIG-148](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-148)

---

## User Story

As a **Super User**, I want to temporarily view the platform as a specific user (for troubleshooting a support ticket), with the session strictly time-boxed, visibly flagged as impersonation, and fully audit-logged, so that I can reproduce and resolve issues without asking a customer to screen-share or guessing at what they're seeing.

---

## Background

Resolved via `/council-review` (2026-09-02): named by every council member as the single highest-value support-resolution capability — and, in the same breath, by the Contrarian as the single highest-risk feature in the entire batch ("a lawsuit waiting for one pissed-off shipper who notices an admin session in their account"). The Researcher's citations back this exact tension: impersonation cuts support-resolution time significantly at other B2B SaaS companies, but every credible source treats it as requiring an audit trail as a precondition, never an afterthought. **This is why it ships last in the batch** — after US-880 (audit log) and US-881 (suspend, in case impersonation reveals something requiring immediate lockout) already exist and are proven in production.

---

## Business Rules

- BR-1: Impersonation sessions are strictly time-boxed (a short, fixed duration — e.g. 15 minutes — after which the session automatically ends; no indefinite impersonation).
- BR-2: Every screen the Super User sees while impersonating displays a persistent, unmissable banner stating they are impersonating a specific user, with a one-click "end impersonation" control.
- BR-3: Starting impersonation requires a mandatory reason and writes an audit entry (US-880) at start; ending impersonation (whether manually or by timeout) writes a separate audit entry.
- BR-4: Impersonation is read-mostly by default — actions taken while impersonating are still attributed to and logged against the real Super User identity in the audit trail, never silently attributed as if the impersonated user performed them. (Whether write actions are allowed at all while impersonating, versus a strictly view-only mode, is an open ARCHITECT/HFD question this story does not resolve — see Not Yet Defined.)
- BR-5: A Super User cannot impersonate another Super User (ADMIN role) — impersonation targets tenant-scoped users only.
- BR-6: Starting an impersonation session requires re-authentication (the Super User must confirm their own credentials again immediately before starting), not just an existing valid session — a stolen/hijacked Super User session shouldn't be enough on its own to start impersonating someone.

---

## Acceptance Criteria

- AC-1: Given a Super User starts impersonating a user with a reason, when the session begins, then a persistent banner is visible on every screen naming the impersonated user, and an audit entry is written.
- AC-2: Given an impersonation session reaches its time limit, then it automatically ends and the Super User is returned to their own Super User session; an audit entry is written for the automatic end.
- AC-3: Given a Super User manually ends an impersonation session, then it ends immediately and an audit entry is written.
- AC-4: Given a Super User attempts to start impersonation without re-authenticating first, then the action is rejected.
- AC-5: Given a Super User attempts to impersonate another ADMIN-role user, then the action is rejected.
- AC-6: Given a Super User attempts to start impersonation with an empty reason, then the action is rejected.
- AC-7: Given a non-Super-User attempts to start an impersonation session via the API directly, then they receive a 403.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Target user | `targetUserId` | `admin_audit_log.target_id` (US-880) | UUID | Yes |
| Reason | `reason` | `admin_audit_log.reason` (US-880) | TEXT | Yes |
| Re-auth confirmation | `password` (re-entered) | N/A (verified, not stored) | String | Yes |
| Session expiry | N/A (server-computed) | *(ARCH fills — session/token mechanism)* | *(ARCH fills)* | Yes |

---

## Platform Foundation Mapping

Actor: Super User. Sequence: support-investigation tool, cross-cutting — not part of the load lifecycle itself, but touches every persona's screens while active.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-874, US-880, and US-881 (suspend exists as the immediate-lockout companion action if impersonation reveals abuse).
- [x] **Negotiable** — describes required guardrails (time-box, banner, audit, re-auth), not exact session mechanism.
- [x] **Valuable** — highest-cited support-resolution unlock across the whole council.
- [x] **Estimable** — bounded, though the highest-complexity story in this batch given session/security mechanics.
- [x] **Small** — deliberately not bundled with write-permission questions (BR-4 leaves that open) to keep this story's scope tight.
- [x] **Testable** — AC-1 through AC-7 are concrete.

---

## Resolved During Implementation (2026-09-02)

- **Session mechanism:** a separate, short-lived `generateImpersonationToken` JWT type — authenticates AS the target user (so tenant-scoped reads work through the existing code paths unmodified) but carries the real Super User's id and the session id in `impersonatedBy`/`impersonationSessionId` claims, read by `JwtAuthenticationFilter` into a new `ImpersonationContextHolder`. Expiry is fixed at 15 minutes (BR-1), independent of the normal access-token TTL. An `impersonation_sessions` table (mirrors `refresh_tokens`/`password_reset_tokens` — no tenant_id/RLS, BYPASSRLS-role-only access) tracks start/expiry/end for audit and reconciliation.
- **Write-permission question: view-only in v1**, per the story's own recommended safer default — enforced in `JwtAuthenticationFilter` itself (any non-GET/HEAD/OPTIONS request is rejected with 403 while an impersonation token is active), with one explicit exception for the end-impersonation endpoint itself. Expanding to permit writes is a future story, not decided here.
- **AC-2's "automatic end" audit entry:** the JWT's own expiry already ends *access* the instant it lapses; a new `ImpersonationTimeoutReconciliationService` (mirrors the existing `TenantAdminReconciliationService` `@Scheduled` pattern) polls every minute to close the session row and write the required audit entry for anything nobody explicitly ended.

---

## Decision Log (Tier B — non-financial, BA autonomous, council-reviewed)

- **Shipped last in the batch, not first:** the Contrarian's specific warning — "if this gets built fast to satisfy the founder's 'make it useful' demand, it will get built unsafely" — is taken seriously here. Every other story in this batch (audit log, suspend/reactivate, activity view) exists and is proven before this one starts, so impersonation's guardrails (time-box, banner, audit, re-auth) have real infrastructure to build on rather than being invented under time pressure.
- **Re-authentication required to start:** a deliberately higher bar than any other action in this batch, reflecting that this is the single highest-risk capability being added.
- **Write-permission question left open, not decided by BA:** whether impersonation should allow write actions is a real design tradeoff (usefulness vs. risk) better resolved by ARCHITECT/Director with the full session-mechanism design in hand, not guessed at here.

---

## Approval

Approved by Mike, 2026-09-02, as part of the "Super User feature gaps" council-reviewed batch (US-880 through US-885).
