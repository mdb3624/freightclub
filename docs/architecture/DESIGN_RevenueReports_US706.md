# Architectural Design: Revenue & Profitability Reports (US-706)

**Document:** Architecture Design Review  
**Story:** US-706 (Revenue & Profitability)  
**Architect:** Solution Architecture Team  
**Date:** 2026-04-27  
**Status:** ✅ DESIGN APPROVED

---

## Executive Summary

US-706 implements financial reporting: revenue tracking, commission calculations, lane/carrier profitability analysis, and forecast projections. The system records immutable financial events (load completion, settlement) and pre-computes daily aggregates for fast financial dashboards.

**Key Design Patterns:**
- Immutable financial ledger (append-only, audit trail)
- Pre-computed aggregates (daily, hourly refresh)
- Commission calculation (2% hardcoded)
- Net margin analysis (revenue - commission)
- Multi-tenant financial isolation (RLS enforced)
- Time-series forecasting (linear regression on historical data)

---

## Domain Model

### LoadFinancial (Immutable Ledger)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `loadId` | VARCHAR(36) UUID | FK, NOT NULL |
| `tenantId` | VARCHAR(36) UUID | FK, NOT NULL |
| `shipperId` | VARCHAR(36) UUID | FK, NOT NULL |
| `carrierId` | VARCHAR(36) UUID | FK to User, NOT NULL |
| `originRegion` | VARCHAR(50) | For lane grouping |
| `destRegion` | VARCHAR(50) | For lane grouping |
| `equipmentType` | VARCHAR(50) | For equipment profitability |
| `ratePerMile` | DECIMAL(8,2) | $/mi |
| `estimatedMiles` | INT | Load distance |
| `totalRevenue` | DECIMAL(12,2) | Rate × miles |
| `commission` | DECIMAL(12,2) | 2% of revenue |
| `netRevenue` | DECIMAL(12,2) | Revenue - commission |
| `settledAt` | TIMESTAMPTZ | When payment settled |
| `recordedAt` | TIMESTAMPTZ | Immutable timestamp |

**Invariants:**
- Immutable after creation (never updated)
- Commission always 2% (hardcoded rule)
- Net = Total - Commission (calculated, not stored separately)
- One record per settled load

### LaneRevenue (Pre-Computed Daily)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `tenantId` | VARCHAR(36) UUID | NOT NULL |
| `originRegion` | VARCHAR(50) | NOT NULL |
| `destRegion` | VARCHAR(50) | NOT NULL |
| `date` | DATE | Daily bucket |
| `loadCount` | INT | Loads on this lane/day |
| `totalRevenue` | DECIMAL(12,2) | Sum of revenues |
| `totalCommission` | DECIMAL(12,2) | Sum of commissions (2%) |
| `netRevenue` | DECIMAL(12,2) | revenue - commission |
| `avgRate` | DECIMAL(8,2) | Average $/mi |
| `marginPercent` | DECIMAL(5,2) | (netRevenue / totalRevenue) × 100 |
| `computedAt` | TIMESTAMPTZ | When aggregated |

**Invariants:**
- Pre-computed daily (overnight + on-demand)
- Overwrite (same lane/date replaces previous)
- Fast dashboard queries (no aggregation on-demand)

### EquipmentRevenue (Pre-Computed Daily)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `tenantId` | VARCHAR(36) UUID | NOT NULL |
| `equipmentType` | VARCHAR(50) | NOT NULL |
| `date` | DATE | Daily bucket |
| `loadCount` | INT | Loads with this equipment |
| `totalRevenue` | DECIMAL(12,2) | Sum |
| `netRevenue` | DECIMAL(12,2) | After commission |
| `avgRate` | DECIMAL(8,2) | Average $/mi |
| `marginPercent` | DECIMAL(5,2) | Net / Total |
| `computedAt` | TIMESTAMPTZ | When aggregated |

---

## Database Schema

```sql
CREATE TABLE load_financial (
  id VARCHAR(36) PRIMARY KEY,
  load_id VARCHAR(36) NOT NULL,
  tenant_id VARCHAR(36) NOT NULL,
  shipper_id VARCHAR(36) NOT NULL,
  carrier_id VARCHAR(36) NOT NULL,
  origin_region VARCHAR(50) NOT NULL,
  dest_region VARCHAR(50) NOT NULL,
  equipment_type VARCHAR(50),
  rate_per_mile DECIMAL(8,2) NOT NULL,
  estimated_miles INT,
  total_revenue DECIMAL(12,2) NOT NULL,
  commission DECIMAL(12,2) NOT NULL, -- 2% of revenue
  net_revenue DECIMAL(12,2) NOT NULL,
  settled_at TIMESTAMPTZ NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_load FOREIGN KEY (load_id) REFERENCES loads(id),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES users(id),
  CONSTRAINT fk_carrier FOREIGN KEY (carrier_id) REFERENCES users(id)
);

CREATE INDEX idx_financial_shipper ON load_financial(tenant_id, shipper_id, settled_at);
CREATE INDEX idx_financial_date ON load_financial(recorded_at DESC);

ALTER TABLE load_financial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "load_financial_tenant"
  ON load_financial
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);

-- Lane revenue aggregates (daily)
CREATE TABLE lane_revenue_daily (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  origin_region VARCHAR(50) NOT NULL,
  dest_region VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  load_count INT NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL,
  total_commission DECIMAL(12,2) NOT NULL,
  net_revenue DECIMAL(12,2) NOT NULL,
  avg_rate DECIMAL(8,2),
  margin_percent DECIMAL(5,2),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, origin_region, dest_region, date)
);

CREATE INDEX idx_lane_revenue_date ON lane_revenue_daily(tenant_id, date DESC);

-- Equipment revenue aggregates (daily)
CREATE TABLE equipment_revenue_daily (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  equipment_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  load_count INT NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL,
  net_revenue DECIMAL(12,2) NOT NULL,
  avg_rate DECIMAL(8,2),
  margin_percent DECIMAL(5,2),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, equipment_type, date)
);

ALTER TABLE lane_revenue_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_revenue_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lane_revenue_tenant" ON lane_revenue_daily
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);
CREATE POLICY "equipment_revenue_tenant" ON equipment_revenue_daily
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);
```

---

## Hexagonal Architecture

### Application Layer
```
RevenueService
├── recordLoadSettlement(loadId, totalRevenue) → LoadFinancialDTO
├── getRevenueSummary(shipperId, dateRange) → RevenueSummaryDTO
├── getLaneRevenue(origin, dest, dateRange) → List[LaneRevenueDTO]
├── getEquipmentRevenue(equipment, dateRange) → List[EquipmentRevenueDTO]
├── forecastRevenue(dateRange) → ForecastDTO
└── refreshAggregates() → void [Scheduled]
```

### Ports
```
LoadFinancialRepository
├── save(financial) → LoadFinancial
└── findByShipper(shipperId, dateRange) → List[LoadFinancial]

LaneRevenueRepository
├── upsert(laneRevenue) → LaneRevenue
└── findByTenant(tenantId, dateRange) → List[LaneRevenue]

EquipmentRevenueRepository
├── upsert(equipRevenue) → EquipmentRevenue
└── findByTenant(tenantId, dateRange) → List[EquipmentRevenue]
```

---

## Forecast Algorithm

```
Simple Linear Regression on historical data:
  x = days
  y = daily revenue
  
  Fit line: y = mx + b
  Confidence interval: ±1 std dev (68%), ±2 std dev (95%)
  
  For 30-day forecast:
    - Calculate trend (slope m)
    - Project next 30 days
    - Apply seasonality multiplier (if spring peak = +4%)
    - Return with confidence bands
```

---

## API Caching & Cache Invalidation (NFR-504)

**Requirement Link:** NFR-504 (Non-Functional Requirement for API Response Caching)  
**Mandate:** Revenue/financial reports are expensive (multi-table aggregation); must cache with careful invalidation on settlements.

### GET Endpoints (Cached)

| Endpoint | Cache Name | Cache Key Template | TTL | Rationale |
|---|---|---|---|---|
| `GET /api/v1/reports/revenue-summary` | `revenueSummary` | `{tenantId}:revenue:summary:{dateRange}` | 1 hour | Financial summary safe to cache hourly |
| `GET /api/v1/reports/lane-revenue` | `laneRevenue` | `{tenantId}:lane-revenue:{origin}:{dest}:{dateRange}` | 1 hour | Lane profitability changes daily; hourly safe |
| `GET /api/v1/reports/equipment-revenue` | `equipmentRevenue` | `{tenantId}:equipment-revenue:{type}:{dateRange}` | 1 hour | Equipment performance stable; hourly cache |
| `GET /api/v1/reports/forecast-30day` | `revenueForecast` | `{tenantId}:forecast:30day` | 6 hours | Forecast changes daily; 6h cache safe |

**Example Cache Key:**
```java
@Cacheable(
    value = "revenueSummary",
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':revenue:summary:' + #dateRange",
    unless = "#result == null"
)
public RevenueSummaryDTO getRevenueSummary(String dateRange) {
    return revenueService.aggregateRevenue(dateRange);
}
```

### Mutation Endpoints (Cache Eviction)

| Endpoint | Eviction Strategy | Scope | Rationale |
|---|---|---|---|
| `POST /api/v1/settlement/record` (settle payment) | Evict all revenue caches | `revenueSummary:*`, `laneRevenue:*`, `equipmentRevenue:*` | Settlement finalizes load revenue; cascades to all aggregates |
| `PUT /api/v1/load/{id}/adjust-rate` (rate correction) | Evict summaries | `revenueSummary:*`, `laneRevenue:*`, `equipmentRevenue:*` | Rate changes affect all financial totals |
| **Scheduled Job:** `refreshAggregates()` (hourly 00 min) | Bulk evict + refresh | `revenueSummary:*`, `laneRevenue:*`, `equipmentRevenue:*`, `revenueForecast:*` | Hourly aggregation refresh; invalidate all caches at refresh |

**Eviction Pattern:**
```java
@CacheEvict(
    value = {"revenueSummary", "laneRevenue", "equipmentRevenue", "revenueForecast"},
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':*'",
    allEntries = true
)
@Scheduled(cron = "0 0 * * * *")  // Every hour at :00
public void refreshRevenueAggregates() {
    // Recompute lane_revenue_daily and equipment_revenue_daily
    computeLaneRevenueDaily();
    computeEquipmentRevenueDaily();
    computeRevenueForecast();
}
```

### Cache Invalidation Mechanism

**Selected Approach:** **Option B: Event-Driven + Scheduled Hourly Refresh**

**Rationale:**
- Revenue aggregates depend on settled payments; settlement events trigger immediate invalidation
- Daily reports have natural hourly boundaries; scheduled refresh aligns with business reporting cadence
- Forecast depends on cumulative historical data; hourly refresh ensures fresh trend calculations

**Implementation:**

```java
@Service
public class RevenueService {
    private final ApplicationEventPublisher eventPublisher;
    
    public void recordSettlement(String loadId, SettlementRequest request) {
        LoadFinancial financial = new LoadFinancial(
            loadId,
            request.getTotalRevenue(),
            calculateCommission(request.getTotalRevenue()),  // 2%
            request.getTotalRevenue() - calculateCommission(request.getTotalRevenue())
        );
        financialRepository.save(financial);
        
        // Publish event: "Load settled; revenue finalized"
        eventPublisher.publishEvent(new LoadSettledEvent(
            TenantContextHolder.getTenantId(),
            loadId,
            financial.getOriginRegion(),
            financial.getDestRegion(),
            financial.getEquipmentType(),
            financial.getTotalRevenue()
        ));
    }
}

@Component
public class RevenueCacheInvalidationListener {
    @Autowired
    private CacheManager cacheManager;
    
    @EventListener
    public void onLoadSettled(LoadSettledEvent event) {
        // Invalidate all revenue caches (settlement affects all aggregates)
        String tenantId = event.getTenantId();
        
        cacheManager.getCache("revenueSummary").evict(tenantId + ":revenue:summary:*");
        cacheManager.getCache("laneRevenue")
            .evict(tenantId + ":lane-revenue:" + event.getOriginRegion() + ":" + event.getDestRegion() + ":*");
        cacheManager.getCache("equipmentRevenue")
            .evict(tenantId + ":equipment-revenue:" + event.getEquipmentType() + ":*");
        cacheManager.getCache("revenueForecast").evict(tenantId + ":forecast:*");
    }
}
```

### Cache Hit Ratio Targets

**Production Targets (NFR-504):**
- Revenue summary cache hit ratio: > 80% (viewed multiple times before action)
- Lane revenue cache hit ratio: > 75% (settlements distributed throughout day)
- Equipment revenue cache hit ratio: > 75% (settlements spread across equipment types)
- Forecast cache hit ratio: > 90% (stable, queried frequently, changes daily)

**Monitoring:**
```
GET /actuator/metrics/cache.hits
GET /actuator/metrics/cache.evictions
GET /actuator/health/caches
```

---

## Testing Strategy

| Test | Scenario | Expected |
|------|----------|----------|
| `testCommission_2Percent` | Revenue $1000 | Commission $20 ✅ |
| `testNetRevenue_Calculation` | Revenue $1000, Commission $20 | Net $980 ✅ |
| `testLaneAggregation_Daily` | 45 loads on SE→LA lane | daily total = sum ✅ |
| `testMarginPercent_8.2` | Revenue $50,000, Commission $1,000 | Margin 98% ✅ |
| `testForecast_30Day` | Historical avg $127k | Forecast $135k (+6%) ✅ |
| `testMultiTenancy` | Tenant A vs B | RLS blocks cross-tenant ✅ |

---

## Flyway Migration

**File:** `V20260427_1600__RevenueReports_US706.sql`

---

**Architect Approval:** ✅ APPROVED FOR IMPLEMENTATION
