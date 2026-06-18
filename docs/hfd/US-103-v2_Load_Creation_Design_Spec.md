# HFD DESIGN SPECIFICATION: US-103-v2 Load Creation (Full Workflow + Dashboard Integration)

**Story ID:** US-103-v2  
**Phase:** Phase 11+ (Load Creation Redesign)  
**Scope:** UI/UX Design (Complete Form Specification)  
**HFD Authority:** Human Factors Designer Role  
**Date:** 2026-06-17  
**Status:** 🔒 LOCKED FOR IMPLEMENTATION  
**Target Audience:** ARCHITECT (schema/service design), CODER (React/form implementation)

---

## Executive Summary

US-103-v2 represents a **complete redesign and rebuild** of the load creation workflow for shippers. The form must achieve two competing goals: **speed** (create a load in <2 minutes for repeat users) and **accuracy** (capture all critical freight/payment details). This design specification balances the shipper's office-based, desktop-first environment with the **Shipper & Administrator Style Guide** (Classic Cream & Metallic Bronze aesthetic, high clarity, data-dense layout).

**Core Design Principle:** Single-page modal with real-time validation, smart defaults, and live calculation of distance + estimated payment.

---

## 0. Shipper Page Layout Integration (ShipperPageLayout Shell)

### Context: Existing Shell Architecture

The shipper dashboard uses **ShipperPageLayout** component (from US-821) which provides:
- Header: Logo, Notification Bell, Avatar Profile Badge
- Navigation: Vertical sidebar (My Loads, Dashboard, Profile, Settings — shipper persona)
- Content Area: Main slot for page content
- Footer: Copyright + links (optional)

### Load Creation Form Placement

**Design Decision: Full-Page Route (Not Modal Overlay)**

The form appears as a **dedicated page route** (`/shipper/loads/create`), wrapped in ShipperPageLayout for consistency. This provides maximum screen real estate for a complex multi-section form and creates a clear user mental model: "I'm in load creation mode."

**Rationale:**
1. **Screen Real Estate:** Desktop monitors (24"+) provide ample horizontal space for full-width form; modal constraint (70–80% viewport) causes excessive scrolling
2. **Cognitive Clarity:** Full page = "dedicated form mode," not "quick overlay action"
3. **Workflow Efficiency:** High-volume dispatchers create loads in batches; full page allows "Create Another Load" button for rapid successive submissions
4. **Accessibility:** Simpler focus management (no focus trapping), clearer browser navigation (back/forward), URL persistence for session recovery
5. **Shipper Persona Match:** Operations manager's mental model = "I'm creating a load" (dedicated task), not "I'm on the dashboard using a modal"

### Navigation Flow

```
1. Shipper clicks "Post Load" button (US-824 Quick Actions Panel)
                    ↓
2. Browser navigates to /shipper/loads/create
   - Route renders LoadCreationPage wrapped in ShipperPageLayout
   - Header: Logo, Notification Bell, Avatar (same as dashboard)
   - Title: "Create New Load"
   - Main Content: LoadCreationForm (6 sections)
   - Full page width used for form fields
                    ↓
3. Shipper fills form (with live validation, auto-calculations)
                    ↓
4. Shipper clicks one of three buttons:

   A) CANCEL Button (No Save)
      - Form data NOT saved
      - Immediately navigate to /dashboard/shipper
      - No confirmation dialog (unless form has data → show "Discard unsaved load?")
      - Dashboard loads normally
   
   B) SAVE AS DRAFT Button (Saves Data)
      - Server saves load with status=DRAFT
      - Show success message: "Load saved as draft"
      - Navigate to /dashboard/shipper
      - Shipper can edit draft later from "My Loads"
   
   C) CREATE & POST LOAD Button (Saves + Publishes)
      - Server creates load with status=POSTED
      - Success message displayed on page: "✓ Load #LC-123456789 posted"
      - Two new buttons appear: "Create Another Load" | "Back to Dashboard"
      
   When shipper clicks "Create Another Load":
      - Form clears (reset to defaults)
      - Page scrolls to top
      - Focus moves to first input
      - Shipper can immediately create next load
   
   When shipper clicks "Back to Dashboard":
      - Navigate to /dashboard/shipper
      - Shipment Status Panel auto-refetches (within 1–2 seconds)
      - New load appears at top with status "POSTED"
      - Brief highlight animation (2 seconds) on new row
```

### Page Layout Structure

```
┌───────────────────────────────────────────────────────────────┐
│  [Logo]  FreightClub        [Bell]  [Avatar]                  │
├───────────────────────────────────────────────────────────────┤
│                                                                │
│  [Sidebar]   [Breadcrumb: Dashboard > Create Load]  [← Back]  │
│  • Dashboard                                                   │
│  • My Loads    [Page Title: "Create New Load"]                │
│  • Profile                                                     │
│  • Settings    ┌──────────────────────────────────────┐       │
│                │ PICKUP & DELIVERY LOCATIONS          │       │
│                │ ─────────────────────────────────── │       │
│                │ [Address Grid]                      │       │
│                │                                      │       │
│                │ PICKUP & DELIVERY WINDOWS           │       │
│                │ ─────────────────────────────────── │       │
│                │ [Datetime Fields]                   │       │
│                │                                      │       │
│                │ CARGO DETAILS                       │       │
│                │ ─────────────────────────────────── │       │
│                │ [Commodity, Weight, Dimensions]     │       │
│                │                                      │       │
│                │ EQUIPMENT & PAYMENT                 │       │
│                │ ─────────────────────────────────── │       │
│                │ [Equipment, Pay Rate, Terms]        │       │
│                │                                      │       │
│                │ SPECIAL INSTRUCTIONS (optional)     │       │
│                │ ─────────────────────────────────── │       │
│                │ [Text Area]                         │       │
│                │                                      │       │
│                │ [Cancel]  [Create Another]  [→ Back]│       │
│                └──────────────────────────────────────┘       │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### Route Definition

**Route Path:** `/shipper/loads/create`

**Route Component Hierarchy:**
```jsx
<ShipperPageLayout>
  <LoadCreationPage>
    <PageHeader title="Create New Load" subtitle="Fill in the details below to post a load to the board" />
    <LoadCreationForm 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  </LoadCreationPage>
</ShipperPageLayout>
```

**Page Header Styling:**
- Title: "Create New Load" — Bold, uppercase, 24px, Sora font, `#1A1A1A`
- Subtitle/Description (Optional): "Fill in the details below to post a load to the board" (14px, `#636E72`)

### Accessibility

**Focus Management:**
- No focus trap needed (full page allows standard navigation)
- Initial focus: Set to page title (`<h1>`) or first form input (WCAG best practice)
- Keyboard navigation: Standard Tab order through form fields (see Section 11)
- Escape key: Shows confirmation dialog if form has data ("Discard this load?")

**Navigation State:**
- Browser back button: Returns to `/dashboard/shipper`
- URL can be bookmarked: User can return to form (if saved as draft)
- History: Properly managed by router (avoid duplicate entries)

---

## 1. Information Architecture

### Form Organization (Top-to-Bottom)

The form is **NOT a wizard** but a single scrollable page organized into six logical sections:

| Section | Purpose | Required | Validation |
|---------|---------|----------|-----------|
| **Pickup & Delivery Locations** | Specify pickup/delivery addresses | Yes | Address parsing, ZIP validation, distance calc |
| **Pickup & Delivery Windows** | Specify date/time windows for pickup & delivery | Yes | Date range validation (no past dates, latest ≥ earliest) |
| **Cargo Details** | Describe freight (commodity, weight, dimensions) | Partial | Weight range (0.01–150k lbs), overweight warning |
| **Equipment & Payment** | Specify equipment type, pay rate, payment terms | Yes | Pay rate > $0; estimated total calculated |
| **Special Instructions** | Optional handling notes, hazmat, dock hours | No | Max 500 chars |
| **Form Actions** | Submit, save draft, cancel | — | All required fields validated before submit |

### User Flow

```
User clicks "Post Load" button (US-824 Quick Actions)
    ↓
Modal opens, form loads with defaults
    ↓
Shipper fills Pickup/Delivery (auto-distance calc)
    ↓
Shipper fills Dates (auto-validated on blur)
    ↓
Shipper fills Cargo (commodity, weight, dimensions optional)
    ↓
Shipper fills Equipment & Payment (estimated total auto-calc)
    ↓
Shipper enters Special Instructions (optional)
    ↓
Shipper clicks "Create & Post Load"
    ↓
Form validates all required fields; shows errors if needed
    ↓
Server creates load with status=POSTED
    ↓
Modal closes; Shipment Status Panel refetches and shows new load
    ↓
Toast notification: "Load #LC-123456789 posted"
```

---

## 2. Page Container & Section Layout Specifications

### Desktop (≥1024px)

```
┌────────────────────────────────────────────────────────────────────┐
│  Breadcrumb: Dashboard > Create Load  [← Back Button]              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Create New Load (Page Title)                                      │
│                                                                    │
│  [Form Sections — Each in Individual Panel]                       │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ORIGIN                                                       │ │
│  │ [Address fields]                                             │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ DESTINATION                                                  │ │
│  │ [Address fields]                                             │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ SCHEDULE                                                     │ │
│  │ [Date/Time fields]                                           │ │
│  │ [Distance display]                                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ CARGO DETAILS                                                │ │
│  │ [Commodity, Weight, Dimensions]                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ EQUIPMENT & PAYMENT                                          │ │
│  │ [Equipment, Pay Rate, Terms]                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  [Submit/Cancel/Success Buttons — Sticky Bottom]                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Page Layout:**
- **Width:** Full viewport width (100%) — uses ShipperPageLayout content slot
- **Max Width:** No constraint (uses available space after sidebar)
- **Height:** Full viewport height (100vh) with scrollable form content
- **Position:** Standard page routing (not overlaid, not centered)
- **Background:** `#EFEBE0` (cream, per Shipper Style Guide) — extends full width

**Form Container (Page Content Wrapper):**
- **Width:** 100% of content area (subtract sidebar width, if sidebar visible)
- **Max Width (Optional):** 1200px (for very large screens, prevents text from running too wide)
- **Padding:** 32px (space-xl) on left/right, 24px (space-lg) on top/bottom
- **Background:** `#EFEBE0` (cream)
- **Gap Between Sections:** 24px (space-lg) — uses Tailwind `space-y-6`

**Page Header Section:**
- **Breadcrumb:** 12px, `#636E72`, with "/" separator and clickable links
  - Link color: `#636E72` at rest, `#1A1A1A` on hover
  - Back button (text): "← Back to Dashboard" (left-aligned, 12px, `#B08D57` on hover)
- **Title:** "Create New Load" — Bold, uppercase, `#1A1A1A`, 24px, Sora font
- **Subtitle:** "Fill in the details below to post a load to the board" (14px, `#636E72`)
- **Margin Below Header:** 24px (space-lg, before first panel starts)

### Form Section Panel Specifications (All Sections)

**Each logical form section (Origin, Destination, Schedule, Cargo Details, Equipment & Payment) is wrapped in an individual styled panel.**

**Panel Container:**
- **Background:** `#FFFFFF` (white, per Shipper Style Guide §6.5)
- **Border:** 1px solid `#D0D0D0` (per Shipper Style Guide §6.5)
- **Border Radius:** 8px (all corners, per Shipper Style Guide §6.5)
- **Box Shadow:** `0 2px 4px rgba(0, 0, 0, 0.05)` (subtle elevation)
- **Padding:** 24px (space-lg, all sides, per Shipper Style Guide §6.4)
- **Min Height:** 120px (ensures panels have visual weight)

**Panel Title (Section Header):**
- **Text:** Section name (e.g., "Origin", "Destination", "Schedule")
- **Font:** 12px, bold, uppercase, `#1A1A1A`, letter-spacing: 0.05em
- **Margin Below Title:** 16px (space-md)

**Panel Content:**
- **Spacing Between Fields:** 16px (space-md) or 12px (space-sm) for tightly related fields (like date/time pairs)
- **Grid Layout:** Use responsive Tailwind grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-X`)
- **Overflow:** Scrollable content if exceeds panel height (rare for desktop)

### Tablet (768–1023px)

- **Width:** 100% of viewport
- **Padding:** 24px (space-lg) on left/right, 16px (space-md) on top/bottom
- **Max Width:** 100% (no constraint; use available space)
- **Sidebar:** Collapsed or responsive (ShipperPageLayout handles)
- **All form sections:** Stack vertically (no columns)
- **Button layout:** Full-width buttons, stacked vertically

### Mobile (≤767px)

- **Width:** 100% of viewport
- **Padding:** 16px (space-md) on all sides
- **Max Width:** 100% (no constraint)
- **Sidebar:** Hamburger menu or hidden (ShipperPageLayout handles)
- **All form sections:** Stack vertically (full width)
- **Button layout:** All buttons full-width, stacked vertically
- **Note:** Mobile is **secondary**; design optimized for desktop. Mobile receives responsive fallback only.

---

## 3. Form Section: Pickup & Delivery Locations

### Layout

**Note:** This section appears in TWO separate panels: "Origin" and "Destination" (per §2 Panel Specifications).

**Desktop (≥1024px):** Two-column address grid within each panel

```
┌─────────────────────────────────────────┐
│ ORIGIN                                  │
│                                         │
│ Street Address *                        │
│ [________________]                      │
│                                         │
│ Suite/Unit (optional)                   │
│ [________________]                      │
│                                         │
│ City *         State *      ZIP Code *  │
│ [________]  [Dropdown ▼]  [__________] │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ DESTINATION                             │
│                                         │
│ Street Address *                        │
│ [________________]                      │
│                                         │
│ Suite/Unit (optional)                   │
│ [________________]                      │
│                                         │
│ City *         State *      ZIP Code *  │
│ [________]  [Dropdown ▼]  [__________] │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Auto-Distance Display                   │
│ 📍 Distance: 847 miles                  │
│ ✓ Addresses verified                    │
└─────────────────────────────────────────┘
```

**Tablet (768–1023px):** Full-width panels, stacked vertically

**Mobile (≤767px):** Full-width panels, stacked vertically, single-column address fields

### Address Input Fields (Both Pickup & Delivery)

**Street Address (Required)**
- **Label:** "Street Address *"
- **Input Type:** Text input
- **Placeholder:** "e.g., 123 Industrial Way"
- **Height:** 40px
- **Max Length:** 100 characters
- **Styling (per Shipper Style Guide §6.3):**
  - Border Radius: 4px
  - Border: 1px solid `#D0D0D0`
  - Border (Focus): 2px solid `#B08D57` (Brand Bronze)
  - Padding: 8px 12px
  - Font: 14px, color `#1A1A1A`
  - Background: `#FFFFFF`
- **Validation:** On blur, check not empty
- **Error Message:** "Street address is required" (12px, italic, `#E74C3C`)

**Suite/Unit (Optional)**
- **Label:** "Suite/Unit (optional)"
- **Input Type:** Text input
- **Placeholder:** "e.g., Suite A, Dock 3"
- **Height:** 40px
- **Max Length:** 50 characters
- **Styling:** Identical to street address
- **Validation:** None (optional field)

**City (Required)**
- **Label:** "City *"
- **Input Type:** Text input
- **Placeholder:** "e.g., Los Angeles"
- **Height:** 40px
- **Max Length:** 50 characters
- **Styling:** Identical to street address
- **Validation:** On blur, check not empty
- **Error Message:** "City is required"

**State (Required)**
- **Label:** "State *"
- **Input Type:** Select dropdown
- **Options:** All 50 US states, alphabetically sorted
  - Display: "California", Value: "CA"
  - Display: "Texas", Value: "TX"
  - etc.
- **Default:** "— Select State —" (placeholder, no value)
- **Height:** 40px
- **Styling:** Identical to text inputs
- **Validation:** On change, check value ≠ empty
- **Error Message:** "Select a state"
- **Keyboard Navigation:** Arrow keys to scroll, Enter to select

**ZIP Code (Required)**
- **Label:** "ZIP Code *"
- **Input Type:** Text input (not `type="number"`; allows leading zeros)
- **Placeholder:** "e.g., 90001"
- **Height:** 40px
- **Validation Pattern:** 5 digits (or ZIP+4 format: XXXXX-XXXX)
- **Styling:** Identical to text inputs
- **Validation:** On blur, check matches regex `^\d{5}(-\d{4})?$`
- **Error Message:** "ZIP code must be 5 digits (or 5+4 format)"

**Spacing Between Fields:**
- **Vertical Gap (Within Each Address Column):** 12px (space-sm)
- **Horizontal Gap (Between Pickup & Delivery Columns on Desktop):** 24px (space-lg)

### Auto-Distance Display

**Trigger:** After both Pickup and Delivery addresses have valid ZIP codes

**Container Styling:**
- **Position:** Centered below address pairs, spanning full width
- **Background:** `#F8F9FB` (ultra-light cream, per Shipper Style Guide)
- **Border:** 1px solid `#D0D0D0`
- **Border Radius:** 4px
- **Padding:** 12px 16px (space-sm, matches input padding)
- **Margin Top:** 16px (space-md)
- **Box Shadow:** None (lighter than panels)

**Content Layout:**
```
┌─────────────────────────────────────────┐
│ 📍 Distance: 847 miles                  │
│ ✓ Addresses verified                    │
│                                         │
│ or                                      │
│                                         │
│ ⟳ Calculating distance...              │  (while loading)
│                                         │
│ or                                      │
│                                         │
│ ⚠️ Distance calculation failed.         │  (on error)
│ Please verify addresses and try again.  │
└─────────────────────────────────────────┘
```

**Typography:**
- **Primary Text (Distance):** 16px, bold, `#1A1A1A`
- **Secondary Text (Verification):** 12px, regular, `#636E72`
- **Icon (Left):** 📍 (emoji) or distance icon (16px)

**States:**

| State | Content | Animation | Color |
|-------|---------|-----------|-------|
| Loading | "⟳ Calculating distance..." | Spinner rotates (1s linear infinite) | `#636E72` |
| Success | "📍 Distance: XXX miles\n✓ Addresses verified" | None | `#1A1A1A` / `#636E72` |
| Error | "⚠️ Distance calculation failed.\nPlease verify addresses and try again." | Shake (100ms) | `#E74C3C` |

**Behavior:**
- **Trigger Calculation:** When user leaves ZIP Code input (on blur of Delivery ZIP)
- **Show Spinner:** While API call is in flight (typically <1 second)
- **Cache Result:** Store calculated distance in form state; only recalculate if addresses change
- **Error Handling:** If API fails, show error message + "Try Again" button (or retry on next blur)

---

## 4. Form Section: Pickup & Delivery Windows

### Layout

**Note:** This section appears in a single "Schedule" panel (per §2 Panel Specifications).

**Desktop (≥1024px):** Four-column grid within Schedule panel (optimized for space efficiency)

```
┌─────────────────────────────────────────────────────────────────────┐
│ SCHEDULE                                                            │
│                                                                     │
│ PICKUP WINDOW                          DELIVERY WINDOW             │
│ Earliest Pickup         Latest Pickup  Earliest Delivery Latest Del │
│ [Date ▼]  [Time ▼]     [Date ▼]  [Time ▼]  [Date ▼]  [Time ▼]     │
│ (140px)    (100px)      (140px)   (100px)   (140px)   (100px)      │
│                                                                     │
│ Latest Pickup           Latest Delivery                             │
│ [Date ▼]  [Time ▼]     [Date ▼]  [Time ▼]                         │
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────┐   │
│ │ 📍 Distance: 847 miles (estimated road distance)            │   │
│ └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Tablet (768–1023px):** Two-by-two grid (Date/Time pairs side-by-side per window)

**Mobile (≤767px):** Full-width stack (all date/time fields vertical)

### Date & Time Inputs (Split Fields)

**Design Rationale (CHG-PENDING_Schedule_Layout_UX_Optimization):**
Split date and time into separate inputs for improved space efficiency and scanability. Operations managers (Shipper Persona) work on desktop monitors with ample horizontal space; this layout reduces vertical scrolling by ~50% and improves form density.

**All Eight Inputs (Earliest/Latest Pickup Date, Earliest/Latest Pickup Time, Earliest/Latest Delivery Date, Earliest/Latest Delivery Time)**

#### Date Fields

- **Label Examples:**
  - "Earliest Pickup Date *"
  - "Latest Pickup Date *"
  - "Earliest Delivery Date *"
  - "Latest Delivery Date *"

- **Input Type:** HTML5 `<input type="date">`
  - Native browser date picker (platform-specific calendar UI)
  - Value format: `YYYY-MM-DD` (e.g., `2026-06-18`)

- **Height:** 40px
- **Width (Desktop):** ~140px (narrower than full-width for multi-column layout)
- **Styling (per Shipper Style Guide §6.3):**
  - Border Radius: 4px
  - Border: 1px solid `#D0D0D0`
  - Border (Focus): 2px solid `#B08D57`
  - Padding: 8px 12px
  - Font: 14px, color `#1A1A1A`
  - Background: `#FFFFFF`

- **Default Values:**
  - **Earliest Pickup Date:** Tomorrow (calculated: `new Date(Date.now() + 86400000)`)
  - **Latest Pickup Date:** Tomorrow
  - **Earliest Delivery Date:** Tomorrow
  - **Latest Delivery Date:** Day after tomorrow
  - **Rationale:** Smart defaults minimize data entry; shipper adjusts as needed

#### Time Fields

- **Label Examples:**
  - "Earliest Pickup Time *"
  - "Latest Pickup Time *"
  - "Earliest Delivery Time *"
  - "Latest Delivery Time *"

- **Input Type:** HTML5 `<input type="time">`
  - Native browser time picker (platform-specific spinner/picker UI)
  - Value format: `HH:mm` in 24-hour format (e.g., `08:00`, `14:30`)

- **Height:** 40px
- **Width (Desktop):** ~100px (compact for time-only input)
- **Styling:** Identical to date fields (per Shipper Style Guide §6.3)

- **Default Values:**
  - **Earliest Pickup Time:** 08:00
  - **Latest Pickup Time:** 14:00
  - **Earliest Delivery Time:** 16:00
  - **Latest Delivery Time:** 18:00

### Grid Layout & Spacing

**Desktop (≥1024px) — Four-Column:**
```
┌─────────────────────────────────────────────────────────────────────────┐
│ PICKUP WINDOW                    │  DELIVERY WINDOW                      │
├─────────────────────────────────────────────────────────────────────────┤
│ Earliest Pickup                  │  Earliest Delivery                    │
│ [Date ▼]    [Time ▼]            │  [Date ▼]    [Time ▼]                │
│ (140px)     (100px)             │  (140px)     (100px)                 │
│                                  │                                       │
│ Latest Pickup                    │  Latest Delivery                      │
│ [Date ▼]    [Time ▼]            │  [Date ▼]    [Time ▼]                │
│ (140px)     (100px)             │  (140px)     (100px)                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Grid Configuration:**
- **Container:** `grid grid-cols-4 gap-4` (Tailwind)
- **Column 1 (Pickup Date):** ~140px
- **Column 2 (Pickup Time):** ~100px
- **Column 3 (Delivery Date):** ~140px
- **Column 4 (Delivery Time):** ~100px
- **Gap:** 16px (space-md, per Shipper Style Guide §6.4)
- **Vertical Spacing (between Earliest/Latest rows):** 16px (space-md)

**Tablet (768–1023px) — Two-by-Two:**
```
Pickup Window
[Date ▼]    [Time ▼]

Delivery Window
[Date ▼]    [Time ▼]
```
- Grid: `grid-cols-2 gap-4` (responsive breakpoint)
- Full-width responsive stacking

**Mobile (≤767px) — Full Stack:**
```
Earliest Pickup Date
[Date ▼]

Earliest Pickup Time
[Time ▼]

Latest Pickup Date
[Date ▼]

Latest Pickup Time
[Time ▼]

[Same for Delivery]
```
- Grid: `grid-cols-1` (single column, full width)
- All fields stack vertically for readability on small screens

### Date Validation Rules (Real-Time)

**Validation Timing:** On blur of each field (user leaves the input)

**Validation Rules:**

| Rule | Trigger | Error Message | Error Display |
|------|---------|---------------|---|
| No past dates | Earliest Pickup < today | "Must be in the future (no past dates)" | Below input, red text |
| Latest Pickup ≥ Earliest Pickup | Latest Pickup < Earliest Pickup | "Latest Pickup must be ≥ Earliest Pickup" | Below Latest Pickup input |
| Earliest Delivery ≥ Latest Pickup | Earliest Delivery < Latest Pickup | "Earliest Delivery must be ≥ Latest Pickup" | Below Earliest Delivery input |
| Latest Delivery ≥ Earliest Delivery | Latest Delivery < Earliest Delivery | "Latest Delivery must be ≥ Earliest Delivery" | Below Latest Delivery input |

**Error Display:**
- **Position:** Immediately below the violating input field
- **Font:** 12px, italic, color `#E74C3C`
- **Border:** Input border changes to `2px solid #E74C3C` (visual attention)
- **Auto-Clear:** When user corrects the value, error disappears immediately (on blur after correction)

**Keyboard Navigation:**
- Tab to next field after each datetime input
- Shift+Tab to previous field
- In picker: arrow keys to select date/time
- Enter to confirm selection

---

## 5. Form Section: Cargo Details

### Layout

```
CARGO DETAILS
─────────────────────────────────────────────────────────
Commodity *
[________________________________]

Weight (lbs) *
[_____________] lbs

⚠️ [OVERWEIGHT NOTICE — if >80,000 lbs]
   This load exceeds the federal weight limit.
   [☐] I acknowledge this load requires a special permit

DIMENSIONS (Optional)    ▶ [Expand/Collapse Toggle]
  [Expandable section with Length/Width/Height inputs]
```

### Commodity Input

- **Label:** "Commodity *"
- **Input Type:** Text input
- **Placeholder:** "e.g., Steel coils, Electronics, Produce"
- **Height:** 40px
- **Max Length:** 100 characters
- **Styling:** Per Shipper Style Guide §6.3
  - Border Radius: 4px
  - Border: 1px solid `#D0D0D0`
  - Border (Focus): 2px solid `#B08D57`
  - Padding: 8px 12px
  - Font: 14px, color `#1A1A1A`
- **Helper Text:** "Be descriptive to help carriers assess load quickly" (12px, italic, `#636E72`, margin-top: 4px)
- **Validation:** On blur, check not empty
- **Error Message:** "Commodity is required"

### Weight Input

- **Label:** "Weight (lbs) *"
- **Input Type:** `<input type="number">`
- **Min:** 0.01
- **Max:** 150,000
- **Step:** 0.1 (decimal precision)
- **Height:** 40px
- **Styling:** Per Shipper Style Guide §6.3
- **Suffix Label:** "lbs" displayed inline at end of input
- **Icon:** 📦 (emoji, 16px, to the left of label)
- **Format Display:** Show comma-separated (e.g., "25,500" not "25500")
- **Helper Text:** "Accurate weight helps determine freight class and routing" (12px, italic, `#636E72`)
- **Validation:** On blur, check `weight > 0 AND weight ≤ 150000`
- **Error Message:** "Weight must be between 0.01 and 150,000 lbs"

### Overweight Warning (Conditional Display)

**Trigger:** When weight > 80,000 lbs

**Container Styling:**
- **Background:** `#FFF3CD` (Danger/Warning background; per semantic colors)
- **Border:** 1px solid `#F39C12` (Safety Amber; per Shipper Style Guide §6.1)
- **Border Radius:** 4px
- **Padding:** 12px 16px (space-sm)
- **Margin Top:** 12px (space-sm, above the checkbox)
- **Icon:** ⚠️ (warning emoji, 16px, left-aligned)

**Content Layout:**
```
⚠️ This load exceeds the federal weight limit of 80,000 lbs.
   Confirm this load has a valid special permit.
   
   [☐] I acknowledge this load requires a special permit
```

**Typography:**
- **Primary Text:** 14px, bold, `#1A1A1A`
- **Secondary Text:** 12px, regular, `#4A5568`
- **Checkbox Label:** 14px, `#1A1A1A`

**Checkbox Specifications:**
- **Type:** HTML5 `<input type="checkbox">`
- **Label:** "I acknowledge this load requires a special permit"
- **Required If Weight >80k:** Form submit button disabled until checked
- **Styling:** Standard browser checkbox (no custom styling needed)

**Behavior:**
- **Validation:** On submit, if weight >80k AND checkbox unchecked, show error: "Please acknowledge the special permit requirement"
- **Error Message:** Display below checkbox, 12px, italic, `#E74C3C`

### Dimensions Section (Optional, Collapsed by Default)

**Header/Toggle:**
- **Label:** "Dimensions (Optional)" with expand/collapse icon (▶/▼)
- **Styling:** 14px, color `#636E72`, cursor `pointer`
- **Hover:** Underline appears, text darkens to `#1A1A1A`
- **Default State:** Collapsed (▶)

**Expanded View:**
```
┌─────────────────────────────────────────────┐
│ ▼ Dimensions (Optional)                     │
├─────────────────────────────────────────────┤
│ Length *                Width *              │
│ [____] ft [____] in    [____] ft [____] in  │
│                                             │
│ Height *                                    │
│ [____] ft [____] in                         │
│                                             │
│ Helper text...                              │
└─────────────────────────────────────────────┘
```

**Input Specifications (6 inputs: L/W/H, each with feet + inches):**
- **Type:** `<input type="number">`
- **Min:** 0
- **Max:** 999
- **Step:** 0.1
- **Height:** 40px
- **Styling:** Per Shipper Style Guide §6.3
- **Labels:** "Length *", "Width *", "Height *" (each with ft/in subfields)
- **Subfield Labels:** Inline "ft" and "in" text
- **Helper Text:** "Enter dimensions to help carriers assess load; leave blank if unknown" (12px, italic, `#636E72`)
- **Validation:** Optional; if provided, must be > 0
- **Error Message:** "Dimensions must be positive numbers"

**Spacing:**
- **Horizontal Gap (ft/in within a dimension):** 8px (space-sm)
- **Horizontal Gap (Length/Width):** 24px (space-lg)
- **Vertical Gap (between dimensions):** 12px (space-sm)

**Animation:**
- **Expand:** Smooth height transition (200ms ease-in-out)
- **Collapse:** Smooth height transition (200ms ease-in-out)

---

## 6. Form Section: Equipment & Payment

### Layout

**Desktop:**
```
EQUIPMENT & PAYMENT
─────────────────────────────────────────────────────────
Equipment Type *                   Pay Rate *
[Dropdown ▼]                       [_________] $  [Flat / Per-Mile ▼]

Payment Terms (optional)           Estimated Total (if per-mile)
[Dropdown ▼]                       ≈ $2,118 (847 mi × $2.50/mi)
```

**Tablet/Mobile:** Stack vertically

### Equipment Type Dropdown

- **Label:** "Equipment Type *"
- **Input Type:** Select dropdown
- **Options:** [Dry Van, Flatbed, Refrigerated, Tanker, Specialized, Step Deck]
- **Default:** "Dry Van" (most common; reduces burden on repeat users)
- **Height:** 40px
- **Width:** 100% of container
- **Styling:** Per Shipper Style Guide §6.3
- **Placeholder (if no default):** "— Select Equipment Type —"
- **Validation:** On submit, check ≠ empty
- **Error Message:** "Equipment type is required"
- **Keyboard Navigation:** Arrow keys to scroll, Enter to select

### Pay Rate Input

- **Label:** "Pay Rate *"
- **Input Type:** Number input (`<input type="number">`)
- **Min:** 0.01
- **Max:** 99,999.99
- **Step:** 0.01 (cents precision)
- **Height:** 40px
- **Currency Prefix:** "$" displayed inline at start of input (visual indicator)
- **Styling:** Per Shipper Style Guide §6.3
- **Placeholder:** "Enter rate"
- **Format Display:** Show comma-separated thousands (e.g., "$2,500.50")
- **Validation:** On blur, check > 0.00
- **Error Message:** "Pay rate must be > $0.00"

### Pay Rate Type Toggle

- **Label:** "Rate Type *"
- **Options:** "Flat Rate" OR "Per-Mile"
- **Implementation:** Radio buttons (2 buttons, side-by-side)
  - **Button 1:** Radio circle + "Flat Rate" label
  - **Button 2:** Radio circle + "Per-Mile" label

**Styling (Per Shipper Style Guide §6.3):**
- **Selected State:** Radio filled with `#B08D57` (Brand Bronze)
- **Unselected State:** Radio unfilled, border `#D0D0D0`
- **Text Color:** `#1A1A1A`
- **Height:** 40px
- **Cursor:** `pointer`
- **Gap Between Buttons:** 24px (space-lg)

**Behavior:**
- **On Selection:** Form state updates; re-calculate estimated total if "Per-Mile" selected
- **Default:** "Flat Rate" (simpler option; less mental load)

### Estimated Total Display (Conditional)

**Trigger:** When ALL of the following are true:
- Pay Rate Type = "Per-Mile"
- Distance calculated (> 0)
- Pay Rate entered (> 0)

**Container Styling:**
- **Background:** `#F8F9FB` (ultra-light cream)
- **Border:** 1px solid `#D0D0D0`
- **Border Radius:** 4px
- **Padding:** 12px 16px (space-sm)
- **Margin Top:** 12px (space-sm, above the display)

**Content Layout:**
```
┌─────────────────────────────────┐
│ Estimated Total: $2,118         │
│ (847 miles × $2.50 per mile)    │
└─────────────────────────────────┘
```

**Typography:**
- **Primary (Amount):** 16px, bold, `#1A1A1A`
- **Secondary (Formula):** 12px, regular, `#636E72`

**Color:**
- **Text:** `#3498DB` (Tech Blue, informational tone)
- **Icon:** 💰 or calculator icon (16px)

**Calculation:**
- **Formula:** `estimated_total = pay_rate × distance_miles`
- **Precision:** Round to 2 decimal places (cents)
- **Real-Time Update:** Recalculate whenever pay_rate or distance_miles changes

**Hidden If:**
- Flat Rate selected → Show "Flat rate (no per-mile calculation)" in grey text instead
- Distance not yet calculated → Show placeholder "Waiting for distance calculation..."

### Payment Terms Dropdown

- **Label:** "Payment Terms (optional)"
- **Input Type:** Select dropdown
- **Options:**
  - `IMMEDIATE` → Display: "Immediate (Same/Next Day)"
  - `NET_7` → Display: "Net 7 (7 days after delivery)"
  - `NET_14` → Display: "Net 14 (14 days after delivery)"
  - `NET_30` → Display: "Net 30 (30 days after delivery)"
- **Default:** "NET_7" (most common payment cycle)
- **Height:** 40px
- **Width:** 100% of container
- **Styling:** Per Shipper Style Guide §6.3
- **Helper Text:** "Choose how carriers will settle payment after delivery" (12px, italic, `#636E72`)
- **Validation:** Optional; no error if empty (defaults to NET_7 on server)

---

## 7. Form Section: Special Instructions

### Layout

```
SPECIAL INSTRUCTIONS (optional)
─────────────────────────────────────────────────────────
[Large text area for multi-line input]

[Characters remaining: 250/500]
```

### Textarea Input

- **Label:** "Special Instructions (optional)"
- **Input Type:** `<textarea>`
- **Min Height:** 100px
- **Max Height:** 200px (scrollable if exceeds)
- **Placeholder:** "Any special handling, hazmat requirements, gate hours, contact notes, etc."
- **Max Characters:** 500 (enforced by validation, not `maxlength` attribute to allow paste/undo)
- **Font:** 14px, monospace (Courier New or Monaco) for technical notes (hazmat codes, etc.)
- **Styling:** Per Shipper Style Guide §6.3
  - Border Radius: 4px
  - Border: 1px solid `#D0D0D0`
  - Border (Focus): 2px solid `#B08D57`
  - Padding: 8px 12px
  - Background: `#FFFFFF`

### Character Counter

- **Position:** Bottom-right of textarea
- **Format:** "XXX/500 characters"
- **Typography:** 12px, `#636E72`, italic
- **Updates:** Live as user types
- **Color Change (at limit):**
  - 0–400 chars: `#636E72` (steely slate, neutral)
  - 400–500 chars: `#F39C12` (safety amber, warning)
  - >500 chars: `#E74C3C` (danger red, error) + submit button disabled

### Validation

- **Type:** Optional field (no error if empty)
- **Max Length Enforcement:** On blur, if >500 chars, truncate to 500 and show message: "Special instructions truncated to 500 characters"
- **Error Message:** Display below textarea, 12px, italic, `#E74C3C`

---

## 8. Form Actions (Buttons)

### Button Container

- **Position:** Sticky to bottom of page (stays visible while scrolling form)
- **Background:** `#FFFFFF`
- **Padding:** 24px (space-lg, all sides)
- **Border Top:** 1px solid `#E8E3D8` (subtle divider from form content)
- **Layout:** Flexbox, space-between
  - **Left Group:** [Cancel]
  - **Center Group:** [Create Another Load] (appears after successful submission)
  - **Right Group:** [Create & Post Load] OR [Back to Dashboard] (changes based on form state)
- **Gap:** 8px (space-sm) between buttons in same group, 24px (space-lg) between left/center/right groups

### Primary Button: "Create & Post Load" (Default)

**Styling (Per Shipper Style Guide):**
- **Background Gradient:** `linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)`
- **Box Shadow:** `inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)` (inset highlights for metallic effect)
- **Border:** 1px solid `#7A5F3A`
- **Text Color:** `#FFFFFF` (white)
- **Text:** 14px, font-weight: 500 (medium)
- **Padding:** 10px 24px (vertical × horizontal)
- **Height:** 44px (slightly taller than inputs for prominence)
- **Border Radius:** 4px
- **Cursor:** `pointer`

**Hover State:**
- **Background Gradient (Darkened):** `linear-gradient(180deg, #B8954E 0%, #A67D47 45%, #7C5E36 100%)`
- **Box Shadow:** Same as resting (maintains tactile effect)
- **Transition:** 150ms ease-in-out
- **Text Color:** Remains `#FFFFFF`

**Focus State (Keyboard Navigation):**
- **Outline:** 2px solid `#B08D57` (Brand Bronze focus outline)
- **Outline Offset:** 2px
- **All other properties:** Same as resting state

**Disabled State (While Submitting or Validation Error):**
- **Background:** `#D3D3D3` (light grey, desaturated)
- **Box Shadow:** `0 1px 2px rgba(0,0,0,0.1)` (reduced depth)
- **Text Color:** `#888888` (muted)
- **Cursor:** `not-allowed`
- **Content:** "⟳ Creating Load..." or spinner + "Processing..." (12px spinner to the left of text)
- **Spinner Animation:** Rotate 1s linear infinite

### Success Button Group (After Successful Submission)

**Replace primary button with two options:**

**Button A: "Create Another Load"**
- **Styling:** Metallic bronze gradient (same as primary button)
- **Click Behavior:** 
  - Clear all form fields
  - Reset form validation state
  - Refocus first input (Street Address — Pickup)
  - Show notification: "Form cleared. Ready to create another load."
  - Allows rapid successive submissions

**Button B: "Back to Dashboard"**
- **Styling:** Light grey outline (secondary button style)
- **Click Behavior:**
  - Navigate to `/dashboard/shipper`
  - Shipment Status Panel auto-refetches active shipments (within 1–2 seconds)
  - New load appears at top of Shipment Status Panel
  - Brief highlight animation on new row (2 seconds)

### Secondary Button: "Save as Draft"

- **Background:** `#F8F9FB` (ultra-light cream)
- **Border:** 1px solid `#D0D0D0`
- **Text Color:** `#1A1A1A`, 14px, font-weight: 500
- **Padding:** 10px 24px
- **Height:** 44px
- **Border Radius:** 4px
- **Visibility:** Always shown (before and after submission)

**Hover State:**
- **Background:** `#FFFFFF` (white, subtle change)
- **Border:** 1px solid `#B08D57` (Brand Bronze border on hover)
- **Transition:** 150ms ease-in-out

**Focus State:**
- **Outline:** 2px solid `#B08D57`
- **Outline Offset:** 2px

**Disabled State:**
- **Background:** `#E8E8E8` (very light grey)
- **Text Color:** `#999999`
- **Cursor:** `not-allowed`

**Click Behavior:**
- Save form as draft (POST to backend with status=DRAFT)
- Show success message: "✓ Load saved as draft — #LC-123456789"
- **Automatically navigate to `/dashboard/shipper` after 2 seconds**
- Shipper can edit draft later from "My Loads" section

### Tertiary Button: "Cancel"

- **Background:** Transparent (no background color)
- **Border:** None
- **Text Color:** `#636E72`, 14px, font-weight: 500
- **Padding:** 10px 16px
- **Height:** 44px
- **Cursor:** `pointer`
- **Visibility:** Always shown (before and after submission)

**Hover State:**
- **Text Color:** `#1A1A1A` (darkens)
- **Text Decoration:** Underline appears

**Focus State:**
- **Text Color:** `#1A1A1A`
- **Outline:** 2px solid `#B08D57`
- **Outline Offset:** 2px

**Click Behavior (Critical):**
- **NO SAVE** — Form data is discarded (NOT posted to backend)
- **If form is empty:** Navigate back to `/dashboard/shipper` immediately
- **If form has data entered:** Show confirmation dialog: 
  ```
  "Discard this load?"
  "Any unsaved changes will be lost. This action cannot be undone."
  
  [Go Back to Form]  [Discard & Return to Dashboard]
  ```
  - "Go Back to Form" → Return to form, keep data intact
  - "Discard & Return to Dashboard" → Navigate back to `/dashboard/shipper` WITHOUT saving

---

## 9. Validation & Error Handling

### Field-Level Validation (Real-Time)

**Timing:** On blur (when user leaves field)

**Validation Rules:**

| Field | Validation Rule | Error Message | Display |
|-------|---|---|---|
| Street Address (P & D) | Not empty | "Street address is required" | Below input |
| City (P & D) | Not empty | "City is required" | Below input |
| State (P & D) | Not empty | "Select a state" | Below input |
| ZIP Code (P & D) | Matches regex `^\d{5}(-\d{4})?$` | "ZIP code must be 5 digits (or 5+4 format)" | Below input |
| Distance | Auto-calculated; show error if API fails | "Distance calculation failed. Please verify addresses." | Below distance display |
| Earliest Pickup | Not past date | "Must be in the future" | Below input |
| Latest Pickup | ≥ Earliest Pickup | "Must be ≥ Earliest Pickup" | Below input |
| Earliest Delivery | ≥ Latest Pickup | "Must be ≥ Latest Pickup" | Below input |
| Latest Delivery | ≥ Earliest Delivery | "Must be ≥ Earliest Delivery" | Below input |
| Commodity | Not empty | "Commodity is required" | Below input |
| Weight | 0.01–150,000 lbs | "Must be between 0.01 and 150,000 lbs" | Below input |
| Weight >80k | Checkbox checked | "Acknowledge the special permit requirement" | Below checkbox |
| Equipment Type | Not empty | "Equipment type is required" | Below dropdown |
| Pay Rate | >0.00 | "Must be > $0.00" | Below input |
| Dimensions (if provided) | >0 | "Must be positive numbers" | Below inputs |
| Special Instructions | ≤500 chars | "Exceeds 500 character limit" | Below textarea |

**Error Display:**
- **Position:** Immediately below the violating input
- **Font:** 12px, italic, color `#E74C3C`
- **Border:** Input border changes to `2px solid #E74C3C` (visual attention)
- **Auto-Clear:** When user corrects value and blurs field again, error disappears

### Form-Level Validation (On Submit)

**Workflow:**
1. User clicks "Create & Post Load"
2. Form validates ALL required fields
3. If any errors found:
   - Show validation banner at top
   - Scroll to first error field
   - Disable submit button
   - Display per-field errors below each violating field
4. If all validations pass:
   - Disable submit button
   - Show loading state: "⟳ Creating Load..."
   - POST to `/api/v1/loads` endpoint
   - Handle server response

### Server Error Handling

**Error Banner (Display on Server Error):**
- **Position:** Top of form, below modal header
- **Background:** `#FFF3CD` (warning background)
- **Border:** 1px solid `#F39C12` (safety amber)
- **Border Radius:** 4px
- **Padding:** 12px 16px (space-sm)
- **Typography:** 14px, `#1A1A1A`

**Message Format:**
- **Default:** "Unable to create load. Please try again."
- **Custom (if server returns message):** "Unable to create load: [server error reason]"

**Actions:**
- **Dismiss Button:** [×] top-right of banner
- **Retry Button:** Inline "Retry" text button (color: `#B08D57`)
- **Auto-Dismiss:** After 10 seconds if user hasn't interacted with form

**Behavior After Server Error:**
- **Re-Enable Submit Button:** User can retry immediately
- **Preserve Form Data:** All entered data persists (don't clear on error)
- **Focus:** Keep focus on submit button for accessibility

### Success Handling

**On Successful Submit (HTTP 200–201):**
1. **Close Modal:** Modal fades out (200ms ease-out)
2. **Backdrop Fade:** Overlay backdrop fades (200ms)
3. **Toast Notification (Bottom-Right Corner):**
   - **Message:** "Load created successfully — #LC-123456789"
   - **Background:** `#27AE60` (Emerald Green, success color)
   - **Text:** `#FFFFFF` (white)
   - **Padding:** 16px 20px
   - **Border Radius:** 4px
   - **Duration:** 5 seconds, then auto-dismiss
   - **Action Link:** "View in Dashboard" (clickable text, underline on hover)
   - **Animation:** Slide in from bottom-right (200ms ease-out), slide out on dismiss (200ms ease-in)

4. **Dashboard Integration:**
   - Shipment Status Panel automatically refetches active shipments (within 1–2 seconds per NFR-504 cache TTL)
   - New load appears at top of Shipment Status Panel with:
     - Status Badge: "POSTED" (Danger Red `#E74C3C`)
     - Load ID: Display in list
     - Brief Highlight: 2-second background highlight (fade from `#FFF9E6` to transparent) to draw attention

---

## 10. Responsive Design & Breakpoints

### Desktop (≥1024px)

**Page Layout:** Full width with sidebar
- **Form Width:** ~100% of content area (after sidebar)
- **Panel Width:** Full container width

**Form Sections (Panel Layout):**
- **Panel Stacking:** Vertical (space-y-6 = 24px gap)
- **Each Panel:** Full width, side-by-side multi-column content within panels

**Specific Layouts Within Panels:**
- **Origin/Destination Panels:** Address fields in 3-column grid (City, State, ZIP)
- **Schedule Panel:** 4-column date/time grid (Date, Time, Date, Time)
- **Cargo Details Panel:** 4-column grid (Commodity, Weight, Dimensions)
- **Equipment & Payment Panel:** 2-column grid (Equipment, Pay Rate row 1; Payment Terms row 2)

**Button Layout:** 
- Cancel (left), Save as Draft (center), Create & Post (right)
- Sticky footer with 24px padding

### Tablet (768–1023px)

**Page Layout:** Full width, sidebar may collapse
- **Form Width:** ~100% of content area
- **Panel Width:** Full container width

**Form Sections (Panel Layout):**
- **Panel Stacking:** Vertical (space-y-6 = 24px gap, unchanged)
- **Each Panel:** Full width, content stacks or uses narrower grids

**Specific Layouts Within Panels:**
- **Origin/Destination Panels:** Address fields stack to 2 columns (City/State, ZIP alone)
- **Schedule Panel:** 2×2 grid (Date/Time pairs side-by-side; Pickup row 1, Delivery row 2)
- **Cargo Details Panel:** 2-column grid (Commodity, Weight; Dimensions full-width)
- **Equipment & Payment Panel:** Stack vertically (Equipment full-width, Pay Rate full-width, Payment Terms full-width)

**Button Layout:** 
- All buttons stack vertically, full-width
- Sticky footer maintained

### Mobile (≤767px) — Secondary

**Note:** Mobile is **not** primary design target (shipper persona is office-desktop). Mobile receives basic responsive adjustments only.

**Page Layout:** Full viewport width
- **Form Width:** 100% with 16px (space-md) side padding
- **Panel Width:** Full container width

**Form Sections (Panel Layout):**
- **Panel Stacking:** Vertical (space-y-4 = 16px gap, tighter for mobile)
- **Panel Padding:** 16px (space-md, reduced from 24px desktop)
- **Each Panel:** Full width, all content stacks vertically

**Specific Layouts Within Panels:**
- **Origin/Destination Panels:** All address fields stack vertically (1 column)
- **Schedule Panel:** All date/time fields stack vertically (1 per row)
- **Cargo Details Panel:** All fields stack vertically
- **Equipment & Payment Panel:** All fields stack vertically

**Button Layout:** All buttons stack vertically, full-width, tighter spacing (8px gap)

**Font Sizes:** Unchanged (14px remains readable on mobile)
**Dimensions Section:** Remains collapsed by default (to minimize scrolling)

---

## 11. Accessibility & Keyboard Navigation

### ARIA Labels & Semantic HTML

**Form Structure:**
- Form wrapped in `<form role="dialog" aria-label="Create Load Form" aria-labelledby="form-title">`
- **Form Title:** `<h1 id="form-title">Create New Load</h1>` (for screen readers)

**Input Labels:**
- Every input has associated `<label for="input-id">` element
- Required fields marked with `*` and `aria-required="true"`

**Error Messages:**
- Error text linked via `aria-describedby="error-id"` to each input
- Error text has `role="alert"` for immediate screen reader notification

**Section Headers:**
- Section titles use `<h3>` with appropriate hierarchy
- Example: `<h3>Pickup & Delivery Locations</h3>`

**Helper Text:**
- Helper text linked via `aria-describedby="helper-id"` to input
- Marked as advisory (not required for completion)

### Keyboard Navigation

**Tab Order (Logical Left-to-Right, Top-to-Bottom):**

1. Street Address (Pickup)
2. Suite/Unit (Pickup)
3. City (Pickup)
4. State (Pickup)
5. ZIP Code (Pickup)
6. Street Address (Delivery)
7. Suite/Unit (Delivery)
8. City (Delivery)
9. State (Delivery)
10. ZIP Code (Delivery)
11. Earliest Pickup (datetime)
12. Latest Pickup (datetime)
13. Earliest Delivery (datetime)
14. Latest Delivery (datetime)
15. Commodity
16. Weight
17. [Overweight checkbox — if visible]
18. Dimensions Expand/Collapse (toggle)
19. [Dimension inputs — if expanded]
20. Equipment Type
21. Pay Rate
22. Pay Rate Type (radio buttons)
23. Payment Terms
24. Special Instructions (textarea)
25. Save as Draft (button)
26. Create & Post Load (button)
27. Cancel (button)

**Implementation:**
- Use semantic HTML (`<input>`, `<button>`, `<label>`) for automatic tab order
- If custom tab order needed, use `tabindex="0"` (not `tabindex="1"` or higher, which breaks native order)
- Avoid `tabindex="-1"` unless intentional (hidden elements)

**Keyboard Shortcuts:**
- **Tab:** Move to next field
- **Shift+Tab:** Move to previous field
- **Enter (on datetime picker):** Confirm selection and move to next field
- **Arrow Keys (on datetime picker):** Navigate date/time picker UI
- **Arrow Keys (on dropdown):** Scroll options, Enter to select
- **Space (on checkbox):** Toggle checkbox state

### Color Contrast (WCAG AA Compliance)

**Text Contrast Verification:**

| Text | Background | Color Hex | Contrast Ratio | Status |
|------|-----------|-----------|---|---|
| Primary Text | White | `#1A1A1A` on `#FFFFFF` | 18.5:1 | ✅ WCAG AAA |
| Secondary Text | White | `#636E72` on `#FFFFFF` | 4.5:1 | ✅ WCAG AA |
| Error Message | White | `#E74C3C` on `#FFFFFF` | 5.2:1 | ✅ WCAG AA |
| Helper Text | White | `#636E72` on `#FFFFFF` | 4.5:1 | ✅ WCAG AA |
| Button Text | Bronze Gradient | `#FFFFFF` on gradient | >7:1 | ✅ WCAG AAA |
| Placeholder Text | White | `#999999` on `#FFFFFF` | 3.5:1 | ⚠️ Below AA (acceptable for placeholder only) |

**Verification Tool:** WAVE, Axe, or Lighthouse accessibility audit (run after CODER builds)

---

## 12. Design Tokens & Style Guide Compliance

### Shipper & Administrator Style Guide Compliance

| Section | Compliance | Reference |
|---------|-----------|-----------|
| **§6.1 Color Palette** | ✅ All semantic colors used correctly | Error: `#E74C3C`, Info: `#3498DB`, Warning: `#F39C12`, Success: `#27AE60` |
| **§6.2 Typography** | ✅ Sora (headlines), Inter/Roboto (body) | 18px title, 14px body, 12px helper |
| **§6.3 Form Inputs** | ✅ 40px height, 4px radius, correct focus color | Border: `#D0D0D0`, Focus: `#B08D57` |
| **§6.4 Spacing (8px Rule)** | ✅ All gaps/padding multiples of 8px | 4px (xs), 8px (sm), 12px, 16px (md), 24px (lg), 32px (xl) |
| **§6.5 Container Specs** | ✅ White background, `#D0D0D0` border, 8px radius | Modal: `#FFFFFF` bg, 1px `#D0D0D0` border, 8px radius |
| **Metallic Bronze Button** | ✅ Per US-824 gradient + shadow | `linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)` |

### CSS Custom Properties (Design Tokens)

```css
:root {
    /* Colors */
    --color-white: #FFFFFF;
    --color-cream-bg: #EFEBE0;
    --color-cream-light: #F8F9FB;
    --color-text-primary: #1A1A1A;
    --color-text-secondary: #636E72;
    --color-text-muted: #4A5568;
    --color-border: #D0D0D0;
    --color-border-divider: #E8E3D8;
    --color-focus: #B08D57;
    --color-error: #E74C3C;
    --color-warning: #F39C12;
    --color-success: #27AE60;
    --color-info: #3498DB;

    /* Spacing */
    --space-xs: 4px;
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    --space-xl: 32px;

    /* Typography */
    --font-size-sm: 12px;
    --font-size-base: 14px;
    --font-size-lg: 16px;
    --font-size-xl: 18px;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 600;

    /* Border Radius */
    --radius-input: 4px;
    --radius-container: 8px;
}
```

---

## 13. Implementation Handoff Checklist (For ARCHITECT & CODER)

### ARCHITECT Responsibilities

- [ ] Define `EquipmentType` enum in domain model (6 options: DRY_VAN, FLATBED, REFRIGERATED, TANKER, SPECIALIZED, STEP_DECK)
- [ ] Define `PaymentTerms` enum (4 options: IMMEDIATE, NET_7, NET_14, NET_30)
- [ ] Define `LoadStatus` enum (verify POSTED status exists for new loads)
- [ ] Design Address Book schema (tenant_id-scoped facility lookup table, RLS enforced)
- [ ] Design distance calculation service contract (input: pickup_zip, delivery_zip → output: distance_miles)
- [ ] Design CreateLoad DTO (accept all form inputs, return created load with ID)
- [ ] Design Address Book DTO (facility lookup/save endpoints)
- [ ] Document API endpoint: `POST /api/v1/loads` (request schema, response schema, error codes)

### CODER Responsibilities

**Layout & Structure:**
- [ ] Wrap form in ShipperPageLayout component
- [ ] Wrap each logical section in individual styled panels (bg-white, border-gray-300, rounded-lg, shadow-sm, p-6)
- [ ] Use `space-y-6` between panels (24px gap per Shipper Style Guide §6.4)
- [ ] Implement responsive panel layout (full-width desktop, tablet 2-col where applicable, mobile 1-col)

**Schedule Section (Split Date/Time):**
- [ ] Replace 4 datetime-local inputs with 8 date + time inputs (per §4 UX optimization)
- [ ] Implement 4-column grid (desktop): Date, Time, Date, Time
- [ ] Implement 2×2 grid (tablet): Date/Time pairs side-by-side
- [ ] Implement 1-column stack (mobile): all fields vertical

**Core Functionality:**
- [ ] Build form using React Hook Form + Zod validation
- [ ] Integrate distance calculation API (Google Maps or MapBox; cache 24h)
- [ ] Implement address book autocomplete (call Address Book endpoints)
- [ ] Implement real-time validation (on blur, on change)
- [ ] Implement estimated total calculation (pay_rate × distance_miles)
- [ ] Implement overweight warning + acknowledgment gate
- [ ] Implement form submission (POST to backend)
- [ ] Implement error handling (field-level, form-level, server-level)
- [ ] Implement success state with "Create Another Load" and "Back to Dashboard" buttons
- [ ] Implement Shipment Status Panel refetch after success (via React Query cache invalidation)

**Testing & Accessibility:**
- [ ] Write unit tests for validation logic
- [ ] Write E2E tests for happy path + error scenarios (using Playwright Page Object Model)
- [ ] Verify keyboard navigation + ARIA labels
- [ ] Run accessibility audit (WAVE, Axe, or Lighthouse)
- [ ] Verify responsive design (desktop, tablet, mobile)
- [ ] Test all date/time pickers work correctly on desktop/mobile

### HFD Responsibilities (Post-Implementation)

- [ ] Review CODER implementation against this spec
- [ ] Verify button styling matches metallic bronze gradient
- [ ] Verify spacing adheres to 8px grid
- [ ] Verify form inputs match 40px height
- [ ] Verify color contrast passes WCAG AA
- [ ] Approve for merge to main

---

## 14. Technical Notes for CODER

### Form State Management

**Recommended:** React Hook Form with Zod schema for validation

```javascript
// Pseudo-code example
const schema = z.object({
  pickup_address: z.string().min(1, "Required"),
  delivery_address: z.string().min(1, "Required"),
  earliest_pickup: z.string().datetime().refine(d => new Date(d) > new Date()),
  latest_pickup: z.string().datetime(),
  commodity: z.string().min(1, "Required"),
  weight: z.number().min(0.01).max(150000),
  equipment_type: z.enum(["DRY_VAN", "FLATBED", ...]),
  pay_rate: z.number().min(0.01),
  pay_rate_type: z.enum(["FLAT_RATE", "PER_MILE"]),
  special_instructions: z.string().max(500).optional(),
  // ... other fields
});
```

### Distance Calculation

- **Trigger:** After both Pickup and Delivery ZIP codes are valid
- **API Call:** `GET /api/external/distance?origin_zip={}&destination_zip={}`
- **Caching:** Store in form state; only recalculate if addresses change
- **Error Handling:** Show error message + "Try Again" button

### Estimated Total Calculation

- **Formula:** `estimated_total = pay_rate × distance_miles`
- **Update Trigger:** Whenever `pay_rate` or `distance_miles` changes
- **Real-Time Display:** Update estimated total field immediately (no debounce)
- **Precision:** Round to 2 decimal places (cents)

### Address Book Integration (Phase 11+ Enhancement)

- **Current Scope:** Show placeholder "Address Book (Coming Soon)" or skip
- **Future (US-103-v2 Phase 11+):** Implement autocomplete dropdown with ARCHITECT-designed schema

### Shipment Status Panel Refresh

- **Mechanism:** React Query cache invalidation
- **Trigger:** After successful load creation (HTTP 200)
- **Timing:** Within 1–2 seconds (per NFR-504 cache TTL)
- **Code Pattern:**
  ```javascript
  const queryClient = useQueryClient();
  queryClient.invalidateQueries({ queryKey: ["shipmentStatus"] });
  ```

### ShipperPageLayout Page Integration

**Component Hierarchy:**
```
<ShipperPageLayout>
  <LoadCreationPage>
    <PageHeader title="Create New Load" />
    <Breadcrumb>
      <BreadcrumbItem to="/dashboard/shipper">Dashboard</BreadcrumbItem>
      <BreadcrumbItem>Create Load</BreadcrumbItem>
    </Breadcrumb>
    <LoadCreationForm 
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  </LoadCreationPage>
</ShipperPageLayout>
```

**Route Navigation (Quick Actions Button):**
- **Button:** "Post Load" (see US-824, US-824 component)
- **Click Handler:** `onClick={() => navigate('/shipper/loads/create')}`
- **Navigation Library:** React Router v6 (useNavigate hook)

**LoadCreationPage Component:**
- Props: None (route-level component, data fetched via React Query)
- State: Form state managed internally via React Hook Form
- Routing: Mounted when URL matches `/shipper/loads/create`

**Escape Key Handler (Browser Back/Navigation):**
```javascript
const handleBackNavigation = (e: BeforeUnloadEvent) => {
  if (form.formState.isDirty) {
    // Show browser warning if form has unsaved data
    e.preventDefault();
    e.returnValue = '';
    // Also show custom confirmation dialog
    return false;
  }
};

useEffect(() => {
  window.addEventListener("beforeunload", handleBackNavigation);
  return () => window.removeEventListener("beforeunload", handleBackNavigation);
}, [form.formState.isDirty]);
```

**Cancel Button Handler (NO SAVE):**
```javascript
const handleCancel = () => {
  if (form.formState.isDirty) {
    // Show confirmation: "Discard this load?"
    const confirmed = window.confirm(
      "Discard this load?\n\nAny unsaved changes will be lost. This action cannot be undone."
    );
    if (confirmed) {
      // DO NOT save — navigate immediately without POST
      navigate("/dashboard/shipper");
    }
    // else: User clicked "Go Back to Form" — stay on page, form data intact
  } else {
    // Form is empty — navigate immediately
    navigate("/dashboard/shipper");
  }
};
```

**Success Callback (CREATE & POST LOAD):**
```javascript
const handleSuccess = async (loadId: string) => {
  // 1. Show success message on page
  setSuccessMessage(`Load ${loadId} posted successfully`);
  
  // 2. Invalidate Shipment Status Panel query
  queryClient.invalidateQueries({ queryKey: ["shipmentStatus"] });
  
  // 3. Keep form state (show what was submitted)
  // Do NOT clear form yet
  
  // 4. Display success buttons: "Create Another Load" | "Back to Dashboard"
  setFormSubmitted(true);
  
  // 5. Auto-scroll to bottom (where buttons are) so user sees options
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
};

const handleCreateAnother = () => {
  // Clear success state, reset form, refocus first input
  setFormSubmitted(false);
  setSuccessMessage("");
  form.reset();
  const firstInput = formRef.current?.querySelector("input");
  firstInput?.focus();
  
  // Scroll back to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleBackToDashboard = () => {
  navigate("/dashboard/shipper");
  // Shipment Status Panel auto-refetches on page mount (via React Query)
};

**Save as Draft Button Handler:**
```javascript
const handleSaveAsDraft = async () => {
  try {
    // 1. Validate required fields before saving
    const isValid = await form.trigger(); // Validate all fields
    if (!isValid) {
      // Show error: "Please fix validation errors"
      return;
    }
    
    // 2. Submit form with status=DRAFT (use hidden input or param)
    const formData = form.getValues();
    const response = await apiClient.post("/loads/draft", formData);
    
    // 3. Show success message
    setSuccessMessage(`Draft saved: ${response.data.loadId}`);
    
    // 4. Auto-navigate to dashboard after 2 seconds
    setTimeout(() => {
      navigate("/dashboard/shipper");
    }, 2000);
    
  } catch (error) {
    // Handle error (show error banner)
    setError(`Failed to save draft: ${error.message}`);
  }
};
```


**Form State Management:**
```javascript
// Use React Hook Form for validation
const { control, register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
  resolver: zodResolver(loadSchema),
  mode: "onBlur",
  defaultValues: {
    equipmentType: "DRY_VAN",
    payRateType: "FLAT_RATE",
    paymentTerms: "NET_7",
  }
});

// Track form submission state
const [formSubmitted, setFormSubmitted] = useState(false);
const [successMessage, setSuccessMessage] = useState("");

// On successful submission
const onSubmit = async (data) => {
  try {
    const response = await apiClient.post("/loads", data);
    handleSuccess(response.data.loadId);
  } catch (error) {
    // Handle error (see Section 9: Validation & Error Handling)
  }
};
```

---

## 15. Design Updates & Sign-Off

### Key Design Changes (Session 2026-06-17)

Based on UX optimization discussion and LIBRARIAN approval (CHG-PENDING_Schedule_Layout_UX_Optimization):

1. **Panel-Based Layout** — Each logical form section (Origin, Destination, Schedule, Cargo Details, Equipment & Payment) wrapped in individual styled panels (bg-white, border-gray-300, rounded-lg, shadow-sm, p-6)
   - **Why:** Consistent with Shipper Dashboard component design system; improves visual hierarchy and scanability
   - **Impact:** Better information density on desktop; clearer section delineation

2. **Split Date/Time Fields (Schedule Section)** — Replaced 4 datetime-local inputs with 8 date + time inputs
   - **Why:** 50% vertical space reduction; improved scanability for operations managers
   - **Layout:** 4-column desktop grid (Date, Time, Date, Time); 2×2 tablet; 1-column mobile
   - **Validation:** Cross-field rules unchanged; date + time combined on form submission

3. **Responsive Panel Stacking** — Panels maintain full-width layout on tablet/mobile with responsive content grids
   - **Desktop (≥1024px):** Full-width multi-column content within panels
   - **Tablet (768–1023px):** Full-width panels with narrower content grids
   - **Mobile (≤767px):** Full-width panels with 1-column content stacks

---

**HFD Status:** 🔒 **LOCKED FOR IMPLEMENTATION**  
**Date Locked:** 2026-06-17 (Final)  
**Updated By:** Human Factors Designer (based on session discussion)

**Distribution:**
- **ARCHITECT:** Domain models + service contracts (no changes to spec §1)
- **CODER:** Build form with panel layout + split date/time fields per §2–12 + Implementation Checklist
- **REVIEWER:** Audit implementation against this spec + Shipper Style Guide compliance + panel layout verification

**Expected Timeline:**
- ARCHITECT: No additional work required (backend enums already defined)
- CODER implementation: 4–6 days (panel restructuring + split date/time + validation)
- Testing + review: 2–3 days
- **Total Effort:** 6–9 days

---

**Ready for CODER:** This design specification is complete and ready for frontend implementation. All sections include layout diagrams, field specifications, validation rules, and accessibility requirements.

**Questions?** Contact HFD or LIBRARIAN for clarifications.

---

**End of HFD Design Specification**

**Questions?** Contact Human Factors Designer or Librarian for clarifications before CODER begins implementation.
