# Role: Reviewer

**Task:** Audit code for security, quality, performance, and visual evidence integrity.

## 🛠️ The "Evidence First" Protocol (NEW)

Before beginning a code audit, the Reviewer must verify the **Artifact Chain**:

* **Path Check:** Verify that `test-results/evidence/` contains a `.png` or `.jpg` file named after the Story ID.
* **Visual Match:** Confirm the screenshot reflects the UI state described in the story's Acceptance Criteria.
* **PR Injection:** Ensure the `gh pr create` command includes these images in the PR body.

## 🛑 Hard Gates (Automatic REJECT)

* ❌ **Sequential Lock Protocol Violation:** CODER made backward requests to BA or ARCHITECT (instead of escalating to LIBRARIAN). PR must reference CHG ticket if inputs were reworked mid-implementation.
* ❌ **Contract Table Violation:** Any `UI Field` in the story's Field Contract Table does not have its value rendered from the corresponding `API Param` in the implementation.
* ❌ **Orphaned API Param:** Any `API Param` in the contract table is not sourced from its `DB Column` in the repository/query layer.
* ❌ **PowerShell Violation:** Any command in a merged script, README, or agent output uses Bash/Unix syntax (e.g., `export`, `kill -9`, Unix paths) — this is a Windows 11 PowerShell environment.
* ❌ **Missing Evidence:** No screenshot artifact found for the current Story ID in `test-results/evidence/`.
* ❌ **E2E Failure:** `npm run test:e2e` (Playwright) has failures or was skipped.
* ❌ **Coverage Gap:** Any UI feature shipped without a passing Playwright e2e test for the golden path.
* ❌ **Table Security:** Any table without an RLS policy.
* ❌ **Complexity:** Any method with cyclomatic complexity > 10.
* ❌ **Test Coverage:** CI already auto-rejects (build failure) below 65% branch coverage via `backend/pom.xml`'s JaCoCo `check` goal — that's the mechanical floor, not this checklist's bar. 80% branch remains the target: treat anything in the 65-80% range as a judgment call (approve with a technical-debt note, or request more tests, based on what the story actually touched) rather than an automatic reject.
* ❌ *(Phase 7+)* GET endpoint without `@Cacheable` or missing `TenantContextHolder.getTenantId()`.
* ❌ **Platform Integrity Violation (all work, not phase-gated):** Same domain logic implemented in multiple services or classes (duplicate calculations, filters, or transformations). Single source of truth must be enforced.
* ❌ **New Endpoint Without Overlap Check (added 2026-07-20):** Any new `@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping` in the PR must be checked against `docs/project/Story_Map.md` (all statuses, not just DONE) and existing controllers for a capability match — run the same two `grep` commands from CODER.md's Endpoint/Capability Overlap Check yourself; don't just trust CODER ran them. If a plausible match exists and the PR doesn't explain why reuse wasn't possible, REJECT. Root incident: US-761/US-820 duplicate KPI implementations, undetected for months because nobody checked at either the ARCHITECT or REVIEWER stage.
* ❌ **CI Status Not Verified:** Local `mvn test` / Docker pre-test runs are NOT a substitute for actual GitHub Actions status. REVIEWER must run `gh pr checks <PR#>` and confirm all required checks are green before issuing PASS. CHG-US730-003 (2026-06-26) found GH Actions CI had a 100% failure rate across its entire history (every run since the workflow was created on 2026-03-27) — every prior `REVIEWER_PASS` in `Sprint_Log.md` was issued on local-run evidence alone, while the actual CI gate silently failed for 3 months unnoticed.

## 📋 Review Checklist

### 🔒 Sequential Lock Protocol (NEW)

* [ ] **No Backward Requests:** CODER did NOT ask BA/ARCHITECT to change inputs mid-implementation.
* [ ] **Escalation Trail:** If inputs were discovered wrong, PR references a CHG-### ticket (not a rework loop).
* [ ] **Change Request Valid:** If CHG-### cited, verify LIBRARIAN decision is documented (Option A or B).
* [ ] **No Circular Loops:** PR history shows linear progression (no BA/ARCH/CODER back-and-forth).

**REJECT if:** PR comments show CODER asking BA to rewrite AC, or ARCH requesting redesign without CHG protocol.

### 📋 Field Contract Table Verification

* [ ] **Table Present:** Story file contains a Field Contract Table with Scope flag set.
* [ ] **Sign-Offs Complete:** All sign-offs required by Scope are checked (BA/ARCH/HFD as applicable).
* [ ] **UI→API Traced:** For each `UI Field` row, confirm the rendered value in the UI comes from the `API Param` — check network tab evidence or test assertions.
* [ ] **API→DB Traced:** For each `API Param` row, confirm the value is sourced from the `DB Column` in the repository query.
* [ ] **N/A Justified:** Any N/A cell has a written justification in the table.
* [ ] **PowerShell-Safe:** No Bash/Unix commands in any file touched by this PR.

**REJECT if:** Any UI Field renders a hardcoded value, a wrong field, or nothing — when the contract table specifies a data source.

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

* [ ] **Backend:** `mvn test` passes with 0 failures; JaCoCo `check` (CI-enforced floor 65% branch) is green; 80% branch is the target beyond the floor.
* [ ] **Frontend Unit:** `npm run test` passes with 0 failures.
* [ ] **Frontend E2E:** `npm run test:e2e` (Playwright) passes with 0 failures and evidence artifacts.
* [ ] **Multi-tenant isolation:** Verified Tenant A cannot see Tenant B's cached data.
* [ ] **Actual CI Status (MANDATORY, NEW 2026-06-26):** Run `gh pr checks <PR#>` and confirm every required check shows `pass`/`success` — not just `pending`/absent. Local Docker/`mvn`/`npm` runs verify the code works in your environment; they do NOT verify GitHub Actions CI passes. Treat a PR with red or unchecked GH Actions status as **REJECTED** regardless of local evidence, per the same standard as any other hard gate.

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

## Full Hard-Gate Checklist (relocated from `.claude/rules/reviewer-checklist.md`, 2026-07-19)

This checklist defines the mandatory "Hard Gates" for any code merge, in addition to the Evidence Protocol and gates above. Failure to meet any of these results in an immediate **REJECTION**.

### 1. Business & Requirements Alignment (BA Gate)
* [ ] **Requirement Traceability**: Does the PR reference a valid ID from `REQUIREMENTS.md`?
* [ ] **User Story Validation**: Does the implementation fulfill the Acceptance Criteria in `USER_STORIES.md`?
* [ ] **Logistics Logic**: Does the code respect the **Equipment Hierarchy** (e.g., specialized equipment can haul general loads)?
* [ ] **Edge Case Handling**: Does the logic address scenarios defined in `EDGE_CASES.md` (e.g., expired insurance, radius buffers)?

### 2. Technical Excellence (Architect Gate)
* [ ] **Cyclomatic Complexity**: No single method exceeds a score of **10**.
* [ ] **Domain Purity**: The `domain` package has zero dependencies on `infrastructure` or external frameworks (Spring/JPA).
* [ ] **Strategy Pattern**: Are complex heuristics (like Match Scoring) encapsulated in interchangeable strategies?
* [ ] **Hexagonal Integrity**: Does the code flow from Application -> Domain, with infrastructure implementing domain-defined interfaces?

### 3. Data & Security
* [ ] **Implicit Tenancy**: Is the code free of manual `WHERE tenant_id = ...` filters? (Must rely on PostgreSQL RLS).
* [ ] **Database Migrations**: Does the Flyway script include the mandatory `tenant_id` column and the `ENABLE ROW LEVEL SECURITY` command?
* [ ] **Entity-Migration Parity**: Does this PR add any new `@Entity` classes? If yes, verify corresponding Flyway migrations exist (VYYYYMMDD_HHMM format). Orphaned entities without migrations violate schema consistency and block test execution.
* [ ] **Schema Type Consistency**: All string ID/code columns must use `VARCHAR` or `TEXT`, never `CHAR(n)`. Verify no `CHAR(36)`, `VARVARCHAR`, or similar type violations in migrations.
* [ ] **PostGIS Usage**: Are geographic queries utilizing indexed spatial functions for performance?

### 4. Reliability & Testing
* [ ] **Backend Tests**: `mvn test` passes with 0 failures; JaCoCo `check` (CI-enforced floor 65% branch) is green; 80% branch remains the target beyond the floor.
* [ ] **Backend Integration Tests**: Controller-level `@SpringBootTest` + `MockMvc` tests MUST exist for every new endpoint — unit tests alone are not sufficient evidence. Test class name must follow `*ControllerTest` convention. Evidence: log line `[INFO] Running com.freightclub.controller.*ControllerTest` in Docker tester output.
* [ ] **Frontend Unit Tests**: `npm run test` passes with 0 failures.
* [ ] **Frontend E2E Tests**: `npm run test:e2e` passes with 0 failures. Any UI feature touched by the story must have a Playwright golden-path test before sign-off.
* [ ] **E2E Test Evidence**: The session must show actual test output (`ok 1 ... (1.4s)`) from running the spec file — not just "tests written". Reviewer must see pass/fail lines before signing off.
* [ ] **Touch Target Automation (OO/Carrier stories)**: "≥48px touch targets" is satisfied ONLY by an automated Playwright `boundingBox()` assertion against every new interactive element (or a blanket `page.locator('button')` sweep) — never by visual inspection alone. CHG-US730-001 (2026-06-25): 4 buttons shipped at 40px or undefined tap area and passed REVIEWER sign-off because the AC-2 test only covered 2 of the dashboard's ~8 buttons. New buttons without a corresponding boundingBox assertion are an automatic REJECT.
* [ ] **Console/Network Error Guard**: Does the golden-path E2E spec assert zero failed network requests (4xx/5xx on static assets) and zero unexpected console errors post-authentication? FREIG-114 (2026-07-11): a font-loading bug caused 7 silent 404s on every authenticated page load in production, undetected because nothing asserted on `page.on('response')`/console output — see the pattern in `login-integration.spec.ts` ("should not produce any failed network requests after login"). New golden-path specs for any story touching asset loading, fonts, or global layout must include an equivalent assertion.
* [ ] **Transactional Integrity**: Are Domain Events and Entity state changes wrapped in a single atomic transaction?
* [ ] **Outbox Pattern**: Does the logic correctly use the `message_outbox` for asynchronous event propagation?
* [ ] **Idempotency**: Is the system resilient to duplicate events or messages?
* [ ] **External Config/Secret Wiring Gate**: If the story introduces a new `@Value("${app.x.y}")`, env var, or external API credential, has CODER pasted the ACTUAL response of the live endpoint (hit against the real Docker test environment, not a mocked service) showing non-null/non-fallback data — not just a passing unit test? FREIG-116/US-854 (2026-07-14): `EiaFuelPriceService` unit tests all passed with mocks, but `docker-compose.test.yml` never passed `EIA_API_KEY`/`EIA_ENABLED` through AND `application.yml` never bound `app.eia.*` to those env vars at all — the feature silently returned `available:false`/all-nulls in every environment until a human manually curled the endpoint. Any new `@Value` binding must be grepped against every `application-*.yml` profile AND every `docker-compose*.yml` env block before sign-off; a green test suite where every external dependency is mocked is not evidence the wiring works.

### 5. API Contract Gate (Integration Gate)
* [ ] **Version Consistency**: If a new backend controller is added, its `@RequestMapping` version prefix matches `apiClient.ts` baseURL — or the mismatch is explicitly justified and all callers are updated.
* [ ] **Full Endpoint Audit**: If `apiClient.ts` baseURL is changed, ALL frontend `api.ts` files and hooks using direct `axios` calls have been checked for breakage — not just the feature under review.
* [ ] **@RequestParam vs @RequestBody**: For every new POST/PUT endpoint, verify the frontend hook sends data in the format the backend expects. `@RequestParam` requires `params: { key: val }` (null body); `@RequestBody` requires a JSON body object. A mismatch causes a 400 with no obvious error.
* [ ] **apiClient URL prefix**: Frontend calls using `apiClient` must NOT include `/api/v1/` in the path — `apiClient` already has `baseURL: '/api/v1'`. Passing `/api/v1/path` results in a double-prefix 404.
* [ ] **Response DTO completeness**: Verify that every field the frontend list/table component renders (`carrierName`, `carrierEmail`, etc.) is actually present in the backend response DTO. A missing field renders silently as blank — not an error.
* [ ] **Golden Path Smoke Test**: The reviewer has confirmed (or the PR author has documented) that login → primary feature → adjacent flows (load board, profile, notifications) → logout all work without network errors in a **running browser** (not just API calls). Backend tests passing ≠ frontend working.

### 6. Design System & UI Conformance (Shipper Persona Gate)

**Applies to:** Any PR touching shipper-facing pages, components, or layouts

* [ ] **ShipperPageLayout Conformance (MANDATORY)**: Is this a shipper page? If yes:
  - MUST be wrapped in `<ShipperPageLayout>` component
  - MUST NOT implement custom header/navigation structure
  - MUST NOT override layout styling without documented exception
  - Automatic rejection if ShipperPageLayout is missing — no exceptions permitted
  - **Reference:** Shipper & Administrator Style Guide §7

* [ ] **Shipper Style Guide Compliance**: Does the PR follow Shipper & Administrator Style Guide (§6 Atomic Components) — see `docs/standards/ui-standards.md` for exact token values (spacing, radius, colors, typography)?

* [ ] **Responsive Design**: Desktop (≥1024px) full-width; Tablet (768–1023px) graceful stacking; Mobile (≤767px) acceptable fallback (not primary). No layout shifts between breakpoints (test at 1024, 768, 375px).

* [ ] **Accessibility (WCAG AA)**: All color combinations meet WCAG AA contrast (≥4.5:1). Status badges provide redundant indication (not color-only). Focus indicators on all interactive elements. ARIA labels on forms/errors/required fields.

### 7. Spring Security Filter Safety (Security Chain Gate)
* [ ] **No double registration**: Any filter that is both `@Component` AND added via `addFilterBefore`/`addFilterAfter` in `SecurityConfig` MUST have a `FilterRegistrationBean` with `setEnabled(false)` to prevent it running outside the security chain. Without this, `SecurityContextHolderFilter` clears the auth set by the pre-chain run, causing 401 on all protected endpoints.
* [ ] **Cache names registered**: Every `@Cacheable("name")` annotation references a cache name declared in `CacheConfig`. Missing names cause 500 errors at runtime.
* [ ] **JJWT audience validation**: Do not use `requireAudience(String)` on the JJWT parser builder (0.12.x bug — compares String against Set). Validate audience manually after `parseSignedClaims`.
* [ ] **@PermitAll on auth endpoints**: Public auth endpoints (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/debug/*`) MUST have `@PermitAll` annotation. Missing annotation causes 401 Unauthorized before endpoint logic executes.
* [ ] **JWT filter skiplist**: Does `JwtAuthenticationFilter.doFilterInternal()` skip entire `/api/v1/auth/` path? Missing skiplist causes public endpoint rejection.
* [ ] **Form field registration (Frontend)**: If the PR modifies `ProfilePage.tsx` or form components, verify that all form fields appear in BOTH the Zod schema AND `useForm({ defaultValues: { ... } })`. Missing fields are silently stripped from form submission (no console error). Test with Network tab inspection of PUT payload.

### Review Verdicts
- **APPROVED**: All boxes checked.
- **REJECTED**: Failure to meet any hard gate (Complexity, RLS, Coverage, etc.).
- **TECHNICAL DEBT**: Minor issues that don't break a hard gate but require future refactoring.

---

*Last updated: 2026-07-19*

*Applies to: All phases; strict visual evidence enforcement active.*
