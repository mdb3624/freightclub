# US-863: Carrier Performance Metrics on Network Page

**Story ID:** US-863
**Epic:** Carrier Network Workflows Epic
**Jira:** FREIG-122
**Phase:** Cross
**Status:** BACKLOG
**Scope:** BACKEND (light) + FRONTEND
**Effort:** S (0.5–1 day)
**Priority:** P1 — recommended first story in the epic
**Depends On:** US-848

**Recovery note:** Originally drafted 2026-07-04 as US-849 on the orphaned `feature/US-849-carrier-network-epic` branch, which never merged. Renumbered to US-863 on recovery (2026-07-25) — the original US-849 ID was independently reused for "Access Token Refresh Interceptor" (now DONE) before this branch's work was cataloged. Content otherwise unchanged from the original draft.

---

## User Story

**As a** shipper
**I want** to see a carrier's real star rating, total reviews, and completed-loads count on their card and detail panel
**So that** I can judge a carrier's track record at a glance instead of seeing blank placeholders

---

## Why This Exists

`Prototype/ui_kits/shipper/carrier-network.html` (source of truth) shows real star ratings and stat numbers on every card. The shipped US-848 page renders empty stars and `—` placeholders for rating, loads, and member-since, because the search result DTO (`CarrierLaneSearchResult`) never carried that data — explicitly called out as Out of Scope in US-848's story on the assumption no backend data existed.

That assumption was wrong: `GET /api/v1/ratings/trucker/{userId}/summary` already exists (`RatingController.getTruckerSummary`, built for US-401/US-402) and returns `avgStars`, `totalRatings`, `completedLoads` for any trucker, viewable by any authenticated user — no new rating infrastructure is needed, only wiring.

---

## Business Rules

- BR-1: Carrier cards and the detail panel display real average star rating and total review count, sourced from the existing ratings summary endpoint — not the placeholder `—`.
- BR-2: Loads-completed count on cards and detail panel comes from the same summary endpoint's `completedLoads` field.
- BR-3: A carrier with zero ratings shows an empty/neutral star state and "No reviews yet" — not an error or a blank dash.
- BR-4: Member-since date remains out of scope for this story (no `createdAt`-equivalent surfaced yet on the User/Trucker side for public display) — carry the `—` placeholder forward for that field only.

---

## Acceptance Criteria

- AC-1: Each carrier card's stars reflect `avgStars` from `/api/v1/ratings/trucker/{id}/summary`, rounded to nearest whole star for the star icons, with the numeric average shown alongside (e.g. "4.6").
- AC-2: Each carrier card shows total review count in parentheses next to the stars (e.g. "(134)"), or "No reviews yet" when `totalRatings` is 0.
- AC-3: The "Loads" stat box on the card shows `completedLoads` instead of `—`.
- AC-4: The detail panel's "Avg. Rating" and "Total Reviews" stat boxes show the same summary data as the card.
- AC-5: A batch/N+1 call pattern is acceptable at current scale (max 8 results per search per `CarrierSearchService.MAX_RESULTS`) — no new batch endpoint required for this story.

---

## Out of Scope

- Member-since date (needs a separate small story to expose trucker account-creation date publicly)
- Individual review text/comments (see US-865)

---

## BA Sign-Off

- [x] Story ID: US-863 (originally drafted as US-849, renumbered on recovery per CHG-864)
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/ui_kits/shipper/carrier-network.html
- [x] Confirmed existing endpoint reuse (no new backend rating infrastructure needed)
- [x] Depends on US-848 (merged)

**BA Status:** ✅ READY FOR DESIGN
