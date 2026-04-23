# Release Check

Pre-release gate: regenerate all documentation from the live codebase AND verify the test suite meets the 70% JaCoCo coverage gate. Only commits when both phases succeed.

## Overview

1. **Phase 1 — Parallel execution** (all in background simultaneously):
   - 6 doc-regeneration agents (one per document)
   - 1 test-coverage agent
2. **Phase 2 — Gate check**: if any agent failed, print a failure table and stop. Do NOT commit.
3. **Phase 3 — Finalize**: update CHANGELOG, `git add` all modified files, create a release-check commit, print a final status table.

---

## Phase 1 — Launch all agents in parallel (background)

Spawn all 7 agents **in a single message** using `run_in_background: true`. Do not wait between spawns.

---

### Doc Agent 1 — FEATURES.md

`subagent_type: Explore`

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
> You MUST write the file to disk using the Write tool. Do not return content inline.
> When done, print exactly one line: `RESULT: FEATURES.md OK`
> If you cannot write the file, print: `RESULT: FEATURES.md FAILED — <reason>`

---

### Doc Agent 2 — REQUIREMENTS.md

`subagent_type: Explore`

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
> You MUST write the file to disk using the Write tool. Do not return content inline.
> When done, print exactly one line: `RESULT: REQUIREMENTS.md OK`
> If you cannot write the file, print: `RESULT: REQUIREMENTS.md FAILED — <reason>`

---

### Doc Agent 3 — GAP-ANALYSIS.md

`subagent_type: Explore`

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
> You MUST write the file to disk using the Write tool. Do not return content inline.
> When done, print exactly one line: `RESULT: GAP-ANALYSIS.md OK`
> If you cannot write the file, print: `RESULT: GAP-ANALYSIS.md FAILED — <reason>`

---

### Doc Agent 4 — ARCHITECTURE.md

`subagent_type: Explore`

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
> You MUST write the file to disk using the Write tool. Do not return content inline.
> When done, print exactly one line: `RESULT: ARCHITECTURE.md OK`
> If you cannot write the file, print: `RESULT: ARCHITECTURE.md FAILED — <reason>`

---

### Doc Agent 5 — EXECUTIVE-SUMMARY.md

`subagent_type: Explore`

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
> Write for a non-technical audience. Keep it under 500 words. No code snippets.
> You MUST write the file to disk using the Write tool. Do not return content inline.
> When done, print exactly one line: `RESULT: EXECUTIVE-SUMMARY.md OK`
> If you cannot write the file, print: `RESULT: EXECUTIVE-SUMMARY.md FAILED — <reason>`

---

### Doc Agent 6 — PROJECT-PLAN.md

`subagent_type: Explore`

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
> You MUST write the file to disk using the Write tool. Do not return content inline.
> When done, print exactly one line: `RESULT: PROJECT-PLAN.md OK`
> If you cannot write the file, print: `RESULT: PROJECT-PLAN.md FAILED — <reason>`

---

### Test Agent — Coverage Gate

`subagent_type: general-purpose`

Prompt:
> Run the FreightClub backend test suite and verify the JaCoCo 70% line-coverage gate.
>
> Working directory: C:\projects\freightclub
> Shell: Git Bash on Windows. Use double-slash for Windows flags: `taskkill //F //PID`.
> Maven: `/c/tools/apache-maven-3.9.9/bin/mvn`
>
> **Step 1 — Run tests:**
> ```bash
> /c/tools/apache-maven-3.9.9/bin/mvn test -f /c/projects/freightclub/backend/pom.xml
> ```
> This writes the JaCoCo XML report to: `backend/target/site/jacoco/jacoco.xml`
>
> **Step 2 — Parse coverage:**
> Read `C:\projects\freightclub\backend\target\site\jacoco\jacoco.xml`.
> Extract LINE counters at the top-level `<report>` element (not per-package).
> Formula: `covered_ratio = covered / (covered + missed)` for the LINE counter.
> Exclude packages: `com/freightclub/dto`, `com/freightclub/domain`, `com/freightclub/exception`.
> Exclude class: `FreightclubBackendApplication`.
>
> **Step 3 — If overall LINE coverage ≥ 70%:**
> Run the verify phase to confirm the Maven gate:
> ```bash
> /c/tools/apache-maven-3.9.9/bin/mvn verify -f /c/projects/freightclub/backend/pom.xml
> ```
> Print exactly: `RESULT: TESTS OK — coverage=<X.X>% gate=BUILD SUCCESS`
>
> **Step 4 — If overall LINE coverage < 70%:**
> For each class below 70% (sorted by gap size descending):
> a. Find existing test file under `backend/src/test/java/` mirroring the source path.
> b. Read the source class to understand uncovered lines.
> c. Read the existing test file (if any) to avoid duplication.
> d. Write targeted tests using JUnit 5 + Mockito (`@ExtendWith(MockitoExtension.class)`).
>    - Constructor injection only — no `@Autowired` on fields.
>    - `LoadService` needs 7 mocks: `LoadRepository`, `UserRepository`, `DocumentService`, `RatingService`, `ClaimRepository`, `LoadEventRepository`, `NotificationService`.
>    - Do NOT test DTOs, domain/entity fields, or exception constructors.
>    - One behaviour per test method; descriptive names.
> e. Re-run `mvn test` and re-parse until coverage ≥ 70% or no further progress is possible.
>
> **Step 5 — Run verify to confirm gate:**
> ```bash
> /c/tools/apache-maven-3.9.9/bin/mvn verify -f /c/projects/freightclub/backend/pom.xml
> ```
> If BUILD SUCCESS: print `RESULT: TESTS OK — coverage=<X.X>% gate=BUILD SUCCESS`
> If BUILD FAILURE: print `RESULT: TESTS FAILED — coverage=<X.X>% gate=BUILD FAILURE — <list classes still below threshold>`

---

## Phase 2 — Gate check

After ALL 7 background agents complete, collect their `RESULT:` lines.

Build a status table:

```
Agent                   Status
---------------------------------------
FEATURES.md             OK
REQUIREMENTS.md         OK
GAP-ANALYSIS.md         OK
ARCHITECTURE.md         OK
EXECUTIVE-SUMMARY.md    OK
PROJECT-PLAN.md         OK
Test Coverage           OK — 74.3%
```

**If any row shows FAILED:**
- Print the table with FAILED rows highlighted.
- Print: `Release check FAILED. Fix the issues above before committing.`
- **Stop. Do not write CHANGELOG or create a commit.**

**If all rows show OK:** proceed to Phase 3.

---

## Phase 3 — Finalize (only runs when all Phase 1 agents succeed)

### 1. Update CHANGELOG.md

Prepend a new entry to `C:\projects\freightclub\CHANGELOG.md` (create the file if it does not exist). Read the existing file first, then prepend — do not delete existing entries.

Format:

```markdown
## [Unreleased] — YYYY-MM-DD

### Release Check
- All pre-release gates passed
- Regenerated FEATURES.md from live codebase scan
- Regenerated REQUIREMENTS.md with phase-by-phase completion status
- Regenerated GAP-ANALYSIS.md with confirmed gaps and priority recommendations
- Regenerated ARCHITECTURE.md with system design, ADRs, and DB schema
- Regenerated EXECUTIVE-SUMMARY.md with stakeholder view of current state and risks
- Regenerated PROJECT-PLAN.md with phase delivery plan and immediate next priorities
- Backend test suite: coverage=<X.X>% (gate ≥ 70% ✓)
```

Replace `YYYY-MM-DD` with today's date and `<X.X>%` with the actual coverage value from the test agent.

### 2. Stage and commit

Run the following in sequence:

```bash
cd /c/projects/freightclub

git add FEATURES.md REQUIREMENTS.md GAP-ANALYSIS.md ARCHITECTURE.md \
        EXECUTIVE-SUMMARY.md PROJECT-PLAN.md CHANGELOG.md

# Also stage any test files the coverage agent wrote/modified:
git add backend/src/test/java/ 2>/dev/null || true

git status
```

Then create the commit:

```bash
git commit -m "$(cat <<'EOF'
chore: release-check — regenerate docs and verify 70% coverage gate

All release-check gates passed:
- 6 documentation files regenerated from live codebase
- Backend test coverage ≥ 70% (JaCoCo gate: BUILD SUCCESS)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### 3. Print final status table

```
╔══════════════════════════════════════════════════════╗
║              RELEASE CHECK — PASSED                  ║
╚══════════════════════════════════════════════════════╝

Agent                   Status      Detail
─────────────────────────────────────────────────────
FEATURES.md             ✓ OK        Written to disk
REQUIREMENTS.md         ✓ OK        Written to disk
GAP-ANALYSIS.md         ✓ OK        Written to disk
ARCHITECTURE.md         ✓ OK        Written to disk
EXECUTIVE-SUMMARY.md    ✓ OK        Written to disk
PROJECT-PLAN.md         ✓ OK        Written to disk
Test Coverage           ✓ OK        <X.X>% (gate ≥ 70%)
CHANGELOG.md            ✓ Updated
Git Commit              ✓ <short SHA>

All gates passed. Safe to release.
```

---

## Notes

- Doc agents use `subagent_type: Explore` (read-only codebase scan + Write tool for output).
- The test agent uses `subagent_type: general-purpose` (needs Bash to run Maven).
- All Phase 1 agents run with `run_in_background: true` in a **single message** — do not spawn them one at a time.
- If a doc agent returns its content inline instead of writing to disk, write the file yourself from the returned content before proceeding to the gate check.
- Do not attempt to re-run failed agents automatically — report the failure and let the user decide.
- The commit is only created when **all 7 agents** report OK. Partial success is treated as failure.
