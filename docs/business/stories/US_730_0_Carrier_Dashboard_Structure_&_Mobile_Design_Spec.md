# US-730-0: Dashboard Structure & Mobile Design Spec

**Story ID:** US-730-0  
**Epic:** US-730 Carrier Dashboard MVP  
**Phase:** Phase 7 (Carrier MVP)  
**Status:** READY_FOR_DESIGN  
**Scope:** FRONTEND  
**Effort:** 3 days  
**Priority:** P1  
**Owner:** HFD  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-63  

---

## User Story

As an HFD architect, I want to design the carrier dashboard layout with mobile-first specifications so that owner-operators can efficiently manage their operations from iPhones in the truck cab.

---

## Acceptance Criteria

### AC-1: Design
```
Design dashboard structure: hero load section, 4 metric badges, available loads list, action buttons. All in vertical stack (no side-by-side columns).
```
### AC-2: Specify
```
Specify mobile-first constraints: iPhone SE (375-390px), dark theme, ≥48px touch targets, tap-only actions (no swipe), <2s load on 4G LTE.
```
### AC-3: Create
```
Create responsive specs for tablet/desktop (optional). Primary design target is iPhone.
```
### AC-4: Document
```
Document component hierarchy: Dashboard → Sections → Cards → Sub-components.
```
### AC-5: Provide
```
Provide WCAG AAA contrast specs for dark theme. Ensure readability in direct sunlight.
```
### AC-6: Create
```
Create Figma/design mockups for internal review before implementation kickoff.
```

---

## Design Constraints (Mobile-First MANDATORY)

- **Device:** iPhone SE/12/13 (375-390px width)
- **Theme:** Dark background (truck cab sunlight readability)
- **Touch Targets:** All buttons ≥48px (glove-friendly)
- **Layout:** Vertical stack only (no side-by-side)
- **Performance:** <2 seconds load on 4G LTE
- **Actions:** Tap only (no swipe, no complex gestures)

---

## Technical Notes

- Part of US-730 Carrier Dashboard MVP (Phase 7)
- Supports Owner-Operator profitability + reputation tracking
- Mobile-first design required before implementation starts
- All features must work with gloved hands on iPhone in truck cab

---

## Success Metrics

- ✅ Acceptance criteria met on actual iPhone device
- ✅ WCAG AAA contrast verified in direct sunlight
- ✅ Touch targets tested with gloved hands (≥48px)
- ✅ Load time <2 seconds on 4G LTE
- ✅ Code coverage ≥70% (JaCoCo)
- ✅ All tests passing

---

**Status:** READY_FOR_DESIGN — Awaiting HFD design mockups before CODER kickoff

**Blocked by:** US-730-0 (HFD must design dashboard structure first)
