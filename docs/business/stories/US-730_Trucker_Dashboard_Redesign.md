# US-730: Trucker Dashboard Redesign (Operations Hub)

**Phase:** 7+ (Shipper Dashboard alignment: [[US-103-v2]])  
**Type:** FULL_STACK (UI + Backend endpoints for dashboard aggregation)  
**Priority:** P1 (Post-Shipper Dashboard launch)  
**Ticket Status:** READY_FOR_DESIGN  
**BA Sign-Off:** ✅ Approved (Michael)

---

**Related Documents:**
- [[CARRIER_SAAS_ROADMAP]] — Phase 7 roadmap (context + other Phase 7 stories)
- [[US-730_MVP_SCOPE]] — MVP scope (payment, mobile-first, timeline)
- [[CARRIER_DASHBOARD_FUNCTIONALITY_SPEC]] — Functional requirements (referenced in AC)
- [[CARRIER_SAAS_AUDIT_REPORT]] — Implementation audit (blockers US-730 addresses)
- [[SHIPPER_CARRIER_DEPENDENCY_MATRIX]] — Dependencies (none blocking MVP)
- [[owner_operator]] — Persona definition

---

## 📖 User Story

**As a** Trucker / Owner-Operator  
**I want to** see my active loads, real-time earnings, performance metrics, and available loads in a single operations-focused dashboard  
**So that** I can manage my fleet efficiently, maximize earnings, and make quick decisions about which loads to claim next.

---

## 🎯 Business Value

| Driver | Impact | Metric |
|--------|--------|--------|
| **Operational Efficiency** | Truckers spend less time browsing — see active loads + next opportunities at a glance | Reduce load-search time by 50% |
| **Income Visibility** | Real-time earnings display motivates and helps truckers understand profitability | Increase acceptance rate by tracking correlation with earnings display |
| **Performance Awareness** | Metrics (on-time %, acceptance rate, completion rate) build accountability and improve platform health | Drive on-time delivery rate to >95% |
| **Reduce Friction** | "Quick Claim" buttons on available loads reduce clicks to 1-tap from load card | Increase claim conversion rate by 30% |

---

## ✅ Acceptance Criteria

### AC-1: Dashboard Page Navigation & Layout
**Given** a trucker is logged in and navigates to `/dashboard/trucker`  
**When** the page loads  
**Then** the dashboard displays 4 distinct sections in vertical scroll order:
1. **Active Load Hero** — current claimed load details
2. **Quick Stats Cards** — 4 KPI metrics
3. **Available Loads** — browsable list of posted loads
4. **Performance Trend** — 7-day earnings and acceptance rate charts

### AC-2: Active Load Hero Section
**Given** the trucker has a claimed load  
**When** the dashboard loads  
**Then** the active load displays:
- Pickup location (city, state)
- Delivery location (city, state)
- Distance (miles)
- Rate ($ and $/mile)
- Status badge: "Claimed", "In Transit", "Delivered", or "Completed"
- Pickup time window (formatted: "2:30 PM - 4:00 PM")
- Estimated delivery time (ETA)
- **Two action buttons:**
  - If status = "Claimed": "Mark Picked Up"
  - If status = "In Transit": "Mark Delivered"
  - If status = "Delivered": "Complete Load"
- **Two secondary actions:** "View Details" (expands to full load card), "Contact Shipper"
- **Real-time indicator:** Subtle animated indicator showing data is live (pulse or breathing effect)

**Given** the trucker has no active claimed load  
**When** the dashboard loads  
**Then** the active load section displays:
- Empty state message: "No active loads. Browse available loads below to claim your next shipment."
- Single CTA: "Browse Loads"

### AC-3: Quick Stats Cards (4 KPIs) — MVP (No Earnings)
**Given** the dashboard loads  
**When** displaying the stats row  
**Then** 4 cards appear in a responsive 2×2 or 1×4 grid (based on screen width):

| Card | Label | Value | Color | Source |
|------|-------|-------|-------|--------|
| **Acceptance Rate** | "Acceptance Rate" | 92% | Green if ≥90%; Orange if 70-89%; Red if <70% | Sum(claimed loads) / Sum(posted loads shown in 30 days) |
| **On-Time %** | "On-Time Delivery" | 96% | Green if ≥95%; Orange if 80-94%; Red if <80% | Delivered on-time / Total delivered (30 days) |
| **Completion Rate** | "Completion Rate" | 18/18 | Green if 100%; Orange if ≥90%; Red if <90% | Delivered loads / Claimed loads (30 days) |
| **Payment Acknowledged** | "Payments Logged" | 12/18 | Green if 100%; Orange if ≥80%; Red if <80% | Loads with payment_acknowledged_date / Delivered loads (30 days) |

**Font requirement:** Large, bold metric; small, muted label underneath.

**NOTE (MVP):** Earnings tracking deferred to Phase 9 (requires payment processing backend). Acceptance/On-Time/Completion are reputation metrics (Phase 7). Payment acknowledgment tracking is MVP feature (Phase 7).

### AC-4: Available Loads Section
**Given** the trucker scrolls to the Available Loads section  
**When** the section displays  
**Then** it shows a filterable, scrollable list of posted loads with:
- **Load Card format:**
  - Pickup city/state
  - Delivery city/state
  - Distance (miles)
  - Pay rate ($ total)
  - $/mile calculation
  - Profitability badge: Green (high), Yellow (neutral), Red (low) — based on trucker's cost profile
  - Pickup date/time window
  - Equipment type (Box, Flatbed, Tanker, Reefer, Auto Carrier, Specialized)
  - **Primary CTA:** "Claim Load" (or "Already Claimed" if trucker already claimed)
  - **Secondary action:** "View Details" (navigates to full load view)

- **Sorting options (dropdown):** "Newest", "Highest Pay", "Closest Distance", "Best Profit"
- **Default sort:** "Best Profit" (based on trucker's cost profile)
- **Initial display:** Show first 5 loads; "Load More" button or infinite scroll
- **Empty state:** "No loads matching your criteria. Adjust filters or check back soon."

### AC-5: Filters (Available Loads)
**Given** the trucker wants to refine available loads  
**When** they access the filter bar  
**Then** filters include:
- **Pickup Date Range:** "Today", "Next 7 Days", "Next 30 Days", "Custom"
- **Distance:** "Under 100 miles", "100-500 miles", "500+ miles"
- **Equipment Type:** Multi-select (Box, Flatbed, Tanker, Reefer, Auto Carrier, Specialized)
- **Min Pay:** Slider (e.g., "$200+", "$500+", "$1000+")
- **Min $/Mile:** Slider (e.g., "$1.50+", "$2.00+")

**Note:** Filters are persistent (saved in localStorage for this session).

### AC-6: Performance Trend Charts (7-Day Metrics)
**Given** the trucker scrolls to the Performance section  
**When** charts display  
**Then** two visualizations appear side-by-side (stacked on mobile):

1. **Earnings Trend (Bar Chart)**
   - X-axis: Days of the week (Mon - Sun)
   - Y-axis: Daily earnings ($)
   - Bars colored bronze (#B08D57)
   - Hover shows exact amount
   - Total for week displayed as text below

2. **Acceptance Rate Trend (Line Chart)**
   - X-axis: Days of the week
   - Y-axis: Acceptance rate (%)
   - Line colored green (#27AE60)
   - Dots on each day
   - Hover shows day's acceptance rate

### AC-7: Sticky Footer CTA
**Given** the trucker scrolls past the active load  
**When** the footer comes into view  
**Then** a sticky footer with bronze gradient button displays:
- **Button text:** "Browse All Loads"
- **Styling:** Bronze gradient (#C9A46A → #B08D57), white text, 44px height
- **Action:** Navigates to full Load Board (`/trucker/load-board`)

### AC-8: Responsive Design — MOBILE-FIRST MANDATORY
**Given** the owner-operator uses this dashboard 95% on mobile phone (truck cab)  
**When** layout renders  
**Then** design is optimized for mobile FIRST, desktop is secondary:

**Mobile (≤390px — PRIMARY DESIGN SURFACE):**
- ✅ Active load hero visible immediately (no scroll)
- ✅ 2 stats cards above fold (other 2 accessible via scroll)
- ✅ All buttons/links ≥48px touch target (gloved hand)
- ✅ Vertical stack only (no side-by-side columns)
- ✅ Dark theme for truck cab sunlight readability (high contrast)
- ✅ Fast load <2s on 4G LTE
- ✅ Available loads: 1 card per row, full width, vertical scroll
- ✅ No modals that hide dashboard (all inline actions)

**Tablet (768–1023px — BONUS IF IT WORKS):**
- Can use 2-column layout (hero + stats on left, loads on right)
- 2×2 KPI grid acceptable

**Desktop (≥1024px — OPTIONAL):**
- 3-column layout optional (not required)
- Prioritize mobile experience over desktop polish

### AC-9: Payment Acknowledgment (MVP Feature)
**Given** a trucker has a load with status = DELIVERED  
**When** they view the active load hero or completed loads list  
**Then** they see:
- Payment status: "Payment pending acknowledgment" (if not yet acknowledged)
- Action button: "Log Payment Received" (opens modal)
- Modal form:
  - Date picker (default: today)
  - Optional notes field ("Check #", "Bank transfer", etc.)
  - Save button → sets `payment_acknowledged_date` + `payment_notes`
  - Load status changes: DELIVERED → PAYMENT_ACKNOWLEDGED
- After acknowledgment:
  - Button changes to "Payment acknowledged on 2026-06-23"
  - Load appears in "Payments Logged" count (Quick Stats AC-3)
  - Data persists and exports to tax report

**Scope (MVP):** Manual date logging only. NO actual money movement, NO payment processing, NO settlement calculations.

### AC-10: Real-Time Data Refresh
**Given** the trucker is viewing the dashboard  
**When** 30 seconds pass  
**Then** the page silently refreshes active load status and available loads without page reload
- **Note:** Metrics refresh every 5 minutes (to avoid excessive API calls)
- **Visual indicator:** Subtle "Updated just now" timestamp in corner

### AC-10: Empty State Behaviors
**Given** various empty states occur  
**When** the dashboard renders  
**Then** friendly, action-oriented messages guide the trucker:
- No active load: "No active loads. Browse available loads below to claim your next shipment. → [Browse Loads]"
- No available loads: "No loads match your filters. Try adjusting your distance or pay range."
- No performance data: "You haven't completed any loads yet. Claim and deliver a load to see your performance metrics."

---

## 🎨 UI Field Contract (BA Responsibility)

| UI Field | Description | Display Value Example | Required |
|----------|-------------|----------------------|----------|
| **Active Load Section** |
| Pickup Location | City, State | "Denver, CO" | Yes |
| Delivery Location | City, State | "Salt Lake City, UT" | Yes |
| Distance | Miles | "250 miles" | Yes |
| Rate | Dollar amount | "$320" | Yes |
| Rate per Mile | $/mile calculation | "$1.28/mi" | Yes |
| Status Badge | Load lifecycle stage | "In Transit" | Yes |
| Pickup Time Window | Formatted time range | "2:30 PM - 4:00 PM" | Yes |
| ETA | Estimated delivery time | "6:15 PM" | Conditional (if In Transit) |
| Primary Action Button | Call to action | "Mark Delivered" | Yes |
| Secondary Actions | Link | "View Details", "Contact Shipper" | Yes |
| **KPI Cards Section** |
| Acceptance Rate | Percentage + badge | "92% 🟢" | Yes |
| On-Time % | Percentage + badge | "96% 🟢" | Yes |
| Today Earned | Dollar amount + badge | "$1,247 🟢" | Yes |
| Completion Rate | Ratio + badge | "18/18 🟢" | Yes |
| **Available Loads Cards** |
| Pickup Location | City, State | "Houston, TX" | Yes |
| Delivery Location | City, State | "Dallas, TX" | Yes |
| Distance | Miles | "240 miles" | Yes |
| Pay | Dollar amount | "$310" | Yes |
| $/Mile | Calculation | "$1.29/mi" | Yes |
| Profitability Badge | Color-coded | 🟢 High | Yes |
| Equipment Type | Load type | "Dry Box" | Yes |
| Pickup Date/Time | Date + time window | "Tomorrow, 8:00 AM - 10:00 AM" | Yes |
| Claim Button | Primary action | "Claim Load" | Yes |
| **Performance Charts** |
| Earnings Trend | Daily bar values | "$240, $310, $0, $450..." | Yes |
| Acceptance Trend | Daily % values | "100%, 90%, 80%..." | Yes |

---

## 🔄 Dependencies & Sequencing

| Dependency | Status | Notes |
|------------|--------|-------|
| **US-103-v2** (Shipper Dashboard UI) | ✅ MERGED | Design system, component library, bronze styling |
| **Trucker Cost Profile API** | ✅ EXISTS | `/api/v1/trucker/{id}/cost-profile` (used for profitability calc) |
| **Load Board API** | ✅ EXISTS | `GET /api/v1/loads?filter=...` (populate available loads) |
| **Trucker Stats Aggregation Endpoint** | ❓ **NEW** | Need `/api/v1/trucker/{id}/dashboard` to aggregate acceptance rate, on-time %, earnings, completion rate |

---

## 🛠️ Technical Scope (ARCH to Define) — MVP (No Payment Processing)

**MOBILE-FIRST PERFORMANCE CONSTRAINT (MANDATORY):**
- [ ] **Target Device:** iPhone 12/13 (390px) baseline; support down to 360px
- [ ] **Load Time:** <2 seconds on 4G LTE (no 5G optimization)
- [ ] **Touch Target Size:** All interactive elements ≥48px (glove-friendly)
- [ ] **Contrast Ratio:** WCAG AAA (7:1) for sun-glare readability
- [ ] **Scroll Performance:** 60fps smooth scrolling (no jank)
- [ ] **No Keyboard:** Touch-only interface (no trackpad, no mouse expected)

**INCLUDED (Phase 7 MVP):**
- [ ] **Dashboard Aggregation Endpoint** (`GET /api/v1/trucker/{id}/dashboard`)
  - Returns: active load, KPI metrics (acceptance %, on-time %, completion rate, payment acknowledged %), available loads subset
  - Response time SLA: <500ms (from cache preferred)
  - **NO earnings data** (deferred to Phase 9)
- [ ] **Payment Acknowledgment Endpoint** (`PUT /api/v1/loads/{id}/payment-acknowledged`)
  - Accept: `payment_acknowledged_date`, `payment_notes` (optional)
  - Update load status: DELIVERED → PAYMENT_ACKNOWLEDGED
  - Idempotent (can re-acknowledge with different date)
- [ ] **Payment Status Query** (`GET /api/v1/trucker/{id}/payment-acknowledgments`)
  - Returns: list of delivered loads + acknowledgment dates
  - Used for export/tax reporting
- [ ] **Real-Time Updates** — WebSocket or polling strategy for active load status
- [ ] **Performance Chart Data** — 7-day rolling window (acceptance %, on-time %, completion rate only)
- [ ] **Component Library** — Reuse shipper dashboard components (Panels, Cards, Buttons, Badges)

**OUT OF SCOPE (Phase 9 Post-MVP):**
- ~~Earnings aggregation endpoint~~ (moved to Phase 9 payment processing story)
- ~~Payment settlement calculations~~ (moved to Phase 9)
- ~~Real-time earnings tracking~~ (moved to Phase 9)

---

## 📊 Success Metrics (Post-Launch)

| Metric | Target | Tracking |
|--------|--------|----------|
| Dashboard load time | <2 seconds | Datadog/Analytics |
| Claim conversion rate | +30% vs Load Board direct access | Event tracking |
| Trucker DAU | +20% | Session analytics |
| Average earnings per load | Track correlation with earnings visibility | Revenue metrics |
| On-time delivery rate | >95% (platform health) | Load status tracking |

---

## 🚫 Out of Scope (Backlog for Future)

- [ ] **Voice/Mobile App:** Dashboard is web-first; mobile app is Phase 11+
- [ ] **AI-Powered Recommendations:** "Loads you might like" — Phase 9
- [ ] **Address Book:** Saved pickup/dropoff addresses — Phase 7b
- [ ] **Custom Alerts:** "Notify me when X load type appears" — Phase 11+

---

## 📝 Notes for Design & Implementation

- **Design Lead (HFD):** Trucker personas are owner-operators managing operations in high-stress, often mobile/field environments. Information density is critical, but clarity is more important than aesthetics. Real-time indicators should reduce cognitive load (e.g., "is this data current?").
- **Architect:** Aggregation endpoint is the critical performance path. Consider caching strategy (Redis?) with cache invalidation on load claim/completion.
- **Coder:** Reuse Shipper Dashboard component library to maintain design system consistency and reduce build time.

---

## 📐 US-730-0: Dashboard Structure & IA (Design Gate)

**Before building US-730a-f, HFD must lock dashboard structure using this spec:**

- **Reference:** `docs/project/CARRIER_DASHBOARD_FUNCTIONALITY_SPEC.md`
  - 6 dashboard sections (Header, Hero, Stats, Cost Profile, Available Loads, Footer)
  - All navigation flows (pages, modals, workflows)
  - Responsive breakpoints (Desktop/Tablet/Mobile)
  - Owner-operator workflow sequences

**HFD Deliverables for US-730-0:**
- [ ] Locked wireframe (ASCII + Figma) showing all 6 sections + exact placement
- [ ] Component dimensions (hero height, card widths, spacing grid)
- [ ] Information hierarchy (what's above fold, what requires scroll)
- [ ] Mobile-first specs: 44px+ tap targets, high-contrast, one-handed navigation
- [ ] Responsive breakpoint rules (1024px, 768px, 375px)
- [ ] Navigation highlight map (which elements link where)
- [ ] Empty state layouts (no active load, no matching loads, etc.)
- [ ] Accessibility specs (WCAG AA, focus indicators, ARIA labels)

**HFD Sign-Off Required:** "Dashboard structure locked. Ready for CODER build." ✅

---

## 🔐 BA Gate Checklist

- [x] **Value confirmed:** Addresses trucker pain points (load search friction, profitability visibility, operations efficiency)
- [x] **Personas mapped:** Owner-operators (independent truckers managing 1-4 trucks)
- [x] **ACs written in Gherkin:** All GWT format
- [x] **No technical implementation details:** Copy is business-focused
- [x] **Platform foundation check:** Aligns with "Claim → Deliver → Get Paid" core flow
- [x] **UI field contract complete:** All display fields listed, ARCH placeholders noted
- [x] **Functionality & navigation spec:** Complete — `CARRIER_DASHBOARD_FUNCTIONALITY_SPEC.md`
- [x] **Payment model locked:** Manual acknowledgment (MVP), no settlement processing
- [x] **MVP scope confirmed:** No earnings tracking, no payment processing

**Status:** ✅ **READY_FOR_DESIGN** — All BA inputs locked. HFD can begin US-730-0 design.

---

**Story Status:** `READY_FOR_DESIGN`  
**Created:** 2026-06-23  
**BA Author:** Michael (Owner-Operator SaaS Expert)
