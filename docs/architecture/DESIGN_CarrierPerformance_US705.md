# Architectural Design: Carrier Performance Dashboard (US-705)

**Document:** Architecture Design Review  
**Story:** US-705 (Carrier Performance Metrics)  
**Architect:** Solution Architecture Team  
**Date:** 2026-04-27  
**Status:** ✅ DESIGN APPROVED

---

## Executive Summary

US-705 implements performance tracking for carriers: acceptance rates, on-time delivery, quality ratings, and shipper-specific metrics. The system records immutable performance events and pre-computes daily summaries for fast dashboard display.

**Key Design Patterns:**
- Immutable event recording (append-only)
- Pre-computed daily aggregates (refresh daily)
- Shipper-specific ratings (immutable audit trail)
- Multi-tenant isolation (RLS enforced)
- Time-series metrics (rolling 30/90-day windows)

---

## Domain Model

### CarrierPerformance (Immutable Event)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `carrierId` | VARCHAR(36) UUID | FK to User, NOT NULL |
| `tenantId` | VARCHAR(36) UUID | FK to Tenant, NOT NULL |
| `loadAssigned` | INT | Cumulative count (this record) |
| `loadAccepted` | INT | Cumulative count |
| `loadDeclined` | INT | Cumulative count |
| `acceptanceRate` | DECIMAL | Calculated percentage |
| `onTimeCount` | INT | Delivered on time |
| `lateCount` | INT | Delivered late |
| `onTimeRate` | DECIMAL | Percentage on-time |
| `avgDeliveryTime` | INT | Seconds |
| `qualityScore` | DECIMAL | 1.0-5.0 stars |
| `ratingCount` | INT | Number of ratings |
| `recordedAt` | TIMESTAMPTZ | When recorded |

**Invariants:**
- Immutable after creation
- One record per period/carrier
- Cumulative counts over time

### ShipperCarrierRating (Immutable Audit)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `carrierId` | VARCHAR(36) UUID | FK, NOT NULL |
| `shipperId` | VARCHAR(36) UUID | FK, NOT NULL |
| `tenantId` | VARCHAR(36) UUID | FK, NOT NULL |
| `stars` | INT | 1-5, NOT NULL |
| `feedback` | TEXT | Optional |
| `criteria` | JSONB | `{professionalism, equipment, communication}` |
| `ratedAt` | TIMESTAMPTZ | NOT NULL |
| `deletedAt` | TIMESTAMPTZ | Soft delete |

**Invariants:**
- Immutable after creation
- One rating per delivery/shipper pair
- Soft delete only (audit trail)

---

## Database Schema

```sql
CREATE TABLE carrier_performance (
  id VARCHAR(36) PRIMARY KEY,
  carrier_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  load_assigned INT NOT NULL,
  load_accepted INT NOT NULL,
  load_declined INT NOT NULL,
  acceptance_rate DECIMAL(5,2) NOT NULL,
  on_time_count INT NOT NULL,
  late_count INT NOT NULL,
  on_time_rate DECIMAL(5,2) NOT NULL,
  avg_delivery_time INT,
  quality_score DECIMAL(3,2),
  rating_count INT DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES users(id),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_performance_carrier ON carrier_performance(tenant_id, carrier_id);
CREATE INDEX idx_performance_date ON carrier_performance(recorded_at DESC);

ALTER TABLE carrier_performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carrier_performance_tenant"
  ON carrier_performance
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);

-- Shipper-specific ratings
CREATE TABLE shipper_carrier_ratings (
  id VARCHAR(36) PRIMARY KEY,
  carrier_id VARCHAR(36) NOT NULL,
  shipper_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
  feedback TEXT,
  criteria JSONB,
  rated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES users(id),
  CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES users(id),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, carrier_id, shipper_id) WHERE deleted_at IS NULL
);

CREATE INDEX idx_ratings_carrier ON shipper_carrier_ratings(tenant_id, carrier_id);
CREATE INDEX idx_ratings_shipper ON shipper_carrier_ratings(tenant_id, shipper_id);

ALTER TABLE shipper_carrier_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shipper_carrier_ratings_tenant"
  ON shipper_carrier_ratings
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);
```

---

## Hexagonal Architecture

### Application Layer
```
CarrierPerformanceService
├── recordAcceptance(carrierId, loadAssigned, loadAccepted)
├── recordDelivery(carrierId, onTime, deliveryTime)
├── rateCarrier(shipperId, carrierId, stars, feedback)
├── getCarrierMetrics(carrierId) → CarrierPerformanceDTO
└── getShipperHistory(shipperId, carrierId) → List[RatingDTO]
```

### Ports
```
CarrierPerformanceRepository
├── save(performance) → CarrierPerformance
└── findByCarrier(carrierId, dateRange) → List[CarrierPerformance]

ShipperCarrierRatingRepository
├── save(rating) → ShipperCarrierRating
├── findByCarrier(carrierId) → List[ShipperCarrierRating]
└── findByShipperAndCarrier(shipperId, carrierId) → List[ShipperCarrierRating]
```

---

## API Caching & Cache Invalidation (NFR-504)

**Requirement Link:** NFR-504 (Non-Functional Requirement for API Response Caching)  
**Mandate:** Carrier metrics are queried frequently for dashboard display; must cache aggregated performance data.

### GET Endpoints (Cached)

| Endpoint | Cache Name | Cache Key Template | TTL | Rationale |
|---|---|---|---|---|
| `GET /api/v1/carriers/{id}/performance` | `carrierPerformance` | `{tenantId}:carrier:{carrierId}:performance` | 1 hour | Performance metrics updated daily; safe 1h TTL |
| `GET /api/v1/carriers/{id}/ratings` | `carrierRatings` | `{tenantId}:carrier:{carrierId}:ratings` | 30 minutes | Ratings added frequently; shorter TTL |
| `GET /api/v1/market/top-carriers` | `topCarriers` | `{tenantId}:market:top-carriers` | 2 hours | Stable ranking; infrequently updated |

**Cache Key Example:**
```java
@Cacheable(
    value = "carrierPerformance",
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':carrier:' + #carrierId + ':performance'",
    unless = "#result == null"
)
public CarrierPerformanceDTO getPerformanceMetrics(String carrierId) {
    return performanceService.aggregateMetrics(carrierId);
}
```

### Mutation Endpoints (Cache Eviction)

| Endpoint | Eviction Strategy | Scope | Rationale |
|---|---|---|---|
| `POST /api/v1/load/{id}/rate` (rate carrier) | Evict carrier caches | `carrierPerformance:{tenantId}:carrier:{carrierId}:*`, `topCarriers:*` | New rating affects quality score and ranking |
| `PUT /api/v1/delivery/{id}/accept` (mark on-time) | Evict metrics | `carrierPerformance:{tenantId}:carrier:{carrierId}:*` | On-time rate changes |
| **Scheduled Job:** `refreshPerformanceMetrics()` (daily 00:00 UTC) | Bulk evict | `carrierPerformance:*`, `topCarriers:*` | Daily aggregation refresh; invalidate all caches |

**Eviction Pattern:**
```java
@CacheEvict(
    value = {"carrierPerformance", "topCarriers"},
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':*'",
    allEntries = true
)
@Scheduled(cron = "0 0 * * * UTC")  // Daily at midnight UTC
public void refreshPerformanceMetrics() {
    // Recompute carrier_performance aggregates
    recomputeAllCarrierMetrics();
}
```

### Cache Invalidation Mechanism

**Selected Approach:** **Option B: Event-Driven + Scheduled Daily Refresh**

**Rationale:**
- Performance metrics are pre-computed daily; scheduled refresh ensures consistency
- Individual rating events should invalidate carrier caches immediately
- Top-carrier rankings depend on aggregated metrics; refresh daily aligns with business cadence

**Implementation:**

```java
@Service
public class CarrierPerformanceService {
    private final ApplicationEventPublisher eventPublisher;
    
    public void rateCarrier(String carrierId, RatingRequest request) {
        ShipperCarrierRating rating = new ShipperCarrierRating(
            carrierId, request.getShipperId(), request.getStars(), request.getFeedback()
        );
        ratingRepository.save(rating);
        
        // Publish event: "Carrier rated"
        eventPublisher.publishEvent(new CarrierRatedEvent(
            TenantContextHolder.getTenantId(),
            carrierId
        ));
    }
}

@Component
public class PerformanceCacheInvalidationListener {
    @Autowired
    private CacheManager cacheManager;
    
    @EventListener
    public void onCarrierRated(CarrierRatedEvent event) {
        // Invalidate carrier's metrics and ranking
        Cache perfCache = cacheManager.getCache("carrierPerformance");
        perfCache.evict(event.getTenantId() + ":carrier:" + event.getCarrierId() + ":performance");
        
        Cache topCache = cacheManager.getCache("topCarriers");
        topCache.evict(event.getTenantId() + ":market:top-carriers");
    }
}
```

### Cache Hit Ratio Targets

**Production Targets (NFR-504):**
- Carrier performance cache hit ratio: > 80% (metrics viewed multiple times before decision)
- Top-carrier cache hit ratio: > 85% (stable daily rankings)
- Rating cache hit ratio: > 70% (ratings added less frequently than views)

**Monitoring:**
```
GET /actuator/metrics/cache.hits
GET /actuator/metrics/cache.puts
GET /actuator/metrics/cache.evictions
```

---

## Testing Strategy

| Test | Scenario | Expected |
|------|----------|----------|
| `testRecordAcceptance_94Percent` | 151 assigned, 142 accepted | acceptanceRate = 94% ✅ |
| `testRecordDelivery_OnTime` | 140 completed, 125 on-time | onTimeRate = 89% ✅ |
| `testRating_5Stars` | Shipper rates carrier 5★ | record stored, immutable ✅ |
| `testQualityScore_4.8Stars` | 23 ratings avg 4.8 | qualityScore = 4.8 ✅ |
| `testPercentileRanking` | Carrier vs platform avg | Top 18% ranking ✅ |
| `testMultiTenancy` | Tenant A vs B | RLS blocks cross-tenant ✅ |

---

## Flyway Migration

**File:** `V20260427_1500__CarrierPerformance_US705.sql`

---

**Architect Approval:** ✅ APPROVED FOR IMPLEMENTATION
