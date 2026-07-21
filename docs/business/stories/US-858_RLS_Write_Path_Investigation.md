# US-858: RLS Write-Path Enforcement Investigation & Complete BYPASSRLS Revocation

**Story Type:** Security Investigation
**Status:** BACKLOG
**Priority:** P0
**Persona:** N/A (platform/security)
**Scope:** BACKEND_ONLY
**Depends On:** US-857
**Jira:** FREIG-119

---

## Background

US-857 set out to revoke `BYPASSRLS` from `freightclub_runtime` (the role used for all authenticated application traffic), replacing it with a minimal-privilege `freightclub_login_lookup` role for the two legitimate pre-auth reads (login, registration join-code lookup). Everything about that fix shipped and is verified — except the actual `BYPASSRLS` revocation itself.

Mid-verification, revoking bypass caused `new row violates row-level security policy for table "users"` on a plain `INSERT` — even though `TenantContextHolder.setTenantId(...)` was correctly bound immediately before the write (verified in test code). This is not an application bug in the US-857 sense; it points at the underlying mechanism `RlsStatementInspector` uses to bind `app.current_tenant` for every SQL statement:

```java
return "SET LOCAL app.current_tenant = '" + currentTenant + "'; " + sql;
```

This works for a plain `SELECT` (verified via raw psql). But Hibernate issues INSERT/UPDATE as parameterized `PreparedStatement`s (`VALUES (?, ?, ...)`), and PostgreSQL's extended query protocol has known constraints around combining a `SET LOCAL` prefix with a statement that has bind parameters. The suspicion — not yet confirmed — is that the `SET LOCAL` portion silently doesn't take effect when combined this way, meaning **RLS `WITH CHECK` enforcement on writes may never have actually worked, for any tenant-scoped table**, invisible only because `BYPASSRLS` made it moot for `freightclub_runtime`.

If true, this is a foundational gap in the tenant-isolation architecture that predates this story and affects every table, not something introduced by US-857.

---

## Acceptance Criteria

- AC-1: Root-cause whether `RlsStatementInspector`'s `SET LOCAL` prefix reaches Hibernate's parameterized INSERT/UPDATE statements. Produce a minimal, reproducible test case (raw JDBC, no Hibernate) proving or disproving the hypothesis.
- AC-2: If the hypothesis is confirmed, fix the binding mechanism (candidates: an explicit `@Transactional`-scoped `SET LOCAL` issued via a separate `Connection`/`Statement` call before Hibernate's batch executes; a `ConnectionPreparer`/`Interceptor` hook that runs `SET LOCAL` as its own round-trip rather than string-concatenating it onto the next statement; or switching the RLS policy to read from a non-transaction-scoped mechanism). Do not guess — verify the fix closes the gap with the same reproducible test case from AC-1.
- AC-3: Once the write path is confirmed working, rename `V20260721_1405__Revoke_Runtime_Bypassrls.sql.pending-investigation` back to `.sql` (completing US-857's AC-1) and re-enable the 3 `@Disabled` tests in `TenantIsolationEnforcementTest`.
- AC-4: Full Docker Pre-Test Protocol run, full existing suite, must pass with `BYPASSRLS` actually revoked from `freightclub_runtime` — this is the real proof, not a partial/mocked check.
- AC-5: Given the write-path fix, verify it doesn't regress any of the 900+ existing tests that write to tenant-scoped tables under a bound `TenantContextHolder`.

---

## Out of Scope

- Fail-closed hardening (`current_setting(..., true)`) for the ~50+ tenant-isolation policies outside `users` (already fail-closed) — separate backlog item, tracked in US-857's Out of Scope section.
- Any UI/business-logic changes — this is purely the RLS enforcement mechanism.
