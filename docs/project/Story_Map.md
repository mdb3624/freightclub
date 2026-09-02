# Resilience Logistics: Story Map (Global Hardening Edition)

**Last Updated:** 2026-06-04 | **Scope:** 83 stories mapped | **Unmapped Requirements:** 0 | **Compliance Status:** ✅ RLS, No-Lombok, VARCHAR(36), **Test Coverage 50.6%** enforced as hard gates | **US-900 (E2E Testing):** ✅ ALL 6 PHASES COMPLETE (2026-05-31) | **Phase 1 Governance:** ✅ COMPLETE | **Phase 2 Governance:** ✅ COMPLETE | **Phase 3 Governance:** ✅ COMPLETE (story files + sign-offs 2026-05-14) | **Phase 3 US-308:** ✅ COMPLETED (audit logging + integration, 2026-05-25) | **Phase 4 Governance:** ✅ COMPLETE (story files + status synced 2026-05-25) | **Backend Coverage Phase A:** ✅ COMPLETE (49.5% → 50.6%, 54 tests) | **Security & Infrastructure Hardening:** ✅ ALL 3 P1 stories DONE (SEC-001, SEC-002, INF-001)

---

## Critical Security & Infrastructure (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| SEC-001 | Add @PreAuthorize to DELETE/PUT Endpoints | DONE | Cross | — | ✅ RLS, ✅ No-Lombok, ✅ 80% branch coverage (10/10 tests PASS) |
| SEC-002 | PostgreSQL RLS Policies (5 Tables)    | DONE | Cross | — | ✅ RLS enforcement at DB level, ✅ Idempotent Flyway, ✅ 5/5 tests PASS |
| US-857 | Narrow Login-Flow RLS Bypass | DONE | Cross | — | **AC-1 completed by US-858** (2026-07-22) — `BYPASSRLS` genuinely revoked, full suite green, PR #62 merged. Original disposition below. ⚠️ Surfaced 2026-07-21 via `/roast` public-launch-readiness review: `V20260603_1000` granted blanket `BYPASSRLS` to `freightclub_runtime` to fix one narrow login-lookup problem, leaving ALL authenticated traffic with no DB-level tenant-isolation backstop. ✅ SHIPPED (verified via full Docker Pre-Test Protocol, 940/940 tests, 0 failures/errors, 3 intentionally skipped): `freightclub_login_lookup` minimal-privilege role for the two legitimate pre-auth reads (login, registration join-code lookup); `AuthService`/`UserDetailsServiceImpl` refactored to bind `TenantContextHolder` before any JPA read/write instead of relying on bypass; `tenants` table RLS policies added (had zero despite RLS enabled); 8 pre-existing dead policies fixed (`app.current_tenant_id` typo vs. the real `app.current_tenant`, across payment_accounts/carrier_equipment/carrier_lanes/carrier_availability/shipper_profiles); Docker test-env fixed to run `freightclub_runtime` as a real non-superuser role (previously WAS the Postgres bootstrap superuser, silently making every RLS test meaningless); a real Spring Boot bug found+fixed (`LoginLookupDataSourceConfig` defining a 2nd `DataSource` bean suppressed the app's real primary datasource — the whole app was accidentally running through the narrow login-lookup connection). ⏳ **AC-1 (the actual `BYPASSRLS` revocation) deferred** — mid-verification it surfaced `new row violates row-level security policy` on INSERT even with tenant context correctly bound, suspected root cause: `RlsStatementInspector`'s `SET LOCAL` prefix may not reach Hibernate's parameterized INSERT/UPDATE statements, meaning RLS write-enforcement may never have worked for ANY table. Deferred to **US-858** rather than guessed at. `V20260721_1405__Revoke_Runtime_Bypassrls.sql.pending-investigation` and 3 `@Disabled` tests in `TenantIsolationEnforcementTest` mark exactly what's pending. Story doc: `docs/business/stories/US-857_Login_Flow_RLS_Bypass_Narrowing.md` (Final Disposition section has full detail). ARCH design: `docs/architecture/US-857_Login_Flow_RLS_Bypass_Narrowing_Design.md`. | Jira: FREIG-118 |
| US-858 | RLS Write-Path Investigation & Complete BYPASSRLS Revocation | DONE | Cross | US-857 | ✅ Confirmed `RlsStatementInspector` was dead code (never wired into Hibernate, and independently broken for parameterized statements) — RLS write-path enforcement never worked for ANY table. Replaced with `TenantAwareDataSource` (SET LOCAL at connection acquisition) + `TenantContextHolder` re-applying/resetting `app.current_tenant` on the active transaction, flushing the Hibernate session first (root fix for a deferred-write-under-wrong-tenant bug found across ~15 test fixtures). `clear()` now genuinely `RESET`s the DB session variable, closing a real AC-4 fail-closed gap. `V20260721_1405__Revoke_Runtime_Bypassrls.sql` is live. ✅ Full 940-test backend suite green (0 failures/errors), `TenantIsolationEnforcementTest` (the dedicated AC-1/AC-4/AC-5 regression guard) passing including fail-closed-when-unbound. ✅ CI fixed to actually exercise this (`ci.yml` never had `DB_LOGIN_USER`/`DB_LOGIN_PASSWORD`/`FLYWAY_DB_*` wired, and its postgres service bootstrapped AS `freightclub_runtime` — a superuser, making RLS enforcement moot there too; this was the first PR to ever run this code path through GitHub Actions since US-857 never merged to main). ✅ Real RLS enforcement then surfaced a genuine, previously-masked marketplace visibility gap (`loads_tenant_isolation` blocked truckers from seeing other tenants' OPEN loads) — fixed via `V20260722_0100` (SELECT-side only). ⚠️ **Discovered but NOT fixed, flagged as HIGH-priority technical debt** (`.claude/learnings.md` Technical Debt Ledger, 2026-07-22): the same cross-tenant gap exists on the WRITE side (claim/pickup/delivery/documents/events) — needs a new `app.current_user` session GUC + multi-table policy audit, out of scope for this story, not currently E2E-covered so it didn't block this story's gate but WILL break in production. Recommend a new ARCHITECT-designed story. ✅ **Deployed to production and verified 2026-07-22** — smoke test surfaced 3 more real production-only issues (prod `DB_USERNAME` was `neondb_owner`, the actual superuser, meaning RLS was bypassed in prod independent of `BYPASSRLS`; `document_audit_log` had a stale-forever RLS policy Flyway never re-applied; `TestAuthController` had zero enforcement of its own non-prod-only docstring), each fixed via its own PR (#63, #64) and redeployed before sign-off — see Sprint_Log.md. PR #62. Story doc: `docs/business/stories/US-858_RLS_Write_Path_Investigation.md`. | Jira: FREIG-119 |
| INF-001 | Flyway Migration Idempotency (20 migrations) | DONE | Cross | — | ✅ DO block pattern, ✅ Exception handling, ✅ 20/20 migrations wrapped |
| **US-900** | **E2E Testing Infrastructure & Standards** | **DONE** | **Cross** | **—** | **✅ All 6 Phases COMPLETE, ✅ 58 tests active (0 skipped), ✅ CI/CD integrated, ✅ READY FOR PRODUCTION** |
| US-849 | Access Token Refresh Interceptor | DONE | Cross | — | ✅ Found while diagnosing a real "unable to create a load" report — 15-min access-token expiry had no refresh-and-retry wired up despite the refresh endpoint existing; app-wide gap, not load-specific. ✅ 8/8 unit tests, full suite 258/258, e2e 100 passed, live Docker repro confirming silent recovery. ✅ REVIEWER PASS 2026-07-08. | Jira: FREIG-113 |
| US-850 | Custom Font Loading — Vite Import Fix | DONE | Cross | — | ✅ Found via production smoke test — public/fonts/custom-fonts.css used raw CSS @import of bare npm specifiers, resolved fine under Vite dev server (masking it in Docker test env) but 404'd under nginx-served prod build. Switched to dynamic import() so Vite bundles real hashed font files in both environments. ✅ 7/7 unit tests, ✅ 8/8 E2E (login-integration.spec.ts, new regression guard added), ✅ verified against `vite preview` static serving (prod-equivalent) with zero font-related console errors. | Jira: FREIG-114 |
| US-851 | Production Deploy Infrastructure Fixes | DONE | Cross | — | ✅ Found while investigating a decoy-Cloud-Run-service incident (FREIG-115): (1) backend/pom.xml flyway-maven-plugin had a hardcoded nonexistent postgresql:43.0.0 driver version and was missing the flyway-database-postgresql dependency, blocking `mvn flyway:repair` from running at all; fixed to use ${postgresql.version} + added the module. (2) deploy-prod.ps1 had DB_PASSWORD/APP_JWT_SECRET/JWT_SECRET hardcoded in plaintext, committed to origin/main since 2026-05-19; rewritten to pull all secrets from Secret Manager and use --env-vars-file for the comma-containing CORS_ALLOWED_ORIGINS value instead of a fragile semicolon-separated workaround. ✅ Verified: flyway:repair ran successfully against production Neon DB; freightclub-backend/freightclub-frontend redeployed cleanly with the fixed script. Credential rotation for the previously-exposed secrets tracked separately by user. ✅ 2026-07-19: login on custom domain `mdbfreightclub.com` was 403ing with "Invalid CORS request" — domain was missing from `CORS_ALLOWED_ORIGINS` in deploy-prod.ps1 (only freightclub.app + *.run.app URLs were listed). Added `https://mdbfreightclub.com`, redeployed freightclub-backend, verified login succeeds end-to-end with zero console errors. Also found local-only `.cloudrun-env.yaml` (gitignored, unreferenced by any script) still carrying the plaintext DB_PASSWORD/APP_JWT_SECRET/JWT_SECRET/DB_URL this story's original fix removed from deploy-prod.ps1 — stripped those from the local file too (live Cloud Run revision confirmed already sourcing them from Secret Manager). PR #48. | Jira: FREIG-115 |
| US-852 | Plan-First Mandate (CODER gate + CLAUDE.md + hook) | DONE | Cross | — | ✅ Direct process fix requested after the FREIG-115 postmortem — added a "Pre-Implementation Plan Gate" to CODER.md (existing-tooling check, current-state verification, prefer vendor tools, verification plan stated up front) plus a matching Plan-First Mandate in CLAUDE.md's Coder Invocation Rule. ✅ Also added a mechanically-verified PreToolUse hook (`.claude/hooks/check-deploy-script-duplication.sh`) blocking creation of a new deploy*.ps1/.sh when one already exists at that path — pipe-tested (deny/allow/allow) and prove-fired via a real blocked Write call. Hooks can't see conversation history, so planning-process enforcement lives in CLAUDE.md/CODER.md text (read every session); the hook covers only the mechanically-checkable slice (duplicate file on disk). | Jira: — |
| US-853 | /wrap-up: Reviewer + Testing Standards updates from FREIG-114/115 session | DONE | Cross | — | ✅ Session retrospective — added a REVIEWER checklist gate (Console/Network Error Guard: golden-path E2E specs must assert zero failed static-asset requests + zero console errors post-auth, citing FREIG-114) and a "Known Limitation" note in testing_standards.md (Docker test env runs Vite dev server, not nginx-served prod build, so it structurally cannot catch font/asset-loading bugs that only manifest under real static serving — verify via `npm run build` + `vite preview` for that class of change). | Jira: — |
| US-854 | Per-Load Diesel Fuel Cost Resolution | COMPLETED | Cross | — | ✅ BA Gate 1 approved 2026-07-13. ✅ ARCH design (`docs/architecture/US-854_Diesel_Cost_Resolution_Design.md`) — no migration, new `StateToEiaRegionResolver` (real EIA PADD state map) + `DieselPriceResolution` + `resolveDieselPriceForLoad`/`calculateMinimumRPM(truckerId, originState)` overloads. ✅ HFD design (`docs/hfd/US-854_Design_Spec.md`) — non-interactive caption on `LoadBoardTable.tsx`, Phase 4 device test explicitly WAIVED by user 2026-07-14. ✅ CODER complete: `LoadService.listOpenLoads` refactored from a once-per-page threshold to per-load resolution; `LoadSummaryResponse` gains `regionUsed`/`asOfPeriod`/`isFallback`; frontend caption with all 5 EIA region labels + fallback + omitted states. Coverage: StateToEiaRegionResolver 100%, CarrierCostProfileService 82.1%, LoadSummaryResponse 80%, LoadService 80.6% branch (all ≥80% gate). ✅ REVIEWER pass 2026-07-14 found and CODER fixed a config-wiring bug (`docker-compose.test.yml`/`application.yml` never bound `EIA_API_KEY`/`EIA_ENABLED`, so mocked tests were green while the live feature returned `available:false` everywhere) and a missing Playwright golden-path spec + evidence (the earlier "blocked by datetime-local" framing was a false blocker specific to the browser-use MCP manual tool, not real Playwright). Added `frontend/e2e/design-system/US-854-diesel-region-caption.spec.ts` (2/2 passing, CI-environment-aware since GH Actions has no EIA key configured, same documented constraint as `us-730a-v2-cost-profile-wizard.spec.ts`) covering AC-1 (region override), AC-2 (as-of date), AC-3 (fallback indicator), seeded through the real backend API. Evidence: `test-results/evidence/US-854-diesel-region-caption.png`, `US-854-fallback-indicator.png`. Tests: 902/902 backend, 291/291 + 4 new frontend unit, 106/106 E2E (0 regressions), clean `tsc --noEmit`. **✅ REVIEWER PASS 2026-07-14** — all hard gates satisfied, all 9 GH Actions CI checks green on PR #37. **✅ LIBRARIAN sign-off 2026-07-14** — see `docs/project/LIBRARIAN_SIGN_OFF_US854.md`. Jira FREIG-116 transitioned to Done. PR #37 not yet merged to main — pending explicit merge authorization. | Jira: FREIG-116 |
| US-855 | Marketing Home Page & In-Page Login Modal | DONE | Cross | — | ⚠️ Backfilled: implemented directly from user request + pre-existing design handoff (`Prototype/design_handoff_home_page/`), bypassing normal BA Gate 1/HFD workflow — story doc and Jira ticket created retroactively (see `docs/business/stories/US-855_Marketing_Home_Page_And_Login_Modal.md`). ✅ New `HomePage.tsx` (hero, feature cards, how-it-works, persona split, comparison table, footer) reusing existing `Button`/`Input`/persona tokens; `LoginModal.tsx` wraps the existing `LoginForm`/`useLogin` unchanged. ✅ `TruckerLandingPage` relocated from `/` to protected `/carrier/tools`. ✅ Standalone `/login` route/page retired — `ProtectedRoute` + all sign-out paths now redirect to `/` and auto-open the modal via router state. ✅ Deleted unused `login-app` Vite micro-app (never wired into nginx/deployment). ✅ Sign-out now also calls `queryClient.clear()` (prevents stale cached data leaking between users on a shared device); `ShipperPageHeader`'s duplicate logout handler consolidated onto the shared `useLogout` hook. ✅ `tsc --noEmit`/ESLint clean, unit suite 48 files/290 tests passing, full Docker Pre-Test Protocol run with 22/22 E2E passing (`home-page.spec.ts` new, `login-integration.spec.ts`/`smoke.spec.ts` migrated off the removed `/login` route), production build + live browser check against prototype screenshots. PR #45. | ✅ CHG-858 RESOLVED (2026-07-22): re-verification against resent `handoff/` package (confirmed identical design, no new delta) found and fixed 2 fidelity gaps — dead footer "Contact Us" link, missing login-modal dialog a11y (role/aria-modal/aria-labelledby/ESC/focus). TDD throughout, full Pre-Test Protocol green (294 unit + 24 E2E + 940 backend), PR #66 merged, deployed to production and live-verified (`freightclub-frontend-00054-qsk`). See `docs/changes/CHG-858.md`. | Jira: FREIG-117 |
| US-856 | Lane Tags on Carrier Search Cards | IN_PROGRESS | Cross | US-848 | ⚠️ Renumbered 2026-07-19 from a colliding US-851 — this ticket (Jira FREIG-105) was created 2026-07-04 as part of the Carrier Network Epic backlog but never cataloged in Story_Map.md at the time, so the ID US-851 was independently reused a week later for "Production Deploy Infrastructure Fixes" (now DONE, shipped under that ID across multiple merged PRs). Renumbering this still-unimplemented backlog item to US-856 was the lower-disruption fix. ✅ Story doc: `docs/business/stories/US-856_Lane_Tags_On_Carrier_Cards.md`. ✅ ARCH design: `docs/architecture/US-856_Lane_Tags_Design.md`. ✅ AC-1 (backend) CODER complete: `CarrierLaneSearchResult` gains a `lanes` field, batch-loaded via new `CarrierLaneRepository.findByTenantIdAndTruckerIdInAndDeletedAtIsNull` (avoids N+1), reusing the existing `CarrierLaneDTO`/`CarrierMapper.toLaneDto` already used by the detail panel. TDD: 3 new `CarrierSearchServiceTest` cases, 14/14 passing. ✅ **REVIEWER PASS 2026-07-19** (see `docs/project/LIBRARIAN_SIGN_OFF_US856.md`) — full Docker integration suite 924/924 backend tests green twice (pre-merge + post-merge re-verification), `gh pr checks 52` all GH Actions green (Backend Build&Test, E2E Playwright, Frontend Lint/Test/Build, check-story-files), RLS confirmed pre-existing on `carrier_lanes`, no Sequential Lock violations, complexity/quality clean. PR #52 merged to `main`. ⚠️ Found during review: `docker-compose.test.yml`'s `backend-tester` runs `mvn clean test`, not `mvn verify` — the JaCoCo `check` goal (80% branch-coverage hard gate) never actually executes in the standard Pre-Test Protocol run; logged as OPEN technical debt in `.claude/learnings.md` (not blocking for this PR, no evidenced regression). ⏳ AC-2–AC-5 (frontend card rendering) not started — story remains IN_PROGRESS. | Jira: FREIG-105 |
| US-859 | Process fixes: LIBRARIAN PR-verification + targeted-vs-full test-run guidance | DONE | Cross | — | Renumbered from a collision with the unrelated US-857 (Narrow Login-Flow RLS Bypass) — both stories independently picked the same ID; this one was created and merged later, on 2026-07-22. ✅ Session self-audit (2026-07-20) requested by user found: (1) a US-856 LIBRARIAN sign-off asserted PR #53 was merged when it was still OPEN — added a mandatory `gh pr view --json state,mergedAt` verification step to `LIBRARIAN.md` before any sign-off/Sprint_Log/Story_Map entry can claim a merge; (2) the US-820 KPI-fix session ran the full Docker Pre-Test Protocol 3 times in a row where one targeted `-Dtest=X` run + one final full run would have sufficed — added explicit guidance to `.claude/rules/testing_standards.md` on when to use each, plus a grep-first log-inspection pattern to avoid tailing raw Maven dependency-download noise. | Jira: — |
| US-860 | Home Page CTA Simplification & In-Page Signup Modal | COMPLETED | Cross | US-855 | BA Gate 1 approved in chat 2026-07-22 (see `docs/business/stories/US-860_Home_Page_CTA_Simplification_And_Signup_Modal.md`). ✅ Removed header "Get Started Free"/"Get Started" CTAs (desktop+mobile) + persona-split "Find Loads"/"Post a Load" CTAs. ✅ New `SignupModal.tsx` (mirrors `LoginModal.tsx`'s a11y: role/aria-modal/aria-labelledby/ESC/focus) wraps existing `RegisterForm`, no backend changes. ✅ Hero/final-CTA "Get Started Free" buttons now open Signup instead of Login. ✅ Login/Signup modals switch to each other in place via new optional `onSwitchToRegister`/`onSwitchToLogin` props on `LoginForm`/`RegisterForm` (standalone `/register` page unaffected). TDD throughout (RED confirmed before each fix): 51 files/309 unit tests passing (+15 new), full Docker Pre-Test Protocol E2E 45/45 (fixed 2 pre-existing mobile-viewport specs whose login helper relied on the removed mobile CTA), backend regression 940/940 unchanged. PR #68 merged, deployed to production and live-verified (`freightclub-frontend-00055-xb8`). | Jira: FREIG-120 |
| US-861 | Notify Carrier on Direct Load Assignment | DONE | Cross | — | Live test run of the `/run-story` skill (not a real backlog item, Jira explicitly skipped — logged deviation, see story file). Root cause: `LoadAssignmentService.assignLoadToCarrier()` carried an unimplemented `TODO: Publish LoadAssignedToCarrier event for notifications` — the one lifecycle transition (of 5) missing the sibling notification pattern present for claim/pickup/deliver/cancel. ✅ New `LoadAssignedToCarrierEvent` record (mirrors existing `LoadClaimedEvent` shape); `LoadAssignmentService` publishes after a tenant-scoped + soft-delete-safe `Load` fetch; `NotificationService.onLoadAssignedToCarrier` added as a 5th `@TransactionalEventListener(phase = AFTER_COMMIT)` sibling. `BACKEND_ONLY`, no schema/endpoint change — Field Contract Table all-N/A, ARCH-signed. ✅ TDD: LoadAssignmentServiceTest 12/12, NotificationServiceTest$NotifyLoadAssignedToCarrier 2/2, full-class 35/35, BUILD SUCCESS. ✅ REVIEWER PASS (fresh-context agent) — Sequential Lock, AC-2 AFTER_COMMIT pattern, multi-tenancy, complexity all clean. ✅ **LIBRARIAN sign-off 2026-07-24** — see `docs/project/LIBRARIAN_SIGN_OFF_US-861.md`; PR #80 independently confirmed `state: MERGED`, all 9 CI checks green. ⚠️ Branch rebased mid-review onto `main` to pick up PR #81/#82 (unrelated pre-existing E2E CI-infra fixes) to unblock a red check — those PRs are their own already-merged units, not part of this story's traceability. Two process gaps found+fixed mid-run (branch discipline, BA/ARCH artifact backfill) now encoded in `.claude/skills/run-story/SKILL.md`. | Jira: — (explicitly skipped, logged deviation) |
| US-862 | Carrier Trust & Compliance Signals (MC/DOT, Insurance, Safety Rating) | MIGRATION_PENDING | Cross | US-848 | Cataloged from CHG-863 (`docs/changes/CHG-863.md`) — trust-signal gap surfaced by a `/council-review` 48-hour research test against the shipped US-848 story doc. Story doc: `docs/business/stories/US-862_Carrier_Trust_Compliance_Signals.md`. ⚠️ **BLOCKED:** no backend FMCSA SAFER / insurance-verification data source exists yet — cannot enter ARCHITECT until that backend integration is scoped as its own story. | Jira: FREIG-121 |
| US-863 | Carrier Performance Metrics on Network Page | MIGRATION_PENDING | Cross | US-848 | Recovered 2026-07-25 (CHG-864) from the orphaned `feature/US-849-carrier-network-epic` branch — drafted 2026-07-04 as US-849, never merged, renumbered on recovery because the original ID was independently reused for the (now DONE) Access Token Refresh Interceptor story. Story doc: `docs/business/stories/US-863_Carrier_Performance_Metrics.md`. | Jira: FREIG-122 |
| US-864 | Functional Carrier Results Sorting | MIGRATION_PENDING | Cross | US-863, US-848 | Recovered 2026-07-25 (CHG-864) from the orphaned `feature/US-849-carrier-network-epic` branch — drafted 2026-07-04 as US-850, never merged, renumbered on recovery because the original ID was independently reused for the (now DONE) Custom Font Loading fix. Story doc: `docs/business/stories/US-864_Functional_Carrier_Results_Sorting.md`. | Jira: FREIG-123 |
| US-865 | Recent Carrier Reviews in Detail Panel | MIGRATION_PENDING | Cross | US-848, US-863 | Recovered 2026-07-25 (CHG-864) from the orphaned `feature/US-849-carrier-network-epic` branch — drafted 2026-07-04 as US-852, never merged, renumbered on recovery because the original ID was independently reused for the (now DONE) Plan-First Mandate process fix. Story doc: `docs/business/stories/US-865_Carrier_Reviews_In_Detail_Panel.md`. | Jira: FREIG-124 |
| US-827 | Real Quote Request Workflow | MIGRATION_PENDING | Cross | US-848 | Recovered 2026-07-25 (CHG-864) from the orphaned `feature/US-849-carrier-network-epic` branch — drafted 2026-07-04, never merged; ID unchanged (still live-referenced in `frontend/src/App.tsx`'s `QuoteRequestPlaceholder` TODO, pre-reserved since CHG-001/US-824). ⚠️ Needs ARCHITECT discovery pass before further breakdown — largest/least-defined item in this epic. Story doc: `docs/business/stories/US-827_Real_Quote_Request_Workflow.md`. | Jira: FREIG-125 |
| US-868 | Code-Split Auth Module from Dashboard Bundle | READY_FOR_DESIGN | Cross | — | Recovered 2026-09-01 (CHG-868 systematic audit) — renumbered from old US-751 (Jira FREIG-47), which collided with this table's unrelated Phase 9 "Dispute Resolution Tools (Admin)" row. Never implemented, not started. Story doc: `docs/business/stories/US-868_Code_Split_Auth_Module.md`. | Jira: FREIG-128 |
| US-869 | Lazy-Load Font Subsets After Authentication | READY_FOR_DESIGN | Cross | — | Recovered 2026-09-01 (CHG-868) — renumbered from old US-752 (Jira FREIG-48), which collided with this table's unrelated Phase 9 "Platform Health Metrics (Real-Time)" row. Never implemented, not started. Story doc: `docs/business/stories/US-869_Lazy_Load_Font_Subsets.md`. | Jira: FREIG-129 |
| US-870 | Replace Zod Validation with Lightweight Regex for Login | READY_FOR_DESIGN | Cross | — | Recovered 2026-09-01 (CHG-868) — renumbered from old US-753 (Jira FREIG-49), which collided with this table's unrelated Phase 9 "Rate Benchmarking Tool (Shipper)" row. Never implemented, not started. Story doc: `docs/business/stories/US-870_Replace_Zod_Validation.md`. | Jira: FREIG-130 |
| US-871 | Replace React Query for Static Dashboard Queries | READY_FOR_DESIGN | Cross | — | Recovered 2026-09-01 (CHG-868) — renumbered from old US-755 (Jira FREIG-51), which collided with this table's unrelated Phase 9 "ELD Integration for HOS Tracking" row. Never implemented, not started. Story doc: `docs/business/stories/US-871_Replace_React_Query_Static_Queries.md`. | Jira: FREIG-131 |
| US-872 | Optimize Login Page Hydration to <100ms | READY_FOR_DESIGN | Cross | — | Recovered 2026-09-01 (CHG-868) — renumbered from old US-756 (Jira FREIG-52), which collided with this table's unrelated Phase 9 "Document Upload (Insurance, CDL, Medical)" row. ⚠️ Story doc flags a likely scope conflict with the already-shipped US-855 login-modal consolidation (which explicitly deleted a standalone login-app micro-app this story's "separate login app" strategy would recreate) — BA must re-verify before design. Story doc: `docs/business/stories/US-872_Optimize_Login_Page_Hydration.md`. | Jira: FREIG-132 |
| US-873 | Trucker Cost Per Mile Calculator (Granular Cost Tracking) | BACKLOG | Cross | — | Recovered 2026-09-01 (CHG-868) — renumbered from old US-757 (Jira FREIG-53), which collided with this table's unrelated Phase 9 "Freight Insurance Integration (Per-Load)" row. ⚠️ Original file self-reported `✅ DONE` with 85% coverage, but had zero Story_Map presence under any ID and unchecked "deployed"/"LIBRARIAN sign-off" DoD items — status is unverified, and may duplicate already-`COMPLETED` US-730a (Cost Profile Setup API & UI, live RPM calculation via `CarrierCostProfile`). BA must verify against current codebase before further action. Story doc: `docs/business/stories/US-873_Trucker_CPM_Calculator.md`. | Jira: FREIG-133 |
| US-867 | Carrier Mobile Static Asset CDN Caching | BACKLOG | Cross | — | Surfaced via `/council-review` (2026-09-01) on "should the frontend use a CDN" — verdict RESHAPE: free Cloudflare proxy in front of existing Cloud Run origin for static assets only (JS/CSS/fonts), `/api/*` explicitly excluded, no GCP Load Balancer/Cloud Storage re-architecture. Renumbered from FREIG-50/old US-754 (CHG-867) — that ID collided with this table's unrelated US-754 row below and its design assumed a load balancer that doesn't exist. Story doc: `docs/business/stories/US-867_Carrier_Mobile_Static_Asset_CDN_Caching.md`. ⚠️ Flagged, not fixed: the same collision pattern likely exists across US-751–757 (Phase 9 below) — needs its own audit before any work is assigned to those IDs. | Jira: FREIG-127 |
| US-866 | Breached-Password Screening on Registration | COMPLETED | Cross | — | Surfaced via `/council-review` (2026-08-27) on a proposed password-strength meter + composition rules. Council converged (citing NIST SP 800-63B-4) that composition rules are a prohibited anti-pattern and breach-corpus screening is the actual SHALL-level control; minimum length increase was separately evaluated and rejected on carrier mobile-typing-burden grounds. ⚠️ **CHG-866:** narrowed from registration+password-change to registration-only — no password-change flow exists anywhere in the backend. ✅ SHIPPED (verified via full Docker Pre-Test Protocol, backend suite 0 failures/errors on two consecutive full runs): `PasswordBreachChecker`/`HibpPasswordBreachChecker` (HIBP k-anonymity), wired into `AuthService.register()` as a fail-fast boundary check; `PasswordBreachedException` → 400. AC-5 real-call evidence: live HIBP query from inside Docker confirmed `Password1!` present 584,516 times in the breach corpus — this also genuinely broke `AuthIntegrationTest` (which used that exact password as its fixture) until a config-shadowing bug was found and fixed (`src/test/resources/application-test.yml` shadows `src/main/resources/application-test.yml` on the `@SpringBootTest` classpath — the latter's `app.hibp.enabled: false` override was never taking effect). Also fixed an unrelated pre-existing bug found along the way: `EIA_ENABLED` was bound under the wrong YAML key in `application.yml` (nested under `login-lookup:` instead of `eia:`), meaning `app.eia.enabled` was never actually set from that file. ✅ Jira backfilled 2026-08-27 after subscription reactivation. Story doc: `docs/business/stories/US-866_Breached_Password_Screening.md`. ARCH design: `docs/architecture/US-866_Breached_Password_Screening_Design.md`. | Jira: FREIG-126 |

---

## Phase 1: Core Load Lifecycle (5 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-101 | Multi-Tenant Registration              | COMPLETED   | 1     | — | ✅ RLS, ✅ No-Lombok |
| US-102 | Tenant Context & JWT                   | COMPLETED   | 1     | US-101 | ✅ RLS, ✅ No-Lombok |
| US-103 | Load CRUD (Create, Edit, Cancel, Publish) | COMPLETED | 1 | US-101 | ✅ RLS, ✅ No-Lombok |
| US-104 | Load Board & Claiming Workflow         | COMPLETED   | 1     | US-103 | ✅ RLS, ✅ No-Lombok, ✅ Pessimistic Locking |
| US-105 | Load Status Transitions (Pick Up & Delivery) | ✅ COMPLETED | 1 | US-104, US-305 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 |

---

## Phase 1.1: UX Hardening (implicit in Phase 1 stories)

**Status:** ✅ Complete; 18 hardening items → permanent architectural standards

---

## Phase 1.2: Security & Stability Hardening (implicit in Phase 1 stories)

**Status:** ✅ Complete; 12 security items → permanent architectural standards

---

## Phase 2: Notifications & EIA Integration (3 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-201 | Email Notifications (Claim/Pickup/Delivery/Cancel) | COMPLETED | 2 | US-103 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (1m TTL) |
| US-202 | In-App Notification Bell & Read Status | COMPLETED | 2 | US-201 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (30s TTL) |
| US-203 | EIA Diesel Pricing API (6-hr Cache Template) | COMPLETED | 2 | US-101 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (6h TTL) |

---

## Phase 3: Document Management (5 stories)

| ID     | Title                                | Status                | Phase | Depends On | Guardrails                             |
| :----- | :----------------------------------- | :-------------------- | :---- | :--------- | :------------------------------------- |
| US-301 | S3 File Storage & Signed Upload URLs | COMPLETED             | 3     | US-101     | ✅ RLS, ✅ No-Lombok                     |
| US-302 | Platform-Generated BOL               | COMPLETED             | 3     | US-301     | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
| US-303 | BOL/POD Photo Upload & Viewing       | COMPLETED             | 3     | US-301     | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
| US-302-v2 | BOL Pickup Attestation (Carrier Confirm+Lock) | COMPLETED | 3  | US-302, US-303 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
| US-305 | POD Upload UI Completion             | COMPLETED             | 3     | US-301     | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
| US-308 | **Document Audit Log Service**       | **COMPLETED**         | **3** | **US-303** | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
|        |                                      |                       |       |            |                                        |

---

## Phase 4: Ratings & Reviews (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-401 | Bidirectional Rating System            | ✅ COMPLETED | 4     | US-103 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (1h TTL), Commit 7663b11 |
| US-402 | Shipper Reputation Profile & Aggregation | ✅ COMPLETED | 4 | US-401 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (2h TTL), Commit 7663b11 |
| US-403 | Rating History & Timeline             | ✅ COMPLETED | 4     | US-401 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (30m TTL), Commit 7663b11 |
| US-405 | **Shipper Reputation Badge on Load Board** | **✅ COMPLETED** | **4** | **US-402** | **✅ NFR-504 (2h TTL), Commit 7663b11** |

---

## Phase 5: Payments & Invoicing (7 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-501 | **Auto Invoice Generation**            | **MIGRATION_PENDING** | **5** | **US-402** | **⚠️ BLOCKER: Payment processor** |
| US-502 | **Payment Processing (Stripe/ACH)**   | **IN_PROGRESS** | **5** | **US-501** | **✅ Stripe Connect (Commit 7ed7cf7), platform fee + trucker transfer** |
| US-503 | **Bank Account Setup & Verification** | **MIGRATION_PENDING** | **5** | **US-502** | **⚠️ BLOCKER: Payment processor** |
| US-504 | **Payment History & Ledger**          | **MIGRATION_PENDING** | **5** | **US-502** | **NFR-504 (30m TTL)** |
| US-505 | **Receipt Generation & Export**       | **MIGRATION_PENDING** | **5** | **US-502** | **NFR-504 (24h TTL)** |
| US-506 | **SETTLED Load Status & Workflow**    | **COMPLETED** | **5** | **US-502** | **✅ RLS, ✅ No-Lombok, ✅ settle+dispute endpoints, ✅ shipper UI** |
| US-507 | **Payment Dispute Flow & Resolution** | **MIGRATION_PENDING** | **5** | **US-502** | **NFR-504 (15m TTL)** |

---

## Phase 6: In-App Messaging (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-601 | **Per-Load Message Threads**          | **MIGRATION_PENDING** | **6** | **US-101** | **⚠️ BLOCKER: Message broker** |
| US-602 | **Real-Time Messaging (WebSocket/SSE)** | **MIGRATION_PENDING** | **6** | **US-601** | **⚠️ BLOCKER: Message broker** |
| US-603 | **Unread Message Badge**              | **MIGRATION_PENDING** | **6** | **US-601** | **NFR-504 (10s TTL)** |
| US-604 | **Message Notifications**             | **MIGRATION_PENDING** | **6** | **US-601** | **NFR-504 (1m TTL)** |

---

## Phase 7a: Carrier Dashboard MVP (US-730 Epic) — NEW

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------ | :---------- | :---- | :--------- | :--------- |
| **US-730** | **EPIC: Carrier Dashboard MVP — Operations Platform (Mobile-First)** | **COMPLETED** | **7a** | **—** | **✅ Discovered 2026-07-04: pre-existing implementation at /dashboard/trucker via TruckerDashboard.tsx | ✅ Mobile-first, dark theme, ≥48px buttons all present | Jira: FREIG-62** |
| US-730-0 | Dashboard Structure & Mobile Design Spec | COMPLETED | 7a | — | ✅ Matches locked spec via TruckerDashboard.tsx; CarrierDashboard.tsx mock retired (CHG-849) | Jira: FREIG-63 |
| US-730a | Cost Profile Setup API & UI | COMPLETED | 7a | US-730-0 | ✅ Via ProfileHub CostProfileSection; RPM calculation verified live (CHG-849); persistence bug status confirmed | Jira: FREIG-64 |
| US-730b | Profitable Load Visibility & Filtering | COMPLETED | 7a | US-730a | ✅ Via ProfitabilityCard + LoadBoardTab; Live on TruckerLoadDetailPage and load board | Jira: FREIG-65 |
| US-730c | Performance Visibility Dashboard Metrics | COMPLETED | 7a | — | ✅ Via TruckerDashboard MyStatsTab; On-time %, avg RPM, loads completed, miles driven — all real | Jira: FREIG-66 |
| US-730d | Unified Carrier Dashboard | COMPLETED | 7a | US-730-0, US-730a-c | ✅ Via TruckerDashboard.tsx; Hero load + stats + board, hook-driven | Jira: FREIG-67 |
| US-730e | Equipment & Lane Management | COMPLETED | 7a | — | ✅ Via CarrierProfileHub EquipmentTab/LanesTab; Equipment types, lanes, availability tab all present | Jira: FREIG-68 |
| **US-730f** | **Payment Acknowledgment (MVP)** | **COMPLETED** | **7a** | **US-730d** | **✅ Read-only payment status endpoint + frontend display shipped (feature/US-730-carrier-workflow-verification, 2026-07-05) | ✅ Backend invoice/Stripe system already existed (Phase 9 work was further along than documented) | Scope narrowed to read-only surfacing (CHG-849) | Jira: FREIG-69** |
| US-730a-v2 | Cost Profile Wizard Redesign (dedicated `/carrier/cost-profile` screen, summary + 3-step wizard) | COMPLETED | 7a | US-730a | CHG-US730-007 — supersedes US-730a's inline `ProfilePage` section; ARCH+HFD locked 2026-07-06: `docs/architecture/ARCH_US-730a-v2_Cost_Profile_Wizard_Design.md`, `docs/hfd/US-730a-v2_Cost_Profile_Wizard_Design_Spec.md`. ✅ Prototype fidelity audit + shared Input/ErrorBanner persona-aware fix + wizard validation fix, all verified live. ✅ REVIEWER PASS 2026-07-08 (2 items logged as pre-existing debt, not blocking — see `.claude/learnings.md`). | Jira: FREIG-111 |
| US-730h | Carrier Identity & Credentials Profile (dedicated `/carrier/profile` screen: identity, single equipment type, DOT/MC/CDL/insurance/med-card expiry tracking, ≤3 preferred lanes) | COMPLETED | 7a | US-730e | CHG-US730-008 — supersedes US-730e's Equipment/Lanes tabs UI only. ARCH+HFD locked 2026-07-08: `docs/architecture/ARCH_US-730h_Carrier_Identity_Credentials_Profile_Design.md`, `docs/hfd/US-730h_Carrier_Identity_Credentials_Profile_Design_Spec.md`. ARCH Platform Reuse Check found this is additive-only on `users` + reuse of existing `/profile` and `/profile/lanes` endpoints — no new table/controller needed, smaller than originally scoped. Renamed from US-730g (2026-07-06) to resolve ID collision with existing Phase 7b US-730g (Per-Load Earnings Log). ✅ 9-task subagent-driven-development complete, whole-branch review (opus) + 1 fix cycle (touch-target width check caught a real recurrence of CHG-US730-001), CI fully green. ✅ REVIEWER PASS 2026-07-08. PR: #27 | Jira: FREIG-112 |

---

## Phase 7: Carrier Management & Shipper MVP (12 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-701 | Carrier Profiles (Truck/Trailer/Capacity) | ✅ COMPLETED | 7 | US-101 | ✅ NFR-504 (1h TTL), ✅ RLS, ✅ No-Lombok |
| US-702 | Trucker Preferred Lanes (Region-Based) | ✅ COMPLETED | 7 | US-701 | ✅ NFR-504 (1h TTL), ✅ RLS, ✅ No-Lombok |
| US-703 | Trucker Availability (Days/Hours)    | ✅ COMPLETED | 7 | US-701 | ✅ NFR-504 (5m TTL), ✅ RLS, ✅ No-Lombok |
| US-705 | Load Board Filters (Weight, Min Pay) | PARTIAL | 7 | US-701 | ✅ NFR-504 (5m TTL) |
| US-706 | Load Posting Validation Prompts (Shipper) | PARTIAL | 7 | US-101 | ✅ No NFR-504 (form only) |
| US-704 | Load Board Analytics & Insights | READY_FOR_DESIGN | 7b | US-702 | Row added 2026-09-01 (CHG-868 systematic audit) — story file and Jira ticket (FREIG-32) have existed since 2026-04-27 but this ID was never given a Story_Map row at all (not a collision — just uncataloged). Story doc: `docs/business/stories/US-704.md`. | Jira: FREIG-32 |
| US-707 | **Shipper Preferred Carrier List** | **✅ COMPLETED** | **7** | **US-101** | **✅ Backend: 7 tests PASS | ✅ E2E: 4/4 PASS | ✅ CHG-001 resolved via US-707-v2** |
| US-707-v2 | **Preferred Carriers: Nav + Search Redesign** | **✅ COMPLETED** | **7** | **US-707** | **✅ AppShell wrapper | ✅ GET /api/v1/carriers/search | ✅ 8 backend tests PASS | ✅ Browser verified: search, select, add, list with name+email (2026-06-05)** |
| US-708 | Direct Load Assignment to Carrier    | MIGRATION_PENDING | 7 | US-707 | ✅ Event-driven invalidation |
| US-709 | Block Carrier (Prevent Visibility)   | MIGRATION_PENDING | 7 | US-101 | ✅ Event-driven invalidation |
| US-710 | **View Carrier Public Profile** | **✅ COMPLETED** | **7** | **US-402** | **✅ Backend: 100% branch coverage, 8 tests PASS | ✅ E2E: 6/6 PASS (2026-06-04)** |
| US-711 | Load Interest / View Count Tracking  | MIGRATION_PENDING | 7 | US-101 | ✅ NFR-504 (5m TTL) |
| US-713 | Shipper Company Profile Setup (Post-Registration) | ✅ COMPLETED | 7 | US-101 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
| US-715 | **Shipper Dashboard (Load Summary & Management)** | **✅ COMPLETED** | **7** | **US-101, US-103** | **✅ RLS, ✅ No-Lombok, ✅ NFR-504 (2m TTL)** |
| US-714 | Trucker Onboarding Checklist (Pre-Claim Gate) | READY_FOR_DESIGN | 7 | US-101, US-701 | ✅ RLS, ✅ No-Lombok |
| US-712 | View Shipper Public Profile (Payment Speed, Rating) | MIGRATION_PENDING | 7b | US-102, US-502 | ✅ NFR-504 (1h TTL), ✅ Avg Payment Speed calc (90-day) |
| US-760 | Shipper Dashboard Home (KPI Tiles, Quick Actions, Carrier Search Panel, Status Feed) | **READY FOR REVIEWER RE-AUDIT** | 7 | US-761, US-762, US-715, US-707-v2 | ✅ HFE REWORK COMPLETE 2026-06-08 — All 8 Visual Integrity Gate corrections applied: (1) KPI `text-4xl font-black` + `UPPERCASE tracking-widest` labels, (2) lucide-react icons on all QAP buttons, (3) right-zone QAP duplication (Persistent Redundancy Framework), (4) Shipment Status progress bars (metallic bronze fill), (5) `gap-3`/`p-4` density, (6) `shadow-md` panel depth, (7) circular initials badge with `border-2 border-shipper-accent` ring in nav, (8) `dashboard/shipper` is now the canonical post-login route. E2E: **3 passed (7.8s)**. Evidence: `test-results/evidence/us-761-ac1-kpi-tiles.png`, `us-762-ac1-carrier-lane-search.png`. |
| US-761 | Dashboard Summary Aggregate Endpoint (Est. Cost/Mile, On-Time Carrier %) | COMPLETED | 7 | US-715 | ⚠️ RETIRED 2026-07-20: never got out of "READY FOR REVIEWER RE-AUDIT" limbo and its `DashboardSummaryService`/`/shipper/dashboard-summary`/`useDashboardSummary` never got wired into any live UI — confirmed via `grep` that the frontend hook had zero imports anywhere. Phase 10's US-820 independently rebuilt the identical capability (activeShipments/onTimeCarrierPct/estimatedCostPerMile) as `KPISummaryService`/`/shipper/dashboard/kpi-summary`, which IS what `ShipperDashboardPage.tsx` actually renders — a Platform Reuse Check gap (see ARCHITECT.md fix). Deleted the dead code entirely (`DashboardSummaryService.java`, `DashboardSummaryResponse.java`, `DashboardSummaryServiceTest.java`, `useDashboardSummary.ts`, the `/shipper/dashboard-summary` endpoint + its `ShipperControllerTest` cases) rather than leave it as unreachable debt. Superseded by US-820. |
| US-762 | Carrier Search Lane Extension (origin/destination/equipmentType params) | **READY FOR REVIEWER RE-AUDIT** | 7 | US-707-v2 | ✅ Backend GREEN — unchanged. Unblocked by US-760 visual compliance restore. |

---

## Phase 7A: DOT Compliance & Documentation (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-720 | USDOT & DOT Registration Verification | MIGRATION_PENDING | 7A | US-701 | ✅ RLS, ✅ No-Lombok |
| US-721 | Insurance Certificate Tracking       | MIGRATION_PENDING | 7A | US-701, US-303 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (2h TTL) |
| US-722 | CDL & Medical Card Documentation    | MIGRATION_PENDING | 7A | US-701 | ✅ RLS, ✅ No-Lombok |
| US-723 | Equipment Condition Monitoring       | MIGRATION_PENDING | 7A | US-701 | ✅ RLS, ✅ No-Lombok |

---

## Phase 7b: Financial Intelligence (8 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-730g | Per-Load Earnings Log (Miles, Fuel, Profit) | MIGRATION_PENDING | 7b | US-305, US-502 | ✅ NFR-504 (1h TTL), ✅ US-305 ready (POD UI complete) | Renumbered from US-730 (2026-07-04, CHG-849) to resolve ID collision with the Phase 7a epic. ⚠️ 2026-09-01 (CHG-868): the old `docs/business/stories/US-730_EarningsLog.md` file itself was never annotated with this renumbering until now — fixed, no other action needed. Separately, a second stale draft, `docs/business/stories/US-730_Trucker_Dashboard_Redesign.md` (never cataloged, no Jira entry), has also been marked superseded by the shipped Phase 7a epic + US-730a–h. |
| US-731 | Weekly/Monthly P&L Report            | MIGRATION_PENDING | 7b | US-730g | ✅ NFR-504 (6h TTL) |
| US-732 | **IFTA Mileage Tracking by State**   | **MIGRATION_PENDING** | **7b** | **US-730g** | **✅ US-305 ready (POD signature data available)** |
| US-733 | Deadhead Mileage Estimation         | MIGRATION_PENDING | 7b | US-730g | ✅ NFR-504 (1h TTL) |
| US-734 | Deadhead Cost in Profitability      | MIGRATION_PENDING | 7b | US-733 | ✅ NFR-504 (1h TTL) |
| US-735 | Fuel Surcharge Auto-Calculation     | MIGRATION_PENDING | 7b | US-730g, US-203 | ✅ NFR-504 (30m TTL) |
| US-736 | Annual Earnings & Tax Summary Export | MIGRATION_PENDING | 7b | US-730g, US-732 | ✅ NFR-504 (1h TTL) |
| US-737 | Extract trucker_cost_profiles (Data Migration) | MIGRATION_PENDING | 7b | US-730g | ✅ One-time migration |

---

## Phase 8: Bidding & Advanced Matching (5 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-740 | Post Load as Open-to-Bids vs FCFS   | MIGRATION_PENDING | 8 | US-402, US-701 | ✅ NFR-504 (2m TTL) |
| US-741 | Trucker Submits Bid (Rate + Message) | MIGRATION_PENDING | 8 | US-740 | ✅ NFR-504 (1m TTL) |
| US-742 | Shipper Reviews/Accepts/Rejects Bids | MIGRATION_PENDING | 8 | US-741 | ✅ NFR-504 (30s TTL) |
| US-743 | Bid Expiry & Auto-Close (Background Job) | MIGRATION_PENDING | 8 | US-740 | ✅ Event-driven |
| US-744 | Duplicate Load for Recurring Lanes  | MIGRATION_PENDING | 8 | US-101 | ✅ No NFR-504 (form only) |
| US-745 | Freight Class Field (LTL Support)  | MIGRATION_PENDING | 8 | US-101 | ✅ No NFR-504 (schema only) |

---

## Phase 9: Admin & Intelligence Tools (10 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-750 | Super User Dashboard (Users, Loads, Tenants) | DONE | 9 | US-874 | ✅ NFR-504 (5m TTL). Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-750_Super_User_Dashboard.md`. Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-135 |
| US-751 | Dispute Resolution Tools (Super User) | DONE | 9 | US-750, US-874 | ✅ NFR-504 (5m TTL). Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-751_Dispute_Resolution_Tools.md`. (Bare `US-751.md` in `docs/business/stories/` is unrelated historical content, superseded to US-868 — do not confuse the two.) Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-136 |
| US-752 | Platform Health Metrics (Real-Time) | DONE | 9 | US-750, US-874 | ✅ NFR-504 (10s TTL). Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-752_Platform_Health_Metrics.md`. (Bare `US-752.md` is unrelated historical content, superseded to US-869.) Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-137 |
| US-753 | Rate Benchmarking Tool (Shipper)    | MIGRATION_PENDING | 9 | US-502, US-203 | ✅ NFR-504 (1h TTL) |
| US-754 | Carrier Scorecard (Detailed Metrics) | MIGRATION_PENDING | 9 | US-402, US-701 | ✅ NFR-504 (1h TTL) |
| US-755 | ELD Integration for HOS Tracking    | MIGRATION_PENDING | 9 | US-101 | ✅ RLS, ✅ No-Lombok |
| US-756 | Document Upload (Insurance, CDL, Medical) | MIGRATION_PENDING | 9 | US-721, US-722 | ✅ NFR-504 (5m TTL) |
| US-757 | Freight Insurance Integration (Per-Load) | MIGRATION_PENDING | 9 | US-502 | ✅ Event-driven |
| US-758 | TMS API Access (REST for Shippers) | MIGRATION_PENDING | 9 | US-502 | ✅ NFR-504 (API responses cached) |
| US-759 | Recurring Load Scheduling           | MIGRATION_PENDING | 9 | US-101 | ✅ Event-driven on schedule execution |

---

## Phase 9b: Administration Persona (Super User + Tenant Admins) — NEW

BA-scoped 2026-09-01 for the next sprint. Extends Phase 9's Super User stories (US-750–752, updated above) with the tenant-scoped Shipper Admin / Carrier Admin capability, gated on a role-model foundation story. **Tenant-admin is an additive `is_tenant_admin` flag on the existing `SHIPPER`/`TRUCKER` role (revised 2026-09-01 per Director feedback), not a separate role value** — see US-874's Decision Log. Billing/plan management for tenant admins was evaluated and deliberately deferred — it's Tier A (financial) per `BUSINESS_ANALYST.md`'s Autonomous Decision-making Protocol and needs a Director decision before any story is drafted for it.

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-874 | Role Model Foundation (Super User + Tenant Admins) | DONE | 9 | — | ✅ RLS unchanged, ✅ No-Lombok. Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-874_Role_Model_Foundation.md`. Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-134 |
| US-875 | Shipper Admin: Team & Seat Management | DONE | 9 | US-874 | ✅ RLS, ✅ soft-delete on removal. Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-875_Shipper_Admin_Team_Seat_Management.md`. Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-138 |
| US-876 | Shipper Admin: Org Settings & Defaults | DONE | 9 | US-874, US-875 | ✅ RLS. Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-876_Shipper_Admin_Org_Settings.md`. Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-139 |
| US-877 | Carrier Admin: Team & Seat Management | DONE | 9 | US-874 | ✅ RLS, ✅ soft-delete on removal. Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-877_Carrier_Admin_Team_Seat_Management.md`. Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-140 |
| US-878 | Carrier Admin: Org Settings & Defaults | DONE | 9 | US-874, US-877 | ✅ RLS. Shipped 2026-09-02, PR #107 merged (`05c2d438`). Story doc: `docs/business/stories/US-878_Carrier_Admin_Org_Settings.md`. Sign-off: `docs/project/LIBRARIAN_SIGN_OFF_US874.md` | Jira: FREIG-141 |
| US-879 | Tenant Admin Zero-Admin Reconciliation | DONE | 9 | US-874 | ✅ RLS (cross-tenant detection via `freightclub_super_user_read`, promotion via tenant-scoped JPA). P0 — fixed all 13 production tenants left with zero admins after US-874-878 shipped; also fixes `@EnableScheduling` never being registered platform-wide. Council-review verdict (RESHAPE) adopted as design basis. Story doc: `docs/business/stories/US-879_Tenant_Admin_Zero_Admin_Reconciliation.md` | Jira: FREIG-142 |

---

## Phase 9c: Super User Management Capability — NEW

BA-scoped 2026-09-02, resolved via `/council-review` ("Super User feature gaps" session, verdict GO-scoped) after the founder reviewed the shipped US-750 dashboard and found it read-mostly/unable to act on anything. Council converged: real management capability is needed now, scoped narrowly (not a full admin platform) — user suspend/reset/activity-view first, tenant suspend second, impersonation last with the heaviest guardrails, health alerting via webhook not a custom incident UI. Full verdict and per-story rationale in each story doc's Background/Decision Log.

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-880 | Super User Audit Log (Foundation) | DONE | 9 | US-874 | P0 — precondition for US-881/882/884/885; append-only enforced at DB grant level. Shipped 2026-09-02; also fixed a pre-existing missing_ok RLS gap on 5 tables exposed by US-879's @EnableScheduling fix. Story doc: `docs/business/stories/US-880_Super_User_Audit_Log_Foundation.md` | Jira: FREIG-143 |
| US-881 | Super User: Suspend/Reactivate User + Force Password Reset | DONE | 9 | US-874, US-880 | P0 — highest council consensus. New `is_suspended` field, session invalidation. Shipped 2026-09-02; force-password-reset uses a single-use token (not the assumed email flow, which didn't exist — corrected during implementation). Story doc: `docs/business/stories/US-881_Super_User_Suspend_Reactivate_Reset_Password.md` | Jira: FREIG-144 |
| US-882 | Super User: Per-User Activity View | DONE | 9 | US-874, US-880 | P1 — read-only, no new tracking infra. Shipped 2026-09-02; login events proxied via refresh-token issuance timestamps. Story doc: `docs/business/stories/US-882_Super_User_Per_User_Activity_View.md` | Jira: FREIG-145 |
| US-883 | Platform Health Alerting (Webhook) | READY_FOR_DESIGN | 9 | US-752 | P1 — Slack/email webhook, debounced, fail-open. Story doc: `docs/business/stories/US-883_Platform_Health_Alerting.md` | Jira: FREIG-146 |
| US-884 | Super User: Tenant Suspend/Deactivate | READY_FOR_DESIGN | 9 | US-874, US-880 | P2 — access lock only, no billing/plan/deletion. Story doc: `docs/business/stories/US-884_Super_User_Tenant_Suspend_Deactivate.md` | Jira: FREIG-147 |
| US-885 | Super User: Scoped User Impersonation | READY_FOR_DESIGN | 9 | US-874, US-880, US-881 | P3 — ships last, deliberately; time-boxed, banner, re-auth, audit-logged. Story doc: `docs/business/stories/US-885_Super_User_Scoped_Impersonation.md` | Jira: FREIG-148 |
| US-886 | Super User: Create User (Existing Tenant or New Tenant) | READY_FOR_DESIGN | 9 | US-874, US-880 | P1 — founder-identified gap (not from council session). Bypasses join-code, not validation; temp password shown once (no email provider in prod). Story doc: `docs/business/stories/US-886_Super_User_Create_User_And_Tenant.md` | Jira: FREIG-149 |

---

## Phase 10: Shipper Dashboard Refinement (5 stories) — ✅ COMPLETE

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-820 | **KPI Summary Display (Active Shipments, On-Time %, Cost/Mile)** | **✅ COMPLETED** | **10** | **US-760** | **✅ REVIEWER APPROVED | ✅ E2E: 7.2s PASS | ✅ KPI tiles always visible with "No data" state | ✅ Design system shadows** | ⚠️ Bug found in production 2026-07-19/20 (real user report): `KPISummaryService`'s "active loads" filter counted only CLAIMED/IN_TRANSIT, silently excluding OPEN ("Posted") loads — a freshly posted, unclaimed load showed in the Shipment Status panel (US-822, broader "active" definition) but the KPI tile still read 0. Fixed: `KPISummaryService` now includes OPEN, matching US-822's definition. Added `KPISummaryServiceTest`/`KPISummaryControllerTest` (zero test coverage existed on this live endpoint before this fix — a REVIEWER gate gap). Also retired the dead, duplicate US-761 implementation of the same capability discovered during the investigation. |
| US-821 | **Shipper Header Navigation (Logo, Notification Bell, Avatar Dropdown)** | **✅ COMPLETED** | **10** | **US-760** | **✅ REVIEWER APPROVED | ✅ E2E: 7.2s PASS | ✅ Notification bell dropdown (not page nav) | ✅ Smart red badge (only show with unread)** |
| US-822 | **Shipment Status Panel (Active Shipments List)** | **✅ COMPLETED** | **10** | **US-823** | **✅ REVIEWER APPROVED (6/6 gates PASS) | ✅ LIBRARIAN CLOSED (2026-06-16) | ✅ 91.4% test coverage | ✅ Cache + DB queries fixed** |
| US-823 | **Shipper Dashboard Layout Skeleton (Grid + Placeholders)** | **✅ COMPLETED** | **10** | **US-820, US-821** | **✅ REVIEWER APPROVED (8 gates PASS) | ✅ Merged to main | ✅ 11/11 E2E tests PASS | ✅ 100% CSS token compliance** |
| US-824 | **Quick Actions Panel (Post Load, Get Quote, Track, Preferences)** | **✅ COMPLETED** | **10** | **US-823** | **✅ MERGED TO MAIN | ✅ All 4 action buttons implemented | ✅ E2E tests PASS | ✅ Bronze button styling** |
| US-825 | **Carrier Search Panel (Origin/Destination Search + Results)** | **✅ COMPLETED** | **10** | **US-823** | **✅ MERGED TO MAIN | ✅ Form validation + API wired | ✅ E2E tests PASS | ✅ Search results display working** |

---

## v0.1.0 Design System Integration (US-840 Epic) — ✅ PARTIALLY COMPLETE

| ID | Title | Status | Phase | Depends On | Notes |
| :- | :---- | :----- | :---- | :--------- | :---- |
| US-840 | Design Token Import (CSS variables, Tailwind extension) | ✅ COMPLETED | 11 | — | ✅ MERGED PR #10 (2026-06-30) |
| US-841 | UI Primitive Styling (Button, Input, StatusBadge) | ✅ COMPLETED | 11 | US-840 | ✅ MERGED PR #11 (2026-06-30) |
| US-842 | Layout Shell Reskin (AppShell header, legacy-dark removal) | ✅ COMPLETED | 11 | US-841 | ✅ MERGED PR #12 (2026-06-30) |
| US-843 | Shipper Dashboard Reskin (KPI cards, load table) | ✅ COMPLETED | 11 | US-842 | ✅ MERGED PR #13 (2026-06-30) |
| US-844 | Carrier Load Board UX (equipment filter, board lock, post-action nav) | COMPLETED | 11 | US-842 | ✅ REVIEWER_PASS + LIBRARIAN (2026-07-02) — PR #16 |
| US-845 | Load Creation Form Fields | READY_FOR_DESIGN | 11 | US-842 | P1 |
| US-846 | Shipper Action Zone Restructure | ✅ COMPLETED | 11 | US-843 | ✅ MERGED PR #13 | ✅ REVIEWER_PASS (2026-07-02) | ✅ LIBRARIAN (2026-07-02) |
| US-847 | Persona Token Migration | BACKLOG | 11 | US-846 | P2 — optional; deferred |

---

## Backlog (Deferred)

| ID     | Title                                  | Status      | Depends On | Rationale |
| :----- | :------------------------------------- | :---------- | :--------- | :--------- |
| US-826 | **Messages & Alerts Panel (Load Notifications)** | **BACKLOG** | **US-823** | Deferred: Reuses existing useNotifications hook; not critical for Phase 10 MVP completion (2026-06-16) |

---

## Compliance Matrix

### Hard Gates (All Phases)

| Gate | Enforcement | Status |
|------|-------------|--------|
| **RLS (Row-Level Security)** | Code review + Flyway migration validation | ✅ Enforced on all 78 stories |
| **No-Lombok** | Code review + grep for @Getter/@Setter | ✅ Enforced on all backend stories |
| **VARCHAR(36) Primary Keys** | Schema review + Flyway migration validation | ✅ Enforced on all data stories |
| **Test Coverage ≥70%** | JaCoCo branch coverage + REVIEWER gate | 🟡 In progress (Phase A: 50.6%, Phase B-C target: 70%) |
| **Cyclomatic Complexity <10** | Code review + complexity analysis | ✅ Enforced on all code paths |
| **NFR-504 Caching** | Design review + architecture gate (Phase 7+) | ✅ Documented for all GET endpoints |

---

## Blocker Analysis

### CRITICAL (Must resolve before Phase 7b implementation)

| Blocker | Impact | Status |
|---------|--------|--------|
| **Backend Test Coverage ≥70%** | Blocks all Phase 4+ features from shipping | 🟡 IN_PROGRESS — Phase A: 50.6% (+1.1%), Phase B-C scheduled 2026-05-26 |
| **US-305 (POD Upload UI)** | Blocks US-730, US-732 (earnings/mileage tracking) | ✅ RESOLVED — US-305 COMPLETED |
| **US-308 (Document Audit Log)** | Blocks US-736 (tax compliance reporting) | ✅ **RESOLVED** — US-308 COMPLETED (2026-05-25) |
| **Phase 5 payment processor** | Blocks all 7 Phase 5 stories (US-501–507) | ⚠️ BLOCKER — No Stripe/ACH integration |
| **Phase 6 message broker** | Blocks all 4 Phase 6 stories (US-601–604) | ⚠️ BLOCKER — No WebSocket/message infra |

---

## Story Summary by Status

| Status | Count | Phases |
|--------|-------|--------|
| ✅ COMPLETED | 30 | 1, 1.1, 1.2, 2, 3, 4, 5, 7, 10 |
| 🔄 IN_PROGRESS | 2 | 1, 3 |
| 🟡 PARTIAL | 9 | 3, 4, 7 |
| 🟢 APPROVED_FOR_CODER | 0 | — |
| 📋 READY_FOR_DESIGN | 4 | 10 |
| ⚠️ MIGRATION_PENDING | 60 | 3–9 |
| **TOTAL** | **87** | **1–10 + Cross (30 complete, 2 in progress, 9 partial, 4 ready-for-design, 60 pending)** |

---

**Last Synced:** 2026-06-13 19:30 UTC  
**Compliance Status:** ✅ All 87 stories cataloged | ✅ SEC-001 DONE (10/10 tests PASS) | ✅ SEC-002 DONE (5/5 tests PASS, RLS verified) | ✅ INF-001 DONE (20/20 migrations wrapped, idempotent) | ✅ US-308 (Audit Log) unblocks Phase 7b | ✅ US-823 (Phase 10 scaffold) COMPLETE (merged main, 11/11 E2E PASS) | ✅ Backend Coverage Phase A (54 tests, 50.6%)  
**Implementation Status:** Phase 1-3 complete; Phase 7 (6 stories) partially implemented; Phase 10 (6 stories) progressing — US-820/821 DONE, US-823 DONE (merged main), US-824/825/826 READY_FOR_DESIGN with data hook requirements (GitHub #3); SEC-001/SEC-002/INF-001 COMPLETE; Phase 5-6 blocked on external integrations; **Backend Coverage Remediation: Phase A DONE, Phase B-C scheduled**  
**Critical Path:** 🟢 SEC-001 DONE | 🟢 SEC-002 DONE | 🟢 INF-001 DONE | 🟢 Phase 10 US-823 DONE (merged) | 🟢 Next: US-824/825/826 data hook implementation | 🟡 Backend Test Coverage Phase B-C (target 70%) | ⚠️ Phase 5 payment processor | ⚠️ Phase 6 message broker
