# Document Ownership & Governance

This document defines which role owns, maintains, and controls updates to governed documents in the FreightClub project.

---

## Governed Documents

| Document | Owner Role | Automated Overwrite Allowed? | Sign-Off Required | Notes |
|----------|-----------|-----|---|---|
| `ARCHITECTURE.md` | Architect | ❌ NO | Architect PASS | System design, ADRs, schema diagrams. Updates via `/update-docs` require explicit Architect approval. |
| `docs/roles/ARCHITECT.md` | Architect | ❌ NO | Architect PASS | Role definition. Structural changes require Architect consensus. |
| `docs/roles/CODER.md` | Coder | ❌ NO | Architect PASS | Role definition. Structural changes require Architect review. |
| `docs/roles/HUMAN_FACTORS_DESIGNER.md` | HFD | ❌ NO | Architect PASS | Role definition. Structural changes require Architect review. |
| `REQUIREMENTS.md` | Librarian | ✅ YES (with constraints) | Librarian PASS | Phase-by-phase requirements. Updated only when stories move to DONE (≥70% coverage + Reviewer PASS). Automated regeneration allowed if it preserves DONE/IN PROGRESS status. |
| `docs/project/Sprint_Log.md` | Librarian | ❌ NO | Librarian PASS | Sprint tracking and history. Only the Librarian writes to this. Automated tools must not overwrite. |
| `docs/project/Story_Map.md` | Librarian | ❌ NO | Librarian PASS | Feature roadmap and backlog. Librarian-only updates. Automated tools must not overwrite. |
| `docs/roles/LIBRARIAN.md` | Librarian | ❌ NO | Librarian PASS | Role definition. Updates require Librarian consensus. |
| `docs/roles/REVIEWER.md` | Reviewer | ❌ NO | Architect PASS | Role definition. Structural changes require Architect review. |
| `FEATURES.md` | Business Analyst | ✅ YES (with constraints) | BA sign-off | User-facing features (what users can do, benefits). Automated regeneration allowed if it maintains user-centric framing (no implementation details, no Status fields). |
| `PROJECT-PLAN.md` | Librarian + Architect | ⚠️ CAUTION | Architect PASS | Delivery roadmap. Both roles contribute. Automated updates risk losing manual scope decisions. Regenerate only with explicit sign-off. |
| `docs/standards/Definition_of_Done.md` | Architect + Reviewer | ❌ NO | Architect PASS | Quality gates. Automated tools must never modify. |
| `docs/standards/Definition_of_Ready.md` | Business Analyst | ❌ NO | BA PASS | Story readiness criteria. Automated tools must never modify. |

---

## Overwrite Protection Rules

### Automated Regeneration (e.g. /update-docs skill)

**BLOCKED documents** — automated tools may NOT overwrite:
- All role files (`docs/roles/*.md`)
- All protected standards (`Definition_of_Done.md`, `Definition_of_Ready.md`)
- `ARCHITECTURE.md` (requires Architect approval)
- `Sprint_Log.md`, `Story_Map.md` (require Librarian approval)

**ALLOWED documents** — automated tools may regenerate IF:
- `REQUIREMENTS.md` — content is updated but DONE/IN PROGRESS story status is preserved
- `FEATURES.md` — content is updated but user-centric framing is maintained (no Status fields, no implementation jargon)

### Manual Updates

Any role may propose a change to their owned document. Updates require sign-off from the owning role (or consensus if co-owned).

---

## Enforcement

The **Librarian** is responsible for:
1. Auditing automated doc updates to ensure no protected documents were overwritten
2. Flagging any tool-generated changes to owned documents that require role approval
3. Maintaining a log of all documentation changes in `Sprint_Log.md`

The **Architect** is responsible for:
1. Reviewing any changes to `ARCHITECTURE.md` before they are committed
2. Approving structural changes to role definitions
3. Sign-off on regenerated `PROJECT-PLAN.md` versions

---

**Last Updated:** 2026-05-21  
**Maintained By:** Librarian
