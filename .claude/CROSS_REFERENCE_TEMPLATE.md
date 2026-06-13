# Cross-Reference Template System

Use these templates to add consistent cross-references to all markdown files.

---

## Story File Template

Add this header section to every story file (US-###.md):

```markdown
# US-###: Story Title

**Story ID:** US-###  
**Phase:** Phase X  
**Status:** [Status]  
**Scope:** [Scope]  
**Effort:** [Effort]  
**Priority:** [Priority]

**📍 Related Documents**
- [[Story_Map.md|← Story Map (Master Index)]] — Find all stories here
- [[VAULT_INDEX.md]] — Complete documentation index
- [[docs/roles/BUSINESS_ANALYST.md]] — How stories are written
- **Dependencies:** [[US-###.md|Prerequisite Story]]
- **Enables:** [[US-###.md|Dependent Story]]

---

[REST OF STORY CONTENT HERE]

---

## Related Stories

| Story | Title | Status |
|-------|-------|--------|
| [[US-###.md\|US-###]] | Story Title | Status |
| [[US-###.md\|US-###]] | Story Title | Status |

---

## Navigation

[[Story_Map.md|← Back to Story Map]] | [[VAULT_INDEX.md|Documentation Index]]

**Last Updated:** [Date] | **Story File:** `docs/business/stories/US-###.md`
```

---

## Design Document Template

Add this header to design documents (DESIGN_*.md):

```markdown
# Design: Feature Name

**Architecture Status:** [Status]
**Related Story:** [[US-###.md|US-### Story Title]]
**Reviewed By:** [[docs/roles/ARCHITECT.md|ARCHITECT]]

**📍 Related Documents**
- [[Story_Map.md]] — User story details
- [[ARCHITECTURE.md]] — System design overview
- [[VAULT_INDEX.md]] — Documentation index
- **Review:** [[REVIEW_FeatureName.md|Architect Review]]

---

[REST OF DESIGN CONTENT HERE]

---

## Related Stories

- [[US-###.md|US-###]] — Primary story
- [[US-###.md|US-###]] — Secondary story

---

## Navigation

[[VAULT_INDEX.md|← Back to Index]] | [[Story_Map.md|Story Map]] | [[ARCHITECTURE.md|Architecture]]
```

---

## Role Document Template

Add this header to role files (ARCHITECT.md, CODER.md, etc.):

```markdown
# [Role Name] Role Definition

**Responsibility:** [What this role owns]
**Gate Authority:** [What gates they control]

**📍 Related Documentation**
- [[VAULT_INDEX.md]] — Documentation index
- [[docs/roles/]] — All role definitions
- [[CLAUDE.md]] — Global conventions
- [[docs/standards/]] — Technical standards

---

[REST OF ROLE CONTENT HERE]

---

## Related Roles

- [[docs/roles/ARCHITECT.md]] — Architecture design
- [[docs/roles/CODER.md]] — Implementation
- [[docs/roles/REVIEWER.md]] — Quality gates

---

## Navigation

[[VAULT_INDEX.md|← Back to Index]] | [[docs/roles/|All Roles]]
```

---

## Phase Document Template

Add this header to phase files (PHASE_X_*.md):

```markdown
# Phase X: Phase Title

**Phase Number:** X
**Status:** [Status]
**Stories:** [Count]

**📍 Related Documents**
- [[Story_Map.md|Story Map]] — All stories in this phase
- [[PROJECT_PLAN.md]] — Roadmap
- [[VAULT_INDEX.md]] — Documentation index

**Stories in This Phase:**
- [[US-###.md|US-###]] — Story Title
- [[US-###.md|US-###]] — Story Title

---

[REST OF PHASE CONTENT HERE]

---

## Navigation

[[PROJECT_PLAN.md|← Full Roadmap]] | [[Story_Map.md|Story Map]] | [[VAULT_INDEX.md|Documentation]]
```

---

## Standard Document (e.g., ARCHITECTURE.md, FEATURES.md)

Add this header:

```markdown
# Document Title

**Purpose:** [What this document is for]
**Status:** [Current status]

**📍 Quick Links**
- [[Story_Map.md]] — User stories
- [[VAULT_INDEX.md]] — Documentation index
- [[PROJECT_PLAN.md]] — Roadmap

---

[REST OF CONTENT HERE]

---

## Related Documentation

- [[ARCHITECTURE.md]] — System design
- [[FEATURES.md]] — Feature catalog
- [[REQUIREMENTS.md]] — Requirements
- [[Story_Map.md]] — User stories

---

## Navigation

[[VAULT_INDEX.md|← Back to Index]]
```

---

## How to Apply Templates

### For Story Files (48 files)
1. Add header with Story_Map link
2. Add "Related Stories" section
3. Add footer with navigation

Pattern:
```markdown
**📍 Related Documents**
- [[Story_Map.md|← Story Map]]
- Depends on: [[US-###.md|US-###]]
- Enables: [[US-###.md|US-###]]
```

### For Design Documents (~40 files)
1. Add header with story reference
2. Add review status
3. Link to architecture

### For Role Documents (6 files)
1. Add header with role definition
2. Link to other roles
3. Link to standards

### For Phase Documents (~10 files)
1. Add header with phase info
2. List all stories in phase
3. Link to roadmap

### For Standard Docs (~80 files)
1. Add header with purpose
2. Link to related docs
3. Add navigation footer

---

## Batch Implementation Order

**Priority 1 (Core):**
- Story files (48 files) — Add Story_Map back-link
- Story_Map.md — Already partially done
- VAULT_INDEX.md — Already created

**Priority 2 (Architecture):**
- Design documents (~40 files)
- ARCHITECTURE.md
- Phase documents (~10 files)

**Priority 3 (Roles & Standards):**
- Role documents (6 files)
- Standard files (~80 files)
- Configuration files

---

## Implementation Checklist

- [ ] Story files: Header + Story_Map link + footer
- [ ] Design documents: Link to stories + architecture
- [ ] Phase documents: List stories + roadmap links
- [ ] Role documents: Link all roles + standards
- [ ] Standard docs: Link to related docs
- [ ] Verify no broken links
- [ ] Update VAULT_INDEX with new links
- [ ] Commit all changes

---

**Template Version:** 1.0  
**Last Updated:** 2026-06-12  
**Purpose:** Ensure consistent cross-referencing across all 500+ markdown files
