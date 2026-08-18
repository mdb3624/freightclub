# FreightClub Platform Requirements

**Last Updated:** 2026-07-23  
**Status:** 38 stories complete (45%), 60+ stories pending migration implementation  
**Backend Test Coverage:** 69.49% (Branch), enforced minimum 65% via JaCoCo  
**Architecture:** Multi-tenant PostgreSQL + Spring Boot 3.5.16 + React 18 + Vite  

---

## Executive Summary: Completion by Phase

| Phase | Title | Total Stories | DONE | % Complete | Notes |
|-------|-------|---------------|------|-----------|-------|
| **Security & Infrastructure** | Critical hardening & RLS | 6 | 6 | 100% | ✅ SEC-001/SEC-002/INF-001/US-857/858/849/850/851/852/853 DONE |
| **Phase 1** | Core Load Lifecycle | 5 | 5 | 100% | ✅ Multi-tenant registration, JWT, Load CRUD, claiming, status transitions |
| **Phase 2** | Notifications & EIA | 3 | 3 | 100% | ✅ Email/in-app notifications, EIA diesel pricing |
| **Phase 3** | Document Management | 5 | 5 | 100% | ✅ S3 storage, BOL, POD photos, audit logging |
| **Phase 4** | Ratings & Reviews | 4 | 4 | 100% | ✅ Bidirectional ratings, shipper reputation, history, load-board badge |
| **Phase 5** | Payments & Invoicing | 7 | 1 | 14% | 🟡 PARTIAL: US-506 DONE; US-501–505,507 MIGRATION_PENDING (Stripe integration live but UI pending) |
| **Phase 6** | In-App Messaging | 4 | 0 | 0% | ⚠️ PENDING: No message broker infrastructure |
| **Phase 7a** | Carrier Dashboard MVP | 8 | 8 | 100% | ✅ Cost profile, load filtering, earnings, equipment mgmt, payment status |
| **Phase 7** | Carrier & Shipper MVP | 12 | 5 | 42% | 🟡 PARTIAL: US-701/702/703/707/707-v2/710/713/715 DONE; US-705/706/708/709/711/712/714 PENDING |
| **Phase 7A** | DOT Compliance | 4 | 0 | 0% | ⚠️ PENDING: DOT/CDL/insurance/equipment monitoring |
| **Phase 7b** | Financial Intelligence | 8 | 0 | 0% | ⚠️ PENDING: Earnings log, P&L, IFTA tracking, tax reporting |
| **Phase 8** | Bidding & Advanced Matching | 5 | 0 | 0% | ⚠️ PENDING: Open-to-bids, bid acceptance, auto-close, LTL |
| **Phase 9** | Admin & Intelligence | 10 | 0 | 0% | ⚠️ PENDING: Admin dashboard, metrics, ELD integration, TMS API |
| **Phase 10** | Shipper Dashboard Refinement | 5 | 5 | 100% | ✅ KPI tiles, header nav, shipment status, quick actions, carrier search |
| **Phase 11** | Design System Integration | 7 | 5 | 71% | 🟡 PARTIAL: US-840–844/846 DONE; US-845 READY_FOR_DESIGN; US-847 BACKLOG |
| **Cross-Cutting** | Governance & Testing | 3 | 3 | 100% | ✅ US-855/856/859/860 (Home page, lane tags, process improvements) |
| **TOTALS** | | **~125** | **54** | **43%** | ✅ Foundation complete; core flows operational; advanced features pending |

---

## Detailed Requirements by Phase

### Security & Infrastructure (6 stories) — ✅ COMPLETE

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **SEC-001** | @PreAuthorize on DELETE/PUT Endpoints | [DONE] | Backend: All DELETE/PUT endpoints secured with @PreAuthorize | ✅ 10/10 tests PASS, 80% branch coverage |
| **SEC-002** | PostgreSQL RLS Policies | [DONE] | 5-table RLS enforcement: users, loads, refresh_tokens, notifications, shipper_profiles | ✅ Idempotent Flyway, 5/5 tests PASS |
| **US-857** | Narrow Login-Flow RLS Bypass | [DONE] | Created freightclub_login_lookup role; AuthService refactored to bind TenantContextHolder before JPA ops | ✅ BYPASSRLS revoked (2026-07-22) |
| **US-858** | RLS Write-Path Investigation | [DONE] | Replaced dead RlsStatementInspector with TenantAwareDataSource + TenantContextHolder session GUC binding | ✅ 940-test suite green, RLS enforced on WRITE |
| **INF-001** | Flyway Migration Idempotency | [DONE] | 20+ migrations wrapped in DO...IF NOT EXISTS blocks | ✅ Exception handling, all idempotent |
| **US-849** | Access Token Refresh Interceptor | [DONE] | GlobalExceptionHandler + frontend AxiosInterceptor for 401 → refresh + retry flow | ✅ 258 unit tests, E2E verified |
| **US-850** | Custom Font Loading (Vite) | [DONE] | Switched public/fonts @import to dynamic import() for prod nginx serving | ✅ Zero font 404s in prod build |
| **US-851** | Production Deploy Infrastructure | [DONE] | Fixed flyway-maven-plugin version, rewrote deploy-prod.ps1 to use Secret Manager | ✅ Credential rotation deferred by user |
| **US-852** | Plan-First Mandate | [DONE] | Added gate to CODER.md, pre-commit hook blocking duplicate deploy*.ps1 | ✅ Process enforcement live |
| **US-853** | Testing Standards Updates | [DONE] | Console/Network Error Guard added to REVIEWER; Docker env limitation documented | ✅ Permanent standards update |
| **US-854** | Per-Load Diesel Fuel Cost Resolution | [DONE] | StateToEiaRegionResolver + per-load EIA PADD mapping + LoadSummaryResponse.regionUsed | ✅ REVIEWER PASS, E2E 6/6 PASS |
| **US-855** | Marketing Home Page & Login Modal | [DONE] | HomePage.tsx hero/features/persona-split, LoginModal via router state, /login route retired | ✅ Deployed to production |
| **US-860** | Home Page CTA Simplification & Signup Modal | [DONE] | Removed header CTAs, added SignupModal.tsx, hero CTA → signup, deployed | ✅ Deployed to production |

---

### Phase 1: Core Load Lifecycle (5 stories) — ✅ COMPLETE

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-101** | Multi-Tenant Registration | [DONE] | AuthController.register(), UserService.createUser(), TenantContextHolder binding, JWT generation | ✅ RLS-enabled, no Lombok, full test coverage |
| **US-102** | Tenant Context & JWT | [DONE] | TenantContextHolder + RefreshTokenRepository pessimistic locking, HTTP-only refresh cookie | ✅ RLS, no Lombok |
| **US-103** | Load CRUD (Create/Edit/Cancel/Publish) | [DONE] | LoadController + LoadService with soft-delete, RLS isolation, status validation | ✅ RLS, no Lombok |
| **US-104** | Load Board & Claiming Workflow | [DONE] | LoadBoardController.listOpenLoads(), pessimistic lock on claim, LoadClaimedEvent | ✅ Pessimistic locking, RLS |
| **US-105** | Load Status Transitions (Pickup & Delivery) | [DONE] | LoadPickedUpEvent, LoadDeliveredEvent, status machine with RLS guards | ✅ RLS, no Lombok, NFR-504 caching |

---

### Phase 2: Notifications & EIA Integration (3 stories) — ✅ COMPLETE

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-201** | Email Notifications (Claim/Pickup/Delivery/Cancel) | [DONE] | EmailService + event listeners (LoadClaimedEvent, LoadPickedUpEvent, etc.), Mailgun integration | ✅ No Lombok, NFR-504 (1m TTL) |
| **US-202** | In-App Notification Bell & Read Status | [DONE] | NotificationController + NotificationService, unread count badge, read-status soft delete | ✅ No Lombok, NFR-504 (30s TTL) |
| **US-203** | EIA Diesel Pricing API (6h Cache) | [DONE] | EiaFuelPriceService + StateToEiaRegionResolver, REST API integration, 6h TTL caching | ✅ No Lombok, NFR-504 (6h TTL) |

---

### Phase 3: Document Management (5 stories) — ✅ COMPLETE

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-301** | S3 File Storage & Signed URLs | [DONE] | DocumentService + S3 presigned-URL generation, upload/download/delete endpoints | ✅ RLS, no Lombok |
| **US-302** | Platform-Generated BOL | [DONE] | BolGeneratorService (iText), LoadDocument creation, automatic PDF generation on load creation | ✅ RLS, no Lombok |
| **US-302-v2** | BOL Pickup Attestation (Carrier Confirm+Lock) | [DONE] | BOL read-only after pickup confirmation, attestation_confirmed_at tracking | ✅ RLS, no Lombok |
| **US-303** | BOL/POD Photo Upload & Viewing | [DONE] | DocumentController, multipart photo upload to S3, soft-delete tracking | ✅ RLS, no Lombok |
| **US-305** | POD Upload UI Completion | [DONE] | Frontend POD form, photo capture, signature confirmation, soft-delete UI | ✅ RLS, no Lombok |
| **US-308** | Document Audit Log Service | [DONE] | DocumentAuditLogRepository, all doc reads/writes logged, AuditLogInterceptor | ✅ RLS, no Lombok |

---

### Phase 4: Ratings & Reviews (4 stories) — ✅ COMPLETE

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-401** | Bidirectional Rating System | [DONE] | RatingController + RatingService, carrier→shipper + shipper→carrier bidirectional | ✅ RLS, no Lombok, NFR-504 (1h TTL) |
| **US-402** | Shipper Reputation Profile & Aggregation | [DONE] | ShipperReputationService, avg rating + on-time %, 5-star badge display | ✅ RLS, no Lombok, NFR-504 (2h TTL) |
| **US-403** | Rating History & Timeline | [DONE] | RatingHistoryRepository with soft-delete, paginated timeline view, audit trail | ✅ RLS, no Lombok, NFR-504 (30m TTL) |
| **US-405** | Shipper Reputation Badge on Load Board | [DONE] | LoadSummaryResponse includes shipper avg rating + badge, displayed on LoadBoardTable | ✅ NFR-504 (2h TTL) |

---

### Phase 5: Payments & Invoicing (7 stories) — 🟡 PARTIAL (14% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-501** | Auto Invoice Generation | [MIGRATION_PENDING] | Draft: InvoiceService skeleton exists, not wired to load settled event | ⚠️ Needs completion |
| **US-502** | Payment Processing (Stripe/ACH) | [IN_PROGRESS] | StripeWebhookController, Stripe Connect live, trucker transfer + platform fee logic exists | ✅ Payment processor integrated |
| **US-503** | Bank Account Setup & Verification | [MIGRATION_PENDING] | No UI/backend implementation | ⚠️ Pending |
| **US-504** | Payment History & Ledger | [MIGRATION_PENDING] | Draft: PaymentLedgerRepository skeleton, not populated | ⚠️ Pending |
| **US-505** | Receipt Generation & Export | [MIGRATION_PENDING] | No implementation | ⚠️ Pending |
| **US-506** | SETTLED Load Status & Workflow | [DONE] | LoadSettledEvent, settle + dispute endpoints, shipper UI for status | ✅ RLS, no Lombok |
| **US-507** | Payment Dispute Flow & Resolution | [MIGRATION_PENDING] | DisputeController exists, full workflow not implemented | ⚠️ Pending |

---

### Phase 6: In-App Messaging (4 stories) — ⚠️ PENDING (0% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-601** | Per-Load Message Threads | [MIGRATION_PENDING] | MessageOutbox table exists (created 2026-05-07), no service/controller | ⚠️ Message broker required |
| **US-602** | Real-Time Messaging (WebSocket/SSE) | [MIGRATION_PENDING] | No infrastructure | ⚠️ Blocked: message broker needed |
| **US-603** | Unread Message Badge | [MIGRATION_PENDING] | Not implemented | ⚠️ Blocked: US-601 prerequisite |
| **US-604** | Message Notifications | [MIGRATION_PENDING] | Not implemented | ⚠️ Blocked: US-601 prerequisite |

---

### Phase 7a: Carrier Dashboard MVP (8 stories) — ✅ COMPLETE

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-730** | EPIC: Carrier Dashboard MVP | [DONE] | TruckerDashboard.tsx + CarrierProfileHub, operations platform on mobile | ✅ Dark theme, ≥48px buttons |
| **US-730-0** | Dashboard Structure & Mobile Design Spec | [DONE] | TruckerDashboard.tsx, mobile-first responsive grid | ✅ Matches locked spec |
| **US-730a** | Cost Profile Setup API & UI | [DONE] | ProfileHub CostProfileSection, RPM calculation endpoint, persistence verified | ✅ Verified live |
| **US-730a-v2** | Cost Profile Wizard Redesign | [DONE] | /carrier/cost-profile screen with summary + 3-step wizard | ✅ REVIEWER PASS 2026-07-08 |
| **US-730b** | Profitable Load Visibility & Filtering | [DONE] | ProfitabilityCard + LoadBoardTab, $/mile threshold filtering | ✅ Live on dashboard |
| **US-730c** | Performance Visibility Dashboard Metrics | [DONE] | MyStatsTab: on-time %, avg RPM, loads completed, miles driven | ✅ Real data |
| **US-730d** | Unified Carrier Dashboard | [DONE] | TruckerDashboard.tsx aggregates hero load + stats + board | ✅ Hook-driven |
| **US-730e** | Equipment & Lane Management | [DONE] | CarrierProfileHub EquipmentTab/LanesTab, equipment types, availability | ✅ Full UI |
| **US-730f** | Payment Acknowledgment (MVP) | [DONE] | Read-only payment status endpoint + frontend display | ✅ Deployed 2026-07-05 |
| **US-730h** | Carrier Identity & Credentials Profile | [DONE] | /carrier/profile screen: identity, DOT/MC/CDL/insurance/med-card expiry | ✅ REVIEWER PASS 2026-07-08 |

---

### Phase 7: Carrier & Shipper MVP (12 stories) — 🟡 PARTIAL (42% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-701** | Carrier Profiles (Truck/Trailer/Capacity) | [DONE] | CarrierEquipmentRepository, equipment CRUD, capacity tracking | ✅ RLS, no Lombok, NFR-504 (1h TTL) |
| **US-702** | Trucker Preferred Lanes (Region-Based) | [DONE] | CarrierLaneRepository + CarrierLaneService, origin/dest region filtering | ✅ RLS, no Lombok, NFR-504 (1h TTL) |
| **US-703** | Trucker Availability (Days/Hours) | [DONE] | CarrierAvailabilityRepository, recurring schedule tracking | ✅ RLS, no Lombok, NFR-504 (5m TTL) |
| **US-705** | Load Board Filters (Weight, Min Pay) | [PARTIAL] | Backend: equipment weight + pay filters implemented; UI: partial checkbox binding | 🟡 AC incomplete |
| **US-706** | Load Posting Validation Prompts (Shipper) | [PARTIAL] | Frontend validation prompts exist; backend validation rules incomplete | 🟡 AC incomplete |
| **US-707** | Shipper Preferred Carrier List | [DONE] | ShipperPreferredCarrierController, carrier CRUD, 7 backend tests PASS | ✅ RLS, no Lombok |
| **US-707-v2** | Preferred Carriers: Nav + Search Redesign | [DONE] | AppShell integration, GET /api/v1/carriers/search endpoint, 8 backend tests PASS | ✅ Browser verified 2026-06-05 |
| **US-708** | Direct Load Assignment to Carrier | [MIGRATION_PENDING] | Assignment table schema exists, no service/controller | ⚠️ Event-driven invalidation needed |
| **US-709** | Block Carrier (Prevent Visibility) | [MIGRATION_PENDING] | BlockedCarrierController skeleton, RLS policy needed | ⚠️ Event-driven invalidation needed |
| **US-710** | View Carrier Public Profile | [DONE] | CarrierPublicProfileController, reputation + equipment, 100% branch coverage, 8 tests PASS | ✅ E2E: 6/6 PASS |
| **US-711** | Load Interest / View Count Tracking | [MIGRATION_PENDING] | LoadViewTrackingController skeleton, cache invalidation needed | ⚠️ NFR-504 (5m TTL) |
| **US-712** | View Shipper Public Profile | [MIGRATION_PENDING] | Profile schema exists, payment-speed calculation not implemented | ⚠️ Depends on US-502 |
| **US-713** | Shipper Company Profile Setup | [DONE] | ShipperProfileService, multi-tenant company info, soft-delete tracking | ✅ RLS, no Lombok, NFR-504 (5m TTL) |
| **US-714** | Trucker Onboarding Checklist | [READY_FOR_DESIGN] | Checklist schema drafted, design review needed | 📋 Design gate pending |
| **US-715** | Shipper Dashboard (Load Summary & Management) | [DONE] | ShipperDashboardPage.tsx, active loads display, management UI | ✅ RLS, no Lombok, NFR-504 (2m TTL) |

---

### Phase 7A: DOT Compliance & Documentation (4 stories) — ⚠️ PENDING (0% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-720** | USDOT & DOT Registration Verification | [MIGRATION_PENDING] | No implementation | ⚠️ Requires external DOT API integration |
| **US-721** | Insurance Certificate Tracking | [MIGRATION_PENDING] | No implementation | ⚠️ Document storage dependency |
| **US-722** | CDL & Medical Card Documentation | [MIGRATION_PENDING] | No implementation | ⚠️ Document expiry tracking needed |
| **US-723** | Equipment Condition Monitoring | [MIGRATION_PENDING] | No implementation | ⚠️ New entity model needed |

---

### Phase 7b: Financial Intelligence (8 stories) — ⚠️ PENDING (0% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-730g** | Per-Load Earnings Log | [MIGRATION_PENDING] | Schema drafted, calculation logic not implemented | ⚠️ Depends on US-305 (POD complete) ✅, US-502 (payments) 🟡 |
| **US-731** | Weekly/Monthly P&L Report | [MIGRATION_PENDING] | No implementation | ⚠️ Depends on US-730g |
| **US-732** | IFTA Mileage Tracking by State | [MIGRATION_PENDING] | No implementation | ⚠️ Geo-tracking data needed |
| **US-733** | Deadhead Mileage Estimation | [MIGRATION_PENDING] | No implementation | ⚠️ Routing service needed |
| **US-734** | Deadhead Cost in Profitability | [MIGRATION_PENDING] | No implementation | ⚠️ Depends on US-733 |
| **US-735** | Fuel Surcharge Auto-Calculation | [MIGRATION_PENDING] | No implementation | ⚠️ EIA integration dependency (US-203 ✅) |
| **US-736** | Annual Earnings & Tax Summary Export | [MIGRATION_PENDING] | No implementation | ⚠️ PDF export service needed |
| **US-737** | Extract trucker_cost_profiles (Data Migration) | [MIGRATION_PENDING] | No implementation | ⚠️ One-time migration |

---

### Phase 8: Bidding & Advanced Matching (5+ stories) — ⚠️ PENDING (0% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-740** | Post Load as Open-to-Bids vs FCFS | [MIGRATION_PENDING] | Load.postType schema field exists, no UI/service logic | ⚠️ Bid workflow needed |
| **US-741** | Trucker Submits Bid (Rate + Message) | [MIGRATION_PENDING] | BidRepository table drafted, no service/controller | ⚠️ Depends on US-740 |
| **US-742** | Shipper Reviews/Accepts/Rejects Bids | [MIGRATION_PENDING] | No implementation | ⚠️ Depends on US-741 |
| **US-743** | Bid Expiry & Auto-Close (Background Job) | [MIGRATION_PENDING] | No scheduled job infrastructure | ⚠️ Needs background job service |
| **US-744** | Duplicate Load for Recurring Lanes | [MIGRATION_PENDING] | No implementation | ⚠️ Scheduler service needed |
| **US-745** | Freight Class Field (LTL Support) | [MIGRATION_PENDING] | No schema changes | ⚠️ Depends on US-101 |

---

### Phase 9: Admin & Intelligence Tools (10 stories) — ⚠️ PENDING (0% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-750** | Admin Dashboard (Users/Loads/Tenants) | [MIGRATION_PENDING] | No implementation | ⚠️ Admin role/auth needed |
| **US-751** | Dispute Resolution Tools (Admin) | [MIGRATION_PENDING] | No implementation | ⚠️ Admin role dependency |
| **US-752** | Platform Health Metrics (Real-Time) | [MIGRATION_PENDING] | No implementation | ⚠️ Metrics collection needed |
| **US-753** | Rate Benchmarking Tool (Shipper) | [MIGRATION_PENDING] | No implementation | ⚠️ Historical pricing analysis |
| **US-754** | Carrier Scorecard (Detailed Metrics) | [MIGRATION_PENDING] | No implementation | ⚠️ Advanced analytics needed |
| **US-755** | ELD Integration for HOS Tracking | [MIGRATION_PENDING] | No implementation | ⚠️ Third-party ELD API |
| **US-756** | Document Upload (Insurance/CDL/Medical) | [MIGRATION_PENDING] | S3 infrastructure exists (US-301 ✅), no business logic | ⚠️ Depends on US-721/722 |
| **US-757** | Freight Insurance Integration | [MIGRATION_PENDING] | No implementation | ⚠️ Third-party insurance provider needed |
| **US-758** | TMS API Access (REST for Shippers) | [MIGRATION_PENDING] | No implementation | ⚠️ API gateway/key mgmt needed |
| **US-759** | Recurring Load Scheduling | [MIGRATION_PENDING] | No implementation | ⚠️ Background job service needed |

---

### Phase 10: Shipper Dashboard Refinement (5 stories) — ✅ COMPLETE

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-820** | KPI Summary Display (Active Shipments/On-Time %/Cost-per-Mile) | [DONE] | KPISummaryService + KPISummaryController, 3 KPI tiles with "No data" state | ✅ REVIEWER APPROVED, E2E 7.2s PASS |
| **US-821** | Shipper Header Navigation (Logo/Bell/Avatar) | [DONE] | AppShell header with notification dropdown + avatar menu, smart red badge | ✅ REVIEWER APPROVED, E2E PASS |
| **US-822** | Shipment Status Panel (Active Shipments List) | [DONE] | Frontend active-shipments list, status badges, progress bars, bronze styling | ✅ 91.4% coverage, LIBRARIAN CLOSED |
| **US-823** | Dashboard Layout Skeleton (Grid + Placeholders) | [DONE] | ShipperDashboardPage.tsx responsive grid, AppShell wrapper, CSS token compliance | ✅ 100% token compliance, 11/11 E2E PASS |
| **US-824** | Quick Actions Panel (Post/Quote/Track/Preferences) | [DONE] | QAP component with 4 action buttons, onClick routing, bronze button styling | ✅ E2E tests PASS |
| **US-825** | Carrier Search Panel (Origin/Dest Search + Results) | [DONE] | Carrier search form + results grid, API wired, validation working | ✅ E2E tests PASS |

---

### Phase 11: v0.1.0 Design System Integration (7 stories) — 🟡 PARTIAL (71% complete)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-840** | Design Token Import (CSS variables/Tailwind) | [DONE] | Tailwind config extended with brand tokens, CSS custom properties defined | ✅ MERGED PR #10 (2026-06-30) |
| **US-841** | UI Primitive Styling (Button/Input/StatusBadge) | [DONE] | Button, Input, StatusBadge components use design tokens, dark-mode aware | ✅ MERGED PR #11 (2026-06-30) |
| **US-842** | Layout Shell Reskin (AppShell header/dark removal) | [DONE] | AppShell header restyled, legacy dark theme removed, token-based colors | ✅ MERGED PR #12 (2026-06-30) |
| **US-843** | Shipper Dashboard Reskin (KPI cards/load table) | [DONE] | KPI cards + load table use design tokens, shadow/spacing standardized | ✅ MERGED PR #13 (2026-06-30) |
| **US-844** | Carrier Load Board UX (filter/lock/nav) | [DONE] | Equipment filter, board lock styling, post-action navigation, dark-mode cards | ✅ REVIEWER PASS + LIBRARIAN (2026-07-02) |
| **US-845** | Load Creation Form Fields | [READY_FOR_DESIGN] | Form structure exists, design token application pending | 📋 P1 design gate needed |
| **US-846** | Shipper Action Zone Restructure | [DONE] | Action zone buttons reorganized per design spec, spacing/alignment fixed | ✅ MERGED PR #13, REVIEWER PASS |
| **US-847** | Persona Token Migration | [BACKLOG] | Deferred; optional post-design-system | P2 — not blocking |

---

### Cross-Cutting Stories (Governance & Testing)

| Story ID | Title | Status | Implementation | Notes |
|----------|-------|--------|-----------------|-------|
| **US-856** | Lane Tags on Carrier Search Cards | [IN_PROGRESS] | Backend AC-1 COMPLETE: CarrierLaneSearchResult.lanes field, batch-loaded; Frontend AC-2–AC-5 not started | ⚠️ Design system work ongoing |
| **US-859** | Process Fixes: LIBRARIAN PR-verification | [DONE] | Mandatory `gh pr view` verification step + test-run guidance added to LIBRARIAN.md | ✅ 2026-07-22 |

---

## Compliance & Hard Gates

### Architectural Standards (All Phases)

| Standard | Requirement | Enforcement | Status |
|----------|-------------|------------|--------|
| **Multi-Tenancy (RLS)** | All SELECT/INSERT/UPDATE/DELETE queries tenant-scoped via row_level_security | Flyway RLS policies + code review | ✅ Enforced on 54 completed stories |
| **No-Lombok** | Standard Java POJOs, manual getters/setters | Code review grep for @Getter/@Setter | ✅ Enforced on all backend stories |
| **Soft Deletes** | Never `DELETE`, always `deleted_at = CURRENT_TIMESTAMP` | Code review + schema constraints | ✅ All entity repositories include deleted_at IS NULL filter |
| **Pessimistic Locking** | `@Lock(LockModeType.PESSIMISTIC_WRITE)` for resource claims | Code review | ✅ Used on refresh-token rotation, load claiming |
| **NFR-504 Caching** | All GET endpoints specify TTL (5m–24h per endpoint class) | Design review + architecture gate | ✅ Documented for Phase 7+ stories |
| **Test Coverage ≥65% (Branch)** | JaCoCo enforced minimum via `mvn test` `check` goal | CI/CD gate (`mvn test` bound to JaCoCo check) | ✅ Current: 69.49% (target 80%) |
| **Complexity <10** | Cyclomatic complexity per method <10 | Code review + optional SonarQube analysis | ✅ Enforced in REVIEWER gate |

---

## Known Technical Debt & Blockers

### Resolved Issues

- **✅ RLS Write-Path Enforcement (US-858):** Confirmed `RlsStatementInspector` was dead code; replaced with `TenantAwareDataSource` SET LOCAL binding. RLS now genuinely enforced on writes.
- **✅ Access Token Refresh (US-849):** Added GlobalExceptionHandler 401 → AxiosInterceptor retry flow; 15-min token expiry no longer causes silent failures.
- **✅ Font Loading in Prod (US-850):** Vite dev server masked public @import bugs; switched to dynamic import() for prod nginx serving.
- **✅ Production Deployment (US-851):** Fixed flyway-maven-plugin version, removed hardcoded secrets from deploy-prod.ps1, added env-var support.

### Open Technical Debt

| Issue | Impact | Workaround | Next Steps |
|-------|--------|------------|-----------|
| **Phase 6 Message Broker** | Blocks 4 stories (US-601–604) | None | Need WebSocket or SSE infrastructure |
| **Phase 5 Payment UI** | Stripe backend live, but CRUD UI not wired | Manual payment setup via admin | Complete US-503 (bank account setup) UI |
| **Phase 7A/7b Heavy Dependencies** | DOT/IFTA/ELD integrations pending vendor APIs | Stub services + mocks | Third-party API contracts needed |
| **Admin Persona (Phase 9)** | No design system or auth enforcement | None | Create US-750 prerequisites (admin role, design) |

---

## Frontend Architecture

### Key Packages
- **React 18 + TypeScript** — type-safe component system
- **Vite 5** — fast dev server + prod build, proxies to backend port 9090
- **Tailwind CSS 3.x** — utility-first styling with design tokens
- **React Query v5** — server state management, auto-invalidation
- **Zustand** — lightweight client state (auth, UI toggles)
- **React Router v6** — SPA routing, ProtectedRoute guards
- **React Hook Form + Zod** — form validation + schema validation

### Key Pages (Implemented)
- **HomePage.tsx** — Marketing home, persona split, in-page login/signup modals
- **TruckerDashboard.tsx** — Carrier dashboard (Phase 7a epic), mobile-first dark theme
- **ShipperDashboardPage.tsx** — Shipper home (Phase 10), KPI tiles + shipment status + quick actions
- **LoadBoardPage.tsx** — Load board with filters, equipment/lane filtering
- **ProfilePage.tsx** — Carrier/shipper multi-tab profile (equipment, lanes, cost profile wizard)
- **LoginForm.tsx / RegisterForm.tsx** — Auth forms with email/password, reused in modals

### Key Hooks
- **useLogin()** — JWT auth, refresh token in HTTP-only cookie
- **useLogout()** — Sign-out, clear React Query cache
- **useDashboardSummary()** — Shipper KPI tiles data (deprecated in favor of useKPISummary)
- **useKPISummary()** — Shipper KPI tiles via /shipper/dashboard/kpi-summary
- **useCarrierSearch()** — Carrier search API integration
- **useLoadBoard()** — Open loads list with filters

---

## Backend Architecture

### Key Controllers & Services
- **AuthController / AuthService** — Multi-tenant registration, JWT, refresh-token rotation
- **LoadController / LoadService** — Load CRUD, soft-delete, load-board list with RLS + filters
- **ProfileController / ProfileService** — Carrier/shipper profile, equipment, lanes, cost profile
- **CarrierCostProfileController / CarrierCostProfileService** — RPM calculation, diesel pricing (US-854)
- **NotificationController / NotificationService** — Email + in-app notifications, soft-delete read status
- **RatingController / RatingService** — Bidirectional ratings, shipper reputation aggregation
- **KPISummaryController / KPISummaryService** — Shipper dashboard KPI tiles (active shipments, on-time %, cost/mile)
- **StripeWebhookController** — Stripe Connect webhook handling, trucker transfers, platform fees

### Key Repositories
- **UserRepository** — Multi-tenant user isolation via RLS
- **LoadRepository** — Open loads list, soft-delete filter, RLS isolation
- **RefreshTokenRepository** — Pessimistic locking for token rotation
- **CarrierEquipmentRepository** — Equipment CRUD per carrier
- **CarrierLaneRepository** — Lane definitions (origin/dest/equipment type)
- **RatingRepository** — Bidirectional ratings with RLS
- **ShipperProfileRepository** — Shipper company info, soft-delete
- **NotificationRepository** — Unread notification count + soft-delete read status

### Database Tables (23 Flyway migrations)
- **tenants** — Multi-tenant isolation root
- **users** — Carrier/shipper users, soft-delete
- **loads** — Load postings, status machine (OPEN → CLAIMED → IN_TRANSIT → DELIVERED), soft-delete
- **refresh_tokens** — HTTP-only cookie tokens, pessimistic locking
- **load_documents** — BOL/POD storage links, soft-delete
- **load_events** — Audit trail (LoadClaimedEvent, LoadPickedUpEvent, etc.)
- **notifications** — Email + in-app alerts, soft-delete read status
- **ratings** — Bidirectional carrier↔shipper ratings
- **carrier_profiles** — Trucker identity + DOT/MC info
- **carrier_equipment** — Truck/trailer types, capacity
- **carrier_lanes** — Trucker preferred lanes (origin/dest/availability)
- **carrier_availability** — Recurring schedule (days/hours open)
- **shipper_profiles** — Shipper company info, payment speed calc
- **load_ratings** — Load-specific shipper reputation snapshots
- **quick_pay_settlements** — Settlement ledger + status tracking
- **payment_accounts** — Bank account info for trucker payouts
- **message_outbox** — Message event log (Phase 6, not yet implemented)
- **document_audit_log** — All document read/write events (US-308)
- **carrier_cost_profiles** — RPM + fuel-cost thresholds per carrier (US-730a)
- **shipper_reputation** — Cached shipper avg rating + on-time % (US-402)
- **load_recommendations** — Carrier-to-load matching scores (Phase 8, not yet implemented)

---

## Summary: What's Built vs. What's Pending

### ✅ Production-Ready (43% complete)
- Core load lifecycle: registration, JWT, load CRUD, claiming, status transitions
- Multi-tenancy: tenant isolation via RLS, soft deletes
- Notifications: email + in-app alerts
- Documents: S3 storage, BOL generation, POD upload + audit logging
- Ratings: bidirectional carrier↔shipper, shipper reputation aggregation
- Carrier dashboard: cost profile, profitability filters, performance metrics, equipment/lanes, payment status
- Carrier management: profiles, preferred lanes, availability, public profile view, preferred-carrier list
- Shipper dashboard: KPI tiles (active shipments, on-time %, cost/mile), header nav, shipment status, quick actions, carrier search
- Design system: v0.1.0 token import, UI primitives, layout shell, dashboard reskin (71% complete)
- Governance: RLS enforcement, testing standards, process improvements, home page + signup modal

### 🟡 Partial (10% complete)
- Payments: Stripe Connect live, webhook handling, trucker transfers + platform fees; bank account setup UI pending
- Load filtering: weight/pay filters backend OK, UI binding incomplete
- Load posting validation: frontend prompts exist, backend rules incomplete
- Carrier search lane extension: backend ready, frontend card rendering not started

### ⚠️ Not Started (47% complete)
- In-app messaging: message broker infrastructure needed
- DOT compliance: USDOT registration, insurance, CDL/medical card, equipment monitoring
- Financial intelligence: earnings log, P&L reports, IFTA tracking, tax exports
- Bidding: open-to-bids vs FCFS, bid submission/review/expiry, recurring load duplication, LTL support
- Admin tools: dashboard, dispute resolution, health metrics, rate benchmarking, carrier scorecard, ELD/TMS APIs
- Recurring scheduling: background job service needed

---

## Next Steps (Priority Order)

1. **Phase 6 Infrastructure:** Evaluate WebSocket vs SSE for messaging; implement message broker (Kafka/Redis/RabbitMQ)
2. **Phase 5 Payment UI:** Complete US-503 (bank account setup form), wire US-504 (payment history), implement US-505 (receipt export)
3. **Phase 7b Quick Wins:** US-730g (earnings log), US-735 (fuel surcharge auto-calc) — leverages existing US-203 + US-854
4. **Phase 8 Bidding MVP:** US-740 (open-to-bids toggle), US-741 (bid submission), US-742 (shipper review) — high-value carrier competitiveness
5. **Admin Foundations:** Define admin persona design system, implement US-750 (user/load/tenant dashboard), add admin auth role
6. **Phase 11 Completion:** US-845 (load form styling), US-847 (token migration) — design system completeness

---

**Generated:** 2026-07-23  
**Source:** Story_Map.md + controller/service discovery + Flyway migration audit  
**Maintainer:** LIBRARIAN role (docs/roles/LIBRARIAN.md)
