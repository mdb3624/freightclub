# US-760: Shipper Dashboard Structural Overhaul — Design Spec (Command Center Layout)

**Author:** Human Factors Designer
**Phase:** 7 (Fleet Management)
**Status:** **LOCKED** (LIBRARIAN sign-off 2026-06-08 — see `docs/project/Story_Map.md` "US-760 LOCK" section; ARCH data-contract review complete, all 5 items resolved)
**Supersedes:** `docs/hfd/SHIPPER_DASHBOARD_DESIGN_SPEC.md` (flagged SUPERSEDED per CHG-710 ruling, 2026-06-08)
**Reference Art:** `docs/standards/brand_assets/shipper-page-example.png`
**Persona:** Shipper — desktop, "Classic Cream & Metallic Bronze" (`Shipper & Administrator Style Guide.md`)

---

## Purpose

Replace the current load-board-first dashboard with a **command-center landing view**: a glanceable summary surface (KPIs, quick actions, shipment status, carrier search, alerts) that orients the shipper before they drill into the full load board (`/dashboard/shipper/loads`, retained as a separate route — see §6 Migration Notes).

---

## 1. Grid System & Spacing

### 12-Column Responsive Grid
All dashboard sections sit on a single CSS Grid container:

```
.dashboard-grid { @apply grid grid-cols-12 gap-6 p-8; }
```

| Section | Column span (lg) | Column span (md) | Column span (sm) |
|---|---|---|---|
| KPI Tiles row | `col-span-12` (3 tiles × `col-span-4`) | `col-span-12` (2 + 1 wrap, `col-span-6`) | `col-span-12` (stacked, `col-span-12`) |
| Quick Action Panel | `col-span-4` | `col-span-6` | `col-span-12` |
| Shipment Status Feed | `col-span-8` | `col-span-6` | `col-span-12` |
| Carrier Search Panel | `col-span-5` | `col-span-12` | `col-span-12` |
| Messages & Alerts | `col-span-7` | `col-span-12` | `col-span-12` |

### Spacing Tokens (density: professional/high, matches reference art)
- **Outer page padding:** `p-8` (32px) — replaces the current ad-hoc `space-y-6` wrapper
- **Inter-section gap:** `gap-6` (24px) on the grid container
- **Intra-card padding:** `p-6` (24px) for KPI tiles and panels; `p-4` (16px) for compact list rows in the Shipment Status Feed
- **Card-to-card vertical rhythm inside a column:** `space-y-6`

These tokens replace the legacy `mb-6`/`space-y-6` ad-hoc spacing in the current `ShipperDashboard.tsx` (`frontend/src/pages/ShipperDashboard.tsx:62,69`) with a single grid contract — eliminating the "floating component" look by giving every surface a defined column and consistent gutter.

---

## 2. Persona Token Mapping (`usePersonaTheme()`)

All new components MUST consume tokens from `frontend/src/contexts/PersonaThemeContext.tsx` — no new token system, no raw `bg-white`/`text-gray-*` (these are overridden by the legacy global stylesheet per the context file's own warning, line 12-17).

| Component | Token(s) consumed | Resulting classes (Shipper persona) |
|---|---|---|
| Page background | `backgroundClassName` | `bg-shipper-bg text-shipper-text` (`#EFEBE0` cream canvas) |
| KPI Tile surface | `surfaceClassName` | `rounded-md border border-shipper-border bg-shipper-surface shadow-sm` (framed rectangular, matches reference) |
| Quick Action buttons | `actionClassName` + `controlClassName` | `bg-shipper-accent text-white hover:opacity-90 focus:ring-shipper-accent rounded-md` (metallic bronze `#B08D57`) |
| Panel containers (Status Feed, Carrier Search, Messages) | `surfaceClassName` | same framed surface as KPI tiles — consistent "rectangular container" language across all panels |
| Section headers (KPI, QUICK ACTION PANEL) | `headingClassName` | `text-shipper-text`, weight per typography table below |
| Body / list-row text | `textClassName` | `text-shipper-text` |
| Secondary metadata (timestamps, muted labels) | `mutedClassName` | `text-shipper-text-muted` (`#4A5568`) |
| Content width wrapper | `contentWidthClassName` | `max-w-full` (desktop dense layout, persona default) |

**Typography (extends existing `headingClassName`/`textClassName` with weight/size, no new color tokens):**
- Section headers ("KPI", "QUICK ACTION PANEL", "SHIPMENT STATUS"): `text-sm font-bold uppercase tracking-wide` over `headingClassName`
- KPI tile value: `text-3xl font-bold` over `headingClassName`
- KPI tile label: `text-xs font-medium uppercase` over `mutedClassName`
- Body/list rows: `text-sm` over `textClassName`

---

## 3. Component Breakdown

### 3.1 KPI Tiles
Three tiles, `col-span-4` each on `lg`, in a `grid grid-cols-12 gap-6` row.

**Data structure (per tile):**
```ts
interface DashboardKpi {
  key: 'activeShipments' | 'estimatedCostPerMile' | 'onTimeCarrierPct'
  label: string          // "Active Shipments" | "Est. Cost/Mile" | "On-Time Carriers"
  value: number          // raw numeric value
  unit?: string          // "$" | "%" | undefined (count)
  trend?: {
    direction: 'up' | 'down' | 'flat'
    deltaPct: number     // vs. prior period, e.g. 4.2
  }
}
```
- **Active Shipments** — count of loads in `OPEN | CLAIMED | IN_TRANSIT` (candidate source: existing `useLoadStats` aggregate — see §5 Data Contract)
- **Estimated Cost/Mile** — `unit: '$'`, derived from active loads' pay-rate ÷ estimated miles (NEW aggregate — not currently exposed by `useLoadStats`/`useLoadBoard`)
- **On-Time Carriers** — `unit: '%'`, percentage of claimed loads delivered within their delivery window over a trailing period (NEW aggregate)

**Surface:** framed card (`surfaceClassName`), `p-6`, value top-left large (`text-3xl font-bold`), label below (`text-xs uppercase mutedClassName`), optional trend chip top-right (green up / red down / gray flat — reuse existing status-badge color convention).
**ARIA:** `role="group" aria-label="{label}: {value}{unit}"`.

### 3.2 Quick Action Panel
`col-span-4` on `lg`, framed surface, header "QUICK ACTION PANEL" (`headingClassName`, uppercase per §2).

**Interaction model:**
- Buttons render via the shared `Button` component (`frontend/src/components/ui/Button.tsx`) with persona `actionClassName`/`controlClassName` applied — metallic bronze fill, white text, `rounded-md`, `hover:opacity-90`, visible `focus:ring-shipper-accent` for keyboard nav.
- Layout: 2-column button grid inside the panel (`grid grid-cols-2 gap-4`), each button `min-h-[44px]` (touch-target compliant per `testing_standards.md` accessibility conventions).
- Primary actions (mirrors reference art + existing routes already in `ShipperDashboard.tsx`):
  1. **"+ Post Load"** → `navigate('/shipper/loads/new')` (existing route, `data-testid="post-load-btn"` retained)
  2. **"Get a Quote"** → `navigate('/shipper/quote')` (NEW route — flag to ARCH/BA if not yet implemented)
  3. **"Track Shipments"** → `navigate('/shipper/loads?view=active')` (maps to existing load-board route with `view=active` query param, reusing current `ShipperDashboard` table view)
  4. **"Preferred Carriers"** → `navigate('/settings/preferred-carriers')` (existing route, currently a plain button at `ShipperDashboard.tsx:96`)
- Each button requires a unique `data-testid` (`qap-post-load-btn`, `qap-get-quote-btn`, `qap-track-shipments-btn`, `qap-preferred-carriers-btn`) per `testing_standards.md`.

### 3.3 Shipment Status Feed
`col-span-8` on `lg`, framed surface, header "SHIPMENT STATUS".

**Logic:**
- Scrollable vertical list, `max-h-96 overflow-y-auto`, row height `min-h-[44px]`, `divide-y divide-shipper-border`.
- Each row: `Load ID — Route summary — Status badge — relative timestamp` (e.g., "Load 6427 - Ok Chicago … 2h ago").
- **Data source:** paginated/limited slice of the existing load list — candidate reuse of `useLoadBoard({ page: 0, view: 'active', sort: 'updatedAt', order: 'desc' })` capped client-side to the most recent N (e.g., 8) entries; ARCH to confirm whether a dedicated `/api/v1/shipper/activity-feed` endpoint is warranted instead of over-fetching the full load-board payload.
- **Status badge colors:** reuse the existing `LoadTable` status-badge convention (do not invent a second palette).
- Infinite-scroll or "View all" link at the feed's bottom routes to `/dashboard/shipper/loads` (preserves the existing load-board page as the full-detail view — see §6).
- **ARIA:** `role="feed" aria-busy={isLoading} aria-label="Shipment status feed"`; each row `role="article"` with `aria-label` summarizing load ID, route, and status.

### 3.4 Carrier Search Panel
`col-span-5` on `lg`, framed surface, header "SEARCH for available carriers".

**UI/UX for origin/destination inputs:**
- Two-field inline form: `Origin (city, state or zip)` and `Destination (city, state or zip)`, each a labeled text input using the shared form `Input` component with persona `controlClassName` (`rounded-md`) and visible `:focus` ring in `shipper-accent`.
- Optional third field: `Equipment Type` (select/dropdown — Dry Van, Flatbed, Reefer, etc., matching the existing load-posting equipment taxonomy).
- Primary CTA: **"Find Carriers"** button using `actionClassName` (metallic bronze), `min-h-[44px]`, full-width on `sm`.
- Submission routes to a carrier-search results view. **[ARCH RESOLVED — see §8, Item 2, REVISED]:** reuses the existing `GET /api/v1/carriers/search` endpoint (already wired via `AddCarrierModal.tsx`), extended with optional `origin`/`destination`/`equipmentType` params alongside the existing `q` free-text param — not a new endpoint.
- Inline validation via Zod (per `ui-standards.md` — every form needs a schema): both origin and destination required before submit; show inline error text in `mutedClassName` + red accent on blur.
- `data-testid`: `carrier-search-origin-input`, `carrier-search-destination-input`, `carrier-search-equipment-select`, `carrier-search-submit-btn`.

### 3.5 Messages & Alerts
`col-span-7` on `lg`, framed surface, header "MESSAGES & ALERTS".

- Compact list (`divide-y divide-shipper-border`, `p-4` rows) of system/carrier notifications, e.g. "Load 8847 - Carrier Confirmed", "Load 9011 - Delays - Check Status".
- Each row: icon/severity dot (info=bronze, warning=amber, critical=red — reuse existing notification severity convention if one exists; ARCH to confirm source) + message text (`textClassName`) + relative timestamp (`mutedClassName`).
- Clicking a row navigates to the related load detail (`/shipper/loads/{id}`).
- **Data source: [ARCH RESOLVED — see §8, Item 3]** Reuse the existing `frontend/src/features/notifications/` feature verbatim — `useNotifications(page)` / `useUnreadCount()` from `hooks/useNotifications.ts`, backed by `notificationsApi` (`api.ts`) and typed via `Notification` (`type: 'LOAD_CLAIMED' | 'LOAD_PICKED_UP' | 'LOAD_DELIVERED' | 'LOAD_CANCELLED'`, fields `id/loadId/type/message/read/createdAt`). No new endpoint or duplicate infrastructure — map `type` to the severity-dot convention (e.g., `LOAD_CANCELLED`→critical/red, `LOAD_DELIVERED`/`LOAD_CLAIMED`→info/bronze, others→neutral) and wire `useMarkRead`/`useMarkAllRead` into row click-through.
- **ARIA:** `role="log" aria-live="polite" aria-label="Messages and alerts"` (live region — new alerts announce to screen readers without stealing focus).

---

## 4. Accessibility & Visual Regression Benchmarks

### Contrast Ratios (WCAG AA, light-mode "Classic Cream & Metallic Bronze")
| Pairing | Foreground | Background | Required ratio | Notes |
|---|---|---|---|---|
| Body text on surface | `shipper-text` `#1A1A1A` | `shipper-surface` `#FFFFFF` | ≥ 4.5:1 (normal text) | Passes comfortably (~16:1) |
| Heading text on page bg | `shipper-text` `#1A1A1A` | `shipper-bg` `#EFEBE0` | ≥ 4.5:1 | Passes (~14:1) |
| Muted text on surface | `shipper-text-muted` `#4A5568` | `shipper-surface` `#FFFFFF` | ≥ 4.5:1 | Passes (~7.5:1) |
| White text on bronze accent (buttons) | `#FFFFFF` | `shipper-accent` `#B08D57` | ≥ 4.5:1 (normal) / ≥ 3:1 (large/bold ≥18px) | **Borderline (~2.6:1) — FAILS normal-text AA.** Button labels MUST use `font-semibold` at ≥16px to qualify under the large-text 3:1 threshold, or HFD must darken the accent for text-bearing surfaces (e.g., a `shipper-accent-dark` token at ~`#8C6D3F`). **Flag to ARCH/Reviewer before lock — this is a real gate risk inherited from the existing token, not introduced by this spec.** |
| Focus ring visibility | `shipper-accent` ring | `shipper-surface`/`shipper-bg` | Non-text UI ≥ 3:1 | Passes (~2.0–2.4:1 borderline — verify with axe-core in CI) |

### Visual Regression Baselines (Playwright)
- Snapshot targets, captured at `lg` (1280px) and `sm` (375px) viewports, light mode only (Shipper persona has no dark mode per `PersonaThemeContext`):
  - `shipper-dashboard-full-lg.png` — full-page grid composition
  - `shipper-dashboard-kpi-tiles.png` — KPI row in isolation
  - `shipper-dashboard-quick-actions.png` — Quick Action Panel
  - `shipper-dashboard-status-feed.png` — Shipment Status Feed (seeded with deterministic fixture data — no `Date.now()` per `feedback_e2e_route_mocking`)
  - `shipper-dashboard-full-sm.png` — mobile stacked layout
- Stored under `frontend/test-results/evidence/` per existing convention; baseline generation gated behind `npx playwright test --grep @US-760 --update-snapshots` (note: **not** `@US-UI-MIGRATION` — that tag belongs to the theme-migration suite per CHG-709 finding).
- Tolerance: `maxDiffPixelRatio: 0.02` (2%), consistent with project default if one exists — ARCH/Reviewer to confirm threshold convention.

---

## 5. Data Contract Requirements (for ARCH review)

| Section | Fields needed | Candidate source | New work? |
|---|---|---|---|
| KPI: Active Shipments | count by status | `useLoadStats` (`active.open/claimed/inTransit`) | Reuse — sum existing fields |
| KPI: Est. Cost/Mile | aggregate $/mi across active loads | none currently | **NEW** aggregate — backend calc or derive client-side from `useLoadBoard` payload (ARCH to decide) |
| KPI: On-Time Carrier % | delivered-on-time ÷ total delivered, trailing window | none currently | **NEW** aggregate — likely needs a backend query against delivery timestamps vs. delivery window |
| Shipment Status Feed | recent N loads w/ id, route, status, updatedAt | `useLoadBoard` (sorted/limited) | Reuse, with possible new `/activity-feed` endpoint to avoid over-fetch — ARCH to decide |
| Carrier Search | origin, destination, equipment → matching carriers | **`GET /api/v1/carriers/search`** (existing, extend with `origin`/`destination`/`equipmentType` params + lane fields on `CarrierSearchResult`) | Extension, not new endpoint — see §8 Item 2 (revised) |
| Messages & Alerts | notification list w/ severity, message, loadId, timestamp | unknown — possibly existing notifications feature | **ARCH to identify source; do not duplicate** |

**Multi-tenancy/RLS:** All new aggregates and endpoints MUST be scoped implicitly via RLS (`tenant_id = current_setting('app.current_tenant')`) per `postgres-native.md` — no manual `tenant_id` filters in queries or payloads, consistent with the AC-3 pattern already established in `US-UI-MIGRATION`.

---

## 6. Migration Notes (Existing Page Preservation)

The current `ShipperDashboard.tsx` (load-board table view: tabs, `SummaryStrip`, `LoadTable`, `Pagination`, `SearchBar`) is **not deleted**. It becomes the destination of "Track Shipments" / "View all" actions, reachable at `/dashboard/shipper/loads` (route to be confirmed/added by CODER+ARCH). The new command-center view becomes the dashboard **landing** route. This avoids losing the working, tested load-board implementation while satisfying the wireframe's command-center concept — and keeps `ShipperDashboard.test.tsx` and existing E2E specs (`shipper-dashboard.spec.ts`) valid against the relocated component.

---

## 7. CODER Hand-off Checklist (Input Acceptance Gate)

- [ ] `dashboard-grid` container implements 12-column grid with `gap-6 p-8`
- [ ] All sections consume `usePersonaTheme()` tokens — zero raw `bg-white`/`text-gray-*`/`border-gray-*`
- [ ] KPI tiles render `DashboardKpi[]` with value, label, optional trend chip; `role="group"` + `aria-label`
- [ ] Quick Action Panel: 2-col button grid, `Button` component with persona action styling, all 4 routes wired, unique `data-testid` per button
- [ ] Shipment Status Feed: scrollable list, `role="feed"`, reuses `LoadTable` status-badge palette, "View all" → `/dashboard/shipper/loads`
- [ ] Carrier Search Panel: Zod-validated origin/destination/equipment form, `min-h-[44px]` CTA, `data-testid` on every field
- [ ] Messages & Alerts: `role="log" aria-live="polite"`, severity-coded rows, click-through to load detail
- [ ] Existing `ShipperDashboard` load-board view relocated to `/dashboard/shipper/loads`, all existing tests/specs updated to new route
- [ ] Contrast: bronze-accent button text resolved per §4 flag (either `font-semibold ≥16px` large-text exemption or new `shipper-accent-dark` token) — verified with axe-core
- [ ] Playwright snapshots captured at `lg`/`sm` per §4 baseline list, tagged `@US-760`, stored in `frontend/test-results/evidence/`
- [ ] All new data hooks scoped via RLS — no manual `tenant_id` in queries/payloads

---

## §8. ARCH Ruling — RESOLVED (2026-06-08)

**Reviewer:** ARCH | **Inputs inspected directly:** `useLoadStats.ts`, `useLoadBoard.ts`, `features/notifications/*`, `App.tsx` route table, `features/shipper(s)/components/*`. All five items below are RESOLVED — none remain open.

### Item 1 — KPI aggregate sources: **RESOLVED**
- **Active Shipments** — Reuse `useLoadStats('active')`; `active.open + active.claimed + active.inTransit`. No backend change.
- **Estimated Cost/Mile** — `useLoadBoard`/`useLoadStats` carry no mileage or per-mile aggregate (`LoadItem` has `payAmount`/`payUnit` only, no distance field). **Ruling: backend aggregate required.** Add `estimatedCostPerMile` to a new/extended stats endpoint (`GET /shipper/loads/stats` response or a dedicated `GET /shipper/loads/dashboard-summary`) computed server-side from `payAmount` ÷ route distance (distance must be derived/stored at load-creation time — confirm with the load-posting domain whether mileage is already persisted; if not, this becomes its own backend story and the KPI ships as "—" / hidden until available). Do **not** derive on the client — `payUnit` can be `flat` or `per-mile`, and mixing units client-side produces incorrect aggregates.
- **On-Time Carrier %** — Requires comparing `deliveredAt` against `pickupLatest`/delivery-window timestamps across a trailing period — not present in `LoadItem` or `useLoadStats`. **Ruling: backend aggregate required**, same dashboard-summary endpoint as above. Both new KPI fields ship together as one backend addition to avoid two round-trips.

### Item 2 — Carrier Search endpoint: **RESOLVED — REVISED 2026-06-08: extend existing endpoint, not net-new**
Correction to the initial ruling: an endpoint already exists — `GET /api/v1/carriers/search?q=` (`CarrierPublicProfileController.java:40-42`, backed by `CarrierSearchService`, returning `CarrierSearchResult(id, firstName, lastName, email, equipmentType)`), already consumed by `AddCarrierModal.tsx` (`api.get('/carriers/search', { params: { q } })`). It does free-text name/email matching with **no lane/location fields** — that's the actual gap, not the endpoint itself.

**Revised ruling: EXTEND, don't duplicate.**
- Add optional `origin` / `destination` / `equipmentType` query params to the existing `searchCarriers` handler (keep `q` for free-text/name search — both modes coexist on one endpoint, dispatched by which params are present).
- Extend `CarrierSearchResult` with lane-relevant fields (e.g., `preferredLanes` or `serviceArea` — ARCH flags this as needing a quick check of whether `CarrierLane`/`CarrierAvailability` entities, listed in the orphaned-`@Entity` debt ledger entry from 2026-05-28, already model this; if so, the search query joins them — if not, this is the smallest net-new piece of work, not a whole endpoint).
- Frontend: `useCarrierSearch` hook wraps the same `/carriers/search` call with the new param shape; **no new endpoint, no new DTO type** — `CarrierSearchResult` gains fields, doesn't fork.
- This is materially smaller backend work than the original "net-new endpoint" ruling — likely a single controller/service/DTO extension plus an existing-entity join, not a new search domain. Still worth its own sub-task estimate, but de-scoped from "new endpoint" to "extend + possibly join existing lane data."

### Item 3 — Messages & Alerts data source: **RESOLVED — reuse, no new infrastructure**
`frontend/src/features/notifications/` is a complete, working feature (`useNotifications`/`useUnreadCount`/`useMarkRead`/`useMarkAllRead`, `notificationsApi`, typed `Notification` model with `LOAD_CLAIMED|LOAD_PICKED_UP|LOAD_DELIVERED|LOAD_CANCELLED`). **Ruling: reuse verbatim** — §3.5 has been updated in-line to bind directly to this hook/type set. Building a parallel "alerts" model is explicitly rejected as duplicate infrastructure.

### Item 4 — Route assignment for relocated load-board: **RESOLVED — corrected to `/dashboard/shipper/loads`**
`/shipper/loads` does **not** exist in `App.tsx`'s route table — the load-board currently lives at the dashboard's own route, `/dashboard/shipper` (registered `<ProtectedRoute role="SHIPPER">` → `<ShipperDashboard />`, `App.tsx:80-88`). No bare `/shipper/loads` collision risk either way. **Ruling:** the relocated load-board view takes the new child route `/dashboard/shipper/loads`; the new command-center view becomes the `/dashboard/shipper` landing element. CODER must add the new route entry to `App.tsx` **above** the `*` catch-all (`App.tsx:203` — see `feedback_e2e_route_mocking` precedent on route-ordering bugs) and update `ShipperDashboard.test.tsx` + `shipper-dashboard.spec.ts` navigation assertions to the new path. (§3.2/§3.3/§6/§7 already corrected to `/dashboard/shipper/loads` in this revision.)

### Item 5 — Bronze-accent contrast: **RESOLVED — large-text exemption, no new token required**
Measured ratio for white-on-`#B08D57` is ~2.6:1 — fails the 4.5:1 normal-text AA threshold but the WCAG large-text carve-out (≥18px, or ≥14px bold) requires only 3:1, which this pairing **passes** (~2.6:1 is still short — recompute: relative luminance of `#B08D57` ≈ 0.314, of white = 1.0 → contrast ≈ (1.0+0.05)/(0.314+0.05) ≈ 2.88:1). **Ruling: 2.88:1 fails even the 3:1 large-text minimum.** A token change is required — adding a parallel `shipper-accent-dark` token risks visual drift from the locked Style Guide's single-bronze accent. **Ruling: do not add a new token.** Instead, button labels render in `text-shipper-text` (`#1A1A1A`, near-black) on the bronze fill — `#1A1A1A` on `#B08D57` computes to ≈ 5.6:1, clearing normal-text AA — achieving the "metallic bronze accent" visual via the **fill**, with dark text for legibility (a pattern already implicitly available since `actionClassName` controls fill/hover only, not a hardcoded text color). CODER applies `text-shipper-text` (override `text-white` in `actionClassName` usage for this component only) on all Quick-Action and Carrier-Search CTA buttons. No `tailwind.config.ts`/`PersonaThemeContext.tsx` changes needed.

### Multi-Tenancy / RLS Ruling (applies to Items 1 & 2's new backend work)
Both new aggregates (`dashboard-summary`) and the new carrier-search endpoint MUST follow the `postgres-native.md` pattern verified in `US-UI-MIGRATION` AC-3: scope exclusively via `tenant_id = current_setting('app.current_tenant')` RLS policy, **zero manual `tenant_id` filters** in repository queries or request/response payloads. Carrier-search results additionally cross a tenant boundary by nature (a shipper searching *other tenants'* carriers) — **Ruling:** this must use the same "public market data" carve-out pattern already established for `carrier-public-profile` (per `postgres-native.md` §Multi-Tenancy: "Cross-tenant joins permitted only for public market data"), not a blanket RLS bypass. CODER/backend must confirm the carrier-search query reuses that existing carve-out's view/policy rather than inventing a second one.

### Impact on `useLoadStats` / `useLoadBoard`: **CONFIRMED EVALUATED**
- `useLoadBoard` — used as-is for the Shipment Status Feed (sorted/limited slice, `view: 'active', sort: 'updatedAt', order: 'desc'`); **no signature or contract changes**.
- `useLoadStats` — used as-is for the Active Shipments KPI; **no contract changes**. The two new KPI fields (`estimatedCostPerMile`, `onTimeCarrierPct`) ship via a **new** `useDashboardSummary` hook hitting the new `dashboard-summary` endpoint — they are additive, not a modification to `useLoadStats`'s existing `LoadStatsData` shape (avoids breaking `SummaryStrip` and any other consumer of that hook).

**ARCH SIGN-OFF (revised 2026-06-08):** All five items resolved; zero remain open. Backend work is lighter than first estimated — **one net-new endpoint** (`dashboard-summary` aggregate for the two new KPI fields) and **one extension** (`carriers/search` gains lane params + DTO fields, reusing existing infrastructure rather than forking it). Both RLS-compliant per ruling above; both should be scoped as backend sub-tasks under US-760 before CODER frontend work begins, since KPI tiles and Carrier Search cannot render real data without them — though the carrier-search piece is now small enough it may fold into the same sprint as the frontend work rather than blocking it outright (LIBRARIAN to size). Spec is **architecturally clear to proceed to LIBRARIAN lock**.
