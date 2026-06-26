# Carrier Dashboard — Owner-Operator Value Specification

**Version:** 1.0  
**Date:** 2026-06-23  
**Owner:** BA (Michael)  
**Purpose:** Define what an owner-operator sees and does on their operations dashboard

---

**Related Documents:**
- [[US-730_Trucker_Dashboard_Redesign]] — User story + AC (uses this spec as reference)
- [[US-730_MVP_SCOPE]] — MVP scope (scope reference)
- [[CARRIER_SAAS_ROADMAP]] — Phase 7 roadmap (context)
- [[owner_operator]] — Persona definition (value drivers)

---

## 🎯 Dashboard Purpose

**The dashboard is where I manage my business daily.** It shows:
- **My current load** — What am I hauling right now? Where am I going? When do I deliver?
- **My performance** — Am I accepting loads? Delivering on time? Building my reputation?
- **My break-even** — What's the minimum rate I need to accept? Which loads make money?
- **Available opportunities** — What loads can I claim right now that meet my needs?

---

## 📊 Dashboard Sections & Owner-Operator Value

### **1. HEADER (Always Visible)**

**What I see:**
- Company logo (FreightClub branding)
- Search bar to quickly find specific loads
- Notification bell showing recent activity (claims, shipper messages, payments)
- My avatar with quick access to my profile and settings

**Why I care:**
- Logo: I know I'm in the right app; clicking it brings me home to my dashboard
- Search: I can quickly find a load I heard about or want to reference
- Notifications: I see urgent messages at a glance without digging through menus
- Avatar: My account settings and sign-out are one click away

---

### **2. ACTIVE LOAD HERO (High Priority)**

**What I see:**
- Where I'm picking up and where I'm delivering
- How far I'm going and how much I'm making (total $ and $/mile)
- A badge showing if this load is profitable for me (GREEN = good profit, YELLOW = neutral, RED = not worth it)
- Current status: Am I picking up now? In transit? Ready to deliver?
- Pickup and delivery timeline (what time window, what's done, what's next)
- Action buttons: Mark as delivered, see full details, message the shipper

**Why I care:**
- Pickup/delivery locations: I know exactly where I'm going
- Distance & rate: I can see the money I'm making instantly
- Profit badge: At a glance, I know if I made the right decision claiming this load
- Status & timeline: I stay on schedule and know what's next
- Action buttons: I can complete my work without leaving the dashboard

**When I don't have a load claimed:**
- Empty message: "No active loads. Browse available loads below to claim your next shipment."
- Encourages me to start browsing immediately

---

### **3. QUICK STATS (My Performance Snapshot)**

**What I see:**
- Acceptance Rate: "92% of loads offered, I claimed" — Shows shippers I'm reliable
- On-Time Delivery: "96% of my loads arrived on schedule" — Builds my reputation
- Completion Rate: "18 out of 18 loads I claimed, I completed" — Shows commitment
- Payments Logged: "12 out of 18 delivered loads, I've recorded payment" — Tracks my cash flow

**Why I care:**
- Acceptance Rate: Shippers want carriers who actually claim loads. High % makes me attractive.
- On-Time Delivery: On-time carriers get better loads and can charge premium rates.
- Completion Rate: Shows I don't abandon loads halfway.
- Payments Logged: I know where I stand financially and can plan my month.

**Color coding tells me at a glance:**
- 🟢 GREEN: I'm doing great (≥90%)
- 🟡 YELLOW: I'm okay but could improve (70-89%)
- 🔴 RED: I need to step up (below 70%)

---

### **4. MY BREAK-EVEN SUMMARY**

**What I see:**
- My minimum acceptable rate per mile (e.g., "$1.85/mile")
- How I calculated it: Fixed costs (truck payment, insurance), Fuel costs, Maintenance costs
- One button to edit if my costs change

**Why I care:**
- Minimum Rate: I never accidentally claim a load that loses money
- Cost breakdown: I understand where my break-even comes from (which cost is the biggest burden?)
- Edit button: When gas prices spike or I get a new truck payment, I update my costs and rates adjust automatically

---

### **5. AVAILABLE LOADS (My Opportunity Board)**

**What I see:**
- How many loads match my minimum rate and preferences (e.g., "42 loads match your break-even")
- Sorting options: Best profit first, newest posted, highest pay, closest distance
- Filtering options: Show only my preferred lanes, filter by pickup date, by distance, by truck type
- Load cards showing:
  - Pickup and delivery cities
  - Distance and total rate
  - MY profitability badge (is THIS load green/yellow/red for ME?)
  - Pickup date and time window
  - What type of truck is needed

**Why I care:**
- Load count: I know how many opportunities are out there right now
- Sorting: I can find the best loads for my situation (closest, most profitable, newest)
- Filtering: I only see loads I actually want (my preferred routes, my truck type)
- Load cards: I scan quickly for green badges (good money) without reading details
- Profitability badge: Each load is colored based on MY costs, not generic data

**Empty state (no loads match):**
- Message: "No loads meet your criteria. Adjust your cost profile or check back soon."
- Encourages me to either lower my rates or wait for better opportunities

---

### **6. PERFORMANCE TRENDS (My Weekly Insight)**

**What I see:**
- Chart showing my daily earnings for the last 7 days (which days made the most money?)
- Chart showing my acceptance rate trend (am I improving or getting worse?)

**Why I care:**
- Earnings trend: I can see which days are profitable and plan accordingly
- Acceptance trend: I know if I'm slipping on my acceptance rate (fewer loads claimed)
- Patterns: I notice if certain days/routes are more profitable than others

**Note (MVP):** Charts show my reputation metrics and completion trends. Actual earnings tracking comes later.

---

### **7. FOOTER (Secondary Actions)**

**What I see:**
- Browse all loads (if I want to see the full board without dashboard filtering)
- My equipment (manage my trucks and trailers)
- Settings (account and notification preferences)

**Why I care:**
- Browse All Loads: Sometimes I want to see everything, not just my filtered view
- My Equipment: Shippers need to know what trucks I have and their capacity
- Settings: I control my notifications and account preferences

---

## 🔄 How I Use the Dashboard: Owner-Operator Workflows

### **Workflow 1: Find & Claim My Next Load (Morning Routine)**

```
1. I open my dashboard — see my break-even rate and available loads
2. I scan the load cards looking for GREEN badges (profitable for me)
3. I find one that matches my route and time — "Houston to Dallas, $310"
4. I click [Claim] — confirm I want this load
5. The load moves to my ACTIVE section at the top (now it's MY load)
6. I see it's a 250-mile load, pickup at 8am, delivery by 6pm
7. I hit the road
```

**Value to me:** I only see loads I can profit from. I claim in seconds. I stay focused on driving.

---

### **Workflow 2: Complete a Load & Track My Cash**

```
1. I arrive at delivery location, drop the load
2. I come back to dashboard, click [Mark Delivered] on the active load
3. I confirm delivery time
4. Status updates: "DELIVERED"
5. I see shipper's payment window (2-3 days)
6. When paid, I record it: Click [Log Payment Received], enter date
7. My "Payments Logged" stat updates (e.g., now showing "13/18")
8. I know how much cash came in this week
```

**Value to me:** I track money in/out. I know when to expect payment. I have records for taxes.

---

### **Workflow 3: Update My Costs When Things Change**

```
1. Fuel prices spike or I get a new truck payment
2. I click [Edit Break-Even] in the cost summary
3. I enter my updated costs
4. My minimum rate recalculates (e.g., now $1.95/mile instead of $1.85)
5. Available loads list instantly updates
6. Some old green loads might be yellow/red now (I know NOT to claim them)
7. New loads appear that meet my higher minimum
```

**Value to me:** My rate adjusts with reality. I'm never caught accepting a money-losing load.

---

### **Workflow 4: Monitor My Reputation**

```
1. I glance at my stats: 92% acceptance, 96% on-time, 18/18 completion
2. I see my acceptance % is dropping (88% now)
3. I realize I've been rejecting too many loads recently
4. I know shippers prefer carriers with high acceptance, so I commit to accepting more
5. Next week, I'm back to 92%
```

**Value to me:** I see how shippers see me. I know what affects my reputation and fix it fast.

---

## 🗺️ Pages & Features Connected to Dashboard

**Things I can do FROM the dashboard:**
- ✅ Claim a load
- ✅ Mark load picked up
- ✅ Mark load delivered
- ✅ Log payment received
- ✅ Edit my break-even costs
- ✅ Message the shipper
- ✅ View a load's full details

**Other pages I can reach (from header or footer):**
- My profile (how shippers see me)
- My account settings & notifications
- Notifications center (all claims, messages, payment alerts)
- Direct messages with shippers
- My equipment (trucks & trailers I own)
- Full load board (if I want to see everything)
- Payment history (all payments logged, tax summary)

---

## 📱 MOBILE-FIRST MANDATORY (Primary Surface)

**This dashboard is MOBILE-ONLY for MVP.** I will use it on my phone in the truck cab 95% of the time. Laptop use is rare (home office, end of week accounting). Tablet use is almost never.

**Design constraint: Optimize for MOBILE PHONE FIRST. Desktop is secondary.**

### Mobile Constraints (Non-Negotiable)

**Screen Size:**
- Primary device: iPhone 12/13 (390px width) — this is my baseline
- Also support: iPhone SE (375px), older Android (360px)
- Goal: Dashboard is usable on smallest current phone
- NOT optimizing for: iPad, laptop (those are bonus if they work)

**Physical Context (Truck Cab):**
- I'm wearing: Heavy-duty gloves, sometimes work gloves (gripping steering wheel)
- Weather: Sun glare (direct sunlight), rain on windshield
- Connectivity: 4G LTE in rural areas (latency, packet loss, 50-100ms delays)
- Attention: I'm distracted (driving, watching road, listening to radio)
- One hand: Steering wheel in other hand or holding coffee
- No keyboard: Touch-only, no trackpad, no mouse

**Mobile-First Design Rules:**

1. **Touch targets ≥48px (not 40px, not 44px — 48px minimum)**
   - Rationale: Gloved hand = 20% larger touch area needed
   - Apply to: All buttons, links, card tap zones
   - Test: Can I tap it accurately while holding steering wheel?

2. **Vertical stack only (no side-by-side on mobile)**
   - Content flows top-to-bottom
   - NO two-column layouts on mobile
   - NO sidebar navigation (takes up 25% of screen)

3. **Above-the-fold priority (what's visible without scrolling?):**
   - Active Load Hero (MUST be visible immediately)
   - 2-3 stats cards maximum (don't need all 4 above fold)
   - Action buttons (Claim, Mark Delivered)
   - Scroll for everything else

4. **High contrast (WCAG AAA, not just AA)**
   - Text on background must be readable in bright sunlight
   - Test: Stand outside with phone in direct sun, can you read it?
   - Dark background (#1A1A1A) + light text (#FFFFFF) recommended
   - OR white background with very dark text (#000000)
   - AVOID: Medium gray, light blue, pastels (unreadable in sun)

5. **Fast load (latency = bad UX)**
   - Dashboard must load in <2 seconds on 4G LTE
   - Metric: Largest Contentful Paint (LCP) < 2s
   - Avoid: Heavy images, bloated scripts, slow API calls
   - Use: Skeleton loaders, progressive loading (hero first, stats second, loads third)

6. **Simple interaction (no complex gestures)**
   - TAP = primary interaction (buttons, links, cards)
   - SWIPE = avoided (hard with gloves, easy to accidentally)
   - SCROLL = acceptable (vertical only)
   - LONG-PRESS = avoid if possible
   - DOUBLE-TAP = don't use (zoom/unintended)

7. **Persistent critical info**
   - Active load hero is ALWAYS visible (sticky or infinite context)
   - Stats are ALWAYS accessible (scroll ≤2s away)
   - No modal screens that hide the dashboard
   - Every action is "stay on dashboard" (inline, not new page)

### Mobile Screen Layout (Vertical Stack)

**Top Section (Always Visible):**
```
┌─────────────────────────┐
│ [Logo] [Notifications]  │  ← Fixed header (sticky)
│         [Avatar]        │
└─────────────────────────┘
```

**Scrollable Content:**
```
1. ACTIVE LOAD HERO
   - Full width, high priority
   - Status + next action button visible

2. QUICK STATS (2 cards)
   - 2×1 grid (not 1×4, not 4×1)
   - Can show 2 most important stats above fold
   - Swipe/scroll to see other 2 stats

3. BREAK-EVEN SUMMARY
   - Compact display (1 line: "Min: $1.85/mi")
   - Edit button always visible

4. AVAILABLE LOADS
   - 1 load card per row (full width)
   - Vertical scroll (infinite or paginated)
   - Claim button visible on each card

5. PERFORMANCE TRENDS
   - Chart stacks vertically (not side-by-side)
   - One chart per row, full width
```

**Sticky Footer (Always Accessible):**
```
┌─────────────────────────┐
│ [Browse Loads] [Settings] │  ← Sticky footer (or bottom nav)
└─────────────────────────┘
```

### Tablet & Desktop (Bonus, Not Primary)

- If screen ≥768px: Grid layouts can be 2-column (hero + stats on left, loads on right)
- If screen ≥1024px: 3-column layout (hero, stats, loads side-by-side)
- BUT: These are nice-to-haves. Mobile experience is the main event.

---

## Success Metric: Mobile-First Verification

**Before HFD signs off on US-730-0, verify:**

✅ **I can complete these tasks on my iPhone in direct sunlight:**
1. [ ] Open dashboard, see my active load without squinting
2. [ ] Tap [Mark Delivered] accurately with gloved hand (on first try, not second)
3. [ ] Claim a load with one hand (other hand on steering wheel)
4. [ ] See my acceptance/on-time stats without confusion
5. [ ] Scroll to available loads smoothly
6. [ ] No lag (dashboard responds instantly to taps)

✅ **Accessibility (WCAG AAA):**
- [ ] Text contrast passes 7:1 ratio (brightest + darkest elements)
- [ ] All interactive elements ≥48px touch target
- [ ] Focus indicators visible (for keyboard/accessibility testing)
- [ ] Page works on 3G (not just 4G)

✅ **Performance:**
- [ ] First load <2 seconds
- [ ] Interactions respond <100ms (no lag)
- [ ] Scrolling is smooth (60fps)

**If it doesn't pass mobile-first verification, it's not ready.**

---

## ✨ Success Metrics (What "Done" Looks Like)

**I know the dashboard works when:**
- ✅ I claim a new load in <30 seconds without confusion
- ✅ I can see if a load makes money for ME (my badge, not generic data)
- ✅ My break-even automatically reflects fuel price changes
- ✅ I know my acceptance/on-time/completion rates at a glance
- ✅ I can message a shipper without leaving the dashboard
- ✅ The dashboard loads on slow 4G (in rural areas)
- ✅ I can use it one-handed with gloves on
- ✅ Payment acknowledgment is 2 taps (not a form)
- ✅ My stats update when I claim/deliver/pay (no refresh needed)

---

**Status:** OWNER-OPERATOR VALUE SPEC LOCKED  
**Next:** HFD designs layout to deliver this value  
**Author:** Michael (30+ years carrier SaaS experience)
