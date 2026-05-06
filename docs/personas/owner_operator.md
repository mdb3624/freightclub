# Owner/Operator Persona
**Version:** 1.0  
**Last Updated:** 2026-04-27  
**Status:** Phase 7 Foundation  

---

## 📋 Persona Overview

An **Owner/Operator (O/O)** is an independent trucker who owns and operates 1-4 trucks, managing their own business. They are cost-conscious, data-driven, and demand maximum control over their load selection and profitability.

---

## 🔴 [CRITICAL] Validation Flags (Phase 7)

| Flag | Requirement | Source | Validation Rule | Phase | Status |
|------|-------------|--------|-----------------|-------|--------|
| **OO-CRIT-1** | 70-hour / 8-day HOS cycle tracking | 97–115 | Hours worked must not exceed 70 in rolling 8-day window | 9 (DEFERRED) | ⏳ Deferred |
| **OO-CRIT-2** | Equipment type, dimensions, capacity | 39–45 | Must define: FLATBED / REEFER / TANKER + weight capacity (lbs) + height (in) | 7 | ✅ US-701 |
| **OO-CRIT-3** | Cost profile / CPM formula | 42–49, 160–173 | Must calculate: Fixed CPM, Fuel CPM, Variable CPM, Total CPM, Minimum RPM | 7 | 🔴 US-702/730 |
| **OO-CRIT-4** | Load board RPM filtering & sorting | 55–75 | Load board filters by: min_rpm >= carrier.calculateMinimumRPM() | 7 | 🔴 US-705 |
| **OO-CRIT-5** | Preferred lanes & availability | 44, 58, 76–92 | Must store: origin region, destination region, min rate, frequency | 7 | ✅ US-702/703 |
| **OO-CRIT-6** | One Active Load constraint | 90–95 | Owner/operator can claim only 1 CLAIMED load at a time | 7 | 🔴 LoadService |
| **OO-CRIT-7** | Equipment inventory visibility | 39–45 | Public profile shows: equipment types, capacity (without sensitive costs) | 7 | ✅ US-710 |
| **OO-CRIT-8** | Performance reputation system | 138–155 | Shipper sees: on-time delivery %, equipment condition rating | 7 | 🔴 US-710 |

---

## 📊 Core Domain Fields (Phase 7)

### Equipment Profile (Aggregate Root)
**Entity:** `CarrierEquipment`  
**Scope:** All equipment units owned by O/O

| Field | Type | Constraints | Validation |
|-------|------|-------------|-----------|
| `id` | VARCHAR(36) UUID | PK, NOT NULL | UUID4 unique across tenant |
| `tenantId` | VARCHAR(36) UUID | NOT NULL, FK | Implicit via TenantContextHolder |
| `truckerId` | VARCHAR(36) UUID | NOT NULL, FK → User | Must exist and be O/O role |
| `equipmentType` | ENUM | NOT NULL | FLATBED, REEFER, TANKER, STEP_DECK, POWER_ONLY |
| `capacityLbs` | BIGINT | NOT NULL | > 0; max 80,000 (legal limit) |
| `heightInches` | INT | NOT NULL | >= 8'6" (102 in); <= 13'6" (162 in) |
| `lengthFeet` | DECIMAL(4,1) | NULLABLE | 20–53 ft |
| `widthInches` | INT | NULLABLE | 96–102 in (standard) |
| `lastInspectionDate` | DATE | NULLABLE | Must be within 24 months |
| `conditionRating` | INT | NULLABLE | 1–5 scale; 0 = not yet rated |
| `status` | ENUM | NOT NULL | ACTIVE, INACTIVE, MAINTENANCE |
| `createdAt` | TIMESTAMPTZ | NOT NULL | Immutable |
| `deletedAt` | TIMESTAMPTZ | NULLABLE | Soft delete |

**Validation Rules:**
- `capacityLbs` must be > 0 and reasonable (max 80,000 lbs)
- `equipmentType` is predefined enum; no free text
- `heightInches` ≥ 102 and ≤ 162 (legal clearances)
- `lastInspectionDate` optional; if set, must be recent (≤ 24 months old)
- Cannot delete equipment that has active CLAIMED loads

---

### Cost Profile (Value Object / Separate Table)
**Entity:** `CarrierCostProfile`  
**Scope:** Operating costs for calculating minimum profitable rate

| Field | Type | Constraints | Validation |
|-------|------|-------------|-----------|
| `id` | VARCHAR(36) UUID | PK, NOT NULL | UUID4 |
| `tenantId` | VARCHAR(36) UUID | NOT NULL, FK | Implicit via TenantContextHolder |
| `truckerId` | VARCHAR(36) UUID | NOT NULL, FK | Must own equipment |
| `monthlyFixedCosts` | DECIMAL(10,2) | NOT NULL | > 0; e.g., $2,500 (insurance, permits) |
| `fuelCostPerGallon` | DECIMAL(5,2) | NOT NULL | > 0; e.g., $3.50 |
| `milesPerGallon` | DECIMAL(4,1) | NOT NULL | >= 3.0; <= 12.0 |
| `maintenanceCostPerMile` | DECIMAL(4,2) | NOT NULL | > 0; e.g., $0.15 |
| `monthlyMilesTarget` | INT | NOT NULL | > 0; e.g., 10,000 |
| `targetMarginPerMile` | DECIMAL(5,2) | NOT NULL | > 0; e.g., $0.50 profit per mile |
| `createdAt` | TIMESTAMPTZ | NOT NULL | Immutable |
| `updatedAt` | TIMESTAMPTZ | NOT NULL | Updated on edit |
| `deletedAt` | TIMESTAMPTZ | NULLABLE | Soft delete |

**Formulas:**
- `Fixed CPM = monthlyFixedCosts ÷ monthlyMilesTarget`
- `Fuel CPM = fuelCostPerGallon ÷ milesPerGallon`
- `Variable CPM = Fuel CPM + maintenanceCostPerMile`
- `Total CPM = Fixed CPM + Variable CPM`
- **`Minimum RPM = Total CPM + targetMarginPerMile`** ← **[OO-CRIT-4]**

**Validation Rules:**
- All cost fields must be > 0
- `milesPerGallon` between 3.0 and 12.0
- Cannot update if has CLAIMED loads
- Changes are immutable; new record required for audit trail

---

### Preferred Lanes (Value Object / Separate Table)
**Entity:** `CarrierLane`  
**Scope:** Regional lane preferences (where O/O prefers to haul)

| Field | Type | Constraints | Validation |
|-------|------|-------------|-----------|
| `id` | VARCHAR(36) UUID | PK, NOT NULL | UUID4 |
| `tenantId` | VARCHAR(36) UUID | NOT NULL, FK | Implicit |
| `truckerId` | VARCHAR(36) UUID | NOT NULL, FK | Must own equipment |
| `originRegion` | VARCHAR(50) | NOT NULL | SE, CA, TX, NE, MW, NW, SW (predefined codes) |
| `destinationRegion` | VARCHAR(50) | NOT NULL | Same predefined codes |
| `minRateCents` | BIGINT | NULLABLE | If set, > 0; e.g., 175 = $1.75/mi |
| `frequencyPreference` | ENUM | NOT NULL | DAILY, WEEKLY, MONTHLY, ANY |
| `status` | ENUM | NOT NULL | ACTIVE, INACTIVE |
| `createdAt` | TIMESTAMPTZ | NOT NULL | Immutable |
| `deletedAt` | TIMESTAMPTZ | NULLABLE | Soft delete |

**Validation Rules:**
- `originRegion` and `destinationRegion` must be valid region codes
- `minRateCents` optional; if provided, > 0
- `frequencyPreference` restricted to enum values
- Cannot delete lane with active CLAIMED loads

---

## 🏠 Load Claiming Rules

### One Active Load Constraint [OO-CRIT-6]
**Rule:** Owner/operator can have at most 1 CLAIMED load at a time.

**Logic:**
```sql
SELECT COUNT(*) FROM loads 
WHERE trucker_id = ? AND status = 'CLAIMED' AND deleted_at IS NULL
```

**Enforcement:**
- `LoadService.claimLoad()` must check: if count > 0, throw `OneActiveLoadException`
- Error message: "Owner/operator can only have 1 active load. Deliver your current load to claim a new one."
- After delivery (load → DELIVERED), constraint lifts

---

## 🎯 Load Board Filtering [OO-CRIT-4]

**Visibility Rule:** Load only appears on board if `load.posted_rate >= carrier.calculateMinimumRPM()`

**Calculation:**
```java
BigDecimal minimumRPM = carrierCostProfile.calculateMinimumRPM();
boolean visible = load.getPostedRate().compareTo(minimumRPM) >= 0;
```

---

## 📈 Performance & Metrics

### Delivery Performance
| Metric | Calculation | Display |
|--------|-------------|---------|
| On-Time % | (on_time_deliveries ÷ total_deliveries) × 100 | "98% on-time" |
| Equipment Condition | avg(condition_rating) | "4.5★ equipment" |
| Response Time | avg(time to claim after posting) | "Claims in <2h avg" |

---

## 🔐 Multi-Tenancy & RLS

**Critical Rule:** All queries must include implicit tenant filtering via `TenantContextHolder`.

**Option 2 Pattern (DTO + TenantContextHolder):**
```java
// Service layer implicitly uses tenant context
@Cacheable("carrierCostProfile", key="#truckerId")
public CarrierCostProfile getCostProfile(String truckerId) {
  String tenantId = TenantContextHolder.getTenantId();
  return repository.findByTenantIdAndTruckerId(tenantId, truckerId);
}
```

**Repository Layer (RLS-Aware):**
```java
public interface CarrierCostProfileRepository extends JpaRepository<...> {
  CarrierCostProfile findByTenantIdAndTruckerId(String tenantId, String truckerId);
  List<CarrierCostProfile> findByTenantIdAndDeletedAtIsNull(String tenantId);
}
```

---

## ✅ Phase 7 Implementation Checklist

- [x] **OO-CRIT-2:** CarrierEquipment domain (US-701)
- [ ] **OO-CRIT-3:** CarrierCostProfile infrastructure + tests (US-702/730)
- [ ] **OO-CRIT-4:** Min RPM filtering in LoadService (US-705)
- [ ] **OO-CRIT-5:** CarrierLane infrastructure + tests (US-702)
- [ ] **OO-CRIT-6:** One Active Load validation (LoadService)
- [x] **OO-CRIT-7:** Public profile masking (US-710)
- [ ] **OO-CRIT-8:** Performance reputation system (US-710)
- ⏳ **OO-CRIT-1:** HOS tracking deferred to Phase 9 (US-800)

---

## 📚 Related Stories
- **US-701:** Carrier Profiles (Equipment/Capacity)
- **US-702:** Preferred Lanes (Region-Based)
- **US-703:** Availability (Days/Hours)
- **US-705:** Load Board Filters (Min RPM)
- **US-710:** Public Carrier Profile (History)
- **US-730:** Per-Load Earnings (Cost Profile integration)
