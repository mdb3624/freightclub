# Update Documentation

Regenerate all project documentation by scanning the live codebase. Spawns one sub-agent per document so all run concurrently.

## Documents Updated

| File | What it covers |
|------|---------------|
| `FEATURES.md` | All implemented, partial, and planned features per area |
| `REQUIREMENTS.md` | Phase-by-phase requirements with [DONE]/[PARTIAL]/[PENDING] status |
| `GAP-ANALYSIS.md` | Missing tests, unhandled error paths, security/data gaps, priority fixes |
| `ARCHITECTURE.md` | System design, component breakdown, ADRs, DB schema, multi-tenancy |
| `EXECUTIVE-SUMMARY.md` | One-page investor/stakeholder view: what's built, what's next, key risks |
| `PROJECT-PLAN.md` | Phase-by-phase delivery plan with scope, status, and next priorities |
| `CHANGELOG.md` (entry) | Summary of what changed across all docs |

## Steps

Spawn all six doc agents **in parallel** using the Agent tool with `run_in_background: true`, then write the CHANGELOG entry once all complete.

---

### Agent 1 — FEATURES.md

Prompt:
> Scan the FreightClub codebase at C:\projects\freightclub and write FEATURES.md to C:\projects\freightclub\FEATURES.md.
>
> Read: all backend controllers (controller/), all backend services (service/), all frontend pages (pages/), all frontend features (features/), all Flyway migrations (db/migration/), and any docs/ phase files.
>
> Structure:
> - Overview paragraph
> - Section per major feature area (Auth, Load Lifecycle, Notifications, Market Data, etc.)
>   - Each feature: name, status (Implemented / Partial / Planned), brief description
> - Notes on what's stubbed vs real
>
> Base everything on what you actually read — do not fabricate features not in the code.

---

### Agent 2 — REQUIREMENTS.md

Prompt:
> Scan the FreightClub codebase at C:\projects\freightclub and write REQUIREMENTS.md to C:\projects\freightclub\REQUIREMENTS.md.
>
> Read: all docs/ phase/user-story files, all backend controllers and services, all frontend pages and features, all Flyway migrations.
>
> Structure:
> - Summary table at top: total requirements per phase and % complete
> - Section per phase (Phase 1, 1.1, 1.2, 2, etc.)
>   - Each requirement with status: [DONE], [PARTIAL], [PENDING], [PLANNED]
>   - Brief note on what code implements it or what is missing
>
> Mark as PENDING if you cannot find the implementation in the code.

---

### Agent 3 — GAP-ANALYSIS.md

Prompt:
> Audit the FreightClub codebase at C:\projects\freightclub and write GAP-ANALYSIS.md to C:\projects\freightclub\GAP-ANALYSIS.md.
>
> Read: all backend test files (src/test/), all backend source (src/main/java/), all frontend source (frontend/src/), all Flyway migrations, all docs/ phase files.
>
> Structure:
> 1. Test Coverage Gaps — services/controllers/components with no corresponding tests; list specific missing file names
> 2. Unhandled Error Paths — missing error handling, try/catch, or validation; cite file:line
> 3. Incomplete Features — partially wired features (controller exists but service stubbed, or UI exists but API call missing)
> 4. Security Gaps — endpoints that should be authenticated, missing input validation
> 5. Data Integrity Gaps — missing DB constraints, missing FK checks
> 6. Priority Recommendations — top 5 gaps to fix before production
>
> Be specific: cite file names and line numbers. Only report gaps confirmed from the code.

---

### Agent 4 — ARCHITECTURE.md

Prompt:
> Scan the FreightClub codebase at C:\projects\freightclub and write ARCHITECTURE.md to C:\projects\freightclub\ARCHITECTURE.md.
>
> Read: CLAUDE.md, all backend source (src/main/java/com/freightclub/), all Flyway migrations (db/migration/), frontend vite.config.ts, frontend src/ structure (pages/, features/, components/, hooks/), application.yml, SecurityConfig.java.
>
> Structure:
> - System Overview (1-2 paragraphs)
> - Component Diagram (ASCII or markdown table: frontend → proxy → backend → DB)
> - Backend Layer Breakdown (controller → service → repository; key classes per layer)
> - Frontend Folder Structure (feature-sliced layout; key files per feature)
> - Auth Flow (JWT lifecycle, refresh cookie, token storage)
> - Multi-Tenancy Strategy (how tenant_id is enforced)
> - Database Design (core tables, FK relationships, soft-delete pattern, migration naming)
> - Key Architectural Decisions / ADRs (e.g. SELECT FOR UPDATE for claim locking, in-memory access token, Bucket4j rate limiting, EIA proxy with server-side cache)
>
> Base everything on what you actually read in the code.

---

### Agent 5 — EXECUTIVE-SUMMARY.md

Prompt:
> Scan the FreightClub codebase at C:\projects\freightclub and write EXECUTIVE-SUMMARY.md to C:\projects\freightclub\EXECUTIVE-SUMMARY.md.
>
> Read: CLAUDE.md, docs/ phase files, FEATURES.md (if it exists), REQUIREMENTS.md (if it exists), GAP-ANALYSIS.md (if it exists).
>
> Write a one-page stakeholder/investor summary with these sections:
> - **What FreightClub Is** (2–3 sentences: problem, solution, target user)
> - **Current State** (what phases are complete, what's live and working today)
> - **What's Next** (next 1–2 phases in progress or planned; key milestones)
> - **Key Risks** (top 3–5 risks: technical gaps, missing tests, security, incomplete features)
> - **Tech Stack Snapshot** (single table: layer → technology)
>
> Write for a non-technical audience. Keep it under 500 words. No code snippets. Must write to disk.

---

### Agent 6 — PROJECT-PLAN.md

Prompt:
> Scan the FreightClub codebase at C:\projects\freightclub and write PROJECT-PLAN.md to C:\projects\freightclub\PROJECT-PLAN.md.
>
> Read: CLAUDE.md, all docs/ phase files (phase-*.md, user-stories*.md, requirements*.md), REQUIREMENTS.md (if it exists), GAP-ANALYSIS.md (if it exists), all backend controllers and services, all frontend pages and features, all Flyway migrations.
>
> Structure:
> - **Project Goal** (1–2 sentences)
> - **Phase Summary Table** — one row per phase with: Phase, Name, Status (Complete / In Progress / Planned), % Done, key deliverables
> - **Phase Detail** — for each phase:
>   - Scope (what it includes)
>   - Status and completion %
>   - What's done (specific features confirmed in code)
>   - What's remaining (specific gaps)
>   - Blockers (if any)
> - **Immediate Next Priorities** — top 5 tasks to work on now, ordered by importance
> - **Out of Scope / Future** — features explicitly deferred beyond current roadmap
>
> Base phase status on what you actually find in the code and docs. Do not guess.
> Must write to disk using the Write tool.

---

### After all six complete — CHANGELOG entry

Append a new entry to `CHANGELOG.md` (create the file if it does not exist) with this format:

```markdown
## [Unreleased] — YYYY-MM-DD

### Documentation
- Regenerated FEATURES.md from live codebase scan
- Regenerated REQUIREMENTS.md with phase-by-phase completion status
- Regenerated GAP-ANALYSIS.md with confirmed gaps and priority recommendations
- Regenerated ARCHITECTURE.md with system design, ADRs, and DB schema
- Regenerated EXECUTIVE-SUMMARY.md with stakeholder view of current state and risks
- Regenerated PROJECT-PLAN.md with phase delivery plan and immediate next priorities
```

Replace `YYYY-MM-DD` with today's date.

## Notes

- Use `subagent_type: Explore` for all three doc agents (read-only codebase scanning)
- Each agent must **write its file to disk** using the Write tool — not return content inline
- If an agent returns content instead of writing to disk, write the file yourself from the returned content
- The CHANGELOG entry should be prepended (or appended if the file is new) — do not delete existing entries
