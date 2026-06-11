# SHELL_CONTRACT.md
**Status:** LOCKED
**Purpose:** Defines global layout containers (Shell) vs. feature modules (Widgets).

## 1. Global Grid System
- **Container:** `max-width: 1200px; margin: 0 auto;`
- **Zones:**
  - `ZONE_NAV`: Sticky Sidebar (Left)
  - `ZONE_HEADER`: Top bar (Title + Notifications)
  - `ZONE_MAIN`: Responsive grid container
- **Slots:**
  - `SLOT_A` (KPIs): Full width (100%)
  - `SLOT_B` (Primary): Two-thirds width (66%)
  - `SLOT_C` (Side Utilities): One-third width (33%)

## 2. Operational Rules
- Widgets must never define global layout properties.
- Widgets are injected into specific Slots.
- No horizontal scrollbars allowed.