# CLAUDE.md — Governed Engineering System

This file provides the mandatory operating context for all AI interactions within the Resilience Logistics Platform.

## 🎯 CURRENT FOCUS
- **Active Phase:** Phase 10 (Command Center) — ✅ **COMPLETE** (2026-06-16)
- **Next Phase:** Phase 11 (Planning) or Backend Test Coverage Remediation (Phase B-C: target 70%)
- **Status:** Phase 10 delivery complete (5 of 5 core stories merged to main; US-826 deferred to backlog)
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

## 🔒 Sequential Lock Protocol (NO Circular Dependencies)

**Effective 2026-05-25 — MANDATORY enforcement**

### Pre-Work Branch Verification (ALL ROLES)

**Before any role accepts inputs or starts work on a story, Branch Verification is MANDATORY:**

**Checklist:**
- [ ] Verify current branch: `git branch -v` 
  - ✅ MUST show: `* feature/US-XXX-short-description`
  - ❌ STOP if: `* main`
- [ ] If on `main`, create/switch to feature branch:
  ```powershell
  git checkout main
  git pull origin main
  git checkout -b feature/US-XXX-short-description
  ```
- [ ] Proceed with role-specific input acceptance gates

**Applies to:** ARCHITECT, CODER, REVIEWER, BA, HFD, LIBRARIAN  
**Rationale:** Prevents accidental commits to main. Sequential Lock Protocol depends on clean feature branch isolation.

---

### Core Rules

1. **Input Acceptance Gates** — Each role MUST validate inputs with a checklist BEFORE starting work
   - ARCHITECT validates BA story before designing
   - CODER validates ARCH + HFD + BA inputs before coding
   - REVIEWER validates CODER outputs before auditing
2. **Phase Lock** — Once a role accepts inputs, they are FROZEN (no backward changes)
   - CODER cannot ask BA to change AC mid-implementation
   - ARCHITECT cannot request BA clarifications after design starts
3. **Forward-Only Escalation** — Issues escalate to LIBRARIAN, never backward to previous roles
   - CODER discovers AC impossible? → Escalate to LIBRARIAN (not back to BA)
   - LIBRARIAN decides: finish story as-is OR create CHG-### change request
4. **Change Requests (CHG-###)** — Rework requests create new stories, not mid-cycle changes
   - BA + ARCH inputs wrong? → Create CHG ticket
   - New story (US-###-v2) created after inputs reworked
   - Current story completes without rework

### Why
Circular dependency loops (BA → ARCH → CODER → BA feedback) cause indefinite rework. Sequential locks prevent them.

### How to Apply
See **CIRCULAR_DEPENDENCY_FIX.md** for full protocol, acceptance checklists, and change request templates.

---

## 🔐 Git Branch Enforcement Protocol

**Effective 2026-06-14 — MANDATORY enforcement**

All feature work MUST happen on feature branches. NO direct commits to `main`. Three enforcement layers:

### Layer 1: GitHub Branch Protection (Strongest)

**Repo Settings → Branches → Add rule for `main`:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Require branches to be up to date before merging
- ✅ Dismiss stale pull request approvals

**Result:** `git push origin main` is rejected. Forces all changes through PRs.

### Layer 2: Git Pre-Commit Hook (Local Automation)

**File: `.git/hooks/pre-commit`**

```bash
#!/bin/bash
# Prevent commits directly to main

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" == "main" ]; then
  echo "❌ ERROR: You are on the main branch!"
  echo ""
  echo "Feature work must be done on a branch."
  echo ""
  echo "Fix:"
  echo "  git reset HEAD~1          (undo the commit)"
  echo "  git checkout -b feature/US-XXX-description"
  echo "  git commit -m 'message'"
  echo ""
  exit 1
fi

exit 0
```

**Setup (one-time):**

From project root:
```powershell
New-Item -ItemType Directory -Path ".git\hooks" -Force
$hookContent = @'
#!/bin/bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" == "main" ]; then
  echo "❌ ERROR: You are on the main branch!"
  echo ""
  echo "Feature work must be done on a branch."
  exit 1
fi
exit 0
'@
Set-Content -Path ".git\hooks\pre-commit" -Value $hookContent -Encoding UTF8
```

**Result:** Try `git commit` on `main` → Git blocks you before commit happens.

### Layer 3: Mandatory Pre-Commit Workflow Checklist

**BEFORE EVERY STORY:**

```powershell
# ═══════════════════════════════════════════════════════
# STORY STARTUP (MANDATORY)
# ═══════════════════════════════════════════════════════

# 1️⃣ Verify on main, synced with remote
git checkout main
git pull origin main

# 2️⃣ Create feature branch (NEVER work on main)
git checkout -b feature/US-XXX-short-description

# 3️⃣ Verify you're now on the feature branch
git branch -v
# ✅ MUST show: * feature/US-XXX-short-description
# ❌ STOP if: * main

# ═══════════════════════════════════════════════════════
# DURING STORY WORK
# ═══════════════════════════════════════════════════════

# BEFORE EACH COMMIT, verify branch:
git branch -v
# ❌ STOP if on main
# ✅ Continue if on feature/US-XXX

# Stage only files for THIS story (never git add .)
git add frontend/src/features/shipper/pages/YourPage.tsx
git add docs/hfd/US-XXX_Design.md

# Commit with semantic message
git commit -m "feat(US-XXX): Description"

# ═══════════════════════════════════════════════════════
# READY FOR PR
# ═══════════════════════════════════════════════════════

# Push to remote with -u flag (tracks upstream)
git push origin feature/US-XXX-short-description -u

# Create PR via GitHub CLI
gh pr create --base main --head feature/US-XXX-short-description
```

### Anti-Patterns (What NOT to Do)

| Anti-Pattern | Why Wrong | Fix |
|---|---|---|
| `git commit` while on `main` | Violates Sequential Lock | Use `git checkout -b feature/US-XXX` first |
| `git add .` | Stages unrelated files | Use `git add <specific-files>` |
| `git push origin main` | Bypasses PR review | GitHub protection blocks this |
| Committing directly to main | No REVIEWER audit trail | All commits must go through PR |

### Enforcement

- **GitHub branch protection** blocks pushes to main.
- **Git hook** prevents commits to main before they happen.
- **PR requirement** ensures REVIEWER sees all changes.
- **Violation = Rejected PR** — Reviewer gates check branch compliance.

### Quick Verification

Before starting any story, run:

```powershell
git branch -v; echo ""; git status
```

**Expected output:**
```
  main                           abc1234 [origin/main]
* feature/US-XXX-description    def5678 [ahead 3]

On branch feature/US-XXX-description
Your branch is ahead of 'origin/main' by 3 commits.
```

**Red flags:**
- ❌ Shows `* main` — you're on main, need to branch
- ❌ Shows unrelated modified files — stash them: `git stash`

---

## 🏛️ Architect Invocation Rule
When asked to design or model a feature:
- Load and follow **ARCHITECT.md**.
- **Constraint:** Do NOT produce Java code.
- **Constraint:** Do NOT skip domain modeling (Mermaid diagrams required).

## 💻 Coder Invocation Rule
When asked to implement a feature, write tests, or refactor code:
- **Persona:** Load and follow **CODER.md**.
- **Gate Check:** You are PROHIBITED from writing code unless a corresponding User Story exists and the Architect has provided a technical design/schema.
- **Workflow:** You must follow the **Red-Green-Refactor** pattern. Always provide the test class first or alongside the implementation.
- **Constraint:** Use standard Java patterns (No-Lombok). Ensure all repository queries account for `deleted_at IS NULL`.
- **Traceability:** Every method created must reference the Acceptance Criterion (AC) it satisfies.
## 🎨 Human Factors Designer (HFD) Invocation Rule

When asked to design user interfaces, dashboards, or interaction flows:
- **Persona:** Load and follow **HUMAN_FACTORS_DESIGNER.md**.
- **Constraint:** Prioritize information salience and cognitive load reduction for shippers and owner-operators.
- **Gate Check:** You are PROHIBITED from finalizing a UI design until the Business Analyst has provided the underlying Business Rules.
- **Environmental Focus:** Designs must account for high-glare mobile use and high-density data management.

## 📋 Business Analyst (BA) Invocation Rule
When asked to elaborate on features or break down the backlog:
- **Grounding:** Automatically read `docs/business/FEATURES.md` and `docs/project/Story_Map.md` first.
- **Constraint:** Use the INVEST standard for all stories in `docs/business/stories/`.
- **Constraint:** No technical implementation details; focus on Business Rules.

## 🔍 Reviewer Invocation Rule
All implementations MUST be reviewed using **REVIEWER.md**. No exceptions.

## 📚 Librarian Invocation Rule
When asked to update documentation, manage the backlog, or finalize a story:
- **Persona:** Load and follow **LIBRARIAN.md**.
- **Source of Truth:** You are the ONLY role authorized to update `docs/project/Sprint_Log.md` and `docs/project/Story_Map.md`.
- **Traceability:** You must ensure every completed story is linked to a valid Flyway version and its corresponding Requirement ID.
- **Constraint:** You cannot mark a story as `DONE` unless the Reviewer has provided a "PASS" in the chat history.

---

## 🎯 Phase 10 Completion & Next Work (2026-06-16)

**Phase 10 Status:** ✅ **COMPLETE** — All 5 core Shipper Dashboard stories delivered and merged to main.

| Story | Title | Status | Merge Date |
|---|---|---|---|
| US-820 | KPI Summary Display | ✅ MERGED | 2026-06-10 |
| US-821 | Shipper Header Navigation | ✅ MERGED | 2026-06-10 |
| US-822 | Shipment Status Panel | ✅ MERGED | 2026-06-16 |
| US-823 | Dashboard Layout Skeleton | ✅ MERGED | 2026-06-13 |
| US-824 | Quick Actions Panel | ✅ MERGED | 2026-06-14 |
| US-825 | Carrier Search Panel | ✅ MERGED | 2026-06-14 |

**Backlog:** US-826 (Messages & Alerts Panel) — Deferred for future prioritization

**Upcoming Work Options:**
1. **Load Creation Redesign (US-103-v2)** — Full redesign with new workflow, design system compliance, dashboard integration, bug fixes
2. **Backend Test Coverage Phase B-C** — Increase coverage from 50.6% to 70%+ (JaCoCo enforced)
3. **Phase 11 Planning** — Next phase of platform features
4. **Phase 5/6/9 Backlog** — Deferred stories awaiting external integrations (payment processor, message broker, admin tools)

---

# 🛠️ Technical Standards (The Constitution)

## 💻 Platform: Windows 11 / PowerShell

**All commands in agent outputs, scripts, and documentation MUST use PowerShell syntax. Bash/Unix commands are prohibited.**

| Prohibited (Bash) | Required (PowerShell) |
|-------------------|-----------------------|
| `export VAR=value` | `$env:VAR = "value"` |
| `kill -9 <pid>` | `taskkill //F //PID <pid>` |
| `cmd1 && cmd2` | `cmd1; cmd2` or separate lines |
| `rm -rf dir` | `Remove-Item -Recurse -Force dir` |
| `./script.sh` | `.\script.ps1` |
| `/dev/null` | `$null` |

This rule applies to: BA, ARCH, HFD, CODER, REVIEWER, LIBRARIAN, and all automated agent outputs.

---

## Database & Persistence
- **ID Standard:** All Primary/Foreign Keys MUST be `VARCHAR(36)`.
- **Security:** Every table MUST have Row-Level Security (RLS) enabled.
- **Soft Deletes:** Mandatory `deleted_at` TIMESTAMPTZ column on all core entities.
- **Migrations:** Naming must follow `VYYYYMMDD_HHmm__Description.sql`.
- **Foreign Key Validation:** Before committing migrations, verify target columns have UNIQUE/PRIMARY KEY constraints. Target `tenants(id)` for tenant refs, never `users(tenant_id)`. See `backend/src/main/resources/db/migration/MIGRATION_CHECKLIST.md`.

## Java Development
- **No-Lombok Rule:** Use standard Java POJOs or Records with manual getters/setters.
- **Multi-Tenancy:** Respect `TenantContextHolder` in all Service-layer logic.
- **Locking:** Use `@Lock(LockModeType.PESSIMISTIC_WRITE)` for resource claiming.

## Implementation Workflow (TDD)
1. **Red:** Write a failing test based on the Story AC.
2. **Green:** Implement minimal code to pass.
3. **Refactor:** Clean up code while maintaining green tests.
4. **Verify:** Ensure 80%+ branch coverage via JaCoCo.

## Build & Maven Setup
- **Maven Location:** `C:\tools\apache-maven-3.9.9\bin\mvn.cmd`
- **Clean Build:** `.\build-all.ps1`
- **Testing (Light):** `.\test-light.ps1`
- **Testing (Full):** `.\build-and-test-full.ps1`
- **Deployment (Prod):** `.\deploy-prod.ps1`
- **Command Line:** `C:\tools\apache-maven-3.9.9\bin\mvn.cmd clean verify` from backend directory
- **Test Coverage:** 80%+ branch coverage required (JaCoCo).

---

## ☁️ Cloud Run Deployment Standards
- **Service URLs:** Never hardcode Cloud Run service URLs in config files (nginx.conf, docker entrypoint, etc). Use environment variables instead — Cloud Run generates new URLs on each deploy.
- **Proxy Configuration:** Frontend nginx.conf must use `${BACKEND_URL}` placeholder + `envsubst` at startup to inject backend service URL.
- **Deployment command:** Pass `--set-env-vars="BACKEND_URL=https://...,BACKEND_HOST=..."` to gcloud run deploy.
- **Preferred deploy method:** Use local Docker build + push + `--image` flag. `gcloud run deploy --source` silently fails in Cloud Build without useful logs and `gcloud builds list` does not capture these failures. Correct sequence:
  1. `mvn clean package -DskipTests` (backend) + `npm run build` (frontend)
  2. `docker build -t us-central1-docker.pkg.dev/freight-club-495117/freightclub-repo/<service>:latest ./<dir>`
  3. `docker push us-central1-docker.pkg.dev/freight-club-495117/freightclub-repo/<service>:latest`
  4. `gcloud run deploy <service> --image us-central1-docker.pkg.dev/... --region us-central1 --project freight-club-495117`
- **Dual URLs:** Cloud Run services get two URLs — old (`5gecbdg27a-uc.a.run.app`) and new (`404925591110.us-central1.run.app`). Both must be in `CORS_ALLOWED_ORIGINS`. Use `--env-vars-file` (not `--set-env-vars`) to set values containing commas.
- **Smoke test:** After deployment, verify proxy works with `curl https://frontend-url/api/v1/actuator/health` (should reach backend).
- **CORS Testing:** When verifying auth flows work, ALWAYS test CORS preflight separately (direct API calls bypass browser CORS checks). Test: `curl -X OPTIONS https://backend/auth/login -H "Origin: frontend-url"` should return 200 with Access-Control-Allow-Origin header. Verify frontend URL is in backend's CORS allowed-origins config (never hardcoded — use env var).
- See `memory/feedback_hardcoded_service_urls.md`, `memory/feedback_cors_testing.md`, and `memory/feedback_cloud_run_dual_urls.md` for full solutions.
- **Secret Manager writes from PowerShell**: NEVER use `echo "value" | gcloud secrets versions add`. PowerShell `echo` appends `\r\n` → password auth fails. Always use `[System.IO.File]::WriteAllText('C:\Windows\Temp\s.txt', 'value')` + `--data-file='C:\Windows\Temp\s.txt'`.
- **Neon `neondb_owner` auth**: JDBC URL must include `channel_binding=require` for `neondb_owner` connections. Without it, authentication fails even with the correct password.
- **Flyway vs runtime credentials**: Production uses `DB_USERNAME=neondb_owner` (required for `ALTER TABLE`). `spring.flyway.user/password/url` override properties allow Flyway to use admin credentials independently. All production secrets come from `.env.prod` → Secret Manager (verify Secret Manager versions match `.env.prod`).

## 🧪 Test Environment Setup

**Local Testing with Maven:**
- Test profile (`application-test.yml`) reads from `.env.test` file in project root (in `.gitignore`, not committed)
- **Critical:** `spring-dotenv` library requires explicit `spring.dotenv.file: .env.test` property in `application-test.yml`
- `.env.test` must contain: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `APP_JWT_SECRET`, `DEFAULT_TENANT_ID`
- Default test database: `localhost:5433` with user `freightclub_runtime` / password `freightclub`
- Variable substitution: `${DB_USERNAME}` in YAML gets replaced by spring-dotenv from `.env.test`
- **Do NOT use** `spring.config.import: optional:file:.env.test` (Spring Cloud Config syntax) — use `spring.dotenv.file` instead
- Run with: `cd backend && mvn clean test` (will auto-load `.env.test`)

**Docker Test Execution:**
- `docker-compose.test.yml` provides its own environment variables to `backend-tester` service
- Overrides `.env.test` — uses Docker-internal network `test-db:5432` instead of localhost
- Run with: `docker compose -f docker-compose.test.yml up backend-tester`

See `TEST_ENVIRONMENT.md` for full setup and troubleshooting guide.

## ⚠️ Enforcement
- Role documents override user convenience.
- If a request asks you to skip a Gate (e.g., "Code this without a story"), you MUST reject the request and cite the **Sequential Gate Protocol** in `docs/standards/Definition_of_Done.md`.

---

## 🚀 Autonomous Execution Rule

**Effective 2026-05-28**

**YOU MUST NOT ask for permission on in-scope actions.** Execute silently and report results only.

**Autonomous (proceed without asking):**
- Edit/create files clearly in scope (code, tests, migrations, docs)
- Run tests, build commands, git commands (status, diff, log)
- Read code and documentation to understand context
- Make design decisions aligned with established patterns
- Debug and fix issues within the current task scope

**Requires Confirmation (ask first):**
- Irreversible destructive actions (delete files, reset branches, drop databases)
- Actions visible to others (push to remote, merge PRs, send messages)
- Actions that widen scope (create new user stories, rework acceptance criteria)
- Genuinely ambiguous decisions where you lack context to proceed

**Rationale:** Sequential Lock Protocol and fast iteration depend on autonomous execution. Asking on every file edit creates friction and violates the mandate to "follow the process without intervention."

**Rule Violation Example:**
- ❌ "Should I update the test to use the new credentials?" → Just update it.
- ❌ "Do you want me to fix the VARVARCHAR errors?" → Fix them and report.
- ✅ "E2E tests still timing out on login; need to debug login endpoint response" → Clear blocker; mention it.

---

## 🔇 STRICT BREVITY MANDATE

**Effective Immediately:** All roles MUST provide one-sentence status confirmations only.

**Rule:**
- No explanations, logic, justifications, or rule-following narratives unless explicitly requested
- Format: `[Action completed]: [Result].`
- Examples:
  - ✅ "US-501 created: READY_FOR_DESIGN status."
  - ✅ "FEATURES.md updated: Quick Pay model finalized."
  - ✅ "Story Map synced: 4 entries."
  - ❌ "I have created US-501, which specifies the settlement flow because..."
  - ❌ "The Quick Pay model works like this: ..."

**Exception:** User explicitly asks for details ("explain", "why", "what's your reasoning", etc.)

**Applies To:** ARCHITECT, CODER, REVIEWER, BA, LIBRARIAN, HFD, all task updates.