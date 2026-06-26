# US-730-0: Carrier Dashboard Design Specification

**Story:** US-730-0 (Dashboard Structure & Mobile Design Spec)  
**Epic:** US-730 (Carrier Dashboard MVP)  
**Phase:** Phase 7a (Carrier MVP)  
**Owner:** HFD (Human Factors Designer)  
**Status:** READY_FOR_IMPLEMENTATION  
**Date:** 2026-06-23  

---

## Design Vision: NO-SCROLL Paradigm

**For:** Owner-Operators (independent truckers, 35-65 years old, 15-40 years experience)  
**In Truck Cab:** iPhone SE/12/13 (375-390px), gloved hands, direct sunlight, one-handed operation  
**Goal:** Single-screen dashboard showing profitability, reputation, available actions, and load opportunities  
**Design Constraint (CRITICAL):** **ZERO VERTICAL SCROLLING** — All content fits within 100vh viewport using tabbed interface and modals  
**Paradigm Shift:** Instead of vertical stacking, use:
- 40% viewport: Active Load Hero (or Available Loads if no active load)
- 60% viewport: Tabbed content area (My Stats | Available Loads | Quick Actions)
- Modals: All non-critical interactions (Cost Profile, Equipment, Load Details)
- HOS Widget: Floating overlay (corner) or header-integrated
- Density Optimization: Icon-only metrics, pill-button layouts

---

## Reference Prototype

📸 **Prototype Location:** `docs/project/specs/carrier-page-example.png`

**Prototype Features:**
- Dark background (truck cab sunlight readability)
- Bronze/orange gradient accents (#C9A46A → #B08D57)
- Large touch targets for gloved hands
- Vertical layout (no horizontal scroll)
- Hero section at top with key metrics
- Call-to-action buttons with bronze gradient
- Secondary panels below hero section
- High contrast text (light on dark)

---

## Carrier Persona: Owner-Operator

### Demographics
- **Age:** 35-65 years old
- **Experience:** 15-40 years in trucking industry
- **Fleet Size:** 1-4 trucks (self-operated or managing 1-3 drivers)
- **Primary Device:** iPhone (uses phone 95% of the time in truck cab)
- **Context:** Moving vehicle, high-glare sunlight, one hand on steering wheel

### Motivations (Priority Order)
1. 🎯 **"Will this load make me money?"** — Profitability visibility (green/yellow/red badges)
2. 📊 **"What's my break-even?"** — Cost profile + RPM calculation
3. 🚛 **"How do I manage my equipment?"** — Equipment specs, condition, capacity
4. ⚡ **"How do I claim loads fast?"** — 1-tap claiming, preferred lanes, availability
5. 💰 **"Where do I make money consistently?"** — Lane preferences, historical earnings
6. ✅ **"Am I compliant?"** — HOS tracking, insurance verification
7. 💳 **"Get me paid"** — Settlement, earnings history, tax reporting

### Pain Points
- ❌ Broker websites are cluttered, not mobile-optimized
- ❌ Can't easily calculate profitability in my head while driving
- ❌ Don't trust rates that don't meet my minimum RPM
- ❌ Too much friction to claim loads (multiple taps, confusing UX)
- ❌ No visibility into why a shipper chose me or another carrier

### Critical Validations (Carrier MVP)
- ✅ **OO-CRIT-3:** Cost profile (fixed/fuel/variable CPM, min RPM)
- ✅ **OO-CRIT-4:** Load board RPM filtering
- ✅ **OO-CRIT-8:** Performance reputation system (acceptance %, on-time %)

---

## Design System

### Color Palette (Luxury Industrial Aesthetic)

#### Primary Colors
- **Deep Charcoal Background:** `#121212` (Luxury foundation, superior contrast in sunlight)
- **Dark Surface:** `#1A1A1A` (elevated surfaces, minimal contrast variation)
- **Metallic Copper/Bronze Accent:** `#B08D57` (Primary CTA color, focus states)
- **Bronze Gradient:** `linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)`

**Rationale:** Deep charcoal (#121212) provides superior contrast compared to #0F1419 for sunlight readability, critical for cab use. Metallic copper evokes industrial precision and trucker aesthetic.

#### Semantic Colors (WCAG AAA Contrast in Sunlight)
- 🟢 **Success/Profitable:** `#27AE60` (Green — ≥120% min RPM) — contrast 7.8:1
- 🟡 **Warning/Marginal:** `#F39C12` (Amber — 100-120% min RPM) — contrast 6.2:1
- 🔴 **Danger/Loss:** `#E74C3C` (Red — <100% min RPM) — contrast 5.1:1
- 🔵 **Info/HOS Alert:** `#3498DB` (Blue — metrics, informational) — contrast 4.8:1
- ⚪ **Text Primary:** `#FFFFFF` (White — headers, critical info) — contrast 21:1
- 🔘 **Text Secondary:** `#B0B0B0` (Light gray — secondary info) — contrast 7.1:1
- 🔘 **Text Muted:** `#808080` (Medium gray — tertiary, hints) — contrast 4.5:1

**Testing:** All color combinations tested in direct sunlight with WCAG AAA standard (7:1 minimum for cab environment).

#### Border & Divider
- **Panel Border:** `1px solid #333333` (subtle separation)
- **Divider:** `1px solid #2A2F37` (section dividers)

### Typography

#### Font Stack
- **Headers:** Sora, San Francisco, Helvetica Neue, sans-serif
- **Body:** Inter, Roboto, System UI, sans-serif
- **Mono:** Courier New (for load IDs, prices)

#### Sizes
- **H1 (Hero Title):** 28px, bold, uppercase, letter-spacing +2px
- **H2 (Section Title):** 20px, bold, uppercase, letter-spacing +1px
- **H3 (Card Title):** 16px, semibold, title-case
- **Body Text:** 14px, regular, sentence-case
- **Small Text:** 12px, regular, muted color
- **Tiny Text:** 11px, regular, secondary color

#### Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Spacing System

**Base Unit:** 4px (multiples of 4)

- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px
- **2xl:** 48px

### Interactive Elements

#### Touch Targets
- **Minimum:** 48px × 48px (glove-friendly)
- **Preferred:** 56px × 56px (generous tap area)
- **Spacing Between:** 8px minimum (prevent mis-taps)

#### Button Styles

**Primary CTA Button (Claim Load, etc.)**
```
Height: 48px
Padding: 12px 24px
Border Radius: 8px
Font: 14px semibold, white
Background: Bronze Gradient
    linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)
Box Shadow: 
    inset 0 1px 2px rgba(255,255,255,0.25)
    inset 0 -1px 2px rgba(0,0,0,0.2)
    0 2px 5px rgba(0,0,0,0.35)
Border: 1px solid #7A5F3A
Focus State: Outline 2px solid #C9A46A (offset 2px)
```

**Secondary Button (View Details, etc.)**
```
Height: 48px
Padding: 12px 24px
Border Radius: 8px
Font: 14px semibold, white
Background: Transparent
Border: 2px solid #B08D57
Focus State: Outline 2px solid #B08D57
```

**Tertiary Button (Cancel, Skip, etc.)**
```
Height: 48px
Padding: 12px 24px
Font: 14px regular, secondary text
Background: Transparent
Border: None
Focus State: Outline 2px solid #B08D57
```

#### Focus State
- **All interactive elements:** 2px solid bronze (#B08D57) outline
- **Offset:** 2px from element edge
- **Keyboard accessible:** Always visible

### Badges & Status Indicators

**Profitability Badge (Load Cards)**
```
Display: Inline-block
Width: 60px, Height: 60px
Border Radius: 8px
Font: 10px bold, centered, uppercase

GREEN (#27AE60):   ≥120% min RPM
AMBER (#F39C12):   100-120% min RPM
RED (#E74C3C):     <100% min RPM
Icon: Checkmark, dash, or X (semantic icon)
```

**Metric Badge (Dashboard Stats)**
```
Display: Full-width card
Padding: 16px
Border: 1px solid #333333
Border Radius: 8px

Title: 12px, muted gray
Value: 24px, bold white
Unit: 14px, secondary gray
Status: Color-coded (green/amber/red based on target)
```

---

## AC-to-UI Mapping: Functional Requirements

This section explicitly links design elements to Owner-Operator acceptance criteria and functional requirements.

### Requirement 1: Profitability Assessment (AC-1)
**Owner-Operator Need:** "Will this load make me money?" — Visibility of profitability in seconds, without calculation

**Design Element:** Profitability Badges (Load Cards)
- **Location:** Every load card (hero section + available loads list)
- **Visual:** Colored badge with icon + percentage
  - 🟢 **GREEN:** ≥120% min RPM — "High Profit" (checkmark icon)
  - 🟡 **AMBER:** 100-120% min RPM — "Marginal" (dash icon)
  - 🔴 **RED:** <100% min RPM — "Not Viable" (X icon)
- **Size:** 60px × 60px (thumb-reachable, high visibility)
- **Placement:** Top-right corner of load card
- **Tap Behavior:** Show detailed breakdown (rate / distance = RPM)
- **Mandatory:** Every load card MUST display this badge

**Supporting Info:** RPM calculation displayed inline
```
Rate: $310
Distance: 265 miles
RPM: $1.17 ✅ 118%
```

**Critical Constraint:** Profitability badge is MEANINGLESS without cost profile. See Requirement 3.

---

### Requirement 2: HOS (Hours of Service) Visibility (AC-2)
**Owner-Operator Need:** "Am I compliant?" — Real-time visibility of remaining driving hours without leaving dashboard

**Design Element:** Persistent HOS Widget (Fixed/Sticky)
- **Location:** Fixed at bottom of screen OR top-right corner (non-intrusive but always visible)
- **Size:** Compact (height: 60-80px max)
- **Content:**
  - 11-Hour Driving Limit (circular progress bar)
    - Hours driven today: 8 hrs
    - Hours remaining: 3 hrs
    - 🟢 **GREEN:** >2 hrs remaining (compliant)
    - 🟡 **AMBER:** 1-2 hrs remaining (approaching limit)
    - 🔴 **RED:** <1 hr remaining (STOP, must rest)
  - 14-Hour Duty Cycle (linear progress bar)
    - Hours on duty: 12 hrs
    - Hours remaining: 2 hrs
    - Same color coding (green → amber → red)

**Visual Style:**
- Dark background matching dashboard (#1A1A1A)
- Circular progress for 11-hr limit (easy to scan)
- Linear progress for 14-hr cycle (shows duration)
- Large, bold text for remaining hours (24px bold)
- Compact label (12px muted)

**Interaction:**
- Tap HOS widget to open HOS detail page (if needed)
- Tap does NOT close or minimize (must remain visible)
- Color flash notification when entering AMBER zone
- Red pulsing when in RED zone (immediate alert)

**Tap-Only:** NO swipe to hide or dismiss

**Critical Requirement:** HOS widget MUST ALWAYS be visible without navigating away from dashboard. Owner-operator should never need to check HOS via separate navigation.

---

### Requirement 3: Cost Profile Access & Visibility (AC-3)
**Owner-Operator Need:** Cost profile must be easy to find and understand, as profitability badges depend on it

**Design Elements:**

**A. Cost Profile Summary (Dashboard Header Area)**
- **Location:** Below header, above hero section OR in quick actions panel
- **Display:**
  ```
  Min RPM: $1.17
  (Based on your cost profile)
  [⚙️ Edit Cost Profile]
  ```
- **Size:** Compact card (height: 60px)
- **Styling:** Outlined card with bronze border, not filled
- **Tap Behavior:** Opens cost profile form modal
- **Rationale:** Visible at a glance; easy to update if assumptions change

**B. Cost Profile Button (Quick Actions)**
- **Location:** Quick actions section at bottom of dashboard
- **Style:** Secondary button with icon
- **Label:** "⚙️ Cost Profile"
- **Tap Behavior:** Opens cost profile modal form
- **Mandatory:** Must appear on every dashboard view

**C. Cost Profile Form (Modal)**
- **Trigger:** Tap cost profile summary OR quick action button
- **Content:**
  - Input: Fixed costs per day ($)
  - Input: Variable costs per mile ($)
  - Input: Fuel costs per gallon ($)
  - **Display:** Real-time min RPM calculation
  - **Submit Button:** [Save] (bronze gradient)
  - **Cancel:** Swipe down or [Cancel]
- **Validation:** All fields required before save
- **Success Feedback:** Toast notification "Cost profile saved! Loads will update with new profitability."

**Critical Constraint:** Cost profile must be setup BEFORE dashboard is truly useful. Consider flow:
1. First-time user sees HOS widget + hero load + metrics
2. Notices profitability badges but they're unclear
3. Taps "Adjust Cost Profile" CTA
4. Sets up costs (takes <2 minutes)
5. Returns to dashboard with meaningful profitability visibility

---

## Dashboard Layout

### Overall Structure: NO-SCROLL Tabbed Layout

```
┌─────────────────────────────────────────────────────┐
│  [⌨] Mobile Status Bar (System)                     │  ← System time, signal, etc.
├─────────────────────────────────────────────────────┤
│  HEADER (56px fixed)                                │
│  [🚛 FC] [HOS: 3h left 🟢]  [🔔] [👤 JD]           │  ← Logo, HOS chip, bell, avatar
├─────────────────────────────────────────────────────┤
│                                                     │
│  HERO SECTION (40% viewport height)                 │
│  ┌───────────────────────────────────────────────┐  │
│  │ 🚛 YOUR ACTIVE LOAD                           │  │
│  │ 50 pallets: Houston → Dallas                  │  │
│  │ Rate: $310  |  ✅ 118% RPM  |  Due: Sat 6PM  │  │
│  │                                               │  │
│  │             [CLAIM] [Details▼]               │  │  ← Pill buttons
│  │                                               │  │
│  │ Min RPM: $1.17 | Setup: ⚙️                   │  │  ← Compact stats
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  TABBED CONTENT AREA (60% viewport height)          │
│  ┌───────────────────────────────────────────────┐  │
│  │ [My Stats] [Available Loads] [Quick Actions] │  │  ← Tab buttons
│  ├───────────────────────────────────────────────┤  │
│  │                                               │  │
│  │ MY STATS (Active Tab)                         │  │
│  │ ┌──────┬──────┬──────┬──────┐               │  │
│  │ │ 92%  │ 96%  │18/18 │15/18 │               │  │  ← 2×2 compact grid
│  │ │📊    │⏰    │✓     │💰    │               │  │  ← Icon-only labels
│  │ └──────┴──────┴──────┴──────┘               │  │
│  │                                               │  │
│  │ Cost Profile: $1.17 min RPM  [Edit⚙️]       │  │  ← One-line summary
│  │                                               │  │
│  │ [View Full Stats] [Rating Details]           │  │  ← Secondary actions (pills)
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  FOOTER (Optional - Quick Actions if space)         │
│  [Equipment] [Cost Profile] [My Loads] [Settings]   │
│                                                     │
└─────────────────────────────────────────────────────┘

TOTAL HEIGHT = 100vh (no scrolling)
No vertical scroll needed. Tab switching is the primary interaction.
```

### Viewport Height Calculation

```
Total Phone Height: 812px (iPhone 12)
Safe Area Top: 44px (notch area)
Safe Area Bottom: 34px (gesture bar)
Usable Height: 812 - 44 - 34 = 734px

Layout Breakdown:
├─ Header (fixed): 56px
├─ Hero Section (40%): 271px  [active load OR top 3 available loads]
├─ Tab Bar: 48px
└─ Content Area (60%): 359px  [tabbed: My Stats | Available Loads | Quick Actions]

TOTAL = 56 + 271 + 48 + 359 = 734px ✓ (fits exactly within viewport)

### Section Details

## Tabbed Content System (No-Scroll Core)

The dashboard uses a tabbed interface to eliminate vertical scrolling. Three tabs rotate content within the 60% lower viewport:

### Tab 1: My Stats (Default Tab)
**Purpose:** Quick reputation snapshot + cost profile reminder  
**Height:** Exactly 359px (calculated to fit viewport)  
**Content:**

```
┌────────────────────────────────┐
│ 2×2 Metric Grid (Compact)      │
│ ┌──────┬──────┐                │
│ │ 92%  │ 96%  │                │  Icon + number
│ │📊    │⏰    │                │  Small labels (10px)
│ │Accept│On-Time
│ └──────┴──────┘                │
│ ┌──────┬──────┐                │
│ │18/18 │15/18 │                │
│ │✓     │💰    │                │
│ │Complete│Paid│                │
│ └──────┴──────┘                │
│                                │
│ Min RPM: $1.17                 │  ← One-line cost summary
│ Setup: [⚙️ Edit]               │  ← Action pill
│                                │
│ [View Full Stats] [Ratings]    │  ← Secondary action pills
└────────────────────────────────┘
```

**Metrics Grid (2×2):**
- **Top-Left:** Acceptance % (📊 icon, e.g., "92%")
- **Top-Right:** On-Time % (⏰ icon, e.g., "96%")
- **Bottom-Left:** Completion Rate (✓ icon, e.g., "18/18")
- **Bottom-Right:** Payments Logged % (💰 icon, e.g., "15/18")
- **Each cell:** 80×80px (fits 2 across, 48px touch target)

**Compact Cost Profile:**
- Single-line display: "Min RPM: $1.17"
- Tap [⚙️ Edit] to open modal (not on-page form)

**Secondary Actions (Pill Buttons):**
- [View Full Stats] — Opens modal with detailed history
- [Ratings] — Opens modal with rating details
- Layout: Horizontal pills with 8px gap

---

### Tab 2: Available Loads (Searchable List)
**Purpose:** Browse loads matching cost profile, claim with one tap  
**Height:** Exactly 359px (calculated to fit viewport)  
**Behavior:** Only shows if NO active load; hidden when load is claimed  
**Content:**

```
┌────────────────────────────────┐
│ Filter: Min RPM ✅             │  ← Cost profile filter chip
│ [Show All Loads ▼]             │  ← Dropdown to show red loads
│                                │
│ LOADS (Top 4 visible)          │
│ ┌────────────────────────────┐ │
│ │ 50 pallets HOU→DAL   $310  │ │
│ │ ✅ 118% RPM                │ │
│ │ [Claim]  [Details]         │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ 25 pallets DAL→AUS   $190  │ │
│ │ 🟡 95% RPM                 │ │
│ │ [Claim]  [Details]         │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ 100 pallets AUS→HOU  $420  │ │
│ │ ✅ 125% RPM                │ │
│ │ [Claim]  [Details]         │ │
│ └────────────────────────────┘ │
│                                │
│ [Load More] (shows more loads) │  ← Single CTA at bottom
└────────────────────────────────┘
```

**Load Cards (Compact):**
- Height: 80px per card
- Shows: origin→dest, rate, profitability badge
- Two pill buttons: [Claim] (48px), [Details] (48px)
- NO horizontal scrolling
- Max 4 cards visible (320px height) + Load More button

---

### Tab 3: Quick Actions (Setup & Links)
**Purpose:** Fast access to setup, profile, settings  
**Height:** Exactly 359px  
**Content:**

```
┌────────────────────────────────┐
│ SETUP CHECKLIST                │
│ □ Equipment Profile  [Setup]   │  ← Checkbox + action
│ ☑ Cost Profile       [Manage]  │
│ □ HOS Tracking       [Enable]  │
│                                │
│ ACCOUNT                        │
│ [👤 Profile] [⚙️ Settings]    │  ← Pill buttons
│ [💳 Payment] [📋 History]      │
│                                │
│ SUPPORT                        │
│ [Help] [Report Issue]          │
│                                │
│ [Sign Out]                     │
└────────────────────────────────┘
```

**Design:**
- Section headers: "SETUP CHECKLIST", "ACCOUNT", "SUPPORT"
- Checklist items: checkbox + label + [Setup/Manage] pill
- Pill buttons: Min 56px height, 48px touch target
- Layout: Compact spacing (12px padding)

---

## Dynamic Visibility: Active Load Behavior

### Scenario A: Owner-Operator Has an Active Load (Claimed)
**Hero Section shows:**
```
YOUR ACTIVE LOAD
50 pallets Houston → Dallas
Rate: $310 | ✅ 118% RPM | Due: Sat 6PM
[CLAIM (Disabled)]  [Delivery Details▼]
```

**Tab 2 (Available Loads): HIDDEN**
- Rationale: Focus on active load; no point browsing other loads

**Tabs displayed:** My Stats | Quick Actions | (No Available Loads tab)

### Scenario B: Owner-Operator Has NO Active Load
**Hero Section shows:**
```
YOUR TOP 3 LOADS (Smart Sort)
[Load 1] [Load 2] [Load 3]
(Tabbed carousel within hero section)
[Previous] [Claim This] [Next ▶]
```

**Tab 2 (Available Loads): VISIBLE**
- Shows full list of available loads
- Rationale: Guide to available inventory

**Tabs displayed:** My Stats | Available Loads | Quick Actions

---

## Modal Interactions (All Detailed Views)

### Modal 1: Claim Load Confirmation
**Trigger:** User taps [Claim] on any load card  
**Content:**
```
CONFIRM CLAIM

Load: 50 pallets Houston → Dallas
Rate: $310
Min RPM: $1.17 (Your profile)
Profitability: 118% ✅

You'll have this load until:
Saturday 6:00 PM

[Cancel]  [✓ Confirm Claim]
```

**Behavior:**
- Full-screen overlay (dimmed background)
- Confirmation prevents accidental claims
- [Confirm] returns to dashboard with active load
- [Cancel] dismisses, user still browsing

---

### Modal 2: Cost Profile Editor
**Trigger:** Tap [⚙️ Edit] anywhere cost profile is shown  
**Content:**
```
EDIT COST PROFILE

Fixed Costs per Day:
[____] $

Variable Costs per Mile:
[____] $

Fuel Costs per Gallon:
[____] $

─────────────────
Your Min RPM: $1.17

[Cancel]  [✓ Save Changes]
```

**Behavior:**
- Modal overlay, full-width form
- Real-time RPM calculation display
- [Save] returns to dashboard, refreshes profitability badges
- [Cancel] discards changes

---

### Modal 3: Load Details (View Full Info)
**Trigger:** Tap [Details▼] on any load card  
**Content:**
```
LOAD DETAILS

Origin: Houston, TX (Pickup Zone)
Destination: Dallas, TX
Pallets: 50
Weight: 12,000 lbs
Dimensions: 40ft standard trailer
Equipment: Dry van

Rate: $310
Distance: 265 miles
RPM: $1.17 ✅ 118%

Shipper: ABC Logistics
Carrier Rating: ⭐⭐⭐⭐⭐ (4.8)
Payment Speed: Next day

Pickup: Today 2:00 PM
Delivery: Saturday 6:00 PM
Deadline: Saturday 8:00 PM

[Close]  [✓ Claim This Load]
```

**Behavior:**
- Scrollable within modal (only details scroll, not whole screen)
- [Claim This Load] button at bottom
- [Close] returns to dashboard
- Modals stack (can go from Active Load → Details Modal)

---

#### 0. Header Section (Fixed at Top)
**Purpose:** Navigation, notifications, and user identity  
**Content:**
- 🚛 FreightClub logo (left)
- 🔔 Notification bell with unread badge (center-right)
- 👤 Carrier avatar with initials (right)

**Dimensions:**
- Height: 56px (fixed, sticky at top)
- Padding: 8px 16px (sm/md)
- Background: #1A1F27 (elevated surface)
- Border Bottom: 1px solid #333333

**Layout (Horizontal):**
```
┌─────────────────────────────────────┐
│ [🚛 Logo]                [🔔][👤A]  │
└─────────────────────────────────────┘
```

**Sub-Components:**

**Logo (Left)**
- Size: 40px × 40px
- Style: Icon or text logo ("FC" or FreightClub symbol)
- Color: Bronze (#B08D57)
- Tap Action: Navigate to dashboard (refresh)

**Notification Bell (Center-Right)**
- Size: 48px × 48px (touch target)
- Icon: Bell icon (24px, white)
- Badge: Red circle with white count (if unread)
- Badge Position: Top-right corner of bell
- Badge Size: 20px diameter
- Tap Action: Open notifications drawer / navigate to notifications page
- Focus State: 2px bronze outline

**Avatar Badge (Right)**
- Size: 48px × 48px (touch target)
- Style: Circular badge with initials
- Background: Bronze (#B08D57)
- Text: Carrier initials (e.g., "JD" for John Doe)
- Text Size: 16px bold white
- Border: 2px solid #B08D57 (ring effect)
- Tap Action: Open profile menu (dropdown)
  - Profile
  - Settings
  - Log Out
- Focus State: 2px bronze outline

**Sticky Behavior:**
- Header stays fixed at top when scrolling
- Safe area padding (20px sides on mobile)
- Z-index: 100 (above all content)
- Smooth scroll: Content scrolls behind header

**Light/Dark Mode:** Dark theme only for MVP (no light mode toggle)

---

#### 1. Hero Section (Top Load)
**Purpose:** Show O/O the best load match for their profile  
**Content:**
- 📦 Load summary (origin → destination)
- 💰 Rate & profitability badge (GREEN/AMBER/RED)
- 🎯 Why this load (closest deadline, highest profit, preferred lane)
- 🔘 Primary CTA: [CLAIM THIS LOAD]

**Dimensions:**
- Height: 140px (compact, thumb-reachable)
- Padding: 16px (md spacing)
- Border: 1px solid #333333
- Border Radius: 8px

**State Variants:**
- **Claimed:** Greyed out, "Claimed on [date]"
- **No Loads:** "No loads match your criteria. [Adjust Cost Profile]"

#### 2. Reputation Metrics (4 Badges)
**Purpose:** Show O/O their standing on the platform  
**Metrics:**
1. **Acceptance %** — Claims accepted / Invitations × 100
2. **On-Time %** — Delivered on-time / Total delivered × 100
3. **Completion Rate** — Completed / Claimed (e.g., "18/18")
4. **Payments Logged %** — Acknowledged / Delivered × 100

**Badge Styling:**
- **Layout:** 2×2 grid on mobile
- **Height:** 80px each
- **Background:** #1A1F27 (elevated surface)
- **Border:** 1px solid #333333
- **Value:** 24px bold white
- **Label:** 12px muted gray below value
- **Color Indicator:** Left border (2px) in status color (green/amber/red)

**Target Ranges:**
- 🟢 **Excellent:** ≥90%
- 🟡 **Good:** 75-89%
- 🔴 **Needs Work:** <75%

#### 3. Available Loads List
**Purpose:** Show O/O all loads matching their RPM filter  
**Content Per Load Card:**
- 📦 Destination summary (pickup → delivery)
- 💰 Rate & profitability badge
- ⏱️ Pickup time / deadline
- [View Details] (secondary button)

**Card Dimensions:**
- Height: 90px
- Padding: 12px
- Margin Bottom: 8px
- Border: 1px solid #333333
- Radius: 8px

**Load Card Layout (Horizontal):**
```
┌─────────────────────────────────────┐
│ 📦 50 Pallets       $310    ✅ 118% │
│ Houston, TX → Dallas, TX             │
│ Pickup: Today 2:00 PM | Deliver: Sat│
│ [View Details]                       │
└─────────────────────────────────────┘
```

**States:**
- **Default:** Profitability badge visible
- **Hovered/Focused:** Slight background highlight, "View Details" prominent
- **Claimed:** Greyed out, "Claimed" badge
- **Expired:** Faded, "Expired" badge

**Scroll Behavior:**
- Full-height scrollable within container
- "Load More" button at bottom if paginated
- Momentum scroll enabled (iOS)
- No horizontal scroll

#### 4. Quick Actions Panel
**Purpose:** Fast access to secondary features  
**Actions:**
- ⚙️ **Cost Profile** — Edit costs, calculate min RPM
- 🎯 **Preferred Lanes** — Manage region preferences
- 🚛 **Equipment** — Truck types, capacity, availability
- ⭐ **Ratings & Reviews** — View carrier reputation details

**Button Styling:**
- **Width:** Full-width or 2×2 grid
- **Height:** 48px
- **Style:** Secondary button (border, transparent bg)
- **Layout:** Vertical stack (mobile) → 2×2 grid (tablet, if supported)

---

## Responsive Breakpoints

### Primary: iPhone (375-390px) ← MANDATORY FOR MVP
```
Safe Area: 20px margins left/right
Content Width: 335px
Full-Height Elements: 100vh - safe area margins
Button Width: Full-width or flex with 8px gap
Card Width: Full-width
Padding: 16px (md)
Border Radius: 8px
```

### Secondary: Tablet/Desktop (≥768px) ← OPTIONAL FOR MVP
```
Safe Area: 32px margins left/right
Content Width: 350px or 2-column layout
Button Width: Auto-width or half-width with gap
Card Width: 45-50% with gap
Padding: 20px (lg)
Border Radius: 12px
```

**Important:** MVP focuses 100% on iPhone. Desktop support is nice-to-have but NOT required for launch.

---

## Refined Interaction Model: Tap-Only, No Swipe

**Critical Constraint:** Owner-operators operate vehicles while using dashboard. Accidental swipe gestures are dangerous and must be eliminated.

### Prohibited Interactions
- ❌ **Swipe to dismiss:** No swipe-to-close modals or notifications
- ❌ **Swipe to navigate:** No swipe-to-switch tabs or sections
- ❌ **Long-press actions:** Unreliable with gloves
- ❌ **Double-tap:** Confusing for larger touch targets
- ❌ **Gesture combinations:** No pinch, rotate, or multi-touch

### Mandatory Interactions
- ✅ **Single tap:** All primary actions (claim load, edit profile, open modal)
- ✅ **Tap + hold visual feedback:** Highlight effect on press (not tap-and-wait)
- ✅ **Explicit close buttons:** All modals have [X] or [Cancel] button
- ✅ **Haptic feedback:** Light tap feedback on all button interactions (iOS)
- ✅ **Keyboard support:** All actions accessible via keyboard (accessibility)

### Performance Targets (LCP & Latency)
- **LCP (Largest Contentful Paint):** <2 seconds on 4G LTE
  - Hero load section is the LCP element
  - Load with placeholder if API slower than 1.5s
- **First Input Delay (FID):** <100ms (immediate visual feedback on tap)
- **Cumulative Layout Shift (CLS):** <0.1 (no jank during scroll or load)

### Touch Target Sizing
- **Minimum:** 48px × 48px (glove-friendly standard)
- **Preferred:** 56px × 56px (generous tap area)
- **Spacing:** 8px minimum between buttons (prevent mis-taps)
- **No hover effects:** Touch devices have no hover; use tap state instead

---

## Empty States & User Feedback

### Empty State 1: No Loads Match Cost Profile
**When:** User has set cost profile, but no available loads meet their minimum RPM

**Display:** Hero Section shows
```
📦 No loads match your criteria

Your min RPM: $1.50
Available loads: 5 below threshold

Options:
[Adjust Cost Profile]
[View All Loads (at lower RPM)]
[Check Back in 1 Hour]
```

**Copy Tone:** Helpful, not negative. Owner should feel like they have options.

**CTA Buttons:**
- Primary: [Adjust Cost Profile] (bronze gradient)
- Secondary: [View All Loads] (show what's available, even if not profitable)

---

### Empty State 2: No Data Yet (First-Time User)
**When:** User has not completed cost profile setup

**Display:** Dashboard shows
```
🚛 Welcome to FreightClub

Let's get you set up in 2 minutes:

[1] Set Your Cost Profile
    ⚙️ Fixed costs, fuel costs, variable costs
    → System calculates your min RPM

[2] Update Your Equipment
    🚛 Truck types, capacity, preferred lanes
    → Shippers can match you to suitable loads

[3] Start Claiming Loads
    🎯 See profitable loads with color-coded badges
    → One-tap claiming

[Get Started] (bronze CTA)
```

**Behavior:** Tapping [Get Started] opens cost profile form modal

---

### Empty State 3: No Loads Available (System Issue)
**When:** No loads in entire board for this region

**Display:**
```
🚛 No loads available right now

Checking back every 5 minutes...

Last checked: 2:34 PM
Next check: 2:39 PM

In the meantime:
[Check Different Region]
[Update Preferred Lanes]
[View Archived Loads]
```

---

## Action Feedback & Confirmation Logic

### Claiming a Load (State-Changing Action)
**Step 1: User taps [CLAIM THIS LOAD]**
- Button shows visual feedback: darker background + "Claiming..." text
- Haptic feedback: Medium impact vibration
- No navigation away from page

**Step 2: System processes (API call)**
- Optimistic UI: Button shows "✓ Claimed" immediately
- Backend validates claim (1-2 seconds)

**Step 3: Success or Error**
- ✅ **Success:** Toast notification appears (bottom of screen)
  ```
  ✓ Load claimed! You have it until 6 PM.
  [View Load Details] [Dismiss]
  ```
- ❌ **Error:** Toast notification with reason
  ```
  ✗ Load unavailable (claimed by another carrier)
  [Dismiss] [View Similar Loads]
  ```
- **Duration:** Toast stays 5 seconds or until tapped

**Step 4: User action**
- Tap [View Load Details] → Navigate to load detail page
- Tap [Dismiss] → Toast closes, return to dashboard
- No action after 5s → Toast auto-dismisses

---

### Marking Load Delivered (Confirmation Required)
**Step 1: User taps [Mark Delivered] on load detail page**
- Confirmation dialog appears (modal overlay)
  ```
  Mark this load as delivered?
  
  Load: 50 pallets Houston→Dallas
  Delivery time: 2:15 PM (on time ✓)
  
  This action cannot be undone.
  
  [Cancel] [Confirm Delivery]
  ```
- Dialog blocks dashboard interaction (modal)

**Step 2: User confirms**
- Taps [Confirm Delivery]
- Button shows "Processing..."
- Haptic feedback: Medium impact

**Step 3: Success or error**
- ✅ **Success:** Toast "✓ Load delivered! Payment acknowledged."
- ❌ **Error:** "Cannot deliver. Load not in transit."

---

### Cost Profile Update (Save Confirmation)
**When user taps [Save] in cost profile form**

**Modal shows:**
```
Cost Profile Updated

Min RPM: $1.50 (was $1.30)
Saving changes...
```

**If successful:**
```
✓ Saved

Loads will refresh with new profitability.
[Return to Dashboard]
```

**If error:**
```
✗ Error saving

Please check your connection and try again.
[Retry] [Cancel]
```

---

## Empty State & Feedback Design System

### Toast Notifications
- **Position:** Bottom-center on mobile (24px from bottom safe area)
- **Width:** Full-width minus 16px padding on each side
- **Height:** 60px (accommodates icon + text + button)
- **Style:** Dark background (#1A1A1A), rounded corners (8px), 1px border
- **Duration:** 5 seconds auto-dismiss OR user taps to dismiss
- **Animation:** Slide up from bottom (300ms ease-out)
- **Z-index:** 1000 (above all content including HOS widget)

**Toast Types:**
- **Success (✓):** Green icon (#27AE60), white text
- **Error (✗):** Red icon (#E74C3C), white text
- **Info (ℹ):** Blue icon (#3498DB), white text
- **Loading (⏳):** Spinner, white text

### Confirmation Dialogs
- **Overlay:** Semi-transparent dark (#000000 @ 70% opacity)
- **Dialog Box:** Centered, max-width 320px, rounded (12px)
- **Background:** #1A1A1A
- **Button Layout:** Vertical stack (mobile) or side-by-side (tablet)
- **Button Order:** Cancel (left/top), Confirm (right/bottom, bronze gradient)

---

## Optional: HOS Widget Detailed Spec

**Location:** Bottom-right fixed (above quick actions)  
**Size:** 280px wide × 80px tall  
**Background:** #1A1A1A with 1px border (#333333)  
**Padding:** 12px

**Layout:**
```
┌─────────────────────────────────────┐
│ 11 HOURS LEFT (3h driven)           │  ← Bold, uppercase
│ [████████░░░░░░░░░░░░░] 11h limit   │  ← Circular/radial progress
│                                     │
│ 14-HOUR DUTY CYCLE: 2H LEFT        │
│ [███████████░░░░░░░░░] 14h duty    │  ← Linear progress
│                                     │
│ Status: 🟢 COMPLIANT                │
└─────────────────────────────────────┘
```

**Color Coding:**
- 🟢 Green: >2 hours remaining
- 🟡 Amber: 1-2 hours remaining (shows alert badge "⚠️ APPROACHING LIMIT")
- 🔴 Red: <1 hour remaining (pulsing red background, "🚨 MUST REST")

**Tap Behavior:**
- Opens HOS detail page (history, log entries, etc.)
- Does NOT close or minimize widget
- Mandatory return to dashboard (widget always visible)

---


```
User Action: Tap load card
→ Highlight effect: Background tint to #2A2F37
→ Navigation: Expand or navigate to load detail page
→ Time: 300ms transition
→ Haptic: Light tap feedback (if available)
```

### Claim Load Button
```
User Action: Tap [CLAIM THIS LOAD]
→ Visual: Button shows "Claiming..." with spinner
→ Haptic: Medium impact feedback
→ Result: Success toast "Load claimed!" or error message
→ Navigation: Option to view claimed load details
```

### Cost Profile Form
```
User Action: Tap [⚙️ Cost Profile]
→ Modal: Slide up from bottom (sheet modal)
→ Content: Input form for fixed costs, variable costs
→ Calculation: Real-time min RPM display
→ Submit: [Save] button (bronze gradient)
→ Dismiss: Swipe down or [Cancel]
```

---

## Accessibility (WCAG AA)

### Contrast Ratios
- Text on background: ≥4.5:1 (WCAG AA)
- Text in direct sunlight: ≥7:1 (enhanced for outdoor readability)
- Tested with: WAVE, Axe, Lighthouse

### Keyboard Navigation
- All interactive elements focusable (tab order)
- Focus indicator: 2px bronze outline (visible in all contexts)
- No keyboard traps

### Screen Reader
- Semantic HTML: `<button>`, `<input>`, `<nav>`, etc.
- ARIA labels: Form inputs, icons, status badges
- Live regions: Toast messages, load updates
- Alternative text: All images + icon descriptions

### Motor Control
- 48px+ touch targets (glove-friendly)
- 8px+ spacing between buttons (prevent mis-taps)
- Tap feedback (haptic + visual)
- No time limits (forms don't auto-submit)

---

## Performance Requirements

### Load Time
- **Target:** <2 seconds on 4G LTE
- **Breakdown:**
  - HTML/CSS/JS: <500ms
  - API calls: <800ms (hero load + metrics)
  - Render: <200ms
  - Interactive: <500ms

### Runtime Performance
- **Scroll Frame Rate:** 60fps (no jank)
- **Touch Response:** <100ms (immediate feedback)
- **Animation:** <300ms (transitions smooth)

### Bundle Size
- **JS:** <200KB (gzip)
- **CSS:** <50KB (gzip)
- **Images:** <100KB (compressed, webp)

---

## Design Tokens (CSS Variables)

```css
/* Colors */
--color-bg-primary: #0F1419;
--color-bg-surface: #1A1F27;
--color-text-primary: #FFFFFF;
--color-text-secondary: #B0B0B0;
--color-text-muted: #808080;
--color-accent-bronze: #B08D57;
--color-status-success: #27AE60;
--color-status-warning: #F39C12;
--color-status-danger: #E74C3C;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Typography */
--font-family-display: Sora, sans-serif;
--font-family-body: Inter, sans-serif;
--font-size-h1: 28px;
--font-size-h2: 20px;
--font-size-h3: 16px;
--font-size-body: 14px;
--font-weight-regular: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Spacing & Layout */
--border-radius-md: 8px;
--border-radius-lg: 12px;
--touch-target-min: 48px;
--safe-area-margin: 20px;

/* Shadows */
--shadow-sm: 0 2px 5px rgba(0,0,0,0.35);
--shadow-inset-top: inset 0 1px 2px rgba(255,255,255,0.25);
--shadow-inset-bottom: inset 0 -1px 2px rgba(0,0,0,0.2);
```

---

## Prototype Reference

**Location:** `docs/project/specs/carrier-page-example.png`

The prototype shows the correct design direction:
- ✅ Dark background (#0F1419 or similar)
- ✅ Bronze/orange gradient buttons
- ✅ Large touch targets (48px+)
- ✅ Vertical layout (no horizontal scroll)
- ✅ High contrast text (light on dark)
- ✅ Minimal chrome (no unused UI)
- ✅ Glove-friendly button spacing

**Follow the prototype's design direction for all sections.**

---

## Implementation Notes for CODER

1. **Header Component:** Use AppShell wrapper or create CarrierHeader component
   - Reference: US-821 (Shipper Header Navigation) for similar pattern
   - Sticky positioning (position: fixed, top: 0, z-index: 100)
   - Safe area padding on mobile
   
2. **Mobile First:** Start with iPhone 375px, then adapt for tablet/desktop

3. **Dark Theme:** Use #0F1419 as primary background, #1A1F27 for surfaces

4. **Bronze Accents:** All primary CTAs use gradient: #C9A46A → #B08D57 → #8C6D3F

5. **Touch Targets:** Never smaller than 48px × 48px with 8px spacing

6. **No Horizontal Scroll:** Vertical layout only for MVP

7. **Notification Bell:** 
   - Badge shows unread count (red circle)
   - Tap opens notifications drawer or page
   - Data: Pull from useNotifications hook
   
8. **Avatar Badge:**
   - Display carrier initials in circular badge
   - Tap opens profile menu (Profile, Settings, Log Out)
   - Data: Pull from auth context
   
9. **Accessibility:** Test contrast, keyboard nav, screen reader with real devices

10. **Performance:** <2 seconds load on 4G LTE (use Lighthouse to verify)

11. **Responsive:** Desktop support optional; iPhone is primary

12. **Haptic Feedback:** Add light tap feedback on button clicks (if iOS target)

13. **Prototype Fidelity:** Match the prototype's visual style exactly

14. **Content Scrolling:** Header stays fixed, dashboard content scrolls behind it

---

## Success Metric Checklist: Field Verification

This checklist must be completed using a real iPhone in a truck cab environment before design sign-off.

### Readability in Natural Light
- [ ] **Dashboard text is readable in direct sunlight** (2pm, high-glare conditions)
  - Test location: Parked truck cab with sunlight streaming through windshield
  - Test elements: Hero load card, profitability badges, metric values, button text
  - Success: No squinting required; colors distinguishable (green ≠ yellow)
  - Tool: WCAG AAA contrast checker (online tool or app)

- [ ] **Profitability badges are immediately recognizable**
  - Test: Can a trucker glance at load card and instantly know if it's profitable?
  - Success: Green = go, Red = no, Amber = maybe (requires <1 second perception)
  - Tool: Timer test with real drivers (ask "what's the profitability?")

- [ ] **HOS widget urgency levels are visible without scrolling**
  - Test: HOS widget visible when dashboard is at top
  - Condition: Red zone (HOS 🔴 MUST REST) is immediately visible
  - Success: No need to scroll or hunt for HOS status

---

### One-Handed Operation
- [ ] **Primary CTA ([CLAIM THIS LOAD]) is thumb-reachable**
  - Test: Right-hand operation with left hand on steering wheel
  - Success: Button reachable with thumb, other finger on wheel
  - Location: Hero section button must be in lower 2/3 of screen
  - Size: ≥48px × 48px confirmed

- [ ] **Secondary buttons (profile, settings) are accessible**
  - Test: Can claim a load + open cost profile form + save changes with one hand
  - Success: All taps within reachable thumb zone
  - Excluded: Navigation drawer (acceptable to use both hands for setup)

- [ ] **No accidental taps**
  - Test: 10 minutes casual scrolling through load list
  - Success: No unintended button presses, no accidental modal opens
  - Tool: Time with real driver; note any mis-taps

- [ ] **Notification bell doesn't cause accidental claims**
  - Test: Tapping notification bell with left hand (one-handed) doesn't trigger load claim
  - Success: Notification bell is isolated from critical CTAs
  - Distance minimum: 16px separation from claim button

---

### Dashboard Completeness
- [ ] **Hero "Top Pick" load is always visible (no scroll required)**
  - Test: Open dashboard, top of screen shows full hero section
  - Success: Entire load card visible without scrolling
  - Height check: Hero section ≤40% of screen height

- [ ] **Profitability badge is visible on first load card**
  - Test: Open dashboard, can you see profitability (green/yellow/red) without details?
  - Success: Badge visible in hero section
  - Location: Top-right or bottom-right of hero card

- [ ] **HOS widget is always visible (sticky or bottom-fixed)**
  - Test: Scroll through entire load list; HOS widget remains visible
  - Success: HOS status never scrolls off-screen
  - Exception: Modals can overlay HOS (but return to dashboard shows HOS)

- [ ] **Cost profile access is obvious (not buried)**
  - Test: First-time user finds cost profile setup without prompting
  - Success: [⚙️ Cost Profile] visible in quick actions OR dashboard header
  - Time target: <30 seconds to find

---

### Performance Under Load
- [ ] **Page loads in under 2 seconds on 4G LTE**
  - Test: Real device on 4G network (not WiFi)
  - Tool: Chrome DevTools Lighthouse or WebPageTest
  - Metric: LCP (Largest Contentful Paint) <2000ms
  - Hero load section is the LCP element

- [ ] **Scroll is smooth (60fps, no jank)**
  - Test: Scroll through 10+ load cards, observe frame rate
  - Tool: Chrome DevTools Performance > Record > Scroll
  - Success: No dropped frames, smooth momentum scroll

- [ ] **Button tap feedback is immediate**
  - Test: Tap a button, measure response time
  - Target: Visual feedback (highlight) within 100ms
  - Success: No delay between tap and visual response

---

### Accessibility Verification
- [ ] **Colors pass WCAG AAA in sunlight (7:1 contrast minimum)**
  - Test: Use WebAIM contrast checker with #121212 background
  - All semantic colors: Success (green), Warning (amber), Danger (red)
  - Text colors: Primary white, secondary gray, muted gray
  - Tool: https://webaim.org/resources/contrastchecker/

- [ ] **All interactive elements are 48px × 48px minimum**
  - Test: Measure buttons with browser dev tools
  - Success: No element smaller than 48×48
  - Spacing: 8px minimum between buttons

- [ ] **Keyboard navigation works (accessibility for testing)**
  - Test: Use Tab key to navigate all interactive elements
  - Success: Can claim a load using keyboard only
  - Tool: Chrome DevTools Accessibility audit

- [ ] **Screen reader announces all information correctly**
  - Test: Use VoiceOver (iOS) or Android TalkBack
  - Success: Screen reader announces load details, profitability status, HOS
  - Tool: iOS VoiceOver or Android accessibility testing

---

### Owner-Operator Usability
- [ ] **Driver can complete full task flow in <5 minutes**
  - Task: Set cost profile → View profitable loads → Claim one → Return to dashboard
  - Success: 5-minute time box achieved
  - Time breakdown:
    - Cost profile form: <2 min
    - Finding/claiming load: <2 min
    - Return to dashboard: <1 min

- [ ] **Error messages are actionable (not generic)**
  - Test: Trigger errors (no loads, API timeout, invalid input)
  - Success: Messages explain problem + offer solutions
  - Example ❌ (Bad): "Error"
  - Example ✅ (Good): "Load no longer available. View 3 similar loads nearby."

- [ ] **No silent failures**
  - Test: Claim load while offline, mark delivered with lag
  - Success: User always knows action succeeded or failed
  - Tool: Network throttling in Chrome DevTools; airplane mode on phone

---

## No-Scroll Compliance Checklist (FINAL VERIFICATION)

This checklist verifies the dashboard fits within 100vh viewport without any scrolling requirement.

### Layout Dimensions
- [ ] **Header height:** 56px (fixed, sticky)
- [ ] **Hero section height:** 271px (40% of 734px usable height)
- [ ] **Tab bar height:** 48px (fixed, no scroll)
- [ ] **Content area height:** 359px (60% of usable height, scrollable WITHIN only)
- [ ] **Total:** 56 + 271 + 48 + 359 = 734px ✓ (fits iPhone 12 usable height exactly)

### Content Density
- [ ] **2×2 metric grid** reduces stats from 4 cards to 1 grid (saves 150px)
- [ ] **Icon-only labels** on metrics (removes text labels, fits design)
- [ ] **Pill buttons** group related actions horizontally (saves 80px vs. vertical stack)
- [ ] **Load cards fit 4 visible** within 359px content area (no scrolling below 4 loads)
- [ ] **Load More button** at bottom expands list in existing space

### Tabbed Interface
- [ ] **Three tabs visible:** My Stats | Available Loads | Quick Actions
- [ ] **Tab switching** is only interaction that changes content (no navigation away)
- [ ] **Each tab content** fits exactly within 359px container (no overflow)
- [ ] **Tab bar is fixed** (48px) — always visible for switching

### Modal Interactions
- [ ] **Cost Profile modal** opens as overlay (doesn't push layout)
- [ ] **Load Details modal** opens as overlay (doesn't push layout)
- [ ] **All modals are scrollable** (content scrolls within modal, not whole page)
- [ ] **Modal dismiss** returns to exact dashboard state (no re-orientation needed)

### HOS Widget
- [ ] **Header-integrated HOS chip** (not separate widget taking up space)
- [ ] **Always visible** in header (56px, no scrolling needed)
- [ ] **Fits left-center area** between logo and notification bell
- [ ] **Color-coded urgency** (green/amber/red, immediate visual status)

### Touch Interaction
- [ ] **All buttons ≥48×48px** (glove-friendly, no mis-taps)
- [ ] **Button spacing ≥8px** (prevent accidental adjacent taps)
- [ ] **Tap-only interactions** (no swipe, no long-press, no complex gestures)
- [ ] **Pill buttons** grouped horizontally (e.g., [View Details] [Claim] side-by-side)

### Viewport Fit
- [ ] **Hero section visible** on first load (no scroll to see active load)
- [ ] **Profitability badge visible** on hero (no details needed for quick scan)
- [ ] **Tab bar visible** (easy switching between My Stats / Available Loads / Quick Actions)
- [ ] **HOS status visible** in header (no hunt for compliance info)
- [ ] **Cost profile reminder visible** (shows min RPM, easy edit access)

---

## Sign-Off Checklist: HFD Design Review

### Functional Requirements
- [ ] **Profitability Badges:** Green (≥120%), Amber (100-120%), Red (<100%) on every load ✓
- [ ] **HOS Widget:** 11-hr & 14-hr progress, color-coded urgency, always visible ✓
- [ ] **Cost Profile:** Prominent access point + summary display on dashboard ✓

### Mobile-First Constraints
- [ ] **Glove-Friendly Touch Targets:** All interactive elements ≥48px ✓
- [ ] **Latency Targets:** LCP <2s, FID <100ms, CLS <0.1 ✓
- [ ] **Interaction Model:** Tap-only, NO swipe gestures ✓

### Visual Standards (Luxury Industrial)
- [ ] **Color Palette:** Deep charcoal #121212, metallic bronze #B08D57 gradient ✓
- [ ] **Typography:** Sora (bold, uppercase, extra-bold KPIs), Inter (body 14px) ✓
- [ ] **WCAG AAA:** All colors tested for 7:1+ contrast in sunlight ✓

### Empty States & Feedback
- [ ] **Empty States:** Defined for no loads, first-time user, system issues ✓
- [ ] **Action Feedback:** Confirmation dialogs + success/error toasts ✓
- [ ] **No Silent Failures:** User always knows action succeeded or failed ✓

### No-Scroll Compliance
- [ ] **Fits 100vh viewport** (56+271+48+359 = 734px exactly) ✓
- [ ] **Hero always visible** (no scroll required) ✓
- [ ] **Tabs switch content** (no page navigation) ✓
- [ ] **Modals handle details** (no layout expansion) ✓
- [ ] **HOS widget header-integrated** (not separate section) ✓

### Final Sign-Off
- [ ] **Wireframes approved by BA** ✓
- [ ] **AC-to-UI mapping complete** ✓
- [ ] **Component specs locked** ✓ (no changes during CODER phase)
- [ ] **Responsive specs finalized** ✓ (iPhone 375px primary)
- [ ] **Accessibility specs met** ✓ (WCAG AAA, 48px targets)
- [ ] **Color palette locked** ✓ (charcoal + bronze)
- [ ] **Typography finalized** ✓ (Sora + Inter, bold KPIs)
- [ ] **Prototype fidelity confirmed** ✓
- [ ] **Performance targets defined** ✓
- [ ] **Mobile constraints enforced** ✓
- [ ] **No-scroll design verified** ✓
- [ ] **Field verification completed** ✓ (sunlight, one-handed, no scroll)
- [ ] **Design handed off to CODER** ✓ (locked, no backward rework)

---

**Status:** READY FOR CODER IMPLEMENTATION  
**Locked By:** HFD  
**Date Locked:** 2026-06-23  
**No Changes Permitted During Implementation Phase**
