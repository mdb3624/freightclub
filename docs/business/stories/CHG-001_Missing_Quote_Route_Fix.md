# CHG-001: Missing `/shipper/quote` Route

**Story ID:** CHG-001  
**Status:** READY_FOR_DESIGN  
**Phase:** Cross-cutting (Quick-win blocker for US-824)  
**Scope:** BACKEND (Route registration + stub component)  
**Effort:** 1 hour  
**Priority:** P0 (Blocks US-824)

---

## User Story

**As a** Shipper  
**I want to** click "Get A Quote" button without hitting 404  
**So that** the dashboard quick action flow works end-to-end

---

## Acceptance Criteria

### AC-1: Route Exists and Renders
```gherkin
Given the application is running
When a user navigates to `/shipper/quote`
Then the route is registered in App.tsx
And the page loads without 404 error
And the QuoteRequestPage component renders
And the AppShell wrapper is visible (header, navigation)
```

### AC-2: Button Navigation Works
```gherkin
Given the Shipper Dashboard is loaded
When a user clicks the "Get A Quote" button
Then the browser navigates to `/shipper/quote`
And the page loads without console errors
And the route is protected for SHIPPER role (ProtectedRoute wrapper)
```

### AC-3: Stub Component Meets MVP
```gherkin
Given the QuoteRequestPage is rendered at `/shipper/quote`
Then the page displays:
  - A page heading: "Get A Quote"
  - A placeholder message: "Quote request feature coming soon"
  - The AppShell header is visible
  - Navigation back to dashboard is available
And the component structure supports lazy loading (Suspense compatible)
```

---

## Routes Required

| Route | Status | Notes |
|-------|--------|-------|
| `/shipper/quote` | ❌ MISSING | Must be added to App.tsx with ProtectedRoute role="SHIPPER" |

---

## Dependencies

- **Depends on:** Nothing (no upstream blockers)
- **Blocks:** US-824 (Quick Actions Panel — "Get A Quote" button navigation)
- **Related:** CHG-003 (separate structural layout issue for Action Zone)

---

## Definition of Ready (BA Input Acceptance Gates)

- [x] Story follows INVEST standard (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- [x] AC written in Gherkin format (Given/When/Then)
- [x] No technical implementation details (ARCHITECT/CODER responsibility)
- [x] Routes table filled; no database schema requirements
- [x] Scope is clear and achievable in 1 hour
- [x] No ambiguous or conflicting AC
- [x] No circular dependencies with other stories
- [x] Stakeholder agreement (LIBRARIAN approved)

---

---

## ARCHITECT TECHNICAL DESIGN (CHG-001)

### Design Acceptance

✅ **BA AC validated as immutable.** All acceptance criteria are achievable, unambiguous, and implementable. No design conflicts.

### Route Registration Pattern

**Decision:** Standard React Router pattern with lazy loading

**Implementation:**
```jsx
// In App.tsx
const QuoteRequestPage = lazy(() => import('src/features/shipper/pages/QuoteRequestPage'));

{
  path: '/shipper/quote',
  element: (
    <ProtectedRoute role="SHIPPER">
      <Suspense fallback={<PageLoader />}>
        <QuoteRequestPage />
      </Suspense>
    </ProtectedRoute>
  )
}
```

**Rationale:**
- Uses existing `ProtectedRoute` wrapper for SHIPPER role enforcement (AC-2)
- Lazy loading via `lazy()` + `Suspense` for code-splitting (AC-3 component structure supports lazy loading)
- `PageLoader` shown during load (standard pattern per existing shipper pages)
- Route placed before catch-all route (`*`) in App.tsx

### Component Structure

**Location:** `src/features/shipper/pages/QuoteRequestPage.tsx`

**Structure:**
```jsx
export const QuoteRequestPage: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Get A Quote</h1>
      <p className="text-gray-600">Quote request feature coming soon</p>
    </div>
  );
};
```

**Design Rationale:**
- Wrapped in AppShell automatically by parent `<ShipperDashboardPage>` or standard page layout pattern
- Minimal stub implementation satisfies AC-3 (heading + message visible)
- Uses standard Tailwind classes for consistency (no custom styling needed for stub)
- No form fields (stub only; full implementation deferred to future story)
- Component structure supports Suspense lazy loading (React.FC, no special dependencies)

### Why This Design

| Design Choice | Rationale |
|---|---|
| Lazy loading | Standard for all shipper pages; code-splitting best practice |
| ProtectedRoute wrapper | Enforces SHIPPER role; consistent with existing routes |
| Suspense + PageLoader | AC-2 compliance; matches shipper page UX pattern |
| Minimal stub | AC-3 satisfied; avoids over-engineering a placeholder |
| No form fields | TBD in future story; reduces scope for this quick-win blocker |

### No Architectural Conflicts

- ✅ Route registration: standard React Router pattern (used throughout App.tsx)
- ✅ Component lazy loading: matches existing shipper pages
- ✅ Role protection: existing ProtectedRoute mechanism
- ✅ No new dependencies: uses React, React Router (existing)
- ✅ No database/schema changes: UI-only route

---

## Governance Reference

**Process:** Full SDLC workflow per `docs/standards/SDLC_GOVERNANCE_ALL_ROLES.md`

**Next Role:** HFD (validates UI/accessibility), then CODER (implements)

---

---

## HFD DESIGN SPECIFICATION (CHG-001)

### Design Acceptance

✅ **ARCHITECT design validated.** Route pattern and component structure are sound. UI implementation is straightforward.

### Panel Heading Style

Match existing dashboard pattern (Shipment Status, Quick Actions, Messages & Alerts):
- **Element:** `<h1>` (page-level heading)
- **Classes:** `text-3xl font-bold`
- **Spacing:** Standard page padding (32px sides, 24px top)
- **Color:** Dark Charcoal (`#1A1A1A`) per Style Guide §2
- **Rationale:** Stub page is minimal; heading must be clear and scannable on mobile

### Placeholder Message Styling

- **Element:** Paragraph text
- **Classes:** `text-gray-600` (Secondary grey per Style Guide)
- **Font Size:** 16px (matches body text minimum per §2)
- **Spacing:** 16px gap below heading (`mb-4`)
- **Rationale:** Neutral tone for "coming soon" messaging; readable at all sizes

### Accessibility (WCAG AA Compliance)

- ✅ Heading hierarchy: h1 (page title), no h2/h3 skip
- ✅ Color contrast: Dark Charcoal on white ≥ 16:1 (exceeds 4.5:1 WCAG AA minimum)
- ✅ Font size: 16px minimum (meets Style Guide §2 + WCAG readability requirement)
- ✅ Focus states: Standard link/button focus outline visible (inherited from AppShell)
- ✅ Semantic HTML: Proper heading hierarchy, no ARIA overrides needed

### Mobile Responsiveness

- **Desktop (≥1024px):** Standard page padding (32px sides)
- **Mobile (<1024px):** Reduced padding (16px sides) to preserve reading width
- **Touch targets:** Not applicable (stub page, no interactive elements except navigation back)

### No Design Conflicts

- ✅ Heading matches dashboard typography standards
- ✅ Color palette matches Style Guide §1 (Dark Charcoal on white)
- ✅ Spacing uses 8px multiples (16px/24px/32px per §6.4)
- ✅ WCAG AA accessible (≥4.5:1 contrast, readable font sizes)

---

## Sign-Off

**BA:** Mike Barnes | **Date:** 2026-06-14 | **Status:** READY_FOR_DESIGN  
**ARCHITECT:** Mike Barnes | **Date:** 2026-06-14 | **Status:** READY_FOR_IMPLEMENTATION  
**HFD:** Mike Barnes | **Date:** 2026-06-14 | **Status:** READY_FOR_CODE  
**CODER:** Mike Barnes | **Date:** 2026-06-14 | **Status:** READY_FOR_REVIEW  
**REVIEWER:** Mike Barnes | **Date:** 2026-06-14 | **Status:** ✅ APPROVED  
**LIBRARIAN:** Mike Barnes | **Date:** 2026-06-14 | **Status:** ✅ DONE

### HFD Certification

- ✅ Heading style matches existing dashboard panels
- ✅ WCAG AA accessible (color contrast, font size, semantic HTML)
- ✅ Touch targets N/A (no interactive elements on stub)
- ✅ Mobile responsive (adaptive padding for <1024px screens)
- ✅ Ready for CODER implementation

### CODER Completion

- ✅ Route registered in App.tsx (lazy load + ProtectedRoute)
- ✅ Component created: QuoteRequestPlaceholder.tsx
- ✅ Uses AppShell wrapper (HFD spec compliant)
- ✅ Heading h1/text-3xl/bold
- ✅ Message "Quote request feature coming soon"
- ✅ TypeScript compilation passed
- ✅ E2E tests written (4 test cases)

### REVIEWER Approval

- ✅ All 4 E2E tests PASSED (9.7s)
- ✅ Visual evidence captured (3 screenshots)
- ✅ Code quality: minimal stub, no over-engineering
- ✅ WCAG AA accessibility compliance verified
- ✅ No Sequential Lock Protocol violations
- ✅ APPROVED FOR MERGE

### LIBRARIAN Closure (2026-06-14 23:50 UTC)

- ✅ Story marked DONE
- ✅ Route `/shipper/quote` live on main branch
- ✅ "Get A Quote" button unblocked
- ✅ US-824 Quick Actions Panel: 1/3 blockers resolved
- ✅ CHG-003 ready to proceed
