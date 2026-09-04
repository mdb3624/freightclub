# US-887: Security — Restrict Admin Self-Registration + Default Super User Bootstrap

**Story Type:** Bug Fix (Security)
**Status:** DONE
**Priority:** P0 — critical, live production vulnerability
**Persona:** Platform (all)
**Scope:** BACKEND

---

## What was found

`POST /api/v1/auth/register` is `@PermitAll` (unauthenticated) and accepted `role: "ADMIN"` with zero restriction anywhere in the code path — `AuthService.register()` set `user.setRole(request.role())` unconditionally. Any unauthenticated caller could self-register as a platform Super User (ADMIN role) and immediately gain access to every cross-tenant capability shipped in the US-880–886 batch: suspend/reactivate any user or tenant, force password resets, impersonate any user, and view the full audit log.

Discovered 2026-09-03 while implementing a legitimate admin-account-creation request, when checking how ADMIN accounts get created surfaced that the public endpoint had no gate at all.

## Fix

1. `AuthController.register()` now rejects `role == ADMIN` before calling `AuthService.register()`, throwing a new `AdminSelfRegistrationNotAllowedException` (403). `AuthService.register()` itself is unchanged — it remains capable of creating ADMIN users when invoked directly by trusted internal code, since the vulnerability was specifically the unauthenticated HTTP boundary, not the business logic.
2. Closing that path removes the only way a fresh environment (or this production system, if zero ADMIN accounts existed) could ever get its first Super User. Added `DefaultSuperUserBootstrapRunner`, an idempotent `ApplicationRunner` that creates exactly one ADMIN account at startup if `DEFAULT_SUPER_USER_EMAIL`/`DEFAULT_SUPER_USER_PASSWORD` are configured (Secret Manager, never in git) and no ADMIN account already exists. Optional and inert in any environment that doesn't set those env vars (CI, PR previews, local dev).
3. Updated 4 backend integration tests that had been using the real `/api/v1/auth/register` endpoint to create their ADMIN test fixtures (an accident of test authoring, not a separate vulnerability — these are integration tests, not internet-facing) to use the existing `@Profile("!prod")` `/api/test/auth/register` endpoint instead, matching the pattern already used correctly by the frontend E2E specs.

## Acceptance Criteria

- AC-1: `POST /api/v1/auth/register` with `role: "ADMIN"` returns 403 and creates no user.
- AC-2: `POST /api/v1/auth/register` with `role: "SHIPPER"` or `"TRUCKER"` is unaffected.
- AC-3: On a fresh environment with `DEFAULT_SUPER_USER_EMAIL`/`DEFAULT_SUPER_USER_PASSWORD` set and zero existing ADMIN users, one ADMIN account is created at startup.
- AC-4: The bootstrap runner never runs again once any ADMIN account exists (idempotent), and does nothing at all if either env var is unset.

## Decision Log

- **Restriction at the controller, not the service:** `AuthService.register()` stays general-purpose so the bootstrap runner (trusted, internal) can still create ADMIN accounts directly; the actual trust boundary being crossed is the unauthenticated HTTP endpoint, so that's where the guard belongs (per `docs/roles/CODER.md`'s Fail-Fast Boundary Validation).
- **Bootstrap via Java `ApplicationRunner`, not a Flyway migration:** a SQL migration would require a pre-computed password hash checked into git (a real secret, functionally no better than a hardcoded plaintext password) or a placeholder-resolved hash with no clean way to bcrypt it at migration time. A startup-time Java component reuses the real `PasswordEncoder` bean and the existing Secret Manager pipeline (`DEFAULT_SUPER_USER_PASSWORD` env var), so the actual credential never touches version control.

## Approval

Approved by Mike, 2026-09-03, as an emergency fix following discovery during unrelated admin-account-creation work.
