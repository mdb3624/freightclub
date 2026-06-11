# PROCESS_FLOW: Shell & Widget Governance

**Status:** MANDATORY (Phase 10+)  
**Authority:** LIBRARIAN (Governance & Traceability)  
**Effective:** 2026-06-10  
**Last Updated:** 2026-06-10

---

## Overview

The **Shell & Widget Pattern** is a governance model that prevents UI fragmentation, layout chaos, and responsive design failures. It enforces a clear separation between:

- **Shell:** The global layout container (header, navigation, grid system, footer)
- **Widget:** Individual feature modules (dashboard cards, forms, lists) that fit into Shell grid slots

**Core Principle:** No widget is designed, coded, or reviewed in isolation. Every widget must be contextualized within the Shell.

---

## Why Shell & Widget Matters

### The Problem (Without Shell & Widget)

| Issue | Consequence |
|---|---|
| Widgets designed standalone | Break when placed in actual Shell layout |
| No grid constraints | Cards overflow, navigation crushed, responsive fails |
| Local widget styles conflict with global | Color/spacing contradictions, CSS specificity wars |
| Late discovery of layout conflicts | Rework at 80% implementation |
| Responsive breakpoints inconsistent | Desktop works, mobile breaks |

### The Solution (Shell & Widget Pattern)

✅ **Shell is locked first** — Global layout, grid, navigation finalized before widget work starts  
✅ **Widgets fit predefined slots** — Designer/Coder knows exact space available  
✅ **HFD mockups show context** — Widgets displayed within Shell, not standalone  
✅ **REVIEWER verifies boundaries** — Rejects widgets that breach Shell constraints  
✅ **Responsive guaranteed** — Shell drives breakpoints; all widgets inherit  

---

## Foundation: The Shell First

### What Is the Shell?

The **Shell** is the immutable global container that wraps all widgets:

```
┌─────────────────────────────────────────┐
│  HEADER (Logo, Notifications, Profile)  │  ← Shell: Header
├─────────────────────────────────────────┤
│  NAV   │                                 │
│ (Side  │  MAIN CONTENT GRID              │  ← Shell: Navigation
│  or    │  (Responsive slots for widgets) │  ← Shell: Grid System
│  Top)  │                                 │
└─────────────────────────────────────────┘
         ↑ Responsive Breakpoints ↑
      (Desktop/Tablet/Mobile)
```

### Shell Components (Locked Before Widget Development)

1. **Header**
   - Logo placement
   - Notification bell
   - User profile badge
   - Height, padding, alignment

2. **Navigation**
   - Sidebar or top nav (design decision)
   - Width/height constraints
   - Active state styling
   - Responsive collapse (mobile)

3. **Grid System**
   - Column layout (12-column, 16-column, etc.)
   - Gutter widths (16px, 24px, etc.)
   - Responsive breakpoints (desktop/tablet/mobile)
   - Reserved areas (sidebars, footers)

4. **Global Styles**
   - Canvas background color
   - Typography scale (h1, h2, body)
   - Color tokens (primary, secondary, status)
   - Spacing system (padding, margin units)

### Shell Contract Document (SHELL_CONTRACT.md)

**Purpose:** Single source of truth for Shell specifications

**Must include:**
- [ ] Grid layout diagram (Mermaid or ASCII)
- [ ] Breakpoint definitions (desktop: ≥1024px, tablet: 768-1023px, mobile: ≤767px)
- [ ] Reserved areas (footer height, sidebar width, etc.)
- [ ] Global style tokens (colors, fonts, spacing)
- [ ] CSS class conventions (e.g., `.grid-col-6`, `.grid-slot-main`)
- [ ] Responsive behavior at each breakpoint
- [ ] Sign-off from ARCHITECT (locked, immutable)

**Example SHELL_CONTRACT.md row:**

```markdown
## Grid Layout

### Desktop (≥1024px)
- 12-column grid
- Column width: calc((100% - 48px) / 12)  /* 48px = 3 gutters × 16px */
- Gutter: 16px
- Sidebar: 240px fixed
- Main content: remaining space

### Tablet (768-1023px)
- 8-column grid
- Gutter: 12px
- Sidebar: 160px fixed

### Mobile (≤767px)
- 4-column grid
- Gutter: 8px
- Sidebar: Hidden (hamburger menu)
```

**Enforcement:** No widget development proceeds until SHELL_CONTRACT.md is signed off by ARCHITECT.

---

## 1. The Visual Fidelity Gate (HFD)

### Gate Rule: Mockups Must Show Widget In-Context

**Mandatory:**
- [ ] HFD mockup includes the Shell header, navigation, and grid structure
- [ ] Widget is positioned within its designated grid slot
- [ ] Mockup shows all three responsive variants (desktop/tablet/mobile)
- [ ] Widget dimensions match Shell grid constraints
- [ ] Mock shows how widget behaves at each breakpoint

**Rejection Criteria:**

| Rejected | Approved |
|---|---|
| ❌ Widget mockup in isolation (no Shell) | ✅ Widget within Shell context |
| ❌ Widget dimensions larger than grid slot | ✅ Widget respects grid constraints |
| ❌ Single breakpoint only (desktop) | ✅ Three variants shown (desktop/tablet/mobile) |
| ❌ Overflow or "bleeding" into adjacent areas | ✅ Clear boundaries within grid slot |
| ❌ Hard-coded widget padding (conflicts with Shell grid) | ✅ Padding aligned to Shell gutter system |

### HFD Deliverable Template

```markdown
## US-XXX Widget Mockup with Shell Context

### Desktop (≥1024px)
[ASCII diagram showing Shell with widget in grid slot]
- Widget width: 4 columns (33% of 12-column grid)
- Widget height: 200px
- Padding: 16px (aligned to Shell gutter)
- Breakpoint: No changes at desktop

### Tablet (768-1023px)
[ASCII diagram showing Shell at tablet breakpoint]
- Widget width: 4 columns (50% of 8-column grid)
- Widget height: 180px (responsive reduction)
- Padding: 12px (aligned to Shell gutter)
- Breakpoint trigger: 768px

### Mobile (≤767px)
[ASCII diagram showing Shell at mobile breakpoint]
- Widget width: 4 columns (100% of 4-column grid)
- Widget height: 160px (stacked layout)
- Padding: 8px (aligned to Shell gutter)
- Breakpoint trigger: 768px → 400px

### Responsive Behavior
- No horizontal scroll at any breakpoint
- Widget stacks/resizes gracefully (no overflow)
- Touch targets remain ≥48px (mobile UX)
```

### HFD Compliance Checklist

- [ ] SHELL_CONTRACT.md has been read and understood
- [ ] Widget mockup displays within predefined grid slot
- [ ] Mockup shows Shell header, navigation, and grid structure
- [ ] All three responsive variants shown (desktop/tablet/mobile)
- [ ] Widget respects Shell gutter system (no custom padding)
- [ ] No "bleeding" or overflow beyond grid boundaries
- [ ] Widget dimensions match available grid space
- [ ] Global styles from SHELL_CONTRACT.md are applied
- [ ] Sign-off: Widget mockup is Shell-compliant

---

## 2. Implementation Constraint (CODER)

### Gate Rule: Grid Integration Is Priority #1

**Mandatory:**
- [ ] CSS uses Shell grid classes (e.g., `.grid-col-6`)
- [ ] Widget padding/margin derived from Shell gutter system (16px, 12px, 8px)
- [ ] No hard-coded pixel widths that override Shell grid
- [ ] Responsive breakpoints inherited from Shell (not duplicated)
- [ ] Global styles (colors, fonts) override widget-local styles

### CSS Structure Pattern (Required)

```css
/**
 * Shell: Global Grid System (immutable)
 * Source: SHELL_CONTRACT.md
 */
.grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 16px;  /* Desktop gutter */
}

.grid-col-6 {
    grid-column: span 6;  /* 50% of 12-column grid */
}

/* Responsive: Tablet */
@media (max-width: 1023px) {
    .grid {
        grid-template-columns: repeat(8, 1fr);  /* 8-column grid */
        gap: 12px;  /* Tablet gutter */
    }
    .grid-col-6 {
        grid-column: span 4;  /* 50% of 8-column grid */
    }
}

/* Responsive: Mobile */
@media (max-width: 767px) {
    .grid {
        grid-template-columns: repeat(4, 1fr);  /* 4-column grid */
        gap: 8px;  /* Mobile gutter */
    }
    .grid-col-6 {
        grid-column: span 4;  /* 100% of 4-column grid */
    }
}

/**
 * Widget: US-XXX (fits within Shell grid slot)
 * Grid slot: .grid-col-6 (6 columns on desktop)
 */
.widget-us-xxx {
    /* Use Shell gutter tokens, not hard-coded values */
    padding: var(--shell-gutter);  /* 16px desktop, 12px tablet, 8px mobile */
    background: var(--shell-surface-white);  /* Global style */
    border-radius: 6px;  /* From Style Guide */
}

.widget-us-xxx__title {
    /* Typography from Style Guide, not custom */
    font-size: 16px;
    font-weight: 600;
    color: var(--shell-text-primary);  /* #1A1A1A */
}
```

### Implementation Checklist (CODER)

- [ ] Widget class placed in Shell grid slot (e.g., `.grid-col-6`)
- [ ] Widget CSS uses Shell-defined variables (--shell-gutter, --shell-text-primary)
- [ ] No hard-coded widths/heights that override grid
- [ ] Responsive breakpoints match Shell breakpoints (1024px, 768px)
- [ ] Padding/margin use Shell gutter system (16px/12px/8px)
- [ ] Global style colors applied (not widget-local colors)
- [ ] Hover/focus states consistent with Shell design
- [ ] No overflow or horizontal scroll at any breakpoint
- [ ] Tested in Shell context (not standalone)

### CODER Escalation Rule

**If a widget breaks Shell layout:**
1. ❌ DO NOT hack CSS to force it into place
2. ❌ DO NOT create widget-specific breakpoints
3. ✅ **DO:** Halt implementation and escalate to ARCHITECT

**Escalation Template:**
```
CODER: Widget US-XXX breaks Shell layout at tablet breakpoint

Blocker: Widget content (4 columns) exceeds Shell grid allocation (2 columns)

Options:
A) Truncate/collapse widget content at tablet
B) Redesign widget to fit 2-column slot
C) Change grid slot allocation (requires ARCHITECT decision)

Escalating to ARCHITECT for grid design decision.
```

---

## 3. Architecture Gate (ARCHITECT)

### Gate Rule: Verify Grid Slot Assignments

**Mandatory:**
- [ ] Widget is assigned to a specific grid slot (e.g., "left sidebar, 2 columns")
- [ ] Slot size is sufficient for widget content (no overflow)
- [ ] Grid slot allocation respects Shell layout constraints
- [ ] Responsive slot assignments defined for all breakpoints

### ARCHITECT Responsibilities (Shell First)

1. **Design Shell Grid** (before any widgets)
   - Define grid columns (12, 16, etc.)
   - Define breakpoints (1024px, 768px)
   - Reserve areas (header height, sidebar width, footer)
   - Document in SHELL_CONTRACT.md

2. **Allocate Widget Slots** (as stories arrive)
   - Assign each widget to a grid area
   - Verify slot size accommodates content
   - Document slot assignment in story design spec

3. **Verify HFD Mockup** (before CODER starts)
   - Confirm widget mockup respects assigned slot
   - Check responsive behavior at all breakpoints
   - Reject mockups that violate grid constraints

### ARCHITECT Design Spec Format

```markdown
## US-XXX Widget Grid Assignment

### Shell Grid Layout (Reference: SHELL_CONTRACT.md)

**Desktop (≥1024px):**
- 12-column grid, 16px gutter
- Sidebar: 2 columns (20%)
- Main content: 10 columns (80%)

**Tablet (768-1023px):**
- 8-column grid, 12px gutter
- Sidebar: 2 columns (25%)
- Main content: 6 columns (75%)

**Mobile (≤767px):**
- 4-column grid, 8px gutter
- Sidebar: Hidden (hamburger)
- Main content: 4 columns (100%)

### Widget Grid Slot Assignment

**Slot:** Main content, top row
- Desktop: Spans 5 columns (50% of main content)
- Tablet: Spans 3 columns (50% of main content)
- Mobile: Spans 4 columns (100% of main content)
- Height: 200px (desktop/tablet), 160px (mobile)
- Padding: Shell gutter (16px/12px/8px)

**Constraint:** Widget must not exceed slot dimensions at any breakpoint.
```

---

## 4. Review Gate (REVIEWER)

### Gate Rule: Widget Must Honor Shell Boundaries

**Hard Rejection Criteria:**

| Violation | Impact | Action |
|---|---|---|
| ❌ Widget overflow (horizontal scroll) | Breaks Shell layout | REJECT |
| ❌ Widget "bleeds" into adjacent grid cells | Crushes other widgets | REJECT |
| ❌ Widget unresponsive at one or more breakpoints | Mobile layout broken | REJECT |
| ❌ Widget uses custom breakpoints (not Shell breakpoints) | Inconsistent responsive behavior | REJECT |
| ❌ Widget padding/margin inconsistent with Shell gutter | Visual misalignment | REJECT |
| ❌ Widget colors override global style tokens | Style conflict | REJECT |

### REVIEWER Verification Checklist

**Widget Grid Compliance:**
- [ ] Widget placed in correct Shell grid slot
- [ ] Widget dimensions fit allocated slot (width/height)
- [ ] No horizontal overflow at desktop/tablet/mobile
- [ ] No "bleeding" into adjacent grid cells
- [ ] Grid alignment consistent (no floating/absolute positioning)

**Responsive Behavior:**
- [ ] Tested at desktop breakpoint (≥1024px)
- [ ] Tested at tablet breakpoint (768-1023px)
- [ ] Tested at mobile breakpoint (≤767px)
- [ ] Behavior matches HFD mockup at all breakpoints
- [ ] Responsive transitions are smooth (no jarring layout shifts)

**Style Consistency:**
- [ ] Widget uses Shell gutter tokens (var(--shell-gutter))
- [ ] Widget colors use global tokens (var(--shell-text-primary))
- [ ] Widget typography matches Style Guide hierarchy
- [ ] No widget-specific CSS that conflicts with global styles
- [ ] Hover/focus states match Shell interaction patterns

**Visual Evidence:**
- [ ] Screenshots show widget at all three breakpoints
- [ ] Screenshots display widget within Shell context (not standalone)
- [ ] No overflow, no "bleeding," no layout breaks visible
- [ ] Widget visually aligns with Shell grid (row, column boundaries clear)

### REVIEWER Approval Template

```markdown
## US-XXX WIDGET REVIEW: APPROVED ✅

### Grid Compliance: VERIFIED
- Widget placed in correct slot: Main content, 5 columns (desktop)
- Dimensions: 400px × 200px (matches slot allocation)
- No horizontal overflow detected at 1024px+, 768px, 400px
- No "bleeding" into adjacent cells

### Responsive Behavior: VERIFIED
- Desktop (1024px): 5 columns, 200px height ✅
- Tablet (768px): 3 columns, 200px height ✅
- Mobile (375px): 4 columns (full width), 160px height ✅
- All breakpoints match HFD mockup

### Style Consistency: VERIFIED
- Padding: var(--shell-gutter) (16px desktop, 12px tablet, 8px mobile) ✅
- Background: var(--shell-surface-white) (#FFFFFF) ✅
- Text: var(--shell-text-primary) (#1A1A1A) ✅
- Shadows: Shell-standard drop shadow ✅

### Visual Evidence: APPROVED
- Screenshots: [US-XXX_desktop.png], [US-XXX_tablet.png], [US-XXX_mobile.png]
- Evidence shows widget within Shell context ✅
- No overflow, no misalignment detected ✅

**VERDICT: APPROVED FOR MERGE** ✅
```

---

## Shell & Widget Workflow (Complete)

```
PHASE 1: ARCHITECT DESIGNS SHELL
├── Define grid system (12-col, 16px gutter, breakpoints)
├── Design header, navigation, footer
├── Create SHELL_CONTRACT.md (locked, immutable)
└── Sign-off: Shell layout approved

PHASE 2: BA/HFD DESIGN WIDGETS (In Shell Context)
├── BA writes story (widget requirements)
├── HFD designs mockup showing widget in Shell grid slot
├── HFD verifies responsive behavior (desktop/tablet/mobile)
├── ARCHITECT verifies grid slot assignment
└── HFD sign-off: Widget mockup Shell-compliant

PHASE 3: CODER IMPLEMENTS WIDGET
├── CODER places widget in Shell grid slot (e.g., .grid-col-6)
├── CODER uses Shell gutter tokens (var(--shell-gutter))
├── CODER uses global style tokens (colors, fonts)
├── CODER tests at all breakpoints (1024px, 768px, 400px)
├── If layout breaks → Escalate to ARCHITECT (do NOT hack)
└── CODER sign-off: Widget respects Shell boundaries

PHASE 4: REVIEWER AUDITS WIDGET
├── REVIEWER verifies grid slot assignment
├── REVIEWER checks responsive behavior at all breakpoints
├── REVIEWER verifies no overflow, no "bleeding"
├── REVIEWER confirms style consistency with global tokens
├── REVIEWER reviews visual evidence (screenshots)
├── If violations found → REJECT (require fixes)
└── REVIEWER sign-off: APPROVED or REJECTED

PHASE 5: MERGE & RELEASE
└── Widget merged to main; Shell + Widget work together seamlessly
```

---

## Enforcement & Violations

### Hard Enforcement (No Exceptions)

**Violation: Widget Designed Standalone (No Shell Context)**
- HFD: REJECT mockup
- CODER: Cannot start until HFD approves in-context mockup
- Escalation: LIBRARIAN marks story BLOCKED (awaiting HFD fix)

**Violation: Widget Overflows Grid Slot**
- CODER: Halt immediately; escalate to ARCHITECT
- REVIEWER: REJECT PR; require fix before merge
- Impact: Story cannot be marked DONE until fixed

**Violation: Widget Uses Custom Breakpoints**
- CODER: Use Shell breakpoints only (1024px, 768px)
- REVIEWER: REJECT if custom breakpoints detected
- Impact: Maintains consistency with Shell responsive system

**Violation: Widget Padding/Margin Misaligned**
- CODER: Use var(--shell-gutter), not hard-coded pixels
- REVIEWER: REJECT if misalignment detected in screenshots
- Impact: All widgets visually aligned to Shell grid

### Approval Metrics

**Shell & Widget Compliance Rate (Target: 100%)**

Track for each Phase:
- % of widgets with in-context mockup: Target ≥95%
- % of widgets approved without overflow: Target ≥98%
- % of responsive breakpoints verified: Target 100%
- % of style violations: Target ≤2%
- % of PRs rejected for grid violations: Target <5%

---

## Template: SHELL_CONTRACT.md

```markdown
# SHELL_CONTRACT.md

**Authority:** ARCHITECT Role  
**Status:** LOCKED (Immutable)  
**Effective:** Phase 10  
**Last Updated:** 2026-06-10

## Grid System

### Desktop (≥1024px)
- Grid columns: 12
- Column width: calc((100% - 48px) / 12)
- Gutter: 16px (3 × 16px = 48px total)
- Sidebar width: 240px
- Main content width: remaining

### Tablet (768-1023px)
- Grid columns: 8
- Gutter: 12px
- Sidebar width: 160px

### Mobile (≤767px)
- Grid columns: 4
- Gutter: 8px
- Sidebar: hidden (hamburger)

## CSS Variables (Global Tokens)

```css
:root {
    /* Grid Tokens */
    --shell-gutter: 16px;
    --shell-gutter-tablet: 12px;
    --shell-gutter-mobile: 8px;
    
    /* Color Tokens (from Style Guide) */
    --shell-text-primary: #1A1A1A;
    --shell-text-secondary: #4A5568;
    --shell-surface-white: #FFFFFF;
    --shell-surface-cream: #EFEBE0;
    --shell-cta-bronze: #B08D57;
    
    /* Spacing Tokens */
    --shell-space-xs: 4px;
    --shell-space-sm: 8px;
    --shell-space-md: 16px;
    --shell-space-lg: 24px;
}
```

## Header Specification
- Height: 64px
- Background: #FFFFFF
- Border-bottom: 1px solid #E8E3D8
- Padding: 0 24px
- Contains: Logo, Notifications, Profile

## Navigation Specification
- Type: Sidebar (desktop/tablet), Hamburger menu (mobile)
- Desktop width: 240px
- Tablet width: 160px
- Background: #EFEBE0
- Active state: Bronze accent

## Sign-Off

**ARCHITECT:** ✅ APPROVED (Locked)
```

---

## Related Documents

- **SHELL_CONTRACT.md** — Grid specifications (must exist before Phase 10)
- **HUMAN_FACTORS_DESIGNER.md** — Global Visual Fidelity Protocol (widgets in context)
- **Shipper & Administrator Style Guide.md** — Global style tokens
- **ARCHITECT.md** — Grid slot assignment verification
- **REVIEWER.md** — Widget boundary and responsive verification

---

## Summary: The Core Rule

> **"No widget is designed, coded, or reviewed in isolation."**
>
> Every widget is a child of the Shell.
> Every widget respects the Shell's grid, gutter, breakpoints, and styles.
> Every mockup shows the widget in its Shell context.
> Every PR is verified to honor Shell boundaries.

**Status:** MANDATORY for Phase 10+  
**Authority:** LIBRARIAN (Governance)  
**Enforcement:** Hard gates at HFD → CODER → REVIEWER stages

---

**Document Version:** 1.0  
**Last Updated:** 2026-06-10  
**Authority:** LIBRARIAN Role (Sequential Lock Protocol)
