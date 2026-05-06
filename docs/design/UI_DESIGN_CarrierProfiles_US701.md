# HFD UI/UX Design: Carrier Profiles (US-701)

**Document:** Human Factors Design Specification  
**Story:** US-701 (Carrier Profiles - Equipment, Lanes, Availability)  
**Designer:** HFD  
**Date:** 2026-05-01  
**Status:** ✅ DESIGN_APPROVED

---

## Executive Summary

Carrier Profiles enable owner-operator truckers to maintain equipment inventory, preferred load lanes, and availability windows. This design prioritizes **mobile-first interaction**, **high-contrast elements** (for high-glare cab environments), and **sequential form flows** to reduce cognitive load during load-matching operations.

**Target Users:**
- **Primary:** Owner-operator truckers (mobile-first, high-glare environment)
- **Secondary:** Shippers viewing public profiles (desktop/tablet)

---

## Design System Compliance

| Category | Token | Usage |
|----------|-------|-------|
| **Primary Color** | Kinetic Blue `#2563EB` | Primary buttons, active states |
| **Accent Color** | Accent Teal `#00E5A8` | Success, "Available" status |
| **Warning Color** | Warning Amber `#F59E0B` | "On Load", pending status |
| **Error Color** | Error Red `#EF4444` | "Needs Repair", unavailable |
| **Background** | Deep Space Navy `#0B1220` | Dark mode (mobile-optimized) |
| **Card Background** | Steel Grey `#1E293B` | Equipment/lane cards |
| **Text Primary** | White `#FFFFFF` | Headers, labels |
| **Text Secondary** | Mid Grey `#334155` | Descriptions, metadata |
| **Borders** | Mid Grey `#334155` | Card separators |

**Typography:**
- **Headlines:** SORA (Sans-Serif), Bold, 20px–32px
- **Body:** INTER (Sans-Serif), Regular, 14px–16px
- **Labels:** INTER, Semibold, 12px

---

## Screen 1: Trucker Profile Hub (AC-1, AC-2, AC-3, AC-4)

### Overview
Central dashboard for managing carrier profile data. Tabs separate concerns: Equipment, Lanes, Availability. Designed for quick mobile access with large touch targets (48px minimum).

### Layout

```
┌─────────────────────────────────────────────────┐
│  📋 My Carrier Profile                    [≡]  │  ← Header (title + menu)
├─────────────────────────────────────────────────┤
│  ⭐ Your Profile: 4.8/5 (87 ratings)           │  ← Salience block
│  Status: 🟢 Available (Mon–Fri, 06:00–22:00)   │
├─────────────────────────────────────────────────┤
│  [Equipment]  [Lanes]  [Availability]          │  ← Tabs
├─────────────────────────────────────────────────┤
│                                                 │
│  TAB 1: EQUIPMENT                               │
│  ┌───────────────────────────────────────┐    │
│  │ 🚛 Flatbed 48'                        │    │
│  │ Capacity: 45,000 lbs | Condition: ✓  │    │
│  │ [Edit]  [Delete]                      │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  [+ Add Equipment]  [Button: Kinetic Blue]     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Interaction Flow (Hick's Law)

**Step 1: Add Equipment**
1. Tap `[+ Add Equipment]`
2. Form opens as modal/overlay (sequential)

**Step 2: Equipment Entry Form (AC-1)**

```
┌─────────────────────────────────────────────────┐
│  Add Equipment                          [×]     │
├─────────────────────────────────────────────────┤
│  Equipment Type *                              │
│  ┌─────────────────────────────────┐          │
│  │ ▼ Select Type: [Flatbed ________]│          │  ← Dropdown (large touch)
│  └─────────────────────────────────┘          │
│                                                 │
│  Dimensions (in feet) *                        │
│  ┌──────────────┬──────────────┬──────────┐   │
│  │ Length: 48   │ Width: 8.5   │ Height: 6│   │  ← Side-by-side inputs
│  └──────────────┴──────────────┴──────────┘   │
│                                                 │
│  Capacity (lbs) *                              │
│  ┌─────────────────────────────┐              │
│  │ 45000 lbs                   │              │  ← Large input
│  └─────────────────────────────┘              │
│                                                 │
│  Equipment Condition *                         │
│  ◉ Good  ○ Fair  ○ Needs Repair               │  ← Radio buttons (accessible)
│                                                 │
│  Year/Model (optional)                         │
│  ┌─────────────────────────────┐              │
│  │ 2022                        │              │
│  └─────────────────────────────┘              │
│                                                 │
│  [Cancel]  [Save Equipment]  [Primary: Blue]   │
└─────────────────────────────────────────────────┘
```

**Accessibility (ARIA):**
```html
<form aria-label="Add Equipment">
  <fieldset aria-required="true">
    <legend>Equipment Type *</legend>
    <select aria-label="Equipment type" required>...</select>
  </fieldset>
  <fieldset aria-required="true">
    <legend>Dimensions (feet) *</legend>
    <input aria-label="Length in feet" type="number" required />
    <input aria-label="Width in feet" type="number" required />
    <input aria-label="Height in feet" type="number" required />
  </fieldset>
  <fieldset aria-required="true">
    <legend>Condition *</legend>
    <input type="radio" name="condition" value="GOOD" aria-label="Good condition" />
    <input type="radio" name="condition" value="FAIR" aria-label="Fair condition" />
  </fieldset>
</form>
```

---

## Screen 2: Preferred Lanes (AC-2)

### Layout

```
┌─────────────────────────────────────────────────┐
│  Preferred Lanes                          [≡]  │
├─────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐    │
│  │ SE → CA                               │    │  ← Lane card
│  │ Min Rate: $1.75/mi | Freq: Weekly    │    │
│  │ [Edit]  [Deactivate]                  │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  ┌───────────────────────────────────────┐    │
│  │ TX → NE                               │    │
│  │ Any Rate | Freq: Daily                │    │
│  │ [Edit]  [Deactivate]                  │    │
│  └───────────────────────────────────────┘    │
│                                                 │
│  [+ Add Lane]  [Button: Kinetic Blue]         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Add/Edit Lane Form (AC-2)

```
┌─────────────────────────────────────────────────┐
│  Add Preferred Lane                     [×]    │
├─────────────────────────────────────────────────┤
│  Origin Region *                               │
│  ┌─────────────────────────────┐              │
│  │ ▼ Southeast _______________ │              │  ← Dropdown
│  └─────────────────────────────┘              │
│  [Supported: SE, CA, TX, NE, MW]              │  ← Helper text
│                                                 │
│  Destination Region *                          │
│  ┌─────────────────────────────┐              │
│  │ ▼ California ______________ │              │
│  └─────────────────────────────┘              │
│                                                 │
│  Minimum Rate (optional)                       │
│  ┌──────────────────────────────┐             │
│  │ $ 1.75  /mi                  │             │  ← Currency input
│  └──────────────────────────────┘             │
│                                                 │
│  Frequency Preference *                        │
│  ◉ Daily  ○ Weekly  ○ Monthly  ○ Any          │
│                                                 │
│  [Cancel]  [Save Lane]                         │
└─────────────────────────────────────────────────┘
```

---

## Screen 3: Availability Settings (AC-3)

### Layout

```
┌─────────────────────────────────────────────────┐
│  Availability Settings                    [≡]  │
├─────────────────────────────────────────────────┤
│  📅 Days Available *                           │
│  ◉ Mon–Fri  ○ Weekends  ○ Every Day          │
│                                                 │
│  🕐 Hours Available *                          │
│  From:  [06:00]  To:  [22:00]                 │  ← Time picker
│                                                 │
│  🌍 Time Zone *                                │
│  ┌─────────────────────────────┐              │
│  │ ▼ EST (Eastern) ___________ │              │
│  └─────────────────────────────┘              │
│                                                 │
│  Currently On Load?                            │
│  ☐ I'm currently carrying a load              │  ← Checkbox (high-contrast)
│                                                 │
│  [Update Availability]  [Button: Kinetic Blue] │
│                                                 │
│  ✓ Updated 2 hours ago                        │  ← Confirmation state
│                                                 │
└─────────────────────────────────────────────────┘
```

**State Indicators (AC-3 Display Logic):**
- **Available (🟢 Green):** Currently available per window
- **On Load (🟡 Amber):** Currently carrying load
- **Unavailable (🔴 Red):** Outside availability window

---

## Screen 4: Public Trucker Profile (AC-4, Shipper-Facing)

### Overview
Read-only view displayed to shippers. Emphasizes reputation, capabilities, and current status.

### Layout

```
┌─────────────────────────────────────────────────┐
│  John's Logistics                         [<]  │  ← Back button
├─────────────────────────────────────────────────┤
│  ⭐ 4.8/5 Stars (87 ratings)                   │  ← Salience block (large)
│                                                 │
│  Status: 🟢 Available                          │
│  Mon–Fri, 06:00–22:00 EST                      │
│  Last Seen: 2 hours ago                        │
│                                                 │
├─────────────────────────────────────────────────┤
│  📦 EQUIPMENT                                   │  ← Section header
│  ┌─────────────────────────────┐              │
│  │ 🚛 Flatbed 48'              │              │
│  │ Capacity: 45,000 lbs        │              │
│  │ Condition: Good             │              │
│  └─────────────────────────────┘              │
│  ┌─────────────────────────────┐              │
│  │ 🚐 Dry Van 53'              │              │
│  │ Capacity: 43,000 lbs        │              │
│  │ Condition: Good             │              │
│  └─────────────────────────────┘              │
│                                                 │
│  🛣️  PREFERRED LANES                           │
│  • Southeast → California ($1.75+/mi)          │
│  • Texas → Northeast (Any Rate)                │
│                                                 │
│  📊 HISTORY                                     │
│  ✓ 156 loads completed                         │
│  🔄 1 currently active                         │
│                                                 │
│  [Contact] [View History]                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Sensitive Data Masking (AC-4 Security):**
- ✅ Show: Equipment, lanes, ratings, history, availability
- ❌ Hide: Bank details, email, phone, insurance certs, internal notes

---

## Mobile Optimization Guidelines

### Touch Targets (High-Glare Environment)
- **Minimum:** 48px × 48px (per WCAG 2.1 Level AAA)
- **Preferred:** 56px–64px for trucker-facing interfaces
- **Spacing:** 12px minimum between targets to prevent accidental taps

### Typography (Legibility)
- **Headings:** 20px minimum (32px preferred on mobile)
- **Body:** 16px minimum (14px for secondary only)
- **Contrast:** 7:1 ratio for critical data (AA WCAG standard)

### Color Usage (High-Contrast)
- **Primary Actions:** Kinetic Blue `#2563EB` (high contrast on navy background)
- **Success State:** Accent Teal `#00E5A8` (use sparingly; bold)
- **Warning State:** Amber `#F59E0B` (for "On Load" status)
- **Error State:** Red `#EF4444` (for "Needs Repair" condition)

### Micro-interactions
1. **Add Button:** Haptic feedback + toast confirmation ("Equipment added")
2. **Delete Button:** Two-tap confirmation ("Are you sure?")
3. **Save Form:** Loading spinner + success toast
4. **Availability Toggle:** Immediate visual feedback (color + text change)

---

## State Management & Form Validation

### Real-time Validation (AC-1, AC-2, AC-3)

| Field | Rule | Error Message |
|-------|------|---------------|
| Equipment Type | Must be ENUM | "Select a valid equipment type" |
| Dimensions | Must be > 0 | "All dimensions must be positive" |
| Capacity | Must be > 0 | "Capacity must be greater than 0 lbs" |
| Origin/Dest | Must match regions | "Select a valid region" |
| Min Rate | Optional; if set, > 0 | "Rate must be $0.01 or higher" |
| Hours | start < end | "Start time must be before end time" |
| Time Zone | Must be valid IANA | "Select a valid time zone" |

### Accessible Error Display

```html
<div role="alert" aria-live="polite" class="error-message">
  ⚠️ Equipment dimensions must be positive numbers
</div>
```

---

## Navigation Flows

### Trucker-Facing (Primary)

```
Dashboard (Hub)
  ├── Equipment Tab
  │   ├── Add Equipment → Form → Confirmation
  │   ├── Edit Equipment → Form → Confirmation
  │   └── Delete Equipment → Confirmation
  │
  ├── Lanes Tab
  │   ├── Add Lane → Form → Confirmation
  │   ├── Edit Lane → Form → Confirmation
  │   └── Deactivate Lane → Confirmation
  │
  └── Availability Tab
      └── Update Availability → Form → Confirmation

Load Board (Secondary Context)
  └── [Suggested Loads] ← Uses profile data for matching
```

### Shipper-Facing (Public Profile)

```
Load Board Search
  └── View Trucker Profile (Public)
      └── [Back to Board]
```

---

## Compliance Checklist

- [x] Mobile-first, high-glare optimized (48px+ touch targets, high contrast)
- [x] Sequential forms (Hick's Law: reduces cognitive load)
- [x] Accessibility (ARIA labels, semantic HTML)
- [x] Style Guide compliant (colors, typography, spacing)
- [x] State indicators (Available/On Load/Unavailable)
- [x] Sensitive data masking (public profile)
- [x] Form validation (real-time, accessible errors)
- [x] Micro-interactions (haptic, toasts, spinners)

---

**HFD Sign-Off:** ✅ UI/UX design complete and ready for CODER implementation.

**Next Step:** CODER role — Implement React components per this specification.
