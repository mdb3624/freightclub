# E2E Test Debugging Guide

**When a Playwright test fails, use this workflow to identify the root cause quickly.**

---

## 1. Locate the Trace File

When a test fails, Playwright automatically generates a `.zip` trace file containing:
- **Network requests/responses** (all API calls with status codes and payloads)
- **DOM snapshots** (page state at each interaction)
- **Console logs** (client-side errors, warnings)
- **Screenshots** (visual state at failure point)
- **Video** (full browser session recording)

### Finding the Trace

**Local runs:**
```bash
# Trace files are saved to:
frontend/test-results/trace-{test-name}-{timestamp}.zip

# Example:
frontend/test-results/trace-should-display-error-message-on-failed-login-1234567890.zip
```

**CI runs (GitHub Actions):**
```
1. Go to the failed workflow run
2. Click "Artifacts" tab
3. Download "test-results" artifact
4. Unzip to find trace-*.zip files
```

---

## 2. Open the Trace in Playwright Inspector

The trace viewer is **built into Playwright** — no setup needed.

### Option A: Command Line (Recommended)

```bash
# Navigate to frontend directory
cd frontend

# Open trace in inspector
npx playwright show-trace test-results/trace-{test-name}-{timestamp}.zip
```

This opens a browser window with interactive timeline and DOM snapshots.

### Option B: Web-Based Viewer

If the CLI viewer doesn't work, use the online viewer:
```
https://trace.playwright.dev/

Then: File → Open trace → select trace-*.zip
```

---

## 3. Analyze the Trace Timeline

The trace viewer shows a **timeline of all events**:

```
Screenshot        ✓ Page navigated to /login
  ↓
Network Request   → POST /api/v1/auth/login (PENDING...)
  ↓
⏳ 5000ms timeout
  ↓
ERROR             ✗ Assertion failed: element not visible
```

### Key Sections to Check

**1. Network Tab**
```
Filter: /api/v1/auth/login
Status: 404? 500? 401?
Response: What does backend return?
Time: How long did request take?
```

**2. Console Logs**
```
Look for:
- [Error] Uncaught SyntaxError: Unexpected token
- [Warn] Failed to fetch
- [Debug] Custom app logs
```

**3. DOM Snapshot at Failure**
```
Expand the DOM tree at the failure moment.
Can you see the element you were waiting for?
Is it hidden (display: none)?
Is it outside the viewport?
```

**4. Screenshot**
```
Visual inspection of what the page actually showed.
Compare to what test expected.
```

---

## 4. Common Failure Patterns & Fixes

### Pattern 1: "Element not found" / "Timeout waiting for locator"

**Symptom:**
```
Timeout 5000ms waiting for locator('[data-testid="login-error-message"]')
```

**Investigation:**
1. Open trace → DOM Snapshot at failure moment
2. Search for "login-error-message" in the DOM
3. Is the element present but hidden?
4. Is the element present with different attribute?

**Common Causes & Fixes:**

| Cause | Evidence in Trace | Fix |
|-------|-------------------|-----|
| Wrong data-testid | Element visible but different testid="login_error" | Update selector to match actual attribute |
| Element not yet rendered | Element missing from DOM snapshot | Increase timeout in test or add explicit wait |
| Element hidden by CSS | Element in DOM but `display: none` | Change test logic or check CSS condition |
| Backend never responded | Network tab shows request PENDING at timeout | Check backend logs (see Section 5) |

---

### Pattern 2: "Backend returned 404 / 500"

**Symptom:**
```
Trace Network tab shows:
POST /api/v1/auth/login → 404 Not Found
Response body: {"error": "endpoint not found"}
```

**Investigation:**
1. Network tab → click the failed request
2. Check "Request URL" — is the path correct?
3. Check "Response" — what error message?
4. Check "Request Headers" — is Content-Type correct?

**Common Causes & Fixes:**

| Cause | Evidence | Fix |
|-------|----------|-----|
| Wrong API version in proxy | URL shows `/api/v2/auth/login` but endpoint is `/api/v1` | Check `frontend/vite.config.ts` proxy config |
| Backend not running | Response headers empty, instant timeout | Verify backend health: `curl http://localhost:9091/actuator/health` |
| CORS rejection | Network response has CORS error, body is empty | Check backend `@CrossOrigin` annotation; verify frontend URL is in allowed origins |
| Request payload malformed | Network tab shows `data: null` or `body: {}` | Check test sends correct `data: { ... }` in request |

---

### Pattern 3: "Race Condition" / "Flaky on CI but not local"

**Symptom:**
```
Local: Test passes 10/10 times
CI: Test passes 6/10 times (fails randomly)
```

**Investigation:**
1. Collect multiple trace files from CI failures
2. Compare them: Do they fail at same point or different points?
3. Check global setup logs: Did backend health check pass?

**Common Causes & Fixes:**

| Cause | Evidence | Fix |
|-------|----------|-----|
| Shared test DB state | Multiple tests pollute DB; read/write conflicts | Add cleanup step in `test.afterEach()` (see Test Fixture Pattern) |
| Slow backend in CI | Network tab shows 5000ms+ response time | Increase assertion timeout; add explicit waits for backend responses |
| Parallel test execution | Multiple tests run simultaneously, interfere | Ensure `playwright.config.ts` has `workers: 1` for auth tests |
| Auth state not persisted | Trace shows 401 on second request | Verify `auth.json` is saved correctly in global setup |

---

## 5. Correlate Frontend & Backend Logs

When the trace shows a network error, **you must check backend logs to understand why.**

### Finding Backend Logs

**Local Docker:**
```bash
# If backend runs in Docker
docker logs <container-id>

# Or: docker ps to find container ID first
docker ps | grep spring
```

**Local Java (direct run):**
```bash
# Logs printed to console where you ran `mvn spring-boot:run`
# Scroll up to find the request timestamp
```

**Cloud Run (production):**
```bash
gcloud logging read "resource.type=cloud_run_revision AND 
                     resource.labels.service_name=freightclub-backend" \
  --limit 50 \
  --format json
```

### Matching Frontend Request to Backend Log

**Frontend trace shows:**
```
POST /api/v1/auth/login
Request: {"email":"test@example.com","password":"..."}
Response: 401
Time: 2024-01-15 10:23:45.678
```

**Find backend log at same timestamp:**
```bash
grep "2024-01-15 10:23:45" backend.log

# Expected output:
# [2024-01-15 10:23:45.123] INFO  [...] POST /api/v1/auth/login from 127.0.0.1
# [2024-01-15 10:23:45.456] DEBUG [...] Attempting authentication for email=test@example.com
# [2024-01-15 10:23:45.567] WARN  [...] Authentication failed: invalid credentials
# [2024-01-15 10:23:45.678] INFO  [...] Sending 401 Unauthorized response
```

---

## 6. Extract & Share Trace Files for Analysis

If you need help debugging, export the trace for sharing:

### Step 1: Locate the trace file
```bash
ls -lh frontend/test-results/trace-*.zip
```

### Step 2: Export network requests (human-readable)
```bash
# Unzip and inspect
unzip frontend/test-results/trace-*.zip -d /tmp/trace-export
cat /tmp/trace-export/network.jsonl | jq '.[] | {url, status, duration}' | head -20
```

### Step 3: Copy trace file to share
```bash
# Create shareable artifact
cp frontend/test-results/trace-*.zip ~/Desktop/trace-for-debug.zip

# Share with developer along with:
# 1. Test name (e.g., "should display error message on failed login")
# 2. When it failed (local vs CI)
# 3. Backend health check output from global setup logs
# 4. Any error messages from console
```

---

## 7. Quick Debugging Checklist

When a test fails:

- [ ] **Trace file generated?** Check `test-results/trace-*.zip` exists
- [ ] **Open in inspector**: `npx playwright show-trace test-results/trace-*.zip`
- [ ] **Network tab**: Is the expected API call present? What status code?
- [ ] **DOM snapshot**: Is the element present? Is it hidden?
- [ ] **Console logs**: Any JavaScript errors?
- [ ] **Screenshot**: Does it match what you expected?
- [ ] **Backend logs**: Check server-side error at same timestamp
- [ ] **Global setup logs**: Did backend health check pass?
- [ ] **Reproducible?** Does it fail consistently or only on CI?
- [ ] **Environment difference?** Check ports, URLs, environment variables

---

## 8. Debugging Example: Step-by-Step

**Scenario:** Test "should display error message on failed login" fails in CI.

### Step 1: Find the trace
```bash
# From CI artifacts
test-results/trace-should-display-error-message-on-failed-login-1705307025.zip
```

### Step 2: Open in inspector
```bash
npx playwright show-trace test-results/trace-should-display-error-message-on-failed-login-1705307025.zip
```

### Step 3: Inspect the timeline
```
✓ Navigate to /login
✓ Fill email input
✓ Fill password input
✓ Click submit button
⏳ [5000ms] Wait for response with status 401
⏳ [TIMEOUT] Assertion failed: locator not visible
```

### Step 4: Check Network tab
```
POST /api/v1/auth/login
Status: 500 (not 401!)
Response: {"error": "NullPointerException in UserService"}
```

### Step 5: Check backend logs (CI)
```bash
gcloud logging read "timeRange=['2024-01-15T10:23:45Z', '2024-01-15T10:23:50Z']"

[2024-01-15 10:23:45.789] ERROR [...] NullPointerException at UserService.findByEmail()
  at line 42: User user = userRepository.findByEmail(null);
```

### Step 6: Root cause identified
**Problem:** Email parameter is `null` when reaching backend.

### Step 7: Check frontend request payload
```
Trace → Network → POST /api/v1/auth/login
Request body: {"email": null, "password": "..."}
```

### Step 8: Fix
**Root Cause:** Email input validation is broken. Check:
```typescript
// frontend/src/pages/LoginPage.tsx
const email = emailInput.value; // Maybe emailInput is wrong selector?
```

---

## 9. Common Data-testid Mismatches

If tests fail with "element not found", check your components have correct data-testid:

**Test expects:**
```typescript
page.locator('[data-testid="email-input"]')
```

**Component must have:**
```jsx
<input data-testid="email-input" type="email" />
```

**Common mistakes:**
```jsx
<input data-testid="email" />           // ❌ Wrong: test expects "email-input"
<input data-test-id="email-input" />    // ❌ Wrong: attribute name is "data-test-id" not "data-testid"
<input id="email-input" />              // ❌ Wrong: using id instead of data-testid
```

---

## 10. When to Escalate

Share the trace file and these details if you're still stuck:

1. **Test name:** "should display error message on failed login"
2. **Failure point:** Trace screenshot at failure moment
3. **Network error:** POST /api/v1/auth/login → 500 NullPointerException
4. **Backend logs:** Full error stack from Spring Boot logs
5. **Environment:** Local vs CI, backend version, database state
6. **Reproducibility:** Every run? Intermittent? Only on CI?

---

**Happy debugging! 🐛**
