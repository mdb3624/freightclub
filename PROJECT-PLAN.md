# FreightClub: Resilience Logistics Platform — Project Plan

**Last Updated:** 2026-05-21  
**Document Owner:** Librarian Role  
**Governance Status:** Phase 3 Partial (blocking Phase 7b); Phase 7a/7b in design review  
**Test Coverage Requirement:** 70% minimum (currently ~50.6% backend)

---

## Project Goal

FreightClub is a digital freight matching platform connecting shippers (freight senders) with owner-operator truckers. The system automates load posting, load claiming, and settlement workflows while providing real-time market transparency and carrier trust signals.

---

## Phase Summary Table

| # | Phase Name | Status | % Done | Key Deliverables |
|---|------------|--------|--------|------------------|
| 1 | Core Load Lifecycle | ✅ COMPLETE | 100% | Multi-tenant auth, load CRUD, claiming, pessimistic locking |
| 1.1 | UX Hardening | ✅ COMPLETE | 100% | Form validation, error boundaries, responsive UI |
| 1.2 | Security Hardening | ✅ COMPLETE | 100% | Spring Security chain, RLS policies, soft deletes, JWT |
| 2 | Notifications & EIA | ✅ COMPLETE | 100% | Email alerts, notification bell, diesel price API |
| 3 | Document Management | 🟡 PARTIAL | 80% | S3 uploads, BOL/POD, audit logging (in dev) |
| 4 | Ratings & Reviews | 🟡 PARTIAL | 0% | Bidirectional ratings, reputation badges (design ready) |
| 5 | Payments & Invoicing | 📋 PENDING | 0% | Auto-invoicing, Stripe/ACH, settlements (BLOCKED: processor) |
| 6 | In-App Messaging | 📋 PENDING | 0% | Per-load threads, WebSocket, unread badges (BLOCKED: broker) |
| 7 | Carrier Management | 🟡 PARTIAL | 38% | Profiles, preferred lanes, availability, filtering, suggestions |
| 7A | DOT Compliance | 📋 PENDING | 0% | HOS tracking, certification validation |
| 7b | Financial Intelligence | 📋 PENDING | 10% | Shipper reputation (US-712 complete), earnings projections |
| 8 | Bidding & Matching | 📋 PENDING | 0% | Dynamic pricing, algorithmic matching |
| 9 | Admin & Intelligence | 📋 PENDING | 0% | Dashboard, analytics, dispute management |

**Totals:** 78 stories mapped | 14 complete (18%) | Coverage: 50.6% (backend), 5% (frontend)

---

## Phase Detail

### ✅ Phase 1: Core Load Lifecycle

**Scope:** Multi-tenant registration → load posting → load board → claiming workflow with pessimistic locking to prevent double-claims.

**Status:** ✅ COMPLETE (2026-01-XX)

**What's Done (Code Verified):**
- ✅ User registration with email verification (US-101)
- ✅ JWT auth: short-lived access tokens (in-memory), HTTP-only refresh cookies
- ✅ Tenant context isolation via `TenantContextHolder`
- ✅ Load CRUD: create, edit, cancel, publish (US-103)
- ✅ Load board listing with real-time updates
- ✅ Load claiming with pessimistic locking (`@Lock(LockModeType.PESSIMISTIC_WRITE)`)
- ✅ PostgreSQL migration from MySQL with RLS policies
- ✅ No-Lombok architecture (manual POJOs/Records)

**What's Remaining:** Nothing — foundation is stable and extends to all downstream phases.

**Blockers:** None.

---

### ✅ Phase 1.1: UX Hardening (Implicit)

**Status:** ✅ COMPLETE

**What's Done:**
- ✅ Zod form validation schemas across all inputs
- ✅ Error boundaries with fallback UI
- ✅ Loading states and skeleton screens
- ✅ Responsive design (mobile-first Tailwind)
- ✅ Accessibility: ARIA labels, color contrast, keyboard nav
- ✅ Empty state messaging throughout UI
- ✅ Toast notifications for user feedback

**Impact:** UX patterns now permanent standards for all future features.

---

### ✅ Phase 1.2: Security & Stability Hardening (Implicit)

**Status:** ✅ COMPLETE

**What's Done:**
- ✅ Spring Security filter chain: `SimpleOptionsFilter` at `Integer.MIN_VALUE` for CORS preflight
- ✅ JWT audience validation (manual after `parseSignedClaims`, not using `.requireAudience()` — JJWT 0.12.x bug)
- ✅ PostgreSQL RLS: tenant-scoped row access
- ✅ Soft-delete pattern: all queries filter `deleted_at IS NULL`
- ✅ Password hashing: BCrypt strength 12
- ✅ Multi-tenant query isolation at service layer
- ✅ Cache names registered in `CacheConfig`

**Impact:** Production-ready security posture; all compliance gates enforced.

---

### ✅ Phase 2: Notifications & EIA Integration

**Scope:** In-app notification bell, email alerts, real-world diesel pricing data.

**Status:** ✅ COMPLETE (2026-03-XX)

**What's Done (Code Verified):**
- ✅ Email notifications: claim, pickup, delivery, cancellation (US-201)
- ✅ In-app notification bell with unread badge (US-202)
- ✅ Mark-as-read workflow
- ✅ EIA Diesel Pricing API integration with 6-hour cache (US-203)
- ✅ Price ticker on load board
- ✅ NFR-504 caching: 1m (claims), 30s (unread count), 6h (prices)

**What's Remaining:** Nothing — fully implemented and released.

**Blockers:** None.

---

### 🟡 Phase 3: Document Management

**Scope:** File uploads (S3), BOL/POD generation, photo uploads, audit logging.

**Status:** 🟡 PARTIAL (4/5 stories complete; 1 in development)

**What's Done (Code Verified):**
- ✅ S3 integration: signed URLs, file storage (US-301)
- ✅ BOL PDF generation from template (US-302)
- ✅ Photo upload: JPEG/PNG/WebP, 25MB max validation (US-303)
- ✅ Role-based visibility: TRUCKER/SHIPPER gating
- ✅ Status gating: BOL blocks pickup, POD blocks delivery (US-305 completed 2026-05-14)
- ✅ Document list with metadata

**What's Remaining:**
- 🔄 US-308: Document Audit Log Service (in development)
  - Change tracking: who edited/deleted what
  - Compliance requirement for financial records

**Blockers:** None. US-308 does not block Phase 7b or other phases.

**Impact:** Unblocks earnings reporting and tax workflows. Phase 3 completion unblocks Phase 7b (Financial Intelligence).

---

### 🟡 Phase 4: Ratings & Reviews

**Scope:** Bidirectional rating system (shippers rate truckers, truckers rate shippers), reputation aggregation, badges.

**Status:** 🟡 PARTIAL (design approved; implementation pending)

**What's Done:**
- ✅ Architecture design complete (DESIGN_CarrierProfiles_US701.md)
- ✅ Entity model finalized
- ✅ Cache strategy defined (NFR-504: 1h, 2h, 30m TTLs)

**What's Remaining:**
- 📋 US-401: Bidirectional Rating System (0% implemented)
- 📋 US-402: Shipper Reputation Profile (0% implemented)
- 📋 US-403: Rating History & Timeline (0% implemented)
- 📋 US-405: Shipper Reputation Badge on Load Board (0% implemented)

**Blockers:** None — awaits developer capacity.

**Dependencies:** US-103 (load claiming).

**Estimated Effort:** 2 sprints (after Phase 3 completion).

---

### 📋 Phase 5: Payments & Invoicing

**Scope:** Settlement workflow, auto-invoicing, payment processing (Stripe/ACH), financial reporting.

**Status:** 📋 MIGRATION_PENDING

**What's Done:** 0% (architecture spec ready in docs/architecture/)

**What's Remaining:**
- 📋 US-501: Auto Invoice Generation
- 📋 US-502: Payment Processing (Stripe/ACH) — **BLOCKER**
- 📋 US-503: Bank Account Setup & Verification (Plaid)
- 📋 US-504: Payment History & Ledger
- 📋 US-505: Receipt Generation & Export
- 📋 US-506: SETTLED Load Status
- 📋 US-507: Payment Dispute Flow

**🔴 BLOCKER:** Payment processor (Stripe/ACH) not integrated. Requires:
- Vendor contract & API keys
- PCI compliance review
- Bank ACH partnerships
- Integration testing with sandbox

**Estimated Effort:** 3-4 sprints (after processor integration).

**Impact:** Revenue generation; without this, platform cannot settle payments.

---

### 📋 Phase 6: In-App Messaging

**Scope:** Real-time per-load messaging, WebSocket/SSE, unread badges.

**Status:** 📋 MIGRATION_PENDING

**What's Done:** 0%

**What's Remaining:**
- 📋 US-601: Per-Load Message Threads
- 📋 US-602: Real-Time Messaging (WebSocket/SSE) — **BLOCKER**
- 📋 US-603: Unread Message Badge
- 📋 US-604: Message Notifications

**🔴 BLOCKER:** Message broker (Redis/RabbitMQ/Kafka) not integrated. Requires:
- Vendor selection and provisioning
- Spring Cloud Stream configuration
- WebSocket endpoint implementation
- Load testing

**Estimated Effort:** 3 sprints (after broker integration).

**Impact:** Real-time communication between shippers and truckers; critical for operational workflows.

---

### 🟡 Phase 7: Carrier Management

**Scope:** Trucker profiles (equipment, capacity), preferred lanes, availability windows, load filtering, load suggestions.

**Status:** 🟡 PARTIAL (5/13 stories complete)

**What's Done (Code Verified):**
- ✅ US-701: Carrier Profiles — equipment types, capacity, certifications
  - Backend: full CRUD, service layer, repo with RLS
  - Frontend: profile form, equipment selector, validation
  - Tests: 15+ test cases
  - Cache: 1h TTL (NFR-504)
  - Release: 2026-05-15

- ✅ US-702: Trucker Preferred Lanes (Region-Based)
  - Backend: region geometry (state/radius), preferred lane storage
  - Cache: 1h TTL
  - Tests: region matching logic verified
  - Release: 2026-05-17

- ✅ US-703: Trucker Availability (Days/Hours)
  - Backend: availability window CRUD (Mon-Sun, start-end hours)
  - Service: isAvailableNow() logic
  - Cache: 5m TTL
  - Tests: time-based matching tests
  - Release: 2026-05-18

- ✅ US-712: Shipper Public Reputation (Phase 7b foundation)
  - Backend: reputation API endpoint, cache invalidation
  - Tests: 11 integration tests (cache hit/miss, events)
  - Cache: 1h TTL, event-driven invalidation
  - Release: 2026-05-20

**What's Remaining:**
- 🟡 US-704: Suggested Loads (By Preferred Lanes) — PARTIAL
  - Backend: matching algorithm (in review)
  - Tests: incomplete coverage
  - Estimate: 1 sprint

- 🟡 US-705: Load Board Filters (Weight, Min Pay) — PARTIAL
  - Backend: filter service layer (in review)
  - Frontend: filter UI (in dev)
  - Estimate: 1 sprint

- 🟡 US-706: Load Posting Validation Prompts (Shipper) — PARTIAL
  - Frontend: post-load form warnings (in dev)
  - Estimate: 0.5 sprint

- 📋 US-707: Shipper Preferred Carrier List
- 📋 US-708: Direct Load Assignment to Carrier
- 📋 US-709: Carrier Blocking/Blacklist
- 📋 US-710: Load Auto-Cancel if Not Claimed
- 📋 US-711: Multi-Stop Load Optimization
- 📋 US-713: Shipper Dashboard
- 📋 US-714: Shipper Profile Page
- 📋 US-715: Shipper Dashboard Release (RECENTLY COMPLETED 2026-05-21)

**Blockers:** None for completed stories. US-704/705 reviews in progress.

**Dependencies:** US-701 → US-702 → US-703 → US-704, US-705.

**Impact:** Enables truckers to self-filter loads; dramatically improves load-to-driver matching and carrier satisfaction.

---

### 📋 Phase 7A: DOT Compliance

**Scope:** HOS (Hours of Service) tracking, DOT compliance, driver certification validation.

**Status:** 📋 PENDING

**What's Done:** 0% (design spec in progress)

**What's Remaining:**
- 📋 US-717: HOS Widget Integration
- 📋 US-718: Hours Remaining Calculation
- 📋 US-719: 30-Min Break Enforcement
- 📋 US-720: Certification Expiry Tracking
- 📋 US-721: DOT Audit Trail

**Dependencies:** US-701 (carrier profiles).

**Estimated Effort:** 2-3 sprints.

**Impact:** Legal compliance for trucking operations; required for production launch.

---

### 📋 Phase 7b: Financial Intelligence

**Scope:** Shipper reputation visibility, earnings projections, carrier performance analytics.

**Status:** 📋 PENDING (1/8 stories complete)

**What's Done:**
- ✅ US-712: View Shipper Public Profile
  - Backend: reputation endpoint, cache layer complete
  - Tests: 11 integration tests passing
  - Release: 2026-05-20

**What's Remaining:**
- 📋 US-722: Earnings Projections (by shipper, region, load type)
- 📋 US-723: Carrier Performance Dashboard
- 📋 US-724: Cost Per Mile (CPM) Analytics
- 📋 US-725: Fuel Cost Integration
- 📋 US-726: Revenue Impact Estimates
- 📋 US-727: Load Profitability Ranking
- 📋 US-728: Shipper Compliance Score

**Dependencies:** Phase 3 (documents complete) → Phase 7b can proceed.

**Blockers:** None (Phase 3 was unblocked 2026-05-14).

**Estimated Effort:** 3-4 sprints.

**Impact:** Enables data-driven carrier decision-making; critical competitive differentiator.

---

### 📋 Phase 8: Bidding & Matching

**Scope:** Dynamic pricing, algorithmic load-to-carrier matching, multi-carrier auctions.

**Status:** 📋 PENDING (0% implemented)

**What's Done:** Architecture design in progress.

**What's Remaining:** 6 stories spanning pricing algorithms, auction mechanics, matching engine.

**Estimated Effort:** 4-5 sprints.

**Impact:** Enables revenue optimization for platform and carriers.

---

### 📋 Phase 9: Admin & Intelligence

**Scope:** Admin dashboard, analytics, compliance, dispute resolution.

**Status:** 📋 PENDING (0% implemented)

**What's Done:** 0%

**What's Remaining:** 10 stories.

**Estimated Effort:** 4-5 sprints.

**Impact:** Platform operations, fraud detection, financial reporting.

---

## Immediate Next Priorities (Top 5)

1. **Complete US-704 (Suggested Loads by Preferred Lanes) — CRITICAL**
   - Effort: 1 sprint
   - Reason: Core value driver for truckers; unblocks load board experience
   - Status: Backend matching algorithm in review; needs test completion
   - Blocker: Review feedback pending

2. **Complete US-705 (Load Board Filters: Weight, Min Pay) — HIGH**
   - Effort: 1 sprint
   - Reason: Enables truckers to self-filter; reduces noise on load board
   - Status: Filter service and frontend UI in dev
   - Blocker: Design review feedback

3. **Complete US-308 (Document Audit Log Service) — MEDIUM**
   - Effort: 0.5 sprint
   - Reason: Phase 3 completion gate; required for compliance
   - Status: In development
   - Blocker: None

4. **Integrate Payment Processor (Stripe/ACH Setup) — CRITICAL**
   - Effort: 2 sprints (vendor integration + testing)
   - Reason: BLOCKER for all Phase 5 (Payments) stories
   - Reason: Required for revenue generation
   - Status: Spec ready; vendor contract pending
   - Blocker: Business/vendor coordination

5. **Integrate Message Broker (Redis/RabbitMQ) — CRITICAL**
   - Effort: 1.5 sprints (provisioning + Spring Cloud Stream config)
   - Reason: BLOCKER for all Phase 6 (Messaging) stories
   - Reason: Required for real-time operations
   - Status: Spec ready; vendor selection pending
   - Blocker: Infrastructure/business decision

---

## Out of Scope / Future

**Explicitly Deferred (Beyond Current Roadmap):**

- **Phase 5 Payments & Invoicing** — Blocked on payment processor integration (Stripe/ACH)
- **Phase 6 In-App Messaging** — Blocked on message broker integration
- **Phase 8 Bidding & Matching** — Deferred pending Phase 7 (Carrier Mgmt) stabilization
- **Phase 9 Admin & Intelligence** — Deferred pending Phase 7b (Financial Intelligence) completion
- **Phase 7A DOT Compliance** — Planned for post-Phase 7 completion

**Non-MVP Features (Future Consideration):**

- Mobile app (currently web-only)
- Load sub-contracting marketplace
- International trucking support
- Predictive route optimization
- Driver fatigue monitoring (beyond HOS)
- Insurance integration beyond verification

---

## Governance & Quality Gates

**Test Coverage Requirements:**
- Backend: 70% minimum (currently 50.6%)
- Frontend: 50% minimum (currently ~5%)
- Hard gate: No PR merge without passing tests

**Architecture Standards (Enforced):**
- No-Lombok: manual POJOs/Records only
- Multi-tenancy: all queries respect `TenantContextHolder`
- Soft deletes: all core entities have `deleted_at IS NULL` filters
- RLS: PostgreSQL row-level security on all multi-tenant tables
- Cyclomatic complexity: max 10 per method
- Cache names: registered in `CacheConfig`

**Release Process:**
- Code review via REVIEWER.md checklist
- Librarian sign-off on story completion
- Smoke tests: login → feature → adjacent flows → logout
- Production deployment: Cloud Run (backend), Cloud Storage + CDN (frontend)

---

## Technical Stack (Confirmed)

- **Backend:** Spring Boot 3.x (Java 21) | REST API | JPA/Hibernate
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Zustand + React Query
- **Database:** PostgreSQL (Neon) + Flyway migrations + RLS
- **Auth:** Spring Security + JWT (in-memory access, HTTP-only refresh cookie)
- **Cache:** `ConcurrentMapCacheManager` (in-memory) with event-driven invalidation
- **File Storage:** AWS S3 (signed URLs)
- **Email:** SendGrid (confirmed working)
- **External APIs:** EIA Diesel Pricing (confirmed working)

---

## Key Files for Reference

**Project Governance:**
- `/CLAUDE.md` — Role definitions, SDLC gates
- `/docs/project/Story_Map.md` — Global story mapping (80 stories)
- `/docs/project/PHASE_BREAKDOWN.md` — Phase-by-phase detail
- `/docs/architecture/specs/REQUIREMENTS.md` — Business requirements

**Implementation Standards:**
- `/docs/roles/ARCHITECT.md` — Domain design process
- `/docs/roles/CODER.md` — TDD workflow, code patterns
- `/docs/roles/REVIEWER.md` — Quality gates, hard checklist
- `/docs/roles/LIBRARIAN.md` — Story sign-off, traceability

**Architecture & Design:**
- `/docs/architecture/Technical_Requirements.md` — NFR-504 caching, multi-tenancy, RLS
- `/docs/architecture/specs/API_CACHING_SPEC_700SERIES.md` — Cache implementation
- `/docs/architecture/DESIGN_CarrierProfiles_US701.md` — Phase 7 foundations
- `/.claude/rules/postgres-native.md` — PostgreSQL standards
- `/.claude/rules/ui-standards.md` — Frontend architecture

**Backend Source:**
- `backend/src/main/java/com/freightclub/modules/` — Feature modules
- `backend/src/test/java/` — 55 test classes (234 total Java files)

**Frontend Source:**
- `frontend/src/features/` — Feature-sliced architecture
- `frontend/src/components/ui/` — Tailwind component library
- `frontend/src/` — 170 total TypeScript/TSX files

**Database:**
- `backend/src/main/resources/db/migration/` — Flyway migrations (V20260422_02__Create_users.sql latest)

---

## Success Metrics

| Metric | Target | Current | Gap |
|--------|--------|---------|-----|
| Backend Test Coverage | 70% | 50.6% | -19.4% |
| Frontend Test Coverage | 50% | ~5% | -45% |
| Phase Completion | 100% (9 phases) | 47% (3/9 complete) | — |
| Story Completion | 100% (78 total) | 18% (14/78) | — |
| Production Uptime | 99.9% | — | TBD (post-launch) |
| Load Board Response Time | <200ms | — | TBD (in optimization) |

