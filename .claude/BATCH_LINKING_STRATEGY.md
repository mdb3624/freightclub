# Batch Linking Strategy: Add Cross-References to All Markdown Files

## Current Status

✅ **Completed:**
- Story_Map.md — Updated with links to all Phase 1-10 stories
- README.md — Added vault navigation links
- VAULT_INDEX.md — Created master index (500+ docs)
- .claude/VAULT_GUIDE.md — Complete vault navigation guide
- .claude/LINKING_QUICK_REFERENCE.md — Template for adding links

**Current Work:** Adding bidirectional cross-references to all 500+ markdown files

---

## Three-Phase Batch Linking Plan

### Phase 1: Story Files (48 files) — IN PROGRESS

**Goal:** Link every story to Story_Map and related stories

**Header Template:**
```markdown
# US-###: Story Title

**Phase:** X  
**Status:** [Status]

**📍 Related Documents**
- [[Story_Map.md|← Story Map (Master Index)]]
- [[VAULT_INDEX.md]] — Documentation index
- **Depends On:** [[US-###.md|US-###]] (if applicable)
- **Enables:** [[US-###.md|US-###]] (if applicable)

---
```

**Footer Template:**
```markdown
---

## Navigation

[[Story_Map.md|← Back to Story Map]] | [[VAULT_INDEX.md|Documentation Index]]
```

**Manual Process (Recommended for Control):**

For each story file, add header after title and before content:
```bash
# For US-101 through US-900
Add this section after "# US-###" and first "---":

**📍 Related Documents**
- [[Story_Map.md]] - Story Map
- [[VAULT_INDEX.md]] - Documentation Index

# Then add footer before end:
---
## Navigation
[[Story_Map.md|← Back]] | [[VAULT_INDEX.md|Index]]
```

### Phase 2: Design & Architecture (60+ files)

**Files to Update:**
- docs/architecture/DESIGN_*.md (15 files)
- docs/architecture/REVIEW_*.md (10 files)
- docs/hfd/*.md (5+ files)
- docs/design/*.md (30+ files)

**Header for Design Docs:**
```markdown
# Design: Feature Name

**Related Story:** [[US-###.md|US-### Story Title]]
**Status:** [Review Status]

**📍 Related Documents**
- [[Story_Map.md]] — Story details
- [[ARCHITECTURE.md]] — System design overview
- [[VAULT_INDEX.md]] — Documentation index

---
```

### Phase 3: Standards & Reference (150+ files)

**Files to Update:**
- docs/roles/*.md (6 files) — Link all roles to each other
- docs/standards/*.md (20+ files) — Link to architecture
- docs/archive/phases/*.md (10 files) — Link to Story_Map
- docs/business/personas/*.md (5 files)
- docs/sprints/*.md (30+ files) — Link to Story_Map

**Header for Standards:**
```markdown
# [Document Title]

**Purpose:** [What this is for]

**📍 Quick Links**
- [[Story_Map.md]] — User stories
- [[VAULT_INDEX.md]] — Documentation index
- [[ARCHITECTURE.md]] — System design

---
```

---

## Implementation Options

### Option A: Manual Batch Editing (RECOMMENDED)

1. Open VS Code
2. Use Find & Replace across files:
   - Find: `^# US-(\d+):` 
   - Replace with header + story content
3. Verify each edit
4. Commit in batches (10 files at a time)

**Pros:** Visual control, easy to verify  
**Cons:** Manual effort, slower  
**Time:** ~2-3 hours for 48 story files

### Option B: Script-Based (Requires Fixing)

Fix the PowerShell script in `.claude\Add-CrossReferences.ps1`:
- Remove `Join-String` cmdlet (not available in older PS)
- Use simple string concatenation instead
- Test on 1 file first

**Pros:** Fast, automated  
**Cons:** Requires debugging  
**Time:** 30 mins setup + 5 mins execution

### Option C: Hybrid Approach (BEST BALANCE)

1. Group files by similarity
2. Use global find-replace for header insertion
3. Manually verify 10% sample
4. Apply to rest

**Time:** ~1 hour for 48 story files

---

## Quick Implementation Checklist

### Step 1: Prepare Headers (5 mins)
- [ ] Copy header template above
- [ ] Copy footer template above

### Step 2: Story Files (48 files)

**Batch 1: Phase 1-2 Stories (8 files)**
```
US-101.md ✅ (already done)
US-102.md
US-103.md
US-104.md
US-105.md
US-201.md
US-202.md
US-203.md
```

**Batch 2: Phase 3-4 Stories (9 files)**
```
US-301.md
US-302.md
US-303.md
US-305.md
US-308.md
US-401.md
US-402.md
US-403.md
US-405.md
```

**Batch 3: Phase 5-6 Stories (8 files)**
```
US-502.md
US-506.md
US-601.md (MIGRATION_PENDING - no file)
US-602.md (MIGRATION_PENDING - no file)
...
```

### Step 3: Design Files (60 files)

Link each design file to related stories in Story_Map

### Step 4: Standards Files (150 files)

Link roles, standards, and phase docs to Story_Map

---

## Validation Checklist

After each batch:
- [ ] No broken links (check Graph View in Obsidian)
- [ ] Bidirectional references work
- [ ] Files commit without errors
- [ ] Navigation paths follow: Document → Story_Map → VAULT_INDEX

---

## Expected Results

**After Completion:**
- ✅ All 48 story files link to Story_Map
- ✅ All design docs link to related stories
- ✅ All role docs link to each other
- ✅ All phase docs link to their stories
- ✅ Complete graph of 500+ interconnected documents
- ✅ Users can navigate entire vault using [[links]]
- ✅ Obsidian Graph View shows full network

---

## Priority Order (if time-limited)

1. **CRITICAL (Do First):**
   - US-101 through US-105 (Phase 1) — Foundation
   - Story_Map.md — Master index ✅
   - VAULT_INDEX.md — Entry point ✅

2. **HIGH (Next):**
   - All Phase 7-10 stories — Active development
   - Design documents for phases 7-10
   - Role documents (6 files)

3. **MEDIUM (Nice to Have):**
   - Remaining story files
   - Archive phase documents

4. **LOW (Future):**
   - Sprint logs
   - Archived stories
   - Historical documents

---

## Commands to Run After Updates

```bash
# Verify no broken links
grep -r "\[\[.*\.md\]\]" docs/ | grep -v "Story_Map\|VAULT_INDEX" | head -20

# Count updated files
find docs/ -name "*.md" -exec grep -l "📍 Related Documents" {} \; | wc -l

# Check for orphaned files (files with no backlinks)
# In Obsidian: Graph View → look for isolated nodes
```

---

## Timeline Estimate

| Phase | Files | Manual Time | Script Time |
|-------|-------|-------------|------------|
| Stories (Phase 1-4) | 17 | 30 mins | 2 mins |
| Stories (Phase 5-10) | 31 | 1 hour | 3 mins |
| Design docs | 60 | 1.5 hours | 5 mins |
| Standards/Roles | 150 | 2 hours | 10 mins |
| **TOTAL** | **500+** | **4-5 hours** | **20 mins** |

---

**Recommendation:** Use hybrid approach (manual for first batch to establish pattern, then script for rest)

**Next Steps:**
1. ✅ Story_Map.md updated with links
2. → Batch-update Phase 1-2 story files manually
3. → Create working script for remaining files
4. → Update design documents
5. → Update standards documents
