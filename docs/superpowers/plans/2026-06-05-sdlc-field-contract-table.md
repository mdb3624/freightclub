# SDLC Field Contract Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bake a Field Contract Table into every story file and update each agent role to fill, validate, and enforce it — eliminating API/UI/DB drift before CODER begins.

**Architecture:** Each role doc gets a focused addition to its existing gate/checklist. A canonical story template is created so new stories start with the table pre-populated. CLAUDE.md gets a global PowerShell enforcement rule.

**Tech Stack:** Markdown only — no code changes.

**Spec:** `docs/superpowers/specs/2026-06-05-sdlc-field-contract-table-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `docs/business/stories/STORY_TEMPLATE.md` | Canonical story starter with Field Contract Table |
| Modify | `docs/standards/Definition_of_Ready.md` | Add Field Contract Table as a DoR gate |
| Modify | `docs/roles/BUSINESS_ANALYST.md` | Add Scope flag + UI Field column duty |
| Modify | `docs/roles/ARCHITECT.md` | Add API Param/DB Column/Type fill duty |
| Modify | `docs/roles/HUMAN_FACTORS_DESIGNER.md` | Add table validation + PowerShell check + sign-off |
| Modify | `docs/roles/CODER.md` | Replace multi-item HFD gate with single sign-off check |
| Modify | `docs/roles/REVIEWER.md` | Add Field Contract Table row-by-row verification |
| Modify | `CLAUDE.md` | Add global PowerShell enforcement rule |

---

## Task 1: Create Story Template

**Files:**
- Create: `docs/business/stories/STORY_TEMPLATE.md`

- [ ] **Step 1: Create the file**

```markdown
# User Story: US-### — [Title]

**Phase:** [#]
**Status:** DRAFT
**Owner:** BA
**Depends On:** [US-### or none]
**Traceability:** [REQ-#.#]

---

## User Story

**As a** [SHIPPER | TRUCKER | ADMIN],
**I want to** [action],
**so that** [value].

---

## Acceptance Criteria

**AC-1: [Name]**
- **When** [condition]
- **Then** [outcome]
- **Verify:** [measurable check]

*(add AC-2 through AC-5 as needed)*

---

## Field Contract Table

**Scope:** `FULL_STACK` | `UI_ONLY` | `BACKEND_ONLY`

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| [BA fills] | [ARCH fills] | [ARCH fills] | [ARCH fills] | [ARCH fills] |

**Sign-Off Chain:**
- [ ] BA: UI fields named + Scope set
- [ ] ARCH: API params + DB columns filled *(skip if UI_ONLY)*
- [ ] HFD: Full table validated, PowerShell-safe commands confirmed *(skip if BACKEND_ONLY)*

---

## Definition of Done

- [ ] Field Contract Table sign-off chain complete for Scope
- [ ] All ACs implemented with passing tests
- [ ] Backend branch coverage ≥ 80% (JaCoCo)
- [ ] Playwright golden-path E2E test passes
- [ ] REVIEWER PASS issued
- [ ] LIBRARIAN sign-off completed
```

- [ ] **Step 2: Commit**

```
git add docs/business/stories/STORY_TEMPLATE.md
git commit -m "feat: add canonical story template with Field Contract Table"
```

---

## Task 2: Update Definition of Ready

**Files:**
- Modify: `docs/standards/Definition_of_Ready.md`

- [ ] **Step 1: Read the current file** (already done above — content is lines 1-5)

- [ ] **Step 2: Add Field Contract Table gate as item 3, shift existing items**

Replace the entire file with:

```markdown
# Definition of Ready (DoR)

A User Story is "Ready" for a Sprint only if it meets these criteria:

1. **Clarity:** The "As a/I want/So that" statement is defined.
2. **Acceptance Criteria:** At least 3-5 measurable test cases are listed.
3. **Field Contract Table:** Scope flag is set and all sign-offs required by that Scope are checked:
   - `FULL_STACK` → BA ✅ + ARCH ✅ + HFD ✅
   - `UI_ONLY` → BA ✅ + HFD ✅
   - `BACKEND_ONLY` → BA ✅ + ARCH ✅
4. **Technical Specs:** The Solution Architect has confirmed the schema impact.
5. **Security:** Impact on RLS policies is identified.
6. **Estimation:** The story has been pointed by the development team.
```

- [ ] **Step 3: Commit**

```
git add docs/standards/Definition_of_Ready.md
git commit -m "feat: add Field Contract Table sign-off as DoR gate"
```

---

## Task 3: Update BUSINESS_ANALYST.md

**Files:**
- Modify: `docs/roles/BUSINESS_ANALYST.md`

- [ ] **Step 1: Read the current file**

- [ ] **Step 2: Add Field Contract Table duties after the Mandatory Workflow section**

Add this block immediately after the `## 🛠️ Mandatory Workflow` section:

```markdown
## 📋 Field Contract Table Duties

When writing a story, BA must:

1. **Set the Scope flag** — choose `FULL_STACK`, `UI_ONLY`, or `BACKEND_ONLY`:
   - `UI_ONLY` — no DB schema or new endpoints involved
   - `BACKEND_ONLY` — no user-facing UI changes
   - `FULL_STACK` — both UI and backend are touched (default)

2. **Populate the `UI Field` column** — list every field, button, badge, or display value the user will interact with. Leave `API Param`, `DB Column`, `Type`, `Required` blank for ARCH.

3. **Check own sign-off box** before setting story status to `READY_FOR_DESIGN`.

**Example row:**
| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Search input | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
| Carrier name display | *(ARCH fills)* | *(ARCH fills)* | *(ARCH fills)* | Yes |
```

- [ ] **Step 3: Commit**

```
git add docs/roles/BUSINESS_ANALYST.md
git commit -m "feat: add Field Contract Table duties to BA role"
```

---

## Task 4: Update ARCHITECT.md

**Files:**
- Modify: `docs/roles/ARCHITECT.md`

- [ ] **Step 1: Read the current file**

- [ ] **Step 2: Add Field Contract Table duties after the Deliverables section**

Add this block after `## Deliverables`:

```markdown
## 📋 Field Contract Table Duties

After accepting a story (checklist passed), ARCH must fill the Field Contract Table before handing off to HFD:

1. For each row BA populated with a `UI Field`, fill:
   - `API Param` — exact query/body parameter name the endpoint accepts (e.g., `q`, `carrierId`)
   - `DB Column` — exact column name in the migration (e.g., `users.first_name`)
   - `Type` — data type consistent with DB schema (e.g., `VARCHAR`, `TIMESTAMPTZ`, `BOOLEAN`)
   - `Required` — Yes / No

2. Add rows for API params or DB columns that have **no UI field** (backend-only data like `tenant_id`, `deleted_at`) — set `UI Field` = N/A with justification.

3. For `UI_ONLY` scope: mark all `API Param` / `DB Column` / `Type` cells as N/A. Skip sign-off.

4. Check the ARCH sign-off box before handing to HFD.

**Rejection rule:** If BA's `UI Field` column is empty or contains placeholder text, REJECT the story back to BA before filling any columns.
```

- [ ] **Step 3: Commit**

```
git add docs/roles/ARCHITECT.md
git commit -m "feat: add Field Contract Table duties to ARCH role"
```

---

## Task 5: Update HUMAN_FACTORS_DESIGNER.md

**Files:**
- Modify: `docs/roles/HUMAN_FACTORS_DESIGNER.md`

- [ ] **Step 1: Read the current file**

- [ ] **Step 2: Add Field Contract Table validation section after the Protocol & Gates section**

Add this block after `## 🚦 Protocol & Gates`:

```markdown
## 📋 Field Contract Table Validation (MANDATORY before READY_FOR_IMPLEMENTATION)

HFD is the **final validation gate** before CODER begins. For `FULL_STACK` and `UI_ONLY` scope stories, HFD must verify the Field Contract Table row-by-row:

**Row checks:**
- [ ] Every `UI Field` has a non-empty `API Param` — or an explicit N/A with written justification
- [ ] Every `API Param` has a non-empty `DB Column` — or an explicit N/A (e.g., computed field)
- [ ] No type mismatches between `Type` and what the UI component expects (e.g., UI renders a date string but DB column is `TIMESTAMPTZ` — flag for ARCH to clarify format)
- [ ] No duplicate param names across rows
- [ ] All commands, scripts, or terminal instructions in the design use **PowerShell syntax** — no `export`, no `&&`, no `kill -9`, no Unix paths

**Escalation:** If any row is incomplete or contradictory and the gap is in BA or ARCH output, do NOT fix it yourself — escalate to LIBRARIAN via CHG-###. Only check the HFD sign-off box when the table is 100% clean.

**For `BACKEND_ONLY` scope:** Skip this section entirely.
```

- [ ] **Step 3: Commit**

```
git add docs/roles/HUMAN_FACTORS_DESIGNER.md
git commit -m "feat: add Field Contract Table validation gate to HFD role"
```

---

## Task 6: Update CODER.md

**Files:**
- Modify: `docs/roles/CODER.md`

- [ ] **Step 1: Read the current file**

- [ ] **Step 2: Replace the HFD input checklist items with a single sign-off check**

In the `## 🔒 Input Acceptance Gate (MANDATORY)` section, replace the `From HFD (UI Design):` block:

**Remove:**
```markdown
**From HFD (UI Design):**
- [ ] Component structure is clear
- [ ] State management is specified
- [ ] Interaction flows are documented
- [ ] Mobile responsiveness requirements stated
```

**Replace with:**
```markdown
**From HFD (Field Contract Table):**
- [ ] Field Contract Table sign-off chain complete for story Scope:
  - `FULL_STACK` → BA ✅ + ARCH ✅ + HFD ✅
  - `UI_ONLY` → BA ✅ + HFD ✅
  - `BACKEND_ONLY` → BA ✅ + ARCH ✅
```

- [ ] **Step 3: Commit**

```
git add docs/roles/CODER.md
git commit -m "feat: simplify CODER input gate to Field Contract Table sign-off check"
```

---

## Task 7: Update REVIEWER.md

**Files:**
- Modify: `docs/roles/REVIEWER.md`

- [ ] **Step 1: Read the current file**

- [ ] **Step 2: Add Field Contract Table hard gate**

In the `## 🛑 Hard Gates (Automatic REJECT)` section, add:

```markdown
* ❌ **Contract Table Violation:** Any `UI Field` in the story's Field Contract Table does not have its value rendered from the corresponding `API Param` in the implementation.
* ❌ **Orphaned API Param:** Any `API Param` in the contract table is not sourced from its `DB Column` in the repository/query layer.
* ❌ **PowerShell Violation:** Any command in a merged script or README uses Bash/Unix syntax (e.g., `export`, `kill -9`, `&&` chains) — this is a Windows 11 PowerShell environment.
```

In the `## 📋 Review Checklist` section, add a new subsection after `### 🔒 Sequential Lock Protocol`:

```markdown
### 📋 Field Contract Table Verification

* [ ] **Table Present:** Story file contains a Field Contract Table with Scope flag set.
* [ ] **Sign-Offs Complete:** All sign-offs required by Scope are checked (BA/ARCH/HFD as applicable).
* [ ] **UI→API Traced:** For each `UI Field` row, confirm the rendered value in the UI comes from the `API Param` — check network tab evidence or test assertions.
* [ ] **API→DB Traced:** For each `API Param` row, confirm the value is sourced from the `DB Column` in the repository query.
* [ ] **N/A Justified:** Any N/A cell has a written justification in the table.
* [ ] **PowerShell-Safe:** No Bash/Unix commands in any file touched by this PR.
```

- [ ] **Step 3: Commit**

```
git add docs/roles/REVIEWER.md
git commit -m "feat: add Field Contract Table hard gates and checklist to REVIEWER"
```

---

## Task 8: Update CLAUDE.md — PowerShell Enforcement

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Read the Technical Standards section of CLAUDE.md**

- [ ] **Step 2: Add PowerShell rule to the Technical Standards section**

In the `## 🛠️ Technical Standards (The Constitution)` section, add a new subsection:

```markdown
## 💻 Platform: Windows 11 / PowerShell

**All commands in agent outputs, scripts, and documentation MUST use PowerShell syntax. Bash/Unix commands are prohibited.**

| Prohibited (Bash) | Required (PowerShell) |
|-------------------|-----------------------|
| `export VAR=value` | `$env:VAR = "value"` |
| `kill -9 <pid>` | `taskkill //F //PID <pid>` |
| `cmd1 && cmd2` | `cmd1; cmd2` or separate lines |
| `rm -rf dir` | `Remove-Item -Recurse -Force dir` |
| `./script.sh` | `.\script.ps1` |
| Unix path `/dev/null` | `$null` |

This rule applies to: CODER, HFD, REVIEWER, ARCHITECT, BA, LIBRARIAN, and all automated agent outputs.
```

- [ ] **Step 3: Commit**

```
git add CLAUDE.md
git commit -m "feat: add global PowerShell enforcement rule to CLAUDE.md"
```

---

## Task 9: Validate Against Spec

- [ ] **Step 1: Confirm all spec requirements are covered**

| Spec Requirement | Covered By |
|-----------------|------------|
| Field Contract Table in story files | Task 1 (template) |
| Scope flag (FULL_STACK/UI_ONLY/BACKEND_ONLY) | Tasks 1, 3 |
| BA fills UI Field column | Task 3 |
| ARCH fills API Param/DB Column/Type | Task 4 |
| HFD validates full table + PowerShell check | Task 5 |
| CODER gate = sign-off presence check | Task 6 |
| REVIEWER verifies implementation against table | Task 7 |
| Global PowerShell enforcement | Task 8 |
| DoR updated | Task 2 |
| CHG-### scope flag inheritance | Covered in STORY_TEMPLATE.md default (Task 1) |

- [ ] **Step 2: Commit all remaining staged files if any**

```
git status
```

- [ ] **Step 3: Final check — open one existing story (US-707-v2.md) and manually verify the new template section would have caught the carrier preference drift**

The Field Contract Table for US-707-v2 would have looked like:

| UI Field | API Param | DB Column | Type | Required |
|----------|-----------|-----------|------|----------|
| Search input | q | users.first_name / last_name / email | VARCHAR | Yes |
| Carrier name display | name (response) | users.first_name + last_name | VARCHAR | Yes |
| Carrier email display | email (response) | users.email | VARCHAR | Yes |
| Equipment badge | equipmentType (response) | users.equipment_type | VARCHAR | No |

If HFD had validated this table, the missing `name`/`email`/`equipmentType` fields in the original response shape would have been caught before CODER began.
