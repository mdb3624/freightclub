# Phase 3 Execution Guide: E2E Test Run (US-900)

**Objective:** Execute refactored login integration tests against live backend + frontend  
**Duration:** ~5 minutes  
**Success Criteria:** All 7 tests pass ✅

---

## Prerequisites Checklist

- [ ] Backend can compile: `mvn clean compile` passes
- [ ] Frontend can build: `npm run build` produces dist/
- [ ] No Java processes locking port 9090
- [ ] Playwright dependencies installed: `npm ci` in frontend/

**Verification (optional):**
```bash
# Check if port 9090 is free
lsof -i :9090  # Linux/Mac
netstat -ano | findstr :9090  # Windows
# Should return: (empty or no Java process)

# Check Maven works
C:\tools\apache-maven-3.9.9\bin\mvn.cmd --version
# Should show: Apache Maven 3.9.9

# Check Node.js works
npm --version
node --version
# Should show: npm 10.x+, node 18.x+
```

---

## 3-Terminal Setup

Open **3 separate terminal windows/tabs** in your IDE or shell. Labels below indicate which terminal to use.

---

### Terminal 1: Backend (Spring Boot)

```bash
# Navigate to backend directory
cd backend

# Start Spring Boot on port 9090
# Option A: Direct Maven command
C:\tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run -DskipTests

# Option B: If Maven wrapper is available
mvn spring-boot:run -DskipTests

# Option C: If previously built (faster, uses existing JAR)
java -jar target/freightclub-backend-0.0.1-SNAPSHOT.jar
```

**Expected Output (after ~30 seconds):**
```
2026-05-31 14:05:23.456 INFO ... Started Application in X.XXX seconds (JVM running for X.XXX)
...
Tomcat started on port(s): 9090 (http) with context path ''
```

**Verify Backend is Ready:**
```bash
# In a separate shell (don't interrupt Terminal 1):
curl http://localhost:9090/actuator/health

# Expected response:
# {"status":"UP","components":{...}}
```

**Troubleshooting:**
- **Port 9090 already in use:** Kill existing Java process:
  ```bash
  # Windows
  taskkill /F /PID <pid>
  
  # Linux/Mac
  kill -9 <pid>
  ```
- **Maven build fails:** Run `mvn clean compile` in backend/ first, then retry `mvn spring-boot:run`
- **Tests timeout waiting for backend:** Wait additional 30 seconds, then check logs for startup errors

---

### Terminal 2: Frontend Dev Server (Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm ci

# Start Vite dev server
npm run dev
```

**Expected Output (after ~10 seconds):**
```
  VITE v5.0.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Verify Frontend is Ready:**
```bash
# In a separate shell (don't interrupt Terminal 2):
curl http://localhost:5173/

# Expected response:
# (HTML content of index.html)
```

**Troubleshooting:**
- **Port 5173 already in use:** Vite will auto-increment (5174, 5175, etc.)
  - If incremented, update Vite proxy config to match:
    - Edit `frontend/vite.config.ts`
    - Change `target: 'http://localhost:9090'` (backend port must still be 9090)
- **Module not found errors:** Run `npm ci` to reinstall exact dependencies
- **Build fails:** Check for TypeScript errors: `npm run build`

---

### Terminal 3: Run E2E Tests (Playwright)

```bash
# Navigate to frontend directory
cd frontend

# Run ONLY the login integration tests (refactored version)
npm run test:e2e -- login-integration.spec.ts

# Alternative: Run full E2E suite (slower, ~30s)
npm run test:e2e

# Alternative: Run with UI mode (interactive, shows browser)
npm run test:e2e -- --ui
```

**Expected Output:**
```
 ✓ login-integration.spec.ts (7 passed in 5s)

 ✓ 7 passed (5.2s)
```

**Success Indicators:**
- ✅ All 7 tests pass
- ✅ Execution time < 10 seconds
- ✅ No trace files created (traces only on failure)

---

## Test Details: What Each Test Validates

| Test | Acceptance Criteria | Expected |
|------|-------------------|----------|
| Form renders in <100ms | AC-1: Component has data-testid | ✅ 100ms |
| Email input has testid | AC-1: All fields tagged | ✅ Found |
| Password input has testid | AC-1: All fields tagged | ✅ Found |
| Submit button has testid | AC-1: Button identified | ✅ Found |
| Register user + redirect | AC-2: Backend endpoint works | ✅ 200 OK |
| Login success → dashboard | AC-4: Web-first assertion passes | ✅ Dashboard visible |
| Error banner on bad password | AC-4: Error element found via testid | ✅ Error visible |

---

## If Tests Fail: Debugging Steps

### Step 1: Check Logs

**Backend Logs (Terminal 1):**
- Look for `ERROR` or `Exception` in output
- Check database connectivity: `Caused by: java.sql.SQLException`
- Check auth service errors: `Unable to find a signing key`

**Frontend Logs (Terminal 2):**
- Look for `[error]` in output
- Check Vite proxy errors: `Cannot proxy to http://localhost:9090`
- Check port conflicts: `Port 5173 is already in use`

### Step 2: Verify Connectivity

```bash
# Backend health
curl -v http://localhost:9090/actuator/health
# Expected: 200 OK + {"status":"UP"}

# Frontend dev server
curl -v http://localhost:5173/
# Expected: 200 OK + HTML content

# Backend → Frontend proxy (from Frontend)
curl -v http://localhost:5173/api/v1/actuator/health
# Expected: 200 OK (proxied to backend)
```

### Step 3: Review Trace Files

Trace files are generated **only on test failure** in `frontend/test-results/`:

```bash
# List trace files
ls -la frontend/test-results/trace-*.zip

# Inspect trace with Playwright Inspector
npx playwright show-trace frontend/test-results/trace-*.zip
```

**What Traces Contain:**
- Network requests/responses (login API calls)
- DOM snapshots (element state at each step)
- Console logs (JavaScript errors)
- Screenshots (visual state at failure)
- Video (optional, if enabled)

**Common Trace Findings:**
- **401 Unauthorized:** Backend auth token validation failing → check JWT secret in env
- **404 Not Found:** API endpoint not found → verify backend started correctly
- **CORS error:** Frontend origin not allowed → check backend CORS config
- **Element not found:** Selector wrong or page not loaded → check `data-testid` spelling

### Step 4: Consult Debugging Guide

Full debugging guide: `frontend/e2e/DEBUGGING_GUIDE.md`

10+ failure patterns documented with step-by-step resolution.

---

## Quick Reference: Commands by Scenario

### Scenario A: Fresh Run (Nothing Started)
```bash
# Terminal 1
cd backend && mvn spring-boot:run -DskipTests

# Terminal 2 (wait 30 seconds for backend startup)
cd frontend && npm run dev

# Terminal 3 (wait 10 seconds for frontend startup)
cd frontend && npm run test:e2e -- login-integration.spec.ts
```

### Scenario B: Backend Already Running
```bash
# Terminal 2
cd frontend && npm run dev

# Terminal 3
cd frontend && npm run test:e2e -- login-integration.spec.ts
```

### Scenario C: Run Full E2E Suite (All Tests)
```bash
# After Terminals 1 & 2 are ready:
cd frontend && npm run test:e2e
```

### Scenario D: Debug a Single Failing Test
```bash
# Run with UI mode (shows browser)
cd frontend && npm run test:e2e -- login-integration.spec.ts --debug

# Or run a single test by name
cd frontend && npm run test:e2e -- login-integration.spec.ts -g "Form renders"
```

### Scenario E: Kill Stale Processes (if needed)
```bash
# Windows: Kill Java process on 9090
taskkill /F /IM java.exe
# Or specific PID:
taskkill /F /PID <pid>

# Linux/Mac: Kill Node process on 5173
kill -9 $(lsof -ti:5173)
```

---

## Success Confirmation

After Phase 3 completes successfully, you should see:

1. **Terminal 1 (Backend):** "Started Application in X.XXX seconds"
2. **Terminal 2 (Frontend):** "Local: http://localhost:5173/"
3. **Terminal 3 (Tests):** "✓ 7 passed (5.2s)"

Then proceed to:
```bash
# Terminal 3: Verify Phase 4 (original test replacement is live)
cd frontend && npm test  # Runs unit tests (should still pass)

# Or run E2E suite to confirm full integration
cd frontend && npm run test:e2e
# Expected: 7/7 login tests pass (originally from refactored file, now in login-integration.spec.ts)
```

---

## Cleanup (After Phase 3)

**Optional: Remove backup files** (only after confirming Phase 3 success):

```bash
cd frontend/e2e

# Remove original backup (already replaced)
rm login-integration-old.spec.ts

# Remove refactored source file (now active as login-integration.spec.ts)
rm login-integration-refactored.spec.ts

# Verify
ls -la login-integration*.spec.ts
# Should show only: login-integration.spec.ts
```

---

## Next Steps After Success

Once Phase 3 tests pass:

1. ✅ **Phase 4 Already Complete:** Original test file replaced (auto-done)
2. ⏳ **Phase 5:** Pattern Rollout — Apply refactored pattern to other E2E tests
3. ⏳ **Phase 6:** CI/CD Integration — Update GitHub Actions workflow

See `Phase_Completion_US900.md` for full roadmap.

---

## Support

**Debugging:** See `frontend/e2e/DEBUGGING_GUIDE.md` (10+ patterns with solutions)  
**Fixtures API:** See `frontend/e2e/fixtures/README.md` (test data seeder docs)  
**Architecture:** See `docs/design/E2E_TESTING_ARCHITECTURE.md` (design decisions)  

---

**Status:** Ready for Phase 3 Execution  
**Last Updated:** 2026-05-31

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
