# US-866: Breached-Password Screening on Registration

**Scope note (CHG-866, 2026-08-27):** Originally scoped to cover both registration and password-change. ARCHITECT discovery found no password-change flow exists anywhere in the backend (`passwordEncoder.encode()` is called exactly once, at registration). Narrowed to registration only — see CHG-866 and Out of Scope below.

**Story Type:** Security Hardening
**Status:** DONE — CODER complete, verified via full Docker Pre-Test Protocol
**Priority:** P1
**Persona:** N/A (platform/security — protects all personas' accounts: Shipper, Carrier, Admin)
**Scope:** BACKEND_ONLY
**Depends On:** None
**Jira:** [FREIG-126](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-126) — backfilled 2026-08-27 after the Atlassian subscription was reactivated (originally deferred: instance had returned "deactivated due to inactivity", 503).

---

## User Story

As a platform operator, I want new passwords screened against a corpus of known-compromised passwords at registration, so that user accounts aren't protected by a password already exposed in a public data breach.

---

## Background

Surfaced via a `/council-review` (2026-08-27) evaluating a proposed password-strength meter + composition rules (1+ special character, 1+ numeric character) for `RegisterRequest.java` (currently `@Size(min = 8)` only, no complexity rules, no breach screening). The council converged, citing NIST SP 800-63B Revision 4 (finalized 2025), that composition rules are the specific anti-pattern the current standard tells verifiers **not** to impose (they push users toward predictable, already-modeled substitutions), while breach-corpus screening is a **SHALL** in the same standard and is the control most correlated with actually stopping credential-stuffing/guessing attacks.

A follow-up discussion (same session) raised a real, separate concern: FreightClub's carrier persona is often a mobile user (in-cab, gloved, low-signal, time-pressured) for whom typing burden is a genuine cost. Raising the minimum password length (NIST's other Rev-4 recommendation, 15+ chars) was evaluated and explicitly rejected for this reason — see Business Rules below and Out of Scope.

This story implements only the breach-screening half of the council's recommendation. The frontend strength-meter UI is a separate, HFD-gated story (not bundled here, per the council's own split-scope recommendation).

---

## Business Rules

- BR-1: New passwords, at registration, must be checked against a corpus of known-compromised passwords before being accepted.
- BR-2: A match rejects the password with a clear, specific message telling the user their password was found in a data breach and asking them to choose a different one — not a generic validation failure.
- BR-3: The existing minimum length (`@Size(min = 8)`) is **not** changed by this story, and no character-composition rule (special character, numeric character, uppercase, etc.) is added. Both were explicitly evaluated and rejected — see Decision Log.
- BR-4: If the breach-corpus check is temporarily unreachable, registration must **not** be blocked by that outage (fail open, not fail closed) — see Decision Log for reasoning.
- BR-5: This check applies only to passwords submitted going forward at registration. It does not retroactively screen or force-reset any existing user's current password, and does not apply to password-change (no such flow exists yet — CHG-866).

---

## Acceptance Criteria

- AC-1: Given a new user registers with a password that appears in a known password-breach corpus, when they submit the registration form, then registration is rejected with a message stating the password was found in a data breach and asking them to choose a different one.
- AC-2: **REMOVED (CHG-866, 2026-08-27)** — originally covered password-change screening; no password-change flow exists in the codebase to attach it to. Track as a new story's AC when that flow is built.
- AC-3: Given a user submits a password that is not found in any breach corpus and meets the existing minimum-length rule, when they register, then the request proceeds exactly as it does today — no new length or composition requirement is introduced.
- AC-4: Given the breach-corpus check service is temporarily unavailable, when a user registers, then the request is **not** blocked by that outage (per BR-4); a warning is logged for operator visibility, but the user is not made to wait or fail because of a third-party dependency.
- AC-5: Given the platform's CI/Docker Pre-Test Protocol runs, when the breach-check integration's tests execute, then unit/component tests may mock the check, **and** a real unmocked call against the live breach-check endpoint is verified and its response pasted into the PR/story doc as evidence before sign-off — per `testing_standards.md`'s External Config/Secret Wiring Gate (this is the same failure shape as FREIG-116: a green mocked suite proves logic, not that the real integration is wired).

---

## Out of Scope

- **Raising minimum password length.** Evaluated (NIST Rev-4 recommends 15+ chars when password is the sole factor) and explicitly rejected — FreightClub's carrier persona is frequently on a mobile device in-cab, and increased typing burden was judged a real cost against an unclear security gain for that user base. Logged as a deliberate decision, not an oversight — see Decision Log.
- **Composition/complexity rules** (require 1+ special character, 1+ numeric character, etc.) — explicitly rejected per NIST SP 800-63B-4 guidance (verifiers SHOULD NOT impose composition rules) and the council-review conclusion that they push users toward predictable, already-modeled password patterns without a real security gain.
- **Frontend password-strength meter UI** — separate, HFD-gated story. If built, must be an entropy/pattern-aware estimator (e.g. zxcvbn-style), not a composition-rule checklist meter, per the same council conclusion.
- **MFA / passkey (WebAuthn) support** — a larger, separate initiative flagged by the council as the actual long-term fix for the mobile-typing-friction tension; not bundled into this story.
- **Retroactive screening or forced reset of existing users' current passwords** — this story only screens passwords submitted going forward.
- **Password-change screening (originally AC-2, removed per CHG-866)** — no password-change flow (endpoint, DTO, controller, service method) exists anywhere in the backend today; `passwordEncoder.encode()` is called exactly once in the whole codebase, at registration (`AuthService.java:94`). Building a password-change feature is a separate, unscoped effort, not a narrow security fix — track as its own future story, which should include breach-screening in its AC from day one rather than bolting it on after.

---

## Decision Log (Tier B — non-financial, BA autonomous per Autonomous Decision-making Protocol)

- **Minimum length unchanged / no composition rule added:** Council-review (2026-08-27) plus explicit user pushback on carrier mobile-typing burden. NIST Rev-4's 15+ char recommendation and its composition-rule prohibition were both weighed; length increase was rejected for this platform's specific user base, composition rules were rejected as contrary to current authoritative guidance regardless of user base. Confirmed with the user (Mike) in the same session before this story was drafted.
- **Fail-open on breach-check service outage (BR-4):** Blocking the platform's core registration/password-change flow because a third-party dependency is temporarily unreachable is a worse availability outcome than momentarily skipping a defense-in-depth check. Classified Tier B (not financial/compliance-critical) — flagged here for Gate 1 visibility, not blocked pending a separate question to the Director.

---

## Approval

AC-1 through AC-5 and the Decision Log approved by Mike, 2026-08-27. Jira mirroring deferred (instance deactivated, see Jira field above) — story proceeds to ARCHITECT with this noted as outstanding backfill work, not a blocker on design/implementation.

**Scope narrowed post-approval (CHG-866, same day):** ARCHITECT's Input Acceptance Gate found AC-2 has no password-change flow to attach to. Confirmed with Mike directly; AC-2 removed, story proceeds registration-only. See CHG-866 for full detail.

---

## Final Disposition (2026-08-27)

**Shipped, verified via full Docker Pre-Test Protocol (backend suite: 0 failures, 0 errors, clean on two consecutive full runs):**

- `PasswordBreachChecker` interface + `BreachCheckResult` enum (`CLEAN`/`BREACHED`/`CHECK_UNAVAILABLE`), `HibpPasswordBreachChecker` implementation (HIBP k-anonymity range API — only a 5-character SHA-1 prefix ever leaves the process, never the full password or full hash).
- Wired into `AuthService.register()` as a fail-fast boundary check (per `docs/roles/CODER.md`'s Fail-Fast Boundary Validation section), right after the existing email-uniqueness check, before any tenant/user work.
- `PasswordBreachedException` → `GlobalExceptionHandler` → HTTP 400 with the AC-1 rejection message.
- `AuthServiceTest`: 3 new tests (`rejectsRegistration_whenPasswordIsBreached`, `proceedsWithRegistration_whenPasswordIsClean`, `proceedsWithRegistration_whenBreachCheckUnavailable`) — verified load-bearing per the Red-phase discipline added earlier this session (guard clause temporarily disabled, confirmed the rejection test genuinely fails without it, then restored).
- `HibpPasswordBreachCheckerTest`: 5 tests against `MockRestServiceServer` covering BREACHED/CLEAN/outage/disabled/k-anonymity-prefix-only paths.
- Config: `app.hibp.enabled` (default `true`) + `app.hibp.base-url` added to `backend/src/main/resources/application.yml`. Disabled by default in both test-config locations for suite determinism — `application-test.yml` (used by the standalone Docker `backend-test` service) and, critically, the **separate** `src/test/resources/application-test.yml` (shadows the former on the `@SpringBootTest` classpath — this is what actually governs `AuthIntegrationTest`).

**Real bug found and fixed during implementation (not caused by this story, but blocked it until found):**

`backend/src/main/resources/application.yml` had `EIA_ENABLED` bound under the wrong YAML key — nested inside `login-lookup:` instead of `eia:` (an indentation bug), meaning `app.eia.enabled` was never actually set from that file at all; `EiaFuelPriceService`'s `@Value("${app.eia.enabled:false}")` silently fell back to its Java-level default regardless of the env var. Fixed as a one-line adjacent correction while wiring `app.hibp.*` into the same block. Flagged here per the project's "flag debt outside current scope" rule — this predates US-866 and wasn't investigated further (e.g. whether `EIA_ENABLED=true` was ever actually intended in any environment).

**AC-5 evidence — real unmocked call against the live HIBP endpoint, from inside the Docker test network:**

```
$ docker exec freightclub-test-backend curl -sS "https://api.pwnedpasswords.com/range/32CA9"
...
FC1A0F5B6330E3F4C8C1BBECDE9BEDB9573:584516
...
```
(`32CA9` + `FC1A0F5B6330E3F4C8C1BBECDE9BEDB9573` is the SHA-1 hash of `Password1!`, split at the k-anonymity prefix boundary — confirmed present in the real breach corpus 584,516 times. This exact password was also what an existing integration test fixture (`AuthIntegrationTest`) used as its "valid" test password, which is what surfaced the config-shadowing bug above: with breach-checking correctly wired end-to-end, `AuthIntegrationTest` genuinely failed against this real breached password until the test-scope config was fixed — direct proof the feature works, not just that it compiles.)

**Not shipped / explicitly out of scope:** see Out of Scope section above (length increase, composition rules, frontend meter, MFA/passkeys, password-change screening — tracked under CHG-866 for a future story).

**Outstanding:** None — Jira backfilled ([FREIG-126](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-126), 2026-08-27).
