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
- BR-5: **Credential handling:** since there is no working email delivery in production today (`app.email.enabled` is false, no provider configured — pre-existing, separate platform gap, not this story's problem to fix), the Super User sets (or the system generates) a temporary password shown once at creation time, communicated to the customer out-of-band (phone/email manually) by the Super User. The new user is required to change their password on first login. This differs from US-881's "never let the Super User see a password" rule for *existing* users — for brand-new account creation there is no prior self-service credential to preserve, and no working invite-email flow to fall back on.
- BR-6: Email uniqueness and standard registration validation rules (matching `AuthService.register()`'s existing checks) apply identically here — this is not a bypass of data integrity rules, only of the join-code/self-service requirement.

---

## Acceptance Criteria

- AC-1: Given a Super User adds a new user to an existing tenant with a reason, when the action completes, then a new `User` row exists scoped to that tenant with the matching persona role, a temporary password is shown once, and an audit entry is written.
- AC-2: Given a Super User creates a new tenant with a first user and a reason, when the action completes, then a new `Tenant` and `User` exist, the user is `is_tenant_admin = true`, a temporary password is shown once, and an audit entry is written.
- AC-3: Given the new user's first login attempt with the temporary password, then they are required to set a new password before proceeding further.
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
| Temporary password | *(system-generated or Super-User-set)* | `users.password_hash` (hashed) | String | Yes |
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
- **Temporary password shown once, not emailed:** the honest consequence of the pre-existing "no email provider configured in production" gap — rather than build a workaround (e.g., a fake email path) or block this story on fixing that separate gap, the Super User communicates the credential out-of-band, matching how a solo-founder-run support operation would actually work today.
- **Bypasses join-code, not registration validation:** this is a convenience for the Super User's direct access, not a loosening of data-integrity rules — email uniqueness and other `AuthService.register()` checks still apply.

---

## Approval

Approved by Mike, 2026-09-02, as an addition to the "Super User feature gaps" batch (US-880 through US-886).
