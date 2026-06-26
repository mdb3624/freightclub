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
* [ ] **Touch Target Automation (OO/Carrier stories)**: "≥48px touch targets" is satisfied ONLY by an automated Playwright `boundingBox()` assertion against every new interactive element (or a blanket `page.locator('button')` sweep) — never by visual inspection alone. CHG-US730-001 (2026-06-25): 4 buttons shipped at 40px or undefined tap area and passed REVIEWER sign-off because the AC-2 test only covered 2 of the dashboard's ~8 buttons. New buttons without a corresponding boundingBox assertion are an automatic REJECT.
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

## 6. Design System & UI Conformance (Shipper Persona Gate)

**Applies to:** Any PR touching shipper-facing pages, components, or layouts

* [ ] **ShipperPageLayout Conformance (MANDATORY)**: Is this a shipper page? If yes:
  - ✅ MUST be wrapped in `<ShipperPageLayout>` component
  - ✅ MUST NOT implement custom header/navigation structure
  - ✅ MUST NOT override layout styling without documented exception
  - ❌ Automatic rejection if ShipperPageLayout is missing — no exceptions permitted
  - **Reference:** Shipper & Administrator Style Guide §7
  
* [ ] **Shipper Style Guide Compliance**: Does the PR follow Shipper & Administrator Style Guide (§6 Atomic Components)?
  - ✅ All padding/margin are multiples of 8px (space tokens: xs=4, sm=8, md=16, lg=24, xl=32)
  - ✅ All form inputs are exactly 40px height
  - ✅ All input borders are 4px radius (not 6px, 8px, or other)
  - ✅ Focus state borders are 2px solid `#B08D57` (Brand Bronze)
  - ✅ Container borders are exactly 1px solid `#D0D0D0` (not `#E8E3D8` or other)
  - ✅ CTA buttons use metallic bronze gradient (per US-824 pattern)
  - ✅ Status colors use semantic palette: `#27AE60` (success), `#E74C3C` (error), `#F39C12` (warning), `#3498DB` (info)
  - ✅ Text colors respect hierarchy: `#1A1A1A` (primary), `#636E72` (secondary), `#4A5568` (muted)
  
* [ ] **Responsive Design**: If the PR includes responsive changes:
  - ✅ Desktop (≥1024px): Full-width optimized layouts
  - ✅ Tablet (768–1023px): Graceful column stacking
  - ✅ Mobile (≤767px): Acceptable fallback (not primary for shipper persona)
  - ✅ No layout shifts between breakpoints (test at 1024, 768, 375 pixel widths)

* [ ] **Typography Conformance**: All text follows established hierarchy:
  - ✅ Headings: Sora font, bold, uppercase, wide letter-spacing
  - ✅ Body text: 14px minimum (Inter/Roboto)
  - ✅ Helper/error text: 12px, italic, correct color
  - ✅ No custom font sizes (e.g., 13px, 15px, 17px) without exception

* [ ] **Accessibility (WCAG AA)**: All color combinations meet WCAG AA contrast ratio (≥4.5:1):
  - ✅ Text on white (`#FFFFFF`) backgrounds: Test with WAVE or Contrast Ratio checker
  - ✅ Status badges: Verify color + icon/text provide redundant indication (not color-only)
  - ✅ Focus indicators: All interactive elements have 2px outline (keyboard navigation)
  - ✅ ARIA labels: Forms have `aria-label`, errors have `aria-describedby`, required fields have `aria-required="true"`

---

## 7. Spring Security Filter Safety (Security Chain Gate)
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