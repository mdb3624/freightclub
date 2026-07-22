# US-858: RLS Write-Path Enforcement Investigation & Complete BYPASSRLS Revocation

**Story Type:** Security Investigation
**Status:** DONE
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

---

## Final Disposition (2026-07-22)

**AC-1 — CONFIRMED.** Reproduced via direct raw-JDBC test: `RlsStatementInspector` was never wired into Hibernate through any `HibernatePropertiesCustomizer` — it was dead code, full stop. Independently, its string-concatenation `SET LOCAL ...; INSERT ...` technique is also broken for parameterized statements under Postgres's extended query protocol (proven via direct psql/JDBC reproduction). RLS write-path enforcement had never worked for any tenant-scoped table, for the life of the project.

**AC-2 — DONE.** Replaced with two components:
1. `TenantAwareDataSource` — wraps the primary `DataSource`; on every connection acquisition, issues `SET LOCAL app.current_tenant = ...` as its own round-trip `Statement` (not string-concatenated onto the next query), reading from `TenantContextHolder`.
2. `TenantContextHolder.setTenantId()`/`clear()` — when a Spring-managed transaction is already active (the common case: JWT filter binds tenant before a `@Transactional` method starts, but `AuthService`'s register/login/refresh and every `@Transactional` test's `@BeforeEach` bind mid-transaction), re-issues `SET LOCAL`/`RESET` directly on the connection already bound to that transaction, found via `TransactionSynchronizationManager`'s resource map, keyed on the unique `EntityManagerHolder` (an earlier version keyed on `ConnectionHolder`, but two distinct ones are bound per transaction with unstable iteration order — intermittent and hard to diagnose).

A second-order bug was found and fixed in the same mechanism: Hibernate's write-behind queues `repository.save()` until the next flush point, so a context switch or `clear()` issued before that flush let the pending write execute later under the wrong (or unbound) tenant, rejected by RLS. Fixed centrally — `TenantContextHolder` now flushes the Hibernate session before every `SET LOCAL`/`RESET` — rather than requiring every call site to remember an explicit `entityManager.flush()`. Also fixed a genuine AC-4 fail-closed gap: `clear()` previously only cleared the ThreadLocal, leaving a stale `app.current_tenant` in effect on an already-open transaction; it now issues `RESET app.current_tenant` too (defensively swallowed if the transaction is already aborted, since `clear()` must never throw from a `finally` block).

**AC-3 — DONE.** `V20260721_1405__Revoke_Runtime_Bypassrls.sql` is live (renamed from `.pending-investigation`). The 3 `@Disabled` tests in `TenantIsolationEnforcementTest` are re-enabled and passing, including the fail-closed-when-unbound case.

**AC-4 — DONE.** Full Docker Pre-Test Protocol run: 940/940 tests, 0 failures, 0 errors, with `BYPASSRLS` genuinely revoked.

**AC-5 — DONE**, with one caveat surfaced along the way. ~15 test fixtures across the suite required fixing the same deferred-write pattern (documented above) once real enforcement exposed them — all fixed, not worked around. GitHub Actions CI (`ci.yml`) was never updated for US-857's login-lookup dual-datasource split and had its own postgres service bootstrapped as `freightclub_runtime` (a superuser, making RLS moot there too) — this was the first PR to ever exercise this code path through CI, since US-857 never merged to `main`. Fixed to mirror `docker-compose.test.yml`. That in turn surfaced a genuine, previously-masked marketplace-visibility gap: `loads_tenant_isolation` blocked truckers from seeing another tenant's OPEN load on the board (shippers and truckers register as separate tenants). Fixed the SELECT-side policy (`V20260722_0100`) — this was required to pass this story's own E2E gate.

**Discovered, explicitly NOT fixed here:** the identical cross-tenant gap exists on the WRITE side — `claimLoad`/`markPickedUp`/`markDelivered` all run under the trucker's own tenant context against a load row owned by the shipper's tenant, and would hit the same RLS rejection now that enforcement is real. No current E2E test exercises this path, so it didn't block this story's gate, but it is a genuine production-breaking bug once real users try to claim a load. Filed as a HIGH-priority Technical Debt Ledger entry (`.claude/learnings.md`, 2026-07-22) rather than silently patched inline — the correct fix needs a new `app.current_user` session GUC (mirroring `app.current_tenant`) and a policy audit across `loads`/`claims`/`load_events`/`load_documents`/payment tables, which is properly a new ARCHITECT-designed story, not a hotfix bolted onto this one.

PR: #62 (`feature/US-858-rls-write-path-investigation` → `main`). All CI checks green (`gh pr checks 62`), including E2E.
