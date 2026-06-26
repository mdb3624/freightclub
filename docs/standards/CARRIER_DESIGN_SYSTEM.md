# Carrier Design System (Owner-Operator Scaffolding)

**Authority:** HFD (Human Factors Designer)  
**Applies To:** All Owner-Operator (OO) stories (US-730+)  
**Status:** LOCKED STANDARD  
**Date:** 2026-06-23  
**Reference:** US-730-0 Design Spec

---

## Overview

This is the **master design system for all Owner-Operator UI/UX work**. Every OO story (US-730a-f, US-731+, Phase 8+) must follow these standards. This prevents design fragmentation and ensures consistent mobile-first experience across the platform.

---

## Core Principles (Non-Negotiable)

### 1. **NO-SCROLL Paradigm**
- All dashboard content must fit within 100vh viewport
- Use tabbed interfaces to switch content, not page navigation
- Vertical scroll only for detailed modals (internal scrolling, not page-level)
- **Why:** Truck cab operation requires single-screen visibility

### 2. **Mobile-First Mandatory**
- Primary device: iPhone SE/12/13 (375-390px width)
- Design for 375px minimum; tablet/desktop optional
- Test on real device in sunlight before sign-off
- **Why:** Owner-operators use phones in truck cab 95% of the time

### 3. **Luxury Industrial Aesthetic**
- **Background:** Deep charcoal `#121212` (sunlight readable)
- **Accents:** Metallic bronze/copper `#B08D57` with gradient
- **Typography:** Sora (bold, uppercase for headers), Inter (body 14px)
- **Contrast:** WCAG AAA (7:1+) in direct sunlight
- **Why:** Evokes professional, industrial precision; readable in high-glare cab

### 4. **Glove-Friendly Interaction**
- All touch targets ≥48×48px (NO 44px, NO 40px)
- Minimum 8px spacing between buttons
- Tap-only interactions (NO swipe, NO long-press, NO complex gestures)
- Single-hand operation (one hand on steering wheel)
- **Why:** Gloved hands + moving vehicle = safety critical

### 5. **Performance Critical**
- LCP (Largest Contentful Paint) <2 seconds on 4G LTE
- FID (First Input Delay) <100ms
- CLS (Cumulative Layout Shift) <0.1
- **Why:** Slow load = driver distraction = safety risk

---

## Viewport Math (All OO Stories)

**Apply this formula to every OO story:**

```
Safe Area (iPhone 12):
├─ Top notch: 44px
├─ Bottom gesture bar: 34px
└─ Usable height: 812 - 44 - 34 = 734px

Layout Structure (Mandatory):
├─ Header (fixed): 56px
├─ Hero/Primary Content: 40% = 271px
├─ Tab Bar (fixed): 48px
└─ Tabbed Content Area: 60% = 359px

Total: 56 + 271 + 48 + 359 = 734px ✓
```

**Every OO story design must verify:**
- [ ] Hero/primary content is always visible (no scroll)
- [ ] Tab bar allows switching to secondary content (no navigation away)
- [ ] Content fits exactly within calculated area (no overflow)

---

## Design Tokens (Reusable Across All OO Stories)

### Color System
```css
/* Backgrounds */
--color-bg-primary: #121212;
--color-bg-surface: #1A1A1A;
--color-bg-overlay: rgba(0,0,0,0.7);

/* Accents */
--color-accent-bronze: #B08D57;
--color-accent-bronze-gradient: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%);
--color-accent-light: #C9A46A;
--color-accent-dark: #8C6D3F;

/* Status */
--color-status-success: #27AE60;
--color-status-warning: #F39C12;
--color-status-danger: #E74C3C;
--color-status-info: #3498DB;

/* Text */
--color-text-primary: #FFFFFF;
--color-text-secondary: #B0B0B0;
--color-text-muted: #808080;

/* Borders */
--color-border-primary: #333333;
--color-border-secondary: #2A2F37;
```

### Typography
```css
--font-family-display: Sora, sans-serif;
--font-family-body: Inter, sans-serif;

/* Headers */
--font-size-h1: 28px;
--font-weight-h1: 700;
--text-transform-h1: uppercase;
--letter-spacing-h1: 2px;

/* Body */
--font-size-body: 14px;
--font-weight-body: 400;

/* Labels */
--font-size-label: 12px;
--font-weight-label: 600;
```

### Spacing
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

--touch-target-min: 48px;
--touch-target-spacing: 8px;
--button-height: 48px;
--header-height: 56px;
--tab-bar-height: 48px;
```

---

## Component Library (All OO Stories Use These)

### Button Styles

**Primary CTA (Bronze Gradient)**
```
Height: 48px
Padding: 12px 24px
Font: 14px semibold white
Background: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)
Border: 1px solid #7A5F3A
Box-shadow: inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)
Focus: 2px solid #C9A46A outline (2px offset)
```

**Secondary Button (Outlined)**
```
Height: 48px
Padding: 12px 24px
Font: 14px semibold white
Background: transparent
Border: 2px solid #B08D57
Focus: 2px solid #B08D57 outline
```

**Pill Button (Compact)**
```
Height: 36px
Padding: 8px 16px
Font: 12px regular
Border-radius: 24px
Background: transparent OR semi-transparent bronze
Border: 1px solid #B08D57
Use: For secondary actions, grouped horizontally
```

### Metric Badge (2×2 Grid)
```
Size: 80×80px per cell
Background: #1A1A1A
Border: 1px solid #333333
Radius: 8px

Icon: 24px, centered
Value: 24px bold white, centered below icon
Label: 10px muted gray, centered below value

Color indicators: Left border 2px (green/amber/red)
```

### Load Card (Compact)
```
Height: 90px (fits 4 in 359px content area)
Padding: 12px
Border: 1px solid #333333
Border-radius: 8px

Layout:
├─ Destination: 14px bold white
├─ Rate + RPM Badge: 14px semi + status color
└─ Actions: [Details] [Claim] pill buttons (36px height)
```

### Status Badge (Profitability)
```
Size: 60×60px
Content: Icon + percentage
Colors:
  🟢 Green (#27AE60): ≥120% min RPM
  🟡 Amber (#F39C12): 100-120% min RPM
  🔴 Red (#E74C3C): <100% min RPM
Placement: Top-right corner of load cards
```

### Header (Fixed, All OO Stories)
```
Height: 56px
Background: #1A1A1A
Border-bottom: 1px solid #2A2F37

Layout (left to right):
├─ Logo: 40×40px, bronze (#B08D57)
├─ [FLEX SPACE]
├─ HOS Chip: ~120px wide, color-coded (green/amber/red)
├─ [FLEX SPACE]
├─ Notification Bell: 48×48px touch target, red badge if unread
├─ Avatar Badge: 48×48px circular, bronze bg, white initials
```

---

## Interaction Patterns (All OO Stories)

### Tabbed Navigation
```
3 or 4 tabs maximum per screen
Tab bar height: 48px (fixed)
Tab label: 12px bold uppercase
Tap to switch content (no navigation)
Content within tab scrolls internally only
```

### Modal Interactions
```
Use for: Cost profile, equipment setup, detailed views, confirmations
Trigger: Tap on any data-entry or non-critical feature
Overlay: Semi-transparent dark background (70% opacity)
Content: Full-screen or 90% width, scrollable within modal only
Close: Explicit [Cancel] or [X] button; dismiss returns to exact state
No backdrop swipe-to-close (tap button only)
```

### Confirmation Dialogs
```
For all state-changing actions (claim load, mark delivered, etc.)
Dialog: Centered overlay, max-width 320px
Content: Clear action description + consequences
Buttons: [Cancel] (left/top), [Confirm] (right/bottom, bronze gradient)
No neutral/third option (clear yes/no)
```

### Toast Notifications
```
Position: Bottom-center, 24px from safe area
Width: Full-width minus 16px padding each side
Height: 60px (icon + text + optional action)
Duration: 5 seconds auto-dismiss OR user tap to dismiss
Stacking: Only one toast visible at a time
Types: Success (green), Error (red), Info (blue), Loading (spinner)
```

---

## Mobile Verification Checklist (Every OO Story)

**Before HFD sign-off, verify on real device:**

- [ ] Dashboard fits 100vh viewport (no vertical scroll required)
- [ ] Hero/primary content visible on first load (no scroll to see)
- [ ] All touch targets ≥48×48px (measure with browser tools)
- [ ] Text readable in direct sunlight (high-glare test)
- [ ] Can perform primary action one-handed (steering wheel hand occupied)
- [ ] No accidental taps during casual scrolling (10 min test)
- [ ] Button feedback immediate (<100ms visual response)
- [ ] Scroll smooth at 60fps (no jank, no dropped frames)
- [ ] Page loads <2 seconds on 4G LTE (real device test or Lighthouse)
- [ ] Colors pass WCAG AAA contrast (7:1+) in sunlight

---

## Story Requirements for OO Work

**Every OO story must:**

### HFD Design Phase
1. Reference this design system (copy relevant tokens, components)
2. Verify viewport math (40/60 split or equivalent)
3. Use design tokens (no custom colors outside palette)
4. Specify mobile verification checklist
5. Lock design before CODER starts (no mid-implementation changes)

### CODER Implementation Phase
1. Implement using locked design tokens (copy-paste from here)
2. Test on iPhone SE (375px) in sunlight before opening PR
3. Verify touch targets with browser tools
4. Run Lighthouse: LCP <2s, FID <100ms
5. Include performance metrics in PR description

### REVIEWER Audit Phase
1. Verify mobile constraint compliance (no design deviations)
2. Check touch target sizing (measure with tools)
3. Confirm no color palette violations
4. Test one-handed operation (simulator or device)
5. Approve only if all mobile verification items pass

---

## File Structure for OO Stories

```
docs/
├── hfd/
│   ├── CARRIER_DESIGN_SYSTEM.md ← THIS FILE (master reference)
│   ├── US-730-0_Design_Spec.md (example: Dashboard MVP)
│   ├── US-731_Design_Spec.md (future: another OO story)
│   └── images/
│       ├── carrier-color-palette.png
│       ├── carrier-button-styles.png
│       └── carrier-components.png
├── standards/
│   └── CARRIER_DESIGN_SYSTEM.md ← Link to this file
└── roles/
    └── CARRIER_HFD_RULES.md ← HFD checklist per story
```

---

## Quick Reference: Copy-Paste Tokens

For any new OO story, COPY these tokens into your design spec:

### Colors
```
Primary BG: #121212
Surface BG: #1A1A1A
Bronze Accent: #B08D57
Bronze Gradient: linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)
Success: #27AE60
Warning: #F39C12
Danger: #E74C3C
Text Primary: #FFFFFF
Text Secondary: #B0B0B0
Text Muted: #808080
```

### Sizes
```
Header: 56px
Hero: 271px (40%)
Tab Bar: 48px
Content: 359px (60%)
Touch Target: 48×48px minimum
Button: 48px height
Spacing: 8px, 16px, 24px, 32px
```

### Fonts
```
Display: Sora 28px bold uppercase
Body: Inter 14px regular
Label: Inter 12px bold
```

---

## When to Deviate (Escalation)

**Only LIBRARIAN can approve design deviations** from this system.

If a new OO story requires:
- Different color palette
- Touch targets <48px
- Horizontal scroll
- Different typography system

→ Create a **CHG (Change Request)** ticket with:
- Why deviation is needed
- Impact on existing OO stories
- Proposed alternative standard
- LIBRARIAN approves → Update this system OR create exception

**Goal:** Consistency across all OO stories. Exceptions are rare and tracked.

---

## Authority & Enforcement

- **HFD** owns this system and updates as new OO stories emerge
- **CODER** implements using these tokens (no custom styling)
- **REVIEWER** verifies compliance before sign-off
- **LIBRARIAN** tracks deviations and approves changes

**Violations:** PR rejected if:
- Touch targets <48px
- Colors outside palette
- No mobile verification checklist
- Viewport > 100vh (requires scroll)

---

**Status:** LOCKED STANDARD  
**Version:** 1.0 (2026-06-23)  
**Next Review:** After US-730f completion (Phase 7 close)
