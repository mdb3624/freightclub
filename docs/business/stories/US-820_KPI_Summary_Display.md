# US-820: KPI Summary Display

**Story ID:** US-820  
**Phase:** Phase 10 (Command Center)  
**Status:** DONE  
**Scope:** FULL_STACK  
**Effort:** 3 days  
**Priority:** P0

---

## User Story

**As a** Shipper (owner-operator or 3PL dispatcher managing loads)  
**I want to** see my business health metrics (active shipments, on-time %, cost/mile) at a glance on the dashboard  
**So that** I can monitor operational performance and make data-driven decisions about pricing and carrier relationships

---

## Acceptance Criteria

### AC-1: Active Shipments Count
```gherkin
Given a shipper with loads in CLAIMED or IN_TRANSIT status
When they view the KPI Summary card
Then they see a large numeric badge showing the count of active loads
  And the count is accurate (excludes DRAFT, DELIVERED, CANCELED statuses)
  And data isolation is enforced (only the shipper's own loads are counted)
  And if no active loads exist, the tile displays "No data"
```

### AC-2: On-Time Delivery Rate
```gherkin
Given a shipper with completed (DELIVERED) loads
When they view the KPI Summary card
Then they see a percentage badge showing on-time delivery rate
  And the calculation is: (loads_delivered_on_time / total_loads_delivered) * 100
  And the value is rounded to 1 decimal place (e.g., 94.5%)
  And "on-time" is defined as actual delivery time <= scheduled delivery time
  And data isolation is enforced
  And if no completed loads exist, the tile displays "No data"
```

### AC-3: Cost Per Mile
```gherkin
Given a shipper with completed (DELIVERED) loads
When they view the KPI Summary card
Then they see a cost/mile metric displaying average cost efficiency
  And the calculation is: Total Cost Base / Total Distance Miles
  And the value is rounded to 2 decimal places (e.g., $2.45)
  And data isolation is enforced
  And if no completed loads exist, the tile displays "No data"
```

### AC-4: Performance
```gherkin
Given the KPI Summary is displayed for any shipper
When the dashboard loads
Then the response time is < 2 seconds
  And the displayed data reflects load status updates within 5 minutes
```

### AC-5: KPI Tiles Always Visible
```gherkin
Given the Shipper Dashboard is displayed
When the page loads
Then the KPI tiles grid is always visible (never hidden or replaced by empty state)
  And each tile handles its own empty state ("No data" display)
  And this prepares the UI for upcoming load card feature in future releases
```

## Field Contract Table

| **UI Field** | **API Param** | **Business Logic Source** | **Type** | **Required** |
|---|---|---|---|---|
| Active Shipments count | `activeLoadCount` | Active loads (CLAIMED/IN_TRANSIT) | INTEGER | Yes |
| On-Time % | `onTimePercentage` | Completed loads (on-time vs total) | DECIMAL(5,2) | Yes |
| Cost/Mile | `costPerMile` | Completed loads (Avg cost/dist) | DECIMAL(10,2) | Yes |
| Empty state text per tile | N/A | Display "No data" when metric unavailable | STRING | Yes |

## Platform Foundation Mapping

### Existing Entities

- **Load**: Core entity for status, delivery times, and financial data
- **User/Tenant**: Used to scope data per shipper

### Domain Services

| **Service** | **Purpose** | **Input** | **Output** |
|---|---|---|---|
| **OnTimeRateCalculator** | Calculate shipper on-time delivery percentage | Completed Loads | `onTimePercentage` (0–100) |
| **CostEfficiencyCalculator** | Calculate average cost per mile | Completed Loads | `costPerMile` (dollars) |

### Implementation Notes

- KPI tiles are always rendered in a responsive grid layout (3-column on desktop, 1-column on mobile)
- Each tile independently handles null/zero values by displaying "No data" instead of a numeric value
- No empty state panel is shown; the KPI grid itself is the content container
- Backend endpoint `/api/v1/shipper/dashboard-summary` provides all three metrics in a single response
- Caching is applied per NFR-504: 2-minute TTL for dashboard data refresh

## BA Sign-Off

- [x] Story ID: US-820
- [x] ACs measurable and testable
- [x] Business logic defined (What, not How)
- [x] Platform Foundation Mapping complete
- [x] Scope: FULL_STACK
- [x] Implementation verified (DONE status)

**BA Status:** ✅ **APPROVED — DONE**

---

## Implementation Summary

**Completed:** 2026-06-09  
**REVIEWER Approval:** PASSED  
**Test Evidence:** E2E test suite passing (7.2s)  
**Screenshot Evidence:** `test-results/evidence/us-820-kpi-panel.png`

**Key Changes from Original Spec:**
- AC-5 (Empty State Handling): Revised to reflect implementation. Rather than showing a separate empty state panel, the KPI tiles remain always visible, with each tile displaying "No data" when no data is available. This design prepares the dashboard for future load card integration.
