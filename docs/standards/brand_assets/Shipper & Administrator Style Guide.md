# Shipper & Administrator Style Guide.md

This style guide for the desktop Shipper Dashboard is defined by a focus on high clarity, high density data management, and user-centric navigation. It balances a **"Classic Cream & Metallic Bronze" industrial aesthetic** with structural layout configurations built to streamline office operations.

### 1. Color Palette: "Classic Cream & Metallic Bronze"
* **Primary Background (Canvas):** A warm, soft cream/beige tint (`#EFEBE0`) that reduces eye strain and maintains a premium look under bright office environment lighting.
* **Surface Colors:** Crisp, flat white (`#FFFFFF`) or ultra-light cream panels (`#F8F9FB`) that serve as containers to frame and isolate distinct modules without heavy borders.
* **Action/Call-to-Action (CTA) Color:** A rich, polished metallic copper/bronze gradient matching the core identity. Interactive buttons must utilize a distinct dimensional inner shadow and a slight gloss finish to look tactile and "raised."
* **Text Hierarchy:**
  * **Primary Labels/Data:** Dark Charcoal or Deep Espresso (`#1A1A1A` / `#2D3436`) for sharp, high-contrast readability.
  * **Secondary Data/Muted Metrics:** Steely Slate Grey (`#4A5568` / `#636E72`) for subtext, secondary labels, and non-essential text to create visual depth.

### 2. Typography
* **Font Choice:** Clean, high-legibility sans-serif typefaces (e.g., **Sora** for headlines and display, **Inter** or **Roboto** for UI elements and technical data tables).
* **Hierarchy:**
  * **Headings:** Bold, medium-weight, using uppercase lettering paired with wide letter-spacing (kerning) to clearly define sections.
  * **Data/KPIs:** Large, heavy numeric weights (e.g., **24**, **$2**, **96%**) to allow for instant, at-a-glance scanning.
  * **Body Text:** A minimum of 14px–16px for comfortable long-term office viewing.

### 3. Layout & Structure
* **Asymmetric Split Grid:** A desktop-optimized multi-column structured grid system ensuring that elements align perfectly for a sense of reliability and organization. High-frequency metrics live on the left; operational workflows live on the right.
* **Framed Containers:** Panels feature perfectly square or very slightly rounded corners (approx. 4px–8px rounding) with subtle drop shadows or soft-border containers to establish clean layers.
* **Persistent Redundancy Framework:** To ensure critical actions remain instantly accessible across large desktop displays, specific action blocks like the "Quick Action Panel" are intentionally duplicated across separate functional zones.
* **Quiet Hierarchy:** Prioritize signal over noise. Consolidate alerts (such as unifying "Messages & Alerts") so that the critical status of shipments remains the primary focal point.

### 4. Interface Elements
* **Iconography:** Thin, uniform-stroke line icons. They must be kept clean and intuitive, acting as visual cues rather than distractions.
* **Interaction Feedback:** Buttons and interactive elements must possess clear hover states (a slight darkening of the button) to provide immediate tactile confirmation of a successful click.
* **Profile Integration:** The user/administrator profile is displayed inside a perfectly circular, framed cameo badge at the top right header, outlined with a thin metallic bronze ring.
* **Data Status Progress Bars:** Progression lines for shipment transit tracking use a segmented, recessed track layout filled with a metallic gold/bronze progress indicator.

### 5. Brand Assets: Logo & Favicon
* **Primary System Logo (`web_logo.png`):** 
  * **Visual Graphic:** A high-detail semi-truck cab facing right, featuring a polished metallic copper/bronze gradient finish with distinct lighting highlights. The truck has trailing aerodynamic horizontal speed lines and a dust/smoke cloud effect at the rear wheels to imply forward kinetic motion.
  * **Primary Typography:** The uppercase text **"MDB"** is rendered in a bold, extra-large geometric sans-serif typeface with a dramatic 3D extrusion effect, deep inner shading, and a drop shadow that matches the metallic copper/bronze scheme.
  * **Sub-Branding Typography:** Positioned directly beneath the primary text is the label **"Integrated Logistics"** in a clean, medium-weight, high-legibility sans-serif font using a solid, uniform copper color.
* **System Favicon (`web_logo_favicon.png`):**
  * **Visual Asset:** A scaled, aspect-ratio-locked downsized variant of `web_logo.png`. It maintains the full visual layout—including the kinetic semi-truck icon, the 3D **"MDB"** lettering, and the **"Integrated Logistics"** sub-text—optimized for browser tabs and application shortcut icons.

---

### 6. Atomic Component Specifications (MANDATORY — Phase 10+)

**Authority:** LIBRARIAN + Design System Governance  
**Effective:** 2026-06-10  
**Status:** System of Record (No deviations permitted)

The following values are the **ONLY** values permitted for these components. Any deviation is considered a defect.

**CONSTRAINT:** HFD and CODER must extract these values directly from this document. Visual estimation, approximation, or custom derivations are PROHIBITED.

#### 6.1 Semantic Color System (Status & Alerts)

**Purpose:** Communicate state, severity, and action urgently to users.

| Status | Color Hex | Color Name | Use Case | Contrast (on #FFFFFF) |
|---|---|---|---|---|
| **Success** (Delivered/Complete) | `#27AE60` | Emerald Green | Load delivered on-time, task completed, operation successful | 5.2:1 ✅ WCAG AA |
| **Warning** (At Risk/Claimed) | `#F39C12` | Safety Amber | Load claimed but not yet in transit, delivery window at risk, caution required | 4.5:1 ✅ WCAG AA |
| **Critical** (Delayed/Error) | `#E74C3C` | Danger Red | Load delayed, payment failed, critical error requiring immediate attention | 5.2:1 ✅ WCAG AA |
| **Informational** (In Transit) | `#3498DB` | Tech Blue | Load in transit, informational update, neutral status | 5.4:1 ✅ WCAG AA |

**Implementation Rule:** Use semantic colors only for status badges, alert backgrounds, and priority indicators. Do NOT use for general UI accents.

#### 6.2 Data Table & Grid Specifications

**Purpose:** Provide consistent density and readability for data-heavy dashboards.

| Property | Value | Rationale | Constraint |
|---|---|---|---|
| **Row Height** | 48px (fixed) | Standard density for touch-friendly desktop use; matches 12px padding × 2 + 24px content height | MUST NOT exceed 48px (causes layout sprawl) |
| **Cell Padding** | 12px (vertical) × 16px (horizontal) | Balanced whitespace; respects 8px grid system (12px = 8px + 4px adjustment for text baseline) | MUST be exactly 12px/16px across all tables |
| **Header Font** | 12px, font-weight: 600 (bold), UPPERCASE, color: `#636E72` (Steely Slate) | Low visual weight for metadata; ALL-CAPS prevents confusion with data rows | MUST use `#636E72` (not `#4A5568`); MUST be UPPERCASE |
| **Data Cell Font** | 14px, font-weight: 400 (regular), color: `#1A1A1A` (Dark Charcoal) | Readable for long-term viewing; matches body text minimum size | MUST be exactly 14px; MUST be Dark Charcoal (not lighter grey) |
| **Row Border** | 1px solid `#E8E3D8` (subtle divider) | Separates rows without visual heaviness | MUST use `#E8E3D8`; DO NOT use `#D0D0D0` or darker |
| **Hover State** | Background: `#F8F9FB` (ultra-light cream), no border change | Subtle hover feedback without altering row structure | MUST NOT change row height on hover |

**Assembly Rule:** Tables MUST be built from these atomic specs. Custom padding, font sizes, or row heights are defects.

#### 6.3 Form Input Controls

**Purpose:** Ensure consistent form interaction and accessibility.

| Property | Value | Rationale | Constraint |
|---|---|---|---|
| **Border Radius** | 4px (all input corners) | Subtle roundness; matches interface element standard | MUST be exactly 4px (not 6px, 8px, or sharp corners) |
| **Border Style** | 1px solid `#D0D0D0` (light grey) | Subtle boundary; high contrast on cream/white backgrounds | MUST be `#D0D0D0` (not darker or lighter) |
| **Border Color (Focus)** | 2px solid `#B08D57` (Brand Bronze) | Visual confirmation of focus state; matches CTA button accent | MUST be 2px (not 1px); MUST be `#B08D57` |
| **Focus Outline** | Remove default outline; apply border-color only | Prevents double-border visual confusion | MUST use CSS `outline: none;` if using border-based focus |
| **Background Color** | `#FFFFFF` (white) when active, `#F8F9FB` (ultra-light cream) when disabled | Clear distinction between interactive and disabled states | MUST NOT use grey backgrounds for disabled (use light cream) |
| **Helper Text** | 12px font size, font-style: italic, color: `#636E72` (Steely Slate), margin-top: 4px | Secondary information; italics reduce cognitive load vs. bold | MUST be italic; MUST be `#636E72`; MUST be exactly 12px |
| **Error Text** | 12px font size, font-style: italic, color: `#E74C3C` (Danger Red) | Error messaging uses semantic critical color | MUST use `#E74C3C` (not custom red); MUST follow helper text format |
| **Input Height** | 40px (fixed) | Touch-friendly; aligns with 8px grid system (40 = 8×5) | MUST be exactly 40px (not 36px, 44px, or variable) |
| **Input Padding** | 8px 12px (vertical × horizontal) | Text breathing room; respects 8px grid | MUST be exactly 8px/12px |

**Assembly Rule:** Forms MUST be built from these input specs. Custom border widths, focus colors, or padding are defects.

#### 6.4 Spacing Tokens (The "8px Rule")

**Purpose:** Ensure visual consistency and rhythm across all layouts.

**Core Rule: All spacing MUST be a multiple of 8px.**

| Token Name | Value | Use Case | Constraint |
|---|---|---|---|
| **space-xs** | 4px | Minimal gaps (icon margins, tight lists) | ONLY use for icon/text pairs; never for component stacking |
| **space-sm** | 8px | Small gaps (form field labels, inline spacing) | Use for related elements in close proximity |
| **space-md** | 16px | Default gap (between components in a container) | MUST use for component-to-component gaps |
| **space-lg** | 24px | Large gaps (between major sections) | Use for section separators, top-level padding |
| **space-xl** | 32px | Extra-large gaps (page-level spacing) | Use for Shell zone padding, container margins |

**Forbidden Gaps:** 10px, 12px, 14px, 18px, 20px, 22px, 25px, 28px, 30px, 38px, 40px — These are NOT permitted.

**Stacking Rule:**
- Default gap between child components inside a container: **16px** (space-md)
- Override only if design explicitly requires tighter/looser spacing (document deviation with justification)

**CSS Implementation:**
```css
:root {
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;
}

.component-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);  /* 16px — DEFAULT */
}
```

**Verification:** Every `margin`, `padding`, and `gap` value in CSS MUST be a multiple of 8px.

#### 6.5 Container Component Specification (The "Widget Card")

**Purpose:** Ensure all widgets (KPIs, panels, modules) have clear, visually distinct boundaries that separate content from the canvas background.

**Constraint:** Containers are the **primary visual separator**. Weak or ambiguous borders cause user confusion (cannot distinguish widget from background).

| Property | Value | Rationale | Constraint |
|---|---|---|---|
| **Background** | `#FFFFFF` (Solid White) | Clean, neutral content surface; high contrast against cream canvas | MUST be pure white (not off-white or cream) |
| **Border** | 1px solid `#D0D0D0` (Cool Grey) | Visible boundary against `#EFEBE0` canvas; high enough contrast for clarity | MUST be `#D0D0D0` (not `#E8E3D8` or warmer tones; not darker than `#999999`) |
| **Border Radius** | 8px (all corners) | Soft, polished appearance; matches interface standard | MUST be exactly 8px (not 4px, 6px, or sharp) |
| **Box Shadow** | `0 2px 4px rgba(0, 0, 0, 0.05)` (Subtle elevation) | Minimal depth; indicates layering without visual heaviness | MUST use this exact blur/spread/opacity; DO NOT use stronger shadows (0.1+) |
| **Internal Padding** | 24px (all sides) | Standard content breathing room; aligns with §6.4 space-lg | MUST be 24px (matching space-lg token) |

**Assembly Rule:** Every widget container MUST include all five properties. Missing border or using #E8E3D8 is a defect.

**Contrast Verification:** The border (#D0D0D0) MUST be visually distinguishable from the canvas (#EFEBE0) at 100% zoom on a standard office monitor. If the border is invisible, the container spec has failed—this is a design system defect, not a hardware issue.

**CSS Template:**
```css
.widget-container {
    background: #FFFFFF;
    border: 1px solid #D0D0D0;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    padding: 24px;
}
```

---

## Authority & Governance

**Document Status:** System of Record (LOCKED)  
**Version:** 2.0 (Updated 2026-06-10 — Added Atomic Component Specifications §6)  
**Authority:** LIBRARIAN + Design System  
**Enforcement:** HFD and CODER must cite section 6 values in every specification and implementation  

**Deviation Protocol:** Any deviation from §6 values requires:
1. Formal exception request (document in VISUAL_DEBT_LOG.md)
2. ARCHITECT approval
3. Justification in design spec or code comments

**Automatic Rejection Criteria:**
- ❌ Row heights other than 48px (without exception)
- ❌ Padding/margin NOT a multiple of 8px
- ❌ Form borders other than 4px (without exception)
- ❌ Status colors using custom hex values instead of §6 palette
- ❌ Helper text font size other than 12px (without exception)