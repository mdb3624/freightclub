# US-821: Shipper Header Navigation

**Story ID:** US-821  
**Phase:** Phase 10 (Command Center)  
**Status:** DONE  
**Scope:** UI_ONLY  
**Effort:** 2 days  
**Priority:** P1

---

## User Story

**As a** Shipper (owner-operator or 3PL dispatcher)  
**I want to** access navigation and notifications from a bounded header component on all dashboard pages  
**So that** I can quickly navigate to my profile, settings, and view notifications without cluttering the page layout

---

## Acceptance Criteria

### AC-1: Header Bounded Styling
```gherkin
Given the Shipper Dashboard is displayed
When the page loads
Then the header appears as a bounded panel (border, padding, shadow)
  And the header aligns with the content grid (same margins and spacing)
  And the header uses design system tokens for styling (var(--shadow-subtle), var(--radius-widget))
  And the visual hierarchy matches the KPI Summary panel below it
```

### AC-2: Notification Bell Icon
```gherkin
Given the shipper is viewing the header
When they look at the right side of the header
Then they see a bell icon (notification indicator)
  And the bell icon is clickable (not a page navigation link)
  And clicking the bell opens a dropdown menu below it
  And the dropdown shows "No new messages" when there are no unread notifications
  And the dropdown is closable by clicking outside of it
```

### AC-3: Smart Unread Badge
```gherkin
Given the notification bell exists
When the shipper has zero unread notifications
Then the red unread badge is NOT visible on the bell icon
  And the bell appears clean (icon only)

Given the notification bell exists
When the shipper has one or more unread notifications
Then a small red circular badge appears in the top-right corner of the bell icon
  And the badge is only visible when unreadCount > 0
```

### AC-4: Avatar Dropdown Menu
```gherkin
Given the shipper is viewing the header
When they see a circular avatar button on the far right
Then they can click it to open a dropdown menu
  And the menu shows the shipper's name and email
  And the menu has the following options: Profile, Settings, Sign Out
  And each option is clickable and navigates or logs out appropriately
  And the menu is closable by clicking outside of it
```

### AC-5: Click-Outside Behavior
```gherkin
Given either the notification dropdown or avatar dropdown is open
When the shipper clicks anywhere outside the header dropdowns
Then both dropdowns close gracefully
  And no stray open menus remain visible
  And the header returns to its default state
```

### AC-6: Header Content Layout
```gherkin
Given the Shipper Header is displayed
Then the left side shows: FreightClub logo + "Integrated Logistics" tagline
  And the center shows: "Last updated" timestamp (auto-updating)
  And the right side shows: Notification bell + Avatar button
  And all elements are properly spaced using design system tokens (var(--space-*))
```

## Field Contract Table

| **UI Field** | **API Param** | **DB Column** | **Type** | **Required** |
|---|---|---|---|---|
| Logo image | N/A | N/A (static asset) | IMAGE | Yes |
| Tagline text | N/A | N/A (static copy) | STRING | Yes |
| Last updated timestamp | N/A | N/A (computed client-side) | STRING | Yes |
| Bell icon | N/A | N/A (static UI) | ICON | Yes |
| Unread badge | `unreadCount` (from notification service) | notifications.unread_count | INTEGER | No |
| Avatar initials | `user.firstName`, `user.lastName` | users.first_name, users.last_name | STRING | Yes |
| Dropdown menu items | N/A | N/A (static navigation) | MENU | Yes |

## Platform Foundation Mapping

### User-Facing Benefits

- **Shipper Persona:** Unified header provides quick access to notifications and account settings without interrupting the dashboard workflow
- **Information Architecture:** The header serves as the top-level navigation context, ensuring consistency across all Shipper dashboard pages
- **Future Integration:** The notification bell is a drop-in point for real-time notification service integration (currently shows placeholder "No new messages")

### Existing Components Used

- **AuthStore (Zustand):** Provides user context for avatar initials and logout functionality
- **useNavigate (React Router):** Powers Profile, Settings, and logout navigation
- **Design System Tokens:** All styling uses var(--color-*), var(--space-*), var(--shadow-*), var(--radius-*) CSS variables

## Design System Compliance

- **Shadow Styling:** Uses `var(--shadow-subtle)` for header panel, `var(--shadow-elevated)` for dropdowns
- **Spacing:** Consistent use of `var(--space-sm)`, `var(--space-md)`, `var(--space-lg)` for margins, padding, and gaps
- **Border Radius:** Uses `var(--radius-widget)` for header and dropdowns, `var(--radius-full)` for avatar and bell buttons
- **Typography:** All text uses design system font variables (size, weight, color)
- **Colors:** Bell icon and dropdowns use design system color tokens (no hardcoded hex values)

## BA Sign-Off

- [x] Story ID: US-821
- [x] ACs measurable and testable
- [x] Business logic defined (What, not How)
- [x] Platform Foundation Mapping complete
- [x] Scope: UI_ONLY
- [x] Implementation verified (DONE status)

**BA Status:** ✅ **APPROVED — DONE**

---

## Implementation Summary

**Completed:** 2026-06-09  
**REVIEWER Approval:** PASSED  
**Test Evidence:** E2E test suite passing (7.2s)  
**Screenshot Evidence:** `test-results/evidence/us-821-header-bounded.png`

**Key Implementation Details:**
- Header component: `frontend/src/features/shipper/components/ShipperPageHeader.tsx`
- Integrated into: `ShipperPageLayout.tsx` (renders on all Shipper dashboard pages)
- State management: Local React useState for dropdown visibility (notification + avatar)
- Click-outside handler: useEffect with mousedown listener + document event cleanup
- Unread badge logic: Only renders when `unreadCount > 0`
- Notification dropdown: Placeholder showing "No new messages" (ready for notification service integration)
- Avatar dropdown: Profile/Settings/Sign Out navigation + user info display

**Future Integration Points:**
- Notification service: Wire `useNotifications()`, `useUnreadCount()`, `useMarkRead()` hooks when notification feature is implemented
- Real-time updates: Notification bell can consume notification events from WebSocket/SSE service
- Mobile responsive: Header layout is mobile-friendly (stacks vertically on small screens if needed)
