# Coder/Reviewer Postmortems

Full incident narratives relocated out of `docs/roles/CODER.md` and `docs/roles/REVIEWER.md` (2026-09-06 governance consolidation, same pattern as `TESTING_INCIDENTS.md`'s 2026-07-19 relocation) so the per-role docs carry only the resulting mandatory rule, not the full story. Read this for the "why" behind a CODER/REVIEWER rule, or when a new story looks similar to one of these surfaces (duplicate endpoint capability, a test that passes without exercising the method under test, a fabricated tool/script).

---

## Duplicate KPI Implementations: US-761 vs US-820 (2026-07-20)

US-761 (Phase 7) already implemented the shipper dashboard's `activeShipments`/`onTimeCarrierPct`/`estimatedCostPerMile` KPI aggregate at `/shipper/dashboard-summary`, stuck at `READY FOR REVIEWER RE-AUDIT` but fully committed and routed. US-820 (Phase 10) rebuilt the identical capability from scratch as `KPISummaryService`/`/shipper/dashboard/kpi-summary` without finding it — CODER's existing steps 1-4 (domain-service-class dedup) wouldn't have caught this since the duplication was at the endpoint/application-service level, not a shared domain class. The two independently-invented "active load" status filters then silently diverged, producing a real production bug months later. US-820's `KPISummaryController`/`KPISummaryService` also shipped and lived in production with **zero tests** — REVIEWER's controller-test hard gate exists on paper but wasn't mechanically enforced at merge time.

**Resulting rule (CODER.md Service Reuse Check step 5, REVIEWER.md's matching hard gate):** before creating any new `@Controller`/`@RestController` endpoint or application-layer service, grep `docs/project/Story_Map.md` (all statuses, not just DONE) and existing controllers for a capability match. REVIEWER independently re-runs the same greps rather than trusting CODER ran them.

**Example of correct reuse (Phase 10):** story needed carrier affinity (preferred carrier ranking); `CarrierAffinityService` already existed; correct move was inject + extend it, not create `CarrierAffinityCalculator`/`PreferredCarrierRanker`.

---

## Vacuous Test Passed at 98% Line Coverage: PR #99 (2026-08-26)

`testReassignLoadToCarrier_UpdatesAssignment` asserted `getAssignedAt()` was non-null — true at 98% JaCoCo line coverage, but the value was already set by the `LoadAssignment` constructor, so the test never actually proved `reassignLoadToCarrier()` did anything. Found by a scoped PIT mutation-testing pilot (`backend/pom.xml`'s opt-in `mutation-test` profile), not by the normal Red-Green-Refactor workflow.

**Resulting rule (CODER.md Red-Green-Refactor step, REVIEWER.md Mutation Coverage gate):** RED must confirm the new test fails for the right reason before implementation exists; a REFACTOR that moves what an existing test's assertion depends on must be re-verified the same way. This is the cheap, universal substitute for full mutation testing, which stays scoped to RLS/tenant-isolation and load-claiming classes only (`mvn org.pitest:pitest-maven:mutationCoverage -Pmutation-test`) — not run on every commit.

---

## Fabricated Deploy Script Created Decoy Cloud Run Services (FREIG-115)

A deploy script was written from scratch instead of checking whether one already existed, creating decoy Cloud Run services that masked 3+ weeks of stale production. See `gotcha_fabricated_deploy_script_decoy_services.md` in project memory for the full trace.

**Resulting rule (CODER.md Pre-Implementation Plan Gate):** before creating any new script, config file, or tool wrapper, run `git log --follow -- <path>` on it and `Glob` for similarly-named files first — a file with no history is a red flag, not a blank slate. Prefer the vendor/platform tool over reimplementing one.

---

## External Config/Secret Wiring — see `TESTING_INCIDENTS.md`

FREIG-116/US-854 (mocked tests passing while `EiaFuelPriceService` silently returned `available:false` in every environment) is documented in full in `docs/postmortems/TESTING_INCIDENTS.md`'s "Mocked Tests Cannot Catch Config/Wiring Bugs" section — CODER.md and REVIEWER.md's External Config/Secret Wiring gates both point there rather than repeating the narrative.
