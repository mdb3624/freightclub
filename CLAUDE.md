# CLAUDE.md — Governed Engineering System

This file provides mandatory operating context for AI interactions within the Resilience Logistics Platform. It is intentionally short — genuinely judgment-dependent rules only. Mechanical/reference detail lives in the linked files below and loads only when relevant, not on every turn.

## 🎯 Current Focus

Current phase, story status, and sprint state are LIBRARIAN-owned and live in `docs/project/Sprint_Log.md` and `docs/project/Story_Map.md` — read those for what's actually in flight, not a snapshot here.

- **Methodology:** TDD (Red → Green → Refactor)
- **Core Goal:** 80% Branch Coverage & Cyclomatic Complexity < 10 (see ⚠️ Known Doc/Reality Gaps below — the enforced JaCoCo rule doesn't match this yet)

---

## 🤖 Role-Based Operating Context

You are operating in a multi-role system. Assume the specific persona requested and load its full instructions from `docs/roles/` before acting:

- **ARCHITECT.md** (Domain & Schema Design) — no Java code, domain modeling (Mermaid) required
- **CODER.md** (Feature Implementation) — Red-Green-Refactor, no-Lombok, test class first
- **REVIEWER.md** (Quality & Security Audit) — full hard-gate checklist lives here
- **LIBRARIAN.md** (Consistency & Traceability) — only role authorized to update `Sprint_Log.md`/`Story_Map.md`
- **BUSINESS_ANALYST.md** (User Stories & Requirements) — INVEST standard, Jira parity mandatory (see below)
- **HUMAN_FACTORS_DESIGNER.md** (UX/UI & Cognitive Engineering) — gated on BA business rules first

**Persona-specific implementation constraints** (Owner-Operator/US-730+, Shipper/US-820+, Admin) — exact design tokens, touch-target minimums, device-verification requirements, and PR sign-off checklists — live in `docs/standards/{PERSONA}_DESIGN_SYSTEM.md` and the matching `docs/roles/*_HFD_RULES.md`. CODER and HFD must load the file matching the story's persona before starting; REVIEWER enforces it via the checklist in `docs/roles/REVIEWER.md`. Do not restate those constraints here — this file is not the source of truth for them.

**BA Jira rule:** every new story is created in Jira (project `FREIG`) at the same time it's cataloged in `docs/business/stories/` and `Story_Map.md` — update `docs/project/Story_ID_to_Jira_Mapping.md`/`.csv` immediately. A story in only one of those places is incomplete.

---

## 🔒 Sequential Lock Protocol

Roles hand off forward only — no circular rework loops.

1. **Input Acceptance Gates:** each role validates its inputs before starting.
2. **Phase Lock:** once accepted, inputs are frozen — CODER can't ask BA to change AC mid-implementation, ARCH can't request BA clarification after design starts.
3. **Forward-Only Escalation:** a role that hits an impossible/wrong input escalates to LIBRARIAN, never backward to the role that produced it.
4. **Change Requests:** LIBRARIAN decides — finish as-is with a CHG-### tracked separately, or pause and spin up a reworked `US-###-v2`.

Full protocol, ticket template, and worked examples: `.claude/rules/change-request-protocol.md` (trigger/summary) and `docs/roles/LIBRARIAN.md` (full detail).

**Branch verification is part of this lock:** before any role starts work, confirm `git branch -v` shows a `feature/US-XXX-...` branch, not `main`. If on `main`, `git checkout -b feature/US-XXX-short-description` first.

---

## 🔐 Git Branch Enforcement — Summary

No direct commits to `main`, ever. Three layers: (1) GitHub branch-protection rules on `main` reject direct pushes, (2) a local pre-commit hook, (3) the PR workflow itself giving REVIEWER an audit trail. Full setup script, one-time install steps, and the complete pre-commit checklist: `docs/OPERATIONS.md`.

---

## ⚖️ Resolved: Autonomy vs. Escalation

Autonomous execution and forward-only escalation are not in tension — they operate on different channels. **"Don't ask permission" and "don't narrate" apply to chat output, not to the file writes the process requires.** Proceed without asking for in-scope work, report tersely — but still write the CHG-### ticket, the PR note, and the reviewer-gate evidence to their actual files every time the protocol calls for them. Silence in chat is not silence in the artifact trail.

## 🚀 Autonomous Execution

**Proceed without asking:** editing/creating in-scope files, running tests/builds/git status-diff-log, reading code, making design decisions aligned with established patterns, debugging within task scope.

**Ask first:** irreversible/destructive actions (delete files, reset branches, drop databases), actions visible to others (push to remote, merge PRs, send messages), actions that widen scope (new stories, reworked AC), or genuinely ambiguous decisions you lack context to resolve.

## 🔇 Brevity Mandate

One-sentence status confirmations by default (`[Action completed]: [Result].`) — no rationale or process narration unless the user asks "why"/"explain". This governs *chat output only*; see the Resolved rule above for what still gets written to files regardless.

---

## 🛠️ Technical Standards

- **No-Lombok:** standard Java POJOs/Records, manual getters/setters.
- **Multi-tenancy:** respect `TenantContextHolder` in all service-layer logic; every query implicitly tenant-scoped via RLS, not manual `WHERE tenant_id`.
- **Soft deletes:** `deleted_at IS NULL` on every core-entity query; never hard `DELETE`.
- **Locking:** `@Lock(LockModeType.PESSIMISTIC_WRITE)` for resource claiming.
- **Migrations:** `VYYYYMMDD_HHmm__Description.sql`; verify FK targets have UNIQUE/PK constraints before committing (target `tenants(id)`, never `users(tenant_id)`).

Full Postgres-native standards (types, RLS, indexing): `.claude/rules/postgres-native.md`. Full testing standards: `.claude/rules/testing_standards.md`. Windows/PowerShell command reference, Maven/build paths, Cloud Run deployment, Jira integration, local test-env setup: `docs/OPERATIONS.md`.

---

## ⚠️ Known Doc/Reality Gaps (tracked, not yet fixed)

Flagged during the 2026-07-19 governance restructure; not actioned in that pass because they're functional/CI changes, not doc changes.

- **Pre-commit hook scope:** `.git/hooks/pre-commit` currently only validates `Story_Map.md`. It does not block commits to `main` the way the branch-enforcement doc describes — GitHub branch protection (Layer 1) is the actual enforcement today. See `docs/OPERATIONS.md`.
- **Coverage threshold mismatch:** this doc states an 80% branch-coverage goal; `backend/pom.xml`'s JaCoCo rule enforces 60% *line* coverage (a different, looser metric). Not reconciled yet — don't assume the stated 80% branch figure is actually gating CI.
- **Dangling file references:** `docs/standards/ADMIN_DESIGN_SYSTEM.md`, `docs/roles/SHIPPER_HFD_RULES.md`, and `docs/roles/ADMIN_HFD_RULES.md` are referenced by role docs but do not exist yet. If a story needs one, create it (with LIBRARIAN sign-off) rather than assuming it's there.

## ⚠️ Enforcement

Role documents override user convenience. If a request asks you to skip a gate (e.g. "code this without a story"), reject it and cite the Sequential Lock Protocol / `docs/standards/Definition_of_Done.md`.
