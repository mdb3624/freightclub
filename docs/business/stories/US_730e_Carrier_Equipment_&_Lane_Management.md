# US-730e: Equipment & Lane Management

**Story ID:** US-730e  
**Epic:** US-730 Carrier Dashboard MVP  
**Phase:** Phase 7 (Carrier MVP)  
**Status:** READY_FOR_DESIGN  
**Scope:** FULL_STACK  
**Effort:** 3 days  
**Priority:** P1  
**Owner:** CODER  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-68  

---

## User Story

As an owner-operator, I want to specify my equipment types, capacity, and preferred lanes so the platform can recommend appropriate loads and I can manage my availability.

---

## Acceptance Criteria

### AC-1: CODER
```
CODER creates Equipment API: POST/PUT /api/v1/carriers/{carrierId}/equipment. Fields: equipment_type (dry_van, flatbed, etc.), capacity_lbs, dimensions_lxwxh.
```
### AC-2: Create
```
Create Lane Preference API: POST/PUT /api/v1/carriers/{carrierId}/lanes. Fields: origin_region, destination_region, equipment_type_id, preferred (true/false).
```
### AC-3: Create
```
Create Availability API: POST/PUT /api/v1/carriers/{carrierId}/availability. Fields: day_of_week, hours_available, is_available.
```
### AC-4: Frontend:
```
Frontend: Equipment list view + add/edit modal. Lanes list with region mapping. Availability picker (days/hours).
```
### AC-5: All
```
All modals mobile-optimized: Dark theme, ≥48px buttons, tap-to-select, inline edit.
```
### AC-6: Persist
```
Persist all to database with carrier tenant isolation (RLS).
```
### AC-7: Tests:
```
Tests: ≥70% coverage (CRUD operations, validation, RLS enforcement).
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
