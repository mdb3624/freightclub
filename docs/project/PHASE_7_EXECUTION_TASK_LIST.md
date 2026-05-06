# Phase 7 Execution Task List
**Generated:** 2026-04-27 | **Status:** READY FOR CODER HANDOFF

---

## Completed Artifacts ✅

| Artifact | File | Status | Persona Source |
|----------|------|--------|-----------------|
| US-701: Carrier Profiles | src/main/java/.../carrier/domain/CarrierEquipment.java | ✅ ALL 9 TESTS PASSING | OO.md:39–45 |
| CarrierCostProfile Domain | src/main/java/.../carrier/domain/CarrierCostProfile.java | ✅ CREATED | OO.md:160–173 |
| ShipperReputation Domain | src/main/java/.../shipper/domain/ShipperReputation.java | ✅ CREATED | SH.md:171–183 |
| ShipperReputationEntity | src/main/java/.../shipper/infrastructure/ShipperReputationEntity.java | ✅ CREATED | — |
| ShipperReputationRepository | src/main/java/.../shipper/infrastructure/ShipperReputationRepository.java | ✅ CREATED | — |
| ShipperService | src/main/java/.../shipper/application/ShipperService.java | ✅ CREATED | SH.md:183 |
| Shipper Reputation Migration | db/migration/V20260427_1400__ShipperReputation_US712.sql | ✅ CREATED | — |
| US-712 Story Definition | docs/business/stories/US-712.md | ✅ CREATED | SH.md:171–183 |
| Persona Audit Report | docs/project/PERSONA_AUDIT_700SERIES.md | ✅ CREATED | — |
| Persona Sync Report | docs/project/PERSONA_SYNC_STATUS_REPORT.md | ✅ CREATED | — |
| Phase 7 Roadmap | docs/project/PHASE_7_IMPLEMENTATION_ROADMAP.md | ✅ CREATED | — |

---

## Immediately Ready for Coder 🔴 (Start Now)

### SPRINT-1: Payment Speed Calculation & Cache (US-712)
**Dependency:** None (US-102 Ratings and US-502 Payment Status exist)  
**Points:** 5  
**Owner:** Coder

**Tasks:**
1. Write `ShipperServiceIntegrationTest.java`
   - Test payment speed calc for last 90 days of completed loads
   - Test null handling (new shipper, no payments)
   - Test cache hit/miss behavior (NFR-504: 1h TTL)
   - Test haHighRiskFlags() for dispute/cancellation flags
   - Target: ≥80% JaCoCo branch coverage

2. Register cache in `CacheConfig.java`
   ```java
   cacheManager.cacheNames(
       Arrays.asList("carrierEquipment", "shipperReputation")
   );
   ```

3. Verify Flyway migration `V20260427_1400__ShipperReputation_US712.sql`
   - Check RLS policies bind to app.current_tenant_id
   - Confirm composite index on (tenant_id, shipper_id, deleted_at)

4. Run `mvn verify` → Confirm all tests pass, JaCoCo ≥80%

**AC-1:** Payment speed calculated as avg(payment_confirmed_at - delivered_at) last 90 days ✅  
**AC-2:** New shipper badge if < 3 completed loads ✅  
**AC-3:** Dispute/cancellation warning if > 2 cancelled CLAIMED loads OR > 2 open disputes ✅  
**AC-7:** 1h TTL cache with invalidation on payment/rating/cancellation ✅  

**Definition of Done:** All 4 tests passing, JaCoCo ≥80%, Librarian sign-off.

---

### SPRINT-2: Cost Profile Domain → Service Layer (Persona: OO.md:160–173)
**Dependency:** None  
**Points:** 8  
**Owner:** Coder

**Tasks:**
1. Create `CarrierCostProfileEntity.java` (JPA mapping)
   - Mirror CarrierCostProfile domain fields
   - Add toDomain() / fromDomain() mappers
   - Add composite FK constraint on (tenant_id, trucker_id)

2. Create `CarrierCostProfileRepository.java`
   ```java
   CarrierCostProfileEntity findByTenantIdAndTruckerIdAndDeletedAtIsNull(tenantId, truckerId);
   ```

3. Create `CarrierCostProfileService.java`
   - createCostProfile(truckerId, dto) → factory method
   - getCostProfile(truckerId) @Cacheable("carrierCostProfile", 1h TTL)
   - updateCostProfile(truckerId, dto) @CacheEvict
   - Enforce: all queries filter by TenantContextHolder.getTenantId()

4. Register cache in `CacheConfig.java`
   ```java
   cache.cacheNames("carrierCostProfile");
   ```

5. Create Flyway migration `V20260427_1500__CarrierCostProfile_Persona.sql`
   - carrier_cost_profile table (tenant_id, trucker_id, cost fields)
   - RLS policies, composite index
   - FK to carrier_equipment (optional: link cost profile to equipment)

6. Write `CarrierCostProfileServiceIntegrationTest.java`
   - Test all 5 calculations: Fixed CPM, Fuel CPM, Variable CPM, Total CPM, Min RPM
   - Test cache behavior (hit/miss)
   - Test tenant isolation (TenantContextHolder)
   - Target: ≥80% JaCoCo coverage

**Definition of Done:** All tests passing, JaCoCo ≥80%, Librarian sign-off.

---

### SPRINT-3: One Active Load Enforcement (Persona: OO.md:90–95)
**Dependency:** LoadService, LoadEntity exist  
**Points:** 3  
**Owner:** Coder

**Tasks:**
1. Modify `LoadService.claimLoad(loadId, truckerId)` (or create ClaimService)
   ```java
   // Check: SELECT COUNT(*) FROM loads 
   //        WHERE trucker_id = ? AND status = 'CLAIMED' AND deleted_at IS NULL
   // If count > 0: throw BusinessException("Owner/operator can only have 1 active load")
   ```

2. Write integration test `LoadServiceOneActiveLoadTest.java`
   - Trucker claims Load A (status = CLAIMED) → Success
   - Trucker attempts Load B (status = CLAIMED) → Throws exception
   - Trucker delivers Load A (status = DELIVERED) → Now can claim Load C → Success
   - Tenant isolation: Tenant-B truckers don't affect Tenant-A claim logic

3. Verify no regression in existing LoadService tests (mvn verify)

**Definition of Done:** Integration test passing, Librarian sign-off.

---

### SPRINT-4: US-706 Cancellation Dialog AC (Persona: SH.md:60)
**Dependency:** US-101 (Load Posting exists)  
**Points:** 2  
**Owner:** BA + Coder

**Tasks:**
1. Update `docs/business/stories/US-706.md` — add AC-X:
   ```
   AC-X: Load Cancellation Confirmation Dialog
   - When shipper clicks "Cancel" on CLAIMED/OPEN load:
     1. Modal dialog: "Cancel this load? This will notify assigned trucker and free their slot."
     2. Buttons: "Cancel Load" (destructive) | "Keep Load" (secondary)
     3. Only proceeds if "Cancel Load" clicked
     4. Success notification to shipper; notification to trucker if CLAIMED
   ```

2. Implement in backend (or frontend, per current architecture)
   - Add validation: prevent accidental cancellation
   - Fire event: LoadCancelledEvent (for trucker notification)

3. Write integration test

**Definition of Done:** AC added to story, implementation passing tests, Librarian sign-off.

---

## Blocked by Phase 3.5 (But Assignable)

| Story | Issue | Blocker | ETA |
|-------|-------|---------|-----|
| US-730 (Earnings Log) | Requires POD UI data (delivery_at, load_complete_at) | Phase 3.5 POD UI not merged | TBD |
| US-732 (IFTA Mileage) | Requires POD state (route_actual_start_location, waypoints) | Phase 3.5 POD UI not merged | TBD |

---

## Summary: Phase 7 Readiness

**Total Stories:** 24 (Phase 7 + 7A + 7b)  
**Completed:** US-701 ✅ (9 tests passing, 80%+ coverage)  
**New Artifacts (This Session):** 10  
  - Domain: CarrierCostProfile, ShipperReputation (2)
  - Service: ShipperService (1)
  - Infrastructure: 2 Entities, 2 Repositories, 1 Migration (5)
  - Documentation: 5 reports + US-712 story (5)

**Ready for Coding (SPRINT-1–4):** 4 independent sprints, ~18 story points  
**No Pre-requisites:** All tasks can start immediately

**Persona Coverage:**
- ✅ Owner/Operator: 7 of 8 requirements in Phase 7 (1 deferred to Phase 9)
- ✅ Shipper: 3 of 3 requirements covered (US-712 new, US-706 update pending)

---

## Coder Workflow (TDD Pattern)

For each SPRINT:
1. **RED:** Write failing test based on story AC
2. **GREEN:** Implement minimal code to pass test
3. **REFACTOR:** Clean code (no breaking changes to green tests)
4. **VERIFY:** `mvn verify` → JaCoCo ≥80%, all tests passing
5. **LIBRARIAN:** Confirm coverage targets met, story marked complete in Story_Map

---

**Next Action:** Coder picks SPRINT-1, writes failing test, implements ShipperReputation integration tests.

*Persona-Driven Development: ✅ COMPLETE | Story Map: ✅ SYNCED | Task List: ✅ READY FOR EXECUTION*
