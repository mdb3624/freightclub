# ARCH Design: Carrier Search Endpoint — US-707-v2

**Role:** Architect
**Story:** US-707-v2 (CHG-001 resolution)
**Date:** 2026-06-04
**Status:** APPROVED FOR IMPLEMENTATION

---

## Context

The `AddCarrierModal` needs to search for registered TRUCKER users within the same tenant so a shipper can add them to their preferred list. No such endpoint exists.

---

## Decision: Extend CarrierPublicProfileController

**URL:** `GET /api/v1/carriers/search?q={term}&limit=8`
**Auth:** `SHIPPER` role (already enforced on the controller class)
**Scope:** TRUCKER users in same tenant as the requesting shipper

**Rationale:** `CarrierPublicProfileController` is already the shipper-facing carrier view layer. Adding search here is cohesive, requires no new controller, and keeps the route namespace clean.

**Frontend update required:** `AddCarrierModal` must use `/carriers/search` (relative to apiClient baseURL `/api/v1`; full path is `/api/v1/carriers/search`).

---

## New Classes

### 1. `CarrierSearchResult` (record, application layer)

```
package com.freightclub.modules.carrier.application;

record CarrierSearchResult(
    String id,
    String firstName,
    String lastName,
    String email,
    String equipmentType   // nullable — display label only
)
```

### 2. `UserRepository` — new query

```java
@Query("""
    SELECT u FROM User u
    WHERE u.tenantId = :tenantId
      AND u.role = com.freightclub.domain.UserRole.TRUCKER
      AND u.deletedAt IS NULL
      AND (
        LOWER(u.firstName) LIKE LOWER(CONCAT(:q, '%'))
        OR LOWER(u.lastName) LIKE LOWER(CONCAT(:q, '%'))
        OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT(:q, '%'))
        OR LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))
      )
    ORDER BY u.firstName ASC, u.lastName ASC
    """)
List<User> searchTruckers(
    @Param("tenantId") String tenantId,
    @Param("q") String q,
    Pageable pageable
);
```

**Index note:** Existing `users` table has no full-text index. LIKE queries are acceptable for the current scale (<10k users/tenant). Full-text (tsvector) is future optimisation.

### 3. `CarrierProfileService.searchCarriers()`

```java
public List<CarrierSearchResult> searchCarriers(String tenantId, String query) {
    String q = query.strip();
    if (q.length() < 2) return List.of();
    List<User> users = userRepository.searchTruckers(
        tenantId, q, PageRequest.of(0, 8));
    return users.stream()
        .map(u -> new CarrierSearchResult(
            u.getId(),
            u.getFirstName(),
            u.getLastName(),
            u.getEmail(),
            u.getEquipmentType() != null ? u.getEquipmentType().name() : null
        ))
        .toList();
}
```

### 4. `CarrierPublicProfileController` — new endpoint

```java
@GetMapping("/search")
public ResponseEntity<List<CarrierSearchResult>> searchCarriers(
        @RequestParam String q) {
    String tenantId = TenantContextHolder.getTenantId();
    List<CarrierSearchResult> results = carrierProfileService.searchCarriers(tenantId, q);
    return ResponseEntity.ok(results);
}
```

---

## Security

- `@PreAuthorize("hasRole('SHIPPER')")` inherited from class — no additional annotation needed
- Tenant isolation: query filters by `tenantId` from `TenantContextHolder` — cross-tenant leak impossible
- Input: `q` is a bind parameter — no SQL injection risk

## Caching

No caching on search results — queries are dynamic and short-lived. Add `"carrierSearch"` to `CacheConfig` only if profiling shows it's needed.

## Constraints

- Minimum 2 chars enforced at service layer (returns empty list, not error)
- Max 8 results (server-side `PageRequest.of(0, 8)`)
- No pagination — 8 results is sufficient for an autocomplete; shippers narrow with more specific terms
