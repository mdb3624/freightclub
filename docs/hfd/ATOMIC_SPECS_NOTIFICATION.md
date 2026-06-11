# NOTIFICATION: Atomic Component Specifications Enforced

**Date:** 2026-06-10  
**To:** Human Factors Designer Role  
**Authority:** LIBRARIAN (Governance Update)  
**Status:** MANDATORY COMPLIANCE REQUIRED

---

## What Changed

The Shipper & Administrator Style Guide.md has been upgraded to Version 2.0 with a new mandatory section:

**Section 6: Atomic Component Specifications**

This section specifies the EXACT values for:
- Semantic color system (status colors with hex values)
- Data table specs (row height: 48px, cell padding: 12px × 16px, fonts: 12px headers, 14px data)
- Form input controls (border-radius: 4px, focus border: 2px solid #B08D57, input height: 40px)
- Spacing tokens (8px rule: all spacing must be multiples of 8px)

---

## Critical Constraint

**HFD is PROHIBITED from:**
- ❌ Estimating or approximating component values
- ❌ Using "visual estimation" for padding, margins, or row heights
- ❌ Defining custom spacing values that are NOT multiples of 8px
- ❌ Creating custom color values instead of using the semantic palette

**HFD MUST:**
- ✅ Extract all component values directly from Section 6
- ✅ Cite the section and line number when specifying dimensions
- ✅ Use only the 8px multiples for spacing (4px, 8px, 16px, 24px, 32px)
- ✅ Use only the semantic colors from §6.1 for status/alerts
- ✅ Use exactly 48px row heights, 12px×16px cell padding, 40px input heights

---

## System of Record (Lock-In)

These values are now the **System of Record**. They are:
- ✅ Non-negotiable (no custom variants)
- ✅ Testable (can be verified pixel-by-pixel against specs)
- ✅ Enforceable (REVIEWER will reject deviations without exception approval)

---

## Implementation

### When Creating/Updating Design Specs

**You MUST include this reference in every spec:**

```markdown
## Component Specifications (Atomic)

**Source:** Shipper & Administrator Style Guide.md §6

**KPI Card Row Height:** 48px (§6.2 Data Table Specs)
**Card Padding:** 12px (vertical) × 16px (horizontal) (§6.2)
**Header Font:** 12px Bold Uppercase #636E72 (§6.2)
**Data Font:** 14px Regular #1A1A1A (§6.2)
**Status Colors:** Emerald Green #27AE60, Safety Amber #F39C12, Danger Red #E74C3C (§6.1)
**Spacing Between Components:** 16px (space-md, §6.4)
```

### When Creating/Updating CSS

**You MUST cite the spec in every rule:**

```css
/* From Shipper & Administrator Style Guide.md §6.4 Spacing Tokens */
.component { gap: var(--space-md); /* 16px */ }

/* From §6.2 Data Table Specs */
.table-row { height: 48px; }
.table-cell { padding: 12px 16px; }

/* From §6.3 Form Input Controls */
input { border-radius: 4px; border: 1px solid #D0D0D0; height: 40px; }
input:focus { border: 2px solid #B08D57; }

/* From §6.1 Semantic Colors */
.status-success { color: #27AE60; } /* Emerald Green */
```

---

## Deviation Exception Process

If you believe a component value in §6 cannot be used (e.g., "48px row height is too tall for our data"):

1. **DO NOT:** Create a custom value
2. **DO:** Document the issue in VISUAL_DEBT_LOG.md (Priority: P1 or P0)
3. **DO:** Request exception approval from ARCHITECT
4. **DO:** Block READY_FOR_CODER until exception is approved
5. **DO:** Include exception note in design spec

**Example:**
```markdown
## Exception Request: Row Height

**Issue:** Data table requires 36px rows (not 48px) for dense dataset display

**Specification Conflict:** §6.2 specifies 48px row height (standard)

**Justification:** 500+ row tables become unscrollable at 48px; 36px is touch-friendly at 44px touch target

**Approval:** [ARCHITECT SIGN-OFF REQUIRED]

**Status:** [BLOCKED] — awaiting exception approval
```

---

## Automatic Rejection Criteria

The REVIEWER will REJECT any design spec or code that violates §6 values WITHOUT exception approval:

| Violation | Rejection |
|---|---|
| Row height ≠ 48px | REJECT (unless approved exception) |
| Padding/margin NOT a multiple of 8px | REJECT |
| Border-radius ≠ 4px on inputs | REJECT (unless approved exception) |
| Status color using non-§6.1 hex | REJECT |
| Helper text ≠ 12px | REJECT |
| Focus border ≠ 2px solid #B08D57 | REJECT |
| Form input height ≠ 40px | REJECT (unless approved exception) |

---

## What This Means For Your Work

### Before (Pre-§6 Era)
```
"Create a card with comfortable padding"
→ HFD estimates: 20px padding
→ Looks different from other cards (which used 16px, 18px, 24px)
→ Visual drift accumulates
→ REVIEWER rejects for inconsistency
```

### After (§6 Era)
```
"Create a card with comfortable padding"
→ HFD references §6.4 Spacing Tokens
→ Uses: 16px space-md (default component gap)
→ Every card uses 16px (consistent)
→ REVIEWER approves (matches spec)
```

---

## Questions?

If you have questions about §6 values or cannot apply them to your component:

1. **Read §6 again** (often the answer is explicit)
2. **Check VISUAL_DEBT_LOG.md** (your issue may already be logged)
3. **Request exception** (don't guess or estimate)
4. **Escalate to ARCHITECT** (if exception seems necessary)

**DO NOT:** Create custom values to "approximate" or "guess" what the spec might mean.

---

## Acknowledgment

**By proceeding to design work after this notification, you acknowledge:**

- ✅ I have read Shipper & Administrator Style Guide.md §6 in full
- ✅ I understand that all component values in §6 are mandatory
- ✅ I will cite §6 in every design spec and code submission
- ✅ I will not create custom values without exception approval
- ✅ I understand that deviations without approval will be rejected

---

**Effective Date:** 2026-06-10  
**Status:** MANDATORY COMPLIANCE  
**Next Design Spec Due:** Must reference §6 values

