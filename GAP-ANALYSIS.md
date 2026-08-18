# FreightClub Codebase Gap Analysis

**Generated:** 2026-07-23  
**Scope:** Backend (Java/Spring), Frontend (React/TS), Database (Flyway Migrations)  
**Coverage:** Unit tests, integration tests, E2E tests, security, data integrity, error handling

---

## 1. Test Coverage Gaps

### 1.1 Critical Services Without Unit Tests (27 identified)

**Security-Critical (HIGH PRIORITY):**
- `AuthService.java` — No unit tests (login/register/refresh logic, tenant context binding)
- `JwtService.java` — No unit tests (token generation, validation, claims extraction)
- `RefreshTokenService.java` — No unit tests (token rotation, revocation)

**Payment/Financial (HIGH PRIORITY):**
- `PaymentService.java` — No unit tests (Stripe integration, fee calculation, invoice lifecycle)
- `PaymentAccountService.java` — No unit tests (account setup, payout configuration)

**Core Domain Services (MEDIUM PRIORITY):**
- `LoadApplicationService.java` — No unit tests (load creation, status transitions)
- `LoadAssignmentService.java` — No unit tests (assignment logic, carrier assignment)
- `LoadViewTrackingService.java` — No unit tests (view/tracking functionality)
- `LoadQueryService.java` — No unit tests (query building, filtering)
- `MatchDiscoveryService.java` — No unit tests (matching algorithm)
- `CarrierProfileService.java` — No unit tests (profile management, caching)
- `CarrierCostProfileService.java` — No unit tests (cost structure management)
- `CarrierSearchService.java` — No unit tests (carrier lookup, filtering)
- `ShipperProfileService.java` — No unit tests (shipper profile updates)
- `ShipperService.java` — No unit tests (shipper account operations)
- `ShipmentStatusService.java` — No unit tests (shipment tracking)
- `ShipperPreferredCarrierService.java` — No unit tests (preference management)
- `BlockedCarrierService.java` — No unit tests (blocking logic)
- `KPISummaryService.java` — No unit tests (dashboard KPI aggregation)

**Document/Audit (MEDIUM PRIORITY):**
- `DocumentService.java` — No unit tests (document storage, retrieval)
- `DocumentAuditService.java` — No unit tests (audit trail)
- `BolGeneratorService.java` — No unit tests (BOL PDF generation)
- `BolAttestationService.java` — No unit tests (BOL attestation workflow)

**Recommendation Engine (LOW PRIORITY but unverified):**
- `RecommendationService.java` — No unit tests
- `LoadRecommendationService.java` — No unit tests

**Utility Services (LOW PRIORITY):**
- `EiaFuelPriceService.java` — No unit tests (external API integration)
- `EmailService.java` — No unit tests (email delivery)

---

## 2. Unhandled Error Paths

### 2.1 Missing Event Publishing (Incomplete Features)

**File:** `LoadAssignmentService.java` (lines 47, 69, 87, 124)

```java
// Line 47: TODO: Publish LoadAssignedToCarrier event for notifications
return repository.save(assignment);

// Line 69: TODO: Publish events for old and new carrier notifications
return repository.save(assignment);

// Line 87: TODO: Publish LoadAssignmentRevoked event
repository.save(la);

// Line 124: TODO: Publish LoadAssignmentAccepted event
repository.save(la);
```

**Impact:** Notifications to carriers are not triggered when loads are assigned, reassigned, revoked, or accepted. Shippers and truckers cannot receive real-time updates.

### 2.2 Stripe Error Handling

**File:** `PaymentService.java` (lines 122-136, 143-150)

The following methods throw checked `Exception` but do not document specific failure modes:

```java
public String createPaymentIntent(long loadAmountCents, String shipperEmail,
                                  String invoiceId) throws Exception {
    // ... Stripe API call without specific exception handling
    return PaymentIntent.create(params).getClientSecret();
}

public void transferToTrucker(long truckerPayoutCents, String truckerStripeAccountId,
                              String invoiceId) throws Exception {
    // ... Stripe API call without specific exception handling
}
```

**Risk:** Network errors, Stripe API failures, invalid account IDs, rate limiting — all bubble up as generic `Exception`. No retry logic, no fallback to invoice FAILED status, no logging of Stripe error codes.

### 2.3 Null Pointer Risks in AuthService

**File:** `AuthService.java` (lines 136-137, 163-164)

```java
user = userRepository.findByEmailAndDeletedAtIsNull(request.email())
    .orElseThrow(() -> new IllegalStateException("User disappeared after authentication"));

user = userRepository.findById(rotation.userId())
    .orElseThrow(() -> new IllegalStateException("User not found for refresh token"));
```

**Risk:** While error handling is present, these rely on database consistency after authentication. If a user is soft-deleted between authentication and the subsequent query, the error message is generic. No logging of the user ID or email for troubleshooting.

---

## 3. Incomplete Features

### 3.1 Event Publishing Pipeline (Core Gap)

Multiple services implement business logic but do NOT publish domain events:

1. **LoadAssignmentService** (4 TODOs identified)
   - No events fired when assignments change
   - Notifications service cannot react to carrier assignments
   - Shipper/carrier real-time updates broken

2. **Payment/Settlement Path**
   - Invoice creation has no event listener for downstream processing
   - No event for payment received → no settlement triggering
   - No event for transfer success → no notification to trucker

3. **Load Lifecycle**
   - Load status transitions may lack event publishing
   - Marketplace visibility not triggered by domain changes

**Expected:** Each state change should publish an event (LoadAssignedEvent, LoadClaimedEvent, PaymentReceivedEvent, etc.) that listeners consume for notifications, audit logs, and analytics.

### 3.2 Carrier Network Features (Unimplemented Epic)

From `docs/project/Sprint_Log.md`:
- **Lane Tags**: No entity/controller for load-specific lane tags (US-843+)
- **Carrier Reviews**: Not yet implemented (US-846+)
- **Assign-to-Load**: Cannot programmatically assign specific carriers (only via marketplace matching)
- **Quote Processing**: Not integrated with assignment workflow

**Controllers:** CarrierCostProfileController, CarrierPublicProfileController exist but do not expose full management APIs.

### 3.3 Admin Dashboard (Zero Precedent)

**Status:** Marked `MIGRATION_PENDING` (US-750, US-751)
- No `docs/standards/ADMIN_DESIGN_SYSTEM.md` exists
- No `docs/roles/ADMIN_HFD_RULES.md` exists
- No admin UI components in frontend
- No admin-scoped controller or service

**Why:** Admin story never kicked off; no HFD/design precedent to code from. Creating these files without prior BA/HFD work would violate the Sequential Lock Protocol.

### 3.4 KPI Summary Duplicate Implementation

**Identified Gap:** `US-761` (Phase 7) and `US-820` (Phase 10) both implement KPI aggregation.

- **US-761:** DashboardSummaryService, LoadQueryService (Phase 7, MIGRATION_PENDING)
- **US-820:** KPISummaryService (Phase 10, active)

Both versions exist; no deprecation path. Shipper code may be calling the wrong endpoint.

---

## 4. Security Gaps

### 4.1 Controllers Missing @PreAuthorize Annotations

**Severity:** LOW (most controllers are protected)

**Verified Secure:**
- `NotificationController` (all endpoints) — @PreAuthorize("isAuthenticated()")
- `LoadBoardController` (all endpoints) — @PreAuthorize("isAuthenticated()")
- `DocumentController` (most endpoints) — @PreAuthorize checks in place
- `LoadController` (protected endpoints) — @PreAuthorize("@loadService.isOwner(#id)")

**Deliberately Public (Correct):**
- `AuthController` — /register, /login, /refresh, /logout (intentionally unauthenticated)
- `MarketController` — /diesel-prices (public market data)

**Verification Needed:**
- Review all endpoints in `ProfileController`, `RatingController` for missing @PreAuthorize
- Verify `CarrierPublicProfileController` public endpoints do not expose private fields

### 4.2 JWT Validation Edge Cases

**File:** `JwtService.java` (lines 46-61)

```java
public Claims validateAndGetClaims(String token) {
    Claims claims = Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    // Manual audience check
    if (!issuer.equals(claims.getIssuer())) {
        throw new io.jsonwebtoken.MalformedJwtException("Invalid issuer");
    }
    // ...
    return claims;
}
```

**Risk:**
- No try-catch around `parseSignedClaims()` — if token is malformed, the raw JJWT exception bubbles up
- JJWT exceptions (ExpiredJwtException, MalformedJwtException, SignatureException) should be caught and logged separately
- No rate-limiting on repeated invalid tokens (potential JWT brute-force)

### 4.3 Validation Gaps in DTOs

**Identified Pattern:** `@Validated` decorator used in controllers but no @NotBlank, @NotNull on request DTOs.

Example missing validation:
- `RegisterRequest.email()` — should validate email format, length
- `LoginRequest.password()` — should validate non-null
- File uploads in DocumentController — no file type/size validation

**Risk:** Invalid data reaches service layer; duplicate validation logic in business methods instead of controller-level bean validation.

---

## 5. Data Integrity Gaps

### 5.1 Foreign Key Constraints (Mostly Good)

**Status:** Soft delete + FK constraints implemented correctly.

**Sample:** Flyway V20260527_1100__Phase7_Complete_Tables.sql

```sql
CONSTRAINT fk_load_analytics_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
CONSTRAINT fk_carrier_performance_tenant FOREIGN KEY (tenant_id) REFERENCES freightclub.tenants(id)
```

**Verified:** All FK constraints target `tenants(id)` (correct) and NOT `users(tenant_id)` (would be wrong).

### 5.2 Soft Delete Consistency (Confirmed Implemented)

**Repositories follow pattern:** `deletedAt IS NULL` in all core queries.

**Example:** UserRepository.java
```java
Optional<User> findByEmailAndDeletedAtIsNull(String email);
```

**Example:** LoadRepository.java
```java
@Query("SELECT l FROM Load l WHERE l.id = :id AND l.deletedAt IS NULL")
```

**Verified:** Composite index `(tenant_id, deleted_at)` exists on core tables (load_analytics, load_financial, carrier_performance).

### 5.3 Potential Data Integrity Issues

#### 5.3a Missing Constraint: Orphaned Loads

**Issue:** No check that `load_id` in `load_financial`, `load_analytics` references a non-deleted load.

```sql
-- MISSING: 
CONSTRAINT fk_load_financial_load FOREIGN KEY (load_id, tenant_id) 
  REFERENCES loads(id, tenant_id) -- Composite FK needed if load_id not globally unique
```

**Risk:** Financial records persist after load soft-delete; orphaned analytics records clutter reports.

#### 5.3b Missing Constraint: Orphaned Assignments

**File:** LoadAssignmentService, LoadAssignment entity

**Issue:** When a carrier is deleted or deactivated, assigned loads are not updated.

**Risk:** Loads remain "assigned" to non-existent carriers; reassign workflow broken.

### 5.4 RLS Policy Enforcement

**Status:** Implemented (V20260721_1401 onwards)

**Verified:** Row-level security policies in place:
- `users_tenant_isolation`
- `load_analytics_tenant_isolation`
- `carrier_performance_tenant_isolation`
- `load_financial_tenant_isolation`

**Gotcha:** Admin role (`neondb_owner`) not confirmed to have BYPASSRLS (revoked 2026-07-23 per MEMORY.md).

---

## 6. Priority Recommendations (Top 5 Fixes)

### Priority 1: Add Unit Tests for AuthService, JwtService, RefreshTokenService

**Effort:** ~8 hours (3 services, 15-20 tests each)

**Reasoning:** Authentication is the foundation; JWT validation and refresh token rotation are high-risk. Currently zero test coverage. Implement:
- Valid token generation and validation
- Expired token rejection
- Invalid signature detection
- Refresh token rotation and revocation
- Multi-tenant isolation during auth

**File:** Create `backend/src/test/java/com/freightclub/security/`
- AuthServiceTest.java (register happy path, join code validation, email collision)
- JwtServiceTest.java (token generation, claim extraction, expiry, signature validation)
- RefreshTokenServiceTest.java (rotation, revocation, token format)

**Gate:** 70% branch coverage minimum before merge.

---

### Priority 2: Implement Event Publishing in LoadAssignmentService

**Effort:** ~4 hours (1 service, 4 events)

**Reasoning:** Notifications are silently broken. Shippers/truckers see no status updates when assignments change.

**Fix:**
1. Define events:
   ```java
   public record LoadAssignedEvent(String loadId, String carrierId, OffsetDateTime assignedAt) {}
   public record LoadReassignedEvent(String loadId, String oldCarrierId, String newCarrierId, OffsetDateTime reassignedAt) {}
   public record LoadAssignmentRevokedEvent(String loadId, String carrierId, OffsetDateTime revokedAt) {}
   public record LoadAssignmentAcceptedEvent(String loadId, String carrierId, OffsetDateTime acceptedAt) {}
   ```

2. Inject `ApplicationEventPublisher` and publish in each method
3. Create listeners in NotificationService to react to events

**Files:**
- LoadAssignmentService.java (replace 4 TODOs)
- LoadAssignmentEvent*.java (new event classes)
- NotificationService.java (add @TransactionalEventListener methods)

**Gate:** E2E test confirms notification received after assignment.

---

### Priority 3: Add Unit Tests for PaymentService

**Effort:** ~6 hours (Stripe mocking, fee calculation, invoice lifecycle)

**Reasoning:** Financial transactions are mission-critical; Stripe integration is untested. Current error handling is opaque (generic `throws Exception`).

**Fix:**
1. Mock Stripe API using WireMock or Mockito
2. Test fee calculation edge cases (rounding, zero amounts)
3. Test invoice state transitions (PENDING → PAID, FAILED)
4. Test transfer failures and retry logic

**New Tests:**
- PaymentServiceTest.java (fee calculation, invoice CRUD, invoice status)
- PaymentServiceStripeIntegrationTest.java (mocked Stripe API, create payment intent, transfer, webhook)

**Also Fix:** Add specific exception handling for Stripe exceptions:
```java
try {
    return PaymentIntent.create(params).getClientSecret();
} catch (com.stripe.exception.CardException e) {
    log.error("Card error: {}", e.getMessage());
    throw new PaymentProcessingException("Card declined: " + e.getMessage());
} catch (com.stripe.exception.RateLimitException e) {
    log.warn("Stripe rate limit hit; retry after: {}", e.getRetryAfter());
    throw new TemporaryPaymentException("Stripe rate limited");
} catch (Exception e) {
    log.error("Unexpected Stripe error", e);
    throw new PaymentProcessingException("Payment processing failed");
}
```

**Gate:** 70% branch coverage, all exception paths tested.

---

### Priority 4: Add Unit Tests for LoadAssignmentService and Core Domain Services

**Effort:** ~12 hours (5-6 services, edge case coverage)

**Reasoning:** Core load/carrier workflows are untested. State machine transitions (assignment → acceptance → completion) have no automated verification.

**Files to Create:**
- backend/src/test/java/com/freightclub/modules/load/application/
  - LoadAssignmentServiceTest.java (happy path, duplicate assignment, missing assignment, carrier mismatch)
  - LoadApplicationServiceTest.java (create, publish, status transitions)
  - MatchDiscoveryServiceTest.java (matching algorithm, scoring)

- backend/src/test/java/com/freightclub/modules/carrier/application/
  - CarrierProfileServiceTest.java (caching, profile updates, completeness)
  - CarrierSearchServiceTest.java (search filters, pagination)

**Gate:** 70% branch coverage, multi-tenant isolation verified.

---

### Priority 5: Fix FK Constraints on Financial/Analytics Tables

**Effort:** ~2 hours (1 Flyway migration)

**Reasoning:** Orphaned financial records can accumulate if loads are soft-deleted. Analytics reports will include dead data.

**Fix:**

Create `V20260723_1500__Add_FK_Constraints_Financial_Analytics.sql`:

```sql
-- Cascade soft-delete: when load is deleted, mark related financial records as deleted
ALTER TABLE freightclub.load_financial 
ADD CONSTRAINT fk_load_financial_load FOREIGN KEY (load_id, tenant_id) 
  REFERENCES freightclub.loads(id, tenant_id)
  ON DELETE RESTRICT;

-- Add trigger to soft-delete orphaned financial records when load is deleted
CREATE OR REPLACE FUNCTION mark_load_financial_deleted() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE freightclub.load_financial 
  SET deleted_at = NOW() 
  WHERE load_id = NEW.id 
    AND tenant_id = NEW.tenant_id 
    AND deleted_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_load_financial_cascade_delete
AFTER UPDATE OF deleted_at ON freightclub.loads
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION mark_load_financial_deleted();

-- Same for load_analytics
ALTER TABLE freightclub.load_analytics 
ADD CONSTRAINT fk_load_analytics_load FOREIGN KEY (load_id, tenant_id) 
  REFERENCES freightclub.loads(id, tenant_id)
  ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION mark_load_analytics_deleted() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE freightclub.load_analytics 
  SET deleted_at = NOW() 
  WHERE load_id = NEW.id 
    AND tenant_id = NEW.tenant_id 
    AND deleted_at IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_load_analytics_cascade_delete
AFTER UPDATE OF deleted_at ON freightclub.loads
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL)
EXECUTE FUNCTION mark_load_analytics_deleted();
```

**Gate:** Verify triggers execute correctly in test environment; run full test suite.

---

## Summary Table

| Gap Category | Count | Severity | Effort |
|---|---|---|---|
| Services without tests | 27 | HIGH | 40+ hours |
| Missing event publishers | 4 | HIGH | 4 hours |
| Stripe error handling | 2 methods | HIGH | 2 hours |
| Missing FK constraints | 2 tables | MEDIUM | 2 hours |
| Admin UI unimplemented | 2 stories | LOW | Future epic |
| KPI duplicate logic | 2 services | MEDIUM | Refactoring task |
| Security validations | 5 areas | LOW | 3 hours |

---

## Implementation Sequencing

1. **Week 1:** Priority 1 (AuthService tests) + Priority 5 (FK constraints)
2. **Week 2:** Priority 2 (Event publishing) + Priority 3 (PaymentService tests)
3. **Week 3:** Priority 4 (Core domain tests)
4. **Week 4+:** Backlog (Admin stories, KPI consolidation, Carrier Network epic)

**CI Gate:** All tests passing, 70% branch coverage minimum, before merge to main.

---

## Appendix: Files Needing Review

### Backend Services (No Tests)
- C:/projects/freightclub/backend/src/main/java/com/freightclub/service/AuthService.java
- C:/projects/freightclub/backend/src/main/java/com/freightclub/security/JwtService.java
- C:/projects/freightclub/backend/src/main/java/com/freightclub/security/RefreshTokenService.java
- C:/projects/freightclub/backend/src/main/java/com/freightclub/modules/payment/application/PaymentService.java
- C:/projects/freightclub/backend/src/main/java/com/freightclub/modules/load/application/LoadAssignmentService.java
- C:/projects/freightclub/backend/src/main/java/com/freightclub/modules/load/application/LoadApplicationService.java

### Database Migrations (Constraint Gaps)
- C:/projects/freightclub/backend/src/main/resources/db/migration/V20260527_1100__Phase7_Complete_Tables.sql

### Incomplete Features
- C:/projects/freightclub/backend/src/main/java/com/freightclub/service/NotificationService.java (event listeners)
- C:/projects/freightclub/backend/src/main/java/com/freightclub/modules/load/application/LoadAssignmentService.java (4 TODOs)

---

**End of Gap Analysis**
