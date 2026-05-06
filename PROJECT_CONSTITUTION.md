# Resilience Logistics - Project Constitution

## 1. Core Architectural Principles
* **Multi-Tenancy:** Row Level Security (RLS) is the primary isolation mechanism at the database level.
* **Security First:** The application must NEVER connect as a superuser. Runtime operations use the `freightclub_runtime` role.
* **Externalized Config:** Secrets and environment-specific values must live in `.env` files, never hard-coded in `application.yml`.
* **No-Lombok Policy:** Standard Java POJOs or Records only. Manual getters/setters/constructors to ensure IDE compatibility and clarity.

## 2. Database Standards (PostgreSQL)
* **Schema:** All project tables live in the `freightclub` schema.
* **Tenant Context:** The session variable `app.current_tenant` (UUID) must be set for every database session to pass the RLS gate.
* **Flyway Naming:** `V<YYYYMMDD_HHMM>__<Description>.sql` (Must use double underscores).
* **RLS Policy Template:** `USING (tenant_id = current_setting('app.current_tenant')::uuid)`

## 3. Configuration Standards
* **Property Files:** `application.yml` uses `${VARIABLE_NAME:default_value}` placeholders.
* **Secrets Management:** Managed via `.env` (This file is ignored by Git).
* **Verified Test UUIDs:**
  * **Alpha Logistics:** `8e1b500b-0356-4b5f-b016-89dbde2dc428`
  * **Bravo Trucking:** `c2f332cf-6e52-4ecb-a997-7de5f53a6d25`

## 4. Java / Spring Boot Stack
* **Build Tool:** Maven (`pom.xml`).
* **Environment Loader:** `spring-dotenv` or IDE-level EnvFile support.
* **Database Driver:** PostgreSQL with HikariCP.

## 5. Domain & Logic Standards (from ARCHITECTURE.md)
* **Soft Deletes:** Every core entity must have a `deleted_at` TIMESTAMPTZ column. All JPA queries must include `WHERE deleted_at IS NULL`.
* **Claim Locking (ADR-1):** Use `@Lock(LockModeType.PESSIMISTIC_WRITE)` for load claiming operations to prevent race conditions.
* **Audit Trail (ADR-9):** Every load status transition (DRAFT -> OPEN -> CLAIMED, etc.) must write a corresponding entry to the `load_events` table.
* **Denormalization (ADR-10):** The `loads` table maintains a `trucker_id` as a convenience cache, but the `claims` table remains the authoritative source of truth for history.

## 6. Security & Auth Standards (from ARCHITECTURE.md)
* **Stateless Auth:** Use JWT-based stateless authentication. Access tokens expire in 15 minutes; Refresh tokens use rotation (ADR-3).
* **Rate Limiting (ADR-6):** Apply Bucket4j rate limiting to all auth endpoints (login, register, refresh).
* **Context Clearing:** The `TenantContextHolder` (ThreadLocal) MUST be cleared in a `finally` block within the `JwtAuthenticationFilter`.
