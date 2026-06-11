# US-823: Shipper Dashboard Layout Skeleton

**Story ID:** US-823  
**Phase:** Phase 10 (Command Center)  
**Status:** READY_FOR_DESIGN  
**Scope:** UI_ONLY  
**Effort:** 2 days  
**Priority:** P0

---

## User Story

**As a** Shipper  
**I want to** see a unified dashboard landing page that shows my business metrics and quick actions in one view  
**So that** I can understand my operational status and access key workflows without navigation friction

---

## Acceptance Criteria

### AC-1: Dashboard Landing Page
```gherkin
Given a logged-in Shipper visits /dashboard/shipper
When the page loads
Then the new dashboard landing page is displayed
  And the page shows my key business information in an organized layout
  And the page is responsive (works on desktop, tablet, and mobile)
  And no errors occur in the console
```

### AC-2: Header Integration
```gherkin
Given the Shipper Dashboard loads
When the page renders
Then the header (US-821) is visible at the top
  And I can see my profile avatar, notifications, and dashboard branding
  And the header works the same as it does on other pages
```

### AC-3: KPI Metrics Integration
```gherkin
Given the Shipper Dashboard loads
When the page renders
Then my business KPI metrics (US-820) are displayed
  And I can see my active shipments, on-time %, and cost/mile
  And the metrics update when my load status changes
```

### AC-4: Content Sections Layout
```gherkin
Given the Shipper Dashboard loads
When the page renders
Then four main content sections are visible:
  1. Shipment Status (shows recent load activity)
  2. Quick Actions (buttons for common tasks)
  3. Carrier Search (search for available carriers)
  4. Messages & Alerts (notifications about my loads)
  And all sections are easily navigable
  And the layout adapts to my screen size (desktop, tablet, mobile)
```

### AC-5: Route & Navigation
```gherkin
Given the new dashboard landing page at /dashboard/shipper
When a shipper navigates to the dashboard
Then the dashboard loads as the primary entry point
  And the previous load-board view is still accessible (at /dashboard/shipper/loads)
  And I can navigate between the dashboard and load-board without issues
```

### AC-6: Composite Framework Grid Mapping (Architectural Constraint)
```gherkin
Given the Shipper Dashboard uses the Composite Framework
When the page structure is defined
Then all content sections must map to the zone-widget-slots grid as follows:
  - Shipment Status section → `.slot-b` (System of Record mapping)
  - Action Zone section (Quick Actions + Carrier Search + Messages) → `.slot-c` (System of Record mapping)
  - Header → `.slot-header` (via US-821 integration)
  - KPI Summary → `.slot-content` or appropriate primary zone (via US-820 integration)
  And the grid structure strictly adheres to the 12-column layout defined in index.css
```

### AC-7: Panel Class Requirement (Assembly Mandate)
```gherkin
Given all content sections in the dashboard
When the HTML structure is reviewed
Then every major content section must use the `.panel` class as the container
  And the `.panel` class is defined in index.css (System of Record, §6.5)
  And all panel styling (borders, shadows, spacing) is inherited from this single class definition
  And no duplicate or overriding panel styles exist across the dashboard
```

### AC-8: Layout Stability & Jitter Prevention (Placeholder Protocol)
```gherkin
Given the dashboard renders with empty or loading states
When content sections are loading or empty
Then:
  - All placeholders maintain fixed height (no height collapse on load)
  - All placeholders use standard loading skeleton patterns from the framework
  - Grid alignment remains stable (no "jitter" or layout shift when content loads)
  - Skeleton states match the final content dimensions
  And the HFD role provides E2E screenshot evidence validating this behavior
```

### AC-9: Visual Integrity & Grid Alignment (HFD Artifact Requirement)
```gherkin
Given the Shipper Dashboard layout is complete
When HFD conducts visual validation
Then the following E2E screenshot artifacts must be provided:
  - `shipper-dashboard-grid-alignment-desktop.png` (1280px, validates 12-column alignment)
  - `shipper-dashboard-grid-alignment-tablet.png` (768px, validates column wrapping)
  - `shipper-dashboard-grid-alignment-mobile.png` (375px, validates 1-column stacking)
  - `shipper-dashboard-loading-states.png` (all sections in skeleton state, validates jitter prevention)
  And all artifacts are stored in test-results/evidence/ with @US-823 tag
  And grid lines/alignment are visually verified (no misalignment, overflow, or gaps between sections)
```

## Content Sections & Framework Mapping

| **Section** | **Purpose** | **Composite Framework Slot** | **Panel Class** | **Dependency** |
|---|---|---|---|---|
| Header | Navigation, profile, notifications | `.slot-header` | `.panel` | US-821 |
| KPI Metrics | Business health overview | `.slot-content` (primary) | `.panel` | US-820 |
| Shipment Status | Recent load activity | `.slot-b` | `.panel` | US-824 |
| Action Zone (Quick Actions + Carrier Search + Messages) | Tools & notifications | `.slot-c` | `.panel` | US-824/825/826 |

## Composite Framework Requirements (Non-Negotiable)

**Grid Specification:**
- All content sections must map to the zone-widget-slots grid defined in `index.css`
- Shipment Status section → `.slot-b`
- Action Zone section → `.slot-c`
- Framework uses 12-column grid layout with responsive breakpoints
- All grid alignment validated via E2E screenshots at desktop/tablet/mobile

**Assembly Mandate:**
- Every major content section MUST use the `.panel` class as its container
- `.panel` class is the System of Record for panel styling (§6.5 in index.css)
- No duplicate or overriding panel styles; all panels inherit from single `.panel` definition
- Margins, padding, shadows, and borders are managed by `.panel` class only

**Placeholder Protocol (Layout Stability):**
- All empty/loading states must prevent "layout jitter"
- Skeleton placeholders must maintain fixed height matching final content height
- Standard loading skeleton patterns from the framework MUST be used
- Grid alignment remains stable throughout content load lifecycle

**Visual Integrity (HFD Validation):**
- HFD must provide E2E screenshot artifacts validating grid alignment
- Screenshots required at 1280px (desktop), 768px (tablet), 375px (mobile)
- Loading skeleton states must also be captured and validated
- Stored in `test-results/evidence/` with `@US-823` tag

## Data & Dependencies

- **Depends on:** US-820 (KPI Summary), US-821 (Header Navigation) — both COMPLETED
- **Enables:** US-824 (Quick Actions), US-825 (Carrier Search), US-826 (Messages & Alerts)
- **Route:** `/dashboard/shipper` becomes the new dashboard landing page
- **Backward Compatibility:** Existing load-board page remains accessible at `/dashboard/shipper/loads`

## BA Sign-Off

- [x] Story ID: US-823
- [x] ACs describe user needs (not system design)
- [x] Business value clear: unified dashboard improves operational visibility
- [x] Scope: UI_ONLY (no backend changes)
- [x] Unblocks: US-824, US-825, US-826

**BA Status:** ✅ **READY_FOR_DESIGN**
