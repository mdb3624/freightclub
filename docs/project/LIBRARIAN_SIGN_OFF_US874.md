# Librarian Sign-Off: US-874, US-750, US-751, US-752, US-875, US-876, US-877, US-878 (Admin Persona Sprint)

**Date:** 2026-09-01
**Reviewer:** Claude (REVIEWER role, same session)
**Librarian:** Claude (LIBRARIAN role, same session)
**Status:** ✅ DONE

---

## Scope

One sprint, one PR (#107), eight stories — a platform-wide Super User role plus tenant-scoped admin capability for Shipper and Carrier personas:

| Story | Title | Jira |
|---|---|---|
| US-874 | Role Model Foundation (Super User + Tenant Admins) | FREIG-134 |
| US-750 | Super User Dashboard (Users, Loads, Tenants) | FREIG-135 |
| US-751 | Dispute Resolution Tools (Super User) | FREIG-136 |
| US-752 | Platform Health Metrics (Real-Time) | FREIG-137 |
| US-875 | Shipper Admin: Team & Seat Management | FREIG-138 |
| US-876 | Shipper Admin: Org Settings & Defaults | FREIG-139 |
| US-877 | Carrier Admin: Team & Seat Management | FREIG-140 |
| US-878 | Carrier Admin: Org Settings & Defaults | FREIG-141 |

Role model is additive: `is_tenant_admin` boolean flag on the existing `User` entity — a Shipper/Trucker "takes on" admin capability without becoming a separate persona (corrected mid-sprint from an earlier separate-role draft, per Director feedback — see US-874 Decision Log). UI placement (merged into existing dashboards vs. a separate workflow) was settled via `/council-review`; verdict adopted into `docs/standards/ADMIN_DESIGN_SYSTEM.md` / `docs/roles/ADMIN_HFD_RULES.md`.

## Verification Checklist

- [x] All 8 story docs Gate-1 approved by Mike (2026-09-01)
- [x] `/council-review` verdict on dual-role UI placement adopted into durable HFD guidance
- [x] Code review PASSED — all hard gates checked: RLS/tenant isolation, soft-delete on member removal, no-Lombok, `data-testid` selector discipline, External Config/Secret Wiring Gate (new `freightclub_super_user_read` narrow BYPASSRLS role + column grants verified live, not just mocked)
- [x] CHG-869 filed and resolved (Claim vs Dispute entity mismatch — Option A, new `Dispute` entity)
- [x] CHG-870 filed and resolved (systemic tenant-context loss under OSIV + `SET LOCAL` transaction scoping, exposed by this sprint's own `@EnableMethodSecurity` fix — see `docs/changes/CHG-870.md` for full root cause)
- [x] Backend tests: full `mvn test` suite green (955+ tests, 0 failures/0 errors), run via the Mandatory Pre-Test Protocol
- [x] Frontend E2E: full `npm run test:e2e` suite green (127 passed, 0 failed, 3 pre-existing unrelated skips), including golden-path and negative-case specs for all 3 new UI surfaces (Shipper team settings, Carrier team settings, Super User dashboard)
- [x] JaCoCo branch coverage clears the 65% CI-enforced floor
- [x] Actual GitHub Actions CI status confirmed via `gh pr checks 107` — all 9 checks `pass` (Backend Build & Test ×2, Frontend Lint/Test/Build ×2, E2E Playwright ×2, check-story-files, Vercel, Vercel Preview Comments) — not asserted from local runs alone
- [x] All ACs across all 8 stories implemented and tested; none skipped
- [x] Traceability links verified: Story docs ↔ ARCH/HFD guidance ↔ CHG-869/CHG-870 ↔ PR #107 ↔ Story_Map.md ↔ Jira FREIG-134–141
- [x] PR merge state verified directly via `gh pr view --json state,mergedAt` (not asserted from memory)
- [x] `Story_Map.md` status updated for all 8 rows
- [x] Jira tickets FREIG-134–141 transitioned to Done

## Summary of What Shipped

**Role model:** `is_tenant_admin` flag on `User`, threaded through JWT claims (`ROLE_TENANT_ADMIN` additional authority), `AuthService.register()` org-defaults inheritance on join.

**Super User (platform-wide, cross-tenant):** `SuperUserDashboardService`/`DisputeResolutionService`/`PlatformHealthService`, all reading via a narrow `freightclub_super_user_read` BYPASSRLS Postgres role with column-level grants — kept fully separate from the tenant-scoped `freightclub_runtime` JPA path. New `Dispute` domain entity (CHG-869). `RequestMetricsFilter` for live request/error counts.

**Tenant Admin (Shipper + Carrier, shared implementation):** `TeamService`/`TeamController` (list/remove members, join-code, grant/revoke admin, last-admin protection), `OrgSettingsService`/`OrgSettingsController` (org-default pickup/billing/cost-basis fields, inherited by new members on join). Frontend: shared `TeamMemberList`/`OrgSettingsForm`/`JoinCodeCard` components, theme/persona-parameterized, wired into existing Shipper and Carrier dashboards per the council-review verdict (merged, not a separate workflow) — plus an independent Super User dashboard shell (no tenant context applies to that role).

**Critical infrastructure fix (CHG-870):** `TenantAwareDataSource` rewritten to reapply `SET LOCAL app.current_tenant` after every `commit()`/`rollback()` on a physical connection, closing a systemic tenant-context-loss bug in Open-Session-In-View request handling that this sprint's own `@EnableMethodSecurity` fix exposed (previously `@PreAuthorize` was silently unenforced everywhere).

## Real Bugs Found and Fixed During This Sprint (Not Caused By the Feature Itself, but Exposed By It)

1. **`@EnableMethodSecurity` was never configured** — `@PreAuthorize` annotations across the entire codebase (`ProfileController`, `LoadController`, `CarrierProfileService`, `DocumentService`, and this sprint's new `TeamController`) were silent decoration. Fixed in `SecurityConfig`.
2. **CHG-870** (see above and `docs/changes/CHG-870.md`) — enabling method security then exposed the OSIV/`SET LOCAL` transaction-boundary bug, fixed in `TenantAwareDataSource`.
3. **React key collision** in `SuperUserDashboardPage`'s tenant table (`key={t.name}` → `key={t.id}`), surfaced under parallel E2E execution.
4. **Missing `users.email` column grant** for `freightclub_super_user_read` (`V20260901_1400`), surfaced as a live 500 via E2E rather than caught by mocked unit tests.

---

## Production Deployment (2026-09-02)

- [x] Real gap caught pre-deploy: `deploy-prod.ps1` never wired `DB_SUPER_USER_READ_USER`/`DB_SUPER_USER_READ_PASSWORD` (new this sprint, backing `freightclub_super_user_read`) — the Flyway placeholder and `app.super-user-read.password` have no default, so deploying as-is would have crashed the migration and backend startup. Fixed in PR #109 before any deploy attempt (same class of gap as FREIG-116).
- [x] `DB_SUPER_USER_READ_USER`/`DB_SUPER_USER_READ_PASSWORD` created in GCP Secret Manager (project `freight-club-495117`)
- [x] Backend (`mvn clean package -DskipTests`) and frontend (`npm run build`) built clean; new admin bundles present in frontend build output (`SuperUserDashboardPage`, `OrgSettingsForm`, `ShipperTeamSettingsPage`, `CarrierTeamSettingsPage`)
- [x] Both images built `--no-cache` and pushed to Artifact Registry (`us-central1-docker.pkg.dev/freight-club-495117/freightclub-repo/freightclub-{backend,frontend}:latest`)
- [x] `.\deploy-prod.ps1` run clean: `freightclub-backend-00084-bp7` and `freightclub-frontend-00058-t2p` deployed, each serving 100% of traffic; script's own health check passed (HTTP 200)
- [x] Smoke test: backend `/actuator/health` direct → 200; CORS preflight (`OPTIONS /api/v1/auth/login`, `Origin: <frontend-url>`) → 200 with correct `Access-Control-Allow-Origin`
- [x] Frontend proxy path (`/api/v1/actuator/health`) returns 401, not 502/504 — confirms the proxy is correctly reaching the backend and Spring Security is enforcing auth as configured; **flagged as pre-existing, out-of-scope debt** (not introduced by this sprint): `docs/OPERATIONS.md`'s documented smoke-test command targets a path (`/api/v1/actuator/health`) that Spring Security's `permitAll` list doesn't cover (only the unprefixed `/actuator/health` is public) — either the doc's curl command or the `permitAll` matcher should be corrected in a future story

## Final Story Closure

All 8 stories (US-874, US-750, US-751, US-752, US-875, US-876, US-877, US-878): implemented, tested, merged to `main`, deployed to production, `Story_Map.md` status `DONE`, Jira FREIG-134–141 transitioned to Done.

---

**Signed:** Claude (acting BA/ARCHITECT/CODER/REVIEWER/LIBRARIAN, single session, 2026-09-01 to 2026-09-02)
**Date:** 2026-09-02
