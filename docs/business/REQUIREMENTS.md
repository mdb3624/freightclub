# 📋 Comprehensive Requirements: Resilience Logistics Platform

**Owner:** Michael D. Barnes  
**Instance:** Enon (PostgreSQL 16)  
**Architecture:** Hexagonal / Clean Architecture

---

## 1. Identity & Security (The Foundation)
* **REQ-101 (USDOT Binding):** Every tenant must be verified against the FMCSA/USDOT registry. No load claims are permitted for carriers with "Inactive" authority.
* **REQ-102 (Stateless Auth):** Authentication must be managed via **RS256 JWT** tokens, containing the `tenant_id` and role claims.
* **REQ-103 (Physical Isolation):** All database tables must have **Row Level Security (RLS)** enabled, using a session-level `app.current_tenant` variable.

## 2. Load Management & Execution (The Core)
* **REQ-201 (Finite State Machine):** Loads must follow a non-reversible state machine: 
  `DRAFT` → `PUBLISHED` → `CLAIMED` → `IN_TRANSIT` → `ARRIVED` → `DELIVERED`.
* **REQ-202 (Event Integrity):** All status changes must use the **Transactional Outbox Pattern** to ensure consistency between the DB and external notifications.
* **REQ-203 (Document Capture):** The system must support mobile document uploads (BOL/POD) for delivery verification, supporting offline-first PWA logic.

## 3. Intelligent Match Engine (The Brain)
* **REQ-301 (Spatial Matching):** Matching must utilize **PostGIS** to identify carriers within a 50-mile radius of the load origin.
* **REQ-302 (Equipment Hierarchy):** The engine must support a compatibility matrix (e.g., a "Reefer" matches "Dry Van" requirements, but not vice-versa).
* **REQ-303 (Profitability Heuristics):** Every match must include a net-profit calculation: `(Load Rate) - (Total Miles * Carrier Cost-Per-Mile)`.

## 4. Financials & Compliance (The Trust)
* **REQ-401 (Automated Detention):** The system must calculate detention pay automatically when a carrier's GPS dwell time at a Geo-fenced location exceeds 2 hours.
* **REQ-402 (Immutable Audit):** Every financial transaction or fee adjustment must be recorded in an append-only audit ledger protected by RLS.
* **REQ-403 (Fraud Prevention):** System must flag "Double Brokering" risks if a load is claimed by a tenant whose USDOT history shows frequent authority re-instatements.

## 5. Non-Functional Requirements (NFRs)
* **NFR-501 (Complexity):** **Strict Gate:** No method shall exceed a **Cyclomatic Complexity of 10**.
* **NFR-502 (Test Coverage):** Minimum **80% Branch Coverage** enforced via JaCoCo.
* **NFR-503 (Scalability):** The Enon instance must utilize partial indexes on `tenant_id` and `status` to maintain sub-second query performance as the dataset grows.