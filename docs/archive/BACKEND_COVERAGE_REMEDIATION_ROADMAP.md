# Backend JaCoCo Coverage Remediation Roadmap

**Objective:** 49.3% → 70%+ instruction coverage  
**Strategy:** Targeted testing of high-impact service classes  
**Priority:** Phase A — Service integration tests (highest impact first)

---

## Coverage Gap Analysis

### Current State
- **Overall:** 49.3% instruction
- **Gap:** 20.7 percentage points to reach 70%
- **Affected:** 26+ classes at 0%, 30+ classes at <40%

### Highest Impact Targets (by lines untested × likelihood to test)
| Service | Current | Lines | Est. Value |
|---------|---------|-------|-----------|
| EiaFuelPriceService | 8% | 481 | Move +2-3% |
| ShipperProfileService | 40% | 348 | Move +3-4% |
| LoadApplicationService | 34% | 173 | Move +2-3% |
| ShipperService | 40% | 125 | Move +1-2% |
| MatchDiscoveryService | 19% | 64 | Move +0.5-1% |
| LoadDocumentPolicy | 0% | 33 | Move +0.3% |
| CreateLoadCommand | 0% | 21 | Move +0.2% |

### Phase A: Quick Wins (0-40% coverage → 60%+)
**Estimated Effort:** 20-30 hours  
**Target Coverage:** 55-60%

1. **LoadDocumentPolicy** (0% → 80%)
   - Type: Policy class (simple business rules)
   - Tests: Load status validation, role-based access
   - Effort: 2 hours

2. **CreateLoadCommand** (0% → 100%)
   - Type: Command object (data holder)
   - Tests: Constructor, getters, validation
   - Effort: 1 hour

3. **MatchDiscoveryService** (19% → 70%)
   - Type: Application service
   - Tests: Matching algorithm, edge cases
   - Effort: 4 hours

4. **SimpleLocationScorer** (13% → 80%)
   - Type: Utility service
   - Tests: Scoring algorithm, boundary values
   - Effort: 2 hours

5. **EmailService** (14% → 60%)
   - Type: Integration service
   - Tests: Template rendering, email formatting
   - Effort: 3 hours

### Phase B: Core Services (40-69% → 65%+)
**Estimated Effort:** 20-25 hours  
**Target Coverage:** 60-65%

1. **ShipperService** (40% → 75%)
   - Type: Domain service
   - Tests: Profile CRUD, validation, multi-tenancy
   - Effort: 6 hours

2. **LoadApplicationService** (34% → 70%)
   - Type: Application service
   - Tests: Load creation, status transitions
   - Effort: 8 hours

3. **ShipperProfileService** (40% → 70%)
   - Type: Application service
   - Tests: Profile updates, completion tracking
   - Effort: 6 hours

### Phase C: Remaining Gap (65-70%+)
**Estimated Effort:** 15-20 hours  
**Target Coverage:** 70%+

1. **EiaFuelPriceService** (8% → 50%)
   - Type: External API integration
   - Tests: API response parsing, caching
   - Effort: 5 hours

2. **PaymentAccountService** (69% → 85%)
   - Type: Payment domain service
   - Tests: Account operations, edge cases
   - Effort: 3 hours

3. **Remaining DTOs/Entities**
   - Add getters/setters tests
   - Ensure all constructor variants covered
   - Effort: 8 hours

---

## Implementation Plan

### Testing Approach
- Use existing test patterns: JUnit 5 + Mockito + @DataJpaTest for integration
- Follow TDD: Write test first, then implement to pass
- Maintain multi-tenancy isolation (all tests use TenantContextHolder)
- Use fixtures from existing test suites for consistency

### Step 1: Immediate (LoadDocumentPolicy + CreateLoadCommand)
```bash
# File: backend/src/test/java/com/freightclub/service/LoadDocumentPolicyTest.java
# - Test load status validation
# - Test role-based access (TRUCKER, SHIPPER)
# Expect: +0.5% coverage gain

# File: backend/src/test/java/com/freightclub/modules/load/application/CreateLoadCommandTest.java
# - Test command construction
# - Test builder pattern
# Expect: +0.2% coverage gain
```

### Step 2: MatchDiscoveryService (4 hours)
```bash
# File: backend/src/test/java/com/freightclub/modules/load/application/MatchDiscoveryServiceTest.java
# - Mock load repository
# - Test matching algorithm
# - Test carrier filtering
# Expect: +1% coverage gain
```

### Step 3: ShipperService Integration Tests (6 hours)
```bash
# File: backend/src/test/java/com/freightclub/modules/shipper/application/ShipperServiceIntegrationTest.java
# - Use @SpringBootTest + real database
# - Test profile CRUD operations
# - Test multi-tenancy isolation
# Expect: +2% coverage gain
```

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Instruction Coverage | 49.3% | 70%+ |
| Branch Coverage | 33.7% | 60%+ |
| Test Count | 328 | 400+ |
| Test Pass Rate | 100% | 100% |

---

## Execution Timeline

### Day 1 (4 hours)
- ✅ LoadDocumentPolicy tests
- ✅ CreateLoadCommand tests
- ✅ SimpleLocationScorer tests
- Expected coverage: 51%

### Day 2 (6 hours)
- ✅ MatchDiscoveryService tests
- ✅ EmailService tests
- Expected coverage: 53%

### Day 3 (8 hours)
- ✅ ShipperService tests (Phase B start)
- ✅ LoadApplicationService tests (partial)
- Expected coverage: 58%

### Days 4-5 (12 hours)
- ✅ Complete LoadApplicationService
- ✅ ShipperProfileService tests
- ✅ EiaFuelPriceService tests (partial)
- Expected coverage: 65-68%

### Day 6 (8 hours)
- ✅ PaymentAccountService edge cases
- ✅ DTO/Entity constructor tests
- ✅ Remaining coverage gaps
- Expected coverage: 70%+

---

## Notes

- **Blockers:** EiaFuelPriceService requires mocking external API (EIA) — use WireMock or Mockito
- **Multi-tenancy:** All tests must use TenantContextHolder.setTenant() to avoid RLS violations
- **Soft deletes:** All repository queries must verify `deleted_at IS NULL` filtering
- **Order:** Test smallest/simplest classes first (commands, policies) → work up to service classes

---

**Status:** Ready for implementation  
**Owner:** Backend Team (CODER role)  
**Target Completion:** Within 5 business days
