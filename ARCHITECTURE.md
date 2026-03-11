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
- Use `UUID` for primary keys (not auto-increment integers) — safer for multi-tenant, no sequential guessing
- Use `created_at` and `updated_at` timestamps on all tables (managed by JPA `@CreationTimestamp` / `@UpdateTimestamp`)
- Use `deleted_at` for soft deletes
- Foreign keys enforced at DB level
- All migrations managed via **Flyway** (`db/migration/V{n}__{description}.sql`)

### Core Tables (initial)

| Table | Key Columns |
|-------|------------|
| `tenants` | `id`, `name`, `plan`, `created_at` |
| `users` | `id`, `tenant_id`, `email`, `password_hash`, `role`, `created_at` |
| `loads` | `id`, `tenant_id`, `shipper_id`, `status`, `origin`, `destination`, `weight`, `pay_rate`, `pickup_window`, `delivery_window`, `created_at` |
| `claims` | `id`, `tenant_id`, `load_id`, `trucker_id`, `claimed_at` |
| `documents` | `id`, `tenant_id`, `load_id`, `type` (BOL/POD), `url`, `uploaded_at` |
| `payments` | `id`, `tenant_id`, `load_id`, `amount`, `status`, `terms`, `paid_at` |
| `ratings` | `id`, `tenant_id`, `load_id`, `rater_id`, `ratee_id`, `score`, `comment` |

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
