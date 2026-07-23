# FreightClub Requirements Registry (REQUIREMENTS.md)

**Last Updated:** 2026-05-21  
**Scope:** All phases (1–9) with implementation status based on code analysis  
**Backend Tests:** 55 test classes | **Frontend Tests:** 30 test files  
**Migrations:** 35 SQL migrations | **Backend Controllers:** 11 | **Frontend Features:** 11

---

## Summary Table: Requirements by Phase

| Phase | Title | Stories | Status | % Complete | Coverage |
|-------|-------|---------|--------|------------|----------|
| **1** | Core Load Lifecycle | 4 | ✅ DONE | 100% | Auth, Load CRUD, Load Board, Claiming |
| **1.1** | UX Hardening | (implicit) | ✅ DONE | 100% | Form validation, error handling, responsive UI |
| **1.2** | Security & Stability | (implicit) | ✅ DONE | 100% | Rate limiting, CORS, soft deletes, RLS |
| **2** | Notifications & EIA | 3 | ✅ DONE | 100% | Email notifications, in-app bell, EIA pricing |
| **3** | Document Management | 5 | 🟡 PARTIAL | 80% | S3 upload, BOL generation, POD upload; US-308 in dev |
| **4** | Ratings & Reviews | 4 | 🟡 PARTIAL | 50% | Bidirectional ratings, reputation; UI migration pending |
| **5** | Payments & Invoicing | 7 | ⚠️ PENDING | 0% | Settlement, Quick Pay, ACH—blocked on payment processor |
| **6** | In-App Messaging | 4 | ⚠️ PENDING | 0% | Per-load threads, WebSocket—blocked on message broker |
| **7** | Carrier Management | 14 | 🟡 PARTIAL | 45% | Profiles (US-701–703) done; dashboard (US-715) done; filters/suggested (US-704–706) partial |
| **7A** | DOT Compliance | 5 | ⚠️ PENDING | 0% | USDOT verification, insurance tracking, CDL docs |
| **7b** | Financial Intelligence | 8 | ⚠️ PENDING | 0% | Earnings log, P&L reports, IFTA tracking—blocked on Phase 5 |
| **8** | Bidding System | 6 | ⚠️ PENDING | 0% | Open-to-bids vs FCFS, bid submission—blocked on Phase 5 |
| **9** | Admin & Operations | 10 | ⚠️ PENDING | 0% | Admin dashboard, dispute resolution, compliance reporting |
| | **TOTAL** | **78** | | **35%** | Phase 1–3 complete; Phase 7 partial; Phase 5–6 blocked |

---

## Phase 1: Core Load Lifecycle — ✅ COMPLETE

**US-101: Multi-Tenant Registration [DONE]**
- AuthController.register() → AuthService.registerUser()
- SHIPPER and TRUCKER roles; 8-character join code tenant creation
- TenantContextHolder enforces multi-tenancy
- Code: backend/src/main/java/com/freightclub/auth/

**US-102: Tenant Context & JWT [DONE]**
- Short-lived JWT access token (RS256, 15-min)
- HTTP-only refresh cookie with rotation
- TenantContextHolder implicit tenant scoping
- Code: backend/src/main/java/com/freightclub/auth/JwtTokenProvider.java

**US-103: Load CRUD [DONE]**
- LoadController: POST (create), PATCH (edit), DELETE (cancel), PUT (publish)
- States: DRAFT → POSTED → CLAIMED → IN_TRANSIT → DELIVERED
- Gate: Cannot publish until shipper profile ≥80% complete (US-713)
- Code: backend/src/main/java/com/freightclub/load/LoadController.java

**US-104: Load Board & Claiming Workflow [DONE]**
- LoadBoardController.getBoard() lists POSTED loads
- LoadController.claimLoad() with PESSIMISTIC_WRITE lock
- Prevents race conditions; creates claim entry with timestamp
- Code: backend/src/main/java/com/freightclub/load/LoadBoardController.java

---

## Phase 1.1 & 1.2: UX & Security Hardening — ✅ COMPLETE

Form validation (Zod, Spring Validation), error boundaries, responsive design, loading states, toast notifications, auth rate limiting (Bucket4j), RLS policies on all tables, soft deletes with deleted_at IS NULL filters, CORS configuration, HTTPS enforcement, BCrypt password hashing, JWT token expiry/rotation.

---

## Phase 2: Notifications & EIA Integration — ✅ COMPLETE

**US-201: Email Notifications [DONE]**
- Triggers on load state changes (CLAIMED, IN_TRANSIT, DELIVERED, CANCELLED)
- SendGrid/AWS SES integration; 1-min TTL cache
- Code: backend/src/main/java/com/freightclub/notification/NotificationService.java

**US-202: In-App Notification Bell [DONE]**
- NotificationController.getNotifications() returns unread count
- Mark-as-read endpoint; 30-second TTL cache
- Code: backend/src/main/java/com/freightclub/notification/NotificationController.java

**US-203: EIA Diesel Pricing [DONE]**
- MarketController.dieselPrices() calls EIA API
- 6-hour TTL cache; public data (no tenant isolation)
- Code: backend/src/main/java/com/freightclub/market/MarketController.java

---

## Phase 3: Document Management — 🟡 PARTIAL (80%)

**US-301: S3 File Storage [DONE]** | **US-302: BOL [DONE]** | **US-303: POD Photos [DONE]** | **US-305: POD UI [DONE]**
- S3 signed URLs (15-min); tenant-based directories
- PDF BOL generation; photo upload at DELIVERED state
- Shipper views POD via signed URL (5-min TTL)
- Code: backend/src/main/java/com/freightclub/document/

**US-308: Document Audit Log [IN_DEVELOPMENT]**
- Immutable audit log; schema created
- Migration: V20260427_1300__DocumentAuditLog_US308.sql

---

## Phase 4: Ratings & Reviews — 🟡 PARTIAL (50%)

**US-401: Bidirectional Rating [PARTIAL]** – Schema done; trucker rating UI pending
**US-402: Shipper Reputation [PARTIAL]** – Aggregates ratings; shipper card displays; trucker UI pending
**US-403: Rating History [PENDING]** – Not implemented
**US-405: Reputation Badge [MIGRATION_PENDING]** – Not implemented

---

## Phase 5: Payments & Invoicing — ⚠️ PENDING (0%) — BLOCKED

**US-501–507 [PENDING]** – Auto invoice, Stripe/ACH integration, bank setup, payment history, receipts, disputes
- All blocked on payment processor integration
- Database schemas exist; service layer pending

---

## Phase 6: In-App Messaging — ⚠️ PENDING (0%) — BLOCKED

**US-601–604 [PENDING]** – Per-load threads, WebSocket/SSE, unread badge, notifications
- Schema: message_outbox table created
- Blocked on WebSocket/message broker infrastructure

---

## Phase 7: Carrier Management — 🟡 PARTIAL (45%)

**DONE (6 stories):**
- US-701: Carrier Profiles (equipment, capacity, multiple trucks)
- US-702: Preferred Lanes (region-based)
- US-703: Availability (days/hours)
- US-713: Shipper Company Profile (form, gate at ≥80%)
- US-715: Shipper Dashboard (active loads, payouts, notifications)

**PARTIAL (3 stories):**
- US-704: Suggested Loads (matching algorithm incomplete)
- US-705: Load Board Filters (weight, min pay; some filters missing)
- US-706: Load Posting Validation (equipment suggestions incomplete)

**MIGRATION_PENDING (5 stories):**
- US-707: Shipper Preferred Carrier List
- US-708: Direct Load Assignment
- US-709: Block Carrier
- US-710: View Carrier Public Profile
- US-711: Load Interest / View Count
- US-712: View Shipper Public Profile (schema exists; service pending)

**READY_FOR_DESIGN (1 story):**
- US-714: Trucker Onboarding Checklist

---

## Phase 7A: DOT Compliance — ⚠️ PENDING (0%)

**US-720–724 [PENDING]**
- USDOT verification (FMCSA API)
- Insurance certificate tracking
- CDL & medical card docs
- Equipment condition monitoring
- Admin compliance dashboard
- Pre-claim validation gate
- All schemas defined; none implemented

---

## Phase 7b: Financial Intelligence — ⚠️ PENDING (0%) — BLOCKED on Phase 5

**US-730–737 [PENDING]**
- Per-load earnings log
- P&L reports (weekly/monthly)
- IFTA mileage by state
- Deadhead estimation
- Fuel surcharge auto-calc
- Tax summary export
- All depend on Phase 5 settlement

---

## Phase 8: Bidding System — ⚠️ PENDING (0%) — BLOCKED on Phase 5

**US-740–745 [PENDING]**
- Shipper posts FCFS vs BID
- Trucker submits bids
- Auto-award logic
- Bid expiry / auto-close
- Duplicate for recurring
- All depend on Phase 5 settlement

---

## Phase 9: Admin & Operations — ⚠️ PENDING (0%) — BLOCKED on Phase 5

**US-750–759 [PENDING]**
- Admin dashboard
- Dispute resolution
- Health metrics
- Rate benchmarking
- Carrier scorecard
- ELD integration
- TMS API
- All depend on Phase 5 settlement

---

## Critical Path & Blockers

```
Phase 1-2 (✅) → Phase 3 (🟡 80%) → Phase 4 (🟡 50%)
         ↓
Phase 5 (⚠️ 0%) ← **BLOCKER: Payment Processor**
  ├→ Phase 7b (⚠️ 0%)
  ├→ Phase 8 (⚠️ 0%)
  └→ Phase 9 (⚠️ 0%)

Phase 7 (🟡 45%) ← Depends Phase 4
Phase 6 (⚠️ 0%) ← **BLOCKER: Message Broker**
```

**Blockers:**
1. **Phase 5 Payment Processor** — Blocks 16 stories (5, 7b, 8, 9)
2. **Phase 6 Message Broker** — Blocks 4 stories (in-app messaging)
3. **Backend Coverage <70%** — Hard gate; currently 50.6%

---

## Technical Standards

| Standard | Status |
|----------|--------|
| UUID PKs (VARCHAR(36)) | ✅ Enforced |
| Row-Level Security | ✅ Enforced |
| Soft Deletes (deleted_at) | ✅ Enforced |
| No-Lombok | ✅ Enforced |
| Test Coverage ≥70% | 🟡 50.6% (Phase A) |
| Cyclomatic Complexity <10 | ✅ Enforced |
| NFR-504 Caching | ✅ Documented |

---

## Test Summary

- Backend: 55 test classes (✅ passing)
- Frontend: 30 test files (✅ passing)
- Coverage: 50.6% (Phase A) → target 70% by 2026-05-31
- E2E: Playwright golden path (US-101–103 ✅)

---

**Status:** ✅ COMPLETE | **Version:** 1.0 | **Synced:** 2026-05-21
