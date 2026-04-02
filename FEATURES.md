# FreightClub Features

FreightClub is a multi-tenant SaaS load board platform for the trucking industry. Shippers post loads (freight to be transported), and owner/operator truckers browse, claim, and deliver those loads. The platform emphasizes transparency, trust through ratings, and financial intelligence tools to help truckers make profitable decisions.

---

## Authentication & Security

### User Registration and Login
**Status:** Implemented

Register new shipper or trucker accounts with email and password. Login with JWT-based authentication (short-lived access token in memory + HTTP-only refresh cookie). JWT tokens include issuer (`freightclub`) and audience (`freightclub-api`) claims for lateral-movement protection.

- Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- Refresh token rotation on every `/auth/refresh` call
- Rate limiting: max 10 requests per IP per minute on auth endpoints (Bucket4j)
- Passwords hashed with BCrypt (strength 12)

### Token Refresh
**Status:** Implemented

Silent refresh of expired access tokens via HTTP-only cookie. Frontend Axios interceptor handles 401 responses by calling `/api/v1/auth/refresh`.

- Endpoint: `POST /api/v1/auth/refresh`
- Refresh tokens stored in DB and revocable (`revoked_at` column added in migration `V20260320_010`)

### Logout
**Status:** Implemented

Clear in-memory access token and revoke HTTP-only refresh cookie.

- Endpoint: `POST /api/v1/auth/logout`

---

## Load Lifecycle (Core)

### Create & Publish Loads (Shipper)
**Status:** Implemented

Shippers create loads with full details: origin/destination addresses (state stored as CHAR(2)), commodity type, weight, dimensions (L×W×H), pickup/delivery date windows, pay rate, payment terms. Loads can be created as drafts (DRAFT status) or published immediately (OPEN status). Overweight loads (>80,000 lb) require explicit acknowledgment.

- Endpoints: `POST /api/v1/loads` (publish), `POST /api/v1/loads/draft` (draft)
- BOL auto-generated on publish
- Pay rate types: flat rate or per-mile
- Payment terms: COD, prepaid, net 7/14/30

### Edit Loads (Shipper)
**Status:** Implemented

Shippers can edit unpublished or open loads. Overweight acknowledgment enforced on updates.

- Endpoint: `PUT /api/v1/loads/{id}`

### Cancel Load (Shipper)
**Status:** Implemented

Cancel open or claimed loads with a required reason. If load is claimed, the trucker is notified with the cancellation reason and the active claim is released.

- Endpoint: `PATCH /api/v1/loads/{id}/cancel`
- Reason stored in `loads.cancel_reason` (migration `V20260331_002`)

### Load Board (Trucker)
**Status:** Implemented

Truckers browse available loads (OPEN status) with filtering by origin state, destination state, equipment type, and pickup date range. Results include shipper reputation badge and RPM profitability indicator.

- Endpoint: `GET /api/v1/loads/board` (filtered by `status=OPEN`)
- URL query params guarded with enum-safe helpers on the frontend

### Claim Load (Trucker)
**Status:** Implemented

Trucker claims an open load. Uses `SELECT FOR UPDATE` row-level locking to prevent concurrent claim race conditions. Both parties' contact info becomes visible after successful claim.

- Endpoint: `POST /api/v1/loads/{id}/claim`
- Atomically sets `loads.status = CLAIMED`, creates `claims` record with `status=ACTIVE`
- One active load per trucker at a time enforced

### Mark Picked Up (Trucker)
**Status:** Implemented

Trucker marks load as picked up. Status transitions to `PICKED_UP`; shipper notified in-app and via email.

- Endpoint: `PATCH /api/v1/loads/{id}/pickup`

### Mark Delivered (Trucker)
**Status:** Implemented

Trucker marks load as delivered. Status transitions to `DELIVERED`; shipper notified in-app and via email. Enables post-delivery ratings.

- Endpoint: `PATCH /api/v1/loads/{id}/deliver`

### Load Status Timeline
**Status:** Implemented

Immutable per-load event log (`load_events` table). Every status transition writes a `LoadEvent` row with actor ID, event type, timestamp, and optional note.

- Endpoint: `GET /api/v1/loads/{id}/events`
- Event types: CREATED, PUBLISHED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED
- Never deleted; provides full audit trail

### Load Status Counts
**Status:** Implemented

Summary counts of loads by status for dashboard widgets.

- Endpoint: `GET /api/v1/loads/counts`

---

## User Profiles

### Shipper Profile
**Status:** Implemented

Company name, contact info, address, and billing state.

- Endpoints: `GET /api/v1/profile`, `PUT /api/v1/profile`

### Trucker Profile
**Status:** Implemented

DOT number, carrier name, phone, home state, and full cost profile (fixed costs, fuel $/gal, MPG, maintenance $/mi, monthly target miles, target margin per mile).

- Endpoints: `GET /api/v1/profile`, `PUT /api/v1/profile`

---

## Notifications

### In-App Notifications
**Status:** Implemented

Paginated notification history with read/unread tracking. Bell icon (`NotificationBell.tsx`) shows unread count badge. Triggered on load claimed, picked up, delivered, and cancelled (with reason).

- Endpoints: `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/{id}/read`, `PATCH /api/v1/notifications/read-all`
- Schema: `notifications` table added in migration `V20260331_001`
- Frontend: `features/notifications/` — types, api, hooks, `NotificationBell` component

### Email Notifications
**Status:** Partial

`EmailService` is implemented with method stubs for sending emails on load status changes (claimed, picked up, delivered, cancelled). The service is wired into `LoadService` and called asynchronously, but email delivery infrastructure (SMTP configuration, templates) is not fully configured for production. Calls log a warning and no-op if not configured.

---

## Ratings & Reputation

### Rate After Delivery
**Status:** Implemented

After `DELIVERED` status, both shipper and trucker can rate each other (1–5 stars + optional comment). Prevents duplicate ratings per load per rater.

- Endpoints: `POST /api/v1/ratings/{loadId}/trucker`, `POST /api/v1/ratings/{loadId}/shipper`

### Trucker Rating Summary
**Status:** Implemented

Aggregate average stars and rating count visible on trucker profile and load board cards.

- Endpoints: `GET /api/v1/ratings/my-summary`, `GET /api/v1/ratings/trucker/{userId}/summary`

### Shipper Public Profile
**Status:** Implemented

Reputation profile showing average rating, estimated payment speed, completed load count, and dispute/cancellation flags.

- Endpoint: `GET /api/v1/ratings/shipper/{userId}/profile`

### Rating History
**Status:** Implemented

Paginated list of ratings the current user has received.

- Endpoint: `GET /api/v1/ratings/my-received`

---

## Financial Intelligence

### Trucker Cost Profile
**Status:** Implemented

Monthly fixed costs, fuel $/gal, MPG, maintenance $/mi, monthly target miles, and target margin per mile stored on the user record.

### Cost Per Mile (CPM) Calculator
**Status:** Implemented

Real-time CPM display on the trucker dashboard showing fixed CPM, variable CPM, total CPM, and minimum RPM derived from the cost profile.

### Load Profitability Badge
**Status:** Implemented

Color-coded badge on load board cards (green/yellow/red) relative to trucker's minimum RPM. Requires a populated cost profile to display.

### Per-Load Profitability Breakdown
**Status:** Implemented

Detailed analysis on the load detail page: estimated revenue, fuel cost, maintenance cost, net profit, and RPM vs. minimum RPM.

### 30-Day Earnings Summary
**Status:** Implemented

Dashboard widget showing loads completed, total miles, total revenue, and effective CPM for the past 30 days.

### Hours of Service (HOS) Widget
**Status:** Partial

Manual HOS tracking with progress bars for the 11-hour drive limit and 14-hour on-duty window. Not persisted to the backend — resets on page refresh. Does not track the 70-hr/8-day cumulative cycle. Feature lives in `frontend/src/features/hos/`.

---

## Market Data

### Diesel Price Backend Service
**Status:** Implemented

`EiaFuelPriceService` proxies the U.S. EIA Open Data API v2. Server-side in-memory cache with a 6-hour TTL and automatic fallback to stale cache on API failure. Returns prices for all 5 PADD regions (East, Midwest, South, Rocky Mountain, West).

- Endpoint: `GET /api/v1/market/diesel-prices` — public, no auth required (permitted in `SecurityConfig`)
- Never exposes the EIA API key to the client
- Stale data flagged with `isStale: true` if cache is older than 48 hours
- Controlled by `app.eia.enabled` flag; when `false` the service returns a hardcoded fallback response (useful in dev/test without a key)
- Requires `app.eia.api-key` in config for live data

### Diesel Price in UI
**Status:** Implemented

- **Landing page (`TruckerLandingPage.tsx`):** Scrolling market ticker showing all 5 PADD regions with prices and week-over-week deltas
- **Trucker dashboard (`TruckerDashboard.tsx`):** Compact price bar at top of the dashboard
- Color-coded deltas: red = price up, green = price down (trucker cost perspective)
- Frontend data layer: `features/market/` — `api.ts`, `hooks/useDieselPrices.ts`, `types.ts`; no separate UI components (rendering is inline in the pages)

---

## Documents

### BOL Generation
**Status:** Implemented

`BolGeneratorService` auto-generates a digital Bill of Lading record at load publish time. BOL metadata stored in the `load_documents` table (migration `V20260323_001`).

### Document Upload & Storage
**Status:** Partial

`DocumentController` exposes endpoints for uploading BOL photos (at pickup) and POD photos (at delivery) to S3-compatible storage. The backend service and controller are wired, but the frontend UI for triggering uploads is not yet built. S3 configuration must be supplied via environment; the service will fail gracefully if not configured.

---

## Dashboards

### Shipper Dashboard
**Status:** Implemented

Paginated list of all shipper's loads with status filters, action buttons (publish, edit, cancel), and load detail view.

### Trucker Dashboard
**Status:** Implemented

Multi-tab interface:
- **Active Load:** currently claimed load with full details and per-load profitability breakdown
- **Load History:** past 30 days of completed loads with earnings summary widget
- **Load Board:** available open loads with filtering and profitability badges
- **Diesel Price Bar:** real-time prices for all 5 PADD regions at the top of the dashboard

---

## Platform

### Multi-Tenancy
**Status:** Implemented

Shared schema with `tenant_id` row-level isolation enforced at the application layer on every query. Email uniqueness is scoped per tenant per role (migration `V20260320_009`). Tenant join code supported on the `tenants` table.

---

## Stubbed vs. Real — Summary

| Area | What's Real | What's Stubbed / Incomplete |
|------|-------------|----------------------------|
| Diesel prices | Live EIA API proxy with cache | Returns fallback data when `app.eia.enabled=false` |
| Email notifications | Service wired and called | SMTP/template config not production-ready; calls are no-ops if unconfigured |
| Document upload | Backend controller + S3 service exist | Frontend upload UI not built |
| HOS widget | UI with manual entry + progress bars | Not persisted; no 70-hr cycle tracking |

---

## Planned / Not Yet Implemented

| Feature | Notes |
|---------|-------|
| BOL/POD photo upload (trucker UI) | Backend exists; frontend UI missing |
| Report issue during transit | Backend exists; frontend UI missing |
| PDF export per load | — |
| Settlement flow (DELIVERED → SETTLED) | — |
| Payment tracking / invoice generation | — |
| In-app direct messaging | — |
| Multi-user company accounts | — |
| DOT number validation | — |
| Bidding / multi-claim system | — |
| Admin console / tenant management | — |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State (UI) | Zustand |
| State (Server) | React Query |
| Backend | Spring Boot 3.x, Java 21 |
| Auth | Spring Security + JWT (RS256) + HTTP-only cookies |
| Database | MySQL 8.x |
| ORM | Spring Data JPA + Hibernate |
| Migrations | Flyway |
