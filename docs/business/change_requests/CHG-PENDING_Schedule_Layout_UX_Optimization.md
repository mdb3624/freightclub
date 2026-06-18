# CHG-###: Schedule Layout UX Optimization (Date/Time Field Density)

**Status:** ✅ APPROVED (LIBRARIAN Decision: Option B)  
**Date Created:** 2026-06-17  
**Date Approved:** 2026-06-17  
**Severity:** MEDIUM (UX improvement, not blocking)  
**Impact Scope:** HFD Design Documentation (US-103-v2 §4), Frontend Implementation

---

## Escalation Summary

**Raised By:** CODER  
**For:** LIBRARIAN Review  
**Context:** US-103-v2 Load Creation Redesign (HFD spec locked 2026-06-17)

**Issue:** Schedule section uses 4 full-width `<input type="datetime-local">` fields, consuming 160px+ vertical space on desktop. HFD proposes split date/time layout for better space efficiency and Shipper Persona UX.

---

## Root Cause Analysis

**Current Design (HFD Spec §4, Line 449):**
```
PICKUP WINDOW                      DELIVERY WINDOW
─────────────────────────────────────────────────────────
Earliest Pickup (Date & Time) *    Earliest Delivery (Date & Time) *
[2026-06-18 at 08:00 ▼]           [2026-06-18 at 16:00 ▼]

Latest Pickup (Date & Time) *      Latest Delivery (Date & Time) *
[2026-06-18 at 14:00 ▼]           [2026-06-19 at 18:00 ▼]
```

**Technical Issue:**
- 4 inputs × 40px height = 160px vertical space (excluding labels, gaps)
- Each datetime-local input width: ~280–320px (wide, contains both date and time)
- Results in unnecessary vertical scrolling on desktop (Shipper Persona works on monitors with ample horizontal space)
- Form feels dense, reduces scanability for operations managers creating loads in batches

**UX Impact (Shipper Persona):**
- Operations manager (office-based, desktop-first) needs to create loads quickly and accurately
- Current layout: scroll fatigue + reduced ability to scan form at a glance
- Batching behavior: users want to create multiple loads rapidly; compact form = faster entry

---

## Proposed Solution (HFD Recommendation)

**Split Date/Time Fields** — Use separate `<input type="date">` + `<input type="time">` instead of datetime-local

**New Layout (Desktop):**
```
PICKUP WINDOW                                          DELIVERY WINDOW
─────────────────────────────────────────────────────────────────────────
Earliest Pickup                                        Earliest Delivery
[Date ▼]           [Time ▼]                           [Date ▼]           [Time ▼]

Latest Pickup                                         Latest Delivery
[Date ▼]           [Time ▼]                           [Date ▼]           [Time ▼]
```

**Space Savings:**
- Date field: ~140px (compact date picker)
- Time field: ~100px (time spinner: HH:MM)
- Total: 240px per pair (vs. 280–320px for datetime-local)
- **Vertical space reduction: ~50% (from 160px to ~80px for the section)**
- **Benefit:** Reduces form scrolling; improves scanability

**Grid Implementation:**
- Desktop (≥1024px): 4-column layout `grid-cols-4 gap-4`
- Tablet (768–1023px): 2×2 (Date/Time pairs side-by-side per window)
- Mobile (≤767px): Full-width stack (vertical)

**Validation Rules:**
- ✅ Unchanged — same cross-field validation rules apply
- Date/Time combined on form submission (create ISO 8601 datetime string)
- Backend receives same `LoadFormValues` structure

---

## Affected Documentation

| Document | Section | Change |
|----------|---------|--------|
| US-103-v2 HFD Design Spec | §4 (Pickup & Delivery Windows) | Update input type, layout diagrams, grid structure, accessibility |
| Shipper & Administrator Style Guide | §6.3 (Form Inputs) | Add subsection for date/time field grouping |

---

## Options for LIBRARIAN Decision

### Option A: Keep Current Spec (datetime-local)
**Rationale:**
- HFD design already locked; minimizes rework
- datetime-local is familiar, single-input paradigm

**Cost:**
- Suboptimal UX for Shipper Persona (scroll friction, density)
- Can revisit in Phase 12 as enhancement

**Timeline:** CODER implements immediately (no delay)

---

### Option B: Revise HFD Spec (split date/time) ⭐ **HFD Recommended**
**Rationale:**
- Better match for Shipper Persona (desktop-first, high-volume)
- Same validation rules; no functional impact
- Improves form scanability and reduces scroll
- Still complies with Shipper Style Guide (40px input height, 4px radius, focus state)

**Cost:**
- HFD re-works §4 of design spec (~15 mins)
- CODER re-implements frontend form (~2 hours)
- **Total delay: ~3–4 hours**

**Timeline:**
1. LIBRARIAN approves Option B
2. HFD revises HFD Spec §4 + updates Style Guide subsection (~15 mins)
3. CODER implements split date/time layout (~2 hours)
4. Testing + verification (~1 hour)

---

## CODER Implementation Details (If Option B Approved)

**Frontend Changes:**
```jsx
// Current (datetime-local)
<Input type="datetime-local" label="Earliest Pickup (Date & Time)" />

// Proposed (split)
<div className="grid grid-cols-4 gap-4">
  <Input type="date" label="Earliest Pickup Date" />
  <Input type="time" label="Earliest Pickup Time" />
  <Input type="date" label="Earliest Delivery Date" />
  <Input type="time" label="Earliest Delivery Time" />
</div>
```

**Zod Schema Update:**
```typescript
// Split into date + time fields
pickupFromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
pickupFromTime: z.string().regex(/^\d{2}:\d{2}$/)
// ... etc for Latest, Delivery

// Combine on submit
const pickupFrom = `${pickupFromDate}T${pickupFromTime}:00`
```

**Validation:**
- Date: YYYY-MM-DD (ISO 8601)
- Time: HH:MM (24-hour)
- Cross-field rules unchanged (Latest ≥ Earliest, etc.)

**Accessibility:**
- Keep semantic grouping via `<fieldset>` for screen readers
- ARIA labels still group date/time as logical unit

---

## HFD Assessment

**Design Quality:** ✅ Split date/time layout is **sound UX for target persona**
- Improves information scannability
- Reduces cognitive load (separate concerns: date vs. time)
- Aligns with desktop-first environment
- No loss of functionality or validation

**Risk Level:** 🟢 **LOW**
- Validation logic unchanged
- Accessibility maintained
- Style Guide compliance preserved
- Backward compatible (backend sees same datetime format)

---

## Recommendation

**HFD Position:** ⭐ **Option B (Revise Spec) is Preferred**

**Rationale:**
1. UX improvement is measurable (50% space reduction, better scanability)
2. Shipper Persona match is stronger (operations manager, desktop-first, batch workflows)
3. Cost is minimal (~3–4 hour delay)
4. Risk is low (validation rules stable, no functional change)
5. Sets precedent for responsive HFD iteration (discover issue → optimize → validate)

**If LIBRARIAN Chooses Option A:** Document as deferred enhancement (Phase 12 candidate)

---

## LIBRARIAN Decision

✅ **Option B Approved** (2026-06-17)

**Rationale:** UX improvement justified by space efficiency, Shipper Persona alignment, minimal risk.

---

## Implementation Status

**☑ Step 1: HFD Revises HFD Spec §4 + Updates Style Guide**
- **Status:** ✅ COMPLETE (2026-06-17)
- **Changes:**
  - Section 4 updated: Split date/time inputs documented
  - Desktop layout: 4-column grid (140px date + 100px time per pair)
  - Tablet layout: 2×2 grid (responsive)
  - Mobile layout: Full-width stack
  - Validation rules: Unchanged (cross-field rules preserved)
  - Accessibility: Semantic grouping maintained

**☐ Step 2: CODER Implements Split Date/Time Fields**
- **Status:** 🔄 PENDING (Ready for implementation)
- **Expected Duration:** ~2 hours
- **Changes:**
  - Update LoadForm.tsx: Replace 4 datetime-local with 8 date/time inputs
  - Update Zod schema: Split pickupFrom/deliveryFrom into date + time fields
  - Update form submission: Combine date + time on POST
  - Update validation: Cross-field validation rules preserved

**☐ Step 3: Testing + Verification**
- **Status:** 🔄 PENDING
- **Checklist:**
  - [ ] Date/time inputs render correctly (desktop, tablet, mobile)
  - [ ] Date picker UI works natively
  - [ ] Time picker UI works natively
  - [ ] Cross-field validation (Latest ≥ Earliest) works
  - [ ] Distance calculation triggers after delivery date/time filled
  - [ ] Form submission combines date + time correctly
  - [ ] Accessibility (ARIA labels, screen reader) works
  - [ ] Keyboard navigation works (Tab through date/time pairs)
  - [ ] Pre-test protocol passes (clean Docker, build, test)

**☐ Step 4: Merge to Main**
- **Status:** 🔄 PENDING
- **Approval Gate:** REVIEWER audit (per reviewer-checklist.md)

---

## Sign-Off

**HFD Authority:** Ready to revise documentation if Option B approved  
**CODER Ready:** Ready to implement either option  
**Awaiting:** LIBRARIAN Decision  

**Questions?** Escalate to LIBRARIAN or HFD for clarification.

---

**Created:** 2026-06-17 (Session: Load Creation Redesign Implementation)  
**Authority:** Sequential Lock Protocol + CHG Protocol (CLAUDE.md)
