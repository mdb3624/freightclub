# FreightClub

A multi-tenant SaaS load board platform for the trucking industry. Shippers post freight loads; owner/operator truckers browse, claim, and deliver them.

## Project Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Core Load Lifecycle | ✅ Complete |
| 1.1 | UX Hardening | ✅ Complete |
| 1.2 | Security & Stability Hardening | ✅ Complete |
| 2 | Notifications & Status Timeline | 🔜 Next |
| 3 | Document Management (BOL & POD) | Planned |
| 4 | Ratings & Reviews | Planned |
| 5 | Payments & Invoicing | Planned |

See [PROJECT_PLAN.md](./PROJECT_PLAN.md) for the full roadmap.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State | Zustand (UI) + React Query (server state) |
| Backend | Spring Boot 3.x, Java 21 |
| Auth | Spring Security + JWT (RS256, HTTP-only refresh cookie) |
| Database | MySQL 8.x + Spring Data JPA + Flyway |

## Running Locally

**Backend** (port 9090):
```bash
/c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -q -f backend/pom.xml
"$JAVA_HOME/bin/java" -jar backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev &
```

**Frontend** (port 8080):
```bash
cd frontend && npm run dev
```

See [CLAUDE.md](./CLAUDE.md) for full environment setup, conventions, and debugging guidance.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design, multi-tenancy strategy, ADRs, and database schema.

## Personas

| Persona | Requirements |
|---------|-------------|
| Owner/Operator (trucker) | [docs/owner_operator.md](./docs/owner_operator.md) |
| Shipper | [docs/shipper.md](./docs/shipper.md) |
