# Phase 2 — Notifications & Status Timeline

Shippers and truckers need to know when something changes without refreshing manually. This also closes the feedback loop that makes the platform trustworthy.

**Key dependency:** `load_events` table enables timeline UI and is the source of truth for notifications. Build this first within the phase.

## Features

| Feature | Area | Notes |
|---------|------|-------|
| Email notifications on load status changes | Platform | Triggered by: claimed, picked up, delivered, cancelled |
| Email notification on load claimed (shipper) | Shipper | |
| Email notification on delivery (shipper) | Shipper | Attach delivery timestamp |
| In-app notification bell with unread count | Both | Stored in DB, cleared on read |
| Full status history + timeline per load | Both | `load_events` table: status, timestamp, actor |
| SMS notifications (optional, phone required) | Platform | Twilio or similar |
| Cancel with reason | Shipper | Required reason field stored on cancellation; shown to affected trucker |
| Trucker cancellation notification | Trucker | If shipper cancels a CLAIMED load: push + email sent, active slot freed immediately |

## EIA Fuel Price API Integration

Live regional diesel prices surfaced in the market ticker, powered by the U.S. Energy Information Administration (EIA) Open Data API v2. Full requirements: [`docs/eia-requirements.md`](../eia-requirements.md).

| Feature | Area | Notes |
|---------|------|-------|
| Backend proxy to EIA API (api key server-side only) | Platform | `GET /api/v1/market/diesel-prices`; never expose key to client |
| Cache EIA response server-side (6hr TTL) | Platform | Reduces API calls; falls back to cache on EIA outage |
| `DIESEL WEST` and `DIESEL SOUTH` in market ticker | Both | Format: `$X.XX/gal`; sourced from EIA duoarea R50 and R4 |
| Week-over-week price delta indicator | Both | Color-coded: red = rising, green = falling |
| Stale data indicator if cache > 48hrs old | Both | Visible in ticker; never silently shows outdated prices |
| Shared diesel price store (React Query) | Frontend | CPM Calculator and Load Profitability Analyzer read from same cache; no duplicate fetches |
| Auto-populate fuel surcharge in Load Profitability Analyzer | Trucker | Calculated from current diesel price × miles; user can override |
| EIA attribution in app data sources section | Platform | "Data: U.S. EIA" — required by EIA Terms of Service |
