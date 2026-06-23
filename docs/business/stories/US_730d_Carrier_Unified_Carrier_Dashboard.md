# US-730d: Unified Carrier Dashboard

**Story ID:** US-730d  
**Epic:** US-730 Carrier Dashboard MVP  
**Phase:** Phase 7 (Carrier MVP)  
**Status:** READY_FOR_DESIGN  
**Scope:** FULL_STACK  
**Effort:** 4 days  
**Priority:** P1  
**Owner:** CODER  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-67  

---

## User Story

As an owner-operator, I want a single dashboard page showing my hero load, performance metrics, available profitable loads, and earnings acknowledgments so I can manage my operations in one place.

---

## Acceptance Criteria

### AC-1: Dashboard
```
Dashboard layout (vertical stack): (1) Hero load section (top pick for O/O), (2) Performance metrics (4 badges), (3) Available loads list (filtered by RPM), (4) Earnings log section (MVP: just dates).
```
### AC-2: Hero
```
Hero load: Highest profit match OR closest deadline (configurable). Show full details + profitability badge + claim button.
```
### AC-3: Available
```
Available loads: List view, paginated (10 per page), sort by profit + deadline.
```
### AC-4: Earnings
```
Earnings log (MVP): Display list of acknowledged payment dates. No calculations. Format: "Payment logged on 2026-06-23".
```
### AC-5: Mobile-first:
```
Mobile-first: Full-width cards, dark theme, ≥48px buttons, vertical scroll only.
```
### AC-6: Navigation:
```
Navigation: Dashboard is primary view. Modals for cost profile setup, equipment management (no new pages).
```
### AC-7: Performance:
```
Performance: Dashboard loads <2s on 4G LTE (all hero load + metrics + first 10 loads in one API call).
```
### AC-8: Tests:
```
Tests: ≥70% coverage (dashboard aggregation logic, load sorting, layout edge cases).
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
