# Resilience Logistics: Story Map (Global Hardening Edition)

**Last Updated:** 2026-06-04 | **Scope:** 83 stories mapped | **Unmapped Requirements:** 0 | **Compliance Status:** ✅ RLS, No-Lombok, VARCHAR(36), **Test Coverage 50.6%** enforced as hard gates | **US-900 (E2E Testing):** ✅ ALL 6 PHASES COMPLETE (2026-05-31) | **Phase 1 Governance:** ✅ COMPLETE | **Phase 2 Governance:** ✅ COMPLETE | **Phase 3 Governance:** ✅ COMPLETE (story files + sign-offs 2026-05-14) | **Phase 3 US-308:** ✅ COMPLETED (audit logging + integration, 2026-05-25) | **Phase 4 Governance:** ✅ COMPLETE (story files + status synced 2026-05-25) | **Backend Coverage Phase A:** ✅ COMPLETE (49.5% → 50.6%, 54 tests) | **Security & Infrastructure Hardening:** ✅ ALL 3 P1 stories DONE (SEC-001, SEC-002, INF-001)

---

## Critical Security & Infrastructure (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| SEC-001 | Add @PreAuthorize to DELETE/PUT Endpoints | DONE | Cross | — | ✅ RLS, ✅ No-Lombok, ✅ 80% branch coverage (10/10 tests PASS) |
| SEC-002 | PostgreSQL RLS Policies (5 Tables)    | DONE | Cross | — | ✅ RLS enforcement at DB level, ✅ Idempotent Flyway, ✅ 5/5 tests PASS |
| INF-001 | Flyway Migration Idempotency (20 migrations) | DONE | Cross | — | ✅ DO block pattern, ✅ Exception handling, ✅ 20/20 migrations wrapped |
| **US-900** | **E2E Testing Infrastructure & Standards** | **DONE** | **Cross** | **—** | **✅ All 6 Phases COMPLETE, ✅ 58 tests active (0 skipped), ✅ CI/CD integrated, ✅ READY FOR PRODUCTION** |
| US-849 | Access Token Refresh Interceptor | DONE | Cross | — | ✅ Found while diagnosing a real "unable to create a load" report — 15-min access-token expiry had no refresh-and-retry wired up despite the refresh endpoint existing; app-wide gap, not load-specific. ✅ 8/8 unit tests, full suite 258/258, e2e 100 passed, live Docker repro confirming silent recovery. ✅ REVIEWER PASS 2026-07-08. | Jira: FREIG-113 |
| US-850 | Custom Font Loading — Vite Import Fix | DONE | Cross | — | ✅ Found via production smoke test — public/fonts/custom-fonts.css used raw CSS @import of bare npm specifiers, resolved fine under Vite dev server (masking it in Docker test env) but 404'd under nginx-served prod build. Switched to dynamic import() so Vite bundles real hashed font files in both environments. ✅ 7/7 unit tests, ✅ 8/8 E2E (login-integration.spec.ts, new regression guard added), ✅ verified against `vite preview` static serving (prod-equivalent) with zero font-related console errors. | Jira: FREIG-114 |
| US-851 | Production Deploy Infrastructure Fixes | DONE | Cross | — | ✅ Found while investigating a decoy-Cloud-Run-service incident (FREIG-115): (1) backend/pom.xml flyway-maven-plugin had a hardcoded nonexistent postgresql:43.0.0 driver version and was missing the flyway-database-postgresql dependency, blocking `mvn flyway:repair` from running at all; fixed to use ${postgresql.version} + added the module. (2) deploy-prod.ps1 had DB_PASSWORD/APP_JWT_SECRET/JWT_SECRET hardcoded in plaintext, committed to origin/main since 2026-05-19; rewritten to pull all secrets from Secret Manager and use --env-vars-file for the comma-containing CORS_ALLOWED_ORIGINS value instead of a fragile semicolon-separated workaround. ✅ Verified: flyway:repair ran successfully against production Neon DB; freightclub-backend/freightclub-frontend redeployed cleanly with the fixed script. Credential rotation for the previously-exposed secrets tracked separately by user. | Jira: FREIG-115 |
| US-852 | Plan-First Mandate (CODER gate + CLAUDE.md + hook) | DONE | Cross | — | ✅ Direct process fix requested after the FREIG-115 postmortem — added a "Pre-Implementation Plan Gate" to CODER.md (existing-tooling check, current-state verification, prefer vendor tools, verification plan stated up front) plus a matching Plan-First Mandate in CLAUDE.md's Coder Invocation Rule. ✅ Also added a mechanically-verified PreToolUse hook (`.claude/hooks/check-deploy-script-duplication.sh`) blocking creation of a new deploy*.ps1/.sh when one already exists at that path — pipe-tested (deny/allow/allow) and prove-fired via a real blocked Write call. Hooks can't see conversation history, so planning-process enforcement lives in CLAUDE.md/CODER.md text (read every session); the hook covers only the mechanically-checkable slice (duplicate file on disk). | Jira: — |
| US-853 | /wrap-up: Reviewer + Testing Standards updates from FREIG-114/115 session | DONE | Cross | — | ✅ Session retrospective — added a REVIEWER checklist gate (Console/Network Error Guard: golden-path E2E specs must assert zero failed static-asset requests + zero console errors post-auth, citing FREIG-114) and a "Known Limitation" note in testing_standards.md (Docker test env runs Vite dev server, not nginx-served prod build, so it structurally cannot catch font/asset-loading bugs that only manifest under real static serving — verify via `npm run build` + `vite preview` for that class of change). | Jira: — |
| US-854 | Per-Load Diesel Fuel Cost Resolution | COMPLETED | Cross | — | ✅ BA Gate 1 approved 2026-07-13. ✅ ARCH design (`docs/architecture/US-854_Diesel_Cost_Resolution_Design.md`) — no migration, new `StateToEiaRegionResolver` (real EIA PADD state map) + `DieselPriceResolution` + `resolveDieselPriceForLoad`/`calculateMinimumRPM(truckerId, originState)` overloads. ✅ HFD design (`docs/hfd/US-854_Design_Spec.md`) — non-interactive caption on `LoadBoardTable.tsx`, Phase 4 device test explicitly WAIVED by user 2026-07-14. ✅ CODER complete: `LoadService.listOpenLoads` refactored from a once-per-page threshold to per-load resolution; `LoadSummaryResponse` gains `regionUsed`/`asOfPeriod`/`isFallback`; frontend caption with all 5 EIA region labels + fallback + omitted states. Coverage: StateToEiaRegionResolver 100%, CarrierCostProfileService 82.1%, LoadSummaryResponse 80%, LoadService 80.6% branch (all ≥80% gate). ✅ REVIEWER pass 2026-07-14 found and CODER fixed a config-wiring bug (`docker-compose.test.yml`/`application.yml` never bound `EIA_API_KEY`/`EIA_ENABLED`, so mocked tests were green while the live feature returned `available:false` everywhere) and a missing Playwright golden-path spec + evidence (the earlier "blocked by datetime-local" framing was a false blocker specific to the browser-use MCP manual tool, not real Playwright). Added `frontend/e2e/design-system/US-854-diesel-region-caption.spec.ts` (2/2 passing, CI-environment-aware since GH Actions has no EIA key configured, same documented constraint as `us-730a-v2-cost-profile-wizard.spec.ts`) covering AC-1 (region override), AC-2 (as-of date), AC-3 (fallback indicator), seeded through the real backend API. Evidence: `test-results/evidence/US-854-diesel-region-caption.png`, `US-854-fallback-indicator.png`. Tests: 902/902 backend, 291/291 + 4 new frontend unit, 106/106 E2E (0 regressions), clean `tsc --noEmit`. **✅ REVIEWER PASS 2026-07-14** — all hard gates satisfied, all 9 GH Actions CI checks green on PR #37. **✅ LIBRARIAN sign-off 2026-07-14** — see `docs/project/LIBRARIAN_SIGN_OFF_US854.md`. Jira FREIG-116 transitioned to Done. PR #37 not yet merged to main — pending explicit merge authorization. | Jira: FREIG-116 |

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
| US-761 | Dashboard Summary Aggregate Endpoint (Est. Cost/Mile, On-Time Carrier %) | **READY FOR REVIEWER RE-AUDIT** | 7 | US-715 | ✅ Backend GREEN — unchanged. Unblocked by US-760 visual compliance restore. |
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
| US-730g | Per-Load Earnings Log (Miles, Fuel, Profit) | MIGRATION_PENDING | 7b | US-305, US-502 | ✅ NFR-504 (1h TTL), ✅ US-305 ready (POD UI complete) | Renumbered from US-730 (2026-07-04, CHG-849) to resolve ID collision with the Phase 7a epic |
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
| US-750 | Admin Dashboard (Users, Loads, Tenants) | MIGRATION_PENDING | 9 | US-502, US-701 | ✅ NFR-504 (5m TTL) |
| US-751 | Dispute Resolution Tools (Admin)     | MIGRATION_PENDING | 9 | US-502 | ✅ NFR-504 (5m TTL) |
| US-752 | Platform Health Metrics (Real-Time) | MIGRATION_PENDING | 9 | US-101 | ✅ NFR-504 (10s TTL) |
| US-753 | Rate Benchmarking Tool (Shipper)    | MIGRATION_PENDING | 9 | US-502, US-203 | ✅ NFR-504 (1h TTL) |
| US-754 | Carrier Scorecard (Detailed Metrics) | MIGRATION_PENDING | 9 | US-402, US-701 | ✅ NFR-504 (1h TTL) |
| US-755 | ELD Integration for HOS Tracking    | MIGRATION_PENDING | 9 | US-101 | ✅ RLS, ✅ No-Lombok |
| US-756 | Document Upload (Insurance, CDL, Medical) | MIGRATION_PENDING | 9 | US-721, US-722 | ✅ NFR-504 (5m TTL) |
| US-757 | Freight Insurance Integration (Per-Load) | MIGRATION_PENDING | 9 | US-502 | ✅ Event-driven |
| US-758 | TMS API Access (REST for Shippers) | MIGRATION_PENDING | 9 | US-502 | ✅ NFR-504 (API responses cached) |
| US-759 | Recurring Load Scheduling           | MIGRATION_PENDING | 9 | US-101 | ✅ Event-driven on schedule execution |

---

## Phase 10: Shipper Dashboard Refinement (5 stories) — ✅ COMPLETE

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-820 | **KPI Summary Display (Active Shipments, On-Time %, Cost/Mile)** | **✅ COMPLETED** | **10** | **US-760** | **✅ REVIEWER APPROVED | ✅ E2E: 7.2s PASS | ✅ KPI tiles always visible with "No data" state | ✅ Design system shadows** |
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
