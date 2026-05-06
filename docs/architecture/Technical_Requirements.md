# Technical Requirements Document (TRD)
**Owner:** Solution Architect
**Status:** Active Baseline

## 1. Core Technical Stack
- **Runtime:** Java 21 (LTS).
- **Framework:** Spring Boot 3.2.5.
- **Database:** Neon Serverless PostgreSQL (PostgreSQL 17).
- **Migration:** Flyway Community Edition.
- **Build Tool:** Maven.

## 2. Database & Data Integrity Standards
- **Primary/Foreign Keys:** All UUID-based identifiers MUST be stored as `VARCHAR(36)`.
- **Schema Ownership:** All application tables must reside in the `freightclub` schema.
- **Migration Protocol:** No manual DDL is permitted. All structural changes must be defined in Flyway scripts with `IF NOT EXISTS` clauses.
- **Constraints:** Every logistics table must include `tenant_id VARCHAR(36)` to support multi-tenancy.

## 3. Security & Infrastructure Logic
- **Tenant Isolation:** Enforced via PostgreSQL Row Level Security (RLS).
- **Connection Policy:** The HikariCP pool must execute `SET row_security = on` upon connection initialization.
- **Authentication:** JWT-based stateless authentication with claims mapped to the `app.current_tenant` session variable.

## 4. Feature-Specific Requirements
- **Carrier Management:** Profiles must track `preferred_equipment` and `service_area` using standardized enums.
- **Financial Intelligence:** Fuel surcharge logic must integrate with the EIA Energy API using credentials from the `.env`.
- **Soft Deletes:** Use the `deleted_at TIMESTAMP` pattern for audit-sensitive logistics data.

## 5. Environment & DevOps
- **Configuration:** Profiles are managed via `application-prod.yml` and `application-dev.yml`.
- **Variable Injection:** All sensitive secrets (DB URLs, API Keys) must be injected via environment variables, not hardcoded.
- **Local Dev:** Dev environment must be compatible with MINGW64/Bash for local execution.
