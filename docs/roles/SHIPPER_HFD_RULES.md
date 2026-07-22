# HFD Rules: Shipper Stories

**Role:** HFD (Human Factors Designer)
**Applies To:** All Shipper stories (US-820+)
**Authority:** Sequential Lock Protocol + `docs/standards/SHIPPER_DESIGN_SYSTEM.md` + `docs/standards/brand_assets/Shipper & Administrator Style Guide.md` (§6, LOCKED — System of Record)
**Status:** MANDATORY

Distilled 2026-07-20 from already-shipped Shipper work (US-820–US-825, all `✅ COMPLETED`) and the existing `CARRIER_HFD_RULES.md` structural pattern — this documents decisions already locked, not new design.

---

## Pre-Work Gate Verification

**BEFORE accepting any Shipper story for design:**

- [ ] Story is in Jira with READY_FOR_DESIGN status
- [ ] BA has provided acceptance criteria (see `BUSINESS_ANALYST.md`)
- [ ] Story identifies whether it's a new page (needs `ShipperPageLayout`) or a component within an existing shipper page
- [ ] Story includes desktop viewport target (1280px+ primary; 1024px/768px/375px responsive fallback, not mobile-first)

---

## Design Workflow for Shipper Stories

### Phase 1: Story Intake & Constraints Gathering

**Checklist:**
1. [ ] Read story AC completely (INVEST standard)
2. [ ] Identify new UI patterns needed
3. [ ] Check `docs/standards/SHIPPER_DESIGN_SYSTEM.md` and Style Guide §6 for existing components/tokens before designing anything new
4. [ ] If new component: design tokens must come from Style Guide §6 (no custom colors, no visual estimation — §6 values are copy-paste only)
5. [ ] Confirm this is a `ShipperPageLayout`-wrapped page (§7 of the Style Guide) unless it's a component embedded in one
6. [ ] Plan desktop-first verification at 1280px, with responsive check at 1024px/768px/375px

**Gate:** Cannot proceed to design without completing this checklist.

---

### Phase 2: Design Specification Creation

**File naming:** `docs/hfd/US-###_Design_Spec.md` (see `docs/hfd/` for real precedent: `US-820_KPI_Summary_Design_Spec.md`, `US-821_Shipper_Header_Navigation_Design_Spec.md`, `US-822_Shipment_Status_Panel_Design_Spec.md`, `US-823_Shipper_Dashboard_Layout_Skeleton_Design_Spec.md`, `US-824_Quick_Actions_Panel_Design_Spec.md`, `US-825_Carrier_Search_Panel_Design_Spec.md`)

**Required sections:**
1. Design Vision (shipper/back-office context, desktop-first)
2. Color Palette (reference Style Guide §1 + §6.1 semantic colors — no custom hex values)
3. Typography (Sora for headings, Inter/Roboto for body/data — sizes from Style Guide §2)
4. Layout Structure (confirm `ShipperPageLayout` wrapper; asymmetric split grid per Style Guide §3)
5. Component Specifications (pull exact values from Style Guide §6.2–§6.5: table/grid, form inputs, spacing, containers)
6. Interaction Patterns (hover states, focus states — no swipe/gesture constraints, this is desktop)
7. Empty States & Feedback (required for all stories)
8. AC-to-UI Mapping (explicit links between design elements and AC)
9. Responsive Verification Checklist (1280px primary, 1024px/768px graceful stacking, 375px acceptable fallback)
10. Sign-Off Checklist (locked, ready for CODER)

**Tokens:** Copy-paste from Style Guide §6 (do NOT create custom colors, spacing, or radii — see §6's explicit "PROHIBITED" language on visual estimation).

---

### Phase 3: Constraint Validation

**Before locking design, verify:**

**ShipperPageLayout Compliance (Style Guide §7 — no exception process for this one):**
- [ ] Page is wrapped in `<ShipperPageLayout>` — no custom header/navigation structure
- [ ] No CSS overriding layout styling without a documented exception (ARCHITECT + LIBRARIAN approval, logged in `VISUAL_DEBT_LOG.md`)

**8px Grid & Atomic Specs (Style Guide §6.4 — "Forbidden Gaps: 10, 12, 14, 18, 20, 22, 25, 28, 30, 38, 40px"):**
- [ ] All padding/margin/gap values are multiples of 8px (space-xs 4px only for icon/text pairs; space-sm 8px, space-md 16px default, space-lg 24px, space-xl 32px)
- [ ] Form inputs: exactly 40px height, 4px border-radius, `#D0D0D0` border, `#B08D57` 2px focus border
- [ ] Containers/widget cards: exactly 8px border-radius, `#D0D0D0` 1px border, `#FFFFFF` background, 24px internal padding
- [ ] Table rows: exactly 48px height, `#E8E3D8` row border, `#636E72` uppercase 12px header font, `#1A1A1A` 14px data font

**Accessibility (WCAG AA — not AAA, this is a desktop office context, not high-glare mobile):**
- [ ] All color combinations meet WCAG AA contrast (≥4.5:1) — Style Guide §6.1 semantic colors are pre-verified
- [ ] Status conveyed via color + icon/text, never color alone
- [ ] Keyboard navigation and focus states considered (Tab order, visible focus)

**Responsive Behavior:**
- [ ] Desktop (≥1024px): full-width optimized, this is the primary target
- [ ] Tablet (768–1023px): graceful column stacking
- [ ] Mobile (≤767px): acceptable fallback only, not a design priority
- [ ] No layout shifts between breakpoints

**Gate:** Cannot lock design without passing all validations.

---

### Phase 4: Desktop Verification

Shipper stories do not carry Carrier's mobile-device/sunlight/glove verification burden — this is a desktop back-office tool. Verification is browser-based:

1. **Visual Compliance**
   - [ ] Rendered page matches Style Guide §6 values exactly (use browser inspector, not visual estimation)
   - [ ] Screenshot captured at 1280px width for evidence

2. **Responsive Check**
   - [ ] Test at 1280px, 1024px, 768px, 375px in browser DevTools
   - [ ] No horizontal scroll or layout breakage at any tested width

3. **Keyboard & Focus**
   - [ ] Tab through all interactive elements in logical order
   - [ ] Focus states visible (2px `#B08D57` border per §6.3)

4. **ShipperPageLayout Conformance**
   - [ ] Header shows logo + notification bell + avatar badge only — no text nav links (per `docs/roles/CODER.md` / `.claude/rules/ui-standards.md` shipper header pattern)
   - [ ] Profile + Sign out reachable via avatar dropdown

**Pass:** All Style Guide §6 values match exactly, no responsive breakage, keyboard-navigable.

---

### Phase 5: Design Lock & Handoff

**Before marking READY_FOR_CODER:**

1. [ ] All Phase 3/4 validations complete
2. [ ] Design spec reviewed by BA (AC alignment)
3. [ ] Design spec reviewed by ARCHITECT (API integration feasibility)
4. [ ] No outstanding questions or clarifications needed
5. [ ] Sign design as "LOCKED — No changes during CODER phase"

**Jira Comment Template:**
```
HFD SIGN-OFF: Design locked for US-###

Design Spec: docs/hfd/US-###_Design_Spec.md

Desktop Verification: ✅ COMPLETE
- Tested at: 1280px / 1024px / 768px / 375px
- ShipperPageLayout: Confirmed ✓
- Style Guide §6 values: Verified via inspector ✓
- Keyboard navigation: Confirmed ✓
- WCAG AA contrast: Verified ✓

All AC mapped to UI elements.
Ready for CODER implementation.
```

**Status:** Design moves to READY_FOR_CODER in Jira.

---

## Common Pitfalls (Avoid These)

### ❌ Pitfall 1: Missing ShipperPageLayout
**Problem:** "This page needs a slightly different header, so I made a custom one"
**Fix:** No exceptions without ARCHITECT + LIBRARIAN approval logged in `VISUAL_DEBT_LOG.md`. Automatic rejection otherwise (Style Guide §7).

### ❌ Pitfall 2: Non-8px Spacing
**Problem:** "20px looked better here"
**Fix:** Only 4/8/16/24/32px are permitted. Redesign to fit the grid.

### ❌ Pitfall 3: Wrong Border Radius
**Problem:** Using 6px on a form input, or 4px on a container
**Fix:** Inputs are exactly 4px; containers/widget cards are exactly 8px. These are different values for different components — check Style Guide §6.3 vs §6.5.

### ❌ Pitfall 4: Custom Colors Outside Palette
**Problem:** "This status needs a different shade"
**Fix:** Use Style Guide §6.1 semantic colors only. If truly needed → CHG ticket with LIBRARIAN.

### ❌ Pitfall 5: Mobile-First Thinking
**Problem:** Designing for 375px first, "then it'll scale up"
**Fix:** Shipper is desktop-first (1280px+ primary). Mobile is an acceptable fallback, not the design target — this is the opposite of Carrier/OO stories.

### ❌ Pitfall 6: No Empty States
**Problem:** "We'll handle empty states in CODER phase"
**Fix:** Define them now. Required part of design spec.

---

## Component Reuse Checklist

**For every Shipper story, check `docs/standards/SHIPPER_DESIGN_SYSTEM.md` and Style Guide §6 first:**

- [ ] Buttons — bronze gradient CTA (`bronzeButtonStyle` pattern, see `.claude/rules/ui-standards.md` / `docs/standards/ui-standards.md`) or outlined secondary
- [ ] Panels — `border-shipper-accent` (`#B08D57`), NOT `border-shipper-border` (grey) — the shared `surfaceClassName` token defaults to grey and must be overridden explicitly on Shipper dashboard components
- [ ] Header — logo + notification bell + circular avatar badge only, no text nav links; "My Loads" lives in the dashboard body as a bronze button, not the header
- [ ] Tables — 48px rows, §6.2 spec
- [ ] Forms — 40px inputs, §6.3 spec
- [ ] Status badges — §6.1 semantic colors, color + icon/text redundancy

**If story needs a genuinely new component:**
1. [ ] Design it using Style Guide §6 tokens
2. [ ] Add it to `docs/standards/SHIPPER_DESIGN_SYSTEM.md` after completion
3. [ ] Document for reuse in future stories

---

## Sign-Off Requirements

**HFD design is COMPLETE only when:**

- [ ] Design spec written in `docs/hfd/US-###_Design_Spec.md`
- [ ] All AC explicitly mapped to UI elements
- [ ] `ShipperPageLayout` compliance verified (or documented exception)
- [ ] Style Guide §6 values verified via inspector (not estimation)
- [ ] WCAG AA contrast verified (≥4.5:1)
- [ ] Responsive behavior verified at 1280/1024/768/375px
- [ ] Empty states defined for all scenarios
- [ ] Design locked (no changes permitted during CODER phase)
- [ ] JIRA comment posted with sign-off
- [ ] Story transitioned to READY_FOR_CODER

**Without these, story cannot move to CODER phase.**

---

## Escalation: When Design Blocks Implementation

**If CODER discovers design is infeasible mid-implementation:**

1. Do NOT rework design yourself
2. Create CHG (Change Request) ticket with: why design doesn't work, proposed alternative, impact on timeline
3. LIBRARIAN decides: finish with workaround OR rework design
4. If rework needed: new story (US-###-v2) created after inputs reworked

**Goal:** Prevent circular dependencies. Design is locked once CODER starts.

---

## Authority & Approval Flow

```
BA: Writes AC
  ↓
HFD: Designs UI (following Style Guide §6 + SHIPPER_DESIGN_SYSTEM.md)
  ↓
HFD Desktop Verification: 1280/1024/768/375px + inspector value checks
  ↓
ARCHITECT: Reviews design for API feasibility
  ↓
LIBRARIAN: Approves design lock (no rework phase)
  ↓
CODER: Implements (no design changes allowed)
```

---

**Status:** LOCKED STANDARD
**Date:** 2026-07-20
**Source:** Distilled from shipped US-820–US-825 design specs and Style Guide §6/§7 (both already LOCKED — System of Record)
