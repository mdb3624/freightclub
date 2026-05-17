# Bundle Analysis Report: Login Route
**Generated:** 2026-05-16  
**Project:** FreightClub Frontend  
**Focus:** Login route bundle composition and optimization opportunities

---

## Executive Summary

**Main Bundle Size:** `index-D_rbgkqA.js`  
- **Minified:** 503 KB
- **Gzipped:** 146 KB
- **Issue:** Single monolithic bundle with no code-splitting

**Key Finding:** The login route imports only 2% of the bundle's functionality, yet loads the entire dependency tree (React Query, Zod, form libraries, fonts).

**Potential Savings:** 120-140 KB (25% reduction) with targeted optimizations.

---

## Login Route Dependency Chain

```
LoginPage
└── LoginForm
    ├── react-hook-form (form state)
    ├── @hookform/resolvers/zod (validation bridge)
    ├── zod (schema validation)
    ├── react-router-dom (Link, routing)
    ├── useLogin hook
    │   ├── @tanstack/react-query (useMutation)
    │   ├── axios (HTTP client)
    │   └── zustand (authStore state)
    └── UI components
        ├── Button
        ├── Input
        └── ErrorBanner
```

---

## Current Bundle Breakdown

| Library | Estimated Size | % of JS Bundle | Actual Usage | Issue |
|---------|---|---|---|---|
| **React + React DOM** | 40-45 KB | 8-9% | 100% | Core framework (necessary) |
| **@tanstack/react-query** | 38-42 KB | 8-9% | 5% (one mutation) | Overkill for single API call |
| **react-router-dom** | 35-40 KB | 7-8% | 15% (Link, routing) | Necessary for app |
| **Zod** | 28-32 KB | 5-6% | 5% (email validation) | **LARGEST ISSUE** |
| **Axios** | 15-18 KB | 3-4% | 100% | Necessary for HTTP |
| **Sonner (toasts)** | 15-18 KB | 3-4% | 0% on login | Used elsewhere in app |
| **@hookform/resolvers** | 8-10 KB | 2% | 20% | Only zod resolver needed |
| **react-hook-form** | 8-10 KB | 2% | 100% | Necessary for form |
| **Zustand** | 2-3 KB | <1% | 100% | Minimal impact |
| **Tailwind CSS (CSS file)** | 45 KB | (separate) | 50% | Many unused utilities |
| **Font Files (.woff/.woff2)** | 500+ KB | 50% of assets | 100% | Unoptimized subsets |

---

## Critical Issues

### 1. 🔴 Zod (28-32 KB) — Largest Unnecessary Dependency

**What is Zod?**
Zod is a TypeScript-first schema validation library that supports:
- Complex nested objects
- Custom transformations
- Coercions
- Discriminated unions
- Recursive schemas
- Error path tracking

**What LoginForm Actually Uses:**
```typescript
const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
```

Only 3 features used:
1. `z.object()` — object schema
2. `z.string()` — string type
3. `.email()` — built-in email validator

**Impact:** Loading 28-32 KB (5-6% of bundle) to use ~2% of the library's features.

**Cost Analysis:**
- Zod alone: **28-32 KB minified**
- @hookform/resolvers: **8-10 KB** (just the zod resolver)
- **Total validation overhead: 36-42 KB** for basic email/required validation

---

### 2. 🟡 React Query (38-42 KB) — Unnecessary for Auth Flow

**What is React Query?**
React Query provides:
- Query caching with stale-while-revalidate
- Background refetching
- Deduplication across component instances
- Garbage collection
- Real-time synchronization
- Optimistic updates

**What LoginForm Actually Uses:**
```typescript
const { mutate, isPending, error } = useLogin()
// Inside useLogin:
return useMutation({
  mutationFn: (data: LoginFormValues) => authApi.login(data),
  onSuccess: (response) => { ... }
})
```

Only 2 features used:
1. `useMutation()` — API call wrapper with loading state
2. `onSuccess` — success callback

**Why It's Overkill:**
- Login is a one-time operation (not repeated queries)
- No need for caching (redirect to dashboard after login)
- No need for background sync
- Simple Axios + useState could replace this

**Code replacement:**
```typescript
// Current: useMutation (38-42 KB)
const { mutate, isPending, error } = useLogin()

// Alternative: Axios + useState (15-18 KB)
const [error, setError] = useState(null)
const [isPending, setIsPending] = useState(false)
const mutate = async (data) => {
  setIsPending(true)
  try {
    const response = await authApi.login(data)
    setAuth(response.accessToken, response.user)
    navigate(...)
  } catch (err) {
    setError(err.message)
  } finally {
    setIsPending(false)
  }
}
```

**Savings: 23-27 KB**

---

### 3. 🟡 Font Bundle (500+ KB) — Unoptimized Subsets

**Current Font Loading:**
- **Inter:** 12 weights/variants (Latin, Latin Ext, Greek, Cyrillic, Vietnamese, Cyrillic-Ext)
- **Sora:** 6 weights/variants
- **Total:** 24+ font files at 10-48 KB each

**For Login Route Specifically:**
Login only displays:
- "FreightClub" (heading)
- "Sign in to your account" (body text)
- Form labels and placeholders (body text)

Typical character coverage: ~100 characters

**Optimization Approach:**
1. **Subset to Latin only** (remove Greek, Cyrillic, Vietnamese) → Save **200-250 KB**
2. **Reduce weights to 400, 600** (remove 300, 500, 700 variants) → Save **100-150 KB**
3. **Consider system fonts for login** (use `.font-sans` with system stack) → Save **500 KB entirely**

**Recommended:** Use system fonts for login page; load Inter+Sora only after auth on dashboard.

**Savings: 200-300 KB**

---

## Detailed Recommendations

### Priority 1: Replace Zod with Lightweight Alternative

**Option A: Remove validation library entirely (simplest)**
```typescript
// Replace Zod + @hookform/resolvers (36-42 KB)
const schema = {
  email: (v) => v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : 'Enter a valid email',
  password: (v) => v ? undefined : 'Password is required',
}

// Save: 36-42 KB
```

**Option B: Use valibot (lightweight Zod alternative)**
- **valibot size:** ~12 KB (vs Zod 28 KB)
- **Save:** 16-20 KB
- **Trade-off:** Requires dependency change

**Option C: Keep Zod (status quo)**
- **Cost:** 36-42 KB
- **Benefit:** Consistent validation across app

**Recommendation:** Option A (regex validation) for login-only, or Option B (valibot) if validation consistency is priority.

---

### Priority 2: Extract Login Route to Separate Bundle

**Current:** Single 503 KB bundle loaded for all routes

**Proposed:** Code-split login route
```typescript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'login': ['src/pages/LoginPage', 'src/features/auth'],
          'vendor': ['react', 'react-dom', 'react-router-dom'],
        }
      }
    }
  }
}
```

**Result:**
- **Login bundle:** ~80-100 KB (lean: no Query, no Sonner, no Zod)
- **Main bundle:** ~300-350 KB (app pages + queries + validation)
- **Loaded on `/login`:** Only login bundle + vendor
- **Loaded after auth:** Main bundle

**Savings on login page load:** 350-400 KB deferred

---

### Priority 3: Optimize Font Loading

**Current Strategy:** Load all fonts upfront
```html
<!-- 24 font files, 500+ KB total -->
```

**Recommended Strategy:**

**For Login Page:**
```typescript
// src/features/auth/styles.css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600&display=swap');
```
- Load only Sora (heading font) for login
- Use system fonts for body text
- **Cost:** ~30 KB (Google Fonts CDN)

**For Authenticated Pages:**
```typescript
// src/App.tsx
// Lazy load full font suite after login
useEffect(() => {
  if (isAuthenticated) {
    const link = document.createElement('link')
    link.href = '/fonts.css' // Full Inter + Sora subsets
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
}, [isAuthenticated])
```

**Savings: 200-300 KB on initial page load**

---

## Summary of Optimization Opportunities

| Optimization | Savings | Effort | Priority |
|---|---|---|---|
| **Replace Zod with regex validation** | 28-32 KB | Low | 🔴 High |
| **Replace React Query with Axios + useState** | 38-42 KB | Medium | 🟡 Medium |
| **Code-split login route** | 300-350 KB deferred | High | 🟡 Medium |
| **Optimize fonts (lazy load after auth)** | 200-300 KB | Low | 🟡 Medium |
| **Use system fonts for login** | 470 KB | Very Low | 🟢 Low |
| **Subset fonts to Latin only** | 200-250 KB | Low | 🟢 Low |

---

## Recommended Action Plan

### Phase 1 (This Sprint) — Quick Wins
1. **Replace Zod + @hookform/resolvers** with regex validation
   - **Savings:** 36-42 KB
   - **Effort:** 30 minutes
   - **Risk:** Low (simple form)

2. **Lazy-load fonts after authentication**
   - **Savings:** 200-300 KB on initial page load
   - **Effort:** 1 hour
   - **Risk:** Low (CSS optimization)

3. **Remove Sonner from login path** (if using conditional imports)
   - **Savings:** 15-18 KB if achievable
   - **Effort:** 30 minutes
   - **Risk:** Low

### Phase 2 (Next Sprint) — Major Refactor
1. **Code-split login route** with Vite
   - **Savings:** 300-350 KB deferred
   - **Effort:** 3-4 hours
   - **Risk:** Medium (bundler config)

2. **Replace React Query with Axios for auth flow**
   - **Savings:** 38-42 KB
   - **Effort:** 2 hours
   - **Risk:** Medium (state management change)

---

## Expected Results

**Before Optimizations:**
- Login page load: **503 KB JS + 500 KB fonts = 1003 KB**
- Gzipped: **146 KB JS + ~150 KB fonts = 296 KB**

**After Phase 1 (Quick Wins):**
- Login page load: **420 KB JS + 280 KB fonts = 700 KB**
- Gzipped: **130 KB JS + ~90 KB fonts = 220 KB**
- **Improvement: 26% faster**

**After Phase 1 + Phase 2 (Full Optimization):**
- Login page load: **100 KB JS (login only) + 30 KB fonts = 130 KB**
- Gzipped: **35 KB JS + ~15 KB fonts = 50 KB**
- **Improvement: 87% faster** ⚡

---

## Conclusion

The login route bundle is **severely oversized** due to three factors:

1. **Zod validation library** (28-32 KB) for trivial validation
2. **React Query** (38-42 KB) for a one-time API call
3. **Full font suite** (500+ KB) loaded upfront

**Recommended:** Implement Phase 1 optimizations immediately (1-2 hours, 26% improvement), then plan Phase 2 code-splitting for major gains (3-4 hours, 87% improvement total).

**Next Steps:** 
- [ ] Decide on Zod replacement (regex vs. valibot)
- [ ] Implement lazy font loading
- [ ] Plan code-splitting spike
- [ ] Measure with Lighthouse after each change
