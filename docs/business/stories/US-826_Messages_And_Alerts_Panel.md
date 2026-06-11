# US-826: Messages & Alerts Panel

**Story ID:** US-826  
**Phase:** Phase 10 (Command Center)  
**Status:** READY_FOR_DESIGN  
**Scope:** UI_ONLY  
**Effort:** 1.5 days  
**Priority:** P1

---

## User Story

**As a** Shipper  
**I want to** see recent notifications about my loads (claimed, picked up, delivered, cancelled) on the dashboard  
**So that** I can stay aware of important load status changes without leaving the dashboard

---

## Acceptance Criteria

### AC-1: Notification List
```gherkin
Given the Messages & Alerts section on the dashboard
When the section is visible
Then I see a list of my recent load notifications
  And each notification shows:
    - What happened (e.g., "Load 8847 claimed", "Load 9011 delivered")
    - When it happened (e.g., "2 hours ago")
    - A visual indicator of importance (color or icon)
  And the list is sorted with newest events first
```

### AC-2: Empty State
```gherkin
Given the Messages & Alerts section
When I have no notifications
Then a "No notifications" message is displayed
  And the section is still visible on the dashboard
```

### AC-3: Click Navigation
```gherkin
Given I see a notification in the list
When I click the notification
Then I am taken to the relevant load detail page
  And the notification is marked as read
```

### AC-4: Panel Integration
```gherkin
Given the dashboard renders
When the Messages & Alerts section displays
Then the notification list fits naturally in the dashboard layout
  And the section is easy to find and read
```

## Notification Types

| **Event** | **Severity** | **Example Message** |
|---|---|---|
| Load Claimed | Info | "Load 8847 claimed by ABC Trucking" |
| Load Picked Up | Info | "Load 8847 picked up from origin" |
| Load Delivered | Success | "Load 8847 delivered on time" |
| Load Cancelled | Critical | "Load 8847 cancelled" |

## Data Dependencies

- **Notification API:** Existing `useNotifications()` hook (already implemented, no new backend work)
- **Unread Badge:** Existing `useUnreadCount()` hook syncs with header notification bell (US-821)
- **Mark Read:** Existing `useMarkRead()` hook marks notifications as read on click

## Routes Required

| **Action** | **Route** | **Status** |
|---|---|---|
| Click Notification | `/shipper/loads/{loadId}` | ✅ Exists |

## Dependencies

- **Depends on:** US-823 (provides dashboard grid structure)
- **No backend changes required** — reuses existing notification infrastructure

## BA Sign-Off

- [x] Story ID: US-826
- [x] ACs describe user value (stay aware of load status changes)
- [x] Data source identified (existing notification API)
- [x] Scope: UI_ONLY (no backend work)

**BA Status:** ✅ **READY_FOR_DESIGN**
