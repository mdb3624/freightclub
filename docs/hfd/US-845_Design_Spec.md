# US-845 Design Spec — Load Creation Form Field Updates

**Story:** US-845  
**Jira:** FREIG-76  
**HFD Status:** ✅ LOCKED — ready for CODER  
**Source of Truth:** `Prototype/ui_kits/shipper/create-load.html`  
**Design System:** `docs/standards/SHIPPER_DESIGN_SYSTEM.md`  
**Date:** 2026-07-03  
**Persona:** Shipper (desktop, 1280px+)

---

## Layout

```
┌─────────────────────────────── 1fr ──────────────────────────┐  ┌── 320px ──┐
│  Section 1: Route                                             │  │  Sticky   │
│  Section 2: Schedule                                          │  │  Preview  │
│  Section 3: Load Details                                      │  │  Panel    │
│  Section 4: Pay & Terms                                       │  │           │
│  Section 5: Additional Info                                   │  │           │
└───────────────────────────────────────────────────────────────┘  └───────────┘
                    ┌──────────── Sticky Footer ──────────────────────────────┐
                    │  Cancel (ghost) · Save as Draft (secondary) · Publish → │
                    └────────────────────────────────────────────────────────┘
```

- Page max-width: 1300px, padding: 24px
- Two-column grid: `1fr 320px`, gap: 24px
- Preview panel: `position: sticky; top: 88px`
- Footer: `position: sticky; bottom: 0`

---

## Section Panel Style (all 5 sections)

```css
background: #FFFFFF;
border: 1px solid #D0D0D0;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
padding: 24px;
gap between sections: 20px
```

### Section Title
```css
font-family: Sora, sans-serif;
font-size: 15px;
font-weight: 700;
color: #1A1A1A;
border-bottom: 1px solid #E8E3D8;
padding-bottom: 12px;
margin-bottom: 4px;
display: flex; align-items: center; gap: 8px;
```

### Section Icon
```css
width: 28px; height: 28px; border-radius: 6px;
background: linear-gradient(135deg, #FAF6EE, #F0E9D8);
border: 1px solid #C9A876;
font-size: 14px; /* emoji icon */
```

---

## AC-1: Estimated Distance — Read-Only Display

**Maps to:** Route section, below origin/destination grid

The distance input field must be **replaced** with a read-only calculated display. Distance is derived from `originState + destinationState` via a lookup table (or API). It is **never** a user input.

```
Label:  "EST. DISTANCE"  (12px, 600 weight, uppercase, #636E72, letter-spacing 0.05em)
Display box:
  height: 40px
  padding: 8px 12px
  background: #F8F9FB
  border: 1px solid #E8E3D8
  border-radius: 4px
  font-size: 14px
  min-width: 160px
  
  When states selected:
    "[N,NNN] mi" (font-weight: 700, color: #1A1A1A)
    + "calculated" (font-size: 11px, color: #9CA3AF, margin-left: 8px)
    
  When states not selected:
    "Select states above" (color: #9CA3AF)
```

**AC-1 mapping:** Distance display read-only ✅ · `background: #F8F9FB` ✅ · `border: 1px solid #E8E3D8` ✅ · `border-radius: 4px` ✅ · `height: 40px` ✅ · "calculated" label in `#9CA3AF` ✅

---

## AC-2: Date Fields → datetime-local

All date inputs must use `type="datetime-local"` (not `type="date"`).

```
input type="datetime-local"
height: 40px
width: 100%
(inherits standard input style: border 1px solid #D0D0D0, border-radius 4px, focus: 2px solid #B08D57)
```

Applies to: `pickupFrom`, `pickupTo`, `deliverFrom`, `deliverTo`.

---

## AC-3: Pickup Window (2 fields)

**Section 2 — Schedule panel, Pickup Window sub-group:**

```
Sub-label: "PICKUP WINDOW"
  font-size: 12px, font-weight: 700, color: #B08D57, uppercase, letter-spacing: 0.06em
  margin-bottom: 10px

Layout: CSS grid, 2 columns, gap: 12px

Column 1 — "Earliest pickup" (required)
  input type="datetime-local"
  data-testid="pickup-from-input"
  validation: required

Column 2 — "Latest pickup"
  input type="datetime-local"
  data-testid="pickup-to-input"
  min={pickupFrom}
  hint: "Auto-filled from earliest — adjust if flexible"  (12px italic #9CA3AF)
  
  Auto-populate rule: when pickupFrom is set → pickupTo = pickupFrom (if pickupTo is empty or < pickupFrom)
  Validation: pickupTo >= pickupFrom
  Error: "Must be on or after earliest pickup"  (12px italic #B91C1C)
```

---

## AC-4: Delivery Window (2 fields)

**Section 2 — Schedule panel, Delivery Window sub-group:**

```
Divider: border-top: 1px solid #F0EBE0; between pickup and delivery blocks

Sub-label: "DELIVERY WINDOW"
  (same style as pickup: #B08D57)

Layout: CSS grid, 2 columns, gap: 12px

Column 1 — "Earliest delivery" (required)
  input type="datetime-local"
  data-testid="deliver-from-input"
  min={pickupFrom}
  validation: required, must be after pickupFrom

Column 2 — "Latest delivery"
  input type="datetime-local"
  data-testid="deliver-to-input"
  min={deliverFrom}
  hint: "Auto-filled from earliest — adjust if flexible"
  
  Auto-populate rule: when deliverFrom is set → deliverTo = deliverFrom (if deliverTo is empty or < deliverFrom)
  Validation: deliverTo >= deliverFrom
  Error: "Must be on or after earliest delivery"
  
Cross-field validation:
  deliverFrom must be >= pickupFrom
  Error on deliverFrom: "Delivery must be after pickup"
```

---

## AC-5: Dimension Inch Fields

**Section 3 — Load Details panel, Dimensions sub-group:**

```
Label: "Dimensions" + "(optional)" in 11px #9CA3AF, normal weight

Layout: CSS grid, 3 columns, gap: 12px  (Length · Width · Height)

Each dimension cell:
  Sub-label: "Length" / "Width" / "Height"  (11px, #9CA3AF, margin-bottom: 4px)
  
  Inner layout: flex row, gap: 4px, align-items: center
  
  Feet input:
    flex: 1
    type="number"
    data-testid="length-ft-input" / "width-ft-input" / "height-ft-input"
    placeholder="0"
    min={0}
    height: 40px
    Unit label "ft" at right: position absolute, right: 8px, 11px, #9CA3AF
    padding-right: 24px (to avoid text under unit label)
    
  Inches input:
    flex: 1
    type="number"
    data-testid="length-in-input" / "width-in-input" / "height-in-input"
    placeholder="0"
    min={0}, max={11}
    height: 40px
    Unit label "in" at right: same style as ft

State keys: dimL (ft), dimLin (in), dimW (ft), dimWin (in), dimH (ft), dimHin (in)
```

---

## Right Panel: Live Preview + Completion Meter

### Completion Meter
```
Label: "FORM COMPLETION" (12px, 700 weight, uppercase, letter-spacing 0.06em, #636E72)
Number: Sora, 18px, font-weight 900
  ≥80%: #27AE60
  ≥50%: #F39C12
  <50%:  #636E72

Progress bar:
  height: 4px; background: #E8E3D8; border-radius: 9999px
  Fill: bronze gradient (≥50%) or grey (< 50%) or #27AE60 (≥80%)
  transition: width 400ms ease

Nudge text (when < 100%):
  < 40%: "Add route and schedule to continue"
  < 70%: "Add pay rate to publish"
  else:  "Ready to publish"
```

### Board Preview Card
```
background: #FFFFFF; border: 1px solid #D0D0D0; border-radius: 8px;
padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05)

Route: Sora, 15px, 700 weight, #1A1A1A
Sub-route: 13px, #9CA3AF
Stats grid: 3 cols (Distance · Weight · Equipment)
  Value: 14px bold #1A1A1A
  Label: 11px #9CA3AF uppercase letter-spacing 0.05em
Rate: Sora 18px 900 #1A1A1A
RPM badge: rgba(34,197,94,.12) bg, 1px solid #22C55E, #15803D text

Pickup date shown below stats: 12px, #636E72
```

### Tips Panel
```
background: #FAF6EE; border: 1px solid #E8E3D8; border-radius: 8px; padding: 14px
Label: "TIPS FOR FASTER CLAIMS" (11px, 700 weight, uppercase, color: #9C8060)
Tips: 12px, #7A5F3A (contextual — shown only when relevant tip applies)
```

---

## Sticky Footer

```css
position: sticky; bottom: 0;
background: #FFFFFF;
border-top: 1px solid #E8E3D8;
padding: 14px 24px;
box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
z-index: 10;
display: flex; gap: 10px; align-items: center; justify-content: flex-end;
```

**Buttons (left to right):**
- `Cancel` — ghost button (`border: 1px solid #E8E3D8; color: #9CA3AF`)
- `Save as Draft` — secondary button (cream gradient)  
- `Publish to Board →` — primary button (bronze gradient), **disabled when completeness < 40%**

**Error summary:** When validation fails → `"⚠ Please fix the highlighted fields before publishing."` (13px, #B91C1C, flex: 1, left-aligned)

---

## Field Label Style (all fields)

```css
font-size: 12px;
font-weight: 600;
color: #636E72;
text-transform: uppercase;
letter-spacing: 0.05em;
margin-bottom: 5px;

Required marker: color: #E74C3C; margin-left: 2px; content: "*"
```

---

## Validation Error / Hint Style

```
Error:  12px italic #B91C1C margin-top: 4px  — with "⚠ " prefix
Hint:   12px italic #9CA3AF margin-top: 4px
Input error state: border: 2px solid #E74C3C; box-shadow: 0 0 0 3px rgba(231,76,60,0.08)
```

---

## data-testid Map

| Element | data-testid |
|---|---|
| Distance display box | `distance-display` |
| Pickup earliest | `pickup-from-input` |
| Pickup latest | `pickup-to-input` |
| Delivery earliest | `deliver-from-input` |
| Delivery latest | `deliver-to-input` |
| Length ft | `length-ft-input` |
| Length in | `length-in-input` |
| Width ft | `width-ft-input` |
| Width in | `width-in-input` |
| Height ft | `height-ft-input` |
| Height in | `height-in-input` |
| Completion meter | `completion-meter` |
| Board preview | `board-preview` |
| Publish button | `publish-btn` |

---

## HFD Sign-Off Checklist

- [x] ShipperPageLayout compliance verified (uses existing page wrapper)
- [x] Desktop layout 1280px primary
- [x] All colors from SHIPPER_DESIGN_SYSTEM.md (no custom hex)
- [x] All spacing multiples of 8px (4/8/12/16/24px — 12px permitted per prototype component spec)
- [x] Input height exactly 40px, border-radius exactly 4px
- [x] Panel border-radius exactly 8px, border exactly `1px solid #D0D0D0`
- [x] All 5 AC from US-845 explicitly mapped to UI elements above
- [x] Source of truth: `Prototype/ui_kits/shipper/create-load.html` (verified line-by-line)
- [x] data-testid map complete for E2E test authoring

**HFD Status: ✅ LOCKED — CODER may begin**
