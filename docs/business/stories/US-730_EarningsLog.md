# US-730: Earnings Log (Owner/Operator)

**Epic:** Phase 7b — Financial Intelligence  
**Status:** AC FINALIZED (Ready for Implementation)  
**Dependencies:** US-702 (Preferred Lanes ✅ design), US-701 (CarrierCostProfile ✅)  
**Estimated Points:** 21 (complex financial aggregation)

---

## User Story

As an **owner/operator**, I want to track **earnings per load** (revenue minus all costs), so that I can **understand my actual profitability and identify which lanes/shippers are most valuable**.

---

## Acceptance Criteria

### AC 1: Earnings Record Creation
**Given** I claim a load and complete delivery  
**When** the delivery is marked complete (proof of delivery uploaded)  
**Then** an EarningsLogEntry is automatically created with:
- carrierId, loadId, shipperId, laneId (if matched)
- grossRevenue = load.payRate * load.estimatedMiles
- fuelCost = (load.estimatedMiles / myProfile.milesPerGallon) * myProfile.fuelCostPerGallon
- maintenanceCost = load.estimatedMiles * myProfile.maintenanceCostPerMile
- fixedCostAllocation = (myProfile.monthlyFixedCosts / myProfile.monthlyMilesTarget) * load.estimatedMiles
- netEarnings = grossRevenue - (fuelCost + maintenanceCost + fixedCostAllocation)
- profitMarginPercent = (netEarnings / grossRevenue) * 100
- completedAt, createdAt

**Requirement:** EarningsLogEntry entity with above fields (all BigDecimal except carrieId, loadId, shipperId, laneId)

**Related [CRITICAL]:** OO-CRIT-8 (Earnings per load)

---

### AC 2: Earnings List API
**Given** I am logged in as an owner/operator  
**When** I call `GET /api/v2/carriers/{id}/earnings?period=MONTH&year=2026&month=4`  
**Then** I receive:
```json
{
  "period": "2026-04",
  "entries": [
    {
      "loadId": "load-123",
      "shipperId": "shipper-abc",
      "completedAt": "2026-04-20T14:32:00Z",
      "grossRevenue": 850.00,
      "totalCosts": 325.50,
      "netEarnings": 524.50,
      "profitMarginPercent": 61.7,
      "laneId": "lane-xyz"
    }
  ],
  "periodTotals": {
    "loadCount": 12,
    "grossRevenue": 10200.00,
    "totalCosts": 3850.00,
    "netEarnings": 6350.00,
    "averageProfitMargin": 62.2
  }
}
```

**Requirement:** EarningsController.GET /api/v2/carriers/{id}/earnings with query params (period, year, month, shippeId filter optional)

---

### AC 3: P&L Report (Derived from Earnings Log)
**Given** I view earnings summary for a period  
**When** the system generates a P&L report  
**Then** I see:
- **Revenue:** Total paid by shippers
- **Cost Breakdown:** Fuel, Maintenance, Fixed costs (allocated)
- **Net Profit:** Revenue - all costs
- **Key Metrics:**
  - Average earnings per load
  - Most profitable lane
  - Most profitable shipper
  - Cost per mile (actual)
  - Average margin %

**Requirement:** ProfitAndLossReport record (derived from EarningsLogEntry aggregation)

**Related AC:** US-731 (P&L Report — detailed view)

---

### AC 4: Multi-Tenant Earnings Isolation
**Given** I am carrier ABC  
**When** another carrier DEF has earnings in the system  
**Then** I can only see MY earnings (via RLS policy)

**Requirement:** PostgreSQL RLS policy on earnings_log: `tenant_id = CURRENT_SETTING('app.current_tenant_id')`

**Related [CRITICAL]:** ARCH-001 (zero-parameter isolation)

---

### AC 5: Earnings Soft-Delete & Corrections
**Given** I want to correct an earnings entry (e.g., load was cancelled after delivery mark)  
**When** I request deletion  
**Then:**
- The entry is marked `deleted_at = NOW()` (soft-delete)
- A correcting entry is created (adjusts totals downward)
- Historical audit trail is preserved

**Requirement:** EarningsLogEntry includes deleted_at; system creates negative entry for corrections

---

### AC 6: Earnings Caching (NFR-504)
**Given** I frequently check my earnings dashboard  
**When** I load the earnings list API  
**Then:**
- Results are cached for 1h (TTL)
- Cache is invalidated on: LoadCompleted, EarningsEntryCreated events
- No stale data older than 5 minutes (immediate invalidation on new load completion)

**Requirement:** @Cacheable on EarningsService.getEarningsByPeriod() with event-driven invalidation

---

## Definition of Done

- [x] EarningsLogEntry entity with all cost fields
- [x] EarningsLogRepository with RLS policy
- [x] EarningsService with period aggregation + P&L calculation
- [x] EarningsController.GET /api/v2/carriers/{id}/earnings
- [x] ProfitAndLossReport record (summary view)
- [x] Integration tests: 12+ cases (CRUD, aggregation, isolation, soft-delete, caching)
- [x] 80% JaCoCo coverage on cost calculations
- [x] No tenantId parameters in service methods (ARCH-001)
- [x] Cache results (1h TTL) with event-driven invalidation
- [x] Earnings entry auto-created on load delivery (via LoadCompleted event)

---

## Technical Notes

**Earnings Calculation (Cost Accounting):**
```
Gross Revenue = payRate × estimatedMiles

Fixed Cost Allocation = (monthlyFixedCosts / monthlyMilesTarget) × estimatedMiles
Fuel Cost = (estimatedMiles / milesPerGallon) × fuelCostPerGallon
Maintenance Cost = estimatedMiles × maintenanceCostPerMile

Total Costs = Fixed + Fuel + Maintenance

Net Earnings = Gross Revenue - Total Costs
Profit Margin % = (Net Earnings / Gross Revenue) × 100
```

**Service Signature (ARCH-001 compliant):**
```java
public List<EarningsLogEntry> getEarningsByPeriod(String carrierId, YearMonth period)
// No tenantId parameter — resolved via TenantContextHolder
```

**Event-Driven Trigger:**
```
When: LoadCompleted event published
Action: EarningsService.createEarningsEntry(load)
Context: carrierId, shipperId, laneId (if US-702 matched) populated from load
```

**Cache Strategy (NFR-504):**
```
Cache key: "earnings:{carrierId}:{periodYYYYMM}"
TTL: 1h
Invalidate on: LoadCompleted event
```

---

## Story Map Links

- **Parent:** Phase 7b (Financial Intelligence)
- **Unblocks:** US-731 (P&L Report), US-732 (IFTA Mileage), US-736 (Tax Export)
- **Related:** US-701 (Cost Profile), US-702 (Lane matching for earnings attribution)
- **Dependency:** US-705 (Min RPM — used in profitability assessment)
