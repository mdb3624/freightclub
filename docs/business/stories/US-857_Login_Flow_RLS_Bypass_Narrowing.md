# US-857: Narrow Login-Flow RLS Bypass

**Story Type:** Security Fix
**Status:** PARTIAL — shipped except AC-1 (see Final Disposition below)
**Priority:** P0
**Persona:** N/A (platform/security — protects Shipper + Carrier tenant data)
**Scope:** BACKEND_ONLY
**Depends On:** None
**Jira:** FREIG-118

---

## User Story

As a platform operator, I want database-level tenant isolation (RLS) actively enforced for all authenticated request traffic, so that a bug in application-layer tenant filtering cannot leak one tenant's data to another.

---

## Background

`V20260422_11__Setup_rls_and_roles.sql` defines real per-table RLS policies (`tenant_id = current_setting('app.current_tenant')`) and enables RLS on every tenant-scoped table. `RlsStatementInspector.java` sets `app.current_tenant` from `TenantContextHolder` on every Hibernate statement.

`V20260603_1000__Grant_Runtime_Permissions.sql` later granted `BYPASSRLS` to `freightclub_runtime` — the role used for *all* authenticated application traffic — to fix one narrow problem: the pre-authentication login lookup (finding which tenant an email belongs to) needs to read `users` before a tenant is known, and the RLS policy was throwing on unset `current_setting`. The fix bypassed RLS for the entire role, for every query, permanently — not just for that one lookup. Since then, tenant isolation for all authenticated traffic has depended entirely on the Java application layer correctly filtering `tenant_id` on every query, with no database-level backstop.

This surfaced during a `/roast` council review of FreightClub's public-launch readiness (2026-07-21) — confirmed directly against the migration files, not assumption.

---

## Business Rules

- BR-1: `freightclub_runtime` (used for all authenticated request handling) must not hold `BYPASSRLS` — RLS policies must actually engage for that role.
- BR-2: The pre-authentication login lookup (email → tenant/user resolution, before a tenant is known) is the only legitimate cross-tenant read need in the system today; it gets its own minimal-privilege role, not a blanket bypass on the main runtime role.
- BR-3: That login-lookup role can only `SELECT` on `users` — no write access, no access to any other table.
- BR-4: RLS policies must fail closed (return zero rows) rather than throw a 500 if `TenantContextHolder` is ever unbound during an authenticated request — this is a backstop for future bugs, not just today's fix.
- BR-5: No change to any other role's grants (`neondb_owner` retains admin/migration privileges as-is; out of scope here).

---

## Acceptance Criteria

- AC-1: Given an authenticated request from Tenant A, when the application queries any RLS-protected table via `freightclub_runtime`, then Postgres enforces the `tenant_id` policy at the database level (`BYPASSRLS` revoked from `freightclub_runtime`).
- AC-2: Given an unauthenticated login attempt, when the system resolves which tenant/user an email belongs to, then the lookup succeeds via a new minimal-privilege role scoped to `SELECT`-only on `users`.
- AC-3: Given the new login-lookup role's credentials were compromised, then it cannot write to any table and cannot read any table other than `users`.
- AC-4: Given a code path fails to bind tenant context before an RLS-protected query executes against the `users` table on `freightclub_runtime`, when that query runs, then it returns zero rows rather than throwing a 500 (the `users_tenant_isolation` policy uses `current_setting(..., true)`). **Scope note (added 2026-07-21, CODER escalation):** the original AC-4 assumed only 9 tenant-isolation policies existed platform-wide; direct migration inspection found 60+ across 20+ tables. This story's AC-4 is narrowed to the one policy actually on the login/auth path (`users`). Hardening the other 60+ to the same fail-closed pattern is real, valuable work but out of scope here — tracked as a follow-on backlog item, not blocking this fix.
- AC-5: Given the migration is applied to a fresh environment (Docker test, Neon prod), then the full existing integration suite passes, plus a new cross-tenant-read negative test (authenticate as Tenant A, attempt to read a Tenant B row via `freightclub_runtime` — must return empty, not the row). **Scope note (added 2026-07-21, CODER escalation):** `docker-compose.test.yml` currently runs `freightclub_runtime` as `POSTGRES_USER`, which the official Postgres image makes the actual superuser — superusers bypass RLS unconditionally regardless of `BYPASSRLS`, so this AC could not be verified in the existing test environment. This story's scope includes adding a non-superuser Docker test role that mirrors prod's `freightclub_runtime` privilege level so the negative test is actually meaningful in CI, not just against Neon by hand.

---

## Out of Scope

- Credential rotation for `freightclub_runtime`'s existing exposed password (tracked separately, though the same PR is a natural place to also rotate it — CODER's call, not a hard requirement of this story).
- `neondb_owner` privileges — unchanged.
- Any other pre-auth flow (password reset, tenant registration) — flagged as a follow-on if they turn out to share the same lookup problem, not bundled into this story.
- **Fail-closed hardening (`current_setting(..., true)`) for the other 60+ tenant-isolation policies** outside `users` — real backlog debt surfaced by this story, not fixed by it. Needs its own story once someone scopes the full table list and regression-tests each domain.

---

## Approval

AC-1 through AC-5 approved by Mike 2026-07-21. CODER work completed same day; see Final Disposition below for what actually shipped vs. deferred.

---

## Final Disposition (2026-07-21)

**Shipped, verified via full Docker Pre-Test Protocol (940 tests, 0 failures, 0 errors, 3 skipped):**

- AC-2, AC-3: `freightclub_login_lookup` role — `V20260721_1400`. SELECT-only on `users`/`tenants`, named columns (including `deleted_at`, needed because Postgres column-level grants cover every column a query *references*, not just ones it *projects* — a real bug found and fixed mid-implementation).
- `LoginLookupRepository`, `AuthenticatedUserPrincipal`, refactored `UserDetailsServiceImpl`/`AuthService` (login, register, refresh all now resolve tenant via the login-lookup role, then bind `TenantContextHolder` before any JPA read/write — eliminates the double-query login used to do).
- AC-4 (narrowed to `users` only, per escalation below): fail-closed `users_tenant_isolation` policy — `V20260721_1402`.
- `tenants` table RLS policies (had none — `V20260721_1401`), 8 stale `app.current_tenant_id`-vs-`app.current_tenant` policy bugs across `payment_accounts`/`carrier_equipment`/`carrier_lanes`/`carrier_availability`/`shipper_profiles` (`V20260721_1403`), a runtime-grants safety net (`V20260721_1404`), and a real `freightclub_runtime` password (`V20260721_1406`) — all pre-existing latent bugs this story's investigation surfaced, none caused by it.
- Docker test-env fix: `freightclub_runtime` is no longer the Postgres bootstrap superuser in `docker-compose.test.yml` (it was — superusers bypass RLS unconditionally, which is why `RLSPoliciesTest` could only ever verify policies *exist*, never that they're *enforced*).
- A real Spring Boot bug found and fixed along the way: defining a second `DataSource`/`JdbcTemplate` bean without marking the primary one `@Primary` suppressed Spring Boot's own auto-configuration entirely — the whole app was silently running through the narrow login-lookup connection. Fixed in `LoginLookupDataSourceConfig`.

**Deferred — NOT shipped, tracked as follow-up (see US-858):**

- **AC-1 (revoking `BYPASSRLS` from `freightclub_runtime`) — migration `V20260721_1405__Revoke_Runtime_Bypassrls.sql.pending-investigation`.** Mid-verification, revoking bypass surfaced `new row violates row-level security policy for table "users"` on INSERT even with `TenantContextHolder` correctly bound beforehand. Root cause suspected: `RlsStatementInspector` prepends `SET LOCAL app.current_tenant = 'x';` onto the SQL string Hibernate executes, but Postgres's extended query protocol may not reliably apply a `SET LOCAL` prefix combined with a parameterized `PreparedStatement` (which is how Hibernate issues all INSERT/UPDATE). If true, this means **RLS enforcement on writes may never have worked for any table** — invisible only because `BYPASSRLS` made `WITH CHECK` moot. This is a foundational question about the tenant-isolation architecture, discovered by this story but bigger than it — see US-858.
- The 3 tests that specifically validate AC-1 (`TenantIsolationEnforcementTest.freightclubRuntimeCannotReadAnotherTenantsUser_byId/_byEmail`, `freightclubRuntimeQueryFailsClosed_whenTenantContextUnbound`) are `@Disabled` referencing this story, not deleted — re-enable once US-858 resolves the write-path question and `V20260721_1405` ships for real.

**CODER escalations during implementation (all resolved with Mike's direction, not unilaterally):**
1. AC-4's "9 policies" assumption was wrong (60+ found) → narrowed to `users` only, rest tracked as debt.
2. `docker-compose.test.yml` ran `freightclub_runtime` as the Postgres superuser → fixed as part of this story (Mike's call).
3. `tenants` had zero RLS policies despite RLS being enabled → fixed in this story (Mike's call: "fix all 5 tables first" — turned out to be 1 real gap, 4 false positives from a regex bug in the initial audit).
4. The `RlsStatementInspector`-vs-parameterized-writes finding → too large/foundational to resolve inline; deferred to US-858 (Mike's call).
