# US-713: Shipper Company Profile Setup — Implementation Design Spec

**Document Version:** 1.0  
**Date:** 2026-05-19  
**Author:** Claude (Brainstorming + Design)  
**Status:** READY_FOR_IMPLEMENTATION  
**Reference:** docs/business/stories/US-713.md, docs/architecture/US-713_SHIPPER_PROFILE_DESIGN.md, docs/hfd/US-713_SHIPPER_PROFILE_SETUP_DESIGN_SPEC.md

---

## Executive Summary

US-713 implements **Shipper Company Profile Setup**, a post-registration flow that collects essential company information and gates load publishing at 80% completeness. This spec consolidates the existing architectural and HFD designs into a concrete implementation plan covering:

- Backend: Service completeness calculation, profile persistence, publish gating
- Frontend: Profile form (React Hook Form + Zod), profile page, dashboard banner
- Testing: Unit, integration, and E2E coverage targeting 80%+ branch coverage

---

## 1. Backend Architecture

### 1.1 Database & Persistence

**Table:** `shipper_profiles` (pre-migrated via `V20260513_1000__ShipperProfiles_US713.sql`)

**Columns:**
- `id` (UUID, PK)
- `tenant_id` (VARCHAR(36), FK → tenants, indexed with deleted_at)
- `company_name` (VARCHAR(120), NOT NULL)
- `billing_email` (VARCHAR(255), NOT NULL, valid email)
- `phone_number` (VARCHAR(20), NOT NULL)
- `city` (VARCHAR(100), NOT NULL)
- `state` (VARCHAR(2), NOT NULL)
- `zip_code` (VARCHAR(10), NOT NULL)
- `mc_number` (VARCHAR(8), nullable)
- `usdot_number` (VARCHAR(8), nullable)
- `logo_url` (TEXT, nullable)
- `completeness_pct` (INTEGER, default 0)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)
- `deleted_at` (TIMESTAMPTZ, nullable)

**Queries:**
- All SELECT queries include `WHERE tenant_id = ? AND deleted_at IS NULL` (from TenantContextHolder)
- UPDATE and INSERT respect tenant_id from TenantContextHolder
- DELETE is soft: `UPDATE shipper_profiles SET deleted_at = NOW() WHERE id = ? AND tenant_id = ?`

### 1.2 Domain Entity

**File:** `backend/src/main/java/com/freightclub/modules/shipper/domain/ShipperProfile.java`

Record (no-Lombok):
```java
public record ShipperProfile(
    String id,
    String tenantId,
    String companyName,
    String billingEmail,
    String phoneNumber,
    String city,
    String state,
    String zipCode,
    String mcNumber,
    String usdotNumber,
    String logoUrl,
    Integer completenessPercent,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    OffsetDateTime deletedAt
) {}
```

### 1.3 Service Layer

**File:** `backend/src/main/java/com/freightclub/modules/shipper/application/ShipperProfileService.java`

**Methods:**

```java
public ShipperProfile getProfile()
  // Fetches current tenant's profile; throws exception if not found
  // Query: SELECT * FROM shipper_profiles 
  //        WHERE tenant_id = TenantContextHolder.getTenantId() 
  //        AND deleted_at IS NULL
  // Result: ShipperProfile or null
```

```java
public ShipperProfile saveProfile(ShipperProfileRequest request)
  // Validates request fields (required, formats)
  // Calculates completeness % per AC-4
  // INSERT (new) or UPDATE (existing) in DB
  // Returns ShipperProfile with updated completeness_pct
  
  // Request fields:
  // - companyName (required, ≤120 chars)
  // - billingEmail (required, valid email)
  // - phoneNumber (required, US format)
  // - city (required)
  // - state (required, 2 chars)
  // - zipCode (required, 5-digit)
  // - mcNumber (optional, 6–8 digits)
  // - usdotNumber (optional, 6–8 digits)
  // - logoUrl (optional)
```

```java
public Integer getCompletenessPercent()
  // Returns current tenant's profile completeness % (0–100)
  // If profile doesn't exist, returns 0
```

```java
public boolean isPublishReady()
  // Returns true if completeness >= 80, false otherwise
```

**Completeness Calculation (AC-4):**
| Field | Points | Required? |
|-------|--------|-----------|
| Company name | 20% | Yes |
| Billing email | 20% | Yes |
| Phone number | 15% | Yes |
| Address (city + state + zip) | 25% | Yes |
| MC or USDOT number | 15% | No, but counted if either present |
| Company logo | 5% | No |

- Shipper reaches 80% gate with: company name + email + phone + address = 80% (logo + MC/USDOT optional)
- Calculation is integer (not float): e.g., 20 + 20 + 15 + 25 = 80

### 1.4 Repository

**File:** `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/ShipperProfileRepository.java`

Extends Spring Data JPA:
```java
public interface ShipperProfileRepository extends JpaRepository<ShipperProfile, String> {
    Optional<ShipperProfile> findByTenantIdAndDeletedAtIsNull(String tenantId);
}
```

### 1.5 Controller Endpoints

**File:** `backend/src/main/java/com/freightclub/modules/shipper/infrastructure/rest/ShipperController.java`

**Endpoint 1: GET `/api/v1/profile`**
- Returns current tenant's ShipperProfileResponse
- Status 200 with profile data (including completeness_pct)
- If profile doesn't exist, return 200 with defaults (all null, completeness 0)

**Endpoint 2: POST/PUT `/api/v1/profile/company-info`**
- Accepts ShipperProfileRequest
- Calls `shipperProfileService.saveProfile(request)`
- Returns 201 Created (new) or 200 OK (update) with ShipperProfileResponse
- Validation errors (required field missing, invalid format): 400 Bad Request
  ```json
  {
    "error": "Validation failed",
    "details": [
      { "field": "billingEmail", "message": "Invalid email format" },
      { "field": "zipCode", "message": "Must be 5 digits" }
    ]
  }
  ```

### 1.6 Caching Strategy

**Backend Caching:**
- **Profile Data Cache:** Cache shipper profile in Spring Cache (via `@Cacheable`) with key `shipper:profile:{tenantId}`, TTL 5 minutes
  - `getProfile()` uses `@Cacheable("shipper-profiles")`
  - `saveProfile()` invalidates cache via `@CacheEvict("shipper-profiles")`
  - Dashboard/API calls benefit from reduced DB hits
  
- **Completeness % Cache:** Calculated and stored in `completeness_pct` column on every save (no separate cache needed; DB is the cache)
  - `getCompletenessPercent()` reads from DB column (no computation on each call)

**Frontend Caching:**
- React Query caches profile fetch with key `['shipper', 'profile']`, staleTime 2 minutes
  - Dashboard and ProfilePage share the same cache entry
  - Mutation `useUpdateProfile()` invalidates cache on success
  - User can manually refetch if needed (though cache should stay fresh)

**Cache Invalidation:**
- Backend: When profile is saved via POST/PUT, evict cache immediately
- Frontend: When mutation succeeds, update cache and refetch if needed
- Dashboard doesn't show stale data; completeness % updates in real-time after form submission

---

### 1.7 LoadService Integration: Publish Gating

**File:** `backend/src/main/java/com/freightclub/service/LoadService.java`

Modify `publishLoad(String id, String shipperId)`:
```java
public LoadResponse publishLoad(String id, String shipperId) {
    // ... existing logic ...
    
    // NEW: Check profile completeness
    if (!shipperProfileService.isPublishReady()) {
        Integer completeness = shipperProfileService.getCompletenessPercent();
        throw new ProfileIncompleteException(
            "Complete your company profile (currently " + completeness + "% complete) before publishing loads."
        );
    }
    
    // ... proceed with publish ...
}
```

**Exception Handling:**
- `ProfileIncompleteException` extends custom exception
- Controller catches and returns 400 with error message + link to `/profile` in response body

---

## 2. Frontend Architecture

### 2.1 Project Structure

```
frontend/src/
├── features/
│   └── shipper/
│       ├── components/
│       │   ├── ShipperProfileForm.tsx      [NEW]
│       │   └── ShipperProfileForm.test.tsx [NEW]
│       └── hooks/
│           ├── useShipperProfile.ts        [NEW]
│           └── useUpdateProfile.ts         [NEW]
├── pages/
│   ├── ProfilePage.tsx                     [NEW]
│   └── ProfilePage.test.tsx                [NEW]
└── components/
    └── Dashboard.tsx                       [MODIFY: add profile banner]
```

### 2.2 Validation Schema (Zod)

**File:** `frontend/src/features/shipper/components/ShipperProfileForm.tsx`

```typescript
const ShipperProfileSchema = z.object({
  companyName: z.string().min(1, "Company name required").max(120),
  billingEmail: z.string().email("Invalid email"),
  phoneNumber: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Format: XXX-XXX-XXXX"),
  city: z.string().min(1, "City required"),
  state: z.string().regex(/^[A-Z]{2}$/, "Must be 2-letter state code"),
  zipCode: z.string().regex(/^\d{5}$/, "Must be 5-digit ZIP"),
  mcNumber: z.string().regex(/^\d{6,8}$/, "6–8 digits").optional().or(z.literal("")),
  usdotNumber: z.string().regex(/^\d{6,8}$/, "6–8 digits").optional().or(z.literal("")),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

type ShipperProfileFormData = z.infer<typeof ShipperProfileSchema>;
```

### 2.3 ShipperProfileForm Component

**File:** `frontend/src/features/shipper/components/ShipperProfileForm.tsx`

```typescript
export function ShipperProfileForm() {
  const form = useForm<ShipperProfileFormData>({
    resolver: zodResolver(ShipperProfileSchema),
    defaultValues: { /* fetch from API */ }
  });
  
  const mutation = useUpdateProfile({
    onSuccess: () => {
      toast.success("Company profile saved.");
      // optionally redirect
    }
  });

  function onSubmit(data: ShipperProfileFormData) {
    mutation.mutate(data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Required Fields */}
      <Input {...form.register("companyName")} label="Company Name" required />
      <Input {...form.register("billingEmail")} label="Billing Email" required />
      <Input {...form.register("phoneNumber")} label="Phone Number" required />
      <Input {...form.register("city")} label="City" required />
      <Input {...form.register("state")} label="State" required />
      <Input {...form.register("zipCode")} label="ZIP Code" required />
      
      {/* Optional Fields */}
      <Input {...form.register("mcNumber")} label="MC Number (optional)" />
      <Input {...form.register("usdotNumber")} label="USDOT Number (optional)" />
      <Input {...form.register("logoUrl")} label="Logo URL (optional)" />
      
      {/* Completeness Display */}
      <div className="mt-4 p-4 bg-gray-100">
        <p className="text-sm font-semibold">Profile Completeness: {completeness}%</p>
        <div className="mt-2 h-2 bg-gray-300 rounded">
          <div className="h-full bg-blue-500" style={{ width: `${completeness}%` }} />
        </div>
      </div>

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
```

**Logic:**
- Fetch initial profile data on mount via `useShipperProfile()`
- Display real-time completeness % as form is edited (optimistic calculation)
- Show error messages from Zod validation inline on fields
- On success: show toast, optionally redirect or clear form
- Handle API errors (400, 500) and show user-friendly messages

### 2.4 Custom Hooks

**File:** `frontend/src/features/shipper/hooks/useShipperProfile.ts`

```typescript
export function useShipperProfile() {
  return useQuery({
    queryKey: ['shipper', 'profile'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/profile');
      return response.data as ShipperProfileResponse;
    },
  });
}
```

**File:** `frontend/src/features/shipper/hooks/useUpdateProfile.ts`

```typescript
export function useUpdateProfile(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ShipperProfileFormData) => {
      const response = await axios.post('/api/v1/profile/company-info', data);
      return response.data as ShipperProfileResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['shipper', 'profile'], data);
      options?.onSuccess?.();
    },
    onError: (error: AxiosError) => {
      // Show error toast with server message
      toast.error((error.response?.data as any)?.error || "Failed to save profile");
    },
  });
}
```

### 2.5 ProfilePage

**File:** `frontend/src/pages/ProfilePage.tsx`

```typescript
export function ProfilePage() {
  const { data: profile } = useShipperProfile();
  
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-2">Company Profile Setup</h1>
      <p className="text-gray-600 mb-6">Complete your profile to unlock load publishing.</p>
      
      {profile && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm font-semibold">
            Completeness: {profile.completeness_pct}%
          </p>
          {profile.completeness_pct < 80 && (
            <p className="text-xs text-gray-600 mt-1">
              You need {80 - profile.completeness_pct}% more to unlock publishing.
            </p>
          )}
        </div>
      )}
      
      <ShipperProfileForm />
    </div>
  );
}
```

**Route:** Add to router: `{ path: '/profile', element: <ProfilePage /> }`

### 2.6 Dashboard Banner

**File:** `frontend/src/components/Dashboard.tsx` (modify existing)

Add profile card section:
```typescript
export function Dashboard() {
  const { data: profile } = useShipperProfile();
  
  const completenessColor = 
    profile?.completeness_pct >= 80 ? 'bg-green-50' :
    profile?.completeness_pct >= 50 ? 'bg-yellow-50' :
    'bg-red-50';

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Existing load summary, earnings, etc. */}
      
      {/* NEW: Profile Status Card */}
      <div className={`p-4 rounded-lg border ${completenessColor}`}>
        <h3 className="font-semibold mb-2">Company Profile</h3>
        <p className="text-2xl font-bold">{profile?.completeness_pct || 0}%</p>
        <p className="text-xs text-gray-600 mb-3">Complete</p>
        
        {profile?.completeness_pct < 80 ? (
          <Link to="/profile" className="btn btn-primary text-sm">
            Complete Profile
          </Link>
        ) : (
          <div className="text-xs text-green-600 font-semibold">✓ Ready to publish</div>
        )}
      </div>
    </div>
  );
}
```

---

## 3. Testing Strategy (TDD)

### 3.1 Backend Unit Tests

**File:** `backend/src/test/java/com/freightclub/modules/shipper/ShipperProfileServiceTest.java`

Tests:
1. **Completeness Calculation:**
   - All 6 fields → 100%
   - Company + email + phone + address → 80%
   - Company + email + phone only → 60%
   - Empty → 0%
   - With logo → 85%
   - With MC number → 95%

2. **Profile Persistence:**
   - saveProfile() creates new record with tenant_id
   - saveProfile() updates existing record
   - getProfile() respects soft delete (deleted_at IS NULL)

3. **Multi-Tenancy:**
   - Two different tenants can have different profiles
   - getProfile() only returns current tenant's record

4. **Publish Ready:**
   - isPublishReady() returns true at >= 80%
   - isPublishReady() returns false at < 80%

### 3.2 Backend Integration Tests

**File:** `backend/src/test/java/com/freightclub/modules/shipper/ShipperControllerTest.java`

Tests:
1. **POST /api/v1/profile/company-info:**
   - Valid request → 201 with ShipperProfileResponse
   - Missing required field → 400 with validation error details
   - Invalid email → 400
   - Invalid ZIP code → 400
   - Response includes completeness_pct

2. **GET /api/v1/profile:**
   - Existing profile → 200 with data
   - Non-existent profile → 200 with null/default values

### 3.3 Load Publish Gate Test

**File:** `backend/src/test/java/com/freightclub/service/LoadServiceTest.java` (add test)

Test:
```java
@Test
void publishLoad_blockedWhenProfileIncomplete() {
  // Given: shipper with 60% complete profile
  // When: publishLoad() called
  // Then: throws ProfileIncompleteException with message "currently 60% complete"
}
```

### 3.4 Frontend Unit Tests

**File:** `frontend/src/features/shipper/components/ShipperProfileForm.test.tsx`

Tests:
1. **Form Rendering:**
   - All 9 fields render correctly
   - Completeness progress bar displays

2. **Zod Validation:**
   - Valid data passes validation
   - Missing required field shows error
   - Invalid email shows error
   - Invalid ZIP code shows error
   - Optional fields can be empty

3. **Form Submission:**
   - Valid data calls mutation
   - Shows "Saving..." state
   - On success: shows toast, clears form

4. **Error Handling:**
   - API 400 error displays message
   - API 500 error shows fallback message

### 3.5 Frontend Integration Tests

**File:** `frontend/src/pages/ProfilePage.test.tsx`

Tests:
1. Page loads profile data via hook
2. Displays completeness %
3. Form submission updates profile

### 3.6 E2E Test (Playwright)

**File:** `frontend/e2e/profile-setup.spec.ts`

Golden path test:
1. User logs in (existing auth flow)
2. Dashboard shows profile card with 0% complete
3. Click "Complete Profile" → navigates to `/profile`
4. Fill form with all required fields
5. Submit → profile saves, completeness shows 80%+
6. Navigate to load creation
7. Create draft load and attempt publish → allowed (profile ready)
8. Verify success message

---

## 4. Success Criteria & Verification

| Criterion | Verification |
|-----------|--------------|
| **AC-1: Dashboard Banner** | Dashboard displays profile card; shows % complete; links to `/profile` |
| **AC-2: Profile Form** | Form renders all 9 fields; validates formats; saves with 201/200; calculates % |
| **AC-3: Publish Gate** | LoadService checks `isPublishReady()`; blocks < 80% with error message + link |
| **AC-4: Completeness Calc** | Calculation matches table: 20% name, 20% email, 15% phone, 25% address, 15% MC/USDOT, 5% logo |
| **AC-5: Multi-Tenancy** | Two tenants have isolated profiles; tenant_id enforced in all queries |
| **Test Coverage** | Backend: ≥ 80% JaCoCo branch coverage; Frontend: unit + integration + E2E passing |
| **No New Patterns** | Form uses same React Hook Form + Zod pattern as LoadForm; dashboard card matches existing cards |

---

## 5. Implementation Order (TDD Red-Green-Refactor)

1. **Backend Service Tests** → Red tests for completeness calc, profile CRUD
2. **ShipperProfileService Implementation** → Green tests
3. **Repository & Entity** → Integration tests for DB queries
4. **Controller Endpoints** → HTTP tests (201, 200, 400 responses)
5. **LoadService Gate Test** → Red test for publish blocking
6. **LoadService Modification** → Green test (inject ShipperProfileService, check isPublishReady)
7. **Frontend Validation Schema & Hook Tests** → Red tests
8. **ShipperProfileForm Component** → Green tests, form rendering + submission
9. **ProfilePage** → Integration tests
10. **Dashboard Banner** → Add to dashboard, E2E test for full flow

---

## 6. Dependencies & Blockers

✅ No blockers:
- Database migration already applied
- Entity, Service, Repository, Controller scaffolding exists
- React Hook Form + Zod already installed
- Vite proxy configured for `/api/v1`

---

## 7. Notes & Constraints

- **No Lombok:** Use standard Java records/POJOs with manual getters/setters (already enforced in codebase)
- **Soft Delete:** All queries filter `deleted_at IS NULL`
- **Tenant Isolation:** All operations respect `TenantContextHolder.getTenantId()`
- **KISS Principle:** No generic form abstraction; reuse React Hook Form + Zod pattern as-is
- **No Hardcoded URLs:** Proxy all API calls via relative paths (`/api/v1/...`)
- **HTTP-only Cookies:** Auth tokens already managed; profile service assumes user is authenticated
