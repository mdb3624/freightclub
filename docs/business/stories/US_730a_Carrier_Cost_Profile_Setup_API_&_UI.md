# US-730a: Cost Profile Setup API & UI

**Story ID:** US-730a  
**Epic:** US-730 Carrier Dashboard MVP  
**Phase:** Phase 7 (Carrier MVP)  
**Status:** READY_FOR_DESIGN  
**Scope:** FULL_STACK  
**Effort:** 3 days  
**Priority:** P1  
**Owner:** CODER  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-64  

---

## User Story

As an owner-operator, I want to enter my fixed costs, variable costs, and fuel costs so the system can calculate my minimum profitable RPM and filter loads accordingly.

---

## Acceptance Criteria

### AC-1: CODER
```
CODER creates Cost Profile endpoints: POST /api/v1/carriers/{carrierId}/cost-profiles, PUT /api/v1/carriers/{carrierId}/cost-profiles/{profileId}.
```
### AC-2: Accept
```
Accept inputs: fixed_costs_per_day, variable_costs_per_mile, fuel_costs_per_gallon.
```
### AC-3: Calculate
```
Calculate and return: minimum_rpm = (fixed_costs_per_day / 500_miles) + variable_costs_per_mile + fuel_surcharge.
```
### AC-4: Persist
```
Persist to carrier_cost_profiles table with tenant isolation (RLS).
```
### AC-5: Frontend
```
Frontend form component: Mobile-optimized input fields, real-time RPM calculation display, save button.
```
### AC-6: Form
```
Form accessible on mobile with ≥48px buttons, dark theme, vertical layout.
```
### AC-7: Tests:
```
Tests: ≥70% coverage (cost calculation logic + API + form validation).
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
