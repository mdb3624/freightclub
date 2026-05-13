# Load Board Design Spec — Operator/Trucker UX

**Author:** Human Factors Designer  
**Phase:** Phase 7 (Fleet Management)  
**Constraint:** Mobile-first, high-glare, high-vibration environment  
**Persona:** Owner/Operator trucker — time-sensitive load discovery, profitability at a glance

---

## Purpose
The Load Board is a **trucker's primary workspace** for finding, evaluating, and claiming loads. All interactions must minimize friction and maximize speed in high-stress, mobile-first environments with poor visibility (sun glare, dashboard vibration).

---

## 1. Information Architecture

### View: Load Board List
**Primary Goal:** Rapid scan of available loads; evaluate profitability in seconds.

#### Layout
- **Header:** Sticky filter bar (always visible)
  - Origin State (dropdown, persisted in URL)
  - Destination State (dropdown, persisted in URL)
  - Equipment Type (dropdown, pre-filled from trucker profile but unlockable)
  - Pickup Date Filter (relative: Today, Tomorrow, This Week, All)
  - Refresh Button (↻) — real-time load updates

- **Status Strip:** High-density summary above table
  - Count chips: "Open (18) | Claimed (2) | In Transit (1) | Delivered (3)"
  - Clear at-a-glance awareness without navigation

- **Load Cards (Table / Mobile Stack):**
  - **Route:** Origin City, ST → Destination City, ST (primary info)
  - **Pickup Urgency:** Relative time badge (Green: "3 days", Amber: "Tomorrow", Red: "Picks up in 2 hrs")
  - **Equipment:** Dry Van, Flatbed, etc. (icon + text for mobile readability)
  - **Weight:** "20,000 lbs" (secondary, sub-line)
  - **Pay Rate:** "$2.50/mi" or "$500 flat" (high contrast, large text)
  - **RPM Badge:** Color-coded circle (Green/Yellow/Red) with number to 2 decimal places
    - Tooltip on hover: "Estimated profit: $120 @ 240 mi" (profit-focused, not just RPM)
  - **Shipper Rating Star:** 4.8★ (1-line, right-aligned)
  - **Commodity:** Sub-line small text (e.g., "General Freight")

**Responsive Strategy:**
- **Desktop (lg breakpoint):** Full table with sortable columns (Route, Pickup Urgency, Equipment, Weight, Pay, RPM, Rating)
- **Tablet (md breakpoint):** Card-based layout; Route + Pay + RPM + Pickup Urgency visible; swipe right to reveal more details
- **Mobile (sm breakpoint):** Vertical stack; Route, Pickup Urgency, Pay, RPM visible; tap to expand details

#### Interaction: Sorting
- Sort by: Pickup Date (default), RPM, Distance, Pay Rate
- Sort direction: Asc/Desc toggle
- Active sort indicator: Column header highlight + arrow (↑/↓)

#### Interaction: Claim Load
- **Button:** "Claim Load" (large, min 44px height, `lg` size variant)
- **State:** Enabled if trucker has no active load; disabled + tooltip message if active load exists
- **Feedback:** Toast confirmation immediately after claim; auto-scroll to "My Active Load" section

---

### View: My Active Load (Persistent Widget)
**Goal:** Single active load always in view; prevents confusion about current assignment.

#### Layout (positioned below filter bar or sticky on mobile)
- **Card Style:** High-contrast background (primary-600), white text
- **Content:**
  - Status badge: "IN_TRANSIT" (large, color-coded: amber CLAIMED, blue IN_TRANSIT, green DELIVERED)
  - **Shipper name** + **Phone button** (clickable, links to phone dialer on mobile)
  - **Route:** Origin → Destination (full addresses hidden until expanded)
  - **Pickup/Delivery Windows:** Earliest - Latest format
  - **Load Details Row:** Distance | Weight | Commodity (scannable)
  - **Profitability Breakdown:** Estimated Revenue | Fuel Cost | Net Profit (expandable)
  - **HOS Widget:** Positioned immediately below (11-hr drive rule, 14-hr on-duty window) — always visible
  - **Action Buttons:** "Mark as Picked Up" / "Mark as Delivered" (color-coded, `lg` size, min 44px)

#### State Logic
- **CLAIMED:** Show "Mark as Picked Up" button (enabled immediately)
- **IN_TRANSIT:** Show "Mark as Delivered" button; show HOS widget prominently
- **DELIVERED:** Show "Load Completed" confirmation; display profitability breakdown + shipper review CTA

---

### View: Cost Profile Setup CTA
**Goal:** Ensure RPM badges are meaningful; prompt setup if missing.

#### Layout (dismissible banner above load list if no cost profile exists)
- **Content:** "Add your cost profile to see accurate profit margins. RPM badges are based on your fuel, maintenance, and target margin."
- **Button:** "Complete Cost Profile" → routes to `/profile` Cost Profile section
- **Dismissal:** "Dismiss" link (does not persist across sessions; shows again on next login if still incomplete)

---

## 2. High-Contrast & Glare Resistance

### Color Assignments (per STYLE_GUIDE)
- **Load Card Background:** White (bg-white)
- **RPM Green (Profitable):** `rpm-high` (#22C55E) with white text
- **RPM Yellow (Breakeven):** `rpm-neutral` (#F59E0B) with dark text
- **RPM Red (Loss):** `rpm-low` (#EF4444) with white text
- **Pay Rate Text:** kinetic-blue (#2563EB), bold, minimum 16px on mobile
- **Pickup Urgency Amber:** warning (#F59E0B), high contrast against white
- **Pickup Urgency Red:** error (#EF4444), high contrast against white

### Touch Targets
- All interactive elements (claim button, sort headers, load cards): **minimum 44px height**
- Padding around buttons: **px-6 py-3** (minimum)
- Font sizes: Pay rates and status badges **≥ 16px** on mobile; headers **≥ 14px**

---

## 3. ARIA & Accessibility

### Screen Reader Announcements
- **RPM Badge:** `aria-label="RPM: $2.48, Profitable (at or above your minimum)"` — convey both number and profitability status
- **Load Card Region:** `role="article"` with `aria-labelledby="load-[id]-route"` pointing to the route heading
- **Filter Bar:** `role="region" aria-label="Load board filters"`
- **Active Load Widget:** `role="region" aria-live="polite" aria-label="My Active Load"`— announce changes when load status updates
- **Cost Profile CTA:** `role="alert"` (semantically important, auto-announces to screen readers on load)

### Keyboard Navigation
- Tab order: Filters → Sort controls → Load cards → Claim button
- Enter or Space: Claim load; open details
- Escape: Close expanded load card
- Arrow keys: Navigate within table (lg breakpoint)

---

## 4. Mobile Considerations (High-Vibration Environment)

### Gesture Support
- **Swipe right:** Reveal additional load details (commodity, special requirements) on card
- **Swipe left:** Hide details, return to compact view
- **Tap:** Expand full load detail modal

### No Hover States on Mobile
- Tooltips triggered by tap, not hover
- Sort indicators visible without hovering

### Persistent Sticky Elements
- Filter bar stays at top during scroll (sticky positioning)
- "My Active Load" widget remains visible when scrolling load list (sticky or floating)
- Floating action button (mobile only): "Claim" button duplicated as FAB if scrolled below fold

---

## 5. Load Detail Modal (Mobile/Tablet)

**Trigger:** Tap a load card

**Content:**
- Full route and addresses
- Pickup and delivery windows
- Weight, dimensions, commodity, equipment type
- Special requirements (tarps, liftgate, hazmat, etc.)
- Shipper name, rating, contact info
- Full profitability breakdown: revenue, fuel cost, maintenance, net profit, effective RPM vs minimum
- Shipper's average payment speed ("Typically pays in 7 days")
- **Claim Load** button (large, `lg` size, 44px+)
- Close button (top right, large hit target)

---

## 6. State-Aware Design

| User State | Display | Interaction |
|---|---|---|
| **No cost profile** | Cost Profile CTA banner; RPM badges show "?" instead of value | "Complete Profile" CTA button |
| **Has active load** | Load board filtered by Claimed/In Transit; "Claim" buttons disabled with tooltip; "My Active Load" prominent | Can view other loads but cannot claim until delivery |
| **No active load** | Full load board visible; "Claim" buttons enabled | Can claim any load |
| **Pickup window active** | Pickup urgency badge turns red; "Mark as Picked Up" button highlights | User encouraged to confirm pickup |
| **Delivery window active** | Delivery window turns red; "Mark as Delivered" button highlights | User encouraged to confirm delivery |

---

## 7. Error & Success Feedback

- **Claim Success:** Toast (green, `success` color) — "Load Claimed! Shipper will be notified." Auto-scroll to "My Active Load" widget.
- **Claim Blocked:** Toast (red, `error` color) — "You have an active load. Deliver it before claiming another."
- **Network Error:** Banner (error color) — "Unable to load board. Check your connection and refresh." Retry button.
- **Stale Load:** Toast (warning color) — "This load was claimed by another trucker. It's no longer available."

---

## 8. Responsive Breakpoint Strategy

| Breakpoint | Screen Size | Layout | Touch Target Size | Font Size (Body) |
|---|---|---|---|---|
| **sm** | 320–640px (Mobile) | Vertical card stack | 44×44px min | 16px |
| **md** | 641–1024px (Tablet) | 2-column card layout | 44×44px min | 14px |
| **lg** | 1025px+ (Desktop) | Full table with sortable headers | 40×40px | 14px |

---

## 9. CODER Hand-off Checklist

- [ ] Load cards render with route, pay rate, RPM badge, pickup urgency, shipper rating
- [ ] RPM badge styled with semantic colors: green (rpm-high), yellow (rpm-neutral), red (rpm-low)
- [ ] Filter persistence via URL query params; back-navigation preserves filters
- [ ] "My Active Load" widget updates reactively when load status changes (via React Query stale time or real-time subscription)
- [ ] Claim button disabled + tooltip message when trucker has active load
- [ ] Cost Profile CTA banner shown only if missing; dismissible for session
- [ ] HOS widget visible at all times (integrated into active load widget or adjacent)
- [ ] Pickup urgency badges color-coded and clear
- [ ] Button sizes conform to `lg` variant (44px+ height)
- [ ] ARIA labels on RPM badges, active load widget (aria-live), load cards (role="article")
- [ ] Responsive layout tested: mobile card stack, tablet 2-col, desktop table
- [ ] Toast notifications for success/error/warning; positioned bottom-right, dismissible
