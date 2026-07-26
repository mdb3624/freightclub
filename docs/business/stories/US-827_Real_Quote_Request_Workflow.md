# US-827: Real Quote Request Workflow

**Story ID:** US-827
**Epic:** Carrier Network Workflows Epic
**Jira:** FREIG-125
**Phase:** Cross
**Status:** BACKLOG (needs ARCHITECT input before further breakdown — see BA Sign-Off)
**Scope:** BACKEND (new domain) + FRONTEND
**Effort:** L (3–5 days) — largest item in this epic
**Priority:** P3 — recommend last, and likely a discovery/design spike before estimation firms up
**Depends On:** US-848

**Recovery note:** Originally drafted 2026-07-04 on the orphaned `feature/US-849-carrier-network-epic` branch, which never merged. Recovered and cataloged on `main` 2026-07-25 (CHG-864) — the US-827 ID was untouched (still referenced live in `frontend/src/App.tsx`'s `QuoteRequestPlaceholder` TODO comment) and needed no renumbering. Content otherwise unchanged from the original draft.

---

## User Story

**As a** shipper
**I want** to submit a real quote request to a specific carrier (from the Carrier Network page or a carrier card's "Get Quote" button)
**So that** I can get a rate estimate from a carrier I'm interested in, instead of hitting a "coming soon" placeholder

---

## Why This Exists

Every "Get Quote" / "Request Quote" button across the Shipper experience (Quick Actions Panel, Action Zone, Carrier Network Page cards and detail panel) routes to `/shipper/quote`, which renders `QuoteRequestPlaceholder` — a stub explicitly flagged in code as `TODO: Implement full feature in US-827`. This ID was already reserved for that work; CHG-001 only fixed the routing 404, not the feature itself. Unlike a load-assignment story, there is **no existing backend domain** for quotes — this is genuinely new work, not wiring.

---

## Business Rules

- BR-1: A shipper can submit a quote request to a specific carrier, referencing the carrier ID and (optionally) an existing load or lane details (origin, destination, equipment, target dates).
- BR-2: The carrier is notified of the incoming quote request (channel TBD — in-app notification at minimum, consistent with existing `NotificationService` patterns from US-201/US-202).
- BR-3: A quote request has a lifecycle status (e.g. Requested → Responded → Accepted/Declined/Expired) — exact states to be confirmed with ARCHITECT before implementation.
- BR-4: The shipper can view the status and any carrier response for quote requests they've submitted.
- BR-5: A quote request is not the same as a load assignment — accepting a quote does not automatically assign the load; that remains a separate, explicit shipper action.

---

## Acceptance Criteria

*(High-level only — this story needs an ARCHITECT pass on the quote domain model before ACs can be finalized to Gherkin/testable detail, per the Sequential Lock Protocol. Do not begin CODER work from this draft alone.)*

- AC-1 (draft): Shipper submits a quote request from a carrier card/detail panel; request is persisted with carrier ID, shipper ID, tenant ID, and optional lane/load context.
- AC-2 (draft): Carrier receives a notification of the new quote request.
- AC-3 (draft): Shipper can see a list of their submitted quote requests and current status.
- AC-4 (draft): `QuoteRequestPlaceholder` is replaced with a real form + submission flow once the domain model is confirmed.

---

## Out of Scope

- Carrier-side UI for responding to quotes (may be a separate story once this domain exists — Carrier persona work, different design system)
- Quote-to-invoice conversion or payment integration (Phase 5 territory, currently blocked on payment processor per Story_Map)
- Negotiation/counter-offer flows (v1 is a single request → single response)

---

## BA Sign-Off

- [x] Story ID: US-827 (ID pre-reserved in code comments since CHG-001/US-824)
- [x] Confirmed no existing backend quote domain to reuse — this is genuinely new scope
- [x] Recommend ARCHITECT discovery pass before this story is broken down further or estimated with confidence
- [x] Depends on US-848

**BA Status:** ⚠️ NEEDS ARCHITECT INPUT — not yet READY FOR DESIGN
