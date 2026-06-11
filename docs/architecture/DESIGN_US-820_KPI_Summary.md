# US-820: KPI Summary Display — Technical Design

**Story:** US-820 KPI Summary Display  
**Status:** ARCH ACCEPTED & LOCKED  
**Design Date:** 2026-06-11  

---

## 🔍 Input Acceptance Gate: PASSED

- ✅ Unique ID (US-820)
- ✅ AC count: 5 (measurable, testable)
- ✅ Edge cases: Empty state, data isolation
- ✅ No implementation details
- ✅ Scope fits 3 days CODER work

**VERDICT:** Story locked. Design begins.

---

## 📊 Domain Model

### Entities & Services

```
┌─────────────────────────────────────────────┐
│         Load (existing entity)              │
├─────────────────────────────────────────────┤
│ id: UUID                                    │
│ tenant_id: UUID (RLS key)                   │
│ status: DRAFT|OPEN|CLAIMED|IN_TRANSIT|...  │
│ scheduled_delivery_at: TIMESTAMPTZ          │
│ actual_delivery_at: TIMESTAMPTZ (nullable)  │
│ cost_base: DECIMAL(10,2)                    │
│ distance_miles: DECIMAL(8,2)                │
│ deleted_at: TIMESTAMPTZ (soft delete)       │
└─────────────────────────────────────────────┘
         ↓
    ┌────────────────────────────────────────┐
    │  KPI Summary DTO (computed, not stored) │
    ├────────────────────────────────────────┤
    │ activeLoadCount: INTEGER                │
    │ onTimePercentage: DECIMAL(5,1)          │
    │ costPerMile: DECIMAL(8,2)               │
    └────────────────────────────────────────┘
         ↑ ↑
         └─┴─ Calculated by domain services
```

### Domain Services (NEW)

**1. OnTimeRateCalculator**
```
Input: Shipper tenant_id, List<Load>
Logic:
  - Filter loads with status = DELIVERED
  - For each load: actual_delivery_at <= scheduled_delivery_at?
  - Rate = (on_time_count / total_delivered_count) * 100
  - Round to 1 decimal place
  - Handle: 0 delivered loads → null (empty state)
Output: DECIMAL(5,1) or null
```

**2. CostEfficiencyCalculator**
```
Input: Shipper tenant_id, List<Load>
Logic:
  - Filter loads with status = DELIVERED
  - Sum all cost_base values
  - Sum all distance_miles values
  - Cost per mile = total_cost / total_distance
  - Round to 2 decimal places
  - Handle: 0 distance → null (edge case, shouldn't happen)
Output: DECIMAL(8,2) or null
```

---

## 🗄️ Database Schema

No new tables required. KPIs are **computed in-memory** from existing Load table.

**Used columns (existing):**
```sql
loads.id
loads.tenant_id
loads.status
loads.scheduled_delivery_at
loads.actual_delivery_at
loads.cost_base
loads.distance_miles
loads.deleted_at
```

**Query strategy:**
```sql
SELECT id, status, scheduled_delivery_at, actual_delivery_at, cost_base, distance_miles
FROM loads
WHERE tenant_id = ?
  AND deleted_at IS NULL
ORDER BY updated_at DESC;
```

RLS already enforced via `TenantContextHolder` at service layer.

---

## 🔌 API Contract

### Endpoint
```
GET /api/v1/shipper/dashboard/kpi-summary
```

### Request
```json
{
  // No parameters — uses authenticated tenant_id from JWT
}
```

### Response (200 OK)
```json
{
  "activeLoadCount": 12,
  "onTimePercentage": 94.5,
  "costPerMile": 2.45,
  "isEmpty": false
}
```

### Response (empty state, 200 OK)
```json
{
  "activeLoadCount": 0,
  "onTimePercentage": null,
  "costPerMile": null,
  "isEmpty": true
}
```

### Response Error (401, 403)
- 401 Unauthorized: No valid JWT
- 403 Forbidden: Tenant mismatch

---

## 🎨 Frontend Component Structure

```
ShipperDashboard
└── ShipperPageLayout
    └── slotA
        ├── View Tabs (Active/All)
        ├── Action Buttons (Preferred Carriers, + Post Load)
        └── KPISummaryPanel (NEW)
            ├── LoadingSkeletons
            └── KPITiles
                ├── ActiveShipmentsTile
                ├── OnTimePercentageTile
                └── CostPerMileTile
            └── EmptyState (conditional)
```

**Component: KPISummaryPanel**
- Fetches `/api/v1/shipper/dashboard/kpi-summary`
- Displays 3 metric tiles in a grid
- Shows empty state if `isEmpty === true`
- Handles loading state with skeleton
- Performance: < 2 seconds (per AC-4)

---

## 📋 Field Contract Table (COMPLETED)

| UI Field | API Param | DB Column | Type | Required |
|---|---|---|---|---|
| Active Shipments Count | `activeLoadCount` | `loads.status` (filtered) | INTEGER | Yes |
| On-Time % | `onTimePercentage` | `loads.actual_delivery_at`, `loads.scheduled_delivery_at` | DECIMAL(5,1) | No (null if no delivered loads) |
| Cost / Mile | `costPerMile` | `loads.cost_base`, `loads.distance_miles` | DECIMAL(8,2) | No (null if no delivered loads) |
| Empty State Message | N/A | N/A | N/A | N/A |
| CTA Button ("Create Your First Load") | N/A | N/A | N/A | N/A |

---

## ✅ Validation Rules

### Active Load Count
- Include: `status IN (CLAIMED, IN_TRANSIT)`
- Exclude: DRAFT, OPEN (not yet claimed), DELIVERED, CANCELLED
- Scope: Current shipper only (`tenant_id` match)
- Soft delete: Exclude `deleted_at IS NOT NULL`

### On-Time Rate
- Include: `status = DELIVERED`
- Metric: `(count WHERE actual_delivery_at <= scheduled_delivery_at) / count(*)` × 100
- Precision: 1 decimal place
- Edge case: 0 delivered loads → return `null`
- Soft delete: Exclude `deleted_at IS NOT NULL`

### Cost Per Mile
- Include: `status = DELIVERED`
- Metric: `sum(cost_base) / sum(distance_miles)`
- Precision: 2 decimal places
- Edge case: 0 distance miles → return `null` (shouldn't happen in prod)
- Soft delete: Exclude `deleted_at IS NOT NULL`

---

## 🔄 Data Freshness

**Requirement (AC-4):** Data reflects updates within 5 minutes.

**Strategy:**
- Endpoint has **no caching** (or cache busting on load updates)
- Loads are fetched fresh on each request
- Performance target: < 2 seconds

**Index requirement:**
```sql
CREATE INDEX idx_loads_tenant_deleted_status 
ON loads(tenant_id, deleted_at, status);
```

---

## 🚀 Handoff to CODER

### Acceptance Criteria Mapping

| AC | Component | Implementation |
|---|---|---|
| AC-1: Active Shipments | Domain Service | Count CLAIMED + IN_TRANSIT loads |
| AC-2: On-Time % | OnTimeRateCalculator | Deliver on-time filter + % calc |
| AC-3: Cost / Mile | CostEfficiencyCalculator | Sum costs / sum distance |
| AC-4: Performance | Endpoint + Index | < 2s response, fresh data |
| AC-5: Empty State | Frontend | Conditional UI when `isEmpty=true` |

### Required Implementations

**Backend:**
1. `OnTimeRateCalculator` domain service
2. `CostEfficiencyCalculator` domain service
3. `KPISummaryService` (orchestrator)
4. `KPISummaryController` endpoint
5. Database index on `loads(tenant_id, deleted_at, status)`
6. Unit tests for both calculators
7. Integration tests for endpoint

**Frontend:**
1. `KPISummaryPanel.tsx` component
2. `useKPISummary()` React Query hook
3. `KPITile.tsx` (reusable tile component)
4. Empty state conditional rendering
5. Loading skeleton
6. Tests (unit + E2E via Playwright)

---

## 🔒 Security & Multi-Tenancy

**Data Isolation:**
- All queries scoped to authenticated `tenant_id` via `TenantContextHolder`
- RLS policy enforces tenant filtering at DB layer (defense in depth)
- No cross-tenant data leakage possible

**Authentication:**
- Endpoint requires valid JWT (`@Authenticated`)
- Shipper role validation in controller (`@PermitAll` NOT used)

---

## 📝 ARCH Sign-Off

- ✅ Input gate passed
- ✅ Domain model designed
- ✅ Services identified (non-duplicate)
- ✅ Schema & RLS validated
- ✅ Field Contract Table completed
- ✅ Validation rules documented
- ✅ Ready for CODER handoff

**ARCH Status:** ✅ **DESIGN COMPLETE — READY FOR CODER**

---

## Next: HFD Review (if UI_ONLY scope)

**Status:** FULL_STACK (not UI_ONLY) — HFD review optional but recommended for KPI tile design consistency.

---

*Design locked: 2026-06-11. No mid-implementation changes without CHG-### escalation.*
