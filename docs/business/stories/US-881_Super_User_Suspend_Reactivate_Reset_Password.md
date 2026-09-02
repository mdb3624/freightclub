# US-881: Super User — Suspend/Reactivate User + Force Password Reset

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P0
**Persona:** Super User (platform ADMIN role)
**Scope:** FULL_STACK
**Depends On:** US-874, US-880 (Audit Log Foundation)
**Jira:** [FREIG-144](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-144)

---

## User Story

As a **Super User**, I want to suspend a user's account (blocking login without deleting their data), reactivate a suspended account, and force a password reset, so that I can respond to account-lockout requests, suspected compromise, or abuse reports without resorting to direct database access.

---

## Background

Resolved via `/council-review` (2026-09-02): named by all six council members as the highest-consensus, lowest-blast-radius missing capability — the actual current alternative is the founder (or an AI session acting on his behalf) performing unaudited direct writes against production. The Buyer persona's concrete scenario (a shipper reports fraudulent load postings, needs the account locked in minutes) is the exact case this closes. Reuses the forced-reason pattern from `TeamService`'s `LastTenantAdminException` protections and US-751's dispute-resolution flow.

---

## Business Rules

- BR-1: Suspension is a new, distinct `is_suspended` flag on `User` — orthogonal to tenant-level soft-delete (`deleted_at`). A suspended user's data and tenant membership are untouched; only their ability to authenticate is blocked.
- BR-2: A suspended user cannot log in (existing sessions/refresh tokens must also be invalidated at suspension time — a suspended account must be locked out immediately, not just on next login attempt).
- BR-3: Suspend, reactivate, and force-password-reset each require a non-empty reason and write an entry to the US-880 audit log in the same transaction as the action.
- BR-4: **Corrected during implementation (2026-09-02) — the original wording assumed a password-reset-email flow that does not exist anywhere in this codebase (verified: zero password-reset code found).** Force-password-reset invalidates the user's current password and current sessions, and issues a short-lived, single-use reset token (not a password) tied to that user. The Super User sees/relays the token (via a link or code, out-of-band — same "no email provider configured in production" constraint as US-886), never a password. The user redeems the token themselves, via a new small self-service endpoint, to set their own new password. This is the mechanism-level equivalent of an email-based reset flow, minus the email delivery step, and preserves AC-4's "Super User never sees or sets the password" exactly as written.
- BR-5: A Super User cannot suspend their own account (prevents accidental self-lockout with no recovery path).

---

## Acceptance Criteria

- AC-1: Given a Super User suspends a user with a reason, when the action completes, then `is_suspended = true`, all of that user's active sessions/refresh tokens are invalidated, and an audit entry is written.
- AC-2: Given a suspended user attempts to log in, then authentication is rejected with a clear "account suspended" message (not a generic invalid-credentials error).
- AC-3: Given a Super User reactivates a suspended user with a reason, then `is_suspended = false` and the user can log in again; an audit entry is written.
- AC-4: Given a Super User forces a password reset with a reason, then the user's current password stops working, their active sessions are invalidated, and an audit entry is written — the Super User never sees or sets the new password value.
- AC-5: Given a Super User attempts to suspend their own account, then the action is rejected.
- AC-6: Given any of these three actions is submitted with an empty/blank reason, then it is rejected before any state changes.
- AC-7: Given a non-Super-User attempts any of these actions via the API directly, then they receive a 403.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Suspend/reactivate toggle | `isSuspended` | `users.is_suspended` | boolean | Yes |
| Reason (all 3 actions) | `reason` | `admin_audit_log.reason` (US-880) | TEXT | Yes |
| Reset token (shown once to Super User) | *(response only, not a request field)* | `password_reset_tokens.token_hash` | String | N/A |

---

## Platform Foundation Mapping

Actor: Super User. Sequence: account-lifecycle gate upstream of every persona's ability to authenticate at all — not part of the load lifecycle.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-874 (role model) and US-880 (audit log), both scoped ahead of this story.
- [x] **Negotiable** — describes the three required capabilities, not exact UI layout.
- [x] **Valuable** — named by every council member as the single most necessary missing capability.
- [x] **Estimable** — one new user field, three governed actions, session invalidation, audit integration.
- [x] **Small** — three closely-related actions on the same entity.
- [x] **Testable** — AC-1 through AC-7 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous, council-reviewed)

- **Suspend is a separate flag from soft-delete, not a repurposing of `deleted_at`:** soft-delete already carries specific meaning (permanent-ish, load/document attribution preserved) across the codebase; conflating it with a reversible, Super-User-initiated lock would risk misinterpreting deleted-user queries elsewhere in the app.
- **No self-suspend:** a straightforward safety rail with no real downside — the Contrarian's "blast radius" framing applies even to this comparatively low-risk action.
- **Password reset never exposes the new password to the Super User:** standard practice; the Super User's role here is "invalidate and force reset," not "become the user's password custodian."
- **Token-based reset, not an email flow, discovered as a wrong assumption during implementation:** no password-reset-email flow exists anywhere in the codebase. Rather than build full email-based delivery (blocked by the same "no email provider configured in production" gap as US-886) or silently violate AC-4 by having the Super User set a password directly, a minimal reset-token mechanism (hashed, single-use, short expiry) achieves the same security property — the Super User relays a token, not a password, out-of-band.

---

## Approval

Approved by Mike, 2026-09-02, as part of the "Super User feature gaps" council-reviewed batch (US-880 through US-885).
