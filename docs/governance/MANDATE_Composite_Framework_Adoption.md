# MANDATORY: Adoption of Composite Framework for US-820 & Beyond

**From:** LIBRARIAN (System Governance)  
**To:** HFD, CODER, REVIEWER Roles  
**Date:** 2026-06-10  
**Subject:** Composite Framework Architecture Mandate  
**Authority:** Sequential Lock Protocol + Design System Governance  
**Status:** ✅ **EFFECTIVE IMMEDIATELY**

---

## Executive Summary

Effective immediately, **all UI development for FreightClub dashboard features must adhere to the Composite Framework** defined in **SYSTEM_BLUEPRINT.md**. 

This mandate applies to:
- ✅ US-820 (KPI Summary Display)
- ✅ US-821, US-822, US-823 (future dashboard widgets)
- ✅ All dashboard extensions and modifications
- ✅ Any new Shipper/Administrator interface work

**Non-compliance will result in code rejection at the review gate.**

---

## Three Core Requirements

### 1. STRUCTURE: fc-shell > panel > widget-grid Hierarchy

**What This Means:**
Every dashboard layout must follow this nesting structure:

```
Shell (Layout Container)
  └─ Panel (Widget Wrapper)
       └─ Widget-Grid (Multi-widget layout)
            └─ Widget (Individual card/component)
```

**Required for All Submissions:**
- Shell contains 12-column grid (SLOT_A, SLOT_B, SLOT_C)
- Every widget lives inside a `.panel` container
- No floating widgets (widgets cannot exist outside panels)
- Multiple widgets use `.widget-grid` for consistent spacing

**Reference:** SYSTEM_BLUEPRINT.md §1 & §3

**Validation:**
```html
<!-- ✅ CORRECT: Widget inside panel inside slot -->
<div class="slot-a">
    <div class="panel">
        <div class="panel-content">
            <div class="widget-grid">
                <div class="widget">...</div>
            </div>
        </div>
    </div>
</div>

<!-- ❌ INCORRECT: Widget floating without panel -->
<div class="slot-a">
    <div class="widget">...</div>
</div>
```

---

### 2. STYLE: CSS Token Variables (No Hardcoded Values)

**What This Means:**
All aesthetic properties (colors, borders, shadows, spacing) must derive from the CSS :root variable registry. **Hardcoding hex values is strictly prohibited.**

**Required Variables to Use:**
- **Colors:** `var(--color-success)`, `var(--color-warning)`, `var(--color-critical)`, etc.
- **Borders:** `var(--border-widget)`, `var(--border-divider)`, etc.
- **Shadows:** `var(--shadow-subtle)`, `var(--shadow-elevated)`, etc.
- **Spacing:** `var(--space-sm)`, `var(--space-md)`, `var(--space-lg)`, etc.
- **Typography:** `var(--font-size-2xl)`, `var(--font-weight-bold)`, etc.

**Reference:** SYSTEM_BLUEPRINT.md §2

**Validation:**
```css
/* ✅ CORRECT: Using token variables */
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

/* ❌ INCORRECT: Hardcoded hex values */
.panel {
    background: #FFFFFF;
    border: 1px solid #D0D0D0;
    padding: 24px;
}

.status-badge-success {
    background: #E8F5E9;
    color: #27AE60;
}
```

**Additional Anti-Patterns (All Forbidden):**
- Inline styles: `<div style="background: #FFFFFF;">` ❌
- Tag selectors: `button { color: #B08D57; }` ❌
- Absolute positioning for layout: `position: absolute; top: 100px;` ❌
- Flexbox for main grid: `display: flex; flex-wrap: wrap;` ❌ (use `display: grid`)

---

### 3. VALIDATION: Golden Master Template Checklist

**Before Submitting Code, Verify Against:**

#### HFD (Designer) Checklist:
- [ ] Design uses Shell > Panel > Widget hierarchy
- [ ] All colors come from semantic palette (Success, Warning, Critical, Info)
- [ ] All spacing is multiples of 8px
- [ ] Widgets are grouped in panels (never floating)
- [ ] Main layout uses grid (not absolute/flexbox positioning)
- [ ] HTML structure reference provided (matches §3 template)

**Example:** [SYSTEM_BLUEPRINT.md §3.1 – §3.5](./SYSTEM_BLUEPRINT.md#3-golden-master-schema-html-structure)

#### CODER (Developer) Checklist:
- [ ] CSS uses :root variables (no hardcoded hex values)
- [ ] No tag selectors (all styling via classes)
- [ ] Main layout uses CSS Grid (not absolute positioning or flexbox)
- [ ] Every widget inside a `.panel` container
- [ ] All spacing (margin, padding, gap) uses token values
- [ ] Tests pass + 70%+ code coverage
- [ ] Implementation matches Golden Master template

**Example:** [SYSTEM_BLUEPRINT.md §3.5 CSS Template](./SYSTEM_BLUEPRINT.md#35-css-implementation-template)

#### REVIEWER (QA) Checklist:
- [ ] No hardcoded colors, borders, shadows (use tokens)
- [ ] No absolute positioning for layout
- [ ] No tag selectors
- [ ] All widgets wrapped in `.panel`
- [ ] All spacing is 8px multiples
- [ ] Structure matches Golden Master Schema
- [ ] Code review gates pass (see REVIEWER.md)

**Reference:** [SYSTEM_BLUEPRINT.md §5-6](./SYSTEM_BLUEPRINT.md#5-enforcement--governance)

---

## Rejection Criteria (Code Will Be Returned)

The following will trigger **automatic code rejection** at review:

| Violation | Example | Fix |
|---|---|---|
| Hardcoded colors | `color: #27AE60;` | Use `var(--color-success)` |
| Hardcoded borders | `border: 1px solid #D0D0D0;` | Use `var(--border-widget)` |
| Hardcoded spacing | `padding: 24px;` | Use `var(--space-lg)` |
| Tag selectors | `button { ... }` | Use `.button-class { ... }` |
| Absolute positioning for layout | `position: absolute; top: 100px;` | Use CSS Grid with slot classes |
| Flexbox main layout | `display: flex; flex-wrap: wrap;` | Use `display: grid; grid-template-columns: repeat(12, 1fr)` |
| Floating widgets | `<div class="widget">` (no panel) | Wrap in `<div class="panel">` |
| Inline styles | `<div style="...">` | Move to CSS class |

**No Exceptions.** Code that violates these rules will be rejected regardless of functionality.

---

## Implementation Steps

### For HFD (Human Factors Designer)

1. **Read** SYSTEM_BLUEPRINT.md §1-3 (Framework Philosophy, Token Registry, Golden Master Schema)
2. **Design** using the composite hierarchy (Shell > Panel > Widget)
3. **Validate** against HFD Checklist (§5 SYSTEM_BLUEPRINT.md)
4. **Reference** the Golden Master HTML templates when handing off to CODER
5. **Confirm** design aligns with token values (colors, spacing, typography)

**Deadline:** Apply to all designs for Phase 10+ features

---

### For CODER (Developer)

1. **Read** SYSTEM_BLUEPRINT.md §2-4 (Token Registry, Golden Master Schema, Forbidden Practices)
2. **Copy** the CSS :root variables into your stylesheet (or import from shared tokens file)
3. **Implement** using classes + token variables (no hardcoded values)
4. **Structure** HTML following §3 Golden Master templates
5. **Test** using CODER Checklist (SYSTEM_BLUEPRINT.md §6)
6. **Submit** for code review

**No implementation begins until SYSTEM_BLUEPRINT.md is read and understood.**

---

### For REVIEWER (QA/Security)

1. **Read** SYSTEM_BLUEPRINT.md §5-6 (Enforcement, Reviewer Checklist)
2. **Audit** code against rejection criteria (above table)
3. **Validate** structure matches Golden Master Schema
4. **Check** CSS token usage (no hardcoded values)
5. **Verify** spacing is 8px multiples
6. **Pass or Reject** using REVIEWER.md gates

**Any violation = automatic rejection. No partial credit.**

---

## FAQ

### Q: Can I hardcode colors if the design requires a custom shade?
**A:** No. Update the :root variable registry (SYSTEM_BLUEPRINT.md §2) and document the change. Then use the variable.

### Q: What if the token variables don't include a color I need?
**A:** Request a new token via LIBRARIAN. The token is added to §2, and you use the new variable. Never hardcode.

### Q: Can I use inline styles for quick testing?
**A:** No. Inline styles are forbidden. Use CSS classes that reference token variables.

### Q: What if absolute positioning is the only way to achieve the design?
**A:** It's not. CSS Grid handles 99% of dashboard layouts. If you think you need absolute positioning, escalate to ARCHITECT for design review before implementing.

### Q: Do existing code and UI need to be refactored?
**A:** New code must comply. Existing code that violates these rules is logged in VISUAL_DEBT_LOG.md for gradual refactoring. Future phases will address legacy code.

---

## Communication & Acknowledgment

**This mandate is effective immediately.**

All team members in HFD, CODER, and REVIEWER roles must:

1. **Read** SYSTEM_BLUEPRINT.md in full (§1-6)
2. **Acknowledge** receipt of this mandate
3. **Integrate** SYSTEM_BLUEPRINT.md into your workflow
4. **Apply** the Composite Framework to your next submission

**Acknowledgment Format:**

Please reply with:
```
[Your Name] — [Role]
CONFIRMED: I have read SYSTEM_BLUEPRINT.md and will apply 
the Composite Framework to all future submissions.
Date: [Today's Date]
```

---

## Enforcement Timeline

| Phase | Action | Date |
|---|---|---|
| **Immediate** | SYSTEM_BLUEPRINT.md published | 2026-06-10 |
| **Grace Period** | 2 days for team to read & acknowledge | 2026-06-12 |
| **Enforcement Begins** | Code submitted after this date must comply | 2026-06-13 |
| **Phase 10 Deadline** | All Phase 10 code must be 100% compliant | 2026-06-30 |

**After 2026-06-13, non-compliant code will be rejected at review and returned for refactoring.**

---

## Questions?

- **Architecture Questions:** ARCHITECT (file issue in docs/audit/)
- **Design Questions:** HFD (reference HUMAN_FACTORS_DESIGNER.md)
- **Implementation Questions:** CODER team (peer review)
- **Policy Questions:** LIBRARIAN (this document)
- **Enforcement Questions:** REVIEWER (REVIEWER.md)

---

## Document Authority

**Mandate Title:** Adoption of Composite Framework for US-820 & Beyond  
**Authority:** LIBRARIAN + Sequential Lock Protocol  
**Effective Date:** 2026-06-10  
**Enforcement Date:** 2026-06-13  
**Status:** ✅ **ACTIVE — MANDATORY — NO EXCEPTIONS**

This mandate supersedes all prior ad-hoc styling and layout decisions. SYSTEM_BLUEPRINT.md is the single source of truth for dashboard architecture.

---

**Signed (LIBRARIAN):**  
System Governance Authority  
Date: 2026-06-10  

---

**Distribution:**
- ✅ HFD (HUMAN_FACTORS_DESIGNER.md team)
- ✅ CODER (CODER.md team)
- ✅ REVIEWER (REVIEWER.md team)
- ✅ ARCHITECT (design system owner)
- ✅ Project Leadership
