# HFD Design Spec: US-UI-MIGRATION — Theme State UI Component Migration

**Status:** READY_FOR_CODER
**Author:** Human Factors Designer
**BA Dependency:** US-UI-MIGRATION (READY_FOR_HFD, AC-1..AC-6) — signed off
**ARCH Dependency:** `docs/plans/theme-state-separation.md`, `V20260606_1740__ThemeStateSeparation.sql`

## 1. Scope

UI-only. No backend schema/endpoint proposals (per HFD Backend Boundary rule). Defines components, tokens, layout, ARIA, and state rules for the two persona tracks consuming `user_preferences`, `carrier_telemetry`, `shipper_telemetry`.

## 2. Design Tokens by Track

### Carrier Track (mobile, dark) — `Carrier Style Guide.md`
| Token | Value |
|---|---|
| `--carrier-bg` | `#121212` |
| `--carrier-accent` | metallic copper gradient |
| `--carrier-radius` | pill (`9999px`) |
| `--carrier-touch-target-min` | `48px` height, full-width buttons |

### Shipper Track (desktop, light) — `Shipper & Administrator Style Guide.md`
| Token | Value |
|---|---|
| `--shipper-bg` | `#EFEBE0` |
| `--shipper-surface` | `#FFFFFF` |
| `--shipper-accent` | metallic bronze/copper |
| `--shipper-radius` | sharp rectangular (`4px`) |
| `--shipper-layout` | asymmetric split grid, "Quiet Hierarchy" whitespace |

## 3. Components

| Component | Track | Source Table | Notes |
|---|---|---|---|
| `ThemeModeToggle` | Both | `user_preferences.theme_mode` | 3-state segmented control (LIGHT/DARK/SYSTEM); pill geometry on Carrier, rectangular on Shipper |
| `SidebarCollapseControl` | Both | `user_preferences.sidebar_collapsed` | Single-thumb swipe affordance on Carrier; click-to-collapse rail on Shipper |
| `DashboardLayoutPanel` | Both | `user_preferences.dashboard_layout` (JSONB) | Renders persisted widget arrangement; wizard-based reconfiguration (Hick's Law — multi-step, not single dense form) |
| `CarrierTelemetryCard` | Carrier only | `carrier_telemetry.last_known_location`, `active_hours_today`, `fuel_efficiency_metrics` | Full-width stacked cards, high-contrast salience badge if `active_hours_today` nears HOS limit |
| `ShipperTelemetryGrid` | Shipper only | `shipper_telemetry.load_posting_velocity`, `preferred_carrier_engagement` | Dense data grid, Quiet Hierarchy — metrics recede until anomaly thresholds breach |

## 4. Field Contract Table

| UI Field | API Param | DB Column | Type | Notes |
|---|---|---|---|---|
| Theme mode selector | `themeMode` | `user_preferences.theme_mode` | VARCHAR(20) enum (LIGHT/DARK/SYSTEM) | matches CHECK constraint |
| Sidebar collapsed switch | `sidebarCollapsed` | `user_preferences.sidebar_collapsed` | BOOLEAN | — |
| Dashboard layout config | `dashboardLayout` | `user_preferences.dashboard_layout` | JSONB | UI serializes widget grid to JSON |
| Carrier last known location | `lastKnownLocation` | `carrier_telemetry.last_known_location` | GEOMETRY(Point,4326) → GeoJSON string for UI | ARCH to confirm GeoJSON serialization at API boundary (CHG if absent) |
| Carrier active hours today | `activeHoursToday` | `carrier_telemetry.active_hours_today` | INTEGER | — |
| Carrier fuel efficiency metrics | `fuelEfficiencyMetrics` | `carrier_telemetry.fuel_efficiency_metrics` | JSONB | — |
| Shipper load posting velocity | `loadPostingVelocity` | `shipper_telemetry.load_posting_velocity` | DECIMAL(10,2) | — |
| Shipper carrier engagement score | `preferredCarrierEngagement` | `shipper_telemetry.preferred_carrier_engagement` | DECIMAL(10,2) | — |

Field Contract validation: ✅ no empty API Param/DB Column rows, ✅ no duplicate param names, ✅ no type mismatches (GeoJSON serialization note flagged to ARCH as advisory, not blocking).

## 5. ARIA & Accessibility Requirements

- `ThemeModeToggle`: `role="radiogroup"`, each option `role="radio"` + `aria-checked`
- `SidebarCollapseControl`: `aria-expanded`, `aria-controls` referencing sidebar landmark
- `CarrierTelemetryCard` salience badge: `role="status"` + `aria-live="polite"` for HOS warnings
- `ShipperTelemetryGrid`: full `aria-sort` on sortable columns, `<table>` semantics (no div-grids)
- All interactive elements carry unique `data-testid` per `testing_standards.md`

## 6. State-Awareness Rules

- `theme_mode = SYSTEM` → component subscribes to OS `prefers-color-scheme` and re-renders without persistence write
- Telemetry cards/grids show `Pending` skeleton state while `user_preferences`/telemetry queries are in flight, `Delivered` (populated) on success, `Dispatched` (stale-but-cached) badge when React Query serves cached data during refetch

## 7. Hand-off to CODER

- Implement under `frontend/src/features/theme-preferences/` (Carrier) and `frontend/src/features/shipper-telemetry/` (Shipper) per Feature-Sliced Architecture
- Use Zod schemas for `dashboardLayout` JSON shape validation
- Wrap all calls in `useThemePreferences` / `useCarrierTelemetry` / `useShipperTelemetry` React Query hooks, relative `/api/v1/...` paths
- TDD: write component + hook tests first

## 8. Hand-off to REVIEWER

Playwright visual regression suite required at `frontend/e2e/theme-state-migration.spec.ts`, POM-based, with mandatory `page.screenshot()` at each track's golden path conclusion:
- `test-results/evidence/carrier_mobile_final.png`
- `test-results/evidence/shipper_desktop_final.png`

---
**HFD Sign-off:** ✅ Field Contract Table validated row-by-row. Status → READY_FOR_CODER.
