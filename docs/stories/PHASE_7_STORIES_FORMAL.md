# Phase 7+ Formal User Stories (INVEST-Compliant)

## Hard Gates Applied
✅ **NFR-504:** All GET endpoints require `@Cacheable` with TenantId in cache key  
✅ **Architecture:** Java 21, No-Lombok, RLS-enforced, VARCHAR(36) keys  
✅ **Regulatory:** FMCSA HOS and IFTA compliance logic where applicable  
✅ **Test Coverage:** 80% branch coverage minimum (JaCoCo)  
✅ **Multi-Tenancy:** Implicit RLS; no manual tenant_id filters  

---

## Phase 7: Carrier Management (US-701 to US-711)

### US-701: Carrier Profiles (Truck/Trailer/Capacity)
**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Trucker creates and manages carrier profile with equipment
  Scenario: Trucker adds a new truck with capacity
    Given a trucker is logged in to the Carrier Portal
    When they navigate to Equipment Management
    And submit a form with:
      | Field          | Value                    |
      | Truck Make     | Volvo                    |
      | Model Year     | 2024                     |
      | GVWR           | 80000 lbs                |
      | Axles          | 3                        |
    Then a Truck entity is created with deleted_at IS NULL
    And the truck appears in the carrier profile query (cached, TTL 1h)

  Scenario: Trucker claims multiple trailers
    Given a truck is registered for the carrier
    When they add 2 trailers of type BOX and REEFER
    Then each trailer is soft-linked to the carrier via carrier_id
    And the equipment list endpoint returns all non-deleted equipment

  Scenario: System verifies GVWR compliance
    Given equipment is added with GVWR > 80,000
    When the system validates against FMCSA rules
    Then a compliance flag is set (equipment flagged, requires DOT paperwork)
```

**Hidden Dependencies:**
- Requires `Carrier` entity with RLS policy enforcing `tenant_id = current_tenant`
- Requires `Equipment` table (id: VARCHAR(36), carrier_id: FK, equipment_type, gvwr, deleted_at TIMESTAMPTZ, tenant_id)
- Flyway migration: `V20260427_1000__Carrier_Equipment_Tables.sql`

**Hard Gates:**
- ✅ Cache key: `carrier:equipment:${tenantId}:${carrierId}`
- ✅ GET `/api/v1/carriers/{carrierId}/equipment` → `@Cacheable`
- ✅ POST `/api/v1/carriers/{carrierId}/equipment` → `@CacheEvict(key="carrier:equipment:*")`
- ✅ DELETE (soft) → `@CacheEvict(key="carrier:equipment:*")`

**Traceability:** REQ-701-1 (Carrier Profile Creation), REQ-701-2 (Equipment Management)

---

### US-702: Trucker Preferred Lanes (Region-Based)
**Acceptance Criteria (Gherkin):**
```gherkin
Feature: Trucker sets preferred lanes by region
  Scenario: Trucker selects preferred origin/destination states
    Given a trucker has a carrier profile
    When they navigate to Preferred Lanes
    And select ["CA", "TX", "FL"] as origin states and ["OH", "PA"] as destinations
    Then a PreferredLane entity is created per combination
    And the load matching algorithm filters suggestions by these lanes

  Scenario: System caches preferred lanes
    When the trucker requests suggested loads
    Then the system queries PreferredLane entities (cached, TTL 30min)
    And filters the load board by these lanes
```

**Hard Gates:**
- Cache key: `carrier:preferred_lanes:${tenantId}:${carrierId}`
- GET endpoint must return cached result
- Soft delete pattern on lanes (deleted_at IS NULL)

---

### US-703: Trucker Availability (Days/Hours)
**AC:** Trucker sets working hours (e.g., Mon-Fri 06:00–20:00). Suggested loads filter out mismatched pickup times.

**Hard Gates:**
- Cache key: `carrier:availability:${tenantId}:${carrierId}`
- GET endpoint uses `@Cacheable`
- CRON job processes availability for overnight matching

---

### US-704: Suggested Loads (By Preferred Lanes)
**AC:** GET `/api/v1/suggested-loads` returns loads matching the trucker's preferred lanes, availability, and equipment type.

**Hard Gates:**
- Cache key: `suggested_loads:${tenantId}:${carrierId}:${sort_by}`
- Filter by `deleted_at IS NULL` on loads and carrier constraints
- TTL: 5 minutes (loads refresh frequently)

---

### US-705: Load Board Filters (Weight, Min Pay)
**AC:** Shipper-side filters allow filtering by gross weight, revenue per load, and equipment type.

**Hard Gates:**
- Enhance GET `/api/v1/board` with filter parameters
- Cache key includes filter hash: `board:loads:${tenantId}:${filterHash}`

---

### US-706: Load Posting Validation Prompts (Shipper)
**AC:** When a shipper posts a load, validate against EIA data (reachability, typical rates). Warn if rate is below market.

**Hard Gates:**
- GET EIA cache: `eia:rates:${tenantId}:${lane}` (TTL 1 day)

---

### US-707: Shipper Preferred Carrier List
**AC:** Shipper can maintain a whitelist of preferred truckers. Only these truckers see their loads.

**Hard Gates:**
- Cache key: `shipper:preferred_carriers:${tenantId}:${shipperId}`
- RLS ensures only the shipper's own list is visible

---

### US-708: Direct Load Assignment to Preferred Trucker
**AC:** Shipper directly assigns a load to a preferred trucker (bypass board posting).

**Hard Gates:**
- POST operation invalidates `suggested_loads:${tenantId}:*` cache

---

### US-709: Block Carrier (Prevent Load Visibility)
**AC:** Shipper can block specific carriers; loads are hidden from them on the board.

**Hard Gates:**
- Cache key: `shipper:blocked_carriers:${tenantId}:${shipperId}`
- Board query filters out blocked carriers at DB level (RLS-friendly)

---

### US-710: View Trucker Public Profile (History)
**AC:** Shipper views a trucker's public profile: completed loads, avg rating, response time.

**Hard Gates:**
- Cache key: `trucker:public_profile:${tenantId}:${carrierId}` (TTL 1h, read-only)
- No sensitive data exposed (earnings, payment info)

---

### US-711: Load Interest / View Count Tracking
**AC:** Track how many truckers viewed each load and how many showed interest.

**Hard Gates:**
- Increment counters asynchronously (event-driven)
- Cache invalidation on view (or eventual consistency acceptable)

---

## Phase 7A: DOT Compliance (US-720 to US-724)

### US-720: USDOT & DOT Registration Verification
**AC:** Trucker submits USDOT number. System queries FMCSA API and caches registration status.

**Hard Gates:**
- Cache key: `fmcsa:registration:${tenantId}:${usdot_number}` (TTL 24h)
- RLS: only visible to carrier's tenant
- Compliance flag: `compliance_status = VERIFIED | EXPIRED | INVALID`

---

### US-721: Insurance Certificate Tracking
**AC:** Trucker uploads insurance certificate (PDF). System extracts expiry date and sends renewal reminders 30 days before.

**Hard Gates:**
- Document storage in S3 with signed URLs
- Cache key: `insurance:certificates:${tenantId}:${carrierId}` (TTL 1h)

---

### US-722: CDL & Medical Card Documentation
**AC:** Trucker uploads CDL image and medical card. System validates expiry and flags non-compliance.

---

### US-723: Equipment Condition Monitoring
**AC:** Trucker logs equipment inspections (DVIR). System flags overdue inspections.

**Hard Gates:**
- Cache key: `equipment:inspections:${tenantId}:${carrierId}` (TTL 6h)

---

### US-724: DOT Compliance Dashboard (Admin)
**AC:** Admin views compliance status across all carriers: expired insurance, invalid USDOT, overdue inspections.

**Hard Gates:**
- Aggregated cache: `admin:compliance_dashboard:${complianceStatus}` (TTL 15min)
- No direct tenant isolation; admin access only

---

## Phase 7b: Financial Intelligence (US-730 to US-737)

### US-730: Per-Load Earnings Log (Miles, Fuel, Profit)
**AC:** After load delivery, trucker views earnings: revenue, fuel cost, deadhead, net profit.

**Hard Gates:**
- Cache key: `earnings:load:${tenantId}:${carrierId}:${loadId}` (TTL 1h)
- Aggregate earnings across loads: `earnings:summary:${tenantId}:${carrierId}` (TTL 1h)

---

### US-731: Weekly/Monthly P&L Report
**AC:** Trucker exports P&L: total revenue, total expenses, net by week/month.

**Hard Gates:**
- Cache key: `report:pnl:${tenantId}:${carrierId}:${period}` (TTL 1h)

---

### US-732: IFTA Mileage Tracking by State
**AC:** System tracks mileage by state for IFTA compliance. Auto-calculate fuel tax liability.

**Hard Gates:**
- Cache key: `ifta:mileage:${tenantId}:${carrierId}:${fiscalQuarter}` (TTL 1h)

---

### US-733: Deadhead Mileage Estimation
**AC:** When claiming a load, system estimates deadhead miles from current location.

**Hard Gates:**
- Cache key: `deadhead:estimate:${tenantId}:${fromState}:${toState}` (TTL 24h)

---

### US-734: Deadhead Cost in Profitability Calc
**AC:** Earnings logic deducts deadhead fuel cost from revenue.

---

### US-735: Fuel Surcharge (FSC) Auto-Calculation
**AC:** System auto-calculates FSC based on weekly diesel averages (EIA data).

**Hard Gates:**
- Cache key: `fuel:surcharge:${tenantId}:${week}` (TTL 1 week)

---

### US-736: Annual Earnings & Tax Summary Export
**AC:** Trucker exports annual earnings for tax filing: gross revenue, deductions, net income.

---

### US-737: Extract trucker_cost_profiles (Data Migration)
**AC:** Migrate legacy `trucker_cost_profiles` table to new schema.

---

## Phase 8: Bidding System (US-740 to US-745)

### US-740: Post Load as Open-to-Bids vs FCFS
**AC:** Shipper chooses load posting mode: FCFS (first-come-first-served) or OPEN_TO_BIDS.

**Hard Gates:**
- Cache invalidation on mode change

---

### US-741: Trucker Submits Bid (Rate + Message)
**AC:** Trucker can bid on OPEN_TO_BIDS loads with a custom rate and optional message.

**Hard Gates:**
- Cache key: `load:bids:${tenantId}:${loadId}` (TTL 5min)

---

### US-742: Shipper Reviews/Accepts/Rejects Bids
**AC:** Shipper sees all bids, accepts one, and system auto-rejects others.

---

### US-743: Bid Expiry & Auto-Close (Background Job)
**AC:** Bids expire after 24h. System auto-closes OPEN_TO_BIDS loads if no acceptance.

---

### US-744: Duplicate Load for Recurring Lanes
**AC:** Shipper can set up recurring loads (e.g., weekly CA→TX).

---

### US-745: Freight Class Field (LTL Support)
**AC:** Add Freight Class (1–9) field to load for LTL (Less Than Truckload) support.

---

## Phase 9: Admin & Compliance (US-750+)

### US-750: Admin Dashboard (Users, Loads, Tenants)
**AC:** Admin views all tenants, users, loads, and system health metrics.

**Hard Gates:**
- Cache key: `admin:dashboard:${tenantId}` (TTL 5min)

---

### US-751: Dispute Resolution Tools (Admin)
**AC:** Admin can manually resolve payment disputes and load claim conflicts.

---

### US-752: Platform Health Metrics
**AC:** Monitor API latency, error rates, cache hit/miss ratios, and uptime.

---

## Traceability Matrix

| Story ID | Requirement ID | Phase | Hard Gates | Status |
|----------|---|-------|-----------|--------|
| US-701 | REQ-701-1,2 | 7 | Cache, RLS, No-Lombok | BACKLOG → PLANNED |
| US-702 | REQ-702-1 | 7 | Cache, RLS | BACKLOG |
| ... | ... | ... | ... | BACKLOG |

---

## Implementation Sequence (Dependency Order)
1. US-701 (Carrier Profiles) ← Foundation
2. US-720 (USDOT Verification) ← Compliance dependency
3. US-721, US-722, US-723 (Insurance, CDL, Equipment) ← Compliance stack
4. US-730 (Per-Load Earnings) ← Financial foundation
5. US-702, US-703 (Preferred Lanes, Availability) ← Matching logic
6. US-704 (Suggested Loads) ← Depends on 2, 3
7. US-740 (Bidding Setup) ← Post-Phase 7 completion

---

**Next Step:** Begin US-701 implementation with Coder role (Red-Green-Refactor TDD).
