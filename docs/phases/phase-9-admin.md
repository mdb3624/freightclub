# Phase 9 — Admin & Operations

Internal tools needed to operate the platform at scale.

**Dependency:** Requires Phase 5 and Phase 7.

## Features

| Feature | Area | Notes |
|---------|------|-------|
| Admin dashboard: users, loads, tenants | Admin | Read-only view + basic moderation |
| Dispute resolution tools | Admin | View flagged payments; manual settlement |
| Platform health metrics | Admin | Load volume, claim rate, avg time-to-claim |
| Rate benchmarking tool | Shipper | Show market rate for a lane at time of posting |
| Carrier scorecard (detailed metrics per trucker) | Shipper | |
| ELD integration for automated HOS tracking | Trucker | Replace manual HOS widget with real ELD data feed |
| Document upload: insurance certificate, CDL, medical card | Trucker | Verified carrier credentials visible to shippers |
| Freight insurance integration | Both | Optional per-load cargo insurance at booking |
| TMS API access | Shipper | REST API for shippers with their own Transportation Management System |
| Recurring load scheduling | Shipper | Post the same lane automatically on a weekly/monthly cadence |
