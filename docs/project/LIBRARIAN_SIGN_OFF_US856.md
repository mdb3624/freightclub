# Librarian Sign-Off: US-856 AC-1 (Lane Tags on Carrier Search Cards — Backend)

**Date:** 2026-07-19
**Reviewer:** Claude (REVIEWER role)
**Librarian:** Claude (LIBRARIAN role)
**Status:** ✅ AC-1 (backend) REVIEWER PASS — story remains IN_PROGRESS (AC-2–AC-5 frontend not started)

---

## Scope

This sign-off covers only **AC-1** (backend): `CarrierLaneSearchResult` now projects each matched carrier's lanes, batch-loaded to avoid N+1. It does **not** cover AC-2–AC-5 (frontend card rendering), which have not been started. US-856 is not being marked DONE by this memo.

## Verification Checklist

- [x] Story doc exists: `docs/business/stories/US-856_Lane_Tags_On_Carrier_Cards.md`
- [x] ARCH design exists: `docs/architecture/US-856_Lane_Tags_Design.md` (Platform Reuse Check performed, Mermaid domain model + sequence diagram, no Java in the doc)
- [x] Sequential Lock Protocol: linear BA → ARCH → CODER progression, no backward requests, no CHG ticket needed
- [x] TDD: 3 new `CarrierSearchServiceTest` cases (lanes attached, empty-list default, zero-match short-circuit)
- [x] Code quality: constructor injection, low cyclomatic complexity (max ~4 branches), no unused imports, exceptions handled appropriately
- [x] Security: `carrier_lanes` RLS confirmed pre-existing (`V20260427_1100__CarrierProfiles_US701.sql`); new batch query is tenant-scoped + `deleted_at IS NULL` filtered
- [x] Field Contract Table: N/A, justified — this PR introduces no new UI fields (backend-only data projection); the table belongs with the AC-2–AC-5 frontend PR
- [x] Visual/Playwright evidence: N/A, justified — no UI surface in this PR
- [x] Full Docker Pre-Test Protocol run **twice**: once pre-merge (14/14 `CarrierSearchServiceTest`, 3/3 `CarrierSearchIntegrationTest`, 3/3 `CarrierPublicProfileControllerTest`), once post-merge re-verification against `main` (924/924 full backend suite, `BUILD SUCCESS`)
- [x] Actual GitHub Actions CI verified via `gh pr checks 52` — all required checks green (Backend Build & Test ×2, E2E Tests — Playwright ×2, Frontend Lint/Test/Build ×2, Vercel, check-story-files) — not local-evidence-only
- [x] PR #52 merged to `main` (fast-forward, commit `7e21a7ec`)
- [x] Jira FREIG-105 transitioned to In Progress, comment posted with PR link
- [x] Story_Map.md US-856 row updated with REVIEWER PASS details

## Finding: Coverage Gate Not Enforced by Standard Protocol Run

While verifying JaCoCo branch coverage for this review, found that `docker-compose.test.yml`'s `backend-tester` service runs `mvn clean test`, but the `jacoco-maven-plugin`'s `check` execution (the goal enforcing the documented 80% branch-coverage hard gate) is bound to the `verify` phase, not `test`, in `backend/pom.xml`. The standard Pre-Test Protocol run therefore reports `BUILD SUCCESS` on 0 test failures **without ever enforcing the coverage gate**. This is a pre-existing gap, not introduced by US-856, and not evidenced to have masked any actual regression here (small, well-tested change surface). Logged as OPEN technical debt in `.claude/learnings.md` rather than blocking this already-merged, CI-green PR retroactively.

## Test Results

- Backend (Docker, `mvn clean test`, post-merge on `main`): **924/924 passed**, `BUILD SUCCESS`
- `CarrierSearchServiceTest`: 14/14 (11 pre-existing + 3 new)
- `CarrierSearchIntegrationTest`: 3/3
- `CarrierPublicProfileControllerTest`: 3/3
- GitHub Actions (`gh pr checks 52`): all green

## Traceability

- Story: `docs/business/stories/US-856_Lane_Tags_On_Carrier_Cards.md`
- Architecture: `docs/architecture/US-856_Lane_Tags_Design.md`
- Story_Map.md: US-856 row (IN_PROGRESS, AC-1 REVIEWER PASS noted)
- Jira: FREIG-105 (In Progress)
- PR: #52 (merged)
- Technical debt: `.claude/learnings.md` — JaCoCo `check`-not-bound-to-`test` gap (OPEN)

---

**Next step:** AC-2–AC-5 (frontend lane-tag rendering on carrier cards) is unstarted backlog work. When picked up, HFD/CODER should follow the locked design in the story doc; a fresh REVIEWER pass (including Playwright evidence + Field Contract Table) is required before US-856 as a whole can be marked DONE.

**Signed:** Claude (LIBRARIAN)
**Date:** 2026-07-19
