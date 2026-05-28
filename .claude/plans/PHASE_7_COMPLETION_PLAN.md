# Phase 7 Completion Plan: Carrier Management & Logistics Compliance

**Created:** 2026-05-27  
**Target:** Complete all Phase 7 stories in dependency order  
**Effort Estimate:** 6–8 sprints

---

## Current Status Summary

| Category | Count | Stories |
|----------|-------|---------|
| ✅ COMPLETED | 4 | US-701, 702, 703, 713 |
| 🟡 PARTIAL | 3 | US-704, 705, 706 |
| ⏳ MIGRATION_PENDING | 5 | US-707–711 |
| 📋 MISSING (need creation) | 2 | US-707–711 (story files missing) |
| **TOTAL** | **12** | — |

---

## Dependency Graph

```
US-101 (Registration) ✅
├─ US-701 (Carrier Profiles) ✅
│  ├─ US-702 (Preferred Lanes) ✅
│  │  └─ US-704 (Suggested Loads) 🟡 PARTIAL
│  ├─ US-703 (Availability) ✅
│  └─ US-705 (Load Board Filters) 🟡 PARTIAL
├─ US-706 (Load Validation Prompts) 🟡 PARTIAL
├─ US-707 (Preferred Carrier List) ⏳ PENDING
│  └─ US-708 (Direct Assignment) ⏳ PENDING (blocks on 707)
├─ US-709 (Block Carrier) ⏳ PENDING
├─ US-711 (Interest/View Tracking) ⏳ PENDING
└─ US-713 (Shipper Profile) ✅

US-402 (Shipper Reputation) ✅
└─ US-710 (Carrier Public Profile) ⏳ PENDING

```

---

## Execution Order (Respecting Dependencies)

### TIER 1: Complete Partial Stories (No new dependencies)
**Effort:** 2–3 sprints | **Blockers:** None

1. **US-704** — Suggested Loads (matching algorithm)
   - Depends: US-702 ✅ (ready)
   - Work: Complete load matching logic, expose suggestions endpoint
   - AC-704-1-7: All acceptance criteria
   - Tests: Matching algorithm, cache behavior, multi-tenant isolation

2. **US-705** — Load Board Filters (weight, min pay)
   - Depends: US-701 ✅ (ready)
   - Work: Add weight filter, minimum pay filter, sorting
   - AC-705-1-4: Filter endpoint, combined filtering, sorting logic
   - Tests: Filter combinations, boundary conditions

3. **US-706** — Load Posting Validation Prompts (shipper)
   - Depends: US-101 ✅ (ready)
   - Work: Equipment mismatch detection, validation UI prompts
   - AC-706-1-5: Detect oversized equipment, suggest equipment, UI prompts
   - Tests: Edge cases (overweight loads, dimension mismatches)

### TIER 2: Create & Implement Shipper-side Stories (blocking US-708)
**Effort:** 2–3 sprints | **Blockers:** Must complete Tier 1 first

4. **US-707** — Shipper Preferred Carrier List
   - Status: Story file MISSING (need to create)
   - Depends: US-101 ✅
   - Blocks: US-708
   - Work: 
     - Create user story file with BA input
     - Design: Shipper UI for managing carrier list
     - Implement: CRUD for preferred carriers, caching (1h TTL)
     - API: POST/DELETE preferred carriers, GET list
   - Tests: Multi-tenant isolation, cache invalidation on adds/removes

5. **US-708** — Direct Load Assignment to Carrier
   - Status: Story file MISSING (need to create)
   - Depends: US-707 (must complete first)
   - Blocks: None (terminal story)
   - Work:
     - Create user story file with BA input
     - Design: Shipper workflow for direct assignment
     - Implement: Assignment logic, notifications to carrier
     - API: POST assignment to carrier (create load + notify)
   - Tests: Notification delivery, carrier visibility rules

### TIER 3: Implement Trucker & Carrier Visibility (independent of above)
**Effort:** 1–2 sprints | **Blockers:** None

6. **US-709** — Block Carrier (Prevent Visibility)
   - Status: Story file MISSING (need to create)
   - Depends: US-101 ✅
   - Blocks: None (independent)
   - Work:
     - Create user story file
     - Design: Shipper UI for blocking carriers
     - Implement: Block list, load board filtering to exclude blocked
     - API: POST/DELETE blocked carrier, GET block list
   - Tests: Confirm blocked carriers don't see shipper's loads

7. **US-711** — Load Interest / View Count Tracking
   - Status: Story file MISSING (need to create)
   - Depends: US-101 ✅
   - Blocks: None (independent)
   - Work:
     - Create user story file
     - Design: Track view counts per load, interest signals
     - Implement: Increment counters on load view, cache (5m TTL)
     - API: GET /loads/{id}/analytics (shipper sees interest)
   - Tests: View count accuracy, cache behavior, concurrent increments

### TIER 4: Implement Public Profile (depends on Reputation)
**Effort:** 1 sprint | **Blockers:** US-402 ✅ (ready)

8. **US-710** — View Carrier Public Profile (History)
   - Status: Story file MISSING (need to create)
   - Depends: US-402 ✅ (Shipper Reputation — DONE)
   - Blocks: None (terminal)
   - Work:
     - Create user story file
     - Design: Trucker public profile card (reputation + history)
     - Implement: Read-only profile API, load history embed
     - API: GET /api/v1/truckers/{truckerId}/public-profile
   - Tests: RLS (don't expose sensitive data), cache (1h TTL)

---

## Timeline & Sequencing

```
Week 1:  US-704 + US-705 + US-706 (all start in parallel) → PARTIAL→DONE
Week 2:  US-707 design & build (story file + implementation)
Week 3:  US-708 build (depends on 707 schema)
Week 4:  US-709 + US-711 (parallel, both independent)
Week 5:  US-710 (depends on US-402 ✅, small scope)
```

**Parallel Work Allowed:**
- Tier 1: All 3 in parallel (704, 705, 706)
- Tier 3: Both in parallel (709, 711)
- Tier 2: Sequential only (707 must finish before 708 starts)

---

## Story Files Needing Creation

**Missing story files (need BA/HFD input):**
- [ ] US-707: Shipper Preferred Carrier List
- [ ] US-708: Direct Load Assignment to Carrier
- [ ] US-709: Block Carrier
- [ ] US-710: View Carrier Public Profile
- [ ] US-711: Load Interest / View Count Tracking

**Action:** BA needs to create story files following INVEST standard before implementation starts.

---

## Gate Checklist (Per Phase 7+ Mandatory)

All Phase 7 stories require:
- [ ] Design document with "API Caching & Cache Invalidation" section (per 700SERIES_MANDATORY_ADDENDUM.md)
- [ ] All GET endpoints documented with cache keys and TTLs
- [ ] @Cacheable on reads, @CacheEvict on mutations
- [ ] Multi-tenant isolation test
- [ ] ≥80% branch coverage (JaCoCo)
- [ ] Reviewer PASS + Librarian sign-off

---

## Recommendations

1. **Start Tier 1 immediately** (704–706) — no blockers, highest ROI
2. **Parallelize Tier 1** — all 3 stories can run in parallel
3. **Create missing story files (707–711)** in parallel with Tier 1 implementation
4. **Sequential Tier 2** — US-707 must complete before US-708 starts
5. **Parallelize Tier 3** — US-709 & US-711 can run in parallel (no dependencies)

---

## Risk Factors

- **Tier 2 (US-707/708):** Requires shipper UX design input; potential rework if BA clarifies mid-build
- **Caching complexity:** Phase 7 has strict cache invalidation requirements; test thoroughly
- **Multi-tenant edge cases:** Load visibility rules (preferred carriers, blocked carriers) interact; need integration tests

---

**Status:** Ready to begin Tier 1 (US-704, 705, 706)  
**Next Action:** Confirm Tier 1 scope or start story creation for missing files (707–711)
