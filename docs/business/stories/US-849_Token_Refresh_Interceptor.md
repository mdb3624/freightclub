# US-849: Access Token Refresh Interceptor

**Story ID:** US-849
**Phase:** Bug Fix (found during US-730a-v2 verification)
**Status:** IN PROGRESS
**Scope:** FRONTEND
**Priority:** P1 (blocks a core workflow — shippers cannot complete long forms)

---

## User Story

**As a** Shipper (or any authenticated user) with a session running longer than 15 minutes
**I want** my access token to silently refresh when it expires
**So that** actions like creating a load don't fail with a generic, unrecoverable error after I've spent time filling out a form

---

## Background / Root Cause

Reported symptom: a Shipper attempting to create a load in the Docker test
environment sees a generic **"An error occurred"** banner and the load is
not created.

Root cause, confirmed via direct reproduction:

1. Access tokens expire after 900 seconds (15 minutes) — confirmed via the
   `/auth/login` response (`"expiresIn":900`).
2. `frontend/src/lib/apiClient.ts` has a response interceptor whose comment
   literally reads `// Response interceptor - just reject errors (refresh
   logic disabled for now)` — it does not attempt to refresh or retry on a
   401.
3. `authApi.refresh()` (`frontend/src/features/auth/api.ts`, calls
   `POST /auth/refresh`) already exists on the backend and frontend, but is
   never invoked anywhere in the frontend codebase (confirmed via
   repo-wide search — zero call sites).
4. When the access token expires mid-session, any subsequent API call
   receives Spring Security's default 401 response body:
   `{"timestamp":...,"status":401,"error":"Unauthorized","path":...}`
   — **no `message` field** (confirmed via direct `curl` reproduction
   against the JWT resource server, bypassing `GlobalExceptionHandler`
   entirely since the 401 is raised at the filter-chain level, before
   the request ever reaches a controller).
5. `LoadForm.tsx`'s `errorMessage` derivation is
   `error.response?.data?.message ?? 'An error occurred'` — since
   `.message` is absent on this response shape, the generic fallback
   fires.

This is not specific to load creation. It will reproduce on **any**
authenticated POST/PUT/PATCH/DELETE made more than 15 minutes after login,
anywhere in the app. The Create Load form (4 sections: Route ×2, Schedule,
Load Details, Pay & Terms) is simply long enough that a real user filling
it out honestly can plausibly exceed 15 minutes, making it the first place
this surfaced.

---

## Acceptance Criteria

### AC-1: Automatic refresh-and-retry on 401
```gherkin
Given a user is authenticated with an expired access token
  And a valid HTTP-only refresh cookie is still present
When any apiClient request receives a 401 response
Then the interceptor calls POST /auth/refresh exactly once
  And on success, updates the in-memory access token in authStore
  And retries the original failed request once with the new token
  And the caller (e.g. LoadForm's onSubmit) never sees the 401 —
    the promise resolves as if the token had not expired
```

### AC-2: Refresh failure redirects to login
```gherkin
Given a user's refresh cookie is also expired or invalid
When the refresh-and-retry interceptor calls POST /auth/refresh
  And that call itself returns 401
Then the interceptor clears authStore's in-memory auth state
  And the user is redirected to /login
  And no infinite retry loop occurs (a request is only ever retried once)
```

### AC-3: Concurrent 401s trigger a single refresh call
```gherkin
Given multiple apiClient requests are in flight when the token expires
When two or more of them receive a 401 in the same window
Then only one POST /auth/refresh call is made (not one per failed request)
  And all pending failed requests are retried once the single refresh
    resolves, using the new token
```

### AC-4: Non-auth errors are unaffected
```gherkin
Given a request fails with a 4xx/5xx status other than 401
  Or a 401 that occurs during login/register/refresh itself
When the interceptor processes the error
Then it is rejected normally without triggering a refresh-and-retry loop
  And existing error-message handling (e.g. LoadForm's ErrorBanner) behaves
    exactly as before for these cases
```

---

## Out of Scope

- Redesigning the generic-error-message fallback UX (a clearer "session
  expired" message is a separate, smaller concern — this story's fix
  should make that fallback path rare, not redesign it).
- Changing the 900s access-token TTL itself.
- Any change to `LoadForm.tsx` or other feature code — this is isolated to
  the shared `apiClient.ts` interceptor layer and `authStore`.
