# US-845: Load Creation Form Field Updates

**Story ID:** US-845
**Jira:** FREIG-76
**Phase:** v0.1.0 Design System Integration (Phase 6)
**Status:** TO DO
**Scope:** FRONTEND
**Effort:** 1 day
**Priority:** P1

---

## User Story

**As a** Shipper creating a new load
**I want** the load form to have accurate date/time fields, a calculated distance display, a pickup window, and dimension inch fields
**So that** I can specify precise pickup/delivery windows and freight dimensions without guessing

---

## Acceptance Criteria

### AC-1: Estimated distance — read-only calculated display (Playbook 6A.1)
```gherkin
Given the form currently has an editable distance/miles input
When this phase is complete
Then the distance field is read-only, derived from originState + destinationState
  And it displays as: background #F8F9FB, border 1px solid #E8E3D8, border-radius 4px, height 40px
  And a "calculated" label in #9CA3AF appears alongside the value
  And the backend field name is unchanged
```

### AC-2: Date fields → datetime-local (Playbook 6A.2)
```gherkin
Given date fields (pickupFrom, pickupTo, deliverBy) are type="date"
When this phase is complete
Then all date input fields are changed to type="datetime-local"
```

### AC-3: Pickup window (Playbook 6A.3)
```gherkin
Given only pickupFrom exists
When this phase is complete
Then a pickupTo field is added alongside pickupFrom
  And pickupTo auto-populates from pickupFrom when pickupFrom is set
  And validation enforces pickupTo >= pickupFrom
```

### AC-4: Delivery window (Playbook 6A.4)
```gherkin
Given deliverBy/deliverFrom exists without a companion field
When this phase is complete
Then a deliverTo field is added alongside deliverFrom
  And deliverTo auto-populates from deliverFrom
  And validation enforces deliverTo >= deliverFrom
```

### AC-5: Dimension inch fields (Playbook 6A.5)
```gherkin
Given dimensions are entered in feet only (length, width, height)
When this phase is complete
Then companion inch inputs (lengthIn, widthIn, heightIn) are added next to each foot input
  And submit handler and API payload are unchanged
  And no existing validation rules are removed — only new ones added
```

---

## Source of Truth

- `Prototype/ui_kits/shipper/create-load.html`
- Target files: `frontend/src/pages/LoadCreatePage.tsx`, `frontend/src/features/loads/components/LoadForm.tsx`

---

## Playwright Verification

Spec: `frontend/e2e/design-system/US-845-load-form.spec.ts`

- Open create load form — all 5 AC changes visible
- Submit form — Network tab payload correct (no missing/broken fields)
- Adversarial: set pickupTo < pickupFrom — validation error shown, submit blocked
- Adversarial: set deliverTo < deliverFrom — validation error shown

---

## BA Sign-Off

- [x] Story ID: US-845
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/ui_kits/shipper/create-load.html
- [x] Scope: FRONTEND — submit handler and API call unchanged
- [x] Depends on US-842

**BA Status:** ✅ READY FOR IMPLEMENTATION
