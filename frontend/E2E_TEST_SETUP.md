# E2E Test Authentication Setup

This document explains the test-only authentication system for Playwright E2E tests.

## Overview

**Problem**: Playwright's `storageState` doesn't properly restore HTTP-only cookies, causing E2E tests to fail with auth issues when navigating to protected routes.

**Solution**: A test-only backend endpoint (`/api/test/auth/login`) that bypasses normal login flow and directly authenticates test users. Playwright's `globalSetup` uses this endpoint once before all tests run, saving the authenticated state for all tests to reuse.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Playwright Test Run                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. globalSetup runs ONCE before all tests:               │
│     ├─ POST /api/test/auth/login (backend)               │
│     ├─ Receive refreshToken cookie + access token        │
│     └─ Save state to auth.json                            │
│                                                             │
│  2. Each test loads auth.json via storageState:           │
│     ├─ Browser context restored with auth cookies        │
│     ├─ AuthInitializer verifies refresh token            │
│     └─ Test executes with authenticated user              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Files

### Backend

**`TestAuthController.java`**
- Location: `backend/src/main/java/com/freightclub/controller/TestAuthController.java`
- Only enabled when `spring.test.enabled=true` (test profile)
- Endpoint: `POST /api/test/auth/login`
- Accepts: `email`, `password`, `firstName`, `lastName`, `role`, `companyName`
- Returns: Access token + refreshToken cookie (with `path=/`)
- Fallback: If registration fails (user exists), attempts login instead

### Frontend

**`playwright-global-setup.ts`**
- Location: `frontend/playwright-global-setup.ts`
- Runs ONCE before all tests
- Calls the test auth endpoint with unique test credentials
- Saves authenticated state to `auth.json`
- Error messages help diagnose setup issues

**`playwright.config.ts`**
- Updated to use `globalSetup: require.resolve('./playwright-global-setup.ts')`
- All tests load `storageState: 'auth.json'` automatically
- Tests inherit authenticated browser context from globalSetup

**`auth.json`** (generated)
- Created by globalSetup after successful authentication
- Contains: cookies (including refreshToken), localStorage, sessionStorage
- Loaded by every test via storageState

### Test Files

**`e2e/shipper-preferred-carriers.spec.ts`**
- Simplified: no login logic, just navigates to protected routes
- Auth state is pre-loaded from auth.json
- beforeEach simply calls `page.goto()` and navigates

## Configuration

### Backend Enable Test Auth

In `application-test.yml`:
```yaml
spring:
  test:
    enabled: true  # Enables TestAuthController
```

### Environment Variables

For Playwright setup, these can be customized:
```bash
TEST_BACKEND_URL=http://localhost:9091
PLAYWRIGHT_TEST_BASE_URL=http://localhost:9090
```

Default: localhost with Docker exposed ports

## Usage

### Running E2E Tests Locally

```bash
cd frontend

# Runs globalSetup, generates auth.json, then runs all tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- e2e/shipper-preferred-carriers.spec.ts

# Run specific test
npm run test:e2e -- -g "AC-707-1"
```

### Troubleshooting

**Setup fails to connect to backend**
- Verify backend is running on port 9091 (or `TEST_BACKEND_URL` matches)
- Check Docker containers: `docker-compose -f docker-compose.test.yml ps`

**Auth fails with 403 (Forbidden)**
- Backend is running in production mode
- Check `SPRING_PROFILES_ACTIVE` environment variable
- Verify `spring.test.enabled: true` is in `application-test.yml`

**Tests still redirect to login**
- Delete `auth.json` and re-run (globalSetup will regenerate)
- Check browser console for AuthInitializer errors
- Verify refresh token cookie has `path: /` (not `/api/auth`)

**auth.json missing**
- Playwright wasn't able to run globalSetup successfully
- Check globalSetup logs for error messages
- Manually run setup: `npx ts-node playwright-global-setup.ts`

## Security Notes

✅ **Production Safe**
- TestAuthController only compiles with `spring.test.enabled=true`
- Runtime check blocks endpoint if `SPRING_PROFILES_ACTIVE=production`
- No production credentials or test logic in production builds

✅ **Test Isolation**
- Each test run generates a new test user (via timestamp)
- Tests use isolated test database (freightclub_test)
- No shared state between test runs

✅ **Cookie Security**
- Refresh token is HTTP-only (can't be accessed via JavaScript)
- Secure flag disabled in test (localhost doesn't support HTTPS)
- Same-site policy set to Lax for cookie handling

## Flow Diagram: First Time Setup

```
1. npm run test:e2e
   ↓
2. Playwright loads playwright.config.ts
   ├─ Sees globalSetup: './playwright-global-setup.ts'
   ├─ Runs globalSetup BEFORE any tests
   │
3. playwright-global-setup.ts executes:
   ├─ Launches chromium browser
   ├─ Generates unique test user: e2e-test-1719999999-setup@freightclub.local
   ├─ POST http://localhost:9091/api/test/auth/login
   │   └─ Backend TestAuthController
   │       ├─ Check spring.test.enabled=true ✓
   │       ├─ Try register user ✓ (first run)
   │       ├─ Generate refreshToken cookie
   │       └─ Return AuthResponse
   ├─ Browser receives Set-Cookie: refreshToken
   ├─ context.storageState() → auth.json
   └─ Browser closes
   
4. Playwright runs actual tests
   ├─ Each test loads auth.json via storageState
   ├─ Browser context has refreshToken cookie
   ├─ Tests navigate to protected routes
   ├─ AuthInitializer calls /api/v1/auth/refresh
   │   └─ Backend validates refreshToken cookie ✓
   └─ Tests execute as authenticated user

Next runs:
   ├─ Same globalSetup runs again
   ├─ POST /api/test/auth/login (new test user)
   │   └─ Registration fails: user already exists from previous run
   │   └─ Falls back to login with same credentials ✓
   └─ Tests proceed normally
```

## Advanced: Running Tests Against Different Environments

```bash
# Against local backend
npm run test:e2e

# Against Docker containers
TEST_BACKEND_URL=http://localhost:9091 npm run test:e2e

# Against remote staging (if configured)
TEST_BACKEND_URL=https://staging-api.example.com npm run test:e2e
```

## Implementation Notes

The TestAuthController is intentionally minimal to avoid coupling with production auth logic:

- Uses existing `AuthService.register()` and `AuthService.login()` methods
- Generates its own `ResponseCookie` for the refresh token
- Falls back gracefully: new user registration, existing user login
- No database schema changes
- No new permissions or roles
- No changes to existing auth middleware

This approach keeps test infrastructure completely decoupled from production authentication.
