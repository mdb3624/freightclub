# Testing Postmortems

Full incident narratives relocated out of `.claude/rules/testing_standards.md` (2026-07-19 governance restructure — see `/roast` council verdict) so the always-loaded rules file only carries the resulting mandatory rule, not the full story. Read this when you need the "why" behind a testing rule, or when writing a new golden-path spec for a similar surface (navigation, asset/font loading, external config wiring).

---

## `page.goto()`-to-destination E2E Specs Don't Exercise the Real Navigation Path (2026-07-16)

US-822 (2026-07-16): production shipper users clicking "My Documents" or a shipment row landed on the home page (`TruckerLandingPage`) instead of the intended route. Root cause was a repeat of the FREIG-114 caching pattern below — `index.html` was served with no `Cache-Control` header, so browsers cached it; after a redeploy replaced the content-hashed asset chunks, a stale-cached shell's `import()` for the target lazy route 404'd, breaking client-side navigation (full page loads, which always re-fetch `index.html`, were unaffected — only in-app link clicks broke). The existing `shipper-documents-routing.spec.ts` (added with the original US-822 fix, PR #39) passed throughout and never caught this: it used `page.goto('/shipper/documents')` / `page.goto('/shipper/loads/:id')` directly, which proves the route renders correctly in isolation but never exercises the button's `onClick` → `navigate()` path — the exact path where the regression lived.

**Mandatory rule:** Any golden-path E2E spec whose purpose is to verify in-app navigation (clicking a link/button that routes elsewhere) MUST drive the click through the actual UI element from a real starting page — never `page.goto()` straight to the destination URL as the primary assertion. `page.goto()` to a destination is acceptable only for verifying the destination page's own rendering, not for proving the navigation action that reaches it works. See the corrected spec at `frontend/e2e/shipper-documents-routing.spec.ts` for the pattern (click `shipment-row-${loadId}` / `action-zone-documents`, then assert the resulting URL and content).

Fix: `frontend/docker-entrypoint.sh` (the file that actually generates the running nginx config — `frontend/nginx.conf` is a template that is never read at runtime) now sets `Cache-Control: no-cache, must-revalidate` on both the `/` SPA-fallback location and the exact-match `/index.html` location.

---

## Docker Test Env Cannot Catch Vite-Dev-vs-Prod Asset Bugs (2026-07-11)

The Docker test environment (`docker-compose.test.yml`) runs the frontend via `Dockerfile.dev` (`npm run dev`, Vite dev server) — NOT the production build path (`npm run build` + nginx serving `dist/`). Vite's dev server has live bare-specifier resolution middleware that can silently mask bugs in raw `public/` CSS `@import`s or similar asset-loading code, which only manifest once nginx serves the static build (FREIG-114). **The Docker test env passing is not sufficient evidence for any change to font/asset loading, `public/` file references, or static serving behavior** — verify with a real `npm run build` + `vite preview` (or equivalent nginx-equivalent static serving) before sign-off.

---

## Mocked Tests Cannot Catch Config/Wiring Bugs (2026-07-14)

Unit and jsdom-level tests that mock a service (`EiaFuelPriceService`, `apiClient`, etc.) prove the code's *logic* is correct given a value — they cannot prove the value ever arrives. FREIG-116/US-854: all backend unit tests and the frontend `LoadBoardTable.test.tsx` passed with 100% green, but `docker-compose.test.yml` never passed `EIA_API_KEY`/`EIA_ENABLED` to the container AND `application.yml` never bound `app.eia.api-key`/`app.eia.enabled` to those env vars in the first place — so the live feature returned `available:false` in every environment that existed. Nothing in the automated suite exercised the real seam (env var → Spring property → external HTTP call → response).

**Mandatory rule:** Any story that reads a new external API key, external service config, or env-var-backed `@Value` property MUST include, before sign-off:
1. A `curl`/fetch against the ACTUAL unmocked endpoint in the Docker test environment, with the real response pasted into the PR/story doc.
2. Confirmation that the property is declared in every `application-*.yml` profile actually used (`application.yml`, `application-test.yml`, `application-prod.yml` as applicable) — not just referenced via `@Value`.
3. Confirmation the corresponding env var(s) are passed through in every relevant `docker-compose*.yml` (via explicit `environment:` entries or `env_file:`).

A fully-mocked green test suite is evidence the logic works, not evidence the feature works. Do not declare a story CODER-complete on mocked-test evidence alone when the story's core value depends on an external integration.
