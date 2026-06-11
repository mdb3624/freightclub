# Code Review: Three-Gate Test Rubric

**Authority:** REVIEWER Role  
**Date:** 2026-06-10  
**Purpose:** Rapid assessment of dashboard code compliance  
**Status:** ✅ **MANDATORY FOR ALL SUBMISSIONS**

---

## Overview

This rubric applies the **Three-Gate Test** to evaluate code submissions. If code fails ANY of the three gates, it is **automatically REJECTED** and returned for refactoring.

**No partial credit. No exceptions. No workarounds.**

---

## Gate 1: Container Gate ✅

### Question
**Does the code contain `fc-shell`, `panel`, and `widget-grid` classes?**

### Passing Criteria (PASS)
- ✅ All widgets are nested inside a `.panel` container
- ✅ Panels are positioned inside a `.slot-a`, `.slot-b`, or `.slot-c` (Shell slots)
- ✅ Multiple widgets use `.widget-grid` for layout
- ✅ No floating widgets (no `<div class="widget">` without a parent `.panel`)

### Failing Criteria (FAIL)
- ❌ Widget exists without a parent `.panel` container
- ❌ Panel exists outside Shell (not in a slot)
- ❌ Multiple widgets in a container without `.widget-grid`
- ❌ Using custom divs instead of semantic `.panel`, `.widget-grid` classes

### Example: PASS ✅
```html
<!-- Correct: Widget inside widget-grid inside panel inside slot -->
<div class="zone-widget-slots">
    <div class="slot-a">
        <div class="panel">
            <div class="panel-header">
                <h2 class="panel-title">Business Health</h2>
            </div>
            
            <div class="panel-content">
                <div class="widget-grid">
                    <div class="widget">
                        <div class="widget-number">24</div>
                        <div class="widget-label">Active Loads</div>
                    </div>
                    
                    <div class="widget">
                        <div class="widget-number success">92%</div>
                        <div class="widget-label">On-Time Delivery</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### Example: FAIL ❌
```html
<!-- INCORRECT: Widgets floating without panel -->
<div class="slot-a">
    <div class="widget">
        <div class="widget-number">24</div>
        <div class="widget-label">Active Loads</div>
    </div>
    
    <div class="widget">
        <div class="widget-number">92%</div>
        <div class="widget-label">On-Time Delivery</div>
    </div>
</div>

<!-- INCORRECT: Widget inside custom div (not .panel) -->
<div class="slot-a">
    <div class="metric-container">
        <div class="widget-number">24</div>
    </div>
</div>
```

### Action on FAIL
- [ ] Mark as **REJECTED**
- [ ] Comment: "Gate 1 FAILED: Widget without panel container. See SYSTEM_BLUEPRINT.md §3 Golden Master Schema."
- [ ] Return for refactoring
- [ ] Do NOT proceed to Gates 2 or 3

---

## Gate 2: Token Gate ✅

### Question
**Do I see hardcoded hex values (e.g., `#ffffff`, `#27AE60`) anywhere?**

### Passing Criteria (PASS)
- ✅ All colors use CSS variables: `var(--color-success)`, `var(--color-warning)`, etc.
- ✅ All borders use variables: `var(--border-widget)`, `var(--border-divider)`, etc.
- ✅ All shadows use variables: `var(--shadow-subtle)`, `var(--shadow-elevated)`, etc.
- ✅ All spacing uses variables: `var(--space-sm)`, `var(--space-md)`, `var(--space-lg)`, etc.
- ✅ No inline styles with hex values
- ✅ No tag selectors with hardcoded values

### Failing Criteria (FAIL)
- ❌ Any hardcoded hex color: `#FFFFFF`, `#27AE60`, `#D0D0D0`, etc.
- ❌ Any hardcoded pixel spacing: `padding: 24px;`, `margin: 16px;`, `gap: 8px;`
- ❌ Any hardcoded shadow values: `box-shadow: 0 2px 4px rgba(0,0,0,0.05);`
- ❌ Inline styles with values: `<div style="color: #1A1A1A;">`
- ❌ CSS tag selectors: `button { color: #B08D57; }`, `div { margin: 16px; }`

### Example: PASS ✅
```css
/* Correct: Using token variables */
.panel {
    background: var(--color-surface-white);
    border: var(--border-widget);
    border-radius: var(--radius-widget);
    box-shadow: var(--shadow-subtle);
    padding: var(--space-lg);
}

.status-badge-success {
    background: rgba(39, 174, 96, 0.1);
    color: var(--color-success);
    border: 1px solid var(--color-success);
}

.kpi-number {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-heavy);
    color: var(--color-text-primary);
}

.kpi-number.success {
    color: var(--color-success);
}

.widget-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
}
```

### Example: FAIL ❌
```css
/* INCORRECT: Hardcoded hex values */
.panel {
    background: #FFFFFF;
    border: 1px solid #D0D0D0;
    padding: 24px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.status-badge-success {
    color: #27AE60;  /* ← HARDCODED HEX */
    background: #E8F5E9;  /* ← HARDCODED HEX */
}

/* INCORRECT: Tag selector with hardcoded values */
button {
    color: #FFFFFF;
    background: #B08D57;
    padding: 12px 24px;
}

/* INCORRECT: Inline style */
<div style="color: #1A1A1A; margin: 16px;">Content</div>
```

### Action on FAIL
- [ ] Mark as **REJECTED**
- [ ] Highlight all hardcoded values: Use search `#[0-9A-F]{6}` (regex for hex colors)
- [ ] Comment: "Gate 2 FAILED: Hardcoded hex values found. Use CSS token variables from SYSTEM_BLUEPRINT.md §2."
- [ ] List specific violations
- [ ] Return for refactoring
- [ ] Do NOT proceed to Gate 3

---

## Gate 3: Layout Gate ✅

### Question
**Is the layout handled by `display: grid` with `grid-template-columns`?**

### Passing Criteria (PASS)
- ✅ Main layout uses CSS Grid: `display: grid; grid-template-columns: repeat(12, 1fr);`
- ✅ Slots positioned with grid: `grid-column: 1 / -1;` or `grid-column: 1 / span 8;`
- ✅ Widget-grid uses grid for multi-widget layout
- ✅ Gaps handled with `gap` property (not margin nudging)
- ✅ Responsive breakpoints use grid column changes (not absolute positioning)

### Failing Criteria (FAIL)
- ❌ Layout using `position: absolute` to position elements
- ❌ Layout using `display: flex; flex-wrap: wrap;` for main grid
- ❌ Manual spacing via `margin` to align elements (e.g., `margin-left: 300px;` to push widget)
- ❌ `margin: 0 auto;` to center (use grid/flexbox alignment instead)
- ❌ Padding used to create gutters (use `gap` instead)
- ❌ `left`, `right`, `top`, `bottom` properties for layout positioning

### Example: PASS ✅
```css
/* Correct: Grid-based layout */
.zone-widget-slots {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--space-lg);
}

.slot-a {
    grid-column: 1 / -1;  /* Full width */
}

.slot-b {
    grid-column: 1 / span 8;  /* 8 columns */
}

.slot-c {
    grid-column: 9 / -1;  /* Last 4 columns */
}

.widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-lg);
}

@media (max-width: 1024px) {
    .slot-b {
        grid-column: 1 / -1;  /* Full width on tablet */
    }
    
    .slot-c {
        grid-column: 1 / -1;  /* Full width on tablet */
    }
}
```

### Example: FAIL ❌
```css
/* INCORRECT: Absolute positioning for layout */
.slot-a {
    position: absolute;
    top: 100px;
    left: 300px;
    width: 500px;
}

/* INCORRECT: Flexbox for main layout */
.zone-widget-slots {
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
}

/* INCORRECT: Manual margin nudging */
.widget {
    margin-left: 20px;  /* Nudging element into place */
    margin-bottom: 16px;  /* Manual spacing */
}

/* INCORRECT: Padding for gutters */
.zone-widget-slots {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 20px;  /* Wrong: use gap instead */
}

/* INCORRECT: Margin for centering */
.panel {
    margin: 0 auto;  /* Wrong: use grid alignment */
}
```

### Action on FAIL
- [ ] Mark as **REJECTED**
- [ ] Comment: "Gate 3 FAILED: Layout uses [absolute positioning / flexbox / margin nudging]. Must use CSS Grid. See SYSTEM_BLUEPRINT.md §4."
- [ ] Specify the problematic properties/approach
- [ ] Return for refactoring
- [ ] Reject the entire submission

---

## Review Process: The Three-Gate Workflow

### Step 1: Receive Submission
```
Code submitted for review
     ↓
Open HTML/CSS files
```

### Step 2: Gate 1 - Container Test
```
Check: fc-shell, panel, widget-grid classes present?
     ↓
   PASS? → Continue to Gate 2
   FAIL? → REJECT & Return (do not proceed)
```

### Step 3: Gate 2 - Token Test
```
Search for hardcoded hex colors/values?
     ↓
   PASS? → Continue to Gate 3
   FAIL? → REJECT & Return (do not proceed)
```

### Step 4: Gate 3 - Layout Test
```
Check: display: grid, grid-template-columns?
     ↓
   PASS? → APPROVE (proceed to full code review)
   FAIL? → REJECT & Return
```

### Step 5: Full Code Review (Only if all 3 gates PASS)
```
If all gates passed:
- Run full REVIEWER.md checklist
- Verify test coverage ≥80%
- Check accessibility compliance
- Sign off with PASS verdict
```

---

## Quick Reference: What to Search For

### Gate 1: Use Grep/Find
```
Search for:  class="widget"  (without parent panel)
Pattern:     <div class="widget">.*</div>  (not preceded by <div class="panel">)
Fix:         Wrap in <div class="panel">...</div>
```

### Gate 2: Use Grep/Find
```
Search for:  #[0-9A-F]{6}  (regex: any hex color)
Examples:    #FFFFFF, #27AE60, #D0D0D0
Exceptions:  rgb/rgba values in comments are OK
Fix:         Replace with var(--color-*) from SYSTEM_BLUEPRINT.md §2
```

### Gate 3: Use Grep/Find
```
Search for:  position: absolute
             display: flex
             margin-left, margin-right (for positioning)
             margin: 0 auto (centering)
Fix:         Use display: grid; grid-template-columns; grid-column
```

---

## Rejection Template (Copy-Paste)

```markdown
## 🔴 CODE REJECTED — Three-Gate Test Failed

**Submission:** [Feature Name / PR #]  
**Date:** [Today]  
**Reviewer:** [Name]

### Gate Results:
- Gate 1 (Container): ❌ FAIL
- Gate 2 (Token): [PASS/FAIL]
- Gate 3 (Layout): [PASS/FAIL]

### Reason for Rejection:
[Select which gate(s) failed and cite specific examples]

#### Gate 1 FAILED: Missing panel containers
- Line XX: `<div class="widget">` found without parent `.panel`
- Reference: SYSTEM_BLUEPRINT.md §3

#### Gate 2 FAILED: Hardcoded hex values
- Line XX: `background: #FFFFFF;` (should be `var(--color-surface-white)`)
- Line YY: `color: #27AE60;` (should be `var(--color-success)`)
- Reference: SYSTEM_BLUEPRINT.md §2

#### Gate 3 FAILED: Layout not using Grid
- Line ZZ: `position: absolute;` (must use CSS Grid)
- Line WW: `margin-left: 20px;` for positioning (use grid columns)
- Reference: SYSTEM_BLUEPRINT.md §4 Forbidden Practices

### Required Actions:
1. [ ] Refactor code to comply with all three gates
2. [ ] Resubmit for review
3. [ ] Ensure no hardcoded values or absolute positioning
4. [ ] Verify widget hierarchy (Shell > Panel > Widget)

**Do not resubmit until all three gates PASS.**

---
Rejected by REVIEWER on [Date]
```

---

## Approval Template (Copy-Paste)

```markdown
## ✅ CODE APPROVED — All Three Gates PASSED

**Submission:** [Feature Name / PR #]  
**Date:** [Today]  
**Reviewer:** [Name]

### Gate Results:
- ✅ Gate 1 (Container): PASS
- ✅ Gate 2 (Token): PASS
- ✅ Gate 3 (Layout): PASS

### Status:
Composite Framework compliance verified. Code approved for merge.

Proceeding with full code review checklist (REVIEWER.md).
```

---

## Key Rules (Absolute)

1. **Three gates are sequential.** If Gate 1 fails, you do NOT evaluate Gates 2 & 3.
2. **All three must pass.** If any single gate fails, the entire submission is rejected.
3. **No partial credit.** A submission cannot "partially" pass the Three-Gate Test.
4. **No exceptions.** These are hard gates. No workarounds, no "but in this case..." scenarios.
5. **Fast rejection.** If Gate 1 fails, rejection takes 5 seconds. Do not waste time on detailed analysis of failed code.

---

## Authority

**Rubric:** Code Review Three-Gate Test  
**Authority:** REVIEWER Role + SYSTEM_BLUEPRINT.md  
**Effective:** 2026-06-13 (enforcement begins)  
**Status:** ✅ **MANDATORY FOR ALL SUBMISSIONS**

**This rubric is the objective measure of code compliance. Use it consistently, fairly, and without exception.**

---

**Distribution:**
- ✅ REVIEWER.md team
- ✅ CODER.md team (for awareness)
- ✅ LIBRARIAN (system governance)
- ✅ All code review processes

**Reference:**
- [SYSTEM_BLUEPRINT.md](./SYSTEM_BLUEPRINT.md) (full spec)
- [SYSTEM_BLUEPRINT.md §1](./SYSTEM_BLUEPRINT.md#1-framework-philosophy) (Philosophy)
- [SYSTEM_BLUEPRINT.md §2](./SYSTEM_BLUEPRINT.md#2-token-registry) (Token Registry)
- [SYSTEM_BLUEPRINT.md §3](./SYSTEM_BLUEPRINT.md#3-golden-master-schema-html-structure) (Golden Master)
- [SYSTEM_BLUEPRINT.md §4](./SYSTEM_BLUEPRINT.md#4-forbidden-practices) (Forbidden Practices)
