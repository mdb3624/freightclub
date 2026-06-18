# 🚀 Role Interaction Quick Reference

## At a Glance: Who Reports to Whom

```
🎯 BA (Business Analyst)
   ↓ Creates: User Stories + AC
   
🏛️ ARCHITECT
   ↓ Creates: Technical Design
   ↙ (depends on: BA story)
   
🎨 HFD (Human Factors Designer)  ← Can work parallel with ARCHITECT
   ↓ Creates: UI Design
   ↙ (depends on: BA rules + ARCH data model)

💻 CODER  ← Can work parallel with HFD once ARCH is ready
   ↓ Creates: Code + Tests
   ↙ (depends on: ARCH design + HFD UI + BA AC)

🔍 REVIEWER
   ↓ Creates: Quality Verdict
   ↙ (depends on: CODER code + ARCH design + BA AC)

📚 LIBRARIAN
   ↓ Archives: Story DONE
   ↙ (depends on: REVIEWER PASS only)
```

---

## Role Checklist: What to Deliver

### 🎯 BUSINESS_ANALYST
- [ ] User story in FEATURES.md
- [ ] AC with measurable outcomes
- [ ] Edge cases named
- [ ] Business rules documented
- [ ] INVEST score: 8+/10

**Gate:** AC complete and clear → ARCHITECT can begin

---

### 🏛️ ARCHITECT  
- [ ] Database schema (SQL + Mermaid ERD)
- [ ] Domain model (POJOs + relationships)
- [ ] Validation rules
- [ ] Cyclomatic complexity < 10
- [ ] No framework code in domain layer

**Gate:** Design approved → CODER can begin  
**Constraint:** NO JAVA CODE

---

### 🎨 HUMAN_FACTORS_DESIGNER
- [ ] UI mockup (Figma/wireframe)
- [ ] Component list (buttons, cards, forms)
- [ ] Color coding (RPM scheme)
- [ ] Mobile-first layout
- [ ] Interaction flows
- [ ] Accessibility checklist

**Gate:** UI spec approved → CODER can implement  
**Constraint:** Must reference BA business rules

---

### 💻 CODER
- [ ] Red-Green-Refactor workflow
- [ ] Unit tests (1 per AC)
- [ ] Integration tests
- [ ] 80%+ branch coverage (JaCoCo)
- [ ] Code builds cleanly
- [ ] Follows Java no-Lombok standard
- [ ] Respects soft deletes & RLS

**Gate:** All tests pass → REVIEWER audits

---

### 🔍 REVIEWER
- [ ] ✓ BA Gate: AC fulfilled
- [ ] ✓ Architect Gate: Design adherence + complexity < 10
- [ ] ✓ Security Gate: RLS enabled + no SQL injection
- [ ] ✓ Reliability Gate: Coverage ≥ 80%
- [ ] ✓ API Gate: Version consistency
- [ ] ✓ Spring Security Gate: No double-filter registration

**Verdict:** PASS or FAIL (no conditionals)

---

### 📚 LIBRARIAN
- [ ] Story added to Story_Map.md
- [ ] Sprint_Log.md updated
- [ ] Flyway version linked
- [ ] Traceability ID set
- [ ] Can only proceed if REVIEWER = PASS

**Final Status:** Story marked DONE

---

## 🔴 Red Flags (Instant Rejection)

| Red Flag | Caught By | Fix |
|----------|-----------|-----|
| Code without story | CODER self-check | Write story first |
| Design without story | ARCHITECT self-check | Get BA AC |
| Coverage < 80% | Build gate + REVIEWER | Retest |
| Complexity > 10 | REVIEWER | Refactor method |
| No soft delete filter | REVIEWER (security gate) | Add `deleted_at IS NULL` |
| No RLS enabled | REVIEWER (security gate) | Add `ENABLE ROW LEVEL SECURITY` |
| Story without LIBRARIAN link | LIBRARIAN gate | Add to Story_Map.md |

---

## ⏱️ Typical Timeline Per Story

| Day | Phase | Owner | Deliverable |
|-----|-------|-------|-------------|
| 1 | Requirements | BA | Story + AC |
| 2 | Design | ARCHITECT | Schema diagram |
| 2 | UI Design | HFD | Mockup + components |
| 3-5 | Implementation | CODER | Code + 80% coverage |
| 5-6 | Review | REVIEWER | PASS verdict |
| 6 | Archive | LIBRARIAN | Story DONE |

**Critical Path:** 6 days (if all gates pass first try)

---

## 🚫 Common Blocks & How to Unblock

| Scenario | Who Blocked | Old Way (Circular) | New Way (Sequential Lock) |
|----------|------------|---|---|
| BA story unclear | ARCH can't design | ARCH asks BA to rewrite | ARCH rejects with acceptance checklist; BA fixes before ARCH starts |
| ARCH design incomplete | CODER can't start | ARCH writes more; CODER waits | CODER rejects with acceptance checklist; ARCH must complete before handoff |
| CODER discovers AC impossible | CODER & BA stuck | CODER asks BA to change AC; BA asks ARCH to redesign (loop) | CODER escalates to LIBRARIAN; create CHG ticket; finish current story; new story for rework |
| Coverage < 80% | PR can't merge | REVIEWER asks CODER to retest | CODER fixes and resubmits (same story, same acceptance) |
| Complexity > 10 | PR rejected | REVIEWER asks CODER to refactor | CODER refactors and resubmits (same story) |
| No story in Story_Map | Story can't mark DONE | LIBRARIAN adds link | LIBRARIAN adds link (should be automatic) |

---

## 📞 Communication Template

Use this format when handing off work:

```markdown
## [Story ID]: [Title]
**From:** [Current Role]  
**To:** [Next Role]  
**Deliverable:** [What you're handing off]  
**Status:** Ready for [next role]  
**Notes:** [Any blockers or special cases]

[ARTIFACT]
```

**Example:**
```markdown
## US-501: Quick Pay Settlement
**From:** ARCHITECT  
**To:** CODER  
**Deliverable:** Database schema + domain model  
**Status:** Ready for implementation  
**Notes:** Settlement amounts must be DECIMAL(19,2) for precision

[SCHEMA DIAGRAM]
```

---

## 🎓 Loading Your Role

When the user asks you to assume a role:

```
1. Load docs/roles/[ROLE].md
2. Follow it exactly
3. Deliver artifacts in checklist format
4. Use one-sentence status updates
5. Don't skip gates
```

**Example invocation:**
> "Acting as ARCHITECT for US-501"

Then:
1. Read `docs/roles/ARCHITECT.md`
2. Design schema + domain model
3. Deliver Mermaid diagrams
4. No Java code
5. Ready for CODER

---

## 🔒 Sequential Lock Protocol (NO Circular Loops)

### The Fix: Input Validation Gates

Before a role STARTS work, the NEXT role validates inputs:

```
ARCHITECT checks BA story with ACCEPTANCE CHECKLIST
  ✅ PASS? → ARCHITECT starts (story LOCKED, no BA changes)
  ❌ FAIL? → Story returned to BA (ARCHITECT doesn't start)

CODER checks ARCH design with ACCEPTANCE CHECKLIST
  ✅ PASS? → CODER starts (design LOCKED, no ARCH changes)
  ❌ FAIL? → Escalate to LIBRARIAN (not back to ARCH)

REVIEWER checks CODER code
  ✅ PASS? → Story DONE
  ❌ FAIL? → CODER fixes (same story, no new inputs)
```

### Input Acceptance Checklists

**ARCHITECT accepts BA story if:**
- [ ] AC count: 2-5 (not vague)
- [ ] Each AC is testable
- [ ] Edge cases named
- [ ] No contradictions
- [ ] Story fits in 5 days

**CODER accepts ARCH + HFD + BA if:**
- [ ] Schema is normalized
- [ ] FK constraints reference unique columns
- [ ] RLS policy defined
- [ ] UI components specified
- [ ] All AC testable

### Change Request Protocol

**If CODER discovers input is wrong during implementation:**
```
CODER → escalate to LIBRARIAN (NOT back to BA)
LIBRARIAN decides:
  Option A: "Finish story with current inputs" → note in PR
  Option B: "Create CHG-### ticket" → pause work, create new story
```

---

## 🔗 Related Documents

- **ROLE_INTERACTIONS.md** - Full workflow diagram & detailed responsibilities
- **ROLE_DATA_FLOW.md** - Data handoff points & dependency analysis
- **CIRCULAR_DEPENDENCY_FIX.md** - Sequential Lock Protocol details & checklists
- **docs/roles/[ROLE].md** - Detailed rules for each role
- **docs/standards/Definition_of_Done.md** - Completion criteria

---

**Last Updated:** 2026-05-25  
**Status:** Active governance  
**Distribution:** All team members
