# LIBRARIAN DECISION MEMO
## CHG Batch Kickoff — US-824 Audit Findings

**Date:** 2026-06-14  
**From:** LIBRARIAN  
**To:** BA (Business Analyst)  
**Subject:** Formal CHG Story Creation Request  
**Reference:** `docs/standards/SDLC_GOVERNANCE_ALL_ROLES.md`

---

## DECISIONS

### ✅ CHG-001: APPROVED (Option A)
**Decision:** Create `/shipper/quote` route stub immediately  
**Rationale:** Quick-win blocker, low implementation effort (5 min), unblocks US-824 "Get A Quote" button  
**Timeline:** Phase 1 — complete before CHG-003 starts

### ✅ CHG-003: APPROVED (Critical Blocker)
**Decision:** Restructure Action Zone (slotC) to include two distinct panels  
**Rationale:** Structural gap found in HFD re-audit; layout must match master prototype for US-824 completion  
**Timeline:** Phase 2 — start after CHG-001 is DONE

### ⏳ CHG-002: PENDING BA INPUT
**Decision:** AWAITING BA/STAKEHOLDER INPUT on remediation path  
**Options:**
- **Option A:** Formalize §6.6 button spec in Style Guide (long-term documentation standardization)
- **Option B:** Archive invalid prior compliance reviews (quick housekeeping)  
**Action:** BA to confirm preferred path; story creation depends on decision

---

## STORY CREATION REQUIREMENTS

### CHG-001: Missing `/shipper/quote` Route

**File Location:** `docs/business/stories/CHG-001_Missing_Quote_Route_Fix.md`

**Story Template:**

```markdown
# CHG-001: Missing `/shipper/quote` Route

**Story ID:** CHG-001  
**Status:** READY_FOR_DESIGN  
**Phase:** Cross-cutting (Quick-win blocker for US-824)  
**Scope:** BACKEND (Route registration + stub component)  
**Effort:** 1 hour  
**Priority:** P0 (Blocks US-824)

---

## User Story

**As a** Shipper  
**I want to** click "Get A Quote" button without hitting 404  
**So that** the dashboard quick action flow works end-to-end

---

## Acceptance Criteria

### AC-1: Route Exists and Renders
```gherkin
Given the application is running
When a user navigates to `/shipper/quote`
Then the page loads without 404 error
And a QuoteRequestPage component renders
And the browser title shows "Get A Quote"
```

### AC-2: Button Navigation Works
```gherkin
Given the Shipper Dashboard is loaded
When a user clicks the "Get A Quote" button
Then the browser navigates to `/shipper/quote`
And the page loads without errors
And no console errors appear
```

### AC-3: Stub Content Meets MVP
```gherkin
Given the QuoteRequestPage is rendered
Then the page displays:
  - A heading: "Get A Quote"
  - A message: "Quote request feature coming soon"
  - Navigation back to dashboard is available (AppShell visible)
```

---

## Routes Required

| Route | Status | Notes |
|-------|--------|-------|
| `/shipper/quote` | ❌ MISSING | Must be added to App.tsx |

---

## Dependencies

- **Depends on:** Nothing (no upstream blockers)
- **Blocks:** US-824 (Quick Actions Panel "Get A Quote" button)
- **Related:** CHG-003 (separate structural layout issue)

---

## BA Sign-Off

- [x] Story follows INVEST standard (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [x] AC written in Gherkin format (Given/When/Then)
- [x] No technical implementation details (ARCHITECT's responsibility)
- [x] Routes table filled; no schema/database requirements
- [x] Scope is clear and achievable in 1 hour
- [x] No ambiguous or conflicting AC

**BA Sign-off:** ___________________ | Date: ___________

---

## Implementation Checklist (for CODER reference)

- [ ] Route registered in App.tsx with `ProtectedRoute role="SHIPPER"`
- [ ] LazyLoadable QuoteRequestPage component created in `src/features/shipper/pages/`
- [ ] Stub content renders with heading + message + AppShell visible
- [ ] Tests pass: E2E navigates to route without 404; no console errors
- [ ] Coverage ≥ 80% (if applicable to route registration)

---

## Governance References

- **Input Acceptance Gates:** `docs/standards/SDLC_GOVERNANCE_ALL_ROLES.md` § BA Input Acceptance
- **SDLC Workflow:** Full sequential flow (BA → ARCHITECT → HFD → CODER → REVIEWER → LIBRARIAN)
- **Sign-Off Requirements:** BA marks status READY_FOR_DESIGN before ARCHITECT begins

```

---

### CHG-003: Action Zone Structural Layout

**File Location:** `docs/business/stories/CHG-003_Action_Zone_Structural_Layout.md`

**Story Template:**

```markdown
# CHG-003: Action Zone Structural Layout (Missing Carrier Search Panel)

**Story ID:** CHG-003  
**Status:** READY_FOR_DESIGN  
**Phase:** Phase 10 (Shipper Dashboard Refinement)  
**Scope:** FRONTEND (Layout restructuring + component integration)  
**Effort:** 4 hours  
**Priority:** P0 (Blocks US-824 completion)

---

## User Story

**As a** Shipper  
**I want to** see the Action Zone with Quick Actions and Carrier Search side-by-side  
**So that** I can quickly post loads or search for carriers from the dashboard home

---

## Acceptance Criteria

### AC-1: Quick Actions Panel in Own Section
```gherkin
Given the Shipper Dashboard renders
When the Action Zone section displays
Then Quick Actions are wrapped in their own .panel-styled container
  And the container has role="region" and aria-label="Quick Actions"
  And the data-testid is "dashboard-quick-actions-panel"
  And all 4 buttons are visible: Post Load, Get A Quote, Track Shipments, Preferred Carriers
```

### AC-2: Carrier Search Panel in Own Section
```gherkin
Given the Action Zone section displays
Then Carrier Search is wrapped in its own .panel-styled container
  And the container has role="region" and aria-label="Carrier Search"
  And the data-testid is "dashboard-carrier-search-panel"
  And the search form (Origin/Destination/Equipment Type) is visible
  And the SEARCH button is visible and clickable
```

### AC-3: Side-by-Side Layout at Desktop
```gherkin
Given the viewport width is ≥1024px (desktop)
When the Action Zone renders
Then Quick Actions and Carrier Search display in a 2-column grid layout
  And both panels are equal width or proportional
  And the gap between panels is 16px (space-md per Style Guide)
  And no horizontal scrolling occurs
```

### AC-4: Responsive Stacking on Mobile/Tablet
```gherkin
Given the viewport width is <1024px (tablet/mobile)
When the Action Zone renders
Then Quick Actions and Carrier Search stack vertically
  And each panel spans full width
  And the gap between panels is 16px (space-md)
  And layout matches master prototype mobile behavior
```

### AC-5: Visual Compliance with Master Prototype
```gherkin
Given the master prototype shows Action Zone layout
When the deployed Action Zone renders
Then the visual structure matches:
  - Section heading: "Action Zone" (if applicable)
  - Left panel: Quick Actions with 4 buttons
  - Right panel: Carrier Search with search form
  - Panel styling: .panel class (white bg, grey border, shadow)
  - Spacing: All gaps are multiples of 8px per Style Guide §6.4
```

---

## Layout Specification

**Master Prototype Reference:** `docs/project/specs/us-824_reference.png`

**Current State (Incomplete):**
```
slotC (Action Zone wrapper)
└── Quick Actions (no panel styling)
    └── 4 buttons
```

**Required State:**
```
slotC (Action Zone container)
├── Panel 1: Quick Actions Panel (.panel-styled)
│   ├── Heading: "Quick Actions"
│   └── 4 buttons (Post Load, Get A Quote, Track Shipments, Preferred Carriers)
└── Panel 2: Carrier Search Panel (.panel-styled)
    ├── Heading: "Carrier Search"
    └── Search form (Origin/Destination/Equipment Type + SEARCH button)
```

---

## Dependencies

- **Depends on:** CHG-001 (route creation) — can proceed in parallel after CHG-001 design is locked
- **Blocks:** US-824 completion — structure must be in place before US-824 can be marked DONE
- **Related:** US-823 (provides dashboard scaffold/grid), US-825 (Carrier Search Panel details)

---

## Routes & Components

| Component | Status | Location |
|-----------|--------|----------|
| Quick Actions Panel | ✅ Exists | `src/features/shipper/dashboard/components/QuickActionsPanel.tsx` |
| Carrier Search Panel | ❌ MISSING | `src/features/shipper/dashboard/components/CarrierSearchPanel.tsx` (or integration TBD) |
| ShipperDashboardPage | ⚠️ Partial | `src/features/shipper/pages/ShipperDashboardPage.tsx` (slotC exists but incomplete) |

---

## BA Sign-Off

- [x] Story follows INVEST standard
- [x] AC written in Gherkin format (Given/When/Then)
- [x] Layout requirements clear (2-column desktop, stacked mobile)
- [x] No implementation details (ARCHITECT will design responsive breakpoints)
- [x] Scope is achievable in 4 hours
- [x] No conflicting AC with US-823 or US-824

**BA Sign-off:** ___________________ | Date: ___________

---

## Implementation Checklist (for CODER reference)

- [ ] Quick Actions wrapped in .panel-styled `<section>` with proper ARIA labels
- [ ] Carrier Search Panel imported and rendered in slotC
- [ ] Desktop (≥1024px): 2-column grid layout with 16px gap
- [ ] Mobile (<1024px): vertical stack layout
- [ ] All panels have correct data-testids
- [ ] Visual matches master prototype
- [ ] E2E tests pass for all breakpoints
- [ ] Coverage ≥ 80%

---

## Governance References

- **Input Acceptance Gates:** `docs/standards/SDLC_GOVERNANCE_ALL_ROLES.md` § BA Input Acceptance
- **SDLC Workflow:** Full sequential flow (BA → ARCHITECT → HFD → CODER → REVIEWER → LIBRARIAN)
- **Sign-Off Requirements:** BA marks status READY_FOR_DESIGN before ARCHITECT begins

```

---

## CHG-002: Style Guide Amendment or Archive (PENDING)

**Decision Status:** AWAITING BA INPUT

**Option A (if chosen):**
- File: `docs/business/stories/CHG-002_Style_Guide_Amendment.md`
- Scope: Formalize §6.6 button spec in Style Guide with actual `.btn-bronze` CSS values
- BA to create story once LIBRARIAN confirms Option A is preferred

**Option B (if chosen):**
- No story needed
- LIBRARIAN to archive prior compliance reviews directly
- Update `docs/project/learnings.md` Technical Debt Ledger with supersession note

**Please confirm preferred path so BA can proceed with story creation.**

---

## SUMMARY FOR BA

You are being asked to write **3 CHG stories**:

| CHG | File | Priority | Timeline |
|-----|------|----------|----------|
| CHG-001 | `CHG-001_Missing_Quote_Route_Fix.md` | P0 (Blocker) | Phase 1 (start immediately) |
| CHG-003 | `CHG-003_Action_Zone_Structural_Layout.md` | P0 (Blocker) | Phase 2 (after CHG-001 DONE) |
| CHG-002 | `CHG-002_[Option_A_or_B].md` | High | After CHG-001 & CHG-003 (pending decision) |

**Each story must:**
- Follow INVEST standard
- Have AC in Gherkin format (Given/When/Then)
- Be marked `READY_FOR_DESIGN` when complete
- Include BA sign-off with date
- Reference `docs/standards/SDLC_GOVERNANCE_ALL_ROLES.md`

**Sequence:**
1. Write CHG-001 + CHG-003 stories immediately (in parallel at BA stage)
2. Mark both as READY_FOR_DESIGN
3. ARCHITECT reviews CHG-001 (Phase 1), then CHG-003 (Phase 2) sequentially
4. Full SDLC workflow for each story

---

## Contact & Questions

If AC are ambiguous or you have questions during story creation, **escalate to LIBRARIAN immediately** (don't guess).

**LIBRARIAN:** [Name]  
**Date Decision Memo Sent:** 2026-06-14  
**Expected Story Completion Date:** [BA to estimate]

---

**Governance Authority:** `docs/standards/SDLC_GOVERNANCE_ALL_ROLES.md`  
**Reference Audit:** `.claude/HFD_REAUDIT_US824_2026-06-14.md`  
**Escalation:** `docs/project/CHG_ESCALATION_BATCH_2026-06-14.md`
