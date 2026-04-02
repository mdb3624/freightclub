# FreightClub Features Documentation

This directory documents all features and capabilities, organized by user role and phase.

---

## Core Features (Phase 1 — Complete)

### Load Management (Shipper)
- **Post Load:** Shippers create loads with origin, destination, weight, equipment type, rate, and pickup/delivery windows
- **Edit Load:** Modify active loads (all fields updatable until claimed)
- **Cancel Load:** Withdraw a load; if claimed, shipper must provide cancellation reason
- **Dashboard:** View all posted loads with status, claimant, timestamps, and event history

**Files:**
- Frontend: `frontend/src/features/loads/`
- Backend: `com.freightclub.controller.LoadController`, `com.freightclub.service.LoadService`

### Load Discovery & Claiming (Trucker)
- **Load Board:** Browse available loads with filtering by origin state, destination state, equipment type, pickup date
- **Claim Load:** Race-condition safe claim via `SELECT FOR UPDATE`; only one active claim per load
- **Load Detail:** View full load details, profitability breakdown, and shipper info before claiming
- **Active Load Slot:** Truckers can hold one claimed load; claiming a new load auto-releases the previous one
- **Pickup/Delivery:** Mark load as picked up or delivered; updates `load_events` and triggers subsequent notifications

**Files:**
- Frontend: `frontend/src/features/loads/`, `frontend/src/features/profile/TruckerDashboard.tsx`
- Backend: `com.freightclub.service.LoadService`, `com.freightclub.repository.LoadRepository`

### Cost Profiling & Profitability (Trucker)
- **Cost Profile:** Trucker configures monthly fixed costs, fuel price, MPG, maintenance per mile, monthly mileage target, target profit margin
- **CPM Calculation:** Real-time cost-per-mile based on profile, updated live as values change
- **Minimum RPM:** Calculates minimum acceptable revenue-per-mile to cover costs + target margin
- **Load Profitability Badge:** Green (profitable), yellow (marginal), red (below cost) on every load
- **Per-Load Breakdown:** Estimated revenue, fuel cost, maintenance cost, net profit, RPM vs minimum RPM
- **30-Day Earnings:** Loads completed, total miles, total revenue, effective CPM over trailing month

**Files:**
- Frontend: `frontend/src/features/profile/`, `TruckerDashboard.tsx`, profitability components
- Backend: `com.freightclub.service.ProfitabilityService`, `TruckerCostProfile` entity

### Authentication & Multi-Tenancy
- **Registration:** Email/password signup with role selection (SHIPPER or TRUCKER)
- **Login:** Email/password auth with JWT (short-lived access token + HTTP-only refresh cookie)
- **Multi-Tenant Onboarding:** Join existing company via join code or create new tenant
- **Refresh Token Rotation:** Automatic token refresh on 401; 7-day expiration per JWT spec
- **Rate Limiting:** 10 requests/minute/IP on login and register endpoints (Bucket4j)
- **JWT Security:** RS256 signing, `iss`/`aud` claim validation on every request

**Files:**
- Frontend: `frontend/src/features/auth/`
- Backend: `com.freightclub.security.JwtAuthenticationFilter`, `com.freightclub.service.AuthService`, `com.freightclub.service.RefreshTokenService`

### Hours of Service (HOS) Widget (Trucker)
- **11-Hour Rule:** Tracks consecutive driving hours; resets on 10+ hour off-duty
- **14-Hour Rule:** Tracks on-duty elapsed time; resets on 10+ hour off-duty
- **70-Hour / 8-Day Cycle:** Cumulative driving hours over rolling 8-day window (unfinished in Phase 2; backend persistence pending)
- **Visual Indicators:** Status display with color coding (green = compliant, yellow = approaching limit, red = violated)

**Status:** Partially implemented. 70-hr/8-day backend persistence and state sync are Phase 2 tasks.

**Files:**
- Frontend: `frontend/src/features/hos/HosWidget.tsx`
- Backend: Pending Phase 2 implementation

---

## Phase 1.1 Additions — UX & Data Integrity (Complete)

### State/Province Code Validation
- All origin/destination state fields enforced as `CHAR(2)` validated codes
- Frontend uses `<select>` dropdowns, never free-text input
- Prevents filter mismatch: "Illinois" vs "IL" silently breaks trucker filters

### Overweight Load Acknowledgment
- Loads > 80,000 lbs require explicit `overweightAcknowledged=true` checkbox on creation and update
- Prevents accidental posting of hazmat/overweight loads without shipper awareness

### URL-Based Filter State
- Load board filters (origin, destination, equipment, pickup date) stored in URL query params
- Enables browser back/forward navigation, bookmarkable views, shareable filtered boards

### Soft Deletes
- All destructive operations use soft deletes (`deleted_at` timestamp)
- Audit trail and recovery preserved; no hard deletes in production

---

## Phase 1.2 Additions — Security & Stability (Complete)

### Load Event Audit Trail
- Immutable `load_events` table records all status transitions: CREATED, PUBLISHED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED
- Each event includes actor_id, timestamp, and optional note
- Enables Phase 2 notifications and status timeline

### Claims Table & Claim History
- `claims` table maintains authoritative record of all claims: status (ACTIVE, RELEASED, CANCELLED), claimant, timestamps
- `loads.trucker_id` is a denormalized cache of the current claimant
- Enables Phase 4 ratings (link to specific claim) and Phase 8 bidding (multiple claimants)

### Race Condition Fixes
- **Claim Lock:** `SELECT FOR UPDATE` on load row during claim to prevent two truckers claiming simultaneously
- **Partial Index:** Unique index on `(load_id)` filtered to `status='CLAIMED'` as secondary safety
- **Refresh Token Rotation:** Pessimistic lock on token row during refresh to prevent double-issuance

### CORS & Security Hardening
- `allowedHeaders` changed from `["*"]` to explicit whitelist (Content-Type, Authorization, Accept)
- Removed hardcoded developer infra from `vite.config.ts`
- JWT secret moved to environment variable

### Auth Rate Limiting
- Bucket4j rate limiter: 10 requests/minute/IP on `/auth/login` and `/auth/register`
- Prevents brute force and credential stuffing

### Frontend Stability
- `<ErrorBoundary>` added to `App.tsx`; catches React errors and prevents white screen
- URL filter params validated before enum cast (prevents URL injection)
- Date comparisons use `new Date()` for reliable timezone-aware logic

### Test Coverage
- `AuthService` and `RefreshTokenService` unit tests
- Claim concurrency integration test
- Frontend claim flow smoke tests
- 109 backend tests, 17 frontend tests passing

---

## Phase 2 Features (In Progress)

### Email Notifications
- **Claim Notification:** Shipper receives email when trucker claims their load
- **Pickup Notification:** Shipper receives email when load is picked up
- **Delivery Notification:** Shipper receives email when load is delivered; includes delivery evidence prompt
- **Cancellation Notification:** Trucker receives email with cancellation reason if shipper cancels an active load

**Status:** In development

### In-App Notification Bell
- Unread notification count badge on navigation bar
- Click to view notification list (paginated, sortable by recency)
- Mark as read / mark all as read
- Persistent storage in `notifications` table; read state tracked per user

**Status:** In development

### Cancel-with-Reason Workflow
- Shipper provides structured reason (paid, preferred carrier, customer request, other) when cancelling claimed load
- Reason visible to trucker in their notifications
- Frees trucker's active load slot immediately for new claims

**Status:** In development

### Status Timeline
- Per-load immutable event history: all status changes with actor, timestamp, and notes
- Visible on load detail page to both shipper and trucker
- Powered by `load_events` table (built Phase 1.2)

**Status:** In development

### EIA Fuel Price Integration
- Real-time regional diesel prices (Diesel West, Diesel South) from U.S. EIA Open Data API
- Week-over-week delta with color coding (rising 🔴, falling 🟢)
- Market ticker display on dashboard / load board
- Auto-population of fuel surcharge in Load Profitability Analyzer
- API key server-side only; 6-hour cache with stale-data indicator

**Status:** In development

**Spec:** [docs/eia-requirements.md](../eia-requirements.md)

---

## Upcoming Features

### Phase 3: Document Management
- BOL (Bill of Lading) upload on load creation
- POD (Proof of Delivery) upload on delivery confirmation
- Document versioning and audit trail

### Phase 4: Ratings & Reviews
- Shipper rating model (payment speed, reliability)
- Trucker visibility of shipper ratings before claiming
- Reputation badges (e.g., "Fast Payer", "Reliable")

### Phase 5: Payments & Invoicing
- Automated invoice generation from POD
- Integrated payment processing (Stripe, ACH)
- Settlement workflow (`DELIVERED → SETTLED`)

### Phase 6: In-App Messaging
- Direct shipper ↔ trucker chat
- Reduces reliance on phone/SMS coordination

### Phase 7: Advanced Carrier Management
- Shipper's preferred carriers list
- Lane-based pricing (shipper configures rates per origin-destination pair)

### Phase 7b: Advanced Financial Intelligence
- P&L reports for individual truckers
- IFTA tax export (per-state fuel tax data)
- YTD earnings and profitability trends

### Phase 8: Bidding
- Competitive auction model alongside first-come-first-served
- Multiple truckers can submit bids; shipper awards load to lowest bid

### Phase 9: Admin & Operations
- Dispute resolution tools (shipper claims non-delivery, resolution workflow)
- Performance scorecards (shipper completion rate, trucker on-time delivery %)
- ELD (Electronic Logging Device) integration for HOS sync

---

## Documentation Files

| Document | Purpose |
|----------|---------|
| [../owner_operator.md](../owner_operator.md) | Owner/operator persona requirements |
| [../shipper.md](../shipper.md) | Shipper persona requirements |
| [../phases/](../phases/) | Per-phase feature specifications |
| [../eia-requirements.md](../eia-requirements.md) | EIA fuel price API integration spec |
