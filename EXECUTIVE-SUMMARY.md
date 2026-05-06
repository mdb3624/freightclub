# FreightClub Executive Summary

**Last Updated:** April 22, 2026

---

## What FreightClub Is

FreightClub is a multi-tenant SaaS load board platform connecting shippers (freight owners) with independent owner/operator truckers. Shippers post freight loads with pickup/delivery locations, weight, dimensions, and pay rate; truckers browse available loads, claim them, and deliver. The platform solves fragmented trucking market opacity by providing financial transparency (real-time profitability analysis) and trust mechanisms (shipper/trucker ratings).

**Problem Solved:** Independent truckers lack visibility into load profitability; shippers lack carrier reliability data.  
**Target Users:** Shippers, owner/operator truckers, freight brokers.

---

## Current State

**Phases 1, 1.1, and 1.2 Complete (110 backend tests passing):**

**Live Today:**
- Full shipper workflow: create loads (draft or publish), edit, cancel with reason, view status timeline
- Full trucker workflow: browse load board, filter by state/equipment/date, claim, mark pickup, mark delivered
- Real-time profitability analysis: CPM calculator, per-load earnings breakdown, 30-day earnings summary
- Authentication: JWT (short-lived access token in memory, HTTP-only refresh cookie), rate-limited auth endpoints
- Multi-tenancy: Shared schema with `tenant_id` isolation, company join codes
- Diesel prices: EIA API integration with 6-hour cache; displayed on landing page and dashboards
- Notifications: Email on load status changes (claimed, picked up, delivered, cancelled); in-app notification bell with unread count
- Documents: Auto-generated BOL at publish; document storage backend (S3) ready

**Database:** PostgreSQL (migrated from MySQL April 22, 2026); Flyway migrations with soft-delete pattern, UUIDs, multi-tenant constraints.

---

## What's Next

**Phase 2 Completion (Q2 2026):** Populate `load_events` table on status transitions; build timeline UI; make BOL/POD uploads mandatory before pickup/delivery.

**Phase 4 (Ratings):** Post-delivery 5-star ratings, shipper reputation profiles, rating badges on load board. **Blocked by:** `claims` table not written (Phase 1.2 bug).

**Phase 5+:** Payments/invoicing, in-app messaging, bidding, advanced carrier management, admin console.

---

## Key Risks (Top 5)

### 1. Three Critical Phase 1.2 Bugs Unresolved
- `claims` table created but never written to (no record when trucker claims load)
- `load_events` table created but never populated (timeline empty; blocks notifications)
- Date validation uses string comparison, not Date objects (false date range failures possible)
- **Impact:** Cannot track delivered loads; Phase 4 ratings blocked; timeline display broken.

### 2. Insufficient Test Coverage
- 6 backend services untested: ProfileService, NotificationService, EmailService, BolGeneratorService, EiaFuelPriceService, DocumentService
- 6 backend controllers untested: Profile, Document, Notification, Market, LoadBoard, Rating
- Only 3 frontend test files for 100+ components/hooks (~3% coverage)
- **Impact:** Silent null pointer exceptions (NotificationService); undetected regressions.

### 3. Missing Authorization Checks
- LoadBoardController.getLoad() doesn't validate userId (any trucker can view any shipper's load)
- ProfileController lacks user/tenant verification (User A can update User B's profile)
- Rating endpoints unauthenticated and unrate-limited (attacker can enumerate all users)
- **Impact:** Cross-tenant data leakage; potential data breach.

### 4. Database Integrity Gaps
- No CHECK constraints on status enums (invalid statuses insertable)
- Missing foreign keys on ratings/notifications tables (orphaned records possible)
- Soft-delete filtering inconsistent across queries (deleted records may reappear)
- **Impact:** Data corruption; regulatory audit failures.

### 5. Incomplete Feature Wiring
- Cancellation notification to truckers not triggered in LoadService
- HOS widget frontend-only, no backend storage
- Document export endpoint stubbed but not implemented
- **Impact:** Truckers unaware of load cancellations; non-functional HOS.

---

## Tech Stack Snapshot

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State | Zustand (UI) + React Query (server state) |
| Backend | Spring Boot 3.x (Java 21) |
| Auth | Spring Security + JWT (RS256) + HTTP-only refresh cookie |
| Database | PostgreSQL + Spring Data JPA + Hibernate |
| Migrations | Flyway (versioned SQL) |
| Storage | AWS S3 (documents) |
| APIs | EIA Open Data (diesel prices) |

