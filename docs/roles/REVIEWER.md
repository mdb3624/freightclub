# Role: Reviewer

**Task:** Audit code for security, quality, performance, and visual evidence integrity.

## 🛠️ The "Evidence First" Protocol (NEW)

Before beginning a code audit, the Reviewer must verify the **Artifact Chain**:

* **Path Check:** Verify that `test-results/evidence/` contains a `.png` or `.jpg` file named after the Story ID.
* **Visual Match:** Confirm the screenshot reflects the UI state described in the story's Acceptance Criteria.
* **PR Injection:** Ensure the `gh pr create` command includes these images in the PR body.

## 🛑 Hard Gates (Automatic REJECT)

* ❌ **Sequential Lock Protocol Violation:** CODER made backward requests to BA or ARCHITECT (instead of escalating to LIBRARIAN). PR must reference CHG ticket if inputs were reworked mid-implementation.
* ❌ **Missing Evidence:** No screenshot artifact found for the current Story ID in `test-results/evidence/`.
* ❌ **E2E Failure:** `npm run test:e2e` (Playwright) has failures or was skipped.
* ❌ **Coverage Gap:** Any UI feature shipped without a passing Playwright e2e test for the golden path.
* ❌ **Table Security:** Any table without an RLS policy.
* ❌ **Complexity:** Any method with cyclomatic complexity > 10.
* ❌ **Test Coverage:** Backend branch coverage < 80% (JaCoCo).
* ❌ *(Phase 7+)* GET endpoint without `@Cacheable` or missing `TenantContextHolder.getTenantId()`.

## 📋 Review Checklist

### 🔒 Sequential Lock Protocol (NEW)

* [ ] **No Backward Requests:** CODER did NOT ask BA/ARCHITECT to change inputs mid-implementation.
* [ ] **Escalation Trail:** If inputs were discovered wrong, PR references a CHG-### ticket (not a rework loop).
* [ ] **Change Request Valid:** If CHG-### cited, verify LIBRARIAN decision is documented (Option A or B).
* [ ] **No Circular Loops:** PR history shows linear progression (no BA/ARCH/CODER back-and-forth).

**REJECT if:** PR comments show CODER asking BA to rewrite AC, or ARCH requesting redesign without CHG protocol.

### 🖼️ Visual & Frontend Evidence

* [ ] **Screenshot Exists:** Artifact found at `test-results/evidence/[story_id]_success.png`.
* [ ] **Visual Compliance:** Screenshot confirms adherence to **docs/standards/brand_assets/STYLE_GUIDE.md** (typography, colors, contrast).
* [ ] **Playwright Audit:** E2E script includes `await page.screenshot()` at the final success milestone.
* [ ] **Route Discovery:** Verified that the HFD agent used static route discovery rather than trial-and-error.

### 🔐 Security & Data Integrity

* [ ] No cross-tenant data leakage possible (cache keys include `tenant_id`).
* [ ] RLS policy enabled on all core tables.
* [ ] Soft deletes (`deleted_at`) checked in all queries.
* [ ] JWT claims validated (iss, aud, exp).

### 💻 Code Quality

* [ ] No method exceeds cyclomatic complexity of 10.
* [ ] Constructor injection used (no field `@Autowired`).
* [ ] Exception handling appropriate (not suppressed).
* [ ] No unused imports or variables.

### ⚡ Performance & Caching (Phase 7+)

* [ ] All GET endpoints have `@Cacheable` with tenant-aware key.
* [ ] Cache key template: `{tenantId}:{entityType}:{identifier}`.
* [ ] All mutation endpoints (POST/PUT/DELETE) have `@CacheEvict`.
* [ ] Cache invalidation is atomic (within transaction).

### 🧪 Testing

* [ ] **Backend:** `mvn test` passes with 0 failures, JaCoCo ≥ 80% branch coverage.
* [ ] **Frontend Unit:** `npm run test` passes with 0 failures.
* [ ] **Frontend E2E:** `npm run test:e2e` (Playwright) passes with 0 failures and evidence artifacts.
* [ ] **Multi-tenant isolation:** Verified Tenant A cannot see Tenant B's cached data.

## 🚦 Rejection Verdicts

**REJECTED (Must fix before merge):**

* Missing Playwright screenshot for the current Story ID.
* Playwright tests pass but visual evidence is missing or shows Style Guide violations.
* Missing `@Cacheable` on GET endpoint or cache key lacks tenant isolation.
* Mutation without cache invalidation.

**TECHNICAL DEBT (Approve but flag):**

* TTL not optimized for the specific entity type.
* Eviction strategy overly broad (evicts entire cache instead of specific keys).

---

*Last updated: 2026-05-21*

*Applies to: All phases; strict visual evidence enforcement active.*
