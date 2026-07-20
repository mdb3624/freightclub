# Testing Standards — FreightClub QA Framework

**Authority:** CODER, REVIEWER, LIBRARIAN roles  
**Effective:** 2026-05-31  
**Status:** MANDATORY for all test implementations

---

## Full Suite vs. Targeted Runs During Iteration (added 2026-07-20)

The full Mandatory Pre-Test Protocol (`docker compose down -v` → build → `up --build` → full `mvn clean test` inside `backend-tester`) is expensive (multiple minutes, full dependency re-download in a cold container) and must remain the gate for **final verification before a PR/merge/deploy** — that requirement is unchanged.

During red/green TDD iteration on a single class (e.g., proving a fix via a failing-then-passing test), running the full suite on every iteration wastes time without adding signal beyond the class under test. Use a targeted run against an already-running `test-db` instead:

```bash
docker compose -f docker-compose.test.yml up -d test-db
docker run --rm --network freightclub_default \
  -v "$(pwd)/backend:/app" -v freightclub_maven_repo:/root/.m2 -w /app \
  -e SPRING_PROFILES_ACTIVE=test \
  -e DB_URL="jdbc:postgresql://test-db:5432/freightclub_test?currentSchema=freightclub" \
  -e DB_USERNAME=freightclub_runtime -e DB_PASSWORD=freightclub \
  maven:3.9-eclipse-temurin-21 mvn test -Dtest=YourTestClass -Djacoco.skip=true
```

Reserve the full protocol for: the final pre-PR check, and any change touching more than one class's tests. Don't run it 2-3 times in a row for the same iteration cycle when a targeted run would prove the same thing faster.

## Log Inspection: Grep First, Never Raw `tail` on Maven/Docker Output (added 2026-07-20)

Maven dependency-resolution output (especially in a cold `backend-tester` container) can run to hundreds of lines of pure download-progress noise before the actual result. Always filter at the source instead of tailing raw output:

```bash
docker logs freightclub-tester 2>&1 | grep -E "ERROR|BUILD (SUCCESS|FAILURE)|Tests run:.*Failures: [1-9]|Tests run: [0-9]+, Failures: [0-9]+, Errors: [0-9]+, Skipped: [0-9]+$"
```

Only fall back to a wider `tail`/full log read once `grep` has localized the area of interest (e.g., a specific failing test's stack trace).

## ⚠️ Known Limitation: `page.goto()`-to-destination E2E Specs Don't Exercise the Real Navigation Path (2026-07-16)

US-822 (2026-07-16): production shipper users clicking "My Documents" or a shipment row landed on the home page (`TruckerLandingPage`) instead of the intended route. Root cause was a repeat of the FREIG-114 caching pattern below — `index.html` was served with no `Cache-Control` header, so browsers cached it; after a redeploy replaced the content-hashed asset chunks, a stale-cached shell's `import()` for the target lazy route 404'd, breaking client-side navigation (full page loads, which always re-fetch `index.html`, were unaffected — only in-app link clicks broke). The existing `shipper-documents-routing.spec.ts` (added with the original US-822 fix, PR #39) passed throughout and never caught this: it used `page.goto('/shipper/documents')` / `page.goto('/shipper/loads/:id')` directly, which proves the route renders correctly in isolation but never exercises the button's `onClick` → `navigate()` path — the exact path where the regression lived.

**Mandatory rule:** Any golden-path E2E spec whose purpose is to verify in-app navigation (clicking a link/button that routes elsewhere) MUST drive the click through the actual UI element from a real starting page — never `page.goto()` straight to the destination URL as the primary assertion. `page.goto()` to a destination is acceptable only for verifying the destination page's own rendering, not for proving the navigation action that reaches it works. See the corrected spec at `frontend/e2e/shipper-documents-routing.spec.ts` for the pattern (click `shipment-row-${loadId}` / `action-zone-documents`, then assert the resulting URL and content).

Fix: `frontend/docker-entrypoint.sh` (the file that actually generates the running nginx config — `frontend/nginx.conf` is a template that is never read at runtime) now sets `Cache-Control: no-cache, must-revalidate` on both the `/` SPA-fallback location and the exact-match `/index.html` location.

---

## ⚠️ Known Limitation: Docker Test Env Cannot Catch Vite-Dev-vs-Prod Asset Bugs (2026-07-11)

The Docker test environment (`docker-compose.test.yml`) runs the frontend via `Dockerfile.dev` (`npm run dev`, Vite dev server) — NOT the production build path (`npm run build` + nginx serving `dist/`). Vite's dev server has live bare-specifier resolution middleware that can silently mask bugs in raw `public/` CSS `@import`s or similar asset-loading code, which only manifest once nginx serves the static build (FREIG-114). **The Docker test env passing is not sufficient evidence for any change to font/asset loading, `public/` file references, or static serving behavior** — verify with a real `npm run build` + `vite preview` (or equivalent nginx-equivalent static serving) before sign-off.

---

## ⚠️ Known Limitation: Mocked Tests Cannot Catch Config/Wiring Bugs (2026-07-14)

Unit and jsdom-level tests that mock a service (`EiaFuelPriceService`, `apiClient`, etc.) prove the code's *logic* is correct given a value — they cannot prove the value ever arrives. FREIG-116/US-854: all backend unit tests and the frontend `LoadBoardTable.test.tsx` passed with 100% green, but `docker-compose.test.yml` never passed `EIA_API_KEY`/`EIA_ENABLED` to the container AND `application.yml` never bound `app.eia.api-key`/`app.eia.enabled` to those env vars in the first place — so the live feature returned `available:false` in every environment that existed. Nothing in the automated suite exercised the real seam (env var → Spring property → external HTTP call → response).

**Mandatory rule:** Any story that reads a new external API key, external service config, or env-var-backed `@Value` property MUST include, before sign-off:
1. A `curl`/fetch against the ACTUAL unmocked endpoint in the Docker test environment, with the real response pasted into the PR/story doc.
2. Confirmation that the property is declared in every `application-*.yml` profile actually used (`application.yml`, `application-test.yml`, `application-prod.yml` as applicable) — not just referenced via `@Value`.
3. Confirmation the corresponding env var(s) are passed through in every relevant `docker-compose*.yml` (via explicit `environment:` entries or `env_file:`).

A fully-mocked green test suite is evidence the logic works, not evidence the feature works. Do not declare a story CODER-complete on mocked-test evidence alone when the story's core value depends on an external integration.

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
