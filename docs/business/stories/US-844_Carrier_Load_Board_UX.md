# US-844: Carrier Load Board UX (equipment filter, board lock, post-action nav)

**Story ID:** US-844
**Jira:** FREIG-75
**Phase:** v0.1.0 Design System Integration (Phase 5)
**Status:** TO DO
**Scope:** FRONTEND
**Effort:** 1.5 days
**Priority:** P1

---

## User Story

**As a** Carrier / Owner-Operator
**I want** the load board to automatically filter to my equipment, lock when I have an active load, and return me to the dashboard after each action
**So that** I can focus on my current job without navigating back manually or seeing irrelevant loads

---

## Acceptance Criteria

### AC-1: Equipment filter removed, auto-applied (Playbook 5A)
```gherkin
Given the load board currently shows an equipment type <select> dropdown
When this phase is complete
Then the equipment type filter UI is removed from LoadBoardTab
  And equipmentType is automatically sourced from user.equipmentType profile field
  And the API query still receives equipmentType — only the UI control is removed
  And a read-only equipment badge displays: "YOUR EQUIPMENT · [type] · Loads matched to your rig"
  And the load count label reads "X LOADS MATCHING YOUR RIG" (10px uppercase #636E72)
  And useLoadBoard, useAvailableStates, and other hooks are unchanged
```

### AC-2: Board lock when active load exists (Playbook 5B)
```gherkin
Given an OO has an active load (useMyActiveLoad returns a non-null load)
When they view the load board tab
Then the load list is replaced by a lock banner: bronze-tinted bg, #C9A876 border, 🔒 "Load board locked" message
  And the active load card above the tabs continues to display normally
  And all existing active load action buttons are unchanged
  And useMyActiveLoad hook is unchanged
```

### AC-3: Post-mutation navigation (Playbook 5C)
```gherkin
Given an OO completes a load lifecycle action (claim, pickup, delivery)
When the mutation succeeds
Then after CLAIM: navigate to /dashboard/trucker, reset active tab to 'board'
  And after MARK PICKED UP: navigate to /dashboard/trucker, active tab 'board'
  And after MARK DELIVERED: navigate to POD upload screen (existing flow), then to /dashboard/trucker
  And mutation functions, confirmation dialogs, and query invalidation are unchanged
```

---

## Source of Truth

- `Prototype/ui_kits/carrier/index.html`
- Target files: `frontend/src/pages/TruckerDashboard.tsx`, `frontend/src/features/loads/components/LoadBoardTab.tsx`

---

## Playwright Verification

Spec: `frontend/e2e/design-system/US-844-carrier-load-board.spec.ts`

- Register as TRUCKER, set viewport 375px
- AC-1: no equipment `<select>` in DOM; equipment badge visible
- AC-2: seed active load → board shows lock banner, not load list
- AC-3: claim load → URL = `/dashboard/trucker`, tab = board
- Adversarial: carrier page at 320px — no horizontal scroll, lock banner still readable
- Adversarial: null equipmentType — badge shows graceful fallback, no crash

---

## BA Sign-Off

- [x] Story ID: US-844
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/ui_kits/carrier/index.html
- [x] Scope: FRONTEND — no hook/mutation logic changes
- [x] Depends on US-842

**BA Status:** ✅ READY FOR IMPLEMENTATION
