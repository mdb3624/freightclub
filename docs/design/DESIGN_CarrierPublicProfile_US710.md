# ARCHITECT Design: US-710 — View Carrier Public Profile

**Story:** US-710  
**Phase:** 7  
**Status:** ARCHITECT_APPROVED  
**Created:** 2026-05-29  

---

## Domain Model

### CarrierPerformance (Read-Only Aggregate)

```
CarrierPerformance
├── carrierId: UUID (PK/FK)
├── tenantId: UUID (FK)
├── acceptanceRate: Percentage (0-100)
├── onTimeDeliveryRate: Percentage (0-100)
├── avgDeliveryTimeHours: Integer
├── qualityScore: Integer (0-100)
├── preferredByCount: Integer
├── loadsAccepted: Integer
├── loadsCompleted: Integer
├── yearsInBusiness: Integer (calculated from user.createdAt)
├── operatingRegions: List[String] (service areas)
├── equipmentTypes: List[String]
├── platformAverageAcceptanceRate: Percentage
├── platformAverageOnTimeRate: Percentage
├── platformAverageQualityScore: Integer
├── acceptanceRatePercentile: Integer (0-100)
├── onTimeRatePercentile: Integer (0-100)
├── qualityScorePercentile: Integer (0-100)
├── viewedByCountLast30Days: Integer
├── updatedAt: OffsetDateTime
└── calculatedAt: OffsetDateTime (hourly recalculation)

Invariants:
- acceptanceRate, onTimeRate, qualityScore are percentages
- percentiles calculated from tenant-wide benchmarks
- platformAverages calculated daily
- read-only: no direct mutations, updated by analytics job
```

---

## API Contracts

### GET /api/v1/carriers/{carrierId}/performance

**Path Parameters:**
- `carrierId`: UUID of carrier to view

**Query Parameters (Optional):**
- `includeBenchmark`: boolean (default: true) - include percentiles and platform averages

**Response (200 OK):**
```json
{
  "carrier": {
    "id": "uuid",
    "name": "FedEx Freight",
    "yearsInBusiness": 25,
    "operatingRegions": ["CA", "NV", "AZ"],
    "equipmentTypes": ["DRY_VAN", "FLATBED"]
  },
  "performance": {
    "acceptanceRate": 96.5,
    "onTimeDeliveryRate": 98.2,
    "avgDeliveryTimeHours": 42,
    "qualityScore": 94,
    "preferredByCount": 312,
    "loadsAccepted": 5420,
    "loadsCompleted": 5401
  },
  "benchmarks": {
    "platformAverages": {
      "acceptanceRate": 85.3,
      "onTimeDeliveryRate": 92.1,
      "qualityScore": 78
    },
    "percentiles": {
      "acceptanceRatePercentile": 98,
      "onTimeDeliveryRatePercentile": 99,
      "qualityScorePercentile": 97
    },
    "indicators": {
      "acceptanceRateIndicator": "green",
      "onTimeRateIndicator": "green",
      "qualityScoreIndicator": "green"
    }
  },
  "socialProof": {
    "viewedByCountLast30Days": 156,
    "preferredByCount": 312,
    "trendingDirection": "up"
  }
}
```

**Errors:**
- 404: Carrier not found or not in shipper's tenant
- 403: Unauthorized (not shipper role)
- 400: Invalid carrierId format

---

### GET /api/v1/analytics/carrier-benchmarks

**Query Parameters:**
- `tenantId`: UUID (optional, derived from context)

**Response (200 OK):**
```json
{
  "benchmarks": {
    "averageAcceptanceRate": 85.3,
    "averageOnTimeDeliveryRate": 92.1,
    "averageQualityScore": 78,
    "medianAcceptanceRate": 87.2,
    "medianOnTimeRate": 94.5,
    "medianQualityScore": 82
  },
  "distribution": {
    "acceptanceRate": {
      "p25": 75.0,
      "p50": 87.2,
      "p75": 92.1,
      "p90": 96.5
    },
    "onTimeRate": {
      "p25": 88.0,
      "p50": 94.5,
      "p75": 97.2,
      "p90": 99.0
    },
    "qualityScore": {
      "p25": 65,
      "p50": 82,
      "p75": 90,
      "p90": 96
    }
  }
}
```

---

## Multi-Tenancy & Isolation

### Visibility Rules
1. Shipper sees ONLY carriers in their tenant
2. Performance metrics aggregated per tenant
3. Benchmarks calculated per tenant (not cross-tenant)
4. Preferred-by-count includes only shippers in same tenant
5. Viewed-by-count tracks only in-tenant views

### Implementation
```
1. Get tenant from TenantContextHolder
2. Validate shipper belongs to tenant
3. Validate carrier is accessible in tenant
4. Return tenant-specific metrics only
5. RLS policy blocks cross-tenant access at DB
```

---

## Performance Metrics Calculation

### Acceptance Rate
```
= (loads_accepted / loads_offered) × 100
where:
  loads_offered = all loads posted to this carrier in tenant
  loads_accepted = loads where carrier accepted or completed
range: 0-100%
```

### On-Time Delivery Rate
```
= (loads_delivered_by_date / loads_completed) × 100
where:
  loads_completed = loads with actual_delivery_date IS NOT NULL
  loads_delivered_by_date = actual_delivery_date ≤ promised_delivery_date
range: 0-100%
```

### Quality Score
```
= 100 - penalty_points
where:
  penalty_points = sum of:
    damage_incidents × 5
    theft_incidents × 10
    compliance_violations × 3
    late_deliveries × 1
capped at 0 (minimum)
range: 0-100
```

### Average Delivery Time
```
= AVG(actual_delivery_date - pickup_date) in hours
for all completed loads in tenant
```

---

## Percentile Calculation

### Benchmark Percentiles
```
For each carrier performance metric (acceptance rate, on-time rate, quality):
1. Get all carriers in tenant with non-null metric
2. Sort by metric (ascending)
3. Calculate percentile:
   percentile = (count of carriers with score < current / total) × 100
   
Examples:
- 98th percentile = top 2% of carriers
- 75th percentile = better than 75% of carriers
- 50th percentile = median performance
```

---

## Indicator Colors

### Color Coding
```
Green (Above Average):
  metric > platform_average

Yellow (At Average):
  metric between (platform_average × 0.95) and (platform_average × 1.05)

Red (Below Average):
  metric < (platform_average × 0.95)
```

---

## Data Refresh Strategy

### Batch Update Job (Hourly)
```
Every hour:
1. Recalculate all carrier performance metrics
2. Update CarrierPerformance table
3. Invalidate cache for all carriers
4. Recalculate platform benchmarks
5. Log completion timestamp
```

### Cache Strategy
- Cache name: `carrierPerformance`
- TTL: 1 hour (matches recalculation frequency)
- Key pattern: `carrierPerformance:{carrierId}:{tenantId}`
- Evict on update

---

## Social Proof Metrics

### Preferred By Count
```
= COUNT(distinct shipper_id)
from shipper_preferred_carriers
where carrier_id = ? AND tenant_id = ? AND deleted_at IS NULL
```

### Viewed By Count (Last 30 Days)
```
= COUNT(distinct shipper_id)
from carrier_profile_views
where carrier_id = ? AND tenant_id = ? AND viewed_at >= (now - 30 days)
```

### Trending Direction
```
current_count = views_last_7_days
previous_count = views_7_14_days_ago

if current_count > previous_count:
  trending = "up"
else if current_count < previous_count:
  trending = "down"
else:
  trending = "stable"
```

---

## Test Strategy

### Unit Tests
- Percentile calculation accuracy
- Indicator color assignment logic
- Metric aggregation correctness
- Benchmark calculation

### Integration Tests
- Multi-tenant isolation: shipper A cannot see shipper B's metrics
- RLS enforcement at DB level
- Cache behavior: hits, misses, hourly refresh
- Performance metrics accuracy

### Coverage Target
**JaCoCo Branch Coverage ≥80%**

---

## Design Decisions

### Why Percentiles Instead of Raw Averages?
- Percentiles are more meaningful to shippers
- "Top 15%" is easier to understand than "2.5% above average"
- More resilient to outliers

### Why Color Indicators?
- Visual communication of performance quickly
- Accessible to color-blind users (+ text labels)
- Reduces cognitive load on shipper

### Why Hourly Recalculation?
- Balances freshness with performance
- Queries are fast (read from pre-calculated table, not from events)
- 1-hour lag is acceptable for historical metrics

### Why Cache Preferred-By-Count?
- Frequently accessed
- Changes infrequently
- Reduces load on preferred_carriers table

---

## Handed Off To

**Next Step:** HFD designs the UI for:
1. Carrier profile page layout
2. Performance metrics display (card layout)
3. Benchmark comparison visualization
4. Social proof display
5. Equipment types and service areas display
6. "Add to Preferred" button placement

**HFD Inputs Needed:**
- Performance cards design
- Benchmark comparison visual (gauge vs. text)
- Color indicator design
- Mobile responsiveness
- Loading states
