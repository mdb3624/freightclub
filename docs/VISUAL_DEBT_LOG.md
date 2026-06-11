# VISUAL DEBT LOG

**Authority:** LIBRARIAN (Traceability & Governance)  
**Effective:** 2026-06-10  
**Purpose:** Track all identified visual drifts, asset errors, and UI inconsistencies  
**Resolution SLA:** P0 items within 1 sprint; P1+ in backlog  

---

## How to Use This Log

1. **HFD Identifies Issue:** During design or retrofit, HFD discovers visual drift or asset error
2. **HFD Logs Issue:** Add row to table below with Priority, Component, Description, Location, Status
3. **HFD Provides Evidence:** Screenshot or diff showing the problem
4. **Librarian Triages:** Reviews and assigns to backlog or sprint
5. **Resolution:** Fix is completed, and diff/screenshot proves resolution
6. **HFD Closes:** Mark "Resolved" with evidence link

---

## Visual Debt Tracker

| Priority | Component/Issue | Description | Location | Status | Evidence | Resolved By |
|---|---|---|---|---|---|---|
| **P0** | Logo Inconsistency | US-820 mockup was using text emoji `🚚` instead of actual `web_logo.png` asset | US-820_Shell_Integrated_Mockup.html (header) | ✅ RESOLVED | [Fixed: 2026-06-10] — Replaced emoji with `<img src="web_logo.png">` reference | HFD (2026-06-10) |
| P1 | [TBD] | [TBD] | [TBD] | Open | | |
| P2 | [TBD] | [TBD] | [TBD] | Open | | |

---

## Resolution Guidelines

### P0 (Critical)
- **Trigger:** Asset re-creation, broken asset references, fundamental style violations
- **SLA:** Fix within 1 business day
- **Examples:** 
  - Logo drawn instead of asset-based
  - Color token hardcoded without Style Guide source
  - Typography not matching Style Guide

### P1 (High)
- **Trigger:** Visual inconsistencies, minor layout deviations, accessibility issues
- **SLA:** Fix within 1 sprint
- **Examples:**
  - Spacing slightly off from gutter tokens
  - Contrast ratio borderline (4.2:1 vs 4.5:1)
  - Icon styling inconsistent with iconography standard

### P2 (Medium)
- **Trigger:** Nice-to-have improvements, polish issues, documentation gaps
- **SLA:** Fix in backlog or next phase
- **Examples:**
  - Hover state animation tweaks
  - Additional responsive breakpoint refinements
  - Enhanced accessibility features (beyond WCAG AA)

---

## Evidence Template

When resolving an issue, provide:

```markdown
**Issue:** [P0/P1/P2] Component Name

**Before:** [Screenshot or description of the problem]

**After:** [Screenshot showing the fix]

**Fix Details:**
- Changed: [What was changed]
- Source: [Verification that change is compliant with Style Guide/SHELL_CONTRACT.md]
- Testing: [How fix was validated]

**Resolved By:** [Name/Date]
```

---

## Adding New Issues

**HFD:** When you identify a visual debt item:

1. Add a new row to the table above
2. Use format: `[Priority]` | `[Component Name]` | `[Brief Description]` | `[File/Location]` | `Open` | | |
3. Notify LIBRARIAN in Slack or comment
4. Create a CHG-### ticket if issue blocks READY_FOR_CODER status

**LIBRARIAN:** When closing issues:

1. Verify HFD provided evidence (screenshot/diff)
2. Confirm fix is governance-compliant (Style Guide, SHELL_CONTRACT.md)
3. Update status to "Resolved"
4. Link to commit/PR if applicable

---

## Document Status

**Created:** 2026-06-10  
**Last Updated:** 2026-06-10  
**Authority:** LIBRARIAN + HFD Role  
**Status:** ACTIVE (updated as issues are discovered and resolved)

---

## Related Governance

- **HUMAN_FACTORS_DESIGNER.md § Asset Integrity Rule** — Prohibits asset re-creation
- **SHELL_CONTRACT.md** — Grid and spacing constraints
- **Shipper & Administrator Style Guide.md** — Color, typography, asset sourcing authority
- **PROCESS_FLOW_Shell_Widget_Governance.md** — Design workflow gates
