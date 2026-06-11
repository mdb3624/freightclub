# 🟢 IMPLEMENTATION DIRECTIVE: US-823 Shipper Dashboard Layout Skeleton

**To:** CODER Role  
**From:** ARCHITECT + HFD (Authoritative Directive)  
**Date:** 2026-06-11  
**Priority:** P0 | IMMEDIATE START  
**Authority:** ARCH_REVIEW_US-823_Structural_Gate.md + HFD_CONFIRMATION_US-823_GRID_REVISION.md

---

## Executive Directive

**The Architectural Gate for US-823 is officially cleared. HFD has confirmed the visual mockups now adhere to the mandated 8-4 grid split, and all structural criteria are locked.**

**YOU ARE CLEARED TO BEGIN IMPLEMENTATION IMMEDIATELY.**

---

## Implementation Requirements (Non-Negotiable)

### 1. Framework: ShipperPageLayout Shell

**Mandate:**
- Use `ShipperPageLayout` component (if available) or create a wrapper that ensures consistent header/footer treatment
- Grid container must be `.zone-widget-slots` (12-column from index.css)
- All content sections MUST be wrapped in `.panel` class (System of Record: index.css §6.5)

**Rationale:**
- `.panel` is the authoritative style definition for all dashboard widgets
- Ensures visual consistency across all Command Center stories (US-820, US-821, US-824, US-825, US-826)
- Single source of truth for padding (24px), border-radius (8px), shadow behavior

**What This Means:**
```tsx
// ✅ CORRECT
<div class="zone-widget-slots">
  <section class="panel" role="region" aria-label="...">
    {/* Content here */}
  </section>
</div>

// ❌ INCORRECT (custom wrapper)
<div class="zone-widget-slots">
  <div class="custom-shipment-container" style={{ padding: "20px" }}>
    {/* Content here — violates .panel requirement */}
  </div>
</div>
```

---

### 2. Constraint: 8-4 Grid Split (STRICT ENFORCEMENT)

**Mandate:**
- Shipment Status section → `.slot-b` (grid-column: 1 / span 8)
- Action Zone section → `.slot-c` (grid-column: 9 / -1, spans 4 columns)
- Carrier Search section → `.slot-b` (grid-column: 1 / span 8)
- Messages & Alerts section → `.slot-c` (grid-column: 9 / -1, spans 4 columns)

**CRITICAL:** No custom container widths. No margin overrides. No custom grid column definitions.

**Why:**
The Composite Framework is designed to prevent "jumbled layouts" and architectural drift. By enforcing a strict binary (8-col / 4-col) split, we ensure:
- Consistency across all future Command Center stories
- Predictable responsive behavior (stack on tablet/mobile via media queries in index.css)
- Zero precedent for custom CSS exceptions

**What NOT To Do:**
```tsx
// ❌ BANNED: Custom grid override
<div class="slot-b" style={{ gridColumn: "1 / span 7" }}>
  {/* This violates framework integrity */}
</div>

// ❌ BANNED: Hardcoded width
<div class="slot-b" style={{ width: "65%" }}>
  {/* index.css defines the width; don't override */}
</div>

// ❌ BANNED: Custom margin
<div class="slot-b" style={{ marginRight: "16px" }}>
  {/* Gap is controlled by grid; don't add custom margins */}
</div>
```

**What TO Do:**
```tsx
// ✅ CORRECT: Use slot class, let index.css handle layout
<section class="slot-b panel" role="region" aria-label="Shipment Status">
  {/* Content inherits slot-b width (8 cols) + panel styling */}
</section>

<section class="slot-c panel" role="region" aria-label="Action Zone">
  {/* Content inherits slot-c width (4 cols) + panel styling */}
</section>
```

---

### 3. Token Sweep: CSS Variables Only (ZERO Hardcoded Values)

**Mandate:**
- **ALL colors** → `var(--color-*)` from index.css
- **ALL spacing (padding, margin, gaps)** → `var(--space-*)` from index.css
- **ALL border-radius** → `var(--radius-*)` from index.css
- **ALL shadows** → `var(--shadow-*)` from index.css
- **ALL fonts** → `var(--font-size-*)` + `var(--font-weight-*)` from index.css

**ZERO EXCEPTIONS:** No hardcoded `#FFFFFF`, `24px`, `8px`, `rgba(...)`, etc.

**Why:**
CSS variables enable:
- Theming consistency (PersonaThemeContext applies tokens to Shipper persona)
- Single-point updates (change variable once, all components update)
- Auditability (REVIEWER can scan source and verify 100% token compliance)
- Design system governance (prevents rogue custom colors/spacing)

**Audit Checklist (REVIEWER will verify):**
- [ ] Zero `#` hex values in component files (grep for `#[0-9A-Fa-f]`)
- [ ] Zero hardcoded px values (grep for `[0-9]+px`)
- [ ] Zero rgba() or rgb() values (grep for `rgba?\(`)
- [ ] All padding uses `var(--space-lg)` (24px) or `var(--space-xl)` (32px)
- [ ] All gaps use `var(--space-lg)` (24px)
- [ ] All borders use `var(--border-widget)` or `var(--border-focus)`
- [ ] All shadows use `var(--shadow-subtle)` or `var(--shadow-elevated)`

**Example (Loading Skeleton):**
```tsx
// ✅ CORRECT
<div class="animate-pulse" style={{ minHeight: "300px" }}>
  <div class="h-6 bg-gray-200 rounded"></div>
  {/* Uses Tailwind gray-200 (already token-backed) + rounded (uses var(--radius-widget) in index.css) */}
</div>

// ❌ INCORRECT
<div class="animate-pulse" style={{ minHeight: "300px", backgroundColor: "#E5E5E5" }}>
  {/* Hardcoded hex violates token mandate */}
</div>
```

---

### 4. Verification: REVIEWER.md Gate + E2E Artifacts

**Mandate:**
- Run REVIEWER gate checklist (`.claude/rules/reviewer-checklist.md`) before submitting PR
- Capture 5 E2E screenshots per HFD spec § 8
- Grid alignment validation REQUIRED (visual proof of 8-4 split)
- Jitter prevention validation REQUIRED (skeleton → content height stability)

**E2E Screenshots Required:**

| Screenshot | Viewport | Purpose | File Location |
|---|---|---|---|
| Grid Alignment Desktop | 1280px | Validate 8-4 split visible (Shipment 8 cols, Action Zone 4 cols) | `test-results/evidence/us-823-grid-desktop.png` |
| Grid Alignment Tablet | 768px | Validate full-width stacking (responsive media query) | `test-results/evidence/us-823-grid-tablet.png` |
| Grid Alignment Mobile | 375px | Validate mobile layout (full-width stacking) | `test-results/evidence/us-823-grid-mobile.png` |
| Loading Skeletons | 1280px | Validate jitter prevention (skeleton heights match final content) | `test-results/evidence/us-823-skeletons.png` |
| Empty States | 1280px | Validate empty state UX (all 4 sections with empty messaging) | `test-results/evidence/us-823-empty-states.png` |

**Tagging:** All images tagged with `@US-823` in Playwright test comments for traceability.

**REVIEWER Verification Checklist (§4 API Contract Gate):**
- [ ] Grid lines align with 12-column layout (no overflow, no gaps)
- [ ] `.slot-b` is exactly 8 columns wide (measure in screenshot)
- [ ] `.slot-c` is exactly 4 columns wide (measure in screenshot)
- [ ] Gap between sections is exactly `var(--space-lg)` (24px) — validate in screenshot
- [ ] Padding around grid is exactly `var(--space-xl)` (32px) — validate in screenshot
- [ ] All `.panel` borders visible (1px solid, matches `var(--border-widget)`)
- [ ] All `.panel` shadows visible (subtle default, elevated on hover)
- [ ] Skeleton states maintain consistent height (no jitter on content load)
- [ ] Responsive breakpoints stack correctly at 768px and 375px

---

## Implementation Phases (Sequential)

### Phase 1: Scaffold (Day 1)
- [ ] Create `frontend/src/features/shipper/pages/ShipperDashboardPage.tsx`
- [ ] Wrap grid in `.zone-widget-slots` container
- [ ] Import `ShipperPageHeader` (US-821) + render in header slot
- [ ] Import `KPISummaryPanel` (US-820) + render in KPI slot
- [ ] Create 4 placeholder `.panel` sections with correct slot classes:
  - Shipment Status (`.slot-b .panel`)
  - Action Zone (`.slot-c .panel`)
  - Carrier Search (`.slot-b .panel`)
  - Messages & Alerts (`.slot-c .panel`)
- [ ] Verify HTML structure matches HFD spec § 7 (semantic roles + aria-labels)

### Phase 2: Layout & Styling (Day 1)
- [ ] Verify grid gap uses `var(--space-lg)` (24px) — no hardcoded values
- [ ] Verify grid padding uses `var(--space-xl)` (32px) — no hardcoded values
- [ ] All panels inherit `.panel` styling (background, border, shadow, padding)
- [ ] Verify responsive breakpoints: 1280px (8-4), 768px (stack), 375px (stack)
- [ ] Run token sweep: grep for `#[0-9A-Fa-f]`, `[0-9]+px` (hardcoded), `rgba?\(`
- [ ] Zero custom colors/spacing detected

### Phase 3: Jitter Prevention (Day 1)
- [ ] Implement loading skeletons with fixed heights:
  - Shipment Status: 300px
  - Action Zone: 240px
  - Carrier Search: 180px
  - Messages & Alerts: 280px
- [ ] Use `.animate-pulse` pattern (per HFD spec § 3)
- [ ] Verify height stability: skeleton height === final content height (no jump)

### Phase 4: Empty States (Day 1)
- [ ] Implement empty states for all 4 sections (HFD spec § 4):
  - Shipment Status: "No Active Shipments"
  - Action Zone: "Quick Actions Ready"
  - Carrier Search: "Enter a Location"
  - Messages & Alerts: "No Notifications Yet"
- [ ] Icons + title + description for each
- [ ] Use `.empty-state` class pattern from HFD spec

### Phase 5: Accessibility (Day 2)
- [ ] Add semantic roles (`role="region"`) to all sections
- [ ] Add aria-labels (per HFD spec § 7, exact labels provided)
- [ ] Verify keyboard navigation (tab order = visual flow)
- [ ] Run axe-core accessibility audit → WCAG AA pass

### Phase 6: E2E Artifacts & Testing (Day 2)
- [ ] Capture 5 screenshots (grid desktop, tablet, mobile + skeletons + empty states)
- [ ] Store in `test-results/evidence/` with `@US-823` tag
- [ ] Write Playwright tests validating:
  - Grid renders at correct viewports
  - Jitter prevention (no height shift skeleton → content)
  - Responsive stacking at breakpoints
- [ ] Unit tests: component mounts, sections render, loading/empty states display
- [ ] Coverage ≥70% (JaCoCo enforced)

---

## Acceptance Criteria Traceability

Every method/component created must reference the AC it satisfies:

```typescript
/**
 * Feature: US-823 (Shipper Dashboard Layout Skeleton)
 * AC-1: Dashboard landing page at /dashboard/shipper
 * AC-4: Four main content sections (Shipment Status, Action Zone, Carrier Search, Messages)
 * AC-6: Composite Framework Grid Mapping (Architectural Constraint)
 * AC-7: Panel Class Requirement (Assembly Mandate)
 * AC-8: Layout Stability & Jitter Prevention (Placeholder Protocol)
 * AC-9: Visual Integrity & Grid Alignment (HFD Artifact Requirement)
 */
export const ShipperDashboardPage: React.FC = () => {
  // Implementation
};
```

---

## REVIEWER Gate (Will Be Applied to PR)

**REVIEWER will verify the following before issuing PASS:**

### Hard Gate 1: Grid Alignment (Visual)
- [ ] Screenshot at 1280px shows 8-4 split (Shipment Status takes 8 cols, Action Zone takes 4 cols)
- [ ] No overflow, no gaps, no misalignment
- [ ] Grid lines visible in screenshot (use browser DevTools grid overlay)

### Hard Gate 2: Token Compliance (Code Audit)
- [ ] grep results: ZERO `#[0-9A-Fa-f]` (no hex codes)
- [ ] grep results: ZERO `[0-9]+px` (no hardcoded pixels)
- [ ] grep results: ZERO `rgba?\(` (no inline colors)
- [ ] All spacing uses `var(--space-*)` tokens

### Hard Gate 3: Component Assembly (Code Review)
- [ ] All sections wrapped in `.panel` class
- [ ] No duplicate or overriding panel styles
- [ ] Semantic roles + aria-labels present and correct

### Hard Gate 4: Jitter Prevention (E2E)
- [ ] Skeleton state screenshot shows consistent height across all 4 sections
- [ ] E2E test confirms no height shift on skeleton → content transition

### Hard Gate 5: Responsive Behavior (E2E)
- [ ] Tablet screenshot (768px) shows full-width stacking
- [ ] Mobile screenshot (375px) shows full-width stacking
- [ ] No overflow or layout issues at any breakpoint

### Hard Gate 6: Accessibility (Code + Audit)
- [ ] axe-core audit PASSES (WCAG AA)
- [ ] Keyboard navigation works (tab order = visual flow)
- [ ] Screen reader announces region roles + aria-labels

### Hard Gate 7: Test Coverage (JaCoCo)
- [ ] Unit tests: ≥70% branch coverage
- [ ] E2E tests: golden path + critical edge cases passing
- [ ] No skipped tests; all tests active

### Hard Gate 8: Framework Integrity (Architectural)
- [ ] No custom grid overrides detected (`.slot-b` used as-is, no custom width)
- [ ] No hardcoded margins/padding (gap managed by grid, padding by `.panel`)
- [ ] Grid structure matches HFD spec § 1 exactly

**PASS Verdict:** All 8 gates must be green. No exceptions.

---

## Commands & Tools

### Local Development
```bash
cd frontend
npm run dev
# Navigate to http://localhost:5173/dashboard/shipper
```

### Testing & Coverage
```bash
cd frontend
npm run test                # Unit tests
npm run test:e2e            # E2E tests (Playwright)
# E2E screenshots auto-stored in test-results/evidence/ with @US-823 tag
```

### Token Audit (Pre-Submission)
```bash
# Search for hardcoded values in your component
grep -r "#[0-9A-Fa-f]" src/features/shipper/pages/ShipperDashboardPage.tsx
grep -r "[0-9]\+px" src/features/shipper/pages/ShipperDashboardPage.tsx
grep -r "rgba\|rgb(" src/features/shipper/pages/ShipperDashboardPage.tsx
# Should return ZERO results
```

---

## FAQ & Troubleshooting

**Q: Can I use custom padding on a .panel section?**  
A: No. Padding is inherited from `.panel` class (24px). If you need spacing adjustments, use the grid gap (managed by `.zone-widget-slots`).

**Q: What if the 8-4 split doesn't match my design vision?**  
A: The 8-4 split is LOCKED per the ARCHITECT decision. Design must conform to the framework, not vice versa. If the proportions feel wrong, escalate via the CHG (Change Request) protocol — do not work around it.

**Q: Can I add custom styling to the skeleton?**  
A: No custom inline styles. Use the `.animate-pulse` pattern from the framework. All colors must use `var(--color-*)` tokens. All spacing must use `var(--space-*)` tokens.

**Q: What if my screenshot doesn't perfectly match the 8-4 proportions?**  
A: The REVIEWER will measure grid columns in the screenshot. If the proportions are off, the PR will be rejected. Verify locally using browser DevTools grid overlay before submitting.

**Q: Can I skip the E2E artifacts?**  
A: No. The HFD specification (AC-9) requires 5 screenshots with `@US-823` tag. REVIEWER gate requires visual evidence. No PR will merge without them.

**Q: The framework seems restrictive. Why?**  
A: Consistency enables scale. By locking the 8-4 grid now, we prevent future stories (US-824, US-825, US-826, and beyond) from introducing custom CSS fragmentation. The restriction is intentional and non-negotiable.

---

## Sign-Off & Authority

**ARCHITECT Role:** ✅ Grid layout locked (Option A: Strict 8-4 compliance)  
**HFD Role:** ✅ Visual mockups revised + confirmed  
**CODER Role:** 🟢 **CLEARED TO IMPLEMENT**

**Authority Documents:**
1. `docs/architecture/ARCH_REVIEW_US-823_Structural_Gate.md` (Signed 2026-06-11)
2. `docs/hfd/HFD_CONFIRMATION_US-823_GRID_REVISION.md` (Confirmed 2026-06-11)
3. `docs/hfd/US-823_Shipper_Dashboard_Layout_Skeleton_Design_Spec.md` (Revised 2026-06-11)

---

## Execution Mandate

**Start Date:** 2026-06-11 (today)  
**Duration:** 2 days (Phase 1-6)  
**Estimated Completion:** 2026-06-13  

**Execution Conditions:**
- No mid-cycle scope changes (Sequential Lock Protocol active)
- Framework constraints are non-negotiable
- REVIEWER gate must be satisfied before merge
- All AC traceability required

**You have clarity, authority, and a locked specification. Execute with confidence.**

---

**Generated:** 2026-06-11  
**Authority:** ARCHITECT + HFD (Directive)  
**Status:** 🟢 READY FOR IMMEDIATE IMPLEMENTATION
