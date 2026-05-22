# Test Execution Checklist — SEC-001, SEC-002

**Status:** REQUIRES LOCAL EXECUTION  
**Tests:** AuthorizationGateTest, RLSPoliciesTest  
**Gate:** JaCoCo ≥80% branch coverage + 0 test failures  

---

## Pre-Merge Requirements

### SEC-001: Authorization Gates

Run from project root:
```bash
mvn clean test -Dtest=AuthorizationGateTest
```

**Expected Results:**
- ✅ testUnauthorizedUserCannotDeleteOtherTenantLoad → PASS
- ✅ testAuthorizedUserCanDeleteOwnLoad → PASS
- ✅ testUnauthorizedUserCannotUpdateOtherTenantProfile → PASS
- ✅ testAuthorizedUserCanUpdateOwnProfile → PASS
- ✅ testIsOwnerMethodChecksTenantIdCorrectly → PASS
- **Coverage:** AuthorizationGateTest ≥80% branch coverage

### SEC-002: RLS Policies

Run from project root:
```bash
mvn clean test -Dtest=RLSPoliciesTest
```

**Expected Results:**
- ✅ testRLSBlocksCrossTenantSelectMessageOutbox → PASS
- ✅ testRLSBlocksCrossTenantInsertMessageOutbox → PASS
- ✅ testRLSBlocksCrossTenantUpdateShipperProfile → PASS
- ✅ testRLSBlocksCrossTenantDeleteShipperProfile → PASS
- ✅ testRLSAllowsSameTenantSelect → PASS
- ✅ testRLSAllowsSameTenantUpdate → PASS
- **Coverage:** RLSPoliciesTest ≥80% branch coverage

### Full Backend Coverage Check

After all tests pass individually:
```bash
mvn clean verify
```

**Gate:** JaCoCo overall ≥70% branch coverage maintained

---

## Merge Gate

| Requirement | Status | Action |
|---|---|---|
| SEC-001 tests pass | ⏳ PENDING | Run AuthorizationGateTest locally |
| SEC-002 tests pass | ⏳ PENDING | Run RLSPoliciesTest locally |
| JaCoCo ≥80% (SEC stories) | ⏳ PENDING | Verify via `mvn verify` |
| JaCoCo ≥70% (overall) | ⏳ PENDING | Verify via `mvn verify` |
| Code review PASSED | ✅ DONE | Reviewer approved with conditions |
| Flyway migration idempotent | ✅ DONE | V20260522_1400 uses DO block pattern |

---

## Approval Path

1. Run all tests locally ← **YOU ARE HERE**
2. Confirm 0 failures and ≥80% coverage
3. Run `mvn verify` to confirm overall coverage
4. Push to feature branch
5. Librarian marks stories as DONE in Story_Map.md

**DO NOT MERGE UNTIL:** All tests pass locally and coverage gates met.
