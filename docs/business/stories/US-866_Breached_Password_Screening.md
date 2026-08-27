# US-866: Breached-Password Screening on Registration & Password Change

**Story Type:** Security Hardening
**Status:** READY_FOR_DESIGN
**Priority:** P1
**Persona:** N/A (platform/security — protects all personas' accounts: Shipper, Carrier, Admin)
**Scope:** BACKEND_ONLY
**Depends On:** None
**Jira:** PENDING — Atlassian FREIG instance returned "deactivated due to inactivity" (503) on 2026-08-27; ticket creation deferred until the subscription is reactivated, per explicit user decision (not silently dropped — backfill required before this story can be marked DONE).

---

## User Story

As a platform operator, I want new and changed passwords screened against a corpus of known-compromised passwords, so that user accounts aren't protected by a password already exposed in a public data breach.

---

## Background

Surfaced via a `/council-review` (2026-08-27) evaluating a proposed password-strength meter + composition rules (1+ special character, 1+ numeric character) for `RegisterRequest.java` (currently `@Size(min = 8)` only, no complexity rules, no breach screening). The council converged, citing NIST SP 800-63B Revision 4 (finalized 2025), that composition rules are the specific anti-pattern the current standard tells verifiers **not** to impose (they push users toward predictable, already-modeled substitutions), while breach-corpus screening is a **SHALL** in the same standard and is the control most correlated with actually stopping credential-stuffing/guessing attacks.

A follow-up discussion (same session) raised a real, separate concern: FreightClub's carrier persona is often a mobile user (in-cab, gloved, low-signal, time-pressured) for whom typing burden is a genuine cost. Raising the minimum password length (NIST's other Rev-4 recommendation, 15+ chars) was evaluated and explicitly rejected for this reason — see Business Rules below and Out of Scope.

This story implements only the breach-screening half of the council's recommendation. The frontend strength-meter UI is a separate, HFD-gated story (not bundled here, per the council's own split-scope recommendation).

---

## Business Rules

- BR-1: New passwords (registration) and changed passwords (password-change flow) must be checked against a corpus of known-compromised passwords before being accepted.
- BR-2: A match rejects the password with a clear, specific message telling the user their password was found in a data breach and asking them to choose a different one — not a generic validation failure.
- BR-3: The existing minimum length (`@Size(min = 8)`) is **not** changed by this story, and no character-composition rule (special character, numeric character, uppercase, etc.) is added. Both were explicitly evaluated and rejected — see Decision Log.
- BR-4: If the breach-corpus check is temporarily unreachable, registration/password-change must **not** be blocked by that outage (fail open, not fail closed) — see Decision Log for reasoning.
- BR-5: This check applies only to passwords submitted going forward (registration, password change). It does not retroactively screen or force-reset any existing user's current password.

---

## Acceptance Criteria

- AC-1: Given a new user registers with a password that appears in a known password-breach corpus, when they submit the registration form, then registration is rejected with a message stating the password was found in a data breach and asking them to choose a different one.
- AC-2: Given an existing user attempts to change their password to one found in a known breach corpus, when they submit the change, then the change is rejected with the same message, and their existing password remains in effect (unchanged).
- AC-3: Given a user submits a password that is not found in any breach corpus and meets the existing minimum-length rule, when they register or change their password, then the request proceeds exactly as it does today — no new length or composition requirement is introduced.
- AC-4: Given the breach-corpus check service is temporarily unavailable, when a user registers or changes their password, then the request is **not** blocked by that outage (per BR-4); a warning is logged for operator visibility, but the user is not made to wait or fail because of a third-party dependency.
- AC-5: Given the platform's CI/Docker Pre-Test Protocol runs, when the breach-check integration's tests execute, then unit/component tests may mock the check, **and** a real unmocked call against the live breach-check endpoint is verified and its response pasted into the PR/story doc as evidence before sign-off — per `testing_standards.md`'s External Config/Secret Wiring Gate (this is the same failure shape as FREIG-116: a green mocked suite proves logic, not that the real integration is wired).

---

## Out of Scope

- **Raising minimum password length.** Evaluated (NIST Rev-4 recommends 15+ chars when password is the sole factor) and explicitly rejected — FreightClub's carrier persona is frequently on a mobile device in-cab, and increased typing burden was judged a real cost against an unclear security gain for that user base. Logged as a deliberate decision, not an oversight — see Decision Log.
- **Composition/complexity rules** (require 1+ special character, 1+ numeric character, etc.) — explicitly rejected per NIST SP 800-63B-4 guidance (verifiers SHOULD NOT impose composition rules) and the council-review conclusion that they push users toward predictable, already-modeled password patterns without a real security gain.
- **Frontend password-strength meter UI** — separate, HFD-gated story. If built, must be an entropy/pattern-aware estimator (e.g. zxcvbn-style), not a composition-rule checklist meter, per the same council conclusion.
- **MFA / passkey (WebAuthn) support** — a larger, separate initiative flagged by the council as the actual long-term fix for the mobile-typing-friction tension; not bundled into this story.
- **Retroactive screening or forced reset of existing users' current passwords** — this story only screens passwords submitted going forward.

---

## Decision Log (Tier B — non-financial, BA autonomous per Autonomous Decision-making Protocol)

- **Minimum length unchanged / no composition rule added:** Council-review (2026-08-27) plus explicit user pushback on carrier mobile-typing burden. NIST Rev-4's 15+ char recommendation and its composition-rule prohibition were both weighed; length increase was rejected for this platform's specific user base, composition rules were rejected as contrary to current authoritative guidance regardless of user base. Confirmed with the user (Mike) in the same session before this story was drafted.
- **Fail-open on breach-check service outage (BR-4):** Blocking the platform's core registration/password-change flow because a third-party dependency is temporarily unreachable is a worse availability outcome than momentarily skipping a defense-in-depth check. Classified Tier B (not financial/compliance-critical) — flagged here for Gate 1 visibility, not blocked pending a separate question to the Director.

---

## Approval

AC-1 through AC-5 and the Decision Log approved by Mike, 2026-08-27. Jira mirroring deferred (instance deactivated, see Jira field above) — story proceeds to ARCHITECT with this noted as outstanding backfill work, not a blocker on design/implementation.
