# FreightClub — Feature Status

Legend: ✅ Built · 🔲 Not yet built · ⚠️ Built with known bug · 🔴 Security issue

---

## Shipper

### Account & Profile
- ✅ Register with business name, contact info, and billing details
- ✅ Set default pickup location (pre-fills origin on load creation)
- ✅ View and edit profile at any time
- ✅ Manage notification preferences (email, SMS, in-app toggles)
- ✅ Company/tenant system with shareable join code for colleagues

### Load Posting
- ✅ Create a load: pickup/delivery address & window, commodity, weight, dimensions (L×W×H), equipment type, pay rate (flat or per-mile), payment terms, special requirements
- ✅ Auto-calculated road distance from addresses
- ✅ Save load as draft before publishing
- ✅ Publish draft → open
- ✅ Edit a load while in DRAFT or OPEN status
- ✅ Cancel a load (any pre-delivered status)
- ✅ Dashboard shows all loads with status (draft, open, claimed, in transit, delivered, cancelled, settled)
- 🔲 **[HF-CRITICAL]** Origin/destination state stored as validated 2-letter code (dropdown, not free text) — free text causes filter mismatch on trucker board; "Illinois" vs "IL" breaks origin-state filter
- 🔲 **[HF-CRITICAL]** Confirmation dialog before cancel executes — destructive action on a live load must require explicit confirmation
- 🔲 **[HF]** Address field order corrected to street → city/state/zip (currently reversed from US convention)
- 🔲 **[HF]** Cross-field date validation: pickupTo must be after pickupFrom; deliveryFrom must be after pickupTo; deliveryTo must be after deliveryFrom
- 🔲 **[HF]** Pickup/delivery window labels renamed to "Earliest Pickup" / "Latest Pickup" / "Earliest Delivery" / "Latest Delivery" to eliminate "from location" ambiguity
- 🔲 **[HF]** Shipper dashboard status summary strip above the loads table: count of loads by status (open, claimed, in transit, delivered) for at-a-glance awareness
- 🔲 **[HF]** Weight field with contextual hint ("Legal max: 80,000 lbs") to prevent data entry errors
- 🔲 Cancel with reason (required reason field stored and shown to trucker)
- 🔲 Trucker notified when shipper cancels a claimed load; active load slot freed immediately
- 🔲 Duplicate a load for recurring lanes
- 🔲 Recurring load scheduling (post same lane on a weekly/monthly cadence)
- 🔲 Freight class field (LTL)
- 🔲 Post as open-to-bids vs first-come-first-served
- 🔲 Load posting validation prompts: in-form tips for accurate weight, special requirements, competitive rates, realistic windows

### Carrier Selection
- ✅ View trucker contact info (name, phone, email, MC/DOT) after load is claimed
- 🔲 View trucker profile: rating, reviews, equipment, completed loads
- 🔲 Accept or reject bids from truckers
- 🔲 Assign a load directly to a preferred trucker
- 🔲 Preferred carrier list
- 🔲 Block carriers

### Load Tracking
- ✅ Real-time load status visible on dashboard (OPEN → CLAIMED → IN_TRANSIT → DELIVERED)
- 🔲 Push/email/SMS notifications on status changes
- 🔲 Full status history and timeline per load

### Documentation
- 🔲 Platform-generated digital BOL from load data at publish time (distinct from trucker-uploaded copy)
- 🔲 Signed BOL photo upload by trucker at pickup
- 🔲 Proof of Delivery (POD) photo upload
- 🔲 View BOL and POD on load detail (shipper + trucker)
- 🔲 PDF export per load (details + documents)
- 🔲 Document history per load for auditing

### Payments
- ✅ Pay rate and payment terms visible on load
- 🔲 Automatic invoice on delivery confirmation
- 🔲 In-platform payment to carrier
- 🔲 Payment history
- 🔲 Payment disputes

### Communication
- 🔲 In-app messaging with assigned trucker
- 🔲 Push/email/SMS notifications

### Ratings & Reviews
- 🔲 Rate and review trucker after completion
- 🔲 Shipper public profile visible to truckers before claiming: overall rating, avg payment speed, completed load count, dispute/cancellation flags
- 🔲 View own shipper rating and feedback history

---

## Trucker (Owner/Operator)

### Account & Profile
- ✅ Register with name, contact info, MC number, DOT number
- ✅ Set primary equipment type
- ✅ View and edit profile at any time
- ✅ Cost profile: monthly fixed costs, fuel $/gal, MPG, maintenance $/mi, monthly miles target, target margin
- 🔲 Upload truck/trailer information (type, dimensions, capacity) — Phase 7
- 🔲 Set preferred lanes (origin/destination regions) — Phase 7
- 🔲 Set availability (days/hours) — Phase 7

### Financial Intelligence
- ✅ Cost Per Mile (CPM) calculator: fixed CPM, variable CPM, total CPM displayed live on profile
- ✅ Minimum RPM calculated from CPM + target margin
- ✅ 30-day earnings summary on history tab: loads completed, total miles, total revenue, effective CPM
- 🔲 **[HF]** Cost profile setup CTA elevated to a visible prompt (not a `text-xs` footnote) when no profile is configured — without a profile, RPM badges and profitability breakdowns show nothing meaningful
- 🔲 **[HF]** RPM values displayed to 2 decimal places (currently 4dp; unnecessary precision adds cognitive noise)

### Load Discovery
- ✅ Browse open loads on the load board
- ✅ Filter by origin state, destination state, equipment type, pickup date
- ✅ Equipment filter defaults to trucker's assigned type
- ✅ View full load details: origin, destination, distance, weight, dimensions, commodity, pay rate, equipment type, payment terms, special requirements
- ✅ RPM column on load board with color-coded profitability badge (green / yellow / red vs minimum RPM)
- ✅ Profitability breakdown on load detail: estimated revenue, fuel cost, maintenance, net profit, RPM vs minimum RPM
- 🔲 **[HF-CRITICAL]** 70-hour/8-day HOS cycle entirely absent — FMCSA requires tracking cumulative on-duty hours over a rolling 8-day window; current widget only tracks the current shift (11-hr drive + 14-hr on-duty)
- 🔲 **[HF]** Load board sortable by RPM, distance, and pickup date — truckers evaluate profitability across multiple loads; sorting is the primary tool for this
- 🔲 **[HF]** Filter state persisted in URL query params — navigating back from a load detail resets all filters, forcing repetitive re-entry
- 🔲 **[HF]** Equipment filter unlockable by trucker even when profile type is set — current behavior locks the filter and hides this; truckers with multiple trailers cannot browse other types
- 🔲 **[HF]** Pickup date urgency signal on load board cards (e.g. "Picks up tomorrow", amber highlight if < 24 hr) — time pressure is invisible on current table
- 🔲 **[HF]** Profitability breakdown card remains visible after a load is claimed (currently hidden once status leaves OPEN) — claimed load view should still show cost analysis for execution planning
- 🔲 Shipper reputation badge on load cards (star rating, avg payment speed)
- 🔲 Filter by weight range or minimum pay rate
- 🔲 See view/interest count per load
- 🔲 Suggested loads based on preferred lanes

### Claiming a Load
- ✅ Claim a load (first-come-first-served; one active load at a time)
- ✅ View active load prominently on dashboard with shipper contact
- ✅ View full load history (delivered, settled, cancelled)
- 🔲 **[HF]** Toast confirmation after successful claim — no acknowledgment currently shows; trucker is left wondering if the claim registered
- 🔲 **[HF]** Clear explanation when claim is blocked (active load exists) — current behavior grays out the entire load board silently with no message
- 🔲 Express interest / bid on a load

### Load Execution
- ✅ Mark load as picked up (CLAIMED → IN_TRANSIT) with confirmation dialog
- ✅ Mark load as delivered (IN_TRANSIT → DELIVERED) with confirmation dialog
- ✅ Hours of Service (HOS) widget: 11-hour drive rule and 14-hour on-duty window with color-coded progress bars and warnings
- 🔲 **[HF-CRITICAL]** HOS widget: 70-hour/8-day cumulative cycle tracking — FMCSA requires a trucker to track total on-duty hours across rolling 8 days; this is a separate, additional constraint beyond the per-shift rules
- 🔲 **[HF]** HOS widget: on-duty bar renders and displays time elapsed even before start time is entered, with a clear prompt to enter start time — current behavior shows empty bar with no explanation
- 🔲 **[HF]** HOS proactive warnings at 4-hour and 2-hour remaining thresholds (currently only warns at <2 hr) — FMCSA requires stop planning before the 2-hour mark
- 🔲 BOL photo upload at pickup
- 🔲 Proof of Delivery photo upload at delivery
- 🔲 Report issue during transit (delay, damage)

### Payments
- ✅ View agreed pay rate before claiming (flat or per-mile with estimated total)
- ✅ View payment terms on load
- 🔲 Payment notification after delivery
- 🔲 Payment history per load
- 🔲 Bank account / direct deposit setup

### Communication
- 🔲 In-app messaging with shipper
- 🔲 Push/email/SMS notifications

### Ratings & Reviews
- 🔲 Rate shipper after delivery
- 🔲 View own rating and feedback history
- 🔲 View shipper public reputation profile (rating, avg payment speed, completed loads, dispute flags) before claiming

---

## Platform / Infrastructure

- ✅ Multi-tenant shared schema (tenant_id isolation)
- ✅ JWT authentication (RS256, HTTP-only refresh cookie)
- ✅ Role-based access control (SHIPPER / TRUCKER)
- ✅ Flyway schema migrations
- ✅ JPA Specification-based filtering with Hibernate 6 type safety
- ✅ Global exception handling with structured error responses
- ✅ Null-safe tenant context (fail-fast on missing tenant)
- 🔲 **[HF]** Shared app shell / layout component (nav, page wrapper) extracted from individual page components — current pages each manage their own layout, causing inconsistent chrome and duplicated structure
- 🔲 **[HF]** URL-based filter state for load board — enables browser back/forward, bookmarking filtered views, and sharing specific filter combinations

### Database Schema Gaps

- 🔲 **[DB-CRITICAL]** `origin_state` / `destination_state` resized to `CHAR(2)` with `CHECK` constraint — currently `VARCHAR(50)`, which permits "Illinois" to be stored; trucker filter for "IL" then returns zero matches
- 🔲 **[DB-CRITICAL]** `loads.created_at` / `loads.updated_at` given `DEFAULT CURRENT_TIMESTAMP` and `ON UPDATE CURRENT_TIMESTAMP` — currently has no default; any insert without explicit timestamps fails
- 🔲 **[DB-CRITICAL]** FK constraint added from `loads.trucker_id` → `users.id` — referential integrity currently not enforced at DB level
- 🔲 **[DB]** `claims` table introduced — current model stores `trucker_id` directly on `loads`, losing claim history; blocks Phase 4 ratings (rater/ratee link), Phase 8 bidding (multiple claimants), and Phase 2 cancellation notification (who had the load)
- 🔲 **[DB]** `CHECK` constraints added for `loads.status`, `loads.equipment_type`, `loads.pay_rate_type`, `loads.payment_terms` — Java enums enforce valid values at the application layer but nothing prevents a bad value from direct SQL or a future bug
- 🔲 **[DB]** Missing indexes for trucker load board filter patterns: `(tenant_id, equipment_type, status)`, `(tenant_id, origin_state)`, `(tenant_id, pickup_from, status)`, `(trucker_id, status)` — current indexes do not cover the primary filter combinations; load board queries do full tenant-scoped scans
- 🔲 **[DB]** `loads.payment_terms` changed to `NOT NULL` — nullable today; every published load requires payment terms
- 🔲 **[DB]** `trucker_cost_profiles` table extracted from `users` — 6 cost profile columns currently on the `users` table pollute every SHIPPER row with NULL trucker-only fields; a separate table enables future cost history tracking required for Phase 7b reporting
- 🔲 **[DB]** `load_events` table designed and created — needed for Phase 2 status timeline and notifications; designing it ad-hoc at Phase 2 start risks a rushed schema
- 🔲 **[DB]** `users.email` uniqueness scoped to `(tenant_id, email)` instead of globally — current global constraint prevents the same person from having a SHIPPER and TRUCKER account or joining multiple tenants
- 🔲 **[DB]** `billing_state` / `default_pickup_state` on `users` resized to `CHAR(2)` — currently `VARCHAR(100)`, inconsistent with the state code standard
- 🔲 **[DB]** `origin_zip` / `destination_zip` on `loads` evaluated for removal — added in V20260312_003, not dropped in V20260318_001 restructure; likely orphaned
- 🔲 **[DB]** `refresh_tokens.revoked_at DATETIME NULL` added — `revoked TINYINT(1)` records that a token was revoked but not when; needed for security audit trail
- 🔲 Real-time updates (WebSocket or SSE)
- 🔲 Email/SMS notification delivery
- 🔲 File storage (BOL, POD documents)
- 🔲 Payment processing integration
- 🔲 Admin tools

---

## Security & Stability (Phase 1.2 — Complete)

Findings from a post-Phase 1.1 security and architecture review. All items resolved in Phase 1.2.

### Critical Security

- ✅ **Race condition — load claiming** — `LoadRepository.findByIdForUpdate()` uses `SELECT FOR UPDATE`; `LoadService.claimLoad()` holds row lock through status check and `Claim` insert.
- ✅ **Race condition — refresh token rotation** — `RefreshTokenRepository.findByTokenForUpdate()` uses `SELECT FOR UPDATE`; rotation is atomic.
- ✅ **No rate limiting on `/api/v1/auth/**`** — `AuthRateLimitFilter` (Bucket4j) limits auth endpoints to 10 req/min per IP.
- ✅ **JWT missing `iss`/`aud` claims** — `JwtService` now sets and validates `issuer` and `audience` on every token.
- ✅ **JWT secret in source control** — secret moved to `APP_JWT_SECRET` environment variable; `application-dev.yml` reads `${APP_JWT_SECRET}`.
- ✅ **Developer Tailscale domain hardcoded** — removed from `vite.config.ts`; `allowedHosts` now reads from env.

### High — Known Bugs

- ✅ **Date comparison uses string ordering** — `LoadForm.tsx` Zod schema uses `new Date()` for all cross-field date comparisons.
- ✅ **URL filter params cast to enums without validation** — `TruckerDashboard.tsx` guards `searchParams.get()` with an enum-safe helper before use.
- ✅ **`claims` table unpopulated** — `LoadService.claimLoad()` now inserts a `Claim` row and cancels the active claim on load cancellation.
- ✅ **`load_events` table unpopulated** — every status transition in `LoadService` writes a `LoadEvent` row (CREATED, PUBLISHED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED).
- 🔲 **HOS widget state lost on page refresh** — deferred; requires backend persistence endpoint. Tracked for Phase 2.
- ✅ **Overweight load — backend has no validation** — `LoadService` enforces `overweightAcknowledged=true` when weight > 80,000 lbs on create and update.
- ✅ **CORS `allowedHeaders: ["*"]`** — `SecurityConfig` now uses an explicit allowlist (`Authorization`, `Content-Type`, `X-Requested-With`, `X-Correlation-ID`).

### Infrastructure Gaps

- 🔲 No Spring Boot Actuator — deferred to Phase 2 ops hardening
- ✅ **No structured logging or correlation IDs** — `CorrelationIdFilter` reads/generates `X-Correlation-ID`, sets MDC; logback pattern includes `%X{correlationId}`.
- 🔲 No audit log for sensitive operations — deferred to Phase 2
- 🔲 No production environment config — deferred; all secrets already externalized via env vars
- ✅ **No Docker support** — `backend/Dockerfile` (multi-stage build) and `docker-compose.yml` (db + backend services) added at project root.
- ✅ **No CI/CD pipeline** — `.github/workflows/ci.yml` runs backend (`mvn test`) and frontend (`lint`, `test`, `build`) on every push/PR.
- ✅ **React `<ErrorBoundary>` missing** — `App.tsx` wraps the entire tree in an `ErrorBoundary` class component.

### Testing Gaps

- ✅ **No tests for `RatingService`, `DocumentService`** — full unit test suites added (`RatingServiceTest`: 14 tests, `DocumentServiceTest`: 15 tests).
- ✅ **No tests for any `@RestController`** — `AuthControllerTest` (5 tests) and `LoadControllerTest` (9 tests) added using `@SpringBootTest` + `@AutoConfigureMockMvc`.
- ✅ **No integration tests** — `AuthIntegrationTest` covers register→login→refresh→logout round-trip, duplicate email (409), bad credentials (401) against H2 in-memory DB.
- ✅ **No frontend tests** — Vitest + Testing Library configured; `authStore.test.ts` (3), `ProtectedRoute.test.tsx` (4), `StatusBadge.test.tsx` (10) all pass.
- ✅ **JaCoCo enforced only for `LoadService`** — replaced with project-wide BUNDLE rule at 60% line coverage (excluding dto/domain/exception packages).
