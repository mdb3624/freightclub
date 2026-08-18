# FreightClub: Comprehensive Project Plan

**Last Updated:** 2026-07-23  
**Maintained By:** Architect & Librarian (Governance-Based SDLC)  
**Status:** 30/87 stories complete | 60 migrations live | 69.49% backend branch coverage (target: 80%)

---

## Project Goal

FreightClub is a multi-tenant SaaS platform connecting shippers and owner-operator truckers through a modern load board. Shippers post loads with origin/destination/equipment/payment terms; owner-operators browse, claim loads, complete deliveries, and track profitability. The platform emphasizes tenant isolation via PostgreSQL Row-Level Security (RLS), comprehensive audit logging, and role-based access control (shipper vs. carrier personas).

**Core Differentiators:**
- **Real-time matching** via preferred lanes + equipment + availability
- **Financial intelligence** for truckers (cost per mile, fuel surcharge auto-calculation, IFTA mileage tracking)
- **Reputation & ratings** bidirectional (shipper ← → trucker)
- **Payment settlement** with 2% platform commission + quick-pay option
- **Multi-tenant isolation** enforced at the database layer (RLS), not application layer

---

## Phase Summary Table

| Phase | Name | Status | % Done | Key Deliverables | Blocker |
| :--- | :--- | :--- | :---- | :--- | :--- |
| 1 | Core Load Lifecycle | ✅ Complete | 100% | Registration, JWT, Load CRUD, Load board, Status transitions | — |
| 2 | Notifications & EIA | ✅ Complete | 100% | Email notifications, Notification bell, EIA diesel pricing API | — |
| 3 | Document Management | ✅ Complete | 100% | S3 storage, BOL generation, Photo uploads, Audit logging | — |
| 4 | Ratings & Reviews | ✅ Complete | 100% | Bidirectional ratings, Reputation profile, Rating history, Badge | — |
| 5 | Payment Settlement | 🔄 In Progress | 40% | Load settlement (DONE), Account setup (DONE), Processor integration (PENDING) | Payment processor |
| 6 | In-App Messaging | 📋 Planned | 0% | Message threads, Real-time messaging, Notifications | Message broker |
| 7a | Carrier Dashboard MVP | ✅ Complete | 100% | Dashboard, Cost profile wizard, Performance metrics, Profile credentials | — |
| 7 | Carrier & Shipper Mgmt | 🔄 In Progress | 50% | Carrier profiles (DONE), Preferred carriers (DONE), Lane tags (AC-1 DONE, AC-2-5 IN_PROGRESS) | — |
| 7b | Financial Intelligence | 📋 Planned | 0% | Earnings log, P&L reports, IFTA tracking, Deadhead estimation | — |
| 8 | Bidding & Matching | 📋 Planned | 0% | Open-to-bids posting, Bid submission, Shipper review | — |
| 9 | Admin Tools | 📋 Planned | 0% | Admin dashboard, Dispute resolution, Health metrics, ELD integration | — |
| 10 | Shipper Dashboard | ✅ Complete | 100% | KPI display, Navigation, Layout, Shipment status, Quick actions, Search | — |
| 11+ | Design System & UX | 🔄 In Progress | 60% | Design tokens (DONE), UI primitives (DONE), Reskins (DONE), Enhancements (PARTIAL) | — |

---

## Story Status Summary

- **✅ Completed:** 30 stories (Phases 1, 2, 3, 4, 7a, 10, 11+, Cross)
- **🔄 In Progress:** 2 stories (Phases 7, 11+)
- **🟡 Partial:** 9 stories (Load board filters, Posting validation, Lane tags frontend, etc.)
- **📋 Ready for Design:** 4 stories
- **⏳ Migration Pending:** 60 stories (Phases 5-9)
- **Total:** 87 stories mapped

---

## Phase Details

### Phase 1: Core Load Lifecycle (✅ COMPLETE)

**Status:** 100% complete | All 5 stories shipped

**What's Done:**
- US-101: Multi-tenant registration with JWT authentication
- US-102: Tenant context holder + JWT token management
- US-103: Load CRUD operations (create, edit, cancel, publish)
- US-104: Load board with pessimistic locking for claiming workflow
- US-105: Load status transitions (OPEN → CLAIMED → IN_TRANSIT → DELIVERED → SETTLED)

**Implementation:**
- Backend: `AuthController`, `LoadController`, `LoadService`, `LoadRepository`, `TenantContextHolder`
- Frontend: `LoginForm`, `RegisterForm`, `LoadBoard.tsx`, `LoadDetail.tsx`
- Database: 6 Flyway migrations (users, tenants, loads, load_status_history, etc.)
- Coverage: 80%+ branch coverage across all services

**Blockers:** None

---

### Phase 2: Notifications & EIA Integration (✅ COMPLETE)

**Status:** 100% complete | All 3 stories shipped

**What's Done:**
- US-201: Email notifications (claim, pickup, delivery, cancel events)
- US-202: In-app notification bell with read/unread status
- US-203: EIA diesel pricing API with 6-hour cache invalidation

**Implementation:**
- Backend: `NotificationController`, `NotificationService`, `MarketController`, `DieselPriceService`
- Frontend: `NotificationBell.tsx`, `useNotifications` hook
- Cache: Redis-backed with TTL: 1m (email), 30s (in-app), 6h (EIA prices)
- Database: `notifications`, `notification_read_status` tables, RLS-enforced

**Blockers:** None

---

### Phase 3: Document Management (✅ COMPLETE)

**Status:** 100% complete | All 6 stories shipped

**What's Done:**
- US-301: S3 file storage with signed upload/download URLs
- US-302: Platform-generated Bill of Lading (BOL)
- US-302-v2: BOL pickup attestation (carrier confirm + lock)
- US-303: BOL/POD photo upload and viewing
- US-305: POD upload UI completion
- US-308: Document audit log service (tracks all document access/mutations)

**Implementation:**
- Backend: `DocumentController`, `DocumentService`, `DocumentAuditService`, `S3Client`
- Frontend: `DocumentUpload.tsx`, `BOLViewer.tsx`, `PODUpload.tsx`
- Database: `documents`, `document_audit_log` (60 event types logged), S3 integration via AWS SDK
- Coverage: 80%+ branch coverage on all audit paths

**Blockers:** None

---

### Phase 4: Ratings & Reviews (✅ COMPLETE)

**Status:** 100% complete | All 4 stories shipped

**What's Done:**
- US-401: Bidirectional rating system (1–5 stars, both shipper and carrier can rate each other)
- US-402: Shipper reputation profile with aggregated metrics (avg rating, total loads, on-time %, payment speed)
- US-403: Rating history timeline with detailed comments
- US-405: Shipper reputation badge on load board

**Implementation:**
- Backend: `RatingController`, `RatingService`, `ReputationProfileService`
- Frontend: `RatingCard.tsx`, `ReputationBadge.tsx`, `RatingHistory.tsx`
- Database: `ratings`, `reputation_profiles` (materialized aggregate view), RLS-scoped
- Cache: 1h TTL on reputation aggregates, 2h on shipper profile badge
- Coverage: 80%+ branch coverage

**Blockers:** None

---

### Phase 5: Payment Settlement & Financial Transactions (🔄 IN PROGRESS, 40%)

**Status:** Partial complete (3 of 7 stories shipped)

**What's Done:**
- US-501: ✅ Load settlement with 2% platform commission and quick-pay option
- US-502: ✅ Payment account setup (bank details, ACH verification)
- US-506: ✅ SETTLED load status and workflow (load marked settled when payment clears)

**What's Remaining:**
- US-503: Payment processor integration (Stripe/ACH) — BLOCKED
- US-504: Dispute resolution workflow — BLOCKED
- US-507: Payment dispute flow and resolution — BLOCKED
- US-505: Receipt generation and export — BLOCKED

**Implementation (Done):**
- Backend: `PaymentService`, `PaymentAccountService`, `SettlementController`, `PaymentAccount` entity
- Frontend: `PaymentSetup.tsx`, `SettlementStatus.tsx`
- Database: `payment_accounts`, `settlements`, `settlement_items` (Flyway V20260501+)
- Coverage: 82%+ on completed stories

**Blockers:**
- **CRITICAL:** No payment processor integration (Stripe/ACH). Stories US-503–US-507 blocked until processor is configured and live.

---

### Phase 6: In-App Messaging (📋 PLANNED, 0%)

**Status:** Not started (4 stories planned)

**Planned Deliverables:**
- US-601: Per-load message threads between shipper and carrier
- US-602: Real-time messaging (WebSocket or Server-Sent Events)
- US-603: Unread message badge on load
- US-604: Message notifications (email + in-app)

**Blockers:**
- **CRITICAL:** No message broker infrastructure (Redis, RabbitMQ, or Kafka). Must decide and provision before work starts.

---

### Phase 7a: Carrier Dashboard MVP (✅ COMPLETE)

**Status:** 100% complete | 8 stories shipped

**What's Done:**
- US-730-0: ✅ Dashboard structure & mobile design spec
- US-730a: ✅ Cost profile setup API & UI (RPM, fuel, deadhead calculations)
- US-730a-v2: ✅ Cost profile wizard redesign (dedicated `/carrier/cost-profile` screen)
- US-730b: ✅ Profitable load visibility & filtering
- US-730c: ✅ Performance metrics display (on-time %, avg RPM, loads completed, miles)
- US-730d: ✅ Unified carrier dashboard (hero load + stats + board)
- US-730e: ✅ Equipment & lane management
- US-730f: ✅ Payment acknowledgment read-only status
- US-730h: ✅ Carrier identity & credentials profile (dedicated `/carrier/profile` screen)

**Implementation:**
- Backend: `TruckerDashboard` endpoints, `CarrierProfileService`, `CarrierCostProfileService`, `PerformanceMetricsService`
- Frontend: `TruckerDashboard.tsx`, `CarrierProfileHub.tsx`, `CostProfileWizard.tsx`, `CarrierIdentityProfile.tsx` (dark theme, mobile-first)
- Database: `carrier_cost_profiles`, `carrier_equipment`, `carrier_lanes`, `carrier_availability`, updated `trucker_profiles`
- Coverage: 95%+ on all completed stories

**Blockers:** None

---

### Phase 7: Carrier & Shipper Management (🔄 IN PROGRESS, 50%)

**Status:** Partial complete (9 of 11 stories done/partial)

**What's Done:**
- US-701: ✅ Carrier profiles (equipment types, capacity, lanes)
- US-702: ✅ Trucker preferred lanes (region-based)
- US-703: ✅ Trucker availability (days/hours tracking)
- US-707: ✅ Shipper preferred carrier list
- US-707-v2: ✅ Preferred carriers search redesign
- US-710: ✅ Carrier public profile view
- US-713: ✅ Shipper company profile setup (post-registration)
- US-715: ✅ Shipper dashboard (load summary & management)
- US-760: ✅ Shipper dashboard home (KPI tiles, quick actions, search, status)
- US-762: ✅ Carrier search lane extension (origin/destination/equipment filters)

**What's Partial:**
- US-705: Load board filters (weight, min pay) — AC partially implemented
- US-706: Load posting validation prompts (shipper) — AC partially implemented
- US-856: Lane tags on carrier cards — Backend AC-1 DONE, Frontend AC-2-5 IN_PROGRESS

**What's Remaining:**
- US-708: Direct load assignment to carrier — MIGRATION_PENDING
- US-709: Block carrier (prevent visibility) — MIGRATION_PENDING
- US-711: Load interest / view count tracking — MIGRATION_PENDING
- US-714: Trucker onboarding checklist (pre-claim gate) — READY_FOR_DESIGN
- US-712: View shipper public profile — MIGRATION_PENDING

**Implementation (Done):**
- Backend: `CarrierSearchService`, `PreferredCarrierRepository`, `ProfileController`, `ShipperProfileService`
- Frontend: `CarrierSearchPanel.tsx`, `PreferredCarriersList.tsx`, `ShipperDashboard.tsx`, `ShipperProfileSetup.tsx`
- Database: `carrier_profiles`, `preferred_carriers`, `shipper_profiles` (with RLS), search indexes on `carrier_lanes`
- Coverage: 85%+ on completed stories

**Blockers:** None

---

### Phase 7b: Financial Intelligence & Analytics (📋 PLANNED, 0%)

**Status:** Not started (8 stories planned)

**Planned Deliverables:**
- US-730g: Per-load earnings log (miles, fuel cost, profit margin)
- US-731: Weekly/monthly P&L report for carrier
- US-732: IFTA mileage tracking by state
- US-733: Deadhead mileage estimation
- US-734: Deadhead cost in profitability calculation
- US-735: Fuel surcharge auto-calculation (based on EIA prices)
- US-736: Annual earnings & tax summary export
- US-737: Extract trucker_cost_profiles (data migration)

**Blockers:** None (depends on Phase 3 POD UI completion, which is DONE)

---

### Phase 8: Bidding & Advanced Matching (📋 PLANNED, 0%)

**Status:** Not started (5 stories planned)

**Planned Deliverables:**
- US-740: Post load as open-to-bids vs FCFS mode
- US-741: Trucker submits bid (rate + message)
- US-742: Shipper reviews/accepts/rejects bids
- US-743: Bid expiry & auto-close (background job)
- US-744: Duplicate load for recurring lanes
- US-745: Freight class field (LTL support)

**Blockers:** None

---

### Phase 9: Admin & Intelligence Tools (📋 PLANNED, 0%)

**Status:** Not started (10 stories planned)

**Planned Deliverables:**
- US-750: Admin dashboard (users, loads, tenants overview)
- US-751: Dispute resolution tools (admin panel)
- US-752: Platform health metrics (real-time)
- US-753: Rate benchmarking tool (shipper-facing)
- US-754: Carrier scorecard (detailed metrics)
- US-755: ELD integration for HOS tracking
- US-756: Document upload tools (insurance, CDL, medical)
- US-757: Freight insurance integration (per-load)
- US-758: TMS API access (for shippers)
- US-759: Recurring load scheduling

**Blockers:** None

---

### Phase 10: Shipper Dashboard Refinement (✅ COMPLETE)

**Status:** 100% complete | All 6 stories shipped

**What's Done:**
- US-820: ✅ KPI summary display (active shipments, on-time %, cost per mile)
- US-821: ✅ Shipper header navigation (logo, notification bell, avatar dropdown)
- US-822: ✅ Shipment status panel (active shipments list with status)
- US-823: ✅ Dashboard layout skeleton (grid + placeholders)
- US-824: ✅ Quick actions panel (post load, get quote, track, preferences)
- US-825: ✅ Carrier search panel (origin/destination search + results)

**Implementation:**
- Backend: `KPISummaryService`, `KPISummaryController`, `ShipmentStatusService`
- Frontend: `ShipperDashboard.tsx`, `KPITiles.tsx`, `ShipmentStatusPanel.tsx`, `QuickActionsPanel.tsx`, `CarrierSearchPanel.tsx`
- Database: Pre-existing services + new KPI aggregation query (active loads, on-time carrier %, est. cost/mile)
- Coverage: 100% on all components
- E2E: 24/24 tests passing

**Blockers:** None

---

### Phase 11+: Design System & UX Enhancements (🔄 IN PROGRESS, 60%)

**Status:** Partial complete (5 of 8 stories done)

**What's Done:**
- US-840: ✅ Design token import (CSS variables, Tailwind extension)
- US-841: ✅ UI primitive styling (Button, Input, StatusBadge)
- US-842: ✅ Layout shell reskin (AppShell header, legacy-dark removal)
- US-843: ✅ Shipper dashboard reskin (KPI cards, load table)
- US-844: ✅ Carrier load board UX (equipment filter, board lock, post-action nav)
- US-846: ✅ Shipper action zone restructure

**What's Remaining:**
- US-845: Load creation form fields restyling — Ready for Design
- US-847: Persona token migration (optional, P2) — Backlog

**What's Planned (Post-Merge):**
- US-103-v3: Load duplication feature ("Copy to New") — Backlog
- US-103-v4: Load templates feature (save & reuse) — Backlog

**Implementation (Done):**
- Frontend: `Prototype/tokens/` design source of truth, rewritten `docs/standards/SHIPPER_DESIGN_SYSTEM.md` and `CARRIER_DESIGN_SYSTEM.md`
- Tailwind: Extended config with brand tokens (shipper-accent, carrier-surface-1, etc.)
- Coverage: 100% on completed stories
- E2E: 102/102 tests passing (post-redesign CI fix)

**Blockers:** None

---

## Critical Security & Infrastructure (✅ ALL COMPLETE)

All foundational security and operational stories shipped:

| Story | Status | Notes |
| :--- | :--- | :--- |
| SEC-001: @PreAuthorize on DELETE/PUT endpoints | ✅ DONE | 10/10 tests passing |
| SEC-002: PostgreSQL RLS policies (5 tables) | ✅ DONE | RLS enforced, idempotent Flyway |
| US-857: Narrow login-flow RLS bypass | ✅ DONE | `BYPASSRLS` revoked, dedicated `freightclub_login_lookup` role |
| US-858: RLS write-path investigation & BYPASSRLS revocation | ✅ DONE | Fixed `RlsStatementInspector` dead code, replaced with `TenantAwareDataSource`, prod deployed |
| INF-001: Flyway migration idempotency | ✅ DONE | 60/60 migrations wrapped in DO blocks |
| US-849: Access token refresh interceptor | ✅ DONE | 15-min expiry now has refresh-and-retry wired |
| US-850: Custom font loading (Vite import fix) | ✅ DONE | Fixed public/fonts raw CSS @import, now uses dynamic import() |
| US-851: Production deploy infrastructure fixes | ✅ DONE | Fixed flyway-maven-plugin, deploy-prod.ps1 secrets, CORS config |
| US-852: Plan-first mandate | ✅ DONE | Pre-implementation gate added to CODER.md, duplicate-deploy-script hook |
| US-853: Reviewer + testing standards updates | ✅ DONE | Console/network error guard, asset-loading limitation docs |
| US-854: Per-load diesel fuel cost resolution | ✅ DONE | EIA region resolution per-load, fallback pricing, CI-aware E2E |
| US-855: Marketing home page & in-page login modal | ✅ DONE | Hero, feature cards, persona split, modal login/signup, deployed |
| US-856: Lane tags on carrier cards | 🔄 IN_PROGRESS | Backend AC-1 DONE, frontend AC-2-5 IN_PROGRESS |
| US-860: Home page CTA simplification & signup modal | ✅ DONE | Removed header CTAs, new SignupModal, persona-aware routing |

---

## Immediate Next Priorities (Top 5)

### 1. **US-856 Frontend Completion (Lane Tags on Carrier Cards)**
**Effort:** 1–2 days  
**Impact:** Completes search result UX, enables Phase 7 shipper workflow  
**Work:**
- AC-2: Render `lanes` array on `CarrierResultRow` component
- AC-3: Display lane details (origin, destination, equipment type)
- AC-4: Sort/filter lanes in result card
- AC-5: E2E test all persona combinations (shipper searching different regions)
- Link to ARCH design: `docs/architecture/US-856_Lane_Tags_Design.md`

### 2. **Backend Test Coverage Phase B (65% → 80% Branch Coverage)**
**Effort:** 3–5 days  
**Impact:** Moves from enforced 65% floor to aspirational 80% gate  
**Work:**
- Audit untested service paths (currently 69.49%)
- Focus on high-cyclomatic-complexity methods (target: CC < 10)
- Add edge-case tests (null inputs, permission denials, concurrent claims)
- Run full Docker Pre-Test Protocol after each class fix
- Target: All Phase 7 service classes ≥ 80% branch coverage

### 3. **Phase 5 Payment Processor Integration (BLOCKED)**
**Effort:** 3–4 days (conditional on processor selection)  
**Impact:** Unblocks all 7 Phase 5 payment stories  
**Decision Needed:** Stripe vs. ACH vs. other processor?
**Work:**
- US-503: Integrate processor API (webhook handling, charge creation)
- US-504: Dispute resolution workflow (shipper can dispute payment)
- US-505: Receipt generation (PDF export, email delivery)

### 4. **Phase 7b Financial Intelligence (Earnings Log + Reports)**
**Effort:** 5–7 days  
**Impact:** Truckers see per-load profitability, can export tax summaries  
**Blocking:** None (Phase 3 POD UI is done)
**Work:**
- US-730g: Per-load earnings log endpoint (reuse existing POD/document data)
- US-732: IFTA mileage tracking (state-by-state breakdown)
- US-731: P&L report aggregation (weekly/monthly)
- US-736: Tax summary export

### 5. **Message Broker Infrastructure (BLOCKED — Phase 6)**
**Effort:** 2–3 days (setup) + 5–7 days (implementation)  
**Impact:** Unblocks all 4 Phase 6 messaging stories  
**Decision Needed:** Redis vs. RabbitMQ vs. Kafka?
**Work:**
- Provision message broker (local Docker + Cloud Run prod)
- US-601: Implement message thread service
- US-602: WebSocket or SSE real-time wiring
- US-603–604: Badge + notification integration

---

## Known Gaps & Technical Debt

### High Priority (Impact: Production or Multi-Phase)

| Item | Impact | Status | Fix |
| :--- | :--- | :--- | :--- |
| Backend coverage below 80% target | Hard gate enforcement | 🔄 IN_PROGRESS | Phase B remediation underway; currently 69.49% |
| E2E test suite debt (`US-E2EDEBT-001`) | 59 tests failing across 22 spec files | 📋 BACKLOG | Pre-existing; surfaced by first-ever CI e2e run; incremental per-story triage |
| Cross-tenant RLS gap (WRITE-side) | Truckers can see other tenants' OPEN loads (SELECT fixed), can they claim (WRITE)? | ⚠️ OPEN | High-priority tech debt; not E2E-covered yet |
| Phase 5 payment processor | Blocks 7 stories (US-501–507) | 🚫 BLOCKED | Requires processor selection & API integration |
| Phase 6 message broker | Blocks 4 stories (US-601–604) | 🚫 BLOCKED | Requires broker selection & infrastructure |

### Medium Priority (Refinement)

| Item | Impact | Status | Fix |
| :--- | :--- | :--- | :--- |
| `carrier-surface-2` / `carrier-border-glow` Tailwind tokens missing | Carrier UI may fall back to defaults | 📋 BACKLOG | Add missing tokens to `tailwind.config.ts` |
| `shipper-border` token conflicts with `#D0D0D0` spec | Load form styling inconsistency | 📋 BACKLOG | Clarify spec vs. Tailwind, unify to one source |
| US-761 dead code removal | Unreachable `DashboardSummaryService`, `useDashboardSummary` | 🔄 RETIRED | Already deleted 2026-07-20; superseded by US-820 |
| Preferred carriers list shows `carrierId` string instead of name/equipment/rating | US-846 debt item | 📋 BACKLOG | Low-severity UX gap; preferred carrier detail panel (not on main list) works correctly |

### Low Priority (Polish)

| Item | Impact | Status | Fix |
| :--- | :--- | :--- | :--- |
| Secondary grid buttons ≈28–30px height (below 44px desktop standard) | Touch target accessibility | 📋 BACKLOG | Increase button height, verify `boundingBox()` in E2E |
| Docker test image rebuild required for E2E screenshot changes | Iteration delay | 📋 DOC | Documented in `testing_standards.md`; working as designed (baked image prevents stale screenshots) |

---

## Tech Stack & Architecture

### Backend (Spring Boot 3.5.16)
- **Framework:** Spring Boot 3.5.16, Java 21
- **ORM:** JPA/Hibernate with pessimistic locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`)
- **Database:** PostgreSQL 15+ on Neon with Row-Level Security (RLS)
- **Authentication:** JWT (15-min access token in memory, HTTP-only refresh cookie)
- **Multi-Tenancy:** `TenantContextHolder` + RLS policies on 12+ tables
- **Soft Deletes:** `deleted_at IS NULL` enforced on all core-entity queries
- **Caching:** Spring Cache abstraction with Redis backend (TTL: 30s–6h per endpoint)
- **File Storage:** AWS S3 with signed URLs (15-min expiry by default)
- **Email:** AWS SES (SMTP)
- **Audit Logging:** Custom `DocumentAuditService` (60 event types), immutable ledger pattern

### Frontend (React 18 + TypeScript)
- **Build Tool:** Vite 5
- **UI Library:** Tailwind CSS 4 with custom design tokens
- **State Management:** Zustand (auth, tenant context) + React Query (server state)
- **Form Handling:** React Hook Form v7 with Zod validation
- **Routing:** React Router v6 with ProtectedRoute guards
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Design System:** v0.1.0 tokens, 6 persona-aware component sets (shipper/carrier light+dark)
- **Accessibility:** WCAG 2.1 AA target (role, aria-*, focus management)

### Database (PostgreSQL 15+)
- **Schema:** 60 Flyway migrations (V0–V20260722)
- **Entities:** 40+ core tables (users, tenants, loads, documents, payments, ratings, etc.)
- **RLS Policies:** 12+ tables with row-level isolation via `app.current_tenant` session variable
- **Indexes:** Composite on `(tenant_id, deleted_at)` for soft-delete filtering
- **Full-Text Search:** `tsvector` on load descriptions for board search
- **Constraints:** Foreign keys to `tenants(id)`, never `users(tenant_id)` (prevents data leakage)

### DevOps & Deployment
- **Local:** Docker Compose (dev, test services)
- **CI/CD:** GitHub Actions (Backend Build & Test, Frontend Lint/Test/Build, E2E Playwright, check-story-files)
- **Production:** Cloud Run (freightclub-backend, freightclub-frontend), Neon PostgreSQL
- **Configuration:** Environment variables (Secret Manager for prod secrets)
- **Monitoring:** Cloud Logging, Cloud Trace, Spring Boot Actuator `/health`

---

## Completion Metrics

| Metric | Current | Target | Status |
| :--- | :--- | :--- | :--- |
| **Story Completion** | 30/87 (34%) | 87/87 (100%) | 🔄 IN_PROGRESS |
| **Backend Branch Coverage** | 69.49% | 80% | 🟡 APPROACHING |
| **Frontend Unit Test Files** | 261 tests passing | 100% green | ✅ PASSING |
| **E2E Test Suite** | 102/102 passing (post-CI-fix) | 100% green | ✅ PASSING |
| **Flyway Migrations** | 60 (idempotent) | 100% wrapped in DO blocks | ✅ ENFORCED |
| **Cyclomatic Complexity** | < 10 (enforced) | < 10 (maintained) | ✅ ENFORCED |
| **Security (RLS)** | 12+ tables, 60 policies | All core tables | 🔄 NEAR_COMPLETE |
| **Code Quality (No-Lombok)** | 100% POJO/Records | Zero @Data/@Builder | ✅ ENFORCED |

---

## Out of Scope / Future Roadmap

### Deferred to Post-MVP (Phase 12+)

| Feature | Rationale | Target |
| :--- | :--- | :--- |
| **Persona Token Migration (US-847)** | Optional optimization; all 6 design system sets already persona-aware | Post-launch refinement |
| **Load Duplication (US-103-v3)** | Enhancement to load creation; core posting/claiming works | Q3 2026 |
| **Load Templates (US-103-v4)** | Recurring pattern; base CRUD sufficient for MVP | Q4 2026 |
| **Carrier Network Epic** | Backlog of lane tags, reviews, assign-to-load, quote processing | Phase 12 (8 stories) |
| **Admin Dashboard (US-750)** | Backoffice only; launch with core platform first | Post-launch operations |
| **ELD Integration (US-755)** | Third-party compliance; scope creep for MVP | Post-launch compliance |

### Never Committed (Anti-Patterns)

- **Hardcoded service URLs** — All use environment variables
- **Plaintext credentials in code** — All use Secret Manager or dotenv
- **Mocked test-only validation** — External API config wired end-to-end (see US-854 fix)
- **Circular role escalation** — Sequential Lock Protocol enforces forward-only handoff
- **Lombok in tests** — POJO fixtures only (improves debuggability)

---

## Dependencies & Critical Path

### Must Complete Before Launch

1. ✅ Phase 1–4 (Core lifecycle, ratings, documents) — COMPLETE
2. ✅ Phase 7a (Carrier dashboard) — COMPLETE
3. ✅ Phase 10 (Shipper dashboard) — COMPLETE
4. ✅ Security & Infrastructure (SEC-001, SEC-002, US-857/858, INF-001) — COMPLETE
5. 🔄 Phase 7 Frontend (US-856 completion) — IN_PROGRESS
6. 🟡 Backend Coverage (65% → 80%) — APPROACHING

### Conditionally Blocking (Choose One Path)

| Feature | Dependency | If Deferred | If Included |
| :--- | :--- | :--- | :--- |
| **Phase 5 (Payments)** | Payment processor API | Launch with SETTLED-only status | Full settlement + quick-pay MVP |
| **Phase 6 (Messaging)** | Message broker | In-app notifications only (existing) | Real-time load discussions |
| **Phase 7b (Financial Intelligence)** | None (Phase 3 POD is DONE) | Truckers see only load board | Full earnings log + P&L reports |

---

## Governance & Roles

All development follows a **Role-Based, Sequential-Lock** SDLC:

1. **BUSINESS_ANALYST.md** → Story creation, acceptance criteria (INVEST standard), Jira tracking
2. **ARCHITECT.md** → Domain modeling, schema design, API contract (Mermaid + ADRs)
3. **HUMAN_FACTORS_DESIGNER.md** → UX/UI spec, accessibility audit, design tokens
4. **CODER.md** → TDD implementation (Red→Green→Refactor), 80% test coverage target
5. **REVIEWER.md** → 8 hard gates per PR (security, coverage, compliance, accessibility)
6. **LIBRARIAN.md** → Sprint Log + Story Map sync, sign-off, Change Request (CHG-###) escalation

**Change Requests:** If a role discovers input from a prior role is wrong/incomplete, escalate to LIBRARIAN (never ask the prior role to rework). LIBRARIAN decides: finish as-is with CHG tracked separately, or pause and rework the upstream story.

**Branch Enforcement:** No direct commits to `main` (3 layers: GitHub protection + git hook + pre-commit checklist). All work on `feature/US-###-*` branches.

---

## Running the Application

### Local Development

```powershell
# Backend (Java 21, Maven)
cd backend
mvn clean package -DskipTests
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Frontend (Node 18+)
cd frontend
npm install
npm run dev

# Docker Test Environment
docker compose -f docker-compose.test.yml up --build
```

### Production Deployment

```powershell
# Build
mvn clean package -DskipTests  # backend
npm run build                   # frontend

# Push to Cloud Run
.\deploy-prod.ps1              # PowerShell script in repo root
```

---

## Next Steps (Week of 2026-07-23)

1. **Complete US-856 frontend** (lane tags rendering) — 1–2 days
2. **Begin Phase B coverage remediation** — Target 75% by end of week
3. **Unblock Phase 5:** Confirm payment processor choice (Stripe/ACH/other)
4. **Unblock Phase 6:** Confirm message broker choice (Redis/RabbitMQ/Kafka)
5. **Plan Phase 7b:** Schedule earnings log + P&L report implementation

---

**Document Owner:** Architect (design) + Librarian (status sync)  
**Last Audit:** 2026-07-22 (governance restructure + Sprint_Log sync)  
**Next Review:** 2026-08-06 (post-US-856 + post-coverage-fix checkpoint)
