# Jira + Local Story Sync Workflow

**Status:** Migration Complete ✅  
**Total Stories Migrated:** 61  
**Jira Project:** FREIG (freightclub)  
**Last Updated:** 2026-06-23

---

## Overview

All 61 local stories have been migrated to Jira (FREIG project). Going forward, **all new stories MUST be created in both locations**:

1. **Jira** — Single source of truth for issue tracking and team collaboration
2. **Local files** — Backup, documentation, and detailed acceptance criteria

---

## Creating New Stories: Step-by-Step

### Step 1: Create the Story in Jira First

1. Go to **[Jira Board](https://mdb-intergrated-logistics.atlassian.net/projects/FREIG)**
2. Click **Create issue** (top left)
3. Fill in:
   - **Summary:** `[Story ID]: [Brief Title]` (e.g., `US-900: User Profile Update`)
   - **Description:** Copy from your local draft (see below)
   - **Issue Type:** `Story`
   - **Labels:** Add the story ID (e.g., `US-900`) for easy cross-referencing

4. Click **Create** → Note the **Jira Key** (e.g., `FREIG-62`)

### Step 2: Create the Local Markdown File

1. Create file: `docs/business/stories/[STORY_ID]_[Brief_Title].md`
   - Example: `docs/business/stories/US-900_User_Profile_Update.md`

2. Use this template:

```markdown
# [STORY_ID]: [Full Title]

**Story ID:** US-900  
**Phase:** [Phase Name or TBD]  
**Status:** READY_FOR_DESIGN  
**Scope:** [BACKEND | FRONTEND | FULL_STACK]  
**Effort:** [X days]  
**Priority:** [P0 | P1 | P2]  
**Jira Link:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-62  

---

## User Story

**As a** [Actor/Persona]  
**I want to** [Action/Capability]  
**So that** [Benefit/Outcome]

---

## Acceptance Criteria

### AC-1: [Criterion Title]
```gherkin
Given [Precondition]
When [Action]
Then [Expected Result]
  And [Additional assertion]
```

### AC-2: [Criterion Title]
[Description or Gherkin]

---

## Technical Notes

- [Any implementation hints, tech stack decisions, etc.]
- [Link to related stories, design docs, etc.]

---

## Success Metrics

- [How to verify this story is done]
```

3. Save and commit to git

### Step 3: Link Jira to Local Files

1. **In Jira:** Add the local file path to the Description or a comment
2. **In Local File:** Add the Jira link (as shown in template above)

---

## Mapping: Local Status → Jira Status

When creating the story, set the Jira status based on its maturity:

| Local Status | Jira Status | Meaning |
|---|---|---|
| `READY_FOR_DESIGN` | **To Do** | Waiting for architecture/HFD design |
| `READY_FOR_IMPLEMENTATION` | **To Do** | Design complete, ready for coding |
| `IN_PROGRESS` | **In Progress** | Currently being implemented |
| `READY_FOR_REVIEW` | **In Review** | PR open, awaiting code review |
| `DONE` / `✅ DONE` | **Done** | Merged to main, story complete |
| `BACKLOG` | **To Do** | Queued for future phases |

---

## Jira Workflow: Sequential Lock Protocol Integration

**MANDATORY:** All stories must follow this workflow. See `CLAUDE.md` Sequential Lock Protocol for enforcement.

### The 3-Status Workflow

The FREIG project uses a simple 3-status workflow that aligns with the Sequential Lock Protocol:

```
┌─────────────────────────────────────────────────────────────┐
│                    STORY LIFECYCLE IN JIRA                   │
└─────────────────────────────────────────────────────────────┘

  [Created]
     ↓
  📋 TO DO
  ├─ Story awaiting architecture design or implementation approval
  ├─ Local Status: READY_FOR_DESIGN or READY_FOR_IMPLEMENTATION
  ├─ Frozen: No code changes until role gates pass
  └─ Gates: BA story definition complete (if new requirement)
     ↓
  🔄 IN PROGRESS
  ├─ Story is actively being implemented
  ├─ Local Status: IN_PROGRESS
  ├─ CODER has accepted inputs from ARCHITECT + HFD
  └─ Gates: ARCHITECT + HFD + BA inputs locked (no backward rework)
     ↓
  ✅ DONE
  ├─ PR merged to main, story complete
  ├─ Local Status: DONE or ✅ DONE
  ├─ REVIEWER approved (all 10 gates PASS)
  └─ Archived to docs/business/stories/archived/ (optional)
```

### Workflow Rules by Status

#### **Status: TO DO**
**Entrance Criteria:**
- Story created in Jira with summary, description, acceptance criteria
- Local markdown file created with full details
- Story added to Story_Map.md (if new phase)

**What happens:**
- ARCHITECT reviews and designs (creates design doc or schema)
- HFD reviews and designs (creates UI spec if frontend)
- BA clarifies acceptance criteria if needed
- **No backward requests to BA** — issues escalate to LIBRARIAN via CHG protocol

**Exit Criteria (before moving to In Progress):**
- ✅ ARCHITECT: Design document complete (or approval for no-design stories)
- ✅ HFD: UI/UX specification complete (or N/A for backend-only stories)
- ✅ BA: Acceptance criteria finalized (no changes allowed after lock)
- ✅ CODER: Ready to code with locked inputs

**Transition Command:**
```bash
curl -u "email:token" -X POST \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "21"}}' \
  https://mdb-intergrated-logistics.atlassian.net/rest/api/2/issue/FREIG-XXX/transitions
```

---

#### **Status: IN PROGRESS**
**Entrance Criteria:**
- All role inputs locked (ARCHITECT, HFD, BA cannot request rework)
- CODER has acknowledged design and AC
- Local status updated to `IN_PROGRESS`

**What happens:**
- CODER writes tests (TDD: Red → Green → Refactor)
- CODER writes implementation code
- CODER verifies test coverage ≥70% (or ≥80% for critical paths)
- CODER creates PR and requests code review

**While In Progress:**
- **Design changes forbidden** — Use CHG protocol to escalate
- **AC changes forbidden** — Use CHG protocol to escalate
- **New requirements forbidden** — Create new story (US-XXX-v2)
- Test coverage must be ≥70% before moving to Done

**Exit Criteria (before moving to Done):**
- ✅ All tests passing (unit + integration + E2E)
- ✅ Code review APPROVED (REVIEWER signs off on all 10 gates)
- ✅ Coverage ≥70% (JaCoCo enforced)
- ✅ PR merged to main
- ✅ Local status updated to `DONE`

**Transition Command:**
```bash
curl -u "email:token" -X POST \
  -H "Content-Type: application/json" \
  -d '{"transition": {"id": "31"}}' \
  https://mdb-intergrated-logistics.atlassian.net/rest/api/2/issue/FREIG-XXX/transitions
```

---

#### **Status: DONE**
**Entrance Criteria:**
- PR merged to main (all checks passed)
- REVIEWER approval with sign-off
- All tests passing in production
- Local status marked `✅ DONE`

**What happens:**
- Story is closed (no further changes)
- Can be optionally archived to `docs/business/stories/archived/`
- Historical reference kept in Jira (never delete)

**Transition Rules:**
- ✅ Can transition from **In Progress** → **Done** (normal flow)
- ⚠️ Can transition **Done** → **To Do** only if reverting a bad merge (document reason in comment)
- ❌ Cannot skip statuses (e.g., To Do → Done directly)

---

### Role Gates by Workflow Status

| Role | To Do | In Progress | Done |
|------|-------|-------------|------|
| **BA** | ✅ Writes AC, creates story | ❌ Frozen (no changes) | ✅ Signs off completion |
| **ARCHITECT** | ✅ Designs schema/API | ❌ Frozen (no redesigns) | ✅ Verifies design quality |
| **HFD** | ✅ Designs UI/UX | ❌ Frozen (no rework) | ✅ Verifies visual compliance |
| **CODER** | ⏸️ Waiting for design | ✅ Implements & tests | ✅ Merges PR |
| **REVIEWER** | ⏸️ Waiting for implementation | ⏸️ Waiting for PR | ✅ Audits all 10 gates |
| **LIBRARIAN** | ⏸️ Waiting for closure | 🚨 **CHG escalations only** | ✅ Archives & catalogs |

---

### Transitioning Stories: Step-by-Step

#### Move To Do → In Progress

1. **Verify all gates passed:**
   ```
   ✅ ARCHITECT design complete (comment link in Jira)
   ✅ HFD spec complete (comment link in Jira) — skip if backend-only
   ✅ BA accepted final AC (no further requests)
   ```

2. **Update local status in markdown:**
   ```markdown
   **Status:** IN_PROGRESS
   ```

3. **In Jira:** Click **Transition** button → Select **In Progress**
   - Or use API (see "Transition Command" above)

4. **Commit to git:**
   ```bash
   git add docs/business/stories/US-XXX_Title.md
   git commit -m "feat(US-XXX): Move to In Progress — architecture & design locked"
   ```

#### Move In Progress → Done

1. **Verify PR merged to main:**
   ```bash
   git log --oneline main | grep "US-XXX"  # Should appear in main history
   ```

2. **Verify all tests passing:**
   ```bash
   cd backend && mvn clean verify  # Must show >=70% coverage
   cd ../frontend && npm run test:e2e  # Must show all PASS
   ```

3. **REVIEWER approves (signs off in PR comment):**
   ```
   @claude-code APPROVED

   ✅ All 10 gates PASS:
   1. ✅ Requirement Traceability
   2. ✅ Cyclomatic Complexity <10
   3. ✅ RLS Enforcement
   4. ✅ Backend Integration Tests
   5. ✅ Frontend E2E Tests
   6. ✅ API Contract
   7. ✅ Design System Compliance
   8. ✅ Test Coverage ≥70%
   9. ✅ No Lombok
   10. ✅ Schema Consistency
   ```

4. **Update local status in markdown:**
   ```markdown
   **Status:** ✅ DONE
   ```

5. **In Jira:** Click **Transition** → Select **Done**

6. **Commit to git:**
   ```bash
   git add docs/business/stories/US-XXX_Title.md
   git commit -m "chore(US-XXX): Marked DONE — merged to main (2026-06-23)"
   ```

---

### Blocked Stories: Using the CHG Protocol

If a story is **blocked** by an issue discovered mid-implementation:

1. **Create a CHG ticket** (not a new US story):
   ```
   CHG-XXX: [Issue Title]
   
   Original Story: US-XXX
   Root Cause: [Why input is wrong/incomplete]
   Blocker: [How it blocks implementation]
   
   Options:
   - Option A: Finish current story as-is (accept the limitation)
   - Option B: Rework inputs and create US-XXX-v2
   ```

2. **Escalate to LIBRARIAN** (not back to previous role)

3. **LIBRARIAN decides:** Finish story (Option A) or rework (Option B)

4. **Update Jira comment** with decision

5. **Never transition the story until decision made**

---

## Migration Mapping Reference

All local stories have been created in Jira with these IDs:

| Local Story | Jira Key | Summary |
|---|---|---|
| CHG-001 | FREIG-1 | Missing `/shipper/quote` Route Fix |
| CHG-003 | FREIG-2 | Action Zone Structural Layout |
| INF-001 | FREIG-3 | Wrap 20 Flyway Migrations in DO/IF |
| US-101 | FREIG-6 | Multi-Tenant Registration |
| US-102 | FREIG-7 | Tenant Context & JWT |
| US-103 | FREIG-11 | Load CRUD |
| US-103-v2 | FREIG-8 | Load Creation Redesign |
| US-103-v3 | FREIG-9 | Load Duplication Feature |
| US-103-v4 | FREIG-10 | Load Templates Feature |
| ... | ... | [See Jira board for full list](https://mdb-intergrated-logistics.atlassian.net/projects/FREIG) |

---

## Workflow Rules

### Before Creating a Story
- [ ] Story ID is unique (check existing stories)
- [ ] User persona and acceptance criteria are defined
- [ ] Story fits in one sprint or phase (not too large)
- [ ] Story follows INVEST principles (Independent, Negotiable, Valuable, Estimable, Small, Testable)

### After Creating a Story
- [ ] Story exists in Jira (with Jira Key)
- [ ] Story exists in local markdown file
- [ ] Both files reference each other (cross-linked)
- [ ] Story is added to `docs/project/Story_Map.md` (if starting a new phase)
- [ ] Story is committed to git

### Story Lifecycle

```
Local Draft (optional)
    ↓
Create in Jira → Create Local File (linked)
    ↓
Design Phase (READY_FOR_DESIGN → Design Review)
    ↓
Implementation Phase (READY_FOR_IMPLEMENTATION → IN_PROGRESS → Code Review)
    ↓
Merge to Main (PR merged)
    ↓
Mark as DONE in Jira + Update Local Status
    ↓
Archive (optional): Move to `docs/business/stories/archived/` after phase completion
```

---

## Quick Reference: Commands

### Check Jira Project Status
```bash
curl -u "email:token" https://mdb-intergrated-logistics.atlassian.net/rest/api/2/project/10000
```

### Search Stories in Jira
Visit: https://mdb-intergrated-logistics.atlassian.net/issues/?jql=project=FREIG

### Sync New Story to Jira (via API)
```bash
curl -u "email:token" -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "project": {"key": "FREIG"},
      "summary": "US-901: New Story Title",
      "issuetype": {"name": "Story"},
      "labels": ["US-901"]
    }
  }' \
  https://mdb-intergrated-logistics.atlassian.net/rest/api/2/issue
```

---

## FAQ

**Q: Can I create stories in Jira only (no local file)?**  
A: No. Local files are the source of truth for detailed AC, design notes, and phase tracking. Jira is for team collaboration and status updates.

**Q: What if I make a mistake in Jira?**  
A: Edit the story in Jira immediately. Then update the local file to match. Both should stay in sync.

**Q: How do I archive a completed story?**  
A: After merging to main and marking as DONE:
1. Update local status to `✅ DONE`
2. Move file to `docs/business/stories/archived/[STORY_ID].md`
3. Keep Jira story open for historical reference (never delete)

**Q: Can I create variants (US-XXX-v2)?**  
A: Yes. Treat each variant as a separate story:
- `US-XXX-v2_Title.md` (local)
- `US-XXX-v2: Title` (Jira summary)
- Reference the original story in the description

---

## Authority

- **Source of Truth:** Jira FREIG board for current work
- **Historical Record:** Local markdown files for design decisions, AC, and rationale
- **Phase Tracking:** `docs/project/Story_Map.md` (canonical phase list)

See: `CLAUDE.md` → "Mandatory Rule" section for role-based workflow enforcement.
