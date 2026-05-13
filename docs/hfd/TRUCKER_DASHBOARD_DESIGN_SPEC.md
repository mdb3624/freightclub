# Trucker Dashboard Design Spec — Financial Intelligence Hub

**Author:** Human Factors Designer  
**Phase:** Phase 7b (Financial Intelligence)  
**Constraint:** Mobile-first, revenue transparency, minimal friction  
**Persona:** Owner/Operator trucker — track earnings, costs, profitability trends

---

## Purpose
The Trucker Dashboard is the **financial nerve center** for owner/operators. It surfaces earnings trends, cost breakdowns, and actionable profitability metrics in a mobile-friendly format optimized for quick glance-overs during load execution.

---

## 1. Information Architecture

### View: Dashboard (Default Landing)

#### Layout: Stacked Sections (Mobile-First)

##### Section 1: Active Load Status (Always Visible)
- **Purpose:** Reassurance that current assignment is on-track
- **Content:**
  - Load ID / Route (Origin → Destination)
  - Status badge: CLAIMED | IN_TRANSIT | DELIVERED
  - Current elapsed time (for HOS tracking awareness)
  - Shipper contact quick-dial button

##### Section 2: 30-Day Earnings Summary (Hero Metric)
- **Purpose:** At-a-glance financial health
- **Layout:**
  - Large metric cards (one per metric):
    - **Total Revenue:** $2,480 (large, kinetic-blue text)
    - **Total Miles:** 1,240 mi (secondary)
    - **Total Loads:** 5 completed (secondary)
    - **Effective CPM:** $1.92/mi (secondary; calculated from revenue ÷ miles)
  - Trend indicator: Green ↑ if better than last 30 days; Red ↓ if worse; Gray → if flat
  - Time period selector: "Last 7 days | Last 30 days | Last 90 days" (radio buttons or tab-like selector)

##### Section 3: Cost Profile Overview
- **Purpose:** Transparency into break-even math
- **Layout (Expandable Card):**
  - **Minimum Profitable RPM:** $2.15 (large, color-coded: green if achievable, red if not)
  - **Cost Breakdown (Expandable):**
    - Fixed CPM: $0.85/mi
    - Fuel CPM: $0.95/mi
    - Maintenance CPM: $0.15/mi
    - Target Margin: $0.20/mi
  - **Edit Button:** "Update Cost Profile" (routes to Profile page)

##### Section 4: Load History (Past 30 Days)
- **Purpose:** Trace earnings back to individual loads; spot patterns
- **Layout:**
  - Table or card list (responsive)
  - Columns: Pickup Date | Route | Distance | Revenue | Actual CPM | Status
  - Sortable by: Date, Revenue, CPM, Status
  - Expandable row: Full load details, shipper contact, profitability breakdown
  - Filter: By status (Delivered, Cancelled, Settled)
  - Pagination or scroll (max 20 visible; lazy-load on scroll)

##### Section 5: Weekly Trend Chart (Optional, Phase 7b+)
- **Purpose:** Visual trend spotting for revenue and CPM stability
- **Layout:**
  - Line chart: X-axis = Week; Y-axis = Total Revenue
  - Secondary line (optional): Weekly effective CPM
  - Colors: kinetic-blue (revenue), accent-teal (CPM)
  - No interactive elements on mobile; tap to expand to full-screen chart on tablet/desktop

##### Section 6: Quick Actions (Footer)
- **Buttons:**
  - "View Load Board" → `/dashboard/trucker/loads`
  - "Update Cost Profile" → `/profile`
  - "Download Earnings Report" → generates CSV (Phase 7b+)

---

### View: Load History Detail (Expandable or Modal)
**Trigger:** Tap a load in the history table

**Content:**
- Pickup date / time window
- Delivery date / time (if completed)
- Full route (origin + destination addresses)
- Distance, weight, commodity, equipment
- **Profitability Breakdown:**
  - Agreed pay rate: $2.50/mi or $500 flat
  - Estimated revenue (for per-mile loads)
  - Estimated miles
  - Fuel cost: $X (estimated)
  - Maintenance cost: $X
  - Net profit: $X (highlighted in green if positive, red if negative)
  - Effective RPM: $X/mi vs Minimum RPM: $X/mi
- Shipper name, rating, payment speed ("Typically pays in 7 days")
- Load status timeline: Claimed → Picked Up → Delivered (with timestamps)
- Document links (BOL, POD) if available
- Payment status: "Pending" | "Paid on [date]" | "Disputed"

---

## 2. High-Contrast & Glare Resistance

### Color Assignments
- **Hero Metrics (Revenue):** kinetic-blue (#2563EB), bold, 32px+ on mobile
- **Status Badges:** success (green) for completed, warning (amber) for in-transit, error (red) for cancelled
- **Profitable Load CPM:** success color (#22C55E)
- **Loss-Making Load CPM:** error color (#EF4444)
- **Minimum RPM (Achieved):** success color
- **Minimum RPM (Unachieved):** error color with warning triangle icon
- **Card Backgrounds:** White (bg-white), Steel Grey (#1E293B) for headers
- **Text:** gray-900 on white (high contrast), gray-600 for secondary text

### Typography
- Hero metrics: **32px SORA bold** (mobile), **36px** (desktop)
- Section headers: **18px SORA bold**
- Body text: **14px INTER regular**
- Secondary text / metadata: **12px INTER regular, gray-600**

### Touch Targets
- All buttons: **minimum 44px height** (`lg` size variant)
- Card expand/collapse: Entire card clickable (min 56px height)
- Tab selectors (time period): **44px min height**

---

## 3. ARIA & Accessibility

### Screen Reader Announcements
- **Hero Metrics Section:** `role="region" aria-label="30-Day Earnings Summary"` — announce total revenue first
- **Trend Indicator:** `aria-label="Revenue up 15% compared to last 30 days"` — convert visual arrow to descriptive text
- **Status Badge:** `aria-label="Load IN_TRANSIT, picked up 2 hours ago"` — announce status and elapsed time
- **Load History Table:** `role="table"` with column headers `<th scope="col">` for accessibility
- **Expandable Cards:** `aria-expanded="true|false"` on expand button; announce change when toggled
- **Payment Status:** `aria-label="Payment pending; typically received in 7 days"` — provide context

### Keyboard Navigation
- Tab order: Active load → Hero metrics → Cost profile → Load history
- Enter/Space: Expand/collapse cards, sort table columns
- No trap focus in tables; full keyboard accessibility

---

## 4. Mobile Considerations

### Simplification for Mobile
- **Load history:** Card stack instead of table; show only Date, Route, Revenue (tap for details)
- **Trend chart:** Not visible on sm breakpoint; add link "View trends" → full-screen chart page
- **Cost breakdown:** Hidden by default; toggle-expand to show

### Gesture Support
- Swipe down: Refresh earnings data (trigger data refetch)
- Swipe left on load card: Reveal action buttons (View Load, Shipper Contact)

### No Hover States
- All interactive elements triggered by tap, not hover
- Tooltips shown on long-press or tap

---

## 5. State-Aware Design

| User State | Display | Interaction |
|---|---|---|
| **No active load** | Hero metrics highlight last 30 days; "View Load Board" CTA prominent | Can review historical earnings |
| **Active load (CLAIMED)** | Active load widget shows "Mark as Picked Up" button | Hero metrics locked; focus is on completing current load |
| **Active load (IN_TRANSIT)** | Active load widget shows "Mark as Delivered" button; HOS widget visible | Hero metrics locked; focus is on HOS compliance |
| **No loads completed in period** | Hero metrics show "—" or "No completed loads"; message: "Claim your first load to see earnings" | CTA button to load board |
| **Cost profile incomplete** | Minimum RPM shows "?" instead of value; message: "Complete your cost profile to calculate profitability" | "Update Cost Profile" button prominent |

---

## 6. Data Freshness & Refresh Strategy

- **Load history:** Refetch every 60 seconds (React Query staleTime) or on manual refresh (swipe down on mobile)
- **Hero metrics:** Calculated from completed loads in the 30-day window; update when new load is marked DELIVERED
- **Trend chart:** Fetched once on mount; refresh available via explicit "Refresh" button (not auto)
- **Payment status:** Fetched from backend payment service; mark as "Pending" until shipper confirms payment

---

## 7. Error & Success Feedback

- **Load Delivered Success:** Toast (green) — "Load delivered! Earnings will be visible after payment confirmation."
- **No completed loads:** Info banner (blue) — "No completed loads in this period. View the load board to start earning."
- **Cost profile incomplete:** Alert banner (orange) — "Your cost profile is incomplete. Profitability calculations are estimates only."
- **Network error:** Banner (red) — "Unable to load earnings data. Refresh the page."
- **Payment dispute:** Alert banner (red, icon: warning triangle) — "Payment for Load [ID] is disputed. Contact shipper."

---

## 8. Responsive Breakpoint Strategy

| Breakpoint | Layout | Metrics Cards | Load History | Trend Chart |
|---|---|---|---|---|
| **sm** | 1-column stack | Stacked vertically | Card stack (date, route, $) | Hidden (link to full-screen) |
| **md** | 1-column, wider | 2 per row | 2-column grid layout | Static, 50% viewport height |
| **lg** | 2-column sidebar | 4 in hero row | Full sortable table | Interactive, 60% viewport height |

---

## 9. CODER Hand-off Checklist

- [ ] Hero metrics display: Total Revenue, Total Miles, Total Loads, Effective CPM
- [ ] Trend indicators (↑ green, ↓ red, → gray) calculated correctly
- [ ] Time period selector (7d/30d/90d) filters load history
- [ ] Load history table/cards render with sort and pagination
- [ ] Cost profile overview shows minimum RPM with color-coding
- [ ] Expandable rows in load history; modal/drawer shows full details
- [ ] Active load widget at top with status badge and HOS widget
- [ ] Hero metrics large and readable (32px+ on mobile)
- [ ] All buttons: `lg` size variant (44px+ height)
- [ ] ARIA labels on sections, trend indicators, status badges
- [ ] Responsive layout: sm (card stack), md (2-col), lg (sidebar + table)
- [ ] React Query staleTime set to 60s for load history; manual refresh via button
- [ ] Toast notifications for success/error
- [ ] Payment status badge ("Pending" | "Paid" | "Disputed") visible in load history
