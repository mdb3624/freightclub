# 700-Series Mandatory Technical Addendum: API Caching

**Document:** Design Requirement Addendum  
**Applies To:** US-701, US-702, US-703, US-704, US-705, US-706  
**Architect:** Solution Architecture Team  
**Date:** 2026-04-27  
**Status:** ✅ APPROVED & MANDATORY  

---

## Overview

This addendum is **MANDATORY for all Phase 7 (700-series) design documents and implementations.** Every user story in the 700-series MUST incorporate API response caching per **NFR-504**.

This document is a **requirement gate**. Designs that do not address caching will be **REJECTED** at architecture review.

---

## Requirement Statement (NFR-504)

> **All GET endpoints must implement response-level caching at the service or gateway layer. Cache invalidation must be triggered immediately if the underlying domain entity (Load, Carrier, Settlement) is modified. Caching must be tenant-aware and prevent cross-tenant data leakage.**

---

## Mandatory Design Section

**Every 700-series design document (US-701 through US-706) MUST include a new section:**

### Section: API Caching & Cache Invalidation

```markdown
## API Caching & Cache Invalidation (NFR-504)

### GET Endpoints (Cached)

| Endpoint | Cache Key Template | TTL | Rationale |
|---|---|---|---|
| `GET /api/v1/{resource}/{id}` | `{tenantId}:{resource}:{id}` | [TTL] | [Reason] |
| `GET /api/v1/{resource}` | `{tenantId}:{resource}:list:{filters}` | [TTL] | [Reason] |

**Example:**
- `GET /api/v1/carriers/carrier-123` → Cache key: `tenant-001:carrier:carrier-123` → TTL: 1 hour
- `GET /api/v1/loads?status=PUBLISHED` → Cache key: `tenant-001:loads:published` → TTL: 2 minutes

### Mutation Endpoints (Cache Eviction)

| Endpoint | Eviction Strategy | Scope |
|---|---|---|
| `POST /api/v1/{resource}` | Bulk evict `{resource}` and related | All entries for resource |
| `PUT /api/v1/{resource}/{id}` | Evict specific + related lists | Entity + parent collections |
| `DELETE /api/v1/{resource}/{id}` | Bulk evict + dependent caches | All affected collections |

**Example:**
- `POST /api/v1/carriers` → Evict `carriers` cache (entire)
- `PUT /api/v1/carriers/carrier-123` → Evict `carriers:carrier-123` and `load-recommendations`
- `DELETE /api/v1/carriers/carrier-123` → Evict `carriers`, `load-board`, `recommendations`

### Cache Invalidation Mechanism

**Approach:** [Select one below]

#### Option A: Method-Level @Cacheable / @CacheEvict
- Simplest; works for single-entity operations
- Recommended for: Simple CRUD endpoints

#### Option B: Event-Driven (Recommended)
- Service publishes domain event on mutation
- Cache invalidation listener reacts asynchronously
- Recommended for: Complex multi-entity operations; transactional consistency

#### Option C: Custom CacheManager Wrapper
- Custom service wraps cache operations
- Explicit control over invalidation
- Recommended for: Multi-tenant complex scenarios

### Tenant Isolation

**Cache key template MUST include `TenantContextHolder.getTenantId()`:**

```
{tenantId}:{entityType}:{identifier}
```

✅ CORRECT: `tenant-001:carrier:carrier-123`  
❌ WRONG: `carrier:carrier-123` (no tenant!)

**Test:** Multi-tenant cache isolation test verifies Tenant A cannot read Tenant B's cached data.

### TTL (Time-To-Live)

| Entity Type | TTL | Rationale |
|---|---|---|
| [Entity] | [TTL] | [Why] |

**Default TTL matrix:**
- Frequently changing: 2-5 minutes
- Moderately changing: 15-30 minutes
- Rarely changing: 1 hour

### Caching Disabled Scenarios

**Cache MUST be bypassed when:**
- `?cache=false` query parameter provided
- Debugging mode enabled
- Real-time data required (compliance, settlements)

### Monitoring & Metrics

Track via Micrometer:
- `cache.hits` — successful cache lookups
- `cache.misses` — cache lookups that hit database
- Alert when hit ratio < 50% or misses > 80%

### Testing Requirements

**Unit tests MUST verify:**
- ✅ GET returns cached data on repeated calls
- ✅ Cache evicted after POST/PUT/DELETE
- ✅ Multi-tenant cache isolation (no data leakage)
- ✅ Stale cache not returned after mutation

**Example test:**
```java
@Test
void updateShouldEvictCache() {
    controller.getCarrier(id); // Prime cache
    cache.contains(cacheKey);  // Verify cached
    
    controller.updateCarrier(id, dto); // Mutate
    
    cache.contains(cacheKey);  // Cache evicted
    assertFalse(cache.contains(cacheKey));
}
```
```

---

## Integration Checklist

**Before submitting a 700-series design for review, verify:**

### Architecture Checklist

- [ ] "API Caching & Cache Invalidation" section added to design document
- [ ] All GET endpoints listed with cache keys and TTLs
- [ ] All mutation endpoints listed with eviction strategy
- [ ] Tenant isolation verified in cache key template
- [ ] No cross-tenant data leakage possible (peer reviewed)
- [ ] TTL matrix documented and justified
- [ ] Caching disabled scenarios identified
- [ ] Monitoring metrics defined

### Code Checklist

- [ ] All GET endpoints have `@Cacheable` annotation
- [ ] Cache key includes `TenantContextHolder.getTenantId()`
- [ ] All mutation endpoints have `@CacheEvict` or event listener
- [ ] Cache invalidation is atomic (within transaction)
- [ ] Spring Boot `@EnableCaching` configured
- [ ] Redis or Caffeine cache backend configured
- [ ] Cache TTL environment variable set

### Testing Checklist

- [ ] Unit test: Cache returns same data on repeated calls
- [ ] Unit test: Cache evicted after POST/PUT/DELETE
- [ ] Integration test: Multi-tenant cache isolation
- [ ] Integration test: Cache vs. database consistency
- [ ] Load test: Cache hit ratio > 60%
- [ ] Monitoring dashboard set up for cache metrics

---

## How to Update Your Design Document

### Step 1: Add Section to Design Document

After the "Domain Model" or "API Endpoints" section, add:

```markdown
## API Caching & Cache Invalidation (NFR-504)

[Use template above; fill in your endpoints and TTLs]
```

### Step 2: Update API Endpoint Table

Add `Cache Key` and `TTL` columns:

```markdown
| Endpoint | HTTP Method | Cache Key | TTL | Eviction |
|---|---|---|---|---|
| `/api/v1/carriers` | GET | `{tenantId}:carriers:list` | 1 hour | N/A |
| `/api/v1/carriers/{id}` | GET | `{tenantId}:carriers:{id}` | 1 hour | N/A |
| `/api/v1/carriers` | POST | N/A | N/A | Evict `carriers` |
| `/api/v1/carriers/{id}` | PUT | N/A | N/A | Evict `carriers:*` |
```

### Step 3: Add Testing Section

Ensure testing section includes cache behavior:

```markdown
### Test Cases — Caching

| Test | Input | Expected | Assertion |
|---|---|---|---|
| Cache Hit | GET /carriers/123 twice | Same data, zero DB hits | `cache.hits == 2` |
| Eviction | POST /carriers; then GET list | Fresh data | `cache.misses == 1` |
| Isolation | Tenant A gets /carriers/123; Tenant B gets /carriers/123 | Different data | `tenantA != tenantB` |
```

---

## Reference Implementations

### Pattern 1: Simple Cacheable GET + Evict on Update

```java
@RestController
@RequestMapping("/api/v1/carriers")
public class CarrierController {
    
    @GetMapping("/{id}")
    @Cacheable(
        value = "carriers",
        key = "T(com.freightclub.context.TenantContextHolder).getTenantId() + ':' + #id"
    )
    public ResponseEntity<CarrierDTO> getCarrier(@PathVariable String id) {
        return ResponseEntity.ok(carrierService.getCarrierById(id));
    }
    
    @PutMapping("/{id}")
    @CacheEvict(
        value = "carriers",
        allEntries = true,
        beforeInvocation = false
    )
    public ResponseEntity<CarrierDTO> updateCarrier(
        @PathVariable String id,
        @RequestBody CarrierUpdateRequest req
    ) {
        return ResponseEntity.ok(carrierService.updateCarrier(id, req));
    }
}
```

### Pattern 2: Event-Driven Invalidation

```java
// Service: Publish event on mutation
@Service
public class CarrierService {
    
    @Transactional
    public Carrier updateCarrier(String id, CarrierUpdateRequest req) {
        Carrier carrier = carrierRepository.findById(id);
        carrier.update(req);
        carrierRepository.save(carrier);
        
        // Publish event → listeners handle cache eviction
        eventPublisher.publishEvent(new CarrierUpdatedEvent(carrier));
        return carrier;
    }
}

// Listener: Evict cache on event
@Component
public class CarrierCacheInvalidator {
    
    @EventListener(CarrierUpdatedEvent.class)
    public void onCarrierUpdated(CarrierUpdatedEvent event) {
        cacheManager.getCache("carriers").evict(event.getCarrierId());
        cacheManager.getCache("load-board").clear(); // Recommendations changed
    }
}
```

---

## Compliance Verification

### Architecture Review Gate

**Reviewer must verify:**

- ✅ "API Caching & Cache Invalidation" section present
- ✅ All GET/POST/PUT/DELETE endpoints documented
- ✅ Cache keys include `{tenantId}`
- ✅ Invalidation strategy defined and justified
- ✅ TTL appropriate to entity type
- ✅ No cross-tenant leakage possible
- ✅ Testing includes cache behavior

**REJECTION CRITERIA:**
- Cache section missing → **REJECT**
- Cache key lacks tenant ID → **REJECT**
- No test for multi-tenant isolation → **REJECT**
- No invalidation on mutation → **REJECT**

### Code Review Gate

- ✅ `@Cacheable` on all GET endpoints
- ✅ `@CacheEvict` on all mutation endpoints
- ✅ Cache key includes TenantContextHolder
- ✅ Tests verify cache + database consistency

---

## Questions & Answers

**Q: Can we cache POST requests?**  
A: No. Only GET (idempotent, read-only) requests are cached.

**Q: What if cache gets out of sync with database?**  
A: Synchronization is guaranteed because invalidation is **atomic** (happens within transaction). If eviction fails, the transaction rolls back.

**Q: How do we cache list endpoints with filters?**  
A: Include filter parameters in cache key: `{tenantId}:loads:list:{status}:{equipment}:{page}`

**Q: Is Tenant A's data ever visible to Tenant B?**  
A: No. Cache keys include `{tenantId}`; Redis/Caffeine keeps separate entries per tenant.

**Q: What about stale cache during a cache server outage?**  
A: Cache degradation is acceptable. System falls back to database. Consider circuit breaker pattern.

---

## Timeline & Rollout

| Date | Phase | Action |
|---|---|---|
| 2026-04-27 | Approval | Addendum approved; NFR-504 added to REQUIREMENTS.md |
| 2026-05-01 | US-701 Design | First 700-series design incorporates caching addendum |
| 2026-05-15 | US-701 Implementation | Code implements @Cacheable / @CacheEvict |
| 2026-06-01 | Full Phase 7 | All US-701 through US-706 include caching |

---

## Next Steps

1. **Architects:** Review and update all 700-series design documents with caching section.
2. **Coders:** Implement @Cacheable / @CacheEvict per spec.
3. **Reviewers:** Add cache behavior to code review checklist (REVIEWER.md).
4. **Librarians:** Update Story Map and sign-off docs to include "Cache Behavior Verified" criterion.

---

*Last updated: 2026-04-27*  
*Mandatory for: Phase 7 (US-701–US-706) and all subsequent phases*  
*Approved by: Architect & Librarian*
