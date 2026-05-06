# US-702: Preferred Lanes (Owner/Operator)

**Epic:** Phase 7 — Fleet Management  
**Status:** AC FINALIZED (Ready for Implementation)  
**Dependencies:** US-701 (CarrierCostProfile ✅), US-705 (Min RPM Filtering ✅)  
**Estimated Points:** 13 (complex matching logic)

---

## User Story

As an **owner/operator**, I want to define **preferred lanes** (regional routes) where I'm most profitable, so that I can **prioritize loads that match my equipment, availability, and cost structure**.

---

## Acceptance Criteria

### AC 1: Create/Update Preferred Lane Record
**Given** I am logged in as an owner/operator  
**When** I navigate to "Fleet Settings" → "Preferred Lanes"  
**Then** I can:
- Add a new lane: origin state, destination state, equipment type, preferred miles range
- Edit existing lane: all fields above
- Delete lane (soft-delete via `deleted_at`)
- See my lanes persist across sessions

**Requirement:** CarrierLane entity with fields: carrierId, originState, destState, equipmentType, minMiles, maxMiles, createdAt, updatedAt, deletedAt

**Related [CRITICAL]:** OO-CRIT-3 (Regional lane preferences)

---

### AC 2: Lane Matching with Min RPM
**Given** I have preferred lanes + a cost profile configured  
**When** I view the load board  
**Then** suggested loads are filtered by:
1. **Equipment match:** Load equipment ⊆ my equipment types
2. **Geography match:** Origin/destination match preferred lane (origin state + dest state)
3. **Min RPM compliance:** Load rate ≥ my calculated minimum RPM (from US-701)
4. **Mileage range:** Load estimated miles within my preferred range (minMiles ≤ estimatedMiles ≤ maxMiles)
5. **Profitability rank:** Top suggestions sorted by (load.rate - myMinRPM) descending

**Requirement:** LaneMatchingService.suggestLoadsByLanes(carrierId) → List<LoadCandidate> (sorted by profitability margin)

**Related [CRITICAL]:** OO-CRIT-2 (Min RPM integration), OO-CRIT-3 (Lane preferences)

---

### AC 3: Multi-Tenant Lane Isolation
**Given** I am logged in as carrier ABC  
**When** another carrier DEF exists in the system  
**Then** I can only see/edit MY preferred lanes (via RLS policy)

**Requirement:** PostgreSQL RLS policy on carrier_lanes: `tenant_id = CURRENT_SETTING('app.current_tenant_id')`

**Related [CRITICAL]:** ARCH-001 (zero-parameter isolation)

---

### AC 4: Lane Soft-Delete & Audit
**Given** I delete a preferred lane  
**When** the deletion is processed  
**Then:**
- The lane is marked `deleted_at = NOW()` (not physically removed)
- Historical matching data is preserved (loads matched to this lane remain in history)
- The lane no longer appears in UI or matching algorithms

**Requirement:** All queries filter `deleted_at IS NULL` implicitly (via repository layer)

---

### AC 5: Lane Matching Explainability
**Given** I see a suggested load on the load board  
**When** I click "Why suggested?"  
**Then** I see a breakdown:
- Matched lane: "CA→TX Reefer"
- Equipment fit: ✓ Reefer in my fleet
- Rate margin: "+$0.45 above Min RPM"
- Miles in range: "450 mi (within 400-600 preferred)"
- Profitability score: 8/10

**Requirement:** LoadCandidate DTO includes: matchedLaneId, equipmentMatch, rateMargin, milesMatch, profitabilityScore

---

## Definition of Done

- [x] CarrierLane entity with soft-delete
- [x] CarrierLaneRepository with RLS policy
- [x] LaneMatchingService with profitability ranking
- [x] Integration tests: 8+ cases (CRUD, matching, isolation, soft-delete)
- [x] 80% JaCoCo coverage on matching algorithm
- [x] No tenantId parameters in service methods (ARCH-001)
- [x] Cache results (1h TTL) per NFR-504
- [x] REST API: GET /api/v2/carriers/{id}/suggested-loads (filtered by lanes)

---

## Technical Notes

**Min RPM Integration (US-705 dependency):**
```
Load matches lane IF:
  - equipmentType in my.equipmentTypes
  - originState == lane.originState AND destState == lane.destState
  - load.rate >= CarrierCostProfileService.calculateMinimumRPM(carrierId)
  - load.estimatedMiles in [lane.minMiles, lane.maxMiles]
```

**Matching Service Signature (ARCH-001 compliant):**
```java
public List<LoadCandidate> suggestLoadsByLanes(String carrierId)
// No tenantId parameter — resolved via TenantContextHolder
```

**Cache Strategy (NFR-504):**
```
Cache key: "lanes:{carrierId}:{loadId}"
TTL: 1h
Invalidate on: PaymentConfirmed, RatingSubmitted, LoadClaimed events
```

---

## Story Map Links

- **Parent:** US-704 (Suggested Loads)
- **Blocker for:** US-730 (Earnings Log depends on lane + load association)
- **Related:** US-701 (Cost Profile), US-705 (Min RPM)
