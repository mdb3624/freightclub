# Role Interaction & Gate Audit — FreightClub Engineering System

**Document Purpose:** Define role boundaries, gate control, and interaction flow to prevent circular dependencies and maintain accountability.

**Effective Date:** 2026-05-29  
**Last Updated:** 2026-05-29

---

## 🎯 Overview: The Sequential Lock Protocol

The system enforces a **forward-only flow** to prevent infinite rework cycles:

```
BA → ARCH → HFD → CODER → REVIEWER → LIBRARIAN
 ↓     ↓      ↓      ↓       ↓         ↓
LOCK  LOCK   LOCK   LOCK    LOCK    LOCK
```

Once a role **accepts** inputs, they are **FROZEN** (no backward changes). Issues escalate **forward** to LIBRARIAN, never backward.

---

## 📋 Role Definition Matrix

| Role | Abbreviation | Primary Responsibility | Gate Responsibility | Output | Forward Link |
|------|------|---|---|---|---|
| **Business Analyst** | BA | Break down features into user stories with acceptance criteria | ✅ Validates Business Rules from stakeholders | User Stories (US-###) with AC | ARCHITECT |
| **Architect** | ARCH | Design domain model, schema, and technical approach | ✅ Validates BA story is implementable & schema sound | Design docs, Mermaid diagrams, schema DDL | HFD + CODER |
| **Human Factors Designer** | HFD | Design UI/UX flows, information architecture, cognitive load | ✅ Validates BA Business Rules are feasible in UI | UI wireframes, interaction flows, design specs | CODER |
| **Coder** | CODER | Implement features following TDD (Red-Green-Refactor) | ✅ Validates ARCH/HFD/BA inputs are complete & consistent | Code + unit tests (70%+ coverage) | REVIEWER |
| **Reviewer** | REVIEWER | Audit code for correctness, security, compliance with standards | ✅ Validates CODER implementation meets all gates (complexity, RLS, coverage, traceability) | PASS/REJECT verdict with evidence | LIBRARIAN |
| **Librarian** | LIBRARIAN | Finalize story completion, update sprint/backlog docs, escalate conflicts | ✅ Validates all upstream roles have completed work; owns change request decisions | Sprint_Log.md, Story_Map.md, CHG-### decisions | N/A (end) |

---

## 🚪 Gate Control Details

### BA Gate (Input Validation)
**What:** Ensure stories are implementable and grounded in business reality  
**Trigger:** When BA creates or refines a story (US-###)  
**Checklist:**
- [ ] Story uses INVEST standard (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [ ] Acceptance Criteria written as Gherkin (Given/When/Then)
- [ ] Business Rules documented in `docs/business/FEATURES.md`
- [ ] Story linked to a valid Requirement ID
- [ ] No technical implementation details (e.g., no "use PostgreSQL RLS")
- [ ] Story added to `docs/project/Story_Map.md` immediately

**Output Frozen:** Story status = READY_FOR_DESIGN (no changes to AC mid-cycle)

---

### ARCH Gate (Design Validation)
**What:** Ensure domain model, schema, and technical design are sound  
**Trigger:** When ARCH accepts a BA story for design  
**Checklist:**
- [ ] Domain model diagram (Mermaid) shows entities, relationships, invariants
- [ ] Schema design includes all mandatory columns: `id` (UUID), `tenant_id`, `deleted_at`, timestamps
- [ ] Foreign key constraints verified (target columns have UNIQUE/PK, never reference user.tenant_id)
- [ ] Multi-tenancy isolation strategy documented (RLS + soft deletes)
- [ ] No circular dependencies between aggregates
- [ ] Cyclomatic complexity estimated for each service method (target: <10)
- [ ] Design does NOT include Java code (ARCH designs, does not code)

**Output Frozen:** Design document = ARCH_READY (no redesign mid-implementation)

---

### HFD Gate (UI/UX Validation)
**What:** Ensure UI is feasible, cognitive load is acceptable, and information salience is correct  
**Trigger:** When HFD accepts BA story for design (in parallel with ARCH)  
**Checklist:**
- [ ] UI wireframes or mockups address BA Business Rules
- [ ] Information hierarchy respects cognitive load (shippers, owner-operators)
- [ ] High-glare mobile use accommodated (font sizes, contrast)
- [ ] Interaction flows documented (user journeys)
- [ ] Form validation rules aligned with BA rules
- [ ] Accessibility checklist completed (keyboard navigation, screen readers)
- [ ] Design does NOT include HTML/CSS code (HFD designs, does not code)

**Output Frozen:** Design spec = HFD_READY (no redesign mid-implementation)

---

### CODER Gate (Implementation Validation)
**What:** Ensure all prerequisites (BA story, ARCH design, HFD design) are complete and consistent  
**Trigger:** When CODER begins implementation  
**Checklist:**
- [ ] BA story exists (US-###) with Acceptance Criteria
- [ ] ARCH design document exists and is marked ARCH_READY
- [ ] HFD design document exists and is marked HFD_READY (if UI involved)
- [ ] CODER has read and understands all three documents
- [ ] No conflicts between ARCH schema and HFD form validation rules
- [ ] No conflicts between AC and design (escalate to LIBRARIAN if found)

**Constraint:** CODER MUST follow TDD:
1. **Red:** Write failing test for each AC
2. **Green:** Write minimal code to pass
3. **Refactor:** Clean code while maintaining green tests
4. **Verify:** JaCoCo reports ≥70% branch coverage

**Output Frozen:** Code = CODER_COMPLETE (ready for REVIEWER)

---

### REVIEWER Gate (Quality Validation)
**What:** Audit implementation for correctness, security, performance, compliance  
**Trigger:** When CODER submits PR with code and tests  
**Checklist:** See `.claude/rules/reviewer-checklist.md` — includes:
- [ ] Business alignment (Requirement traceability, AC satisfaction)
- [ ] Technical excellence (Cyclomatic complexity <10, domain purity, strategy patterns)
- [ ] Data & Security (RLS enabled, soft deletes in queries, schema type consistency, no orphaned entities)
- [ ] Reliability (Tests pass, ≥80% branch coverage, transactional integrity, idempotency)
- [ ] API Contract (Version consistency, endpoint audit, golden-path smoke test)
- [ ] Spring Security (No double registration, cache names registered, JJWT audience validation)

**Output:** PASS (with evidence) or REJECT (with reasons)  
**Constraint:** REVIEWER must run tests and capture evidence before issuing PASS

---

### LIBRARIAN Gate (Completion Validation)
**What:** Finalize story, sync documentation, escalate conflicts via CHG protocol  
**Trigger:** When REVIEWER issues PASS verdict  
**Checklist:**
- [ ] REVIEWER has provided PASS verdict (in chat history)
- [ ] CODER implementation is complete and merged
- [ ] Story linked to corresponding Flyway migration version (V###_...)
- [ ] Story status updated in `docs/project/Story_Map.md` → DONE
- [ ] Story entry created in `docs/project/Sprint_Log.md` with completion date
- [ ] Any discovered issues logged to Technical Debt Ledger (`.claude/learnings.md`)
- [ ] If conflicts found upstream → Create CHG-### ticket, escalate to BA/ARCH/HFD

**Output Frozen:** Story = DONE (no rework, only new stories via CHG)

---

## 🔄 Conflict Resolution: The CHG Protocol

**When:** Any role discovers inputs from a previous role are wrong, incomplete, or impossible mid-work

**Process:**
1. **Current role escalates to LIBRARIAN** (never backward to previous role)
2. **LIBRARIAN reviews and decides:**
   - **Option A:** "Finish current story as-is" → CHG tracked as backlog item
   - **Option B:** "Create new story (US-###-v2) for rework" → Current story paused
3. **LIBRARIAN documents decision in CHG ticket**
4. **CHG tracked in `.claude/learnings.md` Technical Debt Ledger**

**Anti-Pattern (FORBIDDEN):**
- ❌ CODER asks BA to change AC mid-implementation
- ❌ ARCH redesigns without LIBRARIAN approval
- ❌ HFD iterates with CODER on wireframes mid-code
- ❌ Multiple feedback loops creating indefinite rework

---

## 📊 Current Interaction Flow (Post-2026-05-29 Update)

### New Interactions Added This Session

#### 1. Maven Build System Integration
**Roles Affected:** CODER, REVIEWER, LIBRARIAN  
**Gate Added:** Maven build must succeed before code review

| Role | Responsibility | Gate | Artifact |
|------|---|---|---|
| **CODER** | Run `mvn clean verify` locally before pushing | Build succeeds (no compilation errors) | Git commit hash |
| **REVIEWER** | Verify `mvn test` + JaCoCo ≥70% in CI | Tests pass + coverage enforced | Test report in PR |
| **LIBRARIAN** | Ensure build documentation in CLAUDE.md | Maven setup documented | CLAUDE.md "Build & Maven Setup" |

**Documentation:**
- `CLAUDE.md` → "Build & Maven Setup" section
- `MAVEN_LOCAL_SETUP.md` → Team guide
- `.vscode/tasks.json` → Automated build tasks
- Memory file: `maven_setup_local.md`

---

#### 2. Role Documentation Ownership
**Roles Affected:** All roles, LIBRARIAN as owner

| Role Document | Owner | Gate | Responsibility |
|---|---|---|---|
| `ARCHITECT.md` | ARCHITECT | Design acceptance | ARCHITECT reads before designing |
| `CODER.md` | CODER | Code review acceptance | CODER reads before coding |
| `HUMAN_FACTORS_DESIGNER.md` | HFD | Design acceptance | HFD reads before designing UI |
| `BUSINESS_ANALYST.md` | BA | Story creation | BA reads before creating stories |
| `REVIEWER.md` | REVIEWER | Code review checklist | REVIEWER reads before reviewing |
| `LIBRARIAN.md` | LIBRARIAN | Story finalization | LIBRARIAN reads before marking DONE |

**Gate:** Each role document must be loaded and followed per CLAUDE.md role invocation rules

---

#### 3. Sequential Lock Enforcement
**Roles Affected:** All roles via LIBRARIAN

| Phase | Input Lock | Owner | Status Gate |
|---|---|---|---|
| BA Creates Story | BA gates inputs | BA | US-### in READY_FOR_DESIGN |
| ARCH Designs | ARCH gates inputs | ARCH | Design in ARCH_READY |
| HFD Designs | HFD gates inputs | HFD | Design in HFD_READY |
| CODER Implements | CODER gates inputs | CODER | Code in CODER_COMPLETE |
| REVIEWER Audits | REVIEWER gates PR | REVIEWER | PR in PASS/REJECT |
| LIBRARIAN Finalizes | LIBRARIAN gates completion | LIBRARIAN | Story in DONE |

**Anti-Pattern Prevention:** If CODER finds AC impossible → Escalate to LIBRARIAN, not back to BA

---

## 📈 Metrics & Monitoring

**Track these to maintain health:**

| Metric | Target | Owner | Action If Exceeded |
|---|---|---|---|
| Stories completing without CHG | ≥85% | LIBRARIAN | Investigate root cause |
| Stories with 1 CHG request | ≤12% | LIBRARIAN | Review ARCH/BA quality |
| Stories with 2+ CHG requests | <3% | LIBRARIAN | Escalate to leadership |
| Time from CHG creation to decision | <1 day | LIBRARIAN | Escalate if delayed |
| Code coverage (JaCoCo) | ≥70% | REVIEWER | Reject PR, require fix |
| Cyclomatic complexity per method | <10 | REVIEWER | Reject PR, require refactor |
| Build time (clean package) | <15s | CODER | Profile and optimize |

---

## 🛠️ Tools & Automation per Role

### BA
- **Story Template:** `docs/business/stories/` (INVEST format)
- **Backlog:** `docs/project/Story_Map.md`
- **Gate Check:** Acceptance Criteria in Gherkin, no tech details

### ARCH
- **Design Template:** Mermaid diagrams, DDL, design doc
- **Schema Location:** `backend/src/main/resources/db/migration/`
- **Gate Check:** Foreign key constraints verified, no Java code

### HFD
- **Design Template:** Wireframes, interaction flows, accessibility checklist
- **Location:** `docs/design/` (new or existing)
- **Gate Check:** Cognitive load assessment, high-glare mobile test

### CODER
- **Build Tool:** Maven at `C:\tools\apache-maven-3.9.9\bin\mvn.cmd`
- **Test Execution:** `mvn test` (unit) + `mvn verify` (integration)
- **Gate Check:** 70%+ JaCoCo coverage, TDD workflow

### REVIEWER
- **Checklist:** `.claude/rules/reviewer-checklist.md`
- **Evidence:** Test logs, coverage reports, security scan results
- **Gate Check:** All boxes checked before PASS verdict

### LIBRARIAN
- **Sprint Log:** `docs/project/Sprint_Log.md`
- **Story Map:** `docs/project/Story_Map.md`
- **Change Log:** `.claude/learnings.md` (Technical Debt Ledger)
- **Gate Check:** All upstream roles complete, CHG decision made

---

## ✅ Enforcement & Accountability

**Rule Violations Result In:**
- ❌ PR rejected if REVIEWER gate not passed
- ❌ Story marked BLOCKED if CHG escalation not followed
- ❌ Code review failure if role boundaries crossed (e.g., CODER writes UI without HFD design)
- ❌ LIBRARIAN refuses to mark story DONE if REVIEWER PASS not in chat history

**Dispute Resolution:**
1. Escalate to LIBRARIAN immediately
2. LIBRARIAN decides via CHG protocol
3. Document decision in `.claude/learnings.md`

---

## 📚 Related Documents

- `CLAUDE.md` → Master engineering rules
- `CIRCULAR_DEPENDENCY_FIX.md` → Full CHG protocol with examples
- `.claude/rules/reviewer-checklist.md` → Quality gates
- `.claude/rules/change-request-protocol.md` → CHG automation
- `MAVEN_LOCAL_SETUP.md` → Build setup for team
- `memory/maven_setup_local.md` → AI team memory

---

**Authority:** CLAUDE.md Sequential Lock Protocol  
**Status:** ACTIVE (enforced on all PRs and story finalization)  
**Review Cadence:** Quarterly or after major process change
