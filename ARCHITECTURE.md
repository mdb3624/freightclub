# FreightClub Architecture Document

## System Overview

FreightClub is a multi-tenant load board platform for the trucking industry. Shippers post freight loads, owner-operator truckers browse available loads and claim them for transport. The system enforces role-based access (SHIPPER/TRUCKER), manages the full load lifecycle (DRAFT → OPEN → CLAIMED → PICKED_UP → DELIVERED → COMPLETED), and supports ancillary features including documents (BOL, POD, issue photos), ratings, notifications, and dynamic cost profiling.

The architecture follows a layered structure: REST API Controllers → Spring Services (with domain events) → JPA Repositories → PostgreSQL with Flyway migrations. Multi-tenancy is enforced via `TenantContextHolder` at the service layer, combined with PostgreSQL Row-Level Security (RLS) on all core tables. Authentication uses JWT (short-lived access tokens in memory + HTTP-only refresh cookies). Frontend is React 18 + TypeScript with feature-sliced architecture, proxied through Vite.

---

## Component Diagram

```
FRONTEND (React 18 + Vite)
├─ /apps           : Multi-entry build (main app + login-app)
├─ /features       : Feature-sliced (loads, board, profile, etc)
├─ /components/ui  : Shared UI atoms (button, input, dialog)
├─ /hooks          : Custom hooks (useLoadBoard, useAuth, etc)
├─ /store          : Zustand state (auth, notifications)
└─ /pages          : Page components
                    ↓
         Vite Proxy (port 9090)
         /api → localhost:8080
                    ↓
BACKEND (Spring Boot 3.x, port 8080 dev / 9090 prod)
├─ REST Controllers
│  ├─ /api/v1/auth        (login, register, refresh, logout)
│  ├─ /api/v1/loads       (create, update, list, claim, cancel)
│  ├─ /api/v1/board       (marketplace: browse open loads)
│  ├─ /api/v1/documents   (BOL, POD, issue photo uploads)
│  ├─ /api/v1/ratings     (create/read shipper & trucker ratings)
│  ├─ /api/v1/notifications (in-app, email push)
│  ├─ /api/v1/profiles    (user profile & carrier cost setup)
│  └─ /api/v1/market      (public: diesel prices, carrier equipment)
│
├─ Service Layer
│  ├─ AuthService, LoadService, RatingService
│  ├─ DocumentService, ProfileService, NotificationService
│  ├─ EiaFuelPriceService, CarrierCostProfileService
│  ├─ EmailService, BolGeneratorService
│  └─ (Domain events: LoadClaimedEvent, LoadPickedUpEvent, etc.)
│
├─ Domain Entities
│  ├─ Load, Claim, User, Tenant, Rating, LoadEvent
│  ├─ LoadDocument, Notification, RefreshToken
│  └─ CarrierProfile
│
└─ Repositories
   ├─ LoadRepository (soft-delete, pessimistic locking)
   ├─ UserRepository, TenantRepository, ClaimRepository
   └─ LoadSpecifications (dynamic filtering)
                    ↓
         Flyway Migrations, RLS Policies
                    ↓
PostgreSQL Database (Neon)
├─ Core Tables: tenants, users, loads, claims
├─ Support: refresh_tokens, load_documents, load_events
├─ Ratings, Notifications, CarrierProfiles
└─ PostGIS enabled for geospatial queries
```

---

## Backend Layer Breakdown

### Controllers (REST API)

| Controller | Key Endpoints | Role Requirements |
|---|---|---|
| AuthController | POST /register, /login, /refresh, /logout | Public (register/login), Authenticated (refresh/logout) |
| LoadController | POST /create, /draft; PUT /{id}; GET list; DELETE /{id} | SHIPPER |
| LoadBoardController | GET /board?equipment=X&origin=&dest=; POST /{id}/claim | TRUCKER (post requires role) |
| DocumentController | POST /{id}/bol-photo, /pod-photo, /issue; GET list | TRUCKER (post), Both (get) |
| RatingController | POST /{id}/shipper, /trucker; GET /{id} | Role-specific (post), Authenticated (get) |
| NotificationController | GET list; PATCH /{id}/read | Authenticated |
| ProfileController | GET /{id}; PUT /{id}; GET /carrier/{id}/cost-profile | Authenticated |
| MarketController | GET /diesel-price; GET /carrier-equipment | Public |

### Services

| Service | Responsibility |
|---|---|
| AuthService | Login/register, JWT generation, token refresh, logout |
| LoadService | Load CRUD, lifecycle transitions, claim validation |
| RatingService | Calculate/store shipper & trucker reputation scores |
| DocumentService | BOL/POD photo uploads, legal document generation |
| ProfileService | User profile updates, carrier cost config |
| NotificationService | Event-driven in-app/email notifications |
| EiaFuelPriceService | Poll EIA API for diesel prices (cached) |
| CarrierCostProfileService | Cost per mile, RPM calculations, equipment hierarchy |
| EmailService | SMTP dispatch |
| BolGeneratorService | PDF generation for legal BOL documents |

### Domain Entities

| Entity | ID | TenantId | Soft Delete | Notes |
|---|---|---|---|---|
| Tenant | UUID (String) | N/A | Yes | Top-level tenant isolation container |
| User | UUID (String) | Yes | Yes | Shipper/Trucker, includes cost profile fields |
| Load | UUID (String) | Yes | Yes | Load lifecycle: DRAFT→OPEN→CLAIMED→PICKED_UP→DELIVERED→COMPLETED |
| Claim | UUID (String) | Yes | Yes | Trucker claim on load; pessimistic locked during claim |
| Rating | UUID (String) | Yes | Yes | Shipper-to-trucker or trucker-to-shipper reputation |
| LoadDocument | UUID (String) | Yes | Yes | BOL, POD, issue photos |
| LoadEvent | UUID (String) | Yes | Yes | Event audit log for load lifecycle |
| Notification | UUID (String) | Yes | Yes | In-app notifications linked to user |
| RefreshToken | UUID (String) | N/A | No | Session token, auto-expires |

### Repositories

- **LoadRepository**: Soft-delete filtering, pessimistic write locking for claim atomicity
- **LoadSpecifications**: Dynamic predicate-based filtering for board queries
- All queries include `AND deleted_at IS NULL`
- Board queries are cross-tenant (marketplace: all users see all open loads)

---

## Frontend Folder Structure

```
src/
├─ apps/
│  ├─ main/               (primary SPA entry point)
│  └─ login-app/          (separate login module)
├─ features/              (feature-sliced architecture)
│  ├─ loads/
│  │  ├─ components/      (LoadForm, LoadList, LoadDetail)
│  │  ├─ hooks/           (useLoadList, useLoadDetail, useClaimLoad)
│  │  ├─ pages/
│  │  └─ types.ts
│  ├─ board/
│  │  ├─ components/      (BoardFilter, LoadCard, LoadMap)
│  │  ├─ hooks/           (useBoardFilter, useBoardQuery)
│  │  └─ pages/
│  ├─ profile/
│  ├─ auth/
│  ├─ notifications/
│  ├─ ratings/
│  └─ documents/
├─ components/
│  ├─ ui/                 (Tailwind atoms: Button, Input, Dialog, Card)
│  └─ shared/             (ErrorBoundary, AppShell, layout helpers)
├─ hooks/
├─ store/                 (Zustand: auth, notifications)
├─ lib/
│  ├─ api.ts              (Axios client, interceptors)
│  └─ apiClient.ts        (API methods)
├─ pages/
├─ types/
├─ test/
│  └─ setup.ts            (Vitest configuration)
└─ App.tsx                (root component with ErrorBoundary)
```

**Key Files:**
- `vite.config.ts`: Proxy target `http://localhost:8080`, port 9090, Tailscale domain allowlist
- `src/store/authStore.ts`: Zustand store; access token in-memory only
- `src/lib/api.ts`: Axios instance with auth interceptors

---

## Auth Flow

### Token Lifecycle

1. **Register/Login (POST /api/v1/auth/register | /login)**
   - Backend generates 15-minute JWT access token + 7-day refresh token
   - Returns response with `accessToken`, `expiresIn`, `user`
   - Sets HTTP-only, Secure, SameSite=Strict cookie: `refreshToken=<jwt>`

2. **Access Token Storage**
   - Frontend stores `accessToken` in Zustand in-memory state ONLY (no localStorage)
   - Session persistence relies on HTTP-only refresh cookie

3. **API Requests**
   - Frontend axios interceptor adds: `Authorization: Bearer <accessToken>`
   - Backend JWT filter validates and populates Spring SecurityContext
   - `TenantContextHolder.getTenantId()` extracted from JWT claims

4. **Token Refresh (POST /api/v1/auth/refresh)**
   - Frontend detects expiry; sends refresh request (cookie auto-included)
   - Backend validates refresh token, generates new access + refresh token
   - Frontend updates Zustand state

5. **Logout (POST /api/v1/auth/logout)**
   - Frontend clears Zustand auth state
   - Response sets expired refresh cookie

### JWT Claims & Validation

- **Issuer**: `freightclub`
- **Audience**: `freightclub-api`
- **Claims**: `sub` (user id), `tenant_id`, `role` (SHIPPER|TRUCKER)
- **Validation**: Signature verified using `@Value("${app.jwt.secret}")` key

### Spring Security Filter Chain

1. **SimpleOptionsFilter**: Handles preflight OPTIONS globally
2. **AuthRateLimitFilter** (Bucket4j): Rate limit on /auth endpoints
3. **JwtAuthenticationFilter**: Extract JWT, validate, populate SecurityContext
4. **ExceptionHandling**: 401 on invalid/missing token

---

## Multi-Tenancy Strategy

### Tenant Isolation

1. **Tenant Creation**: Assigned during registration
2. **User → Tenant Mapping**: Every User has immutable `tenant_id`
3. **Service Layer Enforcement**: All repository queries scoped by `TenantContextHolder.getTenantId()`

### Database Row-Level Security (RLS)

- Enabled on: tenants, users, loads, claims, load_events, load_documents, ratings, notifications, carrier_profiles
- Policy: `WHERE tenant_id = current_setting('app.tenant_id')`

### Cross-Tenant Queries (Board/Marketplace)

- Load Board: Truckers see ALL open loads across all tenants
- Market Endpoints: Public diesel prices, carrier equipment (no tenant filter)

---

## Database Design

### Core Tables

```
tenants
  ├─ id (CHAR(36), PK)
  ├─ name, plan, join_code
  └─ created_at, updated_at, deleted_at

users
  ├─ id (CHAR(36), PK), tenant_id (FK)
  ├─ email (unique), password_hash, role
  ├─ address fields, carrier fields
  ├─ cost profile (monthly_fixed_costs, fuel_cost_per_gallon, mpg, etc.)
  └─ created_at, updated_at, deleted_at

loads
  ├─ id (CHAR(36), PK), tenant_id (FK), shipper_id (FK), trucker_id (FK)
  ├─ status (DRAFT, OPEN, CLAIMED, PICKED_UP, DELIVERED, COMPLETED, CANCELLED)
  ├─ origin/destination (city, state, zip, lat, lng with PostGIS)
  ├─ weight_lbs, equipment_type, pickup_date, delivery_date
  ├─ pay_amount, pay_rate_type
  └─ created_at, updated_at, deleted_at

claims
  ├─ id (CHAR(36), PK), load_id (FK, unique), trucker_id (FK)
  ├─ status (PENDING, ACCEPTED, REJECTED)
  └─ created_at, updated_at, deleted_at

refresh_tokens
  ├─ token (VARCHAR(500), PK), user_id (FK)
  └─ expires_at (TIMESTAMP WITH TIME ZONE)

load_documents, load_events, ratings, notifications, carrier_profiles
  (similar structure with tenant_id, soft-delete pattern)
```

### Flyway Migrations

**Naming**: `VYYYYMMDD_HHmm__Description.sql`

**Key Files**:
- `V20260422_00__Initialize_schema.sql`: PostGIS, schemas
- `V20260422_01__Create_tenants.sql`: Tenant + RLS
- `V20260422_02__Create_users.sql`: User + cost profile
- `V20260422_03__Create_loads.sql`: Load + status machine
- `V20260422_11__Setup_rls_and_roles.sql`: RLS policies
- `V20260426_2343__Create_Quick_Pay_Settlement_Tables.sql`: Settlement (Phase 2)

**Soft-Delete Pattern**: `deleted_at TIMESTAMP WITH TIME ZONE`; queries use `AND deleted_at IS NULL`

---

## Key Architectural Decisions

### 1. Pessimistic Locking for Load Claims
- Use `@Lock(LockModeType.PESSIMISTIC_WRITE)` to prevent race conditions
- First trucker to claim gets the load; others fail atomically

### 2. In-Memory Access Token + HTTP-Only Refresh Cookie
- Access token in Zustand (no localStorage); prevents XSS
- Refresh cookie auto-included by browser; supports automatic token refresh

### 3. Feature-Sliced Frontend Architecture
- Organize by feature (loads, board, profile) not technical layer
- Scales as features grow; clear ownership and independent deployability

### 4. Spring Domain Events for Async Notifications
- Publish LoadClaimedEvent, LoadPickedUpEvent, etc. via ApplicationEventPublisher
- Decouples services; supports future subscribers (analytics, webhooks)

### 5. TenantContextHolder for Implicit Multi-Tenancy
- Extract tenant_id from JWT → store in context → auto-scope all queries
- Prevents accidental cross-tenant queries; no boilerplate in services

### 6. Soft Deletes (Logical vs Physical Deletion)
- Set `deleted_at` instead of DELETE; preserves audit trail
- Requires discipline: every SELECT filters `AND deleted_at IS NULL`

### 7. Vite Proxy + Tailscale Domain Allowlist
- Frontend dev server proxies /api/* to backend; supports Tailscale tunnel
- Removes CORS complexity during dev; matches production nginx setup

### 8. Role-Based Access Control (RBAC) at Controller Level
- Spring Security @RequestMatchers enforces role (SHIPPER vs TRUCKER)
- Declarative rules in SecurityConfig; supports future permission expansion

### 9. Bucket4j Rate Limiting on Auth Endpoints
- Limits /auth/* requests to prevent password guessing
- Threshold: ~5 attempts per minute per IP/user

### 10. EIA API Polling for Diesel Prices
- Periodically fetch U.S. Energy Information Administration prices
- Caching reduces external API calls; provides real-time fuel context

---

## Deployment & Cloud Run Standards

### Environment Variables

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: PostgreSQL (Neon)
- `APP_JWT_SECRET`: JWT signing key
- `JWT_ISSUER`, `JWT_AUDIENCE`: JWT claim values
- `CORS_ALLOWED_ORIGINS`: Comma-separated frontend URLs
- `VITE_API_URL`: Frontend → backend proxy target
- `VITE_ALLOWED_HOST`: Tailscale domain or custom hostname

### Cloud Run Notes

- Backend service runs on port 9090
- Frontend service runs on port 5173 (Vite)
- Proxy config: `/api` → backend Cloud Run URL (injected at deploy, never hardcoded)
- Health check: `GET /actuator/health` returns 200 when ready

---

## Testing Strategy

### Backend

- **Unit Tests**: Service, repository, domain logic (JUnit 5 + Mockito)
- **Integration Tests**: Controller → Service → Repository → DB
- **Coverage Target**: 80% branch coverage (JaCoCo enforced)
- **Command**: `mvn test`

### Frontend

- **Unit Tests**: Component logic, hooks, utilities (Vitest + React Testing Library)
- **E2E Tests**: Playwright golden-path tests
- **Commands**: `npm run test`, `npm run test:e2e`

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Query, Axios |
| Backend | Spring Boot 3.x (Java 21), Spring Security, Spring Data JPA, Hibernate |
| Database | PostgreSQL (Neon), Flyway, PostGIS, Row-Level Security |
| Authentication | JWT (15min access token) + HTTP-only refresh cookie (7 days) |
| Events | Spring ApplicationEventPublisher (in-process pub/sub) |
| Rate Limiting | Bucket4j |
| Document Storage | Cloud storage (GCS/S3) via service abstraction |
| Email | SMTP |
| Deployment | Google Cloud Run (containerized), Cloud SQL |

---

**Document Version**: 1.0
**Last Updated**: 2026-05-21
**Governance**: FreightClub CLAUDE.md (Role-Based Operating Context)
