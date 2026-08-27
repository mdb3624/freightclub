# Librarian Sign-Off: US-866 (Breached-Password Screening on Registration)

**Date:** 2026-08-27
**Reviewer:** Claude (REVIEWER role, same session)
**Librarian:** Claude (LIBRARIAN role, same session)
**Status:** ✅ DONE

---

## Verification Checklist

- [x] Story doc complete, Gate 1 approved by Mike (2026-08-27)
- [x] ARCHITECT design doc complete (`docs/architecture/US-866_Breached_Password_Screening_Design.md`) — no schema change, `PasswordBreachChecker` port + sequence diagrams
- [x] CHG-866 filed and resolved for the scope narrowing (registration-only; no password-change flow exists in the codebase) — `docs/changes/CHG-866.md`
- [x] Code review PASSED — REVIEWER issued APPROVED on PR #102, all hard gates checked (CI status, Fail-Fast Boundary Validation, External Config/Secret Wiring Gate, code quality); no RLS/tenant/UI gates applicable (no schema or UI touched)
- [x] Backend tests: `mvn test` 0 failures/0 errors, verified via full Docker Mandatory Pre-Test Protocol, run clean twice in a row (once locally reproducing the real bug below, once post-fix)
- [x] AC-1, AC-3, AC-4, AC-5 implemented and tested; AC-2 formally removed via CHG-866 (no password-change flow exists to attach it to — tracked as future-story work)
- [x] Traceability links verified: Story ↔ ARCH design ↔ CHG-866 ↔ PR #102 (implementation) ↔ PR #103 (Jira backfill) ↔ Story_Map.md ↔ Jira FREIG-126
- [x] PR merge state verified directly via `gh pr view --json state,mergedAt` (not asserted from memory, per the US-856 incident this rule exists to prevent):
  - PR #102: `MERGED` at 2026-08-27T19:18:44Z
  - PR #103: `MERGED` at 2026-08-27T20:06:04Z
- [x] Jira ticket created and status-synced: [FREIG-126](https://mdb-intergrated-logistics.atlassian.net/browse/FREIG-126), transitioned to Done (backfilled after the FREIG Atlassian instance's subscription was reactivated — originally deferred, tracked as required backfill, not silently dropped)
- [x] `Story_Map.md` status: `COMPLETED`, Jira column populated
- [x] Post-merge branch cleanup run: `git fetch --prune` + merged-branch check — no stale local branches, all feature/chore branches for this story already deleted at merge time (`--delete-branch`)
- [x] Story close-out (this memo, Story_Map.md, Jira) lands as its own tracked artifact rather than being deferred to a separate untracked session — same discipline as the US-861 close-out-PR incident this rule exists to prevent

## Summary of What Shipped

`PasswordBreachChecker`/`HibpPasswordBreachChecker` (HIBP k-anonymity range API — only a 5-character SHA-1 prefix ever leaves the process), wired into `AuthService.register()` as a fail-fast boundary check per this session's own newly-added `docs/roles/CODER.md` Fail-Fast Boundary Validation section. `PasswordBreachedException` → HTTP 400. No length or composition-rule changes — deliberately rejected per NIST SP 800-63B-4 guidance and carrier mobile-typing-burden feedback (see story doc Decision Log).

## Real Bugs Found and Fixed During This Story (Not Caused By It)

1. `backend/src/test/resources/application-test.yml` shadows `backend/src/main/resources/application-test.yml` on the `@SpringBootTest` test classpath — a `app.hibp.enabled: false` override placed only in the latter silently never took effect, so `AuthIntegrationTest` made real live HIBP calls during the automated suite and correctly rejected its own fixture password (`Password1!` — confirmed present 584,516 times in the real breach corpus). Fixed by adding the same override to the shadowing file.
2. `application.yml` had `EIA_ENABLED` bound under the wrong YAML key (nested under `login-lookup:` instead of `eia:`) — `app.eia.enabled` was never actually being set from that file at all. One-line fix, adjacent to the block being edited; not investigated further (flagged per the project's "flag debt outside current scope" rule).

## Governance Artifacts This Session Also Added (Upstream of This Story)

Two `docs/roles/CODER.md`/`docs/roles/REVIEWER.md` process changes originated from the same council-review chain that produced US-866, shipped separately (PR #100, PR #101) before this story's implementation began:
- Mutation-testing pilot (PIT) scoped to RLS/tenant-isolation and load-claiming classes — REVIEWER gate (PR #99, #100)
- Mandatory Red-phase load-bearing test verification + Fail-Fast Boundary Validation in CODER's TDD loop (PR #101) — directly exercised by this story's own implementation (guard clause verified load-bearing via the break-it/confirm-red/restore discipline; breach-check wiring is exactly the kind of trust-boundary crossing that section calls out)

---

**Signed:** Claude (acting BA/ARCHITECT/CODER/REVIEWER/LIBRARIAN, single session, 2026-08-27)
**Date:** 2026-08-27
