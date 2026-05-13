# Shipper Dashboard Design Spec — Load Orchestration Hub

**Author:** Human Factors Designer  
**Phase:** Phase 7 (Fleet Management)  
**Constraint:** High-density data management, minimal clicks for repetitive operations  
**Persona:** Shipper — post and track loads, manage carrier relationships, process payments

---

## Purpose
The Shipper Dashboard is a **high-density command center** for posting, tracking, and managing loads at scale. It balances rapid multi-load operation with detailed status visibility and zero-friction load posting.

---

## 1. Information Architecture

### View: Dashboard (Default Landing)

#### Layout: Modular Grid (Desktop-First, Responsive)

##### Section 1: Status Summary Strip (Top)
- **Purpose:** At-a-glance view of all active loads
- **Content:** Chip-style count badges (no detail, just counts)
  - "Draft (2) | Open (8) | Claimed (5) | In Transit (3) | Delivered (1) | Settled (12)"
- **Styling:** High-contrast, semi-transparent backgrounds; light text on dark
- **Interaction:** Click a chip to filter the load table below

##### Section 2: Quick Load Post CTA (Hero Button)
- **Purpose:** Minimize friction for posting new loads (goal: < 2 minutes)
- **Button:** "+ Post a New Load" (large, prominent, `lg` size, kinetic-blue)
- **Tooltip:** "Shortcut: Cmd+L (Mac) / Ctrl+L (Windows)"
- **Routes to:** `/shipper/loads/new` (full-page form or modal)

##### Section 3: Load Management Table
- **Purpose:** Centralized view of all posted loads with status and carrier info
- **Layout (Desktop):** Full sortable table
  - **Columns:**
    1. Load ID (link to detail)
    2. Route (Origin → Destination, cities + states)
    3. Status (badge: DRAFT | OPEN | CLAIMED | IN_TRANSIT | DELIVERED | SETTLED)
    4. Carrier Name (empty until claimed)
    5. Pickup Window (date range, small text)
    6. Pay Rate ($X/mi or $X flat)
    7. Shipper-Claimed Date (if claimed)
    8. Actions (3-dot menu: Edit, Duplicate, Cancel, View Details)

  - **Sorting:** By Load ID, Route, Status, Date Posted, Pay Rate
  - **Filtering:** Status chips above table; multi-select via checkboxes
  - **Pagination:** 25 per page; lazy-load on scroll or manual pagination

##### Section 4: Load Detail Panel (Slide-Out or Modal)
- **Trigger:** Click a load ID or "View Details" action
- **Content:**
  - **Header:** Route + Status badge + Posted date
  - **Load Info:** Origin/dest full address, pickup window, delivery window
  - **Freight Info:** Commodity, weight, dimensions, equipment type, special requirements
  - **Pricing:** Pay rate, estimated total (for per-mile loads)
  - **Carrier Info (if claimed):**
    - Carrier name, rating, contact phone/email
    - Pickup/delivery status timeline (claimed at X, picked up at Y, delivered at Z)
    - Profitability breakdown (shipper perspective): Revenue - Carrier Pay = Shipper Margin
  - **Document Links:** BOL photo (if uploaded), POD photo (if delivered), signed docs
  - **Actions:**
    - Edit (if DRAFT or OPEN)
    - Duplicate (quick copy to new load form)
    - Cancel (with confirmation; disabled if already picked up)
    - Export (PDF with all details)

##### Section 5: Top Performers Widget (Optional, Phase 7b+)
- **Purpose:** Quick reference to preferred carriers
- **Layout:** Compact table or card list
  - **Columns:** Carrier Name | Loads Completed | Avg Rating | Preferred Lane
  - **Interaction:** Click carrier name to view public profile or assign preferred status to new loads

---

### Detailed Views

#### Load Posting Form
- **Goal:** Complete in < 2 minutes per load
- **Organization:** Sequential steps (Hick's Law) — one section per step
  1. **Pickup Details** (collapsed/expanded)
     - Address (street, city, state dropdown, zip)
     - Pickup window (earliest date/time, latest date/time)
  2. **Delivery Details**
     - Address (same fields as pickup)
     - Delivery window
  3. **Freight Info**
     - Commodity (dropdown with common types)
     - Weight (numeric, hint: "Legal max: 80,000 lbs")
     - Dimensions (optional: length, width, height)
     - Special requirements (checkboxes: Tarps, Straps, Hazmat, Liftgate, Inside Delivery, Team Drivers)
  4. **Equipment Type**
     - Radio buttons: Dry Van, Flatbed, Reefer, Step Deck, Tanker (vertical list)
  5. **Pricing**
     - Pay rate type: Flat $ or $/mile (toggle)
     - Amount (numeric)
     - Payment terms (dropdown: Quick Pay, Net 7, Net 15, Net 30)
  6. **Review & Publish**
     - Summary of all fields
     - Publish button (kinetic-blue, large)
     - Save as Draft button

- **Responsive:** Form steps stack vertically on mobile; horizontal step indicator on desktop (progress bar with step numbers)

---

## 2. High-Contrast & Mobile-Friendly Design

### Color Assignments
- **Status Badges:**
  - DRAFT: gray (mid-grey, #334155)
  - OPEN: primary (kinetic-blue, #2563EB)
  - CLAIMED: warning (amber, #F59E0B)
  - IN_TRANSIT: secondary-blue (accent, #00D4FF)
  - DELIVERED: success (green, #22C55E)
  - SETTLED: accent-teal (teal, #00E5A8)

- **Pay Rate Text:** kinetic-blue, bold, minimum 14px
- **Carrier Rating Stars:** accent-teal with numeric (e.g., "4.8★")
- **Clickable Elements:** kinetic-blue underline on hover/focus (desktop); clear focus ring on mobile

### Typography
- Section headers: **16px SORA bold**
- Table headers: **12px INTER bold, text-gray-600 uppercase**
- Body text: **14px INTER**
- Route (primary info): **16px INTER bold**
- Status badge: **12px INTER bold**

### Touch Targets
- All table rows: Clickable (min 44px height with padding)
- All buttons: `lg` size variant (44px+ height)
- 3-dot menu: 40×40px minimum

---

## 3. ARIA & Accessibility

### Screen Reader Announcements
- **Status Strip:** `role="region" aria-label="Load Status Summary"` — list counts in order
- **Load Table:** `role="table"` with `<thead>`, `<tbody>`, column headers `scope="col"`
- **Status Badges:** `aria-label="Load status: In Transit, claimed 2 days ago, picked up 1 day ago"`
- **Sortable Headers:** `aria-sort="ascending"` | `"descending"` | `"none"` — announce current sort state
- **Filtering Chips:** `role="button" aria-pressed="true|false"` — announce selected status filters
- **Load Detail Panel:** `role="region" aria-label="Load Details"` — announce when opened/closed

### Keyboard Navigation
- Tab order: Quick Post button → Status chips → Load table → Detail panel close button
- Enter: Open detail panel, apply filter, post load
- Escape: Close detail panel
- Arrow keys: Navigate table rows (if table has keyboard nav enabled)

---

## 4. Mobile Considerations

### Responsive Table Behavior
- **sm (Mobile):** Load cards in vertical stack; show only Load ID, Route, Status, Actions (3-dot menu)
  - Swipe right to reveal Pay Rate
  - Tap card to expand full details in bottom sheet
- **md (Tablet):** 2-column card layout; show Route, Status, Pay Rate, Actions
- **lg (Desktop):** Full sortable table with all columns

### Load Posting Form on Mobile
- **Step indicators:** Numbered buttons (1, 2, 3...) at top; "Back" / "Next" buttons below
- **Section visibility:** Only current step visible; previous/next hidden until user advances
- **Address fields:** Auto-complete suggestions below each field (tap to fill)

### No Hover States
- All tooltips triggered by tap/long-press, not hover
- Status explanations shown in modals, not tooltips

---

## 5. State-Aware Design

| User State | Display | Interaction |
|---|---|---|
| **No loads posted** | Empty state message: "No loads yet. Create your first load to get started." | "+ Post a New Load" button prominent |
| **Loads in DRAFT** | Draft count visible in status strip; draft loads listed with "Continue Editing" action | Quick resume of in-progress posts |
| **Active open loads (unclaimed)** | "OPEN" count highlighted; open loads at top of table | "Duplicate" action available for quick repost |
| **Active claimed load** | "CLAIMED" and "IN_TRANSIT" counts highlighted; carrier contact info visible in load detail | View POD photo when delivered; process payment when ready |
| **Load delivered (awaiting payment)** | "DELIVERED" badge; payment status: "Pending"; payment date field visible | Process payment; capture receipt |
| **Shipper rating pending** | "Rate Carrier" CTA in load detail after delivery | Submit rating to build shipper reputation |

---

## 6. Data Freshness & Real-Time Updates

- **Load Table:** Refresh on mount; refetch every 120 seconds (React Query staleTime) or on manual "Refresh" button
- **Carrier info:** Fetch on load detail open; cache for session
- **Payment status:** Refresh every 30 seconds if in DELIVERED state (high priority for shipper)
- **Notifications:** Toast when load is claimed, picked up, or delivered by carrier (via WebSocket or polling)

---

## 7. Critical Actions & Confirmations

### Cancel Load (Destructive)
- **Gate:** Only available if load is OPEN or CLAIMED (before pickup)
- **Confirmation Dialog:**
  - Headline: "Cancel Load [ID]?"
  - Message: "The carrier will be notified, and the load will be unpublished. This cannot be undone."
  - Reason field (optional but recommended): "Why are you cancelling?" (text area; hint: "Explain briefly to maintain carrier trust")
  - Buttons: "Cancel Anyway" (red, danger style) | "Keep Load" (secondary)

### Edit Load (Before Pickup)
- **Gate:** Only available if DRAFT or OPEN
- **Behavior:** Navigate to load posting form with pre-filled data
- **Warning:** "Changes will be published immediately. Carriers will see updates in real-time."

---

## 8. Error & Success Feedback

- **Load Posted:** Toast (green) — "Load posted! Carriers can now claim it."
- **Load Duplicate:** Toast (blue) — "Load duplicated. You can now edit and post."
- **Load Cancelled:** Toast (red) — "Load cancelled. Carrier notified."
- **Load Claimed:** Toast (amber) — "Load claimed by [Carrier Name]! Contact info available in load details."
- **Load Delivered:** Toast (green) — "Load delivered! Download POD and process payment."
- **Payment Processed:** Toast (green) — "Payment sent to [Carrier Name]. Receipt available."
- **Network Error:** Banner (red) — "Unable to update. Check your connection and refresh."

---

## 9. Responsive Breakpoint Strategy

| Breakpoint | Load Table | Form Layout | Status Strip |
|---|---|---|---|
| **sm** | Card stack (Route, Status, Actions) | Vertical steps (1/6, 2/6...) | Horizontal chips, scrollable |
| **md** | 2-column grid | Compact form, 2-step indicator | Same as sm |
| **lg** | Full sortable table | Expanded form, horizontal layout | Chips in row |

---

## 10. CODER Hand-off Checklist

- [ ] Status summary strip renders chip counts (Draft, Open, Claimed, In Transit, Delivered, Settled)
- [ ] Clicking status chip filters load table
- [ ] Load table displays Route, Status, Carrier Name, Pickup Window, Pay Rate, Date Posted, Actions
- [ ] Sortable columns: Load ID, Route, Status, Date Posted, Pay Rate
- [ ] Pagination: 25 loads per page; lazy-load or manual pagination
- [ ] Detail panel/modal renders on load click with full details, carrier info, documents, actions
- [ ] Load posting form organized in sequential steps (Hick's Law)
- [ ] Address fields: street, city, state (validated dropdown), zip
- [ ] Pickup/delivery windows: "Earliest" and "Latest" labeled clearly
- [ ] Weight field shows hint: "Legal max: 80,000 lbs"
- [ ] Special requirements: Checkboxes for Tarps, Straps, Hazmat, Liftgate, etc.
- [ ] Cancel load action: Confirmation dialog with reason field
- [ ] Edit load action: Routes to form with pre-filled data; shows warning about real-time updates
- [ ] Status badges color-coded per spec (gray DRAFT, blue OPEN, amber CLAIMED, etc.)
- [ ] All buttons: `lg` size variant (44px+ height)
- [ ] ARIA labels on status strip, table, detail panel, sortable headers
- [ ] Responsive: sm (card stack), md (2-col grid), lg (full table)
- [ ] React Query staleTime: 120s for table, 30s for payment status
- [ ] Toast notifications for post, duplicate, cancel, claim, deliver, payment
- [ ] Keyboard navigation: Tab, Enter, Escape
