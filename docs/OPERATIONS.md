# Operations Reference

Operational/reference material relocated out of the root `CLAUDE.md` (2026-07-19 governance restructure — see `/roast` council verdict) so it isn't reloaded into every agent turn. Read this on-demand when doing the task it covers.

---

## Platform: Windows 11 / PowerShell

All commands in agent outputs, scripts, and documentation MUST use PowerShell syntax. Bash/Unix commands are prohibited.

| Prohibited (Bash) | Required (PowerShell) |
|-------------------|-----------------------|
| `export VAR=value` | `$env:VAR = "value"` |
| `kill -9 <pid>` | `taskkill //F //PID <pid>` |
| `cmd1 && cmd2` | `cmd1; cmd2` or separate lines |
| `rm -rf dir` | `Remove-Item -Recurse -Force dir` |
| `./script.sh` | `.\script.ps1` |
| `/dev/null` | `$null` |

Applies to: BA, ARCH, HFD, CODER, REVIEWER, LIBRARIAN, and all automated agent outputs.

---

## Build & Maven Setup

- **Maven Location:** `C:\tools\apache-maven-3.9.9\bin\mvn.cmd`
- **Clean Build:** `.\build-all.ps1`
- **Testing (Light):** `.\test-light.ps1`
- **Testing (Full):** `.\build-and-test-full.ps1`
- **Deployment (Prod):** `.\deploy-prod.ps1`
- **Command Line:** `C:\tools\apache-maven-3.9.9\bin\mvn.cmd clean verify` from backend directory
- **Test Coverage:** 80% branch coverage is the target to ratchet toward. CI-enforced floor today is 65% branch, via `backend/pom.xml`'s JaCoCo `check` goal (fixed 2026-07-20 — previously bound to the `verify` phase, which neither CI nor local dev ever reach, so it silently never ran; now bound to `test`, so `mvn test` alone enforces it).

---

## Cloud Run Deployment Standards

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

---

## Jira Integration

- **Domain (correct spelling):** `mdb-intergrated-logistics.atlassian.net` — note "Int**erg**rated" (extra "r"). This is the actual org name; do not "fix" it to "integrated" — that spelling 404s. Verify against the browser URL bar if any Jira API call 404s unexpectedly, before assuming an auth/permission issue.
- **Two MCP servers:** `jira` (npm `jira-mcp`, read-only: `get_issue`, `jql_search`) and `jira-write` (custom server at `scripts/jira-write-mcp/`, exposes `jira_list_transitions`, `jira_transition_issue`, `jira_add_comment`, `jira_add_attachment`, `jira_create_issue`, `jira_update_fields`). Both are pre-allowed in `.claude/settings.json` — use them directly, do not re-derive curl/Node workarounds.
- **`Bash(curl *)` is denied** by project policy (`.claude/settings.json`). For any ad-hoc HTTP call, use Node's built-in `fetch` via Bash, or extend `scripts/jira-write-mcp/index.js` if it's a recurring Jira need.
- **Windows MCP config gotcha:** Always use an absolute path for `command` in `.mcp.json` (e.g. `C:\\Program Files\\Git\\bin\\bash.exe`), never a bare `bash`. `C:\Windows\System32\bash.exe` (WSL launcher) can shadow Git Bash depending on which process's PATH resolves it, causing instant `MCP error -32000: Connection closed` instead of a clear error.
- **Story ID ↔ Jira key mapping:** `docs/project/Story_ID_to_Jira_Mapping.md`/`.csv`, `JIRA_WORKFLOW.md` (transition IDs: `11`=To Do, `21`=In Progress, `31`=Done for project FREIG).
- See `memory/feedback_jira_full_access.md`, `memory/project_jira_domain_correction.md`, and `memory/gotcha_windows_bash_wsl_shadow.md` for full details.

---

## Test Environment Setup

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

---

## Git Branch Enforcement — Full Setup & Workflow

**Effective 2026-06-14.** All feature work MUST happen on feature branches. NO direct commits to `main`. Three enforcement layers; see root `CLAUDE.md` for the short summary and the current real state of Layer 2.

### Layer 1: GitHub Branch Protection (Strongest)

**Repo Settings → Branches → Add rule for `main`:**
- Require pull request reviews before merging
- Require status checks to pass
- Require branches to be up to date before merging
- Dismiss stale pull request approvals

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

**Setup (one-time), from project root:**
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

**Note (2026-07-20):** `.git/hooks/pre-commit` now runs the branch-blocking script above (added ahead of the existing `Story_Map.md` check) — but only in clones where someone has applied it. `.git/hooks/` is never version-controlled, so this fix does not ship via `git pull`; every clone/machine needs the setup script above run once, manually.

**Commit message format:** `.git/hooks/commit-msg` (also untracked, also needs manual setup per-clone) requires every commit message to start with `type(US-XXX):` — e.g. `feat(US-501):`, `fix(US-501):`, `chore(US-501):`. For governance/process/meta work with no story ID (like this doc restructure), the accepted prefix is `chore(GOVERNANCE):`. If a fresh clone's hook rejects that prefix, it means the hook predates this convention — edit the regex in `.git/hooks/commit-msg` to add `|GOVERNANCE` to the allowed pattern, matching what's shown in the commit history for PRs #56-#59.

### Layer 3: Mandatory Pre-Commit Workflow Checklist

**BEFORE EVERY STORY:**

```powershell
# 1. Verify on main, synced with remote
git checkout main
git pull origin main

# 2. Create feature branch (NEVER work on main)
git checkout -b feature/US-XXX-short-description

# 3. Verify you're now on the feature branch
git branch -v
# MUST show: * feature/US-XXX-short-description; STOP if: * main
```

**DURING STORY WORK — before each commit:**
```powershell
git branch -v
# STOP if on main; continue if on feature/US-XXX

# Stage only files for THIS story (never git add .)
git add frontend/src/features/shipper/pages/YourPage.tsx
git add docs/hfd/US-XXX_Design.md

git commit -m "feat(US-XXX): Description"
```

**READY FOR PR:**
```powershell
git push origin feature/US-XXX-short-description -u
gh pr create --base main --head feature/US-XXX-short-description
```

### Anti-Patterns

| Anti-Pattern | Why Wrong | Fix |
|---|---|---|
| `git commit` while on `main` | Violates Sequential Lock | Use `git checkout -b feature/US-XXX` first |
| `git add .` | Stages unrelated files | Use `git add <specific-files>` |
| `git push origin main` | Bypasses PR review | GitHub protection blocks this |
| Committing directly to main | No REVIEWER audit trail | All commits must go through PR |

### Quick Verification

```powershell
git branch -v; echo ""; git status
```

**Expected:**
```
  main                           abc1234 [origin/main]
* feature/US-XXX-description    def5678 [ahead 3]

On branch feature/US-XXX-description
Your branch is ahead of 'origin/main' by 3 commits.
```

**Red flags:** shows `* main` (need to branch), or shows unrelated modified files (stash them: `git stash`).
