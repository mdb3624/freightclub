# FreightClub Executive Summary

## What FreightClub Is

FreightClub is a multi-tenant load board platform connecting shippers (freight providers) with owner-operator truckers for on-demand freight transport. Shippers post loads (pickup/delivery locations, weight, deadline); truckers browse available loads, claim them, and handle pickup and delivery. The platform reduces friction for small to mid-sized trucking companies entering the spot market and provides shippers with transparent, real-time visibility into carrier performance.

## Current State

**Completed & Live (Phases 1–2):**
- Core load lifecycle: Create, claim, pickup, deliver, settle
- User authentication (JWT + HTTP-only cookies) with multi-tenant isolation
- Load board with real-time claim management and conflict detection
- Shipper and trucker profiles with role-based capabilities
- Ratings & reputation system (1–5 stars post-delivery)
- Email notifications for key events (claim, pickup, delivery, cancellation)
- EIA diesel pricing API integration with regional fuel price data
- Backend: 109 passing tests (Spring Boot 3.x, Java 21, PostgreSQL)
- Frontend: 17 passing tests (React 18, TypeScript, Vite, Tailwind CSS, Zustand)
- Deployed to Google Cloud Run (frontend + backend)

## What's Next

**Phase 7 (Fleet Management)** is initializing:
- Carrier cost profiles (fixed costs, per-mile maintenance, fuel calculations)
- Hours of Service (HOS) integration for trucker compliance
- Shipper company profile setup (multi-shipper operations)
- Cost-per-mile (CPM) profitability analysis

Phases 3–6 (Document Management, Reviews & Ratings refinement, Payments & Invoicing, In-App Messaging) are planned but not yet started. Phase 7A–7b (DOT Compliance, Financial Intelligence), Phase 8 (Bidding), and Phase 9 (Admin Tools) follow.

## Key Risks

1. **Security & Authorization Gaps** – Multiple endpoints lack user identity verification; rate limiting missing on public load board; CORS misconfiguration could allow unintended origins. Tenant isolation relies on application-layer checks, not PostgreSQL RLS.

2. **Incomplete Features** – Load cancellation notifications not wired to truckers; profile cost calculations exist in frontend but no backend service; HOS widget has UI but no backend endpoints; document export stub not implemented.

3. **Missing Data Constraints** – Loads table lacks enum constraint on status; duplicate active claims possible at DB level; missing unique indexes on (tenant_id, status, created_at) slow query performance; soft-delete filtering inconsistent across queries.

4. **Test Coverage** – Backend at 70% line coverage; critical audit trails and financial ledger not tested; frontend E2E coverage sparse (only golden-path tests for Phase 1 features).

5. **Multi-Tenancy Foundation** – Row-level security not enforced at database layer (PostgreSQL RLS not enabled); no tenant verification in SecurityConfig; user could access another tenant's data if IDs are guessed.

## Tech Stack Snapshot

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand (state), React Query (data), Playwright (E2E tests) |
| **Backend** | Spring Boot 3.x, Java 21, Spring Security, Spring Data JPA, Hibernate, Bucket4j (rate limiting), JJWT (JWT auth) |
| **Database** | PostgreSQL (Neon), Flyway (migrations), soft deletes (deleted_at TIMESTAMPTZ), UUID primary keys |
| **Deployment** | Google Cloud Run (containerized), Cloud SQL for PostgreSQL |
| **External APIs** | EIA Diesel Pricing (regional fuel data), SMTP (email notifications) |

---

**Status Summary:** Core platform functional and deployed. Phase 1–2 features live. Phase 7 initiating. High-priority security and data consistency gaps require hardening before Phase 2 feature expansion or public launch.
