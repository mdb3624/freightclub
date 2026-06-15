# ARCHITECT AUDIT RESULTS: US-822 Shipment Status Panel

**Story ID:** US-822  
**Audit Date:** 2026-06-15  
**Auditor:** Code Reviewer (ARCHITECT Gate)  
**Authority:** ARCHITECT.md + CLAUDE.md Database & Persistence Standards  
**Overall Status:** 🟡 **CONDITIONALLY APPROVED** — Design is structurally sound but requires **3 critical clarifications** + **9 minor refinements** before CODER can implement with confidence.

---

## Executive Summary

The ARCHITECT design document provides:
- ✅ Complete Field Contract Table (UI → API → DB mapping)
- ✅ Domain model diagram (Mermaid)
- ✅ Database schema verification (no migrations needed)
- ✅ API contract (endpoint, response format)
- ✅ Caching strategy (NFR-504 compliant)
- ✅ RLS policy enforcement

However, **3 critical gaps** prevent CODER from starting implementation:

1. ❌ **Status enum mismatch:** ARCHITECT spec says "OPEN, CLAIMED, IN_TRANSIT, DELIVERED" but BA/HFD specify "POSTED, CLAIMED, PICKED_UP, IN_TRANSIT, DELIVERED"
2. ❌ **Progress calculation logic undefined:** Field Contract shows "Derive" but no explicit algorithm
3. ❌ **TransitProgressCalculator location ambiguous:** "to be created or refactored" — unclear where it lives (domain service, util, infrastructure)

Additionally, **9 minor refinements** are needed for production readiness (error handling, pagination, sorting guarantee, join types, etc.).

---

## Compliance Assessment

### ✅ STRENGTHS

| Aspect | Finding | Evidence |
|---|---|---|
| **Input Gate Compliance** | Story acceptance gate passed; AC locked for design | §Input Acceptance Gate: PASSED ✅ |
| **Field Contract Table** | Complete UI→API→DB mapping with 7 fields validated | §Field Contract Table: All rows populated |
| **Domain Modeling** | Mermaid diagram provided showing Load, Carrier, Service relationships | §Domain Model Diagram: classDiagram present |
| **Database Reuse** | No new migrations needed; all required columns verified to exist | §Database Schema: "NO CHANGES NEEDED" |
| **RLS Enforcement** | Tenant isolation policy exists and referenced | §Row Level Security: Policy cited with SQL |
| **API Contract** | Endpoint, response format, HTTP status specified | §API Contract: GET /api/v1/shipper/shipments/active with 200 response |
| **Caching Strategy** | NFR-504 compliance documented with TTL and invalidation | §Caching Strategy: 1-minute TTL, invalidation trigger noted |
| **No-Lombok Pattern** | No Java code in ARCHITECT doc (correctly deferred to CODER) | N/A (ARCHITECT constraint followed) |
| **Sequential Lock Protocol** | Story locked; ARCHITECT provides design contract for CODER | §Input Acceptance Gate: Verdict "ACCEPT — Story is LOCKED" |

### ⚠️ CRITICAL GAPS (Blocking CODER Implementation)

| Gap | Impact | Severity | Required Fix |
|---|---|---|---|
| **Status enum mismatch** | CODER doesn't know which enum values to map (OPEN vs POSTED) | 🔴 CRITICAL | **CLARIFY:** Which is correct? Verify against `loads.status` ENUM definition in DB |
| **Progress calculation undefined** | CODER can't implement TransitProgressCalculator logic | 🔴 CRITICAL | **DEFINE:** Explicit algorithm (0% for POSTED, intermediate from load_events, 100% for DELIVERED) |
| **TransitProgressCalculator location** | CODER doesn't know where to place service (domain, util, infrastructure layer) | 🔴 CRITICAL | **SPECIFY:** Layer placement + interface definition + test strategy |

### ❌ MINOR REFINEMENTS (Production Readiness)

| Refinement | Current State | Required | Impact |
|---|---|---|---|
| **Error Handling** | API contract shows only 200 OK | Add 401, 403, 404, 500 responses | Missing error cases |
| **Pagination** | No pagination spec for large shipment lists | Add limit/offset or cursor pagination | Scalability issue if shipper has 100+ loads |
| **Sorting Guarantee** | "Status-First" logic in directives but not in API response | Specify ORDER BY in endpoint contract | UI may not receive sorted data |
| **Join Type Clarity** | "Via loads.carrier_id JOIN" but doesn't specify INNER vs LEFT | Specify LEFT JOIN (carrier_id nullable) | Risk of missing unassigned loads |
| **Rating Default** | Rating marked "No" (nullable) but no default specified | Define: NULL, 0.0, or absent from response | Ambiguous for CODER |
| **Multi-Tenancy Verification** | TenantContextHolder mentioned but carrier lookup not verified for tenant safety | Verify carrier_id cannot cross tenants | Security risk if carrier data leaks across tenants |
| **Service Interface** | Diagram shows ShipmentStatusService but no interface contract | Define public interface (methods, return types, exceptions) | CODER has no contract to implement against |
| **Caching Invalidation Mechanism** | "Trigger on status update" but not HOW (event-driven, manual, scheduled?) | Specify mechanism (event listener, AOP, manual cache.evict()) | CODER doesn't know implementation strategy |
| **Soft Delete Filtering** | "deleted_at IS NULL" mentioned but no SQL example | Provide SQL query or repository method signature | CODER may miss soft delete constraint |

---

## Detailed Audit Findings

### 1. Status Enum Mismatch (CRITICAL)

**Current State (ARCHITECT):**
```
Load Status: OPEN, CLAIMED, IN_TRANSIT, DELIVERED
```

**Expected State (BA + HFD):**
```
Load Status: POSTED, CLAIMED, PICKED_UP, IN_TRANSIT, DELIVERED
```

**Finding:** ❌ CRITICAL MISMATCH — CODER cannot map UI status badges to database enum values.

**Evidence:**
- BA Story (US-822): "Load Status Transitions (Posted → Claimed → Picked Up → In Transit → Delivered)"
- HFD Spec (§4.2): Status badges map to "Delayed, Claimed, Picked Up, In Transit, Delivered"
- ARCHITECT Spec (Field Contract): "OPEN, CLAIMED, IN_TRANSIT, DELIVERED" (only 4 values, missing PICKED_UP)

**Root Cause:** ARCHITECT spec appears outdated or uses legacy enum naming. Discrepancy likely introduced during platform evolution.

**Recommendation:**

```markdown
### STATUS ENUM CLARIFICATION REQUIRED

**Question for ARCHITECT/DB Team:**

Current `loads.status` ENUM in PostgreSQL:
- What are the actual values? (Check: \d loads in psql)

**Expected Mapping (per BA Story + HFD):**
1. POSTED → Shipment posted, awaiting carrier selection
2. CLAIMED → Carrier claimed load, beginning pickup logistics
3. PICKED_UP → Carrier picked up cargo
4. IN_TRANSIT → Load in transit to destination
5. DELIVERED → Load delivered

**Action:**
1. Query DB: `SELECT pg_enum.enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE pg_type.typname = 'load_status' ORDER BY pg_enum.enumsortorder;`
2. Verify 5 values exist: POSTED, CLAIMED, PICKED_UP, IN_TRANSIT, DELIVERED
3. If OPEN exists instead of POSTED, clarify which is canonical
4. Update Field Contract Table with verified enum values

**Block:** CODER cannot begin until this is clarified. Do not proceed with assumption.
```

---

### 2. Progress Calculation Logic Undefined (CRITICAL)

**Current State:**
```
Field Contract Table shows:
Progress | progress | Derived | DECIMAL | Yes | Calculated via `TransitProgressCalculator`
```

**Finding:** ❌ CRITICAL AMBIGUITY — "Derived" and "via TransitProgressCalculator" lack detail.

**Missing Information:**
- What is the calculation formula?
- What data sources into the calculation (load_events, timestamps, distance)?
- What should progress be for each status (POSTED=0%, DELIVERED=100%, intermediate=?)?
- How are edge cases handled (cancelled loads, stuck shipments, delays)?

**Recommendation:**

```markdown
### PROGRESS CALCULATION LOGIC (REQUIRED)

**Algorithm Definition:**

**For each load, calculate:**
```
progress_percentage = (elapsed_time_to_current_stage / total_expected_time) × 100

Where:
- POSTED: progress = 0%
- CLAIMED: progress = 10%
- PICKED_UP: progress = 25%
- IN_TRANSIT: progress = (distance_traveled / total_distance) × 100
  - Source: load_events.event_type='LOCATION_UPDATE' with GPS coordinates
  - Fall back to time-based: (time_since_pickup / est_delivery_time) × 100 if GPS unavailable
- DELIVERED: progress = 100%

**Data Sources:**
1. `loads.status` → stage determination
2. `loads.created_at` → elapsed time
3. `loads.estimated_delivery_at` → expected duration
4. `load_events` table → intermediate timestamps and GPS coordinates (if available)
5. `loads.distance_miles` (if stored) or calculated from addresses

**Edge Cases:**
- Delayed shipment (actual_time > est_time): cap at 99% (never 100% until DELIVERED status)
- No intermediate events: use time-based fallback calculation
- Cancelled/failed loads: return -1% or null (exclude from dashboard)
- Timezone handling: Use UTC internally; convert for display
```

**ServiceMethod Signature:**

```java
// TransitProgressCalculator
public BigDecimal calculateProgress(Load load) throws TransitProgressException {
    // Implementation to be provided by CODER
    // Must handle all 5 status values and edge cases above
    // Return value: 0.0 to 100.0 (or -1 for cancelled/failed)
}
```

**Question for ARCHITECT:**
- Is distance-based or time-based progress preferred?
- If distance-based, is GPS data available in load_events?
- Should delayed loads be capped at 99% or continue to 100%?

**Block:** CODER cannot implement TransitProgressCalculator without explicit formula.
```

---

### 3. TransitProgressCalculator Placement Ambiguous (CRITICAL)

**Current State:**
```
Platform Reuse Check: "Create a reusable `TransitProgressCalculator` to centralize the 0-100% progress logic."
And: "Calculator: `TransitProgressCalculator.java` (to be created or refactored)"
```

**Finding:** ❌ CRITICAL AMBIGUITY — "to be created or refactored" is non-committal. No clear placement.

**Missing Information:**
- Where in codebase? (`backend/src/main/java/com/freightclub/{domain|service|util}/?`)
- Is it a Spring `@Service` or static utility class?
- Should it be tested in isolation (unit test) before integration?
- Does it have dependencies (LoadRepository, EventService) or pure calculation?
- What exceptions can it throw?

**Recommendation:**

```markdown
### TRANSITPROGRESSCALCULATOR PLACEMENT (REQUIRED)

**Decision: Service Layer (Domain Service Pattern)**

**Location:** `backend/src/main/java/com/freightclub/load/service/TransitProgressCalculator.java`

**Classification:** Spring `@Component` (stateless domain service)

**Interface Contract:**

```java
package com.freightclub.load.service;

public class TransitProgressCalculator {
    
    /**
     * Calculates the progress percentage (0-100) for a load based on its status
     * and transit history.
     *
     * AC-6: Monitor Business Metrics (progress visualization)
     *
     * @param load The load entity (must not be null)
     * @return Progress percentage (0.0 to 100.0), or -1.0 for cancelled/failed loads
     * @throws IllegalArgumentException if load is null
     * @throws TransitProgressException if calculation fails (missing data, bad state)
     */
    public BigDecimal calculateProgress(Load load) throws TransitProgressException {
        // Implementation provided by CODER per algorithm in §2
    }
    
    /**
     * Determines the current stage of a load's transit.
     *
     * @param load The load entity
     * @return LoadStage enum (PENDING, ACTIVE, COMPLETE, FAILED)
     */
    public LoadStage getCurrentStage(Load load) {
        // Helper method for stage determination
    }
}
```

**Dependencies:**
- NO LoadRepository dependency (stateless calculation)
- Receives Load object; does not query DB
- Pure domain logic (suitable for domain layer)

**Testing Strategy:**
1. Unit tests (pure logic): Test all status transitions, edge cases
2. Integration tests: Test with real Load entities from test DB
3. E2E tests: Verify progress bar renders correctly in UI

**Quality Gates:**
- Branch coverage: ≥80% (JaCoCo)
- Cyclomatic complexity: <10
- No-Lombok compliance: Manual getters/setters (if needed)

**Placement Rationale:**
- Domain service pattern (per ARCHITECTURE.md)
- Centralized logic (reusable by ShipmentStatusService and future features)
- Testable in isolation
- No framework dependencies (pure business logic)

**Alternative: Static Util**
- ❌ NOT recommended (harder to test, violates dependency injection)
- Only if algorithm is pure mathematical (no domain context needed)
```

---

### 4. API Contract: Error Handling Missing

**Current State:**
```
Response (200 OK):
[
  { "loadId": "LOAD-3011", "status": "DELAYED", ... }
]
```

**Finding:** ⚠️ MINOR — Only 200 OK specified. Missing error cases.

**Recommendation:**

```markdown
### API CONTRACT: ERROR RESPONSES (ADD)

**Endpoint:** `GET /api/v1/shipper/shipments/active`

**Responses:**

**200 OK - Success**
```json
[
  {
    "loadId": "LOAD-3011",
    "status": "IN_TRANSIT",
    "progress": 45.5,
    "equipment": "Flatbed",
    "carrier": "RoadKing Logistics",
    "rating": 4.5,
    "destination": "Houston, TX"
  }
]
```

**400 Bad Request**
```json
{
  "error": "INVALID_QUERY_PARAM",
  "message": "Invalid limit parameter. Must be 1-100.",
  "timestamp": "2026-06-15T14:30:00Z"
}
```

**401 Unauthorized**
```json
{
  "error": "UNAUTHORIZED",
  "message": "Missing or invalid Bearer token.",
  "timestamp": "2026-06-15T14:30:00Z"
}
```

**403 Forbidden**
```json
{
  "error": "FORBIDDEN",
  "message": "Access denied. Shipper role required.",
  "timestamp": "2026-06-15T14:30:00Z"
}
```

**404 Not Found** (if shipper tenant not found)
```json
{
  "error": "TENANT_NOT_FOUND",
  "message": "Shipper company not found.",
  "timestamp": "2026-06-15T14:30:00Z"
}
```

**500 Internal Server Error**
```json
{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "Failed to fetch shipments. Please try again later.",
  "timestamp": "2026-06-15T14:30:00Z",
  "traceId": "abc-123-xyz"
}
```

**Caching Note:** 200 responses cached (1 min TTL). Error responses NOT cached (immediate retry).
```

---

### 5. API Contract: Pagination Missing

**Current State:** No pagination mentioned.

**Finding:** ⚠️ MINOR — If shipper has 100+ active loads, API returns unbounded list.

**Recommendation:**

```markdown
### API CONTRACT: PAGINATION (ADD)

**Query Parameters:**

| Param | Type | Default | Max | Purpose |
|---|---|---|---|---|
| `limit` | integer | 20 | 100 | Max results per page |
| `offset` | integer | 0 | — | Start position (0-based) |
| `sort` | string | status | — | Sort field: status, updated_at, destination |
| `order` | string | asc | — | asc or desc |

**Request Example:**
```
GET /api/v1/shipper/shipments/active?limit=20&offset=0&sort=status&order=asc
```

**Response (200 OK):**
```json
{
  "data": [
    { "loadId": "LOAD-3011", "status": "IN_TRANSIT", ... },
    { "loadId": "LOAD-3012", "status": "CLAIMED", ... }
  ],
  "pagination": {
    "total": 47,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

**Constraint:** Status-First sorting applies: POSTED → CLAIMED → PICKED_UP → IN_TRANSIT → DELIVERED (within each status, sort by updated_at DESC).

**Frontend Behavior:**
- Initial load: ?limit=20&offset=0
- Infinite scroll: Fetch next 20 when user scrolls to bottom
- Manual pagination: User selects page size and page number
```

---

### 6. Sorting Logic: "Status-First" Not Guaranteed

**Current State:**
```
Directives: "Implement 'Status-First' logic in the database query (ORDER BY urgency enum)."
```

**Finding:** ⚠️ MINOR — Directive is present but API contract doesn't guarantee order.

**Recommendation:**

```markdown
### API CONTRACT: SORT ORDER GUARANTEE (UPDATE)

**Response Field Addition:**

Add `_metadata` to response:
```json
{
  "data": [ ... ],
  "pagination": { ... },
  "_metadata": {
    "sortedBy": "status_priority",
    "statusOrder": ["POSTED", "PICKED_UP", "CLAIMED", "IN_TRANSIT", "DELIVERED"],
    "secondarySort": "updated_at DESC"
  }
}
```

**Database Query (PostgreSQL):**
```sql
SELECT l.id, l.status, l.equipment_type, l.carrier_id, l.destination_city, ...
FROM loads l
LEFT JOIN carriers c ON l.carrier_id = c.id
WHERE l.tenant_id = $1
  AND l.deleted_at IS NULL
  AND l.status NOT IN ('CANCELLED', 'FAILED')  -- Exclude completed/failed loads
ORDER BY 
  CASE l.status
    WHEN 'POSTED' THEN 1       -- Urgent (0% progress)
    WHEN 'CLAIMED' THEN 2      -- High priority
    WHEN 'PICKED_UP' THEN 3    -- Active transit
    WHEN 'IN_TRANSIT' THEN 4   -- Normal transit
    WHEN 'DELIVERED' THEN 5    -- Completed (idle)
  END ASC,
  l.updated_at DESC
LIMIT $2 OFFSET $3;
```

**Constraint:** CODER MUST implement this ORDER BY logic. Do not return unsorted results.
```

---

### 7. Join Type Clarity: INNER vs LEFT

**Current State:**
```
Carrier Name | carrier | Via `loads.carrier_id` JOIN
```

**Finding:** ⚠️ MINOR — "JOIN" is ambiguous. Should be LEFT JOIN (carrier_id nullable).

**Recommendation:**

```markdown
### FIELD CONTRACT: JOIN TYPES (CLARIFY)

| UI Field | JOIN Type | Rationale | SQL |
|---|---|---|---|
| Load ID | N/A (from loads) | Primary table | `loads.id` |
| Status | N/A | Primary table | `loads.status` |
| Progress | N/A | Calculated | `TransitProgressCalculator.calculate(load)` |
| Equipment | N/A | Primary table | `loads.equipment_type` |
| Carrier Name | **LEFT JOIN** | Nullable: unassigned loads (carrier_id NULL) | `LEFT JOIN carriers c ON l.carrier_id = c.id` → `c.name` |
| Rating | **LEFT JOIN** | Nullable: no ratings yet | `LEFT JOIN ratings r ON c.id = r.rated_entity_id AND r.entity_type = 'CARRIER'` → `AVG(r.score)` |
| Destination | N/A | Primary table | `loads.destination_city` |

**Constraint:** LEFT JOIN ensures unassigned loads (carrier_id=NULL) appear in results with carrier/rating as NULL, not excluded.

**Important:** If INNER JOIN used, unassigned loads disappear (violates AC-1: "see all active shipments").
```

---

### 8. Multi-Tenancy Verification: Carrier Data Isolation

**Current State:**
```
Persistence: Use `TenantContextHolder` to resolve tenant context.
```

**Finding:** ⚠️ MINOR — TenantContextHolder applied to loads but not verified for carrier lookup.

**Recommendation:**

```markdown
### MULTI-TENANCY: CARRIER ISOLATION VERIFICATION (REQUIRED)

**Question:** Can a shipper from Tenant A see carriers from Tenant B?

**Current Logic:**
- Loads filtered by `TenantContextHolder`: ✅ Secure
- Carriers: LEFT JOIN on `loads.carrier_id` — Inherited tenant isolation ✅ Secure (if no direct carrier query)

**Risk:** If ShipmentStatusService queries `CarrierReputationService` separately, it might not pass tenant context.

**Verification Needed:**

```java
// ShipmentStatusService.getActiveShipments()
public List<ShipmentDTO> getActiveShipments() {
    String tenantId = TenantContextHolder.getTenantId();  // ✅ Captured
    
    List<Load> loads = loadRepository.findActiveLoadsByTenant(tenantId);
    
    return loads.stream()
        .map(load -> {
            // RISK: Does CarrierReputationService respect tenant?
            CarrierReputation rep = carrierReputationService.getReputation(load.getCarrierId());
            //                                                           ^ Does this use TenantContextHolder?
            return new ShipmentDTO(load, rep);
        })
        .collect(Collectors.toList());
}
```

**Requirement:** CarrierReputationService must filter by current tenant when querying ratings. Do not expose cross-tenant carrier data.

**Verification Checklist:**
- [ ] CarrierReputationService uses TenantContextHolder or accepts tenantId parameter
- [ ] No direct SQL `SELECT * FROM carriers` without tenant filter
- [ ] Ratings joined only for carriers visible to current tenant
- [ ] Test: Shipper A cannot see ratings or names of Shipper B's carriers
```

---

### 9. Service Interface Not Defined

**Current State:**
```
Domain Model Diagram: ShipmentStatusService → getActiveShipments()
But no interface or method signature provided.
```

**Finding:** ⚠️ MINOR — CODER has no contract.

**Recommendation:**

```markdown
### SHIPMENTSTATUSSERVICE INTERFACE (ADD)

**Service Interface Contract:**

```java
package com.freightclub.shipper.service;

import com.freightclub.shipper.dto.ShipmentDTO;
import com.freightclub.load.entity.Load;

public interface ShipmentStatusService {
    
    /**
     * Retrieves all active shipments for the current shipper/tenant.
     *
     * AC-1: Display Active Shipments List
     * AC-6: Monitor Business Metrics
     *
     * @param limit Max results (1-100)
     * @param offset Starting position (0-based)
     * @return Paginated list of active shipments, ordered by status urgency
     * @throws ShipperNotAuthorizedException if not authenticated
     * @throws InternalServerException if DB query fails
     */
    Page<ShipmentDTO> getActiveShipments(int limit, int offset);
    
    /**
     * Searches active shipments by Load ID, destination, or carrier name.
     *
     * AC-3: Search & Filter Shipments
     *
     * @param query Search term (case-insensitive)
     * @return List of matching shipments
     * @throws InvalidSearchException if query is too short (<2 chars)
     */
    List<ShipmentDTO> searchShipments(String query);
    
    /**
     * Refreshes the cached shipments list (invalidates cache).
     * Called when a shipment status is updated.
     *
     * NFR-504: Cache invalidation trigger
     */
    void invalidateCache();
}
```

**Implementation Details for CODER:**
- Use Spring `@Service` annotation
- Inject `LoadRepository`, `CarrierReputationService`, `TransitProgressCalculator`
- Use `@Cacheable("shipper:shipments:active:{tenantId}")` for getActiveShipments()
- Use `@CacheEvict` in invalidateCache() method
- Test in isolation: Mock dependencies, test business logic
```

---

### 10. Caching Invalidation Mechanism Not Specified

**Current State:**
```
Caching Strategy: "Invalidation: Trigger on any load status update or new load creation."
```

**Finding:** ⚠️ MINOR — HOW? Event-driven, AOP, manual?

**Recommendation:**

```markdown
### CACHING INVALIDATION: MECHANISM (CLARIFY)

**Strategy: Event-Driven (Recommended)**

**Architecture:**
```
LoadStatusUpdateEvent (published)
    ↓
CacheInvalidationListener (subscribes)
    ↓
ShipmentStatusService.invalidateCache()
    ↓
Spring Cache.evict("shipper:shipments:active:{tenantId}")
```

**Implementation Options:**

**Option A: Spring Events (Recommended)**
```java
// In LoadService when status changes
@Transactional
public void updateLoadStatus(Load load, LoadStatus newStatus) {
    load.setStatus(newStatus);
    loadRepository.save(load);
    
    // Publish event
    applicationEventPublisher.publishEvent(
        new LoadStatusChangedEvent(load.getId(), load.getTenantId(), newStatus)
    );
}

// In ShipmentStatusService
@EventListener
@CacheEvict(value = "shipper:shipments:active", key = "#event.tenantId")
public void onLoadStatusChanged(LoadStatusChangedEvent event) {
    // Cache evicted automatically by @CacheEvict
}
```

**Option B: Message Queue (for distributed systems)**
- Publish to Kafka/RabbitMQ on status change
- Separate listener service subscribes and invalidates cache
- Better for microservices; overkill for current monolith

**Option C: Time-Based TTL Only (Current)**
- Cache expires after 1 minute regardless
- Simple but delayed visibility (up to 1 min stale data)
- Acceptable per NFR-504 (real-time monitoring not critical)

**Recommendation:** Combine Option A (event-driven) + Option C (1-min TTL fallback).
- Immediate invalidation on update (via event)
- Fallback to auto-expire if event lost (safety net)

**CODER Implementation:**
- [ ] Define `LoadStatusChangedEvent` class
- [ ] Publish event from `LoadService` (or `@PostUpdate` on Load entity)
- [ ] Define `@EventListener` method in `ShipmentStatusService`
- [ ] Configure `@EnableCaching` in Spring config
- [ ] Test: Verify cache is invalidated when load status changes
```

---

### 11. Soft Delete Filtering: SQL Example Missing

**Current State:**
```
Directives: "All queries must filter by `deleted_at IS NULL`."
```

**Finding:** ⚠️ MINOR — No SQL example provided.

**Recommendation:**

```markdown
### SOFT DELETE FILTERING: SQL EXAMPLES (ADD)

**Repository Method Signature:**

```java
public interface LoadRepository extends JpaRepository<Load, String> {
    
    /**
     * Fetches all active (not deleted) loads for a tenant, ordered by status priority.
     *
     * @param tenantId The tenant ID
     * @return Sorted list of loads (deleted_at IS NULL)
     */
    @Query("""
        SELECT l FROM Load l
        WHERE l.tenantId = :tenantId
          AND l.deletedAt IS NULL
        ORDER BY CASE l.status
                   WHEN 'POSTED' THEN 1
                   WHEN 'CLAIMED' THEN 2
                   WHEN 'PICKED_UP' THEN 3
                   WHEN 'IN_TRANSIT' THEN 4
                   WHEN 'DELIVERED' THEN 5
                 END,
                 l.updatedAt DESC
    """)
    List<Load> findActiveLoadsByTenant(@Param("tenantId") String tenantId);
    
    /**
     * Soft-delete a load (set deleted_at = CURRENT_TIMESTAMP).
     * Does NOT delete from DB, preserves audit trail.
     *
     * @param loadId The load to delete
     */
    @Modifying
    @Query("UPDATE Load l SET l.deletedAt = CURRENT_TIMESTAMP WHERE l.id = :loadId")
    void softDeleteLoad(@Param("loadId") String loadId);
}
```

**Important:** Every repository method querying loads MUST include `AND l.deletedAt IS NULL`. Do not skip.

**Verification:** Code review must check all findBy* methods include soft delete constraint.
```

---

## Summary Table

| Finding | Category | Severity | Status | Action |
|---|---|---|---|---|
| Status enum mismatch (OPEN vs POSTED) | Critical Logic | 🔴 BLOCKING | ❌ Unresolved | Clarify with DB team before CODER starts |
| Progress calculation undefined | Critical Logic | 🔴 BLOCKING | ❌ Unresolved | Define algorithm (0%→100% mapping) |
| TransitProgressCalculator placement | Critical Design | 🔴 BLOCKING | ❌ Unresolved | Specify service layer + interface |
| Error handling missing | API Contract | 🟡 Minor | ⚠️ Deferred | Add 401, 403, 404, 500 to response spec |
| Pagination missing | API Contract | 🟡 Minor | ⚠️ Deferred | Add limit/offset query params |
| Sorting order not guaranteed | API Contract | 🟡 Minor | ⚠️ Deferred | Add ORDER BY to API contract |
| Join type ambiguous | Database | 🟡 Minor | ⚠️ Deferred | Clarify LEFT JOIN for nullable fields |
| Multi-tenancy not verified | Security | 🟡 Minor | ⚠️ Deferred | Verify CarrierReputationService respects tenant |
| Service interface undefined | Code Quality | 🟡 Minor | ⚠️ Deferred | Define ShipmentStatusService interface |
| Cache invalidation HOW? | Architecture | 🟡 Minor | ⚠️ Deferred | Recommend event-driven + TTL fallback |
| Soft delete SQL missing | Database | 🟡 Minor | ⚠️ Deferred | Provide repository method examples |

---

## ARCHITECT Sign-Off Status

**Current:** ✅ APPROVED FOR HFD (per spec §ARCHITECT Sign-Off)

**Revised (after audit):** 🟡 **CONDITIONALLY APPROVED FOR CODER**

**Blockers for CODER:**
1. Resolve status enum mismatch (OPEN vs POSTED)
2. Define progress calculation algorithm
3. Specify TransitProgressCalculator placement + interface

**Minor Enhancements (can proceed in parallel):**
- Add error responses to API contract
- Add pagination spec
- Clarify sorting order guarantee
- Verify multi-tenancy for carrier data
- Define service interface
- Specify cache invalidation mechanism
- Provide soft delete SQL examples

---

## Recommendations

### PRIORITY 1: RESOLVE BLOCKERS (Before CODER)

1. **Status Enum Clarification**
   - Action: Query production DB schema for `loads.status` enum values
   - Owner: ARCHITECT or DBA
   - Deadline: Before CODER handoff
   - Verification: Confirm 5 values match BA story + HFD spec

2. **Progress Calculation Algorithm**
   - Action: ARCHITECT provides explicit formula (0%→100% mapping per status)
   - Owner: ARCHITECT
   - Deadline: Before CODER handoff
   - Deliverable: Algorithm document + edge case handling

3. **TransitProgressCalculator Placement**
   - Action: Specify service layer, interface, dependencies
   - Owner: ARCHITECT
   - Deadline: Before CODER handoff
   - Deliverable: Interface definition + test strategy

### PRIORITY 2: ENHANCE API CONTRACT (Can proceed in parallel)

4. **Error Response Documentation**
   - Add 401, 403, 404, 500 responses
   - Include error code + message format
   - Timeline: Within 1 day

5. **Pagination Specification**
   - Add limit/offset/sort/order query params
   - Include response format (data[] + pagination metadata)
   - Timeline: Within 1 day

6. **Sorting Guarantee**
   - Update API contract to specify ORDER BY clause
   - Document status-first priority
   - Timeline: Within 1 day

### PRIORITY 3: VERIFY SECURITY & DESIGN (Code Review)

7. **Multi-Tenancy Verification**
   - Audit CarrierReputationService for tenant context
   - Verify no cross-tenant data leakage
   - Timeline: As part of CODER review

8. **Service Interface Definition**
   - Define ShipmentStatusService interface
   - Include method signatures + exceptions
   - Timeline: Within 1 day

9. **Cache Invalidation Mechanism**
   - Recommend event-driven + TTL strategy
   - Provide implementation options
   - Timeline: Within 1 day

10. **Soft Delete SQL Examples**
    - Provide repository method signatures
    - Document soft delete constraints
    - Timeline: Within 1 day (for CODER reference)

---

## Approval Recommendation

**Current Status:** 🟡 **CONDITIONALLY APPROVED FOR CODER**

**Conditions:**
1. ✅ Resolve 3 blockers (status enum, progress algo, service placement)
2. ✅ ARCHITECT to provide revised design doc with blockers resolved
3. ✅ Minor enhancements can proceed in parallel with CODER work

**Timeline:**
- **Day 1:** ARCHITECT resolves blockers
- **Day 2:** CODER begins implementation (if blockers resolved)
- **Day 2–3:** CODER and ARCHITECT collaborate on minor enhancements (pagination, error handling, etc.)

**Next Audit:** Re-audit revised ARCHITECT design after blockers addressed.

---

**Prepared By:** Code Reviewer  
**Date:** 2026-06-15  
**Authority:** ARCHITECT.md + CLAUDE.md + REVIEWER.md  
**Status:** 🟡 CONDITIONALLY APPROVED — AWAITING BLOCKER RESOLUTION
