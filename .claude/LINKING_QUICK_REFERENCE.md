# Linking Quick Reference

Copy-paste templates for adding cross-references to your documents.

---

## 📌 Document Header Template

Use at the top of every new document:

```markdown
# Document Title

Brief one-line description.

## Related Documents
- [[VAULT_INDEX.md]] — Complete document index
- [[RELEVANT_DOC.md]] — What this relates to
- [[ANOTHER_DOC.md]] — Another related doc

---

## Content here...
```

---

## 🔗 Common Linking Patterns

### When Writing a User Story

```markdown
# US-501: Quick Pay Settlement

**Phase:** [[PHASE_5_COMPLETION.md|Phase 5 (Payments)]]
**Architect Design:** [[DESIGN_PaymentAccountSetup_US502.md]]
**Role:** [[CODER.md|Implementation by Coder]]
**Gate:** [[REVIEWER.md|Review checklist]]

See [[Story_Map.md|Story Map]] for full context.
See [[VAULT_INDEX.md]] to find other stories.
```

### When Writing a Design Document

```markdown
# Design: Carrier Profiles

**Feature:** [[FEATURES.md#Carrier Profiles|See features catalog]]
**User Stories:** [[US-701.md]], [[US-702.md]]
**Architecture Review:** [[REVIEW_CarrierProfiles_US701.md]]
**Implementation Guide:** [[CODER.md|See CODER.md for process]]

Related Designs:
- [[DESIGN_LoadRecommendations_US702_US703.md]] — Recommendations
- [[DESIGN_CarrierPerformance_US705.md]] — Performance metrics
```

### When Writing Implementation Code

```markdown
# Implementation: Load Claiming

**Story:** [[US-201.md|See story details]]
**Design:** [[ARCHITECTURE.md#Load Claiming|Load claiming architecture]]
**Testing:** See [[testing_standards.md|testing requirements]]
**Requirements:** [[REQUIREMENTS.md#Load Lifecycle|Requirements]]

Follow: [[CODER.md]] implementation workflow
Review against: [[REVIEWER.md]] checklist
```

### When Writing Test Documentation

```markdown
# Integration Tests: Authentication

**Story:** [[AUTH-102.md]]
**Testing Standard:** [[testing_standards.md]]
**Related Tests:** [[CRITICAL_ISSUE_TEST_PLAN.md]]

Coverage Target: [[BACKEND_COVERAGE_REMEDIATION_ROADMAP.md]]
```

### When Writing a Phase Document

```markdown
# Phase 5: Payments & Invoicing

**Status:** [[PHASE5_COMPLETE.md|See completion summary]]
**Roadmap:** [[PROJECT_PLAN.md#Phase 5|Full roadmap]]
**Stories:** 
- [[US-501.md]] — Settlement
- [[US-502.md]] — Invoicing

Approved by: [[LIBRARIAN_SIGN_OFF_PHASE_5.md]]
```

---

## 🎯 Linking by Document Type

### Architecture & Design
```markdown
See design: [[docs/architecture/DESIGN_CarrierProfiles_US701.md]]
See technical spec: [[docs/architecture/specs/API_CACHING_SPEC_700SERIES.md]]
See review: [[docs/architecture/REVIEW_CarrierProfiles_US701.md]]
```

### Roles & Governance
```markdown
Architect: [[docs/roles/ARCHITECT.md]]
Coder: [[docs/roles/CODER.md]]
Reviewer: [[docs/roles/REVIEWER.md]]
Librarian: [[docs/roles/LIBRARIAN.md]]
BA: [[docs/roles/BUSINESS_ANALYST.md]]
HFD: [[docs/roles/HUMAN_FACTORS_DESIGNER.md]]
```

### Standards & Rules
```markdown
Testing: [[.claude/rules/testing_standards.md]]
Database: [[.claude/rules/postgres-native.md]]
UI/Frontend: [[.claude/rules/ui-standards.md]]
Review Gate: [[.claude/rules/reviewer-checklist.md]]
Change Management: [[.claude/rules/change-request-protocol.md]]
Debt Tracking: [[.claude/rules/debt-management.md]]
```

### Business Documentation
```markdown
Stories: [[docs/business/stories/US-501.md]]
Story Map: [[docs/project/Story_Map.md]]
Requirements: [[REQUIREMENTS.md]]
Features: [[FEATURES.md]]
Personas: [[docs/business/personas/]]
```

### Project Status
```markdown
Phase completion: [[PHASE7_COMPLETION_SUMMARY.md]]
Critical issues: [[CRITICAL_ISSUES_STATUS.md]]
Known issues: [[KNOWN_ISSUES.md]]
Sprint log: [[docs/project/Sprint_Log.md]]
```

---

## ✍️ Writing Tips

### Good Link Text
```markdown
❌ Bad: See [[ARCHITECTURE.md]] for more
✅ Good: See [[ARCHITECTURE.md|system architecture]] for details

❌ Bad: Check [[docs/roles/CODER.md]] 
✅ Good: Follow [[docs/roles/CODER.md|CODER workflow]] steps

❌ Bad: Look at [[FEATURES.md]]
✅ Good: Find your feature in the [[FEATURES.md|feature catalog]]
```

### Linking Sections
```markdown
❌ Don't: See [[ARCHITECTURE.md]] for load claiming
✅ Do: See [[ARCHITECTURE.md#Load Claiming|load claiming design]]

# In the target document's heading:
## Load Claiming

Then link to it with #Load_Claiming (spaces become underscores)
```

### Internal References
```markdown
# In a story file:
See [[VAULT_INDEX.md]] to return to document index

# In a design doc:
See [[VAULT_INDEX.md]] for related documents

# In a test file:
For more on testing, see [[testing_standards.md]]
```

---

## 🔄 Link Maintenance Checklist

When creating a new document:

- [ ] Add document to VAULT_INDEX.md in appropriate category
- [ ] Add "Related Documents" section at top with [[VAULT_INDEX.md]] link
- [ ] Link to related documents within content
- [ ] Link back to design/story from implementation
- [ ] Update parent documents to link to new doc
- [ ] Use consistent link text (descriptive, not just filename)
- [ ] Check for broken links (no [[NonExistent.md]])

---

## 🚀 Efficiency Tips

### From Obsidian
```
Type [[ and autocomplete shows suggestions
Type: [[ + filename start + Enter
Auto-fills: [[FILENAME.md]]
```

### Backlink Verification
```
Right sidebar: Backlinks panel
Shows: All files linking to current doc
Verify: New links appear after save
```

### Graph View
```
View → Graph View (Cmd+E)
Filter: Click nodes to highlight
Export: Use for presentations
```

---

## 📋 Common Scenarios

### "I need to link my implementation to the story"
```markdown
# In your implementation file:
**Story:** [[US-501.md|US-501: Quick Pay Settlement]]

# In the story file (US-501.md), add:
## Implementation
See [[IMPLEMENTATION_FILE.md]] for code

```

### "I'm referencing a section in another document"
```markdown
[[ARCHITECTURE.md#Multi-Tenancy|multi-tenancy design]]

# In ARCHITECTURE.md:
## Multi-Tenancy
(This heading becomes linkable)
```

### "I need to show this document has no orphans"
```
Graph View → The node should have incoming edges (backlinks)
If isolated → Add link from VAULT_INDEX
If still isolated → Check if document is still needed
```

### "I'm creating a related documents section"
```markdown
## Related Documentation

**Architecture:** [[ARCHITECTURE.md]] — System design
**Stories:** [[US-501.md]], [[US-502.md]], [[US-503.md]]
**Design:** [[DESIGN_PaymentAccountSetup_US502.md]]
**Testing:** [[testing_standards.md]]
**Review Gate:** [[REVIEWER.md]]
```

---

## 🎯 Before Publishing a Document

```bash
1. ☑ Added to VAULT_INDEX.md? 
2. ☑ Links back to VAULT_INDEX?
3. ☑ Related docs linked?
4. ☑ No broken links (check Graph View)?
5. ☑ Link text is descriptive?
6. ☑ Headings use proper markdown (#)?
7. ☑ No orphaned content?
8. ☑ Committed to git?
```

---

**Last Updated:** 2026-06-12  
**Used by:** All roles when creating/updating documentation
