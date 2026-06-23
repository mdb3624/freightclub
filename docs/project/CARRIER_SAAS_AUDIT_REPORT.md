# Carrier SaaS Platform — Comprehensive Audit Report

**Date:** 2026-06-23  
**Auditors:** ARCHITECT + HFD  
**Status:** CRITICAL GAPS IDENTIFIED — **US-730 BLOCKED**  
**Recommendation:** Complete Tier 1 backend work BEFORE starting US-730 UI

---

**Related Documents:**
- [[CARRIER_SAAS_ROADMAP]] — Phase roadmap (context for audit)
- [[US-730_MVP_SCOPE]] — MVP scope addressing gaps identified in audit
- [[US-730_Trucker_Dashboard_Redesign]] — User story with updated AC for design gate
- [[CARRIER_DASHBOARD_FUNCTIONALITY_SPEC]] — Functional requirements for dashboard

---

## 📊 Executive Summary

**Current State:** FreightClub has **70% of Phase 7 infrastructure** (database, services, domain logic) but **0% of carrier-facing UI**. Critical backend gaps block the Carrier Dashboard (US-730) from being built.

**Blocker Status:**
- 🔴 **5 HIGH-severity backend gaps** (RPM filtering, metrics aggregation, API endpoints)
- 🔴 **7 UI components missing** (dashboard, layout, forms, hero panels)
- 🟡 **Design system needs Carrier-specific theme** (dark/mobile vs. Shipper white/desktop)
- ✅ **Domain models in place** (equipment, cost profile, lanes all exist + RLS)
- ✅ **One-active-load constraint enforced** (OO-CRIT-6 ✅)

**Timeline Impact:** Tier 1 backend work = 10-12 hours. **Do NOT start US-730 UI until backend is ready.**

---

## 🏗️ ARCHITECTURE AUDIT (ARCHITECT Role)

### Critical Gaps Blocking US-730

| Gap | Status | Severity | Impact | Fix Time |
|-----|--------|----------|--------|----------|
| **RPM Filtering in LoadService** | 🔴 MISSING | **CRITICAL** | Load board doesn't filter by carrier's min RPM; violates OO-CRIT-4 | 3 hrs |
| **Cost Profile API Endpoints** | 🔴 MISSING | **CRITICAL** | Service exists but no REST endpoints; UI can't read/write profile | 2 hrs |
| **Dashboard Aggregation Endpoint** | 🔴 MISSING | **CRITICAL** | No single endpoint to hydrate dashboard (metrics + active load + lanes) | 2 hrs |
| **Performance Metrics Service** | 🔴 MISSING | **CRITICAL** | No calculation of acceptance %, on-time %, earnings; blocks dashboard stats | 4 hrs |
| **Equipment & Lanes API** | 🔴 MISSING | **HIGH** | Frontend can't list carrier's equipment or preferred lanes | 2 hrs |

### What EXISTS (Foundation Solid)

✅ **Domain Models:**
- `CarrierEquipment` table + RLS policies (Phase 7)
- `CarrierCostProfile` table + RLS policies (Phase 7)
- `CarrierLane` table + RLS policies (Phase 7)
- Service layer: `CarrierCostProfileService` (calculations implemented)

✅ **Business Rules Enforced:**
- One-active-load constraint: `LoadApplicationService.claimLoad()` validates (line 60-64)
- Cost profile formulas: Fixed/Fuel/Variable/Total CPM + Min RPM calculation ✅
- Soft delete + tenant isolation via RLS ✅

### What's MISSING (Backend)

**Tier 1 (Blocks US-730):**
1. `GET /api/v1/trucker/{id}/cost-profile` — Read cost profile
2. `PUT /api/v1/trucker/{id}/cost-profile` — Write cost profile
3. `GET /api/v1/trucker/{id}/equipment` — List equipment
4. `GET /api/v1/trucker/{id}/lanes` — List preferred lanes
5. `GET /api/v1/trucker/{id}/dashboard` — Single aggregation endpoint (cost profile + metrics + active load + lanes)
6. `LoadApplicationService.searchLoads()` — Add RPM filtering
7. `CarrierMetricsService` — Calculate acceptance %, on-time %, earnings (with caching)

**Tier 2 (Phase 7b):**
- Diesel price service integration
- Lane profitability analytics (7/30/90-day queries)

### ARCHITECT Assumptions vs. Reality

| Assumption in Roadmap | Current Implementation | Gap |
|----------------------|----------------------|-----|
| Cost profile exists + is enforced | Table exists, service exists, **API missing** | APIs not exposed to frontend |
| RPM filtering in load board | LoadSearchCriteria only has `minRate`, not `minimumRPM` | **No RPM filtering logic** |
| Metrics visible on dashboard | No aggregation service | **Queries don't exist** |
| One active load constraint | `countActiveLoadsByCarrier()` enforced ✅ | ✅ Correct |

---

## 🎨 HFD AUDIT (Human Factors Designer Role)

### UI Component Gap Analysis

| Component | Status | Severity | Owner | Notes |
|-----------|--------|----------|-------|-------|
| **CarrierPageLayout** | ❌ MISSING | CRITICAL | HFD | Equivalent to ShipperPageLayout; must adapt for dark mobile theme |
| **CarrierDashboard** | ❌ MISSING | CRITICAL | CODER | Route `/carrier/dashboard` page; hero + stats + loads |
| **CostProfileForm** | ❌ MISSING | CRITICAL | HFD/CODER | UI for editing fixed/fuel/variable costs; blocks cost profile setup |
| **ActiveLoadHeroPanel** | ❌ MISSING | HIGH | HFD | Pickup/delivery/ETA/status/action buttons |
| **PerformanceMetricsCard** | ❌ MISSING | HIGH | HFD | Real-time acceptance %, on-time %, earnings display |
| **LoadCard (Carrier variant)** | ⚠️ PARTIAL | HIGH | HFD | Exists for Shipper; needs profitability badges (green/yellow/red) for Carrier |
| **CarrierHeader** | ❌ MISSING | MEDIUM | HFD | Logo + notification bell + avatar dropdown (mobile-optimized) |

### Design System Status

**What exists:**
- ✅ Tailwind CSS with semantic tokens (success #22C55E, warning #F59E0B, error #EF4444)
- ✅ ShipperPageLayout pattern (reusable template)
- ✅ LoadCard component (reusable, needs variant)

**What's missing:**
- ❌ CarrierThemeContext (Shipper has PersonaThemeContext for shipper-surface tokens)
- ❌ Carrier color palette locked (page example shows dark mobile theme; Shipper is white desktop)
- ❌ Carrier HFD design spec (locked mocks, typography, layout, accessibility specs)

**Theme Question:** Carrier page example shows **DARK theme** (mobile-first, truck cab use), vs. Shipper **WHITE/LIGHT theme** (desktop-first). **Assumption: Two different themes per persona.**

### Mobile-First Readiness (Critical for Owner-Operators)

🔴 **NOT YET DESIGNED FOR FIELD USE:**
- No 44px+ tap targets spec for gloved/hazmat hands
- No high-glare sunlight contrast testing specs
- No one-handed thumb-reach navigation zones
- No offline/low-connectivity data caching
- No voice/audio support (owner-operators drive + manage loads simultaneously)

**Persona Requirement:** "Mobile-first (uses app in truck cab)" — but zero field-specific UX specs exist.

### HFD Blockers for US-730

1. **Locked Carrier HFD Design Spec Missing** — Shipper has `docs/hfd/US-103-v2_DESIGN_SPEC.md`; Carrier needs equivalent (theme, layout, components, accessibility, mobile-field specs)
2. **CarrierPageLayout Not Built** — ShipperPageLayout exists; Carrier needs variant (dark theme, mobile-optimized)
3. **Cost Profile Form Undefined** — Simple toggle form or detailed breakdown with live CPM calculator? (Design decision needed)
4. **Route Not Created** — `/carrier/dashboard` doesn't exist; needs routing + component wiring

---

## 🚨 Comprehensive Blocker Analysis

### Blocker #1: Backend Cost Profile API
**Blocks:** US-730 UI (can't display cost profile form), US-705 (can't filter loads by min RPM)  
**Fix:** Create 2 endpoints (GET/PUT) + expose in CarrierController  
**Time:** 2 hours  
**Dependency:** OO-CRIT-3 completion

### Blocker #2: RPM Filtering in Load Board
**Blocks:** US-730 dashboard (profitability calculations), US-705 (load board filtering)  
**Fix:** Inject CarrierCostProfileService into LoadApplicationService.searchLoads(); calculate minRPM per carrier; filter WHERE load.rate >= minRPM  
**Time:** 3 hours  
**Dependency:** Cost Profile API + CarrierMetricsService

### Blocker #3: Performance Metrics Service
**Blocks:** US-730 dashboard (KPI cards), Carrier reputation visibility  
**Fix:** Create CarrierMetricsService with queries for acceptance %, on-time %, earnings; add caching (5-min TTL)  
**Time:** 4 hours  
**Dependency:** Load repository + metrics aggregation queries

### Blocker #4: Dashboard Aggregation Endpoint
**Blocks:** US-730 UI (single load endpoint)  
**Fix:** Create `GET /api/v1/trucker/{id}/dashboard` combining: cost profile + metrics + active load + preferred lanes  
**Time:** 2 hours  
**Dependency:** All above services

### Blocker #5: Carrier HFD Design Spec Not Locked
**Blocks:** US-730 UI build (no mocks, no accessibility specs, theme TBD)  
**Fix:** HFD creates locked design spec (dark theme, mobile layout, field-use specs)  
**Time:** 4-8 hours (depends on design complexity)  
**Dependency:** BA approval of Carrier theme + component library

---

## 📋 Recommended Implementation Order (Tier 1 → US-730)

### TIER 1: Backend Foundation (10-12 hrs total)
**Must complete BEFORE US-730 UI starts:**

1. ✅ **Cost Profile API** (2 hrs) — ARCHITECT + CODER
   - GET/PUT endpoints in CarrierController
   - Expose minimum RPM calculation
   
2. ✅ **RPM Filtering in LoadService** (3 hrs) — CODER
   - Inject CarrierCostProfileService
   - Filter loads in searchLoads()
   - Add `minimumRpmFilter` to LoadSearchCriteria
   
3. ✅ **CarrierMetricsService** (4 hrs) — CODER
   - Acceptance % query
   - On-time % query
   - Earnings summation
   - 5-min cache (Redis or in-memory)
   
4. ✅ **Equipment & Lanes APIs** (2 hrs) — CODER
   - GET /api/v1/trucker/{id}/equipment
   - GET /api/v1/trucker/{id}/lanes
   
5. ✅ **Dashboard Aggregation Endpoint** (2 hrs) — CODER
   - GET /api/v1/trucker/{id}/dashboard
   - Combines cost profile + metrics + active load + lanes

### TIER 2: Frontend Foundation (Before US-730 UI Coding)
**Must complete BEFORE component build:**

1. ✅ **Carrier HFD Design Spec** (4-8 hrs) — HFD
   - Lock theme (dark? mobile-first? field use specs?)
   - Create component hierarchy mockups
   - Accessibility specs (WCAG AA)
   - Mobile-first breakpoints + tap target specs
   
2. ✅ **CarrierPageLayout Component** (2 hrs) — CODER
   - Copy ShipperPageLayout, adapt for Carrier theme
   - Dark surface tokens, mobile navigation
   
3. ✅ **Route Setup** (0.5 hrs) — CODER
   - Create `/carrier/dashboard` route
   - Wire CarrierDashboard component

### TIER 3: US-730 UI Components (After TIERS 1 & 2)
**Now safe to build US-730:**

1. **CostProfileForm** (4 hrs) — CODER + HFD design
2. **ActiveLoadHeroPanel** (3 hrs) — CODER + HFD design
3. **PerformanceMetricsCards** (3 hrs) — CODER + HFD design
4. **LoadCard (Carrier variant)** (2 hrs) — CODER + HFD design
5. **Dashboard page assembly** (2 hrs) — CODER integration

**Total for US-730 UI (after backend + design ready):** ~14 hours

---

## 📊 Readiness Summary

| Phase | Component | Ready | Blocker |
|-------|-----------|-------|---------|
| **Phase 7** | Domain models | ✅ YES | — |
| | Business rules (one-active, RLS) | ✅ YES | — |
| | Cost profile backend | ✅ YES (API missing) | Cost Profile endpoints |
| | RPM filtering | ❌ NO | LoadService integration |
| | Metrics aggregation | ❌ NO | CarrierMetricsService |
| | **Carrier UI** | ❌ NO | HFD spec + components |
| **US-730** | Backend ready? | ⚠️ PARTIAL | Tier 1 (10-12 hrs) |
| | Frontend ready? | ❌ NO | Tier 2 (4-8 hrs) |
| | Can start NOW? | ❌ NO | **Complete Tier 1 first** |

---

## 🎯 Action Items for BA

1. **Review this audit** — Confirm backend gaps match your expectations
2. **Prioritize Tier 1 work** — Should Tier 1 be done BEFORE US-730 design starts, or in parallel?
3. **Unblock HFD design** — Clarify Carrier theme (dark mobile or white desktop?) before HFD creates spec
4. **Confirm US-730 scope** — Is it **UI-ONLY** (assuming APIs exist) or **FULL_STACK** (includes Tier 1 backend)?

**If US-730 is FULL_STACK:** Merge Tier 1 + Tier 2 + US-730 into a single 4-week story (backend + design + UI).  
**If US-730 is UI-ONLY:** Complete Tier 1 (1 week) → HFD design (1 week) → US-730 UI build (2 weeks).

---

**Next Meeting:** BA confirms findings, prioritizes Tier 1, unblocks HFD design → ARCHITECT finalizes schema + CarrierMetricsService design → CODER starts Tier 1 implementation

---

**Audit Completed By:** ARCHITECT Role + HFD Role  
**Date:** 2026-06-23  
**Status:** READY FOR BA DECISION
