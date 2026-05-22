# Validate Document Ownership

Pre-flight validation skill that enforces document ownership rules before any automated tool regenerates or modifies governed documents.

**Invoked by:** `/update-docs`, `/release-check`, and any other doc-regenerating skill.

---

## Workflow

### Input

The calling skill passes:
- **Action:** `regenerate` | `commit` | `modify`
- **Documents:** List of files being regenerated/modified (e.g., `["ARCHITECTURE.md", "REQUIREMENTS.md"]`)
- **Mode:** `auto` (automated tool) | `manual` (user-initiated)

### Process

1. **Read `docs/standards/Document_Ownership.md`** to load ownership rules
2. **For each document in the input list:**
   - Look up its owner, overwrite permission, and sign-off requirement
   - If `Automated Overwrite Allowed? = ❌ NO`:
     - If `Mode = auto` → **BLOCK** and list the protected doc
     - If `Mode = manual` → **WARN** but allow (user is explicitly approving)
   - If `Automated Overwrite Allowed? = ✅ YES (with constraints)`:
     - Extract the constraint (e.g., "preserve DONE status")
     - Add constraint to validation checklist
   - If `Automated Overwrite Allowed? = ⚠️ CAUTION`:
     - Warn that both Architect + Librarian sign-off is required

3. **Build validation report:**
   ```
   ╔════════════════════════════════════════════════════════╗
   ║         DOCUMENT OWNERSHIP PRE-FLIGHT CHECK             ║
   ╚════════════════════════════════════════════════════════╝
   
   Document              Owner        Can Auto-Regenerate?   Sign-Off Required
   ────────────────────────────────────────────────────────────────────────
   ARCHITECTURE.md       Architect    ❌ NO (blocked)        Architect PASS
   REQUIREMENTS.md       Librarian    ✅ YES (constrained)   Librarian PASS
   FEATURES.md           BA           ✅ YES (constrained)   BA PASS
   
   BLOCKED DOCUMENTS (mode=auto):
   - ARCHITECTURE.md — Architect-owned. Requires Architect approval.
   
   CONSTRAINED DOCUMENTS (validate before commit):
   - REQUIREMENTS.md — preserve DONE/IN PROGRESS status
   - FEATURES.md — maintain user-centric framing, no Status fields
   
   STATUS: ❌ BLOCKED — Cannot auto-regenerate protected docs.
            Either: (a) Get Architect sign-off, (b) Use mode=manual, (c) Exclude ARCHITECTURE.md from list.
   ```

4. **Output verdict:**
   - `APPROVED` — All docs pass (none are blocked, or user is in manual mode)
   - `BLOCKED` — Attempting to auto-modify Architect-owned docs without approval
   - `WARN` — Co-owned or constrained docs detected; extra care needed at commit time

---

## Invocation Examples

### From /update-docs skill (auto mode)

```markdown
## Pre-Flight: Document Ownership Check

Before spawning doc agents, validate that we're not auto-overwriting protected docs.

**Code:**
```
Run validation with:
- Action: `regenerate`
- Documents: `["FEATURES.md", "REQUIREMENTS.md", "GAP-ANALYSIS.md", "ARCHITECTURE.md", "EXECUTIVE-SUMMARY.md", "PROJECT-PLAN.md"]`
- Mode: `auto`

**Expected response:** 
- If ARCHITECTURE.md is in the list: `BLOCKED — Architect-owned, requires sign-off`
- If only regenerating user-facing docs (FEATURES, REQUIREMENTS, GAP): `APPROVED`

**Action:** 
- If BLOCKED, stop and ask the user: "Regenerate ARCHITECTURE.md? (requires Architect approval)"
- If APPROVED, proceed to spawn doc agents
```

### From /release-check skill (commit mode)

```markdown
## Pre-Commit: Verify Ownership Constraints

Before staging files for commit, validate that constrained docs meet their constraints.

**Code:**
```
Run validation with:
- Action: `commit`
- Documents: `["FEATURES.md", "REQUIREMENTS.md", "ARCHITECTURE.md", ...]`
- Mode: `auto`

**Expected response:** 
- List of constrained docs and their validation rules
- Checklist of what to verify before committing

**Action:** 
- For each constrained doc, apply the validation:
  - REQUIREMENTS.md: Grep for `[DONE]` entries and verify they still exist (JaCoCo ≥ 70%)
  - FEATURES.md: Grep for `**Status:**` and fail if any found (user-facing doc must not have status)
  - PROJECT-PLAN.md: Verify it matches current phase status in code
```

---

## Rules Enforced

| Document | Rule | Enforced By |
|---|---|---|
| ARCHITECTURE.md | No auto-overwrite without Architect sign-off | Validation blocks `/update-docs` if ARCHITECTURE.md is in list + mode=auto |
| FEATURES.md | Must maintain user-centric framing (no Status fields) | Pre-commit check: grep for `**Status:**` and fail if found |
| REQUIREMENTS.md | Must preserve DONE story status | Pre-commit check: verify [DONE] entries still exist from previous run |
| All role files | No auto-overwrite | Validation blocks if any `docs/roles/*.md` in list + mode=auto |
| All standards files | No auto-overwrite | Validation blocks if any `docs/standards/*.md` in list + mode=auto |

---

## Pseudo-Code

```python
def validate_document_ownership(action, documents, mode):
    ownership_rules = load_from_file("docs/standards/Document_Ownership.md")
    
    blocked = []
    warned = []
    constrained = []
    
    for doc in documents:
        rule = ownership_rules.get(doc)
        
        if rule.automated_overwrite == "NO":
            if mode == "auto":
                blocked.append((doc, rule.owner, rule.sign_off_required))
            elif mode == "manual":
                warned.append((doc, rule.owner, "User approved override"))
        
        elif rule.automated_overwrite == "YES (with constraints)":
            constrained.append((doc, rule.constraint))
        
        elif rule.automated_overwrite == "CAUTION":
            warned.append((doc, rule.owner, "Co-owned: both roles must sign off"))
    
    if blocked and mode == "auto":
        return {
            "verdict": "BLOCKED",
            "blocked_docs": blocked,
            "message": f"Cannot auto-regenerate {len(blocked)} protected doc(s). Get approval or use mode=manual."
        }
    
    if constrained:
        return {
            "verdict": "APPROVED_WITH_CONSTRAINTS",
            "constrained_docs": constrained,
            "checklist": [constraint[1] for constraint in constrained]
        }
    
    return {"verdict": "APPROVED"}
```

---

## Integration Checklist

- [ ] `/update-docs` skill: Add pre-agent-spawn validation; block protected docs unless user approves
- [ ] `/release-check` skill: Add pre-commit validation; verify constrained docs meet their rules
- [ ] Both skills: Log validation result in output for user visibility
- [ ] Both skills: Fail the skill if validation returns BLOCKED (no silent suppression)

---

**Last Updated:** 2026-05-21  
**Maintained By:** Librarian (enforces governance rules)  
**Invoked By:** /update-docs, /release-check, any doc-regenerating skill
