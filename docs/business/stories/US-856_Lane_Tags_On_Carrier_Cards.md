# US-856: Lane Tags on Carrier Search Cards

**Story Type:** Enhancement
**Status:** BACKLOG
**Priority:** P1
**Persona:** Shipper
**Depends On:** US-848 (Carrier Network Page)
**Jira:** FREIG-105

---

## User Story

As a shipper, I want to see which lanes (origin-to-destination corridors) a carrier runs directly on their search result card so that I can tell at a glance whether a carrier's typical routes overlap with mine, without opening the detail panel.

---

## Background

US-848 (Carrier Network Page) already renders lane tags in the slide-in detail panel, sourced from `GET /api/v1/carriers/:id/public-profile` (`profile.lanes`, each with `originRegion`/`destinationRegion`). The result cards in the grid above the detail panel do not show this today — a shipper has to open every card to see if a carrier's lanes are relevant to them.

The search endpoint behind the card grid (`GET /api/v1/carriers/search`, `CarrierSearchService.searchCarriersByLane`) already joins `CarrierLaneEntity` to filter results by origin/destination, but its response shape (`CarrierLaneSearchResult`) does not currently project the matched lanes themselves — only `id`, `companyName`, `email`, `equipmentTypes`, `onTimePct`. Surfacing lane tags on the card requires that response to also return each carrier's lanes.

---

## Business Rules

- BR-1: A carrier's lane tags render on their search result card in the same visual style as the existing detail-panel lane tags (reuse, don't reinvent)
- BR-2: Lane tags show the same `origin→destination` corridor format used in the detail panel (e.g. `TX→CA`)
- BR-3: If a carrier has no lanes on file, the lane-tag row is omitted from the card (no empty state placeholder)
- BR-4: If a carrier has more lanes than reasonably fit on a card, only the first few are shown with a "+N more" indicator — the full list remains visible in the detail panel (exact cutoff is a HFD/CODER implementation decision, not a business rule)
- BR-5: Lane tags are purely informational on the card — clicking a tag does not filter or navigate; clicking anywhere else on the card retains existing US-848 behavior (opens detail panel)

---

## Acceptance Criteria

- AC-1: `GET /api/v1/carriers/search` results include each carrier's lanes (origin/destination pairs), so the frontend does not need a second call per card
- AC-2: Each carrier card on `/carriers` (US-848 Carrier Network Page) renders lane tags below/alongside the existing equipment type tags, when the carrier has at least one lane on file
- AC-3: Cards for carriers with zero lanes render with no lane-tag row and no layout gap/placeholder
- AC-4: Lane tag rendering and styling on the card is visually identical to the existing detail-panel lane tags (same `laneTagStyle`)
- AC-5: Existing card interactions (open detail panel, Get Quote, Add/Remove Preferred) are unaffected by the new lane-tag row

---

## Out of Scope

- Filtering the search itself by clicking a lane tag (BR-5)
- Changing how lanes are managed/edited (that's US-730e, Carrier Equipment & Lane Management)
- Any change to the detail panel's existing lane display
