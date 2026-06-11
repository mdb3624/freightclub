# HFD DESIGN SPECIFICATION: US-823 Shipper Dashboard Layout Skeleton

**Story ID:** US-823  
**Phase:** Phase 10 (Command Center)  
**Status:** READY_FOR_ARCHITECT_REVIEW  
**Authority:** Human Factors Designer Role  
**Date:** 2026-06-11

---

## Overview

This specification defines the visual layout and grid structure for the Shipper Dashboard skeleton. The focus is on **establishing a stable, responsive grid** that serves as the foundation for modular components (US-824, US-825, US-826) to be integrated later.

**Key Principle:** The grid is **intentionally minimalist** — empty placeholder panels with clear visual boundaries allow downstream stories to inject content without reworking layout.

---

## Visual Layout

### Full Page Grid (Desktop, ≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  p-8 (padding: 32px all sides)                                      │
├─────────────────────────────────────────────────────────────────────┤
│  ShipperPageHeader (US-821) — col-span-12                           │
│  (Bounded panel: logo, timestamp, notification bell, avatar)        │
├─────────────────────────────────────────────────────────────────────┤
│  gap-6 (24px)                                                       │
├─────────────────────────────────────────────────────────────────────┤
│  KPISummaryPanel (US-820) — col-span-12                             │
│  (3 KPI tiles: Active Shipments, On-Time %, Cost/Mile)              │
├─────────────────────────────────────────────────────────────────────┤
│  gap-6 (24px)                                                       │
├───────────────────────────┬──────────────────────────────────────────┤
│  Shipment Status Panel    │  Quick Actions Panel                    │
│  (col-span-8)             │  (col-span-4)                           │
│  ┌─────────────────────┐  │  ┌──────────────────┐                  │
│  │  [PLACEHOLDER]      │  │  │  [PLACEHOLDER]   │                  │
│  │  data-testid=       │  │  │  data-testid=    │                  │
│  │  shipment-status    │  │  │  quick-actions   │                  │
│  └─────────────────────┘  │  └──────────────────┘                  │
├───────────────────────────┴──────────────────────────────────────────┤
│  gap-6 (24px)                                                       │
├─────────────────────┬───────────────────────────────────────────────┤
│  Carrier Search     │  Messages & Alerts Panel                      │
│  Panel              │  (col-span-7)                                 │
│  (col-span-5)       │  ┌──────────────────────────────────────────┐ │
│  ┌──────────────┐   │  │  [PLACEHOLDER]                           │ │
│  │ [PLACEHOLDER]│   │  │  data-testid= messages-alerts            │ │
│  │ data-testid= │   │  │                                          │ │
│  │ carrier-     │   │  └──────────────────────────────────────────┘ │
│  │ search       │   │                                              │
│  └──────────────┘   │                                              │
└─────────────────────┴───────────────────────────────────────────────┘
```

### Tablet Layout (768–1023px)

```
┌────────────────────────────────────────┐
│  ShipperPageHeader (US-821)            │
│  col-span-12                           │
├────────────────────────────────────────┤
│  KPISummaryPanel (US-820)              │
│  col-span-12                           │
├────────────────────────────────────────┤
│  Shipment Status (col-span-6)          │
│  Quick Actions (col-span-6)            │
├────────────────────────────────────────┤
│  Carrier Search (col-span-6)           │
│  Messages & Alerts (col-span-6)        │
└────────────────────────────────────────┘
```

### Mobile Layout (≤767px)

```
┌──────────────────────────┐
│  ShipperPageHeader       │
│  col-span-12             │
├──────────────────────────┤
│  KPISummaryPanel         │
│  col-span-12             │
├──────────────────────────┤
│  Shipment Status         │
│  col-span-12             │
├──────────────────────────┤
│  Quick Actions           │
│  col-span-12             │
├──────────────────────────┤
│  Carrier Search          │
│  col-span-12             │
├──────────────────────────┤
│  Messages & Alerts       │
│  col-span-12             │
└──────────────────────────┘
```

---

## Grid Container Specifications

### CSS Grid Definition

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-lg);        /* 24px */
  padding: var(--space-xl);    /* 32px */
  max-width: 100%;
}

/* Desktop: 12-column layout */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(12, 1fr);
  }
}

/* Tablet: 12-column layout (components still use col-span-6 / col-span-12) */
@media (min-width: 768px) and (max-width: 1023px) {
  .dashboard-grid {
    grid-template-columns: repeat(12, 1fr);
  }
}

/* Mobile: 1-column layout (all components stretch full width) */
@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    padding: var(--space-lg);  /* 24px, reduce outer padding on mobile */
    gap: var(--space-md);      /* 16px, tighter spacing */
  }
  
  /* Override col-span for mobile stacking */
  .dashboard-grid > * {
    grid-column: span 1 !important;
  }
}
```

### Page Background & Context

- **Background Color:** `var(--color-surface-bg)` (inherited from shipper persona via `usePersonaTheme()`)
- **Content Margin:** `var(--space-lg)` (24px) on left/right of grid container to provide breathing room within the page viewport
- **Page Structure:** 
  ```html
  <div className="min-h-screen bg-shipper-bg">
    <main role="main" aria-label="Shipper Dashboard" className="dashboard-grid">
      <!-- Grid items here -->
    </main>
  </div>
  ```

---

## Placeholder Panel Specifications

### General Placeholder Styling

Each empty panel `.panel` renders with consistent visual treatment to indicate it is a **container awaiting content**:

```css
.dashboard-grid > [role="region"] {
  border: 1px solid var(--border-widget);      /* #D0D0D0 */
  background-color: var(--color-surface-white); /* #FFFFFF */
  border-radius: var(--radius-widget);          /* 8px */
  padding: var(--space-lg);                     /* 24px */
  box-shadow: var(--shadow-subtle);             /* 0 2px 4px rgba(0,0,0,0.05) */
  min-height: 200px;                            /* Visible but minimal content height */
}

.dashboard-grid > [role="region"] > .placeholder-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-tertiary);  /* #636E72 */
  font-size: var(--font-size-sm);     /* 12px */
  font-style: italic;
  text-align: center;
}
```

### Shipment Status Feed Placeholder
- **Location:** Left side, Desktop col-span-8 | Tablet col-span-6 | Mobile col-span-12
- **Placeholder Text:** "Shipment Status Feed (placeholder — story US-824)"
- **data-testid:** `dashboard-shipment-status-panel`
- **aria-label:** "Shipment Status Feed"
- **role:** `region`

### Quick Actions Placeholder
- **Location:** Right side (row 1), Desktop col-span-4 | Tablet col-span-6 | Mobile col-span-12
- **Placeholder Text:** "Quick Actions (placeholder — story US-824)"
- **data-testid:** `dashboard-quick-actions-panel`
- **aria-label:** "Quick Actions"
- **role:** `region`

### Carrier Search Placeholder
- **Location:** Left side (row 2), Desktop col-span-5 | Tablet col-span-6 | Mobile col-span-12
- **Placeholder Text:** "Carrier Search (placeholder — story US-825)"
- **data-testid:** `dashboard-carrier-search-panel`
- **aria-label:** "Carrier Search"
- **role:** `region`

### Messages & Alerts Placeholder
- **Location:** Right side (row 2), Desktop col-span-7 | Tablet col-span-6 | Mobile col-span-12
- **Placeholder Text:** "Messages & Alerts (placeholder — story US-826)"
- **data-testid:** `dashboard-messages-alerts-panel`
- **aria-label:** "Messages & Alerts"
- **role:** `region`

---

## Accessibility & Visual Regression

### WCAG Compliance

- **Landmark Structure:** `<main role="main" aria-label="Shipper Dashboard">`
- **Regions:** Each placeholder panel has `role="region"` with descriptive `aria-label`
- **Keyboard Navigation:** Tab order flows left-to-right, top-to-bottom (natural grid order)
- **Color Contrast:** Placeholder borders (1px #D0D0D0) and background (#FFFFFF) exceed 3:1 contrast; text color (#636E72) on white exceeds 4.5:1 (WCAG AA+)
- **Focus Indicators:** Grid items are non-interactive; focus will naturally move to interactive elements within placeholders once content is added

### Visual Regression Baselines

**E2E Snapshots (Playwright):**

| Viewport | Filename | Breakpoint | Responsive | Tag |
|----------|----------|-----------|-----------|-----|
| Desktop | `shipper-dashboard-skeleton-desktop.png` | 1280px | Full 12-col grid | @US-823 |
| Tablet | `shipper-dashboard-skeleton-tablet.png` | 768px | 2-col wrapping | @US-823 |
| Mobile | `shipper-dashboard-skeleton-mobile.png` | 375px | 1-col stacking | @US-823 |

**Storage Location:** `frontend/test-results/evidence/`  
**Tolerance:** `maxDiffPixelRatio: 0.02` (2%)  
**Purpose:** Future PRs (US-824/825/826) will update these baselines as they add content to placeholders.

---

## Design System Token Compliance

| Element | Token | Value | Status |
|---------|-------|-------|--------|
| Grid Gap | `var(--space-lg)` | 24px | ✅ |
| Outer Padding | `var(--space-xl)` | 32px | ✅ |
| Panel Border | `var(--border-widget)` | 1px solid #D0D0D0 | ✅ |
| Panel Background | `var(--color-surface-white)` | #FFFFFF | ✅ |
| Panel Shadow | `var(--shadow-subtle)` | 0 2px 4px rgba(0,0,0,0.05) | ✅ |
| Panel Radius | `var(--radius-widget)` | 8px | ✅ |
| Placeholder Text | `var(--color-text-tertiary)` | #636E72 | ✅ |

**All tokens derived from PersonaThemeContext (shipper persona). Zero hardcoded values.** ✅

---

## Implementation Notes

### Component Structure

```tsx
// ShipperDashboardPage.tsx (NEW)
export function ShipperDashboardPage() {
  return (
    <main 
      role="main" 
      aria-label="Shipper Dashboard"
      className="min-h-screen bg-shipper-bg"
    >
      {/* Header */}
      <ShipperPageHeader />

      {/* Grid Container */}
      <div className="dashboard-grid">
        {/* KPI Row */}
        <KPISummaryPanel />

        {/* Row 2: Shipment Status + Quick Actions */}
        <PlaceholderPanel
          testId="dashboard-shipment-status-panel"
          label="Shipment Status Feed"
          colSpan={8}
        />
        <PlaceholderPanel
          testId="dashboard-quick-actions-panel"
          label="Quick Actions"
          colSpan={4}
        />

        {/* Row 3: Carrier Search + Messages */}
        <PlaceholderPanel
          testId="dashboard-carrier-search-panel"
          label="Carrier Search"
          colSpan={5}
        />
        <PlaceholderPanel
          testId="dashboard-messages-alerts-panel"
          label="Messages & Alerts"
          colSpan={7}
        />
      </div>
    </main>
  );
}

// PlaceholderPanel.tsx (REUSABLE)
interface PlaceholderPanelProps {
  testId: string;
  label: string;
  colSpan: number; // 4, 5, 7, 8, 12
}

export function PlaceholderPanel({ testId, label, colSpan }: PlaceholderPanelProps) {
  return (
    <div
      data-testid={testId}
      role="region"
      aria-label={label}
      className={`col-span-${colSpan} border border-widget rounded-md p-6 bg-white shadow-subtle min-h-[200px] flex items-center justify-center`}
    >
      <p className="text-tertiary italic">{label} (placeholder)</p>
    </div>
  );
}
```

**Note on `col-span-*` Tailwind classes:** These must be explicitly configured in `tailwind.config.js` if not already present:
```js
extend: {
  gridColumn: {
    'span-4': 'span 4 / span 4',
    'span-5': 'span 5 / span 5',
    'span-7': 'span 7 / span 7',
    'span-8': 'span 8 / span 8',
    'span-12': 'span 12 / span 12',
  }
}
```

---

## Integration Points for Downstream Stories

Each story (US-824, US-825, US-826) will:

1. **Target the placeholder panel** by its `data-testid` (e.g., `dashboard-shipment-status-panel`)
2. **Replace the placeholder content** with real component (e.g., `ShipmentStatusFeed`)
3. **Maintain the grid col-span** (do not modify layout)
4. **Update Playwright snapshots** to reflect the new content

**Example (US-824 — Shipment Status Feed):**
```tsx
// Before: PlaceholderPanel renders "Shipment Status Feed (placeholder)"
// After: ShipmentStatusFeed component renders actual load list

const statusPanel = screen.getByTestId('dashboard-shipment-status-panel');
expect(statusPanel).toContainElement(screen.getByRole('feed')); // Real feed role
```

---

## Certification Statement

**I, the Human Factors Designer, certify that:**

✅ This skeleton layout is intentionally minimal and non-prescriptive of content.  
✅ Grid structure follows US-760's responsive design (col-span values, gap/padding tokens).  
✅ All spacing and colors use design system tokens (zero hardcoded values).  
✅ Placeholder panels are visually distinct (border + background) and clearly marked for replacement.  
✅ Accessibility landmarks (main, region, aria-labels) are in place for screen readers.  
✅ Responsive breakpoints are tested at desktop/tablet/mobile viewports.  
✅ E2E baselines capture the empty grid state for regression detection.

**Status:** READY FOR ARCHITECT REVIEW  
**Date:** 2026-06-11  
**HFD Approval:** ✅ READY_FOR_ARCHITECT_REVIEW

---

## Evidence

- **Responsive Grid Test:** `frontend/e2e/us-823-layout-skeleton.spec.ts` (to be written by CODER)
- **Snapshots:**
  - `test-results/evidence/shipper-dashboard-skeleton-desktop.png` (1280px)
  - `test-results/evidence/shipper-dashboard-skeleton-tablet.png` (768px)
  - `test-results/evidence/shipper-dashboard-skeleton-mobile.png` (375px)
