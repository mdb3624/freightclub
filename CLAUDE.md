# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreightClub is a load board platform for the trucking industry. Shippers post loads (freight to be transported), and owner/operator truckers browse and claim those loads to pick up and deliver to the final destination.

## Personas

See the `docs/` folder for persona-specific requirements. Claude should consult these when building features for a given user type.

| Persona | Document |
|---------|---------|
| Owner/Operator (trucker) | [docs/owner_operator.md](./docs/owner_operator.md) |
| Shipper | [docs/shipper.md](./docs/shipper.md) |

## Database Migrations

All schema changes are managed with Flyway. See [docs/database-migrations.md](./docs/database-migrations.md) for:
- Naming convention (`V{YYYYMMDD}_{seq}__{description}.sql`)
- Migration writing standards (UUIDs, tenant_id, soft deletes, indexes)
- Team workflow and conflict resolution
- CI integration and useful commands

**Never modify a committed migration. Never use `ddl-auto=update` in any shared environment.**

---

## Tech Stack (confirmed)

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State | Zustand (UI) + React Query (server state) |
| Backend | Spring Boot 3.x, Java 21 |
| Auth | Spring Security + JWT (RS256, HTTP-only refresh cookie) |
| Database | MySQL 8.x |
| ORM | Spring Data JPA + Hibernate |
| Migrations | Flyway |

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Full system design and component breakdown
- Multi-tenancy strategy (shared schema, tenant_id isolation)
- Backend layered structure and conventions
- Frontend folder structure and conventions
- Database design principles and core table schema
- Architectural Decision Records (ADRs)

Keep ARCHITECTURE.md up to date as the system evolves.

## Stack Startup

- Backend: Spring Boot on **port 9090** (not 8081 or 8080)
- Frontend: Vite dev server on **port 8080**, proxying `/api` to `http://localhost:9090`
- Use `taskkill //F //PID <pid>` (double-slash) in Git Bash to kill processes — single slash is treated as a path
- A **401** response from the backend means it IS running (Spring Security is active) — only connection refused or timeout means it's down
- Build command: `/c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -q -f backend/pom.xml`
- Start command: `"$JAVA_HOME/bin/java" -jar backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &`
- Use `/start` skill to automate the full startup sequence

## Windows Environment

- Shell is **Git Bash** — `mvnw` wrapper often fails; use system Maven at `/c/tools/apache-maven-3.9.9/bin/mvn`
- `JAVA_HOME` is `/c/Program Files/Eclipse Adoptium/jdk-21.0.10.7-hotspot`
- Windows-style flags in Git Bash require double-slash: `taskkill //F //PID 1234` not `/F /PID`
- Cannot kill locked JAR processes from bash — tell user to kill `java.exe` from Task Manager
- Use HTTPS for git remotes (not SSH) unless user confirms SSH keys are configured
- PowerShell is available at `powershell.exe` if bash commands fail

## Vite Configuration

- Proxy target must match backend port: **9090** (see `frontend/vite.config.ts`)
- When adding external access (Tailscale, etc.), add hostname to `allowedHosts` in `vite.config.ts`
- **Check proxy config FIRST when login or API calls fail** — before investigating auth logic, CORS, or DB

## Debugging Approach

- **Login / API failures:** Check `frontend/vite.config.ts` proxy target port first (must be **9090**) — before investigating auth logic, CORS, or DB issues
- **Blank / black screen:** Verify the backend is running (`curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/actuator/health`) before investigating frontend issues
- **401 on any endpoint:** Means the server IS running and Spring Security is active — not a connectivity failure
- **CORS errors:** Usually caused by a proxy misconfiguration, not a backend CORS policy — fix proxy first

## Project Status

Phase 1 (Core Load Lifecycle) and Phase 1.1 (UX Hardening) are complete. Phase 1.2 (Security & Stability Hardening) is complete. Phase 2 is next.

Full source code exists across `backend/` and `frontend/`.

---

## Build, Test, and Run Commands

### Frontend (`frontend/`)

```bash
npm run dev        # start dev server on port 8080
npm run build      # tsc + vite build
npm run preview    # preview production build
npm run lint       # eslint with zero-warning policy
```

### Backend (`backend/`)

Maven wrapper (`./mvnw`) may not work on Windows. Use the system Maven directly:

```bash
# Build (skip tests)
/c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -q

# Run tests
/c/tools/apache-maven-3.9.9/bin/mvn test

# Start the server (dev profile)
"$JAVA_HOME/bin/java" -jar target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev
```

Backend runs on port 9090.

---

## Conventions

### Database Migrations
- File pattern: `V{YYYYMMDD}_{seq}__{description}.sql` under `backend/src/main/resources/db/migration/`
- Never modify a committed migration. Never use `ddl-auto=update` in shared environments.
- All tables include: `id` (UUID), `tenant_id`, `created_at`, `updated_at`, soft-delete `deleted_at` where applicable.

### Backend
- Services enforce `tenant_id` isolation on every query.
- Constructor injection only — no `@Autowired` on fields.
- `LoadService` takes 6 constructor parameters: `LoadRepository`, `DocumentService`, `RatingService`, `ClaimRepository`, `LoadEventRepository`, and one more (see source). When writing tests, all deps must be `@Mock`.
- Every load status transition writes a `LoadEvent` row (CREATED, PUBLISHED, CLAIMED, PICKED_UP, DELIVERED, CANCELLED).
- `Claim` rows track which trucker holds a load; cancelled loads release the active claim.
- Weight > 80,000 lb requires `overweightAcknowledged=true` on create and update.

### Frontend
- Feature-sliced layout: `src/features/{feature}/` with `components/`, `hooks/`, `types.ts`, `api.ts`.
- URL query params are guarded with enum-safe helper functions before use (see `TruckerDashboard.tsx`).
- Zod schemas use `new Date()` for date comparisons, not string comparison.
- `App.tsx` wraps the entire tree in an `ErrorBoundary` class component.

### Auth
- Short-lived JWT access token stored in memory (Zustand).
- HTTP-only refresh cookie rotated on every `/auth/refresh` call.
- `AuthRateLimitFilter` (Bucket4j) limits auth endpoints.
- `JwtService` validates `iss` and `aud` claims on every request.

---

## Environment Status

Last verified: 2026-03-28

| Tool | Version | Path |
|------|---------|------|
| Java | OpenJDK 21.0.10 LTS (Temurin) | `C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot` |
| Maven | 3.9.9 | `/c/tools/apache-maven-3.9.9/bin/mvn` |
| Node | v24.4.0 | System PATH |
| npm | 11.4.2 | System PATH |

- `JAVA_HOME` is set system-wide and resolves correctly in Git Bash
- Maven uses JDK 21 (confirmed via `mvn -version`)
- No `engines` constraint in `frontend/package.json` — Node 24 is compatible
- Ports 8080 and 9090 are used exclusively by the FreightClub dev stack
