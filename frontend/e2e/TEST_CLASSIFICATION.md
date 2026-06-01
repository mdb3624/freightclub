# Phase 5 Test Classification & Refactoring Strategy

## Test Patterns Identified

### Pattern A: UI-Driven Login (REFACTOR with TestDataSeeder)
Tests that log in via UI form. Refactor to use TestDataSeeder for faster, more reliable setup.

**Refactored ✅:**
- ✅ login-integration.spec.ts
- ✅ shipper-profile.spec.ts
- ✅ shipper-dashboard.spec.ts
- ✅ shipper-post-load.spec.ts

**Remaining for Refactoring:**
- [ ] shipper-preferred-carriers.spec.ts (likely UI login)
- [ ] smoke.spec.ts (likely UI login or smoke tests)

---

### Pattern B: Route Mocking (KEEP AS-IS)
Tests that mock all API responses with `page.route()`. These are self-contained unit-test style tests that don't need refactoring - they're already isolated and don't require backend.

**Status: Keep As-Is:**
- ✅ trucker-pod-upload.spec.ts (route mocking)
- ✅ shipper-profile-setup.spec.ts (route mocking)

**Rationale:** Route mocking tests are intentionally isolated from the backend. Refactoring them to use TestDataSeeder would make them MORE complex (adding real backend dependency) without benefit. They serve a different purpose: isolated feature testing with full control over API responses.

---

### Pattern C: Multi-Context Tests (SPECIAL HANDLING)
Tests that open multiple browser contexts to verify multi-tenancy isolation.

**Status: Review for Pattern Fit:**
- ? shipper-profile-multi-tenant.spec.ts (uses browser contexts)
- ? carrier-public-profile.spec.ts (uses browser contexts, currently .skip())

**Approach:** Can use TestDataSeeder for setup, then open browser contexts for isolation testing. More complex refactor.

---

## Refactoring Decision Matrix

| Test File | Pattern | Action | Reason |
|-----------|---------|--------|--------|
| login-integration.spec.ts | UI Login | ✅ Refactored | Proven pattern |
| shipper-profile.spec.ts | UI Login | ✅ Refactored | Proven pattern |
| shipper-dashboard.spec.ts | UI Login | ✅ Refactored | Proven pattern |
| shipper-post-load.spec.ts | UI Login | ✅ Refactored | Proven pattern |
| shipper-preferred-carriers.spec.ts | Unknown | ⏳ Investigate | Classify first |
| smoke.spec.ts | Unknown | ⏳ Investigate | Classify first |
| trucker-pod-upload.spec.ts | Route Mocking | ✅ KEEP | Self-contained |
| shipper-profile-setup.spec.ts | Route Mocking | ✅ KEEP | Self-contained |
| carrier-public-profile.spec.ts | Browser Context | ⏸️ Skip | Infrastructure debt |
| shipper-profile-multi-tenant.spec.ts | Browser Context | ⏳ Investigate | Complex pattern |
| login-integration-old.spec.ts | Backup | 🗑️ DELETE | Cleanup |
| login-integration-refactored.spec.ts | Backup | 🗑️ DELETE | Cleanup |

---

## Next Steps for Team

### Priority 1: Quick Wins (Classify & Refactor)
```bash
# Check if shipper-preferred-carriers.spec.ts uses UI login
grep -n "getByLabel\|getByRole.*sign in" frontend/e2e/shipper-preferred-carriers.spec.ts

# If yes, apply TestDataSeeder pattern
# If route mocking, keep as-is
```

### Priority 2: Smoke Tests
```bash
# Classify smoke.spec.ts pattern
head -50 frontend/e2e/smoke.spec.ts
# Apply refactoring or keep, depending on pattern
```

### Priority 3: Multi-Context Tests (Deferred)
- shipper-profile-multi-tenant.spec.ts
- carrier-public-profile.spec.ts (currently .skip() - infrastructure debt)
- Complex refactor: needs TestDataSeeder + browser context pattern
- Suggest: Document pattern first, then implement

### Priority 4: Cleanup (Final)
- Remove login-integration-old.spec.ts (backup)
- Remove login-integration-refactored.spec.ts (no longer needed)

---

## Pattern Summary

**TestDataSeeder Pattern** (use for UI Login tests):
- Pros: Fast, reliable, real backend validation
- Cons: Requires backend to be running
- Tests: auth flow, profile completion, dashboard
- Count: 4 refactored, 2-3 remaining

**Route Mocking Pattern** (use for isolated feature tests):
- Pros: Self-contained, full response control, fast
- Cons: No real backend validation
- Tests: form submission details, UI states
- Count: 2 identified, keep as-is
- Decision: DON'T refactor - they serve different purpose

**Multi-Context Pattern** (use for multi-tenancy tests):
- Pros: Tests true isolation guarantees
- Cons: Complex, slower, more setup
- Tests: tenant isolation, multi-user scenarios
- Count: 2 identified
- Decision: Document pattern first, implement later

---

## Current Phase 5 Status

```
✅ COMPLETE:     5/13 tests (38%)
⏳ CLASSIFIED:   2/13 tests (keep route mocking as-is)
🔍 INVESTIGATE:  2/13 tests (shipper-preferred-carriers, smoke)
⏸️ DEFERRED:     3/13 tests (multi-context pattern, .skip())
🗑️ CLEANUP:      2/13 tests (remove backups)
```

**Actual Refactoring Needed: ~5-7 tests (not 10)**

Many remaining "tests" either:
- Use route mocking (intentionally isolated, no refactor needed)
- Are deferred (multi-context pattern, infrastructure debt)
- Are cleanup items (backups to remove)

---

## Lesson Learned

Not all tests need refactoring. Different patterns serve different purposes:
- **TestDataSeeder**: Real backend integration testing (auth, features)
- **Route Mocking**: Isolated unit-style testing (form behavior, edge cases)
- Both are valid; don't force TestDataSeeder everywhere

---

**Updated Phase 5 Target: 10-11/13 tests** (accounting for route-mocking keep-as-is and deferred multi-context tests)

Next step: Classify remaining unknown tests, then execute quick wins.
