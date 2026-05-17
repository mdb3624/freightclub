# Technical Design: Bundle Optimization Phase
**Architect Phase Document**  
**Generated:** 2026-05-17  
**Status:** DESIGN_APPROVED  
**Stories:** US-751, US-752, US-753, US-754, US-755

---

## Design Overview

This document provides the technical architecture for comprehensive bundle optimization across the FreightClub frontend, covering code-splitting, font optimization, validation refactoring, CDN configuration, and React Query optimization.

---

## 1. Code-Splitting Architecture (US-751)

### Module Dependency Graph

```
┌─────────────────────────────────────────────────────┐
│                   Entry Point (main.tsx)            │
└────────────────┬──────────────────────────────────┘
                 │
        ┌────────┴────────────────────┐
        │                             │
        ▼                             ▼
   ┌─────────┐              ┌──────────────┐
   │ /login  │              │ /dashboard   │
   │ /register               │ /load/*      │
   │ /                       │ /profile     │
   └────┬────┘              └──────┬───────┘
        │                          │
        ▼                          ▼
   ┌──────────┐            ┌──────────────┐
   │ auth     │            │ dashboard    │
   │ (185 KB) │            │ (300 KB)     │
   └────┬─────┘            └──────┬───────┘
        │                         │
        │                         │
        └────────────┬────────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
        ┌──────────┐  ┌─────────────┐
        │ vendor-  │  │ vendor-     │
        │ core     │  │ query       │
        │ (85 KB)  │  │ (42 KB)     │
        └──────────┘  └─────────────┘
```

### Chunk Structure

**vendor-core** (85 KB - shared by auth + dashboard)
- react (45 KB)
- react-dom (25 KB)
- react-router-dom (15 KB)

**auth** (185 KB - login/register only)
- LoginPage, RegisterPage components
- auth hooks (useLogin, useRegister)
- authStore (Zustand)
- regex validation (replacing Zod)
- axios (15 KB)

**vendor-query** (42 KB - loaded after auth only)
- @tanstack/react-query
- react-query hooks
- cache management

**dashboard** (300 KB - loaded after auth)
- TruckerDashboard, ShipperDashboard
- load features (LoadBoardTab, LoadBoardTable, etc.)
- HosWidget
- Sonner (toasts)
- hooks using React Query

**Vite Configuration:**

```typescript
// frontend/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-core': ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand'],
          'vendor-query': ['@tanstack/react-query'],
          'auth': [
            'src/pages/LoginPage',
            'src/pages/RegisterPage',
            'src/features/auth',
            'src/store/authStore',
          ],
          'dashboard': [
            'src/pages/TruckerDashboard',
            'src/pages/ShipperDashboard',
            'src/features/loads',
            'src/features/hos',
            'sonner',
          ],
        },
      },
    },
  },
})
```

### Load Strategy

**Initial page load (/login):**
1. vendor-core (85 KB) - immediate load
2. auth (185 KB) - immediate load
3. **Total: 270 KB** vs 503 KB (46% reduction)

**After authentication:**
1. vendor-query (42 KB) - lazy load
2. dashboard (300 KB) - lazy load
3. **Total addition: 342 KB** (loaded asynchronously)

### Module Boundaries

**Auth module must NOT import:**
- Dashboard components
- React Query
- Sonner
- HosWidget

**Dashboard module must NOT import:**
- LoginPage, RegisterPage
- Zod, react-hook-form

---

## 2. Font Optimization Architecture (US-752)

### Current Font Loading

```html
<!-- Load blocking in <head> -->
<link href="/fonts/inter.css" rel="stylesheet">
<link href="/fonts/sora.css" rel="stylesheet">
<!-- 500+ KB, blocks render -->
```

### Target Font Loading

**Login page (system fonts):**
```css
/* System font stack, zero custom fonts */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

**Dashboard page (custom fonts, lazy loaded):**
```typescript
// src/components/AuthInitializer.tsx
useEffect(() => {
  if (isAuthenticated && !fontsLoaded) {
    const link = document.createElement('link')
    link.href = '/fonts/custom-fonts.css'
    link.rel = 'stylesheet'
    link.onload = () => setFontsLoaded(true)
    document.head.appendChild(link)
  }
}, [isAuthenticated, fontsLoaded])
```

### Font Subset Strategy

**Login page:** System fonts only (0 KB)
**Dashboard page:** Latin + Latin Extended subsets (45 KB instead of 500+ KB)

**Font files to load after auth:**
- sora-latin-400.woff2 (15 KB)
- sora-latin-600.woff2 (15 KB)
- sora-latin-700.woff2 (15 KB)
- inter-latin-400.woff2 (24 KB)
- inter-latin-500.woff2 (24 KB)
- inter-latin-600.woff2 (24 KB)
- inter-latin-700.woff2 (24 KB)
- **Total: 141 KB** (vs 500+ KB current)

---

## 3. Validation Refactoring Architecture (US-753)

### Current Validation (Zod + Hook Form)

```typescript
// OLD: 36-42 KB bundle overhead
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
})
```

### Target Validation (Inline Regex)

```typescript
// NEW: Inline, zero library overhead
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateEmail = (email: string): string | undefined => {
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Enter a valid email'
  return undefined
}

const validatePassword = (password: string): string | undefined => {
  if (!password) return 'Password is required'
  return undefined
}

// In LoginForm component
const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

const handleChange = (e) => {
  const { name, value } = e.target
  if (name === 'email') {
    setErrors(prev => ({ ...prev, email: validateEmail(value) }))
  } else if (name === 'password') {
    setErrors(prev => ({ ...prev, password: validatePassword(value) }))
  }
}
```

### Validation Logic Rules

- Email: Required + RFC 5322 simplified regex
- Password: Required only (complexity enforced server-side)
- Error messages: Match current UX exactly
- Real-time validation on change
- Submit validation on form submission

---

## 4. Cloud CDN Configuration (US-754)

### Cache Header Strategy

**Hashed assets (immutable):**
```
Cache-Control: public, max-age=31536000, immutable
```

**index.html (changes with builds):**
```
Cache-Control: public, max-age=3600, must-revalidate
```

**Fonts (stable but reloadable):**
```
Cache-Control: public, max-age=604800, immutable
```

### Cloud Run Response Configuration

**Set headers in Cloud Run container:**
```dockerfile
# Dockerfile
RUN cat > /etc/nginx/conf.d/cache-headers.conf <<EOF
location ~* \.(js|css|woff2|woff|png|jpg|jpeg|gif|svg)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header Vary "Accept-Encoding";
  gzip on;
  brotli on;
}

location = /index.html {
  add_header Cache-Control "public, max-age=3600, must-revalidate";
  add_header Vary "Accept-Encoding";
  gzip on;
}
EOF
```

### Compression Configuration

**Enable Brotli + Gzip:**
```nginx
gzip on;
gzip_types text/plain text/css application/javascript application/json;
gzip_min_length 1024;

brotli on;
brotli_types text/plain text/css application/javascript application/json;
brotli_min_length 1024;
```

### Cloud CDN Settings

- Enable: Yes (verify in Load Balancer)
- Mode: Cache static content + dynamic content
- Default TTL: 3600 seconds
- Max TTL: 86400 seconds
- Negative caching: Off (no 404 caching)

---

## 5. React Query Optimization (US-755)

### Current Query Architecture

All 6 queries use React Query:
- useLoadBoard (pagination, filtering) ✅ Keep React Query
- useMyActiveLoad (real-time state) ✅ Keep React Query
- useMyLoadHistory (pagination) ✅ Keep React Query
- useProfile (per-session data) ⚠️ Evaluate
- useDieselPrices (static, 6-hour cache) ❌ Replace
- useAvailableStates (static enum data) ❌ Replace

### Target Architecture

**Keep React Query for:**
- Dynamic queries with pagination/filtering
- Real-time synchronization needs
- Background refetching

**Replace with Axios + useState for:**
- Static data (enums, configuration)
- One-time fetches per session
- No refetching required

### Replacement Pattern

```typescript
// OLD: useAvailableStates (React Query)
export function useAvailableStates() {
  return useQuery({
    queryKey: ['availableStates'],
    queryFn: () => loadApi.getAvailableStates(),
  })
}

// NEW: Simple fetch + useState
export function useAvailableStates() {
  const [data, setData] = useState<AvailableStates | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!data) {
      loadApi.getAvailableStates()
        .then(setData)
        .catch(setError)
        .finally(() => setIsLoading(false))
    }
  }, [data])

  return { data, isLoading, error }
}
```

### Session-Level Caching

Use `useRef` to cache data across component rerenders:
```typescript
const cachedStates = useRef<AvailableStates | null>(null)

useEffect(() => {
  if (!cachedStates.current) {
    loadApi.getAvailableStates()
      .then(data => cachedStates.current = data)
  }
}, [])
```

---

## Implementation Order

**Phase 1 (US-751): Code-Splitting** 
- Highest impact (15% savings)
- Critical blocker for other optimizations
- **Do first**

**Phase 2 (US-753): Validation Refactoring**
- Blocking US-751 (can't split auth without removing Zod)
- Quick win (1-2 hours)
- **Do second, in parallel with US-751**

**Phase 3 (US-752): Font Optimization**
- Deferred load strategy (no blocking dependencies)
- Works independently
- **Do third**

**Phase 4 (US-755): React Query Optimization**
- Works independently of code-splitting
- Secondary optimization
- **Do fourth**

**Phase 5 (US-754): CDN Configuration**
- Configuration only (no code changes)
- Applied after bundle work
- **Do last**

---

## Testing Strategy

### Unit Tests
- Module imports resolve correctly
- No circular dependencies
- Validation functions work as expected
- Font loading hook triggers appropriately

### Integration Tests
- Auth chunk loads without dashboard
- Dashboard chunk loads with React Query
- Font loading doesn't block render
- Query hooks work without React Query

### E2E Tests
- Login flow (auth chunk only)
- Dashboard access (dashboard chunk)
- Font transition (system → custom)
- Bundle size validation

### Performance Tests
- Lighthouse FCP < 1.5s
- Lighthouse LCP < 2.5s
- Lighthouse TTI < 3.5s
- Bundle sizes match targets

---

## Success Criteria

✅ **Code-Splitting (US-751):**
- Auth bundle < 250 KB
- Dashboard bundle < 430 KB
- 25% faster login page

✅ **Font Optimization (US-752):**
- Login page < 300 KB total
- Fonts cached for dashboard

✅ **Validation (US-753):**
- Zod removed from auth module
- 36-42 KB savings

✅ **React Query (US-755):**
- 3 queries replaced
- 5-8 KB savings

✅ **CDN (US-754):**
- Cache headers verified
- 10-15% faster repeat visits

**Total Expected Savings: 120-140 KB initial load, 50% overall with deferred assets**

---

## Architecture Sign-Off

**Status:** ✅ READY FOR IMPLEMENTATION

All technical designs approved. Ready for CODER phase with TDD approach.
