# US-886: Super User — Create User (Existing Tenant or New Tenant)

**Story Type:** New Feature
**Status:** READY_FOR_DESIGN
**Priority:** P1
**Persona:** Super User (platform ADMIN role)
**Scope:** FULL_STACK
**Depends On:** US-874, US-880 (Audit Log Foundation)
**Jira:** [FREIG-149](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-149)

---

## User Story

As a **Super User**, I want to create a new user — either adding them to an existing tenant, or creating a brand-new tenant with them as its first user — so that I can handle a customer's "please add my teammate" or manual-onboarding request directly, without asking the customer to self-register or resorting to direct database access.

---

## Background

Raised directly by the founder (2026-09-02) as a second concrete "manage" gap alongside the `/council-review`-scoped US-880/881 batch — the existing self-service paths (join-code signup for an existing tenant, new-company registration for a brand-new one) have no Super-User-initiated equivalent. Two real scenarios: (1) a customer calls asking to add a team member and the Super User does it on their behalf; (2) a customer signs up over phone/email rather than through the registration form, and the Super User creates their company account and first user directly. Both are covered by this one story since they share almost all of their mechanics — only whether an existing `tenantId` is supplied or a new tenant is created first differs.

---

## Business Rules

- BR-1: **Add to existing tenant:** creates a new `User` scoped to a Super-User-selected existing tenant, with a role matching that tenant's persona (`SHIPPER` or `TRUCKER` — a tenant is one persona, per the existing data model; the Super User cannot create a mismatched-persona user in someone else's tenant). Defaults `is_tenant_admin = false` unless the Super User explicitly grants it as part of creation.
- BR-2: **Create new tenant + first user:** creates a new `Tenant` and its first `User` together, mirroring `AuthService.register()`'s existing "new company" path — the created user is automatically `is_tenant_admin = true` (same bootstrap semantics already established for self-service new-tenant signup, per US-874's Decision Log).
- BR-3: Bypasses the join-code flow entirely — the Super User has direct tenant access, no invite code needed for either scenario.
- BR-4: Both actions require a mandatory reason and write an audit log entry (US-880) — this is a privileged write action like every other Super User capability in this batch.
- BR-5: **Credential handling — corrected during implementation (2026-09-02), same fix as US-881's BR-4.** The original wording ("temporary password shown once") re-invents US-881's already-solved problem and reopens the same question BR-4 there closed: how does the user actually get in without a working email flow? Corrected: no working password is ever set for the new user (matching the exact mechanism US-881 built for force-password-reset — an unusable random hash), and a single-use setup token is issued and shown to the Super User instead, relayed out-of-band the same way as US-881. The new user redeems it via the same `POST /api/v1/auth/reset-password` endpoint already built for US-881 to set their own first password. No new login-gating mechanism needed — the user simply cannot log in at all until they redeem the token, which is a stronger and simpler guarantee than a "must change password" flag would be.
- BR-6: Email uniqueness and standard registration validation rules (matching `AuthService.register()`'s existing checks) apply identically here — this is not a bypass of data integrity rules, only of the join-code/self-service requirement.

---

## Acceptance Criteria

- AC-1: Given a Super User adds a new user to an existing tenant with a reason, when the action completes, then a new `User` row exists scoped to that tenant with the matching persona role, a one-time setup token is returned, and an audit entry is written.
- AC-2: Given a Super User creates a new tenant with a first user and a reason, when the action completes, then a new `Tenant` and `User` exist, the user is `is_tenant_admin = true`, a one-time setup token is returned, and an audit entry is written.
- AC-3: Given the new user has not yet redeemed their setup token, when they attempt to log in, then it fails (no working password exists yet) — they must redeem the token via `POST /api/v1/auth/reset-password` first, after which login with their chosen password succeeds.
- AC-4: Given a Super User attempts to create a user with an email that already exists on the platform, then the action is rejected with the same validation error `AuthService.register()` already produces.
- AC-5: Given either action is submitted with an empty/blank reason, then it is rejected before any state changes.
- AC-6: Given a non-Super-User attempts either action via the API directly, then they receive a 403.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Target tenant (existing-tenant path) | `tenantId` | `users.tenant_id` | UUID | Conditionally (existing-tenant path only) |
| New company name (new-tenant path) | `companyName` | `tenants.name` | String | Conditionally (new-tenant path only) |
| Role | `role` | `users.role` | Enum (SHIPPER/TRUCKER) | Yes |
| Email | `email` | `users.email` | String | Yes |
| First/last name | `firstName`, `lastName` | `users.first_name`, `users.last_name` | String | Yes |
| Setup token (shown once to Super User) | *(response only)* | `password_reset_tokens.token_hash` (US-881) | String | N/A |
| Reason | `reason` | `admin_audit_log.reason` (US-880) | TEXT | Yes |

---

## Platform Foundation Mapping

Actor: Super User. Sequence: account-provisioning, upstream of every persona's ability to use the platform at all — not part of the load lifecycle.

---

## INVEST Self-Check

- [x] **Independent** — depends on US-874 and US-880.
- [x] **Negotiable** — describes the two required creation paths, not exact UI layout.
- [x] **Valuable** — closes a real, founder-identified support gap (add-teammate and manual-onboarding requests).
- [x] **Estimable** — reuses most of `AuthService.register()`'s existing logic, adds Super-User-initiated entry points and audit integration.
- [x] **Small** — two closely-related creation paths sharing nearly all mechanics.
- [x] **Testable** — AC-1 through AC-6 are concrete.

---

## Decision Log (Tier B — non-financial, BA autonomous)

- **Both scenarios in one story, not two:** confirmed with the founder — add-to-existing-tenant and create-new-tenant share almost all mechanics (validation, audit, temporary-password handling), differing only in whether a `tenantId` is supplied or a `Tenant` is created first.
- **Setup token, not a temporary password — reuses US-881's mechanism rather than reinventing it:** the original draft independently arrived at the same "no email flow exists" problem US-881 already solved, and would have built a second, parallel credential-handling mechanism. Reusing the reset-token flow means one code path, one security review, and a stronger guarantee (the account has no usable password at all until setup, rather than a shared secret sitting in a Super User's chat history).
- **Bypasses join-code, not registration validation:** this is a convenience for the Super User's direct access, not a loosening of data-integrity rules — email uniqueness and other `AuthService.register()` checks still apply.

---

## Approval

Approved by Mike, 2026-09-02, as an addition to the "Super User feature gaps" batch (US-880 through US-886).
