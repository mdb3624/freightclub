# Story Supporting Documentation Guide

## Overview

Stories need supporting documentation to succeed. This guide explains **where to store** and **how to link** documentation for stories in both local files and Jira.

---

## The Two-Layer System

### Layer 1: Local Files (Source of Truth)
**Location:** `docs/` subdirectories  
**Authority:** Primary reference for detailed specs, AC, designs  
**Format:** Markdown, images, diagrams  
**Lifecycle:** Committed to git, archived after story completion

### Layer 2: Jira (Team Collaboration)
**Location:** Story description + linked documents  
**Authority:** Live workflow, team comments, task tracking  
**Format:** Description text + linked file paths + comments  
**Lifecycle:** Open during development, historical reference after merge

---

## Types of Supporting Documentation

### 1. **Design Specification** (HFD Responsibility)
**When Needed:** All frontend stories; backend stories with UI components

**What It Contains:**
- Wireframes / mockups
- Component hierarchy
- Responsive specs (mobile/desktop)
- Color/typography specs
- Interaction flows
- Accessibility requirements

**Where to Store:**
```
docs/hfd/
├── US-730_Carrier_Dashboard_Design_Spec.md
├── US-730_Wireframes.png
├── US-730_Component_Hierarchy.md
└── images/
    ├── us-730-mobile-mockup.png
    └── us-730-desktop-mockup.png
```

**Example Link in Jira:**
```
Design Spec: docs/hfd/US-730_Carrier_Dashboard_Design_Spec.md
Figma: https://figma.com/file/...
```

### 2. **Architecture / API Specification** (ARCHITECT Responsibility)
**When Needed:** All backend stories; stories with cross-service calls

**What It Contains:**
- API endpoints (paths, methods, params)
- Request/response schemas
- Database schema changes
- Integration points
- Security considerations
- Performance notes

**Where to Store:**
```
docs/architecture/
├── US-730_API_Specification.md
├── US-730_Schema_Changes.md
└── diagrams/
    ├── us-730-data-flow.png
    └── us-730-service-diagram.png
```

**Example Link in Jira:**
```
API Spec: docs/architecture/US-730_API_Specification.md
Database: docs/architecture/US-730_Schema_Changes.md
```

### 3. **Acceptance Criteria Detail** (BA Responsibility)
**When Needed:** Stories with complex AC or edge cases

**What It Contains:**
- Detailed Gherkin scenarios
- Edge case definitions
- Business rule clarifications
- Calculation formulas
- Data examples

**Where to Store:**
```
docs/business/stories/
├── US-730_Carrier_Dashboard_MVP.md (includes AC)
└── US-730_AC_Details.md (if lengthy)
```

**Example in Story File:**
```markdown
## Acceptance Criteria

### AC-1: Cost Profile Setup
[Full Gherkin with examples]

See US-730_AC_Details.md for edge cases and calculation examples.
```

### 4. **Test Plan & Scenarios** (CODER/QA Responsibility)
**When Needed:** Stories with complex test coverage

**What It Contains:**
- Test scenarios (happy path + edge cases)
- Test data setup
- Expected results
- Performance benchmarks
- Browser/device coverage

**Where to Store:**
```
docs/testing/
├── US-730_Test_Plan.md
├── US-730_Test_Data.sql
└── screenshots/
    ├── us-730-mobile-happy-path.png
    └── us-730-error-state.png
```

**Example Link in Jira:**
```
Test Plan: docs/testing/US-730_Test_Plan.md
```

### 5. **Audit / Review Documents** (REVIEWER Responsibility)
**When Needed:** After code review, before DONE status

**What It Contains:**
- Gate verification checklist
- Test coverage report
- Performance metrics
- Security audit results
- Accessibility audit results

**Where to Store:**
```
docs/project/
├── REVIEWER_SIGN_OFF_US730.md
├── LIBRARIAN_SIGN_OFF_US730.md
└── test-results/
    ├── us-730-coverage-report.html
    └── us-730-lighthouse-report.html
```

**Example Link in Jira:**
```
Review: docs/project/REVIEWER_SIGN_OFF_US730.md
```

---

## How to Link Documentation in Jira

### Method 1: Description Field (Best for Quick Links)

**In Jira Story Description:**
```markdown
# US-730: Carrier Dashboard MVP

## Documentation

**Design:** [Spec](https://github.com/freightclub/freightclub/blob/main/docs/hfd/US-730_Design.md)
**API:** [Endpoints](docs/architecture/US-730_API.md)
**AC Detail:** [Edge Cases](docs/business/stories/US-730_AC_Details.md)
**Tests:** [Test Plan](docs/testing/US-730_Test_Plan.md)

## Story

As an owner-operator...
```

### Method 2: Comments (For Updates During Development)

**During Implementation:**
```
CODER: Starting implementation. Created test fixtures at:
docs/testing/US-730_Test_Fixtures.sql

REVIEWER: Test fixtures approved. Adding coverage report:
docs/project/US-730_Coverage_Report.html
```

### Method 3: Linked Issues (For Cross-Story Dependencies)

**In Jira Link Section:**
```
Blocks: US-730a (Cost Profile)
Blocked by: US-730-0 (Design Spec)
Related: US-731 (P&L Report)
```

### Method 4: Attachments (For Quick Reference)

**Direct File Upload to Jira:**
```
[Attach File] → us-730-wireframe.png
[Attach File] → us-730-test-checklist.pdf
```

⚠️ **Note:** Prefer local files in git over Jira attachments (better version control)

---

## File Organization Best Practices

### By Type (Recommended)
```
docs/
├── hfd/                           # Design specs
│   ├── US-730_Design_Spec.md
│   └── images/
├── architecture/                  # API, schema, diagrams
│   ├── US-730_API.md
│   └── diagrams/
├── business/stories/              # Story files + AC details
│   ├── US-730_Carrier_Dashboard_MVP.md
│   └── US-730_AC_Details.md
├── testing/                       # Test plans, fixtures
│   ├── US-730_Test_Plan.md
│   └── fixtures/
└── project/                       # Sign-offs, audits
    ├── REVIEWER_SIGN_OFF_US730.md
    └── LIBRARIAN_SIGN_OFF_US730.md
```

### By Story (Alternative)
```
docs/stories/US-730/
├── design_spec.md
├── api_specification.md
├── test_plan.md
├── ac_details.md
├── wireframes/
└── images/
```

**Recommendation:** Use "By Type" organization (easier to find all designs, all tests, etc.)

---

## Linking Between Files

### In Local Markdown Files

**Link to related documentation:**
```markdown
## See Also

- **Design Spec:** [US-730 Design](../../hfd/US-730_Design_Spec.md)
- **API Spec:** [US-730 API](../../architecture/US-730_API.md)
- **Acceptance Criteria:** See AC section below
- **Test Plan:** [US-730 Tests](../../testing/US-730_Test_Plan.md)

## Jira

- **Story:** https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-62
- **Child Stories:** FREIG-63 (Design), FREIG-64 (Cost Profile), etc.
```

### In Jira Issues

**Link back to local files:**
```
Local Story File: https://github.com/freightclub/freightclub/blob/main/docs/business/stories/US-730_Carrier_Dashboard_MVP.md

Design Spec: /docs/hfd/US-730_Design_Spec.md
API Spec: /docs/architecture/US-730_API.md
Test Plan: /docs/testing/US-730_Test_Plan.md
```

### GitHub Relative Links

**From any markdown file, reference others:**
```markdown
See [US-730 Design Spec](../hfd/US-730_Design_Spec.md)
See [US-730 API](../architecture/US-730_API.md)
```

---

## Documentation Timeline by Story Phase

### Phase: TO DO (Awaiting Design)
**Required Documentation:**
- ✅ Story file with user story + initial AC
- ✅ Jira issue with description
- ⏳ Design spec (HFD owns)
- ⏳ API spec (ARCHITECT owns)

**Who Adds It:**
- BA: Story file
- HFD: Design spec → link in Jira comment
- ARCHITECT: API spec → link in Jira comment

### Phase: IN PROGRESS (Implementation)
**Required Documentation:**
- ✅ Test plan (CODER creates)
- ✅ Updated AC if clarifications needed
- ✅ Temporary design notes (if design changed)
- ⏳ Test fixtures / setup data

**Who Adds It:**
- CODER: Creates test plan, links in Jira comments
- CODER: Creates test fixtures, links in PR description
- HFD: Approves any design changes

### Phase: DONE (Code Review)
**Required Documentation:**
- ✅ Test coverage report
- ✅ REVIEWER sign-off document
- ✅ LIBRARIAN sign-off document
- ✅ Performance metrics (if applicable)

**Who Adds It:**
- CODER: Test coverage → link in Jira before closing
- REVIEWER: Sign-off doc → link in Jira comment
- LIBRARIAN: Archival note → local story file status update

---

## Example: Complete Documentation for US-730

### Local Files Structure
```
docs/
├── business/stories/
│   ├── US-730_Carrier_Dashboard_MVP.md          ← Main story file
│   └── US-730_AC_Details.md                     ← AC edge cases
├── hfd/
│   ├── US-730_Design_Spec.md                    ← Mobile-first design
│   └── images/
│       ├── us-730-dashboard-wireframe.png
│       ├── us-730-mobile-mockup.png
│       └── us-730-component-hierarchy.md
├── architecture/
│   ├── US-730_API_Specification.md              ← REST endpoints
│   ├── US-730_Schema_Changes.sql                ← New tables
│   └── diagrams/
│       ├── us-730-data-flow.png
│       └── us-730-service-diagram.png
├── testing/
│   ├── US-730_Test_Plan.md
│   ├── US-730_Test_Fixtures.sql
│   └── screenshots/
│       ├── us-730-mobile-happy-path.png
│       └── us-730-error-state.png
└── project/
    ├── REVIEWER_SIGN_OFF_US730.md
    └── LIBRARIAN_SIGN_OFF_US730.md
```

### Jira Issue (FREIG-62)

**Description:**
```markdown
# US-730: Carrier Dashboard MVP

## Documentation
- **Story File:** docs/business/stories/US-730_Carrier_Dashboard_MVP.md
- **Design Spec:** docs/hfd/US-730_Design_Spec.md
- **API Spec:** docs/architecture/US-730_API_Specification.md
- **AC Details:** docs/business/stories/US-730_AC_Details.md

## Story
As an owner-operator, I want a dashboard...
```

**Comments During Development:**
```
[HFD Comment] Design spec locked:
docs/hfd/US-730_Design_Spec.md ✅

[CODER Comment] Test plan created:
docs/testing/US-730_Test_Plan.md ✅

[REVIEWER Comment] Coverage report:
docs/project/US-730_Coverage_Report.html
Review sign-off: docs/project/REVIEWER_SIGN_OFF_US730.md ✅
```

---

## Quick Checklist: Documentation for New Story

- [ ] **Story file created** with user story + AC → `docs/business/stories/US-###.md`
- [ ] **Jira issue created** with link to story file
- [ ] **Design spec** (if frontend) → `docs/hfd/US-###_Design.md` → link in Jira
- [ ] **API spec** (if backend) → `docs/architecture/US-###_API.md` → link in Jira
- [ ] **AC details** (if complex) → `docs/business/stories/US-###_AC_Details.md` → link in story file
- [ ] **Test plan** (during implementation) → `docs/testing/US-###_Test_Plan.md` → link in Jira
- [ ] **Sign-offs** (after review) → `docs/project/REVIEWER_SIGN_OFF_US###.md` → link in Jira
- [ ] **All files committed to git**
- [ ] **Jira description links to local files**
- [ ] **Local files cross-reference Jira links**

---

## Common Questions

### Q: Where should I store wireframes?
**A:** `docs/hfd/images/` or Figma (link in Jira comment)

### Q: How do I attach large files (PDFs, Figma links)?
**A:** Use Jira comments with links, not attachments. Better version control in git.

### Q: Can I edit documentation after story is DONE?
**A:** Yes, but create new version (US-###-v2). Original stays archived.

### Q: Who owns documentation?
**A:** By phase:
- **TO DO:** HFD (design), ARCHITECT (API), BA (AC)
- **IN PROGRESS:** CODER (tests), HFD (design updates)
- **DONE:** REVIEWER (sign-off), LIBRARIAN (archival)

### Q: Should documentation be in git or Jira?
**A:** **Git is primary** (version controlled, linked). Jira is **secondary** (links to git files).

---

## File Naming Conventions

**Standard Pattern:** `US-###_[Description].md`

Examples:
```
✅ US-730_Design_Spec.md
✅ US-730_API_Specification.md
✅ US-730_Test_Plan.md
✅ US-730_AC_Details.md
❌ design.md (unclear which story)
❌ US730_api.md (missing hyphen, lowercase extension)
```

---

## Tools & Integration

### GitHub (Version Control)
```
- Click file → "Raw" to view as plain text
- Copy raw URL for Jira links
- All files automatically versioned
```

### Jira (Team Collaboration)
```
- Description field: Primary links
- Comments: Updates during development
- Custom fields: Can add "Design Doc" link field
```

### Figma (Visual Design)
```
- Create design file
- Share link in Jira comment
- Link back to GitHub for specs
```

### Google Docs (Shared Editing)
```
- For real-time collaboration
- Link in Jira comment
- Export to markdown for git archive
```

---

**Authority:** JIRA_WORKFLOW.md | CLAUDE.md Sequential Lock Protocol  
**Last Updated:** 2026-06-23
