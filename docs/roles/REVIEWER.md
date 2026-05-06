# Role: Reviewer

**Task:** Audit code for security, quality, and performance.

## Hard Gates (Automatic REJECT)

- ❌ Any table without an RLS policy.
- ❌ Any method with cyclomatic complexity > 10.
- ❌ Test coverage < 80% branch coverage (JaCoCo).
- ❌ *(Phase 7+)* GET endpoint without `@Cacheable` annotation (NFR-504).
- ❌ *(Phase 7+)* Cache key without `TenantContextHolder.getTenantId()` (multi-tenant isolation).
- ❌ *(Phase 7+)* Mutation endpoint (POST/PUT/DELETE) without `@CacheEvict` or event-driven invalidation.
- ❌ *(Phase 7+)* No test case verifying multi-tenant cache isolation.

## Soft Gates (Request Changes)

- ⚠️ Cache TTL not justified in code comments or design doc.
- ⚠️ Complex filter parameters not included in cache key template.
- ⚠️ Cache invalidation not atomic (outside transaction boundary).
- ⚠️ Monitoring/metrics not configured for cache hit/miss ratios.

## Review Checklist

### Security & Data Integrity
- [ ] No cross-tenant data leakage possible (cache keys include `tenant_id`)
- [ ] RLS policy enabled on all core tables
- [ ] Soft deletes (deleted_at) checked in all queries
- [ ] JWT claims validated (iss, aud, exp)

### Code Quality
- [ ] No method exceeds cyclomatic complexity of 10
- [ ] Constructor injection used (no field `@Autowired`)
- [ ] Exception handling appropriate (not suppressed)
- [ ] No unused imports or variables

### Performance & Caching (Phase 7+)
- [ ] All GET endpoints have `@Cacheable` with tenant-aware key
- [ ] Cache key template: `{tenantId}:{entityType}:{identifier}`
- [ ] All mutation endpoints have `@CacheEvict` or event listener
- [ ] Cache invalidation is atomic (within transaction)
- [ ] TTL set appropriate to entity type (2-5 min for mutable, 1hr for stable)
- [ ] Related cache entries also evicted on mutation

### Testing
- [ ] Branch coverage ≥ 80% (JaCoCo enforced)
- [ ] *(Phase 7+)* Cache hit test: repeated GET returns same cached data
- [ ] *(Phase 7+)* Cache eviction test: POST/PUT/DELETE triggers `@CacheEvict`
- [ ] *(Phase 7+)* Multi-tenant isolation test: Tenant A ≠ Tenant B on same entity ID
- [ ] Integration test: cache + database consistent after mutation

## Phase 7+ Checklist (700-Series)

Every 700-series PR review MUST include:

### Architecture Checklist
- [ ] Design document includes "API Caching & Cache Invalidation" section
- [ ] All GET/POST/PUT/DELETE endpoints listed in cache table
- [ ] Cache key template includes `{tenantId}`
- [ ] TTL justified for each entity type
- [ ] Invalidation strategy defined (method-level, event-driven, or custom)

### Code Checklist
- [ ] `@Cacheable` on all GET endpoints with tenant-aware key
- [ ] `@CacheEvict` on all mutation endpoints
- [ ] `TenantContextHolder.getTenantId()` used in cache key
- [ ] Cache invalidation is atomic (same transaction as persist)
- [ ] Spring Boot `@EnableCaching` configured

### Test Checklist
- [ ] Unit test: GET cached; next GET returns same data (no DB hit)
- [ ] Unit test: POST/PUT/DELETE evicts cache
- [ ] Integration test: Tenant A reads; Tenant B reads; data isolated
- [ ] Load test: Cache hit ratio > 60% (or justified lower)

## Rejection Verdicts

**REJECTED** (must fix before merge):
- Missing `@Cacheable` on GET endpoint
- Cache key lacks tenant isolation
- No multi-tenant cache isolation test
- Mutation without cache invalidation

**TECHNICAL DEBT** (approve but flag for follow-up):
- TTL not optimized
- Monitoring not wired
- Eviction strategy overly broad (evicts entire cache)

---

*Last updated: 2026-04-27*  
*Applies to: All phases; stricter enforcement for Phase 7+*