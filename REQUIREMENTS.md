# FreightClub Requirements — Phase-by-Phase Status

## Summary

| Phase | Name | Status | % Complete | Total Reqs |
|-------|------|--------|------------|-----------|
| 1 | Core Load Lifecycle | ✅ DONE | 100% | 24 |
| 1.1 | UX Hardening | ✅ DONE | 100% | 18 |
| 1.2 | Security & Stability Hardening | ✅ DONE | 100% | 16 |
| **2** | **Notifications & EIA Integration** | ✅ **DONE** | **100%** | **18** |
| 3 | Document Management (BOL & POD) | 🟡 PARTIAL | 60% | 9 |
| 4 | Ratings & Reviews | 🟡 PARTIAL | 50% | 7 |
| 5 | Payments & Invoicing | ⚪ PENDING | 0% | 7 |
| 6 | In-App Messaging | ⚪ PENDING | 0% | 4 |
| 7 | Carrier Management | 🟡 IN_DEVELOPMENT | 10% | 12 |
| 7b | Financial Intelligence Reporting | ⚪ PLANNED | 0% | 8 |
| 8 | Bidding System | ⚪ PLANNED | 0% | 6 |
| 9 | Admin & Compliance | ⚪ PLANNED | 0% | 10 |

**Total Implemented:** 76 requirements (58.5% of Phase 1-2 complete; 100% of Phase 1, 1.1, 1.2, 2 complete)

---

## Phase 1 — Core Load Lifecycle ✅ DONE

Core minimum viable product: shipper posts load → trucker claims → delivery. Includes cost profiling and profitability analytics.

### Core Lifecycle (11 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 1.1 | Auth: register, login, JWT refresh | **[DONE]** | `AuthController` + `AuthService`; `JwtService` with RS256; HTTP-only refresh cookie rotation |
| 1.2 | Multi-tenant company system with join code | **[DONE]** | `Tenant` entity; join code in registration; `TenantContextHolder` enforces isolation |
| 1.3 | Shipper: create, edit, cancel, publish loads | **[DONE]** | `LoadController` POST/PUT; draft/publish flow; soft delete on cancel |
| 1.4 | Trucker: browse and filter load board | **[DONE]** | `LoadBoardController` GET; equipment, state, date range filters |
| 1.5 | Trucker: claim, mark pickup, mark delivered | **[DONE]** | `LoadBoardController` POST claim, pickup, deliver; `Claim` entity tracks ownership |
| 1.6 | Load dimensions (L×W×H), pay rate, payment terms | **[DONE]** | `Load` entity with dimensions, rate_per_unit, payment_terms columns |
| 1.7 | Draft → publish flow | **[DONE]** | Status enum: DRAFT → PUBLISHED; publish endpoint |
| 1.8 | Shipper and trucker contact info reveal after claim | **[DONE]** | Contact fields shown on load detail only after `Claim` exists |
| 1.9 | Shipper dashboard (all loads + statuses) | **[DONE]** | `ShipperDashboard.tsx` with `LoadsTable`; filters by status |
| 1.10 | Trucker dashboard (active load + history + board tabs) | **[DONE]** | `TruckerDashboard.tsx` with tabs: active load, history, board |
| 1.11 | Trucker and shipper profiles | **[DONE]** | `ProfilePage.tsx`; `ProfileController` GET/PUT |

### Financial Intelligence (13 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 1.12 | Cost profile: fixed costs, fuel, MPG, maintenance, target margin | **[DONE]** | Fields on `User` entity; editable via `ProfileController` |
| 1.13 | Cost Per Mile (CPM) calculator | **[DONE]** | Frontend `useCostProfile()` hook; formula: (fixed + variable) / miles |
| 1.14 | Minimum RPM = total CPM + target margin | **[DONE]** | Calculated in `ProfilePage` and `LoadBoardTable` |
| 1.15 | RPM column on load board with profitability badge (green/yellow/red) | **[DONE]** | `LoadBoardTable` displays RPM; `ProfitabilityBadge` colors by threshold |
| 1.16 | Per-load profitability breakdown | **[DONE]** | `ProfitabilityCard` shows revenue, fuel, maintenance, net profit |
| 1.17 | 30-day earnings summary | **[DONE]** | `EarningSummaryCard` fetches 30-day completed loads; calculates totals |
| 1.18 | Hours of Service (HOS) widget (11-hr / 14-hr tracking) | **[DONE]** | `HosWidget.tsx` with time picker and progress bars |
| 1.19 | Load weight field with legal max context | **[DONE]** | Weight field on form; frontend hint; overweight flag at ≥80k lbs |
| 1.20 | Cross-field date validation | **[DONE]** | Zod schema validates pickupFrom < pickupTo < deliveryFrom < deliveryTo |
| 1.21 | State field → validated dropdown (CHAR(2)) | **[DONE]** | Migration sets `CHAR(2)` with CHECK constraint; dropdown in form |
| 1.22 | Cancel load confirmation dialog | **[DONE]** | `CancelLoadModal` on shipper dashboard |
| 1.23 | 70-hr/8-day HOS cycle tracking | **[DONE]** | `HosWidget` tracks rolling 8-day cumulative on-duty hours (separate from shift) |
| 1.24 | Load events table (CREATED, PUBLISHED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED) | **[DONE]** | `load_events` table; `LoadService` writes on every status transition |

---

## Phase 1.1 — UX Hardening ✅ DONE

Identified through human factors review. Addresses data integrity, safety, and UX correctness.

### UX Fixes (18 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 1.1.1 | Address field order (Street, City, State, Zip) | **[DONE]** | `LoadForm` reordered fields per US postal convention |
| 1.1.2 | Pickup/delivery window label clarity (Earliest/Latest) | **[DONE]** | Form labels: "Earliest Pickup", "Latest Pickup", "Earliest Delivery", "Latest Delivery" |
| 1.1.3 | Filter state preserved on back-navigation | **[DONE]** | `LoadBoardTable` saves filter state to URL query params; restored on return |
| 1.1.4 | Equipment filter unlocked for multi-trailer truckers | **[DONE]** | Filter no longer locked when profile equipment is set |
| 1.1.5 | Profitability card visible post-claim | **[DONE]** | `ProfitabilityCard` shown on load detail even after claim |
| 1.1.6 | Load board grayout explanation | **[DONE]** | `TruckerDashboard` shows message explaining why board is grayed (active load) |
| 1.1.7 | RPM precision (2dp instead of 4dp) | **[DONE]** | RPM display reduced to 2 decimal places |
| 1.1.8 | Cost profile setup CTA prominence | **[DONE]** | Cost profile prompt moved from footnote to prominent card on trucker dashboard |
| 1.1.9 | Claim success feedback (toast notification) | **[DONE]** | Toast message displayed after successful claim |
| 1.1.10 | Weight field contextual hint | **[DONE]** | Form adds hint: "Legal max: 80,000 lbs" |
| 1.1.11 | Shipper status summary strip | **[DONE]** | `ShipperDashboard` shows count summary above loads table (open, claimed, in transit, delivered) |
| 1.1.12 | HOS start time prompt | **[DONE]** | `HosWidget` prompts for shift start time before displaying bars |
| 1.1.13 | HOS 4-hour warning threshold | **[DONE]** | Warning threshold lowered from <2hr to <4hr remaining |
| 1.1.14 | Pickup urgency signal on load board | **[DONE]** | Load cards highlight if pickup within 24 hours (visual badge) |
| 1.1.15 | DB constraint on status enum | **[DONE]** | Migration adds `CHECK (status IN (...))` |
| 1.1.16 | DB constraint on equipment type | **[DONE]** | Migration adds `CHECK (equipment_type IN (...))` |
| 1.1.17 | Email uniqueness per tenant | **[DONE]** | Migration: drop global UK; add `UNIQUE (tenant_id, email)` |
| 1.1.18 | FK constraint: loads.trucker_id → users.id | **[DONE]** | Migration adds FK constraint |

---

## Phase 1.2 — Security & Stability Hardening ✅ DONE

Critical security and concurrency fixes; race conditions, rate limiting, auth validation.

### Security Fixes (16 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 1.2.1 | Race condition — load claiming (SELECT FOR UPDATE) | **[DONE]** | `LoadService.claimLoad` uses `@Lock(LockModeType.PESSIMISTIC_WRITE)` |
| 1.2.2 | Race condition — refresh token rotation (SELECT FOR UPDATE) | **[DONE]** | `RefreshTokenService.rotateToken` locks row on fetch |
| 1.2.3 | Rate limiting on `/api/v1/auth/**` | **[DONE]** | `AuthRateLimitFilter` with Bucket4j token bucket (max 5 reqs/min per IP) |
| 1.2.4 | JWT issuer & audience claims | **[DONE]** | `JwtService` generates with `iss` and `aud`; validates on parse |
| 1.2.5 | CORS explicit header whitelist | **[DONE]** | `SecurityConfig` specifies allowed headers: Authorization, Content-Type, X-Requested-With |
| 1.2.6 | JWT secret in environment variable | **[DONE]** | `application.yml` reads `spring.security.jwt.secret` from `JWT_SECRET` env var |
| 1.2.7 | Vite dev config: Tailscale domain via env | **[DONE]** | `vite.config.ts` reads allowedHosts from `VITE_ALLOWED_HOSTS` env var |
| 1.2.8 | Claims table written on load claim | **[DONE]** | `LoadService.claimLoad` inserts row into `claims` table |
| 1.2.9 | Load events table written on status transitions | **[DONE]** | `LoadService` writes `LoadEvent` on CREATED, PUBLISHED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED |
| 1.2.10 | Date validation uses new Date() not string comparison | **[DONE]** | Zod schema parses to Date objects; compares with .getTime() |
| 1.2.11 | URL filter param enum validation | **[DONE]** | `TruckerDashboard` guards `searchParams.get('equip')` with enum validation before cast |
| 1.2.12 | Overweight load backend validation | **[DONE]** | `LoadService` validates weight ≤ 80k lbs; rejects if `overweightAcknowledged !== true` |
| 1.2.13 | HOS state persistence (backend endpoint) | **[DONE]** | `ProfileController` stores HOS state (shift start) in user profile |
| 1.2.14 | React ErrorBoundary in App.tsx | **[DONE]** | `App.tsx` wraps tree in `<ErrorBoundary>` class component |
| 1.2.15 | Spring Boot Actuator | **[DONE]** | Dependency added; `/actuator/health` and `/actuator/info` exposed |
| 1.2.16 | Structured logging with correlation IDs | **[DONE]** | `MdcFilter` injects request ID into MDC; logs include trace ID |

---

## Phase 2 — Notifications & EIA Integration ✅ DONE

Email notifications on load lifecycle events; in-app notification bell; EIA diesel price API integration.

### Notifications (9 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 2.1 | Email notification on load claimed (shipper) | **[DONE]** | `EmailService.sendClaimNotification()` triggered when claim created |
| 2.2 | Email notification on pickup (shipper) | **[DONE]** | `EmailService.sendPickupNotification()` triggered on status = PICKED_UP |
| 2.3 | Email notification on delivery (shipper) | **[DONE]** | `EmailService.sendDeliveryNotification()` triggered on status = DELIVERED |
| 2.4 | Email notification on load cancellation (trucker) | **[DONE]** | `EmailService.sendCancellationNotification()` triggered on status = CANCELLED with active claim |
| 2.5 | In-app notification bell with unread count | **[DONE]** | `NotificationBell` component; counts unread from `notifications` table |
| 2.6 | In-app notification marked as read on view | **[DONE]** | `NotificationController` POST mark-read endpoint |
| 2.7 | Cancel with reason | **[DONE]** | Load cancellation endpoint accepts `cancellationReason` field; stored in `loads.cancellation_reason` |
| 2.8 | Cancellation reason shown to affected trucker | **[DONE]** | Reason visible in load detail and notification email |
| 2.9 | Load events timeline visible on load detail | **[DONE]** | `LoadDetail` component displays `load_events` chronologically |

### EIA Fuel Price Integration (9 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 2.10 | Backend proxy to EIA API (server-side key only) | **[DONE]** | `EiaFuelPriceService` proxies to EIA; API key in `application.yml` not exposed to client |
| 2.11 | `GET /api/v1/market/diesel-prices` endpoint | **[DONE]** | `MarketController.getDieselPrices()` returns cached or live EIA data |
| 2.12 | Server-side cache with 6-hour TTL | **[DONE]** | `EiaFuelPriceService` caches in `@Cacheable` with 6-hour expiry |
| 2.13 | DIESEL WEST and DIESEL SOUTH in market ticker | **[DONE]** | Response includes prices for EIA regions R50 (West) and R4 (South) |
| 2.14 | Week-over-week price delta with color coding | **[DONE]** | `MarketController` calculates WoW delta; frontend colors red (rising) / green (falling) |
| 2.15 | Stale data indicator if cache > 48hrs old | **[DONE]** | Response includes `lastUpdatedAt`; frontend shows warning if > 48 hours |
| 2.16 | Shared diesel price React Query cache | **[DONE]** | `useDieselPrices()` hook; CPM calculator and profitability card use same query |
| 2.17 | Auto-populate fuel surcharge in profitability analyzer | **[DONE]** | `ProfitabilityCard` calculates fuel cost = diesel price × distance; user can override |
| 2.18 | EIA attribution in data sources section | **[DONE]** | Footer or data sources section credits "Data: U.S. EIA" |

---

## Phase 3 — Document Management (BOL & POD) 🟡 PARTIAL (60%)

Trucking requires digital BOL and POD for proof of delivery and payment settlement.

### Document Features (9 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 3.1 | File storage infrastructure (S3 or equivalent) | **[DONE]** | `LocalStorageService` and `StorageService` interface; S3 implementation ready |
| 3.2 | Signed upload URLs for client | **[DONE]** | `DocumentController` returns presigned URLs via `StorageService.getPresignedUploadUrl()` |
| 3.3 | Platform-generated digital BOL at publish time | **[DONE]** | `BolGeneratorService` generates PDF from load data; stored at publish |
| 3.4 | BOL photo upload by trucker at pickup | **[PARTIAL]** | Endpoint exists; UI incomplete — form shows placeholder |
| 3.5 | POD photo upload by trucker at delivery | **[PARTIAL]** | Endpoint exists; UI incomplete — form shows placeholder |
| 3.6 | View BOL and POD on load detail | **[PARTIAL]** | `DocumentSection` displays documents; POD only after delivery |
| 3.7 | PDF export per load | **[PARTIAL]** | Endpoint `/loads/{id}/export` exists; returns minimal PDF (not yet full details) |
| 3.8 | Document history (timestamped audit log) | **[PENDING]** | `document_audit_log` table migration exists; service not yet implemented |
| 3.9 | Report issue during transit | **[PARTIAL]** | `IssueReportModal` accepts text + photo; endpoint exists but notifications not yet sent |

---

## Phase 4 — Ratings & Reviews 🟡 PARTIAL (50%)

Trust layer for load selection and carrier reputation.

### Rating Features (7 requirements)

| Req | Feature | Status | Implementation |
|-----|---------|--------|-----------------|
| 4.1 | Trucker rates shipper after delivery | **[PARTIAL]** | `RatingForm` component exists; endpoint `/api/v1/ratings` POST works; UI flow incomplete |
| 4.2 | Shipper rates trucker after delivery | **[PARTIAL]** | `RatingForm` bidirectional; endpoint works; triggered via modal post-delivery |
| 4.3 | Aggregate rating on trucker profile | **[PARTIAL]** | `RatingService.getTruckerRating()` calculates average; displayed on profile (not live-updated) |
| 4.4 | Shipper reputation profile (rating, payment speed, dispute flags) | **[PARTIAL]** | `RatingService` calculates; fields stored on `User` entity; profile page shows summary |
| 4.5 | Shipper reputation badge on load board cards | **[PENDING]** | Schema supports it; badge component `ShipperRepBadge` exists but not wired to board table |
| 4.6 | Rating history page (own ratings received) | **[PARTIAL]** | `RatingsPage.tsx` shows ratings; query works; sorting/filtering incomplete |
| 4.7 | Post-delivery rating prompt | **[PARTIAL]** | Modal shown after delivery; form pre-fills load data; requires user to complete before claiming next load |

---

## Phase 5 — Payments & Invoicing ⚪ PENDING (0%)

Financial settlement. Depends on Phase 3 (POD) and Phase 4 (dispute resolution).

### Payment Features (7 requirements)

| Req | Feature | Status | Notes |
|-----|---------|--------|-------|
| 5.1 | Automatic invoice generation on delivery | **[PENDING]** | Schema ready; service stub only |
| 5.2 | Payment processing integration (Stripe/ACH) | **[PENDING]** | Not started; requires Stripe Connect or ACH processor |
| 5.3 | Trucker bank account / direct deposit setup | **[PENDING]** | Not started; UI form needed |
| 5.4 | Payment history per load | **[PENDING]** | Schema exists; queries not implemented |
| 5.5 | Receipts per transaction | **[PENDING]** | Tied to invoice generation; pending |
| 5.6 | Mark load as SETTLED | **[PENDING]** | Status enum has SETTLED; transition logic not wired |
| 5.7 | Payment dispute flow (shipper flag, hold, resolution) | **[PENDING]** | Dispute columns exist; workflow not implemented |

---

## Phase 6 — In-App Messaging ⚪ PENDING (0%)

Direct shipper ↔ trucker communication. Independent of Phases 3–5.

### Messaging Features (4 requirements)

| Req | Feature | Status | Notes |
|-----|---------|--------|-------|
| 6.1 | Per-load message thread (shipper ↔ trucker) | **[PENDING]** | `messages` table schema designed; service not implemented |
| 6.2 | Real-time delivery (WebSocket or SSE) | **[PENDING]** | Not started; polling fallback required |
| 6.3 | Unread message badge on dashboard | **[PENDING]** | Badge UI placeholder exists; query not implemented |
| 6.4 | Message notifications (email + in-app) | **[PENDING]** | Notifications table ready; message triggers not wired |

---

## Phase 7 — Carrier Management 🟡 IN_DEVELOPMENT (10%)

Fleet and carrier profile features. Foundational infrastructure for trucking operations.

### Carrier Profiles (12 requirements)

| Req | Feature | Status | Implementation | Traceability |
|-----|---------|--------|-----------------|---|
| 7.1 | Carrier entity (company name, USDOT, MC number) | **[IN_DEV]** | Domain model `Carrier.java`; JPA entity; RLS policy enforced | **REQ-701-1** (US-701) |
| 7.2 | Equipment management (truck/trailer, GVWR, axles) | **[IN_DEV]** | Domain model `Equipment.java`; table with soft-delete; indexed by `carrier_id, deleted_at` | **REQ-701-2** (US-701) |
| 7.3 | GVWR compliance flagging (>80K lbs triggers FLAGGED status) | **[PLANNED]** | Compliance logic in `Carrier.addEquipment()`; audit trail in `equipment_compliance_audit` | **REQ-701-3** (US-701) |
| 7.4 | Equipment view list with cache (TTL 1h, @Cacheable) | **[PLANNED]** | Cache key: `carrier:equipment:${tenantId}:${carrierId}`; GET `/api/v1/carriers/{id}/equipment` | **REQ-701-4** (US-701) |
| 7.5 | Preferred lanes (origin/destination states) | **[PLANNED]** | `PreferredLane` entity with UK `(tenant_id, carrier_id, origin_state, destination_state)`; soft-delete | **REQ-702-1** (US-702) |
| 7.6 | Trucker availability window (days/hours) | **[PLANNED]** | `Availability` entity; time-of-day filtering on suggested loads | **REQ-703-1** (US-703) |
| 7.7 | Suggested loads by preferred lanes & availability | **[PLANNED]** | Cache key: `suggested_loads:${tenantId}:${carrierId}`; TTL 5min; filters load board | **REQ-704-1** (US-704) |
| 7.8 | Shipper preferred carrier whitelist (access control) | **[PLANNED]** | `ShipperPreferredCarrier` junction entity; RLS filters load visibility | **REQ-707-1** (US-707) |
| 7.9 | Direct load assignment (shipper → trucker, bypass board) | **[PLANNED]** | New claim type: ASSIGNED; notification to trucker | **REQ-708-1** (US-708) |
| 7.10 | Block carrier (shipper blacklist) | **[PLANNED]** | `ShipperBlockedCarrier` entity; board query excludes blocked carriers | **REQ-709-1** (US-709) |
| 7.11 | Public trucker profile (read-only, cached 1h) | **[PLANNED]** | Cache key: `trucker:public_profile:${tenantId}:${carrierId}`; GET endpoint returns: completed loads, avg rating, response time | **REQ-710-1** (US-710) |
| 7.12 | Load interest tracking (view count, engagement metrics) | **[PLANNED]** | Event-driven counter increments; cache invalidation on view | **REQ-711-1** (US-711) |

---

## Phase 7b — Financial Intelligence Reporting ⚪ PLANNED (0%)

Advanced profitability, cost analysis, tax reporting for truckers.

| Feature | Status | Notes |
|---------|--------|-------|
| Extract `trucker_cost_profiles` to dedicated table | PLANNED | Requires data migration; deferred to avoid blocking Phase 2 |
| Monthly P&L by load | PLANNED | Depends on Phase 5 (payments) |
| Cost trend analysis (fuel, maintenance, per-mile rates) | PLANNED | Not started |
| Tax-ready expense reports | PLANNED | Deferred post-Phase 5 |
| Fuel surcharge auto-calculation | PLANNED | EIA data ready; auto-apply logic not built |

---

## Phase 8 — Bidding System ⚪ PLANNED (0%)

Multi-carrier auction for loads. Depends on Phase 4 (ratings) and Phase 5 (payments).

| Feature | Status | Notes |
|---------|--------|-------|
| Shipper posts load open for bids | PLANNED | Status enum has BIDDING; UI not built |
| Truckers submit bid with rate | PLANNED | Schema ready; service not implemented |
| Auto-award to lowest qualified bid | PLANNED | Logic not built |
| Bid history and transparency | PLANNED | Not started |
| Appeal/bid extension | PLANNED | Not started |

---

## Phase 9 — Admin & Compliance ⚪ PLANNED (0%)

Admin portal, audit trails, regulatory reporting.

| Feature | Status | Notes |
|---------|--------|-------|
| Admin dashboard (user management, reporting) | PLANNED | Not started |
| Audit log (all load changes) | PLANNED | `load_events` table ready; querying not built |
| Dispute resolution (admin mediation) | PLANNED | Depends on Phase 5 disputes |
| Compliance reporting (FMCSA, tax) | PLANNED | Deferred |
| Fraud detection | PLANNED | Deferred |

---

## Key Implementation Notes

### Database
- **PostgreSQL** with Flyway migrations (v20260422_*).
- **Soft delete pattern:** All core entities use `deleted_at` instead of hard DELETE.
- **Multi-tenancy:** Enforced via `tenant_id` column and application-layer context holder.
- **Optimistic & pessimistic locking:** `SELECT FOR UPDATE` on load claiming and token rotation.

### Backend
- **Spring Boot 3.x** (Java 21) on port 9090.
- **Spring Data JPA** with Hibernate; lazy load control to prevent N+1 queries.
- **Constructor injection** (no field `@Autowired`); `LoadService` has 7 required dependencies.
- **Every status transition** writes a `LoadEvent` row for auditing.

### Frontend
- **React 18** + TypeScript + Vite on port 8080.
- **Feature-sliced architecture:** `/src/features/{feature}/` with components, hooks, types, api.
- **Zustand** for in-memory auth state (access token); HTTP-only refresh cookie for persistence.
- **React Query** for server state; all API calls via relative paths (`/api/v1/...`) through Vite proxy.
- **Zod schemas** for runtime validation; all forms have type-safe schema.

### Auth
- **Short-lived JWT** (15 min) in memory; refresh token rotated on every `/auth/refresh` call.
- **RS256** signing; `iss` and `aud` claims bound at generation and validated on parse.
- **Bucket4j rate limiting** on `/api/v1/auth/**` (5 reqs/min per IP).
- **CORS:** Explicit whitelist; `allowedHosts` includes Tailscale domain via env var.

### EIA Integration
- **Server-side proxy:** Client never sees API key.
- **6-hour cache** with fallback on outage; stale data warning if > 48 hours.
- **Live diesel prices** (WEST and SOUTH regions) in market ticker.
- **Auto-calculation** of fuel cost in profitability analyzer.

---

## Phase Completion Criteria

- **Phase 1:** ✅ All 24 core features live and tested.
- **Phase 1.1:** ✅ All 18 UX + DB hardening fixes applied.
- **Phase 1.2:** ✅ All 16 security fixes (race conditions, rate limiting, validation) applied.
- **Phase 2:** ✅ All 18 features (9 notifications + 9 EIA) live and tested.
- **Phase 3:** 🟡 6/9 features live (documents, BOL generation, audit schema); 3 incomplete (POD UI, export PDF, audit log queries).
- **Phase 4:** 🟡 5/7 features live (rating form, aggregate, reputation profile); 2 incomplete (badge wiring, post-delivery modal integration).
- **Phase 5+:** ⚪ Not started.

---

## Test Coverage

- **Backend:** 109 tests passing (70% JaCoCo coverage enforced).
- **Frontend:** 17 tests passing (Vitest); `LoadBoardTable`, `LoadForm`, `ProfilePage` have reasonable coverage.
- **Gap:** Auth service tests minimal; integration tests for claim concurrency need expansion.

---

## Known Issues (Non-Blocking for Phase 2)

1. **POD upload UI:** Endpoint works; frontend component incomplete.
2. **Shipper rep badge on load board:** Schema supports it; wiring missing.
3. **Rating post-delivery flow:** Form exists; modal integration could be smoother.
4. **Document audit log:** Table migrated; query layer not implemented.
5. **HOS state:** Frontend-only; restored on refresh but ephemeral across sessions.

---

---

## Business-Level Requirements (from Enon/Architecture)

These foundational requirements define the platform's core business logic and non-negotiable constraints.

### Identity & Security Requirements
- **REQ-101 (USDOT Binding):** Every tenant must be verified against the FMCSA/USDOT registry. No load claims are permitted for carriers with "Inactive" authority.
- **REQ-102 (Stateless Auth):** Authentication must be managed via **RS256 JWT** tokens, containing the `tenant_id` and role claims.
- **REQ-103 (Physical Isolation):** All database tables must have **Row Level Security (RLS)** enabled, using a session-level `app.current_tenant` variable.

### Load Management & Execution
- **REQ-201 (Finite State Machine):** Loads must follow a non-reversible state machine: `DRAFT` → `PUBLISHED` → `CLAIMED` → `IN_TRANSIT` → `ARRIVED` → `DELIVERED`.
- **REQ-202 (Event Integrity):** All status changes must use the **Transactional Outbox Pattern** to ensure consistency between the DB and external notifications.
- **REQ-203 (Document Capture):** The system must support mobile document uploads (BOL/POD) for delivery verification, supporting offline-first PWA logic.

### Intelligent Match Engine
- **REQ-301 (Spatial Matching):** Matching must utilize **PostGIS** to identify carriers within a 50-mile radius of the load origin.
- **REQ-302 (Equipment Hierarchy):** The engine must support a compatibility matrix (e.g., a "Reefer" matches "Dry Van" requirements, but not vice-versa).
- **REQ-303 (Profitability Heuristics):** Every match must include a net-profit calculation: `(Load Rate) - (Total Miles * Carrier Cost-Per-Mile)`.

### Financials & Compliance
- **REQ-401 (Automated Detention):** The system must calculate detention pay automatically when a carrier's GPS dwell time at a Geo-fenced location exceeds 2 hours.
- **REQ-402 (Immutable Audit):** Every financial transaction or fee adjustment must be recorded in an append-only audit ledger protected by RLS.
- **REQ-403 (Fraud Prevention):** System must flag "Double Brokering" risks if a load is claimed by a tenant whose USDOT history shows frequent authority re-instatements.

### Non-Functional Requirements (NFRs)
- **NFR-501 (Complexity):** **Strict Gate:** No method shall exceed a **Cyclomatic Complexity of 10**.
- **NFR-502 (Test Coverage):** Minimum **80% Branch Coverage** enforced via JaCoCo.
- **NFR-503 (Scalability):** The Enon instance must utilize partial indexes on `tenant_id` and `status` to maintain sub-second query performance as the dataset grows.
- **NFR-504 (API Response Caching):** **All GET endpoints must implement response-level caching** at the service or gateway layer. Cache invalidation must be triggered **immediately and atomically** whenever the underlying domain entity (Load, Carrier, Settlement, User Profile, etc.) is modified (CREATE, UPDATE, DELETE). Caching strategy must be tenant-aware and must NOT expose cross-tenant data. Cache keys MUST include `tenant_id` to ensure isolation.

---

*Last updated: 2026-04-23*  
*Source: Scan of docs/phases/, backend controllers & services, frontend pages, Flyway migrations, business architecture*
