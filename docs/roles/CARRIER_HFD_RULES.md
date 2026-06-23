# HFD Rules: Owner-Operator (Carrier) Stories

**Role:** HFD (Human Factors Designer)  
**Applies To:** All Owner-Operator stories (US-730+)  
**Authority:** Sequential Lock Protocol + CARRIER_DESIGN_SYSTEM.md  
**Status:** MANDATORY  

---

## Pre-Work Gate Verification

**BEFORE accepting any OO story for design:**

- [ ] Story is in Jira with READY_FOR_DESIGN status
- [ ] BA has provided acceptance criteria (see BUSINESS_ANALYST.md)
- [ ] Story includes mobile constraints (iPhone 375px, gloved hands, sunlight readable)
- [ ] Budget includes mobile verification time (2-3 hours device testing)

---

## Design Workflow for OO Stories

### Phase 1: Story Intake & Constraints Gathering

**Checklist:**
1. [ ] Read story AC completely (INVEST standard)
2. [ ] Identify new UI patterns needed
3. [ ] Check CARRIER_DESIGN_SYSTEM.md for existing components
4. [ ] If new component: design tokens must match palette (no custom colors)
5. [ ] Determine viewport math:
   - Does content fit 100vh?
   - If not, implement tabbed interface
   - If tabbed, 40/60 split rule applies
6. [ ] Plan mobile verification (sunlight test, device, gloves)

**Gate:** Cannot proceed to design without completing this checklist

---

### Phase 2: Design Specification Creation

**File naming:** `docs/hfd/US-###_Design_Spec.md`

**Required sections:**
1. Design Vision (owner-operator context, mobile-first)
2. Color Palette (reference CARRIER_DESIGN_SYSTEM or lock custom with CHG)
3. Typography (must use Sora + Inter, sizes from system)
4. Layout Structure (verify viewport math, no overflow)
5. Component Specifications (use design tokens)
6. Interaction Patterns (tap-only, modals, confirmations)
7. Empty States & Feedback (required for all stories)
8. AC-to-UI Mapping (explicit links between design elements and AC)
9. Mobile Verification Checklist (sunlight, one-handed, 48px targets, <2s load)
10. Sign-Off Checklist (locked, ready for CODER)

**Tokens:** Copy-paste from CARRIER_DESIGN_SYSTEM.md (do NOT create custom colors)

---

### Phase 3: Constraint Validation

**Before locking design, verify:**

**No-Scroll Compliance:**
- [ ] Primary content visible on first load (no scroll)
- [ ] Secondary content accessed via tabs (not navigation)
- [ ] Modals handle all data-entry (not page expansion)
- [ ] Viewport calculation: header + hero + tabs + content = ≤734px

**Mobile-First:**
- [ ] Designed for iPhone 375px minimum
- [ ] Desktop/tablet optional (nice-to-have, not required)
- [ ] All touch targets ≥48px (measure with browser tools)
- [ ] No touch targets <44px

**Accessibility:**
- [ ] Text readable in sunlight (test with WCAG AAA checker)
- [ ] 7:1+ contrast on all colors
- [ ] Keyboard navigation considered (Tab order, focus states)
- [ ] Color not only differentiator (icons or labels for status)

**Performance:**
- [ ] Placeholder strategy for slow API calls (LCP <2s)
- [ ] No large unoptimized images (webp, <100KB)
- [ ] CLS minimized (no layout shifts during load)

**Gate:** Cannot lock design without passing all validations

---

### Phase 4: Mobile Device Verification

**MANDATORY:** Test on real iPhone (not simulator) before sign-off

**Setup:**
- [ ] iPhone SE/12/13 (375px minimum)
- [ ] Test in direct sunlight (outdoor, high glare)
- [ ] Wear work gloves or thick socks on fingers (simulate gloved hands)
- [ ] 4G LTE network (throttle if using WiFi via Chrome DevTools)

**Verification Tasks:**

1. **Readability in Sunlight**
   - [ ] Can you read primary content without squinting?
   - [ ] Are profitability badges (green/yellow/red) immediately recognizable?
   - [ ] Are status colors distinguishable (not just red, must be "stop" vs. "warning")?
   - **Pass:** No squinting, colors clear, instant perception

2. **One-Handed Operation**
   - [ ] Primary CTA (e.g., [CLAIM LOAD]) reachable with thumb
   - [ ] Can you tap without reaching across screen
   - [ ] Secondary actions accessible (no stretching needed)
   - **Pass:** Thumb reaches all interactive elements

3. **Touch Target Sizing**
   - [ ] Measure all buttons with Chrome DevTools Inspector
   - [ ] No button smaller than 48×48px
   - [ ] Spacing between buttons ≥8px
   - **Pass:** All targets ≥48px, 8px minimum gap

4. **Performance Load**
   - [ ] Lighthouse: LCP <2 seconds on 4G LTE
   - [ ] Lighthouse: FID <100ms, CLS <0.1
   - [ ] First paint: <1 second
   - **Pass:** All metrics green

5. **Scroll Behavior**
   - [ ] Primary content visible without scrolling
   - [ ] Tab switching is smooth (no lag)
   - [ ] Modals scroll internally only (not whole page)
   - [ ] Scroll at 60fps (no jank, record Performance tab)
   - **Pass:** No vertical scroll needed on main view

6. **No Accidental Taps**
   - [ ] Casual scrolling for 10 minutes
   - [ ] Attempt one-handed operation
   - [ ] Try tapping notification bell + nearby buttons
   - **Pass:** Zero unintended taps, buttons well-spaced

7. **Glove-Friendly Testing**
   - [ ] Wear thick winter gloves or socks on fingers
   - [ ] Attempt to claim a load (full workflow)
   - [ ] Attempt to edit cost profile
   - [ ] Attempt to check HOS status
   - **Pass:** All primary actions completable with gloves

---

### Phase 5: Design Lock & Handoff

**Before marking READY_FOR_CODER:**

1. [ ] All verification checklist items complete
2. [ ] Design spec reviewed by BA (AC alignment)
3. [ ] Design spec reviewed by ARCHITECT (API integration feasibility)
4. [ ] No outstanding questions or clarifications needed
5. [ ] Mobile verification evidence documented (screenshots, performance metrics)
6. [ ] Sign design as "LOCKED — No changes during CODER phase"

**Jira Comment Template:**
```
HFD SIGN-OFF: Design locked for US-###

Design Spec: docs/hfd/US-###_Design_Spec.md

Mobile Verification: ✅ COMPLETE
- Device: iPhone 12 (375px)
- Tested in: Direct sunlight
- LCP: 1.8s (4G LTE)
- Touch targets: All ≥48px ✓
- One-handed operation: Confirmed ✓
- No vertical scroll needed: Confirmed ✓

All AC mapped to UI elements.
Ready for CODER implementation.
```

**Status:** Design moves to READY_FOR_CODER in Jira

---

## Common Pitfalls (Avoid These)

### ❌ Pitfall 1: Custom Colors Outside Palette
**Problem:** "This story needs a different shade of blue"
**Fix:** Use CARRIER_DESIGN_SYSTEM colors. If truly needed → Create CHG ticket with LIBRARIAN

### ❌ Pitfall 2: Touch Targets <48px
**Problem:** "This badge is only 44px; it's still touchable"
**Fix:** 48px is minimum for gloved hands. Redesign to fit.

### ❌ Pitfall 3: Vertical Scroll Required
**Problem:** "We need to show more content, so I made it scrollable"
**Fix:** Use tabbed interface or modals. Primary content must always be visible.

### ❌ Pitfall 4: Colors Not Tested in Sunlight
**Problem:** Design looks good on screen but unreadable in sunlight
**Fix:** Mandatory device verification. Always test in high-glare conditions.

### ❌ Pitfall 5: Swipe Gestures
**Problem:** "Swipe down to close modal is intuitive"
**Fix:** Tap-only interactions only. Use explicit [Cancel] button.

### ❌ Pitfall 6: No Empty States
**Problem:** "We'll handle empty states in CODER phase"
**Fix:** Define them now. Required part of design spec.

### ❌ Pitfall 7: Skipping Mobile Verification
**Problem:** "Lighthouse shows it passes, so it's ready"
**Fix:** Lighthouse is necessary but not sufficient. Real device test is mandatory.

---

## Component Reuse Checklist

**For every OO story, check CARRIER_DESIGN_SYSTEM.md first:**

- [ ] Button styles — Use primary CTA (bronze) OR secondary (outlined) OR pill (compact)
- [ ] Header — Use standard 56px with logo, HOS chip, bell, avatar
- [ ] Metric badges — Use 2×2 grid if displaying 4 stats
- [ ] Load cards — Use standard 90px height with profitability badge
- [ ] Modals — Use overlay pattern with explicit close button
- [ ] Status badges — Use green/amber/red per profitability levels
- [ ] Toast notifications — Use bottom-center positioning, 5s auto-dismiss
- [ ] Tabs — Use max 4 tabs, 48px height, content within scrolls internally

**If story needs new component:**
1. [ ] Design it with CARRIER_DESIGN_SYSTEM colors/tokens
2. [ ] Add to CARRIER_DESIGN_SYSTEM.md after completion
3. [ ] Document for reuse in future stories

---

## Sign-Off Requirements

**HFD design is COMPLETE only when:**

- [ ] Design spec written in `docs/hfd/US-###_Design_Spec.md`
- [ ] All AC explicitly mapped to UI elements
- [ ] Color palette verified (WCAG AAA contrast ≥7:1)
- [ ] Touch targets verified (all ≥48px)
- [ ] Viewport math verified (no scroll required for hero)
- [ ] Mobile device verification complete (sunlight, gloves, one-handed, <2s LCP)
- [ ] Empty states defined for all scenarios
- [ ] Feedback patterns (confirmations, toasts) specified
- [ ] Design locked (no changes permitted during CODER phase)
- [ ] JIRA comment posted with sign-off + mobile verification evidence
- [ ] Story transitioned to READY_FOR_CODER

**Without these, story cannot move to CODER phase.**

---

## Escalation: When Design Blocks Implementation

**If CODER discovers design is infeasible mid-implementation:**

1. Do NOT rework design yourself
2. Create CHG (Change Request) ticket with:
   - Why design doesn't work (technical blocker, API mismatch, etc.)
   - Proposed alternative
   - Impact on timeline
3. LIBRARIAN decides: Finish with workaround OR rework design
4. If rework needed: New story (US-###-v2) created after inputs reworked

**Goal:** Prevent circular dependencies. Design is locked once CODER starts.

---

## Authority & Approval Flow

```
BA: Writes AC
  ↓
HFD: Designs UI (following CARRIER_DESIGN_SYSTEM.md)
  ↓
HFD Mobile Verification: Test on real device
  ↓
ARCHITECT: Reviews design for API feasibility
  ↓
LIBRARIAN: Approves design lock (no rework phase)
  ↓
CODER: Implements (no design changes allowed)
```

---

**Status:** LOCKED STANDARD  
**Date:** 2026-06-23  
**Next Review:** After US-730f completion
