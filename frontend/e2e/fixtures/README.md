# E2E Test Fixtures & Infrastructure

This directory contains the test infrastructure for robust, non-flaky E2E tests.

---

## Files Overview

### `global-setup.ts`
**Runs once before all tests.**

Responsibilities:
1. **Backend health check** — Polls `/actuator/health` until Spring Boot is ready (30s timeout, 1s retry)
2. **Test user registration** — Calls `/api/test/auth/register` to create credentials
3. **Auth state initialization** — Navigates to frontend, lets AuthInitializer exchange refresh token for access token
4. **State persistence** — Saves authenticated cookies/localStorage to `auth.json`

**Key benefits:**
- Tests start with valid credentials pre-loaded
- No UI-driven auth setup (faster, more reliable)
- Handles backend startup delays gracefully
- Logs progress for debugging CI failures

### `global-teardown.ts`
**Runs once after all tests complete.**

Currently a placeholder. Future uses:
- Clean up test users
- Reset shared test database state
- Aggregate logs

### `test-data-seeder.ts`
**API-driven test fixture pattern for test data.**

Usage in tests:
```typescript
const seeder = new TestDataSeeder(request, backendUrl);
const user = await seeder.createTestUser({ email: 'test@example.com' });
const carrier = await seeder.createCarrier(tenantId, userId, {
  companyName: 'Test Carrier'
});
const load = await seeder.createLoad(tenantId, {
  equipmentType: 'DRY_VAN'
});

// Tests run...

// Cleanup at end
await seeder.cleanup();
```

**Key features:**
- Direct API calls (no UI automation)
- Foreign key dependency ordering (creates tenants before users before carriers)
- Automatic resource tracking for cleanup
- Multi-tenancy aware (includes tenant context in requests)

---

## How to Use

### 1. Local Test Execution

```bash
cd frontend

# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- login-integration-refactored.spec.ts

# Run specific test by name
npm run test:e2e -- -g "should display error message"

# Run with UI inspector (slow, useful for debugging)
npm run test:e2e -- --ui
```

### 2. Test Structure

```typescript
import { TestDataSeeder } from './fixtures/test-data-seeder';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page, context }) => {
    // Trace collection for failure debugging
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
  });

  test.afterEach(async ({ page, context }, testInfo) => {
    // Save trace on failure
    if (testInfo.status !== 'passed') {
      const timestamp = Date.now();
      const path = `test-results/trace-${testInfo.title}-${timestamp}.zip`;
      await context.tracing.stop({ path });
    } else {
      await context.tracing.stop();
    }
  });

  test('should do something', async ({ page, request }) => {
    // Create test data via API (not UI)
    const seeder = new TestDataSeeder(request);
    const testUser = await seeder.createTestUser();

    try {
      // Test logic here
      await page.goto('/dashboard');
      await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    } finally {
      // Cleanup
      await seeder.cleanup();
    }
  });
});
```

### 3. Data Seeding Dependency Order

The `TestDataSeeder` follows this order:

```
1. User (calls /api/test/auth/register)
   ↓
2. Tenant (created automatically with user)
   ↓
3. Carrier (depends on tenant for multi-tenancy context)
   ↓
4. Load (depends on tenant, optional carrier)
```

**Why this order?** Foreign key constraints require parents to exist first.

### 4. Handling Flaky Tests

**Problem:** Test passes locally, fails randomly in CI.

**Solution flow:**
1. Run test locally: `npm run test:e2e`
2. If it fails, trace is saved to `test-results/trace-*.zip`
3. Open trace: `npx playwright show-trace test-results/trace-*.zip`
4. Check network tab for API failures
5. If API call shows error, check backend logs
6. Fix root cause, run again

See [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md) for detailed workflow.

---

## Configuration

### playwright.config.ts

Key settings for robustness:

| Setting | Value | Reason |
|---------|-------|--------|
| `workers` | 1 | Serial execution prevents auth state conflicts |
| `trace` | 'retain-on-failure' | Saves traces only when tests fail (saves disk space) |
| `video` | 'retain-on-failure' | Records video only on failure |
| `timeout` | 30_000ms | Global test timeout |
| `expect.timeout` | 5000ms | Assertion timeout (web-first assertions wait up to 5s) |

### Environment Variables

```bash
# Backend URL for API calls
export TEST_BACKEND_URL=http://localhost:9091

# Frontend URL for navigation
export FRONTEND_URL=http://localhost:9090

# These are used in global-setup.ts and tests
```

---

## Debugging Tips

### 1. Test hangs indefinitely
- **Cause:** Backend not responding, infinite loop in test
- **Fix:** Press Ctrl+C to stop, check backend health: `curl http://localhost:9091/actuator/health`

### 2. "Element not found" errors
- **Cause:** Component missing data-testid attribute
- **Fix:** Add data-testid to component, see [COMPONENT_TESTID_REQUIREMENTS.md](../COMPONENT_TESTID_REQUIREMENTS.md)

### 3. 401 Unauthorized randomly
- **Cause:** auth.json corrupted or refresh token invalid
- **Fix:** Delete auth.json, re-run: `rm auth.json && npm run test:e2e`

### 4. "Cannot read property X of undefined"
- **Cause:** Test data seeding failed
- **Fix:** Check backend logs for /api/test/auth/register error

---

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run E2E tests
  run: |
    cd frontend
    npm install
    npm run test:e2e
    
- name: Upload traces on failure
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: frontend/test-results/
    retention-days: 7
```

---

## Performance Considerations

### Test Execution Time

- **Global Setup:** ~5s (backend health check + user registration)
- **Per Test:** ~2-5s (depends on user interactions)
- **Cleanup:** ~1s (API calls to delete resources)

**Total for 10 tests:** ~30-60s (with serialization, includes setup/teardown)

### Optimizations

1. **Parallel tests:** Set `workers: X` in playwright.config.ts ONLY if tests don't share auth state
2. **Reuse test data:** Create once in beforeAll, reuse in multiple tests
3. **Skip unnecessary waits:** Use `waitForNavigation()` strategically, not on every action

---

## Troubleshooting

### Global Setup Fails

```
❌ [Setup Error] Backend health check failed
```

**Fix:**
```bash
# Check backend is running
curl http://localhost:9091/actuator/health

# If not running:
cd backend
mvn spring-boot:run
```

### Test Data Seeding Fails

```
Failed to create test user: 400 Bad Request
```

**Fix:**
```bash
# Check test endpoint exists
curl -X POST http://localhost:9091/api/test/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"...","firstName":"...","lastName":"...","role":"SHIPPER","companyName":"..."}'

# If 404, endpoint missing — verify backend has @PostMapping("/api/test/auth/register")
```

---

## References

- **Playwright Docs:** https://playwright.dev
- **Testing Standards:** [`.claude/rules/testing_standards.md`](../../.claude/rules/testing_standards.md)
- **Debugging Guide:** [DEBUGGING_GUIDE.md](../DEBUGGING_GUIDE.md)
- **Component Data-testid Requirements:** [COMPONENT_TESTID_REQUIREMENTS.md](../COMPONENT_TESTID_REQUIREMENTS.md)

---

**Last Updated:** 2026-05-31
