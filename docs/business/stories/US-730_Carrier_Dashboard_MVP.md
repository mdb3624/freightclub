# US-730: Carrier Dashboard MVP — Operations Platform

**Story ID:** US-730 (Epic)  
**Phase:** Phase 7 (Carrier MVP Foundation)  
**Status:** READY_FOR_DESIGN  
**Scope:** FULL_STACK  
**Effort:** 25-28 hours (7 child stories)  
**Priority:** P0  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-62  

---

## Epic Summary

**Owner-Operator Dashboard MVP:** Carriers can set cost profiles, see profitable loads (RPM-filtered), track reputation (acceptance %, on-time %, completion %), manage equipment/lanes, and acknowledge payment receipt. **All optimized for mobile phone (truck cab use).**

**Phase 7 MVP:** Manual payment acknowledgment (date logging). Actual settlement moves to Phase 9.

**Design Constraint:** MOBILE-FIRST MANDATORY — iPhone SE (375-390px), glove-friendly (≥48px touch targets), dark theme, vertical layout only, <2s load on 4G LTE.

---

## User Story

**As an** Owner-Operator trucking company (1-4 trucks)  
**I want to** manage my operations from my phone: see profitable loads, track my reputation, and acknowledge payments  
**So that** I can make data-driven decisions about which loads to accept and understand my performance

---

## Business Drivers

- **Profitability:** O/O needs to know which loads will make money (RPM-based filtering)
- **Reputation:** Build carrier credibility through ratings and performance tracking
- **Transparency:** Cost calculations + earnings logs (foundational for Phase 9 settlement)
- **Mobile-First:** O/Os use dashboard in truck cab 95% of the time (iPhone with gloved hands)
- **Speed:** Dashboard launch in 4 weeks without payment processing dependencies

---

## Child Stories (7 Total)

| ID | Title | Owner | Effort | Status |
|----|-------|-------|--------|--------|
| US-730-0 | Dashboard Structure & Mobile Design Spec | HFD | 3d | READY_FOR_DESIGN |
| US-730a | Cost Profile Setup API & UI | CODER | 3d | READY_FOR_DESIGN |
| US-730b | Profitable Load Visibility & Filtering | CODER | 4d | READY_FOR_DESIGN |
| US-730c | Performance Visibility Dashboard Metrics | CODER | 3d | READY_FOR_DESIGN |
| US-730d | Unified Carrier Dashboard | CODER | 4d | READY_FOR_DESIGN |
| US-730e | Equipment & Lane Management | CODER | 3d | READY_FOR_DESIGN |
| US-730f | Payment Acknowledgment (MVP) | CODER | 2d | READY_FOR_DESIGN |

---

## Technical Architecture

### Backend Services Required
- **Cost Profile API** (GET/PUT) — Store fixed costs, variable costs, min RPM
- **RPM Filtering in LoadService** — Filter loads by O/O's minimum RPM
- **Performance Metrics Aggregation** — Calculate acceptance %, on-time %, completion %
- **Dashboard Aggregation Endpoint** — Single call returns hero load + stats + available loads
- **Payment Acknowledgment Endpoint** — Simple date picker + notes logging (no settlement)

### Frontend Components (Mobile-Optimized)
- **Cost Profile Form** — Input fixed/variable/fuel costs, display calculated min RPM
- **Load Card Component** — Display load with profitability badge (GREEN/YELLOW/RED)
- **Metrics Badge** — Large stats display (Acceptance, On-Time, Completion, Payments Logged)
- **Dashboard Layout** — Vertical stack: hero load + stats + load list + action buttons
- **Equipment Modal** — Manage truck types, capacity, preferred lanes, availability
- **Payment Modal** — Date picker + optional notes for payment acknowledgment

### Mobile-First Design Requirements (MANDATORY)
- **Device:** iPhone SE, 12, 13 (375-390px width minimum)
- **Touch Targets:** All buttons ≥48px (not 40px, not 44px)
- **Theme:** Dark background (truck cab sunlight readability)
- **Layout:** Vertical stack only (no side-by-side columns)
- **Performance:** <2 seconds load on 4G LTE
- **Actions:** Tap only (no swipe, no complex gestures)
- **Navigation:** Stay on dashboard (inline modals, not new pages)

**Desktop/Tablet:** Optional. If it works by Phase 9, great. If not, MVP is still complete.

---

## Phase 7 MVP Features

### 1. Cost Profile Setup (US-730a)
- O/O enters: Fixed costs ($/day), Variable costs ($/mile), Fuel costs ($/gallon)
- System calculates: Minimum RPM = Total Daily Cost / Miles Available
- Stored in `carrier_cost_profiles` table
- Mobile form with calculated RPM display

### 2. Profitable Load Filtering (US-730b)
- Load board shows only loads meeting O/O's minimum RPM
- Profitability badges:
  - 🟢 GREEN: ≥120% min RPM (highly profitable)
  - 🟡 YELLOW: 100-120% min RPM (marginal)
  - 🔴 RED: <100% min RPM (not worth it)
- Defaults to GREEN + YELLOW; can show RED with confirmation

### 3. Performance Metrics (US-730c)
- **Acceptance %:** Claims accepted / Invitations received × 100
- **On-Time %:** Loads delivered by deadline / Total delivered × 100
- **Completion Rate:** Completed deliveries / Claimed loads
- **Payments Logged %:** Acknowledged payments / Delivered loads
- Displayed as large badge tiles with color coding

### 4. Unified Dashboard (US-730d)
- **Hero Load:** Top pick for O/O (highest profit match, closest deadline)
- **Stats Section:** 4 metric badges (Acceptance, On-Time, Completion, Payments)
- **Available Loads:** Filtered by cost profile min RPM, sorted by profit + deadline
- **Earnings Log:** MVP shows only acknowledged dates; Phase 9 adds real settlements
- Mobile-optimized vertical layout

### 5. Equipment & Lanes (US-730e)
- **Equipment:** O/O specifies truck types (dry van, flatbed, etc.), capacity, dimensions
- **Preferred Lanes:** Region-based + equipment type association
- **Availability:** Operating days/hours per week
- **Mobile Management:** Modal editing on dashboard

### 6. Payment Acknowledgment (US-730f)
- When load is DELIVERED:
  - Button: [Log Payment Received]
  - Opens: Date picker (default: today) + optional notes field (check #, reference)
  - On save: Load status → PAYMENT_ACKNOWLEDGED, displays "Payment logged on [date]"
- **No money movement** (MVP simplification)
- **Foundation for Phase 9:** Full settlement (Stripe/ACH) builds on this

---

## Phase 9 Post-MVP (Deferred)

| Story | Description |
|-------|-------------|
| US-502-v2 | Actual payment processing (Stripe/ACH) |
| US-850 | Real-time earnings tracking with trend charts |
| US-851 | Settlement payout options (Standard/Quick/Ultra-Fast) |
| US-852 | Payment history, disputes, resolution |
| US-853 | Tax reporting (1099, Schedule C export) |

---

## Design Constraints (LOCKED)

### Mobile-First is Non-Negotiable
- **Primary device:** iPhone in truck cab (95% of O/O use)
- **Context:** Gloved hands, direct sunlight, one-handed operation, moving vehicle
- **Verification (MANDATORY before sign-off):**
  - [ ] Dashboard loads <2s on 4G LTE (actual device test)
  - [ ] All buttons/links ≥48px touch target
  - [ ] Text readable in direct sunlight (WCAG AAA contrast)
  - [ ] Can claim load one-handed (steering wheel in other hand)
  - [ ] Vertical scroll only (no horizontal swipe)
  - [ ] No lag or jank (60fps scrolling)
  - [ ] Tested on iPhone SE (375px minimum)

### Dark Theme (High Contrast)
- High contrast for sunlight readability in truck cab
- Dark background, light text
- No white/light backgrounds that cause glare

### No Horizontal Scroll
- Vertical stack layout only
- All content accessible without swiping left/right

### Desktop/Tablet (Optional)
- If works, include it
- If not, MVP is still complete
- Focus is 100% on iPhone usability

---

## Dependencies

### No Shipper Blockers
- ✅ Shipper posts loads → Carrier sees them
- ✅ Carrier claims loads → Shipper notified
- ✅ Carrier delivers → Shipper approves
- ✅ Carrier acknowledges payment → Tax tracking (MVP)
- ❌ Carrier receives actual payment → Phase 9 (independent)

### Internal Phase 7 Dependencies
- **US-730-0 (Design)** must complete before US-730a-f start
- **US-730a (Cost API)** feeds into US-730b (RPM filtering)
- **US-730c (Metrics)** independent, can start in parallel
- **US-730e (Equipment)** must complete before final dashboard (US-730d)

---

## Success Metrics

### Acceptance Criteria (High-Level)
- ✅ O/O can set cost profile and see calculated min RPM
- ✅ Load board filters by profitability (GREEN/YELLOW/RED badges)
- ✅ Dashboard shows all 4 performance metrics
- ✅ O/O can acknowledge payment receipt with date
- ✅ All features work on iPhone SE (375px) with gloved hands
- ✅ Dashboard loads <2 seconds on 4G LTE
- ✅ All touch targets ≥48px
- ✅ Text readable in direct sunlight (WCAG AAA)

### Metrics to Track
- O/O adoption: % claiming loads after setting cost profile
- Profitability awareness: % filtering by RPM vs. showing all loads
- Performance improvement: Increase in acceptance % + on-time %

---

## Timeline

**Phase 7 MVP:** 4 weeks (25-28 hours total)
- **Week 1:** HFD design (US-730-0), ARCHITECT API spec
- **Week 2-3:** CODER implements US-730a-f in parallel
- **Week 3-4:** Testing, mobile verification, bug fixes

**Phase 9:** Payment processing (20-30 hours) — Parallel with other Phase 9 work

---

## Jira Tracking

- **Epic:** FREIG-62
- **Child Stories:** FREIG-63 (US-730-0) through FREIG-69 (US-730f)
- **All initial status:** To Do (awaiting ARCHITECT + HFD design)
- **Current workflow:** To Do → In Progress → Done

---

## Authority & Governance

- **Sequential Lock Protocol:** Once design locks, CODER cannot ask HFD for changes. Issues escalate to LIBRARIAN via CHG.
- **Test Coverage:** ≥70% branch coverage (JaCoCo enforced) before merging to main.
- **Mobile Verification:** Required before sign-off (actual iPhone device test).
- **Code Review:** REVIEWER audits all 10 gates (RLS, No-Lombok, Coverage, Complexity, etc.).

---

**Status:** READY_FOR_DESIGN — Awaiting ARCHITECT API spec + HFD design spec

**Next:** ARCHITECT finalizes API contracts; HFD creates design spec; CODER begins Phase 7 implementation
