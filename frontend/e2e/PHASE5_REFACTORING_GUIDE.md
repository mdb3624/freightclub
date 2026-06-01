# Phase 5 E2E Test Refactoring Guide (US-900)

## Status: 23% Complete (3 of 13 tests refactored, 15 test cases)

**Verified Working Tests:**
- ✅ login-integration.spec.ts (7 tests)
- ✅ shipper-profile.spec.ts (2 tests)
- ✅ shipper-dashboard.spec.ts (6 tests)

---

## Pattern: Safe Refactoring Without Breaking Tests

### ✅ DO THIS (What Works)

```typescript
import { test, expect } from '@playwright/test'
import { TestDataSeeder } from './fixtures/test-data-seeder'

test('feature test', async ({ page, request }) => {
  // 1. Create test user via API (not UI)
  const seeder = new TestDataSeeder(request)
  const user = await seeder.createTestUser({
    email: 'test@freightclub.local',
    role: 'SHIPPER' // Use existing roles: SHIPPER, CARRIER, ADMIN
  })

  try {
    // 2. Navigate to page (already authenticated)
    await page.goto('/dashboard')

    // 3. Use EXISTING WORKING selectors (don't invent new ones)
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 })
    
    // 4. Use web-first assertions (no hard-coded waits)
    const btn = page.getByRole('button', { name: /Click Me/i })
    await expect(btn).toBeEnabled({ timeout: 3000 })
    await btn.click()

    // 5. Wait for backend response
    await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 })
    
  } finally {
    // 6. Always cleanup
    await seeder.cleanup()
  }
})
```

### ❌ DON'T DO THIS (What Breaks Tests)

```typescript
// ❌ Inventing new data-testid that don't exist in components
await page.locator('[data-testid="my-made-up-selector"]').click()

// ❌ Hard-coded waits
await page.waitForTimeout(500)

// ❌ Invalid roles
role: 'TRUCKER' // ← Must be SHIPPER, CARRIER, or ADMIN

// ❌ UI-driven login (slow, flaky)
await page.getByLabel('Email').fill('email@test.com')
await page.getByLabel('Password').fill('password')
await page.getByRole('button', { name: /Sign In/i }).click()

// ❌ Forgetting cleanup
// Missing: await seeder.cleanup()
```

---

## Refactoring Checklist

For each test file to refactor:

- [ ] Import TestDataSeeder
- [ ] Replace `beforeEach` UI-driven login with test-level `seeder.createTestUser()`
- [ ] Remove all `page.waitForTimeout()` calls
- [ ] Replace with web-first assertions: `expect(...).toBeVisible({ timeout: 5000 })`
- [ ] Verify selectors work (use existing text=, getByRole, etc.)
- [ ] Add proper cleanup in `finally` block
- [ ] Add AC traceability comments (e.g., `// US-757 AC-1`)
- [ ] Test locally before committing
- [ ] Verify against clean Docker build

---

## Valid Test User Roles

From `test-data-seeder.ts`:

```typescript
role: 'SHIPPER'  // Load board users
role: 'CARRIER'  // Carrier/trucker profiles
role: 'ADMIN'    // Admin users
```

---

## Remaining Tests to Refactor (9 of 13)

**HIGH Priority:**
- shipper-post-load.spec.ts — Core shipper feature
- trucker-pod-upload.spec.ts — File upload handling  
- shipper-profile-setup.spec.ts (290 lines) — Larger feature test

**MEDIUM Priority:**
- shipper-preferred-carriers.spec.ts
- shipper-profile-multi-tenant.spec.ts (171 lines)

**LOW Priority:**
- smoke.spec.ts
- cleanup: Remove login-integration-old.spec.ts, login-integration-refactored.spec.ts

---

## Testing Locally

```bash
# Full E2E suite
npm run test:e2e

# Single test file
npm run test:e2e -- shipper-profile.spec.ts

# With Playwright UI (visual debugging)
npx playwright test --ui
```

---

## Docker Verification (Full Cycle)

```bash
# From repo root
docker-compose -f docker-compose.test.yml down
docker rmi -f $(docker images --filter "reference=freightclub*" -q)
docker-compose -f docker-compose.test.yml up -d
# Wait 30s for backend health
cd frontend && npm run test:e2e -- --project=chromium
```

---

## Key Learnings

1. **Phase 1 Precedes Phase 5**: Data-testid refactoring requires components to have those attributes first
2. **Keep Existing Selectors**: Don't invent new selectors without adding them to components
3. **TestDataSeeder is the Win**: API-driven setup (vs UI login) is what improves reliability
4. **Web-first Assertions**: `expect(...).toBeVisible({ timeout })` is the modern Playwright pattern
5. **Cleanup is Critical**: Always `seeder.cleanup()` to avoid test pollution

---

## Questions?

See: `frontend/e2e/fixtures/test-data-seeder.ts` for full API docs.

---

**Last Updated:** 2026-05-31  
**Phase 5 Status:** 23% complete — 15 test cases verified working  
**CI/CD Ready:** `.github/workflows/e2e-tests.yml` deployed
