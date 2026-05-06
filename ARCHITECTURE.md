# FreightClub Architecture

## System Overview

FreightClub is a multi-tenant load board platform for the trucking industry. Shippers post freight loads to be transported, and owner/operator truckers browse and claim those loads for pickup and delivery. The system enforces strict tenant isolation at the database and application layers, uses JWT-based stateless authentication with HTTP-only refresh cookies, and implements pessimistic locking for critical operations like load claiming.

The platform is built on a three-tier architecture: a React 18 + TypeScript frontend with Vite, a Spring Boot 3.x REST API backend (Java 21), and PostgreSQL with Row-Level Security (RLS) for multi-tenant data isolation. Flyway manages all schema migrations with strict naming conventions and soft-delete patterns.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND (Vite, React 18, TypeScript)                              │
│  ├─ Pages: LoginPage, RegisterPage, ShipperDashboard, TruckerDash...│
│  ├─ Features (feature-sliced): auth/, loads/, documents/, hos/     │
│  │  └─ components/, hooks/, types.ts, api.ts per feature           │
│  ├─ State: Zustand (auth token) + React Query (server state)       │
│  └─ Port: 8080                                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP Proxy
                             ▼ /api → http://localhost:9090
┌─────────────────────────────────────────────────────────────────────┐
│  BACKEND (Spring Boot 3.x, Java 21)                                 │
│  ├─ Controllers: AuthController, LoadController, LoadBoardController│
│  │              DocumentController, RatingController, etc.          │
│  ├─ Services: LoadService, AuthService, DocumentService, etc.      │
│  │  └─ Enforce tenant_id isolation via TenantContextHolder         │
│  ├─ Repositories: LoadRepository, UserRepository, ClaimRepository  │
│  │  └─ Spring Data JPA + Specifications (LoadSpecifications)       │
│  ├─ Security: JwtService, JwtAuthenticationFilter,                 │
│  │             AuthRateLimitFilter (Bucket4j), RefreshTokenService │
│  └─ Port: 9090                                                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │ JDBC
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL, Neon)                                         │
│  ├─ Tables: tenants, users, loads, claims, load_events,            │
│  │           load_documents, ratings, refresh_tokens, notifications│
│  ├─ RLS: All core tables have Row-Level Security enabled           │
│  ├─ Soft Deletes: deleted_at TIMESTAMPTZ column per table          │
│  └─ Migrations: Flyway (V{YYYYMMDD}_{seq}__{description}.sql)      │
└─────────────────────────────────────────────────────────────────────┘
```

## Backend Layer Breakdown

### Controllers (`controller/`)
Request handlers for REST API endpoints. Use constructor injection and delegate to services. Validate input with `@Valid` and `@RequestBody`.

**Key Controllers:**
- **AuthController**: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- **LoadController**: CRUD for loads (POST create/draft, PUT update, GET list/detail, DELETE)
- **LoadBoardController**: `GET /board` — filtered load list for truckers (published only, trucker-specific matching)
- **DocumentController**: File upload/download for BOL and POD photos, issue attachments
- **RatingController**: Create and retrieve ratings (shipper→trucker and trucker→shipper)
- **ProfileController**: Get/update user profiles
- **NotificationController**: List notifications, mark as read
- **MarketController**: Public fuel price data (EIA integration)

### Service Layer (`service/`)
Business logic layer. All services enforce `tenant_id` isolation via `TenantContextHolder.getTenantId()`. Use constructor injection for dependencies. Marked with `@Service` and `@Transactional`.

**Key Services:**
- **LoadService** (7 constructor params): Core load lifecycle
  - Create, update, publish, claim, pick up, deliver, cancel loads
  - Enforce overweight acknowledgment (>80,000 lbs)
  - Write LoadEvent rows on every status transition
  - Use `@Lock(LockModeType.PESSIMISTIC_WRITE)` on claims to prevent double-claiming
  
- **AuthService**: User registration, login, token refresh, logout
  - BCrypt password hashing (strength 12)
  - Generates access token + refresh token
  - Refresh token rotated on every `/auth/refresh` call
  
- **DocumentService**: Upload/download BOL, POD, and issue documents
  - File storage (local or S3)
  - Link documents to loads
  
- **RatingService**: Create and retrieve ratings between users
  - Post-delivery ratings (can only rate after DELIVERED status)
  
- **NotificationService**: In-app notifications for load events, claims, etc.
  
- **RefreshTokenService**: Manage HTTP-only refresh tokens
  - Rotate on each use; invalidate old tokens
  
- **EiaFuelPriceService**: Cache EIA diesel price data (server-side, not exposed directly)

### Repositories (`repository/`)
Spring Data JPA repositories with custom queries and Specifications for filtering.

**Key Repositories:**
- **LoadRepository**: Extends `JpaRepository` + `JpaSpecificationExecutor`
  - Custom queries for tenant-filtered loads
  - Soft-delete filtering: `AND deleted_at IS NULL`
  
- **LoadSpecifications**: Criteria builder for dynamic load filtering (status, equipment, origin, destination, date ranges)
  
- **ClaimRepository**: Find active claims by load and trucker
  - `@Lock(LockModeType.PESSIMISTIC_WRITE)` on claim operations
  
- **UserRepository**: Find users by email, id
  - Tenant-scoped queries
  
- **RefreshTokenRepository**: Lookup and invalidate tokens
  
- **LoadEventRepository**: Append-only event log for load status changes
  
- **NotificationRepository**: Query notifications by user and tenant

### Security (`security/`)
JWT lifecycle, authentication filters, tenant context management.

**Key Classes:**
- **JwtService**: 
  - Generate access tokens (HS256, 15-min expiry)
  - Validate token claims (issuer, audience, signature)
  - Extract user ID, email, role, tenantId from token
  
- **JwtAuthenticationFilter** (extends `OncePerRequestFilter`):
  - Extracts `Authorization: Bearer <token>` header
  - Validates token and sets Spring Security context
  - Stores tenantId in `TenantContextHolder` for downstream queries
  
- **AuthRateLimitFilter** (Bucket4j):
  - Limits auth endpoints (login, register, refresh) to prevent brute-force
  
- **RefreshTokenService**:
  - Issue HTTP-only refresh cookies (secure, SameSite=Strict)
  - Rotate tokens on each refresh call
  
- **TenantContextHolder** (ThreadLocal):
  - Stores current tenant ID for request lifecycle
  - Services query: `TenantContextHolder.getTenantId()`
  
- **UserDetailsServiceImpl**:
  - Load user by email for Spring Security authentication

### Config (`config/`)
- **SecurityConfig**: Defines filter chain, CORS, session policy (STATELESS), authorization rules
- **JwtConfig**: Parses JWT properties from `application.yml`

### Filters (`filter/`)
- **CorrelationIdFilter**: Generates unique trace ID for all requests (logged via MDC)

### Domain Entities

Core JPA entities with tenant isolation:

- **User**: id, tenant_id, email, password_hash, role (SHIPPER/TRUCKER), first_name, last_name, trucker-specific fields, soft delete
- **Load**: id, tenant_id, shipper_id, trucker_id (denormalized cache), status, origin/destination, times, commodity, weight, equipment, pay_rate, dimensions, special_requirements, cancel_reason, soft delete
- **Claim**: id, tenant_id, load_id, trucker_id, status (ACTIVE/RELEASED/CANCELLED), claimed_at, released_at. Authoritative claim record.
- **LoadEvent**: Audit trail (CREATED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED with actor_id)
- **RefreshToken**: user_id, token_hash (SHA-256), expires_at, revoked, revoked_at
- **LoadDocument**: load_id, document_type (BOL/POD), file_url, uploaded_by, uploaded_at
- **LoadRating**: load_id, claim_id, rater_id, ratee_id, rating (1-5), comment
- **Notification**: tenant_id, recipient_id, event_type, load_id, read_at

## Frontend Folder Structure

```
frontend/src/
├── pages/
│   ├── LoginPage.tsx, RegisterPage.tsx
│   ├── ProfilePage.tsx, RatingsPage.tsx
│   ├── ShipperDashboard.tsx, TruckerDashboard.tsx
│   ├── LoadCreatePage.tsx, LoadEditPage.tsx, LoadDetailPage.tsx
│   ├── LoadsListPage.tsx, TruckerLoadDetailPage.tsx
│   └── TruckerLandingPage.tsx (market board, 58KB)
│
├── features/ (feature-sliced)
│   ├── auth/hooks/useLogin.ts, useRegister.ts, useLogout.ts
│   ├── loads/hooks/useCreateLoad.ts, useClaimLoad.ts, useMarkPickedUp.ts, 
│   │                useMarkDelivered.ts, useCancelLoad.ts, useLoadBoard.ts, etc.
│   ├── documents/hooks/useDocuments.ts
│   ├── ratings/hooks/useRatings.ts
│   ├── profile/hooks/, notifications/hooks/, market/hooks/, hos/hooks/
│   └── components/ (per feature)
│
├── store/
│   ├── authStore.ts (Zustand: user, accessToken, setUser, logout)
│   ├── toastStore.ts (Zustand: toast notifications)
│   └── authStore.test.ts
│
├── components/, hooks/, utils/
└── App.tsx (Router, Protected routes)
```

**Pattern**: Feature-sliced design. Each feature (auth, loads, documents) is self-contained with hooks, components, types. Pages compose features. Server state via React Query; UI state via Zustand.

## Auth Flow

1. **Registration**: User submits email, password, role, companyName (create tenant) or joinCode (join existing). Backend hashes password (BCrypt), creates Tenant/User, generates JWT + refresh token.

2. **JWT Creation** (15 minutes expiry):
   - Subject: user.id
   - Claims: email, role, tenantId, issuer, audience
   - Signed with HMAC-SHA256
   - Stored in Zustand store (volatile memory)

3. **Refresh Token Creation** (7 days expiry):
   - Generate: 32-byte SecureRandom, Base64-urlencoded
   - Hash: SHA-256, stored in DB
   - Sent as HTTP-only cookie (secure, same-site)

4. **Request Handling**:
   - Frontend sends `Authorization: Bearer {accessToken}` header
   - `JwtAuthenticationFilter` validates token, extracts userId/role/tenantId
   - Sets `TenantContextHolder` for request duration
   - Creates authentication with ROLE_SHIPPER or ROLE_TRUCKER
   - Clears context in finally block

5. **Token Refresh**:
   - Frontend calls POST `/api/v1/auth/refresh` with refresh cookie
   - `RefreshTokenService` validates hash, marks old as revoked, generates new
   - Returns new access token + rotated refresh cookie

6. **Logout**: Revokes all refresh tokens for user.

**Security**: Access token in memory (XSS safe via same-origin); refresh token in HTTP-only cookie (CSRF-protected); rotation prevents reuse attacks.

## Multi-Tenancy Strategy

**Model**: Shared database schema with tenant_id isolation at query level.

1. **Tenant Context Per Request**:
   - JWT includes tenantId claim
   - `JwtAuthenticationFilter` calls `TenantContextHolder.setTenantId(tenantId)`
   - `TenantContextHolder` uses ThreadLocal to store tenant_id per request
   - Services retrieve via `getTenantId()` and pass to repositories
   - Filter clears ThreadLocal in finally block

2. **Query Isolation**:
   - Every table has tenant_id FK
   - All repository queries include `WHERE tenant_id = ?`
   - Example: `LoadRepository.findByIdAndDeletedAtIsNull(id)` filters by user's tenant

3. **User Registration**:
   - New user with companyName → backend creates Tenant with random 6-char join code
   - New user with joinCode → backend joins existing Tenant
   - All data scoped to tenant_id

4. **Role-Based Access**:
   - SHIPPER: Create, publish, update, view own loads
   - TRUCKER: Claim, pickup, deliver, view board
   - Controllers enforce via SecurityConfig: `.requestMatchers(...).hasRole("SHIPPER")`

## Database Design

### Core Tables

**tenants**: id, name, plan, join_code, created_at, updated_at, deleted_at (soft delete)

**users**: id, tenant_id (FK), email (UNIQUE globally), password_hash, role, first_name, last_name, trucker fields (mc_number, dot_number, equipment_type), cost_profile, created_at, updated_at, deleted_at
- Indexes: (tenant_id), (tenant_id, role), (email)

**loads**: id, tenant_id (FK), shipper_id (FK), trucker_id (FK, nullable cache), status, origin, destination, origin_zip, destination_zip, origin_state, destination_state, distance_miles, pickup_from/to, delivery_from/to, commodity, weight_lbs, overweight_acknowledged, equipment_type, dimensions, pay_rate, pay_rate_type, payment_terms, special_requirements, cancel_reason, created_at, updated_at, deleted_at
- Indexes: (tenant_id, shipper_id), (tenant_id, status), (tenant_id, created_at), (tenant_id, equipment_type, destination_state)

**claims**: id, tenant_id (FK), load_id (FK), trucker_id (FK), status (ACTIVE/RELEASED/CANCELLED), claimed_at, released_at, created_at, updated_at
- Indexes: (tenant_id, load_id), (tenant_id, trucker_id), (load_id, status)
- Purpose: Authoritative claim history; loads.trucker_id is convenience cache

**load_events**: id, tenant_id, load_id, actor_id, event_type (CREATED/CLAIMED/PICKED_UP/DELIVERED/CANCELLED), created_at

**load_documents**: id, tenant_id, load_id, uploaded_by, document_type (BOL/POD), file_url, uploaded_at

**load_ratings**: id, tenant_id, load_id, claim_id, rater_id, ratee_id, rating (1-5), comment, created_at

**refresh_tokens**: id, user_id, token_hash (SHA-256), expires_at, revoked, revoked_at

**notifications**: id, tenant_id, recipient_id, load_id, event_type, read_at, created_at

### Design Patterns

- **Soft Delete**: All entities have optional deleted_at. Queries use `WHERE deleted_at IS NULL`.
- **Migration Naming**: Flyway convention `V{YYYYMMDD}_{number}__{description}.sql`
- **Denormalization**: loads.trucker_id caches active claim from claims table for performance

## Key Architectural Decisions

### ADR-1: SELECT FOR UPDATE for Claim Locking

**Problem**: Race condition if two truckers claim same load simultaneously.

**Solution**: `findByIdAndDeletedAtIsNullForUpdate` uses SQL `SELECT ... FOR UPDATE` to acquire pessimistic row lock until transaction commits.

### ADR-2: In-Memory Access Token Storage

**Problem**: Refresh tokens survive page refresh; access tokens can be ephemeral.

**Solution**: Access token in Zustand store (volatile). Refresh token in HTTP-only cookie (survives refresh). On app load, call `/api/v1/auth/refresh` if no access token but cookie exists.

### ADR-3: Refresh Token Rotation with Hash Storage

**Problem**: Long-lived refresh tokens; if leaked, attacker forges new access tokens indefinitely.

**Solution**: Store token hash (SHA-256), not raw token. Rotate on every refresh: mark old hash revoked, generate new, return new to frontend. Reuse of old token rejected.

### ADR-4: ThreadLocal Tenant Context

**Problem**: Tenant ID needed throughout request processing.

**Solution**: `TenantContextHolder` stores tenant_id in ThreadLocal. `JwtAuthenticationFilter` populates; services retrieve via static method. Cleared in filter finally block. Trade-off: thread-safe for servlet-per-thread; requires manual clearing.

### ADR-5: Shared Database Schema with Tenant_id FK

**Problem**: Multi-tenancy options: isolated schema, row-level security, or shared schema with app-level isolation.

**Solution**: Shared schema. Every table has tenant_id FK. All queries filter by tenant_id. Simpler operations; easier migrations; but queries must always include tenant_id filter (human error risk).

### ADR-6: Bucket4j Rate Limiting on Auth Endpoints

**Problem**: Brute-force attacks on login/refresh.

**Solution**: `AuthRateLimitFilter` applies Bucket4j rate limiting: 5 requests per 10 seconds per IP. Returns 429 Too Many Requests if exceeded.

### ADR-7: Vite Proxy for API Requests

**Problem**: Frontend on 8080, backend on 9090; CORS adds complexity.

**Solution**: Vite proxies `/api/**` to backend. Frontend calls relative paths `/api/v1/...` which Vite rewrites to `http://localhost:9090/api/v1/...`. Eliminates CORS in dev; production uses reverse proxy (Nginx).

### ADR-8: EIA Proxy with Server-Side Cache

**Problem**: Real-time fuel prices from U.S. EIA API; client-side calls expose API key; repeated calls expensive.

**Solution**: Backend `EiaFuelPriceService` calls EIA API server-side, caches response (Redis/in-memory TTL), returns to frontend. API key in server environment, not exposed to client.

### ADR-9: Load Status State Machine with Event Sourcing Baseline

**Problem**: Complex load lifecycle (DRAFT → OPEN → CLAIMED → IN_TRANSIT → DELIVERED) with notifications and audit trail.

**Solution**: Services enforce state transitions via explicit checks. All transitions write to `load_events` table. Services publish notifications via `NotificationService`.

### ADR-10: Denormalized Trucker_id Cache in Loads Table

**Problem**: Claim history in claims table; queries need to find "active trucker for load" frequently.

**Solution**: Maintain `loads.trucker_id` as denormalized cache of active claim. Claims table is source of truth; trucker_id is for convenience.

## Methodology

### Domain-Driven Design (DDD)

FreightClub organizes business logic around core domains:

- **Load Domain**: Entity (Load) with bounded contexts for creation, claiming, state transitions, and event sourcing via LoadEvent.
- **Tenant Domain**: Multi-tenant isolation enforced at DB and application layers via TenantContextHolder.
- **Authentication Domain**: JWT lifecycle, refresh token rotation, stateless security model.
- **Financial Domain**: Cost profiles, RPM calculations, profitability heuristics, rate limiting for economic fairness.

Domain services (LoadService, AuthService, etc.) encapsulate business rules. Repositories handle persistence via Spring Data JPA. Domain events (LoadEvent) provide audit trail and enable downstream notifications.

### Test-Driven Development (TDD)

All new story implementations must follow this workflow:

1. **Write failing test first** — Establish acceptance criteria before any implementation.
2. **Implement minimal code** — Make the test pass without over-engineering.
3. **Refactor for clarity** — Clean up while tests remain green.

**Coverage Target**: Minimum 80% branch coverage (NFR-502) enforced via JaCoCo on `mvn verify`.

**Test Layers**:
- **Unit Tests**: Service methods in isolation (mock repositories).
- **Integration Tests**: Controller + service + repository with embedded H2 or real PostgreSQL (preferred for migrations).
- **UI Tests**: Vitest for frontend hooks and components; React Query mocking for API boundaries.

**Verification**: `mvn -f backend/pom.xml verify` (includes JaCoCo report). Frontend: `npm test` in `frontend/`.

---

**Last Updated**: 2026-04-23 | Phase 1–2 complete. Phase 3 in progress. DDD and TDD methodology enforced.
