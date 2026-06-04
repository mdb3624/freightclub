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

## E2E Integration Tests (Playwright)

The E2E suite runs against the Docker test environment on `localhost:9090/9091`.

### Fast iteration — NO rebuild needed for source changes

The Docker test frontend uses a **volume mount** (`./frontend:/app`) so Vite HMR picks up `.tsx`/`.ts` changes instantly. Only rebuild when `package.json` or `Dockerfile.dev` changes.

```bash
# Start once per session (or after docker compose down -v):
docker compose -f c:/projects/freightclub/docker-compose.test.yml up -d

# Run all 55 E2E tests in ~45s (3 parallel workers):
cd c:/projects/freightclub/frontend && npx playwright test

# Force serial when debugging a flaky test:
cd c:/projects/freightclub/frontend && PLAYWRIGHT_WORKERS=1 npx playwright test e2e/some.spec.ts

# Full reset (clears accumulated test users in DB):
docker compose -f c:/projects/freightclub/docker-compose.test.yml down -v
docker compose -f c:/projects/freightclub/docker-compose.test.yml up -d
```

### When to rebuild the image

Only rebuild (`docker compose up -d --build`) when:
- `package.json` changed (new npm deps)
- `Dockerfile.dev` changed
- First-time setup on a new machine

**Never rebuild just because a `.tsx` or spec file changed** — the volume mount serves live files.

### DB grants after a full reset

After `down -v && up -d`, the DB is fresh but Flyway runs `V20260603_1000__Grant_Runtime_Permissions.sql` automatically — no manual SQL needed.

## Notes

- This skill runs tests only. To enforce coverage gates or write new tests, use `/test-coverage` instead.
- Maven binary: `/c/tools/apache-maven-3.9.9/bin/mvn`
- Backend pom: `/c/projects/freightclub/backend/pom.xml`
- Frontend unit tests: `cd /c/projects/freightclub/frontend && npm run test`
