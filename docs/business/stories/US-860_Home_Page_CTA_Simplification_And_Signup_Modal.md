# US-860: Home Page CTA Simplification & In-Page Signup Modal

**Story ID:** US-860
**Jira:** FREIG-120
**Phase:** Cross (Public/Pre-Auth Experience)
**Status:** READY_FOR_DESIGN
**Scope:** UI_ONLY (reuses existing `/register` API contract via `useRegister`/`RegisterForm`; no new endpoints, DTOs, or DB columns)
**Priority:** P2

---

## User Story

**As a** prospective Shipper or Carrier visiting the FreightClub home page
**I want** a simpler set of calls-to-action, and the ability to create an account without leaving the page
**So that** I'm not offered dead-end/redundant buttons, and signing up is as frictionless as the existing in-page login

---

## Business Rationale

US-855 shipped the marketing home page with an in-page login modal (AC-2 of that story), but explicitly deferred an in-page signup modal — "Get Started Free" CTAs opened the *login* modal, and the only path to account creation was a full-page navigation to `/register`. Separately, the persona split section (`For Carriers` / `For Shippers`) carries "Find Loads" and "Post a Load" buttons that route an unauthenticated visitor into the same login modal as every other CTA — redundant with the hero/final-CTA buttons and not meaningfully differentiated.

Direct user request: remove the redundant persona CTAs and the header's "Get Started Free" button (the hero and final-CTA buttons already cover that intent), and give the remaining "Get Started Free" CTAs a real in-page signup flow instead of routing to login.

**Platform Foundation Mapping:** Public/Marketing → Visitor decides to create an account → in-page Signup modal (existing `/auth/register` contract, unchanged) → redirected into the authenticated app by role, same as the existing full-page `/register` flow. Same entry point tier as US-855's login modal, now at parity for new users.

---

## Acceptance Criteria

### AC-1: Header no longer offers a "Get Started" CTA
```gherkin
Given a visitor views the home page header at any viewport width
When the header renders
Then no "Get Started Free" (desktop) or "Get Started" (mobile) button is present
  And "Log in" remains available (desktop nav link, mobile menu item)
```

### AC-2: Persona split cards no longer have CTA buttons
```gherkin
Given a visitor scrolls to the "For Carriers" / "For Shippers" persona section
When the section renders
Then neither the "Find Loads" nor the "Post a Load" button is present
  And the persona headline/copy content is otherwise unchanged
```

### AC-3: Remaining "Get Started Free" CTAs open a real Signup modal
```gherkin
Given a visitor clicks the hero "Get Started Free" button
  or the final-CTA-section "Get Started Free" button
When the click is handled
Then a modal opens over the current page (no full navigation)
  And the modal contains the existing RegisterForm (role selection, company
    create/join, identity fields, trucker-specific fields, validation)
  And submitting valid data creates the account and redirects by role,
    exactly as the existing full-page /register flow does
```

### AC-4: Signup modal matches the login modal's accessibility bar
```gherkin
Given the Signup modal is open
When a screen-reader or keyboard-only user interacts with it
Then it exposes role="dialog", aria-modal="true", and aria-labelledby
  And pressing Escape closes it
  And focus moves into the modal on open
```
(Same pattern as CHG-858's fix to the Login modal — no new accessibility gap introduced.)

### AC-5: Login and Signup modals switch to each other in place
```gherkin
Given the Login modal is open
When the visitor clicks "Don't have an account? Sign up"
Then the Login modal closes and the Signup modal opens, still on the home page

Given the Signup modal is open
When the visitor clicks "Already have an account? Sign in"
Then the Signup modal closes and the Login modal opens, still on the home page
```
Existing standalone `/register` and `/login`-redirect-to-`/` behavior (used by other entry points, e.g. `ProtectedRoute` redirects) is unchanged — this AC only governs the two modals switching to each other while already open on the home page.

---

## Field Contract Table

Not applicable — no new fields. Reuses `RegisterFormValues` → existing `/auth/register` contract unchanged (same as `RegisterPage.tsx` uses today).

---

## Out of Scope (explicitly deferred)

- Any change to the `/auth/register` or `/auth/login` API contracts.
- Deleting the standalone `/register` page or `RegisterPage.tsx` — it remains for any entry point outside the home page.
- Redesigning the persona split section's layout/copy beyond removing the two buttons.

---

## Gate 1 Sign-Off

- [x] User (Michael) reviewed and approved this scope in chat, 2026-07-22 (including AC-5, added after clarifying what "modals switch to each other" means)
- [x] Status: `READY_FOR_DESIGN`
