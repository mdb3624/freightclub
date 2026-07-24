# US-861: Notify Carrier on Direct Load Assignment

**Status:** IN_DEVELOPMENT (test run of `/run-story` skill)
**Type:** BUG_FIX (new) — no prior story covered this behavior; not a regression.
**Scope flag:** `BACKEND_ONLY`

## Story

**As a** Trucker (Carrier), **I want to** be notified when a Shipper directly assigns a load to me, **so that** I don't have to poll the dashboard to discover new assignments — matching the notification behavior already present for claimed, picked-up, delivered, and cancelled loads.

## Root Cause

`LoadAssignmentService.assignLoadToCarrier()` (`backend/src/main/java/com/freightclub/modules/load/application/LoadAssignmentService.java:47`, pre-fix) carried a `TODO: Publish LoadAssignedToCarrier event for notifications` that was never implemented. Every sibling lifecycle transition (claim, pickup, deliver, cancel) publishes an event `NotificationService` consumes via `@TransactionalEventListener` — direct assignment was the one gap.

Verified against the live code, not the (stale, haiku-generated) `GAP-ANALYSIS.md` draft, which also flagged two other things — DTO validation, JWT try/catch — that turned out to already be implemented correctly on inspection.

## Acceptance Criteria (Gherkin)

```gherkin
AC-1: Carrier receives a notification when directly assigned a load
  Given a Shipper calls assignLoadToCarrier for a Trucker who is not currently assigned any load
  When the assignment is saved successfully
  Then a notification is created for that Trucker with type LOAD_ASSIGNED
  And the notification references the correct load and route

AC-2: Notification only fires after successful commit
  Given assignLoadToCarrier throws IllegalArgumentException (load already assigned)
  When the exception is thrown
  Then no notification is created (matches existing AFTER_COMMIT pattern used by onLoadClaimed etc.)

AC-3: No regression to existing assignment behavior
  Given the existing assignLoadToCarrier test suite
  When the event-publishing change is added
  Then all existing tests still pass and the returned LoadAssignment is unchanged
```

## INVEST Self-Check

- [x] Independent — no unmerged story required
- [x] Negotiable — describes behavior (notify carrier), not the event-class name/wiring
- [x] Valuable — delivers real value to Trucker persona (visibility into new work)
- [x] Estimable — pattern already exists 4x in the same file family (LoadService + NotificationService)
- [x] Small — one method, one new event record, one new listener method
- [x] Testable — AC-1/2/3 are concrete pass/fail

## Platform Foundation Mapping

Load Board → **Assign Load** → Deliver. Trucker persona benefits directly (assignment visibility); Shipper persona benefits indirectly (fewer "did you see the load I assigned you" support questions).

## Tier Classification

**Not Tier A** — no financial/compliance/pricing exposure; this is a notification-delivery fix.

**Tier B decision (logged):** Notification copy wording — chose `"[FreightClub] New load assigned to you"` / `"You've been assigned a new load (" + route + ")."`, mirroring the exact tone/format of the four existing `notify()` calls in `NotificationService.java` (e.g. `onLoadPickedUp`'s `"[FreightClub] Load picked up"`). No new pattern invented.

## Jira Tracking — Explicit Deviation (logged, not silent)

**Skipped for this run.** This story is a live test of the `/run-story` skill, not a real backlog item — no `FREIG-###` ticket was created and `Story_ID_to_Jira_Mapping.md`/`.csv` were not updated. This deviation from `docs/roles/BUSINESS_ANALYST.md`'s mandatory Jira rule was **not** separately confirmed by the Director (Gate 1 approval covered the AC only) — flagging that gap here per the skill's Phase Exit Checklist rather than treating the earlier silent assumption as valid. If this story is ever promoted to real backlog status, Jira creation must happen before that promotion.

## Gate 1 Approval

Director approved AC-1/2/3 as written via `AskUserQuestion` ("Approve as written") during this session, before Architect phase began.

---

## Field Contract Table

| UI Field | API Param | DB Column | Type | Required |
|---|---|---|---|---|
| N/A — reuses existing Notifications panel, no new UI field | N/A (internal domain event, no new endpoint) | N/A (no new column; reuses existing `notifications` table) | N/A | N/A |

**ARCH sign-off:** ✅ — `BACKEND_ONLY` scope, no schema/endpoint changes; all cells correctly N/A.

## Architect — Input Acceptance Gate

- [x] Story has unique ID (US-861)
- [x] AC count is 2-5 (3)
- [x] Each AC is measurable
- [x] Edge cases named explicitly (AC-2 covers the failure path)
- [x] No implementation details in AC (notification "type" is a business-facing status code, consistent with existing LOAD_CLAIMED/LOAD_PICKED_UP precedent, not raw implementation)
- [x] No contradictory AC
- [x] Fits well under 5 days of CODER work

**Verdict: ACCEPT.**

## Platform Reuse Check

Commands run and output:

```
$ grep -in "assign.*notif\|notif.*assign\|LoadAssignedToCarrier\|LOAD_ASSIGNED" docs/project/Story_Map.md
(no matches)

$ grep -rn "LOAD_ASSIGNED\|LoadAssignedToCarrierEvent\|LoadAssignedEvent" backend/src/main/java
(no matches, pre-fix)
```

No existing story or code covers this capability — confirmed, not assumed.

**Debt note (out of scope, flagged not fixed):** while investigating the event-publishing pattern, found two unrelated `LoadClaimedEvent` classes in different packages (`com.freightclub.service.LoadClaimedEvent` and `com.freightclub.modules.load.domain.LoadClaimedEvent`, the latter implementing a `DomainEvent` interface, apparently from a newer modular DDD migration in progress). This is pre-existing platform drift, not introduced by US-861. Logged here per the Technical Debt Logging Protocol in `docs/roles/LIBRARIAN.md` rather than fixed in this story's scope.

## Domain Model / Design

- **New file:** `backend/src/main/java/com/freightclub/service/LoadAssignedToCarrierEvent.java` — `public record LoadAssignedToCarrierEvent(Load load, String carrierId) {}`, mirroring the existing `LoadClaimedEvent(Load load, String truckerId)` pattern exactly (same package, same shape).
- **`LoadAssignmentService`:** gains `LoadRepository` + `ApplicationEventPublisher` dependencies. After `repository.save(assignment)`, fetches the full `Load` via `loadRepository.findByIdAndTenantIdAndDeletedAtIsNull(loadId, tenantId)` (tenant-scoped + soft-delete-safe, matching project-wide multi-tenancy rules) and publishes the event if found.
- **`NotificationService`:** gains `onLoadAssignedToCarrier(LoadAssignedToCarrierEvent event)` — `@TransactionalEventListener(phase = AFTER_COMMIT)` + `@Transactional(propagation = REQUIRES_NEW)`, identical shape to the four sibling listener methods.
- No schema change — reuses the existing `notifications` table and its soft-delete/RLS posture.
- No new endpoint — internal domain event only.

---

## Implementation Evidence (Coder Phase)

**Branch:** `feature/US-861-notify-carrier-on-assignment` (created after an initial process violation — see Process Note below).

**Files changed:**
- `backend/src/main/java/com/freightclub/service/LoadAssignedToCarrierEvent.java` (new)
- `backend/src/main/java/com/freightclub/modules/load/application/LoadAssignmentService.java`
- `backend/src/main/java/com/freightclub/service/NotificationService.java`
- `backend/src/test/java/com/freightclub/modules/load/application/LoadAssignmentServiceTest.java`
- `backend/src/test/java/com/freightclub/service/NotificationServiceTest.java`

**Test run (targeted, `-Dtest=LoadAssignmentServiceTest,NotificationServiceTest -Djacoco.skip=true`):**

```
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0 -- LoadAssignmentServiceTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0 -- NotificationServiceTest$NotifyLoadAssignedToCarrier
[INFO] Tests run: 35, Failures: 0, Errors: 0, Skipped: 0 (full class total, both files)
[INFO] BUILD SUCCESS
```

AC-1 (event published + carrier notified), AC-2 (no event on the failure path), AC-3 (no regression — all 33 pre-existing tests across both classes still pass) all confirmed by the above.

## Process Note (logged per this session's `/run-story` retrospective)

Two process gaps were found and fixed **during** this run, not before it started:

1. **Branch discipline violated:** Coder phase began editing source directly on `main` before the branch-creation step executed — caught by the Director mid-run. Fixed by moving all work to `feature/US-861-notify-carrier-on-assignment`, saving a feedback memory, and adding an explicit "STOP AND VERIFY" precondition (plus an independent Reviewer-side check) to `.claude/skills/run-story/SKILL.md`.
2. **BA/ARCH artifacts under-produced:** this story file did not exist until after the Coder phase was underway — BA/ARCH work happened only in chat, not as a persisted artifact, and the Jira-skip was silently assumed rather than explicitly confirmed. Fixed by backfilling this file and adding Phase Exit Checklists to `.claude/skills/run-story/SKILL.md` Steps 1-4, each requiring literal artifact verification (not narration) before advancing.

Both fixes are now encoded in the skill itself so they don't require Director intervention on the next run.
