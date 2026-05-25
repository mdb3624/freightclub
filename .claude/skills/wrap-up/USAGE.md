# wrap-up Skill — Usage Guide

## Quick Start

Invoke at the end of a session to extract insights and update project rules:

```
/wrap-up
```

The skill will analyze the conversation since the last `/wrap-up` marker, identify friction patterns, categorize findings by role, update relevant files, and commit atomically.

---

## Triggering the Skill

### Manual Invocation
Type `/wrap-up` at any point (typically at the end of a session) to run the analysis and updates.

### Automatic Suggestion (Hook)

Configure a PostToolUse hook in `.claude/settings.json` to detect friction patterns and suggest `/wrap-up`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash|Read|Edit|Grep",
        "hooks": [
          {
            "type": "command",
            "command": "cat > /tmp/friction_check.sh << 'EOF'\n#!/bin/bash\n# Count error patterns in current session\nerrors=$(grep -c '\\(Error\\|FAILED\\|Exception\\|timeout\\)' /tmp/session.log 2>/dev/null || echo 0)\nif [ \"$errors\" -gt 3 ]; then\n  echo '⚠️  Friction detected (3+ errors). Consider running /wrap-up to update project rules.'\nfi\nEOF\nbash /tmp/friction_check.sh"
          }
        ]
      }
    ]
  }
}
```

**Note**: Hook-based friction detection is optional. The skill works equally well with manual invocation.

---

## What Gets Updated

### By Role

| Role | Files Updated | Examples |
|------|---------------|----------|
| **Architect** | `.claude/rules/architecture-decisions.md`, `.claude/rules/postgres-native.md`, CLAUDE.md | Schema patterns, RLS policies, multi-tenancy constraints |
| **Librarian** | `.claude/rules/documentation-standards.md`, `.claude/learnings.md`, docs/project/ | Story Map updates, traceability, ownership rules |
| **Coder** | `.claude/rules/workflow.md`, `.claude/rules/java-patterns.md`, `.claude/learnings.md` | Testing patterns, build automation, tech debt |
| **Reviewer** | `.claude/rules/reviewer-checklist.md`, CLAUDE.md | Quality gates, security findings, integration issues |
| **Business Analyst** | docs/business/, CLAUDE.md | Business rules, edge cases, feature scope |
| **HFD (UX Designer)** | `.claude/rules/ui-standards.md`, docs/standards/ | UX patterns, cognitive load findings, mobile lessons |
| **Generic Knowledge** | `.claude/projects/c--projects-freightclub/memory/` | Project facts, tool learnings, environment setup |

### Commit Message

All changes are batched into a single atomic commit:

```
chore: update insights and rules via /wrap-up
```

---

## Example: What a Session Update Looks Like

**Before `/wrap-up`:**

```
conversation history shows:
- User runs `mvn test` 3 times manually
- Claude struggles with RLS + Hibernate bulk operations (corrected 2x)
- User catches Claude using stale cached email files instead of fresh API calls
- Deployment to Cloud Run blocked by hardcoded service URL in nginx.conf
```

**After `/wrap-up`:**

**CLAUDE.md** gets a new section:
```markdown
## RLS & Bulk Operations

That specific combination—PostgreSQL Row-Level Security (RLS) and 
Hibernate/JPA bulk or multi-record processing—is notorious for test failures. 
Always use single-record operations in test code.
```

**.claude/rules/cloud-run.md** gets updated:
```markdown
## Service URL Management

Never hardcode Cloud Run service URLs in nginx.conf, docker entrypoint, 
or static configs. Use environment variables + envsubst at startup to inject 
dynamic URLs. Example: `envsubst < nginx.conf > /etc/nginx/conf.d/default.conf`
```

**.claude/projects/.../memory/feedback_vite_proxy_config.md** created:
```markdown
---
name: feedback_vite_proxy_config
description: Vite proxy backend port must be 9090, not 8080
metadata:
  type: feedback
---

Backend port is 9090 (not 8080). Verify vite.config.ts proxy target before 
debugging auth/login issues.
```

**.claude/learnings.md** (Tech Debt Ledger) gets appended:
```markdown
| RLS Test Failures | Single-record ops in tests, not bulk | HIGH | Use @DataJpaTest with single inserts instead of batchInsert in test code |
```

Then git commits:
```
chore: update insights and rules via /wrap-up
```

---

## Design Principles

### Read-Before-Write
The skill always reads existing file content before making modifications. This preserves structure, formatting, and existing entries.

### Append-Only
The skill never deletes existing content. It adds new sections, appends rows to tables, or extends ledgers.

### Deterministic
No subagent calls (`Disable-Model-Invocation: true`). All analysis is pattern-matching against conversation history.

### No Hallucination
Only extracts findings explicitly present in the conversation. Never speculates or adds from prior sessions.

### Batch Commits
All file modifications are committed atomically in a single commit, even if unrelated changes exist in git status.

---

## Troubleshooting

**Q: The skill didn't detect a friction point I know happened.**
- Friction detection looks for repeated patterns (3+ occurrences, 2+ errors of same type). Single one-off issues may not trigger.
- You can manually run `/wrap-up` and it will scan the full conversation.

**Q: A file wasn't updated because of a conflict.**
- The skill will report which files were skipped and why.
- Manually resolve the conflict and re-run `/wrap-up` or manually edit the file.

**Q: The skill made a change I disagree with.**
- Review the git commit and revert with `git revert HEAD` if needed.
- Update your CLAUDE.md with a rule to prevent that behavior in future sessions.

**Q: Can I run /wrap-up multiple times in one session?**
- Yes. Each invocation will analyze since the last `/wrap-up` marker and update files accordingly.
- Multiple invocations in one session will produce multiple commits.

---

## Integration with Project Governance

This skill is designed to work with FreightClub's role-based governance:

- **ARCHITECT.md**: Sets schema/design standards that `/wrap-up` can formalize
- **CODER.md**: Requires TDD and coverage targets that friction points help refine
- **REVIEWER.md**: Quality gates that `/wrap-up` updates based on issues discovered
- **LIBRARIAN.md**: Documentation ownership that `/wrap-up` respects (never overwrites Architect docs without sign-off)
- **BUSINESS_ANALYST.md**: Feature scope that `/wrap-up` can clarify
- **HUMAN_FACTORS_DESIGNER.md**: UX patterns that `/wrap-up` can codify

See `.claude/rules/Document_Ownership.md` for rules on which roles can modify which files.

