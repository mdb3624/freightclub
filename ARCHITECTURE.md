# FreightClub Architecture

## System Overview

FreightClub is a SaaS load management platform connecting shippers and truckers. The system consists of a React 18 frontend (Vite + TypeScript + Tailwind CSS), a Spring Boot 3 backend (Java 21), and a MySQL 8 database. The frontend runs on port 8080 with Vite proxying `/api` requests to the backend on port 9090. Authentication is stateless and JWT-based with HTTP-only refresh token rotation. The architecture employs multi-tenancy with shared database schema and tenant_id isolation at the query level. Each request passes through Spring Security filters that extract and validate JWT tokens, populate tenant context via ThreadLocal, and enforce role-based access control (SHIPPER, TRUCKER).

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                       │
│  Port 8080 | Vite Dev Server + Tailwind CSS + TypeScript    │
│  State: Zustand (UI) + React Query (server state)           │
└────────────────────┬────────────────────────────────────────┘
                     │ /api proxy
                     ↓
┌─────────────────────────────────────────────────────────────┐
│            Spring Boot Backend (Java 21)                     │
│              Port 9090 | Spring Security                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Controllers (REST endpoints)                         │   │
│  │ - AuthController, LoadController, ProfileController │   │
│  │ - DocumentController, RatingController, etc.        │   │
│  └─────────────────┬──────────────────────────────────┘   │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Services (business logic)                            │   │
│  │ - LoadService, AuthService, ProfileService          │   │
│  │ - DocumentService, RatingService, etc.              │   │
│  └─────────────────┬──────────────────────────────────┘   │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Repositories (Spring Data JPA)                       │   │
│  │ - LoadRepository, UserRepository, ClaimRepository   │   │
│  │ - RatingRepository, DocumentRepository, etc.        │   │
│  └─────────────────┬──────────────────────────────────┘   │
│                    ↓                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Security Layer                                       │   │
│  │ - JwtAuthenticationFilter (token validation)         │   │
│  │ - JwtService (RS256 signing)                         │   │
│  │ - RefreshTokenService (rotation with SHA-256 hash)  │   │
│  │ - AuthRateLimitFilter (Bucket4j rate limiting)       │   │
│  │ - TenantContextHolder (ThreadLocal tenant_id)       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ JDBC + Hibernate ORM
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           MySQL 8 Database (Flyway Migrations)              │
│  Shared Schema with tenant_id isolation                     │
│  - tenants, users, loads, claims, load_events              │
│  - load_documents, load_ratings, refresh_tokens            │
│  - notifications                                             │
└─────────────────────────────────────────────────────────────┘
```

## Backend Layer Breakdown

### Controller Layer

Controllers handle HTTP request routing and parameter validation. All endpoints are under `/api/v1/`:

- **AuthController**: `/api/v1/auth/**` - Login, register, refresh token, logout (public + authenticated)
- **LoadController**: `/api/v1/loads/**` - CRUD for loads, publish, claim, pickup, deliver (role-based)
- **LoadBoardController**: `/api/v1/board/**` - Trucker-only board view with equipment/state filters
- **ProfileController**: `/api/v1/profile/**` - User profile management
- **DocumentController**: `/api/v1/documents/**` - BOL and POD photo uploads
- **RatingController**: `/api/v1/ratings/**` - Shipper rates trucker; trucker rates shipper
- **NotificationController**: `/api/v1/notifications/**` - Notification retrieval
- **MarketController**: `/api/v1/market/**` - Public market data (origin/destination availability)

Controllers extract user ID via `@AuthenticationPrincipal String userId` from the JWT. They delegate to services for business logic and return DTOs.

### Service Layer

Services encapsulate business logic and enforce invariants. Key services:

- **LoadService**: Creates, publishes, claims, and transitions loads through lifecycle. Enforces max legal weight (80,000 lbs), requires BOL/POD photos. Uses `SELECT FOR UPDATE` for claim operations.
- **AuthService**: Registers users, logs in, refreshes tokens, logs out. Generates random join codes.
- **RefreshTokenService**: Creates refresh tokens (32-byte secure random, SHA-256 hashed), rotates them on refresh, validates expiry.
- **DocumentService**: Manages BOL and POD photo uploads, generates BOL documents.
- **RatingService**: Records shipper→trucker and trucker→shipper ratings.
- **NotificationService**: Publishes notifications on load state transitions.
- **ProfileService**: Updates user profile fields.

Services use `TenantContextHolder.getTenantId()` to retrieve tenant context.

### Repository Layer

Repositories extend Spring Data JPA with custom queries filtered by tenant_id:

- **LoadRepository**: findByIdAndDeletedAtIsNull, findByTenantIdAndShipperId, findByIdAndDeletedAtIsNullForUpdate (claim locking)
- **UserRepository**: findByEmailAndDeletedAtIsNull, findById, existsByEmail
- **ClaimRepository**: Records claim history (ACTIVE, RELEASED, CANCELLED)
- **RefreshTokenRepository**: findByTokenHashForUpdate, deleteAllByUserId
- **RatingRepository, DocumentRepository, LoadEventRepository**: Filtered by tenant_id

All queries include `tenant_id` filter for isolation.

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

---

**Last Updated**: 2026-04-02 | Phase 1 (Core Load Lifecycle) and Phase 1.1 (UX Hardening) complete. Phase 1.2 (Security & Stability) complete. Phase 2 in progress.
