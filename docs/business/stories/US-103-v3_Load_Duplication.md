# US-103-v3: Load Duplication Feature

**Story ID:** US-103-v3  
**Phase:** Phase 11+ (Backlog)  
**Status:** BACKLOG  
**Scope:** Enhancement to US-103-v2  
**Effort:** 2 days  
**Priority:** P2

---

## User Story

**As a** Shipper (high-volume dispatcher)  
**I want to** duplicate an existing load with "Copy to New"  
**So that** I can quickly create similar loads for recurring lanes without re-entering all cargo and equipment details

---

## Acceptance Criteria

### AC-1: Duplicate Load Button

```gherkin
Given I'm viewing an existing load (detail page or load history)
When I click "Copy to New" button
Then a new load form opens with:
  • All cargo details pre-filled (commodity, weight, dimensions)
  • All equipment details pre-filled (equipment type, pay rate, payment terms)
  • Special instructions copied
  • Special handling notes copied
  But date/time fields are EMPTY (shipper must enter new dates)
  And I'm redirected to the form to finalize dates and publish
```

### AC-2: Create Load Confirmation

```gherkin
Given a duplicated load form is open
When I fill in the new dates and click "Create Load"
Then the new load is created and published
  And I'm returned to the dashboard
  And both the original and duplicated load appear in Shipment Panel
```

---

## Business Value

- Reduces load creation time from 2+ minutes to 30 seconds for recurring lanes
- Eliminates re-entry of commodity, equipment, dimensions
- Improves accuracy (no manual copy/paste errors)
- Ideal for dispatchers handling 20+ loads/day on same routes

---

## Dependencies

- Depends On: US-103-v2 (Load Creation Redesign)
- Blocks: None (enhancement only)

---

## BA Status

**Status:** ✅ **BACKLOG**  
**Priority for Phase 11+**
