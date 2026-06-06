# 🛡️ Reviewer Checklist: Resilience Logistics Platform

This checklist defines the mandatory "Hard Gates" for any code merge. Failure to meet these criteria results in an immediate **REJECTION**.

---

## 1. Business & Requirements Alignment (BA Gate)
* [ ] **Requirement Traceability**: Does the PR reference a valid ID from `REQUIREMENTS.md`?
* [ ] **User Story Validation**: Does the implementation fulfill the Acceptance Criteria in `USER_STORIES.md`?
* [ ] **Logistics Logic**: Does the code respect the **Equipment Hierarchy** (e.g., specialized equipment can haul general loads)?
* [ ] **Edge Case Handling**: Does the logic address scenarios defined in `EDGE_CASES.md` (e.g., expired insurance, radius buffers)?

## 2. Technical Excellence (Architect Gate)
* [ ] **Cyclomatic Complexity**: No single method exceeds a score of **10**. 
* [ ] **Domain Purity**: The `domain` package has zero dependencies on `infrastructure` or external frameworks (Spring/JPA).
* [ ] **Strategy Pattern**: Are complex heuristics (like Match Scoring) encapsulated in interchangeable strategies?
* [ ] **Hexagonal Integrity**: Does the code flow from Application -> Domain, with infrastructure implementing domain-defined interfaces?

## 3. Data & Security (Enon Gate)
* [ ] **Implicit Tenancy**: Is the code free of manual `WHERE tenant_id = ...` filters? (Must rely on PostgreSQL RLS).
* [ ] **Database Migrations**: Does the Flyway script include the mandatory `tenant_id` column and the `ENABLE ROW LEVEL SECURITY` command?
* [ ] **Entity-Migration Parity**: Does this PR add any new `@Entity` classes? If yes, verify corresponding Flyway migrations exist (VYYYYMMDD_HHMM format). Orphaned entities without migrations violate schema consistency and block test execution.
* [ ] **Schema Type Consistency**: All string ID/code columns must use `VARCHAR` or `TEXT`, never `CHAR(n)`. Verify no `CHAR(36)`, `VARVARCHAR`, or similar type violations in migrations.
* [ ] **PostGIS Usage**: Are geographic queries utilizing indexed spatial functions for performance?

## 4. Reliability & Testing (Coder Gate)
* [ ] **Backend Tests**: `mvn test` passes with 0 failures and JaCoCo ≥ 80% branch coverage.
* [ ] **Backend Integration Tests**: Controller-level `@SpringBootTest` + `MockMvc` tests MUST exist for every new endpoint — unit tests alone are not sufficient evidence. Test class name must follow `*ControllerTest` convention. Evidence: log line `[INFO] Running com.freightclub.controller.*ControllerTest` in Docker tester output.
* [ ] **Frontend Unit Tests**: `npm run test` passes with 0 failures.
* [ ] **Frontend E2E Tests**: `npm run test:e2e` passes with 0 failures. Any UI feature touched by the story must have a Playwright golden-path test before sign-off.
* [ ] **E2E Test Evidence**: The session must show actual test output (`ok 1 ... (1.4s)`) from running the spec file — not just "tests written". Reviewer must see pass/fail lines before signing off.
* [ ] **Transactional Integrity**: Are Domain Events and Entity state changes wrapped in a single atomic transaction?
* [ ] **Outbox Pattern**: Does the logic correctly use the `message_outbox` for asynchronous event propagation?
* [ ] **Idempotency**: Is the system resilient to duplicate events or messages?

## 5. API Contract Gate (Integration Gate)
* [ ] **Version Consistency**: If a new backend controller is added, its `@RequestMapping` version prefix matches `apiClient.ts` baseURL — or the mismatch is explicitly justified and all callers are updated.
* [ ] **Full Endpoint Audit**: If `apiClient.ts` baseURL is changed, ALL frontend `api.ts` files and hooks using direct `axios` calls have been checked for breakage — not just the feature under review.
* [ ] **@RequestParam vs @RequestBody**: For every new POST/PUT endpoint, verify the frontend hook sends data in the format the backend expects. `@RequestParam` requires `params: { key: val }` (null body); `@RequestBody` requires a JSON body object. A mismatch causes a 400 with no obvious error.
* [ ] **apiClient URL prefix**: Frontend calls using `apiClient` must NOT include `/api/v1/` in the path — `apiClient` already has `baseURL: '/api/v1'`. Passing `/api/v1/path` results in a double-prefix 404.
* [ ] **Response DTO completeness**: Verify that every field the frontend list/table component renders (`carrierName`, `carrierEmail`, etc.) is actually present in the backend response DTO. A missing field renders silently as blank — not an error.
* [ ] **Golden Path Smoke Test**: The reviewer has confirmed (or the PR author has documented) that login → primary feature → adjacent flows (load board, profile, notifications) → logout all work without network errors in a **running browser** (not just API calls). Backend tests passing ≠ frontend working.

---

## 6. Spring Security Filter Safety (Security Chain Gate)
* [ ] **No double registration**: Any filter that is both `@Component` AND added via `addFilterBefore`/`addFilterAfter` in `SecurityConfig` MUST have a `FilterRegistrationBean` with `setEnabled(false)` to prevent it running outside the security chain. Without this, `SecurityContextHolderFilter` clears the auth set by the pre-chain run, causing 401 on all protected endpoints.
* [ ] **Cache names registered**: Every `@Cacheable("name")` annotation references a cache name declared in `CacheConfig`. Missing names cause 500 errors at runtime.
* [ ] **JJWT audience validation**: Do not use `requireAudience(String)` on the JJWT parser builder (0.12.x bug — compares String against Set). Validate audience manually after `parseSignedClaims`.
* [ ] **@PermitAll on auth endpoints**: Public auth endpoints (`/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/debug/*`) MUST have `@PermitAll` annotation. Missing annotation causes 401 Unauthorized before endpoint logic executes.
* [ ] **JWT filter skiplist**: Does `JwtAuthenticationFilter.doFilterInternal()` skip entire `/api/v1/auth/` path? Validate that public endpoints are not subjected to token validation. Missing skiplist causes public endpoint rejection.
* [ ] **Form field registration (Frontend)**: If the PR modifies `ProfilePage.tsx` or form components, verify that all form fields appear in BOTH (1) Zod schema definition AND (2) useForm({ defaultValues: { ... } }). Missing fields are silently stripped from form submission (no error in console). Test with Network tab inspection of PUT payload.

---

## ⚖️ Review Verdicts
- **APPROVED**: All boxes checked. Code meets the 10-complexity mandate and security requirements.
- **REJECTED**: Failure to meet any NFR (Complexity, RLS, Coverage).
- **TECHNICAL DEBT**: Minor issues that do not break RLS or Complexity gates but require future refactoring.