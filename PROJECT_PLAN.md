# FreightClub — Project Plan

## Approach

Features are grouped into phases by dependency order and user value. Each phase produces a shippable, testable increment. Phases are designed so the platform remains usable end-to-end after each one.

---

## Phase 1 — Core Load Lifecycle ✅ Complete

The minimum viable loop: a shipper posts a load, a trucker claims and delivers it. Includes financial intelligence tools so truckers can evaluate profitability before committing to a load.

### Core Lifecycle

| Feature | Area |
|---------|------|
| Auth: register, login, JWT refresh | Platform |
| Multi-tenant company system with join code | Platform |
| Shipper: create, edit, cancel, publish loads | Shipper |
| Trucker: browse and filter load board | Trucker |
| Trucker: claim, mark pickup, mark delivered | Trucker |
| Load dimensions (L×W×H), pay rate, payment terms | Both |
| Draft → publish flow | Shipper |
| Shipper and trucker contact info reveal after claim | Both |
| Shipper dashboard (all loads + statuses) | Shipper |
| Trucker dashboard (active load + history + load board tabs) | Trucker |
| Trucker and shipper profiles | Both |

### Financial Intelligence (Trucker)

| Feature | Area |
|---------|------|
| Cost profile: fixed costs, fuel $/gal, MPG, maintenance $/mi, monthly target miles, target margin | Trucker |
| Cost Per Mile (CPM) calculator: fixed CPM, variable CPM, total CPM — live on profile | Trucker |
| Minimum RPM = total CPM + target margin; visible on profile | Trucker |
| RPM column on load board with color-coded profitability badge (green / yellow / red) | Trucker |
| Per-load profitability breakdown: revenue, fuel cost, maintenance, net profit, RPM vs min RPM | Trucker |
| 30-day earnings summary: loads completed, total miles, total revenue, effective CPM | Trucker |
| Hours of Service (HOS) widget: 11-hr drive and 14-hr on-duty progress bars with color warnings | Trucker |

---

## Phase 1.1 — UX Hardening (Pre-Phase 2 Gate) ✅ Complete

These issues were identified through a human factors review of Phase 1 output. They must be resolved before Phase 2 work begins — several affect data integrity and regulatory compliance, not just polish.

### Critical (Data Integrity / Safety)

| Issue | Area | Detail |
|-------|------|--------|
| State field → validated dropdown | Load Form (Shipper) | `originState` / `destinationState` are free-text inputs. Truckers filter by 2-letter code (e.g. `IL`); a shipper entering `Illinois` causes filter mismatch — the load becomes invisible to truckers filtering by state |
| Cancel load confirmation dialog | Shipper Dashboard | Cancelling a live load is a destructive action with downstream impact (notifies trucker, frees slot). No confirmation dialog currently exists |
| 70-hr/8-day HOS cycle | HOS Widget (Trucker) | FMCSA requires tracking cumulative on-duty hours over a rolling 8-day window. Current widget only tracks the current shift (11-hr drive + 14-hr on-duty). This is a separate, additional legal constraint |

### Significant (UX Correctness)

| Issue | Area | Detail |
|-------|------|--------|
| Address field order | Load Form | City/State/Zip renders before Street — reverse of US postal convention and user mental model |
| Cross-field date validation | Load Form | No validation that `pickupTo > pickupFrom`, `deliveryFrom > pickupTo`, `deliveryTo > deliveryFrom` |
| Pickup/delivery window label ambiguity | Load Form | "Pickup From" reads as origin location, not time window. Rename to "Earliest Pickup" / "Latest Pickup" / "Earliest Delivery" / "Latest Delivery" |
| Filter state lost on back-navigation | Load Board | Truckers lose all filter state when returning from a load detail page |
| Equipment filter locked | Load Board | Filter is locked when profile type is set; truckers with multiple trailer types cannot browse other equipment |
| Profitability card hidden post-claim | Load Detail | Profitability breakdown disappears once load is claimed — still needed for planning during execution |
| Silent load board grayout | Trucker Dashboard | When an active load exists, the entire board is grayed with no explanation; trucker doesn't know why they can't claim |
| RPM precision | Load Board / Detail | RPM shown to 4 decimal places; 2dp is sufficient and reduces noise |
| Cost profile CTA buried | Trucker Profile | When no cost profile is set, the RPM badge and profitability card are empty — the prompt to set up a profile is styled as a `text-xs` footnote |
| No claim success feedback | Trucker | No toast or confirmation after a successful claim; user is left uncertain |

### Minor (Labeling / Contextual Hints)

| Issue | Area | Detail |
|-------|------|--------|
| Weight field hint | Load Form | Add contextual hint: "Legal max: 80,000 lbs" to prevent accidental overweight loads |
| Shipper status summary strip | Shipper Dashboard | Add at-a-glance count of loads by status (open, claimed, in transit, delivered) above the loads table |
| HOS on-duty bar inactive until start time | HOS Widget | Bar shows empty with no guidance; should prompt trucker to enter start time |
| HOS warnings only at <2 hr | HOS Widget | Proactive stop planning requires a 4-hour warning; current threshold is too late |
| Pickup urgency signal | Load Board | No visual signal for loads picking up soon; urgency is invisible on the current table |

### Database Hardening

These schema fixes must accompany or precede the UX fixes above — the state dropdown fix (UX critical #1) is only half the solution without the `CHAR(2)` column type fix at the DB layer.

| Issue | Severity | Migration |
|-------|----------|-----------|
| `origin_state`/`destination_state` → `CHAR(2)` + `CHECK` | **Critical** | Backfill then `MODIFY COLUMN` + `ADD CONSTRAINT CHECK` |
| `loads.created_at`/`updated_at` → add `DEFAULT CURRENT_TIMESTAMP` | **Critical** | `ALTER TABLE loads MODIFY COLUMN ...` |
| `loads.trucker_id` → add FK → `users.id` | **Critical** | `ADD CONSTRAINT fk_loads_trucker FOREIGN KEY` |
| `claims` table created | **Critical** | New table migration; load service updated to write claim records |
| Missing load board indexes | Significant | `CREATE INDEX` for `(tenant_id, equipment_type, status)`, `(tenant_id, origin_state)`, `(tenant_id, pickup_from, status)`, `(trucker_id, status)` |
| `CHECK` constraints on enum columns | Significant | `ADD CONSTRAINT chk_loads_status`, `chk_loads_equipment_type`, etc. |
| `loads.payment_terms` → `NOT NULL` | Significant | After verifying no NULL rows; `MODIFY COLUMN payment_terms VARCHAR(20) NOT NULL` |
| `load_events` table stub | Significant | New table migration; Phase 2 will populate it |
| Email uniqueness → per-tenant | Significant | Drop global UK; add `UNIQUE KEY uq_users_tenant_email (tenant_id, email)` |
| `billing_state`/`default_pickup_state` → `CHAR(2)` | Minor | `MODIFY COLUMN` after backfill |
| `origin_zip`/`destination_zip` cleanup | Minor | Confirm unused; `DROP COLUMN` |
| `refresh_tokens.revoked_at` | Minor | `ADD COLUMN revoked_at DATETIME NULL` |

**Note:** `trucker_cost_profiles` table extraction is **not** in Phase 1.1 — it requires a data migration of existing cost profile data and a service layer change. Schedule for Phase 7b when financial reporting features are built. Document the tech debt in code.

---

## Phase 1.2 — Security & Stability Hardening (Pre-Phase 2 Gate)

Identified during a post-Phase 1.1 security and architecture review. These issues must be resolved before Phase 2 begins — two are race conditions that corrupt core data, and the untested auth surface is a prerequisite for any work that depends on the auth flow being correct.

### Critical Security (Data Corruption Risk)

| Issue | Area | Detail |
|-------|------|--------|
| Race condition — load claiming | `LoadService.claimLoad` | Two truckers can pass the `OPEN` status check simultaneously and both claim the same load. Fix: `SELECT FOR UPDATE` on the load row, or a DB-level unique partial index on `(load_id) WHERE status = 'CLAIMED'` |
| Race condition — refresh token rotation | `RefreshTokenService` | Two simultaneous refresh requests can both pass `!isRevoked()`, each receiving a valid token. Fix: `SELECT FOR UPDATE` on the refresh token row |
| No rate limiting on `/api/v1/auth/**` | Security | Login and register are fully open with no throttle. Add Spring Security rate limiting or a servlet filter with a token bucket |
| JWT missing `iss`/`aud` claims | `JwtService` | Tokens have no issuer or audience binding — valid in any future service context. Add `issuer` and `audience` claims on generation; validate on parsing |

### Critical Security (Secrets & Configuration)

| Issue | Area | Detail |
|-------|------|--------|
| JWT secret committed to Git | `application-dev.yml` | Hex secret is in source history. Move to environment variable / secrets manager before any production use |
| Developer Tailscale domain hardcoded | `vite.config.ts` | Personal infrastructure in repo. Replace with environment variable |
| CORS `allowedHeaders: ["*"]` | `SecurityConfig` | Permit-all headers. Replace with explicit whitelist: `Authorization`, `Content-Type`, `X-Requested-With` |

### High — Known Bugs

| Issue | Area | Detail |
|-------|------|--------|
| `claims` table never written | `LoadService.claimLoad` | Migration exists; service never inserts. Required for Phase 4 ratings, Phase 2 cancellation notifications, and Phase 8 bidding |
| `load_events` table never written | `LoadService` | Migration exists; no status transition writes to it. Required for Phase 2 timeline and notifications |
| Date comparison uses string ordering | `LoadForm.tsx` | Cross-field date validation compares `datetime-local` strings lexicographically — brittle. Must use `new Date()` comparison |
| URL filter params cast to enum without validation | `TruckerDashboard.tsx` | `searchParams.get('equip') as EquipmentType` passes any string into the filter. Add enum guard before cast |
| Overweight load — backend has no validation | `LoadService` | Frontend checkbox is the only guard. Add server-side weight validation |
| HOS widget state lost on page refresh | Frontend | All HOS values are React-only state; lost on reload. Add backend persistence endpoint |

### Infrastructure (Minimum Viable)

| Issue | Detail |
|-------|--------|
| React `<ErrorBoundary>` missing | Any render error produces a blank screen. Add to `App.tsx` |
| Spring Boot Actuator absent | Add dependency; expose `/health` and `/info` at minimum |
| No production environment config | Create `application-prod.yml` with environment variable placeholders for all secrets and environment-specific values |
| Structured logging | Add a logging format with correlation IDs for request tracing |

### Testing (Minimum Viable)

| Scope | Detail |
|-------|--------|
| `AuthService` — register, login, refresh, logout | Security-critical; zero coverage today |
| `RefreshTokenService` — rotation, revocation | Covers the race condition fix |
| `JwtAuthenticationFilter` — token extraction, validation | Covers the auth chain |
| Integration test — claim load concurrency | Proves the race condition fix actually holds |
| Frontend smoke tests for claim flow | At minimum: claim button renders, claim mutation fires, toast appears |

---

## Phase 2 — Notifications & Status Timeline

Shippers and truckers need to know when something changes without refreshing manually. This also closes the feedback loop that makes the platform trustworthy.

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

**Key dependency:** `load_events` table enables timeline UI and is the source of truth for notifications. Build this first within the phase.

---

## Phase 3 — Document Management (BOL & POD) ✅ Complete

Trucking depends on documentation. Without BOL and POD, the platform can't support real freight moves or payment settlement.

| Feature | Area | Notes |
|---------|------|-------|
| File storage infrastructure (S3 or equivalent) | Platform | Signed upload URLs; store key in DB |
| Platform-generated digital BOL at publish time | Platform | Generated from load data (addresses, commodity, weight, equipment); available immediately to shipper |
| BOL photo upload by trucker at pickup | Trucker | Required to complete `mark as picked up` |
| POD photo upload by trucker at delivery | Trucker | Required to complete `mark as delivered` |
| View BOL and POD on load detail (shipper + trucker) | Both | |
| PDF export per load (details + documents) | Both | Generated on demand |
| Document history per load for auditing | Both | Timestamped log of all uploads and downloads |
| Report issue during transit | Trucker | Text + optional photo; triggers shipper notification |

---

## Phase 4 — Ratings & Reviews

Ratings are the trust layer that determines which loads get claimed and which truckers get repeat work. They unlock the carrier selection features in Phase 7. The shipper reputation model is particularly important — truckers use it to decide whether to claim before committing their one active load slot.

| Feature | Area | Notes |
|---------|------|-------|
| Trucker rates shipper after delivery | Trucker | 1–5 stars + optional comment |
| Shipper rates trucker after delivery | Shipper | 1–5 stars + optional comment |
| Aggregate rating displayed on trucker profile | Trucker | Visible to shippers browsing claimed loads |
| Shipper public reputation profile | Shipper | Overall rating, avg payment speed (e.g. "Typically pays in 7 days"), completed load count, dispute/cancellation flags |
| Shipper reputation badge on load board cards | Trucker | Visible before claiming — star rating + payment speed |
| Rating history page (own ratings received) | Both | |

---

## Phase 5 — Payments & Invoicing

Completes the financial lifecycle. Depends on Phase 3 (POD triggers settlement) and Phase 4 (disputes reference ratings).

| Feature | Area | Notes |
|---------|------|-------|
| Automatic invoice generated on delivery confirmation | Platform | PDF with load details, rate, and POD reference |
| Payment processing integration (Stripe or ACH) | Platform | Shipper pays carrier through platform |
| Trucker bank account / direct deposit setup | Trucker | Stripe Connect or equivalent |
| Payment history per load | Both | |
| Receipts per transaction | Both | |
| Mark load as SETTLED after payment confirmed | Platform | Final status transition |
| Payment dispute flow | Shipper | Flag delivery; hold payment pending resolution |

---

## Phase 6 — In-App Messaging

Direct communication between shipper and trucker reduces off-platform dependency and keeps context in the load record.

| Feature | Area | Notes |
|---------|------|-------|
| Per-load message thread (shipper ↔ trucker) | Both | Only visible after load is claimed |
| Real-time delivery (WebSocket or SSE) | Platform | Falls back to polling |
| Unread message badge on dashboard | Both | |
| Message notification (email + in-app) | Both | |

---

## Phase 7 — Advanced Carrier Management

Enables shippers to build preferred networks and truckers to target better lanes.

| Feature | Area | Notes |
|---------|------|-------|
| Trucker truck/trailer profile (type, dimensions, capacity) | Trucker | Stored on profile; enables equipment matching and carrier vetting |
| Trucker preferred lanes (origin/destination regions) | Trucker | Stored on profile; used for suggested loads |
| Trucker availability (days/hours) | Trucker | |
| Suggested loads for trucker based on lanes | Trucker | Filter board by saved preferences |
| Load board filter: weight range, minimum pay rate | Trucker | Completes the filter set alongside existing origin/destination/equipment/date filters |
| Load posting validation prompts | Shipper | In-form tips during load creation: accurate weight, state special requirements, competitive rates, realistic windows |
| Shipper preferred carrier list | Shipper | Save trusted truckers; quick-assign |
| Direct load assignment to preferred trucker | Shipper | Bypasses open board |
| Block carrier | Shipper | Blocked trucker cannot claim this shipper's loads |
| View trucker public profile (rating, equipment, history) | Shipper | |
| Load interest / view count | Trucker | Visible on load board |

---

## Phase 7b — Advanced Financial Intelligence (Trucker)

Deepens the financial tooling introduced in Phase 1. Depends on Phase 5 (payments) for accurate per-load earnings data and Phase 3 (documents) for mileage records.

| Feature | Area | Notes |
|---------|------|-------|
| Per-load earnings log: actual miles driven, fuel used, net profit | Trucker | Stored after delivery confirmation |
| Weekly / monthly P&L report | Trucker | Revenue, costs, net profit over selectable period |
| IFTA mileage tracking by state | Trucker | Required for quarterly fuel tax filing |
| Deadhead mileage estimate (current location → pickup) | Trucker | Requires location permission; affects true CPM |
| Deadhead cost included in per-load profitability calculation | Trucker | Full cost = run cost + deadhead cost |
| Fuel surcharge (FSC) auto-calculation based on DOE national average | Trucker | Shown on load detail if shipper enables FSC |
| Annual earnings + tax summary export | Trucker | PDF/CSV; feeds into Schedule C preparation |

---

## Phase 8 — Bidding

Adds a competitive pricing model alongside first-come-first-served. Depends on carrier profiles (Phase 7) and ratings (Phase 4) since shippers need context to evaluate bids.

| Feature | Area | Notes |
|---------|------|-------|
| Post load as open-to-bids vs first-come-first-served | Shipper | New field on load creation |
| Trucker submits bid (rate + message) | Trucker | Only on bid-type loads |
| Shipper reviews and accepts/rejects bids | Shipper | Accepting a bid claims the load |
| Bid expiry and auto-close | Platform | Configurable window |
| Duplicate load for recurring lanes | Shipper | Copy all fields to new draft |
| Freight class field (LTL support) | Shipper | |

---

## Phase 9 — Admin & Operations

Internal tools needed to operate the platform at scale.

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

---

## Dependency Graph

```
Phase 1 (Core) ──► Phase 1.1 (UX Hardening) ──► Phase 1.2 (Security & Stability) ──► Phase 2 (Notifications)
                                                                                    ──► Phase 3 (Documents)
                                                                                                │
                                                                                                ▼
                                                                                         Phase 4 (Ratings)
                                                                                                │
                                                                                                ▼
                                                                                         Phase 5 (Payments)

Phase 1.2 ──► Phase 6 (Messaging)   [independent of 2–5]

Phase 4 ──► Phase 7 (Carrier Mgmt)
                  │
                  ▼
           Phase 8 (Bidding)

Phase 3 ──► Phase 7b (Adv. Financial Intel)
Phase 5 ──► Phase 7b

Phase 5 ──► Phase 9 (Admin)
Phase 7 ──► Phase 9
```

---

## Priority Summary

| Phase | Value Delivered | Blocker For |
|-------|----------------|-------------|
| 1 | End-to-end load lifecycle + profitability intelligence | Everything |
| 1.1 | Data integrity + regulatory compliance + UX correctness | 1.2 |
| 1.2 | Security hardening + race condition fixes + minimum test coverage | 2, 3, 6 |
| 2 | Trust and awareness | 4, 5 |
| 3 | Real freight documentation | 5, 7b |
| 4 | Reputation and trust layer (ratings + shipper public profile) | 5, 7, 8 |
| 5 | Monetization | 7b, 9 |
| 6 | Reduced off-platform communication | — |
| 7 | Carrier network and repeat business | 8 |
| 7b | Deep financial reporting and tax tooling | — |
| 8 | Competitive pricing model | — |
| 9 | Operational control and growth | — |
