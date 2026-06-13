# FreightClub Vault Guide

How to use the cross-referenced markdown system for fast document discovery.

---

## 📁 Vault Structure

Your documentation is organized into these main categories:

```
freightclub/
├── Root Level (Quick Access)
│   ├── README.md                    — Project overview
│   ├── CLAUDE.md                    — AI conventions
│   ├── ARCHITECTURE.md              — System design
│   ├── FEATURES.md                  — Feature catalog
│   ├── PROJECT_PLAN.md              — Roadmap
│   └── VAULT_INDEX.md               — This index (START HERE)
│
├── docs/
│   ├── architecture/                — Design & technical decisions
│   ├── business/                    — Stories, personas, requirements
│   ├── roles/                       — Role definitions & gates
│   ├── standards/                   — Technical standards
│   ├── testing/                     — Testing guides & specs
│   ├── governance/                  — Governance & processes
│   ├── hfd/                         — Human Factors Design specs
│   ├── design/                      — Design files & assets
│   ├── project/                     — Project tracking & sprints
│   ├── sprints/                     — Sprint logs
│   └── archive/                     — Historical documentation
│
├── .claude/
│   ├── VAULT_GUIDE.md               — This file
│   ├── CLAUDE.md                    — Global AI instructions
│   ├── MEMORY.md                    — Auto-saved project memory
│   ├── learnings.md                 — Technical debt ledger
│   ├── rules/                       — Operating rules & protocols
│   │   ├── postgres-native.md       — DB standards
│   │   ├── ui-standards.md          — Frontend standards
│   │   ├── testing_standards.md     — QA requirements
│   │   ├── reviewer-checklist.md    — Review gates
│   │   └── [other protocols]
│   ├── settings.json                — Harness configuration
│   └── keybindings.json             — VS Code bindings
│
└── docs/roles/
    ├── ARCHITECT.md                 — Architecture responsibilities
    ├── CODER.md                     — Implementation rules
    ├── REVIEWER.md                  — QA & security gates
    ├── LIBRARIAN.md                 — Documentation & ceremonies
    ├── BUSINESS_ANALYST.md          — Requirements & stories
    └── HUMAN_FACTORS_DESIGNER.md    — UX/UI design
```

---

## 🔗 Linking System

### Obsidian Wiki-Style Links (Recommended)

Use double brackets for internal links:

```markdown
# In any markdown file:
See [[ARCHITECTURE.md]] for system design
Or [[VAULT_INDEX]] to return to the index
```

**Benefits:**
- Vault automatically creates bidirectional links
- Graph view shows connections
- Backlinks panel shows what links to each document
- Auto-completion when you start typing `[[`

### Markdown-Style Links (Fallback)

For compatibility, also use standard markdown:

```markdown
See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
Or [index](./VAULT_INDEX.md) to return to the index
```

### Path Conventions

From **root directory**:
```markdown
[[docs/architecture/ARCHITECTURE.md]]
[[docs/roles/CODER.md]]
[[.claude/rules/testing_standards.md]]
```

From **within docs/**:
```markdown
[[architecture/ARCHITECTURE.md]]
[[roles/CODER.md]]
```

---

## 🎯 Quick Navigation Tips

### 1. Start with VAULT_INDEX.md
Every search starts here. It has links to all major documents organized by topic.

```
Open: VAULT_INDEX.md (root level)
├── Quick jump to any category
├── Follow links to detailed docs
└── Return here from any document
```

### 2. Use Obsidian's Quick Open
**Shortcut:** Cmd+O (Mac) or Ctrl+O (Windows)

```
Type a few letters to find any document:
- "arch" → finds ARCHITECTURE.md
- "coder" → finds CODER.md
- "phase" → finds all phase documents
- "us-" → finds all user stories
```

### 3. Use the Graph View
**Purpose:** Visualize how documents connect

```
View → Graph View (or Cmd+E)
Shows:
- Which documents reference each other
- Document clusters by topic
- Orphaned documents needing links
```

### 4. Use Backlinks Panel
**Purpose:** See what links to the current document

```
Backlinks panel (right sidebar):
Opens when you select any document
Shows: All files that link to the current document
Helps: Understand document relationships
```

### 5. Search Across All Docs
**Shortcut:** Cmd+F (Mac) or Ctrl+F (Windows)

```
Search for:
- Exact text: "JWT authentication"
- Document names: "PHASE 7"
- Tags: "#critical" or "#blocker"
- Linked files: Check backlinks panel
```

---

## 📋 Document Naming Convention

All documents follow a consistent naming scheme for easy discovery:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `UPPERCASE_WITH_UNDERSCORES` | `PROJECT_PLAN.md` | Root-level reference docs |
| `ROLE_Name.md` | `ARCHITECT.md` | Role definitions |
| `PHASE_#_Name.md` | `PHASE_3_COMPLETION.md` | Phase documentation |
| `US-###.md` | `US-501.md` | User story files |
| `CHG-###.md` | `CHG-703.md` | Change requests |
| `CamelCase.md` | `QuickPayDesign.md` | Design & spec docs |
| `verb_noun.md` | `test_coverage.md` | How-to guides |

---

## 🔄 Linking Best Practices

### DO ✅
```markdown
# Good: Links with context
For implementation details, see [[CODER.md]]
Review the [[testing_standards.md|testing standards]] before submitting
Check the [[VAULT_INDEX]] for a complete document map
```

### DON'T ❌
```markdown
# Bad: Orphaned documents
This file has no links to other documents
(makes it hard to discover)

# Bad: Ambiguous links
See [[files]] for more info
(unclear which file is being referenced)

# Bad: Dead links
See [[NoExistentDocument.md]]
(link target doesn't exist)
```

---

## 📊 Document Hierarchy

### Tier 1: Entry Points (Always Linked)
These documents must be discoverable from VAULT_INDEX:
- `README.md`
- `CLAUDE.md`
- `ARCHITECTURE.md`
- `FEATURES.md`
- `PROJECT_PLAN.md`
- `docs/project/Story_Map.md`

### Tier 2: Reference Documents (Category-Linked)
Organized under categories in VAULT_INDEX:
- Design documents (`docs/architecture/`)
- Role definitions (`docs/roles/`)
- Standards (`docs/standards/`, `.claude/rules/`)
- Story files (`docs/business/stories/`)

### Tier 3: Supporting Documents (Cross-Linked)
Referenced from Tier 1 & 2 documents:
- Phase documentation
- Individual user stories
- Design reviews
- Sprint logs

---

## 🛠️ Setting Up Your Vault

### Obsidian Setup (Recommended)

1. **Open Vault**
   ```
   File → Open Folder as Vault
   Select: c:\projects\freightclub
   ```

2. **Enable Core Plugins**
   ```
   Settings → Core Plugins
   ☑ Backlinks
   ☑ Graph View
   ☑ Search
   ☑ File Tree
   ☑ Quick Switcher
   ```

3. **Configure Appearance**
   ```
   Settings → Appearance
   Theme: Dark (or your preference)
   Font: Monospace for code blocks
   ```

4. **Create Saved Searches** (Optional)
   ```
   Cmd+Shift+F → Search for pattern → Save search
   Examples:
   - path:docs/roles/ (all role files)
   - path:docs/architecture/ (all architecture docs)
   - tag:#blocker (all blocker items)
   ```

### VS Code Setup (Alternative)

If using VS Code with Markdown Preview Enhanced:

1. **Install Extensions**
   ```
   - Markdown Preview Enhanced
   - Markdown All In One
   - Peacock (for file organization)
   ```

2. **Use Breadcrumb Navigation**
   ```
   View → Breadcrumb
   Shows: File location hierarchy
   ```

3. **Enable Symbol Outline**
   ```
   Outline panel shows document structure
   Cmd+Shift+O → Quick symbol jump
   ```

---

## 🔍 Searching Strategies

### Find Documents by Topic

| Need | Search | Result |
|------|--------|--------|
| All architecture docs | `path:docs/architecture` | Design specs |
| All role definitions | `path:docs/roles` | Role documents |
| All tests | `path:testing` | Test guides |
| All stories | `path:docs/business/stories` | Story files |
| Phase docs | `PHASE` | All phase files |

### Find Documents by Content

```
Search: "JWT authentication"
Results: All documents mentioning JWT
→ Helps find docs about a specific feature
```

### Find Cross-References

```
Use Backlinks panel:
Open any document
Right panel shows: All files linking to it
Helps: Understand document dependencies
```

---

## 🚀 Workflow: Finding Information Fast

### Scenario 1: "I need to implement a feature"
```
1. Open VAULT_INDEX.md
2. Find feature in "Core Documentation"
3. Click link to FEATURES.md
4. Find your feature
5. Click link to User Story (US-###.md)
6. Click link to ARCHITECT.md design
7. Click link to CODER.md implementation guide
→ Total: 4-5 clicks from start to implementation
```

### Scenario 2: "I need to review code"
```
1. Open VAULT_INDEX.md
2. Scroll to "Standards & Governance"
3. Click link to REVIEWER.md
4. Click link to testing_standards.md
5. Click link to reviewer-checklist.md
→ All QA gates in 3 clicks
```

### Scenario 3: "What's the status of Phase 7?"
```
1. Open VAULT_INDEX.md
2. Scroll to "Project Management" → "Phases"
3. Click Phase 7 link
4. Click PHASE7_COMPLETION_STATUS.md link
5. Click linked sign-off documents
→ Full status in 2-3 clicks
```

---

## 📝 Adding New Documents

When creating a new markdown file:

1. **Create in proper directory**
   ```
   Feature spec → docs/architecture/
   User story → docs/business/stories/
   Phase doc → docs/archive/phases/
   Role doc → docs/roles/
   ```

2. **Add front-matter** (optional but recommended)
   ```markdown
   ---
   title: Document Title
   date: 2026-06-12
   related: [[RELATED_DOC.md]], [[ANOTHER_DOC.md]]
   ---
   ```

3. **Link back to VAULT_INDEX**
   ```markdown
   See [[VAULT_INDEX]] for document overview
   ```

4. **Add relevant links within document**
   ```markdown
   Implements: [[ARCHITECTURE.md|system architecture]]
   Related stories: [[US-501.md]], [[US-502.md]]
   ```

5. **Update VAULT_INDEX.md**
   ```markdown
   Add link to new document in appropriate category
   Maintain alphabetical order within categories
   ```

---

## 🎯 Pro Tips

### Quick Access
- **Most Used:** Pin VAULT_INDEX to favorites (Cmd+Shift+F in Obsidian)
- **Recent Files:** Cmd+P → Recently opened documents
- **Hotkeys:** Set custom keyboard shortcuts for frequently accessed docs

### Efficiency
- **Tab Navigation:** Middle-click links to open in new tab
- **Workspace:** Save a layout with: VAULT_INDEX + ROLE + Current Feature
- **Templates:** Use template files for consistent new doc structure

### Graph Visualization
- **Zoom:** Scroll to zoom in/out
- **Pan:** Click-drag to move around
- **Filter:** Click node to highlight connected documents
- **Export:** Graph view is great for presentations

---

## 🔐 Vault Management

### Backup
```powershell
# Weekly backup
Copy-Item -Path c:\projects\freightclub -Destination c:\backup\freightclub-$(Get-Date -Format yyyyMMdd) -Recurse
```

### Sync
```powershell
# All markdown is version controlled
git add docs/ *.md .claude/
git commit -m "docs: update vault documentation"
```

### Maintenance
- **Review broken links** regularly via Graph View
- **Remove orphaned documents** that have no backlinks
- **Update VAULT_INDEX** when adding major documents
- **Archive old documents** to `docs/archive/`

---

## 📞 Getting Help

### Quick Questions
- **How do I find X?** → Check VAULT_INDEX first
- **What role does X play?** → See docs/roles/
- **What phase is X in?** → Check Project_Plan.md

### Common Tasks
- **Implementing a feature** → CODER.md + Feature design spec
- **Reviewing code** → REVIEWER.md + reviewer-checklist.md
- **Writing stories** → BUSINESS_ANALYST.md + STORY_MAP_GUARDRAILS_TEMPLATE.md
- **Debugging** → DEBUG_REGISTRATION.md, CRITICAL_ISSUES_STATUS.md

---

## ✅ Vault Checklist

Before sharing your vault:
- [ ] VAULT_INDEX.md exists and is complete
- [ ] All Tier 1 documents have entries in VAULT_INDEX
- [ ] Key documents link back to VAULT_INDEX
- [ ] No broken links (check Graph View)
- [ ] Naming convention is consistent
- [ ] README explains how to use the vault

---

**Vault Status:** 🟢 Complete cross-reference system  
**Last Updated:** 2026-06-12  
**Maintainer:** Librarian

**Next Steps:**
1. Open this vault in Obsidian or VS Code
2. Start with [[VAULT_INDEX]]
3. Use Cmd+O to quick-jump between documents
4. Enable Graph View to see connections
