# US-730 Carrier Dashboard — MVP vs. Post-MVP Scope

**Date:** 2026-06-23  
**Status:** SCOPE LOCKED FOR PHASE 7 MVP  
**Owner:** BA (Michael)

---

**Related Documents:**
- [[CARRIER_SAAS_ROADMAP]] — Phase 7 roadmap (context)
- [[CARRIER_SAAS_AUDIT_REPORT]] — Audit of current implementation (gaps fixed by MVP)
- [[SHIPPER_CARRIER_DEPENDENCY_MATRIX]] — No Shipper blockers (MVP independent)
- [[CARRIER_DASHBOARD_FUNCTIONALITY_SPEC]] — What the dashboard does (value statements)
- [[US-730_Trucker_Dashboard_Redesign]] — Story + AC with mobile-first requirements

---

## 🎯 Executive Summary

**US-730 MVP (Phase 7):** Owner-Operator can set cost profile, see profitable loads, track reputation (acceptance %, on-time %, completion %), manage equipment/lanes, and acknowledge when payment received — **all optimized for mobile phone (truck cab use).**

**US-730 Post-MVP (Phase 9):** Add actual payment processing (Stripe), real-time earnings tracking, and settlement management.

**Key Decisions:**
- Manual payment acknowledgment (date logging) in MVP. Actual payment settlement moved to Phase 9.
- **MOBILE-FIRST MANDATORY:** Dashboard designed for iPhone (375-390px) as primary surface. Desktop/tablet are secondary/optional.

---

## ✅ PHASE 7 MVP — Included

| Feature | Story | Description | Owner |
|---------|-------|-------------|-------|
| **Cost Profile Setup** | US-730a | O/O enters fixed/variable costs, system calculates min RPM | CODER |
| **Profitable Load Visibility** | US-730b | Load board shows only loads meeting min RPM; profitability badges (green/yellow/red) | CODER |
| **Performance Visibility** | US-730c | Dashboard shows: Acceptance %, On-Time %, Completion Rate, Payments Logged % | CODER |
| **Unified Dashboard** | US-730d | Single page: hero load + stats + available loads + performance trends | CODER |
| **Equipment & Lanes** | US-730e | O/O manages equipment types, capacity; sets preferred lanes | CODER |
| **Dashboard Structure** | US-730-0 | HFD locks layout, responsive specs, component hierarchy — **MOBILE-FIRST** | HFD |
| **Payment Acknowledgment** | US-730-f | O/O logs "Payment received on [date]" for tax tracking; NO money movement | CODER |

**Total Effort:** 25-28 hours (backend APIs + UI components)

**ALL FEATURES:** Must be optimized for mobile phone (iPhone 375-390px) with gloved hand input. Touch targets ≥48px. Dark theme. <2s load on 4G LTE. Vertical layout. No complex gestures.

**Backend Services Needed:**
- Cost Profile API (GET/PUT)
- RPM filtering in LoadService.searchLoads()
- Performance metrics aggregation (acceptance %, on-time %, completion %)
- Dashboard aggregation endpoint
- Payment acknowledgment endpoint (simple date logging)

**DESIGN CONSTRAINT: MOBILE-FIRST MANDATORY**

**Owner-operators use this dashboard on their phone 95% of the time** (truck cab, on the road). Desktop/laptop use is rare (home office, end-of-week accounting). Tablet is almost never.

This means:
- ✅ **Primary device:** iPhone SE, 12, 13 (375-390px width)
- ✅ **Physical context:** Gloved hands, direct sunlight, one-handed operation
- ✅ **Touch targets:** All buttons ≥48px (not 40px or 44px)
- ✅ **Theme:** Dark background for truck cab sunlight readability (high contrast)
- ✅ **Performance:** <2 seconds load on 4G LTE
- ✅ **Layout:** Vertical stack only (no side-by-side columns on mobile)
- ✅ **Actions:** Tap only (no swipe, no complex gestures)
- ✅ **Navigation:** Stay on dashboard (inline modals, not new pages)

**Desktop/tablet designs are OPTIONAL.** If they work, great. If not, that's acceptable for MVP.

**Verification:** Dashboard must pass accessibility/usability on actual iPhone in direct sunlight before sign-off.

---

## 🚫 PHASE 9 POST-MVP — Deferred

| Feature | Story | Description | Why Deferred |
|---------|-------|-------------|---|
| **Actual Payment Processing** | US-502-v2 | Carrier receives payment via Stripe/ACH; real settlement | Complex integration, not needed for MVP |
| **Real-Time Earnings Tracking** | US-850 | Dashboard shows "Today Earned: $1,247" with trend chart | Depends on payment settlement |
| **Settlement Options** | US-851 | Standard/Quick/Ultra-Fast payout choices with fees | Depends on payment processing |
| **Payment History & Disputes** | US-852 | Track all payouts, handle disputes, resolution timeline | Depends on payment processing |
| **Tax Reporting** | US-853 | Auto-generate 1099/Schedule C for accountants | Depends on payment processing |

**Total Effort (Phase 9):** 20-30 hours

---

## 📊 MVP Payment Handling — What Carriers See

### **Load Delivered (DELIVERED status)**

```
Load: "50 pallets from Houston to Dallas"
Rate: $310 (meets min RPM ✅)
Status: DELIVERED
Action: [Log Payment Received] ← NEW IN MVP

Click [Log Payment Received]:
  Date picker: "2026-06-23" (default today)
  Notes (optional): "Check #12345"
  [Save]

After save:
  Status: PAYMENT_ACKNOWLEDGED ✅
  Display: "Payment logged on 2026-06-23"
```

### **Dashboard Quick Stats (AC-3)**

```
Acceptance %  | On-Time % | Completion Rate | Payments Logged
    92%       |    96%    |     18/18       |      15/18
   🟢 Good   |  🟢 Good  |    🟢 Good      |    🟡 Needs work
```

### **What O/O DOES NOT See (Phase 9)**

- ❌ "Today's Earnings: $1,247" (no earnings calculation)
- ❌ "7-day earnings trend" (no settlement data)
- ❌ Payment status (pending, settled, paid) — just acknowledgment date
- ❌ Real-time payout notifications
- ❌ Actual money in bank account (manual transfers until Phase 9)

---

## 💰 Phase 9: Full Payment Workflow (Post-MVP)

Once US-502 (Payment Processing) is complete:

```
Load DELIVERED
  ↓
Carrier acknowledges payment (MVP ✅)
  ↓
Shipper initiates payment (Phase 9)
  ↓
Stripe/ACH processes transfer (Phase 9)
  ↓
Carrier sees:
  - Real settlement status: PENDING → SETTLED → PAID
  - Actual earnings: $302.90 (after 2% platform fee)
  - Earnings trend: chart showing daily income
  - Tax report: exportable 1099 data
```

---

## 🔄 Dependency Chain

```
Phase 7 (MVP):
  ┌─ Cost Profile API
  ├─ RPM Filtering
  ├─ Performance Metrics
  ├─ Dashboard Aggregation
  └─ Payment Acknowledgment (simple date picker)
     └─ NO money movement
     └─ NO settlement calculations

Phase 9 (Post-MVP):
  ├─ Payment Processing (US-502-v2)
  ├─ Settlement Calculation (US-850)
  ├─ Settlement Options (US-851)
  ├─ Dispute Resolution (US-852)
  └─ Tax Reporting (US-853)
```

**Key:** Phase 7 is INDEPENDENT of payment processing. Phase 9 payments build on top of Phase 7 acknowledgment tracking.

---

## ✅ No Shipper Blockers for MVP

**Carrier Dashboard MVP launches WITHOUT dependencies on Shipper payment work:**

- ✅ Shipper posts loads → Carrier sees them
- ✅ Carrier claims loads → Shipper is notified
- ✅ Carrier delivers → Shipper approves
- ✅ Carrier acknowledges payment → Tax tracking (MVP)
- ❌ Carrier receives actual payment → Phase 9 (independent from MVP launch)

---

## 🚀 Timeline Impact

**With Full Payment Scope (Old):**
- Phase 7 blocked by US-502 (Payment Processing)
- Can't launch MVP until payment backend ready
- 5-6 weeks to MVP

**With MVP Payment Acknowledgment (New):**
- Phase 7 independent of payment processing
- Launch MVP in 4 weeks (no Shipper team coordination)
- Payment processing follows in Phase 9 (parallel)
- **1-2 week acceleration of MVP launch**

---

## 📋 Story Status Update

### **Phase 7 MVP Stories (Updated for Manual Payment)**

| Story | Status | Scope Change |
|-------|--------|---|
| US-730-0 | READY_FOR_DESIGN | No change |
| US-730a | READY_FOR_DESIGN | No change |
| US-730b | READY_FOR_DESIGN | No change |
| US-730c | UPDATED | Removed earnings metrics; added payment acknowledgment % |
| US-730d | READY_FOR_DESIGN | No change |
| US-730e | READY_FOR_DESIGN | No change |
| **US-730f** | **NEW** | **Payment Acknowledgment (MVP)** |

### **Phase 9 Backlog Stories (Moved from earlier phases)**

| Story | Status | Phase Moved From |
|-------|--------|---|
| US-502-v2 | BACKLOG (Phase 9) | Phase 5 (deferred) |
| US-850 | BACKLOG (Phase 9) | Proposed Phase 9 |
| US-851 | BACKLOG (Phase 9) | Proposed Phase 9 |
| US-852 | BACKLOG (Phase 9) | Proposed Phase 9 |
| US-853 | BACKLOG (Phase 9) | Proposed Phase 9 |

---

## 🎯 Acceptance & Sign-Off

**This MVP scope is:**
- ✅ Achievable in 4 weeks
- ✅ Independent of Shipper payment work
- ✅ Delivers core Owner-Operator value (cost tracking, profitability visibility, reputation metrics)
- ✅ Foundation for Phase 9 payment settlement
- ✅ **MOBILE-FIRST** (optimized for iPhone in truck cab; desktop is optional)

**Mobile-First Verification (MANDATORY before sign-off):**
- [ ] Dashboard loads in <2 seconds on 4G LTE (actual device test)
- [ ] All buttons/links ≥48px touch target (glove-friendly)
- [ ] Text readable in direct sunlight (WCAG AAA contrast)
- [ ] Can claim load with one hand (steering wheel in other hand)
- [ ] Vertical scroll only (no horizontal swipe)
- [ ] No lag or jank (60fps scrolling)
- [ ] Tested on iPhone SE (375px) as minimum viable size

**Deferred to Phase 9:**
- Actual payment processing (Stripe/ACH)
- Real-time earnings tracking
- Payment settlement management
- Tax reporting automation
- Desktop/tablet optimization (if not working by then)

---

**Status:** SCOPE LOCKED — Ready for ARCHITECT + HFD + CODER kickoff

**Next:** ARCHITECT finalizes API contracts; HFD creates design spec; CODER begins Phase 7 implementation
