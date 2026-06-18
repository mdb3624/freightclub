# Role Data Flow & Dependencies

## 🔗 Data Input/Output Matrix

Shows what each role consumes and produces:

```mermaid
graph LR
    
    subgraph Inputs["📥 Data Inputs"]
        MKTF["Market Feedback<br/>Product Roadmap"]
        STND["Technical<br/>Standards"]
        MOBIL["Mobile<br/>Constraints"]
    end
    
    subgraph BA_ROLE["🎯 BUSINESS_ANALYST"]
        BA["Requirements<br/>Authority"]
    end
    
    subgraph BA_OUT["📋 BA Outputs"]
        STORY["User Stories"]
        AC["Acceptance<br/>Criteria"]
        BR["Business<br/>Rules"]
        EDGE["Edge<br/>Cases"]
    end
    
    subgraph ARCH_ROLE["🏛️ ARCHITECT"]
        ARCH["Design<br/>Authority"]
    end
    
    subgraph ARCH_OUT["📐 ARCH Outputs"]
        SCHEMA["Database<br/>Schema"]
        DOMAIN["Domain<br/>Models"]
        DIAG["Mermaid<br/>Diagrams"]
    end
    
    subgraph HFD_ROLE["🎨 HUMAN_FACTORS_DESIGNER"]
        HFD["UX/UI<br/>Authority"]
    end
    
    subgraph HFD_OUT["🖼️ HFD Outputs"]
        MOCKUP["UI<br/>Mockups"]
        IFLOW["Interaction<br/>Flows"]
        COMPS["Component<br/>Specs"]
    end
    
    subgraph CODER_ROLE["💻 CODER"]
        CODE["Implementation<br/>Authority"]
    end
    
    subgraph CODE_OUT["✅ CODER Outputs"]
        SRC["Source<br/>Code"]
        UNIT["Unit<br/>Tests"]
        INTG["Integration<br/>Tests"]
    end
    
    subgraph REV_ROLE["🔍 REVIEWER"]
        REV["Quality<br/>Authority"]
    end
    
    subgraph REV_OUT["📊 REVIEWER Outputs"]
        VERDICT["PASS/<br/>FAIL"]
        AUDIT["Security<br/>Audit"]
        COMPLEX["Complexity<br/>Cert"]
    end
    
    subgraph LIB_ROLE["📚 LIBRARIAN"]
        LIB["Traceability<br/>Authority"]
    end
    
    subgraph LIB_OUT["🎉 LIBRARIAN Outputs"]
        MAP["Story_Map.md<br/>Updated"]
        LOG["Sprint_Log.md<br/>Updated"]
        FLYWAY["Flyway<br/>Linkage"]
    end
    
    MKTF --> BA
    STND --> ARCH
    MOBIL --> HFD
    
    BA --> BA_OUT
    
    STORY --> ARCH
    BR --> HFD
    AC --> CODER
    
    ARCH --> ARCH_OUT
    HFD --> HFD_OUT
    
    SCHEMA --> CODER
    DOMAIN --> CODER
    DIAG --> CODER
    
    IFLOW --> CODER
    COMPS --> CODER
    
    CODER --> CODE_OUT
    SRC --> REV
    UNIT --> REV
    INTG --> REV
    
    REV --> REV_OUT
    VERDICT --> LIB
    
    CODE_OUT --> LIB
    LIB --> LIB_OUT
```

---

## 📋 Detailed Data Handoff Points

### 📤 BA → ARCHITECT
**What:** User Story + Acceptance Criteria  
**Format:**
```markdown
**US-501:** Quick Pay Settlement
- AC1: System computes settlement in real-time
- AC2: Driver sees payout within 5 minutes
- Edge Case: Chargebacks block payouts
```
**Expectation:** ARCHITECT designs schema & domain model to enable AC1-AC2

---

### 📤 ARCHITECT → CODER
**What:** Database schema + Domain model + Constraints  
**Format:**
```mermaid
erDiagram
    SETTLEMENTS {
        UUID id PK
        UUID tenant_id FK
        DECIMAL amount
        ENUM status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ deleted_at
    }
```
**Expectation:** CODER maps entity to JPA + ensures all constraints

---

### 📤 BA + ARCHITECT → HFD
**What:** Business rules + Data model  
**Content:**
- Which fields are user-editable?
- What's the business validation?
- Performance requirements (real-time display)?
**Expectation:** HFD designs form layout & validation UX

---

### 📤 HFD → CODER
**What:** UI component specifications + interaction flows  
**Format:**
```markdown
## Settlement Detail Card
- Display: amount (large), status (badge), action button
- Colors: Green (success), Yellow (pending), Red (failed)
- Mobile: Stack vertically, single-column
- Interaction: Click "Pay" → confirmation dialog
```
**Expectation:** CODER builds React component matching spec

---

### 📤 CODER → REVIEWER
**What:** PR with code + test results + JaCoCo coverage  
**Includes:**
- Source files changed
- Unit test cases (one per AC)
- Integration test results
- Coverage report (branch %)
**Expectation:** REVIEWER validates all 6 hard gates

---

### 📤 REVIEWER → LIBRARIAN
**What:** PASS/FAIL verdict  
**Format:**
```
✓ APPROVED: US-501 Quick Pay Settlement
- BA Gate: AC coverage 100%
- Architect Gate: Cyclomatic < 10 ✓
- Security Gate: RLS enforced ✓
- Reliability Gate: Coverage 85% ✓
- API Gate: Version aligned ✓
- Spring Security Gate: Filters safe ✓
```
**Expectation:** LIBRARIAN marks story DONE and archives

---

### 📤 LIBRARIAN → Archive
**What:** Story completion metadata  
**Format:**
```markdown
| Story | Requirement ID | Flyway Version | Branch | Merge Commit | Coverage | Reviewer |
|-------|---|---|---|---|---|---|
| US-501 | REQ-025 | V20260525_1545 | feature/quick-pay | abc123def | 85% | @reviewer |
```
**Expectation:** Full traceability from requirement → deployment

---

## 🔄 Circular Dependencies (Sequential Lock Protocol)

**Problem:** Roles can request backward changes → circular loops

```mermaid
graph TB
    PROBLEM["❌ Circular Dependency Risk"]
    
    CODER_ISSUE["CODER discovers:<br/>AC impossible"] -->|"requests BA"| BA_CHANGE["BA rewrites AC"]
    BA_CHANGE -->|"impacts"| ARCH_REWORK["ARCH redesigns<br/>schema"]
    ARCH_REWORK -->|"impacts"| CODER_RESTART["CODER restarts<br/>implementation"]
    CODER_RESTART -.->|"discovers new issue"| CODER_ISSUE
    
    PROBLEM --> CODER_ISSUE
```

**Solution:** Sequential Lock Protocol

```mermaid
graph LR
    BA["🎯 BA<br/>WRITES"] -->|"ACCEPT?"| GATE1{{"ARCH<br/>Acceptance<br/>Gate"}}
    
    GATE1 -->|"❌ REJECT"| BA_FIX["BA fixes &<br/>resubmits"]
    BA_FIX --> GATE1
    
    GATE1 -->|"✅ ACCEPT<br/>LOCK"| ARCH["🏛️ ARCH<br/>DESIGNS<br/>(inputs frozen)"]
    
    ARCH -->|"COMPLETE"| GATE2{{"CODER<br/>Acceptance<br/>Gate"}}
    
    GATE2 -->|"❌ REJECT"| ESCAL["CODER escalates<br/>to LIBRARIAN"]
    ESCAL -->|"CHG request"| CHG["Create change<br/>request<br/>(new story)"]
    
    GATE2 -->|"✅ ACCEPT<br/>LOCK"| CODER["💻 CODER<br/>IMPLEMENTS<br/>(inputs frozen)"]
    
    CODER -->|"SUBMIT"| REV["🔍 REVIEWER"]
    REV -->|"REWORK NEEDED"| CODER_FIX["CODER fixes<br/>(same story)"]
    CODER_FIX --> REV
    
    REV -->|"PASS"| LIB["📚 LIBRARIAN<br/>ARCHIVES"]
    
    style GATE1 fill:#fff9c4
    style GATE2 fill:#fff9c4
    style CHG fill:#ffccbc
    style CODER_FIX fill:#b3e5fc
    style LIB fill:#c8e6c9
```

**Key Rules:**
1. **Input Acceptance Gates** - Each role validates inputs BEFORE starting
2. **Phase Lock** - Once accepted, inputs are FROZEN (no changes)
3. **Forward-Only Feedback** - Issues escalate to LIBRARIAN, not backward
4. **Change Requests** - Backward changes → create CHG ticket + new story

See **CIRCULAR_DEPENDENCY_FIX.md** for full protocol.

---

## 🎯 Critical Path Analysis

**Longest sequence of dependent tasks (blocking path):**

```
BA writes story (1 day)
  ↓
ARCHITECT designs (2 days) ← Must wait for BA
  ↓
CODER implements (3 days) ← Must wait for ARCHITECT
  ↓
REVIEWER audits (2 days) ← Must wait for CODER
  ↓
LIBRARIAN archives (1 day) ← Must wait for REVIEWER
────────────────────────────
CRITICAL PATH: 9 days

Parallel tracks:
- HFD can start after BA + ARCHITECT (day 3) and finish by day 5
- CODER can start day 3 once HFD finishes (no blocking)
```

---

## ⚡ Optimizations for Faster Delivery

| Optimization | What | Impact |
|--------------|------|--------|
| **Batch stories** | BA writes 5 stories upfront | ARCHITECT/HFD/CODER pipeline-feed |
| **ARCH + HFD parallel** | Both start day 2 after BA | Saves 1 day in critical path |
| **Automated tests** | CODER writes tests during implementation | Avoids QA bottleneck |
| **Pre-review checklist** | CODER self-checks 6 gates before PR | REVIEWER turnaround < 1 day |
| **Continuous integration** | Tests run on every commit | Catch regressions early |

---

## 📊 Dependency Graph (Execution Order)

```mermaid
graph LR
    BA["Phase 1<br/>BA: Story"]
    ARCH["Phase 2<br/>ARCH: Design"]
    HFD["Phase 2<br/>HFD: UI"]
    CODER["Phase 3<br/>CODER: Impl"]
    REV["Phase 4<br/>REV: Audit"]
    LIB["Phase 5<br/>LIB: Archive"]
    
    BA -->|"AC + BR"| ARCH
    BA -->|"BR + AC"| HFD
    
    ARCH -->|"Schema"| CODER
    HFD -->|"Comp Specs"| CODER
    
    CODER -->|"Code + Tests"| REV
    ARCH -->|"Design check"| REV
    BA -->|"AC coverage"| REV
    
    REV -->|"PASS verdict"| LIB
    CODER -->|"Commit hash"| LIB
    
    style BA fill:#e1f5ff
    style ARCH fill:#f3e5f5
    style HFD fill:#fce4ec
    style CODER fill:#e8f5e9
    style REV fill:#fff3e0
    style LIB fill:#f1f8e9
```

---

## 🔐 Authorization Matrix

**Who can approve what:**

| Artifact | Owner | Can Approve | Cannot Approve |
|----------|-------|-------------|---|
| User Story | BA | BA, LIBRARIAN | ARCH, CODER, HFD |
| Technical Design | ARCHITECT | ARCHITECT, REVIEWER | BA, CODER, HFD |
| UI Design | HFD | HFD, REVIEWER | BA, ARCH, CODER |
| Code | CODER | CODER, REVIEWER | BA, ARCH, HFD, LIBRARIAN |
| Quality Verdict | REVIEWER | REVIEWER only | All others |
| Story DONE | LIBRARIAN | LIBRARIAN only (if REVIEWER PASS) | All others |

---

## 📈 Metrics Per Data Handoff

Track quality at each handoff:

```mermaid
graph TB
    BA_M["📊 BA Metrics<br/>- AC completeness: 100%<br/>- Story INVEST score: 8+/10<br/>- Edge case coverage: all named"]
    ARCH_M["📊 ARCH Metrics<br/>- Schema normalized: ✓<br/>- Complexity: < 10<br/>- Domain isolation: ✓"]
    HFD_M["📊 HFD Metrics<br/>- Mobile coverage: 100%<br/>- Component count: <= 5<br/>- Cognitive load: low"]
    CODE_M["📊 CODE Metrics<br/>- Coverage: >= 80%<br/>- Tests per AC: 1+<br/>- Build: clean"]
    REV_M["📊 REVIEW Metrics<br/>- Gate violations: 0<br/>- Rework cycles: <=2<br/>- Time to verdict: 1-2 days"]
    LIB_M["📊 ARCHIVE Metrics<br/>- Traceability links: 100%<br/>- Story_Map sync: latest<br/>- Flyway mapping: correct"]
    
    BA_M --> ARCH_M --> HFD_M --> CODE_M --> REV_M --> LIB_M
```

---

**Created:** 2026-05-25  
**Purpose:** Visualize role dependencies, data flow, and handoff points  
**Audience:** All roles, product leadership, onboarding
