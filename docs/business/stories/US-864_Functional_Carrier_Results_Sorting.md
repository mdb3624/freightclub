# US-864: Functional Carrier Results Sorting

**Story ID:** US-864
**Epic:** Carrier Network Workflows Epic
**Jira:** FREIG-123
**Phase:** Cross
**Status:** BACKLOG
**Scope:** FRONTEND
**Effort:** S (0.5 day)
**Priority:** P2
**Depends On:** US-863 (for rating/loads data), US-848

**Recovery note:** Originally drafted 2026-07-04 as US-850 on the orphaned `feature/US-849-carrier-network-epic` branch, which never merged. Renumbered to US-864 on recovery (2026-07-25) — the original US-850 ID was independently reused for "Custom Font Loading — Vite Import Fix" (now DONE) before this branch's work was cataloged. Content otherwise unchanged from the original draft; internal dependency reference updated from the old US-849 ID to US-863.

---

## User Story

**As a** shipper
**I want** the "Sort" dropdown on the Carrier Network page to actually reorder results
**So that** I can prioritize the carriers that matter most to me (best rated, most experienced, most reliable, or newest)

---

## Why This Exists

BR-9 of the original US-848 story ("Results can be sorted by: highest on-time rate, most loads, newest") was documented but never covered by an Acceptance Criterion, so it was never implemented — the sort `<select>` renders with the correct four options but has no `onChange` handler at all. This is a real functional gap surfaced by the prototype/live comparison, not a cosmetic one.

---

## Business Rules

- BR-1: Sort options are: Highest rated, Most loads, On-time rate, Newest — matching the dropdown options already in the UI.
- BR-2: Sorting is applied client-side to the currently-loaded result set (no new search request).
- BR-3: The preferred-carriers strip is unaffected by this sort — it has its own fixed order.

---

## Acceptance Criteria

- AC-1: Selecting "Highest rated" sorts descending by `avgStars` (from US-863), carriers with no rating sort last.
- AC-2: Selecting "Most loads" sorts descending by `completedLoads` (from US-863).
- AC-3: Selecting "On-time rate" sorts descending by `onTimePct` (already available today, independent of US-863).
- AC-4: Selecting "Newest" sorts by member-since date — **blocked until a member-since field is exposed** (see US-863's Out of Scope); if unavailable, this option is disabled/hidden until that data exists rather than silently no-op sorting.
- AC-5: Sort selection persists across a manual re-search (clicking "Search Carriers" again) within the same session.

---

## Out of Scope

- Server-side sorting (result sets are capped at 8 per search; client-side is sufficient at this scale)

---

## BA Sign-Off

- [x] Story ID: US-864 (originally drafted as US-850, renumbered on recovery per CHG-864)
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/ui_kits/shipper/carrier-network.html (sort dropdown UI already matches)
- [x] Depends on US-863 for 2 of 4 sort options; On-time rate sort has no dependency and could ship first if the epic is split further

**BA Status:** ✅ READY FOR DESIGN
