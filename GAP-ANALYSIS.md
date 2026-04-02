# FreightClub Codebase Gap Analysis

**Date:** April 2, 2026  
**Scope:** Backend (Java), Frontend (React/TypeScript), Database schema (Flyway migrations)  
**Audit Coverage:** All test files, all backend source, all frontend source, all migrations, all docs

---

## 1. Test Coverage Gaps

### Critical Missing Test Coverage

#### Backend Services Without Tests (6 services)
- **ProfileService** - `backend/src/main/java/com/freightclub/service/ProfileService.java`
  - No test file exists
  - Critical: `getProfile()`, `updateProfile()` with 15+ field assignments
  - Risk: Profile updates lack validation coverage

- **NotificationService** - `backend/src/main/java/com/freightclub/service/NotificationService.java`
  - No test file exists
  - 6 public notification methods untested
  - Risk: Null pointer errors at lines 32-34, 45, 54, 65 (`.orElse(null)` patterns)

- **EmailService** - `backend/src/main/java/com/freightclub/service/EmailService.java`
  - No test file exists
  - Email dispatch logic untested

- **BolGeneratorService** - `backend/src/main/java/com/freightclub/service/BolGeneratorService.java`
  - No test file exists
  - PDF generation untested

- **EiaFuelPriceService** - `backend/src/main/java/com/freightclub/service/EiaFuelPriceService.java`
  - No test file exists
  - External API integration untested

#### Backend Controllers Without Tests (6 controllers)
- **ProfileController** - no test file; endpoints: GET/PUT /api/v1/profile
- **DocumentController** - no test file; endpoints: file uploads, downloads, exports
- **NotificationController** - no test file; endpoints: list notifications, unread-count
- **MarketController** - no test file; endpoint: GET /api/v1/market/diesel-prices
- **LoadBoardController** - no test file; critical endpoints: board listing, pickup/deliver
- **RatingController** - no test file; endpoints: rate trucker/shipper, summaries

#### Frontend Test Coverage
- Only 3 test files across 12 pages, 27 hooks, 50+ components
  - ProtectedRoute.test.tsx, StatusBadge.test.tsx, authStore.test.ts
  - Missing: All hooks (useCreateLoad, useClaimLoad, useRatings, etc.), all pages, API integration

---

## 2. Unhandled Error Paths

### Null Pointer Risks

**NotificationService** (`backend/src/main/java/com/freightclub/service/NotificationService.java`)
- Lines 32-34, 45, 54, 65: `.orElse(null)` then immediate method call
  ```java
  User trucker = userRepository.findById(truckerId).orElse(null);
  if (trucker == null || shipper == null) return;
  String truckerName = trucker.getFirstName() + " " + trucker.getLastName();  // NPE possible
  ```
  - Silent return means notifications never created

**ProfileService** (`backend/src/main/java/com/freightclub/service/ProfileService.java`)
- Line 77: `.orElse(null)` returns null tenant without validation before serialization

### Missing Error Handling in Key Flows

**DocumentService** - `generateBolOnPublish()` throws `IllegalStateException` (lines 114-121)
  - No recovery; load publish fails without user feedback

**LoadService** - `claimLoad()` lacks race condition protection
  - Two truckers could simultaneously claim same load

**LoadBoardController** line 53 - `getLoad()` lacks authorization check
  - Any trucker can view any shipper's load details
  - userId parameter provided but unused

### Global Exception Handler Gaps

**GlobalExceptionHandler** (`backend/src/main/java/com/freightclub/exception/GlobalExceptionHandler.java`)
- Missing handlers: NullPointerException, DataAccessException, IOException, ConcurrencyException
- Unhandled exceptions return 500 with no details

---

## 3. Incomplete Features

### Partially Wired Features

**1. Load Cancellation Notifications**
- Controller exists: `LoadController.cancel()` line 70-75
- Service exists: `LoadService.cancelLoad()`
- **Gap:** No call to `notificationService.notifyLoadCancelledToTrucker()`
- Result: Truckers not notified when claimed load is cancelled

**2. Profile Cost Calculations**
- ProfileService updates cost fields (lines 54-59): monthlyFixedCosts, fuelCostPerGallon, milesPerGallon, maintenanceCostPerMile, monthlyMilesTarget, targetMarginPerMile
- **Gap:** No backend service to calculate profitability; frontend calculations are hardcoded

**3. HOS (Hours of Service) Integration**
- Frontend component exists: `HosWidget.tsx`, hook `useHosState.ts`
- **Gap:** No backend endpoint; no database tables
- Result: Frontend widget non-functional

**4. Document Export Endpoint**
- DocumentController line 65: `export()` endpoint stub exists
- **Gap:** No DocumentService implementation

**5. Multi-Tenant Isolation**
- TenantContextHolder used throughout, tenant_id on all tables
- **Gap:** SecurityConfig lacks tenant verification; no @PreAuthorize checks
- Risk: User A could access User B's loads if IDs are guessed

---

## 4. Security Gaps

### Missing Authorization Checks

**LoadBoardController.getLoad()** (line 50-54)
```java
@GetMapping("/{id}")
public LoadResponse getLoad(@PathVariable String id, @AuthenticationPrincipal String userId) {
    return loadService.getOpenLoad(id);  // userId not used!
}
```
- Any trucker can view any shipper's load details
- Fix: Pass userId to service, verify authorization

**RatingController.getTruckerSummary/getShipperProfile** (lines 71-80)
- Public endpoints, no rate limiting, no authentication
- Risk: Attacker can enumerate all truckers/shippers and build reputation database
- Fix: Add rate limiting, require authentication

**ProfileController**
- No verification that userId matches requested profile
- Risk: User A can update User B's profile
- Fix: Add @PreAuthorize or manual tenant/user check

### Input Validation Gaps

**CreateLoadRequest / UpdateLoadRequest** (DTOs)
- Gap: No validation that pickupFrom <= pickupTo, deliveryFrom <= deliveryTo
- Gap: No validation that dates are in future
- Gap: No validation for reasonable weight bounds (test shows 90K check but arbitrary upper limit)
- Risk: Invalid loads created (past dates, delivery before pickup)

**CancelLoadRequest** (line 7-8)
- Gap: No XSS protection on reason string passed to email
- Risk: HTML injection in notification emails

### Missing Rate Limiting

**AuthRateLimitFilter** exists but only protects auth endpoints
- Gap: No rate limiting on /api/v1/board, /api/v1/ratings, /api/v1/market
- Risk: Load board can be hammered; ratings can be enumerated; diesel prices DoS'd

### CORS Configuration

**SecurityConfig** (line 36-37)
- Reads origins from `app.cors.allowed-origins` config
- Gap: No validation that origins list is non-empty
- Gap: No check that origins are HTTPS in production
- Risk: Misconfiguration could allow any origin

---

## 5. Data Integrity Gaps

### Missing Database Constraints

**Loads Table**
- Gap: No CHECK constraint on status enum values
  - Migration V20260320_004 adds checks for state codes only
  - Status column can hold any value; no enum constraint
- Gap: No CHECK on trucker_id (nullable but should validate state transitions)
- Gap: No unique constraint preventing load with same shipper in same timeframe (business rule)

**Ratings Table** (V20260323_002)
- Gap: No FK constraint on reviewer_id to users(id)
- Gap: No FK constraint on reviewed_id to users(id)
- Risk: Orphaned ratings if user deleted

**Notifications Table** (V20260331_001)
- Gap: No FK to users(id) on user_id column
- Gap: No constraint linking notification to load_id when applicable
- Risk: Orphaned notifications

**Claims Table** (V20260320_007)
- Gap: No unique constraint preventing duplicate active claims on same load
  - Multiple active claims possible at DB level (conflict only at app level)

### Missing Database Indexes

**Loads Table**
- Existing: (tenant_id, shipper_id), (tenant_id, status), (tenant_id, created_at)
- Missing: idx_loads_trucker_status for `WHERE trucker_id = ? AND status IN (...)`
- Missing: idx_loads_status_deleted for `WHERE status = 'OPEN' AND deleted_at IS NULL`

**Claims Table**
- Existing: (tenant_id, load_id), (tenant_id, trucker_id), (load_id, status)
- Missing: idx_claims_trucker_status for active claims lookup

**Ratings Table**
- Gap: No indexes at all
- Missing: idx_ratings_load_reviewer, idx_ratings_reviewed_created

**Notifications Table**
- Gap: No indexes
- Missing: idx_notifications_user_created

### Soft Delete Inconsistency

**All tables use deleted_at for soft deletes**
- Gap: Not all queries consistently filter `deleted_at IS NULL`
- Risk: Deleted records could reappear in some queries

---

## 6. Priority Recommendations

### P0: Must Fix Before Production (5 items)

1. **Add Multi-Tenant Authorization Checks** (Security Critical)
   - Files: SecurityConfig.java, all controllers
   - Add @PreAuthorize to verify user's tenant matches resource tenant
   - Effort: 2-4 hours | Risk if skipped: Data breach, regulatory violation

2. **Complete Notification Integration** (Completeness)
   - File: LoadService.java
   - Add calls to notificationService in claimLoad() and cancelLoad()
   - Effort: 30 minutes | Risk if skipped: Truckers unaware of load changes

3. **Fix Null-Safe Notification Logic** (Stability)
   - File: NotificationService.java lines 32-34, 45, 54, 65
   - Replace .orElse(null) with proper exception/logging
   - Effort: 1 hour | Risk if skipped: Silent notification failures

4. **Add Race Condition Protection on Load Claim** (Data Integrity)
   - Files: LoadService.claimLoad(), Load entity
   - Add @Version for optimistic locking
   - Effort: 2-3 hours | Risk if skipped: Multiple truckers assigned same load

5. **Add Database Constraints for Status Enums** (Integrity)
   - New migration: V20260402_001__add_enum_constraints.sql
   - Add CHECK constraints on loads.status, claims.status
   - Effort: 1-2 hours | Risk if skipped: Invalid states persisted

### P1: High Priority (3 items)

6. **Create Test Files for Untested Services**
   - Create: ProfileServiceTest, NotificationServiceTest, EmailServiceTest, ProfileControllerTest, DocumentControllerTest
   - Effort: 20-24 hours | Impact: 80% code coverage

7. **Add Missing Database Indexes**
   - New migration with indexes on trucker_id, reviewed_id, user_id
   - Effort: 1-2 hours | Impact: 10-100x faster queries

8. **Fix LoadBoardController Authorization**
   - File: LoadBoardController.java line 50-54
   - Pass userId to getOpenLoad(), verify authorization
   - Effort: 30 minutes | Risk if skipped: Unauthorized data exposure

### P2: Medium Priority (2 items)

9. **Add Input Validation for Date Logic**
   - Files: CreateLoadRequest, UpdateLoadRequest validators
   - Validate pickupFrom <= pickupTo, dates in future
   - Effort: 2-3 hours

10. **Complete Frontend Test Suite**
    - Create tests for all hooks and pages
    - Effort: 30-40 hours | Impact: Frontend reliability

---

## Summary Statistics

| Category | Count | Severity |
|----------|-------|----------|
| Untested Services | 6 | High |
| Untested Controllers | 6 | High |
| Null-Pointer Risks | 5+ | Medium |
| Missing Constraints | 4 | Medium |
| Missing Indexes | 5 | Low-Medium |
| Authorization Gaps | 3 | Critical |
| Input Validation Gaps | 3 | Medium |
| Incomplete Features | 5 | Low-Medium |

**Total Critical/High Issues:** 17  
**Estimated Remediation Time:** 40-50 hours  
**Recommended Timeline:** Complete all P0 and P1 items before production deployment
