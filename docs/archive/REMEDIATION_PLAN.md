# CRITICAL Issues Remediation Plan

**Date:** 2026-05-30  
**Status:** Ready for immediate remediation

## CRITICAL Issues (Ship-blocking)

### 1. ProfileService Missing Soft-Delete Filters
**File:** `backend/src/main/java/com/freightclub/service/ProfileService.java`  
**Issue:** `findAll()` and `findById()` do not filter `deleted_at IS NULL`  
**Impact:** Deleted profiles reappear in list view or edit  
**Fix:** Add `.where("deleted_at IS NULL")` to all profile queries

### 2. AuthController Missing @PermitAll on logout/refresh
**File:** `backend/src/main/java/com/freightclub/controller/AuthController.java`  
**Issue:** `logout()` and possibly `refresh()` missing `@PermitAll`  
**Impact:** Users cannot log out (401 Unauthorized) or refresh tokens  
**Fix:** Verify all four auth endpoints have proper annotations:
- `@PermitAll` on register, login, refresh, logout, debug/cookies
- `@PreAuthorize("isAuthenticated()")` on logout if requiring user context

### 3. Repository Queries Missing tenant_id Filter
**File:** `backend/src/main/java/com/freightclub/repository/ProfileRepository.java`  
**Issue:** JPA queries not scoped to `TenantContextHolder.getTenantId()`  
**Impact:** Cross-tenant data leak—User A can view User B's profile by guessing ID  
**Fix:** Add `@Query` with tenant filter or use custom methods that enforce `tenant_id = :tenantId`

## HIGH Issues (Security)

4. Refresh cookie missing `SameSite=Strict`
5. JWT filter skiplist incomplete
6. Authorization header not injected in apiClient
7. CORS hardcoded or missing validation
8. Password validation weak/missing
9. Rate limiting incomplete

## MEDIUM Issues (Data consistency)

10. Form fields don't match schema (partially fixed)
11. Direct axios calls bypass apiClient
12. Duplicate `/api/v1` in paths
13. Cache not invalidated on soft-delete
14. Email/password validation incomplete
15. TenantContextHolder null-safety missing

---

## Remediation Order

**Phase 1 (Today):** Fix CRITICAL issues
1. Add soft-delete filters to ProfileService
2. Complete @PermitAll annotations in AuthController  
3. Add tenant_id enforcement to ProfileRepository

**Phase 2 (Next):** Fix HIGH security issues
- Refresh cookie SameSite flag
- JWT skiplist audit
- apiClient Authorization header verification
- CORS env var configuration

**Phase 3:** Fix MEDIUM issues
- Form/schema alignment (ongoing)
- Input validation completeness
- TenantContextHolder null-safety

---

## Cost Profile Persistence Debug

**Current state:** Form fields registered but values not appearing in Network payload  
**Root cause (likely):** One of the CRITICAL issues (auth 401, missing @PermitAll, or soft-delete filter interaction)  
**Next step:** After fixing CRITICAL issues, retest—should resolve
