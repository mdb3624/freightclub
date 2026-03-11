# Architecture

This document describes the intended architecture for FreightClub. Update it as decisions are made and implemented.

## Overview

FreightClub is a load board platform connecting two types of users:
- **Shippers** — post loads (freight needing transport)
- **Truckers** — browse, claim, and deliver loads

---

## System Design

> Fill in as the system takes shape.

### High-Level Components

| Component | Responsibility |
|-----------|---------------|
| Web App (frontend) | UI for shippers and truckers |
| API Server (backend) | Business logic, authentication, data access |
| Database | Persistent storage for users, loads, and transactions |
| Auth Service | User identity and role management |

### User Roles

- `shipper` — can create, edit, and cancel loads
- `trucker` — can browse available loads and claim/complete them
- `admin` — platform management and oversight

---

## Key Domain Concepts

- **Load** — a shipment posted by a shipper with origin, destination, weight, dimensions, and pay rate
- **Claim** — a trucker's intent to pick up and deliver a specific load
- **Load Status** — lifecycle states: `open` → `claimed` → `in_transit` → `delivered` → `settled`

---

## Tech Stack

> Populate once decisions are made.

| Layer | Technology |
|-------|-----------|
| Frontend | TBD |
| Backend | TBD |
| Database | TBD |
| Auth | TBD |
| Hosting | TBD |

---

## Directory Structure

> Update as the project scaffolding is created.

```
freightclub/
├── CLAUDE.md
├── ARCHITECTURE.md
├── README.md
└── ...
```

---

## Key Design Decisions

> Record architectural decisions here as they are made. Format:
>
> ### ADR-001: Title
> **Date:** YYYY-MM-DD
> **Decision:** What was decided.
> **Reason:** Why.
> **Consequences:** Trade-offs.
