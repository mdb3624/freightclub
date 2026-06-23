# Shipper-Carrier Dependency Matrix

**Version:** 1.0  
**Date:** 2026-06-23  
**Purpose:** Map all Shipper → Carrier dependencies to prevent blocking issues in Carrier launch  
**Owner:** BA (Governance)

---

**Related Documents:**
- [[CARRIER_SAAS_ROADMAP]] — Phase roadmap (Phase 7 MVP dependencies)
- [[US-730_MVP_SCOPE]] — MVP scope (no Shipper blockers for MVP)
- [[US-730_Trucker_Dashboard_Redesign]] — Dashboard story depending on Shipper features
- [[CARRIER_SAAS_AUDIT_REPORT]] — Audit findings (no blocking dependencies)

---

## 📊 Executive Summary

**Carrier Dashboard (US-730 Epic) has MINIMAL dependencies on Shipper features (MVP scope).** All core features are complete.

**Status:**
- ✅ **95% of MVP dependencies COMPLETE** (load posting, claiming, delivery, ratings)
- ✅ **Payment processing MOVED TO BACKLOG** (Phase 9 post-MVP; MVP uses manual acknowledgment only)
- ✅ **No critical blockers for Phase 7 MVP launch**
- ✅ **MOBILE-FIRST DESIGN LOCKED** (primary surface: iPhone in truck cab; desktop/tablet optional)

**Recommendation:** Carrier Dashboard (US-730) can launch immediately after backend APIs are ready (no Shipper team coordination needed). Design and development must prioritize mobile phone experience (95% of owner-operator usage).

---

## 🔗 Dependency Map: Carrier Stories → Shipper Prerequisites

### **Tier 1: CRITICAL (Carrier can't function without these)**

| Carrier Story | Carrier Value | Shipper Prerequisite | Status | Blocker? |
|---|---|---|---|---|
| **US-730a: Cost Profile Setup** | O/O calculates break-even RPM | Shipper can POST loads at various rates | ✅ DONE (US-103-v2) | ✅ NO |
| **US-730b: Profitable Load Visibility** | O/O sees only profitable loads | Shipper posts load with rate; rate is visible | ✅ DONE (US-103) | ✅ NO |
| **US-703: Claim Load** | O/O claims load | Shipper posts load; load stays visible until claimed | ✅ DONE (US-104) | ✅ NO |
| **US-704: Mark Milestones** | O/O marks Picked Up → Delivered | Shipper sees status updates | ✅ DONE (US-105) | ✅ NO |
| **US-305: Upload POD** | O/O uploads proof of delivery photos | Shipper can download photos | ✅ DONE (US-305) | ✅ NO |
| **US-401: Rate Shipper** | O/O rates shipper after delivery | Shipper public profile accepts ratings | ✅ DONE (US-401) | ✅ NO |

### **Tier 2: HIGH (Carrier features incomplete without these)**

| Carrier Story | Carrier Value | Shipper Prerequisite | Status | Blocker? |
|---|---|---|---|---|
| **US-730c: Performance Visibility** | O/O sees acceptance %, on-time %, earnings | Shipper payment settlement complete (earnings calculated) | 🔴 **INCOMPLETE** (US-502 PARTIAL) | 🔴 **YES** |
| | | Shipper notifies when load cancelled (O/O acceptance % affected) | 🔴 **MISSING** (US-??? ) | 🔴 **YES** |
| **US-710: Carrier Public Profile** | Shipper sees O/O rating & history | Shipper can VIEW carrier profile before claiming | ✅ DONE (US-710) | ✅ NO |
| | | Shipper sees O/O equipment + capacity | ✅ DONE (US-701, US-710) | ✅ NO |
| **US-702: Preferred Lanes** | O/O sets regions, loads match lanes | Shipper load posting includes origin/destination regions | ✅ DONE (US-103) | ✅ NO |
| **US-707-v2: Shipper Preferred Carrier** | Shipper finds O/O by reputation | Shipper can search/filter carriers | ✅ DONE (US-707-v2) | ✅ NO |

### **Tier 3: MEDIUM (Nice-to-have, but valuable)**

| Carrier Story | Carrier Value | Shipper Prerequisite | Status | Blocker? |
|---|---|---|---|---|
| **US-730c: Earnings Tracking** | O/O sees today's earnings | Shipper payment settlement w/ real-time status | 🟡 **PARTIAL** (US-502, US-506) | 🟡 **PARTIAL** |
| **US-730e: Equipment Visibility** | Shipper sees what O/O can haul | Shipper load posting includes equipment type filter | ✅ DONE (US-103, US-705) | ✅ NO |
| **US-722: Load Insurance Verification** | O/O verifies O/O has active insurance | Shipper can view O/O insurance status | 🔴 **NOT STARTED** (Phase 8) | ❌ DEFERRED |
| **US-723: HOS Compliance Tracking** | O/O tracks hours of service | Shipper can see O/O HOS status | 🔴 **NOT STARTED** (Phase 9) | ❌ DEFERRED |

---

## 🚨 Critical Blocker Analysis

### **MVP SCOPE: Payment Acknowledgment (Manual, No Processing)**

**Decision:** Actual payment processing (Stripe, settlement) moved to Phase 9. MVP uses manual acknowledgment.

| Feature | MVP Scope | Phase 9 Scope |
|---------|-----------|---|
| Carrier logs payment received | ✅ Manual date picker | — |
| Actual money transfer | — | Stripe/ACH integration |
| Real-time earnings tracking | — | Settlement calculations |
| Payment status on load | ✅ `payment_acknowledged_date` | Actual payout status |

**Impact on US-730:**
- ✅ No earnings metrics needed (removed from MVP AC-3)
- ✅ Simple payment acknowledgment form (date + optional notes)
- ✅ Payment status tracked: DELIVERED → PAYMENT_ACKNOWLEDGED
- ✅ Payment acknowledgment % displayed in Quick Stats card
- ✅ Payment history exportable for tax purposes

**Fix Required:** NONE — Payment processing is now OUT OF SCOPE for MVP

---

### **MVP BLOCKERS: None**

**All critical dependencies for Phase 7 MVP are COMPLETE:**
- ✅ Shipper posts loads (US-103-v2)
- ✅ Carrier claims loads (US-104)
- ✅ Carrier marks milestones (US-105)
- ✅ Carrier uploads POD (US-305)
- ✅ Carrier rates shipper (US-401)
- ✅ Shipper reputation visible (US-710)
- ✅ Equipment management (US-701)
- ✅ Preferred lanes (US-702-703)

**NO shipper stories are blocking Carrier Dashboard launch.**

---

## 🔄 Shipper Stories That MUST Complete Before US-730 Launch

| Shipper Story | Status | Required For | Severity |
|---|---|---|---|
| **US-502: Payment Processing (Stripe/ACH)** | IN_PROGRESS | US-730c: Earnings visibility, real-time settlement | **CRITICAL** |
| **US-506: SETTLED Load Status** | ✅ COMPLETED | Payment flow complete, settlement tracking | ✅ DONE |
| **US-???: Load Cancellation Visibility** | 🔴 **MISSING** | US-730c: Accurate acceptance % calculation | **CRITICAL** |
| **US-710: Shipper Public Profile (Carrier view)** | ✅ COMPLETED | Carrier sees shipper quality/ratings | ✅ DONE |
| **US-103-v2: Load Creation Redesign** | ✅ MERGED | Shipper posts loads for Carrier to claim | ✅ DONE |
| **US-820-825: Shipper Dashboard** | ✅ COMPLETED | Full shipper operations ready | ✅ DONE |

---

## 📋 Shipper → Carrier Workflow Chain (Full Journey)

```
SHIPPER SIDE (Prerequisite)          CARRIER SIDE (Dependent)           BRIDGE
────────────────────────────────────────────────────────────────────────────────
Register as Shipper ──────────────→  (Shipper account exists)
Create Cost Profile
(fixed costs, target margin)

Post Load
├─ Origin, Destination ────────────→  Load appears on Load Board
├─ Equipment Type ─────────────────→  Filter by equipment
├─ Rate ($$$) ─────────────────────→  O/O calculates profitability
└─ Load details ───────────────────→  O/O sees full load info
                                      ↓
                                      O/O sees load in dashboard
                                      ↓
                                      O/O clicks "Claim"
                                      ↓
Load status: CLAIMED ←───────────────  Carrier has active load
                                      ↓
Shipper notified of claim            O/O marks "Picked Up"
(shipper sees carrier ID + rating)   
                                      ↓
                                      O/O uploads POD photos
                                      ↓
Shipper sees POD ←──────────────────  O/O marks "Delivered"
                                      ↓
Load status: DELIVERED ←──────────────  Delivery complete
                                      ↓
Shipper payment processed             O/O sees earnings pending
(2-3 days or Quick Pay)              
                                      ↓
Shipper payment settled to O/O ───→  O/O sees "Today Earned: $$$"
(Stripe/ACH transfer)                 (Dashboard metrics updated)
                                      ↓
Shipper rates O/O ←──────────────────  O/O rates Shipper
                                      ↓
O/O public profile updated ───────→  Shipper sees O/O rating
Shipper public profile updated ←────  O/O sees Shipper quality
```

**RED FLAGS (Missing/Incomplete):**
- 🔴 Payment settlement incomplete (blocks earnings visibility)
- 🔴 Load cancellation not tracked (acceptance % wrong)
- 🟡 Some payment settlement features PARTIAL

---

## ✅ Dependency Checklist: Before Carrier Dashboard (US-730) Launches

**To launch US-730 Carrier Dashboard (MVP scope):**

### **MUST HAVE (All Complete):**
- [x] ✅ Shipper can post loads (US-103-v2 DONE)
- [x] ✅ Carrier can claim loads (US-104 DONE)
- [x] ✅ Carrier can mark milestones (US-105 DONE)
- [x] ✅ Carrier can upload POD (US-305 DONE)
- [x] ✅ Carrier can rate Shipper (US-401 DONE)
- [x] ✅ Shipper public profile visible to Carrier (US-710 DONE)
- [x] ✅ Equipment management (US-701 DONE)
- [x] ✅ Preferred lanes (US-702-703 DONE)

### **NO PAYMENT BLOCKERS (Moved to Phase 9):**
- ~~Shipper payment settlement~~ (moved to US-502-Phase-9)
- ~~Real-time earnings aggregation~~ (moved to Phase 9)
- ~~Payment status tracking~~ (simplified to manual acknowledgment in MVP)

### **DEFERRED (Phase 8+):**
- [ ] ❌ Insurance verification (Phase 8)
- [ ] ❌ HOS tracking (Phase 9)
- [ ] ❌ Actual payment processing (Phase 9)

---

## 📊 Revised US-730 Dependency Tree (Including Shipper Blockers)

```
US-730 EPIC: Carrier Dashboard
│
├─ [GATING] US-730-0: Dashboard Structure & IA (HFD)
│
├─ [GATE: US-502 MUST BE DONE] ↓
│  US-730a: Cost Profile Setup
│  US-730b: Profitable Load Visibility
│  US-730c: Performance Visibility ← DEPENDS ON US-502 (payment settlement)
│  US-730d: Unified Dashboard
│  US-730e: Equipment & Lane Management
│
└─ [NEW SHIPPER DEPENDENCY] US-???-LoadCancellation
   "When Shipper cancels load, notify Carrier & update acceptance %"
```

---

## 🎯 Recommended Action Plan

### **Immediate (BA Governance):**

1. **Verify Shipper Dependencies:**
   - [ ] Confirm US-502 (Payment Processing) completion date
   - [ ] Verify US-710 includes Shipper public profile (carrier view)
   - [ ] Identify if load cancellation notifications exist

2. **Create Missing Shipper Story:**
   - [ ] US-???: "Load Cancellation Visibility" (Shipper → Carrier notification)
   - [ ] This is a BLOCKER for US-730c (correct acceptance % calculation)

3. **Update US-730 Epic Dependencies:**
   - [ ] Mark US-502 as prerequisite for US-730c
   - [ ] Add new Shipper story as prerequisite
   - [ ] Document in CARRIER_SAAS_ROADMAP.md

### **Before Launching Carrier Dashboard:**

1. **Shipper Side (Dependencies):**
   - [ ] US-502 (Payment Processing) COMPLETE & TESTED
   - [ ] US-710 (Shipper Public Profile) verified for Carrier view
   - [ ] US-??? (Load Cancellation) COMPLETE & TESTED

2. **Carrier Side (Features):**
   - [ ] US-730a through 730e all DONE
   - [ ] All E2E tests passing (Shipper posts → Carrier claims → Carrier earns)

3. **Cross-Persona Tests:**
   - [ ] "Shipper posts load → Carrier sees it on dashboard → Claims → Delivers → Earns" (full journey)
   - [ ] "Shipper cancels load → Carrier sees cancellation & acceptance % updates" (edge case)
   - [ ] "Shipper rates Carrier → Carrier sees rating on public profile" (reputation visibility)

---

## 🚨 Risk Assessment

| Risk | Impact | Mitigation |
|---|---|---|
| **US-502 incomplete at launch** | O/Os can't see earnings; dashboard is incomplete | Delay US-730 until US-502 done |
| **Load cancellation not tracked** | Acceptance % metrics are wrong; O/O loses trust | Create + complete load cancellation story |
| **Shipper profile not visible to Carrier** | O/Os can't judge shipper quality; bad claims | Verify US-710 implementation |
| **Payment settlement stuck in MIGRATION_PENDING** | Revenue flow broken; no settlement tracking | Prioritize US-502 completion |

---

## 📝 Next Steps for BA

1. **Audit Current Shipper Status:**
   - [ ] US-502: What's blocking completion? When will it be done?
   - [ ] US-710: Does it include Shipper public profile viewable by Carriers?
   - [ ] Load cancellation: Is there any handling today?

2. **Update Story_Map.md:**
   - [ ] Add dependency arrows: Carrier stories → Shipper prerequisites
   - [ ] Mark "BLOCKER: US-502 not complete" on US-730c

3. **Create Load Cancellation Story (if missing):**
   - [ ] "As a Shipper, I want to cancel a load and notify the Carrier, so they understand why it's no longer available"
   - [ ] Scope: FULL_STACK (API + notification)
   - [ ] Urgency: HIGH (needed for US-730c acceptance % accuracy)

4. **Sequence US-730 After Shipper Dependencies:**
   - [ ] Don't start US-730 until US-502 roadmap is clear
   - [ ] Coordinate sprint planning: Shipper team + Carrier team alignment

---

**Status:** READY FOR BA REVIEW  
**Owner:** BA (Governance)  
**Last Updated:** 2026-06-23
