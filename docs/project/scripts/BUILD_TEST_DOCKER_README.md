# Integration Test Pipeline: build-and-test-docker.ps1

Automates the complete clean build → Docker → test workflow for FreightClub.

---

## Quick Start

```powershell
# From project root, run:
.\scripts\build-and-test-docker.ps1
```

That's it. The script handles everything:
1. ✅ Kill stale Java processes
2. ✅ Clean Docker environment
3. ✅ Build backend (mvn clean package)
4. ✅ Build frontend (npm ci + npm run build)
5. ✅ Start Docker with health checks
6. ✅ Run both backend + frontend tests
7. ✅ Capture logs and results
8. ✅ Clean up Docker

---

## Common Usage Patterns

### Run Backend Tests Only
```powershell
.\scripts\build-and-test-docker.ps1 -TestType backend
```

### Run Frontend E2E Tests Only
```powershell
.\scripts\build-and-test-docker.ps1 -TestType frontend
```

### Build and Start Docker (Skip Tests)
```powershell
.\scripts\build-and-test-docker.ps1 -SkipTests
```
Useful for manual testing or debugging. Containers stay running until you stop them.

### Build and Leave Containers Running (for Debugging)
```powershell
.\scripts\build-and-test-docker.ps1 -LeaveRunning
```
After tests complete, Docker is still up. View logs with:
```powershell
docker compose -f docker-compose.test.yml logs -f
```

### Use Existing Docker Images (No Rebuild)
```powershell
.\scripts\build-and-test-docker.ps1 -SkipDockerBuild
```
Faster for iterating on test code without code changes. Uses existing images.

### Save Results to Custom Directory
```powershell
.\scripts\build-and-test-docker.ps1 -LogPath ./my-test-results
```

### Combine Options
```powershell
# Backend tests only, keep Docker running for debugging
.\scripts\build-and-test-docker.ps1 -TestType backend -LeaveRunning

# Frontend tests, don't rebuild images
.\scripts\build-and-test-docker.ps1 -TestType frontend -SkipDockerBuild
```

---

## Script Phases (What Happens)

| Phase | Action | Failure Handling |
|-------|--------|---|
| 1 | Pre-flight checks (PATH, files) | Exit with error |
| 2 | Kill stale Java processes | Continue (may not exist) |
| 3 | Clean Docker (down -v) | Exit with error |
| 4 | Build backend (mvn clean package) | Exit with error + log |
| 5 | Build frontend (npm ci + npm run build) | Exit with error + log |
| 6 | Start Docker containers | Exit with error + log |
| 7 | Health check Docker services | Exit if timeout (30s) |
| 8 | Verify service connectivity | Exit if backend/frontend unreachable |
| 9 | Run integration tests | Continue (log failures, don't exit) |
| 10 | Capture logs to test-results/ | Continue (best-effort) |
| 11 | Cleanup Docker or leave running | Depends on -LeaveRunning flag |

---

## Understanding the Output

### Colored Status Messages
- 🟢 **Green (Success)**: Operation completed successfully
- 🔴 **Red (Error)**: Critical failure, script exits
- 🟡 **Yellow (Warning)**: Non-critical issue, script continues
- 🔵 **Cyan (Info)**: Status updates and logging

### Example Successful Run
```
[14:32:15] Phase 1: Pre-flight Checks
[14:32:15] ✓ docker installed
[14:32:15] ✓ docker-compose installed
[14:32:15] ✓ mvn installed
[14:32:15] ✓ npm installed
[14:32:15] ✓ git installed
[14:32:15] ✓ docker-compose.test.yml found
[14:32:15] ✓ Created log directory: ./test-results

[14:32:15] Phase 2: Cleanup Stale Java Processes
[14:32:15] ✓ No stale Java processes found

[14:32:15] Phase 3: Clean Docker Environment
[14:32:15] ✓ Docker environment cleaned

[14:32:15] Phase 4: Build Backend (Maven)
[14:32:15]   Running: mvn clean package -DskipTests
[14:32:45] ✓ Backend built successfully

[14:32:45] Phase 5: Build Frontend (Node.js)
[14:32:45]   Running: npm ci --legacy-peer-deps
[14:33:15]   Running: npm run build
[14:33:45] ✓ Frontend built successfully

[14:33:45] Phase 6: Start Docker Containers
[14:33:45]   Building fresh Docker images
[14:34:15] ✓ Docker containers started

[14:34:15] Phase 7: Verify Docker Health Checks
[14:34:25] ✓ All containers healthy

[14:34:25] Phase 8: Verify Service Connectivity
[14:34:30] ✓ Backend is healthy
[14:34:35] ✓ Frontend is accessible
[14:34:35] ✓ All services are healthy and responsive

[14:34:35] Phase 9: Run Integration Tests
[14:34:35]   Running Backend Integration Tests...
[14:35:45] ✓ Backend tests passed
[14:35:45]   Capturing JaCoCo coverage report...
[14:35:50] ✓ Coverage report saved to ./test-results/jacoco-backend

[14:35:50]   Running Frontend E2E Tests...
[14:38:15] ✓ Frontend E2E tests passed
[14:38:15] ✓ Playwright results saved to ./test-results/playwright-results

[14:38:15] Phase 10: Capture Docker Logs
[14:38:20] ✓ Backend logs saved to ./test-results/docker-backend-logs.txt
[14:38:20] ✓ Frontend logs saved to ./test-results/docker-frontend-logs.txt
[14:38:20] ✓ Database logs saved to ./test-results/docker-db-logs.txt

[14:38:20] Phase 11: Cleanup Docker Environment
[14:38:25] ✓ Docker environment cleaned

========== TEST PIPELINE COMPLETE ==========
[14:38:25] Total Duration: 385.2s
[14:38:25] Test Results: ./test-results
```

---

## Test Results Structure

After the script completes, `./test-results/` contains:

```
test-results/
├── backend-build.log              # Maven build output
├── backend-tests.log              # JUnit test results
├── frontend-build.log             # npm build output
├── frontend-e2e-tests.log         # Playwright test output
├── docker-backend-logs.txt        # Container logs (backend)
├── docker-frontend-logs.txt       # Container logs (frontend)
├── docker-db-logs.txt             # Container logs (database)
├── docker-start.log               # docker-compose up output
├── jacoco-backend/                # JaCoCo coverage report (open index.html)
└── playwright-results/            # Playwright screenshots + traces
    ├── test-results.json
    ├── test-results.xml
    ├── [test-name]/
    │   ├── test-failed-1.png      # Screenshot on failure
    │   ├── trace.zip              # Playwright trace (open with npx playwright show-trace)
    │   └── video.webm             # Video recording
```

---

## Troubleshooting

### "CRITICAL: docker not found in PATH"
Docker isn't installed or not in your PATH.
```powershell
# Verify Docker is installed
docker --version

# Add Docker to PATH if needed (Docker Desktop usually handles this)
```

### "ERROR: Backend build failed"
Check `./test-results/backend-build.log` for Maven errors.
```powershell
# Common cause: stale Java process
tasklist | findstr java
taskkill /F /PID <pid>

# Then re-run the script
.\scripts\build-and-test-docker.ps1
```

### "ERROR: Frontend build failed"
Check `./test-results/frontend-build.log`.
```powershell
# Common cause: corrupted node_modules
cd frontend
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json
cd ..

# Re-run the script
.\scripts\build-and-test-docker.ps1
```

### "TIMEOUT: Docker containers failed to become healthy"
Containers didn't start in time. Check logs:
```powershell
docker compose -f docker-compose.test.yml logs

# Possible causes:
# 1. Port 9090 or 9091 already in use
# 2. Docker daemon not running
# 3. Insufficient disk space
```

### "ERROR: Backend health check failed"
Backend container is running but not responding.
```powershell
# View detailed backend logs
docker logs freightclub-test-backend | tail -50

# Common causes:
# 1. Database not ready (check freightclub-test-db logs)
# 2. Spring Boot startup error (check logs)
# 3. Port binding issue
```

### Tests Fail But I Need to Debug
Use `-LeaveRunning` to keep Docker up:
```powershell
.\scripts\build-and-test-docker.ps1 -SkipTests -LeaveRunning

# Now you can:
# 1. Manually interact with services
# 2. Run tests manually: docker exec freightclub-test-backend mvn test
# 3. View logs: docker logs -f freightclub-test-backend
# 4. Access frontend: http://localhost:9090

# When done, stop Docker:
docker compose -f docker-compose.test.yml down -v
```

---

## Performance Tips

### Faster Iterative Testing
If you're only changing **test code** (not application code):
```powershell
# Skip rebuilding Java/npm (uses existing images)
.\scripts\build-and-test-docker.ps1 -SkipDockerBuild -LeaveRunning
```

### Faster Debugging
Skip tests and leave Docker running for manual interaction:
```powershell
.\scripts\build-and-test-docker.ps1 -SkipTests -LeaveRunning
```

### Parallel Test Runs
Each script run uses isolated Docker volumes. You can run multiple instances:
```powershell
# Terminal 1: Backend tests
.\scripts\build-and-test-docker.ps1 -TestType backend -LeaveRunning

# Terminal 2: Frontend tests (when Terminal 1 is running)
# Note: Need different ports! For now, run sequentially.
```

---

## Required Environment

### .env.test (Backend Test Profile)
Place in project root. Used by Spring test profile:

```env
DB_URL=jdbc:postgresql://test-db:5432/freightclub_test?currentSchema=freightclub
DB_USERNAME=freightclub_runtime
DB_PASSWORD=freightclub
APP_JWT_SECRET=test-secret-32-chars-minimum-required-here
DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000000
```

If this file is missing, the script will fail during backend test execution.

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - name: Run Integration Tests
        shell: pwsh
        run: .\scripts\build-and-test-docker.ps1 -TestType both
      - name: Upload Test Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## Manual Alternative (If Script Fails)

If the script encounters an issue, you can run phases manually:

```powershell
# Kill Java
tasklist | findstr java
taskkill /F /PID <pid>

# Clean Docker
docker compose -f docker-compose.test.yml down -v

# Build Backend
cd backend
mvn clean package -DskipTests
cd ..

# Build Frontend
cd frontend
npm ci --legacy-peer-deps
npm run build
cd ..

# Start Docker
docker compose -f docker-compose.test.yml up -d --build

# Wait for health
docker compose -f docker-compose.test.yml ps

# Test Backend
docker exec freightclub-test-backend mvn test

# Test Frontend
cd frontend
npm run test:e2e
cd ..

# Cleanup
docker compose -f docker-compose.test.yml down -v
```

---

## Support

For issues, check:
1. `./test-results/*.log` files (contains detailed output)
2. `docker logs <container-name>`
3. Run with `-LeaveRunning` to manually debug the running environment
4. Check CLAUDE.md for project-specific setup requirements
