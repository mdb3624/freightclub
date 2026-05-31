# E2E Testing — Quick Reference Card

**Keep this handy while implementing and debugging tests.**

---

## Running Tests

```bash
cd frontend

# All E2E tests
npm run test:e2e

# Specific test file
npm run test:e2e -- login-integration-refactored.spec.ts

# Specific test by name
npm run test:e2e -- -g "should display error"

# With UI (slow, for debugging)
npm run test:e2e -- --ui

# Watch mode (reruns on file changes)
npm run test:e2e -- --watch
```

---

## Test Structure Template

```typescript
import { test, expect } from '@playwright/test';
import { TestDataSeeder } from './fixtures/test-data-seeder';

test.describe('Feature Name', () => {
  // Start trace collection on failure
  test.beforeEach(async ({ context }) => {
    await context.tracing.start({
      screenshots: true,
      snapshots: true,
      sources: true,
    });
  });

  // Save trace on failure
  test.afterEach(async ({ context }, testInfo) => {
    if (testInfo.status !== 'passed') {
      await context.tracing.stop({
        path: `test-results/trace-${testInfo.title}-${Date.now()}.zip`
      });
    } else {
      await context.tracing.stop();
    }
  });

  test('should do something', async ({ page, request }) => {
    // Setup: Create test data via API
    const seeder = new TestDataSeeder(request);
    const user = await seeder.createTestUser();
    
    try {
      // Test: Navigate and interact
      await page.goto('/login');
      await page.locator('[data-testid="email-input"]').fill(user.email);
      await page.locator('[data-testid="password-input"]').fill(user.password);
      await page.locator('[data-testid="login-submit-btn"]').click();
      
      // Assert: Web-first with explicit timeout
      await expect(
        page.locator('[data-testid="dashboard-container"]')
      ).toBeVisible({ timeout: 5000 });
    } finally {
      // Cleanup: Delete test data
      await seeder.cleanup();
    }
  });
});
```

---

## Selector Patterns (data-testid)

| Element Type | Pattern | Example |
|--------------|---------|---------|
| Input field | `{field}-input` | `[data-testid="email-input"]` |
| Button | `{action}-btn` | `[data-testid="login-submit-btn"]` |
| Error message | `{field}-error` | `[data-testid="email-input-error"]` |
| Success message | `{action}-success` | `[data-testid="login-success"]` |
| Container | `{page}-container` | `[data-testid="dashboard-container"]` |
| Alert/Banner | `{type}-message` | `[data-testid="login-error-message"]` |

---

## Web-First Assertions

```typescript
// ✅ CORRECT: Web-first assertions with timeout
await expect(element).toBeVisible({ timeout: 5000 });
await expect(element).toBeEnabled({ timeout: 3000 });
await expect(element).toHaveValue('expected', { timeout: 3000 });
await expect(element).toContainText('error', { timeout: 3000 });

// ❌ WRONG: Hard-coded waits (brittle!)
await page.waitForTimeout(500);
await page.waitForNavigation();

// ❌ WRONG: CSS/XPath selectors (break on style changes)
page.locator('input.form-control');
page.locator('//div[@class="error"]');

// ✅ CORRECT: data-testid selectors (resilient)
page.locator('[data-testid="email-input"]');
```

---

## Test Data Seeding

```typescript
import { TestDataSeeder } from './fixtures/test-data-seeder';

// Create seeder instance
const seeder = new TestDataSeeder(request);

// Create test user (calls /api/test/auth/register)
const user = await seeder.createTestUser({
  email: 'custom@example.com',
  role: 'SHIPPER'
});
// Returns: { id, email, password, firstName, lastName, tenantId }

// Create carrier (requires tenant context)
const carrier = await seeder.createCarrier(user.tenantId, user.id, {
  companyName: 'Test Carrier Inc'
});
// Returns: { id, truckerId, companyName, equipment, tenantId }

// Create load (requires tenant context)
const load = await seeder.createLoad(user.tenantId, {
  equipmentType: 'DRY_VAN',
  rate: 2000
});
// Returns: { id, shipmentId, shipper, pickupLocation, dropoffLocation, ... }

// Cleanup all created resources (reverse dependency order)
await seeder.cleanup();
```

---

## Waiting for API Responses

```typescript
// Wait for specific response
const loginResponse = page.waitForResponse(
  response => response.url().includes('/api/v1/auth/login') && response.status() === 200
);
await page.locator('[data-testid="login-submit-btn"]').click();
await loginResponse;

// Wait with timeout
try {
  await Promise.race([
    page.waitForResponse(r => r.url().includes('/api/v1/loads')),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Backend response timeout')), 5000)
    )
  ]);
} catch (error) {
  console.error('Backend did not respond:', error);
}
```

---

## Common Assertions

```typescript
// Visibility & State
await expect(element).toBeVisible();
await expect(element).toBeHidden();
await expect(element).toBeEnabled();
await expect(element).toBeDisabled();
await expect(element).toBeFocused();

// Content
await expect(element).toContainText('expected text');
await expect(element).toHaveText('exact text');
await expect(element).toHaveValue('form value');

// Count
await expect(page.locator('[data-testid="load-card"]')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/loads\/\d+/);

// CSS/Attributes
await expect(element).toHaveClass('active');
await expect(element).toHaveAttribute('data-testid', 'my-element');
```

---

## Opening Trace Files

```bash
# Option 1: Command line (recommended)
npx playwright show-trace test-results/trace-*.zip

# Option 2: Web viewer
# Go to: https://trace.playwright.dev/
# Upload: test-results/trace-*.zip

# Option 3: Unzip and inspect
unzip test-results/trace-*.zip -d /tmp/trace
cat /tmp/trace/network.jsonl | jq '.' | head -20
```

---

## Debugging Checklist

When a test fails:

- [ ] Open trace file: `npx playwright show-trace test-results/trace-*.zip`
- [ ] Check Network tab: Did API call happen? What status?
- [ ] Check DOM snapshot: Is element present? Hidden?
- [ ] Check Console: Any JavaScript errors?
- [ ] Check Screenshot: What does page actually show?
- [ ] Check Backend logs: Error messages at same timestamp?
- [ ] Verify selectors: Does `[data-testid="..."]` exist in component?
- [ ] Check timeout: Is 5000ms enough? Increase if slow backend

---

## Environment Variables

```bash
# Backend URL for tests
export TEST_BACKEND_URL=http://localhost:9091

# Frontend URL for navigation
export FRONTEND_URL=http://localhost:9090

# Set in CI/CD or locally
export CI=true  # Enables retries, serial execution
```

---

## Common Errors & Fixes

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| `Timeout waiting for locator '[data-testid="..."]'` | Element missing data-testid | Add attribute to component |
| `401 Unauthorized` | Auth token invalid/expired | Delete `auth.json`, re-run |
| `Backend health check failed` | Spring Boot not running | Start backend: `mvn spring-boot:run` |
| `Test user registration failed: 404` | Test endpoint missing | Add `/api/test/auth/register` in backend |
| `Cannot read property of undefined` | Test data creation failed | Check backend logs, increase timeout |
| `Flaky in CI, passes locally` | Shared DB state or slow network | Ensure serial execution, increase timeouts |

---

## Files to Know

```
frontend/
├── playwright.config.ts                    # Test configuration
├── e2e/
│   ├── login-integration-refactored.spec.ts   # Refactored tests
│   ├── DEBUGGING_GUIDE.md                 # Debugging workflow
│   ├── COMPONENT_TESTID_REQUIREMENTS.md   # Component spec
│   └── fixtures/
│       ├── global-setup.ts                # Backend health + auth init
│       ├── global-teardown.ts             # Cleanup (placeholder)
│       ├── test-data-seeder.ts            # API fixture pattern
│       └── README.md                      # Usage guide

root/
├── INTEGRATION_TEST_IMPLEMENTATION_GUIDE.md  # Full roadmap
└── E2E_TESTING_SETUP_SUMMARY.md             # This overview
```

---

## Need Help?

1. **How do I add data-testid?**  
   → `COMPONENT_TESTID_REQUIREMENTS.md`

2. **How do I debug a failure?**  
   → `DEBUGGING_GUIDE.md`

3. **How do I structure a test?**  
   → `frontend/e2e/fixtures/README.md`

4. **What's the full roadmap?**  
   → `INTEGRATION_TEST_IMPLEMENTATION_GUIDE.md`

5. **What are the testing standards?**  
   → `.claude/rules/testing_standards.md`

---

**Last Updated:** 2026-05-31  
**Status:** Ready for Implementation  
**Next Step:** Add data-testid attributes to components
