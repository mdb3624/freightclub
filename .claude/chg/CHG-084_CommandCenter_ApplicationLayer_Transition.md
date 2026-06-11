# CHG-084: Transition to Command Center Application Layer

**Status:** OPEN → APPROVED (Librarian Decision)  
**Date Created:** 2026-06-10  
**Authority:** LIBRARIAN (Governance & Escalation)  
**Linked Phase:** Phase 10 (Command Center)

---

## Summary

This change request documents the **governance and documentation updates** required to transition from Phase 7 (Fleet Management) to Phase 10 (Command Center). This is NOT a technical blocker, but rather a **traceability and process improvement** initiative.

---

## Root Cause

During Phase 10 planning, the initial work breakdown was **infrastructure-focused** (domain services, repositories, caching layers) rather than **user-value-focused** (shipper-facing features). This violated the core SDLC principle:

> **"All stories are supposed to be from a user perspective of what value the user is getting."** — BUSINESS_ANALYST.md

**Problem:** The distinction was not explicitly enforced in the BA role definition, allowing infrastructure-focused stories to slip through validation.

---

## Technical Blocker

**None.** This change request is purely administrative and governance-focused.

---

## Decision: OPTION A (Approved)

**Selected by:** LIBRARIAN  
**Date:** 2026-06-10

**What We're Doing:**
1. ✅ Update `CLAUDE.md`: Change Active Phase to Phase 10 (Command Center)
2. ✅ Update `BUSINESS_ANALYST.md`: Add **Platform Foundation Mapping** requirement to Field Contract Table Duties
3. ✅ Create `COMMAND_CENTER_ROADMAP.md`: Document Phase 10/11/12 with user-value-driven stories
4. ✅ Implement BA story validation gate: Every story MUST map to shipper/dispatcher value + user persona + load lifecycle

**Why Option A:**
- Prevents future infrastructure-only stories
- Enforces sequential gate protocol (no rework loops)
- Creates traceable audit trail in roadmap
- Minimal scope: documentation only (no code rewrites)

---

## Files Modified

| File | Change | Reason |
|------|--------|--------|
| `CLAUDE.md` | Active Phase: Phase 7 → Phase 10 | Signal transition to Command Center architecture |
| `BUSINESS_ANALYST.md` | Add Platform Foundation Mapping (duty #3) | Enforce user-value-first story validation |
| `docs/roadmaps/COMMAND_CENTER_ROADMAP.md` | NEW: 28-day roadmap (Phase 10/11/12) | Traceability & scheduling |

---

## Traceability

**Related Documents:**
- `COMMAND_CENTER_BA_SIGN_OFF.md` (7 locked NFR decisions)
- `PLAN_CommandCenter_KPI_DDD.md` (8-day domain design plan)
- `SDLC_GOVERNANCE_ALL_ROLES.md` (Sequential lock protocol)

**Change Chain:**
```
CHG-084 (Documentation/Governance)
    ↓
BUSINESS_ANALYST creates US-820 through US-827 (user-value stories)
    ↓
ARCHITECT designs domain model per BA stories
    ↓
HFD designs shipper-facing UI
    ↓
CODER implements Phase 10 (2026-06-16 start)
```

---

## Impact

### What Stays the Same
- Sequential gate protocol (BA → ARCH → HFD → CODER → REVIEWER → LIBRARIAN)
- 80% branch coverage requirement (JaCoCo)
- TDD methodology (Red → Green → Refactor)
- WCAG AA accessibility standards

### What Changes
- BA stories now MUST include Platform Foundation Mapping (use case: Post → Claim → Deliver)
- Infrastructure work is now a MEANS, not an END (no standalone "domain services" stories)
- All Phase 10 stories are FULL_STACK (frontend + backend together)

### Scope Impact
- **Phase 10 stories:** Reduced from 12 infrastructure-focused to **8 user-value-focused** stories
- **Effort:** No change (8 days still holds; focus is cleaner)
- **Timeline:** No impact (Phase 10 start: 2026-06-16)

---

## Next Steps

1. **BA Role** (by EOD 2026-06-13): Create story files for US-820–US-827 using new Platform Foundation Mapping
2. **ARCHITECT** (2026-06-16 start): Review BA stories, confirm they align with domain model
3. **CODER** (2026-06-16 start): Begin Phase 10 implementation with 8 user-feature stories

---

## Escalation Path

If any Phase 10 story discovers that Platform Foundation Mapping is incomplete or impossible:
1. Raise CHG ticket (e.g., CHG-085)
2. Escalate to LIBRARIAN
3. LIBRARIAN decides: finish story as-is OR create new US-###-v2 with reworked BA inputs

**No backward communication to BA.** Issues escalate forward only.

---

## Sign-Off

**LIBRARIAN Decision:** ✅ **APPROVED**  
**Reason:** Governance improvement, no technical blocker, enforces core SDLC principle.

**Status:** Documentation updates complete. Ready for Phase 10 kickoff (2026-06-16).

---

**CHG Status:** CLOSED → IMPLEMENTING  
**Authority:** LIBRARIAN  
**Date:** 2026-06-10  
**Valid Until:** Superseded by new CHG or explicit revision

---

## Appendix: Before/After

### Before (Infrastructure-Focused)
```
US-800: Create Domain Value Objects
US-801: Create Domain Calculators
US-802: Design ShipmentDashboardRepository Port
US-803: Implement ShipmentDashboardRepositoryImpl (JPA)
... (12 stories, backend-only focus)
```

### After (User-Value-Focused)
```
US-820: KPI Summary Display
  → Actor: Shipper
  → Value: See business health at a glance
  → Frontend: KPI cards (active count, on-time %, cost/mile)
  → Backend: GET /api/v1/shipper/dashboard-summary
  
US-821: Status-First Shipment List
  → Actor: Dispatcher
  → Value: Prioritize delayed loads first
  → Frontend: Shipment list sorted by status
  → Backend: Load filtering + sorting logic
  
... (8 stories, each with frontend + backend)
```

**Key difference:** Infrastructure is now a DETAIL within each user story, not a separate story.

---

**Document Status:** LOCKED FOR PHASE 10 EXECUTION  
**Version:** 1.0  
**Last Updated:** 2026-06-10
