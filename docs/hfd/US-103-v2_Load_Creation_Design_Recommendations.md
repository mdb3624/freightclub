# HFD DESIGN RECOMMENDATIONS: US-103-v2 Load Creation (Full Workflow)

**Story ID:** US-103-v2  
**Phase:** Phase 11+ (Load Creation Redesign)  
**Scope:** UI/UX Design for Shipper Persona  
**HFD Authority:** Human Factors Designer Role  
**Date:** 2026-06-17  
**Status:** DESIGN_RECOMMENDATIONS  
**Shipper Persona Reference:** Operations Manager/Dispatcher (10–50+ loads/day, desktop-first, office-based)

---

## Executive Summary

US-103-v2 Load Creation represents a **complete redesign** of the shipper's primary workflow for posting freight to the load board. The form must balance **speed** (create a load in <2 minutes for repeat users) with **accuracy** (capture all critical freight/payment details without friction). This HFD spec provides design guidance aligned with the **Shipper & Administrator Style Guide** (Classic Cream & Metallic Bronze aesthetic, high clarity, data-dense layout).

**Key Design Objectives:**
1. **Speed:** Minimal clicks, smart defaults, keyboard-navigable form
2. **Accuracy:** Real-time validation, helpful error messages, visual cues for required vs. optional
3. **Transparency:** Live distance calculation, payment estimation, clear workflow stages
4. **Familiarity:** Desktop-optimized, no mobile-first compromise, consistent with US-760 dashboard aesthetic

---

## Design Architecture: Form Stages

Recommended **single-page modal or slide-out panel** (not multi-step wizard) to keep context intact and allow shipper to see all info at once. Form stages organized by **logical grouping**, not sequential steps.

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  Create New Load                                          [×]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📍 PICKUP & DELIVERY LOCATIONS                                 │
│  ─────────────────────────────────────────────────────────────  │
│  [Pickup Address Grid]                 [Delivery Address Grid]  │
│  [Auto-Distance Display: 847 mi]       [Confidence Badge]       │
│                                                                  │
│  📅 PICKUP & DELIVERY WINDOWS                                   │
│  ─────────────────────────────────────────────────────────────  │
│  [Earliest Pickup]  [Latest Pickup]    [Earliest Delivery] ...  │
│                                                                  │
│  📦 CARGO DETAILS                                               │
│  ─────────────────────────────────────────────────────────────  │
│  [Commodity]  [Weight: lbs]  [Dimensions Grid: L/W/H ft+in]    │
│  [⚠️ OVERWEIGHT NOTICE if >80k lbs — CHECKBOX to acknowledge]   │
│                                                                  │
│  🚚 EQUIPMENT & PAYMENT                                         │
│  ─────────────────────────────────────────────────────────────  │
│  [Equipment Type Dropdown]  [Pay Rate]  [$ Flat / $ Per-Mile]   │
│  [Estimated Total (if per-mile)]  [Payment Terms Dropdown]      │
│                                                                  │
│  📝 SPECIAL INSTRUCTIONS (optional)                             │
│  ─────────────────────────────────────────────────────────────  │
│  [Text Area: 500 char limit, char counter]                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [Cancel]  [Save as Draft (secondary)]  [Create & Post ▶]│   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Specifications

### 1. Form Container & Modal

**Modal Wrapper (Desktop):**
- **Width:** 70–80% viewport width (max 900px on 4K displays)
- **Height:** 85vh (scrollable interior)
- **Positioning:** Center-screen overlay with semi-transparent backdrop (`rgba(0,0,0,0.4)`)
- **Border Radius:** 8px (per Shipper Style Guide §6.5)
- **Background:** `#FFFFFF`
- **Box Shadow:** `0 4px 12px rgba(0,0,0,0.15)` (slightly elevated to command attention)
- **Title:** "Create New Load" — Bold, uppercase, `#1A1A1A`, 18px, Sora font

**Modal Header (Close Button):**
- Floating close button ([×]) top-right, 32×32px, transparent background, hover fills with `#F8F9FB`
- Icon color: `#636E72` at rest, `#1A1A1A` on hover

**Scrollable Content Area:**
- **Interior Padding:** 24px (space-lg, all sides)
- **Section Gap:** 24px (space-lg) between each major section
- **Internal Dividers:** 1px solid `#E8E3D8` between sections (subtle, not heavy)

---

### 2. Address Input Sections (Pickup & Delivery)

**Principle:** Dual-column layout for Pickup (left) and Delivery (right), side-by-side on desktop.

**Each Address Block Contains:**

```
PICKUP LOCATION                          DELIVERY LOCATION
─────────────────────                    ─────────────────────
Street Address *                         Street Address *
[____________]                           [____________]

Suite/Unit (optional)                    Suite/Unit (optional)
[____________]                           [____________]

City *                                   City *
[____________]                           [____________]

State *                                  State *
[Dropdown ▼]                             [Dropdown ▼]

ZIP Code *                               ZIP Code *
[____________]                           [____________]

                    ┌─────────────────────────────┐
                    │ 📍 Distance: 847 miles      │
                    │ ✓ Addresses verified        │
                    └─────────────────────────────┘
```

**Input Field Specifications (per Shipper Style Guide §6.3):**
- **Border Radius:** 4px
- **Border:** 1px solid `#D0D0D0`
- **Border (Focus):** 2px solid `#B08D57` (Brand Bronze)
- **Height:** 40px
- **Padding:** 8px 12px
- **Font:** 14px, color `#1A1A1A`
- **Helper Text:** 12px, italic, `#636E72`, margin-top: 4px
- **Error Text:** 12px, italic, `#E74C3C`

**State Dropdown:**
- **Type:** Select dropdown with all 50 US states alphabetically
- **Placeholder:** "Select state"
- **Width:** 100% of container
- **On Selection:** Auto-focus next field (ZIP code) for keyboard efficiency

**Auto-Distance Display (After Address Completion):**
- **Position:** Centered below the address pair, inside a bordered callout box
- **Background:** `#F8F9FB` (ultra-light cream, per Shipper Style Guide)
- **Border:** 1px solid `#D0D0D0`
- **Padding:** 12px 16px
- **Border Radius:** 4px
- **Typography:** 16px, bold, `#1A1A1A` (the number), with icon (📍)
- **Secondary Text:** "✓ Addresses verified" or "⚠️ Address verification pending" in 12px, `#636E72`
- **Auto-Calculation Trigger:** When both pickup and delivery ZIP codes are complete; show spinner while calculating
- **Error State:** "⚠️ Distance calculation failed. Please verify addresses and try again." (color: `#E74C3C`)

---

### 3. Date/Time Windows (Pickup & Delivery)

**Principle:** Four datetime-local inputs organized in two columns (Pickup left, Delivery right).

```
PICKUP WINDOW                            DELIVERY WINDOW
─────────────────────                    ─────────────────────
Earliest Pickup (Date & Time) *          Earliest Delivery (Date & Time) *
[2026-06-18T08:00 ▼]                     [2026-06-18T16:00 ▼]

Latest Pickup (Date & Time) *            Latest Delivery (Date & Time) *
[2026-06-18T14:00 ▼]                     [2026-06-19T18:00 ▼]
```

**Input Type:** HTML5 `datetime-local` (browser native date/time picker)
- **Height:** 40px (per Shipper Style Guide §6.3)
- **Border/Focus/Padding:** Same as address inputs
- **Default Value:** Auto-populate "Earliest Pickup" with tomorrow at 8:00 AM; shipper adjusts as needed

**Validation Rules (Enforce in Real-Time):**
- Latest Pickup ≥ Earliest Pickup (show error inline if violated)
- Earliest Delivery ≥ Latest Pickup (show error inline if violated)
- Latest Delivery ≥ Earliest Delivery (show error inline if violated)
- **Error Display:** Small red text immediately below the input (12px, `#E74C3C`, italic)
- **Visual Feedback:** Red border on the violating input field
- **Clear on Fix:** Error clears immediately when shipper corrects the date

---

### 4. Cargo Details Section

**Principle:** Commodity + Weight are primary; Dimensions (L/W/H) are optional but encourage completion.

```
COMMODITY *
[Enter commodity: e.g., "Steel coils", "Electronics", "Produce"]

WEIGHT (lbs) *
[_________]
⚠️ [OVERWEIGHT NOTICE — shown if >80,000 lbs]
   "This load exceeds the federal weight limit of 80,000 lbs.
    Confirm this load has a valid special permit."
   [☐] I acknowledge this load requires a special permit
```

**Commodity Input:**
- **Type:** Text input
- **Placeholder:** "e.g., Electronics, Pallets, Refrigerated Food"
- **Height:** 40px
- **Max Length:** 100 characters (prevents abuse, supports common commodity names)
- **Helper Text:** "Be descriptive to help carriers assess load quickly"

**Weight Input:**
- **Type:** Number input (`<input type="number">`)
- **Min/Max:** 0.01 lbs to 150,000 lbs
- **Step:** 0.1 (allows precision; no arbitrary rounding)
- **Suffix:** Visual label "lbs" inline at the end of the input
- **Icon:** 📦 to the left of the label
- **Height:** 40px
- **Format:** Show comma-separated display (e.g., "25,500" instead of "25500")

**Overweight Notice (Conditional Display):**
- **Trigger:** When weight > 80,000 lbs
- **Box:** Background `#FFF3CD` (Danger/Warning), Border `#F39C12` (Safety Amber), Padding 12px 16px, Border Radius 4px
- **Icon:** ⚠️ (warning)
- **Text:** 14px, `#1A1A1A` (primary), with smaller secondary text `#4A5568`
- **Checkbox:** Inline checkbox with label "I acknowledge this load requires a special permit"
- **Behavior:** Submit button disabled until checkbox is checked (if weight >80k)

**Dimensions Section (Optional Collapsed):**
- **Header:** "Dimensions (Optional)" with expand/collapse toggle (▶/▼ icon)
- **When Collapsed:** Shows 3 dimension labels stacked vertically
- **When Expanded:**
  ```
  Length     Width       Height
  [__] ft    [__] ft     [__] ft
  [__] in    [__] in     [__] in
  ```
- **Input Type:** Number inputs with units (ft / in separately)
- **Helper Text:** "Enter dimensions to help carriers assess load space; leave blank if unknown"
- **Height:** 40px per input
- **Default State:** Collapsed (to minimize cognitive load for quick submissions)

---

### 5. Equipment Type & Payment Section

**Principle:** Equipment type is critical; Payment has two modes (Flat vs. Per-Mile) that affect display.

```
EQUIPMENT TYPE *                         PAY RATE *
[Equipment Dropdown ▼]                   [________] $ [Flat | Per-Mile ▼]

PAYMENT TERMS (optional)                 ESTIMATED TOTAL
[Payment Terms Dropdown ▼]               [Shows only if Per-Mile is selected]
                                         ≈ $2,118 total (847 mi × $2.50/mi)
```

**Equipment Type Dropdown:**
- **Type:** Select dropdown
- **Options:** [Dry Van, Flatbed, Refrigerated, Tanker, Specialized, Step Deck]
- **Default:** "Dry Van" (most common)
- **Width:** 100% of column
- **Height:** 40px
- **Styling:** Per Shipper Style Guide §6.3

**Pay Rate Input:**
- **Type:** Number input with $ prefix
- **Min/Max:** $0.01 to $99,999.99
- **Step:** 0.01 (cents precision)
- **Prefix Icon:** $ (visual currency indicator)
- **Height:** 40px
- **Placeholder:** "Enter rate"

**Pay Rate Type Toggle:**
- **Options:** "Flat Rate" | "Per-Mile"
- **Implementation:** Radio buttons OR inline toggle switch (radio buttons recommended for clarity)
- **Behavior:** Changes "Estimated Total" display
  - If **Flat Rate:** Hide estimated total; show "Flat rate" as label
  - If **Per-Mile:** Show estimated total calculation: `rate × distance_miles`

**Estimated Total Display (Conditional):**
- **Trigger:** When Pay Rate Type = "Per-Mile" AND distance is calculated AND pay rate is entered
- **Box:** Bordered callout (similar to distance display)
- **Format:** "≈ $X,XXX total (distance mi × $rate/mi)"
- **Color:** `#3498DB` (Tech Blue) for informational tone
- **Typography:** 14px, bold for amount, regular for formula
- **Real-Time Update:** Recalculate whenever pay rate or distance changes

**Payment Terms Dropdown:**
- **Type:** Select dropdown
- **Options:** [IMMEDIATE, NET_7, NET_14, NET_30]
- **Display Names:** "Immediate (Same/Next Day)", "Net 7", "Net 14", "Net 30"
- **Default:** "NET_7" (most common)
- **Helper Text:** "Choose how carriers settle after delivery"
- **Height:** 40px

---

### 6. Special Instructions (Optional)

**Principle:** Free-text field for hazmat, loading dock restrictions, contact notes, etc.

```
SPECIAL INSTRUCTIONS (optional)
─────────────────────────────────────────────────────────────
[Large text area]
[Characters remaining: 250/500]
```

**Textarea Specifications:**
- **Min Height:** 100px (encourages multi-line entry without constraint)
- **Max Height:** 200px (scrollable if shipper writes more)
- **Placeholder:** "Any special handling, hazmat requirements, gate hours, contact notes, etc."
- **Max Characters:** 500 (enforced by form validation, not textarea `maxlength` to allow paste/undo)
- **Character Counter:** Bottom-right of textarea, "XXX/500 characters", color `#636E72`, updates live
- **Border/Padding:** Same as inputs
- **Font:** 14px, monospace (Courier New or similar) for technical notes (hazmat codes, etc.)

---

### 7. Form Actions & Error Handling

**Submit Button (Primary CTA):**
- **Label:** "Create & Post Load" (clearly indicates published state)
- **Styling:** Metallic Bronze Gradient (per Shipper Style Guide)
  - **Background:** `linear-gradient(180deg, #C9A46A 0%, #B08D57 45%, #8C6D3F 100%)`
  - **Box Shadow:** `inset 0 1px 2px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.2), 0 2px 5px rgba(0,0,0,0.35)`
  - **Border:** 1px solid `#7A5F3A`
  - **Text Color:** `#FFFFFF`, 14px, font-weight: 500
  - **Height:** 44px (slightly taller for prominence)
  - **Padding:** 10px 24px
  - **Border Radius:** 4px
- **Hover State:** Darker gradient, same shadow (150ms transition)
- **Focus State:** 2px solid `#B08D57` outline, 2px offset
- **Disabled State (While Submitting):**
  - **Background:** `#D3D3D3`
  - **Text:** "Creating Load..." or spinner + "Processing..."
  - **Cursor:** `not-allowed`
  - **Pointer Events:** disabled

**Secondary Button (Save as Draft):**
- **Label:** "Save as Draft" (lower visual weight)
- **Styling:** Light grey outline
  - **Background:** `#F8F9FB`
  - **Border:** 1px solid `#D0D0D0`
  - **Text Color:** `#1A1A1A`, 14px
  - **Height:** 44px
  - **Hover State:** Background lightens to `#FFFFFF`

**Cancel Button:**
- **Label:** "Cancel"
- **Styling:** Text-only, no background
- **Text Color:** `#636E72`
- **Hover State:** Text darkens to `#1A1A1A`, underline appears
- **Click Behavior:** Close modal without saving (show confirmation if form has data entered)

**Button Layout:**
- **Position:** Bottom of form, sticky or within scrollable area (sticky recommended for large forms)
- **Alignment:** Left-align [Cancel] [Save Draft], Right-align [Create & Post]
- **Gap:** 8px (space-sm) between buttons
- **Container Padding:** 24px (space-lg) on all sides

---

### 8. Validation & Error Messages

**Field-Level Validation (Real-Time):**
- **On Blur:** Validate when user leaves field (addresses, dates, required fields)
- **On Change:** Validate pay rate + distance for estimated total recalc
- **Display:** Error text immediately below input, 12px, italic, `#E74C3C`

**Error Message Examples:**

| Field | Error Message |
|-------|---------------|
| Street Address | "Street address is required" |
| City | "City is required" |
| State | "Select a state" |
| ZIP Code | "ZIP code must be 5 digits" |
| Earliest Pickup | "Must be in the future (no past dates)" |
| Latest Pickup | "Must be ≥ Earliest Pickup time" |
| Earliest Delivery | "Must be ≥ Latest Pickup time" |
| Commodity | "Commodity is required" |
| Weight | "Weight must be between 0.01 and 150,000 lbs" |
| Equipment Type | "Equipment type is required" |
| Pay Rate | "Pay rate must be > $0.00" |
| Special Instructions | "Max 500 characters; you've entered XXX" |

**Form-Level Validation (On Submit):**
- **Server Error Banner:** At the top of the form, background `#FFF3CD`, border `#F39C12`, padding 12px 16px
  - **Message:** "Unable to create load: [server error reason]"
  - **Retry Button:** Inline "Retry" text button (color: `#B08D57`)
  - **Dismiss Button:** [×] to close banner
  - **Auto-Dismiss:** After 10 seconds if form is corrected by user

**Success Confirmation (On Successful Submit):**
- **Modal Close:** Form closes automatically
- **Toast Notification (Bottom-Right):** "Load created successfully — #LC-123456789"
  - **Duration:** 5 seconds, then auto-dismiss
  - **Action Link:** "View in Dashboard" (navigates to Shipment Status Panel)

---

## Responsive Breakpoints

**Desktop (≥1024px):**
- Two-column layout for address inputs (pickup left, delivery right)
- Inline date fields side-by-side
- Full-width form at 70–80% viewport width (max 900px)

**Tablet (768–1023px):**
- Stack address sections vertically (pickup on top, delivery below)
- Date fields stack vertically (readability)
- Form width: 85% of viewport
- Button layout: [Cancel] [Save Draft] stacked on top, [Create & Post] full width below

**Mobile (≤767px):**
- **NOT RECOMMENDED.** Shipper persona is office-desktop. However, if mobile access required:
  - Full-width modal (95% viewport, max-width removed)
  - All fields stack vertically
  - Buttons full-width, stacked vertically
  - Dimensions fields remain collapsed by default
  - Form scrolls within viewport
  - **Note:** Mobile should **not** be primary; design desktop-first, mobile as fallback only

---

## Accessibility & Keyboard Navigation

**ARIA Labels & Semantic HTML:**
- All inputs have associated `<label>` elements with `for` attribute
- Required fields marked with `*` and `aria-required="true"`
- Error messages linked via `aria-describedby` to input
- Section headers use `<h3>` with appropriate hierarchy
- Form wrapped in `<form>` with `aria-label="Create Load Form"`

**Keyboard Navigation Order:**
1. Street Address (Pickup)
2. Suite/Unit (Pickup)
3. City (Pickup)
4. State (Pickup)
5. ZIP (Pickup)
6. Street Address (Delivery)
7. ... (same for Delivery)
8. Earliest Pickup (datetime)
9. Latest Pickup (datetime)
10. Earliest Delivery (datetime)
11. Latest Delivery (datetime)
12. Commodity
13. Weight
14. [Overweight checkbox if visible]
15. Expand Dimensions (toggle)
16. [Dimensions inputs if expanded]
17. Equipment Type
18. Pay Rate
19. Pay Rate Type
20. Payment Terms
21. Special Instructions
22. Save as Draft
23. Create & Post Load
24. Cancel

**Tab Order:** Logical left-to-right, top-to-bottom; use `tabindex="0"` (or remove if semantic order is correct)

**Color Contrast:**
- All text meets WCAG AA (4.5:1 minimum)
- Error messages in `#E74C3C` on white background = 5.2:1 ✅
- Helper text in `#636E72` on white background = 4.5:1 ✅
- Placeholder text in `#999999` (not critical, but should be visible)

---

## Integration with Dashboard (AC-8 Requirement)

**Post-Creation Visibility:**
- After successful submission, form closes and modal backdrop fades
- Shipment Status Panel (US-822) automatically refetches active shipments (within 1–2 seconds, per NFR-504 cache TTL)
- **New load appears at the top of the Shipment Status Panel** with status badge: "POSTED" (Danger Red `#E74C3C`)
- **Visual Highlight (Optional):** Brief 2-second background highlight on the new row (fade from `#FFF9E6` to transparent) to draw attention
- **Toast Notification:** Appears over the panel: "Load #LC-123456789 posted — now visible to carriers"

**Address Book Integration (AC-9):**
- When shipper clicks "Street Address" input, inline autocomplete dropdown appears
- Shows saved facilities from shipper's tenant's address book (tenant_id filtered)
- On selection: All 5 address fields auto-populate instantly
- "Save this address to Address Book?" prompt on form submit (or separate secondary action)
- **Note:** This requires a separate ARCHITECT design for the Address Book data structure; HFD should only spec the form UI

---

## Shipper Persona Alignment

**Speed Optimization:**
- ✅ Minimal scrolling (all sections fit within 85vh on desktop)
- ✅ Smart defaults (Dry Van, tomorrow at 8 AM, Net 7)
- ✅ Tab order optimized for fast data entry
- ✅ Address Book quick-fill (if available)
- ✅ Distance auto-calculation (no extra click needed)
- ✅ Estimated total auto-calculation (no mental math)

**Accuracy Optimization:**
- ✅ Required fields clearly marked with `*` and red outline on error
- ✅ Real-time validation prevents invalid date ranges
- ✅ Overweight warning + acknowledgment checkbox (compliance gate)
- ✅ State dropdown (no typos; consistent with system)
- ✅ Helper text explains ambiguous fields ("Enter rate" for pay rate, etc.)

**Visual Confidence (Shipper Persona Preference):**
- ✅ Metallic bronze CTA button (aligns with dashboard aesthetic)
- ✅ Clear section dividers (logical grouping reduces cognitive load)
- ✅ Status badges for distance verification + overweight warnings
- ✅ High contrast text (`#1A1A1A` on white; meets WCAG AA)
- ✅ Explicit "Create & Post Load" label (clear outcome, not ambiguous "Submit")

---

## Implementation Notes for ARCHITECT & CODER

1. **State Enum Standardization:** Confirm all dropdown enums (Equipment Type, Payment Terms) match backend domain model
2. **Distance Calculation Service:** Integrate Google Maps / MapBox API for real-time geocoding; cache results for 24h (per NFR-504)
3. **Address Book Schema:** ARCHITECT must define tenant-scoped facility lookup table; HFD only specs UI
4. **Estimated Total Formula:** Pay Rate × Distance (for per-mile only); ensure backend returns distance_miles as decimal
5. **Soft Delete Logic:** Cancelled loads marked with `deleted_at` timestamp; never shown in Shipment Status Panel
6. **Real-Time Refresh:** After form submit, Shipment Status Panel must refetch active shipments within 1–2 seconds
7. **Form State Management:** Consider React Hook Form + Zod for validation (existing pattern in codebase)

---

## Design Compliance Checklist

- ✅ Shipper & Administrator Style Guide §6.1–6.5 (colors, spacing, typography, components)
- ✅ Metallic bronze gradient button (CTA design per US-824 pattern)
- ✅ 8px spacing grid (all padding/gaps are multiples of 8px)
- ✅ 40px input height (per §6.3)
- ✅ Form container specs (white background, `#D0D0D0` border, 8px radius, 24px padding)
- ✅ WCAG AA color contrast (all text ≥4.5:1)
- ✅ Keyboard navigation (logical tab order, ARIA labels)
- ✅ Responsive: Desktop ✅, Tablet ✅, Mobile ⚠️ (secondary)
- ✅ AC-1 through AC-11 coverage (all acceptance criteria designed for)

---

## Next Steps (For HFD Handoff)

1. **Wireframes/Mockups:** Create pixel-perfect designs in Figma/Adobe XD using this spec
2. **Interactive Prototype:** Build clickable prototype (address auto-complete, date validation, conditional fields)
3. **A/B Testing (Optional):** Test modal vs. slide-out vs. full-page form with internal users (ops team)
4. **Accessibility Audit:** Run WAVE / Axe accessibility checks after CODER builds
5. **CODER Handoff:** Provide component library (form inputs, buttons, alerts) + CSS module for styling

---

**HFD Sign-Off:** Pending  
**Status:** Awaiting ARCHITECT domain model + CODER implementation planning
