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

## Project Status

This is a new repository with no source code yet. As the project grows, update this file with:
- Build, lint, and test commands
- Relevant conventions and patterns used in the codebase
