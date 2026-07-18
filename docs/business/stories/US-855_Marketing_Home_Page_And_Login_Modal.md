# US-855: Marketing Home Page & In-Page Login Modal

**Story ID:** US-855
**Jira:** FREIG-117
**Phase:** Cross (Public/Pre-Auth Experience)
**Status:** DONE — backfilled after implementation, PR #45
**Scope:** FULL_STACK (frontend-only; no backend changes)
**Priority:** P2

---

## ⚠️ Process Note (Backfill)

This story was implemented directly from user request and a pre-existing design handoff (`Prototype/design_handoff_home_page/`), **bypassing the normal BA Gate 1 / HFD design-lock workflow** defined in CLAUDE.md's Sequential Lock Protocol. This document and the Jira ticket (FREIG-117) were created retroactively to satisfy traceability requirements, not before implementation began. No CHG ticket was raised because no prior BA/ARCH/HFD inputs existed to conflict with — this is greenfield backfill, not rework.

---

## User Story

**As a** prospective Shipper or Carrier visiting FreightClub for the first time
**I want** a marketing page that explains the profitability-first value proposition and lets me log in without leaving the page
**So that** I understand what the product does before creating an account, and can sign in frictionlessly from any entry point (not just a dedicated login page)

---

## Business Rationale

Prior to this story, the `/` route rendered `TruckerLandingPage` — an authenticated-feeling tabbed tool dashboard (CPM Calculator, Load Analyzer, Broker Comms) with no explanation of what FreightClub is, who it's for, or why its profitability-first approach differs from a standard load board. There was no public-facing page a prospective user could land on to evaluate the product before signing up.

A high-fidelity design handoff already existed (`Prototype/design_handoff_home_page/FreightClub Home.dc.html` + design tokens + screenshots) specifying the marketing page content, layout, and an in-page login modal (replacing a full-page navigation to `/login`). This story recreates that design in the production React codebase.

**Platform Foundation Mapping:** Public/Marketing → Visitor evaluates the product → Visitor logs in or signs up. This is the entry point for every persona (Shipper and Carrier) before any authenticated flow begins.

---

## Acceptance Criteria

### AC-1: Home page renders the marketing content at `/`
```gherkin
Given a visitor navigates to the root URL
When the page loads
Then they see a sticky header (logo, nav links, Log in, Get Started Free),
  a hero section with headline/subcopy/CTAs and a demo RPM-badge glass card,
  feature cards (RPM Profitability Badge, Trucker Cost Profile Engine,
  30-Day Earnings Insights), a How It Works section, a Carrier/Shipper
  persona split, a comparison table, a final CTA, and a footer
```

### AC-2: Login is an in-page modal, not a page navigation
```gherkin
Given a visitor clicks any "Log in" or "Get Started" call-to-action
When the click is handled
Then a modal opens over the current page (no full navigation)
  And the modal contains the existing email/password LoginForm
  And submitting valid credentials authenticates and redirects by role
    exactly as the prior standalone login page did
```

### AC-3: Carrier tools remain reachable for authenticated Truckers
```gherkin
Given the CPM Calculator / Load Analyzer / Broker Comms tools previously
  lived at the root route
When this story ships
Then those tools are still fully functional, relocated to /carrier/tools
  And the route is protected — only an authenticated TRUCKER can reach it
```

### AC-4: Removing the standalone login route doesn't strand any redirect
```gherkin
Given any code path that used to send a user to /login
  (ProtectedRoute on an unauthenticated/wrong-role access, sign-out,
  a 401-refresh-failure hard redirect, the "already have an account?"
  link on registration)
When that path fires now
Then the user lands on / with the login modal automatically open
  (except the hard 401-redirect, which reloads the page entirely)
  And no route in the app still points at the deleted /login page
```

### AC-5: Sign-out clears session-scoped cache, not just tokens
```gherkin
Given an authenticated user signs out
When the sign-out completes
Then the access token and user record are cleared (as before)
  And the React Query cache is also cleared
  So that a different user logging in afterward on the same device
    never briefly sees the previous user's cached data
```

---

## Field Contract Table

Not applicable — this story is frontend-only with no new API fields, DTOs, or DB columns. It consumes the existing `/auth/login` contract (`LoginFormValues` → `AuthResponse`) unchanged.

---

## Out of Scope (explicitly deferred)

- Any change to the `/auth/login` API contract or backend auth logic.
- A dedicated registration modal (the "Sign up" link still navigates to the full `/register` page).
- The separate `login-app` Vite micro-app's original purpose (a <100ms-hydration standalone login bundle, US-756) — it was deleted as dead code since its target (`/login`) no longer exists, not replaced with an equivalent optimization for the modal.
- Real device/sunlight verification (this is a Shipper-persona-styled public page, not an Owner-Operator mobile page — the OO device-testing gate in CLAUDE.md does not apply).

---

## Implementation Notes (for traceability)

- `frontend/src/pages/HomePage.tsx`, `frontend/src/features/auth/components/LoginModal.tsx` (new)
- `frontend/src/App.tsx` — `/` → `HomePage`; `TruckerLandingPage` moved to lazy-loaded, `ProtectedRoute role="TRUCKER"`-gated `/carrier/tools`
- `frontend/src/components/ProtectedRoute.tsx`, `frontend/src/features/auth/hooks/useLogout.ts`, `frontend/src/features/shipper/components/ShipperPageHeader.tsx`, `frontend/src/lib/apiClient.ts`, `frontend/src/features/auth/components/RegisterForm.tsx` — all `/login` references redirected to `/`
- Deleted: `frontend/src/pages/LoginPage.tsx`, `frontend/src/apps/login-app/**` (and its `vite.config.ts` build entry)
- Tests: `frontend/e2e/home-page.spec.ts` (new), `frontend/e2e/login-integration.spec.ts` + `smoke.spec.ts` (migrated to open the modal instead of `goto('/login')`), `frontend/src/features/auth/hooks/useLogout.test.tsx` (new)
- Verification: `tsc --noEmit` clean, ESLint clean, full unit suite 48 files/290 tests passing, full Docker Pre-Test Protocol run with 22/22 E2E passing, production build + live browser check against `Prototype/design_handoff_home_page/screenshots/*.png`
- PR: [#45](https://github.com/mdb3624/freightclub/pull/45)

---

## Gate 1 Sign-Off

- [x] Implemented and merged-ready per direct user request (backfilled retroactively; see Process Note above)
- [x] Status: `DONE`
