# Visual Debt Ledger

**Authority:** Human Factors Designer (HFD) Role  
**Purpose:** Track visual compliance violations, P0/P1/P2 debt items, and resolution status  
**Last Updated:** 2026-06-10

---

## Active Issues

None currently open.

---

## Recently Resolved (2026-06-10)

---

## Resolved Issues

| ID | Feature | Violation | Severity | Root Cause | Resolution | Status | Resolved Date |
|---|---|---|---|---|---|---|---|
| VD-001 | US-820 KPI Summary | Logo Asset Re-creation (Brand Asset Violation) | **P0** | Initial mockup used emoji `🚀` instead of actual `web_logo.png` asset per §5 Brand Assets | Replaced text emoji with `<img src="../../docs/standards/brand_assets/web_logo.png" alt="FreightClub Logo" />` reference. Added Asset Integrity Rule to HUMAN_FACTORS_DESIGNER.md with verification gates to prevent re-occurrence. | ✅ RESOLVED | 2026-06-10 |
| VD-002 | US-820 KPI Summary | Semantic Color Non-Compliance (§6.1) | **P0** | Status-good color used #2ECC71 instead of §6.1 Emerald Green #27AE60 | Corrected CSS rule `.kpi-number.status-good { color: #27AE60; }` to match §6.1 specification exactly | ✅ RESOLVED | 2026-06-10 |
| VD-003 | US-820 KPI Summary | Mobile Spacing Violations (§6.4 8px Rule) | **P0** | 5 padding/gap values used 12px (not a multiple of 8) on mobile breakpoints | Corrected all 5 values to 8px (space-sm): KPI Card padding, Zone Main padding, Widget Slots gap. All now conform to §6.4 | ✅ RESOLVED | 2026-06-10 |
| VD-004 | US-820 KPI Summary | CTA Button Padding Violation (§6.4) | **P0** | Button padding 12px 24px used non-compliant 12px vertical (not multiple of 8) | Changed to `padding: 8px 24px;` (space-sm vertical × 3×space-md horizontal) per §6.4 | ✅ RESOLVED | 2026-06-10 |
| VD-005 | US-820 KPI Summary | Compliance Badge Padding Violation (§6.4) | **P0** | Badge padding 12px (not multiple of 8) | Changed to `padding: 8px;` (space-sm) per §6.4 | ✅ RESOLVED | 2026-06-10 |
| VD-006 | US-820 KPI Summary | Undefined Component Styling | **P1** | CTA button, Empty State, Widget Header styling not covered by §6 (only §6.1-6.4 defined) | Flagged as "Undefined Requirement" in US-820_COMPLIANCE_CHECKLIST.md. Verified all undefined components source from secondary spec docs (Style Guide §1-4, SHELL_CONTRACT.md) rather than invented. No exception request needed. | ✅ RESOLVED | 2026-06-10 |
| VD-007 | US-820 KPI Summary | Container Border Definition (§6.5) | **P0** | KPI card border used #E8E3D8 (warm cream) instead of #D0D0D0 (cool grey); insufficient contrast against #EFEBE0 canvas background; container boundary not visually distinct | Added §6.5 Container Component Specification to Style Guide.md defining all widget container properties (background, border, border-radius, shadow, padding). Updated .kpi-card border from #E8E3D8 → #D0D0D0 for clear visibility against canvas. Properly cited as §6.5. | ✅ RESOLVED | 2026-06-10 |

---

## Resolution Guidelines

### P0 (Critical — Visual Parity Broken)
- **Definition:** Asset re-creation, color mismatch, spacing violates 8px rule, blocks READY_FOR_CODER status
- **SLA:** 1 day (same session if identified)
- **Escalation:** LIBRARIAN if unresolved after 1 day
- **Evidence Required:** Before/after screenshots, CSS diffs, or spec citations

### P1 (High — Compliance Gap)
- **Definition:** Component undefined in §6, requires secondary spec source, or design spec missing traceability
- **SLA:** 1 sprint (3-5 days)
- **Escalation:** ARCHITECT for exception request or design guidance
- **Evidence Required:** Spec source link, exception justification, or compliance checklist

### P2 (Medium — Tech Debt)
- **Definition:** Minor inconsistency, nice-to-have optimization, no blocking impact
- **SLA:** Backlog priority (next phase)
- **Escalation:** LIBRARIAN for roadmap scheduling
- **Evidence Required:** Rationale for deferral

---

## Template for New Issues

```markdown
| VD-### | US-### | [Violation Title] | **P#** | [Root cause: what went wrong] | [How it was fixed] | [Status: OPEN/BLOCKED/RESOLVED] | [Date] |
```

**Inclusion Criteria:**
- Visual element deviates from §6 Atomic Component Specifications OR
- Visual element deviates from SHELL_CONTRACT.md OR
- Brand asset policy violated (asset re-creation, missing library reference) OR
- Design spec missing traceability to Style Guide OR
- User reports visual mismatch with prototype

**Exclusion Criteria:**
- Backend logic errors
- Database schema issues
- Frontend JavaScript/React bugs (use CODER.md bug tracking instead)
- Performance optimization (use ARCHITECT.md debt ledger)

---

## Metrics

| Metric | Target | Current | Status |
|---|---|---|---|
| P0 issues unresolved > 1 day | 0 | 0 | ✅ |
| P1 issues unresolved > 1 sprint | 0 | 0 | ✅ |
| Average resolution time (P0) | < 1 day | Same session | ✅ |
| Average resolution time (P1) | < 3 days | N/A | — |

---

## Historical Context

**US-820 Compliance Audit (2026-06-10):**

Comprehensive audit of US-820_Shell_Integrated_Mockup.html against Shipper & Administrator Style Guide.md §6 Atomic Component Specifications performed by HFD role. Initial audit identified 6 non-compliant issues (5 P0 + 1 P1). All remediated same-session per P0 SLA. Compliance checklist created: US-820_COMPLIANCE_CHECKLIST.md. Status: **100% COMPLIANT** after remediation.

