# Debug

Diagnose a reported error or symptom in the FreightClub stack. Check known issues first; investigate systematically if not matched; append new findings to KNOWN_ISSUES.md.

## Input

The user provides a symptom, error message, log snippet, or describes unexpected behavior. If no input is given, ask: "What symptom or error are you seeing?"

## Step 1 — Check KNOWN_ISSUES.md

Read `KNOWN_ISSUES.md` in the project root. Scan every entry and compare its **Symptom** and **Environment Conditions** against what the user reported.

**Match criteria (any of):**
- The error message substring matches the symptom description
- The behavior described matches (e.g. "blank screen", "401", "CORS", "locked JAR")
- The environment conditions align (Windows, Git Bash, dev profile, etc.)

**If a match is found:**
1. Tell the user: "This matches known issue **[KI-NNN]**."
2. Show the Root Cause in one sentence.
3. Run the Fix Command(s) immediately (or show them with an explanation if they require user action like Task Manager).
4. Confirm the fix resolved the issue. **Stop here — do not proceed to Step 2.**

---

## Step 2 — Systematic Investigation (no match found)

Work through these layers in order. Stop at the first layer that reveals the root cause.

### Layer 1 — Environment / Process Health
```bash
# Are the servers running?
curl -s -o /dev/null -w "backend:%{http_code}\n" http://localhost:9090/actuator/health
curl -s -o /dev/null -w "frontend:%{http_code}\n" http://localhost:8080

# What's on the ports?
netstat -ano | findstr ":8080\|:9090"
```
- Backend: 401 = running (Spring Security active). 000/refused = down.
- Frontend: 200 = running. 000/refused = down.

### Layer 2 — Proxy Configuration
```bash
grep -n "target\|proxy\|allowedHosts" frontend/vite.config.ts
```
- Proxy target must be `http://localhost:9090`
- Check `allowedHosts` if accessing from an external hostname

### Layer 3 — Recent Changes
```bash
git log --oneline -10
git diff HEAD~1 --name-only
```
- Did a recent commit touch migrations, auth, config, or pom.xml?

### Layer 4 — Backend Logs
If the backend is running, check its most recent output for stack traces or startup errors. Ask the user to paste any console output from the Spring Boot process, or check terminal where it was started.

Look for:
- `FlywayException` → migration issue (see KI-007)
- `BeanCreationException` / `NoSuchBeanDefinitionException` → missing Spring bean
- `JwtException` → token validation failure
- `DataIntegrityViolationException` → schema/data mismatch

### Layer 5 — Frontend Console / Network Tab
Ask the user to open DevTools → Console and Network tab, reproduce the issue, and paste:
- Any red console errors
- The failing request URL, method, status code, and response body

### Layer 6 — Database / Migration State
```bash
# Check applied migrations (connect to dev DB):
# SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 20;
```
- All rows should have `success = 1`
- A failed migration with `success = 0` will block startup

### Layer 7 — Build Artifacts
```bash
ls -lh backend/target/freightclub-backend-0.0.1-SNAPSHOT.jar
```
- If JAR is missing or older than source changes, rebuild:
  ```bash
  /c/tools/apache-maven-3.9.9/bin/mvn package -Dmaven.test.skip=true -q -f backend/pom.xml
  ```

---

## Step 3 — Summarize and Append to KNOWN_ISSUES.md

Once the root cause is confirmed, append a new entry to `KNOWN_ISSUES.md` using this exact format. Determine the next KI number by reading the existing entries.

```markdown
### [KI-NNN] Short symptom title
- **Symptom:** <what the user saw>
- **Root Cause:** <why it happened>
- **Environment Conditions:** <OS, branch, config, versions, etc.>
- **Fix Command / Steps:**
  ```bash
  <exact commands used to fix>
  ```
- **Date Added:** <today's date YYYY-MM-DD>
```

After appending, tell the user:
> "Added as **[KI-NNN]** to KNOWN_ISSUES.md so this can be auto-resolved next time."

---

## Rules

- **Always check KNOWN_ISSUES.md first** — do not start investigating if a match exists.
- **Never skip layers** — work top-down; do not jump to Layer 5 before confirming Layer 1.
- **401 is not an error** — it means the backend is running and Spring Security is active.
- **Proxy first** — before investigating auth, CORS, or DB issues, always verify the Vite proxy target.
- **Use double-slash flags in Git Bash** — `taskkill //F //PID`, not `taskkill /F /PID`.
- **Do not modify committed migrations** — always create a new migration file for schema fixes.
- **Append, never overwrite** — new KNOWN_ISSUES.md entries are appended; existing entries are never edited unless correcting a factual error.
