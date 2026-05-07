# Definition of Done (DoD)
All features must pass these gates before being marked "DONE".

## 🏗️ Architectural Gate
- IDs must be `VARCHAR(36)`.
- RLS must be enabled with a tenant isolation policy.
- `deleted_at` column must be present.

## 💻 Coding Gate
- No Lombok annotations.
- 80% branch coverage (Unit tests included).
- Flyway migration naming: `VYYYYMMDD_HHmm__Desc.sql`.

## 🛡️ Security Gate
- No sensitive data (PII) in logs.
- RLS context is verified in the Service layer.

## 🔌 API Contract Gate
- Every frontend API call must resolve to an existing backend endpoint (correct version prefix, matching HTTP method).
- If `apiClient` baseURL is changed, ALL feature API files must be audited for breakage — not just the feature being developed.
- New backend controllers must declare their version prefix consistently with the existing base URL in `apiClient.ts`.

## 🧪 Test Suite Gate
Before marking any story DONE, all automated test suites must be green:

- **Backend unit + integration tests:** `mvn test` — 0 failures, JaCoCo ≥ 80% branch coverage.
- **Frontend unit tests:** `npm run test` — 0 failures.
- **Frontend e2e tests:** `npm run test:e2e` — 0 failures. Any UI feature touched by the story must have a corresponding Playwright test covering the golden path before sign-off.

A story cannot be marked DONE if any suite has a failing test.

## 🖥️ Integration Smoke Test Gate
Before marking any story DONE, the developer must verify the golden path end-to-end in a running dev environment:
1. **Login** with a valid shipper and a valid trucker account.
2. **Primary feature** — exercise the feature introduced or modified by the story.
3. **Adjacent flows** — confirm that load board, profile, and notifications still render without errors.
4. **Logout** — confirm session is cleanly terminated.

A story cannot be marked DONE if any step above produces a console error, network 404/500, or blank UI.

> **Note on e2e navigation:** Playwright tests must use client-side navigation (clicking links/buttons) after the initial login — never `page.goto()` for protected routes. A second full-page load triggers `AuthInitializer` again and the rotated refresh token will be expired, causing a redirect to `/login`.