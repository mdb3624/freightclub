# 📊 Resilience Logistics Platform — Project Dashboard

**Owner:** Michael D. Barnes | **Instance:** Enon (PostgreSQL 16) | **Branch:** `architectural-changes`
**Last Updated:** 2026-04-22 | **Story Count:** 37 | **Architect:** Hexagonal / DDD / Spring Modulith

---

## 1. Platform Health Score

> Measures the percentage of formal Requirements (REQ-XXX) that have a corresponding **✅ Built** story with confirmed code coverage.

```
█████████████████████████░░░░░░░░░░░░░░░  58%
```

| Metric | Value |
| :--- | :--- |
| **Requirements Fully Built** | 7 / 12 REQs |
| **Requirements In-Progress** | 1 / 12 REQs |
| **Requirements Not Started** | 4 / 12 REQs |
| **Total Stories** | 37 |
| **Stories Built** | 13 |
| **Stories In-Progress** | 1 |
| **Stories Planned** | 23 |

| REQ | Title | Status |
| :--- | :--- | :--- |
| REQ-101 | USDOT Tenant Binding | ❌ Not Started |
| REQ-102 | Stateless RS256 JWT Auth | ✅ Built |
| REQ-103 | Platform-Wide RLS | ✅ Built |
| REQ-201 | Load FSM (DRAFT → DELIVERED) | ✅ Built |
| REQ-202 | Transactional Outbox | ✅ Built |
| REQ-203 | Mobile Document Uploads (BOL/POD) | ✅ Built |
| REQ-301 | PostGIS Spatial Matching (50mi) | ❌ Not Started |
| REQ-302 | Equipment Compatibility Matrix | 🛠️ In-Progress |
| REQ-303 | Profitability Heuristics (ELROD) | ✅ Built |
| REQ-401 | Automated Detention Pay | ❌ Not Started |
| REQ-402 | Immutable Audit Ledger | ✅ Built |
| REQ-403 | Fraud / Double Brokering Prevention | ❌ Not Started |

---

## 2. The Story Board

### ✅ Built — 13 Stories

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| SYS-102 | Tenant Invitation & RBAC | High | ✅ Built |
| AUTH-102 | Stateless RS256 JWT Authentication & Token Lifecycle | High | ✅ Built |
| INF-103 | Platform-Wide Row Level Security (RLS) Infrastructure | High | ✅ Built |
| INF-202 | Transactional Outbox Relay & Event Dispatch Processor | High | ✅ Built |
| LOAD-201 | Load Drafting & Multi-Tenant Isolation (Enon RLS) | High | ✅ Built |
| LOAD-202 | Load Publishing & Transactional Outbox Integration | High | ✅ Built |
| OPS-401 | Load Claiming & Atomic State Transition | High | ✅ Built |
| OPS-403 | In-Transit Progression — Trip Start, Arrival & POD-Gated Delivery | High | ✅ Built |
| DOC-501 | PWA Document Capture & Offline-First BOL Upload | Medium | ✅ Built |
| DOC-502 | Proof of Delivery (POD) Capture & Delivery Gate | High | ✅ Built |
| MAT-302 | Strategic Profitability Scoring (ELROD Calculation) | Medium | ✅ Built |
| AUD-601 | Immutable Transaction Ledger & Audit Trail | High | ✅ Built |
| REP-401 | Mutual Post-Delivery Rating System | Medium | ✅ Built |

---

### 🛠️ In-Progress — 1 Story

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| MAT-303 | Equipment Compatibility Matrix & Hierarchy Rules | Medium | 🛠️ In-Progress |

> **Note:** `EquipmentType` enum exists; the `EquipmentCompatibilityMatrix` domain object and `CarrierSearchPort` equipment filter logic are not yet implemented.

---

### 📝 Planned — 23 Stories

#### Identity, Security & Infrastructure

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| SYS-101 | Tenant USDOT Binding & Authority Verification at Onboarding | High | 📝 Planned |
| EC-101 | Real-Time USDOT Re-Verification at Load Claim | High | 📝 Planned |
| EC-102 | Tenant Cross-Talk Prevention — RLS 404 Masking | High | 📝 Planned |
| NFR-503 | Database Scalability — Partial Indexes & Query Optimization | Medium | 📝 Planned |

#### Match Engine

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| MAT-301 | PostGIS Spatial Carrier Discovery (50-Mile Radius) | High | 📝 Planned |

#### Operations & Tracking

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| OPS-402 | Geo-fenced Dwell Time Tracking (PostGIS) | Medium | 📝 Planned |
| EC-301 | GPS Heartbeat Monitoring & Carrier Offline Alert | Medium | 📝 Planned |
| EC-302 | Appointment-Window Detention Timer Logic | Medium | 📝 Planned |
| EC-303 | Multi-Stop Rerouting & Rate Re-Confirmation | Medium | 📝 Planned |

#### Financials, Documents & Compliance

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| FIN-401 | Automated Detention Pay Calculation & Billing | Medium | 📝 Planned |
| FIN-501 | Automated Invoice Generation on Delivery Confirmation | High | 📝 Planned |
| FIN-502 | QuickPay Factoring Logic & Margin Verification | Medium | 📝 Planned |
| FIN-503 | Payment Processing, Settlement & SETTLED State Transition | High | 📝 Planned |
| FIN-504 | Payment Dispute Flow & Settlement Hold | Medium | 📝 Planned |
| EC-401 | BOL Document Validation & Human-in-the-Loop Pending Verification | Medium | 📝 Planned |
| EC-402 | Financial Event Idempotency via Outbox Request ID | High | 📝 Planned |
| EC-403 | Negative Margin Override Gate & Admin Approval Flow | Medium | 📝 Planned |

#### Carrier Management & Platform Features

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| MSG-601 | Per-Load Real-Time Messaging Thread | Medium | 📝 Planned |
| CAR-701 | Carrier Fleet Profile, Preferred Lanes & Shipper Preferred Network | Medium | 📝 Planned |
| BID-801 | Competitive Load Bidding & Auction Flow | Low | 📝 Planned |

#### Fraud, Admin & Operations

| Story ID | Title | Priority | Status |
| :--- | :--- | :--- | :--- |
| ADM-701 | System-wide Fraud Monitoring & USDOT Risk Flagging | High | 📝 Planned |
| ADM-702 | Double Brokering Detection via USDOT Pattern Analysis | High | 📝 Planned |
| ADM-901 | Admin Operations Dashboard, Dispute Resolution & Platform Health Metrics | Medium | 📝 Planned |

---

## 3. Quality Gate Status

| Gate | Target | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Complexity Gate (NFR-501)** | Cyclomatic Complexity ≤ 10 | 🟡 Active / Partial | PMD + Checkstyle configured in `pom.xml`; `maven-pmd-plugin` runs on `verify`; `skipPmdError=true` allows Java 21 syntax to pass through |
| **Branch Coverage (NFR-502)** | ≥ 80% via JaCoCo | ✅ Active | JaCoCo `check` goal enforces `LINE coveredRatio ≥ 0.80`; exemptions: `JpaLoadAdapter`, `EmailService`, `BolGeneratorService`, `EiaFuelPriceService`, `NativeImageHints` |
| **Enon RLS (REQ-103)** | Enabled on all tables | 🟡 Partial | `V20260421_001__enable_rls_foundation.sql` and `V20260421_002__load_aggregates_rls.sql` applied; remaining tables (`carrier_profiles`, `bids`, `messages`, `invoices`) pending migration |
| **RS256 JWT (REQ-102)** | NimbusJwtDecoder + RSA | ✅ Active | `SecurityConfig` uses `oauth2ResourceServer` + `NimbusJwtDecoder.withPublicKey()`; ephemeral key pair generated at startup if `JWT_RSA_PRIVATE_KEY` env var absent |
| **Soft Delete Pattern** | `deleted_at IS NULL` on all queries | 🟡 Partial | Enforced on legacy `Load` entity; not yet enforced in `modules/load` aggregate query layer |
| **TDD (NFR-502)** | Red-Green-Refactor | 🟡 Partial | 194 tests passing; `SecurityIntegrationTest` (3 tests) added this session; `LoadApplicationServiceTest` added; domain aggregate tests present |

---

## 4. Active Blockers

> High-priority Planned stories that cannot begin until a dependency is resolved.

---

### 🔴 BLOCKER 1 — USDOT Infrastructure Missing
**Affects:** `SYS-101`, `EC-101`, `ADM-701`, `ADM-702`

No `UsdotVerificationPort` (output port), no FMCSA SAFER API adapter, and no `carrier_risk_profiles` table migration exist in the codebase. All four fraud/compliance stories share this infrastructure.

**Resolution path:** Implement `SYS-101` first — FMCSA adapter, `carrier_risk_profiles` schema with RLS, and `UsdotVerificationResult` Value Object. This unblocks `EC-101`, `ADM-701`, and `ADM-702` in sequence.

---

### 🔴 BLOCKER 2 — PostGIS Not Enabled on Enon
**Affects:** `MAT-301`, `OPS-402`, `EC-301`

No Flyway migration enables the PostGIS extension (`CREATE EXTENSION IF NOT EXISTS postgis`), and no `GEOGRAPHY` column exists on any table. All spatial and geo-fence stories depend on this foundation.

**Resolution path:** Add `V20260422_001__enable_postgis.sql` migration, then add `origin_location` to `loads` and `home_location` to `carrier_profiles`. This unblocks `MAT-301` and then `OPS-402`.

---

### 🟠 BLOCKER 3 — No Financial Transaction Infrastructure
**Affects:** `FIN-401`, `FIN-501`, `FIN-502`, `FIN-503`, `FIN-504`, `EC-402`

No `invoices`, `payments`, `detention_charges`, or `factoring_requests` tables exist. `EC-402` (idempotency key on financial events) must be designed before any financial story is implemented to avoid retrofitting.

**Resolution path:** Implement `EC-402` (idempotency infrastructure) first, then `FIN-501` (invoice schema + generation), then `FIN-503` (payment processing), then `FIN-401` (detention). `FIN-502` and `FIN-504` can follow in parallel.

---

### 🟠 BLOCKER 4 — `ARRIVED` State Not in Domain
**Affects:** `OPS-403` (partially — ARRIVED transition is documented in REQ-201 but not yet implemented)

`LoadStatus` enum in `modules/load/domain/LoadStatus.java` contains `DRAFT, PUBLISHED, CLAIMED, IN_TRANSIT, DELIVERED` — the `ARRIVED` intermediate state defined in REQ-201 is absent. A Flyway migration and domain state are needed before OPS-403 can be marked fully complete.

**Resolution path:** Add `ARRIVED` to `LoadStatus` enum and `LoadAggregate.arrive()` method; update Flyway migration for the status column CHECK constraint.

---

### 🟡 BLOCKER 5 — Dual Controller Debt Limits RLS Consistency
**Affects:** All stories depending on `/api/v1/loads/**` (legacy) vs `/api/v2/loads/**` (module)

The legacy `LoadService` and `LoadController` (`/api/v1/loads`) do not route through the new `JpaLoadAdapter` with `set_config(app.current_tenant)`. RLS is therefore not enforced for load-board browse, load history, and contact-info features until the legacy service is migrated.

**Resolution path:** Migrate legacy load-board and history features into `modules/load` adapter layer; retire `com.freightclub.service.LoadService` and `com.freightclub.controller.LoadController`. Tracked in `learnings.md` as **High DEBT:PARTIAL**.

---

*Dashboard generated by [LIBRARIAN] · 2026-04-22 · Resilience Logistics Platform*
