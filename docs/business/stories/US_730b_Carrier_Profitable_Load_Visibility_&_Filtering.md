# US-730b: Profitable Load Visibility & Filtering

**Story ID:** US-730b  
**Epic:** US-730 Carrier Dashboard MVP  
**Phase:** Phase 7 (Carrier MVP)  
**Status:** READY_FOR_DESIGN  
**Scope:** FULL_STACK  
**Effort:** 4 days  
**Priority:** P1  
**Owner:** CODER  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-65  

---

## User Story

As an owner-operator, I want the load board to filter loads by my minimum RPM and show profitability badges so I only see loads that will make me money.

---

## Acceptance Criteria

### AC-1: CODER
```
CODER adds RPM filtering to LoadService.searchLoads(): filter loads where (load.rate / load.miles) >= carrier.min_rpm.
```
### AC-2: Calculate
```
Calculate profitability score: (load.rate / load.miles) / carrier.min_rpm * 100. Score determines badge color.
```
### AC-3: Badge
```
Badge colors: GREEN (≥120%), YELLOW (100-120%), RED (<100%). Display on load card.
```
### AC-4: Default
```
Default view: Show only GREEN + YELLOW. Checkbox to toggle RED visibility.
```
### AC-5: Load
```
Load card components: Load details + profitability badge + claim button.
```
### AC-6: Mobile-optimized
```
Mobile-optimized card layout (full width on iPhone), dark theme, large tap targets.
```
### AC-7: Tests:
```
Tests: ≥70% coverage (RPM calculation + filtering logic + badge assignment).
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

**Status:** READY_FOR_DESIGN — Awaiting ARCHITECT API spec before CODER kickoff

**Blocked by:** US-730-0 (HFD must design dashboard structure first)
