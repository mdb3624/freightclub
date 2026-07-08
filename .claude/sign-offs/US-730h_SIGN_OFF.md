# US-730h Sign-Off: Carrier Identity & Credentials Profile

**Date:** 2026-07-08
**Reviewed By:** LIBRARIAN
**Status:** ✅ DONE
**Linked Story:** Phase 7a / Carrier Dashboard MVP (supersedes US-730e's Equipment/Lanes tabs UI)

---

## Verification Checklist

- ✅ **Design Complete**: ARCH + HFD locked 2026-07-08 — `docs/architecture/ARCH_US-730h_Carrier_Identity_Credentials_Profile_Design.md`, `docs/hfd/US-730h_Carrier_Identity_Credentials_Profile_Design_Spec.md`
- ✅ **Code Review PASSED**: 9-task subagent-driven-development, each task individually reviewed (2 fix cycles: Task 3 timezone-fragile test, Task 5 dead-markup cleanup), plus a whole-branch review (opus) with 1 fix cycle (real touch-target regression, see below) and a re-review confirming the fix — REVIEWER PASS 2026-07-08
- ✅ **Tests Passing**: Backend full Docker suite 0 errors; frontend unit suite 287/287; full e2e suite 101 passed / 3 skipped (pre-existing) / 0 failed, including 3 dedicated US-730h specs
- ✅ **CI Verified (not just local)**: `gh pr checks 27` — Backend, Frontend Lint/Test/Build, E2E all `pass` on both required workflow runs
- ✅ **Full `npm run build` clean**: confirmed 0 TypeScript errors across the whole branch after fixing a latent Task 8 compile error that `vitest run` alone never caught
- ✅ **Evidence screenshot**: `frontend/test-results/evidence/US-730h-carrier-profile-identity.png`

---

## ARCH Decision Verified End-to-End (the story's central architectural bet)

The whole-branch review specifically re-audited the entire diff (not just per-task) to confirm ARCH's Platform Reuse Check held across all 9 tasks:
- Zero new tables, zero new controllers, zero new endpoints.
- `carrier_lanes`/`CarrierLaneEntity`/`CarrierLaneDTO`/`/profile/lanes` — completely untouched (load-bearing for shipper-side lane search, US-762, and the public carrier profile).
- 10 new columns on `users`, purely additive, no existing column touched.

This confirms the story shipped smaller in scope than the raw prototype integration doc originally proposed — a real architectural win caught before any code was written, not discovered mid-implementation.

---

## Real Bugs Found and Fixed During Implementation

1. **Infinite-render-loop, self-caught twice**: Task 5's profile-seeding `useEffect` and Task 8's lanes-seeding `useEffect` both depended on hook-returned values that aren't referentially stable in test mocks, causing infinite re-renders (Task 8's manifested as an actual `ERR_WORKER_OUT_OF_MEMORY` crash during verification). Both fixed with a one-shot `initialized`/`lanesInitialized` guard. Whole-branch review audited for a third instance; found none.
2. **Latent TypeScript compile error** in Task 8's file, invisible to `vitest run` (which doesn't run full `tsc` type-checking) — found and fixed while wiring Task 9's `npm run build` step. Confirmed via a full-branch build that this was the only latent issue.
3. **Touch-target regression (whole-branch review finding)**: the credential-expiry warning banner's "Review" button rendered at ~15px tall with no `minHeight`/`minWidth`. The golden-path e2e sweep never caught it because it seeded far-future expiry dates, so the banner never rendered during the sweep — a direct recurrence of this project's documented CHG-US730-001 failure class (a sweep that doesn't cover every rendered state lets small buttons ship). Fixed with proper sizing plus a new e2e case that forces the banner to render (near-term expiry) and sweeps it. The fix also added a `width >= 48px` check to the sweep helper (previously height-only, matching CHG-US730-001's actual failure axis), which immediately proved its value by catching a second real bug — `header-save-btn` at 47.14px wide, also fixed.

---

## AC Verification

Full field-level AC mapping lives in `docs/hfd/US-730h_Carrier_Identity_Credentials_Profile_Design_Spec.md`. Summary of what shipped:

| Area | Requirement | Implementation | Evidence |
|-----|----------|------|----------|
| Identity tab | First/last name, phone, identity summary strip | `CarrierProfilePage.tsx` Identity tab | `CarrierProfilePage.test.tsx` |
| Equipment tab | Single equipment type + confirm-before-commit UX | Equipment tab + confirmation sheet | e2e: "equipment-change confirmation sheet buttons are glove-friendly" |
| Credentials tab | DOT/MC/CDL/insurance/med-card with expiry badges | Credentials tab + `ExpiryDateField` | e2e: "credential warning banner is glove-friendly when an expiry is near-term" |
| Lanes tab | Up to 3 preferred lanes, existing backend reused | Lanes tab + `useLanes`/`carrierApi.lanes` | `CarrierProfilePage.test.tsx` |
| Gloved-hand UX | ≥48px tap targets, every rendered state | e2e touch-target sweep at all 4 tabs + banner state | e2e golden path + 2 dedicated sweep specs |

---

## Code Artifacts

- **Backend**: `CdlClass.java` (new enum), `User.java` (+10 fields), `ProfileResponse.java`/`UpdateProfileRequest.java` (+10 fields each), `ProfileService.java` (+10 setter calls)
- **Migration**: `V20260708_1500__CarrierIdentityCredentials_US730h.sql` (additive-only, RLS inherited automatically from `users`)
- **Frontend**: `CarrierProfilePage.tsx`, `carrierProfile.schemas.ts`, `ExpiryDateField.tsx`, `CompletenessBar.tsx`
- **E2E**: `us-730h-carrier-profile.spec.ts`, `page-objects/CarrierProfilePageObject.ts`
- **Ripple fixes** (necessary, positional-record consequence): `ProfileServiceTest.java`, `ShipperServiceTest.java` (both construct `UpdateProfileRequest` directly, needed 10 more `null`s at the correct position)

---

## Dependencies Resolved

- ✅ US-730e's Equipment/Lanes tabs UI — formally superseded (backend tables/endpoints for lanes untouched, equipment multi-record CRUD confirmed unused by shipper search and left as legacy, out of scope)
- ✅ CHG-US730-008 — design supersession documented and approved

---

## Traceability

- **Story Map**: Phase 7a section, `US-730h` row, status COMPLETED
- **Test Coverage**: unit + e2e + CI evidence captured above
- **Flyway migration**: `V20260708_1500__CarrierIdentityCredentials_US730h.sql`, additive only, RLS inherited from base table
- **PR**: #27

---

## Sign-Off

**LIBRARIAN verdict**: ✅ **APPROVED FOR MERGE**

All verification gates passed, including actual GitHub Actions CI status (not local evidence alone) and a direct architectural re-verification that the story's central "no new backend surface" bet held across the entire branch, not just individual tasks.

**Next Steps:**
- Merge PR #27 to main
- Consider a small follow-up (not blocking) to move the Credentials tab's hardcoded CDL class option strings onto Task 3's `CDL_CLASS_LABELS` constant for DRY, since it's currently plan-inherited duplication (confirmed byte-identical, no drift risk today, but worth tidying)
