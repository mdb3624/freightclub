# Testing Standards — FreightClub QA Framework

**Authority:** CODER, REVIEWER, LIBRARIAN roles  
**Effective:** 2026-05-31  
**Status:** MANDATORY for all test implementations

---

## Architecture: Page Object Model (POM)

All UI automation tests MUST follow the Page Object Model pattern:

- **Page Objects:** Encapsulate element selectors and actions in dedicated classes (e.g., `LoginPageObject`, `LoadBoardPageObject`)
- **Separation of Concerns:** Page objects contain ONLY selectors and navigation logic; test files contain ONLY assertions
- **Reusability:** Each page object is a singleton/fixture reused across multiple test files
- **Anti-Pattern:** Inline selectors in test methods (❌ DO NOT DO THIS)

**File Structure:**
```
frontend/e2e/
├── page-objects/
│   ├── LoginPageObject.ts
│   ├── LoadBoardPageObject.ts
│   ├── ProfilePageObject.ts
│   └── ...
├── fixtures/
│   └── [page object instances for test setup]
└── [test files using page objects]
```

---

## Code Style: No Lombok, Standard Boilerplate

Backend test fixtures and helper classes MUST use standard Java patterns:

- **No Lombok annotations** — Use explicit constructors, getters, and setters
- **No `@Data`, `@Getter`, `@Setter`, `@Builder`** — Write them manually
- **Rationale:** Lombok obscures test data construction and makes debugging harder in test contexts

**Example (Correct):**
```java
public class TestUserFixture {
    private String userId;
    private String email;
    private String tenantId;

    public TestUserFixture(String userId, String email, String tenantId) {
        this.userId = userId;
        this.email = email;
        this.tenantId = tenantId;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    // ... rest of getters/setters
}
```

---

## Selector Strategy: data-testid Mandatory

All UI element selection MUST use `data-testid` attributes:

- **Mandatory:** Every interactive element (input, button, link) requires a unique `data-testid`
- **Banned:** CSS selectors (`.class-name`), XPath (`//div/p[1]`), text content matching
- **Rationale:** `data-testid` is resilient to CSS refactors; XPath/CSS selectors break with styling changes

**Frontend Implementation:**
```tsx
// In components:
<input data-testid="email-input" type="email" />
<button data-testid="login-submit-btn">Login</button>

// In page objects:
async fillEmail(email: string) {
    await this.page.fill('[data-testid="email-input"]', email);
}

async clickLoginButton() {
    await this.page.click('[data-testid="login-submit-btn"]');
}
```

**Automated Verification:** PRs that introduce new interactive elements WITHOUT corresponding `data-testid` are rejected at the Reviewer gate.

---

## Traceability: Mandatory Playwright Trace on Failure

Every test failure MUST generate a Playwright Trace file for post-mortem analysis:

**Trace File Contents:**
- Network requests/responses (API calls, auth flows)
- DOM snapshots at each interaction
- Console logs and errors
- Screenshots at failure point
- Video (if enabled)

**Implementation:**
```typescript
// In beforeEach or test setup:
test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
        await context?.tracing.stop({
            path: `./test-results/trace-${testInfo.title}-${Date.now()}.zip`
        });
    }
});

// In beforeEach:
test.beforeEach(async ({ context }) => {
    await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true
    });
});
```

**Trace File Naming:** `trace-{test-name}-{timestamp}.zip`  
**Storage:** `frontend/test-results/` directory (git-ignored)  
**Reviewer Requirement:** When a test fails in CI, the corresponding trace is attached to the PR for investigation.

---

## Browser-Use Integration (MCP)

When using the browser-use MCP for enhanced web automation:

- **Scope:** Use for cross-origin testing, complex DOM interactions, and JavaScript-heavy flows
- **Gate:** All browser-use tests MUST follow POM pattern (use page objects, not inline automation)
- **Tracing:** Mandatory trace generation on failure (same as Playwright tests)
- **Performance:** Browser-use tests are slower than Playwright — use sparingly; prefer Playwright for speed-critical paths

---

## Multi-Tenancy & Auth Testing

All tests interacting with authenticated endpoints MUST:

- **Verify Tenant Isolation:** Confirm that actions in tenant A do not leak to tenant B
- **Test Auth Refresh Flow:** Use `/api/test/debug/cookies` endpoint (test-only) to verify refresh token lifecycle
- **No Hardcoded Credentials:** Use fixtures or test-seed endpoints; never embed real user credentials in test files
- **HTTP-only Cookie Validation:** Confirm refresh tokens persist across navigation (not in localStorage)

---

## Acceptance Criteria Traceability

Every test file MUST explicitly reference the User Story and Acceptance Criterion it validates:

```typescript
// At top of test file:
/**
 * Feature: US-710 (View Carrier Public Profile)
 * AC-1: Shipper can view a carrier's public profile
 * AC-2: Profile displays equipment types and performance metrics
 */
import { test, expect } from '@playwright/test';

test('US-710 AC-1: shipper views carrier profile', async ({ page }) => {
    // Implementation
});
```

**Traceability in Code Comments:**
```java
// US-710 AC-2: Performance metrics display
@Test
void testPerformanceMetricsDisplay() {
    // Implementation
}
```

---

## Coverage Targets

- **Backend Unit Tests:** ≥80% branch coverage (JaCoCo enforced)
- **Backend Integration Tests:** ≥70% coverage
- **Frontend Unit Tests:** ≥60% coverage (test-driven)
- **Frontend E2E Tests:** Golden path + 2 critical edge cases per story
- **Overall:** No story marked DONE without ≥70% code coverage

---

## CI/CD Integration

- **Test Runs:** All tests run on every PR; failures block merge
- **Trace Artifacts:** Failed test traces uploaded to CI artifacts for debugging
- **Coverage Reports:** JaCoCo reports generated and archived after each backend test run
- **Screenshot Diffs:** Playwright visual regression diffs (if enabled) reviewed before merge

---

## Violations & Enforcement

| Violation | Action |
|-----------|--------|
| Test uses CSS/XPath selectors instead of data-testid | PR rejected at Reviewer gate |
| Lombok annotations in test fixtures | PR rejected at Reviewer gate |
| Test failure without trace file | Failure marked as "unreproducible" — re-run required |
| No AC traceability comment | PR rejected (missing requirement link) |
| Coverage < 70% | Story cannot be marked DONE |

---

## References

- **Page Object Model Pattern:** [Martin Fowler](https://martinfowler.com/bliki/PageObject.html)
- **Playwright Best Practices:** [Playwright Docs](https://playwright.dev/docs/best-practices)
- **Browser-Use MCP:** Integrated via `.claude/config` for enhanced automation
- **Reviewer Checklist:** `.claude/rules/reviewer-checklist.md` (hard gates section)
