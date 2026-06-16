# Integration Test Script — Quick Reference Card

## One-Liner Cheatsheet

```powershell
# Full test pipeline (default)
.\scripts\build-and-test-docker.ps1

# Backend tests only
.\scripts\build-and-test-docker.ps1 -TestType backend

# Frontend E2E only
.\scripts\build-and-test-docker.ps1 -TestType frontend

# Build + start Docker, skip tests
.\scripts\build-and-test-docker.ps1 -SkipTests

# Keep Docker running after tests (for debugging)
.\scripts\build-and-test-docker.ps1 -LeaveRunning

# Don't rebuild images (faster iteration)
.\scripts\build-and-test-docker.ps1 -SkipDockerBuild

# Backend tests, keep Docker running, don't rebuild images
.\scripts\build-and-test-docker.ps1 -TestType backend -LeaveRunning -SkipDockerBuild
```

---

## Parameter Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|---|
| `-TestType` | string | `both` | `backend` \| `frontend` \| `both` |
| `-SkipTests` | switch | `$false` | Build & start Docker, don't run tests |
| `-LeaveRunning` | switch | `$false` | Don't cleanup Docker after tests |
| `-SkipDockerBuild` | switch | `$false` | Use existing images (faster) |
| `-LogPath` | string | `./test-results` | Where to save test logs |

---

## Typical Workflows

### 1. "I Just Want to Run Tests"
```powershell
.\scripts\build-and-test-docker.ps1
```
Takes ~5-10 min. Cleans up after.

### 2. "I'm Debugging a Failing Test"
```powershell
.\scripts\build-and-test-docker.ps1 -LeaveRunning
# Navigate to http://localhost:9090 or run manual tests
# When done:
docker compose -f docker-compose.test.yml down -v
```

### 3. "I Only Changed Test Code (Not App Code)"
```powershell
.\scripts\build-and-test-docker.ps1 -SkipDockerBuild
```
Faster (~2-3 min), skips Maven/npm build.

### 4. "I Want to See if My Changes Even Compile"
```powershell
.\scripts\build-and-test-docker.ps1 -SkipTests -LeaveRunning
```
Builds app, starts Docker, but skips tests. Good for sanity check.

### 5. "I'm Iterating on Test Code Rapidly"
```powershell
.\scripts\build-and-test-docker.ps1 -SkipDockerBuild -TestType frontend
```
~2 min turnaround. Reuses Docker images.

---

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | ✅ Success (tests may have failed, but pipeline completed) |
| `1` | ❌ Critical failure (Maven, Docker, or health check) |

---

## Log Files Location

All results saved to `./test-results/` (or your `-LogPath`):

| File | Contains |
|------|----------|
| `backend-build.log` | Maven build output |
| `backend-tests.log` | JUnit test results + failures |
| `frontend-build.log` | npm build output |
| `frontend-e2e-tests.log` | Playwright test results |
| `docker-backend-logs.txt` | Backend container logs |
| `docker-frontend-logs.txt` | Frontend container logs |
| `docker-db-logs.txt` | Database container logs |
| `jacoco-backend/` | Code coverage report (open `index.html`) |
| `playwright-results/` | E2E test screenshots, traces, videos |

---

## Key Keyboard Shortcuts

```powershell
# Cancel running script
Ctrl+C

# View Docker logs while running
# (in another PowerShell window)
docker logs -f freightclub-test-backend
docker logs -f freightclub-test-frontend

# List running containers
docker ps

# Stop all Docker containers
docker compose -f docker-compose.test.yml down

# Remove volumes too (full cleanup)
docker compose -f docker-compose.test.yml down -v
```

---

## Troubleshooting Flowchart

```
Script fails?
│
├─ "CRITICAL: docker not found"
│  └─ Install Docker Desktop
│
├─ "ERROR: Backend build failed"
│  └─ Check ./test-results/backend-build.log
│     └─ If "locked": taskkill /F /PID <java-pid>
│     └─ If "missing symbol": Update code, re-run
│
├─ "ERROR: Frontend build failed"
│  └─ Check ./test-results/frontend-build.log
│     └─ If npm error: rm frontend/node_modules && re-run
│     └─ If build error: Check React code
│
├─ "TIMEOUT: Docker containers failed"
│  └─ Check: docker compose -f docker-compose.test.yml logs
│     └─ If port in use: taskkill /F /FI "MEMUSAGE>10" (or reboot)
│     └─ If startup error: Check backend/DB logs
│
├─ "ERROR: Backend health check failed"
│  └─ docker logs freightclub-test-backend | tail -50
│     └─ Check if DB is healthy: docker logs freightclub-test-db
│
└─ Tests failed but I need to debug
   └─ Re-run with: -SkipTests -LeaveRunning
      └─ Manually test: http://localhost:9090
      └─ Cleanup: docker compose -f docker-compose.test.yml down -v
```

---

## Environment Checklist

Before running the script, verify:

- [ ] `docker --version` works
- [ ] `mvn --version` works
- [ ] `npm --version` works
- [ ] `.env.test` exists in project root
- [ ] No Java process running (`tasklist | findstr java`)
- [ ] Ports 9090, 9091, 5433 are free
- [ ] Running from project root directory

---

## PowerShell Execution Policy

If you get "cannot be loaded because running scripts is disabled":

```powershell
# Allow scripts for this session only
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process

# Then run the script
.\scripts\build-and-test-docker.ps1
```

---

## Integration with VS Code

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run Integration Tests",
      "type": "shell",
      "command": "powershell",
      "args": [".\\scripts\\build-and-test-docker.ps1"],
      "problemMatcher": [],
      "group": {
        "kind": "test",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Run Backend Tests Only",
      "type": "shell",
      "command": "powershell",
      "args": [".\\scripts\\build-and-test-docker.ps1", "-TestType", "backend"],
      "problemMatcher": [],
      "group": {
        "kind": "test"
      }
    }
  ]
}
```

Then in VS Code: **Terminal → Run Task → Run Integration Tests** (or Ctrl+Shift+B)

---

## GitHub Status Badge

Add to your README.md to show test status:

```markdown
![Integration Tests](https://github.com/yourrepo/actions/workflows/integration-tests.yml/badge.svg)
```

---

## Support Resources

- **Script docs:** `./scripts/BUILD_TEST_DOCKER_README.md`
- **Project setup:** `./CLAUDE.md`
- **Docker docs:** `./docker-compose.test.yml`
- **Test environment:** `./TEST_ENVIRONMENT.md`
