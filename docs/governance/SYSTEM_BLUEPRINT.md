# SYSTEM_BLUEPRINT.md — Composite Architecture Specification

**Role:** LIBRARIAN (System of Record)  
**Authority:** Sequential Lock Protocol + Design System Governance  
**Effective:** 2026-06-10  
**Status:** ✅ ACTIVE — Mandatory Reference for HFD & CODER

---

## 1. Framework Philosophy: Composite Architecture

### Core Principle
**Shell > Panel > Widget-Grid**

All user-facing content in FreightClub follows a strict hierarchical structure. No widget can exist in isolation; every widget MUST be nested within a Panel, and every Panel MUST be positioned within a Shell Slot.

```
┌─────────────────────────────────────────────────────────────┐
│                      SHELL (Layout Grid)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │     PANEL        │  │     PANEL        │  SLOT_A      │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  (full-width)│
│  │  │ Widget Box │  │  │  │ Widget Box │  │               │
│  │  └────────────┘  │  │  └────────────┘  │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                               │
│  ┌──────────────────────────────────────────┐              │
│  │          PANEL (Data Table)              │  SLOT_B     │
│  │  ┌──────────────────────────────────┐  │  (8 cols)   │
│  │  │     Widget-Grid (12 cols)        │  │              │
│  │  │  [Row 1] [Row 2] [Row 3] ...      │  │              │
│  │  └──────────────────────────────────┘  │              │
│  └──────────────────────────────────────────┘              │
│                                                               │
│  ┌────────────────┐  SLOT_C (4 cols)                      │
│  │  ACTION PANEL  │  (Right Sidebar)                       │
│  └────────────────┘                                         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Design Rules

1. **Shell defines grid slots** — 12-column grid (SLOT_A: full-width, SLOT_B: 8 cols, SLOT_C: 4 cols)
2. **Panel wraps widgets** — Every visible widget lives in a `.panel` container
3. **Widget-Grid organizes content** — Multi-widget layouts use `.widget-grid` (child of `.panel`)
4. **Hierarchy is enforced** — Shell → Panel → Widget (no exceptions)

### Why This Matters

- **Consistency:** All widgets have the same visual treatment (background, border, shadow)
- **Predictability:** Developers know exactly where content goes
- **Maintainability:** Changes to panel styling cascade to all widgets automatically
- **Accessibility:** Nested structure supports proper ARIA semantics and screen readers

---

## 2. Token Registry: The Skin

All visual properties (colors, borders, shadows, spacing) derive from a centralized CSS variable registry. **Hardcoding hex values is strictly prohibited.**

### CSS Token Root Variables

```css
:root {
    /* ============ COLORS ============ */
    
    /* Primary Palette */
    --color-canvas: #EFEBE0;           /* Warm cream background (warm, reduces eye strain) */
    --color-surface-white: #FFFFFF;    /* Pure white content surface */
    --color-surface-light: #F8F9FB;    /* Ultra-light cream (disabled, hover states) */
    --color-text-primary: #1A1A1A;     /* Dark charcoal (primary text, high contrast) */
    --color-text-secondary: #4A5568;   /* Steely slate grey (secondary labels, muted) */
    --color-text-tertiary: #636E72;    /* Steel grey (helper text, metadata) */
    
    /* Semantic Status Colors (§6.1 — WCAG AA compliant) */
    --color-success: #27AE60;          /* Emerald Green (delivered, complete) */
    --color-warning: #F39C12;          /* Safety Amber (at risk, caution) */
    --color-critical: #E74C3C;         /* Danger Red (delayed, error) */
    --color-info: #3498DB;             /* Tech Blue (in transit, neutral) */
    
    /* Brand Accent (Bronze Metallic) */
    --color-brand-bronze: #B08D57;     /* Primary bronze accent */
    --color-brand-bronze-light: #C9A46A;  /* Light bronze (gradient top) */
    --color-brand-bronze-dark: #8C6D3F;   /* Dark bronze (gradient bottom) */
    --color-brand-bronze-border: #7A5F3A; /* Darkest bronze (borders) */
    
    /* Neutral Greys */
    --color-border-primary: #D0D0D0;   /* Cool grey (widget borders, §6.5) */
    --color-border-secondary: #E8E3D8; /* Warm cream dividers (table rows, nav borders) */
    --color-divider-light: #D0CCC4;    /* Subtle divider (dashed borders) */
    --color-interactive-bg: #F0F0F0;   /* Header icon backgrounds */
    
    /* ============ BORDERS ============ */
    --border-widget: 1px solid var(--color-border-primary);  /* §6.5: Container border */
    --border-divider: 1px solid var(--color-border-secondary); /* Table row dividers */
    --border-focus: 2px solid var(--color-brand-bronze);     /* Form input focus state */
    --border-subtle: 1px dashed var(--color-divider-light);  /* Placeholder dividers */
    
    /* ============ SHADOWS ============ */
    --shadow-subtle: 0 2px 4px rgba(0, 0, 0, 0.05);         /* §6.5: Widget card shadow */
    --shadow-elevated: 0 4px 12px rgba(0, 0, 0, 0.1);       /* Hover state elevation */
    --shadow-header: 0 1px 3px rgba(0, 0, 0, 0.05);         /* Header subtle shadow */
    --shadow-button-inset: inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2); /* CTA button 3D */
    --shadow-button-outer: 0 2px 5px rgba(0,0,0,0.35);      /* CTA button depth */
    
    /* ============ BORDER RADIUS ============ */
    --radius-widget: 8px;              /* §6.5: Widget container (panels, cards) */
    --radius-input: 4px;               /* §6.3: Form inputs */
    --radius-button: 6px;              /* CTA buttons (SHELL_CONTRACT.md) */
    --radius-full: 50%;                /* Circular elements (avatars, badges) */
    
    /* ============ SPACING (8px Grid Rule) ============ */
    --space-xs: 4px;                   /* Minimal gaps (icon margins) */
    --space-sm: 8px;                   /* Small gaps (form labels, inline) */
    --space-md: 16px;                  /* Default gap (component stacking) */
    --space-lg: 24px;                  /* Large gaps (section separators) */
    --space-xl: 32px;                  /* Extra-large gaps (page-level) */
    
    /* ============ TYPOGRAPHY ============ */
    --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Inter', sans-serif;
    --font-size-xs: 11px;              /* Helper text */
    --font-size-sm: 12px;              /* Labels, metadata */
    --font-size-base: 14px;            /* Body text */
    --font-size-lg: 16px;              /* Secondary headings */
    --font-size-xl: 18px;              /* Primary headings */
    --font-size-2xl: 24px;             /* Section titles */
    --font-size-3xl: 56px;             /* KPI numbers */
    
    --font-weight-regular: 400;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-heavy: 900;          /* KPI numbers */
    
    /* ============ LAYOUT DIMENSIONS ============ */
    --header-height: 64px;
    --sidebar-width-expanded: 240px;
    --sidebar-width-collapsed: 160px;
    --action-zone-width: 280px;
    --table-row-height: 48px;
}
```

### Usage Rules

**✅ CORRECT:**
```css
.widget-panel {
    background: var(--color-surface-white);
    border: var(--border-widget);
    border-radius: var(--radius-widget);
    box-shadow: var(--shadow-subtle);
    padding: var(--space-lg);
}

.status-badge-success {
    background: var(--color-success);
    color: white;
}

.kpi-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-heavy);
    color: var(--color-success);
}
```

**❌ FORBIDDEN:**
```css
/* HARDCODED COLORS — VIOLATION */
.widget-panel {
    background: #FFFFFF;
    border: 1px solid #D0D0D0;
    padding: 24px;
}

/* INLINE STYLES — VIOLATION */
<div style="background: #27AE60; padding: 24px;">...</div>

/* TAG SELECTORS — VIOLATION */
button { color: #B08D57; }
div { margin: 16px; }
```

### Token Modification Protocol

To update a token:
1. Identify affected components/pages
2. Test change across all usage sites
3. Update SYSTEM_BLUEPRINT.md §2 (this section)
4. Create VISUAL_DEBT_LOG entry if breaking change
5. Communicate change to HFD & CODER roles

**No ad-hoc color changes permitted.** All visual tweaks go through this registry.

---

## 3. Golden Master Schema: HTML Structure

### 3.1 Shell Container (Layout Grid)

```html
<div class="fc-shell">
    <header class="zone-header">
        <!-- Header content: logo, title, icons -->
    </header>

    <div class="shell-body">
        <nav class="zone-nav">
            <!-- Sidebar navigation -->
        </nav>

        <main class="zone-main">
            <div class="zone-widget-slots">
                <!-- SLOT_A (full-width) -->
                <div class="slot-a">
                    <!-- Panel and widgets go here -->
                </div>

                <!-- SLOT_B (8 columns) -->
                <div class="slot-b">
                    <!-- Panel and widgets go here -->
                </div>

                <!-- SLOT_C (4 columns, right sidebar) -->
                <div class="slot-c">
                    <!-- Panel and widgets go here -->
                </div>
            </div>
        </main>
    </div>
</div>
```

### 3.2 Panel Container (Widget Wrapper)

```html
<!-- Every widget must be wrapped in a panel -->
<div class="panel">
    <div class="panel-header">
        <h2 class="panel-title">Panel Title</h2>
        <p class="panel-subtitle">Descriptive text</p>
    </div>

    <div class="panel-content">
        <!-- Single widget -->
        <div class="widget">
            <div class="widget-content">Content here</div>
        </div>

        <!-- OR multiple widgets in a grid -->
        <div class="widget-grid">
            <div class="widget">Widget 1</div>
            <div class="widget">Widget 2</div>
            <div class="widget">Widget 3</div>
        </div>
    </div>
</div>
```

### 3.3 Widget Grid (Multi-Widget Layout)

```html
<!-- Use widget-grid for layouts with multiple boxes -->
<div class="panel">
    <div class="panel-header">
        <h2 class="panel-title">KPI Summary</h2>
    </div>

    <div class="panel-content">
        <div class="widget-grid">
            <!-- Each child is a widget card (KPI, metric, etc.) -->
            <div class="widget">
                <div class="widget-number">24</div>
                <div class="widget-label">Active Loads</div>
            </div>

            <div class="widget">
                <div class="widget-number success">92.1%</div>
                <div class="widget-label">On-Time Delivery</div>
            </div>

            <div class="widget">
                <div class="widget-number">$2.15</div>
                <div class="widget-label">Cost Per Mile</div>
            </div>
        </div>
    </div>
</div>
```

### 3.4 Data Table Widget

```html
<!-- Tables are also wrapped in panels -->
<div class="panel">
    <div class="panel-header">
        <h2 class="panel-title">Shipment Status</h2>
    </div>

    <div class="panel-content">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Load ID</th>
                    <th>Status</th>
                    <th>Origin</th>
                    <th>Destination</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>LD-2024-001</td>
                    <td><span class="status-badge success">Delivered</span></td>
                    <td>Los Angeles, CA</td>
                    <td>Phoenix, AZ</td>
                </tr>
                <!-- More rows -->
            </tbody>
        </table>
    </div>
</div>
```

### 3.5 CSS Implementation Template

```css
/* Shell & Layout Grid */
.fc-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.zone-widget-slots {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--space-lg);
}

.slot-a { grid-column: 1 / -1; }      /* Full width */
.slot-b { grid-column: 1 / span 8; }  /* 8 columns */
.slot-c { grid-column: 9 / -1; }      /* 4 columns */

/* Panel (Universal Widget Container) */
.panel {
    background: var(--color-surface-white);
    border: var(--border-widget);
    border-radius: var(--radius-widget);
    box-shadow: var(--shadow-subtle);
    padding: var(--space-lg);
    transition: box-shadow 200ms ease;
}

.panel:hover {
    box-shadow: var(--shadow-elevated);
}

.panel-header {
    margin-bottom: var(--space-lg);
}

.panel-title {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-xs);
}

.panel-subtitle {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
}

.panel-content {
    /* Content flows naturally */
}

/* Widget Grid (Multiple widgets in one panel) */
.widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg);
}

/* Individual Widget */
.widget {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 140px;
    padding: var(--space-lg);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-widget);
    background: var(--color-surface-white);
}

.widget-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-heavy);
    color: var(--color-text-primary);
    margin-bottom: var(--space-sm);
}

.widget-number.success { color: var(--color-success); }
.widget-number.warning { color: var(--color-warning); }
.widget-number.critical { color: var(--color-critical); }

.widget-label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-secondary);
}

/* Data Table */
.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table thead {
    background: var(--color-surface-light);
    border-bottom: var(--border-divider);
}

.data-table th {
    padding: var(--space-sm) var(--space-md);
    text-align: left;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    color: var(--color-text-tertiary);
    letter-spacing: 0.05em;
}

.data-table tbody tr {
    height: var(--table-row-height);
    border-bottom: var(--border-divider);
}

.data-table tbody tr:hover {
    background: var(--color-surface-light);
}

.data-table td {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
}

/* Status Badges */
.status-badge {
    display: inline-block;
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-input);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
}

.status-badge.success {
    background: rgba(39, 174, 96, 0.1);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

.status-badge.warning {
    background: rgba(243, 156, 18, 0.1);
    color: var(--color-warning);
    border: 1px solid var(--color-warning);
}

.status-badge.critical {
    background: rgba(231, 76, 60, 0.1);
    color: var(--color-critical);
    border: 1px solid var(--color-critical);
}
```

---

## 4. Forbidden Practices (Anti-Patterns)

### ❌ 4.1: Absolute Positioning for Main Layout

**FORBIDDEN:**
```css
.panel {
    position: absolute;
    top: 100px;
    left: 300px;
    width: 500px;
    height: 600px;
}
```

**WHY:** Breaks responsiveness, causes layout thrashing on viewport changes, breaks stacking context.

**CORRECT:**
```css
.zone-widget-slots {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--space-lg);
}

.slot-a { grid-column: 1 / -1; }
```

---

### ❌ 4.2: Flexbox for Main Layout Grid

**FORBIDDEN:**
```css
.zone-widget-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}
```

**WHY:** Flexbox doesn't align to 12-column grid; causes widgets to size unpredictably. Grid provides alignment guarantees.

**CORRECT:**
```css
.zone-widget-slots {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--space-lg);
}
```

---

### ❌ 4.3: Styling by Tag Name

**FORBIDDEN:**
```css
button { background: #B08D57; }
div { margin: 16px; }
p { color: #4A5568; }
h2 { font-size: 24px; }
```

**WHY:** Global tag rules cause cascading conflicts, make debugging hard, prevent component reuse.

**CORRECT:**
```css
.action-button {
    background: var(--color-brand-bronze);
}

.panel-content {
    margin: var(--space-md);
}

.panel-subtitle {
    color: var(--color-text-secondary);
}

.panel-title {
    font-size: var(--font-size-2xl);
}
```

---

### ❌ 4.4: "Floating" Widgets Without Panel Container

**FORBIDDEN:**
```html
<!-- Widget exists alone, no panel wrapper -->
<div class="widget">
    <div class="widget-number">24</div>
    <div class="widget-label">Active Loads</div>
</div>

<!-- Another widget floating separately -->
<div class="widget">
    <div class="widget-number">92%</div>
    <div class="widget-label">On-Time</div>
</div>
```

**WHY:** 
- Violates composite architecture (Shell > Panel > Widget)
- No container means styling is inconsistent
- Impossible to manage padding, borders, shadows uniformly
- Makes refactoring difficult

**CORRECT:**
```html
<!-- All widgets wrapped in a single panel -->
<div class="panel">
    <div class="panel-header">
        <h2 class="panel-title">Business Health</h2>
    </div>

    <div class="panel-content">
        <div class="widget-grid">
            <div class="widget">
                <div class="widget-number">24</div>
                <div class="widget-label">Active Loads</div>
            </div>

            <div class="widget">
                <div class="widget-number">92%</div>
                <div class="widget-label">On-Time</div>
            </div>
        </div>
    </div>
</div>
```

---

### ❌ 4.5: Hardcoded Colors (Hex Values in CSS/HTML)

**FORBIDDEN:**
```css
.status-good {
    color: #27AE60;  /* Hardcoded hex */
}

.panel {
    background: #FFFFFF;  /* Hardcoded hex */
    border: 1px solid #D0D0D0;  /* Hardcoded hex */
}
```

**CORRECT:**
```css
.status-good {
    color: var(--color-success);
}

.panel {
    background: var(--color-surface-white);
    border: var(--border-widget);
}
```

---

### ❌ 4.6: Inconsistent Spacing (Non-8px Multiples)

**FORBIDDEN:**
```css
.widget {
    margin: 10px;        /* NOT a multiple of 8 */
    padding: 12px;       /* NOT a multiple of 8 */
    gap: 14px;           /* NOT a multiple of 8 */
}
```

**CORRECT:**
```css
.widget {
    margin: var(--space-sm);   /* 8px */
    padding: var(--space-lg);  /* 24px */
    gap: var(--space-md);      /* 16px */
}
```

---

### ❌ 4.7: Inline Styles

**FORBIDDEN:**
```html
<div style="background: #FFFFFF; padding: 24px; color: #1A1A1A;">
    Content
</div>
```

**CORRECT:**
```html
<div class="panel">
    Content
</div>
```

---

## 5. Enforcement & Governance

### Who Enforces?
- **HFD:** Validates designs against schema before handoff to CODER
- **CODER:** Must follow CSS token registry; any hardcoded value is a code review failure
- **REVIEWER:** Rejects PRs with hardcoded colors, absolute positioning, or tag selectors (see `REVIEWER.md`)

### Violation Protocol
1. Issue identified during code review
2. PR marked as REJECTED with specific violation cited
3. CODER makes corrections
4. Violation logged to VISUAL_DEBT_LOG.md (if systemic)
5. Resubmit for review

### Breaking Changes
If a token value must change (e.g., brand color update):
1. Update :root variables
2. Update SYSTEM_BLUEPRINT.md §2
3. Run grep across codebase for hardcoded values
4. Fix all violations
5. Test all affected components
6. Communicate change to team

---

## 6. Quick Reference Checklists

### HFD Checklist (Before Handoff to CODER)
- [ ] Design uses composite architecture (Shell > Panel > Widget)
- [ ] All colors referenced from Token Registry (§2)
- [ ] All spacing is multiples of 8px
- [ ] Widgets are grouped in panels (not floating)
- [ ] Grid layout used for main layout (not absolute/flexbox)
- [ ] Design spec includes HTML structure reference (§3)

### CODER Checklist (Implementation)
- [ ] CSS uses :root token variables (no hardcoded hex)
- [ ] No tag selectors (buttons, divs, p); use classes only
- [ ] Main layout uses CSS Grid (not absolute/flexbox)
- [ ] Every widget inside a `.panel` container
- [ ] All spacing (margin, padding, gap) matches token values
- [ ] Tests pass + 70%+ code coverage

### REVIEWER Checklist (Code Review)
- [ ] No hardcoded colors/borders/shadows (use tokens)
- [ ] No absolute positioning for layout
- [ ] No tag selectors
- [ ] All widgets wrapped in `.panel`
- [ ] All spacing is 8px multiples
- [ ] Structure matches Golden Master Schema (§3)

---

## 7. Authority & Status

**Document:** SYSTEM_BLUEPRINT.md  
**Role:** LIBRARIAN (System of Record)  
**Authority:** Sequential Lock Protocol + Design System Governance  
**Approval Date:** 2026-06-10  
**Status:** ✅ **ACTIVE — MANDATORY**

**This document is the single source of truth for FreightClub architecture. All deviations require formal exception (documented in VISUAL_DEBT_LOG.md and approved by ARCHITECT + LIBRARIAN).**

---

**Next Steps:**
- HFD: Reference §1-3 when designing new features
- CODER: Reference §2-4 when implementing CSS
- REVIEWER: Use §5-6 when auditing code
- LIBRARIAN: Update §2 when token changes occur

