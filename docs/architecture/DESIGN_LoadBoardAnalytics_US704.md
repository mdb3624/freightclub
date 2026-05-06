# Architectural Design: Load Board Analytics & Insights (US-704)

**Document:** Architecture Design Review  
**Story:** US-704 (Load Board Analytics)  
**Architect:** Solution Architecture Team  
**Date:** 2026-04-27  
**Status:** ✅ DESIGN APPROVED

---

## Executive Summary

US-704 implements real-time analytics on load board activity: posting trends, match success, claim rates, and market demand. The system captures every load interaction (post, match, claim) as immutable events, then pre-computes daily/hourly aggregates for fast dashboard queries.

**Key Design Patterns:**
- Event-driven analytics (immutable append-only tables)
- Pre-computed aggregates (hourly refresh)
- Multi-tenant isolation (RLS + tenant_id filtering)
- Caching strategy (materialized views for common queries)
- Time-series data (daily/hourly buckets)

---

## Domain Model

### US-704: LoadAnalytics (Immutable Event)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `loadId` | VARCHAR(36) UUID | FK to Load, NOT NULL |
| `tenantId` | VARCHAR(36) UUID | FK to Tenant, NOT NULL |
| `postedAt` | TIMESTAMPTZ | Immutable |
| `claimedAt` | TIMESTAMPTZ | Nullable (null = unclaimed) |
| `claimTimeSeconds` | INT | Nullable, calculated |
| `matchCount` | INT | Number of recommendations generated |
| `avgMatchScore` | INT | Average score of all recommendations |
| `matchReasonJson` | JSONB | `{equipment_count, lane_count, rate_count, availability_count}` |
| `claimedByTruckerId` | VARCHAR(36) UUID | Nullable (who claimed it) |
| `createdAt` | TIMESTAMPTZ | Record creation timestamp |
| `deletedAt` | TIMESTAMPTZ | Soft delete (soft delete on load cancel) |

**Invariants:**
- Immutable after creation (never updated)
- One record per load event
- Soft delete only (audit trail)

### LaneAnalytics (Pre-Computed, Daily)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `tenantId` | VARCHAR(36) UUID | NOT NULL |
| `originRegion` | VARCHAR(50) | NOT NULL |
| `destRegion` | VARCHAR(50) | NOT NULL |
| `date` | DATE | Daily bucket |
| `postCount` | INT | Loads posted this lane/day |
| `claimedCount` | INT | Loads claimed this lane/day |
| `claimRate` | DECIMAL | Percentage claimed |
| `avgClaimTimeSeconds` | INT | Average time-to-claim |
| `avgRate` | DECIMAL | Average rate $/mi |
| `computedAt` | TIMESTAMPTZ | When aggregated |

**Invariants:**
- Pre-computed daily (overnight + on-demand)
- Overwrite previous day's record
- Used for dashboard queries (fast)

---

## Database Schema

```sql
CREATE TABLE load_analytics (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  load_id VARCHAR(36) NOT NULL,
  posted_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ,
  claim_time_seconds INT,
  match_count INT NOT NULL,
  avg_match_score INT,
  match_reason JSONB,
  claimed_by_trucker_id VARCHAR(36),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,

  CONSTRAINT fk_load FOREIGN KEY (load_id) REFERENCES loads(id),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE INDEX idx_analytics_tenant_date ON load_analytics(tenant_id, posted_at DESC);
CREATE INDEX idx_analytics_claimed ON load_analytics(claimed_at, deleted_at);

ALTER TABLE load_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "load_analytics_tenant"
  ON load_analytics
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);

-- Pre-computed lane aggregates (materialized view replacement)
CREATE TABLE lane_analytics_daily (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  origin_region VARCHAR(50) NOT NULL,
  dest_region VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  post_count INT NOT NULL,
  claimed_count INT NOT NULL,
  claim_rate DECIMAL(5,2) NOT NULL,
  avg_claim_time_seconds INT,
  avg_rate DECIMAL(8,2),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, origin_region, dest_region, date)
);

CREATE INDEX idx_lane_daily_tenant_date ON lane_analytics_daily(tenant_id, date DESC);

ALTER TABLE lane_analytics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lane_analytics_tenant"
  ON lane_analytics_daily
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);
```

---

## Hexagonal Architecture

### Domain Layer (Pure Logic)
```
LoadAnalyticsCalculator
├── calculateClaimTime(postedAt, claimedAt) → INT
├── calculateMatchAverages(recommendations) → (count, avgScore)
└── calculateClaimRate(total, claimed) → DECIMAL
```

### Application Layer (Orchestration)
```
AnalyticsService
├── recordLoadEvent(load, recommendations) → LoadAnalyticsDTO
├── getLaneAnalytics(origin, dest, dateRange) → List[LaneAnalyticsDTO]
├── getDemandForecast(dateRange) → ForecastDTO
└── refreshAggregates() → void [Scheduled]
```

### Ports (Interfaces)
```
LoadAnalyticsRepository
├── save(analytics) → LoadAnalytics
├── findByTenant(tenantId, dateRange) → List[LoadAnalytics]
└── findClaimedCount(tenantId, dateRange) → INT

LaneAnalyticsRepository
├── upsert(laneAnalytics) → LaneAnalytics
└── findByTenant(tenantId, dateRange) → List[LaneAnalytics]
```

---

## API Caching & Cache Invalidation (NFR-504)

**Requirement Link:** NFR-504 (Non-Functional Requirement for API Response Caching)  
**Mandate:** Analytics queries are expensive (GROUP BY, aggregation); must cache results with intelligent invalidation.

### GET Endpoints (Cached)

| Endpoint | Cache Name | Cache Key Template | TTL | Rationale |
|---|---|---|---|---|
| `GET /api/v1/analytics/lane-stats` | `laneAnalytics` | `{tenantId}:lane:{origin}:{dest}:{dateRange}` | 1 hour | Pre-computed daily; safe to cache hourly |
| `GET /api/v1/analytics/demand-forecast` | `demandForecast` | `{tenantId}:forecast:{dateRange}` | 4 hours | Forecast based on historical data; changes daily |
| `GET /api/v1/analytics/load-summary` | `analytics` | `{tenantId}:summary:{dateRange}` | 30 minutes | High-cardinality time-series; refresh periodically |

**Example Cache Key:**
```java
@Cacheable(
    value = "laneAnalytics",
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':lane:' + #origin + ':' + #dest + ':' + #dateRange",
    unless = "#result == null"
)
public LaneAnalyticsDTO getLaneStats(String origin, String dest, String dateRange) {
    return analyticsService.aggregateLaneData(origin, dest, dateRange);
}
```

### Mutation Endpoints (Cache Eviction)

| Endpoint | Eviction Strategy | Scope | Rationale |
|---|---|---|---|
| `POST /api/v1/loads` (publish) | Evict forecast & summary | `analytics:{tenantId}:summary:*`, `demandForecast:*` | New load changes demand; forecast becomes stale |
| `PUT /api/v1/load/{id}/claim` | Evict lane & summary | `laneAnalytics:{tenantId}:lane:*`, `analytics:{tenantId}:summary:*` | Claim affects lane claim-rate and overall metrics |
| `DELETE /api/v1/load/{id}` (soft) | Evict all analytics | `analytics:*`, `laneAnalytics:*`, `demandForecast:*` | Cancellation invalidates all historical aggregates |
| **Scheduled Job:** `refreshAggregates()` (hourly) | Bulk evict | `laneAnalytics:*`, `analytics:*` | Pre-computed aggregates refresh; invalidate cache at refresh time |

**Eviction Pattern:**
```java
@CacheEvict(
    value = {"analytics", "laneAnalytics", "demandForecast"},
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':*'",
    allEntries = true
)
public void refreshAggregates() {
    // Called hourly; invalidates all cached analytics for this tenant
    computeLaneAnalyticsDaily();
    computeDemandForecast();
}
```

### Cache Invalidation Mechanism

**Selected Approach:** **Option B: Event-Driven + Scheduled Refresh**

**Rationale:**
- Analytics aggregates are pre-computed on a schedule (hourly/daily); scheduled eviction aligns with refresh cycles
- Individual load mutations (POST, PUT, DELETE) should trigger immediate cache invalidation
- Time-series data has natural boundaries (day/hour); schedule cache refresh at boundary transitions

**Implementation:**

```java
@Service
public class AnalyticsService {
    @Scheduled(fixedDelay = 3600000)  // 1 hour
    @CacheEvict(value = {"analytics", "laneAnalytics"}, allEntries = true)
    public void refreshAggregates() {
        // Recompute lane_analytics_daily and load summary
        computeLaneAnalyticsDaily();
    }
    
    public void recordLoadEvent(Load load) {
        loadAnalyticsRepository.save(mapToAnalytics(load));
        
        // Publish event: "Load recorded in analytics"
        eventPublisher.publishEvent(new LoadAnalyticsRecordedEvent(
            load.getTenantId(),
            load.getOriginRegion(),
            load.getDestinationRegion()
        ));
    }
}

@Component
public class AnalyticsCacheInvalidationListener {
    @Autowired
    private CacheManager cacheManager;
    
    @EventListener
    public void onLoadAnalyticsRecorded(LoadAnalyticsRecordedEvent event) {
        // Invalidate only affected lane/region caches
        Cache laneCache = cacheManager.getCache("laneAnalytics");
        String key = event.getTenantId() + ":lane:" + event.getOriginRegion() + ":" + event.getDestinationRegion() + ":*";
        laneCache.clear();  // Clear affected lane
        
        // Invalidate summary (high-impact)
        Cache summaryCache = cacheManager.getCache("analytics");
        summaryCache.evict(event.getTenantId() + ":summary:*");
    }
}
```

### Cache Hit Ratio Targets

**Production Targets (NFR-504):**
- Lane analytics cache hit ratio: > 85% (same lane queried multiple times per hour)
- Summary cache hit ratio: > 70% (dashboard refreshed periodically)
- Forecast cache hit ratio: > 90% (forecast is relatively stable)

**Monitoring:**
```
GET /actuator/metrics/cache.hits
GET /actuator/metrics/cache.misses
GET /actuator/metrics/cache.evictions
```

---

## Testing Strategy

| Test | Scenario | Expected |
|------|----------|----------|
| `testRecordLoadEvent_Posted` | Load posted, no claim yet | claim_time = NULL ✅ |
| `testRecordLoadEvent_Claimed` | Load posted then claimed | claim_time = (claimedAt - postedAt) ✅ |
| `testMatchAverages_OneRec` | 1 recommendation (score 150) | count=1, avg=150 ✅ |
| `testMatchAverages_Multiple` | 10 recs (avg 160) | count=10, avg=160 ✅ |
| `testClaimRate_50Percent` | 10 posted, 5 claimed | rate=50% ✅ |
| `testLaneAggregation_Daily` | 20 loads posted on same lane | daily aggregate=20 ✅ |
| `testMultiTenancy` | Tenant A vs Tenant B | RLS blocks cross-tenant ✅ |
| `testSoftDelete` | Load canceled after post | deleted_at set, queries filter ✅ |

---

## Flyway Migration

**File:** `V20260427_1400__LoadBoardAnalytics_US704.sql`

| Component | Detail |
|-----------|--------|
| Tables | 2 (load_analytics, lane_analytics_daily) |
| RLS Policies | 2 (tenant isolation) |
| Indexes | 3 (for common queries) |
| Soft Delete | Enforced via deleted_at IS NULL |

---

**Architect Approval:** ✅ APPROVED FOR IMPLEMENTATION

**Next Step:** CODER role — TDD implementation
