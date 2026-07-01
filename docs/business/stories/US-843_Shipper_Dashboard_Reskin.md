# US-843: Shipper Dashboard Reskin (KPI cards + load table)

**Story ID:** US-843
**Jira:** FREIG-74
**Phase:** v0.1.0 Design System Integration (Phase 4)
**Status:** TO DO
**Scope:** FRONTEND
**Effort:** 1 day
**Priority:** P1

---

## User Story

**As a** Shipper
**I want** the dashboard KPI cards and load table to match the Prototype design exactly
**So that** the data I need is clearly presented with the correct visual hierarchy

---

## Acceptance Criteria

### AC-1: KPI cards (Playbook 4A)
```gherkin
Given Prototype/ui_kits/shipper/index.html KPICards component defines the spec
When the KPI cards are updated
Then Active Shipments card shows color-coded breakdown dots (delayed=red, in-transit=purple, claimed=amber)
  And Est. Cost/Mile card shows an amber trend badge when cost is rising
  And On-Time Rate card: #27AE60 ≥90%, #F39C12 ≥75%, #E74C3C <75%, with thin progress bar
  And On-Time Rate subtitle reads "Based on X deliveries · last 30 days"
  And all card containers: white bg, 1px solid #D0D0D0 border, 8px radius, 0 2px 4px shadow, 24px padding
  And hook calls, data fetching, and grid layout are unchanged
```

### AC-2: Load table (Playbook 4B)
```gherkin
Given Prototype/ui_kits/shipper/index.html ShipmentTable component defines the spec
When the load table is updated
Then column headers: 12px 600-weight ALL CAPS #636E72, background #F5F0E8
  And data rows: exactly 48px height, 14px font, 1px solid #E8E3D8 row divider
  And row hover: background #F5F0E8
  And Status column uses <StatusBadge> component
  And Transit column shows bronze-gradient progress bar (7px track, 72px wide) with percentage text
  And Carrier Rating column shows star rating + numeric score
  And last column is a › chevron (bronze on hover, translateX(2px))
  And selected row: border-left 3px solid #B08D57, background #FBF5E8
  And data source, sorting, pagination, and onClick handlers are unchanged
```

---

## Source of Truth

- `Prototype/ui_kits/shipper/index.html` (KPICards and ShipmentTable components)

---

## Playwright Verification

Spec: `frontend/e2e/design-system/US-843-shipper-dashboard.spec.ts`

- Log in as shipper — dashboard loads with real data
- `page.evaluate()`: KPI card background = `rgb(255, 255, 255)`, border = `1px solid rgb(208, 208, 208)`
- `boundingBox()`: table row height = 48px
- Adversarial: null/empty load list — table renders empty state without style breakage
- Adversarial: viewport 1920px — table doesn't stretch unreadably

---

## BA Sign-Off

- [x] Story ID: US-843
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/ui_kits/shipper/index.html
- [x] Scope: FRONTEND styling only — no hook/data changes
- [x] Depends on US-842

**BA Status:** ✅ READY FOR IMPLEMENTATION
