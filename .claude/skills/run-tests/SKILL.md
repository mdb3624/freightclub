# Run Tests

Run the full FreightClub test suite — backend (JUnit 5 + JaCoCo) and frontend (Vitest) — and report results.

## Steps

### 1. Kill any stale Java processes holding the backend JAR

```bash
PID=$(lsof -ti :9090) && [ -n "$PID" ] && kill -9 $PID || true
```

### 2. Run backend tests

```bash
/c/tools/apache-maven-3.9.9/bin/mvn test -f /c/projects/freightclub/backend/pom.xml
```

Capture exit code. If the build fails, extract the first `[ERROR]` lines from the output and report them — do not stop; continue to frontend tests.

### 3. Run frontend tests

```bash
cd /c/projects/freightclub/frontend && npm run test
```

Capture exit code and the final summary line (e.g. `✓ 17 tests passed`).

### 4. Report results

Print a concise summary:

```
Backend tests:   PASS  (109 passed, 0 failed)
Frontend tests:  PASS  (17 passed, 0 failed)
```

If either suite fails, list the failing test names and the first error message for each. Do not show full stack traces unless the user asks.

### 5. If backend tests fail — diagnose before suggesting fixes

- Check if the failure is a compilation error (missing class, API change) vs. a test assertion failure.
- If it is an assertion failure, read the relevant test file and source file to understand the gap.
- Do NOT automatically rewrite tests to make them pass — report the failure and wait for user instruction unless the fix is obviously a stale mock or import.

## Notes

- This skill runs tests only. To enforce coverage gates or write new tests, use `/test-coverage` instead.
- Maven binary: `/c/tools/apache-maven-3.9.9/bin/mvn`
- Backend pom: `/c/projects/freightclub/backend/pom.xml`
- Frontend: `cd /c/projects/freightclub/frontend && npm run test`
