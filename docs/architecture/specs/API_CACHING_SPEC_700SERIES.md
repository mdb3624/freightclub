# API Caching Technical Specification (700-Series)

**Document:** Technical Specification  
**Applies To:** Phase 7 (US-701 through US-706) and all subsequent phases  
**Architect:** Solution Architecture Team  
**Date:** 2026-04-27  
**Status:** ✅ APPROVED  
**Requirement Link:** NFR-504

---

## Executive Summary

All GET endpoints in the FreightClub API MUST implement response-level caching with intelligent invalidation. This specification ensures:

1. **Immediate invalidation** upon entity mutation (CREATE, UPDATE, DELETE)
2. **Tenant isolation** — cache keys include `tenant_id` to prevent cross-tenant data leakage
3. **Atomic consistency** — cache and database state synchronized within a single transaction
4. **Performance gains** — reduce query load on PostgreSQL for high-frequency read operations
5. **Scalability** — support multi-tenant queries with sub-second response times

---

## Caching Strategy

### Cache Layer Architecture

```
Client Request
    ↓
API Gateway / Vite Proxy
    ↓
Spring Boot Application
    ├─ @Cacheable (method-level) ← Caches GET responses
    ├─ @CacheEvict (on mutation) ← Invalidates on write
    └─ CacheManager (tenant-aware)
    ↓
PostgreSQL (cache miss)
```

### Supported Cache Backends

**Primary (Production):** Redis (tenant-isolated namespaces)  
**Development/Testing:** In-Memory Caffeine Cache  
**Fallback:** Spring's default ConcurrentHashMap (no TTL)

---

## Implementation Requirements

### 1. Cache Configuration

#### Spring Boot Application Configuration

```yaml
# application.yml
spring:
  cache:
    type: redis  # or caffeine for dev
    redis:
      time-to-live: 3600000  # 1 hour (milliseconds)
      namespace-prefix: "fc:"
    caffeine:
      spec: "maximumSize=10000,expireAfterWrite=1h"

# Enable @Cacheable and @CacheEvict annotations
spring:
  cache:
    annotation:
      enabled: true
```

#### Custom Cache Manager Configuration

```java
// CacheConfig.java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration
            .defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))
            .computePrefixWith(name -> {
                String tenant = TenantContextHolder.getTenantId();
                return "fc:" + tenant + ":" + name + ":";
            });
        
        return RedisCacheManager
            .create(connectionFactory)
            .cacheDefaults(config);
    }
}
```

---

### 2. GET Endpoint Caching Pattern

**All GET endpoints MUST use `@Cacheable` with tenant-aware cache keys.**

#### Standard Cache Key Format

```
Cache Key = "fc:{tenantId}:{entityType}:{identifier}"
```

**Examples:**
- Load detail: `fc:tenant-001:load:load-uuid-123`
- Carrier profile: `fc:tenant-001:carrier:carrier-uuid-456`
- Load board: `fc:tenant-001:loadboard:all`

#### Implementation Pattern

```java
@RestController
@RequestMapping("/api/v1/loads")
public class LoadController {
    
    @GetMapping("/{id}")
    @Cacheable(
        value = "loads",
        key = "T(com.freightclub.context.TenantContextHolder).getTenantId() + ':' + #id"
    )
    public ResponseEntity<LoadDetailDTO> getLoadDetail(@PathVariable String id) {
        Load load = loadService.getLoadById(id);
        return ResponseEntity.ok(LoadDetailDTO.from(load));
    }
    
    @GetMapping
    @Cacheable(
        value = "load-board",
        key = "T(com.freightclub.context.TenantContextHolder).getTenantId() + ':board:' + #equipment + ':' + #state"
    )
    public ResponseEntity<Page<LoadCardDTO>> getLoadBoard(
        @RequestParam(required = false) String equipment,
        @RequestParam(required = false) String state,
        @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(loadService.getLoadBoard(equipment, state, page));
    }
}
```

---

### 3. Cache Invalidation on Mutation

**Cache MUST be invalidated immediately and atomically when:**
- Entity is **created** (INSERT)
- Entity is **updated** (UPDATE)
- Entity is **deleted** (soft or hard DELETE)
- Entity **status changes** (e.g., DRAFT → PUBLISHED)
- **Related entities change** (e.g., updating a Carrier affects load recommendations)

#### Invalidation Pattern — Single Entity

```java
@RestController
@RequestMapping("/api/v1/loads")
public class LoadController {
    
    @PostMapping
    @CacheEvict(
        value = "load-board",
        allEntries = true,
        beforeInvocation = false
    )
    public ResponseEntity<LoadDTO> createLoad(@RequestBody LoadCreateRequest req) {
        Load load = loadService.createLoad(req);
        // Cache evicted AFTER successful creation
        return ResponseEntity.status(201).body(LoadDTO.from(load));
    }
    
    @PutMapping("/{id}")
    @CacheEvict(
        value = {"loads", "load-board"},
        allEntries = true,
        beforeInvocation = false
    )
    public ResponseEntity<LoadDTO> updateLoad(
        @PathVariable String id,
        @RequestBody LoadUpdateRequest req
    ) {
        Load load = loadService.updateLoad(id, req);
        return ResponseEntity.ok(LoadDTO.from(load));
    }
    
    @DeleteMapping("/{id}")
    @CacheEvict(
        value = {"loads", "load-board"},
        allEntries = true,
        beforeInvocation = false
    )
    public ResponseEntity<Void> deleteLoad(@PathVariable String id) {
        loadService.deleteLoad(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### Invalidation Pattern — Bulk Operations

For operations that affect multiple entities (e.g., cancel all loads for a tenant), invalidate all caches:

```java
@PostMapping("/{id}/cancel")
@CacheEvict(
    value = {"loads", "load-board", "load-summary", "carrier-loads"},
    allEntries = true,
    beforeInvocation = false
)
public ResponseEntity<LoadDTO> cancelLoad(@PathVariable String id) {
    Load load = loadService.cancelLoad(id);
    return ResponseEntity.ok(LoadDTO.from(load));
}
```

#### Invalidation Pattern — Transactional Consistency

For complex operations spanning multiple entities, ensure cache invalidation happens **within the same transaction**:

```java
@Service
@Transactional
public class ClaimLoadService {
    
    @Transactional
    public ClaimResult claimLoad(String loadId, String carrierId) {
        // Step 1: Lock and claim
        Load load = loadRepository.findByIdForUpdate(loadId);
        Claim claim = new Claim(load, carrierId);
        claimRepository.save(claim);
        
        // Step 2: Update load status
        load.setStatus(LoadStatus.CLAIMED);
        loadRepository.save(load);
        
        // Step 3: Emit domain event (triggers cache invalidation)
        domainEventPublisher.publish(new LoadClaimedEvent(load, claim));
        
        return ClaimResult.success(claim);
    }
    
    @EventListener(LoadClaimedEvent.class)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onLoadClaimed(LoadClaimedEvent event) {
        // Cache invalidation via @CacheEvict or CacheManager
        cacheManager.getCache("loads").evict(event.getLoadId());
        cacheManager.getCache("load-board").clear();
    }
}
```

---

### 4. Cache Invalidation Strategies

#### Strategy A: Explicit Per-Entity Invalidation

**When:** Single entity mutations; fine-grained control needed.

```java
@CacheEvict(
    value = "loads",
    key = "T(com.freightclub.context.TenantContextHolder).getTenantId() + ':' + #id"
)
public void updateLoadStatus(String id, LoadStatus status) {
    // Update load
}
```

**Pros:** Precise; minimal cache churn.  
**Cons:** Requires mapping all mutations.

#### Strategy B: Bulk Cache Eviction

**When:** Complex updates; multiple related entities affected.

```java
@CacheEvict(value = {"loads", "load-board"}, allEntries = true)
public void publishLoad(String id) {
    // Publish logic
}
```

**Pros:** Simple; covers all scenarios.  
**Cons:** High cache churn; impacts performance.

#### Strategy C: Event-Driven Invalidation (Recommended)

**When:** Multi-service architectures; message-driven invalidation.

```java
// Service publishes domain event on any mutation
@Service
public class LoadService {
    private final ApplicationEventPublisher eventPublisher;
    
    @Transactional
    public void updateLoad(String id, LoadUpdateRequest req) {
        Load load = loadRepository.findById(id);
        load.update(req);
        loadRepository.save(load);
        
        // Publish event → listeners invalidate cache
        eventPublisher.publishEvent(new LoadUpdatedEvent(load));
    }
}

// Cache eviction listener
@Component
public class CacheInvalidationListener {
    private final CacheManager cacheManager;
    
    @EventListener(LoadUpdatedEvent.class)
    public void onLoadUpdated(LoadUpdatedEvent event) {
        cacheManager.getCache("loads").evict(event.getLoadId());
        cacheManager.getCache("load-board").clear();
    }
}
```

**Pros:** Decoupled; scalable; works across microservices.  
**Cons:** Requires event architecture.

---

### 5. Tenant Isolation in Cache Keys

**All cache keys MUST include `tenant_id` to prevent data leakage.**

#### Anti-Pattern (❌ FORBIDDEN)

```java
// WRONG: Cache key has no tenant isolation!
@Cacheable(value = "loads", key = "#id")
public Load getLoadById(String id) { }

// Result: Cache key = "load-123"
// Risk: Tenant A queries "load-123", then Tenant B queries same ID
//       Tenant B receives Tenant A's cached data!
```

#### Correct Pattern (✅ REQUIRED)

```java
// CORRECT: Cache key includes tenant
@Cacheable(
    value = "loads",
    key = "T(com.freightclub.context.TenantContextHolder).getTenantId() + ':' + #id"
)
public Load getLoadById(String id) { }

// Result: Cache key = "tenant-001:load-123"
// Safe: Each tenant has isolated cache entries
```

---

### 6. Cache TTL and Expiration Policy

| Entity Type | TTL | Rationale |
|---|---|---|
| Load Detail | 5 min | Load statuses change frequently (claimed, in-transit, delivered) |
| Load Board (filtered) | 2 min | New loads published; matches change frequently |
| Carrier Profile | 1 hour | Profiles change rarely; can tolerate longer staleness |
| Cost Profile | 30 min | User updates during shift; re-calculation expensive |
| Market Data (EIA) | 6 hours | Diesel prices update daily; stale data acceptable |
| Settlement Summary | 15 min | Payments finalize; need fresh data for accuracy |

**Configuration:**

```yaml
# application-prod.yml
spring:
  cache:
    redis:
      time-to-live: 
        loads: 300000         # 5 min
        load-board: 120000    # 2 min
        carriers: 3600000     # 1 hour
        cost-profiles: 1800000 # 30 min
```

---

### 7. Monitoring and Observability

#### Cache Hit/Miss Metrics

```java
@Component
public class CacheMetricsCollector {
    private final MeterRegistry meterRegistry;
    
    public void recordCacheHit(String cacheName) {
        Counter.builder("cache.hits")
            .tag("cache", cacheName)
            .register(meterRegistry)
            .increment();
    }
    
    public void recordCacheMiss(String cacheName) {
        Counter.builder("cache.misses")
            .tag("cache", cacheName)
            .register(meterRegistry)
            .increment();
    }
}
```

#### Alerting Rules

- **Cache Hit Ratio < 50%:** Investigate eviction policy; may be too aggressive.
- **Cache Miss Rate > 80%:** TTL too short; consider increasing.
- **Memory Usage > 80%:** Increase cache size or reduce TTL.

---

### 8. Testing Cache Behavior

#### Unit Test: Cache Eviction on Update

```java
@SpringBootTest
class LoadControllerCacheTest {
    
    @Autowired
    private LoadController controller;
    
    @Autowired
    private CacheManager cacheManager;
    
    @Test
    void updateLoadShouldEvictCache() {
        // Arrange
        String loadId = "load-123";
        Load load = new Load(loadId, "draft");
        
        // Prime cache
        controller.getLoadDetail(loadId);
        Cache cache = cacheManager.getCache("loads");
        assertThat(cache.get(loadId)).isNotNull();
        
        // Act: Update load
        controller.updateLoad(loadId, new LoadUpdateRequest());
        
        // Assert: Cache evicted
        assertThat(cache.get(loadId)).isNull();
    }
    
    @Test
    void multiTenantCacheIsolation() {
        // Verify cache keys include tenant ID
        TenantContextHolder.setTenantId("tenant-a");
        controller.getLoadDetail("load-123");
        
        TenantContextHolder.setTenantId("tenant-b");
        controller.getLoadDetail("load-123"); // Different cache entry!
        
        // Tenant B should NOT see Tenant A's data
        assertThat(tenantBLoadData).isNotEqualTo(tenantALoadData);
    }
}
```

#### Integration Test: Cache Consistency

```java
@SpringBootTest
@DataJpaTest
class CacheConsistencyTest {
    
    @Test
    @Transactional
    void cacheAndDatabaseConsistent() {
        // Create load
        Load load = loadService.createLoad(req);
        
        // Read from API (cached)
        LoadDTO cached = controller.getLoadDetail(load.getId()).getBody();
        
        // Update database directly (simulating concurrent change)
        loadRepository.updateStatus(load.getId(), LoadStatus.CLAIMED);
        
        // Cache should be invalidated; next read hits DB
        LoadDTO fresh = controller.getLoadDetail(load.getId()).getBody();
        
        assertThat(fresh.getStatus()).isEqualTo(LoadStatus.CLAIMED);
        assertThat(cached.getStatus()).isNotEqualTo(fresh.getStatus());
    }
}
```

---

## 700-Series Checklist

**Each US-701 through US-706 design document MUST verify:**

- [ ] All GET endpoints annotated with `@Cacheable`
- [ ] Cache keys include `TenantContextHolder.getTenantId()`
- [ ] All mutation endpoints annotated with `@CacheEvict` or event-driven invalidation
- [ ] Cache invalidation is **atomic** (within transaction boundary)
- [ ] TTL set appropriate to entity type (5 min for Loads, 1 hour for Profiles)
- [ ] Unit tests verify cache eviction on mutation
- [ ] Integration tests verify multi-tenant cache isolation
- [ ] Documentation includes cache behavior in API spec
- [ ] Monitoring dashboards track cache hit/miss ratios
- [ ] No cross-tenant data leakage possible (code review verified)

---

## References

- **Spring Cache Abstraction:** [docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/cache/annotation/Cacheable.html)
- **Redis Caching:** [redis.io/](https://redis.io/)
- **Distributed Caching Best Practices:** [martinfowler.com/bliki/CacheAsidePattern.html](https://martinfowler.com/bliki/CacheAsidePattern.html)
- **Tenant Isolation:** `docs/rules/postgres-native.md`
- **Requirement Link:** NFR-504 in `REQUIREMENTS.md`

---

*Last updated: 2026-04-27*  
*Applies to: Phase 7 and beyond*  
*Approved by: Architect & Librarian*
