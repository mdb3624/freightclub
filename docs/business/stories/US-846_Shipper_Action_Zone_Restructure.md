# US-846: Shipper Action Zone Restructure

**Story ID:** US-846
**Jira:** FREIG-77
**Phase:** v0.1.0 Design System Integration (Phase 7)
**Status:** TO DO
**Scope:** FRONTEND
**Effort:** 0.5 days
**Priority:** P1

---

## User Story

**As a** Shipper
**I want** the Action Zone right panel to show quick actions by default and load-specific actions when a load is selected
**So that** the most important actions are always one tap away without cluttering the panel with carrier search forms

---

## Acceptance Criteria

### AC-1: Default state (Playbook 7A — no load selected)
```gherkin
Given no load row is selected on the dashboard
When the Action Zone renders
Then it shows: bronze-gradient header bar labeled "⚡ ACTION ZONE" (bg #FAF6EE, border #C9A876, radius 10px)
  And a full-width "Create New Load" bronze CTA button linking to /loads/create
  And a 2-column secondary grid: "Get a Quote", "Find Carriers" (→ /carriers), "My Documents", "Payments"
  And a dashed #C9A876 divider
  And a "PREFERRED CARRIERS" section with name, equipment, on-time rate, × remove, and "Manage →" link to /carriers
  And the carrier search form (dropdowns + search button) is removed from this panel
```

### AC-2: Load selected state (Playbook 7A — load row clicked)
```gherkin
Given a load row is clicked on the dashboard
When the Action Zone updates
Then the header title changes to "LOAD #XXXX"
  And a load summary card shows: route, StatusBadge, transit progress bar, equipment type
  And a "Find Carriers for This Load →" secondary button links to /carriers?origin=X&dest=Y&equip=Z
  And preferred carriers list shows with "Assign" buttons
  And existing routing, navigation, and Preferred Carriers data source are unchanged
```

---

## Source of Truth

- `Prototype/ui_kits/shipper/index.html` (Action Zone panel)

---

## Playwright Verification

Spec: `frontend/e2e/design-system/US-846-action-zone.spec.ts`

- Load shipper dashboard — default Action Zone renders with CTA and preferred carriers
- Click a load row — Action Zone updates to load-selected state
- Confirm no carrier search form `<select>` elements in Action Zone DOM
- Adversarial: empty preferred carriers list — "Manage →" link still renders, no crash

---

## BA Sign-Off

- [x] Story ID: US-846
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/ui_kits/shipper/index.html Action Zone
- [x] Scope: FRONTEND — no routing or data source changes
- [x] Depends on US-843

**BA Status:** ✅ READY FOR IMPLEMENTATION
