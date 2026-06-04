# HFD Design: Add Carrier to Preferred List — US-707-v2

**Role:** Human Factors Designer
**Story:** US-707-v2 (CHG-001 resolution)
**Date:** 2026-06-04
**Status:** APPROVED FOR IMPLEMENTATION

---

## Design Context

**User:** Shipper adding a trusted carrier to their preferred network.
**Goal:** Find a specific carrier by name or email and add them with optional notes.
**Pain Point (current):** Modal has a text input that does nothing — no real results, no way to find carriers. User is completely stuck.
**Environmental Constraints:** Desktop-first; dark dashboard context; high-density data environment.

---

## Interaction Flow

```
OPEN MODAL
    │
    ▼
[Search Input] ─── type 2+ chars ──► [API call debounced 300ms]
    │                                        │
    │                              ┌─────────┴──────────┐
    │                         results found        no results
    │                              │                    │
    │                    [Results List]         [Empty State]
    │                   click a result
    │                              │
    │                   [Selected Carrier Chip]
    │                   (shows name + email + clear ✕)
    │
    ▼
[Notes textarea] (optional, 500 chars)
    │
    ▼
[Add to Preferred List] ← disabled until carrier selected
    │
    ▼
[Success toast] + modal closes + list refreshes
```

---

## States

| State | What the User Sees |
|-------|--------------------|
| **Idle** | Search input focused, hint text "Search by name or email" |
| **Typing (< 2 chars)** | No results — subtle hint "Keep typing…" |
| **Loading** | Spinner inside search input right side |
| **Results** | Inline list of up to 8 carrier cards |
| **No Results** | Empty state: "No carriers found for '[term]'" + hint to check spelling |
| **Selected** | Green chip above search showing carrier name + email; search clears |
| **Submitting** | Button shows spinner, inputs disabled |

---

## Carrier Result Card

Each result row shows:
- **Initials avatar** (colored by equipment type)
- **Full name** (bold)
- **Email** (muted)
- **Equipment type badge** (DRY_VAN, FLATBED, REEFER, STEP_DECK, etc.)
- **Preferred lanes count** if available (e.g. "3 lanes")

Clicking selects the carrier. Selected card shows a teal checkmark.

---

## Visual Design

**Theme:** Dark — matches `surface-dark` (#0B1220) and `steel-grey` (#1E293B). No white modal on dark dashboard.

**Modal dimensions:** max-w-lg, scrollable body if results overflow.

**Color roles:**
- Background: `steel-grey` (#1E293B)
- Input bg: `surface-dark` (#0B1220)
- Border idle: `mid-grey` (#334155)
- Border active/focus: `kinetic-blue` (#2563EB)
- Selected chip: `accent-teal` (#00E5A8) with dark text
- Results hover: `mid-grey` (#334155)
- Submit button: `kinetic-blue` primary

**Typography:** Existing app fonts (Sora headlines, body).

---

## Accessibility

- Focus trap inside modal
- `Escape` closes modal
- Arrow keys navigate results list
- `Enter` selects focused result
- `data-testid` on all interactive elements (mandatory per testing_standards.md)

---

## data-testid Map

| Element | data-testid |
|---------|-------------|
| Modal container | `add-carrier-modal` |
| Search input | `carrier-search-input` |
| Loading spinner | `carrier-search-loading` |
| Results list | `carrier-results-list` |
| Result item (per id) | `carrier-result-{id}` |
| Empty state | `carrier-search-empty` |
| Selected chip | `selected-carrier-chip` |
| Clear selection button | `clear-carrier-selection` |
| Notes textarea | `carrier-notes-textarea` |
| Submit button | `add-carrier-submit-btn` |
| Cancel button | `add-carrier-cancel-btn` |

---

## Business Rules

- Minimum 2 characters to trigger search
- Max 8 results returned (server-side limit)
- Cannot add a carrier already on the preferred list (backend returns 409 — show inline error)
- Notes: optional, max 500 characters
- Search scope: TRUCKER role users within the same tenant only
