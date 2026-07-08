# US-849 Sign-Off: Access Token Refresh Interceptor

**Date:** 2026-07-08
**Reviewed By:** LIBRARIAN
**Status:** ✅ DONE
**Linked Story:** Critical Security & Infrastructure (Cross)

---

## Verification Checklist

- ✅ **Design Complete**: story doc `docs/business/stories/US-849_Token_Refresh_Interceptor.md` with 4 gherkin ACs
- ✅ **Code Review PASSED**: REVIEWER approved (see `.claude/learnings.md` — no debt items for this story)
- ✅ **Tests Passing**: 8/8 unit tests (`apiClient.test.ts` 5, `authStore.test.ts` 3), full frontend suite 258/258, full e2e suite 100 passed
- ✅ **CI Verified (not just local)**: `gh pr checks 25` — Backend, Frontend Lint/Test/Build, E2E all `pass` (confirmed after fixing a real CI-only lint failure local Docker runs never caught)
- ✅ **AC Implementation**:
  - AC-1: refresh-and-retry on 401, single retry per request
  - AC-2: refresh failure clears auth state + redirects to `/login`
  - AC-3: concurrent 401s dedupe into one `POST /auth/refresh` call
  - AC-4: non-401 errors and the auth endpoints themselves are unaffected
- ✅ **Live Docker repro**: corrupted access token mid-session (simulating real 15-min expiry), confirmed Create Load form silently recovers via `POST /auth/refresh` (200) → retried `POST /api/v1/loads` (201) → success modal, no error banner

---

## AC Verification

| AC | Requirement | Implementation | Evidence |
|-----|----------|------|----------|
| AC-1 | Auto refresh-and-retry on 401 | `apiClient.ts` response interceptor + `refreshAccessToken()` | `apiClient.test.ts` AC-1 |
| AC-2 | Refresh failure → clear auth + redirect | `useAuthStore.getState().logout()` + `window.location.href = '/login'` | `apiClient.test.ts` AC-2 |
| AC-3 | Concurrent 401s dedupe | Module-level `refreshPromise` shared across callers | `apiClient.test.ts` AC-3 |
| AC-4 | Auth endpoints / non-401 unaffected | `NO_REFRESH_PATHS` guard + status check | `apiClient.test.ts` AC-4 (×2) |

---

## Code Artifacts

- **Frontend**: `frontend/src/lib/apiClient.ts`
- **Frontend**: `frontend/src/store/authStore.ts` (new `setAccessToken` action)
- **Frontend Test**: `frontend/src/lib/apiClient.test.ts`
- **Test infra fix** (bonus, unblocked 2 pre-existing failures): `frontend/src/test/setup.ts` — jsdom's `window.localStorage` was undefined in this project's vitest config; added a minimal in-memory `Storage` polyfill

---

## Root Cause Summary

Reported as "shipper unable to create a load" / generic "An error occurred" banner. Root cause: access tokens expire after 900s; the refresh endpoint (`POST /auth/refresh`) existed on both frontend and backend but was never wired into the axios interceptor (`// refresh logic disabled for now`). Any session exceeding 15 minutes hit a bare Spring Security 401 (no `message` field, bypasses `GlobalExceptionHandler`) that rendered as the unhelpful generic fallback. Not load-specific — an app-wide gap that happened to surface first on the long, multi-section Create Load form.

---

## Dependencies Resolved

- None — isolated to the shared `apiClient`/`authStore` layer, no other story blocked on or blocking this one.

---

## Traceability

- **Story Map**: Critical Security & Infrastructure section, `US-849` row, status DONE
- **Test Coverage**: unit + e2e evidence captured above
- **No Flyway migrations required** (frontend-only story)

---

## Sign-Off

**LIBRARIAN verdict**: ✅ **APPROVED FOR MERGE**

All verification gates passed, including actual GitHub Actions CI status (not local evidence alone, per the mandatory CI-status gate added after CHG-US730-003).

**Next Steps:**
- Merge PR #25 to main
- Monitor for any 401-loop regressions in production (refresh cookie edge cases not exercisable in the test environment)
