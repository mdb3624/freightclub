# FreightClub — Executive Summary

**March 2026**

---

## What It Is

FreightClub is a digital load board platform for the trucking industry. Shippers post freight loads; owner/operator truckers browse, claim, and execute those loads. The platform manages the full freight lifecycle — from load posting through delivery — with built-in financial intelligence tools that help independent truckers evaluate load profitability before committing their one active load slot.

---

## Problem Being Solved

The existing load board market (DAT, Truckstop.com) is built for brokers and fleets. Independent owner/operators — the fastest-growing segment of the trucking industry — lack tools that speak to their economics: cost-per-mile visibility, minimum acceptable rate, hours-of-service compliance, and shipper reputation before claiming a load.

FreightClub is purpose-built for the owner/operator. Every feature is designed around the question: *should I take this load?*

---

## Current Build Status

**Phase 1 (Core Load Lifecycle) and Phase 1.1 (UX Hardening) are complete.** The platform supports a working end-to-end freight transaction today.

**44 of 63 planned user stories are complete.** The remaining 19 are in Phase 2–9 features (notifications, documents, payments, ratings, messaging).

### What's Live

| Capability | Shipper | Trucker |
|------------|---------|---------|
| Register / profile | ✅ | ✅ |
| Post, edit, cancel loads | ✅ | — |
| Browse load board with filters | — | ✅ |
| Claim a load | — | ✅ |
| Mark pickup / delivery | — | ✅ |
| Dashboard with load status | ✅ | ✅ |
| Cost profile + CPM calculator | — | ✅ |
| RPM profitability badge (per load) | — | ✅ |
| Per-load profitability breakdown | — | ✅ |
| 30-day earnings summary | — | ✅ |
| Hours of Service (HOS) widget | — | ✅ |
| Multi-tenant / company join code | ✅ | ✅ |

---

## Financial Intelligence (Key Differentiator)

Truckers configure a **cost profile**: monthly fixed costs, fuel price, MPG, maintenance cost per mile, monthly mileage target, and target profit margin. The platform computes in real time:

- **Cost Per Mile (CPM)** — fixed + variable, updated live as the profile changes
- **Minimum RPM** — the lowest revenue-per-mile the trucker can accept and still cover costs + target margin
- **RPM badge on every load** — green (profitable), yellow (marginal), red (below cost) — evaluated before the trucker commits
- **Per-load breakdown** — estimated revenue, fuel cost, maintenance cost, net profit, and RPM vs minimum RPM
- **30-day earnings summary** — loads completed, total miles, total revenue, effective CPM over the trailing month

No other owner/operator-facing load board surfaces this data at the point of load selection.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State management | Zustand (UI state) + React Query (server state) |
| Backend | Spring Boot 3.x, Java 21 |
| Authentication | Spring Security + JWT RS256 (HTTP-only refresh cookie) |
| Database | MySQL 8.x + Flyway migrations |
| ORM | Spring Data JPA + Hibernate 6 |
| Multi-tenancy | Shared schema, `tenant_id` row isolation |

---

## Roadmap

The platform is designed as a 9-phase build. Each phase ships a usable, testable increment. Phases are sequenced by dependency — earlier phases unlock later ones.

| Phase | Description | Status | Unlocks |
|-------|-------------|--------|---------|
| 1 | Core load lifecycle + financial intelligence | ✅ Complete | Everything |
| 1.1 | UX hardening — data integrity, regulatory compliance | ✅ Complete | 1.2 |
| 1.2 | Security hardening + race condition fixes + minimum test coverage | **Next** | 2, 3, 6 |
| 2 | Notifications & status timeline | Planned | 3, 4 |
| 3 | Document management (BOL / POD upload) | Planned | 4, 5, 7b |
| 4 | Ratings & reviews (shipper reputation model) | Planned | 5, 7, 8 |
| 5 | Payments & invoicing | Planned | 7b, 9 |
| 6 | In-app messaging (shipper ↔ trucker) | Planned | — |
| 7 | Advanced carrier management (preferred carriers, lanes) | Planned | 8 |
| 7b | Advanced financial reporting (P&L, IFTA, tax export) | Planned | — |
| 8 | Bidding (competitive pricing alongside first-come-first-served) | Planned | — |
| 9 | Admin & operations (dispute tools, scorecards, ELD integration) | Planned | — |

### Critical Path to Monetization

```
Phase 1.2 (Security) → Phase 2 (Notifications) → Phase 3 (Documents) → Phase 4 (Ratings) → Phase 5 (Payments)
```

Phase 5 closes the financial loop: POD triggers an invoice, shipper pays through the platform, trucker receives direct deposit. Everything before Phase 5 is pre-revenue infrastructure.

Phase 6 (messaging) is independent and can be built in parallel with the critical path.

---

## Known Risks & Technical Debt

A post-Phase 1.1 security and architecture review identified the following issues, all scheduled for Phase 1.2.

### Critical (Must fix before real users)

| Risk | Detail |
|------|--------|
| **Race condition — double claim** | Two truckers can simultaneously claim the same load. The check-then-act in `LoadService.claimLoad` has no database-level lock. A `SELECT FOR UPDATE` and a unique partial index are required. |
| **Race condition — duplicate refresh tokens** | Two simultaneous refresh requests can each receive a valid token for the same session. `SELECT FOR UPDATE` required on the refresh token row. |
| **No rate limiting on auth endpoints** | Login and register accept unlimited requests. Open to brute force and credential stuffing attacks. |
| **JWT secret in source control** | The hex JWT secret in `application-dev.yml` is committed to Git history. Must be rotated and moved to a secrets manager before any production deployment. |

### High (Structural gaps)

| Risk | Detail |
|------|--------|
| **`claims` and `load_events` tables are empty** | Both Flyway migrations ran successfully, but the service layer never writes to either table. Claim history and status timeline are absent — both are required by Phases 2, 4, and 8. |
| **No error boundary in the React app** | Any unhandled render error produces a blank white screen. An `<ErrorBoundary>` at `App.tsx` is missing. |
| **Near-zero test coverage** | Only `LoadService` has unit tests. Auth, ratings, documents, and all controllers are untested. No integration or frontend tests exist. A bug in the auth flow or the claim flow could ship undetected. |
| **N+1 queries in load list responses** | `buildResponse` makes two `userRepository.findById` calls per load. A 20-load page fires 40 extra queries. Requires JOIN FETCH or batch user loading before the platform handles meaningful traffic. |

### Accepted / Scheduled

| Item | Scheduled For |
|------|--------------|
| `trucker_cost_profiles` extraction from `users` table | Phase 7b |
| HOS widget backend persistence | Phase 2 |
| Load state machine (replace ad-hoc inline checks) | Phase 2 |
| Settlement flow (`DELIVERED → SETTLED`) | Phase 5 |

---

## Key Differentiators

**1. Financial intelligence at the point of decision**
Truckers see CPM, minimum RPM, and per-load profitability before claiming — not after. The platform answers *"is this load worth taking?"* in real time.

**2. Trucker-first design**
HOS compliance widgets, cost profile tools, earnings summaries, and pickup urgency signals are built for independent owner/operators managing their own economics — not fleet dispatchers working from dispatch software.

**3. Shipper reputation model (Phase 4)**
Shippers are rated on payment speed and reliability. Before claiming a load, truckers can see a shipper's overall rating, average payment time, completed load count, and dispute history. This addresses the #1 risk for independent operators: delivering a load and not getting paid.

**4. Multi-tenant from day one**
Companies onboard entire teams under a shared tenant with a join code. A shipper company's dispatch team shares a single account view. Designed for enterprise shipper accounts without additional infrastructure complexity.

---

## What Phase 1.2 Delivers

Phase 1.2 is the immediate next gate. It does not add user-visible features — it makes the platform safe to put in front of real users.

- **Fix double-claim race condition** — `SELECT FOR UPDATE` on load rows during claim
- **Fix refresh token race** — `SELECT FOR UPDATE` on token rows during rotation
- **Rate limiting on auth** — 10 requests/minute per IP on login and register
- **JWT hardening** — add `iss`/`aud` claims; validate on every request
- **Wire up `claims` writes** — `LoadService.claimLoad` inserts into `claims` table
- **Wire up `load_events` writes** — all status transitions log an event record
- **Minimum auth/claim test coverage** — `AuthService`, `RefreshTokenService`, claim concurrency integration test
- **Secrets out of source control** — JWT secret and allowed hosts moved to environment variables
- **React ErrorBoundary** — prevent blank-screen crashes
- **Production environment config** — `application-prod.yml` with env-var placeholders

## What Phase 2 Delivers

Phase 2 follows immediately after Phase 1.2 and unblocks the remainder of the roadmap:

- **Email notifications** on all load status changes (claimed, picked up, delivered, cancelled)
- **In-app notification bell** with unread count, stored in the database
- **Full status history and timeline** per load (`load_events` table — actor, status, timestamp)
- **Cancel with reason** — required reason field stored and shown to the affected trucker
- **Trucker cancellation notification** — if a shipper cancels a claimed load, the trucker is notified immediately and their active load slot is freed

Once Phase 2 ships, Phase 3 (documents) and Phase 4 (ratings) can follow in sequence, completing the trust and compliance layer required to support real freight moves.
