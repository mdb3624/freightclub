# SHELL_CONTRACT.md

**Status:** 🔒 LOCKED (Immutable Master Layout Authority)  
**Version:** 1.0  
**Authority:** ARCHITECT Role (via LIBRARIAN Formalization)  
**Effective Date:** 2026-06-10  
**Valid Through:** Until explicitly superseded via CHG-### process

---

## Executive Summary

This document is the **Master Layout Authority** for the Resilience Logistics Platform. It defines the immutable global shell (header, navigation, grid system, component standards, responsive behavior) that ALL widgets must adhere to.

**Core Mandate:** No widget development proceeds without explicit reference to this contract. Any deviation requires a formal Change Request (CHG-###) and ARCHITECT approval.

**Audience:** ARCHITECT (enforcer), HFD (mockup validation), CODER (implementation), REVIEWER (audit)

---

## 1. GLOBAL GRID SYSTEM

### Container Specifications

| Property | Value | Rationale |
|---|---|---|
| **Max Width** | 1200px | Desktop-optimized; prevents excessive line-length on ultra-wide monitors |
| **Alignment** | Center-aligned (margin: 0 auto) | Balanced visual hierarchy |
| **Horizontal Padding** | 24px | Breathing room on desktop; reduces to 16px (tablet) and 12px (mobile) |
| **Vertical Padding** | 24px top/bottom | Consistent spacing from header and footer |

### CSS Implementation (Master Reference)

```css
/**
 * SHELL_CONTRACT.md: Global Container
 * Version: 1.0 (LOCKED)
 */

:root {
    /* Container */
    --shell-max-width: 1200px;
    --shell-padding-desktop: 24px;
    --shell-padding-tablet: 16px;
    --shell-padding-mobile: 12px;
    
    /* Gutter (space between grid columns) */
    --shell-gutter-desktop: 24px;
    --shell-gutter-tablet: 16px;
    --shell-gutter-mobile: 12px;
    
    /* Breakpoints */
    --breakpoint-tablet: 768px;
    --breakpoint-mobile: 400px;
}

.shell-container {
    max-width: var(--shell-max-width);
    margin: 0 auto;
    padding: 24px var(--shell-padding-desktop);
}

@media (max-width: 1023px) {
    .shell-container {
        padding: 24px var(--shell-padding-tablet);
    }
}

@media (max-width: 767px) {
    .shell-container {
        padding: 24px var(--shell-padding-mobile);
    }
}
```

---

## 2. ZONE DEFINITIONS (Immutable Layout Areas)

### Zone Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     ZONE_HEADER                         │
│          (Page Title, Breadcrumbs, Quick Actions)       │
│  Height: 64px | Padding: 12px 24px | Background: white │
├─────────────────────────────────────────────────────────┤
│  │                                                       │
│  │ ZONE_NAV                 ZONE_MAIN                   │
│  │ (Sidebar/Topbar)         (Primary Workspace)         │
│  │ Width: 240px             Width: remaining            │
│  │ or Hidden (mobile)       Padding: 24px              │
│  │                                                       │
│  │ ┌─────────────────────────────────────────────┐     │
│  │ │ ZONE_WIDGET_SLOTS                           │     │
│  │ │ (Dynamic widget container)                  │     │
│  │ │                                             │     │
│  │ │ ┌─────────────────────────────────────┐    │     │
│  │ │ │ SLOT_A: KPIs (100% width)           │    │     │
│  │ │ │ Height: auto | Min-height: 140px    │    │     │
│  │ │ └─────────────────────────────────────┘    │     │
│  │ │                                             │     │
│  │ │ ┌──────────────────┐ ┌──────────────────┐  │     │
│  │ │ │ SLOT_B: Primary  │ │ SLOT_C: Sidebar  │  │     │
│  │ │ │ Data (66%)       │ │ Utils (33%)      │  │     │
│  │ │ │ Min-height: 500px│ │ Min-height: 500px│  │     │
│  │ │ └──────────────────┘ └──────────────────┘  │     │
│  │ │                                             │     │
│  │ └─────────────────────────────────────────────┘     │
│  │                                                       │
└─────────────────────────────────────────────────────────┘
```

### ZONE_HEADER (Page Header Zone)

**Purpose:** Display page title, breadcrumbs, and quick-action buttons

| Property | Specification |
|---|---|
| **Height** | 64px (fixed) |
| **Background** | #FFFFFF |
| **Border** | 1px solid #E8E3D8 (bottom) |
| **Padding** | 12px 24px |
| **Alignment** | flex, align-items: center, justify-content: space-between |
| **Content** | Logo (left), Title (center), Actions/Profile (right) |
| **Z-Index** | 100 (above all zones) |

**CSS:**
```css
.zone-header {
    height: 64px;
    background: #FFFFFF;
    border-bottom: 1px solid #E8E3D8;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
}
```

### ZONE_NAV (Navigation Zone)

**Purpose:** Global navigation (sidebar or top navigation)

**Desktop (≥1024px):**

| Property | Specification |
|---|---|
| **Type** | Left sidebar (fixed or sticky) |
| **Width** | 240px |
| **Height** | 100vh (full viewport height) |
| **Background** | #EFEBE0 (cream, per Style Guide) |
| **Padding** | 24px |
| **Border** | 1px solid #E8E3D8 (right) |
| **Overflow** | scroll (if nav items exceed viewport) |

**Tablet (768-1023px):**

| Property | Specification |
|---|---|
| **Type** | Left sidebar (collapsible) |
| **Width** | 160px (collapsed nav) or full-width overlay |
| **Background** | #EFEBE0 |

**Mobile (≤767px):**

| Property | Specification |
|---|---|
| **Type** | Hidden sidebar + Hamburger menu |
| **Display** | Drawer/modal on demand |
| **Width** | 280px (when opened) |
| **Animation** | Slide-in from left (200ms ease) |

**CSS:**
```css
.zone-nav {
    width: 240px;
    height: 100vh;
    background: #EFEBE0;
    padding: 24px;
    border-right: 1px solid #E8E3D8;
    position: sticky;
    top: 0;
    overflow-y: auto;
}

/* Tablet: Collapsible sidebar */
@media (max-width: 1023px) {
    .zone-nav {
        width: 160px;
        padding: 16px;
    }
}

/* Mobile: Drawer pattern */
@media (max-width: 767px) {
    .zone-nav {
        position: fixed;
        left: -280px;
        width: 280px;
        height: 100vh;
        transition: left 200ms ease;
        z-index: 200;
    }
    
    .zone-nav.open {
        left: 0;
    }
}
```

### ZONE_MAIN (Primary Workspace Zone)

**Purpose:** Container for all widget slots and dynamic content

**Desktop (≥1024px):**

| Property | Specification |
|---|---|
| **Width** | calc(100% - 240px - 24px gutter) |
| **Margin-left** | 240px + 24px gutter |
| **Padding** | 24px |
| **Background** | #EFEBE0 (canvas color per Style Guide) |

**Tablet (768-1023px):**

| Property | Specification |
|---|---|
| **Width** | calc(100% - 160px - 16px gutter) |
| **Margin-left** | 160px + 16px gutter |
| **Padding** | 16px |

**Mobile (≤767px):**

| Property | Specification |
|---|---|
| **Width** | 100% |
| **Margin-left** | 0 (nav is drawer) |
| **Padding** | 12px |

**CSS:**
```css
.zone-main {
    width: calc(100% - 240px - 24px);
    margin-left: 240px;
    padding: 24px;
    background: #EFEBE0;
    min-height: 100vh;
}

@media (max-width: 1023px) {
    .zone-main {
        width: calc(100% - 160px - 16px);
        margin-left: 160px;
        padding: 16px;
    }
}

@media (max-width: 767px) {
    .zone-main {
        width: 100%;
        margin-left: 0;
        padding: 12px;
    }
}
```

### ZONE_WIDGET_SLOTS (Dynamic Widget Container)

**Purpose:** Container for all widget slots (KPIs, Data, Sidebar Utils)

| Property | Specification |
|---|---|
| **Display** | Grid (CSS Grid) |
| **Gap** | var(--shell-gutter) (24px/16px/12px) |
| **Columns** | 3-column layout (12-column internal grid) |

**CSS:**
```css
.zone-widget-slots {
    display: grid;
    gap: var(--shell-gutter-desktop);
    grid-template-columns: repeat(12, 1fr);
}

@media (max-width: 1023px) {
    .zone-widget-slots {
        gap: var(--shell-gutter-tablet);
    }
}

@media (max-width: 767px) {
    .zone-widget-slots {
        gap: var(--shell-gutter-mobile);
        grid-template-columns: repeat(4, 1fr);
    }
}
```

---

## 3. WIDGET SLOT DEFINITIONS (Immutable Allocations)

### SLOT_A: Key Performance Indicators (KPIs)

**Purpose:** Display high-level business metrics at a glance

| Property | Specification |
|---|---|
| **Width** | 100% (full main content width) |
| **Height** | auto (flexible based on content) |
| **Min-Height** | 140px |
| **Grid Span** | 12 columns (full width) |
| **Padding** | var(--shell-gutter) (24px/16px/12px) |
| **Background** | #FFFFFF (white surface) |
| **Border** | 1px solid #E8E3D8 |
| **Border-Radius** | 8px (per Style Guide §3) |
| **Box-Shadow** | 0 2px 4px rgba(0,0,0,0.05) |

**Example Use Case:** US-820 (KPI Summary Display) — Active Shipments, On-Time %, Cost/Mile

**CSS:**
```css
.slot-a {
    grid-column: 1 / -1;  /* Span all 12 columns */
    min-height: 140px;
    padding: var(--shell-gutter-desktop);
    background: #FFFFFF;
    border: 1px solid #E8E3D8;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1023px) {
    .slot-a {
        padding: var(--shell-gutter-tablet);
    }
}

@media (max-width: 767px) {
    .slot-a {
        padding: var(--shell-gutter-mobile);
        grid-column: 1 / -1;  /* Full width on mobile */
    }
}
```

### SLOT_B: Primary Data Display

**Purpose:** Main content area (load board, shipment list, analytics dashboard)

| Property | Specification |
|---|---|
| **Width** | 66% (8 of 12 columns on desktop) |
| **Height** | min-500px |
| **Grid Span** | 8 columns (desktop), 12 columns (tablet/mobile) |
| **Padding** | var(--shell-gutter) |
| **Background** | #FFFFFF |
| **Border** | 1px solid #E8E3D8 |
| **Border-Radius** | 8px |
| **Box-Shadow** | 0 2px 4px rgba(0,0,0,0.05) |

**Example Use Case:** US-821 (Status-First Shipment List) — Delayed loads, in-transit, delivered

**CSS:**
```css
.slot-b {
    grid-column: 1 / span 8;  /* 8 of 12 columns (66%) */
    min-height: 500px;
    padding: var(--shell-gutter-desktop);
    background: #FFFFFF;
    border: 1px solid #E8E3D8;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1023px) {
    .slot-b {
        grid-column: 1 / -1;  /* Full width on tablet */
        padding: var(--shell-gutter-tablet);
        margin-bottom: var(--shell-gutter-tablet);
    }
}

@media (max-width: 767px) {
    .slot-b {
        grid-column: 1 / -1;  /* Full width on mobile */
        padding: var(--shell-gutter-mobile);
        margin-bottom: var(--shell-gutter-mobile);
    }
}
```

### SLOT_C: Sidebar Utilities

**Purpose:** Secondary content (preferred carriers, quick actions, filters)

| Property | Specification |
|---|---|
| **Width** | 33% (4 of 12 columns on desktop) |
| **Height** | min-500px |
| **Grid Span** | 4 columns (desktop), 12 columns (tablet/mobile) |
| **Padding** | var(--shell-gutter) |
| **Background** | #FFFFFF |
| **Border** | 1px solid #E8E3D8 |
| **Border-Radius** | 8px |
| **Box-Shadow** | 0 2px 4px rgba(0,0,0,0.05) |

**Example Use Case:** US-823 (Preferred Carrier Feed) — Quick-assign buttons, carrier ratings

**CSS:**
```css
.slot-c {
    grid-column: 9 / span 4;  /* 4 of 12 columns (33%), starting at column 9 */
    min-height: 500px;
    padding: var(--shell-gutter-desktop);
    background: #FFFFFF;
    border: 1px solid #E8E3D8;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1023px) {
    .slot-c {
        grid-column: 1 / -1;  /* Full width on tablet */
        padding: var(--shell-gutter-tablet);
    }
}

@media (max-width: 767px) {
    .slot-c {
        grid-column: 1 / -1;  /* Full width on mobile */
        padding: var(--shell-gutter-mobile);
    }
}
```

---

## 4. GLOBAL COMPONENT STANDARDS

### Card Container (Reusable Widget Container)

**Applies to:** All widgets (KPI cards, data cards, form cards)

| Property | Specification | Source |
|---|---|---|
| **Background** | #FFFFFF | Style Guide §1 Surface Colors |
| **Border** | 1px solid #E8E3D8 | Subtle divider |
| **Border-Radius** | 8px | Style Guide §3 Layout |
| **Box-Shadow** | 0 2px 4px rgba(0,0,0,0.05) | Subtle drop shadow |
| **Padding** | 24px (desktop), 16px (tablet), 12px (mobile) | gutter tokens |
| **Hover State** | Box-shadow: 0 4px 12px rgba(0,0,0,0.1) | Interactive feedback |

**CSS:**
```css
.card {
    background: #FFFFFF;
    border: 1px solid #E8E3D8;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: var(--shell-gutter-desktop);
    transition: box-shadow 200ms ease;
}

.card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1023px) {
    .card {
        padding: var(--shell-gutter-tablet);
    }
}

@media (max-width: 767px) {
    .card {
        padding: var(--shell-gutter-mobile);
    }
}
```

### Typography Hierarchy (Reference Only)

**Source:** Shipper & Administrator Style Guide.md §2

| Element | Font-Size | Font-Weight | Color | Usage |
|---|---|---|---|---|
| **H1 (Page Title)** | 32px | 700 (bold) | #1A1A1A | Page headings |
| **H2 (Section)** | 24px | 700 | #1A1A1A | Section headings |
| **H3 (Card Title)** | 18px | 600 | #1A1A1A | Card/widget titles |
| **Body** | 14-16px | 400 (regular) | #1A1A1A | Standard text |
| **Caption** | 12px | 500 | #4A5568 | Labels, subtext |
| **KPI Number** | 56px | 900 (black) | #1A1A1A or status color | Metric values |

**CSS:**
```css
h1 {
    font-size: 32px;
    font-weight: 700;
    color: #1A1A1A;
}

h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1A1A1A;
}

body {
    font-size: 14px;
    font-weight: 400;
    color: #1A1A1A;
    line-height: 1.6;
}

.caption {
    font-size: 12px;
    font-weight: 500;
    color: #4A5568;
}

.kpi-number {
    font-size: 56px;
    font-weight: 900;
    color: #1A1A1A;
}
```

### Spacing Tokens (Immutable System)

| Token | Value | Use Case |
|---|---|---|
| **space-xs** | 4px | Minimal spacing (icon margins, tight lists) |
| **space-sm** | 8px | Small spacing (form fields, badge padding) |
| **space-md** | 16px | Medium spacing (card padding on tablet, gutters on mobile) |
| **space-lg** | 24px | Large spacing (card padding on desktop, zone padding) |

**CSS:**
```css
:root {
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
}

/* Examples */
.button { padding: var(--space-sm) var(--space-md); }
.form-field { margin-bottom: var(--space-md); }
.card { padding: var(--space-lg); }
```

---

## 5. RESPONSIVE BEHAVIOR (Immutable Breakpoints)

### Breakpoint Definitions

| Breakpoint | Trigger | Grid Cols | Gutter | Nav Style | Main Width |
|---|---|---|---|---|---|
| **Desktop** | ≥1024px | 12 + sidebar | 24px | Sidebar (240px) | calc(100% - 240px - 24px) |
| **Tablet** | 768-1023px | 8 + sidebar | 16px | Sidebar (160px, collapsible) | calc(100% - 160px - 16px) |
| **Mobile** | ≤767px | 4 (full width) | 12px | Drawer (hamburger) | 100% |

### Layout Transformations

#### Desktop → Tablet

1. **Navigation:** Sidebar width reduced (240px → 160px)
2. **Gutter:** Reduced (24px → 16px)
3. **Slot B & C:** Stack vertically (B full-width, then C below)
4. **Padding:** Reduced (24px → 16px)

**Trigger CSS:**
```css
@media (max-width: 1023px) {
    /* Navigation width reduction */
    .zone-nav { width: 160px; }
    
    /* Slot B & C stacking */
    .slot-b { grid-column: 1 / -1; }
    .slot-c { grid-column: 1 / -1; }
    
    /* Gutter reduction */
    :root { --shell-gutter-tablet: 16px; }
}
```

#### Tablet → Mobile

1. **Navigation:** Sidebar hidden → Hamburger drawer
2. **Main Zone:** Full width (no sidebar margin)
3. **Grid:** 12-column → 4-column
4. **Gutter:** Further reduced (16px → 12px)
5. **All Slots:** Full width (stack vertically)

**Trigger CSS:**
```css
@media (max-width: 767px) {
    /* Navigation drawer pattern */
    .zone-nav {
        position: fixed;
        left: -280px;
        width: 280px;
        transition: left 200ms ease;
    }
    
    /* Main zone full width */
    .zone-main {
        width: 100%;
        margin-left: 0;
    }
    
    /* All slots full width */
    .slot-a, .slot-b, .slot-c {
        grid-column: 1 / -1;
    }
}
```

---

## 6. OPERATIONAL RULES (Constraint Checklist)

### ✅ No Horizontal Overflow Rule

**Requirement:** The shell MUST NEVER produce a horizontal scrollbar at any breakpoint.

**Verification:**
```javascript
// JavaScript test (automated)
window.addEventListener('load', () => {
    const hasScroll = document.documentElement.scrollWidth > window.innerWidth;
    if (hasScroll) {
        console.error('SHELL_CONTRACT VIOLATION: Horizontal overflow detected');
        alert('Widget exceeds shell grid boundaries');
    }
});
```

**CODER Responsibility:**
- Verify `max-width: 100%` on all child elements
- Use `overflow-hidden` or `overflow-x: clip` on `.zone-main` if needed
- Test all widgets at declared breakpoints (1024px, 768px, 400px)

**REVIEWER Gate:**
- Reject any PR that causes horizontal scroll
- Verify at desktop (1920px), tablet (768px), mobile (375px)

### ✅ Loading States (Skeleton Loaders)

**Requirement:** All widget slots must support a generic skeleton loader during data fetch

**Standard Skeleton Component:**
```jsx
<div className="skeleton-loader">
  <div className="skeleton-line"></div>
  <div className="skeleton-line"></div>
  <div className="skeleton-block"></div>
</div>
```

**CSS:**
```css
.skeleton-loader {
    animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
    height: 16px;
    background: #E8E3D8;
    border-radius: 4px;
    margin-bottom: 8px;
}

.skeleton-block {
    height: 120px;
    background: #E8E3D8;
    border-radius: 8px;
}

@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}
```

**CODER Responsibility:**
- Implement skeleton loader in widget during data fetch
- Apply to all SLOT_A, SLOT_B, SLOT_C widgets
- Max skeleton display: 2 seconds (if query takes >2s, show error state)

**REVIEWER Gate:**
- Verify skeleton loader shown during network delay
- Verify smooth transition from skeleton → data

### ✅ Error Boundaries (Shell Error Boundary)

**Requirement:** All `ZONE_WIDGET_SLOTS` must be wrapped in a React Error Boundary to catch widget crashes

**Implementation:**
```jsx
import { ErrorBoundary } from 'react-error-boundary';

function ShellErrorBoundary() {
    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error('Widget Error:', error);
                // Log to Datadog or error tracking service
            }}
            onReset={() => window.location.reload()}
        >
            <div className="zone-widget-slots">
                {/* All widgets rendered here */}
                <SLOT_A />
                <SLOT_B />
                <SLOT_C />
            </div>
        </ErrorBoundary>
    );
}
```

**Fallback UI (Error State):**
```jsx
<div style={{
    padding: '24px',
    background: '#FFF3CD',
    border: '1px solid #FFC107',
    borderRadius: '8px',
    color: '#856404'
}}>
    <strong>Unable to load dashboard</strong>
    <p>An unexpected error occurred. Please refresh the page or contact support.</p>
    <button onClick={() => window.location.reload()}>Refresh</button>
</div>
```

**CODER Responsibility:**
- Wrap all widget content in Error Boundary
- Provide user-friendly error message
- Include "Refresh" button to retry

**REVIEWER Gate:**
- Verify Error Boundary wraps all widget slots
- Test by intentionally breaking a widget component
- Confirm error message displays without crashing other widgets

---

## 7. CONSTRAINT COMPLIANCE CHECKLIST (Mandatory)

**Every widget implementation MUST pass all checks:**

- [ ] **No Horizontal Overflow:** Tested at 400px, 768px, 1024px, 1920px
- [ ] **Grid Slot Fit:** Widget respects assigned slot dimensions (width, height)
- [ ] **Responsive Behavior:** Layout adapts correctly at all breakpoints
- [ ] **Loading State:** Skeleton loader shown during data fetch (max 2s)
- [ ] **Error Boundary:** Widget wrapped in Error Boundary; errors don't crash shell
- [ ] **Typography Consistent:** Uses typography tokens from Style Guide
- [ ] **Spacing Consistent:** Uses spacing tokens (space-xs, space-sm, space-md, space-lg)
- [ ] **Card Styling:** Uses `.card` class or equivalent (white bg, border, shadow)
- [ ] **Color Compliance:** Uses global color tokens (#FFFFFF, #1A1A1A, #4A5568, status colors)
- [ ] **Mobile Touch:** Touch targets ≥48px (buttons, links, input fields)
- [ ] **Accessibility:** WCAG AA (4.5:1 contrast, ARIA labels, keyboard nav)

---

## 8. CHANGE MANAGEMENT (CHG-### Protocol)

### Deviations Require Formal Change Requests

If a widget requires a deviation from SHELL_CONTRACT.md:

1. **Create CHG Ticket** (e.g., CHG-500: "Wider widget slot for data table")
2. **Document Blocker:** "Standard 4-column slot insufficient for 6-column data table"
3. **Propose Options:**
   - Option A: Truncate table columns (current contract)
   - Option B: Increase SLOT_B width to 75% (requires SHELL_CONTRACT update)
   - Option C: Redesign table for compact layout
4. **Escalate to ARCHITECT:** ARCHITECT decides if contract change is warranted
5. **Update SHELL_CONTRACT.md:** If approved, increment version (1.0 → 1.1) and re-lock

**No contract deviations without ARCHITECT approval and formal CHG process.**

---

## 9. ENFORCEMENT (Hard Gates)

### ARCHITECT Enforcement
- ✅ Design widgets to fit SHELL_CONTRACT.md specifications
- ❌ Reject any design that deviates without CHG approval

### HFD Enforcement
- ✅ Show widgets within shell context (mockups must include header/nav/grid)
- ❌ Reject standalone mockups

### CODER Enforcement
- ✅ Implement using CSS Grid with shell-defined grid slots
- ✅ Use global color/spacing/typography tokens
- ❌ No hard-coded pixel widths that override grid
- ❌ If widget breaks shell → Escalate to ARCHITECT (do not hack)

### REVIEWER Enforcement
- ✅ Verify no horizontal overflow at all breakpoints
- ✅ Verify responsive behavior matches mockup
- ✅ Verify skeleton loader during fetch
- ✅ Verify error boundary in place
- ❌ REJECT if any constraint is violated

---

## 10. VERSION HISTORY & GOVERNANCE

| Version | Date | Changes | Authority |
|---|---|---|---|
| **1.0** | 2026-06-10 | Initial Shell Contract (locked) | ARCHITECT + LIBRARIAN |
| **1.1** | TBD | CHG-### approved updates | ARCHITECT |
| **2.0** | TBD | Major redesign (rare) | ARCHITECT + Product |

**Lock Status:** 🔒 **LOCKED** (No changes without formal CHG-### process and ARCHITECT approval)

---

## 11. SIGN-OFF & AUTHORITY

**ARCHITECT Approval:** ✅ LOCKED  
**LIBRARIAN Formalization:** ✅ LOCKED  
**Effective Date:** 2026-06-10  
**Authority Level:** IMMUTABLE (top-level governance)

**This contract is the source of truth for all UI development on the Resilience Logistics Platform.**

---

## Appendix A: CSS Master Reference (Complete)

```css
/**
 * SHELL_CONTRACT.md: Complete CSS Reference
 * Version: 1.0 (LOCKED)
 * Authority: ARCHITECT
 */

:root {
    /* Container */
    --shell-max-width: 1200px;
    
    /* Breakpoints */
    --breakpoint-tablet: 768px;
    --breakpoint-mobile: 400px;
    
    /* Padding (Horizontal) */
    --shell-padding-desktop: 24px;
    --shell-padding-tablet: 16px;
    --shell-padding-mobile: 12px;
    
    /* Gutters (Gap between grid items) */
    --shell-gutter-desktop: 24px;
    --shell-gutter-tablet: 16px;
    --shell-gutter-mobile: 12px;
    
    /* Color Tokens (from Style Guide) */
    --shell-text-primary: #1A1A1A;
    --shell-text-secondary: #4A5568;
    --shell-surface-white: #FFFFFF;
    --shell-surface-cream: #EFEBE0;
    --shell-border: #E8E3D8;
    --shell-shadow: rgba(0, 0, 0, 0.05);
    
    /* Spacing Tokens */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
}

/* ============ ZONE STYLES ============ */

.zone-header {
    height: 64px;
    background: var(--shell-surface-white);
    border-bottom: 1px solid var(--shell-border);
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
}

.zone-nav {
    width: 240px;
    height: 100vh;
    background: var(--shell-surface-cream);
    padding: 24px;
    border-right: 1px solid var(--shell-border);
    position: sticky;
    top: 0;
    overflow-y: auto;
}

@media (max-width: 1023px) {
    .zone-nav {
        width: 160px;
        padding: 16px;
    }
}

@media (max-width: 767px) {
    .zone-nav {
        position: fixed;
        left: -280px;
        width: 280px;
        height: 100vh;
        transition: left 200ms ease;
        z-index: 200;
    }
    .zone-nav.open { left: 0; }
}

.zone-main {
    width: calc(100% - 240px - 24px);
    margin-left: 240px;
    padding: 24px;
    background: var(--shell-surface-cream);
    min-height: 100vh;
}

@media (max-width: 1023px) {
    .zone-main {
        width: calc(100% - 160px - 16px);
        margin-left: 160px;
        padding: 16px;
    }
}

@media (max-width: 767px) {
    .zone-main {
        width: 100%;
        margin-left: 0;
        padding: 12px;
    }
}

.zone-widget-slots {
    display: grid;
    gap: var(--shell-gutter-desktop);
    grid-template-columns: repeat(12, 1fr);
}

@media (max-width: 1023px) {
    .zone-widget-slots {
        gap: var(--shell-gutter-tablet);
    }
}

@media (max-width: 767px) {
    .zone-widget-slots {
        gap: var(--shell-gutter-mobile);
        grid-template-columns: repeat(4, 1fr);
    }
}

/* ============ SLOT STYLES ============ */

.slot-a {
    grid-column: 1 / -1;
    min-height: 140px;
    padding: var(--shell-gutter-desktop);
    background: var(--shell-surface-white);
    border: 1px solid var(--shell-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shell-shadow);
}

.slot-b {
    grid-column: 1 / span 8;
    min-height: 500px;
    padding: var(--shell-gutter-desktop);
    background: var(--shell-surface-white);
    border: 1px solid var(--shell-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shell-shadow);
}

.slot-c {
    grid-column: 9 / span 4;
    min-height: 500px;
    padding: var(--shell-gutter-desktop);
    background: var(--shell-surface-white);
    border: 1px solid var(--shell-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shell-shadow);
}

@media (max-width: 1023px) {
    .slot-a { padding: var(--shell-gutter-tablet); }
    .slot-b {
        grid-column: 1 / -1;
        padding: var(--shell-gutter-tablet);
        margin-bottom: var(--shell-gutter-tablet);
    }
    .slot-c {
        grid-column: 1 / -1;
        padding: var(--shell-gutter-tablet);
    }
}

@media (max-width: 767px) {
    .slot-a { padding: var(--shell-gutter-mobile); }
    .slot-b {
        grid-column: 1 / -1;
        padding: var(--shell-gutter-mobile);
        margin-bottom: var(--shell-gutter-mobile);
    }
    .slot-c {
        grid-column: 1 / -1;
        padding: var(--shell-gutter-mobile);
    }
}

/* ============ REUSABLE COMPONENTS ============ */

.card {
    background: var(--shell-surface-white);
    border: 1px solid var(--shell-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--shell-shadow);
    padding: var(--shell-gutter-desktop);
    transition: box-shadow 200ms ease;
}

.card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* ============ SKELETON LOADER ============ */

.skeleton-loader {
    animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line {
    height: 16px;
    background: var(--shell-border);
    border-radius: 4px;
    margin-bottom: 8px;
}

.skeleton-block {
    height: 120px;
    background: var(--shell-border);
    border-radius: 8px;
}

@keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}
```

---

**Document Status:** 🔒 **LOCKED FOR PHASE 10+ ENFORCEMENT**

**Last Updated:** 2026-06-10  
**Next Review:** 2026-09-10 (quarterly governance review)

---

## CONFIRMATION

✅ **SHELL_CONTRACT.md has been created, formalized, and locked.**

This document serves as the **immutable Master Layout Authority** for all UI development on the Resilience Logistics Platform. All future widget development (Phase 10+) MUST adhere to these specifications.

**Ready for use by ARCHITECT, HFD, CODER, and REVIEWER roles.**
