# Implementation Plan: Command Center Dashboard KPIs (DDD)

**Status:** Ready for Review  
**Effort:** 8 days  
**Test Coverage:** 50 tests  
**Architecture:** Domain-Driven Design (Clean Architecture)

---

## 1. Domain Model Design

### 1.1 Domain Entities & Value Objects

New domain classes in `/modules/shipper/domain/`:

```
ShipperDashboard (Root Aggregate)
├── DeliveryMetrics (Value Object)
│   ├── activeShipmentCount: NonNegativeInteger
│   ├── onTimeRate: Percentage (0-100)
│   └── costPerMile: Money
├── ShipmentStatus (Value Object)
│   ├── status: LoadStatus enum
│   └── count: NonNegativeInteger
└── TenantId (Value Object)
    └── value: String

OnTimeRateCalculator (Domain Service)
├── calculate(deliveredLoads: List<Load>): Percentage
├── Invariant: onTime ≤ total (NaN if total = 0)
└── Null-safety: ignores loads without deliveredAt

CostPerMileCalculator (Domain Service)
├── calculate(deliveredLoads: List<Load>): Money
├── Handles PER_MILE and FLAT_RATE normalization
├── Invariant: payRate > 0, distanceMiles > 0
└── Null-safety: excludes incomplete loads

ShipmentCountAggregator (Domain Service)
├── countActive(tenantId): Long
├── countByStatus(tenantId, status): Long
└── Respects soft-delete semantics (deletedAt IS NULL)
```

**Reuse from existing domain:**
- LoadStatus, PayRateType, Money, LoadAggregate (read-only references)
- TenantId pattern from security layer

### 1.2 Invariants & Business Rules

| Rule | Constraint | Enforcement |
|------|-----------|--------------|
| **Active Shipments** | Sum of OPEN + CLAIMED + IN_TRANSIT only | Domain service |
| **On-Time Rate** | (onTime / total) × 100; returns 0 if total=0 | Calculator logic |
| **Cost/Mile** | avg(rate/distance); FLAT_RATE normalized by dividing payRate/distance | Calculator logic |
| **Soft-Delete Aware** | deletedAt IS NULL for all counts | Repository port spec |
| **Tenant Isolation** | All queries scoped to tenantId from TenantContextHolder | Application service |
| **Decimal Precision** | 2 decimals for currency, 1 decimal for percentage | Value objects |

---

## 2. Repository Port Design

**Location:** `/modules/shipper/application/ports/out/ShipmentDashboardRepository.java`

```java
/**
 * Port interface for dashboard data access.
 * No Spring dependencies - pure contract definition.
 */
public interface ShipmentDashboardRepository {
    
    /**
     * Count active (non-terminal) shipments for tenant.
     * Status: OPEN, CLAIMED, IN_TRANSIT (excludes DELIVERED, CANCELLED)
     * 
     * @param tenantId From TenantContextHolder
     * @return Count of active shipments, respects soft-delete
     */
    long countActiveShipments(String tenantId);
    
    /**
     * Fetch delivered shipments with required fields only (projection).
     * Used for KPI calculations (on-time rate, cost/mile).
     * 
     * @param tenantId From TenantContextHolder
     * @return List of delivered shipment projections (minimal columns)
     */
    List<DeliveredShipment> findDeliveredShipmentsForTenant(String tenantId);
    
    /**
     * Bulk count by status (optional for future filtering UI).
     * 
     * @param tenantId From TenantContextHolder
     * @return Map of status → count
     */
    Map<LoadStatus, Long> countByStatus(String tenantId);
}

/**
 * Lightweight projection for delivered shipments.
 * Only includes fields required for KPI calculations.
 */
record DeliveredShipment(
    String id,
    LocalDateTime deliveredAt,
    LocalDateTime deliveryTo,
    BigDecimal payRate,
    PayRateType payRateType,
    BigDecimal distanceMiles
) {}
```

### Query Optimization Strategy

- **Use Spring Data projections** to avoid N+1 (fetch only required fields)
- **Single COUNT query** for active shipments (database-level aggregation)
- **Single SELECT with projection** for delivered loads (one round-trip)
- **Avoid eager loading** — use lightweight DTOs instead of full entities
- **No pagination needed** — must aggregate across all delivered loads

---

## 3. Application Service Design

**Location:** `/modules/shipper/application/GetDashboardSummaryUseCase.java`

```java
/**
 * Use case for retrieving shipper dashboard KPI summary.
 * Orchestrates: repository queries → domain calculations → response assembly.
 */
@Service
public class GetDashboardSummaryUseCase {
    
    private final ShipmentDashboardRepository dashboardRepository;
    private final OnTimeRateCalculator onTimeCalculator;
    private final CostPerMileCalculator costCalculator;
    
    /**
     * Main use case method.
     * 
     * Flow:
     * 1. Get tenant ID from security context
     * 2. Fetch active shipment count (cached)
     * 3. Fetch delivered shipments with projections
     * 4. Invoke domain calculators (pure logic)
     * 5. Assemble response DTO
     * 
     * @return DashboardSummaryResponse with 3 KPI metrics
     * @throws DashboardQueryException if database access fails
     */
    public DashboardSummaryResponse getSummary() throws DashboardQueryException {
        String tenantId = TenantContextHolder.getTenantId();
        
        try {
            // Step 1: Fetch active shipment count
            long activeCount = dashboardRepository.countActiveShipments(tenantId);
            
            // Step 2: Fetch delivered shipments (projection only)
            List<DeliveredShipment> delivered = 
                dashboardRepository.findDeliveredShipmentsForTenant(tenantId);
            
            // Step 3: Domain calculations (pure logic, no I/O)
            Percentage onTimeRate = onTimeCalculator.calculate(delivered);
            Money costPerMile = costCalculator.calculate(delivered);
            
            // Step 4: Build response DTOs (defensive copy)
            return new DashboardSummaryResponse(
                new DashboardSummaryResponse.Metric(activeCount, null, "Active Shipments"),
                new DashboardSummaryResponse.Metric(costPerMile.getAmount(), "$", "Est. Cost/Mile"),
                new DashboardSummaryResponse.Metric(onTimeRate.getValue(), "%", "On-Time Rate")
            );
        } catch (Exception e) {
            throw new DashboardQueryException("Failed to fetch dashboard summary", e);
        }
    }
}

/**
 * Custom exception for dashboard query failures.
 * No Spring dependencies — pure domain exception.
 */
public class DashboardQueryException extends RuntimeException {
    public DashboardQueryException(String msg, Throwable cause) {
        super(msg, cause);
    }
}
```

### Error Handling Strategy

- **Repository errors** → wrapped in DashboardQueryException (non-retryable)
- **Calculator errors** (division by zero, null data) → handled within domain logic (returns safe defaults)
- **TenantContextHolder errors** → propagate (indicates auth failure upstream)
- **Response format**: 500 Internal Server Error with generic message (security principle)

---

## 4. Infrastructure Layer

**Location:** `/modules/shipper/infrastructure/persistence/ShipmentDashboardRepositoryImpl.java`

```java
/**
 * JPA implementation of ShipmentDashboardRepository port.
 * Handles Spring/database-specific concerns:
 * - EntityManager queries
 * - @Cacheable decorators
 * - Query optimization via native SQL
 * - Cache invalidation on load events
 */
@Repository
public class ShipmentDashboardRepositoryImpl implements ShipmentDashboardRepository {
    
    private final EntityManager em;
    
    @Override
    @Cacheable(cacheNames = "dashboard-active-count", key = "#tenantId")
    public long countActiveShipments(String tenantId) {
        // JPQL with explicit tenant filter + soft-delete check
        return (long) em.createQuery(
            "SELECT COUNT(l) FROM Load l " +
            "WHERE l.tenantId = :tenantId " +
            "AND l.status IN ('OPEN', 'CLAIMED', 'IN_TRANSIT') " +
            "AND l.deletedAt IS NULL"
        )
        .setParameter("tenantId", tenantId)
        .getSingleResult();
    }
    
    @Override
    @Cacheable(cacheNames = "dashboard-delivered", key = "#tenantId")
    public List<DeliveredShipment> findDeliveredShipmentsForTenant(String tenantId) {
        // Native SQL projection (more efficient for this shape)
        // Only fetches required columns; full entity hydration avoided
        return em.createNativeQuery(
            "SELECT id, delivered_at, delivery_to, pay_rate, pay_rate_type, distance_miles " +
            "FROM loads " +
            "WHERE tenant_id = :tenantId " +
            "AND status = 'DELIVERED' " +
            "AND deleted_at IS NULL",
            DeliveredShipment.class
        )
        .setParameter("tenantId", tenantId)
        .getResultList();
    }
    
    @Override
    @Cacheable(cacheNames = "dashboard-status-counts", key = "#tenantId")
    public Map<LoadStatus, Long> countByStatus(String tenantId) {
        @SuppressWarnings("unchecked")
        List<Object[]> results = em.createQuery(
            "SELECT l.status, COUNT(l) FROM Load l " +
            "WHERE l.tenantId = :tenantId AND l.deletedAt IS NULL " +
            "GROUP BY l.status"
        )
        .setParameter("tenantId", tenantId)
        .getResultList();
        
        return results.stream()
            .collect(Collectors.toMap(
                row -> (LoadStatus) row[0],
                row -> (Long) row[1]
            ));
    }
    
    /**
     * Cache invalidation: triggered by load lifecycle events.
     * Subscribes to LoadStatusChangedEvent (published by LoadApplicationService).
     */
    @EventListener
    @CacheEvict(cacheNames = {
        "dashboard-active-count",
        "dashboard-delivered",
        "dashboard-status-counts"
    }, allEntries = true)
    public void onLoadStatusChanged(LoadStatusChangedEvent event) {
        // Event-driven invalidation: no stale cache entries
    }
}
```

### Caching Strategy

- **@Cacheable** on both major methods with `tenantId` key
- **TTL:** 5 minutes (configurable in application.yml)
- **Eviction:** Event-driven via LoadStatusChangedEvent
- **Fallback:** Cache miss → query database (no cascading failures)

### Database Indexes (Flyway Migration)

```sql
-- Supports both countActiveShipments() and countByStatus() queries
CREATE INDEX idx_loads_tenant_status_soft_delete 
ON loads(tenant_id, status, deleted_at);

-- Supports findDeliveredShipmentsForTenant() query
-- (same index, filtered at status='DELIVERED')
```

---

## 5. API Endpoint Design

**Location:** `/modules/shipper/infrastructure/rest/DashboardController.java`

```java
/**
 * REST endpoint for dashboard KPI summary.
 * Exposes application service via HTTP.
 */
@RestController
@RequestMapping("/api/v1/shipper")
@PreAuthorize("hasRole('SHIPPER')")
public class DashboardController {
    
    private final GetDashboardSummaryUseCase useCase;
    
    /**
     * GET /api/v1/shipper/dashboard-summary
     * 
     * Returns aggregated KPI metrics for shipper dashboard.
     * Cached server-side (5 min) and client-side (HTTP cache headers).
     * 
     * @return DashboardSummaryResponse { activeShipments, costPerMile, onTimeRate }
     */
    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        var response = useCase.getSummary();
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic())
            .body(response);
    }
}
```

### Response Contract

```java
record DashboardSummaryResponse(
    Metric activeShipments,
    Metric estimatedCostPerMile,
    Metric onTimeCarrierPct
) {
    record Metric(double value, String unit, String label) {}
}
```

**Example Response:**
```json
{
  "activeShipments": { "value": 12, "unit": null, "label": "Active Shipments" },
  "estimatedCostPerMile": { "value": 2.45, "unit": "$", "label": "Est. Cost/Mile" },
  "onTimeCarrierPct": { "value": 94.5, "unit": "%", "label": "On-Time Rate" }
}
```

### HTTP Caching Headers

- `Cache-Control: public, max-age=300` (5 minutes, public caches allowed)
- `ETag`: Optional (based on metric hash for validation)
- `Vary: Authorization` (prevent cross-tenant cache leaks)

---

## 6. Implementation Sequence

| Phase | Task | Dependencies | Effort | Tests |
|-------|------|--------------|--------|-------|
| **1** | Domain value objects (Money, Percentage) | None | 1d | Unit (8) |
| **2** | Domain calculators (OnTime, CostPerMile) | Phase 1 | 1d | Unit (16) |
| **3** | Repository port interface design | Phase 2 | 0.5d | N/A |
| **4** | Repository implementation (JPA) | Phase 3 | 1.5d | Integration (6) |
| **5** | Application service (use case) | Phase 2, 4 | 1d | Unit (12) |
| **6** | REST endpoint (controller) | Phase 5 | 0.5d | Integration (4) |
| **7** | Caching + cache invalidation | Phase 4, 6 | 1d | Integration (4) |
| **8** | Database indexes + smoke tests | Phase 4 | 0.5d | Performance |
| **TOTAL** | | | **8 days** | **50 tests** |

### Testing Strategy

**Unit Tests (28 tests):**
- 8 tests: OnTimeRateCalculator
  - Happy path: 80% on-time (16 of 20 delivered)
  - Edge cases: 0 loads (return 0), all on-time (100%), all late (0%)
  - Null handling: ignore loads without deliveredAt
  
- 8 tests: CostPerMileCalculator
  - Happy path: 3 loads @ $2/mile avg
  - FLAT_RATE normalization: divide payRate by distance
  - Edge cases: 0 loads (return $0), single load
  - Null handling: exclude incomplete loads
  
- 12 tests: GetDashboardSummaryUseCase
  - Happy path: all services succeed
  - TenantContextHolder isolation: different tenants get different data
  - Error handling: repository failure → DashboardQueryException

**Integration Tests (14 tests):**
- 6 tests: ShipmentDashboardRepositoryImpl
  - countActiveShipments: correct COUNT(*)
  - findDeliveredShipmentsForTenant: correct projection shape
  - countByStatus: GROUP BY results
  - Soft-delete filtering: exclude deletedAt IS NOT NULL
  - Tenant isolation: different tenants isolated
  - Query optimization: verify no N+1 in logs
  
- 4 tests: DashboardController
  - HTTP 200 response
  - Response body shape matches contract
  - Cache-Control headers present
  - Authentication enforced (@PreAuthorize)
  
- 4 tests: Cache invalidation
  - @Cacheable respected (same tenant, two calls → 1 query)
  - Event eviction: LoadStatusChangedEvent clears cache
  - Fallback: cache miss → queries database
  - TTL expiration: manually expire, verify re-fetch

**Performance Tests (8 tests):**
- Query execution time: <50ms average
- Cache hit rate: >80% (dashboard loaded frequently)
- No N+1 queries (verified via SQL logging)
- Memory footprint: <1MB for 10K delivered loads (projection only)

---

## 7. Migration Path (Zero-Downtime Deployment)

### Phase A: Parallel Deployment
- Deploy new DashboardController on `/api/v1/shipper/dashboard-summary`
- Keep old endpoint at `/api/v1/shipper/legacy/dashboard` (redirect)
- A/B test with feature flag: `FEATURE_NEW_DASHBOARD_ENDPOINT=true`

### Phase B: Cutover
- Update frontend to call new endpoint (once validated in staging)
- Monitor old endpoint usage (should drop to 0%)

### Phase C: Cleanup
- After 1-2 release cycles: delete old DashboardSummaryService.java
- Archive test file in git history

### Backward Compatibility
- ✓ Response DTO is **identical** (DashboardSummaryResponse)
- ✓ Endpoint URL is **new** (/v1/shipper/dashboard-summary)
- ✓ No breaking changes to frontend

---

## 8. Architecture Diagrams

### High-Level DDD Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│              DashboardController (@RestController)           │
│           GET /api/v1/shipper/dashboard-summary              │
└────────────────────┬────────────────────────────────────────┘
                     │ DashboardSummaryResponse
                     │
┌────────────────────┴────────────────────────────────────────┐
│               APPLICATION LAYER (Orchestration)              │
│            GetDashboardSummaryUseCase @Service               │
│  - Coordinates domain + repository calls                     │
│  - Manages TenantContextHolder                              │
│  - Error handling (DashboardQueryException)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼ (domain services)       ▼ (ports)
┌──────────────────────┐   ┌──────────────────────────┐
│   DOMAIN LAYER       │   │  APPLICATION PORTS       │
│ (Zero Spring deps)   │   │  (Interfaces only)       │
│                      │   │                          │
│ • OnTimeRateCalc     │   │ ShipmentDashboardRepo    │
│ • CostPerMileCalc    │   │ - countActiveShipments() │
│ • DeliveryMetrics    │   │ - findDeliveredShipments │
│ • Value Objects      │   │ - countByStatus()        │
└──────────────────────┘   └──────────────┬───────────┘
                                          │
                           ┌──────────────┴─────────────────┐
                           │                                │
                           ▼ (implements ports)            │
        ┌──────────────────────────────────────────┐       │
        │     INFRASTRUCTURE LAYER (Spring)        │       │
        │                                          │       │
        │ ShipmentDashboardRepositoryImpl @Repo     │       │
        │ - JPA queries via EntityManager          │       │
        │ - @Cacheable (Redis/Caffeine)            │       │
        │ - Index optimization                     │       │
        │                                          │       │
        │ SpringDataLoadRepository (legacy)        │       │
        └──────────────────────────────────────────┘       │
                           │                                │
                           ▼                                │
        ┌──────────────────────────────────────────┐       │
        │         PERSISTENCE LAYER (PostgreSQL)   │       │
        │                                          │       │
        │ loads table (RLS via app.current_tenant) │       │
        │ Indexes: tenant_id+status+deleted_at     │       │
        └──────────────────────────────────────────┘       │
```

### Sequence Diagram: Get Dashboard Summary

```
Frontend          Controller          UseCase           Domain           Repository      Database
   │                 │                   │                │                  │              │
   ├─ GET /api/v1───>│                   │                │                  │              │
   │                 │                   │                │                  │              │
   │                 ├─getSummary()────>│                 │                  │              │
   │                 │                   │                │                  │              │
   │                 │                   ├─ getTenantId()─┤ (from ThreadLocal)
   │                 │                   │                │                  │              │
   │                 │                   ├─countActive()──────────────────>│ SELECT COUNT │
   │                 │                   │                │                  ├─────────────>│
   │                 │                   │                │                  │<──xxxxxx────┤
   │                 │                   │<────(result)───────────────────┤              │
   │                 │                   │                │                  │              │
   │                 │                   ├─findDelivered()────────────────>│ SELECT ... │
   │                 │                   │                │                  ├─────────────>│
   │                 │                   │                │                  │<──yyyyyyy───┤
   │                 │                   │<────(delivery list)───────────┤              │
   │                 │                   │                │                  │              │
   │                 │                   ├─ onTimeRate.calculate(list)──>│ (pure logic) │
   │                 │                   │<────(percentage)─────────┤       │              │
   │                 │                   │                │        │        │              │
   │                 │                   ├─ costPerMile.calculate(list)>│ (pure logic)  │
   │                 │                   │<────(money)───────────┤        │              │
   │                 │                   │                │        │       │              │
   │                 │<─DashboardSummaryResponse────────┤        │       │              │
   │                 │                   │                │        │       │              │
   │<─ 200 OK────────┤                   │                │        │       │              │
   │ (JSON)          │                   │                │        │       │              │
```

---

## 9. Risk & Mitigation Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **N+1 query problem** | High | Medium | Use projections in repo; integration tests verify query count |
| **Unbounded delivered load fetch** | Medium | High | Add reasonable LIMIT; test with 10K+ loads in staging |
| **Cache invalidation miss** | High | Medium | Event-driven eviction + 5-min TTL fallback |
| **Soft-delete inclusion bug** | High | High | `deletedAt IS NULL` in all queries; unit tests for edge cases |
| **Tenant context leaks** | Medium | Critical | TenantContextHolder.clear() in filter finally-block |
| **Division by zero in calculators** | Low | High | Domain tests for empty load list; return 0 for NaN |
| **Index missing on production** | Low | High | Pre-create in Flyway V### migration |
| **Spring import in domain** | High | Medium | SonarQube quality gate rule |

### Mitigation Actions

- Add SonarQube rule: "No Spring imports in `/domain/`"
- Load test with 10,000+ delivered loads per tenant
- Chaos test: kill cache, verify fallback to DB works
- Mutation testing: ensure domain calculators handle edge cases

---

## 10. Critical Files to Create

```
domain/
  ├── DeliveryMetrics.java (value object)
  ├── OnTimeRateCalculator.java (domain service)
  └── CostPerMileCalculator.java (domain service)

application/
  ├── ports/out/ShipmentDashboardRepository.java (port interface)
  ├── GetDashboardSummaryUseCase.java (orchestration service)
  └── DashboardQueryException.java (domain exception)

infrastructure/
  ├── persistence/ShipmentDashboardRepositoryImpl.java (JPA impl)
  ├── rest/DashboardController.java (HTTP endpoint)
  └── event/LoadStatusChangedEventListener.java (cache invalidation)

resources/db/migration/
  └── V###__create_dashboard_indexes.sql (Flyway)

test/java/com/freightclub/modules/shipper/
  ├── domain/OnTimeRateCalculatorTest.java (16 tests)
  ├── domain/CostPerMileCalculatorTest.java (16 tests)
  ├── application/GetDashboardSummaryUseCaseTest.java (12 tests)
  ├── infrastructure/ShipmentDashboardRepositoryImplTest.java (6 tests)
  ├── infrastructure/DashboardControllerTest.java (4 tests)
  └── infrastructure/DashboardCacheInvalidationTest.java (4 tests)
```

---

## 11. Dependencies & Imports

### Domain Layer (ZERO Spring)

```java
// Allowed:
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

// NOT allowed:
// NO: import org.springframework.*;
// NO: import jakarta.persistence.*;
// NO: import com.freightclub.infrastructure.*;
```

### Application Layer (Thin Spring Wrapper)

```java
// Allowed:
import org.springframework.stereotype.Service;
import com.freightclub.security.TenantContextHolder;
import com.freightclub.modules.shipper.domain.*;

// OK: Spring for orchestration, but business logic in domain
```

### Infrastructure Layer (Spring + JPA)

```java
// Allowed:
import org.springframework.data.jpa.repository.Query;
import org.springframework.cache.annotation.Cacheable;
import jakarta.persistence.EntityManager;
import com.freightclub.modules.shipper.application.ports.out.*;
```

---

## 12. Implementation Checklist

### Phase 1-2: Domain Layer
- [ ] Create `Money` value object (if not exists)
- [ ] Create `Percentage` value object
- [ ] Create `DeliveryMetrics` value object
- [ ] Implement `OnTimeRateCalculator` domain service
- [ ] Implement `CostPerMileCalculator` domain service
- [ ] Write 24 unit tests for calculators
- [ ] Code review: domain purity (no Spring imports)

### Phase 3: Port Design
- [ ] Define `ShipmentDashboardRepository` port interface
- [ ] Define `DeliveredShipment` projection record
- [ ] Code review: port contract clarity

### Phase 4: Infrastructure
- [ ] Implement `ShipmentDashboardRepositoryImpl`
- [ ] Write JPA queries (COUNT, projection SELECT)
- [ ] Configure @Cacheable decorators
- [ ] Create Flyway migration for indexes
- [ ] Write 6 integration tests
- [ ] Test query optimization (log SQL, verify no N+1)

### Phase 5: Application Service
- [ ] Implement `GetDashboardSummaryUseCase`
- [ ] Create `DashboardQueryException`
- [ ] Write 12 unit tests
- [ ] Test TenantContextHolder integration
- [ ] Test error handling

### Phase 6: API Endpoint
- [ ] Create `DashboardController`
- [ ] Add @PreAuthorize annotation
- [ ] Configure Cache-Control headers
- [ ] Write 4 integration tests

### Phase 7: Caching
- [ ] Implement `LoadStatusChangedEventListener`
- [ ] Test cache eviction on load update
- [ ] Test TTL fallback
- [ ] Write 4 cache-specific tests

### Phase 8: Testing & Deployment
- [ ] Run full test suite (50 tests)
- [ ] Verify code coverage (target: 85%)
- [ ] Load test: 10K delivered loads
- [ ] Performance test: <50ms response time
- [ ] Deploy to staging
- [ ] Smoke test in staging

---

## 13. Next Steps

1. **Review this plan** (check for assumptions, errors, missing pieces)
2. **Identify blockers** (dependencies on other features?)
3. **Prioritize phases** (start with domain, then infrastructure, then API)
4. **Assign tasks** (distribute across team)
5. **Create feature branch:** `feature/command-center-kpi-ddd`
6. **Begin Phase 1** (domain layer skeleton)

---

**Questions?** Review this doc, then we can discuss specific implementation details, data structures, or testing approaches.
