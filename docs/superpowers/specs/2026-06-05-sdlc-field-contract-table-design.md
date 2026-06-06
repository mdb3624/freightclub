# SDLC Improvement: Inline Field Contract Table
**Date:** 2026-06-05  
**Status:** APPROVED  
**Author:** Mike Barnes + Claude  

---

## Problem

Three recurring failure modes in the current BA → ARCH → HFD → CODER → REVIEWER → LIBRARIAN pipeline:

1. **Errors of omission** — UI fields exist with no wired API param; API params exist with no DB column; values reach the endpoint but never render in the UI (e.g., carrier preference flow)
2. **Late discovery** — contract mismatches only surface during deployment/testing, requiring a CHG-### cycle and rework
3. **Platform mismatch** — agents emit Bash/Unix commands against a Windows 11 / PowerShell dev environment

All three issues are agent-caused and should be caught by agents before CODER begins — not by the user and not during deployment.

---

## Solution: Inline Field Contract Table

### Core Idea

Add one new section to every story file — the **Field Contract Table** — that each upstream role fills before passing the story forward. By the time HFD signs off, the table is complete and verified. CODER's input gate reduces to a single presence check.

---

## Story File Addition

Insert this section between Acceptance Criteria and Definition of Done in every story:

```markdown
## Field Contract Table

**Scope:** `FULL_STACK` | `UI_ONLY` | `BACKEND_ONLY`

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| (example) Search input | q | — | VARCHAR | Yes |

**Sign-Off Chain:**
- [ ] BA: UI field names populated
- [ ] ARCH: API params + DB columns filled (skip if UI_ONLY)
- [ ] HFD: Full table validated — no orphaned fields, no type mismatches, PowerShell-safe commands confirmed (skip if BACKEND_ONLY)
```

---

## Role Responsibilities

### BA
- Sets the `Scope` flag (`FULL_STACK` / `UI_ONLY` / `BACKEND_ONLY`)
- Populates the `UI Field` column with every field visible to the user
- Leaves `API Param`, `DB Column`, `Type` blank for ARCH to fill

### ARCH
- Fills `API Param`, `DB Column`, `Type`, `Required` for every row
- For `UI_ONLY` scope: marks all DB/API columns as N/A and skips sign-off
- Rejects story (returns to BA) if `UI Field` column is empty or ambiguous

### HFD
- Validates the complete table row-by-row before marking `READY_FOR_IMPLEMENTATION`:
  - Every `UI Field` has a corresponding `API Param` (or explicit N/A with justification)
  - Every `API Param` has a corresponding `DB Column` (or explicit N/A for computed/derived fields)
  - No type mismatches between UI expectation and API/DB type
  - All commands/scripts referenced in the design are PowerShell-safe
- For `BACKEND_ONLY` scope: skips sign-off entirely
- Blocks handoff if any row is incomplete — escalates to LIBRARIAN via CHG-### if blocker is upstream (BA or ARCH gap)

### CODER
Input gate simplified to:

| Scope | Required Sign-Offs |
|-------|-------------------|
| FULL_STACK | BA ✅ + ARCH ✅ + HFD ✅ |
| UI_ONLY | BA ✅ + HFD ✅ |
| BACKEND_ONLY | BA ✅ + ARCH ✅ |

CODER rejects (escalates to LIBRARIAN) if any required sign-off is missing.

### REVIEWER
- Verifies implementation against the Field Contract Table row-by-row
- Checks: every `UI Field` renders the value from its `API Param`; every `API Param` is sourced from its `DB Column`
- Hard gate: any unresolved N/A in the table must have a documented justification

---

## Scope Flag Rules

| Scope | ARCH Required | HFD Required | Table Columns Required |
|-------|--------------|--------------|----------------------|
| FULL_STACK | Yes | Yes | All columns |
| UI_ONLY | No | Yes | UI Field only; API/DB = N/A |
| BACKEND_ONLY | Yes | No | API Param + DB Column; UI Field = N/A |

CHG-### tickets inherit the scope flag of their parent story unless explicitly overridden.

---

## Platform Rule (Global)

Added to `CLAUDE.md` and all role docs:

> **All commands must use PowerShell syntax. Bash/Unix commands are prohibited in agent outputs for this project.** Examples: use `$env:VAR`, not `export VAR=`; use `taskkill //F //PID`, not `kill -9`; use `;` not `&&` for chaining where needed.

---

## Story Status Flow (Unchanged)

```
READY_FOR_DESIGN
  → ARCH + HFD fill Field Contract Table
READY_FOR_IMPLEMENTATION  (only valid when all required sign-offs ✅)
  → CODER begins Red-Green-Refactor
READY_FOR_REVIEW
  → REVIEWER verifies contract table against implementation
DONE
  → LIBRARIAN sign-off
```

---

## What This Fixes

| Problem | Fix |
|---------|-----|
| UI field not wired to API | HFD validates every row before CODER starts |
| API param not in DB | ARCH fills DB column; HFD validates completeness |
| Values in API, not in UI | REVIEWER hard gate: each UI field traces to its API param |
| Bash commands on Windows | Platform rule enforced globally in CLAUDE.md + role docs |
| Late discovery via deployment | Contract validated at HFD stage, not at runtime |
