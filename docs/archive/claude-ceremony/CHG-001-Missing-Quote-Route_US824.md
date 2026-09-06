# CHG-001: Missing Quote Route Dependency

**Original Story:** US-824 (Quick Actions Panel)  
**Discovered By:** Subagent-Driven Development (Verification Task 8)  
**Date:** 2026-06-11  
**Status:** OPEN (Awaiting Architect Decision)

---

## Issue Summary

US-824 implementation is complete and ready for merge, but it has a hard dependency on a route that does not exist in the application.

## Technical Details

**Blocker:** Route `/shipper/quote` is missing from `frontend/src/App.tsx`

**Impact:**
- QuickActionsPanel has a "Get A Quote" button that navigates to `/shipper/quote`
- useQuickActionNavigation hook attempts navigation to this route
- At runtime, clicking the button results in 404 (route not found)
- Cannot merge US-824 until route exists

**Route Status:**
- ✅ `/shipper/loads/new` — exists, verified
- ✅ `/dashboard/shipper/loads` — exists, verified
- ✅ `/settings/preferred-carriers` — exists, verified
- ❌ `/shipper/quote` — MISSING

**Root Cause:** BA story US-824 marked this route as "TBD — BA to verify" (docs/business/stories/US-824_Quick_Actions_Panel.md, line 58). Route was not created before implementation began.

---

## Options

### Option A: Create Route Now (Quickest)
**Action:** Create stub route `/shipper/quote` in App.tsx that renders a placeholder or redirects to a quote-related page (if one exists).

**Effort:** 5 minutes (add route definition)

**Risk:** If the quote page doesn't exist, user gets 404 after button click

**Recommendation:** ✅ If quote functionality is planned, create now; otherwise, remove button from US-824

---

### Option B: Create New Story for Quote Route
**Action:** 
1. Keep US-824 as-is (remove "Get A Quote" button from QuickActionsPanel)
2. Create new story US-827 (or US-825b) for Quote feature
3. Merge US-824 without the button

**Effort:** Design + implementation for quote feature in separate story

**Risk:** Delays US-824 merge; requires new story design/implementation

**Not Recommended:** Quote button is core to dashboard quick access

---

### Option C: Defer Route Creation (Not Recommended)
**Action:** Merge US-824 knowing the button will 404 at runtime

**Effort:** None

**Risk:** 🔴 CRITICAL — Users see broken functionality; blocks PR review gate

**Not Recommended:** Violates code review standards

---

## Recommendation

**Option A: Create Route Now**

**Steps:**
1. ARCHITECT creates stub route in App.tsx:
   ```jsx
   // In App.tsx routes array:
   { path: '/shipper/quote', element: <QuoteRequestPage /> }
   ```
2. If QuoteRequestPage doesn't exist, create placeholder:
   ```jsx
   const QuoteRequestPage = () => (
     <div className="p-8">
       <h1>Get A Quote</h1>
       <p>Quote request feature coming soon</p>
     </div>
   )
   ```
3. Commit route creation
4. Merge US-824

**Timeline:** 10 minutes

---

## Next Steps

**Awaiting:** Architect decision on Option A, B, or C

**If Option A Chosen:**
- ARCHITECT creates `/shipper/quote` route
- Create new commit in US-824 worktree
- Merge US-824
- Mark CHG-001 as RESOLVED

**If Option B Chosen:**
- Modify US-824 to remove "Get A Quote" button
- Create US-827 story for quote feature
- Merge US-824
- Mark CHG-001 as DEFERRED to US-827

**Current Blockers:**
- US-824 cannot merge without route resolution
- US-825 & US-826 can proceed (no route dependencies)

---

**Assigned To:** ARCHITECT  
**Priority:** P1 (Blocker)  
**Linked Stories:** US-824, (US-827 if Option B)
