# US-824: Quick Actions Panel

**Story ID:** US-824  
**Phase:** Phase 10 (Command Center)  
**Status:** READY_FOR_DESIGN  
**Scope:** UI_ONLY  
**Effort:** 1 day  
**Priority:** P1

---

## User Story

**As a** Shipper  
**I want to** quickly access my most-used workflows (post load, get quote, track shipments, manage preferred carriers) from the dashboard  
**So that** I can start key tasks without extra navigation

---

## Acceptance Criteria

### AC-1: Quick Action Buttons
```gherkin
Given the Shipper Dashboard loads
When the Quick Actions section is visible
Then I see four buttons for:
  1. "Post Load" — create a new load
  2. "Get A Quote" — request a shipping quote
  3. "Track Shipments" — view my active loads
  4. "Preferred Carriers" — manage my preferred carriers
```

### AC-2: Button Navigation
```gherkin
Given I click a Quick Action button
When the button is activated
Then I am taken to the correct page:
  - "Post Load" → load creation page
  - "Get A Quote" → quote request page
  - "Track Shipments" → active loads view
  - "Preferred Carriers" → carrier management page
  And navigation happens without errors
```

### AC-3: Panel Integration
```gherkin
Given the dashboard renders
When the Quick Actions section displays
Then the buttons fit naturally within the dashboard layout
  And the section is labeled and easy to find
```

## Routes Required

| **Button** | **Route** | **Status** |
|---|---|---|
| Post Load | `/shipper/loads/new` | ✅ Exists |
| Get A Quote | `/shipper/quote` | ❓ TBD — BA to verify |
| Track Shipments | `/dashboard/shipper/loads` | ✅ Created by US-823 |
| Preferred Carriers | `/settings/preferred-carriers` | ✅ Exists |

## Dependencies

- **Depends on:** US-823 (provides dashboard grid structure)
- **Blocked by:** Quote route verification (if `/shipper/quote` does not exist, flag for scope negotiation)

## BA Sign-Off

- [x] Story ID: US-824
- [x] ACs describe user value (quick access to key workflows)
- [x] Routes identified and verified (or flagged for clarification)
- [x] Scope: UI_ONLY (no backend changes)

**BA Status:** ✅ **READY_FOR_DESIGN**
