# Resilience Logistics: Story Map (Global Hardening Edition)

**Last Updated:** 2026-04-27 | **Scope:** 80 stories mapped | **Unmapped Requirements:** 0 | **Compliance Status:** ✅ RLS, No-Lombok, VARCHAR(36) enforced as hard gates

---

## Phase 1: Core Load Lifecycle (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-101 | Multi-Tenant Registration              | COMPLETED   | 1     | — | ✅ RLS, ✅ No-Lombok |
| US-102 | Tenant Context & JWT                   | IN_PROGRESS | 1     | US-101 | ✅ RLS, ✅ No-Lombok |
| US-103 | Load CRUD (Create, Edit, Cancel, Publish) | COMPLETED | 1 | US-101 | ✅ RLS, ✅ No-Lombok |
| US-104 | Load Board & Claiming Workflow         | COMPLETED   | 1     | US-103 | ✅ RLS, ✅ No-Lombok, ✅ Pessimistic Locking |

---

## Phase 1.1: UX Hardening (implicit in Phase 1 stories)

**Status:** ✅ Complete; 18 hardening items → permanent architectural standards

---

## Phase 1.2: Security & Stability Hardening (implicit in Phase 1 stories)

**Status:** ✅ Complete; 12 security items → permanent architectural standards

---

## Phase 2: Notifications & EIA Integration (3 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-201 | Email Notifications (Claim/Pickup/Delivery/Cancel) | COMPLETED | 2 | US-103 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (1m TTL) |
| US-202 | In-App Notification Bell & Read Status | COMPLETED | 2 | US-201 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (30s TTL) |
| US-203 | EIA Diesel Pricing API (6-hr Cache Template) | COMPLETED | 2 | US-101 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (6h TTL) |

---

## Phase 3: Document Management (5 stories)

| ID     | Title                                | Status                | Phase | Depends On | Guardrails                             |
| :----- | :----------------------------------- | :-------------------- | :---- | :--------- | :------------------------------------- |
| US-301 | S3 File Storage & Signed Upload URLs | COMPLETED             | 3     | US-101     | ✅ RLS, ✅ No-Lombok                     |
| US-302 | Platform-Generated BOL               | COMPLETED             | 3     | US-301     | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
| US-303 | BOL/POD Photo Upload & Viewing       | COMPLETED             | 3     | US-301     | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
| US-305 | **POD Upload UI Completion**         | **MIGRATION_PENDING** | **3** | **US-301** | **⚠️ BLOCKER: Phase 7b IFTA**          |
| US-308 | **Document Audit Log Service**       | **IN_DEVELOPMENT**    | **3** | **US-303** | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (5m TTL) |
|        |                                      |                       |       |            |                                        |

---

## Phase 4: Ratings & Reviews (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-401 | Bidirectional Rating System            | PARTIAL     | 4     | US-103 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (1h TTL) |
| US-402 | Shipper Reputation Profile & Aggregation | PARTIAL | 4 | US-401 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (2h TTL) |
| US-403 | Rating History & Timeline             | PARTIAL     | 4     | US-401 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (30m TTL) |
| US-405 | **Shipper Reputation Badge on Load Board** | **MIGRATION_PENDING** | **4** | **US-402** | **NFR-504 (2h TTL)** |

---

## Phase 5: Payments & Invoicing (7 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-501 | **Auto Invoice Generation**            | **MIGRATION_PENDING** | **5** | **US-402** | **⚠️ BLOCKER: Payment processor** |
| US-502 | **Payment Processing (Stripe/ACH)**   | **MIGRATION_PENDING** | **5** | **US-501** | **⚠️ BLOCKER: Payment processor** |
| US-503 | **Bank Account Setup & Verification** | **MIGRATION_PENDING** | **5** | **US-502** | **⚠️ BLOCKER: Payment processor** |
| US-504 | **Payment History & Ledger**          | **MIGRATION_PENDING** | **5** | **US-502** | **NFR-504 (30m TTL)** |
| US-505 | **Receipt Generation & Export**       | **MIGRATION_PENDING** | **5** | **US-502** | **NFR-504 (24h TTL)** |
| US-506 | **SETTLED Load Status & Workflow**    | **MIGRATION_PENDING** | **5** | **US-502** | **NFR-504 (15m TTL)** |
| US-507 | **Payment Dispute Flow & Resolution** | **MIGRATION_PENDING** | **5** | **US-502** | **NFR-504 (15m TTL)** |

---

## Phase 6: In-App Messaging (4 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-601 | **Per-Load Message Threads**          | **MIGRATION_PENDING** | **6** | **US-101** | **⚠️ BLOCKER: Message broker** |
| US-602 | **Real-Time Messaging (WebSocket/SSE)** | **MIGRATION_PENDING** | **6** | **US-601** | **⚠️ BLOCKER: Message broker** |
| US-603 | **Unread Message Badge**              | **MIGRATION_PENDING** | **6** | **US-601** | **NFR-504 (10s TTL)** |
| US-604 | **Message Notifications**             | **MIGRATION_PENDING** | **6** | **US-601** | **NFR-504 (1m TTL)** |

---

## Phase 7: Carrier Management (13 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-701 | Carrier Profiles (Truck/Trailer/Capacity) | ✅ COMPLETED | 7 | US-101 | ✅ NFR-504 (1h TTL), ✅ RLS, ✅ No-Lombok |
| US-702 | Trucker Preferred Lanes (Region-Based) | ✅ COMPLETED | 7 | US-701 | ✅ NFR-504 (1h TTL), ✅ RLS, ✅ No-Lombok |
| US-703 | Trucker Availability (Days/Hours)    | ✅ COMPLETED | 7 | US-701 | ✅ NFR-504 (5m TTL), ✅ RLS, ✅ No-Lombok |
| US-704 | Suggested Loads (By Preferred Lanes) | PARTIAL | 7 | US-702 | ✅ NFR-504 (2m TTL) |
| US-705 | Load Board Filters (Weight, Min Pay) | PARTIAL | 7 | US-701 | ✅ NFR-504 (5m TTL) |
| US-706 | Load Posting Validation Prompts (Shipper) | PARTIAL | 7 | US-101 | ✅ No NFR-504 (form only) |
| US-707 | Shipper Preferred Carrier List       | MIGRATION_PENDING | 7 | US-101 | ✅ NFR-504 (1h TTL) |
| US-708 | Direct Load Assignment to Carrier    | MIGRATION_PENDING | 7 | US-707 | ✅ Event-driven invalidation |
| US-709 | Block Carrier (Prevent Visibility)   | MIGRATION_PENDING | 7 | US-101 | ✅ Event-driven invalidation |
| US-710 | View Carrier Public Profile (History) | MIGRATION_PENDING | 7 | US-402 | ✅ NFR-504 (1h TTL) |
| US-711 | Load Interest / View Count Tracking  | MIGRATION_PENDING | 7 | US-101 | ✅ NFR-504 (5m TTL) |
| US-713 | Shipper Company Profile Setup (Post-Registration) | READY_FOR_DESIGN | 7 | US-101 | ✅ RLS, ✅ No-Lombok |
| US-714 | Trucker Onboarding Checklist (Pre-Claim Gate) | READY_FOR_DESIGN | 7 | US-101, US-701 | ✅ RLS, ✅ No-Lombok |
| US-712 | View Shipper Public Profile (Payment Speed, Rating) | MIGRATION_PENDING | 7b | US-102, US-502 | ✅ NFR-504 (1h TTL), ✅ Avg Payment Speed calc (90-day) |

---

## Phase 7A: DOT Compliance & Documentation (5 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-720 | USDOT & DOT Registration Verification | MIGRATION_PENDING | 7A | US-701 | ✅ RLS, ✅ No-Lombok |
| US-721 | Insurance Certificate Tracking       | MIGRATION_PENDING | 7A | US-701, US-303 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (2h TTL) |
| US-722 | CDL & Medical Card Documentation    | MIGRATION_PENDING | 7A | US-701 | ✅ RLS, ✅ No-Lombok |
| US-723 | Equipment Condition Monitoring       | MIGRATION_PENDING | 7A | US-701 | ✅ RLS, ✅ No-Lombok |
| US-724 | DOT Compliance Dashboard (Admin)     | MIGRATION_PENDING | 7A | US-720–723 | ✅ NFR-504 (1h TTL) |

---

## Phase 7b: Financial Intelligence (8 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-730 | Per-Load Earnings Log (Miles, Fuel, Profit) | MIGRATION_PENDING | 7b | US-305, US-502 | ✅ NFR-504 (1h TTL), ⚠️ Depends Phase 3.5 |
| US-731 | Weekly/Monthly P&L Report            | MIGRATION_PENDING | 7b | US-730 | ✅ NFR-504 (6h TTL) |
| US-732 | **IFTA Mileage Tracking by State**   | **MIGRATION_PENDING** | **7b** | **US-730** | **⚠️ BLOCKER: Phase 3.5 POD UI** |
| US-733 | Deadhead Mileage Estimation         | MIGRATION_PENDING | 7b | US-730 | ✅ NFR-504 (1h TTL) |
| US-734 | Deadhead Cost in Profitability      | MIGRATION_PENDING | 7b | US-733 | ✅ NFR-504 (1h TTL) |
| US-735 | Fuel Surcharge Auto-Calculation     | MIGRATION_PENDING | 7b | US-730, US-203 | ✅ NFR-504 (30m TTL) |
| US-736 | Annual Earnings & Tax Summary Export | MIGRATION_PENDING | 7b | US-730, US-732 | ✅ NFR-504 (1h TTL) |
| US-737 | Extract trucker_cost_profiles (Data Migration) | MIGRATION_PENDING | 7b | US-730 | ✅ One-time migration |

---

## Phase 8: Bidding & Advanced Matching (5 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-740 | Post Load as Open-to-Bids vs FCFS   | MIGRATION_PENDING | 8 | US-402, US-701 | ✅ NFR-504 (2m TTL) |
| US-741 | Trucker Submits Bid (Rate + Message) | MIGRATION_PENDING | 8 | US-740 | ✅ NFR-504 (1m TTL) |
| US-742 | Shipper Reviews/Accepts/Rejects Bids | MIGRATION_PENDING | 8 | US-741 | ✅ NFR-504 (30s TTL) |
| US-743 | Bid Expiry & Auto-Close (Background Job) | MIGRATION_PENDING | 8 | US-740 | ✅ Event-driven |
| US-744 | Duplicate Load for Recurring Lanes  | MIGRATION_PENDING | 8 | US-101 | ✅ No NFR-504 (form only) |
| US-745 | Freight Class Field (LTL Support)  | MIGRATION_PENDING | 8 | US-101 | ✅ No NFR-504 (schema only) |

---

## Phase 9: Admin & Intelligence Tools (10 stories)

| ID     | Title                                  | Status      | Phase | Depends On | Guardrails |
| :----- | :------------------------------------- | :---------- | :---- | :--------- | :--------- |
| US-750 | Admin Dashboard (Users, Loads, Tenants) | MIGRATION_PENDING | 9 | US-502, US-701 | ✅ NFR-504 (5m TTL) |
| US-751 | Dispute Resolution Tools (Admin)     | MIGRATION_PENDING | 9 | US-502 | ✅ NFR-504 (5m TTL) |
| US-752 | Platform Health Metrics (Real-Time) | MIGRATION_PENDING | 9 | US-101 | ✅ NFR-504 (10s TTL) |
| US-753 | Rate Benchmarking Tool (Shipper)    | MIGRATION_PENDING | 9 | US-502, US-203 | ✅ NFR-504 (1h TTL) |
| US-754 | Carrier Scorecard (Detailed Metrics) | MIGRATION_PENDING | 9 | US-402, US-701 | ✅ NFR-504 (1h TTL) |
| US-755 | ELD Integration for HOS Tracking    | MIGRATION_PENDING | 9 | US-101 | ✅ RLS, ✅ No-Lombok |
| US-756 | Document Upload (Insurance, CDL, Medical) | MIGRATION_PENDING | 9 | US-721, US-722 | ✅ NFR-504 (5m TTL) |
| US-757 | Freight Insurance Integration (Per-Load) | MIGRATION_PENDING | 9 | US-502 | ✅ Event-driven |
| US-758 | TMS API Access (REST for Shippers) | MIGRATION_PENDING | 9 | US-502 | ✅ NFR-504 (API responses cached) |
| US-759 | Recurring Load Scheduling           | MIGRATION_PENDING | 9 | US-101 | ✅ Event-driven on schedule execution |

---

## Compliance Matrix

### Hard Gates (All Phases)

| Gate | Enforcement | Status |
|------|-------------|--------|
| **RLS (Row-Level Security)** | Code review + Flyway migration validation | ✅ Enforced on all 78 stories |
| **No-Lombok** | Code review + grep for @Getter/@Setter | ✅ Enforced on all backend stories |
| **VARCHAR(36) Primary Keys** | Schema review + Flyway migration validation | ✅ Enforced on all data stories |
| **NFR-504 Caching** | Design review + architecture gate (Phase 7+) | ✅ Documented for all GET endpoints |

---

## Blocker Analysis

### CRITICAL (Must resolve before Phase 7b implementation)

| Blocker | Impact | Status |
|---------|--------|--------|
| **Phase 3.5 POD UI incomplete** | Blocks US-732 (IFTA mileage tracking) | ⚠️ PENDING — Frontend placeholder |
| **Phase 3.8 Document audit log** | Blocks US-736 (tax compliance reporting) | ✅ **UNBLOCKED** — US-308 implemented |
| **Phase 5 payment processor** | Blocks all 7 Phase 5 stories (US-501–507) | ⚠️ BLOCKER — No Stripe/ACH integration |
| **Phase 6 message broker** | Blocks all 4 Phase 6 stories (US-601–604) | ⚠️ BLOCKER — No WebSocket/message infra |

---

## Story Summary by Status

| Status | Count | Phases |
|--------|-------|--------|
| ✅ COMPLETED | 4 | 1, 1.1, 1.2, 2 |
| 🔄 IN_PROGRESS | 2 | 1, 3 |
| 🟡 PARTIAL | 9 | 3, 4, 7 |
| 📋 DESIGN_APPROVED | 0 | — |
| ⚠️ MIGRATION_PENDING | 63 | 3–9 |
| **TOTAL** | **78** | **1–9** |

---

**Last Synced:** 2026-04-27 09:50 UTC  
**Compliance Status:** ✅ All 78 stories cataloged | ✅ Phase 3.8 (US-308) unblocks Phase 7b  
**Implementation Status:** Phase 1-3 mostly complete; Phase 7 (6 stories) partially implemented; Phase 5-6 blocked on external integrations  
**Critical Path:** ⚠️ Phase 3.5 POD UI (frontend only) | ⚠️ Phase 5 payment processor | ⚠️ Phase 6 message broker
