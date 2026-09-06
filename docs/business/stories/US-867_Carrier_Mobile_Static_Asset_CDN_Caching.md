# User Story: US-867 — Carrier Mobile Static Asset CDN Caching

**Phase:** Cross (Infrastructure / Performance)
**Status:** DRAFT
**Owner:** BA
**Depends On:** none
**Traceability:** Renumbered from FREIG-50 (old US-754) via CHG-867 — see that file for full provenance.

---

## User Story

**As a** TRUCKER (Carrier / Owner-Operator, mobile app, frequently on cellular connections in the field),
**I want to** have the app's static assets (JS, CSS, fonts) served from an edge cache close to me instead of a single-region origin,
**so that** the app loads faster and more reliably when I'm checking or claiming loads on a weak or variable cellular signal.

**Platform Foundation Mapping:** Supports the Load Board → Claim Load step of the core platform loop. Carrier is the persona affected; Shipper (desktop, broadband) sees negligible practical benefit and is not a target of this story.

---

## Background

Surfaced via `/council-review` (2026-09-01) on "should the frontend use a CDN." Council converged: the app has no measured latency problem today (recently launched, low traffic), but the fix is near-zero-cost (Cloudflare free tier) and the benefit concentrates specifically on the Carrier persona's real-world network conditions, not a hypothetical future-scale concern. Full council transcript available in session history; verdict was RESHAPE — narrow static-asset caching only, not a full GCP Cloud Storage + Load Balancer + Cloud CDN re-architecture.

This supersedes FREIG-50 (old US-754), whose design assumed a GCP Load Balancer already fronted Cloud Run — it doesn't. See `docs/changes/CHG-867.md`.

---

## Acceptance Criteria

**AC-1: Hashed static assets served from edge cache**
- **When** a Carrier's client requests a Vite-hashed JS, CSS, or font file (filename contains a content hash) after the CDN is enabled
- **Then** the response is served from the CDN edge cache on repeat requests within the cache TTL, not re-fetched from the Cloud Run origin
- **Verify:** `curl -I` against a hashed asset URL shows a CDN cache-hit header (e.g. `cf-cache-status: HIT` on second request) and `Cache-Control: public, max-age=31536000, immutable`

**AC-2: App shell never served stale**
- **When** a new frontend version is deployed
- **Then** `index.html` is never served from a stale edge cache to a client that loads the app after the deploy
- **Verify:** `curl -I` against `/index.html` shows `Cache-Control: no-cache` or a short `max-age` with `must-revalidate`; manually deploy a trivial change and confirm a fresh browser load picks it up without a hard refresh

**AC-3: API traffic bypasses the CDN cache entirely**
- **When** any request is made to `/api/*`
- **Then** it is never served from CDN cache and always reaches the Cloud Run backend directly — no caching of authenticated or tenant-scoped responses
- **Verify:** CDN cache-rule configuration explicitly excludes `/api/*`; `curl -I` against an authenticated `/api/v1/*` endpoint shows no CDN cache-hit header ever, across repeated requests

**AC-4: Redundant Google Fonts network reference removed**
- **When** the app loads
- **Then** it no longer makes a network request to `fonts.googleapis.com` — fonts are served exclusively from the now-edge-cached self-hosted `@fontsource` files
- **Verify:** browser network panel shows zero requests to `fonts.googleapis.com` on a fresh load

**AC-5: Measured latency improvement on a simulated cellular connection**
- **When** the Carrier mobile view is loaded with Chrome DevTools network throttling set to a "Slow 4G" / cellular profile, before and after CDN activation
- **Then** Time to First Byte (TTFB) and full asset-load time for the cached static assets measurably improve
- **Verify:** before/after screenshots or exported timing data from DevTools Network panel, attached as evidence per this repo's testing standards

---

## Field Contract Table

**Scope:** `BACKEND_ONLY` — infrastructure/deploy configuration change (CDN proxy, cache headers, DNS). No new UI fields, no new API endpoints, no DB schema change.

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| N/A — no UI change | N/A | N/A | N/A | N/A |

**Sign-Off Chain:**
- [ ] BA: UI fields named (N/A) + Scope set (`BACKEND_ONLY`)
- [ ] ARCH: confirms CDN topology (Cloudflare proxy in front of existing Cloud Run origin, no LB/Cloud Storage migration) and cache-header/cache-rule design *(applies even though `BACKEND_ONLY` skips the HFD row — this is infra, not app-layer backend, but still needs an ARCH-owned design doc for the cache-rule boundary around `/api`)*
- [ ] HFD: N/A (no UI change) — skipped per `BACKEND_ONLY`

---

## Out of Scope

- Full GCP Cloud Storage + global Load Balancer + Cloud CDN re-architecture (the path FREIG-50/old US-754 assumed) — explicitly deferred by the council verdict until real multi-region traffic justifies it.
- Any caching of `/api/*` responses.
- Bundle size reduction / code-splitting (a separate, already-tracked concern — see US-751, "Code-Split Auth Module from Dashboard Bundle").

---

## Definition of Done

- [ ] Field Contract Table sign-off chain complete for Scope
- [ ] All ACs implemented with passing verification evidence
- [ ] Cache-rule config reviewed to confirm `/api/*` is never cached (hard gate — tenant-isolation risk if violated)
- [ ] Playwright golden-path E2E test passes (unaffected by CDN layer)
- [ ] REVIEWER PASS issued
- [ ] LIBRARIAN sign-off completed
