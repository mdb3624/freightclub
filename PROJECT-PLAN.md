# FreightClub — Project Plan & Status

**Last Updated:** 2026-04-02  
**Current Branch:** phase-2  
**Status:** Phase 1.2 Complete ✅ | Phase 2 In Progress (76%) 🔄

---

## Project Goal

FreightClub is a digital load board and logistics platform connecting shippers and truckers for freight movement. It provides real-time load posting, claiming, status tracking, financial profitability analysis, and communication tools to streamline the trucking supply chain.

---

## Phase Summary Table

| Phase | Name | Status | % Done | Key Deliverables |
|-------|------|--------|--------|------------------|
| 1 | Core Load Lifecycle | Complete | 100% | Auth, load CRUD, claiming, status transitions, trucker dashboard, shipper dashboard |
| 1.1 | UX Hardening | Complete | 100% | State validation, cross-field date validation, HOS tracking, address field reorder, toast notifications |
| 1.2 | Security & Stability Hardening | Complete | 100% | Race condition fixes (load claiming, token rotation), rate limiting, JWT validation, error boundary, actuator |
| 2 | Notifications & Status Timeline | In Progress | 76% | Email notifications (5/5 done), in-app notifications (3/3 done), status timeline (2/2 done), cancellation with reason (3/3 done), EIA fuel prices (5/5 done), SMS (0/1 pending), EIA attribution (0/1 pending) |
| 3 | Document Management (BOL & POD) | Partially Scaffolded | 10% | Schema + service stubs exist; file storage (S3) not provisioned; generation pipeline not wired |
| 4 | Ratings & Reviews | Partially Complete | 67% | Bidirectional rating backend (4/6 done); shipper reputation UI missing (2/6 pending) |
| 5 | Payments & Invoicing | Planned | 0% | Invoice generation, payment processing (Stripe/ACH), receipt tracking, dispute resolution |
| 6 | In-App Messaging | Planned | 0% | Per-load message thread, WebSocket/SSE real-time delivery, unread badges |
| 7 | Advanced Carrier Management | Planned | 0% | Truck/trailer profiles, preferred lanes, availability scheduling, load suggestions |
| 7b | Advanced Financial Intelligence | Planned | 0% | Per-load earnings, P&L reports, IFTA tracking, deadhead estimates, FSC calculations |
| 8 | Bidding | Planned | 0% | Open-to-bid loads, rate bidding, shipper bid acceptance, bid expiry |
| 9 | Admin & Operations | Planned | 0% | Admin dashboard, dispute tools, platform metrics, rate benchmarking, ELD integration |

---

## Phase Detail

### Phase 1 — Core Load Lifecycle ✅ Complete (100%)

**Scope:**  
Core load management workflow, multi-tenant auth, trucker/shipper dashboards, profitability analysis, HOS tracking.

**Status & Completion:**  
All 18 requirements implemented and confirmed in code.

**What's Done:**
- **Auth & Multi-Tenancy:** Registration, login, JWT refresh tokens with rotation, tenant system with join codes
- **Load CRUD:** Create, edit, publish, cancel; draft → publish workflow
- **Claiming & Transitions:** Trucker claim → pickup → delivery; transitions write to `load_events` table
- **Dashboards:** Shipper dashboard (all loads by status), trucker dashboard (active load + history + board + filters)
- **Profiles:** Trucker + shipper profiles with editable details
- **Financial Intelligence:** Cost profile (fixed/fuel/maintenance), CPM/RPM calculators, profitability badges on board, 30-day earnings summary
- **HOS Widget:** 11-hour drive + 14-hour on-duty progress, 70-hour/8-day cycle tracking with color-coded warnings
- **Load Dimensions & Payment Terms:** L×W×H fields, pay rate, payment term selection

**What's Remaining:** None — Phase 1 is feature-complete.

**Blockers:** None.

---

### Phase 1.1 — UX Hardening ✅ Complete (100%)

**Scope:**  
Data integrity safeguards, field validation, labeling improvements, database constraints.

**Status & Completion:**  
All 22 requirements implemented and confirmed in code.

**What's Done:**
- **Critical Data Integrity:** State field dropdown validation (CHAR(2) + CHECK constraints), cancel load confirmation dialog, 70-hr/8-day HOS cycle tracking
- **UX Correctness:** Address field reorder (street first), cross-field date validation (pickupTo > pickupFrom, etc.), label rename (pickup/delivery windows), filter state preservation via URL params, equipment filter unlocked, profitability card always visible, load board grayout explanation, RPM precision (2dp), cost profile CTA, claim success toast
- **Database Hardening:** `origin_state`/`destination_state` CHAR(2) with CHECK, `loads.created_at`/`updated_at` DEFAULT CURRENT_TIMESTAMP, `loads.trucker_id` FK to `users.id` (ON DELETE SET NULL), `claims` table created
- **Labeling & Hints:** Weight field hint (80k legal max), shipper status summary strip, HOS on-duty start-time prompt, HOS <4hr warning threshold, pickup urgency signals

**What's Remaining:** None.

**Blockers:** None.

---

### Phase 1.2 — Security & Stability Hardening ✅ Complete (100%)

**Scope:**  
Race condition prevention, rate limiting, JWT hardening, secrets management, error boundaries, infrastructure health checks.

**Status & Completion:**  
All 19 requirements implemented and confirmed in code.

**What's Done:**
- **Critical Security (Data Corruption):** Pessimistic locking in `LoadService.claimLoad` (SELECT FOR UPDATE), refresh token rotation with locking, auth rate limiting (Bucket4j token bucket), JWT `iss`/`aud` claims validation
- **Secrets & Configuration:** JWT secret moved to environment variables, Tailscale domain removed, CORS `allowedHeaders` explicit whitelist (Authorization, Content-Type, X-Requested-With)
- **Known Bugs Fixed:** `claims` table written on claim (released on cancel), `load_events` table written on every transition, date comparisons use `new Date()` not string ordering, URL filter params enum-guarded, overweight acknowledgment enforced (weight > 80k), HOS state persisted via backend endpoint
- **Infrastructure:** React ErrorBoundary in App.tsx, Spring Boot Actuator (/health, /info), `application-prod.yml` with env var placeholders, structured logging with correlation IDs
- **Testing:** AuthService unit tests (register/login/refresh/logout), claim concurrency integration test

**What's Remaining:** None.

**Blockers:** None.

---

### Phase 2 — Notifications & Status Timeline 🔄 In Progress (76%)

**Scope:**  
Email notifications, in-app notification center, status event timeline, cancellation reasons, SMS (optional), EIA fuel price integration with frontend attribution.

**Status & Completion:**  
13 of 17 requirements done; 2 partial; 2 pending.

**What's Done:**
- **Email Notifications (5/5 complete):**
  - Shipper email on claim, pickup, delivery, and cancellation (with reason)
  - Trucker email when shipper cancels claimed load
  - All emails include load details (origin → destination, load ID)
  - Implemented: `NotificationService.notify*` → `EmailService.send` triggered from `LoadService`

- **In-App Notifications (3/3 complete):**
  - Notification bell with unread count badge (`NotificationBell` component)
  - Dropdown list of recent notifications (`GET /api/v1/notifications` paginated)
  - Mark read on view (`PATCH /api/v1/notifications/{id}/read` and read-all)
  - Hooks: `useMarkRead`, `useMarkAllRead`

- **Status Timeline (2/2 complete):**
  - Full status history per load (`GET /api/v1/loads/{id}/events`)
  - Timeline visible to both shipper and trucker (endpoint role-switches)
  - `load_events` table auto-populated on all transitions
  - Hook: `useLoadEvents`

- **Cancellation with Reason (3/3 complete):**
  - Required reason modal (`CancelLoadModal` with presets + freetext)
  - Reason stored on load record (`cancel_reason` column added via `V20260331_002`)
  - Trucker sees reason in email and load detail

- **EIA Fuel Price Integration (5/5 complete):**
  - Server-side proxy: `GET /api/v1/market/diesel-prices` (API key server-side only)
  - 6-hour cache with 48-hour stale threshold; fallback on outage
  - Regional data: West (R50), South (R30/R40), East, Midwest, Rocky
  - Week-over-week delta indicator (color-coded)
  - `useDieselPrices` React Query hook (shared cache, no duplicates)
  - Frontend ticker on `TruckerLandingPage` showing West and South prices
  - FSC auto-population in profitability analyzer (implemented in landing page)

**What's Remaining / Partial:**
- **SMS Notifications (2.14) — PENDING:** Marked optional in phase doc. No Twilio integration exists. Status: defer to later phase or confirm deferred.
- **EIA Attribution (2.22) — PENDING:** "Data: U.S. EIA" attribution text required by EIA Terms of Service. Not found in frontend. **ACTION REQUIRED before Phase 2 closure.**
- **EIA South Duoarea (2.17) — PARTIAL:** Implementation uses R30 + R40; spec says R4 (Gulf Coast). **ACTION REQUIRED: Verify correct duoarea code.**
- **FSC Auto-Populate on Load Detail (2.21) — PARTIAL:** Works on `TruckerLandingPage`; needs confirmation on per-load profitability card in `TruckerLoadDetailPage`.

**Blockers:**
1. EIA attribution missing (legal requirement for EIA data usage)
2. SMS optional status unconfirmed — should be deferred explicitly if out of scope
3. EIA regional mapping needs verification before go-live
4. FSC auto-population needs end-to-end confirmation on load detail pages

---

### Phase 3 — Document Management (BOL & POD) ⏳ Partially Scaffolded (10%)

**Scope:**  
Digital BOL generation, BOL/POD photo uploads, document view/export, issue reporting during transit.

**Status & Completion:**  
0 of 8 core requirements done; 2 partial (schema + service stubs exist); 6 pending.

**What's Done:**
- **Schema:** `load_documents` table created (`V20260323_001`)
- **Service Stubs:** `BolGeneratorService`, `DocumentService`, `DocumentController` exist but not fully wired
- **Frontend Components:** `DocumentSection`, `useDocuments` hook exist but depend on backend

**What's Remaining:**
- **File Storage (3.1):** S3 or object storage not provisioned — blocking all file upload features
- **BOL Generation Pipeline (3.2):** `BolGeneratorService` exists but not confirmed wired to load publish flow
- **BOL/POD Upload (3.3, 3.4):** Upload endpoints exist in stubs; trucker UI not accessible
- **View Documents (3.5):** Frontend component ready; depends on storage backend
- **PDF Export (3.6):** No PDF export endpoint
- **Document History (3.7):** Schema supports timestamps; UI not built
- **Issue Reporting (3.8):** `IssueReportModal` component exists; backend handler not confirmed

**Blockers:**
1. **No S3 / object storage provisioned** — all file uploads blocked
2. **BOL generation pipeline not wired end-to-end** — cannot confirm generation on publish
3. **Frontend upload UI not accessible** — component exists but not routed

**Next Steps:**
- Provision S3 bucket with signed upload URLs
- Wire `BolGeneratorService` to `LoadService.publishLoad()`
- Implement trucker-facing upload UI in `DocumentSection`
- Add PDF export endpoint

---

### Phase 4 — Ratings & Reviews 🔄 Partially Complete (67%)

**Scope:**  
Bidirectional trucker↔shipper ratings after delivery, aggregate rating display, shipper public reputation profile.

**Status & Completion:**  
4 of 6 requirements done; 0 partial; 2 pending.

**What's Done:**
- **Bidirectional Rating Backend (4/4 complete):**
  - `RatingController` and `RatingService` for rating submission
  - `load_ratings` table created (`V20260323_002`)
  - Trucker rates shipper; shipper rates trucker
  - Aggregate rating on trucker profile (`RatingsPage`, `useRatings` hook)

- **Rating History:** `RatingsPage` at `/ratings` displays ratings received

**What's Remaining:**
- **Shipper Reputation Profile (4.4) — PENDING:** `ShipperRepBadge` component exists but full shipper reputation profile (rating, payment speed, load count, flags) not built
- **Shipper Badge on Load Board (4.5) — PENDING:** `ShipperRepBadge` exists but not confirmed integrated into `LoadBoardTable` rows

**Blockers:**
1. Shipper reputation profile UI not built (backend data available)
2. Badge not integrated into load board card display

**Next Steps:**
- Implement shipper reputation detail page (pull data from backend reputation aggregates)
- Add `ShipperRepBadge` to `LoadBoardTable` row rendering
- Verify reputation data freshness (update frequency)

---

### Phase 5 — Payments & Invoicing ⏳ Planned (0%)

**Scope:**  
Automatic invoice generation, payment processing (Stripe/ACH), trucker payout setup, payment history, receipts, load settlement marking, dispute resolution.

**Status & Completion:**  
0 of 7 requirements implemented.

**Dependency:** Requires Phase 3 (POD) and Phase 4 complete.

**What's Done:** None.

**What's Remaining:** All 7 requirements.

**Blockers:** None (dependency-based).

**Estimated Effort:** 40–50 hours (payment integration + fraud prevention + reconciliation logic).

---

### Phase 6 — In-App Messaging ⏳ Planned (0%)

**Scope:**  
Per-load message thread (shipper ↔ trucker), real-time delivery (WebSocket/SSE), unread badges, notifications.

**Status & Completion:**  
0 of 4 requirements implemented.

**Dependency:** Requires Phase 1.2 complete.

**What's Done:** None.

**What's Remaining:** All 4 requirements.

**Blockers:** None (dependency-based).

**Estimated Effort:** 30–40 hours (real-time infrastructure + message persistence).

---

### Phase 7 — Advanced Carrier Management ⏳ Planned (0%)

**Scope:**  
Trucker truck/trailer profiles, preferred lanes, availability scheduling, suggested loads, shipper preferred carrier lists, load interest tracking.

**Status & Completion:**  
0 of 11 requirements implemented.

**Dependency:** Requires Phase 4 complete.

**What's Done:** None.

**What's Remaining:** All 11 requirements.

**Blockers:** None (dependency-based).

**Estimated Effort:** 50–60 hours.

---

### Phase 7b — Advanced Financial Intelligence ⏳ Planned (0%)

**Scope:**  
Per-load earnings log, P&L reporting, IFTA mileage tracking, deadhead estimates, FSC auto-calculation, tax summaries.

**Status & Completion:**  
0 of 8 requirements implemented.

**Dependency:** Requires Phase 3 (POD) and Phase 5 complete.

**What's Done:** None.

**What's Remaining:** All 8 requirements.

**Blockers:** None (dependency-based).

**Estimated Effort:** 40–50 hours.

---

### Phase 8 — Bidding ⏳ Planned (0%)

**Scope:**  
Open-to-bid vs. first-come-first-served loads, rate bidding, shipper bid acceptance/rejection, bid expiry, duplicate loads for recurring lanes, LTL freight class.

**Status & Completion:**  
0 of 6 requirements implemented.

**Dependency:** Requires Phase 4 and Phase 7 complete.

**What's Done:** None.

**What's Remaining:** All 6 requirements.

**Blockers:** None (dependency-based).

**Estimated Effort:** 35–45 hours.

---

### Phase 9 — Admin & Operations ⏳ Planned (0%)

**Scope:**  
Admin dashboard, dispute resolution tools, platform health metrics, rate benchmarking, carrier scorecard, ELD integration, document upload (insurance/CDL/medical), freight insurance, TMS API, recurring load scheduling.

**Status & Completion:**  
0 of 11 requirements implemented.

**Dependency:** Requires Phase 5 and Phase 7 complete.

**What's Done:** None.

**What's Remaining:** All 11 requirements.

**Blockers:** None (dependency-based).

**Estimated Effort:** 60–80 hours.

---

## Immediate Next Priorities (Top 5)

**Ordered by business impact and unblocking downstream work:**

1. **Phase 2 Closure: Fix EIA Attribution (2 hours)**
   - Add "Data: U.S. EIA" attribution text to frontend (legal requirement)
   - Location: Market ticker or data sources footer
   - Unblocks: Phase 2 completion and production readiness

2. **Phase 3 Blocker: Provision S3 & Wire BOL Pipeline (8 hours)**
   - Create S3 bucket, configure signed upload URLs, set IAM permissions
   - Wire `BolGeneratorService` to `LoadService.publishLoad()` to auto-generate BOL on publish
   - Unblocks: All Phase 3 document uploads and POD pipeline

3. **Phase 4 Completion: Implement Shipper Reputation UI (6 hours)**
   - Build shipper reputation detail page (rating, payment speed, load count)
   - Integrate `ShipperRepBadge` into `LoadBoardTable` row rendering
   - Unblocks: Phase 4 completion and shipper differentiation on board

4. **Critical Bug Fix: Null-Safety in LoadService.buildResponse (1 hour)**
   - Add null checks after `userRepository.findById()` to prevent NPE if shipper/trucker deleted
   - Return load without user details rather than throwing exception
   - Unblocks: Production readiness (GAP-ANALYSIS CRITICAL item)

5. **Phase 2 Clarification: SMS Scope Confirmation (decision only)**
   - Confirm SMS (2.14) is deferred to Phase 6 or later
   - Document decision in phase file
   - Unblocks: Phase 2 formal closure

---

## Known Gaps & Technical Debt

### Production-Blocking Issues

1. **EIA Attribution Missing** — Legal requirement per EIA Terms of Service; Phase 2 cannot close without it
2. **EIA Regional Mapping** — R30 vs. R4 for "Diesel South"; needs verification before go-live
3. **LoadService.buildResponse Null Pointer** — User deletion causes NPE; requires null-safety fix (CRITICAL per GAP-ANALYSIS)
4. **File Storage Not Provisioned** — S3 or equivalent required for Phase 3 documents

### Test Coverage Gaps (31+ hours)

- **Backend Controllers:** 6 of 8 missing tests (DocumentController, RatingController, NotificationController, LoadBoardController, ProfileController, MarketController)
- **Backend Services:** 5 of 9 missing tests (NotificationService, ProfileService, EmailService, BolGeneratorService, EiaFuelPriceService)
- **Frontend:** ~95% untested (60+ components/hooks); 3 test files exist (authStore, ProtectedRoute, StatusBadge)
- **Error Paths:** Controllers have zero try-catch blocks; missing HTTP error code mappings; incomplete service error handling

### Security & Data Integrity Gaps (3+ hours)

- **Input Validation:** Missing `@NotBlank`, `@Positive`, `@FutureOrPresent` on CreateLoadRequest, DocumentController, RatingController
- **Missing FK Constraints:** LoadDocuments, LoadRatings tables lack foreign keys (orphaned rows possible)
- **Missing Unique Constraints:** Notifications can duplicate at service layer
- **Missing CHECK Constraints:** `weight > 0`, `pickupFrom <= pickupTo`, `stars IN (1–5)`
- **Authorization Gaps:** LoadBoardController allows any auth user to fetch any load (intentional but undocumented)

---

## Out of Scope / Future

The following features are explicitly deferred beyond the current 9-phase roadmap:

- **SMS Notifications (Phase 2.14)** — Marked optional; currently deferred pending decision
- **Additional Payment Gateways** — Beyond Stripe/ACH (PayPal, Wise, etc.)
- **Multi-Currency Support** — Platform currently USD-only
- **International Shipping** — US domestic only; no cross-border
- **Mobile Native Apps** — Web only (responsive design); no native iOS/Android
- **AI/ML Features** — Load matching, price prediction, fraud detection (future roadmap)
- **Integration Ecosystem** — Third-party TMS/ERP integrations beyond TMS API (Phase 9)
- **Carbon Tracking** — Emissions reporting not in scope
- **Sustainability Scoring** — Eco-friendly carrier ratings deferred

---

## Technology Stack

**Backend:** Spring Boot 3.x, Spring Security (JWT), PostgreSQL, Flyway migrations, Bucket4j (rate limiting), Javamail  
**Frontend:** React 18, TypeScript, Vite, React Router, TanStack Query, Zod validation, Zustand (auth store)  
**Infrastructure:** PostgreSQL 15+, Spring Boot Actuator, CORS security config, JWT tokens with rotation  
**External APIs:** EIA Petroleum Data (diesel prices), email SMTP

---

## Build & Run Commands

**Backend:**
```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run  # Default: localhost:9090
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Default: localhost:5173 proxies to :9090
```

**Database:**
Flyway auto-migrates on app startup. All migrations in `backend/src/main/resources/db/migration/`.

---

**Report Generated:** 2026-04-02 | **Status:** Phase 1.2 ✅ | Phase 2 🔄 76% Complete
