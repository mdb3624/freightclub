# US-865: Recent Carrier Reviews in Detail Panel

**Story ID:** US-865
**Epic:** Carrier Network Workflows Epic
**Jira:** FREIG-124
**Phase:** Cross
**Status:** BACKLOG
**Scope:** BACKEND + FRONTEND
**Effort:** M (1–2 days)
**Priority:** P2
**Depends On:** US-848, US-863 (shares the ratings domain)

**Recovery note:** Originally drafted 2026-07-04 as US-852 on the orphaned `feature/US-849-carrier-network-epic` branch, which never merged. Renumbered to US-865 on recovery (2026-07-25) — the original US-852 ID was independently reused for "Plan-First Mandate (CODER gate + CLAUDE.md + hook)" (now DONE) before this branch's work was cataloged. Content otherwise unchanged from the original draft; internal dependency reference updated from the old US-849 ID to US-863.

---

## User Story

**As a** shipper
**I want** to read recent written reviews left by other shippers about a carrier
**So that** I can judge fit and reliability beyond a single star-rating number before assigning them a load

---

## Why This Exists

`Prototype/ui_kits/shipper/carrier-network.html` shows a "RECENT REVIEWS" section in the detail panel with author, star rating, review text, and date. The live detail panel has no such section. The backend already stores individual ratings with `comment` text (`Rating` domain, `RatingResponse` DTO from US-401), but there is no endpoint to list another user's received reviews publicly — only a self-scoped `/ratings/my-received`.

---

## Business Rules

- BR-1: A new endpoint exposes a paginated list of ratings a given trucker has received, viewable by any authenticated shipper — mirroring the existing `/ratings/trucker/{userId}/summary` visibility model (`isAuthenticated()`, not self-scoped).
- BR-2: Each review shows the reviewer's display name (not raw user ID), star rating, comment text, and relative/formatted date.
- BR-3: Reviews are ordered newest-first.
- BR-4: A carrier with zero reviews shows an empty-state message in that section, not an empty list with no explanation.
- BR-5: `PublicCarrierProfileDTO` (already fetched by the detail panel via `useCarrierProfile`) is extended to include the reviews list, rather than introducing a second API call — keeps the detail panel's existing data-fetching pattern.

---

## Acceptance Criteria

- AC-1: `PublicCarrierProfileDTO` gains a `recentReviews` field: a capped list (e.g. 5 most recent) of `{ reviewerName, stars, comment, createdAt }`.
- AC-2: The detail panel renders a "RECENT REVIEWS" section below "Equipment & Lanes", matching the prototype's layout (author + date header row, star rating, comment text).
- AC-3: A carrier with no reviews shows "No reviews yet" instead of an empty section.
- AC-4: Reviewer identity shown is the shipper's display name, not their raw user ID or email (privacy-conscious presentation, consistent with existing rating display patterns elsewhere in the app).

---

## Out of Scope

- Review pagination/"load more" beyond the initial 5 (revisit if shippers request it)
- Ability to reply to or flag a review from this page

---

## BA Sign-Off

- [x] Story ID: US-865 (originally drafted as US-852, renumbered on recovery per CHG-864)
- [x] ACs measurable and testable
- [x] Source of truth: Prototype/ui_kits/shipper/carrier-network.html
- [x] Confirmed `Rating` domain/`RatingResponse` DTO already store the needed data — new work is a public listing endpoint, not new rating infrastructure

**BA Status:** ✅ READY FOR DESIGN
