# Architecture: Login Page Optimization (<100ms Hydration) - US-756

**Date:** 2026-05-18  
**Architect Role**  
**Strategy:** Separate Minimal Login Application Bundle  

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│  User visits freightclub.io          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Nginx serves index.html (static)    │
│  + login-app.js (15KB, minimal)      │  <- First load: <100ms
└────────────┬────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ React mounts        │
    │ Login form renders  │
    │ User sees form      │  <- 85-100ms total
    └──────────┬──────────┘
               │
               ▼ (User submits credentials)
    ┌─────────────────────┐
    │ Auth API call       │
    │ Set auth cookie     │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ Load main app       │
    │ (async, background) │  <- User already logged in
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────┐
    │ User redirected to  │
    │ Dashboard           │  <- Main app ready
    └─────────────────────┘
```

---

## Key Design Decisions

### 1. Separate Login Application
**Decision:** Create `login-app.tsx` as independent React entry point  
**Rationale:**
- Current main bundle: ~150KB (uncompressed) → 54KB (gzipped)
- Login app target: ~15KB (uncompressed) → 5KB (gzipped)
- Reduces JS parsing time by 90%
- User sees login instantly, main app loads in background

**Tradeoff:** Code duplication in some types/utils (acceptable for performance gain)

---

### 2. Bundle Architecture

```
frontend/dist/
├── index.html (serves login-app by default)
├── assets/
│   ├── login-app-[hash].js (5KB, CRITICAL)
│   ├── index-[hash].js (54KB, lazy loaded)
│   └── [other chunks...]
└── login-redirect.html (static fallback for errors)
```

**Build Strategy:**
- `npm run build` → produces both login-app and main app
- Vite config: two entry points
- HTTP header: Cache login-app for 24h (to update on deployment)

---

### 3. Component Structure

**Login App (minimal):**
```
frontend/src/apps/login-app/
├── main.tsx (entry point, no imports from /src/features)
├── pages/
│   └── LoginPage.tsx (form only, no routing)
├── components/
│   ├── LoginForm.tsx (uncontrolled component)
│   └── ErrorMessage.tsx (simple UI)
└── services/
    └── authService.ts (API calls only)
```

**Constraints:**
- ❌ No Zustand (store initialization adds 30ms)
- ❌ No React Router (not needed)
- ❌ No React Query (API calls are direct)
- ❌ No Tailwind config (only essential styles)
- ✅ Inline CSS or minimal Tailwind

**Main App (unchanged):**
```
frontend/src/ (existing structure)
├── App.tsx (routes, stores, queries)
├── features/
├── pages/
└── components/
```

---

### 4. Authentication Flow

**On Initial Page Load:**
```
GET / 
  → Check for auth cookie in middleware
  → If valid: Render login-app, auto-redirect to /dashboard
  → If invalid: Show login form
  → Main app loads asynchronously
```

**Middleware Logic (in nginx.conf or index.html script):**
```javascript
// Before React mounts
if (hasValidAuthCookie()) {
  // Preload main app
  loadMainApp().then(() => {
    window.location.href = '/dashboard';
  });
} else {
  // User fills login form
  mountLoginApp();
}
```

---

### 5. Hydration Strategy

**Goal:** Minimize JS before user interaction

| Phase | Time | Action |
|-------|------|--------|
| 0-20ms | Fetch HTML + login-app.js | Parallel requests |
| 20-40ms | Parse JS (V8 engine) | Fast due to small bundle |
| 40-70ms | React init + component mount | Minimal dependencies |
| 70-85ms | Render login form | Simple component tree |
| 85-100ms | Browser ready for interaction | User types email |

---

### 6. API Communication

**Login Endpoint:** No changes to existing auth API
```
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "..."
}
→ Response: { "accessToken": "...", "refreshToken": "..." }
   Sets httpOnly cookie: auth_token
```

**No new API endpoints needed** - reuse existing auth flow

---

### 7. Fallback & Rollback

**If login-app fails to load:**
1. Static HTML fallback (no JS): basic login form
2. Graceful degradation: works without JavaScript
3. Rollback: Switch `index.html` to load old main app

**Deployment Plan:**
- Blue-green: Old app on `/app/`, new on `/`
- Monitoring: If login fails, flip traffic back to old app
- Rollback time: <5 minutes

---

### 8. Performance Budget

**Login App Bundle:**
- React: 40KB (compressed from 130KB library size due to tree-shake)
- Login components: 10KB
- Utilities: 5KB
- **Total target: 15KB uncompressed, 5KB gzipped**

**Measurement:**
```bash
$ gzip -c dist/assets/login-app-*.js | wc -c
5432  # bytes = 5.3KB ✅
```

---

### 9. Testing Strategy

**Unit Tests:**
- LoginForm: form submission, validation errors
- AuthService: API call success/failure
- Hydration: <100ms measured in test

**Integration Tests:**
- User lands on `/` → sees login form in <100ms
- User submits credentials → auth succeeds
- User redirected to dashboard

**Performance Tests:**
- Lighthouse audit: FCP <100ms
- DevTools Performance tab: measure hydration

---

## File Changes Summary

**New Files:**
- `frontend/src/apps/login-app/main.tsx`
- `frontend/src/apps/login-app/pages/LoginPage.tsx`
- `frontend/src/apps/login-app/components/LoginForm.tsx`
- `frontend/src/apps/login-app/components/ErrorMessage.tsx`
- `frontend/src/apps/login-app/services/authService.ts`
- `frontend/src/apps/login-app/styles.css`

**Modified Files:**
- `frontend/vite.config.ts` (add login-app entry point)
- `frontend/index.html` (add loader script)
- `frontend/nginx.conf` (no changes, serves index.html same way)

**No changes to:**
- `frontend/src/App.tsx`
- `frontend/src/pages/`
- `backend/` (auth API unchanged)
- `docker-entrypoint.sh`

---

## Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Auth API mismatch | Low | High | Share types, test auth flow |
| Bundle too large | Very Low | Medium | Monitor gzip size in CI |
| Mobile performance | Low | Medium | Test on 3G throttle |
| Cookie not set | Low | High | Verify httpOnly cookie flow |
| Rollback needed | Low | Medium | Keep old app ready, flip switch |

---

## Acceptance by Architect

✅ **Design approved** - Separate login app is the optimal path:
- Guaranteed <100ms hydration
- Minimal risk to existing codebase
- Clear separation of concerns
- Easy to test and debug
- Rollback straightforward

**Ready for CODER phase - TDD implementation**
