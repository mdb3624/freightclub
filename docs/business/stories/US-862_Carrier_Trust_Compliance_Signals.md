# US-862: Carrier Trust & Compliance Signals (MC/DOT, Insurance, Safety Rating)

**Story Type:** Feature
**Status:** MIGRATION_PENDING — BLOCKED: no backend rating/DOT/insurance aggregate data source exists yet
**Priority:** P2 — Phase 11+ (follows US-848)
**Persona:** Shipper
**Depends On:** US-848 (Carrier Network Page); new backend integration with FMCSA SAFER + an insurance verification source (not yet scoped or built)
**Origin:** Cataloged from CHG-863 (`docs/changes/CHG-863.md`) — trust-signal gap surfaced during a `/council-review` 48-hour research test comparing grounded industry research against the already-shipped US-848 story doc. Not a new ad-hoc idea; this is the tracked follow-up US-848's Out of Scope section deferred without a ticket.
**Jira:** FREIG-121

---

## User Story

As a shipper, I want to see a carrier's MC/DOT authority status, insurance verification status, and FMCSA safety rating on the Carrier Network Page so that I can evaluate whether a carrier is legitimate and safe before requesting a quote or assigning a load.

---

## Business Rules

- BR-1: Carrier card and detail panel display an MC/DOT authority status badge (Active / Revoked / Inactive), sourced from FMCSA SAFER data synced to the backend
- BR-2: Carrier card and detail panel display an insurance-on-file verification status (Verified / Unverified / Expired)
- BR-3: Carrier detail panel displays the FMCSA safety rating (Satisfactory / Conditional / Unsatisfactory / Not Rated — "Not Rated" is common for newer/smaller carriers and must not read as a red flag)
- BR-4: Shipper can filter carrier search by minimum safety rating and an "insurance verified only" toggle (this is the filter deferred from US-848's BR-3)
- BR-5: Status badges use icon + text + color together, never color alone (accessibility — matches existing HFD accessibility standards)
- BR-6: A nightly sync job pulls FMCSA SAFER + insurance-verification data; if a carrier's data is >30 days stale, the UI shows a "last verified" timestamp instead of presenting the status as current

---

## Acceptance Criteria

- AC-1: Carrier card shows MC/DOT authority badge and insurance-verification badge alongside the existing on-time % stat box
- AC-2: Carrier detail panel shows all three signals (authority, insurance, safety rating) plus "last verified" timestamp
- AC-3: "Not Rated" safety-rating carriers are visually distinguished from "Unsatisfactory" — never grouped or styled the same
- AC-4: Search filters gain "minimum safety rating" and "insurance verified only" controls; results update accordingly
- AC-5: If backend sync data is stale (>30 days), UI shows the staleness indicator instead of the raw status

---

## Out of Scope

- Automated double-brokering / identity-theft detection (matching legal name, phone, email domain against MC/DOT records) — flagged in CHG-863's source research as a real practice, but a separate, larger initiative
- Real-time FMCSA/insurance webhook push (nightly batch sync only, for this story)
- Historical CSA score trend charts

---

## Blocker

No backend data source exists today for FMCSA SAFER lookups or insurance verification — this story cannot enter ARCHITECT/CODER until that backend integration is scoped as its own piece of work (likely its own story/epic). Tracked here so the requirement isn't lost, per CHG-863's Option A decision.
