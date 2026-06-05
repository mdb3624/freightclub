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
