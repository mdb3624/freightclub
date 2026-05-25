---
name: wrap-up
description: |
  Analyze the current session's conversation history to extract insights, identify friction patterns, skill gaps, and architectural knowledge. Automatically categorize findings by role (Architect, Librarian, Coder, Reviewer, Business Analyst, UX Designer) and update project rules, documentation, and auto-memory accordingly. Execute file modifications by reading existing content first, batch all changes, and commit atomically. Use this skill at the end of a session to distill learnings into permanent project context. Disable-Model-Invocation: true
---

# /wrap-up — Session Insights & Automation Refinement

## Overview

This skill analyzes a complete session to extract patterns, friction points, and knowledge that should become permanent project context. It operates in four phases:

1. **Parse**: Extract conversation history since the last `/wrap-up` marker (or session start)
2. **Identify**: Detect friction, skill gaps, architectural decisions, and repetitive tasks
3. **Categorize**: Organize findings by role and file destination
4. **Apply & Commit**: Read existing files, batch updates, commit atomically

---

## Phase 1: Parse Session History

### Scope Definition

- **Start point**: Look for a prior `/wrap-up` marker in the conversation. If none exists, start from session beginning.
- **End point**: Current message (the invocation of `/wrap-up`)
- **What to include**: User messages, Claude responses, tool outputs, error logs, test results, file edits

### Extract Key Data Points

For each significant exchange, note:
- **Timestamp / sequence**: Which turn in the conversation
- **Action type**: Feature implementation, debugging, documentation, testing, deployment
- **Outcome**: Success, partial success, failure, blocked
- **Tool use**: Which tools were invoked; how many times
- **Corrections**: Any time the user said "no", "wrong", "stop", "redo", or expressed dissatisfaction

---

## Phase 2: Identify Patterns

### Friction Detection

Look for these signals (any one indicates friction worth capturing):

**Repeated Manual Tasks**
- A command or workflow executed 3+ times in this session (e.g., `mvn test`, port checks, file reads)
- User manually running a command that could be automated via hook or alias

**Repeated Error Patterns**
- Same error class appearing 2+ times (e.g., "CHAR vs VARCHAR schema mismatch", "RLS policy not applied", "JWT parsing error")
- User having to correct Claude on the same issue multiple times

**Slow Debugging Cycles**
- A task that took >15 minutes and went through 3+ iterations to resolve
- Dead-end debugging paths (e.g., debugging auth when the real issue was Vite proxy config)

**Scope Creep or Misalignment**
- User correcting Claude's approach ("no not that", "don't do X")
- Claude over-fetching data or under-fetching (e.g., using stale cached files instead of fresh API calls)
- Claude misunderstanding the task and going down wrong path

**Token/Resource Inefficiency**
- Session hitting usage limits mid-task
- Large output sets that should have been processed in sandbox instead of context
- Repeated re-reading of the same large file

### Skill Gaps

Identify areas where:
- Claude struggled or required multiple corrections
- A custom skill or automation would have helped
- A built-in skill was available but not invoked
- A pattern from prior sessions was not remembered or applied

### Architectural Knowledge

Extract decisions, constraints, or learnings about:
- FreightClub's system architecture (Spring Boot, React, PostgreSQL, etc.)
- Multi-tenancy patterns and RLS enforcement
- Database migration patterns (idempotency, schema consistency)
- Testing patterns (TDD, coverage targets, RLS-specific test challenges)
- Deployment patterns (Cloud Run, environment variables, CORS)
- Frontend patterns (Vite proxy, auth token handling, state management)

### Repetitive Tasks

Find manual workflows that happened 2+ times and could be:
- Added to a hook (PostToolUse, PostToolBatch, etc.)
- Turned into a new skill
- Added to CLAUDE.md as a permanent rule
- Optimized via a script in `.claude/scripts/`

---

## Phase 3: Categorize by Role & Destination

### File Organization Rules

Organize findings according to FreightClub's governance roles:

#### **ARCHITECT** → Domain & Schema
- **Destination**: `.claude/rules/architecture-decisions.md`, `.claude/rules/postgres-native.md`, docs/standards/, CLAUDE.md
- **Content**: System architecture decisions, schema patterns, multi-tenancy constraints, RLS policies, trade-offs between competing designs
- **Example**: "Multi-tenancy must enforce tenant_id at database level via RLS, not application layer" → `.claude/rules/postgres-native.md`

#### **LIBRARIAN** → Traceability & Documentation
- **Destination**: `.claude/rules/documentation-standards.md`, `.claude/learnings.md` (Technical Debt Ledger), docs/project/
- **Content**: Story Map updates, requirement traceability patterns, how to link code to user stories, documentation ownership, phase readiness checks
- **Example**: "Before marking a story DONE, verify Reviewer has signed off in chat" → `.claude/rules/documentation-standards.md`

#### **CODER** → Implementation Patterns & Tech Debt
- **Destination**: `.claude/rules/workflow.md`, `.claude/rules/java-patterns.md`, `.claude/learnings.md`
- **Content**: Testing patterns (TDD, coverage targets), error handling conventions, Java/Spring Boot pitfalls, build/test automation
- **Example**: "RLS + Hibernate bulk operations are notorious for test failures — use single-record operations in tests" → `.claude/learnings.md`

#### **REVIEWER** → Quality Gates & Security
- **Destination**: `.claude/rules/reviewer-checklist.md`, CLAUDE.md
- **Content**: Code review criteria that were missed, security gaps discovered, test coverage issues, integration problems
- **Example**: "Always verify Spring Security filter double-registration hasn't occurred (FilterRegistrationBean)" → `.claude/rules/reviewer-checklist.md`

#### **BUSINESS_ANALYST** → Business Logic & Workflows
- **Destination**: docs/business/, CLAUDE.md
- **Content**: Business rules that emerged during implementation, edge cases discovered, feature scope clarifications, acceptance criteria refinements
- **Example**: "Equipment hierarchy: specialized equipment can haul general loads, but not vice versa" → docs/business/BUSINESS_RULES.md

#### **HFD (Human Factors Designer)** → UX & Cognitive Load
- **Destination**: `.claude/rules/ui-standards.md`, docs/standards/
- **Content**: Information salience patterns, cognitive load reduction findings, mobile/high-glare environment lessons, form validation UX
- **Example**: "High-density load board requires badge color-coding (Green/Yellow/Red profit tiers) for at-a-glance recognition" → `.claude/rules/ui-standards.md`

#### **Generic Knowledge & Facts** → Auto Memory
- **Destination**: `.claude/projects/c--projects-freightclub/memory/`
- **Content**: Project facts, tool-specific findings, environment setup learnings, recurring blockers
- **Example**: "Backend port must be 9090 (not 8080) for Vite proxy to work" → `memory/feedback_vite_proxy_config.md`

#### **Deployment & DevOps** → Environment Rules
- **Destination**: `.claude/rules/cloud-run.md`, CLAUDE.md
- **Content**: Cloud Run patterns, environment variable management, deployment checklists, secret handling
- **Example**: "Never hardcode Cloud Run service URLs in nginx.conf — use env var + envsubst" → `.claude/rules/cloud-run.md`

---

## Phase 4: Apply & Commit

### File Modification Protocol

For each categorized finding:

1. **Read existing content** (if file exists)
   ```bash
   Read the target file to understand its current structure and formatting
   ```

2. **Prepare update** (don't assume structure)
   - If file uses a table, append a row
   - If file uses sections, append a new section
   - If file uses a ledger, append an entry with `[WRAP-UP]` tag
   - **Never overwrite existing content** — only append or refactor existing entries

3. **Write atomically**
   - Make the change
   - Verify the file is syntactically valid (valid YAML, valid Markdown, etc.)
   - Do NOT commit yet

4. **Batch & Commit Once**
   ```bash
   git add <all modified files>
   git commit -m "chore: update insights and rules via /wrap-up"
   ```

5. **Force-commit if dirty**
   - If unrelated changes exist in git status, **still commit** with `git commit -m "..."`
   - Do NOT use `--force-push` or `--amend`; just commit the batch
   - (Unrelated dirty state is acceptable; it will be dealt with in the next session)

### Conflict Handling

- If a file modification would create a merge conflict with current working tree changes, **abort that specific file** and note it in the Review & Apply phase output
- Continue with other files; batch-commit only the successful changes
- Report which files were skipped and why

---

## Phase 5: Review & Apply

Before finalizing, explicitly check:

### Mandatory Review Checklist

- [ ] **Repetitive Tasks**: Are there manual steps performed 2+ times in this session that should be automated?
  - If yes: Suggest a new hook, alias, or skill. Note in CLAUDE.md under a new section if appropriate.
  
- [ ] **Missed Friction**: Look at the error logs and user corrections again. Did I capture all friction points?
  - If I missed something, add it to the appropriate file now.

- [ ] **Role Alignment**: Do the categorizations match the user's governance structure?
  - Architect decisions in `.claude/rules/`?
  - Librarian traceability in `.claude/learnings.md`?
  - Coder patterns separate from Reviewer gates?

- [ ] **Actionable Changes**: Is each change specific enough that a future Claude or the user can act on it?
  - Bad: "Improve error handling" (too vague)
  - Good: "Before deploying to Cloud Run, verify secret types are `SECRET` not `VARCHAR` and PORT env var is not hardcoded" (specific and testable)

- [ ] **No Hallucinations**: Have I only captured changes observed in this session's conversation?
  - Do NOT add findings from prior sessions that weren't mentioned here.
  - Do NOT extrapolate or speculate beyond what happened.

### Output Summary

Before committing, print:

```
## /wrap-up Summary

**Session Analysis**: [Date] [Start → End]

**Friction Detected**: 
- [Pattern 1]: [Example from transcript]
- [Pattern 2]: [Example from transcript]

**Files Modified**:
- CLAUDE.md: [1-line description of change]
- .claude/rules/[file].md: [1-line description of change]
- .claude/projects/.../memory/[file].md: [1-line description of change]

**Skipped** (if any):
- [File]: [Reason — conflict, invalid structure, etc.]

**Automated Actions Suggested**:
- [Hook / Skill / Script] to prevent [friction point]
- [Hook / Skill / Script] to prevent [friction point]

**Commit Hash**: [git commit hash after batch commit]

---
Status: ✅ COMPLETE
```

---

## Usage

Invoke at the end of a session when you want to distill learnings into permanent project context:

```
/wrap-up
```

The skill will:
1. Parse conversation since last wrap-up marker
2. Identify friction, gaps, and knowledge
3. Categorize by role
4. Read existing files and prepare updates
5. Batch-commit all changes
6. Print a summary showing what changed

---

## Implementation Notes

- **Disable-Model-Invocation: true** — All analysis is deterministic pattern-matching, no subagent calls
- **No hallucinations** — Only extract what's explicitly in the conversation
- **Append-only** — Never delete existing content; only add or update entries
- **Batch-commit** — One atomic commit per wrap-up invocation, even if unrelated changes exist
- **Force-commit on dirty** — Unrelated changes are acceptable; commit anyway
- **Read-before-write** — Always read existing file content before making modifications to preserve structure

