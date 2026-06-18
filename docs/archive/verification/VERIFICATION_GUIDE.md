# Shipper Load Visibility Fix - Verification Guide

## Problem
Loads created by shippers were not appearing on the ShipperDashboard, even though:
- The load was successfully created in the database
- The status count showed "1 OPEN load"
- But the load table displayed "No loads yet"

## Root Cause
React Query cache keys were mismatched:
- Load mutation hooks invalidated: `['loads']`, `['loads', id]`
- ShipperDashboard queries use: `['shipper-loads-stats', view]`, `['shipper-loads', page, view, sort, order, search]`
- Result: Dashboard's cache never refreshed after load creation

## Solution Implemented
Fixed cache invalidation in 5 files:

### 1. **useCreateLoad.ts** ✅
- Now invalidates: `['shipper-loads-stats']` and `['shipper-loads']`

### 2. **useCreateDraft.ts** ✅
- Now invalidates: `['shipper-loads-stats']` and `['shipper-loads']`

### 3. **usePublishLoad.ts** ✅
- Now invalidates: `['shipper-loads-stats']` and `['shipper-loads']`

### 4. **useUpdateLoad.ts** ✅
- Now invalidates: `['shipper-loads-stats']` and `['shipper-loads']`

### 5. **queryInvalidation.ts** ✅
- `onCancel()` now invalidates: `['shipper-loads-stats']` and `['shipper-loads']`

### 6. **useCancelLoad.ts** ✅
- Updated to match new `onCancel()` signature (removed unused `loadId` parameter)

## Build Status
✅ **Frontend builds successfully**
```
✓ built in 2.35s
```

## Testing Instructions

### Option A: Local Development (Recommended)

```bash
# Terminal 1: Start backend
cd backend
mvn spring-boot:run

# Terminal 2: Start frontend
cd frontend
npm run dev
# Frontend will be at http://localhost:9090

# Terminal 3: Run Puppeteer test
node verify-shipper-load-fix.js
```

### Option B: Against Production

```bash
BASE_URL=https://freightclub-frontend-url.run.app \
SHIPPER_EMAIL=your-shipper@email.com \
SHIPPER_PASSWORD=your-password \
node verify-shipper-load-fix.js
```

### Manual Testing (No Puppeteer)

1. **Login** as a shipper
2. **Navigate** to `/dashboard/shipper`
3. **Note the current load counts** (e.g., "OPEN: 0")
4. **Click "+ Post a Load"**
5. **Fill form** and **submit**
   - Origin: Chicago, IL
   - Destination: New York, NY
   - Weight: 10,000 lbs
   - Rate: $2,500
6. **Expected Result**: Dashboard appears immediately showing the load in the table
   - Status counts update (OPEN: 1)
   - Load appears in the list
   - **NO manual page refresh needed**

## Success Criteria

✅ **Test Passes If:**
- Load appears in dashboard table immediately after creation
- Status counts update without page refresh
- Load can be edited/cancelled from dashboard
- No console errors related to cache

❌ **Test Fails If:**
- Load doesn't appear until after manual page refresh
- Status count shows "1" but table is empty
- Console shows "Cannot read property of undefined"

## Deployment

1. **Build frontend** with fixes:
   ```bash
   cd frontend && npm run build
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy freightclub-frontend \
     --image gcr.io/PROJECT/freightclub-frontend:latest \
     --set-env-vars "BACKEND_URL=https://freightclub-backend-...,BACKEND_HOST=freightclub-backend-..." \
     --region us-central1
   ```

3. **Smoke test**: Create a load and verify it appears immediately

## What Changed vs What Didn't

### Changed (Fixes Applied)
- ✅ `useCreateLoad.ts` - cache keys
- ✅ `useCreateDraft.ts` - cache keys  
- ✅ `usePublishLoad.ts` - cache keys
- ✅ `useUpdateLoad.ts` - cache keys
- ✅ `queryInvalidation.ts` - cache keys
- ✅ `useCancelLoad.ts` - function signature

### NOT Changed (Preserved)
- ✅ `loadsApi.ts` - reverted to keep backward compatibility with `LoadsListPage`
- ✅ Backend endpoints - no changes needed (`/shipper/loads` and `/shipper/loads/stats` are correct)
- ✅ `ShipperDashboard` component - works correctly with new hooks

## Timeline

- **Fixed**: 2026-05-21
- **Built**: 2026-05-21
- **Ready for Deployment**: 2026-05-21
- **Verified**: Awaiting visual verification via Puppeteer or manual test

---

**Next Step**: Run one of the testing methods above and report the results.
