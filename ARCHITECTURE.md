# Architecture

This document describes the architecture for FreightClub. Keep it up to date as the system evolves.

---

## Overview

FreightClub is a multi-tenant SaaS load board platform connecting two types of users:
- **Shippers** — post loads (freight needing transport)
- **Truckers (Owner/Operators)** — browse, claim, and deliver loads

The platform follows a **shared database, single schema** multi-tenancy model with `tenant_id` row-level isolation enforced at the application layer via Spring Security.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite | Industry standard for SaaS UIs; type safety, fast dev server |
| Styling | Tailwind CSS | Utility-first, consistent design system without custom CSS bloat |
| State Management | Zustand + React Query | Zustand for UI state; React Query for server state, caching, and background refresh |
| Backend | Spring Boot 3.x (Java 21) | Battle-tested, strong ecosystem, excellent security primitives |
| API Style | REST (JSON) | Simple, widely understood; GraphQL considered for v2 if query complexity grows |
| Auth | Spring Security + JWT | Stateless, scalable; short-lived access tokens + HTTP-only refresh token cookies |
| Database | MySQL 8.x | Reliable relational store; strong Spring Data JPA support |
| ORM | Spring Data JPA + Hibernate | Standard persistence layer for Spring Boot |
| Migrations | Flyway | Version-controlled, repeatable database migrations |
| Hosting | TBD | Cloud-native deployment (AWS / GCP / Railway) |

---

## System Design

### High-Level Components

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Vite + TypeScript + Tailwind)     │
└────────────────┬────────────────────┘
                 │ HTTPS / REST API
┌────────────────▼────────────────────┐
│         Spring Boot API             │
│  Controller → Service → Repository  │
│  Spring Security (JWT)              │
└────────────────┬────────────────────┘
                 │ JPA / JDBC
┌────────────────▼────────────────────┐
│           MySQL 8.x                 │
│  Shared schema, tenant_id isolation │
└─────────────────────────────────────┘
```

### User Roles

| Role | Description |
|------|-------------|
| `SHIPPER` | Posts and manages loads |
| `TRUCKER` | Browses and claims loads |
| `ADMIN` | Platform management and oversight |

---

## Multi-Tenancy Strategy

**Pattern:** Shared database, shared schema with `tenant_id` column on all tenant-scoped tables.

**Why:** Best balance of cost, simplicity, and scalability at early stage. Schema-per-tenant adds complexity without benefit until significantly larger scale.

**How tenant context flows:**

1. User authenticates → JWT issued containing `tenantId` and `role` claims
2. Every request passes through a `TenantContextHolder` (ThreadLocal) populated by a JWT filter
3. All repository queries are scoped by `tenant_id` automatically via a base entity or JPA filter
4. No query is ever executed without tenant context — enforced via Spring AOP or Hibernate filters

**Tables requiring `tenant_id`:** `users`, `loads`, `claims`, `documents`, `payments`, `ratings`

---

## Backend Architecture (Spring Boot)

### Layered Structure

```
com.freightclub
├── config/          # Spring Security, CORS, beans
├── controller/      # REST endpoints (@RestController)
├── service/         # Business logic (@Service)
├── repository/      # Data access (@Repository, JPA)
├── domain/          # JPA entities
├── dto/             # Request/response objects (never expose entities directly)
├── security/        # JWT filter, UserDetailsService, TenantContextHolder
├── exception/       # Global exception handler (@ControllerAdvice)
└── util/            # Shared helpers
```

### Key Backend Conventions

- **DTOs only over the wire** — never expose JPA entities directly in API responses
- **Service layer owns transactions** — `@Transactional` on service methods, not controllers
- **Global exception handling** — `@ControllerAdvice` returns consistent error envelopes
- **Validation** — use `@Valid` + Bean Validation (`@NotNull`, `@Size`, etc.) on request DTOs
- **Pagination** — all list endpoints use `Pageable` and return `Page<T>`
- **Soft deletes** — use `deleted_at` timestamp instead of hard deletes for audit trails

### Authentication Flow

```
POST /api/auth/login
  → validate credentials
  → issue short-lived JWT (15 min) + refresh token (7 days, HTTP-only cookie)

POST /api/auth/refresh
  → validate refresh token cookie
  → issue new access JWT

POST /api/auth/logout
  → invalidate refresh token (store in revocation table or use Redis)
```

- Passwords hashed with **BCrypt** (strength 12)
- JWT signed with **RS256** (asymmetric) or **HS256** with a strong secret
- Refresh tokens stored in DB and revocable

### REST API Conventions

- Base path: `/api/v1/`
- Resource naming: plural nouns (`/loads`, `/users`, `/claims`)
- HTTP methods: `GET` read, `POST` create, `PUT` full update, `PATCH` partial update, `DELETE` remove
- Error response shape:
  ```json
  {
    "status": 400,
    "error": "Bad Request",
    "message": "Weight is required",
    "path": "/api/v1/loads",
    "timestamp": "2026-03-11T10:00:00Z"
  }
  ```

---

## Frontend Architecture (React + TypeScript)

### Project Structure

```
src/
├── assets/          # Static images, icons
├── components/      # Reusable UI components (Button, Modal, Table, etc.)
├── features/        # Feature modules (loads, auth, profile, payments)
│   └── loads/
│       ├── components/   # Feature-specific components
│       ├── hooks/        # useLoads, useClaimLoad, etc.
│       ├── api.ts        # API calls for this feature
│       └── types.ts      # TypeScript types for this feature
├── hooks/           # Shared custom hooks
├── lib/             # Axios instance, React Query client config
├── pages/           # Route-level page components
├── store/           # Zustand stores (UI state only)
├── types/           # Shared global types
└── utils/           # Shared helpers
```

### Key Frontend Conventions

- **Feature-based folder structure** — co-locate components, hooks, and types by domain
- **React Query for all server state** — no manual fetch/loading/error state in components
- **Zustand for UI state only** — modals open/closed, sidebar state, etc.
- **No raw `fetch`** — all API calls go through a typed Axios instance with interceptors for JWT injection and 401 handling
- **TypeScript strict mode** — `strict: true` in `tsconfig.json`; no `any` without justification
- **Component size limit** — if a component exceeds ~150 lines, split it
- **Accessibility** — semantic HTML, ARIA labels on interactive elements, keyboard navigation

### UX Conventions

These conventions apply platform-wide and were established after a human factors review of Phase 1.

**State fields as validated dropdowns:** Origin and destination state must always be stored and transmitted as a validated 2-letter code selected from a `<select>` element — never a free-text input. Free text breaks trucker load board filters (e.g. "Illinois" vs "IL" causes filter mismatch).

**URL-based filter state:** Load board filters (origin state, destination state, equipment type, pickup date) are stored as URL query parameters so that: (1) browser back/forward preserves filter context, (2) filtered views are bookmarkable, (3) users can share specific load board views.

**Confirmation before destructive actions:** Any action that modifies a live load in a way that affects another user (cancel, reassign) must show a modal confirmation dialog before executing. Destructive actions must never be a single click away.

**Feedback for every state-changing action:** All mutations must produce visible feedback — a toast on success, an inline error on failure. Silent success or silent failure are not acceptable.

**Shared app shell:** Navigation, page wrapper, and chrome are defined in a shared layout component, not duplicated per page. Role-specific nav variants (SHIPPER vs TRUCKER) are rendered by the shared layout based on auth context.

**Skeleton loading states:** Data-dependent views show skeleton placeholders while loading, not raw text ("Loading...") or blank space. This applies to dashboards, load detail, and profile pages.

### Auth Flow (Frontend)

1. On login, store access token in **memory** (not localStorage) to prevent XSS
2. Refresh token stored in HTTP-only cookie (handled by browser automatically)
3. Axios interceptor calls `/auth/refresh` silently when a 401 is received
4. On logout, clear in-memory token and call `/auth/logout`

### Role-Based UI

- Route guards implemented via a `<ProtectedRoute role="SHIPPER" />` wrapper component
- Navigation and UI elements conditionally rendered based on `user.role` from auth context
- Never rely on frontend role checks for security — backend enforces all permissions

---

## Database Design Principles

- Every tenant-scoped table has a `tenant_id` column (indexed)
- Use `UUID` (`CHAR(36)`) for primary keys — not `AUTO_INCREMENT INT`; safer for multi-tenant, no sequential guessing
- Use `created_at` and `updated_at` timestamps on all tables with `DEFAULT CURRENT_TIMESTAMP` and `ON UPDATE CURRENT_TIMESTAMP`
- Use `deleted_at` for soft deletes — never hard-delete production rows
- All foreign keys enforced at DB level (`CONSTRAINT fk_... FOREIGN KEY ... REFERENCES ...`)
- State/province codes stored as `CHAR(2)` — never `VARCHAR` with free text. Load board filters depend on exact code matching (`IL` ≠ `Illinois`)
- `CHECK` constraints on all enum-backed columns (`status`, `equipment_type`, `pay_rate_type`, `payment_terms`) — Java enums enforce validity at the app layer but do not protect against direct SQL or migration bugs
- All migrations managed via **Flyway** — see [docs/database-migrations.md](./docs/database-migrations.md) for the full team guide

### Index Strategy

Every `WHERE` or `ORDER BY` column used by the application must have an index. Key patterns:

| Query Pattern | Required Index |
|--------------|----------------|
| Shipper dashboard — loads by tenant + shipper | `(tenant_id, shipper_id)` ✅ |
| Shipper dashboard — loads by status | `(tenant_id, status)` ✅ |
| Trucker load board — filter by equipment type + status | `(tenant_id, equipment_type, status)` |
| Trucker load board — filter by origin state | `(tenant_id, origin_state)` |
| Trucker load board — filter by pickup date | `(tenant_id, pickup_from, status)` |
| Trucker active load lookup | `(trucker_id, status)` |

### Core Tables

| Table | Key Columns | Notes |
|-------|------------|-------|
| `tenants` | `id`, `name`, `join_code`, `plan`, `created_at` | Top-level SaaS account |
| `users` | `id`, `tenant_id`, `email`, `password_hash`, `role`, `created_at` | SHIPPER and TRUCKER; email unique per tenant |
| `loads` | `id`, `tenant_id`, `shipper_id`, `trucker_id`, `status`, `origin_*`, `destination_*`, `weight_lbs`, `pay_rate`, `pickup_from/to`, `delivery_from/to`, `created_at` | `trucker_id` is the active claimant cache |
| `claims` | `id`, `tenant_id`, `load_id`, `trucker_id`, `status`, `claimed_at`, `released_at` | Authoritative claim audit trail; needed for ratings, cancellation, bidding |
| `load_events` | `id`, `tenant_id`, `load_id`, `actor_id`, `event_type`, `note`, `created_at` | Immutable event log; source of truth for Phase 2 notifications and status timeline |
| `trucker_cost_profiles` | `id`, `user_id`, `monthly_fixed_costs`, `fuel_cost_per_gallon`, `mpg`, `maintenance_cost_per_mile`, `monthly_miles_target`, `target_margin_per_mile`, `created_at` | Extracted from `users`; enables cost history for Phase 7b |
| `refresh_tokens` | `id`, `user_id`, `token_hash`, `expires_at`, `revoked`, `revoked_at`, `created_at` | SHA-256 hashed; never store raw token |
| `documents` | `id`, `tenant_id`, `load_id`, `type` (BOL/POD), `storage_key`, `uploaded_at` | Phase 3 |
| `payments` | `id`, `tenant_id`, `load_id`, `amount`, `status`, `terms`, `paid_at` | Phase 5 |
| `ratings` | `id`, `tenant_id`, `claim_id`, `load_id`, `rater_id`, `ratee_id`, `score`, `comment` | Phase 4; linked to `claims`, not just `loads` |

---

## Key Design Decisions

### ADR-001: Shared Schema Multi-Tenancy
**Date:** 2026-03-11
**Decision:** Use a shared database, shared schema with `tenant_id` row isolation.
**Reason:** Lowest operational complexity at early stage. Avoids per-tenant DB provisioning overhead. Can migrate to schema-per-tenant later if an enterprise tier demands stronger isolation.
**Consequences:** Requires disciplined `tenant_id` filtering at every query. Risk of data leak if a query misses the filter — mitigated by Hibernate filters and AOP enforcement.

### ADR-002: JWT with HTTP-only Refresh Tokens
**Date:** 2026-03-11
**Decision:** Short-lived JWT access tokens (15 min) stored in memory; refresh tokens (7 days) in HTTP-only cookies.
**Reason:** Balances security and UX. Prevents XSS token theft (no localStorage). Refresh cookie is inaccessible to JavaScript.
**Consequences:** Silent refresh logic required on frontend. Requires CSRF protection on the refresh endpoint.

### ADR-003: React + Spring Boot over Full-Stack Framework
**Date:** 2026-03-11
**Decision:** Separate React SPA frontend and Spring Boot REST API backend.
**Reason:** Clear separation of concerns; allows independent scaling and deployment; team flexibility (frontend/backend can be worked on independently).
**Consequences:** CORS configuration required. Two separate deployments to manage.

### ADR-004: MySQL over PostgreSQL
**Date:** 2026-03-11
**Decision:** Use MySQL 8.x as the primary database.
**Reason:** Familiar to the team, excellent Spring Data JPA support, wide hosting availability.
**Consequences:** Row-level security is not natively supported in MySQL (unlike PostgreSQL). Tenant isolation must be enforced entirely at the application layer.

### ADR-005: `claims` table as authoritative claim record
**Date:** 2026-03-20
**Decision:** Maintain a `claims` table as the authoritative record of who claimed which load and when. `loads.trucker_id` remains as a denormalized convenience cache of the active claimant.
**Reason:** Storing only `trucker_id` on `loads` loses the claim event. When a claimed load is cancelled and re-claimed, the first claimant leaves no trace. Phase 2 cancellation notifications, Phase 4 ratings (rater/ratee must be linked to a specific claim), and Phase 8 bidding (multiple claimants per load) all require a `claims` table.
**Consequences:** All claim/release operations must write to `claims` in addition to updating `loads.trucker_id`. The `claims.status` field (`ACTIVE`, `RELEASED`, `CANCELLED`) tracks the lifecycle of each claim independently.

### ADR-006: State codes as `CHAR(2)` everywhere
**Date:** 2026-03-20
**Decision:** All US state/province fields (`origin_state`, `destination_state`, `billing_state`, `default_pickup_state`) are stored as `CHAR(2)` validated codes. The frontend enforces this via `<select>` dropdowns, never free-text inputs.
**Reason:** The trucker load board filters by state code. Storing `"Illinois"` when the filter expects `"IL"` silently returns zero matches — the load becomes invisible to truckers filtering by state. This is a data integrity issue, not a UX preference.
**Consequences:** Any existing rows with long-form state names must be backfilled before the column type constraint is applied. All future forms that capture state must use a dropdown, not a text input.

### ADR-007: Email uniqueness scoped to tenant
**Date:** 2026-03-20
**Decision:** The unique constraint on `users.email` will be changed from a global unique key to a per-tenant unique key: `UNIQUE KEY uq_users_tenant_email (tenant_id, email)`.
**Reason:** Global email uniqueness prevents the same person from having a SHIPPER account and a TRUCKER account, or from joining multiple tenants. These are legitimate scenarios as the platform grows.
**Consequences:** The application layer must validate that a user is not already registered with the same email *and* role in the same tenant to prevent duplicate accounts within a tenant. Breaking migration required; must be applied before real user data accumulates.

### ADR-008: Idempotent claim via SELECT FOR UPDATE
**Date:** 2026-03-24
**Decision:** `LoadService.claimLoad()` must acquire a row-level lock (`SELECT FOR UPDATE` via JPA `LockModeType.PESSIMISTIC_WRITE`) on the `loads` row before checking status and writing `trucker_id`. A unique partial index on `(load_id)` filtered to `status = 'CLAIMED'` is added as a secondary safety net at the database layer.
**Reason:** Under concurrent load, two truckers can both read `status = OPEN` before either write completes. Both writes succeed; both truckers believe they own the load. This is a data integrity failure in the core transaction of the platform.
**Consequences:** Slightly higher latency on claim (locked row read). Acceptable given claim frequency and the correctness requirement.

### ADR-009: JWT must include issuer and audience claims
**Date:** 2026-03-24
**Decision:** All issued JWTs must include `iss` (issuer, set to `freightclub`) and `aud` (audience, set to `freightclub-api`) claims. The JWT filter must validate both claims on every request.
**Reason:** Without these claims, a token issued by FreightClub is technically valid against any other service that uses the same key material. As the platform grows to include additional services (notifications, document storage), unbound tokens become a lateral-movement risk.
**Consequences:** Existing tokens in circulation at deployment time will fail `aud` validation and force a re-login. Acceptable for a pre-production system.

### ADR-010: Rate limiting on authentication endpoints
**Date:** 2026-03-24
**Decision:** Apply a token-bucket rate limiter to `POST /api/v1/auth/login` and `POST /api/v1/auth/register` — maximum 10 requests per IP per minute with a 429 response on breach.
**Reason:** These endpoints accept credentials in the request body and have no cost beyond a BCrypt hash comparison. Without rate limiting they are open to brute force and credential stuffing with no friction.
**Consequences:** Legitimate users on shared IPs (corporate NAT, mobile carrier NAT) could hit limits. Tune threshold after observing real traffic patterns. Consider CAPTCHA for repeated failures in a future iteration.

---

## Known Technical Debt

Issues identified in the post-Phase 1.1 architecture review that are scheduled for resolution in Phase 1.2. Documented here so they are visible to any engineer working in the affected areas.

### Backend

| Issue | Location | Severity | Phase |
|-------|----------|----------|-------|
| Race condition on `claimLoad` — check-then-act without lock | `LoadService.claimLoad` | **Critical** | 1.2 |
| Race condition on refresh token rotation | `RefreshTokenService.rotate` | **Critical** | 1.2 |
| `claims` table never written by service layer | `LoadService.claimLoad` | **High** | 1.2 |
| `load_events` table never written by service layer | `LoadService` (all transitions) | **High** | 1.2 |
| N+1 user queries in `buildResponse` — two `userRepository.findById` calls per load | `LoadService.buildResponse` | **High** | 1.2 |
| No load state machine — valid transitions are ad-hoc inline checks | `LoadService` | Medium | 2 |
| `DocumentService.readBytes` throws generic `RuntimeException` not caught by global handler | `DocumentService` | Medium | 1.2 |
| Settlement flow (`DELIVERED → SETTLED`) has no service method or endpoint | `LoadService` | Medium | 5 |
| `trucker_cost_profiles` columns pollute every `users` row | `User.java` | Low | 7b |

### Frontend

| Issue | Location | Severity | Phase |
|-------|----------|----------|-------|
| No `<ErrorBoundary>` — any render error shows blank screen | `App.tsx` | **High** | 1.2 |
| Date comparison uses string ordering, not `Date` objects | `LoadForm.tsx` | **High** | 1.2 |
| URL filter params cast to enum without validation | `TruckerDashboard.tsx` | **High** | 1.2 |
| HOS widget state lost on page refresh — React-only state, no persistence | `HosWidget.tsx` | Medium | 2 |
| Overweight load — backend has no matching validation | `LoadService` | Medium | 1.2 |

### Security

| Issue | Location | Severity | Phase |
|-------|----------|----------|-------|
| JWT secret committed in `application-dev.yml` | `application-dev.yml` | **Critical** | 1.2 |
| Developer Tailscale domain hardcoded | `vite.config.ts` | **High** | 1.2 |
| CORS `allowedHeaders: ["*"]` — replace with explicit whitelist | `SecurityConfig` | **High** | 1.2 |
| No rate limiting on `/api/v1/auth/**` | `SecurityConfig` | **Critical** | 1.2 |
| JWT missing `iss`/`aud` claims | `JwtService` | **High** | 1.2 |

### Testing

| Gap | Severity | Phase |
|-----|----------|-------|
| `AuthService`, `RefreshTokenService` — zero coverage | **Critical** | 1.2 |
| `JwtAuthenticationFilter`, `SecurityConfig` — zero coverage | **Critical** | 1.2 |
| All controllers — no API contract tests | **High** | 1.2 |
| No `@SpringBootTest` integration tests | **High** | 1.2 |
| No frontend tests (`.test.tsx`) | **High** | 1.2 |
| JaCoCo only enforced for `LoadService` | Medium | 1.2 |
