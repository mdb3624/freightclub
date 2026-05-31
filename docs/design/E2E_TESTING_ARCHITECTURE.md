# E2E Testing Architecture (US-900)

**Author:** ARCHITECT Role  
**Date:** 2026-05-31  
**Status:** DESIGN_APPROVED  
**Input Gate:** BA acceptance criteria (frozen)  
**Output Gate:** CODER implementation roadmap  

---

## Executive Summary

**Problem:** Flaky integration tests (6/10 CI passes) due to hard-coded waits, UI-driven setup, fragile selectors, and no debugging visibility.

**Solution:** Production-ready E2E testing infrastructure using:
1. **Page Object Model (POM)** — Encapsulate selectors in fixtures
2. **Web-First Assertions** — Explicit waits, no hard-coded timeouts
3. **API-Driven Fixtures** — Direct REST calls replace UI setup
4. **Trace-Based Debugging** — Playwright Inspector for failure analysis
5. **Data-testid Mandatory** — Resilient to CSS changes
6. **Multi-Tenancy Aware** — Explicit tenant context in all operations

**Outcome:** 10/10 CI passes, 2-5s per test, <15min debugging via traces.

---

## Design Decisions

### 1. Serial Test Execution (workers: 1)

**Decision:** Configure Playwright to run tests sequentially, not in parallel.

**Why:** 
- Shared test DB prevents parallel writes (race conditions)
- Auth state fixtures are single-user per run
- Test isolation easier to verify

**Trade-off:** Slower total runtime (~5-10min for 10 tests) vs. reliability

**Config:**
```typescript
// playwright.config.ts
workers: process.env.CI ? 1 : 1, // Always serial
fullyParallel: false,
```

---

### 2. Data-testid Mandatory Selectors

**Decision:** All interactive elements require `data-testid` attributes. Reject CSS/XPath selectors in tests.

**Why:**
- CSS selectors break when styles change (fragile)
- XPath breaks with DOM restructuring (fragile)
- data-testid is semantic + resilient (survives refactors)

**How:**
```jsx
// Component
<input data-testid="email-input" type="email" />
<button data-testid="login-submit-btn">Sign In</button>

// Test (resilient)
await page.locator('[data-testid="email-input"]').fill(user.email);
```

**Naming Convention:**
- Inputs: `{field}-input` (email-input, password-input)
- Buttons: `{action}-btn` (login-submit-btn, register-next-btn)
- Containers: `{page}-container` (dashboard-container, load-board-container)
- Errors: `{field}-error` (email-input-error)

---

### 3. Web-First Assertions with Explicit Timeouts

**Decision:** Use `expect().toBeVisible()` and related web-first assertions instead of hard-coded waits.

**Why:**
- Hard-coded `waitForTimeout(500)` fails on slow CI
- Web-first waits up to specified timeout (default 5s)
- More reliable on varying infrastructure

**How:**
```typescript
// ❌ WRONG: Hard-coded, brittle
await page.waitForTimeout(500);
const error = await errorElement.isVisible();

// ✅ CORRECT: Web-first, resilient
await expect(errorElement).toBeVisible({ timeout: 5000 });
```

**Timeout Thresholds:**
- UI interactions: 3-5s (elements should appear quickly)
- API responses: 5-10s (backend may be slow)
- Global test timeout: 30s (entire test max)

---

### 4. API-Driven Test Data Seeding (Not UI)

**Decision:** Create test users, loads, carriers via REST API endpoints, not UI automation.

**Why:**
- UI setup is slow (click form, wait, submit, wait)
- API setup is fast (direct HTTP POST)
- No UI flakiness in test setup (separate from feature being tested)

**How:**
```typescript
// ✅ API-driven fixture (fast, reliable)
const seeder = new TestDataSeeder(request);
const user = await seeder.createTestUser({ email: 'test@example.com' });
const carrier = await seeder.createCarrier(user.tenantId, user.id);
const load = await seeder.createLoad(user.tenantId, { equipmentType: 'DRY_VAN' });

try {
  // Test feature here...
} finally {
  // Automatic cleanup
  await seeder.cleanup();
}
```

**FK Dependency Ordering:**
1. **Tenant** — Created implicitly with user registration
2. **User** — Created via `/api/test/auth/register`
3. **Carrier** — Created via `/api/v1/carriers` (needs tenant context)
4. **Load** — Created via `/api/v1/loads` (needs tenant context)

**Cleanup (reverse order):** Loads → Carriers → Users

---

### 5. Trace-Based Debugging Infrastructure

**Decision:** Automatically generate Playwright trace files on test failure, provide analysis workflow.

**Why:**
- Trace contains: Network requests, DOM snapshots, console logs, screenshots, video
- Enables offline debugging (no need to reproduce)
- Timestamp correlation with backend logs

**How:**
```typescript
test.beforeEach(async ({ context }) => {
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });
});

test.afterEach(async ({ context }, testInfo) => {
  if (testInfo.status !== 'passed') {
    await context.tracing.stop({
      path: `test-results/trace-${testInfo.title}-${Date.now()}.zip`
    });
  } else {
    await context.tracing.stop(); // Discard on pass
  }
});
```

**Debugging Workflow:**
```bash
# 1. Open trace in Playwright Inspector
npx playwright show-trace test-results/trace-*.zip

# 2. Inspect Network tab
# → Look at failed API call status code and response

# 3. Check DOM Snapshot at failure moment
# → Is element present? Hidden? Wrong attributes?

# 4. Correlate backend logs at request timestamp
# → Backend error message explains why API returned error
```

---

### 6. Multi-Tenancy Awareness

**Decision:** All test fixtures include explicit tenant context (X-Tenant-ID headers, TenantContextHolder).

**Why:**
- Platform is multi-tenant; cross-tenant bugs are critical
- Test fixtures must isolate by tenant
- Must verify RLS policies work in tests

**How:**
```typescript
// Fixture creates user with implicit tenant
const user = await seeder.createTestUser();
// Returns: { id, email, tenantId, ... }

// All subsequent API calls include tenant context
await seeder.createCarrier(user.tenantId, user.id);
await seeder.createLoad(user.tenantId);

// Tests verify tenant isolation
test('should not see other tenant loads', async ({ page, request }) => {
  const seeder1 = new TestDataSeeder(request);
  const user1 = await seeder1.createTestUser();
  const load1 = await seeder1.createLoad(user1.tenantId);

  // User2 tries to access User1's load (should fail)
  const seeder2 = new TestDataSeeder(request);
  const user2 = await seeder2.createTestUser();
  
  const response = await request.get(`/api/v1/loads/${load1.id}`, {
    headers: { 'X-Tenant-ID': user2.tenantId }
  });
  
  expect(response.status()).toBe(403); // Forbidden
});
```

---

### 7. Global Setup/Teardown Hooks

**Decision:** Run setup once before all tests, teardown once after.

**Why:**
- Backend health checks prevent test runs on broken infra
- Auth state initialization avoids per-test registration
- Efficient use of test endpoints

**Global Setup (`frontend/e2e/fixtures/global-setup.ts`):**
1. Poll `/actuator/health` (30s timeout, 1s retry) until Spring Boot is ready
2. Register test user via `/api/test/auth/register`
3. Extract refresh token from Set-Cookie header
4. Initialize browser context with refresh token cookie
5. Navigate to frontend (triggers AuthInitializer → access token fetch)
6. Save authenticated state to `auth.json`

**Global Teardown (`frontend/e2e/fixtures/global-teardown.ts`):**
- Placeholder for future: cleanup test users, reset shared state

---

### 8. Fixture Pattern: TestDataSeeder Class

**Decision:** Encapsulate API test data creation in `TestDataSeeder` class.

**Why:**
- Reusable across all tests (not repeating API calls)
- Tracks created resources for cleanup
- Implements FK dependency ordering automatically
- Multi-tenancy baked in

**Class Structure:**
```typescript
class TestDataSeeder {
  private apiContext: APIRequestContext;
  private createdResources: Map<string, any[]>;

  async createTestUser(overrides?: Partial<TestUser>): Promise<TestUser>
  async createCarrier(tenantId, userId, overrides?): Promise<TestCarrier>
  async createLoad(tenantId, overrides?): Promise<TestLoad>
  async cleanup(): Promise<void>
  private getTenantHeaders(tenantId): Record<string, string>
  private trackResource(type, resource): void
  private deleteResource(type, id, tenantId?): Promise<void>
}
```

---

## Configuration

### playwright.config.ts

```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,           // Serial execution
  retries: process.env.CI ? 2 : 0,
  workers: 1,                      // Always serial
  globalSetup: './e2e/fixtures/global-setup.ts',
  globalTeardown: './e2e/fixtures/global-teardown.ts',
  use: {
    trace: 'retain-on-failure',   // Save traces on failure
    video: 'retain-on-failure',   // Record video on failure
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:9090',
    storageState: 'auth.json',    // Loaded from global-setup
  },
  timeout: 30_000,                // Global test timeout
  expect: {
    timeout: 5000,                // Assertion timeout (web-first)
  },
});
```

### Backend Test Endpoints

**Endpoints required for E2E tests:**

```
POST /api/test/auth/register
├─ Input: { email, password, firstName, lastName, role, companyName }
├─ Output: { userId, tenantId }
└─ Headers: Set-Cookie: refreshToken=...

DELETE /api/test/users/{userId}
├─ Input: userId path parameter
├─ Output: 204 No Content
└─ Headers: X-Tenant-ID (optional, for cleanup)
```

**Gating:** Both endpoints MUST be scoped to `@Profile("test")` to prevent production exposure.

---

## Test File Structure

```typescript
/**
 * Feature: US-710 (View Carrier Public Profile)
 * AC-1: Shipper can view a carrier's public profile
 * AC-2: Profile displays equipment types and performance metrics
 */
import { test, expect } from '@playwright/test';
import { TestDataSeeder } from './fixtures/test-data-seeder';

test.describe('Carrier Public Profile (US-710)', () => {
  // Trace collection on failure
  test.beforeEach(async ({ context }) => {
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
  });

  test.afterEach(async ({ context }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await context.tracing.stop({
        path: `test-results/trace-${testInfo.title}-${Date.now()}.zip`
      });
    } else {
      await context.tracing.stop();
    }
  });

  // Actual test
  test('US-710 AC-1: Shipper views carrier profile', async ({ page, request }) => {
    // 1. Setup: Create test data via API
    const seeder = new TestDataSeeder(request);
    const shipper = await seeder.createTestUser({ role: 'SHIPPER' });
    const carrier = await seeder.createCarrier(shipper.tenantId, shipper.id);

    try {
      // 2. Navigate to profile page
      await page.goto(`/carriers/${carrier.id}`);

      // 3. Verify profile renders with web-first assertions
      await expect(
        page.locator('[data-testid="carrier-profile-header"]')
      ).toBeVisible({ timeout: 5000 });

      await expect(
        page.locator('[data-testid="equipment-list"]')
      ).toContainText('DRY_VAN');

    } finally {
      // 4. Cleanup: Delete test data via API
      await seeder.cleanup();
    }
  });
});
```

---

## Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Setup time (global) | ~5s | Backend health check + user registration |
| Per-test setup | <500ms | API calls (not UI) |
| Per-test execution | 2-5s | Web interactions only, no delays |
| Per-test cleanup | <500ms | API deletes |
| Total for 10 tests | ~60s | (5s setup) + (10 × 3s avg) + (10 × 500ms cleanup) |
| CI vs local ratio | <2x | Timeouts sized for slow CI |

---

## Multi-Tenancy Verification

**Test Case Template:**
```typescript
test('should enforce RLS: User A cannot access User B data', async ({ request }) => {
  // User A creates a load
  const seederA = new TestDataSeeder(request);
  const userA = await seederA.createTestUser();
  const loadA = await seederA.createLoad(userA.tenantId);

  // User B tries to access User A's load
  const seederB = new TestDataSeeder(request);
  const userB = await seederB.createTestUser();
  
  const response = await request.get(`/api/v1/loads/${loadA.id}`, {
    headers: { 'X-Tenant-ID': userB.tenantId }
  });

  // Should be 403 Forbidden
  expect(response.status()).toBe(403);

  // Cleanup
  await seederA.cleanup();
  await seederB.cleanup();
});
```

---

## Debugging Workflow Integration

**When a test fails:**

1. **Trace file saved automatically** to `test-results/trace-{test-name}-{timestamp}.zip`
2. **Developer opens trace** via `npx playwright show-trace trace-*.zip`
3. **Inspect Network tab:**
   - Find the API call that failed
   - Check HTTP status code
   - Review request/response payloads
4. **Check DOM Snapshot at failure moment:**
   - Is the expected element present?
   - Is it hidden (display: none)?
   - Does it have the expected data-testid?
5. **Correlate backend logs:**
   - Find log entry at request timestamp
   - Backend error message explains API failure
6. **DEBUGGING_GUIDE.md provides:**
   - Step-by-step trace analysis
   - 10 common failure patterns + fixes
   - Examples for each pattern

---

## Standards Compliance

### Testing Standards (`.claude/rules/testing_standards.md`)

- ✅ **Page Object Model:** TestDataSeeder encapsulates fixture API
- ✅ **data-testid mandatory:** All selectors use `[data-testid="..."]`
- ✅ **Web-first assertions:** `expect().toBeVisible()` with explicit timeouts
- ✅ **No Lombok:** Fixtures use standard Java patterns
- ✅ **Trace generation:** Playwright traces on failure
- ✅ **Multi-tenancy:** X-Tenant-ID headers in all operations
- ✅ **AC traceability:** Code comments reference US-### AC#

### SDLC Compliance

- ✅ **Sequential Lock:** BA → ARCH → CODER → REVIEWER → LIBRARIAN
- ✅ **No circular loops:** Each phase freezes inputs after acceptance
- ✅ **Documentation:** DEBUGGING_GUIDE, component specs, fixture API
- ✅ **Verification gates:** Each phase has clear success criteria

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Components missing data-testid | CODER Phase 1 + grep verification |
| Backend test endpoints missing | CODER Phase 2 validation |
| Tests still flaky | Trace analysis → root cause fixes |
| CI timeout | Assertion timeouts increased (5-10s) |
| Multi-tenant bugs | Explicit multi-tenant test cases |
| Traces too large | Retention on failure only (not pass) |

---

## Implementation Roadmap (6 Phases)

**Week 1:**
- Phase 1: Component updates (2h)
- Phase 2: Backend verification (1h)
- Phase 3: Test execution (30m)
- Phase 4: Original test replacement (15m)

**Week 2:**
- Phase 5: Pattern rollout (ongoing)

**Week 3:**
- Phase 6: CI/CD integration (1 week)

---

## References

- **Implementation Guide:** INTEGRATION_TEST_IMPLEMENTATION_GUIDE.md
- **Playwright Docs:** https://playwright.dev
- **Page Object Model:** https://martinfowler.com/bliki/PageObject.html
- **Testing Standards:** .claude/rules/testing_standards.md
- **Debugging Guide:** frontend/e2e/DEBUGGING_GUIDE.md

---

**Design Status:** ✅ APPROVED  
**ARCHITECT Sign-Off:** [Pending CODER review]  
**CODER Gate:** Ready for Phase 1 implementation
