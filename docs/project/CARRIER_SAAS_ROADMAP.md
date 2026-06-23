# FreightClub Carrier SaaS Platform Roadmap

**Version:** 1.0  
**Status:** PLANNING → PHASE 7 IMPLEMENTATION  
**Last Updated:** 2026-06-23  
**Owner:** Business Analysis (Michael) + Product Team

---

**Related Documents:**
- [[US-730_MVP_SCOPE]] — Phase 7 MVP scope (manual payment, mobile-first)
- [[CARRIER_SAAS_AUDIT_REPORT]] — ARCHITECT + HFD audit of current implementation
- [[SHIPPER_CARRIER_DEPENDENCY_MATRIX]] — Shipper dependencies (none for MVP)
- [[CARRIER_DASHBOARD_FUNCTIONALITY_SPEC]] — Owner-operator value statements
- [[US-730_Trucker_Dashboard_Redesign]] — US-730 user story + acceptance criteria
- [[owner_operator]] — Owner-operator persona definition

---

## 🎯 Platform Vision

**FreightClub for Carriers** is a comprehensive operations platform enabling **Owner-Operators** (independent truckers owning 1-4 trucks) to:

1. **Find profitable loads** — Browse shipper-posted loads with automatic profitability scoring
2. **Manage their business** — Track costs, calculate minimum RPM, make data-driven decisions
3. **Execute operations** — Claim loads, mark milestones, upload proof of delivery
4. **Build reputation** — Earn ratings, track delivery history, establish carrier credibility
5. **Get paid fast** — Transparent settlement, real-time earnings tracking, flexible payout options

**Differentiation:** Unlike traditional freight brokers, FreightClub empowers O/Os with **cost transparency**, **RPM-based filtering**, and **direct shipper relationships**.

---

## 👤 Persona: Owner-Operator

**Who they are:**
- Independent trucker owning 1-4 trucks (self-operated or managing 1-3 drivers)
- Age 35-65, 15-40 years industry experience
- Cost-conscious, math-driven, mobile-first (uses app in truck cab)
- Values: Transparency, fair rates, no middleman, predictable income

**What they care about (Priority Order):**
1. **"Will this load make me money?"** — Profitability visibility (green/yellow/red badges)
2. **"What's my break-even?"** — Cost profile + RPM calculation
3. **"How do I manage my equipment?"** — Equipment specs, condition, capacity
4. **"How do I claim loads fast?"** — 1-tap claiming, preferred lanes, availability
5. **"Where do I make money consistently?"** — Lane preferences, historical earnings
6. **"Am I compliant?"** — HOS tracking, insurance verification
7. **"Get me paid"** — Settlement, earnings history, tax reporting

**Critical Validations (from persona):**
- ✅ OO-CRIT-2: Equipment specs (type, capacity, dimensions)
- 🔴 OO-CRIT-3: Cost profile (fixed/fuel/variable CPM, min RPM)
- 🔴 OO-CRIT-4: Load board RPM filtering
- ✅ OO-CRIT-5: Preferred lanes & availability
- 🔴 OO-CRIT-6: One active load constraint
- ✅ OO-CRIT-7: Public profile equipment visibility
- 🔴 OO-CRIT-8: Performance reputation system
- ⏳ OO-CRIT-1: HOS tracking (Phase 9, deferred)

---

## 📊 Phase Roadmap

### Phase 7: Carrier MVP Foundation (16 stories) — **ACTIVE**

**Goal:** Enable O/Os to browse loads, calculate profitability, claim loads, and complete deliveries with basic reputation. Includes Operations Dashboard (US-730 Epic) with manual payment acknowledgment (no settlement processing).

**DESIGN CONSTRAINT:** All Carrier UI is **MOBILE-FIRST** — Owner-operators use phones in truck cab 95% of the time. Desktop/tablet support is optional. Dashboard must work on iPhone SE (375px) with gloved hand input.

**Core Stories:**
| Story | Title | Status | Dependency | O/O Validation |
|-------|-------|--------|-----------|-----------------|
| US-701 | Carrier Profiles (Equipment) | ✅ COMPLETED | — | OO-CRIT-2 ✅ |
| US-702 | Preferred Lanes (Region-Based) | ✅ COMPLETED | US-701 | OO-CRIT-5 ✅ |
| US-703 | Availability (Days/Hours) | ✅ COMPLETED | US-701 | OO-CRIT-5 ✅ |
| US-705 | Load Board Filters (Weight, Min Pay) | ⚠️ PARTIAL | US-701 | OO-CRIT-4 🔴 |
| US-707 | Shipper Preferred Carrier List | ✅ COMPLETED | US-101 | — |
| US-707-v2 | Preferred Carriers: Nav + Search Redesign | ✅ COMPLETED | US-707 | — |
| US-708 | Direct Load Assignment to Carrier | ⏳ MIGRATION_PENDING | US-707 | — |
| US-709 | Block Carrier (Prevent Visibility) | ⏳ MIGRATION_PENDING | US-101 | — |
| US-710 | View Carrier Public Profile | ✅ COMPLETED | US-402 | OO-CRIT-7 ✅ |
| US-711 | Load Interest / View Count Tracking | ⏳ MIGRATION_PENDING | US-101 | — |

**US-730 EPIC: Trucker Dashboard (Operations Hub) — 7 Sub-Stories**

| Story | Title | Status | Scope | Value Prop |
|-------|-------|--------|-------|-----------|
| **US-730-0** | **Dashboard Structure & IA** | 🔴 **READY_FOR_DESIGN** | **HFD Only** | **Locked wireframe + responsive specs** |
| **US-730a** | **Cost Profile Setup** | 🔴 **READY_FOR_DESIGN** | **FULL_STACK** | **O/O calculates break-even RPM** |
| **US-730b** | **Profitable Load Visibility** | 🔴 **READY_FOR_DESIGN** | **FULL_STACK** | **Load board shows only $ loads (green/yellow/red badges)** |
| **US-730c** | **Performance Visibility** | 🔴 **READY_FOR_DESIGN** | **BACKEND** | **O/O tracks acceptance %, on-time %, completion rate** |
| **US-730d** | **Unified Dashboard** | 🔴 **READY_FOR_DESIGN** | **FULL_STACK** | **Single operations control center (hero + stats + loads)** |
| **US-730e** | **Equipment & Lane Management** | 🔴 **READY_FOR_DESIGN** | **FULL_STACK** | **O/O tells shippers what they haul & where they go** |
| **US-730f** | **Payment Acknowledgment (MVP)** | 🔴 **READY_FOR_DESIGN** | **FULL_STACK** | **O/O logs "Payment received on [date]" for tax tracking** |

**Phase 7 Completion Criteria:**
- ✅ O/Os can manage equipment profiles
- ✅ O/Os can set preferred lanes & availability
- ✅ O/Os can calculate cost profile & see min RPM (US-730a)
- ✅ Load board filters by O/O's minimum RPM (US-730b)
- ✅ O/Os can claim loads (1 active constraint enforced)
- ✅ O/Os have unified operations dashboard (US-730d)
- ✅ O/Os can log payment received (US-730f — MVP payment acknowledgment only)
- ✅ O/Os have public reputation profiles
- ✅ Shippers can search & filter carriers

**MVP Payment Model:** Phase 7 uses **manual payment acknowledgment** (date picker). Actual settlement (Stripe/ACH) deferred to Phase 9. No earnings tracking in MVP.

**No Shipper Blockers:** All 8 Shipper prerequisites for Carrier MVP are COMPLETE. Carrier Dashboard launches independently.

---

### Phase 7b: Financial Intelligence for Carriers (Proposed)

**Goal:** Give O/Os predictive insights into lane profitability, equipment utilization, and earnings optimization.

**Stories:**
| Story | Title | Description | O/O Value |
|-------|-------|-------------|-----------|
| US-740 | Cost Profile Deep Dive (Dashboard) | Edit fixed/variable costs, see real-time CPM, min RPM breakdown | Know exact break-even |
| US-741 | Diesel Price Integration (Real-Time) | Show regional prices, trend charts, CPM impact calculator | Adjust rates with fuel swings |
| US-742 | Lane Profitability Analytics (7/30/90-day) | Show $ earned per lane, $/mile trends, profitable vs unprofitable routes | Focus on money lanes |
| US-743 | Equipment Utilization Tracker | Track hours/miles per truck, maintenance due, condition ratings | Manage fleet efficiently |
| US-744 | Preferred Lanes Optimization (AI) | Recommend new lanes based on O/O's historical earnings + shipper demand | Auto-optimize preferences |
| US-745 | Load Rejection Dashboard | Track why O/O is rejecting loads, pattern analysis (too low pay, wrong route, etc.) | Better matching |

---

### Phase 8: Compliance & Regulatory (Proposed)

**Goal:** Ensure O/Os stay compliant with FMCSA, insurance, and financial regulations.

**Stories:**
| Story | Title | Description | O/O Value |
|-------|-------|-------------|-----------|
| US-800 | HOS Tracking (70-Hour / 8-Day Cycle) | Track driving/on-duty/off-duty/sleeper hours via ELD integration | Avoid violations |
| US-801 | Insurance Verification & Renewal Alerts | Auto-verify carrier insurance, notify before expiration | Reduce downtime |
| US-802 | Safety Score Dashboard (CSA/SAFER) | Integrate FMCSA CSA metrics, highlight problem areas | Monitor compliance |
| US-803 | Tax Summary Export (Quarterly/Annual) | Auto-calculate taxable income, generate P&L for accountants | Tax filing ready |

---

### Phase 9: Payments & Settlement (Proposed) — **MOVED FROM MVP**

**Goal:** Enable flexible, transparent payment options and real-time earnings visibility.

**Stories (Phase 9 — Post-MVP):**
| Story | Title | Description | O/O Value | Blocker Status |
|-------|-------|-------------|-----------|---|
| **US-502-v2** | **Payment Processing (Stripe/ACH)** | **Actual settlement: carrier receives payment via Stripe or bank transfer** | **Get paid automatically** | **Moved from Phase 5** |
| US-850 | Earnings Dashboard (Per-Load P&L) | Show revenue, costs (fuel/maint/fixed), net profit per load + trends | Transparent income | Depends on US-502-v2 |
| US-851 | Settlement Options (Standard/Quick/Ultra-Fast) | 2-3 day / next day / same day payouts with tiered fees | Get paid when needed | Depends on US-502-v2 |
| US-852 | Payment History & Disputes | Track all payouts, dispute unresolved loads, resolution timeline | Financial peace of mind | Depends on US-502-v2 |
| US-853 | Tax Summary & Reporting (1099/Schedule C) | Auto-generate tax-ready reports for accountants | Simpler tax season | Depends on US-502-v2 |

**NOTE:** US-502 (Payment Processing) was originally in Phase 5 but is deferred to Phase 9 to keep Carrier MVP simple (manual payment acknowledgment only). MVP Carrier Dashboard launches WITHOUT real earnings tracking or payment settlement.

---

### Phase 10: Carrier Dashboard Refinement (Proposed)

**Goal:** Polish operations dashboard for mobile-first, high-stress field use.

**Stories:**
| Story | Title | Description | O/O Value |
|-------|-------|-------------|-----------|
| US-900 | Carrier Header Navigation & Notifications | Logo, notification bell (claims, shipper messages, payment alerts), profile dropdown | Quick navigation |
| US-901 | Active Load Hero Panel (Mobile-Optimized) | Pickup/delivery, status, ETA, map snippet, action buttons (mark pickup/delivery) | One-tap operations |
| US-902 | Performance Metrics (Real-Time) | Acceptance %, on-time %, today's earnings, completion rate with live pulse indicator | Know at a glance |
| US-903 | Available Loads (Scannable Cards) | Filter/sort by distance/pay/profitability, 1-tap claim, no friction | Quick load selection |
| US-904 | Preferred Lanes Quick Filter | Toggle preferred lanes ON/OFF in load board, show only matching lanes | Faster browsing |

---

## 🏗️ Current Implementation Status (MVP Scope)

### ✅ DONE (Foundation Complete for Phase 7 MVP)

- Equipment profiles (US-701)
- Preferred lanes & availability (US-702, US-703)
- Public profile visibility (US-710)
- Load claiming workflow (core platform)
- Milestone tracking (picked up, delivered)
- POD photo uploads (US-305, US-303)
- Rating & reputation (US-401, US-402, US-403)
- One-active-load constraint (enforced in LoadService)

### 🔴 GAPS for US-730 (Backend APIs Needed)

| Gap | Impact | Story | Needed For | Phase |
|-----|--------|-------|-----------|-------|
| Cost Profile API incomplete | Can't read/write cost profile | US-730a | Load board filtering, profitability scoring | 7 |
| RPM filtering not enforced | O/Os see non-profitable loads | US-730b | Load board filtering, cost awareness | 7 |
| Performance metrics aggregation missing | Dashboard can't show stats (acceptance %, on-time %, completion %) | US-730c | Carrier operations hub | 7 |

### ✅ MOVED TO PHASE 9 BACKLOG (Out of MVP Scope)

- US-502-v2: Payment Processing (Stripe/ACH) — moved from Phase 5
- Real-time earnings tracking (requires settlement calculations)
- Actual money transfers via payment processor
- Earnings aggregation service (depends on settlement data)

**Phase 7 MVP Payment Handling:** Manual acknowledgment only. O/O logs "Payment received on [date]" in dashboard; no actual money movement, no settlement calculations. Provides tax tracking baseline for Phase 9 integration.

**Why Deferred to Phase 9:** Payment processing is complex (PCI compliance, Stripe integration, settlement reconciliation) and not required for MVP operations. MVP focuses on load discovery, cost tracking, and reputation building. Payment settlement can be added post-launch without breaking existing workflows.

### ⏳ IN PROGRESS

- Load Creation Redesign (US-103-v2) — ✅ MERGED (shipper side)
- Shipper Dashboard (US-820–825) — ✅ COMPLETED
- Phase 5 Payments (US-501, US-502, US-506) — ✅ PARTIAL (settlement engine exists)

---

## 📋 Dependencies & Build Order

**Carrier SaaS Maturity Levels:**

```
Level 1 (MVP):
  ├─ Browse loads ✅
  ├─ Claim loads ✅
  ├─ Mark milestones ✅
  ├─ Upload POD ✅
  ├─ Rate shippers ✅
  └─ Public profile ✅

Level 2 (Phase 7 Complete) — CRITICAL GAP:
  ├─ Cost profile setup 🔴 [MISSING]
  ├─ RPM calculation 🔴 [MISSING]
  ├─ RPM-based filtering 🔴 [MISSING]
  ├─ Preferred lanes 🔴 [INCOMPLETE]
  ├─ One active load constraint 🔴 [MISSING]
  ├─ Performance dashboard 🔴 [MISSING]
  └─ Carrier dashboard UI 🔴 [DESIGNED, AWAITING]

Level 3 (Phase 7b): Lane analytics, fuel integration, equipment tracking
Level 4 (Phase 8): HOS, insurance, compliance
Level 5 (Phase 9): Payments, settlement, earnings
Level 6 (Phase 10): Dashboard polish, mobile optimization
```

---

## 🚨 Recommended Action Plan

**Immediate (This Sprint):**

1. **Finalize US-730 (Carrier Dashboard) User Story**
   - BA approval required: Accept/revise ACs in `docs/business/stories/US-730_Trucker_Dashboard_Redesign.md`
   - Confirm scope: Just dashboard UI, or include cost profile & RPM logic?

2. **Address Critical Gaps (Phase 7 Blockers)**
   - [ ] US-730: Implement cost profile API + dashboard aggregation endpoint
   - [ ] US-705: Enforce RPM filtering in LoadService.searchLoads()
   - [ ] LoadService: Implement one active load constraint in claimLoad()
   - [ ] Create performance metrics aggregation query (acceptance %, on-time %, earnings)

3. **Update Story_Map.md**
   - Add US-730 to Phase 7b or Phase 10 (TBD by you)
   - Flag blocking dependencies
   - Mark OO-CRIT validations as in-progress

---

## 📊 Success Metrics (Carrier SaaS)

| Metric | Target | Phase | Tracking |
|--------|--------|-------|----------|
| Carrier onboarding (register → first load claim) | <15 min | 7 | Session analytics |
| Cost profile adoption rate | >80% | 7 | Feature usage |
| Load claim acceptance rate (% loads claimed) | >40% | 7 | Load claim metrics |
| Average earnings per O/O per week | $2,000+ | 8 | Payment analytics |
| On-time delivery % (platform-wide carrier avg) | >95% | 7+ | Load status tracking |
| HOS compliance violations (pre-Phase 8) | Measure baseline | 7 | Manual audit |
| Carrier retention (90-day DAU) | >70% | 8+ | Churn analytics |

---

## 🎬 Next Steps

**For Michael (BA Lead):**

1. **Review & approve** US-730 story: `docs/business/stories/US-730_Trucker_Dashboard_Redesign.md`
2. **Clarify scope:** Is US-730 **UI-only** (dashboard design) or **FULL_STACK** (includes cost profile + RPM logic)?
3. **Prioritize Phase 7b** stories — which features drive the most value for O/Os?
4. **Define Phase 8 roadmap** — HOS tracking is critical for compliance; when should we start?

**For Architecture:**
- Design cost profile API schema (if not in US-730 scope)
- Plan RPM filtering integration in LoadService
- Design dashboard aggregation endpoint performance (caching strategy?)

**For Coder:**
- TDD approach for cost profile domain (Red-Green-Refactor)
- Integration tests for RPM filtering
- Dashboard aggregation endpoint with performance targets

---

## 📚 References

- **Owner-Operator Persona:** `docs/personas/owner_operator.md`
- **Carrier Page Example:** `docs/project/specs/carrier-page-example.png`
- **Platform Features:** `docs/business/FEATURES.md` (Trucker section)
- **US-730 Story:** `docs/business/stories/US-730_Trucker_Dashboard_Redesign.md`
- **Story Map:** `docs/project/Story_Map.md`

---

**Status:** READY FOR BA REVIEW & APPROVAL  
**Last Updated:** 2026-06-23
