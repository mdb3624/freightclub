# US-848: Carrier Network Page

**Story Type:** Feature
**Status:** IN_PROGRESS
**Priority:** P1 — Phase 11+
**Persona:** Shipper
**Jira:** FREIG-110

---

## User Story

As a shipper, I want a dedicated page to search and browse available carriers so that I can find the right carrier for my loads and manage my preferred carrier network.

---

## Business Rules

- BR-1: Accessible at `/carriers` route, protected by SHIPPER role
- BR-2: URL query params `?origin=X&dest=Y&equip=Z` pre-populate search filters (passed from Dashboard Action Zone)
- BR-3: Filters include: origin state, destination state, equipment type, minimum rating, minimum on-time rate, preferred-only toggle
- BR-4: Search executes against `/api/v1/carriers/search` endpoint
- BR-5: Preferred carriers (from `/api/v1/shippers/preferred-carriers`) appear in a horizontal strip above the results grid
- BR-6: Shipper can add or remove any carrier from their preferred list via buttons on the carrier card and detail panel
- BR-7: Clicking a carrier card opens a slide-in detail panel from the right; clicking another card replaces the panel; "✕ Close" dismisses it
- BR-8: Detail panel shows equipment, lanes (from `/api/v1/carriers/:id/public-profile`), availability status, and CTAs
- BR-9: Results can be sorted by: highest on-time rate, most loads (future field), newest (future field)
- BR-10: Empty results state shows "No carriers match your filters. Try widening your search."

---

## Acceptance Criteria

- AC-1: Page renders at `/carriers` wrapped in `ShipperPageLayout`; URL params `origin`, `dest`, `equip` pre-populate filter dropdowns on mount and trigger an initial search
- AC-2: "Search Carriers" button triggers a search and updates the results grid; "Clear filters" resets all filters
- AC-3: Preferred Carriers strip renders above the results grid when preferred carriers exist; clicking a chip opens that carrier's detail panel
- AC-4: Each carrier card shows: carrier name (companyName), equipment type tags, on-time % stat box, Get Quote button (navigates to `/shipper/quote`), and Add/Remove Preferred toggle button
- AC-5: Clicking anywhere on a carrier card (outside action buttons) opens the slide-in detail panel on the right; the main content area shifts left; "✕ Close" dismisses the panel
- AC-6: "☆ Add Preferred" / "★ Preferred" button on a card and in the detail panel toggles preferred status; optimistic UI update
- AC-7: Empty state renders with the correct message when the search returns zero results
- AC-8: Breadcrumb "Dashboard ›" and "← Back to Dashboard" navigate to `/shipper/dashboard`

---

## Out of Scope

- Real-time carrier availability
- Carrier rating data (backend does not yet expose rating aggregates)
- Carrier loads count / member-since date (not yet in backend API)
- Carrier bio / DOT number (not yet in backend API)
- In-page load assignment (navigates to existing flow)
- Quote request processing (navigates to `/shipper/quote`)
