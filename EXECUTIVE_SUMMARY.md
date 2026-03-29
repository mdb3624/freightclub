# FreightClub — Executive Summary

**Last updated: 2026-03-29**

---

## What It Is

FreightClub is a digital load board platform for the trucking industry. Shippers post freight loads; owner/operator truckers browse, claim, and execute those loads. The platform manages the full freight lifecycle — from load posting through delivery — with built-in financial intelligence tools that help independent truckers evaluate load profitability before committing their one active load slot.

---

## Problem Being Solved

The existing load board market (DAT, Truckstop.com) is built for brokers and fleets. Independent owner/operators — the fastest-growing segment of the trucking industry — lack tools that speak to their economics: cost-per-mile visibility, minimum acceptable rate, hours-of-service compliance, and shipper reputation before claiming a load.

FreightClub is purpose-built for the owner/operator. Every feature is designed around the question: *should I take this load?*

---

## Current Build Status

**Phases 1, 1.1, and 1.2 are complete.** The platform supports a working, hardened end-to-end freight transaction. Phase 2 (Notifications & Status Timeline) is next.

### What's Live

| Capability | Shipper | Trucker |
|------------|---------|---------|
| Register / profile | ✅ | ✅ |
| Post, edit, cancel loads | ✅ | — |
| Browse load board with filters | — | ✅ |
| Claim a load (race-condition safe) | — | ✅ |
| Mark pickup / delivery | — | ✅ |
| Dashboard with load status | ✅ | ✅ |
| Cost profile + CPM calculator | — | ✅ |
| RPM profitability badge (per load) | — | ✅ |
| Per-load profitability breakdown | — | ✅ |
| 30-day earnings summary | — | ✅ |
| Hours of Service widget (11-hr, 14-hr, 70-hr/8-day) | — | ✅ |
| Multi-tenant / company join code | ✅ | ✅ |
| Auth rate limiting + JWT hardening | ✅ | ✅ |
| Claim + load event audit trail | ✅ | ✅ |

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
| 1.2 | Security hardening + race condition fixes + test coverage | ✅ Complete | 2, 3, 6 |
| 2 | Notifications & status timeline + EIA fuel prices | 🔜 Next | 3, 4 |
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
Phase 2 (Notifications) → Phase 3 (Documents) → Phase 4 (Ratings) → Phase 5 (Payments)
```

Phase 5 closes the financial loop: POD triggers an invoice, shipper pays through the platform, trucker receives direct deposit. Everything before Phase 5 is pre-revenue infrastructure. Phase 6 (messaging) is independent and can be built in parallel.

---

## What Phase 1.2 Delivered

Phase 1.2 hardened the platform for real users without adding user-visible features.

| Area | What Was Done |
|------|--------------|
| **Race conditions** | `SELECT FOR UPDATE` on load rows during claim; same on refresh token rotation — both double-processing bugs eliminated |
| **Auth security** | Rate limiting (10 req/min/IP on login + register via Bucket4j); JWT `iss`/`aud` claims issued and validated on every request |
| **Secrets** | JWT secret moved to environment variable; hardcoded developer infrastructure removed from `vite.config.ts` |
| **CORS** | `allowedHeaders: ["*"]` replaced with explicit whitelist |
| **Data integrity** | `LoadService` now writes to `claims` table on every claim/release and to `load_events` on every status transition |
| **Frontend stability** | React `<ErrorBoundary>` added to `App.tsx`; URL filter params now validated before enum cast; date comparisons use `new Date()` |
| **Backend validation** | Server-side overweight load check added (weight > 80,000 lbs requires explicit acknowledgment) |
| **Infrastructure** | Spring Boot Actuator (`/health`, `/info`); `application-prod.yml` with env-var placeholders; structured logging with correlation IDs |
| **Test coverage** | `AuthService`, `RefreshTokenService`, `JwtAuthenticationFilter` unit tests; claim concurrency integration test; frontend claim flow smoke tests |

---

## What Phase 2 Will Deliver

Phase 2 is the immediate next priority. It makes the platform feel live and trustworthy by closing the communication loop.

**Notifications:**
- Email on all load status changes — claimed, picked up, delivered, cancelled
- In-app notification bell with unread count (stored in DB, cleared on read)
- Cancel-with-reason workflow — required reason shown to the affected trucker
- Trucker's active load slot freed immediately on shipper cancellation

**Status Timeline:**
- Full per-load event history (status, timestamp, actor) powered by the `load_events` table built in Phase 1.2
- Visible to both shipper and trucker on the load detail page

**EIA Fuel Price Integration:**
- Live regional diesel prices (Diesel West, Diesel South) in the market ticker — sourced from the U.S. EIA Open Data API
- Week-over-week delta indicator (color-coded: rising / falling)
- Auto-populated fuel surcharge in the Load Profitability Analyzer
- API key server-side only; 6-hour cache with stale-data indicator

Once Phase 2 ships, Phase 3 (documents) and Phase 4 (ratings) follow in sequence, completing the trust and compliance layer required to support real freight moves.

---

## Technical Debt (Remaining)

All critical and high-severity issues from the Phase 1.2 review are resolved. Remaining scheduled items:

| Item | Scheduled For |
|------|--------------|
| Load state machine (replace ad-hoc inline transition checks) | Phase 2 |
| HOS 70-hr/8-day widget — backend persistence | Phase 2 |
| Settlement flow (`DELIVERED → SETTLED`) service method + endpoint | Phase 5 |
| Extract `trucker_cost_profiles` out of `users` table | Phase 7b |

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

## Documentation Index

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](./CLAUDE.md) | Developer onboarding, conventions, environment setup |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, ADRs, remaining tech debt |
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Phase roadmap with links to per-phase detail |
| [docs/phases/](./docs/phases/) | Per-phase feature detail |
| [docs/user-stories/](./docs/user-stories/README.md) | User stories by phase and persona |
| [docs/owner_operator.md](./docs/owner_operator.md) | Owner/operator persona requirements |
| [docs/shipper.md](./docs/shipper.md) | Shipper persona requirements |
| [docs/database-migrations.md](./docs/database-migrations.md) | Migration conventions and workflow |
| [docs/eia-requirements.md](./docs/eia-requirements.md) | EIA fuel price API integration spec |
