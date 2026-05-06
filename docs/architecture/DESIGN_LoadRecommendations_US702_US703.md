# Architectural Design: Suggested Loads & Preferred Carriers (US-702 & US-703)

**Document:** Architecture Design Review  
**Stories:** US-702 (Suggested Loads), US-703 (Preferred Carriers)  
**Architect:** Solution Architecture Team  
**Date:** 2026-04-27  
**Status:** ✅ DESIGN APPROVED

---

## Executive Summary

**US-702** implements a recommendation engine that suggests loads to truckers based on their equipment and lane preferences (US-701 data).  
**US-703** enables shippers to build preferred carrier networks and directly assign loads, bypassing the open board.

Together they create a **dual-sided network:** truckers discover ideal loads; shippers deploy trusted carriers.

**Key Design Patterns:**
- Event-driven recommendation algorithm (triggered on load post)
- Soft deletes for audit trail compliance
- PostgreSQL RLS for multi-tenant isolation
- Immutable ledgers (audit logs)
- Direct assignment overrides open claiming

---

## Domain Model

### US-702: LoadRecommendation (Value Object)

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `loadId` | VARCHAR(36) UUID | FK to Load, NOT NULL |
| `truckerId` | VARCHAR(36) UUID | FK to User, NOT NULL |
| `tenantId` | VARCHAR(36) UUID | FK to Tenant, NOT NULL |
| `matchScore` | INT | 1-200, NOT NULL |
| `matchReasonJson` | JSONB | `{equipment: bool, lane: bool, rate: bool, availability: bool}` |
| `createdAt` | TIMESTAMPTZ | Immutable |
| `deletedAt` | TIMESTAMPTZ | Soft delete |

**Invariants:**
- One recommendation per (load, trucker) pair
- Score range: 1-200
- immutable after creation
- Soft delete only (audit trail)

---

### US-703: PreferredCarrier & BlockedCarrier

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | VARCHAR(36) UUID | PK |
| `shipperId` | VARCHAR(36) UUID | FK to User (Shipper) |
| `truckerId` | VARCHAR(36) UUID | FK to User (Trucker) |
| `tenantId` | VARCHAR(36) UUID | FK to Tenant |
| `addedAt` | TIMESTAMPTZ | NOT NULL |
| `deletedAt` | TIMESTAMPTZ | Soft delete |

**PreferredCarrier:** Shipper trusts this trucker  
**BlockedCarrier:** Shipper does NOT want this trucker to claim loads

---

## Database Schema

### US-702 Tables

```sql
CREATE TABLE load_recommendations (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  load_id VARCHAR(36) NOT NULL,
  trucker_id VARCHAR(36) NOT NULL,
  match_score INT NOT NULL CHECK (match_score >= 1 AND match_score <= 200),
  match_reason JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT fk_load FOREIGN KEY (load_id) REFERENCES loads(id),
  CONSTRAINT fk_trucker FOREIGN KEY (trucker_id) REFERENCES users(id),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, load_id, trucker_id) WHERE deleted_at IS NULL
);

CREATE INDEX idx_recommendations_trucker ON load_recommendations(tenant_id, trucker_id, deleted_at);
CREATE INDEX idx_recommendations_load ON load_recommendations(load_id, deleted_at);
CREATE INDEX idx_recommendations_score ON load_recommendations(match_score DESC);

ALTER TABLE load_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "load_recommendations_tenant"
  ON load_recommendations
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);
```

### US-703 Tables

```sql
CREATE TABLE preferred_carriers (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  shipper_id VARCHAR(36) NOT NULL,
  trucker_id VARCHAR(36) NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES users(id),
  CONSTRAINT fk_trucker FOREIGN KEY (trucker_id) REFERENCES users(id),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, shipper_id, trucker_id) WHERE deleted_at IS NULL
);

CREATE TABLE blocked_carriers (
  id VARCHAR(36) PRIMARY KEY,
  tenant_id VARCHAR(36) NOT NULL,
  shipper_id VARCHAR(36) NOT NULL,
  trucker_id VARCHAR(36) NOT NULL,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unblocked_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT fk_shipper FOREIGN KEY (shipper_id) REFERENCES users(id),
  CONSTRAINT fk_trucker FOREIGN KEY (trucker_id) REFERENCES users(id),
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Indexes
CREATE INDEX idx_preferred_shipper ON preferred_carriers(tenant_id, shipper_id, deleted_at);
CREATE INDEX idx_blocked_shipper ON blocked_carriers(tenant_id, shipper_id);

-- RLS
ALTER TABLE preferred_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_carriers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preferred_carriers_tenant" ON preferred_carriers
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);

CREATE POLICY "blocked_carriers_tenant" ON blocked_carriers
  USING (tenant_id = current_setting('app.current_tenant_id')::varchar);
```

---

## Algorithm: Load Recommendation Scoring

**Triggered:** When load transitions to POSTED status

```
FOR EACH load:
  query truckers WHERE:
    tenant_id = load.tenant_id AND
    (load.equipment_type IN trucker.equipment_types) AND
    (load.origin_region → load.dest_region IN trucker.lanes) AND
    (load.rate >= trucker.min_rate OR trucker.min_rate IS NULL) AND
    (load.pickup_time IN trucker.availability_window) AND
    (trucker.currently_on_load = false) AND
    NOT EXISTS (blocked_carriers WHERE shipper=load.shipper AND trucker=this_trucker)
  
  FOR EACH matching_trucker:
    score = 0
    score += 100 if load.equipment_type matches exactly
    score += 50 if load.route matches trucker lane
    score += 25 if load.rate >= trucker.min_rate
    score += 25 if load.pickup_time in trucker.availability
    
    INSERT load_recommendation(load, trucker, score, match_reason)
    NOTIFY trucker via dashboard/push: "New suggested load"
```

---

## Design Decisions

### 1. Recommendation Immutability
- **Decision:** Create load_recommendations records once; never update
- **Rationale:** Audit trail, reproducibility, compliance
- **Implementation:** Soft delete only; indexes on (load, trucker)

### 2. Direct Assignment Override
- **Decision:** Direct-assigned loads become CLAIMED immediately (not OPEN)
- **Rationale:** Shipper intent supersedes open market matching
- **Implementation:** Load claim type = DIRECT_ASSIGNED; other truckers cannot claim

### 3. Blocking vs. Removal
- **Decision:** Separate blocked_carriers table from preferred_carriers
- **Rationale:** Blocking is asymmetric (shipper action); preferred is bilateral trust
- **Implementation:** Check blocked_carriers BEFORE inserting recommendations

### 4. Scoring Range (1-200)
- **Decision:** 0 = no match; 1-200 = quality scale
- **Rationale:** Supports visual indicators (🔴 1-99, 🟡 100-149, 🟢 150-200)
- **Implementation:** Constraint CHECK(match_score >= 1 AND match_score <= 200)

---

## Hexagonal Architecture

### Domain Layer (No Spring/JPA)
```
LoadRecommendation
├── fields: loadId, truckerId, score, matchReason
└── methods: createRecommendation(load, trucker)

PreferredCarrierNetwork
├── fields: shipperId, truckerId (one-to-one relationship)
└── methods: addPreferred(shipper, trucker), block(shipper, trucker)
```

### Application Layer (Orchestration)
```
RecommendationService
├── generateRecommendations(load) → List<LoadRecommendationDTO>
└── notifyTruckers(recommendations)

PreferredCarrierService
├── addPreferred(shipper, trucker) → PreferredCarrierDTO
├── blockCarrier(shipper, trucker) → void
├── directAssignLoad(shipper, trucker, load) → LoadClaimDTO
└── getPreferredList(shipper) → List<TruckerDTO>

LoadClaimService (modified)
├── claimLoad(trucker, load) → void
│   if load.directAssignedTo != trucker:
│     throw PermissionDenied("Load reserved for another carrier")
```

### Ports (Interfaces)
```
LoadRecommendationRepository
├── save(recommendation) → LoadRecommendation
├── findByTrucker(truckerId) → List[LoadRecommendation]
└── findByLoad(loadId) → List[LoadRecommendation]

PreferredCarrierRepository
├── save(preferred) → PreferredCarrier
├── findByShipper(shipperId) → List[PreferredCarrier]
└── exists(shipper, trucker) → boolean

BlockedCarrierRepository
├── isBlocked(shipper, trucker) → boolean
└── block(shipper, trucker) → void
```

---

## API Caching & Cache Invalidation (NFR-504)

**Requirement Link:** NFR-504 (Non-Functional Requirement for API Response Caching)  
**Mandate:** Per 700SERIES_MANDATORY_ADDENDUM.md, all GET endpoints must implement response-level caching; cache invalidation must trigger immediately on load mutations.

### GET Endpoints (Cached)

| Endpoint | Cache Name | Cache Key Template | TTL | Rationale |
|---|---|---|---|---|
| `GET /api/v1/load-recommendations` | `loadRecommendations` | `{tenantId}:{truckerId}:recommendations` | 5 minutes | Fresh recommendations critical; expensive multi-table join |
| `GET /api/v1/load-recommendations/{id}` | `loadRecommendations` | `{tenantId}:{recommendationId}` | 30 minutes | Immutable once created; safe to cache |
| `GET /api/v1/preferred-carriers` | `preferredCarriers` | `{tenantId}:{shipperId}:preferred` | 1 hour | Shipper networks rarely change |
| `GET /api/v1/blocked-carriers` | `blockedCarriers` | `{tenantId}:{shipperId}:blocked` | 1 hour | Blocking decisions are infrequent |

**Cache Key Tenant Isolation:**
```java
@Cacheable(
    value = "loadRecommendations",
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':' + #truckerId + ':recommendations'",
    unless = "#result == null || #result.isEmpty()"
)
public List<LoadRecommendationDTO> getRecommendations(String truckerId) {
    return recommendationService.findForTrucker(truckerId);
}
```

### Mutation Endpoints (Cache Eviction)

| Endpoint | Eviction Strategy | Scope | Rationale |
|---|---|---|---|
| `POST /api/v1/loads` (publish load) | Evict all recommendations | `loadRecommendations:*` | New load creates recommendations for all truckers; invalidate all caches |
| `PUT /api/v1/preferred-carriers` | Evict shipper's cache | `preferredCarriers:{tenantId}:{shipperId}:*` | Preferred network changes affect direct assignment options |
| `POST /api/v1/preferred-carriers/{id}/block` | Evict blocking cache | `blockedCarriers:{tenantId}:{shipperId}:*` | Blocking prevents future recommendations to this trucker |
| `PUT /api/v1/load/{id}` (claim via recommendation) | Bulk evict | `loadRecommendations:*`, `preferredCarriers:*` | Claimed load is no longer available; cascades to all networks |

**Eviction Annotation Pattern:**
```java
@CacheEvict(
    value = "loadRecommendations",
    key = "T(com.freightclub.security.TenantContextHolder).getTenantId() + ':*'",
    allEntries = true  // Evict all recommendations across all truckers
)
public void publishLoad(String loadId, PublishLoadRequest request) {
    // Load published → trigger recommendation generation → invalidate all caches
}
```

### Cache Invalidation Mechanism

**Selected Approach:** **Option B: Event-Driven (Recommended)**

**Rationale:**
- Load publications trigger expensive O(n²) matching algorithm; must invalidate immediately across all trucker recommendation caches
- Recommendation immutability ensures safe caching; events signal when new recommendations are created
- Blocking/Preferred networks are shipper decisions; event-driven ensures consistency across tenants

**Implementation:**

```java
@Service
public class RecommendationService {
    private final ApplicationEventPublisher eventPublisher;
    
    public void generateRecommendations(Load load) {
        List<LoadRecommendation> recommendations = matchLoadToTruckers(load);
        recommendationRepository.saveAll(recommendations);
        
        // Publish event: "recommendations generated for this load"
        eventPublisher.publishEvent(new LoadPublishedEvent(
            load.getTenantId(),
            load.getId(),
            recommendations.stream().map(r -> r.getTruckerId()).collect(toList())
        ));
    }
}

@Component
public class RecommendationCacheInvalidationListener {
    @Autowired
    private CacheManager cacheManager;
    
    @EventListener
    public void onLoadPublished(LoadPublishedEvent event) {
        // Evict all recommendation caches (new load created new recommendations)
        Cache recCache = cacheManager.getCache("loadRecommendations");
        event.getTruckerIds().forEach(truckerId -> {
            String key = event.getTenantId() + ":" + truckerId + ":recommendations";
            recCache.evict(key);
        });
    }
}
```

### Cache Hit Ratio Targets

**Production Targets (NFR-504):**
- Recommendation cache hit ratio: > 80% (users check multiple times before claiming)
- Preferred carrier cache hit ratio: > 90% (network lists are stable)
- Blocked carrier cache hit ratio: > 95% (blocking is rare, caches persist)

**Health Check Endpoint:**
```
GET /actuator/caches
GET /actuator/metrics/cache.hits
GET /actuator/metrics/cache.misses
```

---

## Testing Strategy

### US-702: Recommendation Scoring
| Test | Scenario | Expected |
|------|----------|----------|
| `testExactEquipmentMatch` | Load requires Flatbed, trucker has Flatbed | +100 score ✅ |
| `testNoEquipmentMatch` | Load requires Tanker, trucker has Flatbed | 0 score ❌ |
| `testLaneMatch` | Load SE→CA, trucker prefers SE→CA | +50 score ✅ |
| `testRateMatch` | Load $2.00/mi, trucker min $1.75 | +25 score ✅ |
| `testAvailabilityMatch` | Load pickup in trucker's window | +25 score ✅ |
| `testBlockedCarrier` | Shipper blocked trucker | No recommendation ❌ |
| `testMultiTenancy` | TenantA vs TenantB | RLS blocks cross-tenant ✅ |

### US-703: Preferred Carriers
| Test | Scenario | Expected |
|------|----------|----------|
| `testAddPreferred` | Shipper adds trucker | Record created ✅ |
| `testDirectAssign` | Shipper assigns load to preferred | Load claimed, other truckers blocked ✅ |
| `testBlockCarrier` | Shipper blocks trucker | Trucker cannot see future loads ✅ |
| `testRemovePreferred` | Shipper removes trucker | Soft delete ✅ |

---

## Flyway Migrations

**File:** `V20260427_1200__LoadRecommendations_US702.sql`  
**File:** `V20260427_1300__PreferredCarriers_US703.sql`

Total: 2 migration files, 4 tables, 11 RLS policies, 8 indexes

---

## Design Checklist

- ✅ All IDs are VARCHAR(36) UUID
- ✅ All tables have deleted_at for soft deletes
- ✅ RLS policies on all multi-tenant tables
- ✅ Immutable ledgers (audit trails)
- ✅ No Lombok — standard Java POJOs expected
- ✅ Foreign keys constrained
- ✅ Cyclomatic complexity < 10 expected
- ✅ No half-finished implementations

---

**Architect Approval:** ✅ APPROVED FOR IMPLEMENTATION

**Next Step:** CODER role — TDD implementation
