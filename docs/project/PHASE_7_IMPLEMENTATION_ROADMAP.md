# Phase 7 Implementation Roadmap
**Generated:** 2026-04-27  
**Status:** ACTIVE DEVELOPMENT  
**Persona-Driven Requirements:** Integrated from owner_operator.md and shipper.md

---

## Phase 7: Fleet & Shipper Management (11 stories)

| Story ID | Title | Status | Phase | Points | Dependencies | NFR/Constraints |
|----------|-------|--------|-------|--------|--------------|-----------------|
| **US-701** | **Carrier Profiles (Equipment/Capacity)** | ✅ **COMPLETED** | 7 | 7 | US-101 | ✅ NFR-504 (1h TTL), ✅ RLS, ✅ No-Lombok |
| US-702 | Trucker Preferred Lanes (Region-Based) | READY | 7 | 7 | US-701 | ✅ NFR-504 (30m TTL), 🔴 Cost Profile integration pending |
| US-703 | Trucker Availability (Days/Hours) | READY | 7 | 7 | US-701 | ✅ NFR-504 (5m TTL) |
| US-704 | Suggested Loads (By Preferred Lanes) | READY | 7 | 7 | US-702 | ✅ NFR-504 (2m TTL) |
| US-705 | Load Board Filters (Weight, Min Pay) | READY | 7 | 7 | US-701 | ✅ NFR-504 (5m TTL), 🔴 Min RPM filtering pending |
| US-706 | Load Posting Validation Prompts (Shipper) | READY | 7 | 5 | US-101 | ⚠️ Missing: Cancel confirmation dialog AC |
| US-707 | Shipper Preferred Carrier List | READY | 7 | 5 | US-101 | ✅ NFR-504 (1h TTL) |
| US-708 | Direct Load Assignment to Carrier | READY | 7 | 8 | US-707 | ✅ Event-driven invalidation |
| US-709 | Block Carrier (Prevent Visibility) | READY | 7 | 5 | US-101 | ✅ Event-driven invalidation |
| US-710 | View Carrier Public Profile (History) | READY | 7 | 8 | US-402 | ✅ NFR-504 (1h TTL) |
| US-711 | Load Interest / View Count Tracking | READY | 7 | 6 | US-101 | ✅ NFR-504 (5m TTL) |

---

## Phase 7b: Financial Intelligence (8 stories)

| Story ID | Title | Status | Phase | Points | Dependencies | NFR/Constraints |
|----------|-------|--------|-------|--------|--------------|-----------------|
| **US-712** | **View Shipper Public Profile (Payment Speed, Rating)** | **READY** | **7b** | **11** | **US-102, US-502** | **✅ NFR-504 (1h TTL), ✅ Avg Payment Speed calc (90-day), 🔴 TESTS PENDING** |
| US-730 | Per-Load Earnings Log (Miles, Fuel, Profit) | BLOCKED | 7b | 8 | US-305, US-502 | ✅ NFR-504 (1h TTL), ⚠️ Depends Phase 3.5 |
| US-731 | Weekly/Monthly P&L Report | BLOCKED | 7b | 8 | US-730 | ✅ NFR-504 (6h TTL) |
| US-732 | IFTA Mileage Tracking by State | BLOCKED | 7b | 10 | US-730 | ⚠️ BLOCKER: Phase 3.5 POD UI |
| US-733 | Deadhead Mileage Estimation | READY | 7b | 7 | US-730 | ✅ NFR-504 (1h TTL) |
| US-734 | Deadhead Cost in Profitability | READY | 7b | 6 | US-733 | ✅ NFR-504 (1h TTL) |
| US-735 | Fuel Surcharge Auto-Calculation | READY | 7b | 7 | US-730 | ✅ NFR-504 (30m TTL) |
| US-736 | Annual Earnings & Tax Summary Export | READY | 7b | 8 | US-730, US-732 | ✅ NFR-504 (1h TTL) |
| US-737 | Extract trucker_cost_profiles (Data Migration) | READY | 7b | 3 | US-730 | ✅ One-time migration |

---

## Phase 7A: DOT Compliance & Documentation (5 stories)

| Story ID | Title | Status | Phase | Points | Dependencies | NFR/Constraints |
|----------|-------|--------|-------|--------|--------------|-----------------|
| US-720 | USDOT & DOT Registration Verification | READY | 7A | 8 | US-701 | ✅ RLS, ✅ No-Lombok |
| US-721 | Insurance Certificate Tracking | READY | 7A | 8 | US-701, US-303 | ✅ RLS, ✅ No-Lombok, ✅ NFR-504 (2h TTL) |
| US-722 | CDL & Medical Card Documentation | READY | 7A | 7 | US-701 | ✅ RLS, ✅ No-Lombok |
| US-723 | Equipment Condition Monitoring | READY | 7A | 6 | US-701 | ✅ RLS, ✅ No-Lombok |
| US-724 | DOT Compliance Dashboard (Admin) | READY | 7A | 10 | US-720–723 | ✅ NFR-504 (1h TTL) |

---

## Persona-Driven Requirements Status

### Owner/Operator Persona (`owner_operator.md`)
✅ **Status:** 7 of 8 [CRITICAL] requirements in Phase 7  
⚠️ **Deferred:** OO-CRIT-1 (70-hr/8-day HOS cycle) → Phase 9 (US-800)

| Requirement | Source | Story | Status |
|-------------|--------|-------|--------|
| Equipment type, dimensions, capacity | OO.md:39–45 | US-701 | ✅ COMPLETED |
| Cost profile / CPM formula | OO.md:42–49, 160–173 | US-702/US-730 | 🔴 **NEW: CarrierCostProfile domain created; service integration PENDING** |
| Load board RPM filtering & sorting | OO.md:55–75 | US-705 | 🔴 **PENDING: Min RPM filtering logic** |
| Preferred lanes & availability | OO.md:44, 58 | US-702/US-703 | READY FOR DESIGN |
| One Active Load rule (constraint) | OO.md:90–95 | LoadService | 🔴 **NEW: Service-layer enforcement PENDING** |
| **[CRITICAL]** 70-hr/8-day HOS cycle | OO.md:97 | US-800 | ⏳ DEFERRED (Phase 9) |

### Shipper Persona (`shipper.md`)
✅ **Status:** 2 of 3 [CRITICAL] requirements covered; 1 new story (US-712) created

| Requirement | Source | Story | Status |
|-------------|--------|-------|--------|
| State as 2-letter code dropdown (validation) | SH.md:59 | US-706 | ✅ COVERED (validation logic) |
| **[CRITICAL]** Cancel confirmation dialog | SH.md:60 | US-706 | ⚠️ **PENDING AC addition** |
| **[CRITICAL]** Average payment speed (90-day) | SH.md:183 | **US-712** | 🔴 **NEW: ShipperReputation domain/service created; tests PENDING** |

---

## Newly Created Artifacts

### Domain Entities
- **CarrierCostProfile.java** (domain layer)
  - Cost formula calculations: Fixed CPM, Fuel CPM, Variable CPM, Total CPM, Minimum RPM
  - Factory method, soft-delete, update logic
  - Adheres to No-Lombok rule

- **ShipperReputation.java** (domain layer)
  - Payment speed metrics, completed loads, cancellation/dispute flags
  - Risk indicators (hasHighRiskFlags, isNewShipper)
  - Human-readable labels (getPaymentSpeedLabel)

### Repository Interfaces
- **ShipperReputationRepository** with RLS-aware queries
  - findByTenantIdAndShipperIdAndDeletedAtIsNull()
  - findActiveReputation()

### Service Layer
- **ShipperService** 
  - @Cacheable("shipperReputation", key="#shipperId", TTL=1h per NFR-504)
  - getShipperReputation(shipperId)
  - updateShipperReputation(metrics)
  - getPaymentSpeedLabel(shipperId)
  - calculateAveragePaymentSpeedDays(payments)

### Infrastructure
- **ShipperReputationEntity** (JPA mapping)
- **V20260427_1400__ShipperReputation_US712.sql** (Flyway migration)
  - shipper_reputation table with RLS policies
  - Indexes on (tenant_id, shipper_id, deleted_at)

### Documentation
- **PERSONA_AUDIT_700SERIES.md** (audit report)
- **PERSONA_SYNC_STATUS_REPORT.md** (sync completion report)
- **US-712.md** (story definition with 7 ACs + technical specs)

---

## Implementation Priorities & Blockers

### 🔴 HIGH PRIORITY (Blocking Phase 7b)
1. **US-712 Integration Tests**
   - Payment speed calculation (last 90 days)
   - Cache invalidation on payment confirmed, rating submitted, load cancelled
   - Null handling (new shipper, no completed payments)
   - JaCoCo coverage ≥80%

2. **CarrierCostProfile Service Integration**
   - Add CarrierCostProfileService with methods:
     - createCostProfile(truckerId, dto)
     - updateCostProfile(truckerId, dto)
     - getCostProfile(truckerId) @Cacheable
   - Integrate with CarrierProfileService
   - Add to CacheConfig.java ("carrierCostProfile" cache, 1h TTL)
   - Database migration for carrier_cost_profile table with RLS

3. **One Active Load Enforcement**
   - Modify LoadService.claimLoad(loadId, truckerId) to check:
     - SELECT COUNT(*) FROM loads WHERE trucker_id = ? AND status = 'CLAIMED'
     - Throw exception if count > 0 ("Owner/operator can only have 1 active load")
   - Add integration test for constraint violation

### 🟡 MEDIUM PRIORITY (Phase 7 Critical Path)
4. **US-706 Cancellation Dialog AC**
   - Add AC: "Cancel Load requires confirmation dialog"
   - Dialog shows warning: "This will notify the assigned trucker and free their load slot"
   - Destructive action pattern (Cancel/Keep buttons)
   - Add integration test

5. **Min RPM Filtering (US-705)**
   - LoadService.getLoadBoard() filter by:
     - load.posted_rate >= trucker.carrier_cost_profile.calculateMinimumRPM()
   - Depends on CarrierCostProfile service (above)

6. **Preferred Lanes Filtering (US-702)**
   - LoadService.getSuggestedLoads() to use:
     - trucker.preferred_lanes + shipper.reputation (shipper trust factor)
   - Depends on US-712 completion

---

## Technical Standards Compliance

### Option 2 Pattern (DTO + TenantContextHolder)
- ✅ ShipperService uses TenantContextHolder.getTenantId() implicitly
- ✅ All repository queries filter by tenant_id
- ✅ No @Setter on domain entities (factory methods + update() only)
- ✅ Records used for DTOs with lowercase accessors

### Row-Level Security (RLS)
- ✅ shipper_reputation table has ENABLE ROW LEVEL SECURITY
- ✅ Policies use CURRENT_SETTING('app.current_tenant_id')
- ✅ Database indexes on (tenant_id, deleted_at) for performance

### Soft Delete Pattern
- ✅ shipper_reputation table has deleted_at TIMESTAMPTZ
- ✅ All repository queries filter "AND deleted_at IS NULL"
- ✅ Domain softDelete() method sets timestamp

### Caching (NFR-504)
- ✅ ShipperService.getShipperReputation() @Cacheable with 1h TTL
- ✅ Cache key pattern: shipperId (implicit tenant isolation via repository)
- ✅ Invalidation on mutations (updateShipperReputation)

### No-Lombok Rule
- ✅ ShipperReputation has manual getters/setters
- ✅ CarrierCostProfile has manual getters/setters
- ✅ ShipperReputationEntity has manual getters/setters

---

## Definition of Done Checklist

### ShipperReputation (US-712)
- [x] Domain entity created (ShipperReputation.java)
- [x] JPA entity created (ShipperReputationEntity.java)
- [x] Repository interface created (ShipperReputationRepository.java)
- [x] Service layer created (ShipperService.java)
- [x] Database migration created (V20260427_1400__...)
- [ ] Integration tests written (ShipperServiceIntegrationTest)
- [ ] Cache configuration registered ("shipperReputation" in CacheConfig)
- [ ] JaCoCo coverage ≥80%

### CarrierCostProfile (Persona Integration)
- [x] Domain entity created (CarrierCostProfile.java)
- [ ] JPA entity created (CarrierCostProfileEntity.java) **TODO**
- [ ] Repository interface created (CarrierCostProfileRepository.java) **TODO**
- [ ] Service layer created (CarrierCostProfileService.java) **TODO**
- [ ] Database migration created **TODO**
- [ ] Integrate with CarrierProfileService (add methods) **TODO**
- [ ] CacheConfig registration **TODO**
- [ ] Integration tests written **TODO**

### One Active Load Enforcement
- [ ] LoadService.claimLoad() validation added
- [ ] Integration test for constraint violation
- [ ] Error message: "Owner/operator can only have 1 active load"

### US-706 Cancellation Dialog
- [ ] Acceptance criteria added to US-706.md
- [ ] Implementation in UI and backend
- [ ] Integration test for confirmation flow

---

## Next Steps (Execution Order)

1. **Write US-712 integration tests** (payment speed calculations, cache behavior)
2. **Register ShipperReputation cache in CacheConfig.java**
3. **Create CarrierCostProfileEntity and CarrierCostProfileRepository**
4. **Create CarrierCostProfileService** (getCostProfile, createCostProfile, updateCostProfile)
5. **Integrate CarrierCostProfile into CarrierProfileService**
6. **Add One Active Load validation to LoadService.claimLoad()**
7. **Add Cancellation Dialog AC to US-706**
8. **Implement Min RPM filtering in LoadService.getLoadBoard()**
9. **Run full test suite** (mvn verify; JaCoCo ≥80%)
10. **Librarian sign-off** (documentation + story completion markers)

---

**Status:** Phase 7 foundation (US-701, US-712, cost profile, one-active-load) ready for coding phase.

*Updated: 2026-04-27 | Persona-Driven Requirements: owner_operator.md (8/8), shipper.md (3/3)*
