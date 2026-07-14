# Librarian Sign-Off: US-854 (Per-Load Diesel Fuel Cost Resolution)

**Date:** 2026-07-14
**Reviewer:** Claude (REVIEWER persona)
**Librarian:** Claude (LIBRARIAN persona)
**Status:** ✅ DONE

## Verification Checklist

- [x] BA Gate 1 approved (2026-07-13), 4 Gherkin ACs
- [x] ARCH design complete (`docs/architecture/US-854_Diesel_Cost_Resolution_Design.md`) — no migration required, Field Contract Table complete
- [x] HFD design complete (`docs/hfd/US-854_Design_Spec.md`) — Phase 4 real-device verification explicitly waived by user (2026-07-14), justified (no new interactive/touch element introduced)
- [x] CODER implementation complete, TDD followed (Red-Green-Refactor)
- [x] Code review PASSED on second round — first round rejected for two hard-gate gaps (see below), both fixed and re-verified
- [x] JaCoCo coverage ≥80% on all touched classes (StateToEiaRegionResolver 100%, CarrierCostProfileService 82.1%, LoadSummaryResponse 80%, LoadService 80.6%)
- [x] All 4 ACs implemented and tested
- [x] Traceability links verified (BA → ARCH → HFD → CODER → REVIEWER, linear, no backward requests)
- [x] All 9 GitHub Actions CI checks green on PR #37 (`gh pr checks 37`)
- [x] Jira FREIG-116 transitioned to Done, closeout comment posted

## Issues Found and Resolved During REVIEWER Phase

1. **Config-wiring bug (hard gate, found and fixed):** `docker-compose.test.yml` never passed `EIA_API_KEY`/`EIA_ENABLED` to the backend container, and `application.yml` never bound `app.eia.api-key`/`app.eia.enabled` to those env vars at all. The feature was fully green under mocked unit tests but silently returned `available:false` in every real environment. Fixed and verified against live EIA data (real regional diesel prices, correct period). Now codified as a permanent process gate in `docs/roles/CODER.md`, `.claude/rules/reviewer-checklist.md`, and `.claude/rules/testing_standards.md`.

2. **Missing E2E evidence (hard gate, found and fixed):** No Playwright golden-path spec and no evidence screenshot existed for the fuel-region caption. The CODER-phase disclosure attributing this to a "datetime-local browser-automation limitation" was a false blocker — specific to the `browser-use` MCP manual-exploration tool, not to Playwright itself (which already handles `datetime-local` via `fill()` elsewhere in this suite). Added `frontend/e2e/design-system/US-854-diesel-region-caption.spec.ts`, seeding real data through the actual backend (not mocked), covering AC-1 (region override), AC-2 (as-of date), AC-3 (fallback indicator).

3. **CI-environment mismatch (found and fixed during spec verification):** GitHub Actions has no `EIA_API_KEY` configured (same documented constraint as the pre-existing `us-730a-v2-cost-profile-wizard.spec.ts`), so the AC-1/AC-2 assertion needed to be environment-aware rather than assume live EIA data is always reachable. Verified both branches: live-EIA locally (2/2 passing), no-EIA in CI (2/2 passing after the fix).

## Test Results

- Backend: 902/902 passing, JaCoCo ≥80% branch coverage on all touched classes
- Frontend unit: 291/291 + 4 new (`LoadBoardTable.test.tsx`)
- E2E: 106/106 (104 existing + 2 new, 0 regressions)
- `tsc --noEmit`: clean
- GitHub Actions CI: all 9 checks green on PR #37

## Evidence

- `frontend/test-results/evidence/US-854-diesel-region-caption.png` — live caption showing "Diesel: East Coast (as of Jul 13)" with a real, non-fallback per-load region resolution
- `frontend/test-results/evidence/US-854-fallback-indicator.png` — fallback state "Est. (home region)" for an unresolvable origin state

## Outstanding (non-blocking)

- The tooling-blocker disclosure during CODER phase never went through a formal CHG-### ticket per `.claude/rules/change-request-protocol.md`, even though it was disclosed honestly inline. Process gap noted for future tightening, not re-litigated here since the underlying gap it would have tracked is now closed.
- **PR #37 has NOT been merged to main** — merging is a separate action requiring explicit user authorization.

---

**Signed:** LIBRARIAN
**Date:** 2026-07-14
