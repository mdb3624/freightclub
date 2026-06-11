# ✅ RECEIPT OF EXECUTION MANDATE: US-823 Shipper Dashboard Implementation

**To:** CODER Role  
**From:** ARCHITECT + HFD (Authoritative Mandate)  
**Date:** 2026-06-11  
**Priority:** P0 | IMMEDIATE START  
**Status:** 🟢 EXECUTION AUTHORIZED

---

## Mandate Received & Acknowledged

**The architectural gate for US-823 is formally cleared.**

All stakeholders (Architect and HFD) have signed off on the structural requirements.

**CODER is hereby authorized to proceed with implementation immediately.**

---

## Binding Constraints (NO EXCEPTIONS)

### Constraint 1: Framework Mandate
**Requirement:**
- Utilize the ShipperPageLayout scaffold
- Strictly enforce the `.panel` class for all content containers (index.css §6.5)
- Zero custom panel styling; all styling inherited from System of Record

**Consequence of Violation:**
- PR rejected at REVIEWER gate (Hard Gate 3: Component Assembly)
- Requires rework before resubmission

**CODER Acknowledgment:** ☐ Understood and accepted

---

### Constraint 2: Grid Enforcement
**Requirement:**
- Implement the approved 8-4 grid split (Shipment Status `.slot-b` 8 cols, Action Zone `.slot-c` 4 cols)
- Custom CSS overrides for layout positioning are **strictly prohibited**
- No `style={{ gridColumn: ... }}`, no custom width assignments, no margin overrides

**Consequence of Violation:**
- PR rejected at REVIEWER gate (Hard Gate 8: Framework Integrity)
- Architecture considers it a precedent-setting violation
- Requires rework + escalation to LIBRARIAN for debt log entry

**CODER Acknowledgment:** ☐ Understood and accepted

---

### Constraint 3: Token Sweep (ABSOLUTE)
**Requirement:**
- Code must resolve exclusively to index.css CSS variables
- **ZERO hardcoded hex codes** (`#FFFFFF`, `#D0D0D0`, etc.)
- **ZERO hardcoded pixel values** (`24px`, `8px`, etc.)
- **ZERO inline colors** (`rgba(...)`, `rgb(...)`)
- All spacing, colors, borders, shadows, fonts come from variables

**Verification Method:**
```bash
grep -r "#[0-9A-Fa-f]" src/features/shipper/pages/
grep -r "[0-9]\+px" src/features/shipper/pages/
grep -r "rgba\|rgb(" src/features/shipper/pages/
# Must return ZERO results
```

**Consequence of Violation:**
- PR rejected at REVIEWER gate (Hard Gate 2: Token Compliance)
- Automatic failure; no merge possible
- Requires removal of all hardcoded values

**CODER Acknowledgment:** ☐ Understood and accepted

---

### Constraint 4: E2E Validation (MANDATORY)
**Requirement:**
- Capture 5 E2E screenshots per HFD spec § 8:
  1. Grid Alignment Desktop (1280px) — 8-4 split visible
  2. Grid Alignment Tablet (768px) — full-width stacking
  3. Grid Alignment Mobile (375px) — full-width stacking
  4. Loading Skeletons (1280px) — jitter prevention validated
  5. Empty States (1280px) — empty state UX
- Store in `test-results/evidence/` with `@US-823` tag
- Screenshots must match approved wireframe baseline (HFD Design Spec § 1)

**Consequence of Violation:**
- PR will NOT be reviewed until artifacts exist
- REVIEWER gate Hard Gate 1 requires visual proof
- No merge possible without E2E evidence

**CODER Acknowledgment:** ☐ Understood and accepted

---

## Execution Roadmap (BINDING)

**Timeline:** 2 days (2026-06-11 → 2026-06-13)

### Day 1: Scaffold, Layout, Jitter Prevention, Empty States
- [ ] Phase 1: Scaffold grid + import US-820/US-821
- [ ] Phase 2: Layout & styling (grid gap, padding, responsive breakpoints)
- [ ] Phase 3: Jitter prevention (skeleton fixed heights)
- [ ] Phase 4: Empty states (all 4 sections)

### Day 2: Accessibility, E2E Artifacts, Testing
- [ ] Phase 5: Accessibility (semantic roles, aria-labels, keyboard nav)
- [ ] Phase 6: E2E artifacts (5 screenshots) + unit tests + E2E tests
- [ ] Token sweep audit (pre-submission verification)
- [ ] REVIEWER gate checklist (self-audit before PR)

**Deviation from timeline requires escalation to LIBRARIAN.**

---

## REVIEWER Gate Clearance (8 HARD GATES)

**Your PR will be evaluated against these 8 gates. ALL MUST PASS.**

| Gate # | Criterion | CODER Must Deliver | Consequence if Failed |
|--------|-----------|---|---|
| 1 | Grid Alignment (Visual) | 1280px screenshot showing 8-4 split with no overflow/gaps | PR rejected, resubmit with evidence |
| 2 | Token Compliance (Code Audit) | grep returns ZERO hardcoded hex/px/rgba values | PR rejected, remove all hardcoded values |
| 3 | Component Assembly (Code Review) | All sections in `.panel` class, no custom overrides | PR rejected, refactor to use .panel |
| 4 | Jitter Prevention (E2E) | Skeleton height = final content height (screenshot proof) | PR rejected, adjust skeleton heights |
| 5 | Responsive Behavior (E2E) | 768px & 375px screenshots show correct stacking | PR rejected, fix responsive issues |
| 6 | Accessibility (Code + Audit) | axe-core PASS (WCAG AA), keyboard nav works | PR rejected, add missing ARIA labels |
| 7 | Test Coverage (JaCoCo) | ≥70% branch coverage, no skipped tests | PR rejected, increase coverage |
| 8 | Framework Integrity (Architectural) | No custom grid overrides, no hardcoded margins | PR rejected, revert framework violations |

**Expectation:** First-submission PASS on all 8 gates.

**CODER Acknowledgment:** ☐ Understood and accepted

---

## Authority & Sign-Off Chain

| Role | Document | Status | Signature |
|------|----------|--------|-----------|
| **ARCHITECT** | ARCH_REVIEW_US-823_Structural_Gate.md | ✅ Signed | 2026-06-11 |
| **HFD** | HFD_CONFIRMATION_US-823_GRID_REVISION.md | ✅ Confirmed | 2026-06-11 |
| **BA** | US-823_Shipper_Dashboard_Layout_Skeleton.md | ✅ READY_FOR_DESIGN | 2026-06-11 |
| **CODER** | EXECUTION_MANDATE_RECEIPT_US-823.md | ☐ Acknowledged | [THIS DOCUMENT] |

---

## CODER Execution Checklist

### Pre-Implementation
- [ ] Read IMPLEMENTATION_DIRECTIVE_US-823.md (all 4 constraints + 6 phases)
- [ ] Read HFD Design Spec (US-823_Shipper_Dashboard_Layout_Skeleton_Design_Spec.md)
- [ ] Read BA Story (US-823_Shipper_Dashboard_Layout_Skeleton.md)
- [ ] Review REVIEWER gate checklist (8 gates above)
- [ ] Verify index.css variables are available (run `npm run dev`, inspect DevTools)

### Implementation
- [ ] Phase 1: Scaffold (grid container, import US-820/821, create 4 placeholders)
- [ ] Phase 2: Styling (responsive, token-only, no hardcoded values)
- [ ] Phase 3: Jitter prevention (skeleton fixed heights per HFD spec)
- [ ] Phase 4: Empty states (all 4 sections with messaging)
- [ ] Phase 5: Accessibility (semantic roles, aria-labels, keyboard nav)
- [ ] Phase 6: E2E artifacts (5 screenshots + unit/E2E tests)

### Pre-Submission Verification
- [ ] Token sweep audit (grep for `#`, `px`, `rgba|rgb` → ZERO results)
- [ ] Grid validation (screenshot shows 8-4 split, 1280px desktop)
- [ ] Responsive validation (768px & 375px stack correctly)
- [ ] REVIEWER gate self-audit (all 8 gates green)
- [ ] Test coverage ≥70% (JaCoCo report)
- [ ] E2E artifacts in `test-results/evidence/` with `@US-823` tag

### Submission
- [ ] Create PR with title: "feat(US-823): Shipper Dashboard Layout Skeleton (Grid + Placeholders)"
- [ ] PR body references this mandate + IMPLEMENTATION_DIRECTIVE_US-823.md
- [ ] Attach E2E screenshots to PR (or link to test-results/evidence/)
- [ ] Include token sweep audit output (grep results showing ZERO hardcoded values)
- [ ] Submit for REVIEWER audit

---

## Success Criteria

**PR Merge Success = All 8 REVIEWER Gates PASS on First Submission**

- ✅ Grid visual validation (8-4 split confirmed in screenshot)
- ✅ Token compliance (zero hardcoded values detected)
- ✅ Framework integrity (no custom CSS overrides)
- ✅ Jitter prevention (skeleton heights validated)
- ✅ Responsive behavior (768px/375px stacking confirmed)
- ✅ Accessibility audit (WCAG AA pass)
- ✅ Test coverage (≥70% JaCoCo)
- ✅ AC traceability (all ACs satisfied + documented)

**Result:** PR merged, US-823 marked DONE, US-824/825/826 unblocked for parallel implementation.

---

## Escalation Protocol

**If you encounter an issue, escalate immediately:**

| Issue | Escalate To | Action |
|-------|---|---|
| Unclear constraint interpretation | ARCHITECT | Request clarification before proceeding |
| HFD spec conflicts with CODER implementation | LIBRARIAN | Create CHG ticket; do not work around |
| Framework prevents implementation of AC | LIBRARIAN | Create CHG ticket; escalate for decision |
| Test environment blocker (coverage, E2E) | LIBRARIAN | Report blocker; await infrastructure fix |
| Timeline pressure / impossible deadline | LIBRARIAN | Request timeline adjustment; document reason |

**NO WORKAROUNDS. Escalate constraints, not constraints.**

---

## Communication & Status Updates

**Daily Status:** Post a one-line update in session context (e.g., "Phase 2 complete, moving to Phase 3 jitter prevention")

**Blockers:** Escalate immediately; do not work around constraints.

**Completion:** PR submitted → REVIEWER audits → Results in next session.

---

## Final Authority Statement

**This execution mandate is BINDING.**

You are authorized to implement US-823 under the constraints specified in:
1. IMPLEMENTATION_DIRECTIVE_US-823.md
2. ARCH_REVIEW_US-823_Structural_Gate.md (signed)
3. HFD_CONFIRMATION_US-823_GRID_REVISION.md (confirmed)

The 8-point REVIEWER gate will be applied as written. Framework constraints are non-negotiable. First-submission PASS is expected.

**Execute with precision. Clarity is absolute. No ambiguity exists.**

---

## CODER Sign-Off

**I acknowledge receipt of this execution mandate and accept all binding constraints.**

| Constraint | Acknowledged |
|-----------|---|
| Framework Mandate (.panel class + ShipperPageLayout) | ☐ |
| Grid Enforcement (8-4 split, no custom overrides) | ☐ |
| Token Sweep (zero hardcoded values) | ☐ |
| E2E Validation (5 screenshot artifacts) | ☐ |
| REVIEWER Gate (8 hard gates, all must pass) | ☐ |
| 2-Day Timeline (2026-06-11 → 2026-06-13) | ☐ |
| First-Submission PASS expectation | ☐ |
| Escalation protocol (no workarounds) | ☐ |

**By proceeding with implementation, I confirm that I have read, understood, and accept these binding constraints without exception.**

---

**Document Generated:** 2026-06-11  
**Authority:** ARCHITECT + HFD (Execution Mandate)  
**Status:** 🟢 READY FOR IMMEDIATE IMPLEMENTATION

**Proceed. Build with precision. Pass the gate on the first submission.**
