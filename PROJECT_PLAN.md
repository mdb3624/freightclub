# FreightClub — Project Plan

## Approach

Features are grouped into phases by dependency order and user value. Each phase produces a shippable, testable increment. Phases are designed so the platform remains usable end-to-end after each one.

---

## Phase 1 — Core Load Lifecycle ✅ Complete

The minimum viable loop: a shipper posts a load, a trucker claims and delivers it.

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

**Key dependency:** `load_events` table enables timeline UI and is the source of truth for notifications. Build this first within the phase.

---

## Phase 3 — Document Management (BOL & POD)

Trucking depends on documentation. Without BOL and POD, the platform can't support real freight moves or payment settlement.

| Feature | Area | Notes |
|---------|------|-------|
| File storage infrastructure (S3 or equivalent) | Platform | Signed upload URLs; store key in DB |
| BOL photo upload by trucker at pickup | Trucker | Required to complete `mark as picked up` |
| POD photo upload by trucker at delivery | Trucker | Required to complete `mark as delivered` |
| View BOL and POD on load detail (shipper + trucker) | Both | |
| PDF export per load (details + documents) | Both | Generated on demand |
| Report issue during transit | Trucker | Text + optional photo; triggers shipper notification |

---

## Phase 4 — Ratings & Reviews

Ratings are the trust layer that determines which loads get claimed and which truckers get repeat work. They unlock the carrier selection features in Phase 5.

| Feature | Area | Notes |
|---------|------|-------|
| Trucker rates shipper after delivery | Trucker | 1–5 stars + optional comment |
| Shipper rates trucker after delivery | Shipper | 1–5 stars + optional comment |
| Aggregate rating displayed on trucker profile | Trucker | Visible to shippers browsing claimed loads |
| Aggregate rating displayed on shipper load card | Shipper | Visible to truckers before claiming |
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
| Trucker preferred lanes (origin/destination regions) | Trucker | Stored on profile; used for suggested loads |
| Trucker availability (days/hours) | Trucker | |
| Suggested loads for trucker based on lanes | Trucker | Filter board by saved preferences |
| Shipper preferred carrier list | Shipper | Save trusted truckers; quick-assign |
| Direct load assignment to preferred trucker | Shipper | Bypasses open board |
| Block carrier | Shipper | Blocked trucker cannot claim this shipper's loads |
| View trucker public profile (rating, equipment, history) | Shipper | |
| Load interest / view count | Trucker | Visible on load board |

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

---

## Dependency Graph

```
Phase 1 (Core) ──► Phase 2 (Notifications)
                 ──► Phase 3 (Documents)
                         │
                         ▼
                  Phase 4 (Ratings)
                         │
                         ▼
                  Phase 5 (Payments)

Phase 1 ──► Phase 6 (Messaging)   [independent of 2–5]

Phase 4 ──► Phase 7 (Carrier Mgmt)
                  │
                  ▼
           Phase 8 (Bidding)

Phase 5 ──► Phase 9 (Admin)
Phase 7 ──► Phase 9
```

---

## Priority Summary

| Phase | Value Delivered | Blocker For |
|-------|----------------|-------------|
| 1 | End-to-end load lifecycle | Everything |
| 2 | Trust and awareness | 4, 5 |
| 3 | Real freight documentation | 5 |
| 4 | Reputation and trust layer | 5, 7, 8 |
| 5 | Monetization | 9 |
| 6 | Reduced off-platform communication | — |
| 7 | Carrier network and repeat business | 8 |
| 8 | Competitive pricing model | — |
| 9 | Operational control and growth | — |
