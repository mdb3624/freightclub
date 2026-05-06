# 🗺️ Resilience Logistics Platform: Migration Roadmap

## 🎯 Current Status
- **Target Instance:** Enon (PostgreSQL 16)
- **Architecture:** Hexagonal / Modular Monolith
- **Security:** RS256 JWT + Row Level Security (RLS)

---

## 🏗️ Phase 1: Foundation & Governance
- [x] **Environment Configuration**: PostgreSQL 16 schema initialized on Enon.
- [x] **Governance Rules**: `.clauderules` and `reviewer-checklist.md` implemented.
- [x] **Project Scaffolding**: Maven configured for Java 21 and 80% JaCoCo coverage.
- [x] **ADR Initialization**: ADR-001 (Domain Purity) and ADR-002 (RLS) accepted.

## 📦 Phase 2: Core Domain Extraction
- [x] **Aggregate Modeling**: `Load` Aggregate Root defined with state machine.
- [x] **Business Rule Migration**: Logic extracted from legacy anemic services.
- [/] **Value Object Refactor**: Migrating primitives to Records (Weight, LoadId).
- [ ] **Domain Events**: Defining events for state transitions (e.g., `LoadPublished`).

## 🔐 Phase 3: Multi-Tenant Security (Current Focus)
- [ ] **RS256 JWT Filter**: Validation logic for bearer tokens.
- [ ] **Tenant Propagation**: Bridge between `SecurityContext` and `app.current_tenant`.
- [ ] **Security Integration Tests**: Validating tenant isolation at the API boundary.

## 🚛 Phase 4: Discovery & Discovery (The Load Board)
- [ ] **Search Port**: Defining `LoadSearchPort` for carrier queries.
- [ ] **Status-Based Filtering**: Implicit `PUBLISHED` status enforcement.
- [ ] **JPA Specification**: Dynamic filtering (Origin, Destination, Equipment Type).

## 🛠️ Phase 5: Infrastructure & Cleanup
- [ ] **Flyway Migration**: Finalizing schema versioning for PostgreSQL.
- [ ] **Outbox Implementation**: Ensuring reliable event delivery.
- [ ] **Debt Resolution**: Clearing all items in the `Technical Debt Ledger`.

---

## 🚦 Immediate Execution Queue
| ID | Task | Priority | Status |
| :--- | :--- | :--- | :--- |
| **8.1** | Implement RS256 JWT Security Filter | High | **READY** |
| **8.2** | Build Load Board Search Logic | High | **PENDING** |
| **8.3** | Perform Full Perimeter Security Audit | Medium | **PENDING** |