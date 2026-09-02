# US-874: Role Model Foundation (Super User + Tenant Admins)

**Story Type:** Platform Foundation
**Status:** READY_FOR_DESIGN
**Priority:** P0 (blocks US-750, US-751, US-752, US-875, US-876, US-877, US-878)
**Persona:** N/A (platform foundation — enables Admin persona buildout for all other tenant roles)
**Scope:** BACKEND_ONLY
**Depends On:** None
**Jira:** [FREIG-134](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-134)

---

## User Story

As a **platform operator**, I want a tenant-admin capability that a Shipper or Carrier user can hold *in addition to* their existing persona, so that an organization can manage its own members and settings without granting anyone cross-tenant access, and without the platform relying on informal convention for "who's in charge of this account."

---

## Background

Today `UserRole` has exactly three values: `SHIPPER`, `TRUCKER`, `ADMIN`. `ADMIN` is already platform-wide/cross-tenant by convention (it is the actor Phase 9's US-750/751/752 were written for). Tenants already support multiple seats — `Tenant.joinCode` plus the `(tenant_id, email)` uniqueness constraint on `users` exist specifically so a second person can join an existing org — but every member who joins today gets the same flat `SHIPPER` or `TRUCKER` role with no way to distinguish "the person who manages this org" from "a regular seat." This story is the prerequisite for US-875–878 (tenant-admin capabilities) and formalizes what US-750–752 already assumed `ADMIN` meant.

**Revision note (2026-09-01):** the first draft of this story modeled tenant-admin as two new mutually-exclusive `UserRole` values (`SHIPPER_ADMIN`, `CARRIER_ADMIN`) that would replace a user's persona role. Corrected per Director feedback: a user who is a Shipper (or Carrier) stays that persona and *additionally takes on* the admin capability — it's a layered capability, not a different identity. Rewritten below as a boolean flag alongside the existing persona role rather than a role-value fork.

---

## Business Rules

- BR-1: `UserRole` is **unchanged** — no new enum values. Tenant-admin is a separate, additive boolean capability (e.g. `is_tenant_admin`) carried alongside a user's existing `role` (`SHIPPER` or `TRUCKER`). A user is still, and remains, a Shipper or a Trucker; they simply also carry admin rights within their own tenant.
- BR-2: `ADMIN` (Super User, platform-wide/cross-tenant) is untouched by this story — it remains a distinct role value, not something layered onto a persona. A Super User is not also a Shipper or Trucker; tenant-admin and Super User are two unrelated concepts that happen to share the word "admin" in casual conversation.
- BR-3: The first user to register a brand-new tenant (i.e., registration without a `joinCode`, which creates the tenant) has `is_tenant_admin = true` set on their account, with their persona role unchanged (`SHIPPER` or `TRUCKER` as normal).
- BR-4: A user who joins an existing tenant via `joinCode` has `is_tenant_admin = false` — joining an org does not grant admin rights.
- BR-5: A tenant may have more than one tenant admin — an existing admin can grant/revoke the `is_tenant_admin` flag on another member of their own tenant (US-875/US-877 handle the promote/demote UI; this story only needs the flag to exist and the DB-level rule that granting/revoking it must stay within the same tenant).
- BR-6: `is_tenant_admin = true` grants no cross-tenant visibility — RLS scoping by `tenant_id` is completely unaffected by this flag, identically for `true` and `false`. Only `ADMIN` (Super User) is cross-tenant.
- BR-7: A tenant can never end up with zero admins — the last remaining `is_tenant_admin = true` user in a tenant cannot have the flag revoked, nor be removed (US-875/US-877 enforce this at the UI/service layer; this story's AC only covers that the data model itself doesn't silently allow it to go unenforced).

---

## Acceptance Criteria

- AC-1: Given a new user registers without a `joinCode` (creating a new tenant), when their account is created, then `is_tenant_admin` is `true` and their `role` is the plain persona value (`SHIPPER` or `TRUCKER`) matching what they registered as.
- AC-2: Given a new user registers with a valid `joinCode` for an existing tenant, when their account is created, then `is_tenant_admin` is `false`, regardless of the inviting member's own admin status.
- AC-3: Given a user with `is_tenant_admin = true`, when any existing tenant-scoped query runs (loads, documents, ratings, etc.), then RLS still scopes results to their own `tenant_id` exactly as it does for `is_tenant_admin = false` — no behavior change to existing tenant-scoped endpoints.
- AC-4: Given the platform's existing `ADMIN` role, when this story ships, then no existing `ADMIN` user's role value, permissions, or the `UserRole` enum itself changes — this story adds a new column, not a new enum value.
- AC-5: Given the full backend test suite, when it runs post-merge, then no existing test asserting on `UserRole` enum values (e.g., persona-gated endpoint tests) breaks — `role` semantics are completely unchanged; only a new independent field is added.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| *(none — backend only)* | *(ARCH fills)* | `users.is_tenant_admin` (new column) | *(ARCH fills — boolean, default false)* | Yes |

---

## INVEST Self-Check

- [x] **Independent** — no other unmerged story required; this only adds a new column and one branch in existing registration logic.
- [x] **Negotiable** — describes the *what* (an additive per-tenant admin flag, assignment rule at registration), not the *how* (ARCH decides column/migration mechanics).
- [x] **Valuable** — unblocks all tenant-admin-facing stories (US-875–878) and gives US-750–752 a real, unrelated cross-tenant actor to build against.
- [x] **Estimable** — single new boolean column + one branch in existing registration logic; ARCH/CODER have enough detail to size it.
- [x] **Small** — fits in one PR.
- [x] **Testable** — AC-1 through AC-5 are concrete pass/fail conditions.

---

## Decision Log (Tier B — non-financial, BA autonomous per Autonomous Decision-making Protocol)

- **Additive flag, not a new `UserRole` enum value (revised 2026-09-01):** Director feedback corrected the initial design — a tenant admin is still a Shipper or Trucker, just with an extra capability, not a different kind of user. An enum-value fork (`SHIPPER_ADMIN`/`CARRIER_ADMIN`) would have meant every persona-gated check in the codebase (`role == SHIPPER`, etc.) needed to additionally account for the admin variant, and would have made "promote to admin" a role migration instead of a flag flip. A boolean capability alongside the unchanged `role` column avoids both problems.
- **`ADMIN` kept as its own distinct, unrelated role, not merged into the flag scheme:** Super User is genuinely a different actor (platform-wide, cross-tenant) from a tenant admin (still tenant-boxed, still has a persona). Collapsing them into one mechanism would blur a distinction that matters for RLS and for every downstream story's authorization checks. The "Super User" name is documentation-only for the existing `ADMIN` value; it is not renamed.
- **Promote/revoke and last-admin-protection logic deferred to US-875/US-877:** This story only needs the flag to exist and be settable at registration; the UI/workflow for changing an existing member's admin status belongs to the team-management stories that actually expose it.

---

## Approval

AC-1 through AC-5, all Business Rules, and the Decision Log (including the 2026-09-01 revision to an additive `is_tenant_admin` flag) approved by Mike, 2026-09-01. Story proceeds to ARCHITECT.
