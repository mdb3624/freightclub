# US-730c: Performance Visibility Dashboard Metrics

**Story ID:** US-730c  
**Epic:** US-730 Carrier Dashboard MVP  
**Phase:** Phase 7 (Carrier MVP)  
**Status:** READY_FOR_DESIGN  
**Scope:** FULL_STACK  
**Effort:** 3 days  
**Priority:** P1  
**Owner:** CODER  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-66  

---

## User Story

As an owner-operator, I want to see my performance metrics (acceptance %, on-time %, completion %, payments logged %) on my dashboard so I understand my reputation and payment tracking.

---

## Acceptance Criteria

### AC-1: CODER
```
CODER creates performance aggregation endpoint: GET /api/v1/carriers/{carrierId}/metrics returns: { acceptance_pct, on_time_pct, completion_rate, payments_logged_pct }.
```
### AC-2: Acceptance
```
Acceptance %: COUNT(claims_accepted) / COUNT(invitations_received) * 100.
```
### AC-3: On-Time
```
On-Time %: COUNT(loads delivered on-time) / COUNT(loads delivered) * 100.
```
### AC-4: Completion
```
Completion Rate: COUNT(completed) / COUNT(claimed). Display as count + percentage.
```
### AC-5: Payments
```
Payments Logged %: COUNT(acknowledged_payments) / COUNT(delivered_loads) * 100.
```
### AC-6: Frontend
```
Frontend metric badge component: 4 large cards (iPhone full width), color coding (green/yellow/red), large readable text (dark theme).
```
### AC-7: Tests:
```
Tests: ≥70% coverage (metric calculations, edge cases for zero counts).
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
