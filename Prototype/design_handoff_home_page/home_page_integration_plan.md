# Integration Plan: FreightClub Home Page & Login Modal

This plan details the implementation strategy to integrate the high-fidelity FreightClub Home Page and in-page Login Modal (from `Prototype/design_handoff_home_page/`) into the React codebase.

---

## 🎯 Goal
Replace the current `/` route landing page ([TruckerLandingPage](file:///C:/projects/freightclub/frontend/src/pages/TruckerLandingPage.tsx)) with a modern, high-fidelity marketing landing page. This page will feature a sticky responsive header, product highlights, how-it-works workflow, comparison tables, and an overlay-based in-page login modal that interfaces directly with the existing authentication backend.

---

## 🏗️ Architecture & Component Mapping

### 1. File Structure & Placement
We will introduce the new page and modal components in standard feature-sliced locations:
- **Home Page Component:** Create `src/pages/HomePage.tsx`.
- **Login Modal Component:** Create `src/features/auth/components/LoginModal.tsx` to keep auth-specific UI encapsulated.
- **Trucker Landing Page Migration:** Relocate the existing [TruckerLandingPage.tsx](file:///C:/projects/freightclub/frontend/src/pages/TruckerLandingPage.tsx) (containing the CPM Calculator, Load Analyzer, and Comms builder tools) to `/carrier/tools` or `/dashboard/trucker/tools` so active carrier users do not lose access to these interactive utilities.
- **Assets Migration:** Copy prototype assets to the public folder:
  - `Prototype/design_handoff_home_page/assets/logo-full.png` ➔ `/public/assets/logo-full.png`
  - `Prototype/design_handoff_home_page/assets/logo-mobile.png` ➔ `/public/assets/logo-mobile.png`
  - `Prototype/design_handoff_home_page/assets/hero-truck.png` ➔ `/public/assets/hero-truck.png`

### 2. State & Auth Wiring
The in-page login modal will utilize the existing Zustand state and React Query hooks to perform authentication:
- **Auth Trigger:** Clicking "Log in" or "Get Started Free" in the header or hero CTAs will set a local state `loginOpen` to `true`.
- **Backend API Hook:** Wire the form to [useLogin.ts](file:///C:/projects/freightclub/frontend/src/features/auth/hooks/useLogin.ts), which internally calls `/api/v1/auth/login` and triggers the Zustand `setAuth()` reducer.
- **Loading State:** Bind the button's loading state to the `isPending` status of the `useLogin` mutation.
- **Automatic Redirects:** On success, `useLogin` already handles redirection:
  - `SHIPPER` role ➔ `/dashboard/shipper`
  - `TRUCKER` role ➔ `/dashboard/trucker`

---

## 🎨 Styling & Design Tokens

To ensure compliance with the **Shipper & Administrator Style Guide** and the design token system:
- **Tailwind Tokens:** Convert inline styling from the prototype HTML into standard Tailwind utility classes:
  - Background: `bg-[#EFEBE0]` (Page body) and `bg-white` (Cards/Header)
  - Bronze accents: `text-[#8C6D3F] hover:text-[#6B5230]` and the gradient background classes matching the Brand Bronze scheme (`#C9A46A` ➔ `#B08D57` ➔ `#8C6D3F`)
  - Typography: Apply display fonts (`font-display` / Sora / Barlow Condensed) for headers, and body fonts (`font-body` / Inter / Roboto) for copy
- **Component Reuse:** Instead of copy-pasting raw HTML buttons, inputs, and badges:
  - Import the primitive `Button` and `Card` components from the design system library.
  - Render the shared `ProfitabilityBadge` inside the hero glassmorphism card to maintain component consistency.

---

## 📋 Step-by-Step Integration Tasks

### Phase 1: Assets & Routing Setup
- [ ] Copy logo and hero-truck image assets to the `/public/assets/` directory.
- [ ] Update [App.tsx](file:///C:/projects/freightclub/frontend/src/App.tsx):
  - Register `/` to render the new `HomePage` component.
  - Relocate the old `TruckerLandingPage` component to a new route at `/carrier/tools`.

### Phase 2: Create the LoginModal Component (`src/features/auth/components/LoginModal.tsx`)
- [ ] Implement the overlay modal backdrop using tailwind animation and absolute positioning.
- [ ] Close triggers: Close modal when clicking the close button (`X`) or clicking the backdrop (with click-propagation stopped inside the modal content).
- [ ] Form layout: Render email and password fields utilizing codebase input primitives.
- [ ] Auth integration: Wire inputs to a Zod schema validation form and connect submission to the `useLogin` hook. Show any validation or API errors in a `role="alert"` component.

### Phase 3: Create the HomePage Component (`src/pages/HomePage.tsx`)
- [ ] **Sticky Header:** Implement with logo, links (`Product`, `How It Works`, `Pricing`), and "Log In"/"Get Started Free" buttons. Add a window resize listener (or CSS media query breakpoint) to toggle between desktop and mobile menu formats at `720px`.
- [ ] **Hero Section:** Headline, subtitle, and primary call-to-actions. Render the truck image adjacent to a floating glass card container displaying three mock `ProfitabilityBadge` elements.
- [ ] **Feature Cards Section:** 3-column layout highlighting RPM badges, Cost Profile Engine, and Earnings Insights.
- [ ] **How It Works Section:** 3-step numbered sequence layout.
- [ ] **Comparison Table:** Implement the FreightClub vs. competitors grid, styled to allow horizontal overflow scrolling on mobile widths.
- [ ] **Footer:** Links grid, copyright info, and full logo placement.

### Phase 4: Quality Assurance & Verification
- [ ] Run backend tests inside the container (`docker compose -f docker-compose.test.yml run --rm backend-tester`) to confirm no API compilation breakages.
- [ ] Create a new E2E verification test file: `frontend/e2e/home-page-login.spec.ts`.
- [ ] Test checklist:
  - Confirm the page renders correctly with correct typography and color tokens.
  - Assert that clicking "Log In" triggers the modal backdrop overlay.
  - Verify that invalid login submissions trigger visual form errors.
  - Assert that submitting valid credentials sets the loading spinner and successfully redirects the user to the correct landing dashboard depending on their role.
