# US-714: Trucker Onboarding Checklist — Design Spec

**Author:** Human Factors Designer  
**Phase:** Phase 7 (Carrier & User Management)  
**Constraint:** Gate load claiming; mobile-first; clear progress motivation  
**Persona:** Trucker (newly registered) — complete 4 steps before claiming loads

---

## Purpose
Trucker Onboarding Checklist is a **progress-driven onboarding flow** that guides newly registered truckers through 4 essential setup steps (equipment, lanes, availability, phone confirmation) before they're permitted to claim loads. It uses visual progress tracking and persistent state to maintain momentum across sessions.

---

## 1. Information Architecture

### View: Onboarding Banner (Load Board)
**Shown on:** Load Board (`/dashboard/trucker/loads`), when trucker status = `ONBOARDING`
**Purpose:** Persistent, non-dismissible call-to-action; reminds truckers of remaining steps before claiming becomes available

#### Layout
- **Type:** Alert banner (top of board, above filters, high contrast)
- **Background:** warning-subtle (#FEF3C7) or primary-50 (#EFF6FF)
- **Border:** Left edge accent (warning or primary color)
- **Content:**
  - **Headline:** "Finish your setup to start claiming loads"
  - **Subtext:** "X of 4 steps complete"
  - **Step indicators:** Pill-style badges (4 total, X filled in green, rest in gray)
    - 🔧 Equipment
    - 🗺 Lanes
    - ⏰ Availability
    - ☎️ Phone
  - **CTA button:** "Continue Setup" (primary, kinetic-blue, `md` size)
  - **Visual progress:** Quick at-a-glance indicator (e.g., "3/4" in large text)

#### Claim Button Behavior
- **When ONBOARDING:** "Claim Load" button disabled on all load cards
- **Disabled state:** Gray text, opacity 0.5, cursor: not-allowed
- **Hover/Focus:** Tooltip appears: "Complete your onboarding to claim loads. 2 steps remaining."
- **Mobile:** Tooltip triggered by tap, not hover

---

### View: Onboarding Checklist (Modal or Dedicated Page)
**Route:** `/onboarding` (modal overlay) or `/profile/onboarding` (dedicated page)  
**Trigger:** 
- Automatic on first login after registration
- Manual: Click "Continue Setup" banner CTA
- Manual: Click profile menu → "Complete Setup" (if available)

#### Layout: Single-Column Vertical Stack (Mobile-First)

##### Header Section
- **Headline:** "Let's Get You Ready" (friendly, action-oriented)
- **Subtext:** "4 simple steps to start claiming loads"
- **Progress Bar:** Horizontal bar showing 1, 2, 3, or 4 steps completed (green)
- **Step Count:** "Step X of 4" (or "2 of 4 steps complete")

##### Checklist: 4 Required Items (Expandable Cards)

Each item is a clickable card that expands to show:
- Title (bold, gray-900)
- Description (secondary text, gray-600)
- Completion status (✓ or ○)
- Action button (if not complete)

**Item 1: Add Your Equipment**
- **Icon:** 🔧 or truck icon (Lucide: Truck)
- **Title:** "Add Your Equipment"
- **Description:** "Tell us what truck(s) you operate. Choose your primary equipment type."
- **Status:** ○ Incomplete → ✓ Complete (once ≥1 equipment added)
- **Action Button (when incomplete):**
  - Label: "Add Equipment"
  - Routes to: `/profile?tab=equipment` (or dedicated equipment modal)
  - Style: primary, `md` size
- **Status when complete:** Green checkmark + "✓ Added [Dry Van, Flatbed, etc.]"

**Item 2: Set Preferred Lanes**
- **Icon:** 🗺 or map icon (Lucide: MapPin)
- **Title:** "Set Preferred Lanes"
- **Description:** "Mark the regions you prefer to haul loads (e.g., Texas/Oklahoma, California/Nevada)."
- **Status:** ○ Incomplete → ✓ Complete (once ≥1 lane added)
- **Action Button (when incomplete):**
  - Label: "Add Lanes"
  - Routes to: `/profile?tab=lanes`
  - Style: primary, `md` size
- **Status when complete:** Green checkmark + "✓ Added [X] lanes"

**Item 3: Set Your Availability**
- **Icon:** ⏰ or calendar icon (Lucide: Clock)
- **Title:** "Set Your Availability"
- **Description:** "Let shippers know when you're available to pick up loads (e.g., Mon–Fri, 6am–6pm)."
- **Status:** ○ Incomplete → ✓ Complete (once availability configured)
- **Action Button (when incomplete):**
  - Label: "Set Availability"
  - Routes to: `/profile?tab=availability`
  - Style: primary, `md` size
- **Status when complete:** Green checkmark + "✓ Configured"

**Item 4: Confirm Your Phone Number**
- **Icon:** ☎️ or phone icon (Lucide: Phone)
- **Title:** "Confirm Your Phone Number"
- **Description:** "Shippers will call this number to confirm pickup details. [Currently: (512) 555-0182] (if already populated)"
- **Status:** ○ Incomplete → ✓ Complete (automatic if phone from registration is present; can be re-confirmed)
- **Action Button (when incomplete or to change):**
  - Label: "Confirm / Update Phone"
  - Inline form (small modal): Phone number field + Save button
  - Routes to: `/profile?tab=contact` or inline edit
  - Style: primary, `md` size
- **Status when complete:** Green checkmark + "✓ Confirmed: (512) 555-0182"

---

### View: Onboarding Complete (Success State)
**Trigger:** All 4 steps completed

#### Layout
- **Headline:** "You're All Set! 🎉"
- **Subtext:** "Your account is now active. You can start claiming loads immediately."
- **Visual:** All 4 items with green checkmarks
- **Button:** "Start Browsing Loads" (large, primary, `lg` size, kinetic-blue)
  - Routes to: `/dashboard/trucker/loads` (load board)
  - On click: Dismiss modal; show success toast: "Welcome! Start claiming loads."
  - Claim button now enabled on load board

---

## 2. Progressive Disclosure & Navigation

### Tab-Based Workflow (Alternative to Modal)
If implemented as a dedicated page `/profile/onboarding`:
- **Breadcrumb:** Home > Profile > Onboarding
- **Step indicator:** Horizontal tabs (Equipment | Lanes | Availability | Phone)
- **Navigation:**
  - Next/Back buttons bottom of page
  - Disabled Previous on step 1; disabled Next on step 4 (replaced with "Complete")
  - Tab clicking allowed; can jump between steps

### Modal Workflow (Preferred for Mobile)
- **Modal:** Full-screen on mobile; 80% viewport on desktop
- **Navigation:**
  - Close button (top-right × icon)
  - Clicking an incomplete step navigates to that feature and returns (with auto-update to checklist)
  - "Continue Later" link (bottom-left): Dismisses modal; checklist state persists in DB
  - "Complete" button (bottom-right): Only appears when all 4 steps done; transitions to success state

---

## 3. State Management & Persistence

### Checklist State
**Stored in database table `trucker_onboarding_checklist`:**
- `trucker_id` (FK to user.id)
- `equipment_added` BOOLEAN (true if ≥1 equipment via US-701)
- `lane_added` BOOLEAN (true if ≥1 lane via US-701)
- `availability_set` BOOLEAN (true if availability configured via US-701)
- `phone_confirmed` BOOLEAN (true if phone exists and confirmed)
- `completed_at` TIMESTAMPTZ (NULL until all 4 steps done)
- `created_at`, `updated_at` TIMESTAMPTZ

### Reactive Updates
- **On modal open:** Fetch current state; check each condition
- **On step complete:** 
  - User saves equipment/lane/availability in their respective forms
  - Return to onboarding checklist (or modal refocuses)
  - Checklist auto-updates (no page refresh)
  - Toast: "✓ Step complete" (green)
  - Progress bar animates to new step count
- **On all steps complete:**
  - Auto-transition to success view (no additional click)
  - Toast: "Welcome! You're active. Start claiming loads."
  - User's `trucker_status` = `ACTIVE` (set server-side)
  - Load board's Claim button automatically enabled (no page reload if WebSocket; or refetch on next board view)

---

## 4. High-Contrast & Mobile-First Design

### Color Assignments
- **Incomplete step:** Gray (mid-grey, #334155) circle or outline
- **Complete step:** Green circle (success, #22C55E) with checkmark
- **Step count progress:** Gradient from warning (amber) to success (green) as steps increase
- **Action buttons:** kinetic-blue (#2563EB)
- **Banner background (on board):** warning-subtle (#FEF3C7)
- **Success headline:** Green accent text (success color)

### Typography
- **Modal headline:** 24px SORA bold (mobile), 28px (desktop)
- **Step title:** 16px SORA bold
- **Step description:** 14px INTER regular, gray-600
- **Step count:** 18px SORA bold (large progress indicator)
- **Button label:** 14px INTER bold

### Touch Targets
- All action buttons: **44px height minimum** (`lg` size)
- Clickable step cards: **56px height minimum** (full card clickable)
- Close button (modal): 40×40px minimum

---

## 5. ARIA & Accessibility

### Screen Reader Announcements
- **Onboarding banner (on board):** `role="alert" aria-live="polite"` — announce status on load ("2 of 4 steps complete; continue setup to claim loads")
- **Checklist modal:** `role="dialog" aria-label="Onboarding Checklist"` — announce when opened
- **Progress bar:** `role="progressbar" aria-valuenow="2" aria-valuemin="0" aria-valuemax="4" aria-label="2 of 4 steps complete"` — update on step completion
- **Step items:** `role="listitem"` within `role="list"`; `aria-label="Step 1: Add Equipment, not started"` → `aria-label="Step 1: Add Equipment, completed"`
- **Action buttons:** Clear label: "Add Equipment" (not just "Continue")
- **Success state:** `role="status" aria-live="assertive"` — announce completion immediately

### Keyboard Navigation
- **Tab order (modal):** 
  1. Step 1 card (clickable)
  2. Step 1 action button (if incomplete)
  3. Step 2 card
  4. Step 2 action button (if incomplete)
  5. ... (steps 3–4)
  6. Close button (or "Complete" button when all done)
- **Enter/Space:** Activate action button or expand step card
- **Escape:** Close modal (saves state; returns to previous page)

---

## 6. State-Aware Design

| Trucker Status | Display | Claim Button | Modal Behavior |
|---|---|---|---|
| **ONBOARDING** (0/4) | Full banner + checklist modal on login | ❌ Disabled + tooltip | Shown automatically on first login; can be dismissed and reopened |
| **ONBOARDING** (1–3/4) | Banner visible; progress updates | ❌ Disabled + updated tooltip | Checklist reflects current progress; shows "X of 4 steps" |
| **ONBOARDING** (4/4 complete) | Banner replaced with success message; auto-dismissed | ✅ Enabled | Modal transitions to success state; "You're All Set!" message shows |
| **ACTIVE** (completed) | No banner; no modal | ✅ Enabled | Not shown; accessible via profile menu if user wants to review |

---

## 7. Integration with Load Board Claim Action

### Pre-Claim Server-Side Gate
**When trucker attempts to claim a load:**
1. Backend: Check `users.trucker_status` from token
2. If `ONBOARDING`:
   - Return 403 with error: `"Onboarding not complete. Complete the 4 setup steps before claiming loads."`
   - Include checklist state in response: `{ equipmentAdded: false, laneAdded: true, ... }`
3. If `ACTIVE`:
   - Proceed with claim logic

**Frontend (Load Board):**
- Claim button disabled if `status = ONBOARDING`
- Tooltip on disabled button: "Complete your onboarding to claim loads. X steps remaining."
- Auto-enable claim button when onboarding modal completes (via WebSocket subscription or refetch on board reload)

---

## 8. Error & Success Feedback

### Success States
- **Step completed:** Toast (green, success color) — "✓ [Step name] complete"
- **Progress updates:** Inline checkmark appears; progress bar animates
- **All steps complete:** Toast (green, larger) — "Welcome! You're active. Start claiming loads now."
- **Return from step:** Auto-update checklist without reloading

### Error States
- **Network error on state fetch:** Banner (red, error color) — "Unable to load onboarding status. Refresh the page."
- **Step navigation error:** Toast (red) — "Unable to save [step name]. Try again."

---

## 9. Insurance-Unverified Badge (US-721 Integration)

**Scope:** Optional in Phase 7 (first-pass); becomes visible in Phase 7A when insurance upload (US-721) is implemented.

- If trucker status = `ACTIVE` but `insurance_uploaded = false`:
  - Show amber badge on their public profile (visible to shippers)
  - Headline: "Insurance Unverified"
  - This badge is **informational only**; it does NOT block load claiming
  - Insurance upload becomes gated in Phase 7A for compliance

---

## 10. CODER Hand-off Checklist

- [ ] Onboarding banner displays on load board when trucker status = `ONBOARDING`
- [ ] Banner shows "X of 4 steps complete" with visual progress indicator
- [ ] Claim button disabled when status = `ONBOARDING`; shows tooltip on hover/focus
- [ ] Claim button enabled when status = `ACTIVE` (reactive; no page reload if WebSocket; or on next board load)
- [ ] Onboarding modal opens automatically on first login post-registration
- [ ] Modal can be dismissed ("Continue Later" button) and reopened via banner CTA
- [ ] All 4 checklist items render with icons, titles, descriptions, and action buttons
- [ ] Clicking action button routes to relevant `/profile` tab (equipment, lanes, availability, contact)
- [ ] Returning from `/profile` tab: Checklist state auto-updates (refetch from backend)
- [ ] Progress bar updates reactively as steps are marked complete
- [ ] When all 4 steps complete: Modal transitions to success state ("You're All Set!") + shows "Start Browsing Loads" button
- [ ] Success button routes to load board with Claim button now enabled
- [ ] Checklist state persisted in `trucker_onboarding_checklist` table
- [ ] POST `/api/v1/onboarding/mark-complete` when final step done; sets `trucker_status = 'ACTIVE'`
- [ ] GET `/api/v1/onboarding/status` returns checklist state and overall status
- [ ] Server-side claim gate: Check `trucker_status` before allowing claim; return 403 if `ONBOARDING`
- [ ] All buttons: `lg` or `md` size variant (44px+ height)
- [ ] All step cards: ≥56px clickable height
- [ ] ARIA labels on progress bar, modal, step items, action buttons
- [ ] Keyboard navigation: Tab order, Enter/Space activation, Escape closes modal
- [ ] Responsive: Modal full-screen on mobile; 80vw on desktop
- [ ] Toast notifications for step completion, success, and errors
- [ ] Icons from Lucide React: Truck (equipment), MapPin (lanes), Clock (availability), Phone (phone)

---

## 11. Responsive Breakpoint Behavior

| Breakpoint | Modal | Step Cards | Buttons | Progress Bar |
|---|---|---|---|---|
| **sm** | Full-screen overlay | Full-width stack | Full-width (44px height) | Horizontal bar top of modal |
| **md** | Full-screen or 90vw | Full-width stack | Full-width (44px height) | Same as sm |
| **lg** | 80vw centered (max 600px wide) | Full-width stack | Side-by-side if 2 buttons (Next/Back) | Same as sm |

