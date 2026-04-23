# FreightClub Roadmap

**Last Updated:** 2026-04-04  
**Current Phase:** Phase 2 — In Progress (76%)

---

## Completed Phases

### Phase 1 — Core Load Lifecycle
**Complete as of 2026-03-18**

- Auth: register (SHIPPER / TRUCKER), login, logout, JWT + HTTP-only refresh cookie, multi-tenant join codes
- Load CRUD: create, create-as-draft, publish, edit, cancel with reason
- Load board (trucker): paginated, filterable list of published loads
- Claim load: `SELECT FOR UPDATE` atomic claim with race condition protection
- Mark picked up / mark delivered
- Load status machine: `DRAFT → PUBLISHED → CLAIMED → IN_TRANSIT → DELIVERED / CANCELLED`
- Trucker active load slot (one at a time); full load history
- Shipper and trucker profiles with contact, billing, and truck info
- Financial intelligence: CPM Calculator, cost profile, load profitability badge, per-load breakdown, 30-day earnings summary
- HOS 70-hour / 8-day cycle widget
- Ratings infrastructure: `load_ratings` table, `RatingController`, bidirectional shipper ↔ trucker ratings
- Document management stubs: `load_documents` table, service/controller scaffolding
- JaCoCo ≥70% coverage gate on `LoadService`

### Phase 1.1 — UX Hardening
**Complete as of 2026-03-22**

- Trucker dashboard: Active Load tab, Load History tab, Load Board tab
- Shipper dashboard: paginated load list with status filter tabs and action buttons
- Load detail pages (role-aware) for shipper and trucker
- URL-based filter state (bookmarkable; back/forward navigation)
- State/province code validation (CHAR(2) DB constraints + dropdown selectors)
- Cross-field date validation (Zod `new Date()` comparisons)
- Overweight acknowledgment UI checkbox (> 80,000 lb)
- Soft delete enforcement across all entities
- Address field restructure (address1/2, city, state, zip)
- Toast notifications for user-facing actions

### Phase 1.2 — Security & Stability Hardening
**Complete as of 2026-03-28**

- Auth rate limiting: `AuthRateLimitFilter` (Bucket4j) — 10 req/min/IP; HTTP 429 on breach
- JWT `iss` + `aud` claim validation on every request
- Refresh token rotation with `SELECT FOR UPDATE` (prevents double-issuance)
- BCrypt strength 12
- Load claim pessimistic locking; partial unique index on `claims(load_id) WHERE status='CLAIMED'`
- `ErrorBoundary` class component wrapping entire React tree
- Spring Boot Actuator endpoints

---

## Phase 2 — Notifications, Financial Intelligence & Market Data
**Status: In Progress (76%)**

### Complete
- Email notifications on `CLAIMED`, `PICKED_UP`, `DELIVERED`, `CANCELLED`
- In-app notification bell with unread count in header
- `NotificationsSection` component with list and mark-as-read
- Cancellation with reason — stored on load, surfaced in notifications
- Trucker notified when shipper cancels a claimed load
- Load status timeline UI in `LoadDetailPage` (chronological `LoadEvent` history)
- `load_events` table (`V20260320_008`) — populated on every transition
- `notifications` table (`V20260331_001`)
- EIA Fuel Price API proxy: DIESEL WEST (R50) + DIESEL SOUTH (R30), server-side API key, 6-hour TTL cache
- Diesel price market ticker in header (week-over-week delta, color-coded)
- Stale data indicator when cache > 48 hours
- React Query diesel price store shared across CPM Calculator and Load Profitability Analyzer
- FSC auto-population from diesel price × miles (user-overridable)

### Remaining
1. **EIA attribution text** — "Data: U.S. EIA" required by EIA Terms of Service; not yet shown in UI
2. **SMS notifications** — Twilio integration; scope to be confirmed

### Open Items / Blockers
- EIA South duoarea: phase doc specifies R4 (Gulf Coast) but code fetches R30 — verify correct regional code
- FSC auto-populate on `TruckerLoadDetailPage` per-load card needs verification
- `LoadService.claimLoad()` does not yet write `claims` records — affects Phase 4 rating logic

---

## Phase 3 — Document Management (BOL & POD)
**Status: Planned (10% scaffolded)**

Schema (`V20260323_001`) and service/controller stubs exist. No features are functional end-to-end.

- **File storage infrastructure** — provision S3 or equivalent; implement signed upload URLs
- **Platform-generated BOL** — wire `BolGeneratorService` to `LoadService.publishLoad()`; generate PDF on publish
- **BOL photo upload** (trucker, at pickup) — `POST /documents/{loadId}/bol-photo`
- **POD photo upload** (trucker, at delivery) — `POST /documents/{loadId}/pod-photo`
- **Document viewing** — load detail page shows BOL/POD images; PDF export endpoint
- **Document history & audit** — timestamped log of uploads/downloads
- **Issue reporting** — in-transit issue report UI with optional photo; notification to shipper

---

## Phase 4 — Ratings & Reputation
**Status: Partially Complete (67%)**

Backend complete. Frontend shipper reputation profile incomplete.

### Complete
- `load_ratings` table (`V20260323_002`)
- `RatingController` and `RatingService` — bidirectional ratings after delivery
- Trucker rates shipper; shipper rates trucker (one rating per load per reviewer)
- Rating validation: only allowed after `DELIVERED` status
- Trucker aggregate rating on profile: `RatingsPage`, `StarRating`, `useRatings`

### Remaining
- **Shipper public reputation profile page** — full page showing rating, payment speed, load count, flags
- **Shipper reputation badge on load board** — `ShipperRepBadge` component exists; integration into `LoadBoardTable` rows unconfirmed
- Dispute flag workflow (currently just a boolean; no admin review queue)
- Payment speed tracking automation (currently manual estimate)

---

## Phase 5 — Payments & Invoicing
**Status: Planned (0%)**

- Invoice generation on load delivery (PDF)
- Stripe / ACH payment processing
- Payment status tracking: PENDING, PAID, OVERDUE
- Receipt download for trucker
- Dispute and hold workflow
- Payment terms enforcement (NET_30, NET_60, QUICK_PAY)

---

## Phase 6 — In-App Messaging
**Status: Planned (0%)**

- Per-load message thread between shipper and trucker
- Real-time delivery via WebSocket or SSE
- Unread message badge in header
- Message history persisted in DB

---

## Phase 7 — Advanced Carrier Management
**Status: Planned (0%)**

- Trucker truck/trailer profile (multiple units)
- Preferred lane configuration
- Availability scheduling (available/unavailable windows)
- Load suggestions based on preferred lanes and location
- Carrier scorecards (on-time %, cancellation rate)

---

## Phase 7b — Advanced Financial Intelligence
**Status: Planned (0%)**

- Per-load earnings reports with P&L breakdown
- IFTA fuel tax tracking by state
- Deadhead mile estimates between loads
- FSC auto-population on all load views (confirmed on `TruckerLandingPage`; needs `TruckerLoadDetailPage`)
- Multi-period earnings comparison (weekly, monthly, quarterly)
- Export earnings data (CSV / PDF)

---

## Phase 8 — Bidding
**Status: Planned (0%)**

- Shippers mark loads as "open to bid"
- Truckers submit rate bids with expiry
- Shipper accepts / declines bids
- Bid history per load
- Counter-offer workflow

---

## Phase 9 — Admin & Operations
**Status: Planned (0%)**

- Admin dashboard: platform-wide metrics (loads, users, revenue)
- Tenant management: create, suspend, manage plans
- Dispute resolution tools
- Rate benchmarking data (market rate vs. posted rate)
- ELD integration (Hours of Service data pull)
- Multi-user company accounts (one tenant, multiple logins)
- Load matching / recommendations

---

## Out of Scope (Current Horizon)

- GPS / real-time load tracking
- Broker / factoring company integrations
- Mobile native app (iOS / Android)
- Freight insurance marketplace
- Autonomous / AI load matching
