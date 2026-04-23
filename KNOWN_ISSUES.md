# KNOWN_ISSUES.md

A living knowledge base of diagnosed bugs, environment issues, and their fixes.
Each entry was added after systematic investigation. `/debug` checks this file first before investigating.

---

## Entry Format

```
### [KI-NNN] Short symptom title
- **Symptom:** What the user/log shows
- **Root Cause:** Why it happens
- **Environment Conditions:** OS, branch, config, tool version, etc.
- **Fix Command / Steps:**
  ```
  ...
  ```
- **Date Added:** YYYY-MM-DD
```

---

## Entries

### [KI-001] Login / API calls fail; frontend shows 404 or network error
- **Symptom:** Login returns 404 or "network error"; no requests reach the backend
- **Root Cause:** Vite proxy target port is wrong (not 9090)
- **Environment Conditions:** Windows, Git Bash, Vite dev server on port 8080
- **Fix Command / Steps:**
  Check `frontend/vite.config.ts` — the proxy target must be `http://localhost:9090`.
  ```bash
  grep -n "target" frontend/vite.config.ts
  # Should show: target: 'http://localhost:9090'
  # If wrong port, edit vite.config.ts and restart the frontend
  ```
- **Date Added:** 2026-04-03

---

### [KI-002] Backend returns 401 on every request — mistaken for "server down"
- **Symptom:** `curl http://localhost:9090/actuator/health` returns 401; team assumes backend is not running
- **Root Cause:** Spring Security secures all endpoints including `/actuator/health`; 401 means the server IS running
- **Environment Conditions:** Any environment with Spring Security active (dev profile included)
- **Fix Command / Steps:**
  No fix needed — 401 is the expected healthy response. Only connection refused or timeout means the backend is down.
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/actuator/health
  # 401 = server is UP (Spring Security active)
  # 000 or "Connection refused" = server is DOWN
  ```
- **Date Added:** 2026-04-03

---

### [KI-003] `mvnw` fails on Windows Git Bash
- **Symptom:** `./mvnw: command not found` or `Permission denied` when running the Maven wrapper
- **Root Cause:** Maven wrapper script is not executable or uses Windows line endings; Git Bash cannot execute it reliably
- **Environment Conditions:** Windows 11, Git Bash
- **Fix Command / Steps:**
  Use system Maven directly instead of the wrapper:
  ```bash
  /c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -q -f backend/pom.xml
  ```
- **Date Added:** 2026-04-03

---

### [KI-004] `taskkill /F /PID` treated as path in Git Bash
- **Symptom:** `taskkill /F /PID 1234` returns an error or is misinterpreted as a file path
- **Root Cause:** Git Bash converts leading `/` to a POSIX path prefix
- **Environment Conditions:** Windows 11, Git Bash (not PowerShell or CMD)
- **Fix Command / Steps:**
  Use double-slash for all Windows-style flags in Git Bash:
  ```bash
  taskkill //F //PID 1234
  # Or to kill by image name:
  taskkill //F //IM java.exe
  ```
- **Date Added:** 2026-04-03

---

### [KI-005] Cannot kill backend process — JAR file locked
- **Symptom:** `taskkill` returns "Access Denied" or fails; port 9090 stays occupied
- **Root Cause:** On Windows, the running JAR file is locked by the JVM; bash-level kill is insufficient
- **Environment Conditions:** Windows 11, Git Bash
- **Fix Command / Steps:**
  Kill `java.exe` from Windows Task Manager, or use PowerShell:
  ```powershell
  powershell.exe -Command "Get-Process java | Stop-Process -Force"
  ```
- **Date Added:** 2026-04-03

---

### [KI-006] Blank / black screen on frontend after backend restart
- **Symptom:** React app shows blank or black screen after the backend is restarted
- **Root Cause:** Frontend is running but backend is not yet up; React Query requests fail silently and leave the app in an empty state
- **Environment Conditions:** Any; most common after a backend restart during active dev session
- **Fix Command / Steps:**
  1. Verify backend is up: `curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/actuator/health` (expect 401)
  2. If backend is down, start it: run `/start` skill
  3. Hard-refresh the browser (Ctrl+Shift+R) to clear stale React Query cache
- **Date Added:** 2026-04-03

---

### [KI-007] Flyway migration checksum mismatch on startup
- **Symptom:** Spring Boot fails to start with `FlywayException: Validate failed: Migration checksum mismatch for migration version ...`
- **Root Cause:** A committed migration file was edited after it had already been applied to the database
- **Environment Conditions:** Dev environment; occurs when a developer modifies a migration that is already in the `flyway_schema_history` table
- **Fix Command / Steps:**
  **Never modify committed migrations.** To fix the immediate error:
  ```sql
  -- Connect to dev DB and remove the bad history row so Flyway re-applies:
  DELETE FROM flyway_schema_history WHERE version = '<version>';
  ```
  Then restore the migration file to its original content (use `git checkout`) and create a new migration for any intended changes.
- **Date Added:** 2026-04-03

---

### [KI-008] CORS errors in browser — requests blocked before reaching backend
- **Symptom:** Browser console shows CORS error on API calls; backend logs show no request received
- **Root Cause:** Vite proxy is misconfigured — the request never reaches the backend so it is not a backend CORS policy issue
- **Environment Conditions:** Dev environment, browser talking to Vite dev server
- **Fix Command / Steps:**
  Check proxy config first (see KI-001). CORS errors in dev are almost always a proxy misconfiguration, not a backend `@CrossOrigin` issue.
  ```bash
  grep -n "proxy\|target" frontend/vite.config.ts
  ```
- **Date Added:** 2026-04-03

---

### [KI-009] External host (Tailscale, LAN) blocked by Vite
- **Symptom:** Vite shows `403 Forbidden` or "Invalid host header" when accessed via Tailscale IP or hostname
- **Root Cause:** Vite's `allowedHosts` does not include the external hostname
- **Environment Conditions:** Dev environment, external access via Tailscale or LAN
- **Fix Command / Steps:**
  Add the hostname to `allowedHosts` in `frontend/vite.config.ts`:
  ```ts
  server: {
    allowedHosts: ['your-tailscale-hostname.ts.net'],
    ...
  }
  ```
  Then restart the frontend.
- **Date Added:** 2026-04-03

---

### [KI-010] Weight > 80,000 lb load rejected without clear error
- **Symptom:** Creating or updating a load with weight over 80,000 lb fails; response may be a generic 400
- **Root Cause:** Business rule requires `overweightAcknowledged=true` in the request payload for loads exceeding 80,000 lb
- **Environment Conditions:** Any; enforced in `LoadService`
- **Fix Command / Steps:**
  Add `"overweightAcknowledged": true` to the create/update load request body when weight > 80,000 lb.
  On the frontend, ensure the overweight acknowledgment checkbox is rendered and submitted when the weight field exceeds 80000.
- **Date Added:** 2026-04-03
