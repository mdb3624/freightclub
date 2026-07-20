# Testing Standards — FreightClub QA Framework

**Authority:** CODER, REVIEWER, LIBRARIAN roles | **Status:** MANDATORY

Full incident narratives behind these rules: `docs/postmortems/TESTING_INCIDENTS.md`.

## Mandatory Rules (each backed by a real production incident — see postmortems doc)

- **Navigation specs must click through the real UI**, not `page.goto()` straight to the destination — `page.goto()` proves the destination renders, not that the button's `onClick`/`navigate()` path works. (US-822)
- **Docker test env (Vite dev server) passing is not sufficient evidence** for font/asset-loading, `public/` file reference, or static-serving changes — verify with a real `npm run build` + static-serve equivalent. (FREIG-114)
- **A green mocked test suite proves logic, not wiring.** Any new external API key / env-var-backed `@Value` property needs, before sign-off: an unmocked curl against the real Docker test endpoint with the response pasted in, confirmation the property is declared in every `application-*.yml` profile used, and confirmation the env var is passed through every relevant `docker-compose*.yml`. (FREIG-116/US-854)

## Architecture: Page Object Model (POM)

- Page objects (`LoginPageObject`, `LoadBoardPageObject`, etc.) hold selectors + navigation only; test files hold only assertions. No inline selectors in test methods.
- Structure: `frontend/e2e/page-objects/`, `frontend/e2e/fixtures/`.

## Selector Strategy

- Every interactive element gets a unique `data-testid`. CSS selectors, XPath, and text-content matching are banned — they break on refactor. PRs with new interactive elements and no `data-testid` are rejected at Reviewer gate.

## Traceability

- Every test file references its Story ID + AC in a header comment (see `docs/roles/CODER.md` for the format).
- Failed tests must produce a Playwright trace (`context.tracing.start/stop`, saved to `frontend/test-results/`) — attach to the PR for investigation.
- Verify tenant isolation and refresh-token flow (HTTP-only cookie, not localStorage) on any auth-adjacent test.

## Coverage Targets

- Backend unit: 80% branch target (CI-enforced floor is 65% branch via JaCoCo `check`, ratchets up over time — see `backend/pom.xml`). Backend integration: ≥70%. Frontend unit: ≥60%. E2E: golden path + 2 critical edge cases per story. No story marked DONE below 70% overall.

## No-Lombok in Test Fixtures

Standard Java POJOs (explicit constructors/getters/setters) — no `@Data`/`@Getter`/`@Setter`/`@Builder`. Lombok obscures test data construction and complicates debugging.

## Enforcement

| Violation | Action |
|-----------|--------|
| CSS/XPath selector instead of `data-testid` | Reviewer-gate rejection |
| Lombok in test fixtures | Reviewer-gate rejection |
| Test failure with no trace file | Marked unreproducible, re-run required |
| Missing AC traceability comment | Rejected (missing requirement link) |
| Coverage < target | Story cannot be marked DONE |

Full Reviewer hard-gate checklist: `docs/roles/REVIEWER.md`.
