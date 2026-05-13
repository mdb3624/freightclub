# Responsive Breakpoint Strategy — Design System Contract

**Author:** Human Factors Designer  
**Phase:** Phase 7 (Fleet Management)  
**Purpose:** Establish a binding contract between HFD (design) and CODER for responsive behavior across all surfaces

---

## Breakpoint Definitions

All breakpoints are defined in `tailwind.config.ts` and apply globally across the platform. These are **not arbitrary** — they are chosen to match common device categories and reading distances in logistics workflows.

| Breakpoint | Tailwind Code | Screen Width Range | Device Category | Primary Use Case |
|---|---|---|---|---|
| **sm** | `sm:` | 320px – 640px | Mobile phone (portrait) | Trucker in-cab operations; high-vibration, high-glare environment; one-handed operation |
| **md** | `md:` | 641px – 1024px | Tablet (portrait/landscape) | Shipper office operations; moderate-density data review; touch-based interaction |
| **lg** | `lg:` | 1025px+ | Desktop / Laptop | Shipper back-office operations; high-density data management; keyboard + mouse interaction |

---

## Design Principles by Breakpoint

### Mobile (sm: 320–640px)
**Persona:** Owner/Operator trucker in high-stress, mobile-first environment

**Principles:**
- **Content-first:** Stack all information vertically; no sidebars
- **Touch-optimized:** All interactive elements **≥ 44×44px**
- **Glare-resistant:** High contrast text (gray-900 on white; white on primary-600); no text-gray-400 or gray-500 for body text
- **High-vibration tolerance:** Large, bold typography (16px+ for primary info); wide touch targets reduce accidental taps
- **Persistent controls:** Floating action buttons (FABs) or sticky footers for critical actions
- **No hover states:** All interactions triggered by tap, not hover; tooltips triggered by long-press
- **Minimal scrolling:** Hero information above fold; lazy-load below

**Technical Requirements:**
- Font size (body): **≥ 14px** (16px+ for primary info like pay rates)
- Font size (labels/captions): **≥ 12px**
- Button height: **≥ 44px** (use `py-3` or larger)
- Padding: **px-4** minimum for horizontal; **py-3** minimum for vertical
- Line height: **≥ 1.5** (150%) for readability at arm's length

---

### Tablet (md: 641–1024px)
**Persona:** Shipper managing loads from office; moderate mobile use

**Principles:**
- **2-column layout:** Primary content (70%), sidebar or secondary panel (30%)
- **Grid-based:** Cards in 2-column grid; tables become card stacks when needed
- **Touch + keyboard:** Support both gesture (swipe, tap) and keyboard navigation
- **Readable:** Larger font sizes than mobile (14–16px body); increased whitespace
- **Modals acceptable:** Drawers and bottom sheets for secondary information
- **Limited hover:** Tap-triggered menus and tooltips; hover states optional but welcome

**Technical Requirements:**
- Font size (body): **14–16px**
- Button height: **≥ 44px** (use `py-3` or larger)
- Padding: **px-6** for cards; **py-4** for vertical spacing
- Max content width: **70vw** for primary area
- Gap between columns: **24px** or larger

---

### Desktop (lg: 1025px+)
**Persona:** Shipper back-office operations; power user with multiple monitors

**Principles:**
- **Information-dense:** Tables, complex grids, and sidebars acceptable
- **Multi-column layouts:** 3+ columns supported (e.g., sidebar nav + main content + detail panel)
- **Keyboard-first:** Full keyboard navigation; shortcuts (Cmd+L, Ctrl+S) supported
- **Hover states:** Tooltips, interactive rows, and state feedback on hover
- **Expandable sections:** Accordion-style details; expand/collapse patterns for dense data

**Technical Requirements:**
- Font size (body): **14px**
- Font size (labels/captions): **12px**
- Button height: **≥ 40px** (use `py-2` or larger)
- Padding: **px-6** standard; **px-8** for spacious layouts
- Max content width: **1200px** standard; **1400px** for data-dense dashboards

---

## Component Behavior by Breakpoint

### Navigation

| Breakpoint | Pattern | Behavior |
|---|---|---|
| **sm** | Bottom tabs or hamburger menu | Hamburger icon (3 lines) triggers slide-out nav; bottom tab bar for primary sections |
| **md** | Sticky header + optional sidebar | Horizontal top nav; optional left sidebar (collapses on narrow tablets) |
| **lg** | Persistent sidebar or horizontal nav | Full sidebar (220px) always visible; or sticky horizontal nav with dropdown menus |

### Tables & Lists

| Breakpoint | Pattern | Behavior |
|---|---|---|
| **sm** | Card stack | Vertical cards; swipe right for more details; tap to expand full view |
| **md** | 2-column grid | Cards arranged in 2 columns; tap for detail modal |
| **lg** | Sortable table | Full HTML table with sortable headers, pagination, inline actions |

### Forms

| Breakpoint | Pattern | Behavior |
|---|---|---|
| **sm** | Full-width stacked inputs | One field per row; labels above fields; helper text below |
| **md** | Single-column or 2-column grid | Optional 2-column layout for short fields (e.g., city + state); labels above |
| **lg** | Multi-column grid or wizard steps | 2–4 columns acceptable; labels inline or above depending on field type; wizard steps horizontal |

### Modals & Drawers

| Breakpoint | Pattern | Behavior |
|---|---|---|
| **sm** | Full-screen bottom sheet | Modal takes full height; slide up from bottom; close button top-right |
| **md** | Bottom sheet or centered modal | Bottom sheet (preferred); centered modal acceptable if content < 500px wide |
| **lg** | Centered modal or side panel | Centered modal (max 600px wide) or side panel (40vw from right edge) |

### Buttons & CTAs

| Breakpoint | Primary Button | Secondary Button | Icon Button |
|---|---|---|---|
| **sm** | `py-3 px-6` (44px height) | `py-3 px-6` (44px height) | `40×40px` touch target |
| **md** | `py-3 px-6` (44px height) | `py-2 px-4` (40px height) | `40×40px` touch target |
| **lg** | `py-2 px-6` (40px height) | `py-2 px-4` (40px height) | `32×32px` acceptable |

---

## Color & Contrast Requirements by Breakpoint

### Mobile (sm)
- **Body text:** gray-900 on white (9:1 contrast) or gray-700 on white (7:1 contrast)
- **Labels:** gray-600 on white (4.8:1 contrast)
- **NO gray-400 or gray-500 for body text** — insufficient contrast at arm's length in high-glare environments
- **Status badges:** High-contrast color pairs (green on white, red on white, etc.)

### Tablet & Desktop (md, lg)
- **Body text:** gray-900 on white (9:1 contrast) — preferred; gray-700 acceptable (7:1)
- **Labels:** gray-600 on white (4.8:1 contrast) — acceptable for secondary info
- **Captions:** gray-500 on white (3.5:1 contrast) — acceptable for metadata, timestamps, file sizes
- **Hover states:** Use opacity (0.7) or lighter color, not darker

---

## Font Sizing by Breakpoint

| Element | sm (Mobile) | md (Tablet) | lg (Desktop) |
|---|---|---|---|
| Page title (H1) | 24px SORA bold | 28px SORA bold | 32px SORA bold |
| Section header (H2) | 18px SORA bold | 20px SORA bold | 24px SORA bold |
| Subsection (H3) | 16px SORA bold | 18px SORA bold | 18px SORA bold |
| Body text | 16px INTER | 15px INTER | 14px INTER |
| Secondary text (labels) | 12px INTER | 13px INTER | 12px INTER |
| Captions (metadata) | 11px INTER | 12px INTER | 12px INTER |
| **Button label** | 14px INTER bold | 14px INTER bold | 14px INTER |
| **Table header** | N/A | 12px INTER bold | 12px INTER bold |

---

## Spacing & Layout by Breakpoint

### Padding & Margins

| Element | sm | md | lg |
|---|---|---|---|
| Page margin | 16px | 24px | 32px |
| Card padding | 16px | 20px | 24px |
| Form field spacing | 16px | 20px | 20px |
| Section gap | 24px | 32px | 40px |
| Button padding | `px-6 py-3` | `px-6 py-3` or `px-4 py-2` | `px-6 py-2` or `px-4 py-2` |

### Max Widths

| Container | sm | md | lg |
|---|---|---|---|
| Full-screen app | 100% | 100% | 100% |
| Modal/drawer | Full height | 400–500px wide, 80vh height | 600px wide, 80vh height |
| Main content | 100% | 70vw | 1200px |
| Data table | Full width | Full width | 1200px–1400px |
| Form | 100% | 100% | 600px centered or sidebar |

---

## Touch Target Sizes (WCAG 2.5.5 Compliance)

**All interactive elements must meet these minimums:**

| Element | Size | Padding |
|---|---|---|
| Button | 44×44px minimum | Surrounding 8px spacing recommended |
| Link (inline) | 44×44px touch target area | Pseudo-element padding if text < 44px |
| Checkbox / Radio | 44×44px | Increase hit area with `touch-none` + pseudo-element |
| Form input | 44px height minimum | `py-2` or `py-3` |
| Tab / Menu item | 44px height minimum | `py-3` |
| Icon button | 40×40px minimum (mobile); 32×32px (desktop) | Centered icon, surrounding padding |

---

## State Indicators by Breakpoint

### Focus States (Keyboard Navigation)
- **sm:** 3px solid ring (primary-600) with 4px offset
- **md:** 2px solid ring (primary-600) with 2px offset
- **lg:** 2px solid ring (primary-600) with 2px offset

### Hover States (Desktop Only)
- **sm:** None (tap instead)
- **md:** Optional; fade in tooltip or subtle background color change
- **lg:** Tooltip, background color change, or text underline

### Active / Pressed States
- **All breakpoints:** 
  - Button: Darker background or shadow effect
  - Tab: Underline or background highlight
  - Checkbox: Checkmark appears + background color change

---

## Accessibility by Breakpoint

### Keyboard Navigation
- **sm (Mobile):** Tab order must be logical; no keyboard nav expected (touch-first)
- **md (Tablet):** Full Tab navigation supported; Escape closes modals
- **lg (Desktop):** Full keyboard navigation with:
  - Tab: Move forward
  - Shift+Tab: Move backward
  - Enter / Space: Activate buttons, select checkboxes
  - Arrow keys: Navigate lists, tabs, tables (if applicable)
  - Escape: Close modals, cancel operations

### Screen Reader Announcements
- **sm & md & lg (all):**
  - Form labels: `<label for="field-id">` explicitly associated
  - Section headers: `<h2>`, `<h3>` semantic HTML
  - Buttons: Clear descriptive text (not "Click here")
  - Status badges: `aria-label` for icon-only badges
  - Live regions: `aria-live="polite"` for async updates (toasts, load status)

---

## Responsive Image Strategy

| Breakpoint | Image Width | Density | Format |
|---|---|---|---|
| **sm** | 100vw (full width) | 2x (retina) | WebP with JPEG fallback |
| **md** | 50–70vw | 2x (retina) | WebP with JPEG fallback |
| **lg** | 1200–1400px | 1x (high-res monitors get larger file) | WebP with JPEG fallback |

Use `<picture>` elements with `srcset` for art direction (e.g., different crops for sm vs lg).

---

## Testing Checklist for HFD ↔ CODER Collaboration

Before marking a surface as HFD-complete:

- [ ] Tested on iPhone SE (375px), iPad (768px), and 1920px desktop
- [ ] All buttons ≥ 44px height on sm/md; buttons properly sized on lg
- [ ] No text-gray-400 or gray-500 for body text on sm breakpoint
- [ ] Tables become card stacks on md; remain tables on lg
- [ ] Forms remain single-column on sm; optional 2-col on md; multi-col acceptable on lg
- [ ] Navigation pattern appropriate for breakpoint (hamburger on sm, nav on lg)
- [ ] Modals/drawers use bottom sheet on sm; drawer or centered on md; side panel or centered on lg
- [ ] Hover states disabled on sm; present on md/lg
- [ ] Keyboard navigation functional on md/lg
- [ ] ARIA labels and roles present on all breakpoints
- [ ] Font sizes scale per spec (16px body on sm, 14px on lg)
- [ ] Touch targets 44px minimum on sm/md

---

## Tailwind Config Reference

Add to `tailwind.config.ts` extend section:

```js
theme: {
  extend: {
    screens: {
      'sm': '320px',    // Default Tailwind: 640px — overridden to true mobile
      'md': '641px',    // Default: 768px — overridden to tablet
      'lg': '1025px',   // Default: 1024px — overridden to desktop
    },
    fontSize: {
      'xs': '11px',     // Captions on sm
      'sm': '12px',     // Labels on sm/md
      'base': '14px',   // Body on md/lg
      'lg': '16px',     // Body on sm; secondary on md
      'xl': '18px',     // Subsection on md
      '2xl': '20px',    // Section on md
      '3xl': '24px',    // Title on sm; section on lg
      '4xl': '28px',    // Title on md
      '5xl': '32px',    // Title on lg
    },
  },
}
```

---

## Summary: HFD Contract for CODER

**This document is a binding agreement between HFD and CODER:**

1. **HFD responsibility:** Define layout, component patterns, and ARIA requirements for each breakpoint (done in this doc + three design specs)
2. **CODER responsibility:** Implement layouts, button sizes, and navigation patterns exactly as specified; test on representative devices (iPhone, iPad, desktop)
3. **Validation:** Both roles review the responsive behavior on actual devices (not just browser devtools) before sign-off

When HFD says a surface is "design-complete," CODER can proceed knowing:
- Layout strategy is defined for sm/md/lg
- Button sizes and touch targets are specified
- Color contrast is assured (gray text choices are safe)
- ARIA structure is documented
- Responsive behavior patterns are prescriptive (not suggestions)

---

## Next Steps

1. **CODER:** Implement Load Board, Trucker Dashboard, Shipper Dashboard per design specs + this breakpoint strategy
2. **CODER:** Test on sm (320–640px), md (641–1024px), lg (1025px+) devices
3. **HFD + CODER:** Pair-test on real devices; verify glare resistance, touch target size, font readability in high-glare environment (simulated: outdoor, sunny conditions)
4. **REVIEWER:** Audit responsive behavior per reviewer checklist before sign-off
