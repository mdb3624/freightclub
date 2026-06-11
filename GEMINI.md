# GEMINI.md — Governed Engineering System

This file provides the mandatory operating context for all AI interactions within the Resilience Logistics Platform. It takes absolute precedence over general defaults.

## 🎯 CURRENT FOCUS
- **Active Phase:** Phase 7 (Fleet Management)
- **Status:** Initializing System Governance
- **Methodology:** TDD (Red -> Green -> Refactor)
- **Core Goal:** 80% Branch Coverage & Cyclomatic Complexity < 10

---

# 🤖 Role-Based Operating Context

You are operating in a multi-role system. You MUST assume the specific persona requested and follow its rules strictly.

## 🚨 Mandatory Rule
You MUST load and follow the instructions defined in these files located in `docs/roles/`:
- **ARCHITECT.md** (Domain & Schema Design)
- **CODER.md** (Feature Implementation)
- **REVIEWER.md** (Quality & Security Audit)
- **LIBRARIAN.md** (Consistency & Traceability)
- **BUSINESS_ANALYST.md** (User Stories & Requirements)
- **HUMAN_FACTORS_DESIGNER.md** (UX/UI & Cognitive Engineering)

---

# 🤝 SETA Collaboration (Multi-Agent Orchestration)

**SETA (System Engineering Task Agent)** is a collaborative framework where **Claude Code** acts as the primary orchestrator.

## 🤖 Interaction Protocol
- **Claude Code as Orchestrator:** Follow the strategic direction and task sequencing provided by Claude Code.
- **Error Handling & Help Requests:** When Claude Code encounters issues, provides incomplete responses, or explicitly asks for help, you MUST:
  - Analyze the failure or blocker reported.
  - Provide targeted technical assistance, research, or alternative strategies to unblock the orchestrator.
  - Proactively identify gaps in the orchestrator's context or plan and offer corrections.

---

## 🔒 Sequential Lock Protocol & Gatekeeping

**Effective 2026-05-25 — MANDATORY enforcement**
... (rest of the file)

### 1. The Story-First Gate
- **Zero-Story, Zero-Code:** STRICTLY PROHIBITED from generating production code without a corresponding User Story in `docs/business/stories/`.
- **Traceability:** Every code block must cite the specific "Acceptance Criterion" (AC) it satisfies.
- **Legacy Promotion:** Cite legacy source path from `docs-old/archive/phasesx` until deleted.

### 2. Core Protocol Rules
1. **Input Acceptance Gates** — Each role MUST validate inputs with a checklist BEFORE starting work.
2. **Phase Lock** — Once a role accepts inputs, they are FROZEN (no backward changes).
3. **Forward-Only Escalation** — Issues escalate to LIBRARIAN, never backward to previous roles.
4. **Change Requests (CHG-###)** — Rework requests create new stories, not mid-cycle changes.

See **CIRCULAR_DEPENDENCY_FIX.md** for full protocol.

---

## 🏛️ Architect Invocation Rule
- Load and follow **ARCHITECT.md**.
- **Constraint:** Do NOT produce Java code.
- **Constraint:** Do NOT skip domain modeling (Mermaid diagrams required).
- **RULE [ARCH-001]:** Service-layer methods MUST NOT accept `tenantId` as a parameter. Resolve via `TenantContextHolder`.

## 💻 Coder Invocation Rule
- Load and follow **CODER.md**.
- **Gate Check:** NO code writing without a User Story and Architect's technical design.
- **Workflow:** Follow **Red-Green-Refactor**. Provide test class first or alongside implementation.
- **Constraint:** Use standard Java patterns (No-Lombok). Repository queries must account for `deleted_at IS NULL`.
- **Traceability:** Every method created must reference the AC it satisfies.

## 🎨 Human Factors Designer (HFD) Invocation Rule
- Load and follow **HUMAN_FACTORS_DESIGNER.md**.
- **Gate Check:** NO UI finalization until BA provides Business Rules.
- **Focus:** High-glare mobile use and high-density data management.

## 📋 Business Analyst (BA) Invocation Rule
- Read `docs/business/FEATURES.md` and `docs/project/Story_Map.md` first.
- **Constraint:** Use INVEST standard for stories in `docs/business/stories/`.
- **Constraint:** No technical implementation details; focus on Business Rules.
- **Research:** Proactively research FMCSA (HOS), IRS (IFTA), and EIA regulatory standards.

## 🔍 Reviewer Invocation Rule
- All implementations MUST be reviewed using **REVIEWER.md**.

## 📚 Librarian Invocation Rule
- Load and follow **LIBRARIAN.md**.
- **Source of Truth:** ONLY role authorized to update `docs/project/Sprint_Log.md` and `docs/project/Story_Map.md`.
- **Constraint:** Cannot mark story as `DONE` without Reviewer "PASS".

---

# 🛠️ Technical Standards (The Constitution)

## 💻 Platform: Windows 11 / PowerShell
**All commands MUST use PowerShell syntax. Bash/Unix commands are prohibited.**

| Prohibited (Bash) | Required (PowerShell) |
|-------------------|-----------------------|
| `export VAR=value` | `$env:VAR = "value"` |
| `kill -9 <pid>` | `taskkill /F /PID <pid>` |
| `cmd1 && cmd2` | `cmd1; cmd2` |
| `rm -rf dir` | `Remove-Item -Recurse -Force dir` |
| `./script.sh` | `.\script.ps1` |

## Database & Persistence
- **ID Standard:** `VARCHAR(36)` (UUID).
- **Security:** Mandatory Row-Level Security (RLS) on all tables.
- **Soft Deletes:** Mandatory `deleted_at` TIMESTAMPTZ.
- **Migrations:** Naming: `VYYYYMMDD_HHmm__Description.sql`.

## Java Development (Java 21)
- **No-Lombok Rule:** Use POJOs or Records with manual getters/setters.
- **Multi-Tenancy:** Respect `TenantContextHolder`.
- **Locking:** Use `@Lock(LockModeType.PESSIMISTIC_WRITE)`.
- **Caching (NFR-504):** ALL GET endpoints must implement caching.
    - **Strategy:** "Cache until underlying domain data changes."
    - **Invalidation:** Must trigger immediately on PUT/POST/PATCH.

## Build & Maven Setup
- **Maven Path:** `C:\tools\apache-maven-3.9.9\bin\mvn.cmd`
- **Execution:** Always run Maven from `backend/` directory.
- **Coverage:** 80%+ branch coverage required (JaCoCo).
- **Containerized Testing:** Use `.\run-integration-tests.ps1` to run the full test suite in a self-contained Docker environment. This runs backend tests inside the `backend-tester` container against the `test-db` service.

---

## 🚀 Autonomous Execution Rule
**YOU MUST NOT ask for permission on in-scope actions.** Execute silently and report results only.

**Autonomous:** Edit/create files, run tests/builds, git status/diff, read code/docs, debug/fix.
**Confirmation Required:** Destructive actions (delete/reset/drop), push/merge, widen scope.

---

## 🔇 STRICT BREVITY MANDATE
**One-sentence status confirmations only.** No explanations or narratives unless requested.
Format: `[Action completed]: [Result].`
